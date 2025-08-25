// app/funcionario/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FuncionarioProvider } from '../../contexts/FuncionarioContext';
import { HeartPulse, LogOut, OctagonAlert, FlaskConical, House } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';

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
  const router = useRouter();
  const { logout } = useAuth();

  // Igual que en Paciente: si el usuario toca ← atrás, confirmar, hacer logout y mandar a /login.
  useConfirmBackToLogin(() => { logout(); });

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="min-h-screen grid grid-cols-[64px_1fr] bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen flex flex-col items-center gap-6 py-4 border-r border-white/60 bg-white/70 backdrop-blur-md">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-current={active ? 'page' : undefined}
              className={`grid place-items-center w-10 h-10 rounded-xl transition
                          ${active ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-blue-100'}`}
            >
              <Icon size={32} color={active ? '#338CF1' : '#111827'} />
            </Link>
          );
        })}

        <div className="mt-auto">
          {/* Cerrar sesión: borra cookie en backend y vuelve a /login */}
          <button
            title="Cerrar sesión"
            onClick={async () => {
              try { await logout(); } finally {
                try { router.replace('/login'); } catch {}
                // fallback duro por si el replace se “pierde” mientras desmonta el árbol
                setTimeout(() => {
                  if (location.pathname !== '/login') window.location.assign('/login');
                }, 0);
              }
            }}
            className="grid place-items-center w-10 h-10 rounded-xl hover:bg-red-100"
          >
            <LogOut size={32} color="#ff0000ff" />
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="p-4 md:p-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
