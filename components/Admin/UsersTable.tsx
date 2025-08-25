'use client';

import { useMemo, useState } from 'react';
import { useAdminUsers } from '../../contexts/AdminUsersContext';
import {
  BadgeCheck,
  Edit3,
  RefreshCw,
  Search,
  ShieldMinus,
  ShieldPlus,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { isValidRutCl } from '../../utils/rut';

export function UsersTable() {
  const { users, fetchUsers, addRole, removeRole, updateProfile, loading } = useAdminUsers();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const K = q.trim().toLowerCase();
    if (!K) return users;
    return users.filter((u) =>
      u.rut?.toLowerCase().includes(K) ||
      u.correo?.toLowerCase().includes(K) ||
      `${u.nombres} ${u.apellido_paterno} ${u.apellido_materno}`.toLowerCase().includes(K) ||
      u.profile?.rut_profesional?.toLowerCase().includes(K) ||
      u.profile?.cargo?.toLowerCase().includes(K)
    );
  }, [q, users]);

  return (
    <section className="users-card">
      {/* Header */}
      <div className="users-card__header">
        <div className="flex items-center gap-2 font-semibold">
          <RefreshCw className="h-4 w-4 text-white/95" />
          <span className="text-white">Usuarios</span>
        </div>

        <div className="flex items-center gap-2">
          {/* wrapper con altura fija */}
          <div className="relative h-10">
            {/* icono centrado, sin capturar clicks */}
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            {/* input con padding-left forzado para que NO pise el icono */}
            <input
              className="input-base input-search w-96"
              placeholder="Buscar por nombre, RUT, correo o cargo…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <button onClick={() => fetchUsers()} className="btn-primary">
            Actualizar
          </button>
        </div>
      </div>


      {/* Table */}
      <div className="users-table__wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th className="th sticky-head">Nombre</th>
              <th className="th sticky-head">RUT</th>
              <th className="th sticky-head">Correo</th>
              <th className="th sticky-head">Cargo</th>
              <th className="th sticky-head">RUT Profesional</th>
              <th className="th sticky-head">Estado</th>
              <th className="th sticky-head w-56">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="users-row">
                <td className="td">
                  <div className="font-medium text-heading">
                    {u.nombres} {u.apellido_paterno} {u.apellido_materno}
                  </div>
                  <div className="text-xs text-muted">{u.telefono || '—'}</div>
                </td>
                <td className="td text-body">{u.rut}</td>
                <td className="td text-body">{u.correo}</td>
                <td className="td">
                  <span className="chip">{u.profile?.cargo ?? '—'}</span>
                </td>
                <td className="td text-body">{u.profile?.rut_profesional ?? '—'}</td>
                <td className="td">
                  {u.profile?.activo ? (
                    <span className="inline-flex items-center gap-1 font-medium text-success">
                      <ToggleRight className="h-4 w-4" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted">
                      <ToggleLeft className="h-4 w-4" />
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="td">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        const cargo = (prompt(
                          'Asignar cargo (TECNOLOGO | MEDICO | INVESTIGADOR | FUNCIONARIO):',
                          u.profile?.cargo || 'TECNOLOGO'
                        ) ?? '') as any;
                        if (!cargo) return;

                        const rpRaw = prompt(
                          'RUT profesional (12.345.678-9):',
                          u.profile?.rut_profesional || ''
                        );
                        const rp = (rpRaw ?? '').trim();

                        if (cargo !== 'FUNCIONARIO' && !isValidRutCl(rp)) {
                          alert('RUT profesional inválido');
                          return;
                        }

                        updateProfile(u.id, {
                          cargo,
                          rut_profesional: cargo === 'FUNCIONARIO' ? undefined : (rp || undefined),
                          activo: true,
                        });
                      }}
                      className="btn-secondary"
                      title="Editar perfil/cargo"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => addRole(u.id, u.profile?.cargo || 'FUNCIONARIO')}
                      className="btn-secondary"
                      title="Asignar rol igual a cargo"
                    >
                      <ShieldPlus className="h-4 w-4" />
                      <span>Rol</span>
                    </button>

                    <button
                      onClick={() => removeRole(u.id, u.profile?.cargo || 'FUNCIONARIO')}
                      className="btn-danger"
                      title="Quitar rol"
                    >
                      <ShieldMinus className="h-4 w-4" />
                      <span>Quitar</span>
                    </button>

                    {u.email_verified && (
                      <span className="inline-flex items-center gap-1 text-success">
                        <BadgeCheck className="h-4 w-4" />
                        <span className="text-xs font-medium">email verificado</span>
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-muted">
                  Sin resultados…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && <div className="users-card__footer">Procesando…</div>}
    </section>
  );
}

declare global {
  interface HTMLElementTagNameMap {}
}
