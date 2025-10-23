#!/usr/bin/env python3
"""
Seed script for the Fracturas de Cadera backend (PostgreSQL).

Populates users, roles/profiles, pacientes, episodios, controles, cirugías,
complicaciones, suspensiones, antropometría, exámenes, muestras, resultados,
parámetros de laboratorio, indicadores y alertas, además de registros.

Reads DB connection settings from .env (PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD).

Usage examples:
  python3 scripts/seed_db.py --reset
  python3 scripts/seed_db.py --patients 5 --episodes 2

Dependencies:
  pip install psycopg2-binary python-dotenv bcrypt
"""
import argparse
import os
import sys
import random
from datetime import datetime, timedelta, date, timezone

try:
    import psycopg2
    from psycopg2.extras import DictCursor, Json
except ImportError:
    print("ERROR: psycopg2-binary is required. Install with: pip install psycopg2-binary", file=sys.stderr)
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

try:
    import bcrypt
except ImportError:
    bcrypt = None


def load_env():
    # Load from .env if available
    if load_dotenv is not None:
        load_dotenv()

    cfg = {
        'host': os.getenv('PGHOST', 'localhost'),
        'port': int(os.getenv('PGPORT', '5432')),
        'dbname': os.getenv('PGDATABASE', 'fracturas'),
        'user': os.getenv('PGUSER', 'postgres'),
        'password': os.getenv('PGPASSWORD', ''),
    }
    return cfg


def connect_db(cfg):
    dsn = f"host={cfg['host']} port={cfg['port']} dbname={cfg['dbname']} user={cfg['user']} password={cfg['password']}"
    conn = psycopg2.connect(dsn)
    conn.autocommit = False
    return conn


def hash_password(pwd: str) -> str:
    if not pwd:
        return pwd
    if bcrypt is None:
        # Fallback: store plaintext (not for login), but OK for seed/testing data
        return pwd
    return bcrypt.hashpw(pwd.encode('utf-8'), bcrypt.gensalt(rounds=10)).decode('utf-8')


def run(cur, sql, params=None, fetchone=False, fetchall=False):
    cur.execute(sql, params or [])
    if fetchone:
        return cur.fetchone()
    if fetchall:
        return cur.fetchall()
    return None


def table_exists(cur, table_name: str) -> bool:
    row = run(cur, """
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema NOT IN ('pg_catalog','information_schema')
            AND table_name = %s
        )
    """, (table_name,), fetchone=True)
    return bool(row[0]) if row else False


def get_existing_columns(cur, table_name: str):
    rows = run(cur, """
        SELECT column_name FROM information_schema.columns
        WHERE table_name = %s
    """, (table_name,), fetchall=True)
    return {r[0] for r in rows} if rows else set()


def insert_dynamic(cur, table: str, data: dict, returning: str | None = None):
    existing = get_existing_columns(cur, table)
    cols = [k for k in data.keys() if k in existing]
    if not cols:
        return None
    placeholders = ','.join(['%s'] * len(cols))
    collist = ', '.join(cols)
    sql = f"INSERT INTO {table} ({collist}) VALUES ({placeholders})"
    params = [data[c] for c in cols]
    if returning and returning in existing:
        sql += f" RETURNING {returning}"
        row = run(cur, sql, params, fetchone=True)
        return row[0] if row else None
    run(cur, sql, params)
    return None


def reset_database(cur):
    # Truncate known tables; use CASCADE to handle FKs if present
    tables = [
        'alerta',
        'indicador_riesgo',
        'resultado',
        'muestra',
        'examen',
        'generic_report',
        'episodio_indicador',
        'control_clinico',
        'antropometria',
        'cirugia',
        'suspension',
        'complicacion',
        'evolucion',
        'episodio',
        'minuta',
        'registro',
        'parametro_lab',
        'professional_profiles',
        'administradores',
        'pacientes',
        'users',
    ]
    existing = [t for t in tables if table_exists(cur, t)]
    if not existing:
        return
    run(cur, 'TRUNCATE {} RESTART IDENTITY CASCADE'.format(', '.join(existing)))


def ensure_user(cur, *, rut, nombres, ap_paterno, ap_materno, correo, sexo, fecha_nac, telefono=None, password='Clave123', email_verified=True):
    # Normalize
    rut = str(rut).replace('.', '').replace('-', '').upper()
    correo = (correo or '').strip().lower()
    # Check existing by rut or correo (case-insensitive)
    row = run(cur, 'SELECT id FROM users WHERE rut = %s OR lower(correo) = lower(%s)', (rut, correo), fetchone=True)
    if row:
        return row[0]
    pwd_hash = hash_password(password)
    row = run(cur, '''
        INSERT INTO users (rut, nombres, apellido_paterno, apellido_materno, correo, password_hash, telefono, sexo, fecha_nacimiento, fecha_creacion, email_verified)
        VALUES (%s,%s,%s,%s, lower(%s), %s, %s, %s, %s, NOW(), %s)
        RETURNING id
    ''', (rut, nombres, ap_paterno, ap_materno, correo, pwd_hash, str(telefono) if telefono else None, sexo, fecha_nac, email_verified), fetchone=True)
    return row[0]


def ensure_admin_profile(cur, user_id: int):
    row = run(cur, 'SELECT user_id FROM administradores WHERE user_id = %s', (user_id,), fetchone=True)
    if row:
        return user_id
    run(cur, 'INSERT INTO administradores (user_id, nivel_acceso) VALUES (%s, %s)', (user_id, None))
    return user_id


def ensure_professional_profile(cur, *, user_id: int, cargo: str, rut_profesional=None, especialidad=None, hospital=None, departamento=None):
    # cargo: TECNOLOGO | INVESTIGADOR | FUNCIONARIO
    row = run(cur, 'SELECT id FROM professional_profiles WHERE user_id = %s', (user_id,), fetchone=True)
    if row:
        return row[0]
    row = run(cur, '''
        INSERT INTO professional_profiles (
            user_id, rut, rut_profesional, especialidad, cargo, hospital, departamento,
            fecha_ingreso, historial_pacientes, created_at, updated_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_DATE, '[]'::jsonb, NOW(), NOW())
        RETURNING id
    ''', (user_id, rut_profesional, rut_profesional, especialidad, cargo, hospital, departamento), fetchone=True)
    return row[0]


def resolve_profesional_nombre(cur, profesional_id: int | None):
    """Return the full name for a professional profile id."""
    if not profesional_id:
        return None
    row = run(cur, '''
        SELECT u.nombres, u.apellido_paterno, u.apellido_materno
        FROM professional_profiles pp
        JOIN users u ON u.id = pp.user_id
        WHERE pp.id = %s
    ''', (profesional_id,), fetchone=True)
    if not row:
        return None
    nombres = (row['nombres'] or '').strip()
    ap_paterno = (row['apellido_paterno'] or '').strip()
    ap_materno = (row['apellido_materno'] or '').strip()
    parts = [p for p in [nombres, ap_paterno, ap_materno] if p]
    return ' '.join(parts) if parts else None


def ensure_paciente(cur, *, user_id: int, tipo_sangre=None, altura=None, edad_anios=None, edad_meses=None):
    row = run(cur, 'SELECT user_id FROM pacientes WHERE user_id = %s', (user_id,), fetchone=True)
    if row:
        return user_id
    run(cur, '''
        INSERT INTO pacientes (user_id, tipo_sangre, altura, edad_anios, edad_meses)
        VALUES (%s,%s,%s,%s,%s)
    ''', (user_id, tipo_sangre, altura, edad_anios, edad_meses))
    return user_id


