// ── Dashboard Page ────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const TRANSPORT_MODES = [
  { mode:'Bus',        icon:'🚌', color:'#38bdf8', desc:'City & intercity coaches', routes:'200+ routes' },
  { mode:'Metro',      icon:'🚇', color:'#00c2a8', desc:'Underground & overground', routes:'12 lines' },
  { mode:'Bike Share', icon:'🚲', color:'#00d68f', desc:'Zero-emission cycling',    routes:'5,000 docks' },
  { mode:'E-Scooter',  icon:'🛴', color:'#f59e0b', desc:'Last-mile electric rides', routes:'3 providers' },
  { mode:'Ride-Hail',  icon:'🚗', color:'#a78bfa', desc:'On-demand taxi service',  routes:'Instant' },
  { mode:'Walk',       icon:'🚶', color:'#fb7185', desc:'Pedestrian routing',       routes:'All areas' },
];

const CITIES = [
  { name:'London',     img:'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80', desc:'Capital & largest city' },
  { name:'Manchester', img:'https://images.unsplash.com/photo-1596386461350-326ccb383e9f?w=600&q=80', desc:'Northern powerhouse' },
  { name:'Birmingham', img:'https://images.unsplash.com/photo-1589834390005-5d4d9a9e1944?w=600&q=80', desc:'UK\'s second city' },
  { name:'Edinburgh',  img:'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=600&q=80', desc:'Scottish capital' },
];

const QUICK_STATS = [
  { label:'Transport Modes', value:'6', icon:'🚦' },
  { label:'UK Cities',       value:'20+', icon:'🏙️' },
  { label:'Journey Options', value:'4',  icon:'🗺️' },
  { label:'Eco Rewards',     value:'On', icon:'🌿' },
];

