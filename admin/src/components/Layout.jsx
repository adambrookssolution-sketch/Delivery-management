import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/',
      label: 'Panel',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
        </svg>
      )
    },
    {
      path: '/shipments',
      label: 'Envíos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
      )
    },
    {
      path: '/shipments/new',
      label: 'Nuevo Envío',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
        </svg>
      )
    },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({
      path: '/users',
      label: 'Usuarios',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
      )
    });
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className="min-h-screen relative"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
    >
      {/* Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-50"
        style={{
          width: '280px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '28px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%)',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
              }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold" style={{ fontSize: '18px' }}>QuetzalEnvios</h1>
              <p style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '12px' }}>Sistema de Envíos</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '24px 16px' }}>
          <p
            style={{
              color: 'rgba(148, 163, 184, 0.6)',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '16px',
              marginLeft: '12px'
            }}
          >
            Menu
          </p>
          <div className="flex flex-col" style={{ gap: '6px' }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center transition-all duration-200"
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  gap: '14px',
                  background: isActive(item.path)
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(34, 211, 238, 0.1) 100%)'
                    : 'transparent',
                  border: isActive(item.path)
                    ? '1px solid rgba(59, 130, 246, 0.3)'
                    : '1px solid transparent',
                  color: isActive(item.path) ? '#60a5fa' : 'rgba(226, 232, 240, 0.8)'
                }}
              >
                <span style={{ opacity: isActive(item.path) ? 1 : 0.7 }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: '14px', fontWeight: isActive(item.path) ? '600' : '500' }}>
                  {item.label}
                </span>
                {isActive(item.path) && (
                  <div
                    className="ml-auto"
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#3b82f6',
                      boxShadow: '0 0 12px rgba(59, 130, 246, 0.8)'
                    }}
                  />
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            padding: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(15, 23, 42, 0.5)'
          }}
        >
          <div
            className="flex items-center"
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '16px',
              marginBottom: '16px',
              gap: '14px'
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl font-bold text-white"
              style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                fontSize: '16px'
              }}
            >
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate" style={{ fontSize: '14px' }}>
                {user?.name || 'User'}
              </p>
              <p style={{ color: 'rgba(148, 163, 184, 0.7)', fontSize: '12px' }}>
                {user?.role || 'Role'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center transition-all duration-300"
            style={{
              padding: '14px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              color: '#f87171',
              fontSize: '14px',
              fontWeight: '500',
              gap: '10px'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          marginLeft: '280px',
          minHeight: '100vh',
          padding: '32px'
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