def create_episodio(cur, *, paciente_id: int, cie10: str, tipo_fractura: str, lado: str=None, procedencia: str=None,
                    fecha_dx: datetime=None, fecha_ing_qx: datetime=None, fecha_alta: datetime=None,
                    no_operado=False, causa_no_operar=None, abo=None, rh=None, tabaco=False, alcohol=False,
                    corticoides=False, taco=False, fallecimiento=False, fecha_fallecimiento=None, notas=None) -> int:
    row = run(cur, '''
        INSERT INTO episodio (
            paciente_id, cie10, tipo_fractura, lado, procedencia,
            fecha_diagnostico, fecha_ingreso_quirurgico, fecha_alta,
            no_operado, causa_no_operar, abo, rh, tabaco, alcohol,
            corticoides_cronicos, taco, fallecimiento, fecha_fallecimiento, notas_clinicas
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        RETURNING episodio_id
    ''', (
        paciente_id, cie10, tipo_fractura, lado, procedencia,
        fecha_dx or datetime.now(timezone.utc), fecha_ing_qx, fecha_alta,
        no_operado, causa_no_operar, abo, rh, tabaco, alcohol,
        corticoides, taco, fallecimiento, fecha_fallecimiento, notas
    ), fetchone=True)
    return row[0]


def create_antropometria(cur, *, episodio_id: int, peso_kg=None, altura_m=None):
    run(cur, 'INSERT INTO antropometria (episodio_id, peso_kg, altura_m) VALUES (%s,%s,%s)', (episodio_id, peso_kg, altura_m))


def create_control_clinico(cur, *, episodio_id: int, profesional_id=None, origen='Guardado', resumen=None, fecha=None):
    columnas = get_existing_columns(cur, 'control_clinico')
    fecha_control = fecha or datetime.now(timezone.utc)
    data = {
        'episodio_id': episodio_id,
        'origen': origen,
        'resumen': resumen,
        'fecha_hora_control': fecha_control,
    }
    if 'profesional_id' in columnas:
        data['profesional_id'] = profesional_id
    if 'profesional_nombre' in columnas:
        data['profesional_nombre'] = resolve_profesional_nombre(cur, profesional_id)

    cols = list(data.keys())
    placeholders = ','.join(['%s'] * len(cols))
    collist = ', '.join(cols)
    params = [data[c] for c in cols]
    run(cur, f'INSERT INTO control_clinico ({collist}) VALUES ({placeholders})', params)


def create_cirugia(cur, *, episodio_id: int, fecha: date, hora_inicio=None, hora_fin=None, tecnica=None, lado=None, reoperacion=False, complicacion_intraop=None, operador_id=None) -> int:
    row = run(cur, '''
        INSERT INTO cirugia (episodio_id, fecha, hora_inicio, hora_fin, tecnica, lado, reoperacion, complicacion_intraop, operador_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        RETURNING cirugia_id
    ''', (episodio_id, fecha, hora_inicio, hora_fin, tecnica, lado, reoperacion, complicacion_intraop, operador_id), fetchone=True)
    return row[0]


def create_suspension(cur, *, episodio_id: int, fecha_suspension: date, tipo: str, motivo: str) -> int:
    row = run(cur, '''
        INSERT INTO suspension (episodio_id, fecha_suspension, tipo, motivo)
        VALUES (%s,%s,%s,%s)
        RETURNING suspension_id
    ''', (episodio_id, fecha_suspension, tipo, motivo), fetchone=True)
    return row[0]


def create_complicacion(cur, *, episodio_id: int, momento: str, presente=True, descripcion=None):
    run(cur, 'INSERT INTO complicacion (episodio_id, momento, presente, descripcion) VALUES (%s,%s,%s,%s)', (episodio_id, momento, presente, descripcion))


def create_evolucion(cur, *, episodio_id: int, transfusion_requerida=False, reingreso_30d=False, comentarios=None):
    run(cur, 'INSERT INTO evolucion (episodio_id, transfusion_requerida, reingreso_30d, comentarios) VALUES (%s,%s,%s,%s)', (episodio_id, transfusion_requerida, reingreso_30d, comentarios))


def ensure_parametro_lab(cur, *, codigo: str, nombre: str, unidad: str=None, ref_min=None, ref_max=None, notas=None):
    if not table_exists(cur, 'parametro_lab'):
        return codigo
    row = run(cur, 'SELECT codigo FROM parametro_lab WHERE codigo = %s', (codigo,), fetchone=True)
    if row:
        return codigo
    data = {
        'codigo': codigo,
        'nombre': nombre,
        'unidad': unidad,
        'ref_min': ref_min,
        'ref_max': ref_max,
        'notas': notas,
    }
    insert_dynamic(cur, 'parametro_lab', data)
    return codigo


def create_examen(cur, *, tipo_examen: str, paciente_id: int) -> int:
    row = run(cur, 'INSERT INTO examen (tipo_examen, paciente_id) VALUES (%s,%s) RETURNING examen_id', (tipo_examen, paciente_id), fetchone=True)
    return row[0]


def create_muestra(cur, *, tipo_muestra: str, fecha_extraccion: datetime, examen_id: int, profesional_id: int, fecha_recepcion: datetime=None, observaciones=None) -> int:
    row = run(cur, '''
        INSERT INTO muestra (tipo_muestra, fecha_extraccion, fecha_recepcion, observaciones, examen_id, profesional_id)
        VALUES (%s,%s,%s,%s,%s,%s)
        RETURNING muestra_id
    ''', (tipo_muestra, fecha_extraccion, fecha_recepcion, observaciones, examen_id, profesional_id), fetchone=True)
    return row[0]


def create_resultado(cur, *, episodio_id: int, parametro: str, valor: float, unidad: str=None, fecha_resultado: datetime=None, muestra_id: int=None, examen_id: int=None) -> int:
    # Some DBs may not yet have episodio_id in resultado (legacy). Detect and adapt.
    has_epi_col = column_exists(cur, 'resultado', 'episodio_id')
    if has_epi_col:
        row = run(cur, '''
            INSERT INTO resultado (episodio_id, parametro, valor, unidad, fecha_resultado, muestra_id, examen_id)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            RETURNING resultado_id
        ''', (episodio_id, parametro, valor, unidad, fecha_resultado or datetime.now(timezone.utc), muestra_id, examen_id), fetchone=True)
    else:
        row = run(cur, '''
            INSERT INTO resultado (parametro, valor, unidad, fecha_resultado, muestra_id, examen_id)
            VALUES (%s,%s,%s,%s,%s,%s)
            RETURNING resultado_id
        ''', (parametro, valor, unidad, fecha_resultado or datetime.now(timezone.utc), muestra_id, examen_id), fetchone=True)
    return row[0]


def create_indicador_riesgo(cur, *, descripcion: str, puntaje: float, resultado_id: int) -> int:
    row = run(cur, 'INSERT INTO indicador_riesgo (descripcion, puntaje, resultado_id) VALUES (%s,%s,%s) RETURNING indicador_id', (descripcion, puntaje, resultado_id), fetchone=True)
    return row[0]


def create_alerta(cur, *, episodio_id: int, tipo: str, severidad: str, mensaje: str,
                  indicador_id: int=None, resultado_id: int=None, suspension_id: int=None,
                  cirugia_id: int=None, episodio_indicador_id: int=None, activa=True, resuelta_en=None):
    # Insert only columns that exist in current schema
    data = {
        'episodio_id': episodio_id,
        'tipo': tipo,
        'severidad': severidad,
        'mensaje': mensaje,
        'indicador_id': indicador_id,
        'resultado_id': resultado_id,
        'suspension_id': suspension_id,
        'cirugia_id': cirugia_id,
        'episodio_indicador_id': episodio_indicador_id,
        'activa': activa,
        'resuelta_en': resuelta_en,
    }
    insert_dynamic(cur, 'alerta', data)


def create_episodio_indicador(cur, *, episodio_id: int, tipo: str, valor=None, nivel: str=None, detalles=None, calculado_en=None):
    data = {
        'episodio_id': episodio_id,
        'tipo': tipo,
    }
    if valor is not None:
        data['valor'] = float(valor)
    if nivel is not None:
        data['nivel'] = nivel
    if detalles is not None:
        data['detalles'] = Json(detalles)
    data['calculado_en'] = calculado_en or datetime.now(timezone.utc)
    return insert_dynamic(cur, 'episodio_indicador', data, returning='episodio_indicador_id')


