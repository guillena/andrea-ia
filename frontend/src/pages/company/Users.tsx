import { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserPlus, X, MoreVertical, ShieldCheck, Eye, UserCog,
  CheckCircle, XCircle, ChevronDown,
} from 'lucide-react';
import { usersApi, authApi } from '../../services/api';

// ── Helpers ──────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  admin_empresa: 'Administrador',
  recruiter:     'Reclutador',
  viewer:        'Visualizador',
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  admin_empresa: <ShieldCheck size={13} />,
  recruiter:     <UserCog size={13} />,
  viewer:        <Eye size={13} />,
};

const ROLE_COLOR: Record<string, string> = {
  admin_empresa: 'var(--color-indigo)',
  recruiter:     '#0891b2',
  viewer:        '#64748b',
};

const STATUS_COLOR: Record<string, string> = {
  active:   'var(--color-success-text)',
  inactive: 'var(--color-text-muted)',
  pending:  'var(--color-warning-text)',
};

const STATUS_LABEL: Record<string, string> = {
  active:   'Activo',
  inactive: 'Inactivo',
  pending:  'Pendiente',
};

// ── Componente principal ─────────────────────────────────────

export default function Users() {
  const queryClient = useQueryClient();
  const [showDrawer, setShowDrawer] = useState<'create' | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    role: 'recruiter', temporaryPassword: '',
  });
  const [createSuccess, setCreateSuccess] = useState(false);

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: authApi.me, staleTime: 1000 * 60 * 10 });
  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: usersApi.list });

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setCreateSuccess(true);
      setForm({ firstName: '', lastName: '', email: '', role: 'recruiter', temporaryPassword: '' });
    },
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      usersApi.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const isAdmin = me?.role === 'admin_empresa' || me?.role === 'super_admin';

  if (!isLoading && me && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Usuarios</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => { setShowDrawer('create'); setCreateSuccess(false); }}>
              <UserPlus size={16} /> Nuevo usuario
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted">Cargando usuarios...</p>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Último acceso</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} style={{ opacity: u.status === 'inactive' ? 0.6 : 1 }}>
                  <td>
                    <p style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-muted">{u.email}</p>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '12px', fontWeight: 500,
                      color: ROLE_COLOR[u.role] ?? '#64748b',
                      background: `${ROLE_COLOR[u.role] ?? '#64748b'}12`,
                      padding: '2px 8px', borderRadius: '999px',
                    }}>
                      {ROLE_ICON[u.role]}
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: STATUS_COLOR[u.status] }}>
                      {STATUS_LABEL[u.status] ?? u.status}
                    </span>
                  </td>
                  <td className="text-sm text-muted">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  {isAdmin && (
                    <td style={{ position: 'relative' }}>
                      {u.id !== me?.id && (
                        <DropdownMenu
                          isOpen={menuOpen === u.id}
                          onToggle={() => setMenuOpen(menuOpen === u.id ? null : u.id)}
                          onClose={() => setMenuOpen(null)}
                        >
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              toggleStatus.mutate({ id: u.id, status: u.status === 'active' ? 'inactive' : 'active' });
                              setMenuOpen(null);
                            }}
                          >
                            {u.status === 'active'
                              ? <><XCircle size={14} /> Desactivar</>
                              : <><CheckCircle size={14} /> Activar</>}
                          </button>
                        </DropdownMenu>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Drawer: crear usuario ─────────────────────────── */}
      {showDrawer === 'create' && (
        <Drawer title="Nuevo usuario" onClose={() => setShowDrawer(null)}>
          {createSuccess && (
            <div className="alert alert-success" style={{ marginBottom: '16px' }}>
              ✓ Usuario creado. La contraseña temporaria es <strong>{form.temporaryPassword || 'Temp1234!'}</strong>.
              El usuario debería cambiarla en su primer ingreso.
            </div>
          )}
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="input" placeholder="María"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  required />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input className="input" placeholder="García"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="input" placeholder="usuario@empresa.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required />
            </div>
            <div className="form-group">
              <label className="form-label">Rol</label>
              <select className="select" value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                <option value="recruiter">Reclutador — puede crear búsquedas y candidatos</option>
                <option value="viewer">Visualizador — solo lectura</option>
                <option value="admin_empresa">Administrador — acceso completo</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña temporaria (opcional)</label>
              <input className="input" placeholder="Temp1234! (por defecto)"
                value={form.temporaryPassword}
                onChange={(e) => setForm((f) => ({ ...f, temporaryPassword: e.target.value }))} />
              <p className="text-xs text-muted" style={{ marginTop: '4px' }}>
                Si la dejás vacía se usa <code>Temp1234!</code>
              </p>
            </div>
            {createMutation.isError && (
              <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                {(createMutation.error as any)?.response?.data?.message || 'Error al crear usuario'}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <button type="submit" className="btn btn-primary w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creando...' : 'Crear usuario'}
              </button>
              {createSuccess && (
                <button type="button" className="btn btn-ghost w-full"
                  onClick={() => { createMutation.reset(); setCreateSuccess(false); }}>
                  + Agregar otro usuario
                </button>
              )}
            </div>
          </form>
        </Drawer>
      )}
    </div>
  );
}

// ── Drawer ────────────────────────────────────────────────────

function Drawer({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
        onClick={onClose} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
        width: '420px', maxWidth: '100vw', background: 'var(--color-white)',
        boxShadow: '-4px 0 32px rgba(0,0,0,0.12)', padding: '28px 24px',
        overflowY: 'auto', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
            <X size={18} color="var(--color-text-muted)" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

// ── DropdownMenu ──────────────────────────────────────────────

function DropdownMenu({ children, isOpen, onToggle, onClose }: {
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="btn btn-ghost btn-sm"
        style={{ padding: '4px 8px' }}
        onClick={onToggle}
      >
        <MoreVertical size={15} />
      </button>
      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={onClose} />
          <div style={{
            position: 'absolute', right: 0, top: '100%', zIndex: 20,
            background: 'var(--color-white)', borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)',
            minWidth: '160px', overflow: 'hidden',
          }}>
            {children}
          </div>
        </>
      )}
    </div>
  );
}
