// ── Rewards Dashboard Page ────────────────────────────────────
import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const TIER_CONFIG = {
  bronze:   { color:'#cd7f32', bg:'rgba(205,127,50,0.1)',  icon:'🥉', next:500,  label:'Bronze' },
  silver:   { color:'#c0c0c0', bg:'rgba(192,192,192,0.1)', icon:'🥈', next:2000, label:'Silver' },
  gold:     { color:'#ffd700', bg:'rgba(255,215,0,0.1)',   icon:'🥇', next:5000, label:'Gold' },
  platinum: { color:'#e5e4e2', bg:'rgba(229,228,226,0.1)', icon:'💎', next:null, label:'Platinum' },
};

const TYPE_ICONS  = { earned:'➕', redeemed:'➖', bonus:'🎁', expired:'⏰' };
const TYPE_COLORS = { earned:'#00d68f', redeemed:'#f43f5e', bonus:'#f59e0b', expired:'#94a3b8' };

export default function RewardsPage() {
  const [reward, setReward]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(0); // points to simulate redeeming

  useEffect(() => {
    api.get('/rewards').then(r => setReward(r.data.reward)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-wrap mesh-bg" style={{minHeight:'100vh'}}><div className="spinner"/></div>;
  if (!reward) return <div className="loader-wrap"><p className="text-muted">No reward data found.</p></div>;

  const tier    = TIER_CONFIG[reward.tier] || TIER_CONFIG.bronze;
  const nextTier= Object.values(TIER_CONFIG).find(t => t.next && reward.lifetimePoints < t.next);
  const progress= nextTier ? Math.min(100, (reward.lifetimePoints / nextTier.next) * 100) : 100;
  const discount= Math.round((preview / 10) * 0.1 * 100) / 100;

  const PREVIEW_OPTIONS = [0, 10, 20, 30, 50, 100].filter(p => p <= reward.totalPoints);

  return (
    <div className="mesh-bg" style={{ minHeight:'100vh', padding:'40px 0 60px' }}>
      <div className="container" style={{ maxWidth:900 }}>
        <div className="anim-fade-up" style={{ marginBottom:32 }}>
          <h1 style={styles.pageTitle}>🌿 Eco Rewards</h1>
          <p className="text-muted">Earn green points on every journey and redeem for discounts</p>
        </div>

        {/* ── Top stats ── */}
        <div className="grid-3" style={{ marginBottom:28, gap:20 }}>
          {/* Points balance */}
          <div className="card" style={{ textAlign:'center', background:'linear-gradient(135deg, rgba(0,214,143,0.08), rgba(0,194,168,0.05))', borderColor:'rgba(0,214,143,0.2)' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:8 }}>🌿</div>
            <div style={{ fontFamily:'Syne, sans-serif', fontSize:'2.8rem', fontWeight:800, color:'#00d68f' }}>
              {reward.totalPoints}
            </div>
            <div style={{ color:'#94a3b8', fontSize:'0.85rem', marginTop:4 }}>Available Points</div>
            <div style={{ color:'#00c2a8', fontSize:'0.8rem', marginTop:4, fontWeight:600 }}>
              ≈ £{(reward.totalPoints / 10 * 0.1).toFixed(2)} discount value
            </div>
          </div>

          {/* Lifetime */}
          <div className="card" style={{ textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:8 }}>⭐</div>
            <div style={{ fontFamily:'Syne, sans-serif', fontSize:'2.8rem', fontWeight:800, color:'#f59e0b' }}>
              {reward.lifetimePoints}
            </div>
            <div style={{ color:'#94a3b8', fontSize:'0.85rem', marginTop:4 }}>Lifetime Points Earned</div>
            <div style={{ color:'#f59e0b', fontSize:'0.8rem', marginTop:4, fontWeight:600 }}>
              All-time total
            </div>
          </div>

          {/* Tier */}
          <div className="card" style={{ textAlign:'center', background: tier.bg, borderColor: `${tier.color}33` }}>
            <div style={{ fontSize:'2.5rem', marginBottom:8 }}>{tier.icon}</div>
            <div style={{ fontFamily:'Syne, sans-serif', fontSize:'2rem', fontWeight:800, color: tier.color }}>
              {tier.label}
            </div>
            <div style={{ color:'#94a3b8', fontSize:'0.85rem', marginTop:4 }}>Current Tier</div>
            {nextTier && (
              <div style={{ color: tier.color, fontSize:'0.78rem', marginTop:4, fontWeight:600 }}>
                {nextTier.next - reward.lifetimePoints} pts to next tier
              </div>
            )}
          </div>
        </div>

        {/* ── Tier progress ── */}
        <div className="card anim-fade-up" style={{ marginBottom:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.05rem' }}>Tier Progress</h3>
            <span style={{ color: tier.color, fontSize:'0.85rem', fontWeight:600 }}>{tier.icon} {tier.label}</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressBar, width:`${progress}%`, background: tier.color }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
            {['Bronze','Silver','Gold','Platinum'].map(t => (
              <span key={t} style={{ fontSize:'0.72rem', color: reward.tier === t.toLowerCase() ? tier.color : '#94a3b8' }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Redemption calculator ── */}
        <div className="card anim-fade-up" style={{ marginBottom:28, borderColor:'rgba(0,194,168,0.2)' }}>
          <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.05rem', marginBottom:4 }}>💡 Redemption Calculator</h3>
          <p className="text-muted text-sm" style={{ marginBottom:20 }}>See how much you can save on your next journey</p>

          <div style={styles.pointsGrid}>
            {PREVIEW_OPTIONS.map(p => (
              <button key={p} onClick={() => setPreview(p)}
                style={{ ...styles.pointBtn, ...(preview===p ? styles.pointBtnActive : {}) }}>
                {p === 0 ? 'None' : `${p} pts`}
              </button>
            ))}
          </div>

          {preview > 0 && (
            <div style={styles.previewResult}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:700, color:'#00d68f', fontSize:'1.1rem' }}>£{discount.toFixed(2)} discount</div>
                  <div style={{ color:'#94a3b8', fontSize:'0.82rem', marginTop:2 }}>
                    Remaining balance: {reward.totalPoints - preview} pts
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'0.78rem', color:'#94a3b8' }}>Points used</div>
                  <div style={{ fontWeight:700, color:'#00c2a8' }}>{preview}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── How to earn ── */}
        <div className="card anim-fade-up" style={{ marginBottom:28 }}>
          <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.05rem', marginBottom:20 }}>🏆 How to Earn Points</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16 }}>
            {[
              { icon:'🚇', title:'Take the Metro', pts:'5–15 pts', desc:'Per journey' },
              { icon:'🚲', title:'Ride a Bike', pts:'10–20 pts', desc:'Zero-emissions bonus' },
              { icon:'🛴', title:'E-Scooter', pts:'5–10 pts', desc:'Last-mile solution' },
              { icon:'🚌', title:'Take a Bus', pts:'3–8 pts', desc:'Shared transport' },
              { icon:'🎁', title:'Welcome Bonus', pts:'50 pts', desc:'On account creation' },
              { icon:'🌱', title:'Eco Journey', pts:'+10 bonus', desc:'Full green route' },
            ].map(h => (
              <div key={h.title} style={styles.howItem}>
                <div style={{ fontSize:'1.6rem', marginBottom:8 }}>{h.icon}</div>
                <div style={{ fontWeight:600, fontSize:'0.88rem', marginBottom:2 }}>{h.title}</div>
                <div style={{ color:'#00d68f', fontWeight:700, fontSize:'0.85rem' }}>{h.pts}</div>
                <div style={{ color:'#94a3b8', fontSize:'0.75rem' }}>{h.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Transaction history ── */}
        <div className="card anim-fade-up">
          <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.05rem', marginBottom:20 }}>📋 Transaction History</h3>
          {reward.transactions.length === 0 ? (
            <p className="text-muted" style={{ textAlign:'center', padding:'24px 0' }}>No transactions yet. Start a journey to earn points!</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column' }}>
              {[...reward.transactions].reverse().map((tx, i) => (
                <div key={i} style={{ ...styles.txRow, ...(i===0 ? {} : { borderTop:'1px solid rgba(255,255,255,0.06)' }) }}>
                  <div style={{ ...styles.txIcon, color: TYPE_COLORS[tx.type] }}>
                    {TYPE_ICONS[tx.type]}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{tx.description}</div>
                    <div style={{ color:'#94a3b8', fontSize:'0.75rem', marginTop:2 }}>
                      {new Date(tx.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                    </div>
                  </div>
                  <div style={{ fontWeight:700, fontSize:'1rem', color: TYPE_COLORS[tx.type] }}>
                    {tx.type==='redeemed' || tx.type==='expired' ? '' : '+'}{tx.points > 0 && tx.type !== 'redeemed' ? '+' : ''}{tx.points} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageTitle: { fontFamily:'Syne, sans-serif', fontSize:'2rem', fontWeight:800, marginBottom:8 },
  progressTrack: { height:10, background:'rgba(255,255,255,0.08)', borderRadius:999, overflow:'hidden' },
  progressBar: { height:'100%', borderRadius:999, transition:'width 1s ease' },
  pointsGrid: { display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 },
  pointBtn: {
    padding:'8px 16px', borderRadius:999, border:'1px solid rgba(255,255,255,0.12)',
    background:'transparent', color:'#94a3b8', cursor:'pointer', fontSize:'0.85rem', fontWeight:600,
    transition:'all 0.15s',
  },
  pointBtnActive: { background:'rgba(0,214,143,0.15)', borderColor:'rgba(0,214,143,0.4)', color:'#00d68f' },
  previewResult: {
    background:'rgba(0,214,143,0.08)', border:'1px solid rgba(0,214,143,0.2)',
    borderRadius:10, padding:'14px 18px',
  },
  howItem: {
    background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:12, padding:'16px', textAlign:'center',
  },
  txRow: { display:'flex', alignItems:'center', gap:14, padding:'14px 0' },
  txIcon: { fontSize:'1.3rem', width:32, textAlign:'center', flexShrink:0 },
};