# ─────────────────────────── Tabla 1: factores de riesgo ───────────────────────────
FACTORES_TABLA1 = [
    {
        "tipo": "RIESGO_FACTOR_EDAD_80",
        "dominio": "Generales",
        "criterio": "Edad ≥ 80 años",
        "puntos": 1,
        "eval": lambda ctx: (ctx["edad"] >= 80, {"valor_medido": ctx["edad"], "unidad": "años"}),
    },
    {
        "tipo": "RIESGO_FACTOR_SEXO_FEMENINO",
        "dominio": "Generales",
        "criterio": "Sexo femenino",
        "puntos": 1,
        "eval": lambda ctx: (ctx["sexo"].upper() == 'F', {"valor_medido": ctx["sexo"]}),
    },
    {
        "tipo": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD",
        "dominio": "Generales",
        "criterio": "Fractura previa por fragilidad",
        "puntos": 2,
        "eval": lambda ctx: (ctx["fractura_fragilidad"], {"valor_medido": ctx["fractura_fragilidad"]}),
    },
    {
        "tipo": "RIESGO_FACTOR_FRACTURA_VERTEBRAL",
        "dominio": "Generales",
        "criterio": "Fractura vertebral previa",
        "puntos": 1,
        "eval": lambda ctx: (ctx["fractura_vertebral"], {"valor_medido": ctx["fractura_vertebral"]}),
    },
    {
        "tipo": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR",
        "dominio": "Generales",
        "criterio": "Antecedente familiar de fractura de cadera",
        "puntos": 1,
        "eval": lambda ctx: (ctx["antecedente_familiar"], {"valor_medido": ctx["antecedente_familiar"]}),
    },
    {
        "tipo": "RIESGO_FACTOR_VITAMINA_D",
        "dominio": "Bioquímicos",
        "criterio": "Vitamina D < 20 ng/mL",
        "puntos": 2,
        "eval": lambda ctx: (ctx["vitamina_d"] < 20, {"valor_medido": ctx["vitamina_d"], "unidad": "ng/mL"}),
    },
    {
        "tipo": "RIESGO_FACTOR_ALBUMINA",
        "dominio": "Bioquímicos",
        "criterio": "Albúmina < 3.5 g/dL",
        "puntos": 1,
        "eval": lambda ctx: (ctx["albumina"] < 3.5, {"valor_medido": ctx["albumina"], "unidad": "g/dL"}),
    },
    {
        "tipo": "RIESGO_FACTOR_HEMOGLOBINA",
        "dominio": "Bioquímicos",
        "criterio": "Hemoglobina < 11 g/dL",
        "puntos": 1,
        "eval": lambda ctx: (ctx["hemoglobina"] < 11, {"valor_medido": ctx["hemoglobina"], "unidad": "g/dL"}),
    },
    {
        "tipo": "RIESGO_FACTOR_CREATININA",
        "dominio": "Bioquímicos",
        "criterio": "Creatinina sérica ≥ 1.3 mg/dL",
        "puntos": 1,
        "eval": lambda ctx: (ctx["creatinina"] >= 1.3, {"valor_medido": ctx["creatinina"], "unidad": "mg/dL"}),
    },
    {
        "tipo": "RIESGO_FACTOR_NLR",
        "dominio": "Bioquímicos",
        "criterio": "NLR > 4.5",
        "puntos": 1,
        "eval": lambda ctx: (ctx["nlr"] > 4.5, {"valor_medido": ctx["nlr"]}),
    },
    {
        "tipo": "RIESGO_FACTOR_MLR",
        "dominio": "Bioquímicos",
        "criterio": "MLR > 0.35",
        "puntos": 1,
        "eval": lambda ctx: (ctx["mlr"] > 0.35, {"valor_medido": ctx["mlr"]}),
    },
    {
        "tipo": "RIESGO_FACTOR_COMORBILIDADES",
        "dominio": "Clínico-funcional",
        "criterio": "Nº comorbilidades ≥ 2",
        "puntos": 1,
        "eval": lambda ctx: (
            ctx["num_comorbilidades"] >= 2,
            {"conteo": ctx["num_comorbilidades"], "detalle_comorbilidades": ctx["comorbilidades_detalle"]},
        ),
    },
    {
        "tipo": "RIESGO_FACTOR_BARTHEL",
        "dominio": "Clínico-funcional",
        "criterio": "Índice de Barthel ≤ 30",
        "puntos": 1,
        "eval": lambda ctx: (ctx["barthel"] <= 30, {"puntaje_barthel": ctx["barthel"]}),
    },
    {
        "tipo": "RIESGO_FACTOR_IMC",
        "dominio": "Clínico-funcional",
        "criterio": "IMC ≤ 18.5 kg/m²",
        "puntos": 1,
        "eval": lambda ctx: (ctx["imc"] <= 18.5, {"valor_medido": ctx["imc"], "unidad": "kg/m²"}),
    },
    {
        "tipo": "RIESGO_FACTOR_TABACO",
        "dominio": "Hábitos",
        "criterio": "Tabaquismo activo",
        "puntos": 1,
        "eval": lambda ctx: (ctx["tabaco"], {"valor_medido": ctx["tabaco"]}),
    },
    {
        "tipo": "RIESGO_FACTOR_CORTICOIDES",
        "dominio": "Hábitos",
        "criterio": "Glucocorticoides orales crónicos ≥ 3 meses",
        "puntos": 1,
        "eval": lambda ctx: (ctx["corticoides"], {"valor_medido": ctx["corticoides"]}),
    },
    {
        "tipo": "RIESGO_FACTOR_ALCOHOL",
        "dominio": "Hábitos",
        "criterio": "Alcohol ≥ 3/día",
        "puntos": 1,
        "eval": lambda ctx: (ctx["alcohol"], {"valor_medido": ctx["alcohol"]}),
    },
    {
        "tipo": "RIESGO_FACTOR_SUBCAPITAL",
        "dominio": "Quirúrgicos",
        "criterio": "Subcapital desplazada",
        "puntos": 2,
        "eval": lambda ctx: (ctx["subcapital_desplazada"], {"valor_medido": ctx["subcapital_desplazada"], "tipo_fractura": ctx["tipo_fractura"]}),
    },
    {
        "tipo": "RIESGO_FACTOR_RETRASO_QX",
        "dominio": "Quirúrgicos",
        "criterio": "Retraso quirúrgico > 48 h",
        "puntos": 1,
        "eval": lambda ctx: (ctx["retraso_quirurgico"], {"horas_retraso": round(ctx["retraso_horas"], 1)}),
    },
]


def registrar_factor(cur, episodio_id: int, factor_meta: dict, ctx: dict):
    cumple, extra = factor_meta["eval"](ctx)
    extra = extra or {}
    puntaje = factor_meta["puntos"] if cumple else 0
    detalles = {
        'tipo_factor': factor_meta["tipo"],
        'dominio': factor_meta["dominio"],
        'criterio': factor_meta["criterio"],
        'puntos': factor_meta["puntos"],
        'cumple': bool(cumple),
        'puntaje_otorgado': puntaje,
    }
    detalles.update(extra)
    create_episodio_indicador(
        cur,
        episodio_id=episodio_id,
        tipo=factor_meta["tipo"],
        valor=puntaje,
        detalles=detalles,
    )
    return puntaje, detalles


def column_exists(cur, table: str, column: str) -> bool:
    row = run(cur, """
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = %s AND column_name = %s
        )
    """, (table, column), fetchone=True)
    return bool(row[0]) if row else False


