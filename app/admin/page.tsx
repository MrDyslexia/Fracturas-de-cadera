'use client';
import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const { user, logout } = useAuth();
  return (
    <RoleGuard allow={['admin']}>
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="mt-2">Hola, {user?.nombre}</p>
        <button onClick={logout} className="mt-4 border px-3 py-1 rounded">Cerrar sesión</button>
      </main>
    </RoleGuard>
  );
}
