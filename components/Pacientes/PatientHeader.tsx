// components/Pacientes/PatientHeader.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePatient } from '@/contexts/PatientContext';

const fmtEdad = (edad?: number, meses?: number) => {
  if (edad == null) return '—';
  if (meses && meses > 0) return `${edad} años ${meses} meses`;
  return `${edad} años`;
};

export default function PatientHeader() {
  const { paciente } = usePatient();

  return (
    <Link href="/paciente/ficha" className="block group outline-none" aria-label="Abrir Ficha médica">
      {/* wrapper con borde degradado */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-indigo-200/60 via-sky-200/60 to-emerald-200/60">
        <div
          className="rounded-2xl bg-white/80 backdrop-blur p-5 shadow-sm
                     transition hover:shadow-md hover:ring-1 hover:ring-blue-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {/* nombre en mayúsculas */}
          <div className="text-xl font-semibold tracking-wide uppercase text-slate-900">
            {paciente?.nombre_completo ?? 'Paciente'}
          </div>

          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
            <span>{fmtEdad(paciente?.edad as any, (paciente as any)?.meses)}</span>
            <span>{paciente?.sexo === 'F' ? 'Femenino' : paciente?.sexo === 'M' ? 'Masculino' : '—'}</span>
            <span>{paciente?.rut ?? '—'}</span>
            <span>{paciente?.altura != null ? `${paciente.altura} cm` : '—'}</span>
            <span>{paciente?.tipo_sangre ?? '—'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
