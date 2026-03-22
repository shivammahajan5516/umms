// ── Booking Page ──────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const MODE_ICONS = { bus:'🚌', metro:'🚇', bike:'🚲', scooter:'🛴', 'ride-hail':'🚗', walk:'🚶' };

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journey, setJourney]     = useState(null);
  const [rewards, setRewards]     = useState(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [booking, setBooking]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/journeys/${id}`),
      api.get('/rewards'),
    ]).then(([jRes, rRes]) => {
      setJourney(jRes.data.journey);
      setRewards(rRes.data.reward);
    }).catch(() => setError('Failed to load journey')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loader-wrap mesh-bg" style={{minHeight:'100vh'}}><div className="spinner" /></div>;
  if (error)   return <div className="loader-wrap"><div className="alert alert-error">{error}</div></div>;

  const pointOptions = [0, 10, 20, 30, 50, 100].filter(p => p <= (rewards?.totalPoints || 0));
  const discount = Math.round((pointsToUse / 10) * 0.1 * 100) / 100;
  const finalFare = Math.max(0, Math.round((journey.totalFare - discount) * 100) / 100);

  const handleBook = async () => {
    setBooking(true); setError('');
    try {
      const { data } = await api.post('/bookings', {
        journeyId: journey._id,
        rewardPointsUsed: pointsToUse,
        passengers: 1,
      });
      navigate(`/payment/${data.booking._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
      setBooking(false);
    }
  };

  return (
    <div className="mesh-bg" style={{ minHeight:'100vh', padding:'40px 0 60px' }}>
      <div className="container" style={{ maxWidth:780 }}>
        <div className="anim-fade-up" style={{ marginBottom:28 }}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
          <h1 style={styles.pageTitle}>🎫 Confirm Booking</h1>
          <p className="text-muted">Review your journey and apply any rewards before booking</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>⚠️ {error}</div>}

        <div style={styles.layout}>
          {/* Journey details */}
          <div style={{ flex:1 }}>
            {/* Route card */}
            <div className="card anim-fade-up" style={{ marginBottom:20 }}>
              <div style={styles.routeHeader}>
                <div>
                  <span className="badge badge-warning" style={{ marginBottom:8 }}>PENDING</span>
                  <h2 style={styles.routeTitle}>
                    {journey.origin} → {journey.destination}
                  </h2>
                  <p className="text-muted text-sm">
                    {new Date(journey.date+'T00:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                  </p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'2rem', fontWeight:800, color:'#00c2a8', fontFamily:'Syne, sans-serif' }}>
                    £{journey.totalFare.toFixed(2)}
                  </div>
                  <div className="text-muted text-xs">base fare</div>
                </div>
              </div>

              {/* Stats */}
              <div style={styles.journeyStats}>
                {[
                  { icon:'⏱️', v:`${journey.totalDuration} min` },
                  { icon:'📏', v:`${journey.totalDistance} km` },
                  { icon:'🌿', v:`${journey.ecoPoints} pts` },
                  { icon:'♻️', v:`${journey.totalCo2Saved}g saved` },
                ].map(s => (
                  <div key={s.v} style={styles.journeyStat}>
                    <span style={{ fontSize:'1.1rem' }}>{s.icon}</span>
                    <span style={{ fontSize:'0.82rem', color:'#94a3b8' }}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Segments */}
            <div className="card anim-fade-up" style={{ marginBottom:20 }}>
              <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:'1rem', marginBottom:16 }}>Route Segments</h3>
              {journey.segments.map((seg, i) => (
                <div key={i} style={styles.seg}>
                  <div style={styles.segLine}>
                    <div style={styles.segDot} />
                    {i < journey.segments.length - 1 && <div style={styles.segConnector} />}
                  </div>
                  <div style={{ flex:1, paddingBottom:16 }}>
                    <div style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:2 }}>
                      {MODE_ICONS[seg.mode] || '🚌'} {seg.from} → {seg.to}
                    </div>
                    <div style={{ color:'#94a3b8', fontSize:'0.8rem' }}>
                      {seg.provider} · {seg.departureTime}–{seg.arrivalTime} · {seg.duration} min · £{seg.fare.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rewards */}
            {rewards && rewards.totalPoints > 0 && (
              <div className="card anim-fade-up" style={{ borderColor:'rgba(0,214,143,0.2)' }}>
                <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:'1rem', marginBottom:4 }}>🌿 Apply Eco-Points</h3>
                <p className="text-muted text-sm" style={{ marginBottom:16 }}>
                  Balance: <strong style={{ color:'#00d68f' }}>{rewards.totalPoints} pts</strong> · 10 pts = £0.10 discount
                </p>
                <div style={styles.pointsGrid}>
                  {pointOptions.map(p => (
                    <button
                      key={p}
                      onClick={() => setPointsToUse(p)}
                      style={{ ...styles.pointBtn, ...(pointsToUse === p ? styles.pointBtnActive : {}) }}
                    >
                      {p === 0 ? 'None' : `${p} pts`}
                    </button>
                  ))}
                </div>
                {pointsToUse > 0 && (
                  <div className="alert alert-success" style={{ marginTop:12 }}>
                    ✅ Using {pointsToUse} points → £{discount.toFixed(2)} discount
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div style={{ width:260, flexShrink:0 }}>
            <div className="card" style={styles.summary}>
              <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.05rem', marginBottom:20 }}>Booking Summary</h3>

              <div style={styles.summaryRow}>
                <span className="text-muted text-sm">Base fare</span>
                <span style={{ fontWeight:600 }}>£{journey.totalFare.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div style={styles.summaryRow}>
                  <span style={{ color:'#00d68f', fontSize:'0.88rem' }}>Reward discount</span>
                  <span style={{ color:'#00d68f', fontWeight:600 }}>-£{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="divider" />
              <div style={{ ...styles.summaryRow, marginBottom:24 }}>
                <span style={{ fontWeight:700 }}>Total</span>
                <span style={{ fontFamily:'Syne, sans-serif', fontSize:'1.4rem', fontWeight:800, color:'#00c2a8' }}>
                  £{finalFare.toFixed(2)}
                </span>
              </div>

              <div style={{ fontSize:'0.78rem', color:'#94a3b8', marginBottom:20, lineHeight:1.5 }}>
                🌿 You'll earn <strong style={{ color:'#00d68f' }}>{journey.ecoPoints} eco-points</strong> after this journey.
                {pointsToUse > 0 && ` (${rewards?.totalPoints - pointsToUse} pts remaining)`}
              </div>

              <button className="btn btn-primary btn-full btn-lg" onClick={handleBook} disabled={booking}>
                {booking ? '⏳ Booking...' : '→ Confirm & Pay'}
              </button>
              <button className="btn btn-secondary btn-full" onClick={() => navigate(-1)} style={{ marginTop:10 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backBtn: {
    background:'none', border:'none', color:'#94a3b8', cursor:'pointer',
    fontSize:'0.9rem', padding:'0 0 12px', display:'block',
  },
  pageTitle: { fontFamily:'Syne, sans-serif', fontSize:'2rem', fontWeight:800, marginBottom:6 },
  layout: { display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap' },
  routeHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, marginBottom:16 },
  routeTitle: { fontFamily:'Syne, sans-serif', fontSize:'1.4rem', fontWeight:700 },
  journeyStats: { display:'flex', gap:12, flexWrap:'wrap', padding:'12px 0 0', borderTop:'1px solid rgba(255,255,255,0.07)' },
  journeyStat: { display:'flex', alignItems:'center', gap:6 },
  seg: { display:'flex', gap:12 },
  segLine: { display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, paddingTop:4 },
  segDot: { width:10, height:10, borderRadius:'50%', background:'#00c2a8', flexShrink:0 },
  segConnector: { width:2, flex:1, background:'rgba(0,194,168,0.2)', marginTop:4 },
  pointsGrid: { display:'flex', gap:8, flexWrap:'wrap' },
  pointBtn: {
    padding:'7px 14px', borderRadius:999, border:'1px solid rgba(255,255,255,0.12)',
    background:'transparent', color:'#94a3b8', cursor:'pointer', fontSize:'0.82rem', fontWeight:600,
    transition:'all 0.15s',
  },
  pointBtnActive: {
    background:'rgba(0,214,143,0.15)', borderColor:'rgba(0,214,143,0.4)', color:'#00d68f',
  },
  summary: { position:'sticky', top:80, background:'rgba(15,32,68,0.9)' },
  summaryRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
};
