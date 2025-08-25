'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FuncionarioProvider } from '@/contexts/FuncionarioContext';
import { House, FlaskConical, HeartPulse, OctagonAlert, Settings, LogOut } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';
import React from 'react';

const navItems = [
  { href: '/funcionario',             icon: House,        label: 'Panel del funcionario' },
  { href: '/funcionario/examenes',    icon: FlaskConical, label: 'Exámenes' },
  { href: '/funcionario/indicadores', icon: HeartPulse,   label: 'Indicadores' },
  { href: '/funcionario/alertas',     icon: OctagonAlert, label: 'Alertas' },
];

export default function FuncionarioLayout({ children }: { children: React.ReactNode }) {
  return (
    <FuncionarioProvider>
      <Shell>{children}</Shell>
    </FuncionarioProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { logout } = useAuth();

  // Confirmar si el usuario navega hacia atrás
  useConfirmBackToLogin(() => { logout(); });

  // ✅ Home solo activo en coincidencia exacta; el resto permite prefijo
  const isActive = (href: string) => {
    if (href === '/funcionario') return pathname === '/funcionario';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Sidebar con el MISMO formato que Paciente */}
      <aside className="fixed left-0 top-0 h-screen w-[72px] border-r border-slate-200 bg-white/70 backdrop-blur">
        <div className="flex h-full flex-col items-center py-4 gap-3">

          {/* Navegación principal */}
          <div className="mt-2 flex flex-col gap-2">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                title={label}
                aria-current={isActive(href) ? 'page' : undefined}
                className={`group inline-flex h-12 w-12 items-center justify-center rounded-2xl transition
                  ${isActive(href)
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-white hover:bg-slate-100 border border-slate-200'}
                `}
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </div>

          {/* Configuración (nuevo) */}
          <button
            onClick={() => router.push('/funcionario/configuracion')}
            title="Configuración"
            className={`mt-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 transition
              ${isActive('/funcionario/configuracion') ? 'ring-2 ring-slate-900' : ''}`}
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* Cerrar sesión */}
          <button
            title="Cerrar sesión"
            onClick={async () => {
              try { await logout(); } finally {
                try { router.replace('/login'); } catch {}
                setTimeout(() => { if (location.pathname !== '/login') window.location.assign('/login'); }, 0);
              }
            }}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="ml-[72px] p-4 md:p-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
