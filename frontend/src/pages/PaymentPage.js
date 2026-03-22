// ── Payment Page ──────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

// Format card number with spaces every 4 digits
const formatCard = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
const formatExpiry = (v) => {
  const clean = v.replace(/\D/g,'').slice(0,4);
  return clean.length > 2 ? `${clean.slice(0,2)}/${clean.slice(2)}` : clean;
};

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult]     = useState(null); // {success, message, ecoPointsEarned}
  const [error, setError]       = useState('');
  const [card, setCard]         = useState({ name:'', number:'', expiry:'', cvv:'' });

  useEffect(() => {
    api.get(`/bookings/${id}`).then(r => setBooking(r.data.booking))
      .catch(() => setError('Failed to load booking')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loader-wrap mesh-bg" style={{minHeight:'100vh'}}><div className="spinner"/></div>;
  if (error)   return <div className="loader-wrap"><div className="alert alert-error">{error}</div></div>;

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true); setError('');
    try {
      const { data } = await api.post('/payments', {
        bookingId: id,
        cardholderName: card.name,
        cardNumber: card.number,
        expiryDate: card.expiry,
        cvv: card.cvv,
      });
      setResult({ success: true, message: data.message, ecoPointsEarned: data.ecoPointsEarned, newBalance: data.newPointsBalance });
    } catch (err) {
      const d = err.response?.data;
      if (d?.payment) {
        setResult({ success: false, message: d.message });
      } else {
        setError(d?.message || 'Payment error');
      }
    } finally { setProcessing(false); }
  };

  if (result) return <PaymentResult result={result} booking={booking} navigate={navigate} />;

  return (
    <div className="mesh-bg" style={{ minHeight:'100vh', padding:'40px 0 60px' }}>
      <div className="container" style={{ maxWidth:760 }}>
        <div className="anim-fade-up" style={{ marginBottom:28 }}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
          <h1 style={styles.pageTitle}>💳 Secure Payment</h1>
          <p className="text-muted">This is a simulated payment — no real charges</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>⚠️ {error}</div>}

        <div style={styles.layout}>
          {/* Card form */}
          <div style={{ flex:1 }}>
            <div className="card anim-fade-up">
              {/* Visual card preview */}
              <div style={styles.cardPreview}>
                <div style={styles.cardChip}>
                  <div style={styles.chipInner} />
                </div>
                <div style={styles.cardNum}>
                  {(card.number || '•••• •••• •••• ••••').padEnd(19,'•').replace(/^(.{0,19}).*$/, '$1')}
                </div>
                <div style={styles.cardFooter}>
                  <div>
                    <div style={styles.cardLabel}>Cardholder</div>
                    <div style={styles.cardValue}>{card.name || 'YOUR NAME'}</div>
                  </div>
                  <div>
                    <div style={styles.cardLabel}>Expires</div>
                    <div style={styles.cardValue}>{card.expiry || 'MM/YY'}</div>
                  </div>
                  <div style={{ marginLeft:'auto', fontSize:'1.2rem', opacity:0.6 }}>
                    {card.number.replace(/\s/g,'')[0]==='4' ? '💳 VISA' : card.number.replace(/\s/g,'')[0]==='5' ? '💳 MC' : '💳'}
                  </div>
                </div>
              </div>

              <form onSubmit={handlePay} style={{ display:'flex', flexDirection:'column', gap:16, marginTop:24 }}>
                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input className="form-input" placeholder="Jane Smith"
                    value={card.name} onChange={e => setCard({...card, name:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input className="form-input" placeholder="1234 5678 9012 3456" maxLength={19}
                    value={card.number}
                    onChange={e => setCard({...card, number:formatCard(e.target.value)})} required />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input className="form-input" placeholder="MM/YY" maxLength={5}
                      value={card.expiry}
                      onChange={e => setCard({...card, expiry:formatExpiry(e.target.value)})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input className="form-input" placeholder="•••" maxLength={4} type="password"
                      value={card.cvv}
                      onChange={e => setCard({...card, cvv:e.target.value.replace(/\D/g,'').slice(0,4)})} required />
                  </div>
                </div>

                {/* Test hint */}
                <div style={styles.testHint}>
                  <p style={{ fontWeight:600, marginBottom:4, color:'#f59e0b', fontSize:'0.82rem' }}>🧪 Test Cards</p>
                  <p style={{ fontSize:'0.78rem', color:'#94a3b8' }}>Any card → success &nbsp;·&nbsp; ends in 0000 → declined &nbsp;·&nbsp; ends in 1111 → insufficient funds</p>
                </div>

                <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={processing} style={{ marginTop:4 }}>
                  {processing ? (
                    <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                      <span style={{ width:16,height:16,border:'2px solid rgba(0,0,0,0.2)',borderTopColor:'#0a1628',borderRadius:'50%',animation:'spin 0.7s linear infinite' }} />
                      Processing payment…
                    </span>
                  ) : `→ Pay £${booking?.finalFare?.toFixed(2)}`}
                </button>
              </form>

              <div style={{ textAlign:'center', marginTop:16, color:'#94a3b8', fontSize:'0.78rem' }}>
                🔒 Simulated secure payment · No real data is stored
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div style={{ width:240, flexShrink:0 }}>
            <div className="card" style={styles.summary}>
              <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:'1rem', marginBottom:20 }}>Order Summary</h3>

              <div style={{ fontSize:'0.85rem', marginBottom:12 }}>
                <div style={{ color:'#94a3b8', marginBottom:2 }}>Booking Ref</div>
                <div style={{ fontWeight:600, color:'#00c2a8' }}>{booking?.bookingRef}</div>
              </div>

              <div style={{ fontSize:'0.85rem', marginBottom:12 }}>
                <div style={{ color:'#94a3b8', marginBottom:2 }}>Route</div>
                <div style={{ fontWeight:600 }}>{booking?.journey?.origin} → {booking?.journey?.destination}</div>
              </div>

              {booking?.rewardPointsUsed > 0 && (
                <div style={styles.summaryRow}>
                  <span style={{ fontSize:'0.82rem', color:'#94a3b8' }}>Points used</span>
                  <span style={{ color:'#00d68f', fontSize:'0.82rem' }}>{booking.rewardPointsUsed} pts</span>
                </div>
              )}
              {booking?.discountAmount > 0 && (
                <div style={styles.summaryRow}>
                  <span style={{ fontSize:'0.82rem', color:'#94a3b8' }}>Discount</span>
                  <span style={{ color:'#00d68f', fontSize:'0.82rem' }}>-£{booking.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="divider" />
              <div style={styles.summaryRow}>
                <span style={{ fontWeight:700 }}>Total</span>
                <span style={{ fontFamily:'Syne, sans-serif', fontSize:'1.5rem', fontWeight:800, color:'#00c2a8' }}>
                  £{booking?.finalFare?.toFixed(2)}
                </span>
              </div>

              <div style={{ marginTop:16, padding:'10px 12px', borderRadius:8, background:'rgba(0,214,143,0.08)', fontSize:'0.78rem', color:'#00d68f' }}>
                🌿 Earn {booking?.journey?.ecoPoints || 5} eco-points on this journey
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Payment Result screen ─────────────────────────────────────
function PaymentResult({ result, booking, navigate }) {
  return (
    <div className="mesh-bg" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div className="card anim-fade-up" style={{ maxWidth:480, width:'100%', textAlign:'center', padding:48 }}>
        {result.success ? (
          <>
            <div style={{ fontSize:'4rem', marginBottom:16 }}>✅</div>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.8rem', fontWeight:800, color:'#00d68f', marginBottom:12 }}>
              Payment Successful!
            </h2>
            <p style={{ color:'#94a3b8', marginBottom:24 }}>{result.message}</p>

            {result.ecoPointsEarned && (
              <div style={{ background:'rgba(0,214,143,0.1)', border:'1px solid rgba(0,214,143,0.2)', borderRadius:12, padding:'16px 20px', marginBottom:24 }}>
                <div style={{ fontSize:'1.6rem', marginBottom:4 }}>🌿</div>
                <div style={{ fontFamily:'Syne, sans-serif', fontSize:'1.4rem', fontWeight:800, color:'#00d68f' }}>
                  +{result.ecoPointsEarned} Eco-Points!
                </div>
                <div style={{ color:'#94a3b8', fontSize:'0.82rem', marginTop:4 }}>New balance: {result.newBalance} pts</div>
              </div>
            )}

            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'12px 16px', marginBottom:28, fontSize:'0.85rem' }}>
              <div style={{ color:'#94a3b8' }}>Booking Reference</div>
              <div style={{ color:'#00c2a8', fontWeight:700, letterSpacing:'0.05em', marginTop:4 }}>{booking?.bookingRef}</div>
            </div>

            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/dashboard" className="btn btn-primary">🏠 Dashboard</Link>
              <Link to="/rewards"   className="btn btn-secondary">🌿 View Rewards</Link>
              <Link to="/my-bookings" className="btn btn-secondary">🎫 My Bookings</Link>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize:'4rem', marginBottom:16 }}>❌</div>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.8rem', fontWeight:800, color:'#f43f5e', marginBottom:12 }}>
              Payment Failed
            </h2>
            <p style={{ color:'#94a3b8', marginBottom:28 }}>{result.message}</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>🔄 Try Again</button>
              <Link to="/dashboard" className="btn btn-secondary">🏠 Dashboard</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  backBtn: { background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:'0.9rem', padding:'0 0 12px', display:'block' },
  pageTitle: { fontFamily:'Syne, sans-serif', fontSize:'2rem', fontWeight:800, marginBottom:6 },
  layout: { display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap' },
  cardPreview: {
    background:'linear-gradient(135deg, #0f2044, #1a3260)',
    border:'1px solid rgba(0,194,168,0.2)', borderRadius:16, padding:'24px 28px', minHeight:180,
    position:'relative', overflow:'hidden',
  },
  cardChip: {
    width:36, height:28, borderRadius:4,
    background:'linear-gradient(135deg, #f59e0b, #d97706)', marginBottom:20,
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  chipInner: { width:18, height:14, borderRadius:2, border:'1px solid rgba(0,0,0,0.3)', background:'rgba(0,0,0,0.1)' },
  cardNum: { fontFamily:'monospace', fontSize:'1.1rem', letterSpacing:'0.2em', color:'#fff', marginBottom:20 },
  cardFooter: { display:'flex', alignItems:'flex-end', gap:24 },
  cardLabel: { fontSize:'0.62rem', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2 },
  cardValue: { fontSize:'0.85rem', fontWeight:600, color:'#fff' },
  testHint: {
    background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)',
    borderRadius:8, padding:'10px 14px',
  },
  summary: { position:'sticky', top:80 },
  summaryRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
};
