"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useInvestigator } from "@/contexts/InvestigatorContext";

function format(dateIso: string) {
  return dateIso?.slice(0, 10) ?? "";
}

export default function RecordsTable() {
  const {
    filtered,
    loading,
    error,
    page,
    pageSize,
    setPage,
    setPageSize,
    selectedIds,
    toggleSelect,
    selectAllFiltered,
    clearSelection,
  } = useInvestigator();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  if (error) {
    return (
      <div className="rounded-2xl border bg-white p-4 text-red-600">Error: {error}</div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={selectAllFiltered}
            className="rounded-lg border px-2 py-1 hover:bg-slate-50"
          >
            Seleccionar página/total
          </button>
          <button
            onClick={clearSelection}
            className="rounded-lg border px-2 py-1 hover:bg-slate-50"
          >
            Limpiar selección
          </button>
          <span className="text-slate-500">Seleccionados: {selectedIds.size}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Filas por página</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-lg border px-2 py-1 text-sm"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="px-3 py-2" />
              <th className="px-3 py-2">Sel.</th>
              <th className="px-3 py-2 text-left">Solicitud</th>
              <th className="px-3 py-2 text-left">Tipo de Muestra</th>
              <th className="px-3 py-2 text-left">Procedencia</th>
              <th className="px-3 py-2 text-left">Tipo de Ingreso</th>
              <th className="px-3 py-2 text-left">Fecha de ingreso</th>
              <th className="px-3 py-2 text-left">Sexo</th>
              <th className="px-3 py-2 text-left">Edad</th>
              <th className="px-3 py-2 text-left">CIE-10</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                  Cargando…
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                  Sin resultados para los filtros actuales.
                </td>
              </tr>
            ) : (
              pageData.map((record) => {
                const isOpen = expanded.has(record.id);
                return (
                  <Fragment key={record.id}>
                    <tr className="border-t">
                      <td className="px-2 py-2">
                        <button
                          onClick={() =>
                            setExpanded((prev) => {
                              const next = new Set(prev);
                              if (next.has(record.id)) next.delete(record.id);
                              else next.add(record.id);
                              return next;
                            })
                          }
                          className="rounded-lg border p-1 hover:bg-slate-50"
                          aria-label={isOpen ? "Contraer" : "Expandir"}
                        >
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(record.id)}
                          onChange={() => toggleSelect(record.id)}
                        />
                      </td>
                      <td className="px-3 py-2 font-medium">{record.solicitud}</td>
                      <td className="px-3 py-2">{record.tipoMuestra}</td>
                      <td className="px-3 py-2">{record.procedencia}</td>
                      <td className="px-3 py-2">{record.tipoIngreso}</td>
                      <td className="px-3 py-2">{format(record.fechaIngreso)}</td>
                      <td className="px-3 py-2">{record.sexo}</td>
                      <td className="px-3 py-2">{record.edad}</td>
                      <td className="px-3 py-2">{record.cie10}</td>
                    </tr>

                    {isOpen && (
                      <tr className="bg-slate-50">
                        <td />
                        <td colSpan={9} className="px-3 pb-4">
                          <div className="rounded-xl border bg-white">
                            <div className="border-b px-3 py-2 text-xs font-semibold text-slate-600">
                              Exámenes realizados
                            </div>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="bg-slate-100 text-slate-700">
                                    <th className="px-3 py-2 text-left">Examen</th>
                                    <th className="px-3 py-2 text-left">Fecha de recepción</th>
                                    <th className="px-3 py-2 text-left">Validado por</th>
                                    <th className="px-3 py-2 text-left">Fecha</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {record.examenes.map((examen, idx) => (
                                    <tr key={idx} className="border-t">
                                      <td className="px-3 py-2">{examen.nombre}</td>
                                      <td className="px-3 py-2">{format(examen.fechaRecepcion)}</td>
                                      <td className="px-3 py-2">{examen.validadoPor}</td>
                                      <td className="px-3 py-2">{format(examen.fechaResultado)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
        <p className="text-xs text-slate-500">
          Página {page} de {totalPages} — {filtered.length.toLocaleString()} registros
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => page > 1 && setPage(page - 1)}
            className="rounded-lg border px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
            disabled={page === 1}
          >
            Anterior
          </button>
          <button
            onClick={() => page < totalPages && setPage(page + 1)}
            className="rounded-lg border px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
            disabled={page === totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
