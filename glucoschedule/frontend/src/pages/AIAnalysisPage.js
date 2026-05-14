// ============================================
// Page: AI Health Analysis Module
// ============================================
// Analyzes glucose data and provides:
// - Future sugar level predictions
// - Health risk detection
// - Personalized diet recommendations

import React, { useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import API from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// ── Sub-components ────────────────────────────

const RiskBadge = ({ risk }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '8px 20px', borderRadius: 30,
    background: risk.color + '22', border: `2px solid ${risk.color}`,
    color: risk.color, fontWeight: 800, fontSize: '1rem',
    fontFamily: 'Nunito, sans-serif',
  }}>
    {risk.level === 'high'   && '🔴'}
    {risk.level === 'medium' && '🟠'}
    {risk.level === 'low'    && '🟢'}
    {risk.level === 'insufficient' && '⚪'}
    {risk.label}
  </div>
);

const StatBox = ({ icon, value, label, color = 'var(--primary)' }) => (
  <div style={{
    background: '#fff', borderRadius: 14, padding: '18px 16px',
    boxShadow: '0 2px 12px rgba(45,106,79,0.08)',
    borderLeft: `4px solid ${color}`,
    display: 'flex', flexDirection: 'column', gap: 4,
  }}>
    <div style={{ fontSize: '1.8rem' }}>{icon}</div>
    <div style={{ fontSize: '1.6rem', fontWeight: 800, color, fontFamily: 'Nunito, sans-serif' }}>{value}</div>
    <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
  </div>
);

const AlertBox = ({ alert }) => {
  const colors = {
    danger:  { bg: '#fde8e8', border: '#f5c2c7', color: '#e63946' },
    warning: { bg: '#fef3e2', border: '#ffd48e', color: '#f4a261' },
    success: { bg: '#d8f3dc', border: '#b7e4c7', color: '#2d6a4f' },
    info:    { bg: '#e3f2fd', border: '#90caf9', color: '#1565c0' },
  };
  const c = colors[alert.type] || colors.info;
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 10, marginBottom: 10,
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.color, fontSize: '0.88rem', fontWeight: 500,
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{alert.icon}</span>
      <span>{alert.message}</span>
    </div>
  );
};

