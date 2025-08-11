'use client';

import { useState } from 'react';
import { ArrowLeft, UserPlus, User, Mail, Lock } from 'lucide-react';

export default function PatientRegister({ onBack }: { onBack: () => void }) {
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // TODO: conectar backend
    alert(`Paciente registrado: ${nombre} (${rut})`);
    setLoading(false);
    onBack();
  };

  return (
    <div className="max-w-md mx-auto w-full">
      {/* Volver */}
      <button
        onClick={onBack}
        className="group inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
        Volver al login
      </button>

      {/* Título */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-blue-900">Registro de Paciente</h2>
      </div>

      {/* Card */}
      <form
        onSubmit={submit}
        className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/60 space-y-4"
      >
        {/* RUT */}
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
              required
            />
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">Nombre completo</label>
          <div className="relative">
            <User className="h-5 w-5 text-blue-500 absolute left-3 top-3" />
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre y apellidos"
              className="text-blue-600 w-full pl-10 pr-12 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Correo */}
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

        {/* Contraseña */}
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
        </div>

        {/* Botón */}
        <button
          disabled={loading}
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
