'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
// 👇 importa tus componentes del folder components/Login
import { LoginForm, ForgotPassword, ContactSupport, PatientRegister } from '@/components/Login';

type Mode = 'login' | 'forgot' | 'support' | 'register';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const router = useRouter();
  const { login } = useAuth();

  // misma lógica de login que ya tenías
  const onSubmit = async (rut: string, password: string) => {
    const u = await login(rut, password);
    const target =
      u.role === 'admin' ? '/admin' :
      u.role === 'investigador' ? '/investigador' :
      u.role === 'tecnologo' ? '/tech' :
      u.role === 'paciente' ? '/paciente' : '/funcionario';
    router.replace(target);
  };

  return (
    <div className="flex min-h-screen overflow-hidden relative">
      {/* Fondo de imagen fijo (igual que antes) */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/hospital-real.webp"
          alt="Hospital moderno"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-blue-700/0 to-transparent flex items-start justify-start pt-32">
          <div className="text-start text-white px-8 drop-shadow-xl ml-10 animate-fade-in-slide animation-delay-[0.4s]">
            <h1 className="text-5xl font-bold mb-4">PORTAL FRACTURA DE CADERA</h1>
            <p className="text-2xl opacity-90">
              Acceso a módulos clínicos y de gestión para el monitoreo de fracturas de caderas
            </p>
          </div>
        </div>
      </div>

      {/* Panel derecho (mismo estilo) */}
      <div className="w-full lg:w-1/3 ml-auto bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex flex-col justify-center px-8 lg:px-16 py-12 relative z-10 min-h-screen shadow-2xl animate-fade-in-slide animation-delay-[0.2s] rounded-lg">
        {/* Burbujas */}
        <div className="absolute top-10 left-10 w-48 h-48 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full opacity-20 animate-float-pulse animation-delay-[0.5s] z-0" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-tl from-blue-200 to-blue-400 rounded-full opacity-20 animate-float-pulse animation-delay-[1s] z-0" />
        <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-gradient-to-tr from-blue-100 to-blue-300 rounded-full opacity-20 animate-float-pulse animation-delay-[1.5s] z-0" />

        {/* 👇 Aquí va el contenido que cambia según el modo */}
        <div className="max-w-md mx-auto w-full z-10">
          {mode === 'login' && (
            <LoginForm
              onForgot={() => setMode('forgot')}
              onSupport={() => setMode('support')}
              onRegisterPatient={() => setMode('register')}
              onSubmit={onSubmit}
            />
          )}

          {mode === 'forgot' && <ForgotPassword onBack={() => setMode('login')} />}
          {mode === 'support' && <ContactSupport onBack={() => setMode('login')} />}
          {mode === 'register' && <PatientRegister onBack={() => setMode('login')} />}

          {/* Footer fijo */}
          {mode === 'login' && (
          <div className="mt-8 text-center animate-fade-in-slide animation-delay-[1.8s]">
            <p className="text-sm text-blue-600">Inicia sesión para acceder a tu perfil.</p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
