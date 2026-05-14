// ============================================
// Page: Meal Planning & Diet Management
// ============================================

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

const MealsPage = () => {
  const [meals, setMeals] = useState([]);
  const [form, setForm] = useState({ type: 'breakfast', foods: '', calories: '', scheduledTime: '' });
  const [loading, setLoading] = useState(false);

  const fetchMeals = () => API.get('/meals').then(r => setMeals(r.data)).catch(() => {});
  useEffect(() => { fetchMeals(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        foods: form.foods.split(',').map(f => f.trim()).filter(Boolean),
      };
      await API.post('/meals', payload);
      toast.success('Meal added!');
      setForm({ type: 'breakfast', foods: '', calories: '', scheduledTime: '' });
      fetchMeals();
    } catch { toast.error('Failed to add meal'); }
    finally { setLoading(false); }
  };

  const toggleComplete = async (meal) => {
    try {
      await API.put(`/meals/${meal._id}`, { completed: !meal.completed });
      fetchMeals();
    } catch { toast.error('Update failed'); }
  };

  const deleteMeal = async (id) => {
    try {
      await API.delete(`/meals/${id}`);
      toast.success('Deleted');
      fetchMeals();
    } catch { toast.error('Delete failed'); }
  };

  const mealIcons   = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };
  const mealColors  = { breakfast: '#fff8e1', lunch: '#e8f5e9', dinner: '#e8eaf6', snack: '#fce4ec' };
  const mealBorders = { breakfast: '#ffd54f', lunch: '#66bb6a', dinner: '#7986cb', snack: '#f06292' };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>🥗 Meal Planner</h1>
          <p>Plan your daily meals for better diabetes management</p>
        </div>
      </div>

      {/* Stats Cards — same layout as Medication */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-value">{meals.length}</div>
          <div className="stat-label">Total Meals</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--primary-light)' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-value">{meals.filter(m => m.completed).length}</div>
          <div className="stat-label">Completed Today</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--accent)' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{meals.filter(m => !m.completed).length}</div>
          <div className="stat-label">Pending Today</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f4a261' }}>
          <div className="stat-icon">🔥</div>
          <div className="stat-value">
            {meals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0)}
          </div>
          <div className="stat-label">Total Calories</div>
        </div>
      </div>

      {/* Two-column layout — same as Medication */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

        {/* Meal List */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📋 Your Meals</h3>
          {meals.length === 0 ? (
            <p style={{ color: 'var(--text-light)' }}>No meals planned yet. Add your first one →</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {meals.map(meal => (
                <div key={meal._id} style={{
                  padding: '16px',
                  border: `1.5px solid ${mealBorders[meal.type] || 'var(--border)'}`,
                  borderRadius: 12,
                  background: meal.completed ? '#f0faf4' : (mealColors[meal.type] || '#fff'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}>
                  <span style={{ fontSize: '1.8rem' }}>{mealIcons[meal.type] || '🍽️'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'capitalize' }}>
                      {meal.type}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-mid)', marginTop: 2 }}>
                      {meal.foods?.length > 0 ? meal.foods.join(', ') : '—'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: 2 }}>
                      {meal.calories ? `🔥 ${meal.calories} cal` : ''}
                      {meal.calories && meal.scheduledTime ? ' · ' : ''}
                      {meal.scheduledTime ? `⏰ ${meal.scheduledTime}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    <button
                      className={`btn btn-sm ${meal.completed ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => toggleComplete(meal)}
                    >
                      {meal.completed ? '↩ Undo' : '✅ Mark Done'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteMeal(meal._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Meal Form */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>➕ Add Meal</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Meal Type</label>
              <select className="form-control" value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="breakfast">🌅 Breakfast</option>
                <option value="lunch">☀️ Lunch</option>
                <option value="dinner">🌙 Dinner</option>
                <option value="snack">🍎 Snack</option>
              </select>
            </div>
            <div className="form-group">
              <label>Foods (comma-separated)</label>
              <input className="form-control" placeholder="e.g. Brown rice, Grilled chicken"
                value={form.foods} onChange={e => setForm({ ...form, foods: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Calories</label>
              <input className="form-control" type="number" placeholder="e.g. 400"
                value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Scheduled Time</label>
              <input className="form-control" type="time"
                value={form.scheduledTime}
                onChange={e => setForm({ ...form, scheduledTime: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Saving...' : '💾 Add Meal'}
            </button>
          </form>
        </div>
      </div>

      {/* Diabetes Diet Tips */}
      <div className="card" style={{
        background: 'var(--primary-pale)',
        border: '1px solid #b7e4c7',
        marginTop: 4,
      }}>
        <h3 style={{ marginBottom: 14 }}>💡 Diabetes-Friendly Diet Tips</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 10,
        }}>
          {[
            { icon: '🌾', tip: 'Choose whole grains over refined carbs' },
            { icon: '🥦', tip: 'Fill half your plate with vegetables' },
            { icon: '🚫', tip: 'Limit sugary beverages and sweets' },
            { icon: '🐟', tip: 'Include lean proteins like fish & chicken' },
            { icon: '🫐', tip: 'Eat low-GI fruits like berries' },
            { icon: '⏰', tip: 'Eat meals at regular times every day' },
          ].map(item => (
            <div key={item.tip} style={{
              padding: '12px 14px',
              background: '#fff',
              borderRadius: 10,
              fontSize: '0.85rem',
              border: '1px solid #b7e4c7',
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

export default MealsPage;
