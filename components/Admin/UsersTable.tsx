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
};

// ——— helpers para no depender del nombre exacto que venga del backend
function getProfile(u: any) {
  return (
    u?.profile ??
    u?.professional_profile ??
    u?.professionalProfile ??
    u?.ProfessionalProfile ??
    null
  );
}

function isPaciente(u: any) {
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
      return (
        u.rut?.toLowerCase().includes(K) ||
        u.correo?.toLowerCase().includes(K) ||
        `${u.nombres} ${u.apellido_paterno} ${u.apellido_materno}`.toLowerCase().includes(K) ||
        p?.rut_profesional?.toLowerCase().includes(K) ||
        cargoKey.includes(K) ||
        cargoLabel.includes(K)
      );
    });
  }, [q, users]);

  // ===== acciones rápidas =====
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
      {/* Header */}
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
          <button onClick={() => fetchUsers()} className="btn-primary" disabled={loading}>
            {loading ? 'Actualizando…' : 'Actualizar'}
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
            {filtered.map((u) => {
              const p = getProfile(u);
              return (
                <tr key={u.id} className="users-row">
                  {/* Nombre + teléfono (teléfono solo si existe) */}
                  <td className="td">
                    <div className="font-medium text-heading">
                      {u.nombres} {u.apellido_paterno} {u.apellido_materno}
                    </div>
                    {u.telefono && <div className="cell-sub">{u.telefono}</div>}
                  </td>

                  <td className="td text-body">{u.rut || <span className="placeholder-dash">—</span>}</td>
                  <td className="td text-body">{u.correo || <span className="placeholder-dash">—</span>}</td>

                  {/* CARGO con badge */}
                  <td className="td">
                    {p?.cargo ? (
                      <span className={roleClass(p.cargo)}>
                        {CARGO_LABEL[p.cargo] ?? p.cargo}
                      </span>
                    ) : isPaciente(u) ? (
                      <span className="badge badge--paciente">Paciente</span>
                    ) : (
                      <button className="btn-link" onClick={() => quickSetCargo(u)}>Asignar cargo</button>
                    )}
                  </td>

                  {/* RUT PROFESIONAL */}
                  <td className="td text-body">
                    {p?.rut_profesional ? (
                      p.rut_profesional
                    ) : isPaciente(u) ? (
                      <span className="placeholder-dash">—</span>
                    ) : (
                      <button className="btn-link" onClick={() => quickSetRutProfesional(u)}>Agregar RUT</button>
                    )}
                  </td>

                  {/* ESTADO */}
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

                  {/* ACCIONES */}
                  <td className="td">
                    <div className="flex flex-wrap items-center gap-2">
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
                        className="btn-secondary"
                        title="Editar perfil/cargo"
                      >
                        <Edit3 className="h-4 w-4" /><span>Editar</span>
                      </button>

                      <button
                        onClick={() => addRole(u.id, p?.cargo || 'FUNCIONARIO')}
                        className="btn-secondary"
                        title="Asignar rol igual a cargo"
                      >
                        <ShieldPlus className="h-4 w-4" /><span>Rol</span>
                      </button>

                      <button
                        onClick={() => removeRole(u.id, p?.cargo || 'FUNCIONARIO')}
                        className="btn-danger"
                        title="Quitar rol"
                      >
                        <ShieldMinus className="h-4 w-4" /><span>Quitar</span>
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
