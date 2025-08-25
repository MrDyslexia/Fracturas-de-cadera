'use client';

import React from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { MoreVertical, FlaskConical, Stethoscope, Activity } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  lab: <FlaskConical className="h-4 w-4" />,
  trauma: <Activity className="h-4 w-4" />,
  ray: <Activity className="h-4 w-4" />,
  otros: <Stethoscope className="h-4 w-4" />,
};

export default function ExamsTable() {
  const { examenes, loading } = usePatient();

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 p-6 bg-white shadow-sm">
        <p className="text-sm text-slate-500">Cargando exámenes…</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
      <div className="px-4 py-3 text-sm font-medium bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 flex items-center justify-between">
        <span>Mis exámenes</span>
        <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-white/70" title="Acciones">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className="text-left px-4 py-2 font-semibold">Examen</th>
              <th className="text-left px-4 py-2 font-semibold">Solicitado por</th>
              <th className="text-left px-4 py-2 font-semibold">Especialidad</th>
              <th className="text-left px-4 py-2 font-semibold">Fecha solicitud</th>
              <th className="text-left px-4 py-2 font-semibold">Tomado por</th>
              <th className="text-left px-4 py-2 font-semibold">Fecha de toma</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {examenes.map((e, idx) => (
              <tr key={e.id ?? idx} className={`border-t border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                      {iconMap[e.icon ?? 'lab']}
                    </span>
                    <span className="font-medium text-slate-800">{e.tipo}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-800">{e.solicitado_por}</td>
                <td className="px-4 py-3">{e.especialidad}</td>
                <td className="px-4 py-3">{e.fecha_solicitud}</td>
                <td className="px-4 py-3">{e.tomado_por ?? '—'}</td>
                <td className="px-4 py-3">{e.fecha_toma ?? '—'}</td>
                <td className="px-2 py-3 text-right">
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100" title="Más opciones">
                    <MoreVertical className="h-4 w-4 text-slate-500" />
                  </button>
                </td>
              </tr>
            ))}
            {examenes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  No hay exámenes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