def ensure_column(cur, table: str, column: str, definition: str) -> bool:
    """Ensure a column exists; if missing, add it with the given SQL definition."""
    if not table_exists(cur, table):
        return False
    if column_exists(cur, table, column):
        return False
    sql = f"ALTER TABLE {table} ADD COLUMN {column} {definition}"
    run(cur, sql)
    return True


def ensure_index(cur, index: str, table: str, column: str):
    if not table_exists(cur, table):
        return
    sql = f"CREATE INDEX IF NOT EXISTS {index} ON {table} ({column})"
    run(cur, sql)


# Curated patients ensure reproducible high/medium/low risk scenarios when requested.
CURATED_PATIENT_CASES = [
    {
        'key': 'ALTA',
        'rut': '310000001',
        'nombres': 'Alicia',
        'apellido_paterno': 'Curada',
        'apellido_materno': 'Demostracion',
        'correo': 'alicia.curada@paciente.test',
        'sexo': 'F',
        'fecha_nac': '1940-05-10',
        'tipo_sangre': 'A+',
        'altura_m': 1.56,
        'edad_anios': 84,
        'edad_meses': 3,
        'episodes': [
            {
                'key': 'EP1',
                'cie10': 'S72.0',
                'tipo_fractura': 'INTRACAPSULAR',
                'lado': 'IZQUIERDO',
                'procedencia': 'URGENCIA',
                'dx_days_ago': 50,
                'ingreso_delay_days': 2,
                'surgery_delay_hours': 72,
                'alta_after_surgery_days': 7,
                'peso_kg': 50.5,
                'tecnica': 'GAMMA',
                'controles': [
                    {'hours': 6, 'origen': 'Guardado', 'resumen': 'Evaluación inicial estable', 'profile': 'funcionario'},
                    {'days': 3, 'origen': 'Minuta', 'resumen': 'Seguimiento con signos de anemia', 'profile': 'investigador'},
                ],
                'suspension': {'days': 1, 'tipo': 'CLINICA', 'motivo': 'Inestabilidad hemodinámica inicial'},
                'complicacion': {'momento': 'POST', 'descripcion': 'Hipotensión transitoria'},
                'evolucion': {'transfusion': True, 'reingreso': True, 'comentarios': 'Se indica control estrecho por anemia'},
                'muestra': {'tipo': 'SANGRE', 'extraccion_hours': 1, 'recepcion_hours': 3, 'observaciones': 'Muestra conservada en frío'},
                'labs': {
                    'HB': 9.5,
                    'GLUCOSA': 165,
                    'COLESTEROL_TOTAL': 240,
                    'TRIGLICERIDOS': 195,
                    'Vitamina D': 14.0,
                    'Albúmina': 3.1,
                    'Creatinina': 1.6,
                },
                'indices': {
                    'NLR': 5.8,
                    'MLR': 0.48,
                },
                'habitos': {
                    'tabaco': True,
                    'alcohol': True,
                    'corticoides': True,
                    'taco': True,
                },
                'fragilidad_previa': True,
                'fractura_vertebral': True,
                'antecedente_familiar': True,
                'subcapital_desplazada': True,
                'comorbilidades': ['HTA', 'DM2', 'EPOC'],
                'barthel': 25,
                'alert_message': 'Hemoglobina críticamente baja (9.5 g/dL).',
                'alert_severity': 'ALTA',
            },
        ],
    },
    {
        'key': 'MODERADA',
        'rut': '310000002',
        'nombres': 'Bruno',
        'apellido_paterno': 'Controlado',
        'apellido_materno': 'Demostracion',
        'correo': 'bruno.controlado@paciente.test',
        'sexo': 'M',
        'fecha_nac': '1945-11-18',
        'tipo_sangre': 'O+',
        'altura_m': 1.68,
        'edad_anios': 78,
        'edad_meses': 8,
        'episodes': [
            {
                'key': 'EP1',
                'cie10': 'S72.1',
                'tipo_fractura': 'PERTROCANTERICA',
                'lado': 'DERECHO',
                'procedencia': 'APS',
                'dx_days_ago': 40,
                'ingreso_delay_days': 1,
                'surgery_delay_hours': 40,
                'alta_after_surgery_days': 5,
                'peso_kg': 64.0,
                'tecnica': 'DHS',
                'controles': [
                    {'hours': 4, 'origen': 'Guardado', 'resumen': 'Paciente compensa dolor, se planifica cirugía', 'profile': 'funcionario'},
                    {'days': 2, 'origen': 'Minuta', 'resumen': 'Se observa recuperación lenta, sin sangrado', 'profile': 'investigador'},
                ],
                'suspension': None,
                'complicacion': {'momento': 'INTRA', 'descripcion': 'Sangrado controlado'},
                'evolucion': {'transfusion': False, 'reingreso': False, 'comentarios': 'Recuperación moderada'},
                'muestra': {'tipo': 'SANGRE', 'extraccion_hours': 2, 'recepcion_hours': 4, 'observaciones': 'Muestra sin incidencias'},
                'labs': {
                    'HB': 11.2,
                    'GLUCOSA': 140,
                    'COLESTEROL_TOTAL': 205,
                    'TRIGLICERIDOS': 160,
                    'Vitamina D': 18.5,
                    'Albúmina': 3.4,
                    'Creatinina': 1.3,
                },
                'indices': {
                    'NLR': 4.8,
                    'MLR': 0.37,
                },
                'habitos': {
                    'tabaco': False,
                    'alcohol': True,
                    'corticoides': False,
                    'taco': False,
                },
                'fragilidad_previa': True,
                'fractura_vertebral': False,
                'antecedente_familiar': True,
                'subcapital_desplazada': False,
                'comorbilidades': ['HTA', 'IRC'],
                'barthel': 35,
                'alert_message': 'Hemoglobina disminuida (11.2 g/dL).',
                'alert_severity': 'MEDIA',
            },
        ],
    },
    {
        'key': 'BAJA',
        'rut': '310000003',
        'nombres': 'Carla',
        'apellido_paterno': 'Ligera',
        'apellido_materno': 'Demostracion',
        'correo': 'carla.ligera@paciente.test',
        'sexo': 'F',
        'fecha_nac': '1955-04-02',
        'tipo_sangre': 'B-',
        'altura_m': 1.62,
        'edad_anios': 69,
        'edad_meses': 5,
        'episodes': [
            {
                'key': 'EP1',
                'cie10': 'S72.2',
                'tipo_fractura': 'SUBTROCANTERICA',
                'lado': 'IZQUIERDO',
                'procedencia': 'OTRO_CENTRO',
                'dx_days_ago': 30,
                'ingreso_delay_days': 1,
                'surgery_delay_hours': 36,
                'alta_after_surgery_days': 4,
                'peso_kg': 58.0,
                'tecnica': 'ATC',
                'controles': [
                    {'hours': 5, 'origen': 'Guardado', 'resumen': 'Ingreso sin complicaciones mayores', 'profile': 'funcionario'},
                    {'days': 1, 'origen': 'Minuta', 'resumen': 'Buen pronóstico funcional', 'profile': 'investigador'},
                ],
                'suspension': None,
                'complicacion': {'momento': 'PRE', 'descripcion': 'Dolor controlado con analgesia'},
                'evolucion': {'transfusion': False, 'reingreso': False, 'comentarios': 'Recuperación funcional adecuada'},
                'muestra': {'tipo': 'SANGRE', 'extraccion_hours': 1, 'recepcion_hours': 3, 'observaciones': 'Valoración habitual'},
                'labs': {
                    'HB': 12.8,
                    'GLUCOSA': 102,
                    'COLESTEROL_TOTAL': 180,
                    'TRIGLICERIDOS': 120,
                    'Vitamina D': 24.0,
                    'Albúmina': 3.8,
                    'Creatinina': 0.9,
                },
                'indices': {
                    'NLR': 2.4,
                    'MLR': 0.28,
                },
                'habitos': {
                    'tabaco': False,
                    'alcohol': False,
                    'corticoides': False,
                    'taco': False,
                },
                'fragilidad_previa': False,
                'fractura_vertebral': False,
                'antecedente_familiar': False,
                'subcapital_desplazada': False,
                'comorbilidades': ['HTA'],
                'barthel': 70,
                'alert_message': 'Control rutinario de hemoglobina (12.8 g/dL).',
                'alert_severity': 'BAJA',
            },
        ],
    },
]


