// ── My Bookings Page ─────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const STATUS_CONFIG = {
  pending:   { label:'Pending',   cls:'badge-warning', icon:'⏳' },
  confirmed: { label:'Confirmed', cls:'badge-success', icon:'✅' },
  cancelled: { label:'Cancelled', cls:'badge-danger',  icon:'❌' },
  completed: { label:'Completed', cls:'badge-info',    icon:'🏁' },
};

const MODE_ICONS = { bus:'🚌', metro:'🚇', bike:'🚲', scooter:'🛴', 'ride-hail':'🚗', walk:'🚶' };

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    api.get('/bookings').then(r => setBookings(r.data.bookings || []))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setBookings(prev => prev.map(b => b._id===id ? {...b, status:'cancelled'} : b));
    } catch {}
    setCancelling(null);
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <div className="loader-wrap mesh-bg" style={{minHeight:'100vh'}}><div className="spinner"/></div>;

  return (
    <div className="mesh-bg" style={{ minHeight:'100vh', padding:'40px 0 60px' }}>
      <div className="container" style={{ maxWidth:860 }}>
        <div className="anim-fade-up" style={{ marginBottom:28 }}>
          <h1 style={styles.pageTitle}>🎫 My Bookings</h1>
          <p className="text-muted">View and manage all your journey bookings</p>
        </div>

        {/* Filter tabs */}
        <div style={styles.filterRow}>
          {['all','pending','confirmed','cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ ...styles.filterBtn, ...(filter===f ? styles.filterBtnActive : {}) }}>
              {f === 'all' ? `All (${bookings.length})` : `${STATUS_CONFIG[f]?.icon} ${STATUS_CONFIG[f]?.label}`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:48 }}>
            <div style={{ fontSize:'3rem', marginBottom:16 }}>🎫</div>
            <h3 style={{ fontFamily:'Syne, sans-serif' }}>No bookings found</h3>
            <p className="text-muted" style={{ margin:'12px 0 24px' }}>
              {filter === 'all' ? "You haven't made any bookings yet." : `No ${filter} bookings.`}
            </p>
            <Link to="/journey" className="btn btn-primary">🗺️ Plan a Journey</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {filtered.map((b, i) => {
              const st = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              return (
                <div key={b._id} className="card anim-fade-up" style={{ animationDelay:`${i*0.05}s` }}>
                  <div style={styles.bookingHeader}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
                        <span className={`badge ${st.cls}`}>{st.icon} {st.label}</span>
                        <span style={{ color:'#94a3b8', fontSize:'0.8rem' }}>Ref: {b.bookingRef}</span>
                      </div>
                      <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.15rem', fontWeight:700 }}>
                        {b.journey?.origin} → {b.journey?.destination}
                      </h3>
                      <p style={{ color:'#94a3b8', fontSize:'0.82rem', marginTop:4 }}>
                        📅 {b.journey?.date} &nbsp;·&nbsp;
                        {b.journey?.transportModes?.map(m => (
                          <span key={m} style={{ marginRight:4 }}>{MODE_ICONS[m]||'🚌'}</span>
                        ))}
                        {b.journey?.totalDuration} min &nbsp;·&nbsp; {b.journey?.totalDistance} km
                      </p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontFamily:'Syne, sans-serif', fontSize:'1.5rem', fontWeight:800, color:'#00c2a8' }}>
                        £{b.finalFare?.toFixed(2)}
                      </div>
                      {b.discountAmount > 0 && (
                        <div style={{ color:'#00d68f', fontSize:'0.75rem' }}>-£{b.discountAmount.toFixed(2)} discount</div>
                      )}
                      <div style={{ color:'#94a3b8', fontSize:'0.75rem' }}>
                        {new Date(b.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                      </div>
                    </div>
                  </div>

                  {/* Segments summary */}
                  {b.journey?.segments && (
                    <div style={styles.segRow}>
                      {b.journey.segments.map((seg, si) => (
                        <React.Fragment key={si}>
                          <span style={styles.segChip}>
                            {MODE_ICONS[seg.mode]||'🚌'} {seg.from}
                          </span>
                          {si < b.journey.segments.length - 1 && <span style={{ color:'#94a3b8' }}>→</span>}
                        </React.Fragment>
                      ))}
                      <span style={styles.segChip}>
                        📍 {b.journey.destination}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={styles.actions}>
                    {b.status === 'pending' && (
                      <>
                        <Link to={`/payment/${b._id}`} className="btn btn-primary btn-sm">💳 Pay Now</Link>
                        <button className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(b._id)} disabled={cancelling===b._id}>
                          {cancelling===b._id ? '⏳' : '✕ Cancel'}
                        </button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <div className="alert alert-success" style={{ padding:'6px 14px', fontSize:'0.82rem' }}>
                        ✅ Payment confirmed — enjoy your journey!
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageTitle: { fontFamily:'Syne, sans-serif', fontSize:'2rem', fontWeight:800, marginBottom:8 },
  filterRow: { display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 },
  filterBtn: {
    padding:'8px 18px', borderRadius:999, border:'1px solid rgba(255,255,255,0.1)',
    background:'transparent', color:'#94a3b8', cursor:'pointer', fontSize:'0.85rem', fontWeight:600,
    transition:'all 0.15s',
  },
  filterBtnActive: { background:'rgba(0,194,168,0.15)', borderColor:'rgba(0,194,168,0.4)', color:'#00c2a8' },
  bookingHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, marginBottom:14 },
  segRow: { display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:14, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.07)' },
  segChip: {
    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
    borderRadius:999, padding:'3px 10px', fontSize:'0.78rem', color:'#94a3b8',
  },
  actions: { display:'flex', gap:10, alignItems:'center', paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.07)' },
};
