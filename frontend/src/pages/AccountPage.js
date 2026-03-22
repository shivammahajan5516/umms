// ── Account / Profile Page ────────────────────────────────────
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const UK_CITIES = ['London','Manchester','Birmingham','Leeds','Sheffield','Liverpool',
  'Bristol','Edinburgh','Glasgow','Cardiff','Newcastle','Nottingham','Leicester','Oxford','Cambridge'];

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [form, setForm]     = useState({ name: user?.name||'', phone: user?.phone||'', city: user?.city||'London' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]   = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSuccess(''); setError('');
    try {
      await api.put('/users/profile', form);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const initials = user?.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <div className="mesh-bg" style={{ minHeight:'100vh', padding:'40px 0 60px' }}>
      <div className="container" style={{ maxWidth:720 }}>
        <div className="anim-fade-up" style={{ marginBottom:32 }}>
          <h1 style={styles.pageTitle}>👤 My Account</h1>
          <p className="text-muted">Manage your profile and account settings</p>
        </div>

        {/* Profile header */}
        <div className="card anim-fade-up" style={{ marginBottom:24, display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
          <div style={styles.avatar}>{initials}</div>
          <div style={{ flex:1 }}>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.4rem', fontWeight:700 }}>{user?.name}</h2>
            <p style={{ color:'#94a3b8', marginTop:4 }}>{user?.email}</p>
            <div style={{ display:'flex', gap:10, marginTop:10, flexWrap:'wrap' }}>
              <span className="badge badge-teal">📍 {user?.city || 'London'}</span>
              <span className={`badge ${user?.role==='admin' ? 'badge-warning' : 'badge-info'}`}>
                {user?.role === 'admin' ? '⚙️ Administrator' : '🧳 Passenger'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="card anim-fade-up" style={{ marginBottom:24 }}>
          <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.05rem', marginBottom:20 }}>Edit Profile</h3>

          {success && <div className="alert alert-success" style={{ marginBottom:16 }}>✅ {success}</div>}
          {error   && <div className="alert alert-error"   style={{ marginBottom:16 }}>⚠️ {error}</div>}

          <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name}
                onChange={e => setForm({...form, name:e.target.value})} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={user?.email} disabled
                style={{ opacity:0.5, cursor:'not-allowed' }} />
              <span style={{ fontSize:'0.75rem', color:'#94a3b8' }}>Email cannot be changed</span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" placeholder="+44 7700 000000"
                  value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Home City</label>
                <select className="form-input" value={form.city}
                  onChange={e => setForm({...form, city:e.target.value})}>
                  {UK_CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display:'flex', gap:12, marginTop:4 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? '⏳ Saving...' : '✓ Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Account info */}
        <div className="card anim-fade-up" style={{ marginBottom:24 }}>
          <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.05rem', marginBottom:16 }}>Account Information</h3>
          {[
            { label:'Account ID', value: user?._id },
            { label:'Member Since', value: 'Active member' },
            { label:'Account Type', value: user?.role === 'admin' ? 'Administrator' : 'Passenger' },
            { label:'Status', value:'Active ✅' },
          ].map(row => (
            <div key={row.label} style={styles.infoRow}>
              <span style={{ color:'#94a3b8', fontSize:'0.85rem', minWidth:140 }}>{row.label}</span>
              <span style={{ fontSize:'0.85rem', fontWeight:500, wordBreak:'break-all' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Danger zone */}
        <div className="card anim-fade-up" style={{ borderColor:'rgba(244,63,94,0.2)' }}>
          <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.05rem', color:'#f43f5e', marginBottom:12 }}>Sign Out</h3>
          <p className="text-muted text-sm" style={{ marginBottom:16 }}>
            You'll need to sign in again to access your account.
          </p>
          <button className="btn btn-danger" onClick={logout}>⏻ Sign Out</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageTitle: { fontFamily:'Syne, sans-serif', fontSize:'2rem', fontWeight:800, marginBottom:8 },
  avatar: {
    width:80, height:80, borderRadius:'50%',
    background:'linear-gradient(135deg, #00c2a8, #00d68f)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontFamily:'Syne, sans-serif', fontSize:'1.8rem', fontWeight:800, color:'#0a1628', flexShrink:0,
  },
  infoRow: {
    display:'flex', alignItems:'flex-start', gap:16, padding:'10px 0',
    borderBottom:'1px solid rgba(255,255,255,0.06)',
  },
};
