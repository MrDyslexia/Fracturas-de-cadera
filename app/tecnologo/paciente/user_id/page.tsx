// app/tecnologo/paciente/[user_id]/page.tsx
'use client';

import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { useTecnologo } from '@/contexts/TecnologoContext';
import PatientMiniHeader from '@/components/Tecnologo/PatientMiniHeader';
import ExamTypeGrid from '@/components/Tecnologo/ExamTypeGrid';

function SelectExamScreen() {
  const { logout } = useAuth();
  const params = useParams<{ user_id: string }>();
  const { loadPaciente } = useTecnologo();

  useConfirmBackToLogin(() => { logout(); });

  useEffect(() => {
    const id = Number(params?.user_id);
    if (id > 0) loadPaciente(id);
  }, [params, loadPaciente]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Ingreso de exámenes</h1>
      <PatientMiniHeader />
      <ExamTypeGrid />
    </div>
  );
}

export default function SelectExamPage() {
  return (
    <RoleGuard allow={['tecnologo']}>
      <SelectExamScreen />
    </RoleGuard>
  );
}