def curated_episode_marker(case_key: str, episode_key: str) -> str:
    return f"CURATED_{case_key}_{episode_key}"


def seed_curated_cases(cur, *, count: int, common_password: str, func_prof_id: int, tec_prof_id: int, inv_prof_id: int):
    if count <= 0:
        return []

    created = []
    now = datetime.now(timezone.utc)
    profile_lookup = {
        'funcionario': func_prof_id,
        'investigador': inv_prof_id,
        'tecnologo': tec_prof_id,
    }

    for case in CURATED_PATIENT_CASES[:count]:
        user_id = ensure_user(
            cur,
            rut=case['rut'],
            nombres=case['nombres'],
            ap_paterno=case['apellido_paterno'],
            ap_materno=case['apellido_materno'],
            correo=case['correo'],
            sexo=case['sexo'],
            fecha_nac=case['fecha_nac'],
            password=common_password,
        )
        ensure_paciente(
            cur,
            user_id=user_id,
            tipo_sangre=case['tipo_sangre'],
            altura=case['altura_m'],
            edad_anios=case['edad_anios'],
            edad_meses=case['edad_meses'],
        )

        episodes_data = []
        # Only create an exam if at least one episode needs to be added.
        pending_episodes = []
        for episode in case['episodes']:
            marker = curated_episode_marker(case['key'], episode['key'])
            existing = run(
                cur,
                'SELECT episodio_id FROM episodio WHERE paciente_id = %s AND notas_clinicas = %s',
                (user_id, marker),
                fetchone=True,
            )
            if existing:
                continue
            pending_episodes.append((episode, marker))

        if not pending_episodes:
            continue

        examen_id = create_examen(cur, tipo_examen='LABORATORIO', paciente_id=user_id)

        for episode_cfg, marker in pending_episodes:
            dx_date = now - timedelta(days=episode_cfg['dx_days_ago'])
            cirugia_dt = dx_date + timedelta(hours=episode_cfg['surgery_delay_hours'])
            ing_qx = dx_date + timedelta(days=episode_cfg['ingreso_delay_days'])
            alta = cirugia_dt + timedelta(days=episode_cfg['alta_after_surgery_days'])

            hab = episode_cfg['habitos']

            episodio_id = create_episodio(
                cur,
                paciente_id=user_id,
                cie10=episode_cfg['cie10'],
                tipo_fractura=episode_cfg['tipo_fractura'],
                lado=episode_cfg['lado'],
                procedencia=episode_cfg['procedencia'],
                fecha_dx=dx_date,
                fecha_ing_qx=ing_qx,
                fecha_alta=alta,
                no_operado=False,
                abo=random.choice(['A', 'B', 'AB', 'O']),
                rh=random.choice(['Rh+', 'Rh-']),
                tabaco=hab['tabaco'],
                alcohol=hab['alcohol'],
                corticoides=hab['corticoides'],
                taco=hab['taco'],
                fallecimiento=False,
                notas=marker,
            )

            create_antropometria(cur, episodio_id=episodio_id, peso_kg=episode_cfg['peso_kg'], altura_m=case['altura_m'])

            for control in episode_cfg['controles']:
                delta = timedelta(days=control.get('days', 0), hours=control.get('hours', 0))
                fecha_control = dx_date + delta
                profesional_id = profile_lookup.get(control['profile'])
                create_control_clinico(
                    cur,
                    episodio_id=episodio_id,
                    profesional_id=profesional_id,
                    origen=control['origen'],
                    resumen=control['resumen'],
                    fecha=fecha_control,
                )

            cirugia_id = create_cirugia(
                cur,
                episodio_id=episodio_id,
                fecha=cirugia_dt.date(),
                hora_inicio=cirugia_dt.strftime('%H:%M'),
                hora_fin=(cirugia_dt + timedelta(hours=2)).strftime('%H:%M'),
                tecnica=episode_cfg.get('tecnica', 'GAMMA'),
                lado=episode_cfg['lado'],
                reoperacion=False,
                operador_id=func_prof_id,
            )

            suspension_cfg = episode_cfg.get('suspension')
            susp_id = None
            if suspension_cfg:
                fecha_susp = (dx_date + timedelta(days=suspension_cfg['days'])).date()
                susp_id = create_suspension(
                    cur,
                    episodio_id=episodio_id,
                    fecha_suspension=fecha_susp,
                    tipo=suspension_cfg['tipo'],
                    motivo=suspension_cfg['motivo'],
                )

            comp_cfg = episode_cfg.get('complicacion')
            if comp_cfg:
                create_complicacion(
                    cur,
                    episodio_id=episodio_id,
                    momento=comp_cfg.get('momento', 'POST'),
                    presente=True,
                    descripcion=comp_cfg.get('descripcion'),
                )

            evo_cfg = episode_cfg.get('evolucion')
            if evo_cfg:
                create_evolucion(
                    cur,
                    episodio_id=episodio_id,
                    transfusion_requerida=evo_cfg.get('transfusion', False),
                    reingreso_30d=evo_cfg.get('reingreso', False),
                    comentarios=evo_cfg.get('comentarios'),
                )

            muestra_cfg = episode_cfg['muestra']
            m1_id = create_muestra(
                cur,
                tipo_muestra=muestra_cfg['tipo'],
                fecha_extraccion=dx_date + timedelta(hours=muestra_cfg['extraccion_hours']),
                examen_id=examen_id,
                profesional_id=tec_prof_id,
                fecha_recepcion=dx_date + timedelta(hours=muestra_cfg['recepcion_hours']),
                observaciones=muestra_cfg.get('observaciones'),
            )

            fecha_resultado = dx_date + timedelta(hours=6)
            lab_values = episode_cfg['labs']
            index_values = episode_cfg.get('indices', {})
            lab_units = {
                'HB': 'g/dL',
                'GLUCOSA': 'mg/dL',
                'COLESTEROL_TOTAL': 'mg/dL',
                'TRIGLICERIDOS': 'mg/dL',
                'Vitamina D': 'ng/mL',
                'Albúmina': 'g/dL',
                'Creatinina': 'mg/dL',
            }
            r_hb = None
            for parametro, valor in lab_values.items():
                res_id = create_resultado(
                    cur,
                    episodio_id=episodio_id,
                    parametro=parametro,
                    valor=valor,
                    unidad=lab_units.get(parametro),
                    fecha_resultado=fecha_resultado,
                    muestra_id=m1_id,
                    examen_id=examen_id,
                )
                if parametro == 'HB':
                    r_hb = res_id

            contexto = {
                'edad': case['edad_anios'],
                'sexo': case['sexo'],
                'fractura_fragilidad': episode_cfg['fragilidad_previa'],
                'fractura_vertebral': episode_cfg['fractura_vertebral'],
                'antecedente_familiar': episode_cfg['antecedente_familiar'],
                'vitamina_d': lab_values['Vitamina D'],
                'albumina': lab_values['Albúmina'],
                'hemoglobina': lab_values['HB'],
                'creatinina': lab_values['Creatinina'],
                'nlr': index_values.get('NLR', 3.5),
                'mlr': index_values.get('MLR', 0.3),
                'num_comorbilidades': len(episode_cfg['comorbilidades']),
                'comorbilidades_detalle': episode_cfg['comorbilidades'],
                'barthel': episode_cfg['barthel'],
                'imc': round(episode_cfg['peso_kg'] / (case['altura_m'] ** 2), 1),
                'tabaco': hab['tabaco'],
                'corticoides': hab['corticoides'],
                'alcohol': hab['alcohol'],
                'subcapital_desplazada': episode_cfg['subcapital_desplazada'],
                'tipo_fractura': episode_cfg['tipo_fractura'],
                'retraso_quirurgico': episode_cfg['surgery_delay_hours'] > 48,
                'retraso_horas': float(episode_cfg['surgery_delay_hours']),
            }

            total_puntaje = 0
            detalle_factores = []
            for factor in FACTORES_TABLA1:
                puntaje, detalle = registrar_factor(cur, episodio_id, factor, contexto)
                total_puntaje += puntaje
                detalle_factores.append(detalle)

            if total_puntaje >= 8:
                nivel_riesgo = 'ALTO'
            elif total_puntaje >= 4:
                nivel_riesgo = 'MODERADO'
            else:
                nivel_riesgo = 'BAJO'

            color_riesgo = {'BAJO': 'VERDE', 'MODERADO': 'AMARILLO', 'ALTO': 'ROJO'}
            riesgo_total_id = create_episodio_indicador(
                cur,
                episodio_id=episodio_id,
                tipo='RIESGO_REFRACTURA',
                valor=total_puntaje,
                nivel=nivel_riesgo,
                detalles={
                    'puntaje_total': total_puntaje,
                    'nivel': nivel_riesgo,
                    'color': color_riesgo[nivel_riesgo],
                    'criterios': detalle_factores,
                },
            )

            if riesgo_total_id and nivel_riesgo != 'BAJO':
                mensaje_riesgo = f"Riesgo de refractura {nivel_riesgo.lower()} (puntaje {total_puntaje})."
                severidad = 'ALTA' if nivel_riesgo == 'ALTO' else 'MEDIA'
                create_alerta(
                    cur,
                    episodio_id=episodio_id,
                    tipo='RIESGO',
                    severidad=severidad,
                    mensaje=mensaje_riesgo,
                    episodio_indicador_id=riesgo_total_id,
                )

            if r_hb is not None:
                indicador_id = create_indicador_riesgo(
                    cur,
                    descripcion='Riesgo por Hb baja',
                    puntaje=round(max(0.5, 5 - lab_values['HB'] / 3), 2),
                    resultado_id=r_hb,
                )
                create_alerta(
                    cur,
                    episodio_id=episodio_id,
                    tipo='LAB',
                    severidad=episode_cfg['alert_severity'],
                    mensaje=episode_cfg['alert_message'],
                    indicador_id=indicador_id,
                    resultado_id=r_hb,
                    cirugia_id=cirugia_id,
                    suspension_id=susp_id,
                )

            create_minuta(
                cur,
                ruta_pdf=f"/minutas/curated-{user_id}-{episodio_id}.pdf",
                fecha_creacion=dx_date + timedelta(days=1),
                funcionario_id=func_prof_id,
                paciente_id=user_id,
                tecnologo_id=tec_prof_id,
            )

            create_registro(
                cur,
                accion='SEED_EPISODIO_CURATED',
                fecha_registro=datetime.now(timezone.utc),
                administrador_rut='111111111',
                actor_user_rut='111111111',
            )

            episodes_data.append(episodio_id)

        created.append((user_id, episodes_data, case['key']))

    return created


