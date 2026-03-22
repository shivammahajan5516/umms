// ── Login Page ────────────────────────────────────────────────
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await login(form.email, form.password);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page} className="mesh-bg">
      {/* Decorative circles */}
      <div style={styles.circle1} />
      <div style={styles.circle2} />

      <div style={styles.container} className="anim-fade-up">
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>🚇</div>
          <h1 style={styles.logoText}>UMMS</h1>
          <p style={styles.logoSub}>Smart Urban Mobility Management</p>
        </div>

        {/* Card */}
        <div className="card" style={styles.card}>
          <h2 style={styles.title}>Welcome back</h2>
          <p className="text-muted text-sm" style={{ marginBottom: 24 }}>Sign in to your account to continue</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
              />
            </div>

            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? '⏳ Signing in...' : '→ Sign In'}
            </button>
          </form>

          <div className="divider" />

          {/* Demo credentials */}
          <div style={styles.demoBox}>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8 }}>🔑 Demo Credentials</p>
            <p style={{ fontSize: '0.82rem', color: '#00c2a8' }}>Passenger: demo@umms.com / demo123</p>
            <p style={{ fontSize: '0.82rem', color: '#f59e0b' }}>Admin: admin@umms.com / admin123</p>
          </div>

          <p style={styles.registerLink}>
            New to UMMS?{' '}
            <Link to="/register" style={{ color: '#00c2a8', textDecoration: 'none', fontWeight: 600 }}>
              Create account →
            </Link>
          </p>
        </div>

        {/* Feature pills */}
        <div style={styles.pills}>
          {['🚌 Multi-modal', '🌿 Eco rewards', '📍 Live tracking', '💳 Easy payments'].map(p => (
            <span key={p} style={styles.pill}>{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px', position: 'relative', overflow: 'hidden',
  },
  circle1: {
    position: 'absolute', top: -100, left: -100,
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,194,168,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  circle2: {
    position: 'absolute', bottom: -100, right: -100,
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,214,143,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: { width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 },
  logoWrap: { textAlign: 'center', marginBottom: 32 },
  logoIcon: { fontSize: '3rem', marginBottom: 8 },
  logoText: {
    fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800,
    background: 'linear-gradient(135deg, #00c2a8, #00d68f)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: '0.08em', marginBottom: 6,
  },
  logoSub: { color: '#94a3b8', fontSize: '0.9rem' },
  card: { padding: 32 },
  title: { fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  demoBox: {
    background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '12px 14px',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  registerLink: { marginTop: 20, textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' },
  pills: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 24 },
  pill: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 999, padding: '6px 14px', fontSize: '0.8rem', color: '#94a3b8',
  },
};
