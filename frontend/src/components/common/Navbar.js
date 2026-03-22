// ── Navbar Component ──────────────────────────────────────────
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { path: '/dashboard',   label: 'Home',     icon: '⚡' },
  { path: '/journey',     label: 'Plan',     icon: '🗺️' },
  { path: '/my-bookings', label: 'Bookings', icon: '🎫' },
  { path: '/rewards',     label: 'Rewards',  icon: '🌿' },
  { path: '/map',         label: 'Map',      icon: '📍' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/dashboard" style={styles.logo}>
          <span style={styles.logoIcon}>🚇</span>
          <span style={styles.logoText}>UMMS</span>
        </Link>

        {/* Desktop links */}
        <div style={styles.links}>
          {NAV_LINKS.map(({ path, label, icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} style={{ ...styles.link, ...(active ? styles.linkActive : {}) }}>
                <span>{icon}</span> {label}
                {active && <span style={styles.activeDot} />}
              </Link>
            );
          })}
          {user?.role === 'admin' && (
            <Link to="/admin" style={{ ...styles.link, ...(location.pathname === '/admin' ? styles.linkActive : {}) }}>
              <span>📊</span> Admin
            </Link>
          )}
        </div>

        {/* User menu */}
        <div style={styles.userArea}>
          <Link to="/account" style={styles.avatar}>
            <span style={styles.avatarInner}>{user?.name?.[0]?.toUpperCase()}</span>
          </Link>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Sign out">
            ⏻
          </button>
          {/* Mobile hamburger */}
          <button style={styles.hamburger} onClick={() => setOpen(!open)}>☰</button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={styles.mobileMenu}>
          {NAV_LINKS.map(({ path, label, icon }) => (
            <Link key={path} to={path} style={styles.mobileLink} onClick={() => setOpen(false)}>
              {icon} {label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" style={styles.mobileLink} onClick={() => setOpen(false)}>📊 Admin</Link>
          )}
          <button onClick={handleLogout} style={{ ...styles.mobileLink, border: 'none', cursor: 'pointer', textAlign: 'left', background: 'none', color: '#f43f5e', width: '100%' }}>
            ⏻ Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 1000,
    background: 'rgba(10,22,40,0.92)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  inner: {
    maxWidth: 1200, margin: '0 auto', padding: '0 24px',
    height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    textDecoration: 'none',
  },
  logoIcon: { fontSize: '1.4rem' },
  logoText: {
    fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem',
    background: 'linear-gradient(135deg, #00c2a8, #00d68f)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: '0.05em',
  },
  links: { display: 'flex', alignItems: 'center', gap: 4 },
  link: {
    display: 'flex', alignItems: 'center', gap: 6, position: 'relative',
    padding: '8px 14px', borderRadius: 8,
    textDecoration: 'none', color: '#94a3b8',
    fontSize: '0.88rem', fontWeight: 500,
    transition: 'color 0.2s, background 0.2s',
  },
  linkActive: { color: '#ffffff', background: 'rgba(0,194,168,0.12)' },
  activeDot: {
    position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
    width: 4, height: 4, borderRadius: '50%', background: '#00c2a8',
  },
  userArea: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg, #00c2a8, #00d68f)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none',
  },
  avatarInner: { color: '#0a1628', fontWeight: 700, fontSize: '0.9rem' },
  logoutBtn: {
    background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
    color: '#f43f5e', borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
    fontSize: '1rem',
  },
  hamburger: {
    display: 'none', background: 'none', border: 'none',
    color: '#fff', fontSize: '1.4rem', cursor: 'pointer',
    '@media(max-width:768px)': { display: 'block' },
  },
  mobileMenu: {
    display: 'flex', flexDirection: 'column',
    borderTop: '1px solid rgba(255,255,255,0.07)',
    padding: '12px 24px 16px',
    background: 'rgba(10,22,40,0.98)',
  },
  mobileLink: {
    display: 'block', padding: '10px 0',
    textDecoration: 'none', color: '#fff', fontSize: '0.95rem',
  },
};
