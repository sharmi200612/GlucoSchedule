import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [glucose, setGlucose]   = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [profile, setProfile]   = useState(null);

  useEffect(() => {
    API.get('/glucose').then(r => setGlucose(r.data.slice(0, 5))).catch(() => {});
    API.get('/planner').then(r => setTasks(r.data.slice(0, 6))).catch(() => {});
    // Fetch full profile to get diabetesType
    API.get('/auth/profile').then(r => setProfile(r.data)).catch(() => {});
  }, []);

  // Use profile data if available, fallback to user from auth context
  const displayUser   = profile || user;
  const diabetesType  = displayUser?.diabetesType || user?.diabetesType || '—';
  const latestGlucose = glucose[0];
  const glucoseStatus = latestGlucose
    ? latestGlucose.level < 70  ? { label: 'Low',    color: '#e63946' }
    : latestGlucose.level > 180 ? { label: 'High',   color: '#f4a261' }
    : { label: 'Normal', color: 'var(--primary)' }
    : null;

  const quickLinks = [
    { path: '/glucose',      icon: '💉', label: 'Log Glucose',  color: '#d8f3dc' },
    { path: '/medication',   icon: '💊', label: 'Medication',   color: '#fde8df' },
    { path: '/meals',        icon: '🥗', label: 'Log Meal',     color: '#fff3e0' },
    { path: '/exercise',     icon: '🏃', label: 'Exercise',     color: '#e3f2fd' },
    { path: '/meditation',   icon: '🧘', label: 'Meditation',   color: '#f3e5f5' },
    { path: '/appointments', icon: '🩺', label: 'Appointments', color: '#e8f5e9' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Good day, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's your health overview for today</p>
        </div>
        <Link to="/planner" className="btn btn-primary">📋 View Today's Plan</Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💉</div>
          <div className="stat-value" style={{ color: glucoseStatus?.color || 'var(--primary)' }}>
            {latestGlucose ? latestGlucose.level : '—'}
          </div>
          <div className="stat-label">Latest Glucose (mg/dL)</div>
          {glucoseStatus && (
            <span className="badge" style={{
              marginTop: 6, display: 'inline-block',
              background: glucoseStatus.color + '22', color: glucoseStatus.color,
            }}>{glucoseStatus.label}</span>
          )}
        </div>

        <div className="stat-card" style={{ borderLeftColor: 'var(--accent)' }}>
          <div className="stat-icon">📋</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{tasks.length}</div>
          <div className="stat-label">Tasks Today</div>
        </div>

        {/* ── FIXED: Diabetes Type now shows correctly ── */}
        <div className="stat-card" style={{ borderLeftColor: '#7b2d8b' }}>
          <div className="stat-icon">🩺</div>
          <div className="stat-value" style={{
            color: '#7b2d8b',
            fontSize: diabetesType.length > 6 ? '1rem' : '1.8rem',
          }}>
            {diabetesType}
          </div>
          <div className="stat-label">Diabetes Type</div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#f4a261' }}>
          <div className="stat-icon">🎯</div>
          <div className="stat-value" style={{ color: '#f4a261', fontSize: '1.2rem' }}>
            {displayUser?.targetGlucoseMin || 70}–{displayUser?.targetGlucoseMax || 180}
          </div>
          <div className="stat-label">Target Range (mg/dL)</div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>⚡ Quick Access</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {quickLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              background: link.color, borderRadius: 12, padding: '16px 12px',
              textAlign: 'center', textDecoration: 'none', color: 'var(--text-dark)',
              transition: 'transform 0.15s', display: 'block',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{link.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{link.label}</div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Glucose */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>💉 Recent Glucose</h3>
            <Link to="/glucose" className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>View All</Link>
          </div>
          {glucose.length === 0 ? (
            <p style={{ color: 'var(--text-light)' }}>No readings yet. <Link to="/glucose">Add your first →</Link></p>
          ) : (
            <table className="table">
              <thead><tr><th>Level</th><th>Type</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {glucose.map(r => {
                  const s = r.level < 70 ? 'Low' : r.level > 180 ? 'High' : 'Normal';
                  const c = r.level < 70 ? 'badge-red' : r.level > 180 ? 'badge-orange' : 'badge-green';
                  return (
                    <tr key={r._id}>
                      <td><strong>{r.level}</strong></td>
                      <td>{r.type}</td>
                      <td>{new Date(r.recordedAt).toLocaleDateString()}</td>
                      <td><span className={`badge ${c}`}>{s}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Today's Tasks */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>📋 Today's Tasks</h3>
            <Link to="/planner" className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>Open Planner</Link>
          </div>
          {tasks.length === 0 ? (
            <p style={{ color: 'var(--text-light)' }}>No tasks yet. <Link to="/planner">Create your plan →</Link></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.map(task => (
                <div key={task._id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', background: '#f8fffe',
                  borderRadius: 8, border: '1px solid var(--border)',
                }}>
                  <span>{task.completed ? '✅' : '⏳'}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{task.title}</span>
                  <span className="badge badge-green" style={{ marginLeft: 'auto' }}>{task.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
