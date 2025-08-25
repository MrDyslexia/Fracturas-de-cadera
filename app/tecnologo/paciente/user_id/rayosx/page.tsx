'use client';

import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { useTecnologo } from '@/contexts/TecnologoContext';
import ExamFormFrame from '@/components/Tecnologo/ExamFormFrame';

function RayosXScreen() {
  const { logout } = useAuth();
  const { loadPaciente } = useTecnologo();
  const params = useParams<{ user_id: string }>();

  useConfirmBackToLogin(() => { logout(); });
  useEffect(() => { const id = Number(params?.user_id); if (id > 0) loadPaciente(id); }, [params, loadPaciente]);

  return (
    <ExamFormFrame title="Ingreso Rayos X">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Fecha de estudio</label>
          <input type="datetime-local" name="fecha_estudio" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Área / Proyección</label>
          <input type="text" name="proyeccion" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Hallazgos / Observaciones</label>
          <textarea name="obs" rows={4} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Adjuntar imagen o informe</label>
          <input type="file" name="file" className="block w-full text-sm" />
        </div>
      </div>
    </ExamFormFrame>
  );
}

export default function RayosXPage() {
  return (
    <RoleGuard allow={['tecnologo']}>
      <RayosXScreen />
    </RoleGuard>
  );
}
