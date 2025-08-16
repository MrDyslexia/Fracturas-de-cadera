'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { isValidRutCl, normEmail } from '../utils/rut';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

export type User = {
  id: number;
  rut: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  telefono?: string | null;
  sexo?: 'M'|'F'|'O'|null;
  fecha_nacimiento?: string | null;
  email_verified?: boolean;
  profile?: {
    id?: number;
    rut_profesional?: string | null;
    cargo?: 'TECNOLOGO'|'MEDICO'|'INVESTIGADOR'|'FUNCIONARIO'|null;
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
    rut_profesional: string | null;
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
  createUser: (p: CreateUserPayload) => Promise<void>;
  addRole: (userId: number, role: string) => Promise<void>;
  removeRole: (userId: number, role: string) => Promise<void>;
  updateProfile: (userId: number, partial: Partial<User['profile']>) => Promise<void>;
};

const AdminUsersCtx = createContext<Ctx | null>(null);

export function AdminUsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const r = await fetch(`${API_BASE}/admin/users`, { credentials: 'include' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setUsers(data?.users ?? data); // compatible con ambos formatos
    } catch (e: any) {
      setErr('No se pudieron obtener los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (p: CreateUserPayload) => {
    // validaciones defensivas (evita requests basura)
    if (!isValidRutCl(p.user.rut)) throw new Error('RUT nacional inválido');
    if (p.profile.cargo !== 'FUNCIONARIO' && !isValidRutCl(p.profile.rut_profesional || ''))
      throw new Error('RUT profesional inválido');

    setLoading(true); setErr(null);
    try {
      const r = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await fetchUsers();
    } catch (e: any) {
      setErr('No se pudo crear el usuario (revisa duplicados de correo/RUT).');
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const addRole = useCallback(async (userId: number, role: string) => {
    setLoading(true); setErr(null);
    try {
      const r = await fetch(`${API_BASE}/admin/users/${userId}/roles`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!r.ok) throw new Error();
      await fetchUsers();
    } catch {
      setErr('No se pudo asignar el rol.');
    } finally { setLoading(false); }
  }, [fetchUsers]);

  const removeRole = useCallback(async (userId: number, role: string) => {
    setLoading(true); setErr(null);
    try {
      const r = await fetch(`${API_BASE}/admin/users/${userId}/roles/${encodeURIComponent(role)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!r.ok) throw new Error();
      await fetchUsers();
    } catch {
      setErr('No se pudo quitar el rol.');
    } finally { setLoading(false); }
  }, [fetchUsers]);

  const updateProfile = useCallback(async (userId: number, partial: Partial<User['profile']>) => {
    setLoading(true); setErr(null);
    try {
      // supongamos un endpoint PATCH para perfil; si tu backend usa otro, ajusta aquí:
      const r = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: partial }),
      });
      if (!r.ok) throw new Error();
      await fetchUsers();
    } catch {
      setErr('No se pudo actualizar el perfil.');
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