const DietCard = ({ rec }) => {
  const priorityColors = {
    urgent: { bg: '#fde8e8', border: '#f5c2c7', badge: '#e63946' },
    high:   { bg: '#fef3e2', border: '#ffd48e', badge: '#f4a261' },
    normal: { bg: '#f8fffe', border: 'var(--border)', badge: '#2d6a4f' },
  };
  const c = priorityColors[rec.priority] || priorityColors.normal;
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 12,
      background: c.bg, border: `1.5px solid ${c.border}`,
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{rec.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{rec.category}</span>
          {rec.priority === 'urgent' && (
            <span style={{ background: c.badge, color: '#fff', borderRadius: 10,
              padding: '1px 8px', fontSize: '0.7rem', fontWeight: 700 }}>URGENT</span>
          )}
          {rec.priority === 'high' && (
            <span style={{ background: c.badge, color: '#fff', borderRadius: 10,
              padding: '1px 8px', fontSize: '0.7rem', fontWeight: 700 }}>IMPORTANT</span>
          )}
        </div>
        <div style={{ fontSize: '0.83rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>{rec.tip}</div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────
const AIAnalysisPage = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/ai/analyze');
      setAnalysis(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Build prediction chart data
  const getPredictionChart = () => {
    if (!analysis?.predictions?.nextReadings?.length) return null;
    const { nextReadings } = analysis.predictions;
    const avgVal = analysis.summary.avgRecentGlucose;
    return {
      labels: ['Current Avg', 'Prediction 1', 'Prediction 2', 'Prediction 3'],
      datasets: [
        {
          label: 'Predicted Glucose (mg/dL)',
          data: [avgVal, ...nextReadings],
          borderColor: '#2d6a4f',
          backgroundColor: 'rgba(45,106,79,0.1)',
          borderWidth: 2.5,
          pointRadius: 6,
          pointBackgroundColor: ['#52b788', ...nextReadings.map(v =>
            v < 70 ? '#e63946' : v > 180 ? '#f4a261' : '#2d6a4f'
          )],
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Upper Safe Limit (180)',
          data: [180, 180, 180, 180],
          borderColor: '#f4a261',
          borderWidth: 1.5,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Lower Safe Limit (70)',
          data: [70, 70, 70, 70],
          borderColor: '#e63946',
          borderWidth: 1.5,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
        },
      ],
    };
  };

  const trendIcon  = analysis?.predictions?.trend === 'rising'  ? '📈'
                   : analysis?.predictions?.trend === 'falling' ? '📉' : '➡️';
  const trendColor = analysis?.predictions?.trend === 'rising'  ? '#f4a261'
                   : analysis?.predictions?.trend === 'falling' ? '#e63946' : '#2d6a4f';

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>🤖 AI Health Analysis</h1>
          <p>Smart predictions, risk detection & personalized diet recommendations</p>
        </div>
        <button className="btn btn-primary" onClick={runAnalysis} disabled={loading}
          style={{ padding: '12px 28px', fontSize: '1rem' }}>
          {loading ? '⏳ Analyzing...' : '🔍 Run AI Analysis'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Welcome / empty state */}
      {!analysis && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🤖</div>
          <h2 style={{ marginBottom: 12, fontFamily: 'Nunito, sans-serif' }}>AI Health Analysis</h2>
          <p style={{ color: 'var(--text-light)', maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.7 }}>
            Click <strong>"Run AI Analysis"</strong> above to analyze your glucose history.
            The AI will predict your future sugar levels, detect health risks, and give
            you personalized diet recommendations based on your actual data.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '📊', label: 'Glucose Predictions' },
              { icon: '⚠️', label: 'Risk Detection' },
              { icon: '🥗', label: 'Diet Recommendations' },
              { icon: '📈', label: 'Trend Analysis' },
            ].map(f => (
              <div key={f.label} style={{
                padding: '12px 20px', background: 'var(--primary-pale)',
                borderRadius: 10, fontSize: '0.88rem', fontWeight: 600,
                color: 'var(--primary)',
              }}>
                {f.icon} {f.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16, animation: 'spin 1s linear infinite' }}>⏳</div>
          <h3>Analyzing your health data...</h3>
          <p style={{ color: 'var(--text-light)', marginTop: 8 }}>
            Reading glucose history · Calculating trends · Generating recommendations
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !loading && (
        <>
          {/* Not enough data */}
          {!analysis.hasEnoughData && (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
              <h3 style={{ marginBottom: 8 }}>Not Enough Data Yet</h3>
              <p style={{ color: 'var(--text-light)' }}>{analysis.message}</p>
              <a href="/glucose" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
                💉 Add Glucose Readings
              </a>
            </div>
          )}

          {/* Full results */}
          {analysis.hasEnoughData && (
            <>
              {/* Risk + Summary Banner */}
              <div className="card" style={{
                background: 'linear-gradient(135deg, #1b2d27 0%, #2d6a4f 100%)',
                color: '#fff', marginBottom: 20,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', color: '#b7e4c7', marginBottom: 6, fontWeight: 600 }}>OVERALL HEALTH RISK</div>
                    <RiskBadge risk={analysis.risk} />
                    <div style={{ marginTop: 10, fontSize: '0.85rem', color: '#b7e4c7' }}>
                      Based on {analysis.summary.totalReadings} glucose readings
                      · {analysis.summary.diabetesType}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.82rem', color: '#b7e4c7', marginBottom: 8, fontWeight: 600 }}>GLUCOSE TREND</div>
                    <div style={{ fontSize: '2.8rem', lineHeight: 1, marginBottom: 6 }}>{trendIcon}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: trendColor, letterSpacing: '1px' }}>
                      {analysis.predictions.trend.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#b7e4c7', marginTop: 6, maxWidth: 220 }}>
                      {analysis.predictions.message}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 14, marginBottom: 20,
              }}>
                <StatBox icon="💉" value={`${analysis.summary.avgGlucose}`} label="Avg Glucose (mg/dL)" />
                <StatBox icon="✅" value={`${analysis.summary.inRangePct}%`} label="In Target Range" color="#52b788" />
                <StatBox icon="📉" value={`${analysis.summary.minGlucose}`} label="Lowest Reading" color="#1565c0" />
                <StatBox icon="📈" value={`${analysis.summary.maxGlucose}`} label="Highest Reading" color="#f4a261" />
                <StatBox icon="🔴" value={analysis.summary.lowCount} label="Low Episodes" color="#e63946" />
                <StatBox icon="🟠" value={analysis.summary.highCount} label="High Episodes" color="#f4a261" />
                <StatBox icon="🧪" value={`${analysis.summary.estimatedHbA1c}%`} label="Est. HbA1c" color="#7b2d8b" />
                <StatBox icon="📋" value={analysis.summary.totalReadings} label="Total Readings" />
              </div>

              {/* Two columns: Chart + Alerts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 20 }}>

                {/* Prediction Chart */}
                <div className="card">
                  <h3 style={{ marginBottom: 6 }}>📊 Glucose Predictions</h3>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.82rem', marginBottom: 16 }}>
                    Based on your recent trend, here are your predicted next 3 readings
                  </p>
                  {getPredictionChart() && (
                    <Line
                      data={getPredictionChart()}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
                        scales: {
                          y: {
                            min: 40,
                            grid: { color: '#e8f5e9' },
                            ticks: { callback: v => `${v}` },
                          },
                        },
                      }}
                    />
                  )}
                  <div style={{
                    marginTop: 16, padding: '12px 16px',
                    background: trendColor + '15',
                    borderRadius: 10, border: `1px solid ${trendColor}44`,
                    fontSize: '0.85rem', color: trendColor, fontWeight: 600,
                  }}>
                    <span style={{ marginRight: 6 }}>{trendIcon}</span>{analysis.predictions.message}
                  </div>
                </div>

                {/* Health Alerts */}
                <div className="card">
                  <h3 style={{ marginBottom: 16 }}>⚠️ Health Alerts</h3>
                  {analysis.alerts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-light)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
                      No alerts at this time. Keep up the good work!
                    </div>
                  ) : (
                    analysis.alerts.map((alert, i) => <AlertBox key={i} alert={alert} />)
                  )}

                  {/* Target Range Box */}
                  <div style={{
                    marginTop: 16, padding: 14,
                    background: 'var(--primary-pale)', borderRadius: 10,
                    border: '1px solid #b7e4c7',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 8, color: 'var(--primary)' }}>
                      🎯 Your Target Range
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Nunito, sans-serif' }}>
                      {analysis.summary.targetMin} – {analysis.summary.targetMax} mg/dL
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 4 }}>
                      {analysis.summary.inRangePct}% of your readings are within this range
                    </div>
                  </div>
                </div>
              </div>

              {/* Diet Recommendations */}
              <div className="card">
                <h3 style={{ marginBottom: 6 }}>🥗 Personalized Diet Recommendations</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.82rem', marginBottom: 20 }}>
                  Based on your glucose patterns and {analysis.summary.diabetesType} diabetes profile
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 12,
                }}>
                  {analysis.dietRecommendations.map((rec, i) => (
                    <DietCard key={i} rec={rec} />
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{
                marginTop: 16, padding: '12px 16px',
                background: '#fef3e2', borderRadius: 10,
                border: '1px solid #ffd48e',
                fontSize: '0.8rem', color: '#92500a',
              }}>
                ⚠️ <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and is
                based on mathematical trend analysis. It is <strong>not a substitute for professional medical advice</strong>.
                Always consult your doctor before making changes to your diet or medication.
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AIAnalysisPage;
