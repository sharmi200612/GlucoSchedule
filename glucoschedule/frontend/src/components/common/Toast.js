// ============================================
// Global Toast Notification Component
// Use: import Toast from '../components/common/Toast'
// Show: setToast({ text: 'Done!', type: 'success' })
// Types: success | error | warning | info
// ============================================

import React, { useEffect } from 'react';

const COLORS = {
  success: { bg: '#d8f3dc', border: '#b7e4c7', color: '#2d6a4f', icon: '✅' },
  error:   { bg: '#fde8e8', border: '#f5c2c7', color: '#c0392b', icon: '❌' },
  warning: { bg: '#fff8e1', border: '#ffe082', color: '#7a5c00', icon: '⚠️' },
  info:    { bg: '#e3f2fd', border: '#90caf9', color: '#1565c0', icon: 'ℹ️' },
};

const Toast = ({ toast, setToast }) => {
  useEffect(() => {
    if (!toast.text) return;
    const t = setTimeout(() => setToast({ text: '', type: '' }), 4000);
    return () => clearTimeout(t);
  }, [toast.text]);

  if (!toast.text) return null;
  const c = COLORS[toast.type] || COLORS.success;

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      padding: '14px 20px', borderRadius: 12,
      background: c.bg, border: `1.5px solid ${c.border}`,
      color: c.color, fontWeight: 700, fontSize: '0.9rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      display: 'flex', alignItems: 'center', gap: 10,
      maxWidth: 380, animation: 'slideInRight 0.3s ease',
    }}>
      <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
      <span>{toast.text}</span>
      <button onClick={() => setToast({ text: '', type: '' })}
        style={{ marginLeft: 8, background: 'none', border: 'none',
          cursor: 'pointer', color: c.color, fontSize: '1rem', padding: 0 }}>✕</button>
    </div>
  );
};

export default Toast;
