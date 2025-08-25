'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { isValidRutCl } from '../utils/rut';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

export type User = {
  id: number;
  rut: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  telefono?: string;
  sexo?: 'M'|'F'|'O';
  fecha_nacimiento?: string;
  email_verified?: boolean;
  profile?: {
    id?: number;
    rut_profesional?: string;
    cargo?: 'TECNOLOGO'|'MEDICO'|'INVESTIGADOR'|'FUNCIONARIO';
    especialidad?: string | null;
    hospital?: string | null;
    departamento?: string | null;
    activo?: boolean;
  } | null;
};

type CreateUserPayload = {
  user: {
    rut: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    correo: string;
    password: string;
    telefono?: string;
    sexo?: 'M'|'F'|'O'|'';
    fecha_nacimiento?: string;
  };
  profile: {
    rut_profesional: string;
    cargo: 'TECNOLOGO'|'MEDICO'|'INVESTIGADOR'|'FUNCIONARIO';
    especialidad?: string | null;
    hospital?: string | null;
    departamento?: string | null;
  };
};

type Ctx = {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (p: CreateUserPayload) => Promise<any>;
  addRole: (userId: number, role: string) => Promise<any>;
  removeRole: (userId: number, role: string) => Promise<void>;
  updateProfile: (userId: number, partial: Partial<User['profile']>) => Promise<any>;
};

const AdminUsersCtx = createContext<Ctx | null>(null);

/** Intenta obtener token desde localStorage (ajusta la key si usas otra) */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('access_token')
  );
}

async function parseJsonSafe(res: Response) {
  try { return await res.json(); } catch { return null; }
}

export function AdminUsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const headers: Record<string,string> = {};
      const t = getAuthToken();
      if (t) headers['Authorization'] = `Bearer ${t}`;

      const r = await fetch(`${API_BASE}/admin/users`, {
        credentials: 'include',
        headers,
      });

      const data = await parseJsonSafe(r);
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);

      setUsers(data?.users ?? data);
    } catch (e: any) {
      setErr(e?.message || 'No se pudieron obtener los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (p: CreateUserPayload) => {
    // validaciones defensivas mínimas
    if (!isValidRutCl(p.user.rut)) throw new Error('RUT nacional inválido');
    if (p.profile.cargo !== 'FUNCIONARIO' && !isValidRutCl(p.profile.rut_profesional || '')) {
      throw new Error('RUT profesional inválido');
    }

    setLoading(true); setErr(null);
    try {
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      const t = getAuthToken();
      if (t) headers['Authorization'] = `Bearer ${t}`;

      const r = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(p),
      });

      const data = await parseJsonSafe(r);
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);

      // refresca lista
      await fetchUsers();
      return data; // <<-- permite a la UI mostrar mensaje de éxito
    } catch (e: any) {
      setErr(e?.message || 'No se pudo crear el usuario (revisa duplicados de correo/RUT).');
      throw e; // <<-- deja que el componente capture y muestre alerta
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const addRole = useCallback(async (userId: number, role: string) => {
    setLoading(true); setErr(null);
    try {
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      const t = getAuthToken();
      if (t) headers['Authorization'] = `Bearer ${t}`;

      const r = await fetch(`${API_BASE}/admin/users/${userId}/roles`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ role }),
      });

      const data = await parseJsonSafe(r);
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);

      await fetchUsers();
      return data;
    } catch (e: any) {
      setErr(e?.message || 'No se pudo asignar el rol.');
      throw e;
    } finally { setLoading(false); }
  }, [fetchUsers]);

  const removeRole = useCallback(async (userId: number, role: string) => {
    setLoading(true); setErr(null);
    try {
      const headers: Record<string,string> = {};
      const t = getAuthToken();
      if (t) headers['Authorization'] = `Bearer ${t}`;

      const r = await fetch(`${API_BASE}/admin/users/${userId}/roles/${encodeURIComponent(role)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });

      if (!r.ok) {
        const data = await parseJsonSafe(r);
        throw new Error(data?.error || `HTTP ${r.status}`);
      }

      await fetchUsers();
    } catch (e: any) {
      setErr(e?.message || 'No se pudo quitar el rol.');
      throw e;
    } finally { setLoading(false); }
  }, [fetchUsers]);

  const updateProfile = useCallback(async (userId: number, partial: Partial<User['profile']>) => {
    setLoading(true); setErr(null);
    try {
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      const t = getAuthToken();
      if (t) headers['Authorization'] = `bearer ${t}`;

      // Ajusta el endpoint si tu backend usa otro:
      const r = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: JSON.stringify({ profile: partial }),
      });

      const data = await parseJsonSafe(r);
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);

      await fetchUsers();
      return data;
    } catch (e: any) {
      setErr(e?.message || 'No se pudo actualizar el perfil.');
      throw e;
    } finally { setLoading(false); }
  }, [fetchUsers]);

  const value = useMemo<Ctx>(() => ({
    users, loading, error,
    fetchUsers, createUser, addRole, removeRole, updateProfile
  }), [users, loading, error, fetchUsers, createUser, addRole, removeRole, updateProfile]);

  return <AdminUsersCtx.Provider value={value}>{children}</AdminUsersCtx.Provider>;
}

export function useAdminUsers() {
  const ctx = useContext(AdminUsersCtx);
  if (!ctx) throw new Error('useAdminUsers debe usarse dentro de AdminUsersProvider');
  return ctx;
}
