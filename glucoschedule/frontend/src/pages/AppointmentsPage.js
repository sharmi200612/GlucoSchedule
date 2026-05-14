import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ doctorName: '', specialty: '', date: '', time: '', location: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const fetchAppts = () => API.get('/appointments').then(r => setAppointments(r.data)).catch(() => {});
  useEffect(() => { fetchAppts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await API.post('/appointments', form); toast.success('Appointment scheduled!');
      setForm({ doctorName: '', specialty: '', date: '', time: '', location: '', notes: '' }); fetchAppts();
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  const deleteAppt = async (id) => {
    try { await API.delete(`/appointments/${id}`); toast.success('Deleted'); fetchAppts(); }
    catch { toast.error('Delete failed'); }
  };

  const upcoming = appointments.filter(a => new Date(a.date) >= new Date());

  return (
    <div>
      <div className="page-header">
        <div><h1>🩺 Doctor Appointments</h1><p>Schedule and manage your medical consultations</p></div>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">📅</div>
          <div className="stat-value">{appointments.length}</div><div className="stat-label">Total Appointments</div></div>
        <div className="stat-card" style={{borderLeftColor:'var(--primary-light)'}}>
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{upcoming.length}</div><div className="stat-label">Upcoming</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📋 All Appointments</h3>
          {appointments.length === 0 ? <p style={{ color: 'var(--text-light)' }}>No appointments scheduled.</p> : (
            <table className="table">
              <thead><tr><th>Doctor</th><th>Specialty</th><th>Date</th><th>Time</th><th>Location</th><th></th></tr></thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a._id}>
                    <td><strong>Dr. {a.doctorName}</strong></td>
                    <td>{a.specialty || '—'}</td>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td>{a.time || '—'}</td>
                    <td>{a.location || '—'}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => deleteAppt(a._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>➕ Schedule Appointment</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Doctor Name</label>
              <input className="form-control" placeholder="e.g. Dr. Sharma"
                value={form.doctorName} onChange={e => setForm({ ...form, doctorName: e.target.value })} required />
            </div>
            <div className="form-group"><label>Specialty</label>
              <input className="form-control" placeholder="e.g. Endocrinologist"
                value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label>Date</label>
                <input className="form-control" type="date"
                  value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="form-group"><label>Time</label>
                <input className="form-control" type="time"
                  value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
              </div>
            </div>
            <div className="form-group"><label>Location / Hospital</label>
              <input className="form-control" placeholder="e.g. City Hospital"
                value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="form-group"><label>Notes</label>
              <input className="form-control" placeholder="Consultation notes"
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Saving...' : '💾 Schedule'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
