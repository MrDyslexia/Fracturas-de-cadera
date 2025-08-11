// components/Funcionario/PacienteSearch.tsx
'use client';

import { useMemo } from 'react';
import { norm } from '../../utils/text';
import type { Paciente } from '../../data/pacientes';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onOpen: (rut: string) => void;
  pacientes: Paciente[];
  recientes: string[];
};

export default function PacienteSearch({
  value, onChange, onOpen, pacientes, recientes,
}: Props) {

  const sugerencias = useMemo(() => {
    const s = norm(value.trim());
    if (!s) return [];
    return pacientes.filter(p => {
      const full = `${p.rut} ${p.nombres} ${p.ApellidoPaterno} ${p.ApellidoMaterno}`;
      return norm(full).includes(s);
    }).slice(0, 6);
  }, [value, pacientes]);

  return (
    <div className="self-start z-3 w-full bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-white/60">
      <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200">
        <h2 className="text-blue-900 font-semibold">Ingreso paciente</h2>
      </div>

      <div className="p-5 space-y-3">
        <label className="block text-sm font-medium text-blue-900">
          Ingrese RUT o Nombre  Paciente
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

          {value.trim() !== '' && (
            <div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur rounded-xl border border-blue-100 shadow-xl overflow-hidden">
              {sugerencias.length === 0 ? (
                <div className="px-4 py-3 text-sm text-blue-700">
                  Sin coincidencias.
                </div>
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
