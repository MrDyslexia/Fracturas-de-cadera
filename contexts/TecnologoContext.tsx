// contexts/TecnologoContext.tsx
'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

export type PacienteLite = {
  user_id: number;
  rut: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  nombre_completo?: string;
  sexo?: 'M' | 'F' | 'O';
  fecha_nacimiento?: string | null;
};

type SearchItem = {
  user_id: number;
  rut: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
};

type TecnologoContextType = {
  loading: boolean;
  error: string | null;

  searching: boolean;
  results: SearchItem[];
  searchPacientes: (q: string) => Promise<void>;
  clearResults: () => void;

  paciente?: PacienteLite | null;
  loadPaciente: (user_id: number) => Promise<void>;
};

const TecnologoContext = createContext<TecnologoContextType>({
  loading: false,
  error: null,
  searching: false,
  results: [],
  searchPacientes: async () => {},
  clearResults: () => {},
  paciente: null,
  loadPaciente: async () => {},
});

export const useTecnologo = () => useContext(TecnologoContext);

function nombreCompleto(u: any) {
  if (u?.nombre_completo) return u.nombre_completo;
  const parts = [u?.nombres, u?.apellido_paterno, u?.apellido_materno].filter(Boolean);
  return parts.length ? parts.join(' ') : 'Paciente';
}

export const TecnologoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [paciente, setPaciente] = useState<PacienteLite | null>(null);

  const searchPacientes = useCallback(async (q: string) => {
    if (!q || !q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/pacientes/search?q=${encodeURIComponent(q)}&limit=6`, { credentials: 'include' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setResults(Array.isArray(j?.items) ? j.items : []);
    } catch (err: any) {
      setError('Error al buscar pacientes');
    } finally {
      setSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => setResults([]), []);

  const loadPaciente = useCallback(async (user_id: number) => {
    setLoading(true);
    setError(null);
    try {
      const ru = await fetch(`${API_BASE}/users/${user_id}`, { credentials: 'include' });
      if (!ru.ok) throw new Error(`Usuario HTTP ${ru.status}`);
      const u = await ru.json();

      const rp = await fetch(`${API_BASE}/pacientes/${user_id}`, { credentials: 'include' });
      let p: any = null;
      if (rp.status === 200) p = await rp.json();
      else if (rp.status !== 404) throw new Error(`Paciente HTTP ${rp.status}`);

      const pac: PacienteLite = {
        user_id,
        rut: String(u?.rut ?? ''),
        nombres: u?.nombres,
        apellido_paterno: u?.apellido_paterno,
        apellido_materno: u?.apellido_materno,
        nombre_completo: nombreCompleto(u),
        sexo: u?.sexo ?? undefined,
        fecha_nacimiento: u?.fecha_nacimiento ?? null,
      };
      setPaciente(pac);
    } catch (err: any) {
      setError('Error al cargar paciente');
      setPaciente(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: TecnologoContextType = useMemo(
    () => ({ loading, error, searching, results, searchPacientes, clearResults, paciente, loadPaciente }),
    [loading, error, searching, results, searchPacientes, clearResults, paciente, loadPaciente]
  );

  return <TecnologoContext.Provider value={value}>{children}</TecnologoContext.Provider>;
};
