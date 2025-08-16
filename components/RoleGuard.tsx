'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // ← de tu contexto real
import type { UserRole } from '@/contexts/AuthContext'; // usa el mismo origen

type Props = {
  allow: UserRole[];   // roles permitidos para este bloque
  children: ReactNode;
};

export default function RoleGuard({ allow, children }: Props) {
  const { user, loading, portalFor } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // 1) no logeado → al login
    if (!user) {
      router.replace('/login');
      return;
    }

    // 2) ¿tiene al menos un rol permitido?
    const hasAccess = user.roles?.some(r => allow.includes(r));
    if (!hasAccess) {
      // redirige a su “home” por defecto según prioridad
      router.replace(portalFor(user.roles ?? []));
    }
  }, [user, loading, allow, router, portalFor]);

  if (loading) return <div className="p-6">Cargando…</div>;
  if (!user) return null;

  const canSee = user.roles?.some(r => allow.includes(r));
  if (!canSee) return null;

  return <>{children}</>;
}
