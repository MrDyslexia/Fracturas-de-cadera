// app/paciente/page.tsx
'use client';

import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';

import React from 'react';
import PatientHeader from '@/components/Pacientes/PatientHeader';
import ExamsTable from '@/components/Pacientes/ExamsTable';
import { usePatient } from '@/contexts/PatientContext';
import { RefreshCcw } from 'lucide-react';

function PacienteScreen() {
  const { logout } = useAuth();
  const { refresh, loading } = usePatient();

  useConfirmBackToLogin(() => { logout(); });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Resumen breve del paciente */}
      <div className="flex items-center justify-between">
        <PatientHeader />
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

      {/* Tabla de exámenes */}
      <div className="mt-6">
        <ExamsTable />
      </div>
    </div>
  );
}

export default function PacientePage() {
  return (
    <RoleGuard allow={['paciente']}>
      <PacienteScreen />
    </RoleGuard>
  );
}
