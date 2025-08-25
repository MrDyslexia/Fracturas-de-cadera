'use client';

import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';
import React from 'react';
import PatientInfoTable from '@/components/Pacientes/PatientInfoTable';
import { usePatient } from '@/contexts/PatientContext';
import { RefreshCcw } from 'lucide-react';

function FichaScreen() {
  const { logout } = useAuth();
  const { refresh, loading } = usePatient();

  // Si el usuario navega hacia atrás, confirmar y cerrar sesión
  useConfirmBackToLogin(() => { logout(); });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Título + botón actualizar (sin el rectángulo de nombre) */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
          Ficha del paciente
        </h1>
        <button
          onClick={refresh}
          disabled={loading}
          className="ml-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          title="Actualizar"
        >
          <RefreshCcw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Solo la tabla detallada */}
      <div className="mt-4">
        <PatientInfoTable />
      </div>
    </div>
  );
}

export default function FichaPage() {
  return (
    <RoleGuard allow={['paciente']}>
      <FichaScreen />
    </RoleGuard>
  );
}
