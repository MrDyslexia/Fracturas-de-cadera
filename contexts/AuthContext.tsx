'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type UserRole = 'admin' | 'funcionario' | 'paciente' | 'investigador' | 'tecnologo';

export interface User {
  id: number | string;
  nombre: string;
  correo: string;
  rut?: string;
  roles: UserRole[];
}

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (rut: string, password: string) => Promise<User>;
  logout: () => void;
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  portalFor: (roles: UserRole[]) => string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

const ROLE_MAP: Record<string, UserRole> = {
  PACIENTE: 'paciente',
  FUNCIONARIO: 'funcionario',
  TECNOLOGO: 'tecnologo',
  INVESTIGADOR: 'investigador',
  ADMIN: 'admin',
};

const STORAGE_KEY = 'session_v1';
const AuthContext = createContext<AuthState | undefined>(undefined);

// --- helpers ---
const S = (x: unknown) => String(x ?? '').trim();
const U = (x: unknown) => S(x).toUpperCase();

// normaliza RUT
function normRut(r: string) {
  return (r || '').replace(/\./g, '').replace(/-/g, '').toUpperCase();
}

/** Extrae roles desde múltiples ubicaciones y con tolerancia a espacios/mayúsculas */
function extractRoles(rawUser: any): UserRole[] {
  const out = new Set<UserRole>();

  // 1) roles[] o CSV
  const fromArray: any[] = Array.isArray(rawUser?.roles) ? rawUser.roles : [];
  const fromCsv: string[] =
    typeof rawUser?.roles === 'string'
      ? String(rawUser.roles)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  // 2) cargos en distintos campos/estructuras
  const cargoCandidates = [
    rawUser?.cargo,
    rawUser?.profile?.cargo,
    rawUser?.professional_profile?.cargo,
    rawUser?.professionalProfile?.cargo,
    rawUser?.me?.profile?.cargo, // por si viene de /perfil { me: {...} }
    rawUser?.me?.professional_profile?.cargo,
    rawUser?.me?.professionalProfile?.cargo,
  ];

  const all = [...fromArray, ...fromCsv, ...cargoCandidates].filter(Boolean);

  for (const r of all) {
    const key = U(r);
    // mapeo directo
    if (key in ROLE_MAP) {
      out.add(ROLE_MAP[key]);
      continue;
    }
    // fallback por substring (ruidos tipo " Rol: FUNCIONARIO ")
    if (key.includes('FUNCIONARIO')) out.add('funcionario');
    else if (key.includes('PACIENTE')) out.add('paciente');
    else if (key.includes('TECNOLOG')) out.add('tecnologo');
    else if (key.includes('INVESTIG')) out.add('investigador');
    else if (key.includes('ADMIN')) out.add('admin');
  }

  return Array.from(out);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // carga sesión previa
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

  // sync multi-tab
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

  // portal por prioridad; nunca devuelve '/'
  const portalFor = (roles: UserRole[]) => {
    const set = new Set((roles ?? []).map((r) => r.toLowerCase()));
    if (set.has('admin')) return '/admin';
    if (set.has('investigador')) return '/investigador';
    if (set.has('tecnologo')) return '/tech';
    if (set.has('paciente')) return '/paciente';
    if (set.has('funcionario')) return '/funcionario';
    return '/login';
  };

  const login = async (rut: string, password: string) => {
    try {
      const url = `${API_BASE}/auth/login`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut: normRut(rut), password }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}: ${url}`);

      // 1) respuesta base del login
      const data: {
        token: string;
        user: {
          id: number | string;
          rut?: string;
          nombre: string;
          correo: string;
          roles?: any;            // puede venir []
          profile?: any;
          professional_profile?: any;
          professionalProfile?: any;
        };
      } = body;

      // 2) intentar /perfil (si 404, seguimos igual)
      let perfil: any = null;
      try {
        const meRes = await fetch(`${API_BASE}/perfil`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        if (meRes.ok) perfil = await meRes.json().catch(() => ({}));
      } catch { /* noop */ }

      // 3) intentar decodificar el JWT por si trae claims útiles
      let jwtPayload: any = null;
      try {
        const parts = String(data.token).split('.');
        if (parts.length === 3) {
          const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
          jwtPayload = JSON.parse(json);
        }
      } catch { /* noop */ }

      // 4) construir roles robustos desde todas las fuentes conocidas
      const rawRoles: any[] = [
        ...(Array.isArray(data.user?.roles) ? data.user.roles : []),
        ...(Array.isArray(perfil?.me?.roles) ? perfil.me.roles : []),
        perfil?.me?.profile?.cargo,
        perfil?.me?.professional_profile?.cargo,
        perfil?.me?.professionalProfile?.cargo,
        jwtPayload?.roles,
        jwtPayload?.role,
        jwtPayload?.perfil?.cargo,
        jwtPayload?.professional_profile?.cargo,
      ]
        .flat()       // por si alguna viene como array
        .filter(Boolean);

      const mappedRoles: UserRole[] = rawRoles
        .map((r) => ROLE_MAP[String(r).trim().toUpperCase()] || null)
        .filter(Boolean) as UserRole[];

      // 5) Fallback súper conservador
      if (
        mappedRoles.length === 0 &&
        String(perfil?.me?.professional_profile?.cargo || jwtPayload?.professional_profile?.cargo || '')
          .toUpperCase()
          .includes('FUNCIONARIO')
      ) {
        mappedRoles.push('funcionario');
      }

      // 6) armar usuario y guardar sesión
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
      localStorage.setItem('token', data.token);

      console.info('[Auth] /auth/login user:', data.user);
      console.info('[Auth] /perfil payload:', perfil);
      console.info('[Auth] JWT payload:', jwtPayload);
      console.info('[Auth] mappedRoles:', mappedRoles);

      return u;
    } catch (e) {
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

  const authFetch: AuthState['authFetch'] = async (input, init = {}) => {
    const headers = new Headers(init.headers || {});
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const resp = await fetch(input, { ...init, headers });
    if (resp.status === 401) logout();
    return resp;
  };

  const value = useMemo(
    () => ({ user, token, loading, login, logout, authFetch, portalFor }),
    [user, token, loading]
  );

  if (loading) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
