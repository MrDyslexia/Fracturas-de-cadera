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

const CARGO_LABEL: Record<string, string> = {
  TECNOLOGO: 'Tecnólogo(a) Médico',
  INVESTIGADOR: 'Investigador(a)',
  FUNCIONARIO: 'Funcionario(a)',
  ADMINISTRADOR: 'Administrador(a)',
};

function getProfile(u: any) {
  return (
    u?.profile ??
    u?.professional_profile ??
    u?.professionalProfile ??
    u?.ProfessionalProfile ??
    null
  );
}

function hasAdminRole(u: any) {
  const roles: unknown[] = Array.isArray(u?.roles) ? (u.roles as unknown[]) : [];
  const norm = roles.map((r: unknown) => {
    let str: string;
    if (typeof r === 'string') {
      str = r;
    } else if (typeof r === 'undefined' || r === null) {
      str = '';
    } else {
      str = '';
    }
    return str.toUpperCase();
  });
  return norm.includes('ADMIN');
}

function isPaciente(u: any) {
  if (hasAdminRole(u)) return false;
  const p = getProfile(u);
  if (!p) return true;
  const hasCargo = !!p.cargo;
  const hasRutPro = !!p.rut_profesional;
  const hasAlgoMas = !!(p.especialidad || p.hospital || p.departamento);
  return !hasCargo && !hasRutPro && !hasAlgoMas;
}

function roleClass(cargo?: string) {
  switch (cargo) {
    case 'FUNCIONARIO':  return 'badge badge--funcionario';
    case 'TECNOLOGO':    return 'badge badge--tecnologo';
    case 'INVESTIGADOR': return 'badge badge--investigador';
    case 'ADMINISTRADOR':return 'badge badge--admin';
    default:             return 'badge';
  }
}

