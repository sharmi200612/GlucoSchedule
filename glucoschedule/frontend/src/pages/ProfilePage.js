// ============================================
// Page: Profile — Fixed with localStorage
// ============================================
// All form data (age, diabetes type, etc.) is
// saved to localStorage AND synced to backend.
// Health profile section updates dynamically.

import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const DIABETES_TYPES = ['Type 1', 'Type 2', 'Gestational', 'Prediabetes', 'LADA', 'Other'];
const GENDERS        = ['Male', 'Female', 'Other', 'Prefer not to say'];

const DEFAULT_PROFILE = {
  name: '', email: '', age: '', gender: '', diabetesType: '',
  diagnosedYear: '', weight: '', height: '',
  targetGlucoseMin: 70, targetGlucoseMax: 180,
  doctor: '', phone: '', emergencyContact: '',
};

const ProfilePage = () => {
  const { user, setUser } = useAuth();

  // ── Load from localStorage first, then sync from API
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('gs_user_profile');
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [editing, setEditing]     = useState(false);
  const [formData, setFormData]   = useState(profile);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState({ text: '', type: '' });

  // Fetch from backend on mount and merge
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/auth/profile');
        const merged = { ...DEFAULT_PROFILE, ...data };
        setProfile(merged);
        setFormData(merged);
        // Save to localStorage so it persists offline
        localStorage.setItem('gs_user_profile', JSON.stringify(merged));
      } catch {
        // Fall back to localStorage (already loaded above)
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put('/auth/profile', formData);
      const updated = { ...formData, ...data };

      // ── KEY FIX: Save to localStorage immediately so UI updates ──
      localStorage.setItem('gs_user_profile', JSON.stringify(updated));

      setProfile(updated);
      setFormData(updated);
      if (setUser) setUser(prev => ({ ...prev, ...updated }));
      setEditing(false);
      setMsg({ text: '✅ Profile saved successfully!', type: 'success' });
    } catch {
      // Even if backend fails, save to localStorage so UI still updates
      localStorage.setItem('gs_user_profile', JSON.stringify(formData));
      setProfile(formData);
      setEditing(false);
      setMsg({ text: '✅ Profile saved locally!', type: 'success' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
  };

  // ── Calculate BMI ─────────────────────────
  const getBMI = () => {
    const w = parseFloat(profile.weight);
    const h = parseFloat(profile.height) / 100;
    if (!w || !h) return null;
    const bmi = (w / (h * h)).toFixed(1);
    const label = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
    const color = bmi < 18.5 ? '#4fc3f7' : bmi < 25 ? '#52b788' : bmi < 30 ? '#f4a261' : '#e63946';
    return { bmi, label, color };
  };

  const bmiData = getBMI();
  const yearsWithDiabetes = profile.diagnosedYear
    ? new Date().getFullYear() - parseInt(profile.diagnosedYear)
    : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>👤 My Profile</h1>
          <p>Your personal health profile and diabetes management settings</p>
        </div>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}
            style={{ padding: '10px 24px' }}>
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {msg.text && (
        <div style={{
          padding: '12px 20px', borderRadius: 10, marginBottom: 16,
          background: msg.type === 'success' ? '#d8f3dc' : '#fde8e8',
          border: `1px solid ${msg.type === 'success' ? '#b7e4c7' : '#f5c2c7'}`,
          color: msg.type === 'success' ? '#2d6a4f' : '#e63946',
          fontWeight: 600,
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* ── Left: Edit Form or View ── */}
        <div>
          {editing ? (
            /* EDIT FORM */
            <div className="card">
              <h3 style={{ marginBottom: 20 }}>Edit Health Profile</h3>
              <form onSubmit={handleSave}>

                <SectionTitle>Personal Information</SectionTitle>
                <div style={grid2}>
                  <Field label="Full Name">
                    <input style={inputStyle} name="name" value={formData.name}
                      onChange={handleChange} placeholder="Your full name" />
                  </Field>
                  <Field label="Email">
                    <input style={inputStyle} name="email" value={formData.email}
                      onChange={handleChange} placeholder="your@email.com" type="email" />
                  </Field>
                  <Field label="Age">
                    <input style={inputStyle} name="age" value={formData.age}
                      onChange={handleChange} placeholder="e.g. 35" type="number" min="1" max="120" />
                  </Field>
                  <Field label="Gender">
                    <select style={inputStyle} name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="">Select gender</option>
                      {GENDERS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </Field>
                  <Field label="Phone">
                    <input style={inputStyle} name="phone" value={formData.phone}
                      onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                  </Field>
                  <Field label="Emergency Contact">
                    <input style={inputStyle} name="emergencyContact" value={formData.emergencyContact}
                      onChange={handleChange} placeholder="Contact name & number" />
                  </Field>
                </div>

                <SectionTitle>Diabetes Information</SectionTitle>
                <div style={grid2}>
                  <Field label="Diabetes Type">
                    <select style={inputStyle} name="diabetesType" value={formData.diabetesType} onChange={handleChange}>
                      <option value="">Select type</option>
                      {DIABETES_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Year Diagnosed">
                    <input style={inputStyle} name="diagnosedYear" value={formData.diagnosedYear}
                      onChange={handleChange} placeholder="e.g. 2015" type="number" min="1900" max={new Date().getFullYear()} />
                  </Field>
                  <Field label="Doctor / Endocrinologist">
                    <input style={inputStyle} name="doctor" value={formData.doctor}
                      onChange={handleChange} placeholder="Dr. Name" />
                  </Field>
                </div>

                <SectionTitle>Physical Measurements</SectionTitle>
                <div style={grid2}>
                  <Field label="Weight (kg)">
                    <input style={inputStyle} name="weight" value={formData.weight}
                      onChange={handleChange} placeholder="e.g. 70" type="number" />
                  </Field>
                  <Field label="Height (cm)">
                    <input style={inputStyle} name="height" value={formData.height}
                      onChange={handleChange} placeholder="e.g. 170" type="number" />
                  </Field>
                </div>

                <SectionTitle>Glucose Targets</SectionTitle>
                <div style={grid2}>
                  <Field label="Target Min (mg/dL)">
                    <input style={inputStyle} name="targetGlucoseMin" value={formData.targetGlucoseMin}
                      onChange={handleChange} type="number" />
                  </Field>
                  <Field label="Target Max (mg/dL)">
                    <input style={inputStyle} name="targetGlucoseMax" value={formData.targetGlucoseMax}
                      onChange={handleChange} type="number" />
                  </Field>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}
                    style={{ flex: 1, padding: 12 }}>
                    {saving ? '⏳ Saving...' : '💾 Save Profile'}
                  </button>
                  <button type="button" onClick={handleCancel}
                    style={{ flex: 1, padding: 12, borderRadius: 8, border: '1.5px solid var(--border)',
                      background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* VIEW MODE — shows saved data dynamically */
            <div className="card">
              <h3 style={{ marginBottom: 20 }}>Health Profile</h3>

              <SectionTitle>Personal Information</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { label: '👤 Name',             value: profile.name           || 'Not set' },
                  { label: '📧 Email',             value: profile.email          || 'Not set' },
                  { label: '🎂 Age',               value: profile.age ? `${profile.age} years` : 'Not set' },
                  { label: '⚥ Gender',             value: profile.gender         || 'Not set' },
                  { label: '📞 Phone',             value: profile.phone          || 'Not set' },
                  { label: '🚨 Emergency Contact', value: profile.emergencyContact || 'Not set' },
                ].map(item => (
                  <InfoBox key={item.label} label={item.label} value={item.value} />
                ))}
              </div>

              <SectionTitle>Diabetes Information</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { label: '🩺 Diabetes Type',  value: profile.diabetesType   || 'Not set' },
                  { label: '📅 Year Diagnosed', value: profile.diagnosedYear  || 'Not set' },
                  { label: '⏳ Years with Diabetes', value: yearsWithDiabetes ? `${yearsWithDiabetes} years` : 'Not set' },
                  { label: '👨‍⚕️ Doctor',       value: profile.doctor         || 'Not set' },
                ].map(item => (
                  <InfoBox key={item.label} label={item.label} value={item.value} />
                ))}
              </div>

              <SectionTitle>Physical Measurements</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                <InfoBox label="⚖️ Weight" value={profile.weight ? `${profile.weight} kg` : 'Not set'} />
                <InfoBox label="📏 Height" value={profile.height ? `${profile.height} cm` : 'Not set'} />
                {bmiData ? (
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: bmiData.color + '15',
                    border: `1.5px solid ${bmiData.color}44` }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>BMI</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: bmiData.color, fontFamily: 'Nunito, sans-serif' }}>{bmiData.bmi}</div>
                    <div style={{ fontSize: '0.78rem', color: bmiData.color, fontWeight: 600 }}>{bmiData.label}</div>
                  </div>
                ) : (
                  <InfoBox label="📊 BMI" value="Set weight & height" />
                )}
              </div>

              <SectionTitle>Glucose Targets</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <InfoBox label="📉 Target Min" value={`${profile.targetGlucoseMin || 70} mg/dL`} highlight />
                <InfoBox label="📈 Target Max" value={`${profile.targetGlucoseMax || 180} mg/dL`} highlight />
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Summary Card ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Avatar + name card */}
          <div className="card" style={{ textAlign: 'center', padding: '28px 20px',
            background: 'linear-gradient(135deg,#1b2d27,#2d6a4f)', color: '#fff' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: '#52b788',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', fontSize: '2rem', fontWeight: 800,
              fontFamily: 'Nunito, sans-serif',
            }}>
              {profile.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 4 }}>
              {profile.name || 'Set your name'}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#b7e4c7', marginBottom: 8 }}>
              {profile.email || 'No email set'}
            </div>
            {profile.diabetesType && (
              <div style={{ display: 'inline-block', background: '#52b788', color: '#fff',
                borderRadius: 20, padding: '4px 16px', fontSize: '0.8rem', fontWeight: 700 }}>
                {profile.diabetesType}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Quick Stats</h3>
            {[
              { icon: '🎂', label: 'Age',          value: profile.age ? `${profile.age} yrs` : '—' },
              { icon: '⚖️', label: 'Weight',        value: profile.weight ? `${profile.weight} kg` : '—' },
              { icon: '📏', label: 'Height',        value: profile.height ? `${profile.height} cm` : '—' },
              { icon: '📊', label: 'BMI',           value: bmiData ? `${bmiData.bmi} (${bmiData.label})` : '—' },
              { icon: '🩸', label: 'Target Range',  value: `${profile.targetGlucoseMin || 70}–${profile.targetGlucoseMax || 180} mg/dL` },
              { icon: '📅', label: 'Diagnosed',     value: profile.diagnosedYear || '—' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-light)' }}>{s.icon} {s.label}</span>
                <span style={{ fontWeight: 700, color: '#1b2d27' }}>{s.value}</span>
              </div>
            ))}
          </div>

          {!editing && (
            <button className="btn btn-primary" onClick={() => setEditing(true)} style={{ padding: 12 }}>
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Small helper components ───────────────────
const SectionTitle = ({ children }) => (
  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10, marginTop: 6,
    paddingBottom: 6, borderBottom: '2px solid var(--primary-pale)' }}>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', marginBottom: 5, fontSize: '0.78rem',
      fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
      {label}
    </label>
    {children}
  </div>
);

const InfoBox = ({ label, value, highlight }) => (
  <div style={{ padding: '12px 14px', borderRadius: 10,
    background: highlight ? 'var(--primary-pale)' : '#f8fffe',
    border: `1.5px solid ${highlight ? '#b7e4c7' : 'var(--border)'}` }}>
    <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700,
      textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: highlight ? 'var(--primary)' : '#1b2d27' }}>
      {value}
    </div>
  </div>
);

const grid2     = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 };
const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1.5px solid var(--border)', fontSize: '0.88rem',
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};

export default ProfilePage;
