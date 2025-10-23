#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Seed Fracturas v2 (con journal de IDs y undo.sql)

- Lee Excel (hoja "2024" por defecto) y puebla Postgres.
- Guarda un "journal" JSON con los IDs/códigos insertados.
- Genera un archivo undo.sql con DELETEs en orden inverso.
- Aplica fallback para fecha_diagnostico: FECHA_DIAGNOSTICO -> FECHA CIR -> ALTA.
- Omite episodios sin ninguna fecha válida (se registran en skipped).

Requisitos:
  pip install pandas openpyxl psycopg2-binary python-dateutil

Uso típico:
  python seed_fracturas_from_excel_v2.py \
    --db "postgresql://user:pwd@localhost:5432/mi_bd" \
    --excel "2024 (2).xlsx" \
    --init-schema "fracturas_2025-09-29_210924.sql" \
    --journal-out "./seed_journal.json" \
    --undo-out "./seed_undo.sql" \
    --commit
"""
from __future__ import annotations
import argparse
import sys
import os
import json
import re
import unicodedata
import datetime as dt
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd
from dateutil.tz import tzoffset

try:
    import psycopg2
    from psycopg2.extras import execute_values, DictCursor
except Exception as e:
    print("ERROR: falta psycopg2-binary. Instala con: pip install psycopg2-binary", file=sys.stderr)
    raise

TZ_CHILE = tzoffset("America/Santiago", -3 * 3600)


def rut_dv(num: int) -> str:
    s = str(int(num)).zfill(7)
    reversed_digits = list(map(int, reversed(s)))
    factors = [2, 3, 4, 5, 6, 7] * 2
    total = sum(d * f for d, f in zip(reversed_digits, factors))
    dv = 11 - (total % 11)
    if dv == 11:
        dvc = "0"
    elif dv == 10:
        dvc = "K"
    else:
        dvc = str(dv)
    return f"{int(num)}-{dvc}"


@dataclass
class Config:
    dsn: str
    excel_path: str
    sheet: str = "2024"
    init_schema: Optional[str] = None
    commit: bool = False
    user_base: int = 1000
    episodio_base: int = 5000
    journal_out: str = "./seed_journal.json"
    undo_out: str = "./seed_undo.sql"

# ---------- Helpers ----------


def norm(s: Any) -> str:
    s = "" if s is None else str(s)
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return s.strip()


def up(s: Any) -> str:
    return norm(s).upper()


def find_col(df: pd.DataFrame, patterns: List[str]) -> Optional[str]:
    cols = {c: up(c) for c in df.columns}
    for c in df.columns:
        cn = cols[c]
        if any(p in cn for p in patterns):
            return c
    return None


def parse_date(v: Any) -> Optional[pd.Timestamp]:
    if v is None:
        return None
    try:
        if pd.isna(v):
            return None
    except Exception:
        pass
    if isinstance(v, (pd.Timestamp, dt.datetime, dt.date)):
        return pd.to_datetime(v)
    return pd.to_datetime(v, errors="coerce")


def tzstamp(d: Optional[pd.Timestamp]) -> Optional[dt.datetime]:
    if d is None:
        return None
    if isinstance(d, pd.Timestamp):
        if pd.isna(d):
            return None
        d = d.to_pydatetime()
    if isinstance(d, dt.date) and not isinstance(d, dt.datetime):
        d = dt.datetime(d.year, d.month, d.day, tzinfo=TZ_CHILE)
    if isinstance(d, dt.datetime) and d.tzinfo is None:
        d = d.replace(tzinfo=TZ_CHILE)
    return d


def pick_fecha_diag(fd, fc, fa) -> Optional[dt.datetime]:
    for x in (fd, fc, fa):
        ts = tzstamp(parse_date(x))
        if ts:
            return ts
    return None


def to_bool01(v: Any) -> Optional[int]:
    if v is None:
        return None
    try:
        if pd.isna(v):
            return None
    except Exception:
        pass
    try:
        f = float(v)
        return 1 if f >= 1 else 0
    except Exception:
        s = str(v).strip().lower()
        if s in {"1", "true", "si", "sí", "y", "yes"}:
            return 1
        if s in {"0", "false", "no", "n"}:
            return 0
    return None


def sexo_enum(v: Any) -> str:
    b = to_bool01(v)
    if b is None:
        s = str(v).strip().lower()
        if s.startswith("muj"):
            return "F"
        if s.startswith("var") or s.startswith("hom") or s == "m":
            return "M"
        return "O"
    return "M" if b == 1 else "F"


def guess_cie(row: pd.Series, col_cie0: Optional[str], col_cie1: Optional[str], col_cie2: Optional[str]) -> str:
    for col, code in ((col_cie0, "S72.0"), (col_cie1, "S72.1"), (col_cie2, "S72.2")):
        if col and to_bool01(row.get(col)) == 1:
            return code
    return "S72.1"


def tipo_fractura_from_cie(cie: str) -> str:
    return {"S72.0": "INTRACAPSULAR", "S72.1": "PERTROCANTERICA", "S72.2": "SUBTROCANTERICA"}.get(cie, "PERTROCANTERICA")


def proc_enum(s: Any) -> Optional[str]:
    if s is None:
        return None
    try:
        if pd.isna(s):
            return None
    except Exception:
        pass
    s0 = up(s)
    if "URGEN" in s0:
        return "URGENCIA"
    if "DERIV" in s0:
        return "Derivación APS"
    if "APS" in s0:
        return "APS"
    if "OTRO" in s0 or "CENTRO" in s0:
        return "OTRO_CENTRO"
    return None


def load_dataframe(path: str, sheet: str) -> pd.DataFrame:
    xls = pd.ExcelFile(path)
    if sheet not in xls.sheet_names:
        raise ValueError(
            f"La hoja '{sheet}' no existe. Hojas: {xls.sheet_names}")
    return pd.read_excel(xls, sheet_name=sheet)


def ensure_schema(conn, path: str):
    with conn.cursor() as cur, open(path, "r", encoding="utf-8", errors="ignore") as f:
        cur.execute(f.read())

# ---------- Main ----------


def main(cfg: Config) -> None:
    df = load_dataframe(cfg.excel_path, cfg.sheet)

    # Column mapping
    col_clave = find_col(df, ["CLAVE"])
    col_edad = find_col(df, ["EDAD"])
    col_sexo = find_col(df, ["SEXO"])
    col_proc = find_col(df, ["PROCEDENCIA"])
    col_fdiag = find_col(df, ["FECHA DIAGNOSTICO", "FECHA DIAGNÓSTICO"])
    col_fcir = find_col(df, ["FECHA CIR"])
    col_alta = find_col(df, ["ALTA"])
    col_tabaco = find_col(df, ["TABACO"])
    col_oh = find_col(df, ["ALCOHOL", "OH: ALCOHOLISMO", "OH"])
    col_cort = find_col(df, ["CORTICOIDES"])
    col_taco = find_col(df, ["TACO"])
    col_cie0 = find_col(df, ["S72.0"])
    col_cie1 = find_col(df, ["S72.1"])
    col_cie2 = find_col(df, ["S72.2"])

    # Labs: usar regex anclado al inicio para evitar falsos positivos
    lab_patterns = {
        "HB": r"^HB\b",
        "ALBUMINA": r"^ALBUMINA\b",
        "CALCIO": r"^CALCIO\b",
        "CREA": r"^CREA(TININA)?\b",  # CREA o CREATININA
        "VITD": r"^(VITAMINA[\s_]?D|25-?OH)\b",
        "INR": r"^INR\b",
        "PROTROMBINA": r"^PROTROMBINA\b",
        "SODIO": r"^SODIO\b",
        "POTASIO": r"^POTASIO\b",
        "HTO": r"^HTO\b",
        "PLAQUETAS": r"^PLAQUETAS\b",
        "UREMIA": r"^UREMIA\b",
        "CALCIO_CORREGIDO": r"^CALCIO[\s_]?CORREG",
    }

    lab_cols: Dict[str, Optional[str]] = {}
    for code, rx in lab_patterns.items():
        lab_cols[code] = None
        for c in df.columns:
            if re.search(rx, up(c)):
                lab_cols[code] = c
                break

    unidades_guess = {
        "UREMIA": "mg/dL", "CREA": "mg/dL", "INR": None, "PROTROMBINA": "%",
        "SODIO": "mmol/L", "POTASIO": "mmol/L", "HTO": "%", "HB": "g/dL",
        "PLAQUETAS": "mil/µL", "ALBUMINA": "g/dL", "VITD": "ng/mL", "CALCIO": "mg/dL", "CALCIO_CORREGIDO": "mg/dL"
    }

    # Conexión
    conn = psycopg2.connect(cfg.dsn)
    conn.autocommit = False

    # Journal
    run_id = dt.datetime.now(tz=TZ_CHILE).strftime("%Y%m%d-%H%M%S")
    journal = {
        "run_id": run_id,
        "excel": cfg.excel_path,
        "sheet": cfg.sheet,
        "inserted": {
            "parametro_lab": [],
            "users": [],
            "pacientes": [],  # user_ids
            "episodio": [],   # episodio_ids
            # para resultado, basta con episodios; si deseas granularidad, puedes incluir conteo
            "resultado_by_episodio": {}  # ep_id -> count
        },
        "skipped_rows": [],
        "notes": []
    }

    try:
        if cfg.init_schema:
            ensure_schema(conn, cfg.init_schema)

        # Detectar qué codigos existen ya en parametro_lab
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute("SELECT codigo FROM public.parametro_lab;")
            existing_params = {r["codigo"] for r in cur.fetchall()}

        present_codes = [code for code, c in lab_cols.items() if c is not None]
        new_codes = sorted(set(present_codes) - existing_params)

        if new_codes:
            with conn.cursor() as cur:
                execute_values(cur,
                               "INSERT INTO public.parametro_lab (codigo, nombre) VALUES %s ON CONFLICT (codigo) DO NOTHING;",
                               [(c, c) for c in new_codes]
                               )
            journal["inserted"]["parametro_lab"].extend(new_codes)

        # Lotes
        users_rows: List[Tuple] = []
        pacientes_rows: List[Tuple] = []
        episodio_rows: List[Tuple] = []
        resultado_rows: List[Tuple] = []

        for idx, row in df.iterrows():
            # Salta filas vacías
            if (col_edad and pd.isna(row.get(col_edad))) and (col_clave and pd.isna(row.get(col_clave))):
                continue

            clave = str(row.get(col_clave)) if col_clave else str(idx + 1)

            # fechas y fallback
            fd = parse_date(row.get(col_fdiag)) if col_fdiag else None
            fc = parse_date(row.get(col_fcir)) if col_fcir else None
            fa = parse_date(row.get(col_alta)) if col_alta else None
            fdx = pick_fecha_diag(fd, fc, fa)
            if not fdx:
                journal["skipped_rows"].append({"row_index": int(
                    idx), "clave": clave, "reason": "Sin fecha diagnostico/cirugia/alta"})
                continue  # no inserta episodio inválido

            # básicos
            edad_anios = None
            if col_edad:
                try:
                    v = row.get(col_edad)
                    if not pd.isna(v):
                        edad_anios = int(float(v))
                except Exception:
                    pass
            sexo = sexo_enum(row.get(col_sexo)) if col_sexo else "O"
            proc = proc_enum(row.get(col_proc)) if col_proc else None
            tab = to_bool01(row.get(col_tabaco)) if col_tabaco else None
            alc = to_bool01(row.get(col_oh)) if col_oh else None
            cor = to_bool01(row.get(col_cort)) if col_cort else None
            tac = to_bool01(row.get(col_taco)) if col_taco else None

            cie = guess_cie(row, col_cie0, col_cie1, col_cie2)
            tipo = tipo_fractura_from_cie(cie)

            user_id = cfg.user_base + idx
            ep_id = cfg.episodio_base + idx

            correo = f"paciente+{norm(clave).replace(' ', '')}@example.local"
            rut = rut_dv(8000000 + idx)
            nombres = f"Paciente {clave}".replace("'", "''")
            ap_pat = "Anonimo"
            ap_mat = "Anonimo"
            password_hash = "$2a$10$SeedingPlaceHolderHashForDemoOnlyxxxxxxx"

            users_rows.append((user_id, rut, nombres, ap_pat,
                              ap_mat, correo, password_hash, sexo))
            pacientes_rows.append((user_id, edad_anios, None))

            fc_ts = tzstamp(fc)
            fa_ts = tzstamp(fa)
            episodio_rows.append((
                ep_id, user_id, cie, tipo, proc, fdx, fc_ts, fa_ts,
                True if tab == 1 else False if tab == 0 else None,
                True if alc == 1 else False if alc == 0 else None,
                True if cor == 1 else False if cor == 0 else None,
                True if tac == 1 else False if tac == 0 else None,
            ))
            journal["inserted"]["users"].append(user_id)
            journal["inserted"]["pacientes"].append(user_id)
            journal["inserted"]["episodio"].append(ep_id)
            journal["inserted"]["resultado_by_episodio"][str(ep_id)] = 0

            # resultados
            fr = fdx or fc_ts or fa_ts or tzstamp(pd.Timestamp.now())
            for code, col in lab_cols.items():
                if not col:
                    continue
                val = row.get(col)
                try:
                    if pd.isna(val):
                        continue
                except Exception:
                    pass
                # obtener primer número del string
                sval = str(val).replace(",", ".")
                m = re.search(r"[-+]?\d+\.?\d*", sval)
                if not m:
                    continue
                try:
                    fval = float(m.group(0))
                except Exception:
                    continue
                unidad = unidades_guess.get(code)
                resultado_rows.append((ep_id, code, fval, unidad, fr))
                journal["inserted"]["resultado_by_episodio"][str(ep_id)] += 1

        with conn.cursor() as cur:
            # users
            execute_values(cur, """
                INSERT INTO public.users (id, rut, nombres, apellido_paterno, apellido_materno, correo, password_hash, sexo, fecha_creacion, email_verified)
                VALUES %s
                ON CONFLICT (id) DO NOTHING;
            """, [(u[0], u[1], u[2], u[3], u[4], u[5], u[6], u[7], dt.datetime.now(tz=TZ_CHILE), True) for u in users_rows])

            # pacientes
            execute_values(cur, """
                INSERT INTO public.pacientes (user_id, edad_anios, edad_meses)
                VALUES %s
                ON CONFLICT (user_id) DO NOTHING;
            """, pacientes_rows)

            # episodio
            execute_values(cur, """
                INSERT INTO public.episodio (episodio_id, paciente_id, cie10, tipo_fractura, procedencia, fecha_diagnostico, fecha_ingreso_quirurgico, fecha_alta, tabaco, alcohol, corticoides_cronicos, taco)
                VALUES %s
                ON CONFLICT (episodio_id) DO NOTHING;
            """, episodio_rows)

            # resultado (sin ON CONFLICT; episodios ya existen)
            if resultado_rows:
                execute_values(cur, """
                    INSERT INTO public.resultado (episodio_id, parametro, valor, unidad, fecha_resultado)
                    VALUES %s;
                """, resultado_rows)

        # Guardar journal + undo.sql
        with open(cfg.journal_out, "w", encoding="utf-8") as f:
            json.dump(journal, f, ensure_ascii=False, indent=2, default=str)

        # Generar undo en orden inverso (resultado -> episodio -> pacientes -> users -> parametro_lab NUEVOS)
        undo_lines = []
        if journal["inserted"]["episodio"]:
            epis = ", ".join(map(str, journal["inserted"]["episodio"]))
            undo_lines.append(f"-- resultado de estos episodios")
            undo_lines.append(
                f"DELETE FROM public.resultado r WHERE r.episodio_id IN ({epis});")
            undo_lines.append("")
            undo_lines.append(f"-- episodios insertados")
            undo_lines.append(
                f"DELETE FROM public.episodio e WHERE e.episodio_id IN ({epis});")
            undo_lines.append("")

        if journal["inserted"]["pacientes"]:
            uids = ", ".join(map(str, journal["inserted"]["pacientes"]))
            undo_lines.append(f"-- pacientes (por user_id)")
            undo_lines.append(
                f"DELETE FROM public.pacientes p WHERE p.user_id IN ({uids});")
            undo_lines.append("")

        if journal["inserted"]["users"]:
            uids = ", ".join(map(str, journal["inserted"]["users"]))
            undo_lines.append(f"-- users")
            undo_lines.append(
                f"DELETE FROM public.users u WHERE u.id IN ({uids});")
            undo_lines.append("")

        if journal["inserted"]["parametro_lab"]:
            # generar lista de códigos SQL-escapados entre comillas simples
            codes = ", ".join("'{}'".format(c.replace("'", "''"))
                              for c in journal["inserted"]["parametro_lab"])
            # borrar solo si no tienen resultados vigentes (idempotente/seguro)
            undo_lines.append(
                f"-- parametro_lab (solo los nuevos y sin resultados asociados)")
            undo_lines.append(
                "DELETE FROM public.parametro_lab pl "
                f"WHERE pl.codigo IN ({codes}) "
                "AND NOT EXISTS (SELECT 1 FROM public.resultado r WHERE r.parametro = pl.codigo);"
            )

        with open(cfg.undo_out, "w", encoding="utf-8") as f:
            f.write("-- undo generado por seed_fracturas_from_excel_v2.py\nBEGIN;\n")
            f.write("\n".join(undo_lines))
            f.write("\nCOMMIT;\n")

        if cfg.commit:
            conn.commit()
            print(
                f"OK! Commit realizado.\n- Journal: {cfg.journal_out}\n- Undo: {cfg.undo_out}")
        else:
            conn.rollback()
            print(
                f"DRY-RUN completo (rollback). Revisa:\n- Journal: {cfg.journal_out}\n- Undo: {cfg.undo_out}\n(usa --commit para aplicar cambios)")

    except Exception as e:
        conn.rollback()
        print("ERROR (rollback ejecutado):", e)
        # Guardar journal parcial para poder deshacer lo que sí alcanzó a entrar en caso de cortes no previstos
        try:
            with open(cfg.journal_out, "w", encoding="utf-8") as f:
                json.dump(journal, f, ensure_ascii=False,
                          indent=2, default=str)
        except Exception:
            pass
        raise
    finally:
        conn.close()

# ---------- RUT ----------

# ---------- CLI ----------


def parse_args(argv: List[str]) -> Config:
    p = argparse.ArgumentParser(
        description="Seed Fracturas v2 (con journal y undo).")
    p.add_argument("--db", "--dsn", dest="dsn", required=True)
    p.add_argument("--excel", dest="excel_path", required=True)
    p.add_argument("--sheet", default="2024")
    p.add_argument("--init-schema", dest="init_schema", default=None)
    p.add_argument("--commit", action="store_true")
    p.add_argument("--user-base", type=int, default=1000)
    p.add_argument("--episodio-base", type=int, default=5000)
    p.add_argument("--journal-out", default="./seed_journal.json")
    p.add_argument("--undo-out", default="./seed_undo.sql")
    args = p.parse_args(argv)
    return Config(
        dsn=args.dsn,
        excel_path=args.excel_path,
        sheet=args.sheet,
        init_schema=args.init_schema,
        commit=args.commit,
        user_base=args.user_base,
        episodio_base=args.episodio_base,
        journal_out=args.journal_out,
        undo_out=args.undo_out,
    )


if __name__ == "__main__":
    cfg = parse_args(sys.argv[1:])
    main(cfg)
