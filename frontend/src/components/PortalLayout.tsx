import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Megaphone, Settings, LogOut, ChevronLeft, Menu } from 'lucide-react';

export function PortalLayout() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('andrea_token');
    navigate('/login');
  };

  return (
    <div className="portal-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo" style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'space-between', alignItems: 'center' }}>
          {!isCollapsed && <span className="sidebar-logo-text">ANDR<span>EA</span></span>}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={isCollapsed ? "Dashboard" : undefined}
          >
            <LayoutDashboard size={18} />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/campaigns"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={isCollapsed ? "Campañas" : undefined}
          >
            <Megaphone size={18} />
            {!isCollapsed && <span>Campañas</span>}
          </NavLink>
        </nav>

        {/* Footer del sidebar */}
        <div style={{ padding: '0 12px' }}>
          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={isCollapsed ? "Configuración" : undefined}
          >
            <Settings size={18} />
            {!isCollapsed && <span>Configuración</span>}
          </NavLink>

          <button
            className="sidebar-nav-item"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
            onClick={handleLogout}
            title={isCollapsed ? "Cerrar sesión" : undefined}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
