// ============================================
// Component: Footer
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>

        {/* Top section */}
        <div style={styles.top}>

          {/* Brand */}
          <div style={styles.brand}>
            <div style={styles.brandLogo}>
              <span style={{ fontSize: '1.6rem' }}>🩺</span>
              <div>
                <div style={styles.brandName}>GlucoSchedule</div>
                <div style={styles.brandTagline}>Smart Diabetes Care System</div>
              </div>
            </div>
            <p style={styles.brandDesc}>
              A complete digital platform to help diabetes patients manage their
              daily health activities, track glucose levels, and maintain a
              healthy lifestyle with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div style={styles.linkGroup}>
            <div style={styles.linkTitle}>Quick Links</div>
            {[
              { path: '/',             label: '🏠 Dashboard' },
              { path: '/glucose',      label: '💉 Blood Glucose' },
              { path: '/medication',   label: '💊 Medication' },
              { path: '/meals',        label: '🥗 Meal Planner' },
              { path: '/exercise',     label: '🏃 Exercise' },
            ].map(link => (
              <Link key={link.path} to={link.path} style={styles.link}>{link.label}</Link>
            ))}
          </div>

          {/* More Links */}
          <div style={styles.linkGroup}>
            <div style={styles.linkTitle}>More Modules</div>
            {[
              { path: '/meditation',   label: '🧘 Meditation' },
              { path: '/appointments', label: '🩺 Appointments' },
              { path: '/planner',      label: '📋 Daily Planner' },
              { path: '/reports',      label: '📊 Reports' },
              { path: '/profile',      label: '👤 My Profile' },
            ].map(link => (
              <Link key={link.path} to={link.path} style={styles.link}>{link.label}</Link>
            ))}
          </div>

          {/* Health Tips */}
          <div style={styles.linkGroup}>
            <div style={styles.linkTitle}>Daily Health Tips</div>
            <div style={styles.tipBox}>
              <div style={styles.tip}>💧 Drink 8 glasses of water daily</div>
              <div style={styles.tip}>🍽️ Never skip meals</div>
              <div style={styles.tip}>💊 Take medication on time</div>
              <div style={styles.tip}>🩸 Check glucose regularly</div>
              <div style={styles.tip}>🚶 Walk 30 minutes a day</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Bottom section */}
        <div style={styles.bottom}>
          <div style={styles.copyright}>
            © {currentYear} <strong>GlucoSchedule</strong> — Smart Diabetes Care & Daily Planning System.
            Built with ❤️ using React.js, Node.js & MongoDB.
          </div>
          <div style={styles.disclaimer}>
            ⚠️ This app is for personal health tracking only. Always consult your doctor for medical advice.
          </div>
        </div>

      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: '#1b2d27',
    color: '#8aada0',
    marginTop: 48,
    borderTop: '3px solid #2d6a4f',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '40px 32px 24px',
  },
  top: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1.5fr',
    gap: 40,
    marginBottom: 32,
  },
  brand: {},
  brandLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  brandName: {
    color: '#fff',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: 800,
    fontSize: '1.1rem',
  },
  brandTagline: {
    color: '#52b788',
    fontSize: '0.72rem',
    fontWeight: 600,
  },
  brandDesc: {
    fontSize: '0.82rem',
    lineHeight: 1.7,
    color: '#6a8f7a',
  },
  linkGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  linkTitle: {
    color: '#fff',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: 700,
    fontSize: '0.9rem',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: '1px solid #2d4a3e',
  },
  link: {
    color: '#6a8f7a',
    textDecoration: 'none',
    fontSize: '0.82rem',
    padding: '3px 0',
    transition: 'color 0.15s',
    display: 'block',
  },
  tipBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  tip: {
    fontSize: '0.8rem',
    color: '#6a8f7a',
    padding: '4px 8px',
    background: '#243d31',
    borderRadius: 6,
    borderLeft: '2px solid #52b788',
  },
  divider: {
    height: 1,
    background: '#2d4a3e',
    marginBottom: 20,
  },
  bottom: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    textAlign: 'center',
  },
  copyright: {
    fontSize: '0.82rem',
    color: '#6a8f7a',
  },
  disclaimer: {
    fontSize: '0.75rem',
    color: '#4a6558',
    fontStyle: 'italic',
  },
};

export default Footer;
