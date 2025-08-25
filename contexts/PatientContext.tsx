'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

export type PacienteHeader = {
  user_id: number;
  rut: string;
  nombre_completo: string;
  sexo?: 'M'|'F'|'O';
  fecha_nacimiento?: string;
  tipo_sangre?: string | null;
  altura?: number | null;
  edad?: number | null;
};


export type Examen = {
  id: string | number;
  tipo: string;
  solicitado_por: string;
  especialidad: string;
  fecha_solicitud: string;
  tomado_por?: string;
  fecha_toma?: string;
  icon?: 'lab'|'ray'|'trauma'|'otros';
};

type PatientContextType = {
  loading: boolean;
  error?: string | null;
  paciente?: PacienteHeader | null;
  examenes: Examen[];         
  refresh: () => Promise<void>;
};

const PatientContext = createContext<PatientContextType>({
  loading: true,
  paciente: null,
  error: null,
  examenes: [],                
  refresh: async () => {},
});

export const usePatient = () => useContext(PatientContext);

function ageFromISO(d?: string | null) {
  if (!d) return null;
  const dob = new Date(d);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--;
  return years;
}

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paciente, setPaciente] = useState<PacienteHeader | null>(null);
  const [examenes, setExamenes] = useState<Examen[]>([]); 

  const headers = useMemo(() => ({ 'Content-Type': 'application/json' }), []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {

      let userId: number | null = (authUser as any)?.id ?? null;
      if (!userId) {
        const rMe = await fetch(`${API_BASE}/perfil`, { credentials: 'include' });
        if (!rMe.ok) throw new Error(`Perfil HTTP ${rMe.status}`);
        const jMe = await rMe.json();
        userId = jMe?.me?.id ?? jMe?.user?.id ?? null;
      }
      if (!userId) throw new Error('No se pudo resolver el id del usuario autenticado');


      const rUser = await fetch(`${API_BASE}/users/${userId}`, { headers, credentials: 'include' });
      if (!rUser.ok) throw new Error(`Usuario HTTP ${rUser.status}`);
      const u = await rUser.json();

     
      let p: any = null;
      const rPac = await fetch(`${API_BASE}/pacientes/${userId}`, { headers, credentials: 'include' });
      if (rPac.status === 200) p = await rPac.json();
      else if (rPac.status !== 404) throw new Error(`Paciente HTTP ${rPac.status}`);

      const nombre_completo =
        u?.nombre ??
        [u?.nombres, u?.apellido_paterno, u?.apellido_materno].filter(Boolean).join(' ') ??
        'Paciente';

      const header: PacienteHeader = {
        user_id: Number(userId),
        rut: String(u?.rut ?? ''),
        nombre_completo,
        sexo: (u?.sexo as any) ?? undefined,
        fecha_nacimiento: u?.fecha_nacimiento ?? undefined,
        tipo_sangre: p?.tipo_sangre ?? null,
        altura: typeof p?.altura === 'number' ? p.altura : p?.altura ? Number(p.altura) : null,
        edad: p?.edad ?? ageFromISO(u?.fecha_nacimiento),
      };

      setPaciente(header);

      setExamenes([]); 
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar datos del paciente');
      setPaciente(null);
      setExamenes([]);
    } finally {
      setLoading(false);
    }
  }, [authUser, headers]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <PatientContext.Provider value={{ loading, error, paciente, examenes, refresh: fetchAll }}>
      {children}
    </PatientContext.Provider>
  );
};