def ensure_schema_updates(cur):
    """Adapt legacy databases so seeding works with the current controllers."""
    # resultado.episodio_id (nullable fk)
    added_res_epi = ensure_column(cur, 'resultado', 'episodio_id', 'INTEGER')
    if added_res_epi:
        print('  + Added resultado.episodio_id')
        ensure_index(cur, 'idx_resultado_episodio_id', 'resultado', 'episodio_id')

    # alerta.episodio_id, alerta.resultado_id (used by resumen clínico)
    added_alerta_epi = ensure_column(cur, 'alerta', 'episodio_id', 'INTEGER')
    if added_alerta_epi:
        print('  + Added alerta.episodio_id')
        ensure_index(cur, 'idx_alerta_episodio_id', 'alerta', 'episodio_id')

    if ensure_column(cur, 'alerta', 'resultado_id', 'INTEGER'):
        print('  + Added alerta.resultado_id')
    if ensure_column(cur, 'alerta', 'indicador_id', 'INTEGER'):
        print('  + Added alerta.indicador_id')

    if (column_exists(cur, 'alerta', 'episodio_id') and
            column_exists(cur, 'alerta', 'resultado_id') and
            column_exists(cur, 'resultado', 'episodio_id')):
        run(cur, '''
            UPDATE alerta a
            SET episodio_id = r.episodio_id
            FROM resultado r
            WHERE a.resultado_id = r.resultado_id
              AND a.episodio_id IS NULL
              AND r.episodio_id IS NOT NULL
        ''')
        print('  + Backfilled alerta.episodio_id from resultado')


def create_minuta(cur, *, ruta_pdf: str, fecha_creacion: datetime, funcionario_id: int, paciente_id: int, tecnologo_id: int):
    if not table_exists(cur, 'minuta'):
        return
    # Handle historic schema differences: funcionario_id/tecnologo_id vs profesional_id
    has_func = column_exists(cur, 'minuta', 'funcionario_id')
    has_tec = column_exists(cur, 'minuta', 'tecnologo_id')
    has_prof = column_exists(cur, 'minuta', 'profesional_id')

    if has_func and has_tec:
        run(cur, 'INSERT INTO minuta (ruta_pdf, fecha_creacion, funcionario_id, paciente_id, tecnologo_id) VALUES (%s,%s,%s,%s,%s)', (ruta_pdf, fecha_creacion, funcionario_id, paciente_id, tecnologo_id))
    elif has_prof:
        # Fall back to single profesional_id when using new schema
        run(cur, 'INSERT INTO minuta (ruta_pdf, fecha_creacion, profesional_id, paciente_id) VALUES (%s,%s,%s,%s)', (ruta_pdf, fecha_creacion, funcionario_id, paciente_id))
    else:
        # Minimal insert
        run(cur, 'INSERT INTO minuta (ruta_pdf, fecha_creacion, paciente_id) VALUES (%s,%s,%s)', (ruta_pdf, fecha_creacion, paciente_id))


def create_registro(cur, *, accion: str, fecha_registro: datetime, administrador_rut: str=None, actor_user_rut: str=None):
    # Insert only the columns present in current schema
    data = {
        'accion': accion,
        'fecha_registro': fecha_registro,
        'administrador_rut': administrador_rut,
        'actor_user_rut': actor_user_rut,
    }
    insert_dynamic(cur, 'registro', data)


