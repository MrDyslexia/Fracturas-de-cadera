'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type UserRole = 'admin' | 'funcionario' | 'paciente' | 'investigador' | 'tecnologo';

export interface User {
  id: number | string;
  nombre: string;
  correo: string;
  rut?: string;
  roles: UserRole[]; // array de roles del front
}

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (correoOrRut: string, password: string) => Promise<User>;
  logout: () => void;
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  portalFor: (roles: UserRole[]) => string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001';

const ROLE_MAP: Record<string, UserRole> = {
  PACIENTE: 'paciente',
  FUNCIONARIO: 'funcionario',
  TECNOLOGO: 'tecnologo',
  INVESTIGADOR: 'investigador',
  ADMIN: 'admin',
};

const STORAGE_KEY = 'session_v1';

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión al cargar
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as { user: User; token: string };
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // (Opcional) Sincroniza logout/login entre pestañas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (!e.newValue) {
          setUser(null);
          setToken(null);
        } else {
          const parsed = JSON.parse(e.newValue) as { user: User; token: string };
          setUser(parsed.user);
          setToken(parsed.token);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Decide portal según prioridad de roles
  const portalFor = (roles: UserRole[]) => {
    if (roles.includes('admin')) return '/admin';
    if (roles.includes('investigador')) return '/investigador';
    if (roles.includes('tecnologo')) return '/tech';
    if (roles.includes('paciente')) return '/paciente';
    if (roles.includes('funcionario')) return '/funcionario';
    return '/';
  };

  const login = async (correoOrRut: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: correoOrRut, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Error de autenticación');
      }

      const data: {
        token: string;
        user: { id: number | string; rut?: string; nombre: string; correo: string; roles: string[] };
      } = await res.json();

      // Mapea roles del backend (cualquier casing) → roles del front
      const mappedRoles: UserRole[] = (data.user.roles || [])
        .map((r) => ROLE_MAP[r?.toUpperCase?.() ?? ''] || null)
        .filter(Boolean) as UserRole[];

      const u: User = {
        id: data.user.id,
        nombre: data.user.nombre,
        correo: data.user.correo,
        rut: data.user.rut,
        roles: mappedRoles,
      };

      setUser(u);
      setToken(data.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, token: data.token }));
      return u;
    } catch (e: any) {
      // Limpia por si quedó algo inconsistente
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
      setToken(null);
      throw e;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // fetch con Bearer automático
  const authFetch: AuthState['authFetch'] = async (input, init = {}) => {
    const headers = new Headers(init.headers || {});
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    const resp = await fetch(input, { ...init, headers });
    if (resp.status === 401) logout(); // token inválido/expirado
    return resp;
  };

  const value = useMemo(
    () => ({ user, token, loading, login, logout, authFetch, portalFor }),
    [user, token, loading]
  );

  // Evita parpadeo de UI protegida mientras carga la sesión
  if (loading) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
