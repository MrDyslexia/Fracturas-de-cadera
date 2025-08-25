'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '../../components/RoleGuard';

import PACIENTES, { Paciente } from '../../data/pacientes';
import { norm } from '../../utils/text';

import PacienteSearch from '../../components/Funcionario/PacienteSearch';
import PacienteTable  from '../../components/Funcionario/PacienteTable';


export default function FuncionarioHome() {
  const router = useRouter();

  const [rutInput, setRutInput] = useState('');
  const [q, setQ] = useState('');

  const irAPerfil = (rut: string) =>
    router.push(`/funcionario/paciente/${encodeURIComponent(rut)}`);


  // filtro de la tabla a partir de q
  const filtrados = useMemo<Paciente[]>(() => {
    const s = norm(q.trim());
    if (!s) return PACIENTES;
    return PACIENTES.filter((p) => {
      const full = `${p.rut} ${p.nombres} ${p.ApellidoPaterno} ${p.ApellidoMaterno}`;
      return norm(full).includes(s);
    });
  }, [q]);

  const recientes = ['12.345.678-9', '13.345.678-4', '14.345.678-5'];

  return (
    <RoleGuard allow={['funcionario']}>
      <div className="px-6 py-6 w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-blue-900 mb-6">
          Panel del Funcionario
        </h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-[360px,1fr] gap-12 items-start z-2 bg-trasparent">
          <PacienteSearch
            value={rutInput}
            onChange={setRutInput}
            onOpen={irAPerfil}
            recientes={recientes}
          />

          <PacienteTable
            pacientes={filtrados}
            q={q}
            onQChange={setQ}
            onVerPerfil={irAPerfil}
          />
        </div>

      </div>
    </RoleGuard>
  );
}