def seed(cur, patients: int, episodes_per_patient: int, curated_patients: int = 0):
    # Ensure catalog parameters when the table exists so FK constraints are satisfied.
    if table_exists(cur, 'parametro_lab'):
        lab_catalog = [
            ('GLUCOSA', 'Glucosa', 'mg/dL', 70, 100),
            ('COLESTEROL_TOTAL', 'Colesterol Total', 'mg/dL', 0, 200),
            ('TRIGLICERIDOS', 'Triglicéridos', 'mg/dL', 0, 150),
            ('HB', 'Hemoglobina', 'g/dL', 11.6, 15.5),
            ('Vitamina D', '25-OH', 'ng/mL', 30, None),
            ('Albúmina', 'Albúmina', 'g/dL', 3.5, None),
            ('Creatinina', 'CREA', 'mg/dL', 0.5, 1.1),
        ]
        for codigo, nombre, unidad, ref_min, ref_max in lab_catalog:
            ensure_parametro_lab(cur, codigo=codigo, nombre=nombre, unidad=unidad, ref_min=ref_min, ref_max=ref_max)

    # Single common password for ALL users (override with SEED_PASSWORD)
    common_password = os.getenv('SEED_PASSWORD') or os.getenv('ADMIN_PASSWORD') or 'Clave123'

    # Admin user (optional, useful for auth testing)


    # Professionals
    func_id = ensure_user(cur, rut='200000001', nombres='Felipe', ap_paterno='Funcionario', ap_materno='Perez', correo='funcionario@demo.cl', sexo='M', fecha_nac='1985-02-10', password=common_password)
    func_prof_id = ensure_professional_profile(cur, user_id=func_id, cargo='FUNCIONARIO', rut_profesional='200000001', especialidad='Traumatología', hospital='H. Demo', departamento='Trauma')

    tec_id = ensure_user(cur, rut='200000002', nombres='Teresa', ap_paterno='Tecnologa', ap_materno='Gomez', correo='tecnologo@demo.cl', sexo='F', fecha_nac='1987-03-15', password=common_password)
    tec_prof_id = ensure_professional_profile(cur, user_id=tec_id, cargo='TECNOLOGO', rut_profesional='200000002', especialidad='Lab Clínico', hospital='H. Demo', departamento='Laboratorio')

    inv_id = ensure_user(cur, rut='200000003', nombres='Iván', ap_paterno='Investigador', ap_materno='Rios', correo='investigador@demo.cl', sexo='M', fecha_nac='1982-07-20', password=common_password)
    inv_prof_id = ensure_professional_profile(cur, user_id=inv_id, cargo='INVESTIGADOR', rut_profesional='200000003', especialidad='Epidemiología', hospital='H. Demo', departamento='Investigación')

    # Patients and their data
    nombres_pool = [
        ("Sofía", "Muñoz", "Rojas", 'F'),
        ("Camilo", "Soto", "Pérez", 'M'),
        ("Valentina", "García", "Lagos", 'F'),
        ("Matías", "Paredes", "Martínez", 'M'),
        ("Fernanda", "Vega", "Contreras", 'F'),
    ]
    abo_choices = ['A','B','AB','O']
    rh_choices = ['Rh+','Rh-']
    cie10_choices = ['S72.0','S72.1','S72.2']
    tipo_fx_choices = ['INTRACAPSULAR','PERTROCANTERICA','SUBTROCANTERICA']
    cie10_map = {
        'INTRACAPSULAR': 'S72.0',
        'PERTROCANTERICA': 'S72.1',
        'SUBTROCANTERICA': 'S72.2',
    }
    lado_choices = ['DERECHO','IZQUIERDO','BILATERAL']
    proc_choices = ['URGENCIA','APS','OTRO_CENTRO']

    base_rut = 300000000
    created_patients = []

    for i in range(patients):
        nombre, ap_pat, ap_mat, sexo = nombres_pool[i % len(nombres_pool)]
        rut = str(base_rut + i + 1)
        correo = f"{nombre.lower()}.{ap_pat.lower()}@paciente.test"
        user_id = ensure_user(cur,
            rut=rut, nombres=nombre, ap_paterno=ap_pat, ap_materno=ap_mat,
            correo=correo, sexo=sexo, fecha_nac='1975-{:02d}-{:02d}'.format((i%12)+1, ((i*3)%28)+1), password=common_password
        )
        ensure_paciente(cur, user_id=user_id, tipo_sangre=random.choice(['A+','A-','B+','B-','AB+','O+','O-']), altura=round(1.5 + random.random()*0.3, 2), edad_anios=70+i, edad_meses=(i*2)%12)

        # Examen for patient (used later for results linkage)
        examen_id = create_examen(cur, tipo_examen='LABORATORIO', paciente_id=user_id)

        # Create episodes for this patient
        episodio_ids = []
        for j in range(episodes_per_patient):
            now = datetime.now(timezone.utc)
            dx_date = now - timedelta(days=30 + j*15)
            tipo_fractura = random.choice(tipo_fx_choices)
            cie10 = cie10_map.get(tipo_fractura, random.choice(cie10_choices))
            lado = random.choice(lado_choices)
            procedencia = random.choice(proc_choices)
            tabaco_bool = random.random() < 0.35
            alcohol_bool = random.random() < 0.25
            corticoides_bool = random.random() < 0.15
            taco_bool = random.random() < 0.2
            fragilidad_prev = random.random() < 0.30
            fractura_vertebral_prev = random.random() < 0.25
            antecedente_familiar = random.random() < 0.30
            num_comorbilidades = random.choice([0, 1, 1, 2, 3])
            comorbilidades_catalog = ['HTA', 'DM2', 'IRC', 'EPOC', 'Demencia', 'Cardiopatía']
            comorbilidades_detalle = random.sample(comorbilidades_catalog, k=num_comorbilidades) if num_comorbilidades else []
            barthel_score = random.randint(10, 95)
            surgery_delay_days = random.choice([1, 2, 2, 3, 4, 5])
            cirugia_hour = random.choice([8, 10, 12])
            cirugia_dt = dx_date + timedelta(days=surgery_delay_days, hours=cirugia_hour)
            ing_qx = dx_date + timedelta(days=max(1, surgery_delay_days - 1))
            alta = cirugia_dt + timedelta(days=random.randint(3, 8))
            subcapital_desplazada = tipo_fractura == 'INTRACAPSULAR' and random.random() < 0.55
            retraso_horas = max(0.0, (cirugia_dt - dx_date).total_seconds() / 3600.0)
            retraso_quirurgico = retraso_horas > 48

            episodio_id = create_episodio(
                cur,
                paciente_id=user_id,
                cie10=cie10,
                tipo_fractura=tipo_fractura,
                lado=lado,
                procedencia=procedencia,
                fecha_dx=dx_date,
                fecha_ing_qx=ing_qx,
                fecha_alta=alta,
                no_operado=False,
                abo=random.choice(abo_choices),
                rh=random.choice(rh_choices),
                tabaco=tabaco_bool,
                alcohol=alcohol_bool,
                corticoides=corticoides_bool,
                taco=taco_bool,
                fallecimiento=False,
                notas=f"Ingreso por Fx cadera (paciente {i+1}, episodio {j+1})"
            )
            episodio_ids.append(episodio_id)

            # Anthropometrics
            peso_kg = round(random.uniform(48, 90), 1)
            altura_m = round(random.uniform(1.48, 1.80), 2)
            imc_val = round(peso_kg / (altura_m ** 2), 1) if altura_m else None
            create_antropometria(cur, episodio_id=episodio_id, peso_kg=peso_kg, altura_m=altura_m)

            # Controls
            create_control_clinico(cur, episodio_id=episodio_id, profesional_id=func_prof_id, origen='Guardado', resumen='Control de ingreso', fecha=dx_date + timedelta(hours=6))
            create_control_clinico(cur, episodio_id=episodio_id, profesional_id=inv_prof_id, origen='Minuta', resumen='Control de evolución', fecha=dx_date + timedelta(days=3))

            # Surgery
            cirugia_id = create_cirugia(
                cur,
                episodio_id=episodio_id,
                fecha=cirugia_dt.date(),
                hora_inicio=cirugia_dt.strftime('%H:%M'),
                hora_fin=(cirugia_dt + timedelta(hours=2)).strftime('%H:%M'),
                tecnica=random.choice(['GAMMA','DHS','ATC','APC','BIP']),
                lado=lado,
                reoperacion=False,
                operador_id=func_prof_id
            )

            # Suspension (for some episodes)
            if (i + j) % 3 == 0:
                susp_id = create_suspension(cur, episodio_id=episodio_id, fecha_suspension=(dx_date + timedelta(days=1)).date(), tipo=random.choice(['CLINICA','ADMINISTRATIVA']), motivo='Condición clínica')
            else:
                susp_id = None

            # Complications
            create_complicacion(cur, episodio_id=episodio_id, momento=random.choice(['PRE','POST','INTRA']), presente=True, descripcion='Sin complicación mayor')

            # Evolution
            create_evolucion(cur, episodio_id=episodio_id, transfusion_requerida=bool(j % 2), reingreso_30d=False, comentarios='Evolución favorable')

            # Muestra(s) for the exam
            m1_id = create_muestra(cur, tipo_muestra='SANGRE', fecha_extraccion=dx_date + timedelta(hours=1), examen_id=examen_id, profesional_id=tec_prof_id, fecha_recepcion=dx_date + timedelta(hours=3), observaciones='Muestra sin hemólisis')

            # Resultados for this episode (link to muestra and exam)
            fecha_resultado = dx_date + timedelta(hours=5)
            hb_val = round(random.uniform(9.0, 14.5), 1)
            glucosa_val = round(random.uniform(70, 180), 1)
            colesterol_val = round(random.uniform(150, 250), 1)
            trigliceridos_val = round(random.uniform(80, 220), 1)
            vitamina_d_val = round(random.uniform(12, 40), 1)
            albumina_val = round(random.uniform(2.8, 4.6), 2)
            creatinina_val = round(random.uniform(0.6, 1.9), 2)
            nlr_val = round(random.uniform(1.2, 6.8), 2)
            mlr_val = round(random.uniform(0.2, 0.55), 2)

            lab_values = {
                'HB': hb_val,
                'GLUCOSA': glucosa_val,
                'COLESTEROL_TOTAL': colesterol_val,
                'TRIGLICERIDOS': trigliceridos_val,
                'Vitamina D': vitamina_d_val,
                'Albúmina': albumina_val,
                'Creatinina': creatinina_val,
            }
            lab_units = {
                'HB': 'g/dL',
                'GLUCOSA': 'mg/dL',
                'COLESTEROL_TOTAL': 'mg/dL',
                'TRIGLICERIDOS': 'mg/dL',
                'Vitamina D': 'ng/mL',
                'Albúmina': 'g/dL',
                'Creatinina': 'mg/dL',
            }

            r_hb = None
            for parametro, valor in lab_values.items():
                res_id = create_resultado(
                    cur,
                    episodio_id=episodio_id,
                    parametro=parametro,
                    valor=valor,
                    unidad=lab_units.get(parametro),
                    fecha_resultado=fecha_resultado,
                    muestra_id=m1_id,
                    examen_id=examen_id,
                )
                if parametro == 'HB':
                    r_hb = res_id

            # Tabla 1: criterios y puntaje acumulado
            contexto = {
                'edad': 70 + i,
                'sexo': sexo,
                'fractura_fragilidad': fragilidad_prev,
                'fractura_vertebral': fractura_vertebral_prev,
                'antecedente_familiar': antecedente_familiar,
                'vitamina_d': lab_values['Vitamina D'],
                'albumina': lab_values['Albúmina'],
                'hemoglobina': lab_values['HB'],
                'creatinina': lab_values['Creatinina'],
                'nlr': nlr_val,
                'mlr': mlr_val,
                'num_comorbilidades': num_comorbilidades,
                'comorbilidades_detalle': comorbilidades_detalle,
                'barthel': barthel_score,
                'imc': imc_val if imc_val is not None else 0.0,
                'tabaco': tabaco_bool,
                'corticoides': corticoides_bool,
                'alcohol': alcohol_bool,
                'subcapital_desplazada': subcapital_desplazada,
                'tipo_fractura': tipo_fractura,
                'retraso_quirurgico': retraso_quirurgico,
                'retraso_horas': retraso_horas,
            }

            total_puntaje = 0
            detalle_factores = []
            for factor in FACTORES_TABLA1:
                puntaje, detalle = registrar_factor(cur, episodio_id, factor, contexto)
                total_puntaje += puntaje
                detalle_factores.append(detalle)

            if total_puntaje >= 8:
                nivel_riesgo = 'ALTO'
            elif total_puntaje >= 4:
                nivel_riesgo = 'MODERADO'
            else:
                nivel_riesgo = 'BAJO'

            color_riesgo = {'BAJO': 'VERDE', 'MODERADO': 'AMARILLO', 'ALTO': 'ROJO'}
            riesgo_total_id = create_episodio_indicador(
                cur,
                episodio_id=episodio_id,
                tipo='RIESGO_REFRACTURA',
                valor=total_puntaje,
                nivel=nivel_riesgo,
                detalles={
                    'puntaje_total': total_puntaje,
                    'nivel': nivel_riesgo,
                    'color': color_riesgo[nivel_riesgo],
                    'criterios': detalle_factores,
                },
            )

            if riesgo_total_id and nivel_riesgo != 'BAJO':
                severidad = 'ALTA' if nivel_riesgo == 'ALTO' else 'MEDIA'
                mensaje_riesgo = f"Riesgo de refractura {nivel_riesgo.lower()} (puntaje {total_puntaje})."
                create_alerta(
                    cur,
                    episodio_id=episodio_id,
                    tipo='RIESGO',
                    severidad=severidad,
                    mensaje=mensaje_riesgo,
                    episodio_indicador_id=riesgo_total_id,
                )

            # Risk indicator tied to a result (legacy IndicadorRiesgo)
            indicador_id = create_indicador_riesgo(cur, descripcion='Riesgo por Hb baja', puntaje=random.uniform(1, 5), resultado_id=r_hb)

            # Alerts
            create_alerta(cur, episodio_id=episodio_id, tipo='LAB', severidad=random.choice(['BAJA','MEDIA','ALTA']), mensaje='HB fuera de rango', indicador_id=indicador_id, resultado_id=r_hb, cirugia_id=cirugia_id)

            # Optional minute (if table present)
            create_minuta(cur, ruta_pdf=f"/minutas/{user_id}-{episodio_id}.pdf", fecha_creacion=dx_date + timedelta(days=1), funcionario_id=func_prof_id, paciente_id=user_id, tecnologo_id=tec_prof_id)

            # Audit log
            create_registro(cur, accion='SEED_EPISODIO', fecha_registro=datetime.now(timezone.utc), administrador_rut='111111111', actor_user_rut='111111111')

        created_patients.append((user_id, episodio_ids))

    curated = seed_curated_cases(
        cur,
        count=curated_patients,
        common_password=common_password,
        func_prof_id=func_prof_id,
        tec_prof_id=tec_prof_id,
        inv_prof_id=inv_prof_id,
    )

    return {
        'func_prof_id': func_prof_id,
        'tec_prof_id': tec_prof_id,
        'inv_prof_id': inv_prof_id,
        'patients': created_patients,
        'curated': curated,
    }


