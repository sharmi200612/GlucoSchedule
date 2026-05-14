// ============================================
// Page: Personalized Daily Planner
// ============================================

import React, { useState, useEffect } from 'react';
import API from '../utils/api';

const DEFAULT_SCHEDULE = [
  { time: '6:00 AM',  icon: '🌅', category: 'wake',       activity: 'Wake Up',                   note: 'Check fasting blood glucose immediately after waking.',    done: false },
  { time: '6:15 AM',  icon: '💧', category: 'water',      activity: 'Drink Water (2 glasses)',    note: 'Rehydrate after sleep. Helps flush excess glucose.',        done: false },
  { time: '6:30 AM',  icon: '🧘', category: 'meditation', activity: 'Morning Meditation (10 min)',note: 'Deep breathing reduces cortisol, which raises blood sugar.', done: false },
  { time: '7:00 AM',  icon: '🚶', category: 'exercise',   activity: 'Morning Walk (30 min)',      note: 'Light walking improves insulin sensitivity for the day.',    done: false },
  { time: '7:45 AM',  icon: '💊', category: 'medication', activity: 'Morning Medication',         note: 'Take prescribed medication with water, not on empty stomach.',done: false },
  { time: '8:00 AM',  icon: '🍳', category: 'meal',       activity: 'Breakfast',                  note: 'Low-GI foods: oats, eggs, whole wheat toast, avocado.',      done: false },
  { time: '10:00 AM', icon: '💉', category: 'glucose',    activity: 'Glucose Check',              note: 'Check blood sugar 2 hours after breakfast. Log in app.',     done: false },
  { time: '10:30 AM', icon: '🍎', category: 'meal',       activity: 'Morning Snack',              note: 'Small snack: apple, handful of almonds, or low-fat yogurt.',  done: false },
  { time: '12:00 PM', icon: '💧', category: 'water',      activity: 'Hydration Reminder',         note: 'Drink 1-2 glasses of water. Avoid sugary drinks.',           done: false },
  { time: '1:00 PM',  icon: '🥗', category: 'meal',       activity: 'Lunch',                      note: '50% vegetables, 25% lean protein, 25% whole grains.',        done: false },
  { time: '2:00 PM',  icon: '💉', category: 'glucose',    activity: 'Post-Lunch Glucose Check',   note: 'Log your reading. Target: below 180 mg/dL after meals.',     done: false },
  { time: '3:30 PM',  icon: '💧', category: 'water',      activity: 'Hydration Reminder',         note: 'Stay hydrated throughout the afternoon.',                     done: false },
  { time: '4:00 PM',  icon: '🍌', category: 'meal',       activity: 'Afternoon Snack',            note: 'Prevents glucose dip before dinner. Try nuts or fruit.',     done: false },
  { time: '5:30 PM',  icon: '🏃', category: 'exercise',   activity: 'Evening Exercise (30 min)',  note: '30-min walk or yoga. Exercise lowers blood sugar naturally.', done: false },
  { time: '7:00 PM',  icon: '💊', category: 'medication', activity: 'Evening Medication',         note: 'Take your evening prescribed dose.',                          done: false },
  { time: '7:30 PM',  icon: '🍽️', category: 'meal',      activity: 'Dinner',                     note: 'Light meal. Avoid heavy carbs at night. Eat by 8PM.',        done: false },
  { time: '8:30 PM',  icon: '💉', category: 'glucose',    activity: 'Evening Glucose Check',      note: 'Log your evening reading before winding down.',              done: false },
  { time: '9:00 PM',  icon: '💧', category: 'water',      activity: 'Final Hydration',            note: 'Last glass of water for the day.',                            done: false },
  { time: '9:30 PM',  icon: '📖', category: 'wind-down',  activity: 'Wind Down / No Screens',     note: 'Avoid phones/TV 30 min before bed. Read or relax.',          done: false },
  { time: '10:00 PM', icon: '😴', category: 'sleep',      activity: 'Sleep (7-8 hours)',          note: 'Good sleep is essential. Poor sleep raises blood sugar.',    done: false },
];

const CATEGORY_COLORS = {
  wake: '#f4a261', water: '#4fc3f7', meditation: '#ce93d8',
  exercise: '#81c784', medication: '#e57373', meal: '#ffb74d',
  glucose: '#64b5f6', 'wind-down': '#a5d6a7', sleep: '#9575cd',
};

