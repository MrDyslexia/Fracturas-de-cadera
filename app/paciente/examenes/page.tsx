// app/paciente/examenes/page.tsx
'use client';

import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';
import React from 'react';
import ExamsTable from '@/components/Pacientes/ExamsTable';
import { usePatient } from '@/contexts/PatientContext';
import { RefreshCcw } from 'lucide-react';

function ExamenesScreen() {
  const { logout } = useAuth();
  const { refresh, loading } = usePatient();

  useConfirmBackToLogin(() => { logout(); });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* ✅ Título de la página */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
          Mis exámenes
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

      {/* Tabla */}
      <div className="mt-4">
        <ExamsTable />
      </div>
    </div>
  );
}

export default function ExamenesPage() {
  return (
    <RoleGuard allow={['paciente']}>
      <ExamenesScreen />
    </RoleGuard>
  );
}
