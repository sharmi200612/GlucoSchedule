import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import Toast from '../components/common/Toast';

const REMINDER_TYPES = [
  { value:'medication', label:'Medication',    icon:'💊' },
  { value:'meal',       label:'Meal',          icon:'🍽️' },
  { value:'glucose',    label:'Glucose Check', icon:'💉' },
  { value:'exercise',   label:'Exercise',      icon:'🏃' },
  { value:'water',      label:'Water Intake',  icon:'💧' },
  { value:'sleep',      label:'Sleep',         icon:'😴' },
  { value:'meditation', label:'Meditation',    icon:'🧘' },
];

const DAILY_PLANNER = [
  { time:'6:00 AM',  icon:'🌅', activity:'Wake Up',                   tip:'Check fasting glucose after waking.' },
  { time:'6:15 AM',  icon:'💧', activity:'Drink Water (2 glasses)',    tip:'Rehydrate after sleep. Helps flush excess glucose.' },
  { time:'6:30 AM',  icon:'🧘', activity:'Morning Meditation (10 min)',tip:'Deep breathing reduces cortisol and blood sugar.' },
  { time:'7:00 AM',  icon:'🚶', activity:'Morning Walk (30 min)',      tip:'Light walking improves insulin sensitivity.' },
  { time:'7:45 AM',  icon:'💊', activity:'Morning Medication',         tip:'Take prescribed medication with water.' },
  { time:'8:00 AM',  icon:'🍳', activity:'Breakfast',                  tip:'Low-GI foods: oats, eggs, whole wheat toast.' },
  { time:'10:00 AM', icon:'💉', activity:'Glucose Check',              tip:'Check blood sugar 2 hours after breakfast.' },
  { time:'10:30 AM', icon:'🍎', activity:'Morning Snack',              tip:'Apple, almonds, or low-fat yogurt.' },
  { time:'12:00 PM', icon:'💧', activity:'Hydration Reminder',         tip:'Drink 1-2 glasses. Avoid sugary drinks.' },
  { time:'1:00 PM',  icon:'🥗', activity:'Lunch',                      tip:'50% vegetables, 25% protein, 25% whole grains.' },
  { time:'2:00 PM',  icon:'💉', activity:'Post-Lunch Glucose Check',   tip:'Target: below 180 mg/dL after meals.' },
  { time:'4:00 PM',  icon:'🍌', activity:'Afternoon Snack',            tip:'Prevents glucose dip before dinner.' },
  { time:'5:30 PM',  icon:'🏃', activity:'Evening Exercise (30 min)',  tip:'30-min walk lowers blood sugar naturally.' },
  { time:'7:00 PM',  icon:'💊', activity:'Evening Medication',         tip:'Take your evening prescribed dose.' },
  { time:'7:30 PM',  icon:'🍽️', activity:'Dinner',                    tip:'Light meal. Avoid heavy carbs at night.' },
  { time:'9:00 PM',  icon:'💉', activity:'Evening Glucose Check',      tip:'Log your evening reading.' },
  { time:'9:30 PM',  icon:'💧', activity:'Final Hydration',            tip:'Last glass of water for the day.' },
  { time:'10:00 PM', icon:'😴', activity:'Sleep (7-8 hours)',          tip:'Good sleep stabilizes blood sugar.' },
];

const CAT_COLORS = {
  wake:'#f4a261', water:'#4fc3f7', meditation:'#ce93d8',
  exercise:'#81c784', medication:'#e57373', meal:'#ffb74d',
  glucose:'#64b5f6', sleep:'#9575cd', 'daily-planner':'#52b788',
};

