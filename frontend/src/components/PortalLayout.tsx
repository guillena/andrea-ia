import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, Megaphone, Settings, LogOut, ChevronLeft, Menu, User, Users, KeyRound, X, Briefcase } from 'lucide-react';
import { authApi, usersApi } from '../services/api';

export function PortalLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  const [showPasswordDrawer, setShowPasswordDrawer] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  const changePwMutation = useMutation({
    mutationFn: usersApi.changePassword,
    onSuccess: () => { setShowPasswordDrawer(false); setPwForm({ currentPassword: '', newPassword: '', confirm: '' }); },
    onError: (err: any) => setPwError(err?.response?.data?.message || 'Error al cambiar contraseña'),
  });

  const handleChangePw = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('Las contraseñas no coinciden');
      return;
    }
    changePwMutation.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
  };

  const handleLogout = () => {
    queryClient.clear();
    localStorage.removeItem('andrea_token');
    localStorage.removeItem('andrea_refresh');
    navigate('/login');
  };

  const fullName = me ? `${me.firstName} ${me.lastName}` : '—';
  const companyName = me?.company?.name ?? '—';
  const isAdmin = me?.role === 'admin_empresa' || me?.role === 'super_admin';

  return (
    <div className="portal-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo" style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'space-between', alignItems: 'center' }}>
          <span className="sidebar-logo-text sidebar-label">ANDR<span>EA</span></span>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', flexShrink: 0 }}
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={isCollapsed ? 'Dashboard' : undefined}
          >
            <LayoutDashboard size={18} style={{ flexShrink: 0 }} />
            <span className="sidebar-label">Dashboard</span>
          </NavLink>

          <NavLink
            to="/searches"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={isCollapsed ? 'Búsquedas' : undefined}
          >
            <Megaphone size={18} style={{ flexShrink: 0 }} />
            <span className="sidebar-label">Búsquedas</span>
          </NavLink>

          {isAdmin && (
            <>
              <NavLink
                to="/users"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? 'Usuarios' : undefined}
              >
                <Users size={18} style={{ flexShrink: 0 }} />
                <span className="sidebar-label">Usuarios</span>
              </NavLink>

              <NavLink
                to="/settings"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? 'Puestos' : undefined}
              >
                <Briefcase size={18} style={{ flexShrink: 0 }} />
                <span className="sidebar-label">Puestos</span>
              </NavLink>
            </>
          )}
        </nav>

        <div style={{ padding: '0 12px' }}>

          {/* Info del usuario */}
          <div className="sidebar-user" title={isCollapsed ? `${fullName} · ${companyName}` : undefined}>
            <div className="sidebar-user-avatar">
              <User size={14} />
            </div>
            <div className="sidebar-user-info sidebar-label">
              <span className="sidebar-user-name">{fullName}</span>
              <span className="sidebar-user-company">{companyName}</span>
            </div>
          </div>

          <button
            className="sidebar-nav-item"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => { setShowPasswordDrawer(true); setPwError(''); }}
            title={isCollapsed ? 'Cambiar contraseña' : undefined}
          >
            <KeyRound size={18} style={{ flexShrink: 0 }} />
            <span className="sidebar-label">Mi contraseña</span>
          </button>

          <button
            className="sidebar-nav-item"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={handleLogout}
            title={isCollapsed ? 'Cerrar sesión' : undefined}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            <span className="sidebar-label">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        <div className="main-content-inner">
          <Outlet />
        </div>
      </main>

      {/* Drawer de contraseña */}
      {showPasswordDrawer && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
            onClick={() => setShowPasswordDrawer(false)} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
            width: '420px', maxWidth: '100vw', background: 'var(--color-white)',
            boxShadow: '-4px 0 32px rgba(0,0,0,0.12)', padding: '28px 24px',
            overflowY: 'auto', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Cambiar mi contraseña</h2>
              <button onClick={() => setShowPasswordDrawer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                <X size={18} color="var(--color-text-muted)" />
              </button>
            </div>
            
            <form onSubmit={handleChangePw}>
              <div className="form-group">
                <label className="form-label">Contraseña actual</label>
                <input type="password" className="input"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  required />
              </div>
              <div className="form-group">
                <label className="form-label">Nueva contraseña</label>
                <input type="password" className="input" placeholder="Mínimo 8 caracteres"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                  minLength={8} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar nueva contraseña</label>
                <input type="password" className="input"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                  required />
              </div>
              {pwError && (
                <div className="alert alert-error" style={{ marginBottom: '16px' }}>{pwError}</div>
              )}
              {changePwMutation.isSuccess && (
                <div className="alert alert-success" style={{ marginBottom: '16px' }}>
                  ✓ Contraseña actualizada
                </div>
              )}
              <button type="submit" className="btn btn-primary w-full" disabled={changePwMutation.isPending}>
                {changePwMutation.isPending ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
