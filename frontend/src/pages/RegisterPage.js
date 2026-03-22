// ── Register Page ─────────────────────────────────────────────
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UK_CITIES = ['London','Manchester','Birmingham','Leeds','Sheffield','Liverpool',
  'Bristol','Edinburgh','Glasgow','Cardiff','Newcastle','Nottingham','Leicester','Oxford','Cambridge'];

export default function RegisterPage() {
  const [form, setForm]       = useState({ name:'', email:'', password:'', phone:'', city:'London' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone, form.city);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm({...form, [k]: e.target.value});

  return (
    <div style={styles.page} className="mesh-bg">
      <div style={styles.circle1} />
      <div style={styles.container} className="anim-fade-up">
        {/* Left panel */}
        <div style={styles.panel}>
          <div style={styles.logoWrap}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚇</div>
            <h1 style={styles.logoText}>UMMS</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: 8 }}>
              Smart Urban Mobility Management System
            </p>
          </div>
          <div style={styles.features}>
            {[
              { icon:'🚌', title:'Multi-modal Transport', desc:'Bus, metro, bike, scooter & ride-hail' },
              { icon:'🌿', title:'Eco Rewards', desc:'Earn green points on every journey' },
              { icon:'📍', title:'Journey Planning', desc:'Plan across UK cities instantly' },
              { icon:'💳', title:'Simple Payments', desc:'Secure simulated checkout' },
            ].map(f => (
              <div key={f.title} style={styles.feature}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.title}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div className="card" style={styles.card}>
          <h2 style={styles.title}>Create your account</h2>
          <p className="text-muted text-sm" style={{ marginBottom: 24 }}>Join thousands of smart commuters</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="Jane Smith" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="jane@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Phone (optional)</label>
                <input className="form-input" type="tel" placeholder="+44 7700 000000" value={form.phone} onChange={set('phone')} />
              </div>
              <div className="form-group">
                <label className="form-label">Home City</label>
                <select className="form-input" value={form.city} onChange={set('city')}>
                  {UK_CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ background:'rgba(0,194,168,0.08)', border:'1px solid rgba(0,194,168,0.2)', borderRadius:8, padding:'10px 14px', fontSize:'0.82rem', color:'#00c2a8' }}>
              🎁 You'll receive 50 welcome eco-points on signup!
            </div>

            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop:4 }}>
              {loading ? '⏳ Creating account...' : '→ Create Account'}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign:'center', color:'#94a3b8', fontSize:'0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#00c2a8', textDecoration:'none', fontWeight:600 }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center',
    padding:24, position:'relative', overflow:'hidden',
  },
  circle1: {
    position:'absolute', top:-200, right:-200, width:600, height:600, borderRadius:'50%',
    background:'radial-gradient(circle, rgba(0,194,168,0.06) 0%, transparent 70%)', pointerEvents:'none',
  },
  container: {
    width:'100%', maxWidth:900, display:'grid',
    gridTemplateColumns:'1fr 1fr', gap:32, position:'relative', zIndex:1,
    '@media(max-width:700px)': { gridTemplateColumns:'1fr' },
  },
  panel: { display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 16px' },
  logoWrap: { marginBottom: 40 },
  logoText: {
    fontFamily:'Syne, sans-serif', fontSize:'2.5rem', fontWeight:800,
    background:'linear-gradient(135deg, #00c2a8, #00d68f)',
    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
  },
  features: { display:'flex', flexDirection:'column', gap:20 },
  feature: { display:'flex', alignItems:'flex-start', gap:14 },
  featureIcon: {
    fontSize:'1.4rem', width:44, height:44, borderRadius:10,
    background:'rgba(0,194,168,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
  },
  card: { padding:36 },
  title: { fontFamily:'Syne, sans-serif', fontSize:'1.6rem', fontWeight:700, marginBottom:4 },
};
