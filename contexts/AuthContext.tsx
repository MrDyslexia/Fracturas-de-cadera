'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type UserRole = 'admin'|'funcionario'|'paciente'|'investigador'|'tecnologo';
export interface User { id: string; nombre: string; role: UserRole; token?: string; rut: string; }

const USERS: Array<{rut:string; pass:string; role:UserRole; nombre:string}> = [
  { rut:'admin',         pass:'1234', role:'admin',        nombre:'Admin Demo' },
  { rut:'funcionario',   pass:'1234', role:'funcionario',  nombre:'Funcionario Demo' },
  { rut:'paciente',      pass:'1234', role:'paciente',     nombre:'Paciente Demo' },
  { rut:'investigador',  pass:'1234', role:'investigador', nombre:'Investigador Demo' },
  { rut:'tecnologo',     pass:'1234', role:'tecnologo',    nombre:'Tecnólogo Demo' },
];

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (rut: string, password: string) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('session') : null;
    if (raw) setUser(JSON.parse(raw));
    setLoading(false);
  }, []);

  const login = async (rut: string, password: string) => {
    const found = USERS.find(u => u.rut === rut && u.pass === password);
    await new Promise(r => setTimeout(r, 300)); // simular delay
    if (!found) throw new Error('Credenciales inválidas');
    const u: User = { id: crypto.randomUUID(), nombre: found.nombre, role: found.role, rut: found.rut, token: 'demo' };
    setUser(u);
    localStorage.setItem('session', JSON.stringify(u));
    return u;
  };

  const logout = () => { setUser(null); localStorage.removeItem('session'); };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
