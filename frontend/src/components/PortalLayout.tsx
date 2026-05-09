import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Megaphone, Settings, LogOut, ChevronLeft, Menu, User } from 'lucide-react';
import { authApi } from '../services/api';

export function PortalLayout() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  const handleLogout = () => {
    localStorage.removeItem('andrea_token');
    localStorage.removeItem('andrea_refresh');
    navigate('/login');
  };

  const fullName = me ? `${me.firstName} ${me.lastName}` : '—';
  const companyName = me?.company?.name ?? '—';

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
            to="/campaigns"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={isCollapsed ? 'Campañas' : undefined}
          >
            <Megaphone size={18} style={{ flexShrink: 0 }} />
            <span className="sidebar-label">Campañas</span>
          </NavLink>
        </nav>

        {/* Footer del sidebar */}
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

          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={isCollapsed ? 'Configuración' : undefined}
          >
            <Settings size={18} style={{ flexShrink: 0 }} />
            <span className="sidebar-label">Configuración</span>
          </NavLink>

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
    </div>
  );
}
