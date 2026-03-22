// ── Map View Page ─────────────────────────────────────────────
// Uses Leaflet for open-source map integration
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../utils/api';

// Fix default Leaflet marker icon (webpack issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Major UK city coordinates
const UK_CITY_COORDS = {
  London:       [51.5074, -0.1278],
  Manchester:   [53.4808, -2.2426],
  Birmingham:   [52.4862, -1.8904],
  Leeds:        [53.8008, -1.5491],
  Sheffield:    [53.3811, -1.4701],
  Liverpool:    [53.4084, -2.9916],
  Bristol:      [51.4545, -2.5879],
  Edinburgh:    [55.9533, -3.1883],
  Glasgow:      [55.8642, -4.2518],
  Cardiff:      [51.4816, -3.1791],
  Newcastle:    [54.9783, -1.6178],
  Nottingham:   [52.9548, -1.1581],
  Leicester:    [52.6369, -1.1398],
  Oxford:       [51.7520, -1.2577],
  Cambridge:    [52.2053, 0.1218],
  Brighton:     [50.8225, -0.1372],
  Southampton:  [50.9097, -1.4044],
  York:         [53.9600, -1.0873],
  Coventry:     [52.4068, -1.5197],
  Bradford:     [53.7960, -1.7594],
};

// Transport hub markers for London (example)
const TRANSPORT_HUBS = [
  { name:'London King\'s Cross', pos:[51.5308,-0.1238], type:'rail',    icon:'🚆' },
  { name:'London Euston',        pos:[51.5282,-0.1337], type:'rail',    icon:'🚆' },
  { name:'Manchester Piccadilly',pos:[53.4771,-2.2309], type:'rail',    icon:'🚆' },
  { name:'Birmingham New St',    pos:[52.4775,-1.8994], type:'rail',    icon:'🚆' },
  { name:'London Paddington',    pos:[51.5154,-0.1755], type:'rail',    icon:'🚆' },
  { name:'Liverpool Lime St',    pos:[53.4073,-2.9778], type:'rail',    icon:'🚆' },
  { name:'Heathrow Airport',     pos:[51.4700,-0.4543], type:'airport', icon:'✈️' },
  { name:'Manchester Airport',   pos:[53.3589,-2.2727], type:'airport', icon:'✈️' },
];

