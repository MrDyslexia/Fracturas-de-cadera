'use client';

import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';
import React from 'react';
import ExamsTable from '@/components/Pacientes/ExamsTable';

function ExamenesScreen() {
  const { logout } = useAuth();
  useConfirmBackToLogin(() => { logout(); });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <ExamsTable />
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
