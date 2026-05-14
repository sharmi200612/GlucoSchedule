import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState({ text: '', type: '' });
  const { login } = useAuth();
  const navigate  = useNavigate();

  const showMsg = (text, type) => {
    setMsg({ text, type });
    if (type === 'success') setTimeout(() => navigate('/'), 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      const { data } = await API.post('/auth/login', form);
      login(data);
      showMsg(`✅ Login Successful! Welcome back, ${data.name}! 👋`, 'success');
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.message || 'Login failed. Check email and password.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>🩺</div>
          <h2 style={styles.title}>GlucoSchedule</h2>
          <p style={styles.sub}>Sign in to manage your diabetes care</p>
        </div>

        {/* Success / Error Message */}
        {msg.text && (
          <div style={{
            padding: '14px 18px', borderRadius: 10, marginBottom: 20,
            background: msg.type === 'success' ? '#d8f3dc' : '#fde8e8',
            border: `1.5px solid ${msg.type === 'success' ? '#b7e4c7' : '#f5c2c7'}`,
            color: msg.type === 'success' ? '#2d6a4f' : '#c0392b',
            fontWeight: 700, fontSize: '0.92rem', textAlign: 'center',
            animation: 'fadeIn 0.3s ease',
          }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" name="email"
              placeholder="your@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" name="password"
              placeholder="Enter your password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '1rem' }}>
            {loading ? '⏳ Signing in...' : '✅ Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Register here</Link>
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
    width: '100%', maxWidth: 420,
    boxShadow: '0 20px 60px rgba(45,106,79,0.15)',
  },
  header: { textAlign: 'center', marginBottom: 28 },
  title: { fontSize: '1.6rem', color: '#1b2d27', fontFamily: 'Nunito, sans-serif' },
  sub: { color: '#8aada0', fontSize: '0.9rem', marginTop: 4 },
  footer: { textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: '#8aada0' },
};

export default LoginPage;
