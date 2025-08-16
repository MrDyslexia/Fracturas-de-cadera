'use client';

import { useState, useMemo } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ArrowLeft, UserPlus, User, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

// --- Validación RUT (igual que el back) ---
function isValidRut(rutRaw: string) {
  if (!rutRaw) return false;
  const rut = rutRaw.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(rut)) return false;
  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);
  let suma = 0, mult = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === dvEsperado;
}

export default function PatientRegister({ onBack }: { onBack: () => void }) {
  const [rut, setRut] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [correo, setCorreo] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState(''); // confirmación
  const [sexo, setSexo] = useState<'M' | 'F' | 'O' | ''>(''); 
  const [fechaNac, setFechaNac] = useState('');

  const [showPass, setShowPass] = useState(false); // 👈 AQUÍ VA

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const passOk = useMemo(
    () => pass.length >= 8 && /[A-Z]/.test(pass) && /\d/.test(pass),
    [pass]
  );

  const passMatch = useMemo(() => pass && pass2 && pass === pass2, [pass, pass2]);

  const fechaOk = useMemo(() => {
    if (!fechaNac) return false;
    const d = new Date(fechaNac + 'T00:00:00');
    const today = new Date();
    return !Number.isNaN(d.getTime()) && d <= today; // no permite futuro
  }, [fechaNac]);

  const rutOk = useMemo(() => (rut ? isValidRut(rut) : false), [rut]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (!rutOk) {
      setErr('RUT inválido.');
      return;
    }
    if (!passOk) {
      setErr('La contraseña debe tener al menos 8 caracteres, 1 mayúscula y 1 número.');
      return;
    }
    if (!passMatch) {
      setErr('Las contraseñas no coinciden.');
      return;
    }
    if (!fechaOk) {
      setErr('Fecha de nacimiento inválida.');
      return;
    }
    if (!sexo) {
      setErr('Selecciona el sexo.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rut: rut.trim(),
          nombres: nombres.trim(),
          apellido_paterno: apellidoPaterno.trim(),
          apellido_materno: apellidoMaterno.trim(),
          correo: correo.trim().toLowerCase(),
          password: pass,
          sexo,                         // 'M' | 'F' | 'O'
          fecha_nacimiento: fechaNac,   // 'YYYY-MM-DD'
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'No se pudo registrar');

      // ✅ IMPORTANTE: ahora pedimos verificación de correo
      setOk('Cuenta creada. Te enviamos un correo para activar tu cuenta. Revisa tu bandeja (y spam).');
      // Redirige al login al ratito
      setTimeout(() => onBack(), 5000);
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
          {!!rut && !rutOk && <p className="text-xs mt-1 text-blue-700">RUT no válido.</p>}
        </div>

        {/* Nombres */}
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

        {/* Apellidos */}
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

        {/* Sexo */}
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">Sexo</label>
          <select
            value={sexo}
            onChange={(e) => setSexo(e.target.value as 'M' | 'F' | 'O' | '')}
            className="text-blue-600 w-full px-3 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 bg-white"
            required
          >
            <option value="" disabled>Selecciona…</option>
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
            <option value="O">Otro / Prefiere no decir</option>
          </select>
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">Fecha de nacimiento</label>
          <input
            type="date"
            value={fechaNac}
            onChange={(e) => setFechaNac(e.target.value)}
            className="text-blue-600 w-full px-3 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500"
            required
          />
          {!fechaOk && fechaNac && (
            <p className="text-xs mt-1 text-blue-700">Revisa la fecha ingresada.</p>
          )}
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">Contraseña</label>
          <div className="relative">
            <Lock className="h-5 w-5 text-blue-500 absolute left-3 top-3" />
            <input
              type={showPass ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="********"
              className="text-blue-600 w-full pl-10 pr-12 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500"
              required
            />
            {/* Botón para mostrar/ocultar */}
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-3 text-blue-500"
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <p className={`text-xs mt-1 ${passOk ? 'text-green-700' : 'text-blue-700'}`}>
            Mínimo 8 caracteres, al menos 1 mayúscula y 1 número.
          </p>
        </div>



        {/* Confirmación de contraseña */}
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">Confirmar contraseña</label>
          <input
            type="password"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            placeholder="********"
            className="text-blue-600 w-full px-3 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500"
            required
          />
          {!!pass2 && !passMatch && (
            <p className="text-xs mt-1 text-blue-700">Las contraseñas no coinciden.</p>
          )}
        </div>

        {/* Mensajes */}
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
          disabled={
            loading ||
            !nombres ||
            !apellidoPaterno ||
            !apellidoMaterno ||
            !correo ||
            !rutOk ||
            !passOk ||
            !passMatch ||
            !fechaOk ||
            !sexo
          }
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
