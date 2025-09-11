'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import PacienteSelectorModal from '@/components/Funcionario/PacienteSelectorModal';
import { Paciente } from '@/types/interfaces';

type Ctx = {
  pacientes: Paciente[];
  query: string;
  setQuery: (v: string) => void;
  filtrados: Paciente[];
  seleccionado?: Paciente;
  setSeleccionado: (p?: Paciente) => void;
};

const FuncionarioCtx = createContext<Ctx | null>(null);

const MOCK: Paciente[] = [
  { rut: '12.345.678-9', nombres: 'Juan A. Olivares', ApellidoPaterno: 'Olivares', ApellidoMaterno: 'Alvarez' },
  { rut: '13.345.678-4', nombres: 'Maria Angelica C.', ApellidoPaterno: 'Cereceda', ApellidoMaterno: 'Castillo' },
  { rut: '14.345.678-5', nombres: 'Paola A. Cereceda', ApellidoPaterno: 'Cereceda', ApellidoMaterno: 'Araya' },
  { rut: '17.345.678-6', nombres: 'Lorenzo A. López', ApellidoPaterno: 'López', ApellidoMaterno: 'Alvarez' },
  { rut: '4.345.678-9',  nombres: 'Maria Angelica C.', ApellidoPaterno: 'Cereceda', ApellidoMaterno: 'Castillo' },
  { rut: '5.345.678-9',  nombres: 'Maria Angelica C.', ApellidoPaterno: 'Cereceda', ApellidoMaterno: 'Castillo' },
  { rut: '6.345.678-9',  nombres: 'Maria Angelica C.', ApellidoPaterno: 'Cereceda', ApellidoMaterno: 'Castillo' },
];

export function FuncionarioProvider({ children }: { readonly children: React.ReactNode }) {
  const [pacientes] = useState<Paciente[]>(MOCK);
  const [query, setQuery] = useState('');
  const [seleccionado, setSeleccionado] = useState<Paciente | undefined>();

  const filtrados = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return pacientes;
    return pacientes.filter(
      p => p.rut.toLowerCase().includes(s) || p.nombres.toLowerCase().includes(s)
    );
  }, [query, pacientes]);

  const value = useMemo(
    () => ({
      pacientes,
      query,
      setQuery,
      filtrados,
      seleccionado,
      setSeleccionado,
    }),
    [pacientes, query, setQuery, filtrados, seleccionado, setSeleccionado]
  );
  return (
    <FuncionarioCtx.Provider value={value}>
      {!seleccionado ? (
        <PacienteSelectorModal />
      ) : (
      children
      )}
    </FuncionarioCtx.Provider>
  );
}

export const useFuncionario = () => {
  const ctx = useContext(FuncionarioCtx);
  if (!ctx) throw new Error('useFuncionario debe usarse dentro de FuncionarioProvider');
  return ctx;
};