def main():
    parser = argparse.ArgumentParser(description='Seed PostgreSQL database with demo data for Fracturas controllers')
    parser.add_argument('--reset', action='store_true', help='Truncate known tables before seeding')
    parser.add_argument('--patients', type=int, default=3, help='Number of patients to create')
    parser.add_argument('--episodes', type=int, default=2, help='Episodes per patient')
    parser.add_argument('--curated', type=int, default=0, choices=[0, 1, 2, 3], metavar='N', help='Add N curated patients (1-3) with full clinical data')
    args = parser.parse_args()

    cfg = load_env()
    print(f"Connecting to postgres://{cfg['user']}@{cfg['host']}:{cfg['port']}/{cfg['dbname']} ...")
    conn = connect_db(cfg)

    try:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            if args.reset:
                print('Resetting tables...')
                reset_database(cur)

            print('Ensuring schema compatibility...')
            ensure_schema_updates(cur)

            print(f"Seeding data: patients={args.patients}, episodes_per_patient={args.episodes}, curated={args.curated} ...")
            summary = seed(cur, patients=args.patients, episodes_per_patient=args.episodes, curated_patients=args.curated)

        conn.commit()
        print('Seed completed successfully.')
        print('Summary:')
        print(f"  Professional profiles: funcionario={summary['func_prof_id']}, tecnologo={summary['tec_prof_id']}, investigador={summary['inv_prof_id']}")
        print(f"  Patients created: {len(summary['patients'])}")
        print(f"  Curated patients created: {len(summary['curated'])}")
    except Exception as e:
        conn.rollback()
        print('ERROR: Seed failed, transaction rolled back.')
        print(str(e))
        sys.exit(1)
    finally:
        conn.close()


if __name__ == '__main__':
    main()
