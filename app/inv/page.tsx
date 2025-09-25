"use client";

import { useMemo } from "react";
import { Download, RefreshCw } from "lucide-react";
import { useInvestigator } from "@/contexts/InvestigatorContext";
import FiltersBar from "@/components/Investigador/FiltersBar";
import RecordsTable from "@/components/Investigador/RecordsTable";
import DownloadPanel from "@/components/Investigador/DownloadPanel";

export default function InvestigadorHome() {
  const { summary, refresh, loading } = useInvestigator();

  const kpis = useMemo(
    () => [
      { label: "Registros", value: summary.total.toLocaleString() },
      { label: "Años cubiertos", value: summary.yearsRange ?? "—" },
      { label: "Exámenes vinculados", value: summary.totalExams.toLocaleString() },
    ],
    [summary]
  );
  
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Investigador: Registros anonimizados</h1>
          <p className="text-sm text-slate-600">
            Explora, filtra y descarga los registros conforme a tus criterios de análisis.
          </p>
        </div>

        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
          disabled={loading}
        >
          <RefreshCw className={["h-4 w-4", loading ? "animate-spin" : ""].join(" ")} />
          Refrescar
        </button>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold">{k.value}</p>
          </div>
        ))}
      </section>

      {/* Filtros + navegación */}
      <section id="explorar" className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Explorar registros</h2>
        </div>
        <FiltersBar />
        <RecordsTable />
      </section>

      {/* Descargas */}
      <section id="descargar" className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Descargar</h2>
          <Download className="h-4 w-4" />
        </div>
        <DownloadPanel />
      </section>
    </div>
  );
}
