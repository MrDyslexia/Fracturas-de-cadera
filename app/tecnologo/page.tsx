// app/tecnologo/page.tsx
'use client';

import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';
import React from 'react';
import SearchPaciente from '@/components/Tecnologo/SearchPaciente';

function TecHomeScreen() {
  const { logout } = useAuth();
  useConfirmBackToLogin(() => { logout(); });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Panel del Tecnólogo</h1>

      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-indigo-200/60 via-sky-200/60 to-emerald-200/60">
        <div className="rounded-2xl bg-white shadow-sm p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Ingreso de paciente</h2>
          <SearchPaciente />
        </div>
      </div>
    </div>
  );
}

export default function TecHomePage() {
  return (
    <RoleGuard allow={['tecnologo']}>
      <TecHomeScreen />
    </RoleGuard>
  );
}
