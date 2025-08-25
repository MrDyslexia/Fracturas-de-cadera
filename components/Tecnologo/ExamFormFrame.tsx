// components/Tecnologo/ExamFormFrame.tsx
'use client';

import React from 'react';
import { useTecnologo } from '@/contexts/TecnologoContext';

export default function ExamFormFrame({ title, children }:{ title: string; children: React.ReactNode }) {
  const { paciente } = useTecnologo();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>

      {paciente && (
        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-indigo-200/60 via-sky-200/60 to-emerald-200/60">
          <div className="rounded-2xl bg-white p-4">
            <div className="text-sm text-slate-700">
              <span className="font-semibold uppercase">{paciente.nombre_completo}</span>
              <span className="mx-3">•</span>
              <span>{paciente.rut}</span>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-indigo-200/60 via-sky-200/60 to-emerald-200/60">
        <form
          onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); console.log('submit', Object.fromEntries(fd as any)); alert('Formulario listo para conectar al backend.'); }}
          className="rounded-2xl bg-white p-5 space-y-4"
        >
          {children}
          <div className="pt-2">
            <button type="submit" className="rounded-xl bg-blue-700 text-white px-4 py-2 text-sm hover:bg-blue-800">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
