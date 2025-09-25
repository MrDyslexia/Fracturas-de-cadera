"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/** ====== Tipos ====== */
export type ExamItem = {
  nombre: string;
  fechaRecepcion: string;   // ISO
  validadoPor: string;
  fechaResultado: string;   // ISO
};

export type AnonRecord = {
  id: string;
  solicitud: string;
  fechaIngreso: string;     // ISO date
  procedencia: string;      // p.ej. "Urgencia HGF", "CESFAM", etc.
  tipoIngreso: "Urgencia" | "Electivo";
  tipoMuestra: string;      // p.ej. "Sangre", "Orina", "Imagen"
  sexo: "M" | "F";
  edad: number;             // años
  cie10: string;            // p.ej. S72.0
  fracturaTipo: "Intracapsular" | "Extracapsular" | "Otra";
  examenes: ExamItem[];
};

export type Filters = {
  q: string;
  year?: number;
  procedencia?: string;
  tipoIngreso?: "Urgencia" | "Electivo";
  tipoMuestra?: string;
  sexo?: "M" | "F";
  edadMin?: number;
  edadMax?: number;
};

type Summary = {
  total: number;
  totalExams: number;
  yearsRange?: string;
};

type Ctx = {
  loading: boolean;
  error?: string;
  data: AnonRecord[];
  filtered: AnonRecord[];
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  selectAllFiltered: () => void;
  clearSelection: () => void;

  // filtros
  filters: Filters;
  setFilters: (p: Partial<Filters>) => void;
  clearFilters: () => void;

  // paginación
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
  setPageSize: (n: number) => void;

  // resumen
  summary: Summary;

  // datos
  refresh: () => void;

  // descargas
  downloadCSV: (onlySelected?: boolean) => Promise<void>;
  downloadXLSX: (onlySelected?: boolean) => Promise<void>;
};

const InvestigatorContext = createContext<Ctx | null>(null);

/** ====== Utilidad: generar CSV simple ====== */
function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: any) =>
    typeof v === "string"
      ? `"${v.replaceAll('"', '""')}"`
      : v === null || v === undefined
      ? ""
      : String(v);
  const head = cols.join(";");
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(";")).join("\n");
  // BOM para Excel
  return "\uFEFF" + head + "\n" + body;
}

function downloadFile(name: string, mime: string, content: BlobPart) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** ====== Datos MOCK si no hay API ====== */
function generateMock(n = 120): AnonRecord[] {
  const procedencias = ["Urgencia HGF", "Trauma Sur", "Cesfam Oriente", "Clínica X"];
  const muestras = ["Sangre", "Orina", "Imagen"];
  const cie = ["S72.0", "S72.1", "S72.2"];
  const out: AnonRecord[] = [];
  const today = new Date().getFullYear();

  for (let i = 0; i < n; i++) {
    const year = today - Math.floor(Math.random() * 6); // últimos 6 años
    const month = 1 + Math.floor(Math.random() * 12);
    const day = 1 + Math.floor(Math.random() * 28);
    const id = crypto.randomUUID();
    const exCount = Math.floor(Math.random() * 3) + 1;
    const exs: ExamItem[] = Array.from({ length: exCount }).map((_, j) => {
      const d = new Date(year, month - 1, day + j);
      const dr = new Date(year, month - 1, day + j + 1);
      return {
        nombre: ["Hemograma", "INR", "RX Cadera", "Vitamina D"][Math.floor(Math.random() * 4)],
        fechaRecepcion: d.toISOString(),
        validadoPor: ["TM-124", "TM-233", "Dr-55"][Math.floor(Math.random() * 3)],
        fechaResultado: dr.toISOString(),
      };
    });

    out.push({
      id,
      solicitud: "SOL-" + String(10000 + i),
      fechaIngreso: new Date(year, month - 1, day).toISOString(),
      procedencia: procedencias[Math.floor(Math.random() * procedencias.length)],
      tipoIngreso: Math.random() > 0.3 ? "Urgencia" : "Electivo",
      tipoMuestra: muestras[Math.floor(Math.random() * muestras.length)],
      sexo: Math.random() > 0.5 ? "F" : "M",
      edad: 60 + Math.floor(Math.random() * 40),
      cie10: cie[Math.floor(Math.random() * cie.length)],
      fracturaTipo: Math.random() > 0.5 ? "Intracapsular" : "Extracapsular",
      examenes: exs,
    });
  }
  return out;
}

