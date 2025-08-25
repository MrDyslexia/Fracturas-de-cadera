'use client';

import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { useTecnologo } from '@/contexts/TecnologoContext';
import ExamFormFrame from '@/components/Tecnologo/ExamFormFrame';

function BiopsiaScreen() {
  const { logout } = useAuth();
  const { loadPaciente } = useTecnologo();
  const params = useParams<{ user_id: string }>();

  useConfirmBackToLogin(() => { logout(); });
  useEffect(() => { const id = Number(params?.user_id); if (id > 0) loadPaciente(id); }, [params, loadPaciente]);

  return (
    <ExamFormFrame title="Ingreso Biopsia">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Fecha de toma</label>
          <input type="datetime-local" name="fecha_toma" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Sitio anatómico</label>
          <input type="text" name="sitio" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Tipo de biopsia</label>
          <input type="text" name="tipo_biopsia" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Observaciones</label>
          <textarea name="obs" rows={4} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Adjuntar informe (PDF/imagen)</label>
          <input type="file" name="file" className="block w-full text-sm" />
        </div>
      </div>
    </ExamFormFrame>
  );
}

export default function BiopsiaPage() {
  return (
    <RoleGuard allow={['tecnologo']}>
      <BiopsiaScreen />
    </RoleGuard>
  );
}
