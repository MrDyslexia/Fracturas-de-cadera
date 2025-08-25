'use client';

import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';

function ConfiguracionScreen() {
  const { logout } = useAuth();
  useConfirmBackToLogin(() => { logout(); });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold mb-4">Configuración (Funcionario)</h1>
      <p className="text-slate-600">Aquí podrás ajustar preferencias del módulo Funcionario. (placeholder)</p>
    </div>
  );
}

export default function ConfiguracionPage() {
  return (
    <RoleGuard allow={['funcionario']}>
      <ConfiguracionScreen />
    </RoleGuard>
  );
}
