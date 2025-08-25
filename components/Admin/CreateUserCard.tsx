'use client';

import { useMemo, useState } from 'react';
import { useAdminUsers } from '../../contexts/AdminUsersContext';
import { Check, Loader2, Plus, UserPlus } from 'lucide-react';
import { normEmail, strongPwd, isValidRutCl } from '../..//utils/rut';

type Cargo = 'TECNOLOGO' | 'MEDICO' | 'INVESTIGADOR' | 'FUNCIONARIO' ;

export function CreateUserCard() {
  const { createUser, loading } = useAdminUsers();
  const [rut, setRut] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sexo, setSexo] = useState<'M'|'F'|'O'|''>('');
  const [fechaNac, setFechaNac] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<{type: 'ok' | 'err' | ''; msg: string}>({ type: '', msg: '' });

  // Profesional
  const [cargo, setCargo] = useState<Cargo>('TECNOLOGO');
  const [rutProfesional, setRutProfesional] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [hospital, setHospital] = useState('');
  const [departamento, setDepartamento] = useState('');

  const puedeCrear = useMemo(() => {
    const okBase =
      isValidRutCl(rut) &&
      nombres.trim().length >= 2 &&
      apellidoPaterno.trim().length >= 2 &&
      apellidoMaterno.trim().length >= 2 &&
      /^\S+@\S+\.\S+$/.test(normEmail(correo)) &&
      strongPwd(password);

    const requiereRP = cargo !== 'FUNCIONARIO';
    const okProf = requiereRP ? isValidRutCl(rutProfesional) : true;

    return okBase && okProf;
  }, [rut, nombres, apellidoPaterno, apellidoMaterno, correo, password, cargo, rutProfesional]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeCrear) return;

    setStatus({ type: '', msg: '' });

    try {
      const resp = await createUser({
        user: {
          rut, nombres,
          apellido_paterno: apellidoPaterno,
          apellido_materno: apellidoMaterno,
          correo, password,
          telefono, sexo,
          fecha_nacimiento: fechaNac || undefined,
        },
        profile: {
          rut_profesional: rutProfesional,
          cargo,
          especialidad: especialidad || null,
          hospital: hospital || null,
          departamento: departamento || null,
        }
      });

      if ((resp as any)?.error) {
        throw new Error((resp as any).error);
      }

      setStatus({
        type: 'ok',
        msg: `Usuario "${nombres} ${apellidoPaterno}" creado correctamente. Contraseña temporal: ${password}`
      });

      setRut(''); setNombres(''); setApellidoPaterno(''); setApellidoMaterno('');
      setCorreo(''); setTelefono(''); setSexo(''); setFechaNac(''); setPassword('');
      setCargo('TECNOLOGO'); setRutProfesional(''); setEspecialidad(''); setHospital(''); setDepartamento('');
    } catch (err: any) {
      setStatus({
        type: 'err',
        msg: err?.message || 'No se pudo crear el usuario'
      });
    }
  }

  // arriba (opcional): deja configurable el prefijo
  const PWD_PREFIX = process.env.NEXT_PUBLIC_DEFAULT_PWD_PREFIX ?? 'ABCD';

  // Funcion
  function validarRut(rut: string): boolean {
    return isValidRutCl(rut);
  }

  function handleRutChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputRut = e.target.value;
    setRut(inputRut);

    if (validarRut(inputRut)) {
      // Deriva la contraseña ABCDXXXX (XXXX = últimos 4 del cuerpo sin DV)
      const clean   = inputRut.replace(/\./g, '').replace(/-/g, '').toUpperCase(); // "12345678K"
      const cuerpo  = clean.slice(0, -1);                                          // "12345678"
      const last4   = cuerpo.slice(-4).padStart(4, '0');                           // "5678"
      const pwd     = `${PWD_PREFIX}${last4}`;                                     // "ABCD5678"
      setPassword(pwd);
    } else {
      setPassword('');
    }
  }

  return (
    <section className="create-user-card bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          <h2 className="font-semibold">Crear nuevo usuario</h2>
        </div>
      </div>

      {/* Alertas */}
      {status.type === 'ok' && (
        <div className="mx-5 mt-4 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 px-4 py-2">
          {status.msg}
        </div>
      )}
      {status.type === 'err' && (
        <div className="mx-5 mt-4 rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-2">
          {status.msg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identidad */}
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-sm font-semibold text-neutral-800">Datos de identidad</h3>
        </div>

        <input className="fc-input" placeholder="RUT nacional (12.345.678-9)"
               value={rut} onChange={(e)=>{handleRutChange(e)}} />
        <input className="fc-input" placeholder="Correo"
               value={correo} onChange={e=>setCorreo(e.target.value)} />

        <input className="fc-input" placeholder="Nombres"
               value={nombres} onChange={e=>setNombres(e.target.value)} />
        <input className="fc-input" placeholder="Apellido paterno"
               value={apellidoPaterno} onChange={e=>setApellidoPaterno(e.target.value)} />

        <input className="fc-input" placeholder="Apellido materno"
               value={apellidoMaterno} onChange={e=>setApellidoMaterno(e.target.value)} />

        <div className="flex gap-3">
          <select className="fc-input" value={sexo} onChange={e=>setSexo(e.target.value as any)}>
            <option value="">Sexo</option>
            <option value="M">M</option>
            <option value="F">F</option>
            <option value="O">Otro</option>
          </select>
          <input className="fc-input" type="date" value={fechaNac}
                 onChange={e=>setFechaNac(e.target.value)} />
        </div>

        <input className="fc-input" placeholder="Teléfono (opcional)"
               value={telefono} onChange={e=>setTelefono(e.target.value)} />
        <input className="fc-input" placeholder="Contraseña"
               value={password} disabled/>

        {/* Profesional */}
        <div className="col-span-1 md:col-span-2 mt-2">
          <h3 className="text-sm font-semibold text-neutral-800">Perfil profesional</h3>
        </div>

        <select className="fc-input" value={cargo} onChange={e=>setCargo(e.target.value as any)}>
          <option value="TECNOLOGO">Tecnólogo(a) Médico</option>
          <option value="MEDICO">Médico(a)</option>
          <option value="INVESTIGADOR">Investigador(a)</option>
          <option value="FUNCIONARIO">Funcionario(a)</option>
        </select>

        <input className="fc-input" placeholder="RUT profesional (12.345.678-9)"
               value={rutProfesional} onChange={e=>setRutProfesional(e.target.value)} />

        <input className="fc-input" placeholder="Especialidad (opcional)"
               value={especialidad} onChange={e=>setEspecialidad(e.target.value)} />
        <input className="fc-input" placeholder="Hospital (opcional)"
               value={hospital} onChange={e=>setHospital(e.target.value)} />
        <input className="fc-input" placeholder="Departamento (opcional)"
               value={departamento} onChange={e=>setDepartamento(e.target.value)} />

        <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={!puedeCrear || loading}
            className="fc-btn-primary inline-flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Crear usuario
          </button>
          {puedeCrear && !loading && <Check className="h-5 w-5 text-emerald-600" />}
        </div>
      </form>
    </section>
  );
}

declare global {
  interface HTMLElementTagNameMap {}
}
