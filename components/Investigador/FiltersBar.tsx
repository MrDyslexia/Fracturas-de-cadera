"use client";

import { useMemo } from "react";
import { useInvestigator } from "@/contexts/InvestigatorContext";
import type { AnonRecord } from "@/contexts/InvestigatorContext";

export default function FiltersBar() {
  const { data, filters, setFilters, clearFilters } = useInvestigator();

  const options = useMemo(() => {
    const years = new Set<number>();
    const procedencias = new Set<string>();
    const tiposIngreso = new Set<AnonRecord["tipoIngreso"]>();
    const tiposMuestra = new Set<string>();
    const sexos = new Set<AnonRecord["sexo"]>();

    data.forEach((record) => {
      const year = new Date(record.fechaIngreso).getFullYear();
      if (!Number.isNaN(year)) years.add(year);
      if (record.procedencia) procedencias.add(record.procedencia);
      if (record.tipoIngreso) tiposIngreso.add(record.tipoIngreso);
      if (record.tipoMuestra) tiposMuestra.add(record.tipoMuestra);
      if (record.sexo) sexos.add(record.sexo);
    });

    return {
      years: Array.from(years).sort((a, b) => b - a),
      procedencias: Array.from(procedencias).sort(),
      tiposIngreso: Array.from(tiposIngreso).sort(),
      tiposMuestra: Array.from(tiposMuestra).sort(),
      sexos: Array.from(sexos).sort(),
    };
  }, [data]);

  return (
    <form
      className="grid grid-cols-1 gap-3 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4"
      onSubmit={(evt) => evt.preventDefault()}
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold uppercase text-slate-500">Buscar</span>
        <input
          value={filters.q}
          onChange={(e) => setFilters({ q: e.target.value })}
          placeholder="Solicitud, CIE-10, procedencia…"
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold uppercase text-slate-500">Año ingreso</span>
        <select
          value={filters.year ?? ""}
          onChange={(e) => setFilters({ year: e.target.value ? Number(e.target.value) : undefined })}
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          {options.years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold uppercase text-slate-500">Procedencia</span>
        <select
          value={filters.procedencia ?? ""}
          onChange={(e) => setFilters({ procedencia: e.target.value || undefined })}
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas</option>
          {options.procedencias.map((proc) => (
            <option key={proc} value={proc}>
              {proc}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold uppercase text-slate-500">Tipo ingreso</span>
        <select
          value={filters.tipoIngreso ?? ""}
          onChange={(e) =>
            setFilters({
              tipoIngreso: e.target.value
                ? (e.target.value as AnonRecord["tipoIngreso"])
                : undefined,
            })
          }
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          {options.tiposIngreso.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold uppercase text-slate-500">Tipo muestra</span>
        <select
          value={filters.tipoMuestra ?? ""}
          onChange={(e) => setFilters({ tipoMuestra: e.target.value || undefined })}
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas</option>
          {options.tiposMuestra.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold uppercase text-slate-500">Sexo</span>
        <select
          value={filters.sexo ?? ""}
          onChange={(e) =>
            setFilters({
              sexo: e.target.value
                ? (e.target.value as AnonRecord["sexo"])
                : undefined,
            })
          }
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          {options.sexos.map((sexo) => (
            <option key={sexo} value={sexo}>
              {sexo}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold uppercase text-slate-500">Edad (mín / máx)</span>
        <div className="flex gap-2">
          <input
            type="number"
            value={filters.edadMin ?? ""}
            onChange={(e) =>
              setFilters({ edadMin: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={0}
          />
          <input
            type="number"
            value={filters.edadMax ?? ""}
            onChange={(e) =>
              setFilters({ edadMax: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={0}
          />
        </div>
      </div>

      <div className="flex items-end">
        <button
          type="button"
          onClick={clearFilters}
          className="w-full rounded-lg border px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Limpiar filtros
        </button>
      </div>
    </form>
  );
}