const createCustomIcon = (emoji) => L.divIcon({
  html: `<div style="font-size:1.5rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">${emoji}</div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

export default function MapPage() {
  const [journeys, setJourneys]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [showHubs, setShowHubs]   = useState(true);
  const [showCities, setShowCities] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  useEffect(() => {
    api.get('/journeys').then(r => setJourneys(r.data.journeys || [])).catch(() => {});
  }, []);

  // Build route lines from user journeys
  const routes = journeys
    .filter(j => UK_CITY_COORDS[j.origin] && UK_CITY_COORDS[j.destination])
    .slice(0, 10) // show last 10
    .map(j => ({
      id: j._id,
      positions: [UK_CITY_COORDS[j.origin], UK_CITY_COORDS[j.destination]],
      origin: j.origin,
      destination: j.destination,
      status: j.status,
    }));

  const routeColor = (status) => ({
    planned: '#00c2a8', booked: '#f59e0b', completed: '#00d68f', cancelled: '#f43f5e'
  }[status] || '#94a3b8');

  return (
    <div className="mesh-bg" style={{ minHeight:'100vh', padding:'40px 0 60px' }}>
      <div className="container">
        <div style={{ marginBottom:24 }}>
          <h1 style={styles.pageTitle}>📍 UK Transport Map</h1>
          <p className="text-muted">Interactive map showing UK cities, transport hubs, and your journeys</p>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          {[
            { label:'🏙️ Cities',       state:showCities, toggle:() => setShowCities(!showCities) },
            { label:'🚉 Transport Hubs', state:showHubs,   toggle:() => setShowHubs(!showHubs) },
            { label:'🗺️ My Routes',    state:showRoutes, toggle:() => setShowRoutes(!showRoutes) },
          ].map(c => (
            <button key={c.label} onClick={c.toggle}
              style={{ ...styles.controlBtn, ...(c.state ? styles.controlBtnOn : {}) }}>
              {c.label}
            </button>
          ))}
          <span style={{ color:'#94a3b8', fontSize:'0.82rem', marginLeft:8 }}>
            {journeys.length} journey{journeys.length !== 1 ? 's' : ''} plotted
          </span>
        </div>

        <div style={{ borderRadius:14, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
          <MapContainer
            center={[53.0, -2.0]}
            zoom={6}
            style={{ height:560, background:'#0a1628' }}
          >
            {/* Dark-themed OpenStreetMap tiles */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            {/* UK city markers */}
            {showCities && Object.entries(UK_CITY_COORDS).map(([city, pos]) => (
              <Circle
                key={city}
                center={pos}
                radius={8000}
                pathOptions={{ color:'#00c2a8', fillColor:'#00c2a8', fillOpacity:0.4, weight:1 }}
              >
                <Popup>
                  <div style={{ color:'#0a1628', fontWeight:700 }}>
                    🏙️ {city}
                    <div style={{ fontWeight:400, fontSize:'0.82rem', marginTop:4, color:'#666' }}>
                      Available on UMMS
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Transport hub markers */}
            {showHubs && TRANSPORT_HUBS.map(hub => (
              <Marker key={hub.name} position={hub.pos} icon={createCustomIcon(hub.icon)}>
                <Popup>
                  <div style={{ color:'#0a1628' }}>
                    <strong>{hub.name}</strong>
                    <div style={{ fontSize:'0.8rem', color:'#666', marginTop:2 }}>
                      {hub.type === 'rail' ? '🚆 Rail hub' : '✈️ Airport'}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* User journey routes */}
            {showRoutes && routes.map(route => (
              <Polyline
                key={route.id}
                positions={route.positions}
                pathOptions={{
                  color: routeColor(route.status),
                  weight: 2.5,
                  opacity: 0.75,
                  dashArray: route.status === 'planned' ? '8 4' : undefined,
                }}
                eventHandlers={{ click: () => setSelected(route) }}
              >
                <Popup>
                  <div style={{ color:'#0a1628' }}>
                    <strong>🗺️ {route.origin} → {route.destination}</strong>
                    <div style={{ fontSize:'0.8rem', color:'#666', marginTop:2 }}>Status: {route.status}</div>
                  </div>
                </Popup>
              </Polyline>
            ))}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="card" style={{ marginTop:20, padding:'16px 24px' }}>
          <div style={{ display:'flex', gap:24, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontWeight:600, fontSize:'0.85rem' }}>Map Legend:</span>
            <span style={styles.legendItem}><span style={{ ...styles.dot, background:'#00c2a8' }} /> Cities</span>
            <span style={styles.legendItem}><span style={{ ...styles.dot, background:'#00c2a8', opacity:0.7 }} /> Planned route</span>
            <span style={styles.legendItem}><span style={{ ...styles.dot, background:'#f59e0b' }} /> Booked route</span>
            <span style={styles.legendItem}><span style={{ ...styles.dot, background:'#00d68f' }} /> Completed</span>
            <span style={styles.legendItem}><span style={{ ...styles.dot, background:'#f43f5e' }} /> Cancelled</span>
            <span style={styles.legendItem}>🚆 Rail hub &nbsp; ✈️ Airport</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageTitle: { fontFamily:'Syne, sans-serif', fontSize:'2rem', fontWeight:800, marginBottom:8 },
  controls: { display:'flex', gap:10, flexWrap:'wrap', marginBottom:16, alignItems:'center' },
  controlBtn: {
    padding:'8px 16px', borderRadius:999, border:'1px solid rgba(255,255,255,0.12)',
    background:'transparent', color:'#94a3b8', cursor:'pointer', fontSize:'0.83rem', fontWeight:600,
    transition:'all 0.15s',
  },
  controlBtnOn: { background:'rgba(0,194,168,0.15)', borderColor:'rgba(0,194,168,0.4)', color:'#00c2a8' },
  legendItem: { display:'flex', alignItems:'center', gap:6, fontSize:'0.8rem', color:'#94a3b8' },
  dot: { display:'inline-block', width:10, height:10, borderRadius:'50%', flexShrink:0 },
};