const HOURS   = Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0'));
const MINUTES = ['00','05','10','15','20','25','30','35','40','45','50','55'];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const [sending, setSending]             = useState(false);
  const [testing, setTesting]             = useState(false);
  const [scheduling, setScheduling]       = useState(false);
  const [toast, setToast]                 = useState({ text:'', type:'' });
  const [activeTab, setActiveTab]         = useState('planner'); // 'planner' | 'custom'
  const [form, setForm] = useState({
    title:'', message:'', type:'medication',
    hour:'08', minute:'00', ampm:'AM', noSchedule:false,
  });

  useEffect(() => { fetchNotifications(); }, []);

  const showToast = (text, type='success') => setToast({ text, type });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {} finally { setLoading(false); }
  };

  // ── Schedule ALL daily planner activities ─
  const handleScheduleDailyPlanner = async () => {
    setScheduling(true);
    try {
      const { data } = await API.post('/notifications/schedule-daily-planner');
      fetchNotifications();
      showToast(data.message || '✅ Daily planner scheduled!', data.success ? 'success' : 'error');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule.', 'error');
    } finally { setScheduling(false); }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    try {
      const { data } = await API.post('/notifications/test-email');
      showToast(data.message, data.success ? 'success' : 'error');
    } catch (err) {
      showToast('Test failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally { setTesting(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) { showToast('Fill in Title and Message.','warning'); return; }
    try {
      setSending(true);
      const scheduledTime = form.noSchedule ? '' : `${form.hour}:${form.minute} ${form.ampm}`;
      const { data } = await API.post('/notifications/create', {
        title:form.title, message:form.message, type:form.type, scheduledTime,
      });
      setForm({ title:'', message:'', type:'medication', hour:'08', minute:'00', ampm:'AM', noSchedule:false });
      fetchNotifications();
      showToast(data.message || '✅ Reminder created!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed.', 'error');
    } finally { setSending(false); }
  };

  const handleDelete = async (id) => {
    try { await API.delete(`/notifications/${id}`); fetchNotifications(); showToast('🗑️ Deleted!','info'); }
    catch { showToast('Failed to delete.','error'); }
  };

  const handleResetAll = async () => {
    if (!window.confirm('Delete ALL notifications?')) return;
    try { await API.delete('/notifications/all'); fetchNotifications(); showToast('🔄 All cleared!','info'); }
    catch { showToast('Failed.','error'); }
  };

  const handleMarkAllRead = async () => {
    await API.put('/notifications/read-all');
    fetchNotifications();
    showToast('✅ All marked as read!','success');
  };

  const handleMarkRead = async (id) => { await API.put(`/notifications/${id}/read`); fetchNotifications(); };

  const typeIcon = (type) => type === 'daily-planner'
    ? (DAILY_PLANNER.find(a => notifications.find(n => n._id && n.type === 'daily-planner'))?.icon || '📅')
    : (REMINDER_TYPES.find(t => t.value === type)?.icon || '🔔');

  const getActivityIcon = (title) => DAILY_PLANNER.find(a => a.activity === title)?.icon || '📅';

  const timeAgo = (date) => {
    const d = Math.floor((Date.now() - new Date(date)) / 60000);
    if (d < 1) return 'Just now';
    if (d < 60) return `${d}m ago`;
    if (d < 1440) return `${Math.floor(d/60)}h ago`;
    return `${Math.floor(d/1440)}d ago`;
  };

  const plannerNotifs  = notifications.filter(n => n.type === 'daily-planner');
  const customNotifs   = notifications.filter(n => n.type !== 'daily-planner');

  return (
    <div>
      <Toast toast={toast} setToast={setToast} />

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>🔔 Notifications & Reminders</h1>
          <p>Schedule daily planner emails at each activity's exact time</p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <button onClick={handleTestEmail} disabled={testing}
            style={{ padding:'10px 16px', borderRadius:8, border:'1.5px solid #90caf9',
              background:'#e3f2fd', color:'#1565c0', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>
            {testing ? '⏳...' : '🧪 Test Email'}
          </button>
          <button onClick={handleResetAll}
            style={{ padding:'10px 16px', borderRadius:8, border:'1.5px solid #f5c2c7',
              background:'#fde8e8', color:'#e63946', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>
            🔄 Reset All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { icon:'🔔', label:'Total',   value:notifications.length,              color:'var(--primary)' },
          { icon:'📅', label:'Planner', value:plannerNotifs.length,              color:'#52b788' },
          { icon:'🔴', label:'Unread',  value:unreadCount,                        color:'#e63946' },
          { icon:'✅', label:'Read',    value:notifications.length-unreadCount,   color:'#52b788' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign:'center', padding:'14px 8px' }}>
            <div style={{ fontSize:'1.5rem' }}>{s.icon}</div>
            <div style={{ fontSize:'1.5rem', fontWeight:800, color:s.color, fontFamily:'Nunito,sans-serif' }}>{s.value}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-light)', fontWeight:600, textTransform:'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 420px', gap:20 }}>

        {/* Left — Notification List */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ margin:0 }}>📬 Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={{ background:'none', border:'1px solid var(--border)',
                borderRadius:8, padding:'5px 12px', cursor:'pointer', fontSize:'0.78rem',
                color:'var(--primary)', fontWeight:600 }}>✅ Mark all read</button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:40, color:'var(--text-light)' }}>Loading...</div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign:'center', padding:40 }}>
              <div style={{ fontSize:'2.5rem', marginBottom:10 }}>🔕</div>
              <p style={{ color:'var(--text-light)' }}>No notifications yet.</p>
              <p style={{ color:'var(--text-light)', fontSize:'0.85rem' }}>Click "Schedule Daily Planner" to start!</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:600, overflowY:'auto' }}>
              {notifications.map(n => (
                <div key={n._id} style={{ padding:'11px 13px', borderRadius:10,
                  background:n.isRead?'#fafafa':'#f0faf4',
                  border:`1.5px solid ${n.isRead?'#eee':'#b7e4c7'}`,
                  display:'flex', gap:10, alignItems:'flex-start' }}>

                  {/* Icon */}
                  <div style={{ fontSize:'1.3rem', flexShrink:0 }}>
                    {n.type === 'daily-planner' ? getActivityIcon(n.title) : (REMINDER_TYPES.find(t=>t.value===n.type)?.icon||'🔔')}
                  </div>

                  <div style={{ flex:1, cursor:n.isRead?'default':'pointer' }}
                    onClick={() => !n.isRead && handleMarkRead(n._id)}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <span style={{ fontWeight:n.isRead?500:700, fontSize:'0.88rem', color:'#1b2d27' }}>{n.title}</span>
                      <span style={{ fontSize:'0.7rem', color:'var(--text-light)', marginLeft:8, flexShrink:0 }}>{timeAgo(n.createdAt)}</span>
                    </div>

                    {/* Scheduled time badge */}
                    {n.scheduledTime && (
                      <div style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:5,
                        background:n.emailSent?'#d8f3dc':'#fff8e1',
                        border:`1px solid ${n.emailSent?'#b7e4c7':'#ffe082'}`,
                        borderRadius:20, padding:'2px 10px' }}>
                        <span style={{ fontSize:'0.72rem', fontWeight:700, color:n.emailSent?'#2d6a4f':'#7a5c00' }}>
                          {n.emailSent ? '✅ Sent at' : '⏰'} {n.scheduledTime}
                        </span>
                      </div>
                    )}

                    {/* Daily planner badge */}
                    {n.type === 'daily-planner' && (
                      <span style={{ display:'inline-block', background:'#e8f5e9', color:'#2d6a4f',
                        borderRadius:6, padding:'1px 8px', fontSize:'0.7rem', fontWeight:700, marginLeft:6 }}>
                        📋 Daily Planner
                      </span>
                    )}
                  </div>

                  <button onClick={() => handleDelete(n._id)}
                    style={{ background:'none', border:'none', cursor:'pointer',
                      color:'#e63946', fontSize:'0.95rem', padding:'2px 4px', flexShrink:0 }}>🗑️</button>

                  {!n.isRead && <div style={{ width:7, height:7, borderRadius:'50%', background:'#2d6a4f', flexShrink:0, marginTop:6 }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — Create Form */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Tab switcher */}
          <div style={{ display:'flex', background:'#f0f0f0', borderRadius:10, padding:4, gap:4 }}>
            <button onClick={() => setActiveTab('planner')}
              style={{ flex:1, padding:'9px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:700,
                fontSize:'0.85rem', transition:'all 0.15s',
                background:activeTab==='planner'?'#2d6a4f':'transparent',
                color:activeTab==='planner'?'#fff':'#666' }}>
              📋 Daily Planner
            </button>
            <button onClick={() => setActiveTab('custom')}
              style={{ flex:1, padding:'9px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:700,
                fontSize:'0.85rem', transition:'all 0.15s',
                background:activeTab==='custom'?'#2d6a4f':'transparent',
                color:activeTab==='custom'?'#fff':'#666' }}>
              ➕ Custom Reminder
            </button>
          </div>

          {/* ── DAILY PLANNER TAB ── */}
          {activeTab === 'planner' && (
            <div className="card">
              <h3 style={{ marginBottom:6 }}>📋 Schedule Daily Planner Emails</h3>
              <p style={{ fontSize:'0.82rem', color:'var(--text-light)', marginBottom:14, lineHeight:1.6 }}>
                Each activity below will send an email to your Gmail at its exact time automatically.
              </p>

              {/* Activity list — scrollable */}
              <div style={{ height:300, overflowY:'scroll', marginBottom:14,
                border:'1.5px solid var(--border)', borderRadius:10 }}>
                {DAILY_PLANNER.map((a, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10,
                    padding:'10px 14px', background:i%2===0?'#f8fffe':'#fff',
                    borderBottom: i < DAILY_PLANNER.length-1 ? '1px solid #f0f0f0' : 'none' }}>
                    <span style={{ fontSize:'1.3rem', flexShrink:0 }}>{a.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:'0.85rem', color:'#1b2d27' }}>{a.activity}</div>
                      <div style={{ fontSize:'0.74rem', color:'var(--text-light)', marginTop:2 }}>{a.tip}</div>
                    </div>
                    <span style={{ fontSize:'0.75rem', fontWeight:700, color:'#2d6a4f',
                      background:'#e8f5e9', padding:'4px 10px', borderRadius:20, flexShrink:0 }}>{a.time}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding:'10px 14px', background:'#e8f5e9', borderRadius:8,
                border:'1px solid #b7e4c7', fontSize:'0.83rem', color:'#2d6a4f',
                fontWeight:600, marginBottom:14 }}>
                📧 {DAILY_PLANNER.length} emails will be sent to your Gmail — one at each activity time
              </div>

              <button className="btn btn-primary" onClick={handleScheduleDailyPlanner}
                disabled={scheduling} style={{ width:'100%', padding:13, fontSize:'0.95rem' }}>
                {scheduling ? '⏳ Scheduling...' : `📅 Schedule All ${DAILY_PLANNER.length} Daily Planner Emails`}
              </button>

              <p style={{ fontSize:'0.75rem', color:'var(--text-light)', textAlign:'center', marginTop:8 }}>
                Emails send automatically each day at their scheduled times while backend is running
              </p>
            </div>
          )}

          {/* ── CUSTOM REMINDER TAB ── */}
          {activeTab === 'custom' && (
            <div className="card">
              <h3 style={{ marginBottom:4 }}>➕ Create Custom Reminder</h3>
              <p style={{ fontSize:'0.78rem', color:'var(--text-light)', marginBottom:14 }}>
                📧 Email sent at your scheduled time automatically
              </p>
              <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:11 }}>
                <div>
                  <label style={labelStyle}>Reminder Type</label>
                  <select style={inputStyle} value={form.type} onChange={e => setForm({...form,type:e.target.value})}>
                    {REMINDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input style={inputStyle} placeholder="e.g. Take Metformin 500mg" required
                    value={form.title} onChange={e => setForm({...form,title:e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Message *</label>
                  <textarea style={{...inputStyle,height:64,resize:'vertical'}}
                    placeholder="Details..." required
                    value={form.message} onChange={e => setForm({...form,message:e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Scheduled Time</label>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                    <input type="checkbox" id="noSched" checked={form.noSchedule}
                      onChange={e => setForm({...form,noSchedule:e.target.checked})}
                      style={{ width:14, height:14, cursor:'pointer' }} />
                    <label htmlFor="noSched" style={{ fontSize:'0.82rem', cursor:'pointer', color:'var(--text-mid)' }}>
                      Send immediately
                    </label>
                  </div>
                  {!form.noSchedule && (
                    <div style={{ display:'flex', gap:6, alignItems:'center', padding:'9px 12px',
                      background:'#f0faf4', borderRadius:10, border:'1.5px solid #b7e4c7' }}>
                      <span>⏰</span>
                      <select value={form.hour} onChange={e=>setForm({...form,hour:e.target.value})} style={selectStyle}>
                        {HOURS.map(h=><option key={h} value={h}>{h}</option>)}
                      </select>
                      <span style={{ fontWeight:800, color:'var(--primary)' }}>:</span>
                      <select value={form.minute} onChange={e=>setForm({...form,minute:e.target.value})} style={selectStyle}>
                        {MINUTES.map(m=><option key={m} value={m}>{m}</option>)}
                      </select>
                      {['AM','PM'].map(p=>(
                        <button key={p} type="button" onClick={()=>setForm({...form,ampm:p})}
                          style={{ padding:'5px 12px', borderRadius:8, border:'none', fontWeight:700,
                            fontSize:'0.82rem', cursor:'pointer',
                            background:form.ampm===p?'#2d6a4f':'#e8f5e9',
                            color:form.ampm===p?'#fff':'#2d6a4f' }}>{p}</button>
                      ))}
                      <span style={{ fontWeight:800, color:'#2d6a4f', fontSize:'0.9rem', fontFamily:'Nunito,sans-serif' }}>
                        {form.hour}:{form.minute} {form.ampm}
                      </span>
                    </div>
                  )}
                </div>
                <button type="submit" className="btn btn-primary" disabled={sending} style={{ padding:11 }}>
                  {sending ? '⏳...' : form.noSchedule ? '🔔 Send Now' : `🔔 Schedule for ${form.hour}:${form.minute} ${form.ampm}`}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const labelStyle = { display:'block', marginBottom:4, fontSize:'0.74rem',
  fontWeight:700, color:'var(--text-mid)', textTransform:'uppercase' };
const inputStyle = { width:'100%', padding:'8px 11px', borderRadius:8,
  border:'1.5px solid var(--border)', fontSize:'0.87rem',
  fontFamily:'inherit', outline:'none', boxSizing:'border-box' };
const selectStyle = { padding:'5px 7px', borderRadius:8, border:'1.5px solid #b7e4c7',
  fontSize:'0.9rem', fontWeight:700, fontFamily:'Nunito,sans-serif',
  color:'#1b2d27', background:'#fff', cursor:'pointer', outline:'none' };

export default NotificationsPage;
