'use client';

import { useEffect } from 'react';
import { AdminUsersProvider, useAdminUsers } from '../../contexts/AdminUsersContext';
import { UsersTable } from '../../components/Admin/UsersTable';
import { CreateUserCard } from '../../components/Admin/CreateUserCard';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';
import { useAuth } from '@/contexts/AuthContext';

function AdminUsersScreen() {
  const { fetchUsers, loading, error } = useAdminUsers();
  const { user, logout } = useAuth();

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Maneja la flecha atrás del navegador
  useConfirmBackToLogin(() => { logout(); });

  return (
    <div className="force-light min-h-[100vh] bg-gradient-to-br from-blue-50 to-blue-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-blue-800 tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-sm text-blue-700/80">Gestión de usuarios y perfiles profesionales</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <CreateUserCard />
        <UsersTable />
        {loading && <div className="text-center text-blue-700">Cargando…</div>}
        {error && <div className="text-center text-red-600">{error}</div>}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminUsersProvider>
      <AdminUsersScreen />
    </AdminUsersProvider>
  );
}
