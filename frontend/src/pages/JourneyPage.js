// ── Journey Planner Page ──────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const MODE_ICONS = { bus:'🚌', metro:'🚇', bike:'🚲', scooter:'🛴', 'ride-hail':'🚗', walk:'🚶' };
const MODE_COLORS = { bus:'#38bdf8', metro:'#00c2a8', bike:'#00d68f', scooter:'#f59e0b', 'ride-hail':'#a78bfa', walk:'#fb7185' };

export default function JourneyPage() {
  const navigate = useNavigate();
  const [cities, setCities]     = useState([]);
  const [form, setForm]         = useState({ origin:'London', destination:'Manchester', date: new Date().toISOString().slice(0,10) });
  const [options, setOptions]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(null);
  const [error, setError]       = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    api.get('/journeys/cities').then(r => setCities(r.data.cities)).catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (form.origin === form.destination) { setError('Origin and destination must differ'); return; }
    setError(''); setLoading(true); setOptions([]); setSearched(false);
    try {
      const { data } = await api.post('/journeys/plan', form);
      setOptions(data.options); setSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to find routes');
    } finally { setLoading(false); }
  };

  const handleSelect = async (option) => {
    setSaving(option.name);
    try {
      const payload = { ...form, ...option };
      const { data } = await api.post('/journeys', payload);
      navigate(`/booking/${data.journey._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save journey');
    } finally { setSaving(null); }
  };

  return (
    <div className="mesh-bg" style={{ minHeight:'100vh', padding:'40px 0 60px' }}>
      <div className="container" style={{ maxWidth:900 }}>
        {/* Header */}
        <div className="anim-fade-up" style={{ marginBottom:32 }}>
          <h1 style={styles.pageTitle}>🗺️ Plan Your Journey</h1>
          <p className="text-muted">Compare routes across multiple transport modes</p>
        </div>

        {/* Search form */}
        <div className="card anim-fade-up" style={{ marginBottom:32 }}>
          {error && <div className="alert alert-error" style={{ marginBottom:16 }}>⚠️ {error}</div>}
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <div className="form-group" style={{ flex:1 }}>
              <label className="form-label">From</label>
              <select className="form-input" value={form.origin} onChange={e => setForm({...form, origin:e.target.value})} required>
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Swap button */}
            <button type="button" style={styles.swapBtn}
              onClick={() => setForm({...form, origin:form.destination, destination:form.origin})}>
              ⇄
            </button>

            <div className="form-group" style={{ flex:1 }}>
              <label className="form-label">To</label>
              <select className="form-input" value={form.destination} onChange={e => setForm({...form, destination:e.target.value})} required>
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ flex:'0 0 160px' }}>
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={form.date}
                min={new Date().toISOString().slice(0,10)}
                onChange={e => setForm({...form, date:e.target.value})} required />
            </div>

            <div style={{ alignSelf:'flex-end' }}>
              <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                {loading ? '⏳ Searching...' : '🔍 Search Routes'}
              </button>
            </div>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="loader-wrap">
            <div style={{ textAlign:'center' }}>
              <div className="spinner" style={{ margin:'0 auto 16px' }} />
              <p className="text-muted">Finding best routes for you…</p>
            </div>
          </div>
        )}

        {/* Results */}
        {searched && options.length > 0 && (
          <div className="anim-fade-up">
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.1rem', marginBottom:16, color:'#94a3b8' }}>
              {options.length} routes found · {form.origin} → {form.destination} · {new Date(form.date+'T00:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}
            </h2>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {options.map((opt, i) => (
                <div key={i} className="card anim-fade-up" style={{ animationDelay:`${i*0.1}s`, ...styles.optionCard }}>
                  {/* Header row */}
                  <div style={styles.optionHeader}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                        <span style={{ fontFamily:'Syne, sans-serif', fontSize:'1.1rem', fontWeight:700 }}>{opt.name}</span>
                        {i === 0 && <span className="badge badge-teal">⚡ Recommended</span>}
                        {opt.ecoPoints >= 10 && <span className="badge badge-success">🌿 Eco Bonus</span>}
                      </div>
                      {/* Mode pills */}
                      <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap' }}>
                        {opt.transportModes.map(m => (
                          <span key={m} style={{ ...styles.modePill, background:`${MODE_COLORS[m]}18`, color:MODE_COLORS[m], border:`1px solid ${MODE_COLORS[m]}40` }}>
                            {MODE_ICONS[m]} {m}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontFamily:'Syne, sans-serif', fontSize:'1.8rem', fontWeight:800, color:'#00c2a8' }}>
                        £{opt.totalFare.toFixed(2)}
                      </div>
                      <div style={{ color:'#94a3b8', fontSize:'0.8rem' }}>total fare</div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={styles.statsRow}>
                    {[
                      { icon:'⏱️', label:`${opt.totalDuration} min` },
                      { icon:'📏', label:`${opt.totalDistance} km` },
                      { icon:'🌿', label:`${opt.ecoPoints} pts` },
                      { icon:'♻️', label:`${opt.totalCo2Saved}g CO₂ saved` },
                    ].map(s => (
                      <div key={s.label} style={styles.statItem}>
                        <span style={{ marginRight:5 }}>{s.icon}</span>{s.label}
                      </div>
                    ))}
                  </div>

                  {/* Segments timeline */}
                  <div style={{ marginTop:16 }}>
                    {opt.segments.map((seg, si) => (
                      <div key={si} style={styles.segment}>
                        <div style={{ ...styles.segmentDot, background: MODE_COLORS[seg.mode] || '#00c2a8' }} />
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                            <span style={{ fontWeight:600, fontSize:'0.9rem' }}>
                              {MODE_ICONS[seg.mode]} {seg.from} → {seg.to}
                            </span>
                            <span style={{ color:'#94a3b8', fontSize:'0.82rem' }}>
                              {seg.departureTime} – {seg.arrivalTime}
                            </span>
                          </div>
                          <div style={{ color:'#94a3b8', fontSize:'0.78rem', marginTop:2 }}>
                            {seg.provider} · {seg.duration} min · £{seg.fare.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Select button */}
                  <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSelect(opt)}
                      disabled={saving === opt.name}
                    >
                      {saving === opt.name ? '⏳ Saving...' : '→ Select & Book'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searched && options.length === 0 && (
          <div className="card" style={{ textAlign:'center', padding:48 }}>
            <div style={{ fontSize:'3rem', marginBottom:16 }}>🚫</div>
            <h3 style={{ fontFamily:'Syne, sans-serif' }}>No routes found</h3>
            <p className="text-muted" style={{ marginTop:8 }}>Try a different origin or destination.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageTitle: { fontFamily:'Syne, sans-serif', fontSize:'2rem', fontWeight:800, marginBottom:8 },
  searchForm: { display:'flex', alignItems:'flex-end', gap:16, flexWrap:'wrap' },
  swapBtn: {
    background:'rgba(0,194,168,0.1)', border:'1px solid rgba(0,194,168,0.3)',
    color:'#00c2a8', borderRadius:8, padding:'10px 14px', cursor:'pointer',
    fontSize:'1.1rem', marginBottom:2, flexShrink:0,
  },
  optionCard: { transition:'box-shadow 0.2s' },
  optionHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16 },
  modePill: { padding:'3px 10px', borderRadius:999, fontSize:'0.75rem', fontWeight:600 },
  statsRow: {
    display:'flex', gap:16, flexWrap:'wrap', marginTop:16,
    padding:'12px 0', borderTop:'1px solid rgba(255,255,255,0.07)',
  },
  statItem: { fontSize:'0.82rem', color:'#94a3b8', display:'flex', alignItems:'center' },
  segment: {
    display:'flex', alignItems:'flex-start', gap:12, padding:'10px 0',
    borderBottom:'1px solid rgba(255,255,255,0.05)',
  },
  segmentDot: { width:10, height:10, borderRadius:'50%', marginTop:5, flexShrink:0 },
};