export function UsersTable() {
  const { users, fetchUsers, addRole, removeRole, updateProfile, loading } = useAdminUsers();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const K = q.trim().toLowerCase();
    if (!K) return users;
    return users.filter((u) => {
      const p = getProfile(u);
      const cargoKey = (p?.cargo ?? '').toLowerCase();
      const cargoLabel = (p?.cargo ? (CARGO_LABEL[p.cargo] ?? p.cargo) : '').toLowerCase();
      const roles = (u?.roles || []).join(' ').toLowerCase();
      return (
        u.rut?.toLowerCase().includes(K) ||
        u.correo?.toLowerCase().includes(K) ||
        `${u.nombres} ${u.apellido_paterno} ${u.apellido_materno}`.toLowerCase().includes(K) ||
        p?.rut_profesional?.toLowerCase().includes(K) ||
        cargoKey.includes(K) ||
        cargoLabel.includes(K) ||
        roles.includes(K)
      );
    });
  }, [q, users]);

  function askCargo(defaultValue: string) {
    return (prompt(
      'Asignar cargo (TECNOLOGO | INVESTIGADOR | FUNCIONARIO):',
      defaultValue || 'TECNOLOGO'
    ) ?? '') as any;
  }

  function askRutProfesional(defaultValue: string) {
    return (prompt('RUT profesional (12.345.678-9):', defaultValue || '') ?? '').trim();
  }

  async function quickSetCargo(u: any) {
    const p = getProfile(u);
    const cargo = askCargo(p?.cargo || '');
    if (!cargo) return;
    const rp = cargo === 'FUNCIONARIO' ? undefined : (p?.rut_profesional || undefined);
    await updateProfile(u.id, { cargo, rut_profesional: rp, activo: true });
    fetchUsers();
  }

  async function quickSetRutProfesional(u: any) {
    const p = getProfile(u);
    const rp = askRutProfesional(p?.rut_profesional || '');
    if (!rp) return;
    if (!isValidRutCl(rp)) { alert('RUT profesional inválido'); return; }
    await updateProfile(u.id, { cargo: p?.cargo || 'FUNCIONARIO', rut_profesional: rp, activo: true });
    fetchUsers();
  }

  return (
    <section className="users-card users-card--brand">
      <div className="users-card__header">
        <div className="flex items-center gap-2 font-semibold">
          <RefreshCw className="h-4 w-4 text-white/95" />
          <span className="text-white">Usuarios</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative h-10">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              className="input-base input-search w-96"
              placeholder="Buscar por nombre, RUT, correo o cargo…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
            <button
              onClick={() => fetchUsers()}
              className="rounded-xl px-4 py-2 font-medium text-white transition bg-blue-600 hover:bg-blue-700 active:bg-blue-600 shadow-sm hover:shadow-lg active:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
              type="button"
            >
              {loading ? 'Actualizando…' : 'Actualizar'}
            </button>
        </div>
      </div>

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
            {filtered.map((u) => {
              const p = getProfile(u);
              const isAdmin = hasAdminRole(u);

              return (
                <tr key={u.rut} className="users-row"> 
                  <td className="td">
                    <div className="font-medium text-heading">
                      {u.nombres} {u.apellido_paterno} {u.apellido_materno}
                    </div>
                    {u.telefono && <div className="cell-sub">{u.telefono}</div>}
                  </td>

                  <td className="td text-body">{u.rut || <span className="placeholder-dash">—</span>}</td>
                  <td className="td text-body">{u.correo || <span className="placeholder-dash">—</span>}</td>

                  <td className="td">
                    <div className="flex flex-wrap items-center gap-2">
                      {(() => {
                        if (isAdmin) {
                          return <span className="badge badge--admin">Administrador(a)</span>;
                        } else if (p?.cargo) {
                          return (
                            <span className={roleClass(p.cargo)}>
                              {CARGO_LABEL[p.cargo] ?? p.cargo}
                            </span>
                          );
                        } else if (isPaciente(u)) {
                          return <span className="badge badge--paciente">Paciente</span>;
                        } else {
                          return (
                            <button className="btn-link" onClick={() => quickSetCargo(u)}>
                              Asignar cargo
                            </button>
                          );
                        }
                      })()}
                    </div>
                  </td>


                  <td className="td text-body">
                    {(() => {
                      let rutContent;
                      if (isAdmin) {
                        rutContent = <span className="placeholder-dash">—</span>;
                      } else if (p?.rut_profesional) {
                        rutContent = p.rut_profesional;
                      } else if (isPaciente(u)) {
                        rutContent = <span className="placeholder-dash">—</span>;
                      } else {
                        rutContent = (
                          <button className="btn-link" onClick={() => quickSetRutProfesional(u)}>
                            Agregar RUT
                          </button>
                        );
                      }
                      return rutContent;
                    })()}
                  </td>


                  <td className="td">
                    {p?.activo ? (
                      <span className="inline-flex items-center gap-1 font-medium text-success">
                        <ToggleRight className="h-4 w-4" /> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted">
                        <ToggleLeft className="h-4 w-4" /> Inactivo
                      </span>
                    )}
                  </td>

                  <td className="td">
                    <div className="flex justify-between items-center gap-2">
                      <button
                        onClick={() => {
                          const cargo = (prompt(
                            'Asignar cargo (TECNOLOGO | INVESTIGADOR | FUNCIONARIO):',
                            p?.cargo || 'TECNOLOGO'
                          ) ?? '') as any;
                          if (!cargo) return;
                          const rpRaw = prompt(
                            'RUT profesional (12.345.678-9):',
                            p?.rut_profesional || ''
                          );
                          const rp = (rpRaw ?? '').trim();
                          if (cargo !== 'FUNCIONARIO' && !isValidRutCl(rp)) {
                            alert('RUT profesional inválido'); return;
                          }
                          updateProfile(u.id, {
                            cargo,
                            rut_profesional: cargo === 'FUNCIONARIO' ? undefined : (rp || undefined),
                            activo: true,
                          }).then(fetchUsers);
                        }}
                        className="flex rounded-2xl justify-between gap-2 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:text-blue-900 transition"
                        title="Editar perfil o cargo del usuario"
                      >
                        <Edit3 className="h-4 w-4" /><span>Editar</span>
                      </button>

                      {isAdmin ? (
                        <button
                          onClick={() => removeRole(u.id, 'ADMIN')}
                          className="flex rounded-2xl justify-between border-2 border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1 text-sm text-red-700 hover:text-red-900 transition"
                          title="Quitar rol Administrador"
                        >
                          <ShieldMinus className="h-4 w-4" /><span>Quitar</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => addRole(u.id, 'ADMIN')}
                          className="flex rounded-2xl justify-between gap-2 border-2 border-green-700 bg-blue-50 hover:bg-green-100 px-3 py-1 text-sm text-green-700 hover:text-green-900 transition"
                          title="Asignar rol Administrador"
                        >
                          <ShieldPlus className="h-4 w-4" /><span>Asignar</span>
                        </button>
                      )}

                      {u.email_verified && (
                        <span className="inline-flex items-center gap-1 text-success">
                          <BadgeCheck className="h-4 w-4" />
                          <span className="text-xs font-medium">email verificado</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-muted">Sin resultados…</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && <div className="users-card__footer">Procesando…</div>}
    </section>
  );
}

declare global { interface HTMLElementTagNameMap {} }
