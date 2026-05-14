// ============================================
// Page: Meditation & Stress Management
// ============================================

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

const MeditationPage = () => {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({ sessionType: 'breathing', durationMinutes: '', scheduledTime: '' });
  const [loading, setLoading] = useState(false);

  const fetchSessions = () => API.get('/meditation').then(r => setSessions(r.data)).catch(() => {});
  useEffect(() => { fetchSessions(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/meditation', form);
      toast.success('Session scheduled!');
      setForm({ sessionType: 'breathing', durationMinutes: '', scheduledTime: '' });
      fetchSessions();
    } catch { toast.error('Failed to add session'); }
    finally { setLoading(false); }
  };

  const toggleComplete = async (session) => {
    try {
      await API.put(`/meditation/${session._id}`, { completed: !session.completed });
      fetchSessions();
    } catch { toast.error('Update failed'); }
  };

  const deleteSession = async (id) => {
    try {
      await API.delete(`/meditation/${id}`);
      toast.success('Deleted');
      fetchSessions();
    } catch { toast.error('Delete failed'); }
  };

  const sessionIcons  = { breathing: '🌬️', mindfulness: '🌿', relaxation: '😌', other: '🧘' };
  const sessionColors = { breathing: '#e3f2fd', mindfulness: '#e8f5e9', relaxation: '#f3e5f5', other: '#fce4ec' };
  const sessionBorders= { breathing: '#64b5f6', mindfulness: '#66bb6a', relaxation: '#ba68c8', other: '#f06292' };

  const totalMinutes = sessions.filter(s => s.completed).reduce((a, s) => a + (Number(s.durationMinutes) || 0), 0);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>🧘 Meditation & Stress Management</h1>
          <p>Practice mindfulness for better mental well-being and diabetes care</p>
        </div>
      </div>

      {/* Stats Cards — same layout as Medication */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🧘</div>
          <div className="stat-value">{sessions.length}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--primary-light)' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-value">{sessions.filter(s => s.completed).length}</div>
          <div className="stat-label">Completed Today</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--accent)' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{sessions.filter(s => !s.completed).length}</div>
          <div className="stat-label">Pending Today</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ba68c8' }}>
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{totalMinutes}</div>
          <div className="stat-label">Minutes Practiced</div>
        </div>
      </div>

      {/* Two-column layout — same as Medication */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

        {/* Session List */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📋 Your Sessions</h3>
          {sessions.length === 0 ? (
            <p style={{ color: 'var(--text-light)' }}>No sessions scheduled yet. Add your first one →</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sessions.map(session => (
                <div key={session._id} style={{
                  padding: '16px',
                  border: `1.5px solid ${sessionBorders[session.sessionType] || 'var(--border)'}`,
                  borderRadius: 12,
                  background: session.completed ? '#f0faf4' : (sessionColors[session.sessionType] || '#fff'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}>
                  <span style={{ fontSize: '1.8rem' }}>{sessionIcons[session.sessionType] || '🧘'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'capitalize' }}>
                      {session.sessionType}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-mid)', marginTop: 2 }}>
                      {session.durationMinutes ? `⏱️ ${session.durationMinutes} minutes` : 'Duration not set'}
                    </div>
                    {session.scheduledTime && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: 2 }}>
                        ⏰ {session.scheduledTime}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    <button
                      className={`btn btn-sm ${session.completed ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => toggleComplete(session)}
                    >
                      {session.completed ? '↩ Undo' : '✅ Mark Done'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteSession(session._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Session Form */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>➕ Schedule Session</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Session Type</label>
              <select className="form-control" value={form.sessionType}
                onChange={e => setForm({ ...form, sessionType: e.target.value })}>
                <option value="breathing">🌬️ Breathing</option>
                <option value="mindfulness">🌿 Mindfulness</option>
                <option value="relaxation">😌 Relaxation</option>
                <option value="other">🧘 Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input className="form-control" type="number" placeholder="e.g. 15"
                value={form.durationMinutes}
                onChange={e => setForm({ ...form, durationMinutes: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Scheduled Time</label>
              <input className="form-control" type="time"
                value={form.scheduledTime}
                onChange={e => setForm({ ...form, scheduledTime: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Saving...' : '💾 Schedule Session'}
            </button>
          </form>

          {/* Quick Breathing Exercise Box */}
          <div style={{
            marginTop: 20,
            padding: 16,
            background: '#f3e5f5',
            borderRadius: 12,
            border: '1px solid #ce93d8',
          }}>
            <div style={{ fontWeight: 700, marginBottom: 10, color: '#6a1b9a', fontSize: '0.95rem' }}>
              🌬️ Quick Breathing Exercise
            </div>
            {[
              { step: '1', text: 'Breathe in for 4 counts' },
              { step: '2', text: 'Hold for 4 counts' },
              { step: '3', text: 'Exhale slowly for 6 counts' },
              { step: '4', text: 'Repeat 5 times' },
            ].map(item => (
              <div key={item.step} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 0', fontSize: '0.85rem', color: '#6a1b9a',
                borderBottom: item.step !== '4' ? '1px solid #e1bee7' : 'none',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: '#ba68c8', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                }}>{item.step}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stress Management Tips */}
      <div className="card" style={{
        background: '#f3e5f5',
        border: '1px solid #ce93d8',
        marginTop: 4,
      }}>
        <h3 style={{ marginBottom: 14, color: '#6a1b9a' }}>💡 Stress & Diabetes Tips</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 10,
        }}>
          {[
            { icon: '🧘', tip: 'Meditate for 10–15 minutes daily' },
            { icon: '😴', tip: 'Get 7–8 hours of quality sleep' },
            { icon: '🚶', tip: 'Take short walks to reduce stress' },
            { icon: '📖', tip: 'Journal your feelings and moods' },
            { icon: '🎵', tip: 'Listen to calming music' },
            { icon: '💬', tip: 'Talk to someone you trust' },
          ].map(item => (
            <div key={item.tip} style={{
              padding: '12px 14px',
              background: '#fff',
              borderRadius: 10,
              fontSize: '0.85rem',
              border: '1px solid #ce93d8',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{ color: 'var(--text-mid)' }}>{item.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MeditationPage;
