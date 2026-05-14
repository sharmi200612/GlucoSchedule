import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import Toast from '../components/common/Toast';

const ExercisePage = () => {
  const [exercises, setExercises] = useState([]);
  const [form, setForm]           = useState({ activityType:'walking', durationMinutes:'', scheduledTime:'', notes:'' });
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState({ text:'', type:'' });

  const showToast = (text, type='success') => setToast({ text, type });
  const fetchExercises = () => API.get('/exercise').then(r => setExercises(r.data)).catch(() => {});
  useEffect(() => { fetchExercises(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/exercise', form);
      showToast('✅ Exercise scheduled!');
      setForm({ activityType:'walking', durationMinutes:'', scheduledTime:'', notes:'' });
      fetchExercises();
    } catch { showToast('Failed to schedule exercise.', 'error'); }
    finally { setLoading(false); }
  };

  const toggleComplete = async (ex) => {
    try {
      await API.put(`/exercise/${ex._id}`, { completed: !ex.completed });
      showToast(ex.completed ? 'Marked as pending.' : '✅ Exercise completed!', 'success');
      fetchExercises();
    } catch { showToast('Update failed.', 'error'); }
  };

  const deleteExercise = async (id) => {
    if (!window.confirm('Delete this exercise?')) return;
    try {
      await API.delete(`/exercise/${id}`);
      showToast('🗑️ Exercise deleted!', 'info');
      fetchExercises();
    } catch { showToast('Delete failed.', 'error'); }
  };

  const icons  = { walking:'🚶', yoga:'🧘', workout:'🏋️', cycling:'🚴', swimming:'🏊', other:'⚡' };
  const colors = { walking:'#e3f2fd', yoga:'#f3e5f5', workout:'#fce4ec', cycling:'#fff3e0', swimming:'#e0f7fa', other:'#f1f8e9' };
  const borders= { walking:'#90caf9', yoga:'#ce93d8', workout:'#f48fb1', cycling:'#ffcc02', swimming:'#80deea', other:'#aed581' };

  const completedCount = exercises.filter(e => e.completed).length;
  const totalMins      = exercises.filter(e => e.completed).reduce((a,e) => a+(e.durationMinutes||0), 0);

  return (
    <div>
      <Toast toast={toast} setToast={setToast} />

      <div className="page-header">
        <div><h1>🏃 Exercise Tracker</h1><p>Stay active and manage your diabetes through physical activity</p></div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">📅</div><div className="stat-value">{exercises.length}</div><div className="stat-label">Scheduled Activities</div></div>
        <div className="stat-card" style={{borderLeftColor:'#52b788'}}><div className="stat-icon">✅</div><div className="stat-value">{completedCount}</div><div className="stat-label">Completed</div></div>
        <div className="stat-card" style={{borderLeftColor:'#f4a261'}}><div className="stat-icon">⏱️</div><div className="stat-value">{totalMins}</div><div className="stat-label">Total Exercise Mins</div></div>
        <div className="stat-card" style={{borderLeftColor:'#e63946'}}><div className="stat-icon">⏳</div><div className="stat-value">{exercises.filter(e=>!e.completed).length}</div><div className="stat-label">Pending</div></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20 }}>

        {/* Exercise List */}
        <div className="card">
          <h3 style={{ marginBottom:16 }}>📋 Activity Schedule</h3>
          {exercises.length === 0 ? (
            <p style={{ color:'var(--text-light)' }}>No activities scheduled yet. Add your first one →</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {exercises.map(ex => (
                <div key={ex._id} style={{
                  padding:16, borderRadius:12,
                  border:`1.5px solid ${borders[ex.activityType]||'var(--border)'}`,
                  background: ex.completed ? '#f0faf4' : (colors[ex.activityType]||'#fff'),
                  display:'flex', alignItems:'center', gap:12,
                }}>
                  <span style={{ fontSize:'1.8rem', flexShrink:0 }}>{icons[ex.activityType]||'⚡'}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:'1rem', textTransform:'capitalize' }}>{ex.activityType}</div>
                    <div style={{ fontSize:'0.82rem', color:'var(--text-light)', marginTop:3 }}>
                      {ex.durationMinutes ? `⏱️ ${ex.durationMinutes} mins` : ''}
                      {ex.durationMinutes && ex.scheduledTime ? ' · ' : ''}
                      {ex.scheduledTime ? `⏰ ${ex.scheduledTime}` : ''}
                    </div>
                    {ex.notes && <div style={{ fontSize:'0.78rem', color:'var(--text-light)', marginTop:2 }}>📝 {ex.notes}</div>}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
                    <button onClick={() => toggleComplete(ex)}
                      style={{
                        padding:'6px 14px', borderRadius:8, border:'none', cursor:'pointer',
                        fontWeight:700, fontSize:'0.82rem', fontFamily:'inherit',
                        background: ex.completed ? 'transparent' : '#2d6a4f',
                        color: ex.completed ? '#2d6a4f' : '#fff',
                        border: ex.completed ? '1.5px solid #2d6a4f' : 'none',
                      }}>
                      {ex.completed ? '↩ Undo' : '✅ Mark Done'}
                    </button>
                    <button onClick={() => deleteExercise(ex._id)}
                      style={{
                        padding:'6px 14px', borderRadius:8, border:'none', cursor:'pointer',
                        fontWeight:700, fontSize:'0.82rem', fontFamily:'inherit',
                        background:'#e63946', color:'#fff',
                      }}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        <div className="card">
          <h3 style={{ marginBottom:16 }}>➕ Schedule Activity</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Activity Type</label>
              <select className="form-control" value={form.activityType}
                onChange={e => setForm({...form, activityType:e.target.value})}>
                <option value="walking">🚶 Walking</option>
                <option value="yoga">🧘 Yoga</option>
                <option value="workout">🏋️ Workout</option>
                <option value="cycling">🚴 Cycling</option>
                <option value="swimming">🏊 Swimming</option>
                <option value="other">⚡ Other</option>
              </select>
            </div>
            <div className="form-group"><label>Duration (minutes)</label>
              <input className="form-control" type="number" placeholder="e.g. 30"
                value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes:e.target.value})} />
            </div>
            <div className="form-group"><label>Scheduled Time</label>
              <input className="form-control" type="time"
                value={form.scheduledTime} onChange={e => setForm({...form, scheduledTime:e.target.value})} />
            </div>
            <div className="form-group"><label>Notes</label>
              <input className="form-control" placeholder="Optional notes"
                value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width:'100%', justifyContent:'center' }}>
              {loading ? 'Saving...' : '💾 Schedule Activity'}
            </button>
          </form>

          {/* Tips */}
          <div style={{ marginTop:16, padding:'14px', background:'var(--primary-pale)', borderRadius:10 }}>
            <div style={{ fontWeight:700, marginBottom:8, fontSize:'0.88rem' }}>💡 Exercise Tips</div>
            {['30 min walk lowers blood sugar naturally','Exercise after meals reduces glucose spikes','Stay hydrated before and after activity','Check glucose before intense workouts'].map((tip,i) => (
              <div key={i} style={{ fontSize:'0.8rem', color:'var(--text-mid)', padding:'3px 0', borderBottom:i<3?'1px solid #b7e4c7':'none' }}>• {tip}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExercisePage;