const PlannerPage = () => {
  const [schedule, setSchedule] = useState(() => {
    try {
      const saved = localStorage.getItem('gs_daily_planner');
      const today = new Date().toDateString();
      const savedDate = localStorage.getItem('gs_planner_date');
      if (saved && savedDate === today) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SCHEDULE;
  });

  const [tasks, setTasks]   = useState([]);
  const [form, setForm]     = useState({ title: '', dueTime: '', priority: 'normal' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    localStorage.setItem('gs_daily_planner', JSON.stringify(schedule));
    localStorage.setItem('gs_planner_date', new Date().toDateString());
  }, [schedule]);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try { const { data } = await API.get('/planner'); setTasks(data || []); }
    catch { setTasks([]); }
  };

  const toggleDone = (index) => {
    setSchedule(prev => prev.map((item, i) => i === index ? { ...item, done: !item.done } : item));
  };

  const resetSchedule = () => {
    setSchedule(DEFAULT_SCHEDULE.map(i => ({ ...i, done: false })));
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await API.post('/planner', { ...form, category: 'other' });
      setForm({ title: '', dueTime: '', priority: 'normal' });
      fetchTasks();
      setMsg('Task added!');
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('Failed to add task.'); }
    finally { setSaving(false); }
  };

  const handleDeleteTask = async (id) => {
    try { await API.delete(`/planner/${id}`); fetchTasks(); } catch {}
  };

  const completedCount = schedule.filter(s => s.done).length;
  const progressPct    = Math.round((completedCount / schedule.length) * 100);
  const filtered       = filter === 'all' ? schedule : schedule.filter(s => s.category === filter);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>📋 Daily Planner</h1>
          <p>Your personalized diabetes management schedule — {new Date().toDateString()}</p>
        </div>
        <button onClick={resetSchedule} style={{
          padding: '10px 20px', borderRadius: 8, border: '1.5px solid var(--border)',
          background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
        }}>🔄 Reset Today</button>
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>Today's Progress</span>
          <span style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'Nunito, sans-serif' }}>
            {completedCount} / {schedule.length} ({progressPct}%)
          </span>
        </div>
        <div style={{ background: '#e8f5e9', borderRadius: 20, height: 14, overflow: 'hidden' }}>
          <div style={{
            width: `${progressPct}%`, height: '100%', borderRadius: 20,
            background: 'linear-gradient(90deg,#2d6a4f,#52b788)', transition: 'width 0.4s ease',
          }} />
        </div>
        {progressPct === 100 && (
          <div style={{ textAlign: 'center', marginTop: 10, color: '#2d6a4f', fontWeight: 700 }}>
            Amazing! You completed your full daily plan!
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '✅', label: 'Completed',   value: completedCount,                                        color: '#52b788' },
          { icon: '⏳', label: 'Remaining',   value: schedule.length - completedCount,                      color: '#f4a261' },
          { icon: '💊', label: 'Medications', value: schedule.filter(s => s.category === 'medication').length, color: '#e57373' },
          { icon: '🍽️', label: 'Meals',       value: schedule.filter(s => s.category === 'meal').length,    color: '#ffb74d' },
          { icon: '💉', label: 'Glucose',     value: schedule.filter(s => s.category === 'glucose').length, color: '#64b5f6' },
          { icon: '🏃', label: 'Exercise',    value: schedule.filter(s => s.category === 'exercise').length,color: '#81c784' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
            <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: 'Nunito, sans-serif' }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* Schedule list */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0 }}>Today's Schedule</h3>
            <select value={filter} onChange={e => setFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: '0.82rem', fontFamily: 'inherit' }}>
              <option value="all">All Activities</option>
              {['wake','water','meditation','exercise','medication','meal','glucose','wind-down','sleep'].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 620, overflowY: 'auto' }}>
            {filtered.map((item, i) => {
              const realIdx = schedule.findIndex(s => s.time === item.time && s.activity === item.activity);
              return (
                <div key={i} onClick={() => toggleDone(realIdx)} style={{
                  display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                  background: item.done ? '#f0faf4' : '#fff',
                  border: `1.5px solid ${item.done ? '#b7e4c7' : 'var(--border)'}`,
                  opacity: item.done ? 0.7 : 1, transition: 'all 0.15s',
                }}>
                  <div style={{ width: 4, borderRadius: 4, background: CATEGORY_COLORS[item.category] || '#2d6a4f', flexShrink: 0 }} />
                  <div style={{ fontSize: '1.4rem', flexShrink: 0 }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem',
                        textDecoration: item.done ? 'line-through' : 'none',
                        color: item.done ? '#aaa' : '#1b2d27' }}>{item.activity}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700,
                        color: CATEGORY_COLORS[item.category] || 'var(--primary)',
                        background: (CATEGORY_COLORS[item.category] || '#2d6a4f') + '18',
                        padding: '2px 8px', borderRadius: 6, flexShrink: 0, marginLeft: 8 }}>{item.time}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 3 }}>{item.note}</div>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${item.done ? '#52b788' : '#ccc'}`,
                    background: item.done ? '#52b788' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.8rem', fontWeight: 700,
                  }}>{item.done ? '✓' : ''}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Add Custom Task</h3>
            {msg && <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 10,
              background: '#d8f3dc', color: '#2d6a4f', fontSize: '0.85rem', fontWeight: 600 }}>{msg}</div>}
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input style={inputStyle} placeholder="Task title" required
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <input style={inputStyle} type="time"
                value={form.dueTime} onChange={e => setForm({ ...form, dueTime: e.target.value })} />
              <select style={inputStyle} value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '10px' }}>
                {saving ? 'Adding...' : '+ Add Task'}
              </button>
            </form>
          </div>

          {tasks.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 12 }}>My Tasks</h3>
              {tasks.map(t => (
                <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '9px 12px', borderRadius: 8, background: '#fafafa',
                  border: '1px solid var(--border)', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{t.title}</div>
                    {t.dueTime && <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{t.dueTime}</div>}
                  </div>
                  <button onClick={() => handleDeleteTask(t._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e63946' }}>🗑️</button>
                </div>
              ))}
            </div>
          )}

          <div className="card" style={{ background: 'linear-gradient(135deg,#1b2d27,#2d6a4f)', color: '#fff' }}>
            <h3 style={{ color: '#fff', marginBottom: 10 }}>Daily Tips</h3>
            {['Check glucose before & after meals','Never skip medication',
              '30 min walk lowers glucose naturally','Drink 8+ glasses of water',
              '7-8 hrs sleep stabilizes hormones'].map((tip, i, arr) => (
              <div key={i} style={{ fontSize: '0.82rem', color: '#b7e4c7', padding: '5px 0',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1.5px solid var(--border)', fontSize: '0.88rem',
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};

export default PlannerPage;
