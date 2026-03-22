// ── Journey Planning Service ──────────────────────────────────
// Generates realistic simulated journey options between UK cities.
// In a real system this would call TfL API, National Rail API, etc.

const UK_CITIES = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Sheffield',
  'Liverpool', 'Bristol', 'Edinburgh', 'Glasgow', 'Cardiff',
  'Newcastle', 'Nottingham', 'Leicester', 'Coventry', 'Bradford',
  'Oxford', 'Cambridge', 'Brighton', 'Southampton', 'York',
];

// Approximate distances between major UK cities (km)
const CITY_DISTANCES = {
  'London-Manchester': 262, 'London-Birmingham': 160, 'London-Leeds': 280,
  'London-Sheffield': 255, 'London-Liverpool': 293, 'London-Bristol': 173,
  'London-Edinburgh': 666, 'London-Glasgow': 666, 'London-Cardiff': 244,
  'London-Newcastle': 446, 'London-Nottingham': 200, 'London-Leicester': 160,
  'Manchester-Birmingham': 130, 'Manchester-Leeds': 63, 'Manchester-Sheffield': 59,
  'Manchester-Liverpool': 56, 'Manchester-Edinburgh': 338, 'Manchester-Glasgow': 337,
  'Birmingham-Leeds': 160, 'Birmingham-Sheffield': 113, 'Birmingham-Liverpool': 158,
  'Birmingham-Bristol': 145, 'Edinburgh-Glasgow': 74,
};

// Transport mode configurations
const TRANSPORT_MODES = {
  bus: {
    speedKmh: 40,
    baseFare: 2.5,
    farePerKm: 0.05,
    providers: ['National Express', 'Megabus', 'FlixBus', 'FirstBus'],
    co2PerKm: 68, // gCO2/km (vs car: 171gCO2/km)
    icon: '🚌',
  },
  metro: {
    speedKmh: 80,
    baseFare: 3.5,
    farePerKm: 0.08,
    providers: ['TfL Underground', 'Metrolink', 'Metro', 'Overground'],
    co2PerKm: 35,
    icon: '🚇',
  },
  bike: {
    speedKmh: 15,
    baseFare: 1.0,
    farePerKm: 0.02,
    providers: ['Santander Cycles', 'NextBike', 'Beryl Bikes'],
    co2PerKm: 0, // Zero emissions!
    icon: '🚲',
  },
  scooter: {
    speedKmh: 20,
    baseFare: 1.5,
    farePerKm: 0.18,
    providers: ['Voi', 'Lime', 'Tier', 'Bird'],
    co2PerKm: 25,
    icon: '🛴',
  },
  'ride-hail': {
    speedKmh: 50,
    baseFare: 4.0,
    farePerKm: 0.20,
    providers: ['Uber', 'Bolt', 'FREE NOW', 'Ola'],
    co2PerKm: 150,
    icon: '🚗',
  },
};

// Get distance between two cities
const getDistance = (origin, destination) => {
  const key1 = `${origin}-${destination}`;
  const key2 = `${destination}-${origin}`;
  return CITY_DISTANCES[key1] || CITY_DISTANCES[key2] || Math.floor(Math.random() * 200 + 50);
};

// Generate departure/arrival times
const generateTimes = (baseHour, durationMins) => {
  const h = baseHour % 24;
  const depH = String(h).padStart(2, '0');
  const depM = String(Math.floor(Math.random() * 4) * 15).padStart(2, '0');
  const dep = `${depH}:${depM}`;

  const totalMins = h * 60 + parseInt(depM) + durationMins;
  const arrH = String(Math.floor(totalMins / 60) % 24).padStart(2, '0');
  const arrM = String(totalMins % 60).padStart(2, '0');
  const arr = `${arrH}:${arrM}`;

  return { dep, arr };
};

// Build a single segment
const buildSegment = (mode, from, to, distance, baseHour) => {
  const cfg = TRANSPORT_MODES[mode];
  const duration = Math.round((distance / cfg.speedKmh) * 60);
  const fare = Math.round((cfg.baseFare + distance * cfg.farePerKm) * 100) / 100;
  const { dep, arr } = generateTimes(baseHour, duration);
  const co2Saved = Math.round(distance * (171 - cfg.co2PerKm)); // saved vs car

  return {
    mode,
    from,
    to,
    departureTime: dep,
    arrivalTime: arr,
    duration,
    distance: Math.round(distance * 10) / 10,
    fare,
    provider: cfg.providers[Math.floor(Math.random() * cfg.providers.length)],
    co2Saved: Math.max(0, co2Saved),
  };
};

// Generate multiple journey options for a route
const generateJourneyOptions = (origin, destination, date) => {
  const distance = getDistance(origin, destination);
  const baseHour = 7 + Math.floor(Math.random() * 4); // 7am–11am start

  const options = [];

  // Option 1: Direct fast transit (metro/bus)
  const fastMode = distance > 100 ? 'metro' : 'bus';
  const seg1 = buildSegment(fastMode, origin, destination, distance, baseHour);
  options.push({
    name: `Direct ${fastMode === 'metro' ? 'Express Train' : 'Coach'}`,
    segments: [seg1],
    totalFare: seg1.fare,
    totalDuration: seg1.duration,
    totalDistance: seg1.distance,
    totalCo2Saved: seg1.co2Saved,
    ecoPoints: Math.round(seg1.co2Saved / 100),
    transportModes: [fastMode],
  });

  // Option 2: Multi-modal (bus + scooter or metro + bike)
  const legDist1 = Math.round(distance * 0.8 * 10) / 10;
  const legDist2 = Math.round(distance * 0.2 * 10) / 10;
  const midCity = 'City Centre';
  const seg2a = buildSegment('bus', origin, midCity, legDist1, baseHour);
  const seg2b = buildSegment('scooter', midCity, destination, legDist2, baseHour + 2);
  const totalFare2 = Math.round((seg2a.fare + seg2b.fare) * 100) / 100;
  options.push({
    name: 'Bus + E-Scooter',
    segments: [seg2a, seg2b],
    totalFare: totalFare2,
    totalDuration: seg2a.duration + seg2b.duration + 10,
    totalDistance: legDist1 + legDist2,
    totalCo2Saved: seg2a.co2Saved + seg2b.co2Saved,
    ecoPoints: Math.round((seg2a.co2Saved + seg2b.co2Saved) / 100),
    transportModes: ['bus', 'scooter'],
  });

  // Option 3: Eco-friendly bike (short distances only)
  if (distance <= 20) {
    const seg3 = buildSegment('bike', origin, destination, distance, baseHour + 1);
    options.push({
      name: 'Eco Bike Ride 🌱',
      segments: [seg3],
      totalFare: seg3.fare,
      totalDuration: seg3.duration,
      totalDistance: seg3.distance,
      totalCo2Saved: seg3.co2Saved,
      ecoPoints: Math.round(seg3.co2Saved / 50) + 10, // Bonus eco points for cycling
      transportModes: ['bike'],
    });
  }

  // Option 4: Ride-hail (premium)
  const seg4 = buildSegment('ride-hail', origin, destination, distance, baseHour);
  options.push({
    name: 'Ride-Hail (Premium)',
    segments: [seg4],
    totalFare: seg4.fare,
    totalDuration: seg4.duration,
    totalDistance: seg4.distance,
    totalCo2Saved: seg4.co2Saved,
    ecoPoints: Math.round(seg4.co2Saved / 150), // Fewer eco points - less green
    transportModes: ['ride-hail'],
  });

  return options;
};

module.exports = { generateJourneyOptions, UK_CITIES };
