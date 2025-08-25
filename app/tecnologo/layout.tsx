// app/tecnologo/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { TecnologoProvider } from '@/contexts/TecnologoContext';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';
import { House, ClipboardList, Settings, LogOut } from 'lucide-react';
import React from 'react';

const navItems = [
  { href: '/tecnologo', icon: House, label: 'Panel del tecnólogo' },
  // más enlaces a futuro...
];

export default function TecnologoLayout({ children }: { children: React.ReactNode }) {
  return (
    <TecnologoProvider>
      <Shell>{children}</Shell>
    </TecnologoProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  useConfirmBackToLogin(() => { logout(); });

  // ✅ Home solo activo en coincidencia exacta; el resto permite prefijo
  const isActive = (href: string) => {
    if (href === '/tecnologo') return pathname === '/tecnologo';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const onLogout = async () => {
    try { await logout?.(); } finally {
      try { router.replace('/login'); } catch {}
      setTimeout(() => { if (location.pathname !== '/login') window.location.assign('/login'); }, 0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Sidebar (mismo estilo que paciente/funcionario, activo en negro) */}
      <aside className="fixed left-0 top-0 h-screen w-[72px] border-r border-slate-200 bg-white/70 backdrop-blur">
        <div className="flex h-full flex-col items-center py-4 gap-3">
          <div className="mt-2 flex flex-col gap-2">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                title={label}
                className={`group inline-flex h-12 w-12 items-center justify-center rounded-2xl transition
                  ${
                    isActive(href)
                      ? 'bg-slate-900 text-white shadow-lg ring-1 ring-slate-300'
                      : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                  }`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </div>

          {/* Configuración */}
          <button
            onClick={() => router.push('/tecnologo/configuracion')}
            title="Configuración"
            className={`mt-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 transition
              ${isActive('/tecnologo/configuracion') ? 'ring-2 ring-slate-900' : ''}`}
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* Salir */}
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      <main className="ml-[72px] p-4 md:p-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
