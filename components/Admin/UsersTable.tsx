'use client';

import { useMemo, useState } from 'react';
import { useAdminUsers } from '../../contexts/AdminUsersContext';
import { BadgeCheck, Edit3, RefreshCw, Search, ShieldMinus, ShieldPlus, ToggleLeft, ToggleRight } from 'lucide-react';
import { isValidRutCl } from '../../utils/rut';

export function UsersTable() {
  const { users, fetchUsers, addRole, removeRole, updateProfile, loading } = useAdminUsers();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const K = q.trim().toLowerCase();
    if (!K) return users;
    return users.filter(u =>
      u.rut?.toLowerCase().includes(K) ||
      u.correo?.toLowerCase().includes(K) ||
      `${u.nombres} ${u.apellido_paterno} ${u.apellido_materno}`.toLowerCase().includes(K) ||
      u.profile?.rut_profesional?.toLowerCase().includes(K) ||
      u.profile?.cargo?.toLowerCase().includes(K)
    );
  }, [q, users]);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-blue-100">
      <div className="px-5 py-4 border-b flex items-center justify-between gap-3 ">
        <div className="flex items-center gap-2 text-blue-800 font-semibold">
          <RefreshCw className="h-4 w-4" />
          Usuarios
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-500" />
            <input className="pl-8 pr-3 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                   placeholder="Buscar por nombre, RUT, correo o cargo…" value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          <button onClick={() => fetchUsers()} className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
            Actualizar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-50 text-blue-900">
            <tr>
              <th className="th">Nombre</th>
              <th className="th">RUT</th>
              <th className="th">Correo</th>
              <th className="th">Cargo</th>
              <th className="th">RUT Profesional</th>
              <th className="th">Estado</th>
              <th className="th w-56">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t hover:bg-blue-50/40">
                <td className="td">
                  <div className="font-medium text-blue-900">
                    {u.nombres} {u.apellido_paterno} {u.apellido_materno}
                  </div>
                  <div className="text-xs text-blue-700/70">{u.telefono || '—'}</div>
                </td>
                <td className="td">{u.rut}</td>
                <td className="td">{u.correo}</td>
                <td className="td">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
                    {u.profile?.cargo ?? '—'}
                  </span>
                </td>
                <td className="td">{u.profile?.rut_profesional ?? '—'}</td>
                <td className="td">
                  {u.profile?.activo
                    ? <span className="inline-flex items-center gap-1 text-emerald-700"><ToggleRight className="h-4 w-4"/> Activo</span>
                    : <span className="inline-flex items-center gap-1 text-slate-500"><ToggleLeft className="h-4 w-4"/> Inactivo</span>
                  }
                </td>
                <td className="td">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const cargo = prompt('Asignar cargo (TECNOLOGO | MEDICO | INVESTIGADOR | FUNCIONARIO):', u.profile?.cargo || 'TECNOLOGO') as any;
                        if (!cargo) return;
                        const rp = prompt('RUT profesional (12.345.678-9):', u.profile?.rut_profesional || '');
                        if (cargo !== 'FUNCIONARIO' && !isValidRutCl(rp||'')) {
                          alert('RUT profesional inválido');
                          return;
                        }
                        updateProfile(u.id, {
                          cargo,
                          rut_profesional: cargo === 'FUNCIONARIO' ? null : rp,
                          activo: true
                        });
                      }}
                      className="btn-secondary"
                      title="Editar perfil/cargo"
                    >
                      <Edit3 className="h-4 w-4" /> Editar
                    </button>

                    <button
                      onClick={() => addRole(u.id, u.profile?.cargo || 'FUNCIONARIO')}
                      className="btn-secondary"
                      title="Asignar rol igual a cargo"
                    >
                      <ShieldPlus className="h-4 w-4" /> Rol
                    </button>

                    <button
                      onClick={() => removeRole(u.id, u.profile?.cargo || 'FUNCIONARIO')}
                      className="btn-danger"
                      title="Quitar rol"
                    >
                      <ShieldMinus className="h-4 w-4" /> Quitar
                    </button>

                    {u.email_verified && (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <BadgeCheck className="h-4 w-4" /> email verificado
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-blue-700">Sin resultados…</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && <div className="p-3 text-center text-blue-700">Procesando…</div>}
    </section>
  );
}

const baseTh = 'px-3 py-2 text-left text-xs font-semibold';
const baseTd = 'px-3 py-2 align-top';

declare global {
  interface HTMLElementTagNameMap { }
}

function cls(...s: (string|false|undefined)[]) { return s.filter(Boolean).join(' '); }

