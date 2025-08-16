'use client';

import { useEffect } from 'react';
import { AdminUsersProvider, useAdminUsers } from '../../contexts/AdminUsersContext';
import { UsersTable } from '../../components/Admin/UsersTable';
import { CreateUserCard } from '../../components/Admin/CreateUserCard';

function AdminUsersScreen() {
  const { fetchUsers, loading, error } = useAdminUsers();

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-blue-100">
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

        {loading && (
          <div className="text-center text-blue-700">Cargando…</div>
        )}
        {error && (
          <div className="text-center text-red-600">{error}</div>
        )}
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
