'use client';

import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';

function ConfigTecScreen() {
  const { logout } = useAuth();
  useConfirmBackToLogin(() => { logout(); });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold mb-4">Configuración (Tecnólogo)</h1>
      <p className="text-slate-600">Preferencias del módulo de tecnólogo.</p>
    </div>
  );
}

export default function ConfigTecPage() {
  return (
    <RoleGuard allow={['tecnologo']}>
      <ConfigTecScreen />
    </RoleGuard>
  );
}
