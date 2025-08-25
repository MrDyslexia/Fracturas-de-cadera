'use client';

import React from 'react';
import { usePatient } from '@/contexts/PatientContext';

export default function PatientHeader() {
  const { paciente } = usePatient();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-5 shadow-sm">
      <div className="text-xl font-semibold tracking-wide">
        {paciente?.nombre_completo ?? 'Paciente'}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
        <span>{paciente?.edad != null ? `${paciente.edad} años` : '—'}</span>
        <span>{paciente?.sexo === 'F' ? 'Femenino' : paciente?.sexo === 'M' ? 'Masculino' : '—'}</span>
        <span>{paciente?.rut ?? '—'}</span>
        <span>{paciente?.altura != null ? `${paciente.altura} cm` : '—'}</span>
        <span>{paciente?.tipo_sangre ?? '—'}</span>
      </div>
    </div>
  );
}
