import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', age: '', gender: '', diabetesType: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState({ text: '', type: '' });
  const { login } = useAuth();
  const navigate  = useNavigate();

  const showMsg = (text, type) => {
    setMsg({ text, type });
    if (type === 'success') setTimeout(() => navigate('/'), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      const { data } = await API.post('/auth/register', form);
      login(data);
      showMsg(`🎉 Registration Successful! Welcome to GlucoSchedule, ${data.name}! Check your Gmail inbox for a welcome email.`, 'success');
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.message || 'Registration failed. Please try again.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🩺</div>
          <h2 style={styles.title}>Create Your Account</h2>
          <p style={styles.sub}>Join GlucoSchedule to manage your diabetes care</p>
        </div>

        {/* Success / Error Message */}
        {msg.text && (
          <div style={{
            padding: '14px 18px', borderRadius: 10, marginBottom: 20,
            background: msg.type === 'success' ? '#d8f3dc' : '#fde8e8',
            border: `1.5px solid ${msg.type === 'success' ? '#b7e4c7' : '#f5c2c7'}`,
            color: msg.type === 'success' ? '#2d6a4f' : '#c0392b',
            fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.6,
          }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" type="text" name="name"
              placeholder="Your full name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" name="email"
              placeholder="your@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" name="password"
              placeholder="Min 6 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Age</label>
              <input className="form-control" type="number" name="age"
                placeholder="Age" value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select className="form-control" name="gender" value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Diabetes Type</label>
            <select className="form-control" name="diabetesType" value={form.diabetesType}
              onChange={e => setForm({ ...form, diabetesType: e.target.value })}>
              <option value="">Select type</option>
              <option value="Type 1">Type 1</option>
              <option value="Type 2">Type 2</option>
              <option value="Gestational">Gestational</option>
              <option value="Prediabetes">Prediabetes</option>
              <option value="LADA">LADA</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '1rem' }}>
            {loading ? '⏳ Creating account...' : '🚀 Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #d8f3dc 0%, #b7e4c7 100%)', padding: 20,
  },
  card: {
    background: '#fff', borderRadius: 20, padding: '40px 36px',
    width: '100%', maxWidth: 460,
    boxShadow: '0 20px 60px rgba(45,106,79,0.15)',
  },
  header: { textAlign: 'center', marginBottom: 24 },
  title: { fontSize: '1.5rem', color: '#1b2d27', fontFamily: 'Nunito, sans-serif' },
  sub: { color: '#8aada0', fontSize: '0.85rem', marginTop: 4 },
  footer: { textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: '#8aada0' },
};

export default RegisterPage;
