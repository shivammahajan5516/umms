// ── Admin Dashboard Page ──────────────────────────────────────
import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../utils/api';

const PIE_COLORS = ['#00c2a8','#00d68f','#38bdf8','#f59e0b','#a78bfa','#fb7185'];

const STATUS_COLORS = { confirmed:'#00d68f', pending:'#f59e0b', cancelled:'#f43f5e', completed:'#38bdf8' };

const StatCard = ({ icon, label, value, sub, color='#00c2a8' }) => (
  <div className="card" style={{ textAlign:'center' }}>
    <div style={{ fontSize:'2rem', marginBottom:8 }}>{icon}</div>
    <div style={{ fontFamily:'Syne, sans-serif', fontSize:'2.2rem', fontWeight:800, color }}>{value}</div>
    <div style={{ color:'#94a3b8', fontSize:'0.82rem', marginTop:4 }}>{label}</div>
    {sub && <div style={{ color, fontSize:'0.75rem', marginTop:2, fontWeight:600 }}>{sub}</div>}
  </div>
);

export default function AdminPage() {
  const [data, setData]     = useState(null);
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState('overview');

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/users'),
    ]).then(([aRes, uRes]) => {
      setData(aRes.data.analytics);
      setUsers(uRes.data.users);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-wrap mesh-bg" style={{minHeight:'100vh'}}><div className="spinner"/></div>;

  const { totalUsers, totalBookings, totalRevenue, bookingsByStatus, last7Days, modeData, recentBookings, userGrowth } = data;

  const statusPieData = bookingsByStatus.map(s => ({
    name: s._id, value: s.count,
  }));

  const TABS = ['overview','bookings','users','transport'];

  return (
    <div className="mesh-bg" style={{ minHeight:'100vh', padding:'40px 0 60px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
            <span style={{ fontSize:'1.8rem' }}>📊</span>
            <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:'2rem', fontWeight:800 }}>Admin Dashboard</h1>
            <span className="badge badge-warning">Admin Only</span>
          </div>
          <p className="text-muted">System analytics and management overview</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabRow}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ ...styles.tab, ...(tab===t ? styles.tabActive : {}) }}>
              {{ overview:'📈 Overview', bookings:'🎫 Bookings', users:'👥 Users', transport:'🚌 Transport' }[t]}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <>
            <div className="grid-4" style={{ marginBottom:28, gap:20 }}>
              <StatCard icon="👥" label="Total Users"    value={totalUsers}                      sub="Registered passengers" />
              <StatCard icon="🎫" label="Total Bookings" value={totalBookings}                   sub="All time" color="#38bdf8" />
              <StatCard icon="💷" label="Total Revenue"  value={`£${totalRevenue.toFixed(2)}`}  sub="Simulated payments"    color="#f59e0b" />
              <StatCard icon="🌿" label="Eco Impact"     value={`${(totalBookings * 12).toFixed(0)}kg`} sub="CO₂ saved est." color="#00d68f" />
            </div>

            {/* Bookings trend */}
            <div className="grid-2" style={{ marginBottom:24, gap:24 }}>
              <div className="card">
                <h3 style={styles.chartTitle}>Bookings — Last 7 Days</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={last7Days} margin={{ top:10, right:10, left:-20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill:'#94a3b8', fontSize:11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'#94a3b8', fontSize:11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={styles.tooltip} cursor={{ fill:'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="count" fill="#00c2a8" radius={[4,4,0,0]} name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 style={styles.chartTitle}>User Growth — Last 7 Days</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={userGrowth} margin={{ top:10, right:10, left:-20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill:'#94a3b8', fontSize:11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'#94a3b8', fontSize:11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={styles.tooltip} />
                    <Line type="monotone" dataKey="count" stroke="#00d68f" strokeWidth={2} dot={{ fill:'#00d68f', r:4 }} name="New Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Booking status pie */}
            <div className="grid-2" style={{ gap:24 }}>
              <div className="card">
                <h3 style={styles.chartTitle}>Booking Status Distribution</h3>
                {statusPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={statusPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                        {statusPieData.map((entry, index) => (
                          <Cell key={index} fill={STATUS_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={styles.tooltip} />
                      <Legend wrapperStyle={{ color:'#94a3b8', fontSize:'0.82rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <p className="text-muted">No booking data yet</p>
                  </div>
                )}
              </div>

              <div className="card">
                <h3 style={styles.chartTitle}>Revenue Simulation</h3>
                <div style={{ padding:'20px 0' }}>
                  {[
                    { label:'Gross Revenue',   value:`£${totalRevenue.toFixed(2)}`,      color:'#00c2a8' },
                    { label:'Platform Fee (5%)', value:`£${(totalRevenue*0.05).toFixed(2)}`, color:'#f59e0b' },
                    { label:'Net Revenue',     value:`£${(totalRevenue*0.95).toFixed(2)}`, color:'#00d68f' },
                    { label:'Avg per Booking', value: totalBookings ? `£${(totalRevenue/totalBookings).toFixed(2)}` : '£0.00', color:'#38bdf8' },
                  ].map(r => (
                    <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color:'#94a3b8', fontSize:'0.88rem' }}>{r.label}</span>
                      <span style={{ fontFamily:'Syne, sans-serif', fontSize:'1.1rem', fontWeight:700, color: r.color }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── BOOKINGS TAB ── */}
        {tab === 'bookings' && (
          <div className="card">
            <h3 style={{ ...styles.chartTitle, marginBottom:20 }}>Recent Bookings ({recentBookings.length})</h3>
            <div style={{ overflowX:'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Ref','Passenger','Route','Status','Fare','Date'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(b => (
                    <tr key={b._id} style={styles.tr}>
                      <td style={styles.td}><span style={{ color:'#00c2a8', fontSize:'0.8rem' }}>{b.bookingRef}</span></td>
                      <td style={styles.td}><div style={{ fontWeight:600, fontSize:'0.88rem' }}>{b.user?.name}</div><div style={{ color:'#94a3b8', fontSize:'0.75rem' }}>{b.user?.email}</div></td>
                      <td style={styles.td}>{b.journey?.origin} → {b.journey?.destination}</td>
                      <td style={styles.td}>
                        <span className={`badge ${STATUS_COLORS[b.status] ? '' : 'badge-info'}`}
                          style={{ background:`${STATUS_COLORS[b.status]}20`, color: STATUS_COLORS[b.status]||'#38bdf8' }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={styles.td}><span style={{ fontWeight:700, color:'#00c2a8' }}>£{b.finalFare?.toFixed(2)}</span></td>
                      <td style={styles.td}><span style={{ color:'#94a3b8', fontSize:'0.8rem' }}>{new Date(b.createdAt).toLocaleDateString('en-GB')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div className="card">
            <h3 style={{ ...styles.chartTitle, marginBottom:20 }}>All Users ({users.length})</h3>
            <div style={{ overflowX:'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Name','Email','City','Role','Joined'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={styles.tr}>
                      <td style={styles.td}><div style={{ fontWeight:600 }}>{u.name}</div></td>
                      <td style={styles.td}><span style={{ color:'#94a3b8', fontSize:'0.85rem' }}>{u.email}</span></td>
                      <td style={styles.td}>{u.city || '—'}</td>
                      <td style={styles.td}>
                        <span className={`badge ${u.role==='admin' ? 'badge-warning' : 'badge-info'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={styles.td}><span style={{ color:'#94a3b8', fontSize:'0.8rem' }}>{new Date(u.createdAt).toLocaleDateString('en-GB')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TRANSPORT TAB ── */}
        {tab === 'transport' && (
          <div className="grid-2" style={{ gap:24 }}>
            <div className="card">
              <h3 style={styles.chartTitle}>Transport Mode Usage</h3>
              {modeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={modeData} layout="vertical" margin={{ top:10, right:20, left:20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fill:'#94a3b8', fontSize:11 }} axisLine={false} />
                    <YAxis dataKey="_id" type="category" tick={{ fill:'#94a3b8', fontSize:11 }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip contentStyle={styles.tooltip} />
                    <Bar dataKey="count" radius={[0,4,4,0]} name="Journeys">
                      {modeData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height:280, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <p className="text-muted">No journey data yet</p>
                </div>
              )}
            </div>

            <div className="card">
              <h3 style={styles.chartTitle}>Eco Impact Summary</h3>
              <div style={{ padding:'16px 0' }}>
                {[
                  { icon:'♻️', label:'Estimated CO₂ Saved',   value:`${(totalBookings * 1200).toLocaleString()}g` },
                  { icon:'🌳', label:'Trees Equivalent',       value:`${Math.floor(totalBookings * 0.05)}` },
                  { icon:'🚗', label:'Car Trips Replaced',     value:`${Math.floor(totalBookings * 0.7)}` },
                  { icon:'⚡', label:'Energy Saved (kWh est)', value:`${(totalBookings * 2.4).toFixed(1)}` },
                ].map(r => (
                  <div key={r.label} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize:'1.5rem' }}>{r.icon}</span>
                    <span style={{ color:'#94a3b8', fontSize:'0.88rem', flex:1 }}>{r.label}</span>
                    <span style={{ fontFamily:'Syne, sans-serif', fontSize:'1.1rem', fontWeight:700, color:'#00d68f' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  tabRow: { display:'flex', gap:8, flexWrap:'wrap', marginBottom:28 },
  tab: {
    padding:'9px 20px', borderRadius:999, border:'1px solid rgba(255,255,255,0.1)',
    background:'transparent', color:'#94a3b8', cursor:'pointer', fontSize:'0.85rem', fontWeight:600,
    transition:'all 0.15s',
  },
  tabActive: { background:'rgba(0,194,168,0.15)', borderColor:'rgba(0,194,168,0.4)', color:'#00c2a8' },
  chartTitle: { fontFamily:'Syne, sans-serif', fontSize:'1rem', fontWeight:700, marginBottom:16 },
  tooltip: {
    background:'rgba(10,22,40,0.95)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:8, color:'#fff', fontSize:'0.82rem',
  },
  table: { width:'100%', borderCollapse:'collapse', minWidth:600 },
  th: {
    textAlign:'left', padding:'10px 14px', fontSize:'0.75rem', fontWeight:700,
    color:'#94a3b8', letterSpacing:'0.05em', textTransform:'uppercase',
    borderBottom:'1px solid rgba(255,255,255,0.08)', whiteSpace:'nowrap',
  },
  tr: { borderBottom:'1px solid rgba(255,255,255,0.05)' },
  td: { padding:'12px 14px', fontSize:'0.88rem', verticalAlign:'top' },
};
