'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';

export default function PacientePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Si no hay sesión, redirige al login
  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  // Maneja la flecha atrás del navegador
  useConfirmBackToLogin(() => {
    logout(); // cerrar sesión si confirma
  });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">
        ✅ Has entrado correctamente a la página de Paciente
      </h1>
      <p>Bienvenido al módulo de Pacientes.</p>
    </main>
  );
}
