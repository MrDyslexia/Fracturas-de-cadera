// components/Login/LoginForm.tsx
'use client';

import { useState } from 'react';
import { LogIn, User, Lock, Eye, EyeOff, HelpCircle, AlertCircle } from 'lucide-react';

type Props = {
  onForgot: () => void;
  onSupport: () => void;
  onRegisterPatient: () => void;
  onSubmit: (rut: string, pass: string) => Promise<void>;
};

export default function LoginForm({ onForgot, onSupport, onRegisterPatient, onSubmit }: Props) {
  const [rut, setRut] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null); // 👈 NUEVO

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);           // 👈 limpia mensaje anterior
    setLoading(true);
    try {
      await onSubmit(rut, pass);
    } catch (e: any) {
      // 👇 muestra exactamente lo que lanzó AuthContext (viene del back)
      setErr(e?.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Iniciar Sesión</h2>
        <p className="text-blue-700">Ingresa tus credenciales para continuar</p>
      </div>

      {/* Help box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 shadow-md">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            ¿Tienes problemas para ingresar?
            <div className="font-semibold text-blue-900">
              Revisa tu RUT y contraseña o{' '}
              <button type="button" onClick={onSupport} className="underline hover:no-underline">
                contáctanos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {err && (
        <div
          className="mb-4 flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <span>{err}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handle} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">RUT</label>
          <div className="relative">
            <User className="h-5 w-5 text-blue-500 absolute left-3 top-3" />
            <input
              inputMode="text"
              autoComplete="username"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              className="text-blue-600 w-full pl-10 pr-4 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500"
              placeholder="12.345.678-9"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">Contraseña</label>
          <div className="relative">
            <Lock className="h-5 w-5 text-blue-500 absolute left-3 top-3" />
            <input
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="text-blue-600 w-full pl-10 pr-12 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-3 text-blue-500"
              aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={onForgot}
            className="text-sm text-blue-700 hover:text-blue-900 font-medium"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg disabled:opacity-60"
        >
          <LogIn className="w-5 h-5" />
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-blue-700">
        ¿Eres paciente nuevo?{' '}
        <button onClick={onRegisterPatient} className="font-semibold underline underline-offset-4">
          Regístrate
        </button>
      </div>
    </>
  );
}
