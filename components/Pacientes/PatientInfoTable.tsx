'use client';

import React from 'react';
import { usePatient } from '@/contexts/PatientContext';

export default function PatientInfoTable() {
  const { paciente, loading, error } = usePatient();

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 p-6 bg-white shadow-sm">
        <p className="text-sm text-slate-500">Cargando ficha del paciente…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 p-6 bg-red-50 text-red-700">
        Ocurrió un error: {error}
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="rounded-xl border border-slate-200 p-6 bg-white shadow-sm">
        <p className="text-sm text-slate-500">No se encontraron datos del paciente.</p>
      </div>
    );
  }

  const rows = [
    { label: 'RUT', value: paciente.rut || '—' },
    { label: 'Nombre completo', value: paciente.nombre_completo || '—' },
    { label: 'Sexo', value: paciente.sexo === 'F' ? 'Femenino' : paciente.sexo === 'M' ? 'Masculino' : '—' },
    { label: 'Fecha de nacimiento', value: paciente.fecha_nacimiento ?? '—' },
    { label: 'Tipo de sangre', value: paciente.tipo_sangre ?? '—' },
    { label: 'Altura', value: paciente.altura != null ? `${paciente.altura} cm` : '—' },
    { label: 'Edad', value: paciente.edad != null ? `${paciente.edad} años` : '—' },
  ];

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
      <div className="px-4 py-3 text-sm font-medium bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50">
        Ficha del paciente
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className="text-left px-4 py-2 font-semibold w-56">Campo</th>
              <th className="text-left px-4 py-2 font-semibold">Valor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} className={`border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                <td className="px-4 py-3 text-slate-700">{r.label}</td>
                <td className="px-4 py-3 text-slate-900">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
