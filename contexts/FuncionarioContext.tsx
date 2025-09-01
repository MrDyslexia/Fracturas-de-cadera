'use client';

import { createContext, useContext, useMemo, useState } from 'react';

export type Paciente = { rut: string; nombre: string };

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
  { rut: '12.345.678-9', nombre: 'Juan A. Olivares' },
  { rut: '13.345.678-4', nombre: 'Maria Angelica C.' },
  { rut: '14.345.678-5', nombre: 'Paola A. Cereceda' },
  { rut: '17.345.678-6', nombre: 'Lorenzo A. López' },
  { rut: '4.345.678-9',  nombre: 'Maria Angelica C.' },
  { rut: '5.345.678-9',  nombre: 'Maria Angelica C.' },
  { rut: '6.345.678-9',  nombre: 'Maria Angelica C.' },
];

export function FuncionarioProvider({ children }: { readonly children: React.ReactNode }) {
  const [pacientes] = useState<Paciente[]>(MOCK);
  const [query, setQuery] = useState('');
  const [seleccionado, setSeleccionado] = useState<Paciente | undefined>();

  const filtrados = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return pacientes;
    return pacientes.filter(
      p => p.rut.toLowerCase().includes(s) || p.nombre.toLowerCase().includes(s)
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
      {children}
    </FuncionarioCtx.Provider>
  );
}

export const useFuncionario = () => {
  const ctx = useContext(FuncionarioCtx);
  if (!ctx) throw new Error('useFuncionario debe usarse dentro de FuncionarioProvider');
  return ctx;
};
