'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/auth';

export default function RoleGuard({
  allow,
  children,
}: {
  allow: UserRole[]; 
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!allow.includes(user.role)) {
      // Redirige a su “home” por defecto
      const target =
        user.role === 'admin' ? '/admin' :
        user.role === 'funcionario' ? '/funcionario' :
        user.role === 'paciente' ? '/paciente' :
        user.role === 'investigador' ? '/investigador' :
        '/tecnologo';
      router.replace(target);
    }
  }, [user, loading, allow, router]);

  if (loading) return <div className="p-6">Cargando…</div>;
  if (!user || !allow.includes(user.role)) return null;

  return <>{children}</>;
}


