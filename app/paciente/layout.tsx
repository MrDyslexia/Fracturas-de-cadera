'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PatientProvider } from '@/contexts/PatientContext';
import { useAuth } from '@/contexts/AuthContext';
import { House, FlaskConical, ClipboardList, Settings, LogOut } from 'lucide-react';
import React from 'react';

const navItems = [
  { href: '/paciente',          icon: House,         label: 'Resumen' },
  { href: '/paciente/ficha',    icon: ClipboardList, label: 'Ficha médica' },
  { href: '/paciente/examenes', icon: FlaskConical,  label: 'Exámenes' },
];

export default function PacienteLayout({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  // ✅ Home solo activo en coincidencia exacta
  const isActive = (href: string) => {
    if (href === '/paciente') return pathname === '/paciente';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const onLogout = async () => {
    if (!window.confirm('¿Deseas cerrar sesión y volver al login?')) return;
    await logout?.();
    router.replace('/login');
  };

  return (
    <PatientProvider>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
        <aside className="fixed left-0 top-0 h-screen w-[72px] border-r border-slate-200 bg-white/70 backdrop-blur">
          <div className="flex h-full flex-col items-center py-4 gap-3">
            <div className="mt-2 flex flex-col gap-2">
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={`group inline-flex h-12 w-12 items-center justify-center rounded-2xl transition
                    ${isActive(href)
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'bg-white hover:bg-slate-100 border border-slate-200'}`}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>

            {/* Configuración */}
            <button
              onClick={() => router.push('/paciente/configuracion')}
              title="Configuración"
              className={`mt-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 transition
                ${isActive('/paciente/configuracion') ? 'ring-2 ring-slate-900' : ''}`}
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* Cerrar sesión */}
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 transition"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </aside>

        <main className="ml-[72px]">{children}</main>
      </div>
    </PatientProvider>
  );
}