export default function DashboardPage() {
  const { user }    = useAuth();
  const [rewards, setRewards] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/rewards').then(r => setRewards(r.data.reward)).catch(() => {});
    api.get('/bookings').then(r => setBookings(r.data.bookings?.slice(0,3) || [])).catch(() => {});
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="mesh-bg" style={{ minHeight:'100vh', paddingBottom:60 }}>
      {/* ── Hero banner ── */}
      <div style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent} className="container">
          <div className="anim-fade-up">
            <span style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0]} 👋</span>
            <h1 style={styles.heroTitle}>Where are you<br />travelling today?</h1>
            <p style={styles.heroSub}>Plan, book, and manage your urban journeys across the UK</p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:28 }}>
              <Link to="/journey" className="btn btn-primary btn-lg">
                🗺️ Plan a Journey
              </Link>
              <Link to="/map" className="btn btn-secondary btn-lg">
                📍 View Map
              </Link>
            </div>
          </div>

          {/* Eco points badge */}
          {rewards && (
            <div style={styles.pointsBadge} className="anim-fade-in">
              <div style={{ fontSize:'1.6rem' }}>🌿</div>
              <div>
                <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#00d68f', fontFamily:'Syne, sans-serif' }}>
                  {rewards.totalPoints}
                </div>
                <div style={{ fontSize:'0.72rem', color:'#94a3b8' }}>ECO POINTS</div>
                <div style={{ fontSize:'0.72rem', color:'#f59e0b', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  {rewards.tier}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ padding:'0 24px' }}>
        {/* ── Quick stats ── */}
        <div className="grid-4" style={{ margin:'40px 0 32px' }}>
          {QUICK_STATS.map(s => (
            <div key={s.label} className="card card-sm anim-fade-up" style={styles.statCard}>
              <div style={{ fontSize:'1.8rem', marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontFamily:'Syne, sans-serif', fontSize:'1.6rem', fontWeight:800, color:'#00c2a8' }}>{s.value}</div>
              <div style={{ fontSize:'0.82rem', color:'#94a3b8', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Transport modes ── */}
        <section style={{ marginBottom:48 }}>
          <h2 style={styles.sectionTitle}>Transport Modes</h2>
          <p className="text-muted text-sm" style={{ marginBottom:24 }}>Choose from 6 integrated urban mobility options</p>
          <div className="grid-3" style={{ gap:16 }}>
            {TRANSPORT_MODES.map(t => (
              <Link to="/journey" key={t.mode} style={{ textDecoration:'none' }}>
                <div className="card" style={{ ...styles.modeCard, '--accent': t.color }}>
                  <div style={{ ...styles.modeIcon, background: `${t.color}18`, color: t.color }}>{t.icon}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:2 }}>{t.mode}</div>
                    <div style={{ color:'#94a3b8', fontSize:'0.8rem' }}>{t.desc}</div>
                    <div style={{ color: t.color, fontSize:'0.75rem', marginTop:4, fontWeight:600 }}>{t.routes}</div>
                  </div>
                  <span style={{ marginLeft:'auto', color: t.color, fontSize:'1.1rem' }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── UK Cities ── */}
        <section style={{ marginBottom:48 }}>
          <h2 style={styles.sectionTitle}>Popular Cities</h2>
          <p className="text-muted text-sm" style={{ marginBottom:24 }}>Available across 20+ UK cities</p>
          <div className="grid-4" style={{ gap:16 }}>
            {CITIES.map(c => (
              <Link to="/journey" key={c.name} style={{ textDecoration:'none' }}>
                <div style={styles.cityCard}>
                  <img src={c.img} alt={c.name} style={styles.cityImg} />
                  <div style={styles.cityOverlay} />
                  <div style={styles.cityInfo}>
                    <div style={{ fontWeight:700, fontSize:'1rem', fontFamily:'Syne, sans-serif' }}>{c.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.7)' }}>{c.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Recent bookings ── */}
        {bookings.length > 0 && (
          <section style={{ marginBottom:48 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={styles.sectionTitle}>Recent Bookings</h2>
              <Link to="/my-bookings" style={{ color:'#00c2a8', textDecoration:'none', fontSize:'0.88rem', fontWeight:600 }}>
                View all →
              </Link>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {bookings.map(b => (
                <div key={b._id} className="card card-sm" style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px' }}>
                  <div style={{ fontSize:'1.5rem' }}>🎫</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'0.9rem' }}>
                      {b.journey?.origin} → {b.journey?.destination}
                    </div>
                    <div style={{ color:'#94a3b8', fontSize:'0.8rem' }}>Ref: {b.bookingRef}</div>
                  </div>
                  <span className={`badge ${
                    b.status==='confirmed' ? 'badge-success' :
                    b.status==='pending'   ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {b.status}
                  </span>
                  <div style={{ color:'#00c2a8', fontWeight:700 }}>£{b.finalFare?.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <div className="card" style={styles.cta}>
          <div style={{ flex:1 }}>
            <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.4rem', marginBottom:8 }}>
              🌱 Go green, earn more
            </h3>
            <p style={{ color:'#94a3b8', fontSize:'0.9rem' }}>
              Choose eco-friendly transport and earn bonus eco-points. {rewards ? `You have ${rewards.totalPoints} points — redeem them for discounts!` : 'Every journey counts.'}
            </p>
          </div>
          <Link to="/rewards" className="btn btn-primary" style={{ flexShrink:0 }}>View Rewards →</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    position:'relative', height:380,
    background:`linear-gradient(135deg, #0a1628 0%, #0f2044 50%, #1a3260 100%)`,
    overflow:'hidden',
  },
  heroOverlay: {
    position:'absolute', inset:0,
    background:'url(https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1400&q=60) center/cover',
    opacity:0.12,
  },
  heroContent: {
    position:'relative', zIndex:1, height:'100%', maxWidth:1200, margin:'0 auto',
    padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between',
    gap:24,
  },
  greeting: { color:'#00c2a8', fontSize:'0.9rem', fontWeight:600, letterSpacing:'0.05em' },
  heroTitle: {
    fontFamily:'Syne, sans-serif', fontSize:'clamp(2rem, 4vw, 3rem)', fontWeight:800,
    lineHeight:1.1, marginTop:8,
  },
  heroSub: { color:'#94a3b8', fontSize:'1rem', marginTop:12, maxWidth:420 },
  pointsBadge: {
    background:'rgba(0,214,143,0.08)', border:'1px solid rgba(0,214,143,0.2)',
    borderRadius:16, padding:'20px 28px', display:'flex', alignItems:'center',
    gap:16, flexShrink:0, backdropFilter:'blur(12px)',
  },
  statCard: { textAlign:'center' },
  sectionTitle: { fontFamily:'Syne, sans-serif', fontSize:'1.25rem', fontWeight:700, marginBottom:4 },
  modeCard: {
    display:'flex', alignItems:'center', gap:14,
    cursor:'pointer', transition:'all 0.2s',
    ':hover': { transform:'translateY(-2px)' },
  },
  modeIcon: {
    width:44, height:44, borderRadius:10,
    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0,
  },
  cityCard: {
    position:'relative', borderRadius:14, overflow:'hidden',
    height:160, cursor:'pointer',
    transition:'transform 0.2s',
  },
  cityImg: { width:'100%', height:'100%', objectFit:'cover' },
  cityOverlay: {
    position:'absolute', inset:0,
    background:'linear-gradient(to top, rgba(10,22,40,0.85) 0%, transparent 60%)',
  },
  cityInfo: { position:'absolute', bottom:14, left:14 },
  cta: {
    display:'flex', alignItems:'center', gap:24, flexWrap:'wrap',
    background:'linear-gradient(135deg, rgba(0,194,168,0.08), rgba(0,214,143,0.05))',
    border:'1px solid rgba(0,194,168,0.15)',
  },
};
