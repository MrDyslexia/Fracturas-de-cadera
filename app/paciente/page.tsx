// app/paciente/page.tsx
'use client';

import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';

function PacienteScreen() {
  const { logout } = useAuth();

  useConfirmBackToLogin(() => { logout(); });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">
        ✅ Has entrado correctamente a la página de Paciente
      </h1>
      <p>Bienvenido al módulo de Pacientes.</p>
    </main>
  );
}

export default function PacientePage() {
  return (
    <RoleGuard allow={['paciente']}>
      <PacienteScreen />
    </RoleGuard>
  );
}
