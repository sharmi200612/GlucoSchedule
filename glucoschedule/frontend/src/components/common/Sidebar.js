import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/',              label: 'Dashboard',      icon: '🏠' },
  { path: '/glucose',       label: 'Blood Glucose',  icon: '💉' },
  { path: '/medication',    label: 'Medication',     icon: '💊' },
  { path: '/meals',         label: 'Meals',          icon: '🥗' },
  { path: '/exercise',      label: 'Exercise',       icon: '🏃' },
  { path: '/meditation',    label: 'Meditation',     icon: '🧘' },
  { path: '/appointments',  label: 'Appointments',   icon: '🩺' },
  { path: '/planner',       label: 'Daily Planner',  icon: '📋' },
  { path: '/reports',       label: 'Reports',        icon: '📊' },
  { path: '/notifications', label: 'Notifications',  icon: '🔔', badge: 'NEW', badgeColor: '#e63946' },
  { path: '/ai-analysis',   label: 'AI Analysis',    icon: '🤖', badge: 'AI',  badgeColor: '#7c3aed' },
  { path: '/profile',       label: 'My Profile',     icon: '👤' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside style={{ width: 240, height: '100vh', position: 'fixed', left: 0, top: 0,
      background: '#1b2d27', display: 'flex', flexDirection: 'column',
      padding: '0 0 20px 0', overflowY: 'auto', zIndex: 100 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10,
        padding: '24px 20px 16px', borderBottom: '1px solid #2d4a3e' }}>
        <span style={{ fontSize: '1.8rem' }}>🩺</span>
        <div>
          <div style={{ color: '#fff', fontWeight: 800, fontFamily: 'Nunito, sans-serif', fontSize: '1rem' }}>GlucoSchedule</div>
          <div style={{ color: '#52b788', fontSize: '0.7rem', fontWeight: 600 }}>Diabetes Care</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px',
        background: '#243d31', margin: '12px 12px', borderRadius: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#52b788',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontFamily: 'Nunito, sans-serif', fontSize: '1rem', flexShrink: 0 }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 700 }}>{user?.name || 'Patient'}</div>
          <div style={{ color: '#52b788', fontSize: '0.72rem' }}>Patient</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 14px', borderRadius: 8,
              color: isActive ? '#fff' : '#8aada0',
              background: isActive
                ? (item.badgeColor || 'var(--primary, #2d6a4f)')
                : 'transparent',
              textDecoration: 'none', fontSize: '0.87rem', fontWeight: isActive ? 700 : 500,
              transition: 'all 0.15s',
            })}>
            <span>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span style={{ background: item.badgeColor, color: '#fff', borderRadius: 6,
                padding: '1px 6px', fontSize: '0.65rem', fontWeight: 800 }}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <button onClick={() => { logout(); navigate('/login'); }}
        style={{ margin: '0 12px', padding: '10px 14px', background: 'transparent',
          border: '1px solid #3a5c4c', borderRadius: 8, color: '#8aada0',
          cursor: 'pointer', fontSize: '0.87rem', textAlign: 'left' }}>
        🚪 Logout
      </button>
    </aside>
  );
};

export default Sidebar;
