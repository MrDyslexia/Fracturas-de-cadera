'use client';

import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';
import React from 'react';
import PatientHeader from '@/components/Pacientes/PatientHeader';
import PatientInfoTable from '@/components/Pacientes/PatientInfoTable';
import { usePatient } from '@/contexts/PatientContext';
import { RefreshCcw } from 'lucide-react';

function FichaScreen() {
  const { logout } = useAuth();
  const { refresh, loading } = usePatient();
  useConfirmBackToLogin(() => { logout(); });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Puedes mantener el header arriba si te gusta el título/identificación */}
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

      <div className="mt-6">
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
