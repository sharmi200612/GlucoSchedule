// ============================================
// Page: Blood Glucose Monitoring
// ============================================

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import API from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const GlucosePage = () => {
  const [readings, setReadings] = useState([]);
  const [form, setForm] = useState({ level: '', type: 'fasting', notes: '' });
  const [loading, setLoading] = useState(false);

  const fetchReadings = async () => {
    try {
      const { data } = await API.get('/glucose');
      setReadings(data);
    } catch { toast.error('Failed to load readings'); }
  };

  useEffect(() => { fetchReadings(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/glucose', form);
      toast.success('Reading added!');
      setForm({ level: '', type: 'fasting', notes: '' });
      fetchReadings();
    } catch { toast.error('Failed to add reading'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/glucose/${id}`);
      toast.success('Reading deleted');
      fetchReadings();
    } catch { toast.error('Failed to delete'); }
  };

  // Chart data (last 14 readings reversed to chronological)
  const chartReadings = [...readings].reverse().slice(-14);
  const chartData = {
    labels: chartReadings.map(r => new Date(r.recordedAt).toLocaleDateString()),
    datasets: [{
      label: 'Blood Glucose (mg/dL)',
      data: chartReadings.map(r => r.level),
      borderColor: '#2d6a4f',
      backgroundColor: 'rgba(45,106,79,0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 5,
      pointBackgroundColor: chartReadings.map(r =>
        r.level < 70 ? '#e63946' : r.level > 180 ? '#f4a261' : '#2d6a4f'
      ),
    }],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        min: 40,
        grid: { color: '#e8f5e9' },
        ticks: { callback: v => `${v} mg/dL` },
      },
    },
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>💉 Blood Glucose Monitor</h1>
          <p>Track and visualize your daily blood sugar levels</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Readings', value: readings.length, icon: '📊' },
          { label: 'Latest (mg/dL)', value: readings[0]?.level ?? '—', icon: '💉' },
          { label: 'Low Readings', value: readings.filter(r => r.level < 70).length, icon: '🔴' },
          { label: 'High Readings', value: readings.filter(r => r.level > 180).length, icon: '🟠' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Chart */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📈 Glucose Trend</h3>
          {readings.length > 1
            ? <Line data={chartData} options={chartOptions} />
            : <p style={{ color: 'var(--text-light)' }}>Add at least 2 readings to see the trend chart.</p>
          }
        </div>

        {/* Add reading form */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>➕ Add Reading</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Blood Sugar Level (mg/dL)</label>
              <input className="form-control" type="number" placeholder="e.g. 120"
                value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Reading Type</label>
              <select className="form-control" value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="fasting">Fasting</option>
                <option value="post-meal">Post-Meal</option>
                <option value="random">Random</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <input className="form-control" type="text" placeholder="Any notes..."
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Saving...' : '💾 Save Reading'}
            </button>
          </form>
        </div>
      </div>

      {/* Readings table */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>📋 Readings History</h3>
        {readings.length === 0 ? (
          <p style={{ color: 'var(--text-light)' }}>No readings yet. Add your first reading above!</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Level</th><th>Type</th><th>Date</th><th>Notes</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {readings.map(r => {
                const status = r.level < 70 ? 'Low' : r.level > 180 ? 'High' : 'Normal';
                const cls = r.level < 70 ? 'badge-red' : r.level > 180 ? 'badge-orange' : 'badge-green';
                return (
                  <tr key={r._id}>
                    <td><strong>{r.level} mg/dL</strong></td>
                    <td>{r.type}</td>
                    <td>{new Date(r.recordedAt).toLocaleString()}</td>
                    <td>{r.notes || '—'}</td>
                    <td><span className={`badge ${cls}`}>{status}</span></td>
                    <td>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(r._id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GlucosePage;
