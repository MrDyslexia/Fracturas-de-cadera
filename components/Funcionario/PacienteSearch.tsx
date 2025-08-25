// components/Funcionario/PacienteSearch.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type Paciente = {
  rut: string;
  nombres: string;
  ApellidoPaterno: string;
  ApellidoMaterno: string;
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  onOpen: (rut: string) => void;
  recientes: string[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

function toPaciente(x: any): Paciente {
  return {
    rut: String(x?.rut ?? '').trim(),
    nombres: String(x?.nombres ?? x?.nombre ?? '').trim(),
    ApellidoPaterno: String(x?.apellido_paterno ?? x?.ApellidoPaterno ?? '').trim(),
    ApellidoMaterno: String(x?.apellido_materno ?? x?.ApellidoMaterno ?? '').trim(),
  };
}

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export default function PacienteSearch({ value, onChange, onOpen, recientes }: Props) {
  const { authFetch } = useAuth();

  const [results, setResults] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = value.trim();
    setErr(null);

    if (!q) {
      setResults([]);
      abortRef.current?.abort();
      return;
    }

    const handle = setTimeout(async () => {
      try {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        setLoading(true);

        const resp = await authFetch(
          `${API_BASE}/pacientes/search?q=${encodeURIComponent(q)}&limit=6`,
          { signal: ctrl.signal }
        );

        const data = await resp.json().catch(() => ({} as any));

        const arr: any[] = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
          ? data.items
          : Array.isArray(data.pacientes)
          ? data.pacientes
          : [];

        setResults(arr.map(toPaciente));
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          console.error(e);
          setErr('Error al buscar pacientes');
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [value, authFetch]);

  const hayTexto = value.trim() !== '';

  const sugerencias = useMemo(() => {
    if (!hayTexto) return [];
    const s = norm(value.trim());
    return results
      .filter((p) => {
        const full = `${p.rut} ${p.nombres} ${p.ApellidoPaterno} ${p.ApellidoMaterno}`;
        return norm(full).includes(s);
      })
      .slice(0, 6);
  }, [value, results, hayTexto]);

  return (
    <div className="self-start z-3 w-full bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-white/60">
      <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200">
        <h2 className="text-blue-900 font-semibold">Ingreso paciente</h2>
      </div>

      <div className="p-5 space-y-3">
        <label className="block text-sm font-medium text-blue-900">
          Ingrese RUT o Nombre Paciente
        </label>

        <div className="relative">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="12.345.678-9 o nombre/apellidos"
            className="text-blue-700 w-full pl-4 pr-24 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 placeholder-blue-500"
          />
          <button
            onClick={() => value.trim() && onOpen(value.trim())}
            disabled={!value.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:shadow active:translate-y-0 transition disabled:opacity-60"
          >
            Abrir
          </button>

          {hayTexto && (
            <div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur rounded-xl border border-blue-100 shadow-xl overflow-hidden">
              {loading ? (
                <div className="px-4 py-3 text-sm text-blue-700">Buscando…</div>
              ) : err ? (
                <div className="px-4 py-3 text-sm text-red-700">{err}</div>
              ) : sugerencias.length === 0 ? (
                <div className="px-4 py-3 text-sm text-blue-700">Sin coincidencias.</div>
              ) : (
                <ul className="max-h-64 overflow-auto">
                  {sugerencias.map((p) => (
                    <li
                      key={p.rut}
                      onClick={() => onOpen(p.rut)}
                      className="px-4 py-3 text-sm cursor-pointer hover:bg-blue-50 flex items-center justify-between"
                    >
                      <div className="text-blue-900">
                        <div className="font-medium">
                          {p.ApellidoPaterno} {p.ApellidoMaterno}, {p.nombres}
                        </div>
                        <div className="text-blue-600">{p.rut}</div>
                      </div>
                      <span className="text-blue-600 text-xs bg-blue-100 rounded-full px-2 py-0.5">
                        Ver
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-blue-900 mb-2">Recientes</h3>
          <div className="flex flex-wrap gap-2">
            {recientes.map((r) => (
              <button
                key={r}
                onClick={() => onOpen(r)}
                className="px-3 py-1.5 text-sm border border-blue-300 rounded-full text-blue-700 hover:bg-blue-100 transition"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
