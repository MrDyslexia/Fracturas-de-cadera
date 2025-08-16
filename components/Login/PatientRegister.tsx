'use client';

import { useState, useMemo } from 'react';
import { ArrowLeft, UserPlus, User, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

export default function PatientRegister({ onBack }: { onBack: () => void }) {
  const [rut, setRut] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [correo, setCorreo] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const passOk = useMemo(
    () => pass.length >= 8 && /[A-Z]/.test(pass) && /\d/.test(pass),
    [pass]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    if (!passOk) {
      setErr('La contraseña debe tener al menos 8 caracteres, 1 mayúscula y 1 número.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rut: rut.trim() || null,
          nombres: nombres.trim(),
          apellido_paterno: apellidoPaterno.trim(),
          apellido_materno: apellidoMaterno.trim(),
          correo: correo.trim().toLowerCase(),
          password: pass,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'No se pudo registrar');

      setOk('Cuenta creada. Ahora puedes iniciar sesión.');
      setTimeout(() => onBack(), 900);
    } catch (e: any) {
      setErr(e?.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <button onClick={onBack} className="group inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-6" type="button">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
        Volver al login
      </button>

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-blue-900">Registro de Paciente</h2>
      </div>

      <form onSubmit={submit} className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/60 space-y-4">
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">RUT</label>
          <div className="relative">
            <User className="h-5 w-5 text-blue-500 absolute left-3 top-3" />
            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="12.345.678-9"
              className="text-blue-600 w-full pl-10 pr-12 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">Nombre</label>
          <input
            type="text"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            placeholder="Nombres"
            className="text-blue-600 w-full px-3 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">Apellido paterno</label>
          <input
            type="text"
            value={apellidoPaterno}
            onChange={(e) => setApellidoPaterno(e.target.value)}
            placeholder="Apellido paterno"
            className="text-blue-600 w-full px-3 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">Apellido materno</label>
          <input
            type="text"
            value={apellidoMaterno}
            onChange={(e) => setApellidoMaterno(e.target.value)}
            placeholder="Apellido materno"
            className="text-blue-600 w-full px-3 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">Correo</label>
          <div className="relative">
            <Mail className="h-5 w-5 text-blue-500 absolute left-3 top-3" />
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="correo@ejemplo.cl"
              className="text-blue-600 w-full pl-10 pr-12 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">Contraseña</label>
          <div className="relative">
            <Lock className="h-5 w-5 text-blue-500 absolute left-3 top-3" />
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="********"
              className="text-blue-600 w-full pl-10 pr-12 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <p className={`text-xs mt-1 ${passOk ? 'text-green-700' : 'text-blue-700'}`}>
            Mínimo 8 caracteres, al menos 1 mayúscula y 1 número.
          </p>
        </div>

        {err && (
          <div className="flex items-start gap-2 text-red-700 text-sm bg-red-50 border border-red-200 rounded-md p-2">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>{err}</span>
          </div>
        )}
        {ok && (
          <div className="flex items-start gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-md p-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5" />
            <span>{ok}</span>
          </div>
        )}

        <button
          disabled={loading || !nombres || !apellidoPaterno || !apellidoMaterno || !correo || !passOk}
          className="w-full bg-blue-600 text-white font-semibold rounded-lg py-3 shadow-lg
                     transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-md
                     disabled:opacity-60"
        >
          {loading ? 'Registrando…' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
}