/** ====== Provider ====== */
export function InvestigatorProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [data, setData] = useState<AnonRecord[]>([]);
  const [filters, setFiltersState] = useState<Filters>({ q: "" });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      if (!API_BASE) {
        // MODO MOCK
        await new Promise((r) => setTimeout(r, 500));
        setData(generateMock(180));
      } else {
        const params = new URLSearchParams();
        if (filters.q) params.set("q", filters.q);
        if (filters.year) params.set("year", String(filters.year));
        if (filters.sexo) params.set("sexo", filters.sexo);
        if (filters.procedencia) params.set("procedencia", filters.procedencia);
        if (filters.tipoIngreso) params.set("tipoIngreso", filters.tipoIngreso);
        if (filters.tipoMuestra) params.set("tipoMuestra", filters.tipoMuestra);
        if (filters.edadMin != null) params.set("edadMin", String(filters.edadMin));
        if (filters.edadMax != null) params.set("edadMax", String(filters.edadMax));
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));

        const res = await fetch(`${API_BASE}/investigador/records?` + params.toString(), {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json.items as AnonRecord[]);
      }
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, filters, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilters = useCallback((p: Partial<Filters>) => {
    setFiltersState((prev) => {
      const merged = { ...prev, ...p };
      return merged;
    });
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({ q: "" });
    setPage(1);
  }, []);

  const filtered = useMemo(() => {
    const out = data.filter((r) => {
      const year = new Date(r.fechaIngreso).getFullYear();
      if (filters.year && year !== filters.year) return false;
      if (filters.sexo && r.sexo !== filters.sexo) return false;
      if (filters.procedencia && r.procedencia !== filters.procedencia) return false;
      if (filters.tipoIngreso && r.tipoIngreso !== filters.tipoIngreso) return false;
      if (filters.tipoMuestra && r.tipoMuestra !== filters.tipoMuestra) return false;
      if (filters.edadMin != null && r.edad < filters.edadMin) return false;
      if (filters.edadMax != null && r.edad > filters.edadMax) return false;
      if (filters.q) {
        const q = filters.q.toLowerCase();
        const hay =
          r.solicitud.toLowerCase().includes(q) ||
          r.cie10.toLowerCase().includes(q) ||
          r.procedencia.toLowerCase().includes(q) ||
          r.tipoMuestra.toLowerCase().includes(q) ||
          r.fracturaTipo.toLowerCase().includes(q);
        if (!hay) return false;
      }
      return true;
    });
    return out;
  }, [data, filters]);

  const summary = useMemo<Summary>(() => {
    const years = data.map((r) => new Date(r.fechaIngreso).getFullYear());
    const min = Math.min(...years);
    const max = Math.max(...years);
    const totalExams = data.reduce((acc, r) => acc + r.examenes.length, 0);
    return {
      total: data.length,
      totalExams,
      yearsRange: isFinite(min) && isFinite(max) ? `${min}-${max}` : undefined,
    };
  }, [data]);

  const refresh = useCallback(() => fetchData(), [fetchData]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const selectAllFiltered = useCallback(() => {
    setSelectedIds(new Set(filtered.map((r) => r.id)));
  }, [filtered]);
  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const rowsForExport = useCallback(
    (onlySelected?: boolean) => {
      const base = onlySelected ? filtered.filter((r) => selectedIds.has(r.id)) : filtered;
      // aplanamos 1:N con exámenes
      const rows = base.flatMap((r) =>
        r.examenes.length
          ? r.examenes.map((e) => ({
              id: r.id,
              solicitud: r.solicitud,
              fecha_ingreso: r.fechaIngreso.substring(0, 10),
              procedencia: r.procedencia,
              tipo_ingreso: r.tipoIngreso,
              tipo_muestra: r.tipoMuestra,
              sexo: r.sexo,
              edad: r.edad,
              cie10: r.cie10,
              fractura_tipo: r.fracturaTipo,
              examen: e.nombre,
              fecha_recepcion: e.fechaRecepcion.substring(0, 10),
              validado_por: e.validadoPor,
              fecha_resultado: e.fechaResultado.substring(0, 10),
            }))
          : [
              {
                id: r.id,
                solicitud: r.solicitud,
                fecha_ingreso: r.fechaIngreso.substring(0, 10),
                procedencia: r.procedencia,
                tipo_ingreso: r.tipoIngreso,
                tipo_muestra: r.tipoMuestra,
                sexo: r.sexo,
                edad: r.edad,
                cie10: r.cie10,
                fractura_tipo: r.fracturaTipo,
                examen: "",
                fecha_recepcion: "",
                validado_por: "",
                fecha_resultado: "",
              },
            ]
      );
      return rows;
    },
    [filtered, selectedIds]
  );

  const downloadCSV = useCallback(
    async (onlySelected?: boolean) => {
      const rows = rowsForExport(onlySelected);
      const csv = toCSV(rows);
      downloadFile(
        `registros_anonimizados${onlySelected ? "_seleccion" : ""}.csv`,
        "text/csv;charset=utf-8",
        csv
      );
    },
    [rowsForExport]
  );

  const downloadXLSX = useCallback(
    async (onlySelected?: boolean) => {
      try {
        // import dinámico opcional (si tienes 'xlsx' instalado)
        const XLSX: any = (await import("xlsx")).default ?? (await import("xlsx"));
        const rows = rowsForExport(onlySelected);
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Registros");
        const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        downloadFile(
          `registros_anonimizados${onlySelected ? "_seleccion" : ""}.xlsx`,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          out
        );
      } catch {
        // si no está la librería, caemos a CSV
        await downloadCSV(onlySelected);
      }
    },
    [downloadCSV, rowsForExport]
  );

  const value: Ctx = {
    loading,
    error,
    data,
    filtered,
    selectedIds,
    toggleSelect,
    selectAllFiltered,
    clearSelection,
    filters,
    setFilters,
    clearFilters,
    page,
    pageSize,
    setPage,
    setPageSize,
    summary,
    refresh,
    downloadCSV,
    downloadXLSX,
  };

  return <InvestigatorContext.Provider value={value}>{children}</InvestigatorContext.Provider>;
}

/** ====== Hook ====== */
export function useInvestigator() {
  const ctx = useContext(InvestigatorContext);
  if (!ctx) throw new Error("useInvestigator debe usarse dentro de InvestigatorProvider");
  return ctx;
}
