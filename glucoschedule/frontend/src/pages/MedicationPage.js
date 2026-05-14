// ============================================
// Page: Medication Tracker — Fixed
// ============================================

import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import Toast from '../components/common/Toast';

const MedicationPage = () => {
  const [medications, setMedications] = useState([]);
  const [form, setForm]   = useState({ name:'', dosage:'', frequency:'', times:'', notes:'' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ text:'', type:'' });

  const showToast = (text, type='success') => setToast({ text, type });

  const fetchMeds = () =>
    API.get('/medication').then(r => setMedications(r.data)).catch(() => {});

  useEffect(() => { fetchMeds(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('Please enter medication name.', 'warning'); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        times: form.times.split(',').map(t => t.trim()).filter(Boolean),
        takenToday: false,
      };
      await API.post('/medication', payload);
      showToast('✅ Medication added successfully!');
      setForm({ name:'', dosage:'', frequency:'', times:'', notes:'' });
      fetchMeds();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add medication.', 'error');
    } finally { setLoading(false); }
  };

  const toggleTaken = async (med) => {
    try {
      await API.put(`/medication/${med._id}`, { takenToday: !med.takenToday });
      showToast(med.takenToday ? 'Marked as pending.' : '✅ Medication marked as taken!');
      fetchMeds();
    } catch { showToast('Update failed.', 'error'); }
  };

  const deleteMed = async (id) => {
    if (!window.confirm('Delete this medication?')) return;
    try {
      await API.delete(`/medication/${id}`);
      showToast('🗑️ Medication deleted!', 'info');
      fetchMeds();
    } catch { showToast('Delete failed.', 'error'); }
  };

  const takenCount   = medications.filter(m => m.takenToday).length;
  const pendingCount = medications.filter(m => !m.takenToday).length;
  const adherencePct = medications.length
    ? Math.round((takenCount / medications.length) * 100) : 0;

  return (
    <div>
      <Toast toast={toast} setToast={setToast} />

      <div className="page-header">
        <div>
          <h1>💊 Medication Tracker</h1>
          <p>Schedule and track your daily medications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-value">{medications.length}</div>
          <div className="stat-label">Total Medications</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor:'#52b788' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-value" style={{ color:'#52b788' }}>{takenCount}</div>
          <div className="stat-label">Taken Today</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor:'#f4a261' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-value" style={{ color:'#f4a261' }}>{pendingCount}</div>
          <div className="stat-label">Pending Today</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor:'#2E75B6' }}>
          <div className="stat-icon">📊</div>
          <div className="stat-value" style={{ color:'#2E75B6' }}>{adherencePct}%</div>
          <div className="stat-label">Adherence Rate</div>
        </div>
      </div>

      {/* Progress bar */}
      {medications.length > 0 && (
        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontWeight:700, fontFamily:'Nunito,sans-serif' }}>Today's Medication Progress</span>
            <span style={{ fontWeight:800, color: adherencePct===100?'#52b788':'#2E75B6',
              fontFamily:'Nunito,sans-serif' }}>{takenCount}/{medications.length} taken</span>
          </div>
          <div style={{ background:'#e8f5e9', borderRadius:20, height:14, overflow:'hidden' }}>
            <div style={{
              width:`${adherencePct}%`, height:'100%', borderRadius:20,
              background: adherencePct===100
                ? 'linear-gradient(90deg,#52b788,#2d6a4f)'
                : 'linear-gradient(90deg,#2E75B6,#52b788)',
              transition:'width 0.5s ease',
            }} />
          </div>
          {adherencePct === 100 && (
            <div style={{ textAlign:'center', marginTop:8, color:'#2d6a4f', fontWeight:700 }}>
              🎉 All medications taken today! Great adherence!
            </div>
          )}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:20 }}>

        {/* Medication List */}
        <div className="card">
          <h3 style={{ marginBottom:16 }}>📋 Your Medications</h3>
          {medications.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 20px' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:10 }}>💊</div>
              <p style={{ color:'var(--text-light)' }}>No medications added yet.</p>
              <p style={{ color:'var(--text-light)', fontSize:'0.85rem' }}>Add your first medication using the form →</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {medications.map(med => (
                <div key={med._id} style={{
                  padding:16, borderRadius:12,
                  border:`1.5px solid ${med.takenToday ? '#b7e4c7' : 'var(--border)'}`,
                  background: med.takenToday ? '#f0faf4' : '#fff',
                  display:'flex', alignItems:'center', gap:14,
                  transition:'all 0.2s',
                }}>
                  {/* Left color bar */}
                  <div style={{
                    width:5, height:60, borderRadius:4, flexShrink:0,
                    background: med.takenToday ? '#52b788' : '#e63946',
                  }} />

                  <span style={{ fontSize:'1.8rem', flexShrink:0 }}>💊</span>

                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:'1rem', color:'#1b2d27' }}>
                      {med.name}
                      {med.takenToday && (
                        <span style={{ marginLeft:8, background:'#d8f3dc', color:'#2d6a4f',
                          borderRadius:10, padding:'1px 8px', fontSize:'0.72rem', fontWeight:700 }}>
                          ✅ Taken
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize:'0.82rem', color:'var(--text-light)', marginTop:3 }}>
                      {med.dosage && <span>💊 {med.dosage}</span>}
                      {med.dosage && med.frequency && <span> · </span>}
                      {med.frequency && <span>🔄 {med.frequency}</span>}
                    </div>
                    {med.times?.length > 0 && (
                      <div style={{ fontSize:'0.8rem', color:'var(--text-mid)', marginTop:3 }}>
                        ⏰ {med.times.join(', ')}
                      </div>
                    )}
                    {med.notes && (
                      <div style={{ fontSize:'0.78rem', color:'var(--text-light)', marginTop:2 }}>
                        📝 {med.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
                    <button onClick={() => toggleTaken(med)}
                      style={{
                        padding:'7px 14px', borderRadius:8, border:'none',
                        cursor:'pointer', fontWeight:700, fontSize:'0.82rem',
                        fontFamily:'inherit', transition:'all 0.15s',
                        background: med.takenToday ? 'transparent' : '#2d6a4f',
                        color: med.takenToday ? '#2d6a4f' : '#fff',
                        border: med.takenToday ? '1.5px solid #2d6a4f' : 'none',
                      }}>
                      {med.takenToday ? '↩ Undo' : '✅ Mark Taken'}
                    </button>
                    <button onClick={() => deleteMed(med._id)}
                      style={{
                        padding:'7px 14px', borderRadius:8, border:'none',
                        cursor:'pointer', fontWeight:700, fontSize:'0.82rem',
                        fontFamily:'inherit', background:'#e63946', color:'#fff',
                      }}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Form */}
        <div className="card">
          <h3 style={{ marginBottom:16 }}>➕ Add Medication</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Medication Name *</label>
              <input className="form-control" placeholder="e.g. Metformin" required
                value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
            </div>
            <div className="form-group">
              <label>Dosage</label>
              <input className="form-control" placeholder="e.g. 500mg"
                value={form.dosage} onChange={e => setForm({...form, dosage:e.target.value})} />
            </div>
            <div className="form-group">
              <label>Frequency</label>
              <select className="form-control" value={form.frequency}
                onChange={e => setForm({...form, frequency:e.target.value})}>
                <option value="">Select frequency</option>
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="Before meals">Before meals</option>
                <option value="After meals">After meals</option>
                <option value="At bedtime">At bedtime</option>
                <option value="As needed">As needed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Times (comma-separated)</label>
              <input className="form-control" placeholder="e.g. 08:00, 20:00"
                value={form.times} onChange={e => setForm({...form, times:e.target.value})} />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input className="form-control" placeholder="e.g. Take after breakfast"
                value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width:'100%', justifyContent:'center', padding:12 }}>
              {loading ? '⏳ Saving...' : '💾 Add Medication'}
            </button>
          </form>

          {/* Tips */}
          <div style={{ marginTop:16, padding:14, background:'var(--primary-pale)', borderRadius:10 }}>
            <div style={{ fontWeight:700, marginBottom:8, fontSize:'0.88rem' }}>💡 Medication Tips</div>
            {[
              'Take medications at the same time every day',
              'Never skip a dose without doctor advice',
              'Store medications at room temperature',
              'Check expiry dates regularly',
            ].map((tip,i,arr) => (
              <div key={i} style={{ fontSize:'0.8rem', color:'var(--text-mid)', padding:'3px 0',
                borderBottom:i<arr.length-1?'1px solid #b7e4c7':'none' }}>• {tip}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationPage;
