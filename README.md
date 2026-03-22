# 🚇 UMMS — Smart Urban Mobility Management System

A full-stack MERN application for planning, booking, and managing urban transportation across UK cities.

---

## 📁 Project Structure

```
umms/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── journeyController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   ├── rewardController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Journey.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   └── Reward.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── journeyRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── rewardRoutes.js
│   │   └── adminRoutes.js
│   ├── services/
│   │   ├── journeyService.js   ← Simulated UK journey planning
│   │   └── paymentService.js   ← Dummy payment processor
│   ├── seed.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── JourneyPage.js
    │   │   ├── BookingPage.js
    │   │   ├── PaymentPage.js
    │   │   ├── RewardsPage.js
    │   │   ├── AccountPage.js
    │   │   ├── MyBookingsPage.js
    │   │   ├── AdminPage.js
    │   │   └── MapPage.js
    │   ├── components/
    │   │   └── common/
    │   │       └── Navbar.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ — https://nodejs.org
- **MongoDB** — local installation OR MongoDB Atlas (cloud)
- **npm** v9+

---

## 🚀 Setup Instructions

### Step 1 — Clone / Extract the Project

Place the `umms/` folder wherever you like. Open two terminal windows.

---

### Step 2 — Backend Setup

```bash
# Terminal 1 — Navigate to backend
cd umms/backend

# Install dependencies
npm install

# Configure environment
# Edit .env with your MongoDB URI if needed:
# MONGO_URI=mongodb://localhost:27017/umms
# JWT_SECRET=umms_super_secret_jwt_key_2024
# PORT=5000

# Seed the database with demo accounts
node seed.js

# Start the backend server (development)
npm run dev

# OR production:
# npm start
```

✅ Backend runs at: **http://localhost:5000**
✅ Health check: **http://localhost:5000/api/health**

---

### Step 3 — Frontend Setup

```bash
# Terminal 2 — Navigate to frontend
cd umms/frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

✅ Frontend runs at: **http://localhost:3000**

> The frontend proxies `/api/*` calls to `http://localhost:5000` automatically (set in package.json).

---

### Step 4 — Open the App

Navigate to **http://localhost:3000** in your browser.

---

## 🔑 Login Credentials

| Role      | Email             | Password  |
|-----------|-------------------|-----------|
| Passenger | demo@umms.com     | demo123   |
| Admin     | admin@umms.com    | admin123  |

> You can also register a new account from the Register page.

---

## 🧪 Testing the Payment System

The payment system is **fully simulated** — no real charges occur.

| Card Number Ending | Result              |
|--------------------|---------------------|
| Any other number   | ✅ Payment succeeds  |
| `0000`             | ❌ Card declined     |
| `1111`             | ❌ Insufficient funds|

Use any future expiry date (e.g. `12/28`) and any 3-digit CVV (e.g. `123`).

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint             | Description        |
|--------|----------------------|--------------------|
| POST   | /api/auth/register   | Register user      |
| POST   | /api/auth/login      | Login              |
| GET    | /api/auth/me         | Get current user   |

### Users
| Method | Endpoint             | Description        |
|--------|----------------------|--------------------|
| GET    | /api/users/profile   | Get profile        |
| PUT    | /api/users/profile   | Update profile     |

### Journeys
| Method | Endpoint             | Description                   |
|--------|----------------------|-------------------------------|
| GET    | /api/journeys/cities | List UK cities                |
| POST   | /api/journeys/plan   | Get journey options (simulated)|
| POST   | /api/journeys        | Save selected journey          |
| GET    | /api/journeys        | Get user's journeys            |
| GET    | /api/journeys/:id    | Get single journey             |

### Bookings
| Method | Endpoint                   | Description        |
|--------|----------------------------|--------------------|
| POST   | /api/bookings              | Create booking     |
| GET    | /api/bookings              | Get user bookings  |
| GET    | /api/bookings/:id          | Get single booking |
| PATCH  | /api/bookings/:id/confirm  | Confirm booking    |
| PATCH  | /api/bookings/:id/cancel   | Cancel booking     |

### Payments
| Method | Endpoint        | Description           |
|--------|-----------------|-----------------------|
| POST   | /api/payments   | Process payment       |
| GET    | /api/payments   | Payment history       |

### Rewards
| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| GET    | /api/rewards       | Get reward account   |
| POST   | /api/rewards/check | Check points balance |

### Admin (Admin role required)
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| GET    | /api/admin/analytics  | Dashboard data    |
| GET    | /api/admin/users      | All users         |

---

## 🎯 Feature Walkthrough

### Full User Journey Flow:
1. **Register** → Get 50 welcome eco-points automatically
2. **Dashboard** → View transport modes, UK cities, recent bookings
3. **Journey Planner** → Select origin/destination, choose date → Get 4 route options
4. **Booking Page** → Review route, optionally apply reward points for discount
5. **Payment Page** → Enter dummy card details → Payment simulated
6. **Success** → Eco-points awarded, booking confirmed
7. **Rewards Page** → View balance, tier status, transaction history
8. **Map View** → See UK cities and your journey routes on Leaflet map
9. **Admin Dashboard** → Charts for bookings, revenue, transport modes, users

---

## 🎨 Design System

- **Fonts**: Syne (headings) + DM Sans (body) via Google Fonts
- **Colours**: Navy `#0a1628`, Teal `#00c2a8`, Emerald `#00d68f`
- **Theme**: Dark glassmorphism with gradient mesh backgrounds
- **Maps**: CartoDb dark tiles via React-Leaflet
- **Charts**: Recharts (BarChart, LineChart, PieChart)
- **Animations**: CSS keyframes (fadeUp, fadeIn, spin)

---

## 📦 Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 18, React Router 6|
| Charts   | Recharts                |
| Maps     | Leaflet + React-Leaflet |
| HTTP     | Axios                   |
| Backend  | Node.js + Express       |
| Database | MongoDB + Mongoose      |
| Auth     | JWT + bcryptjs          |
| Styling  | Pure CSS (custom design system) |

---

## 🔒 Security Notes

- Passwords are hashed with bcryptjs (salt rounds: 10)
- JWT tokens expire after 30 days
- Admin routes protected with role-based middleware
- Payment data: only last 4 digits stored (simulated — no real card processing)
- All API routes behind JWT authentication

---

## 🛠️ Troubleshooting

**MongoDB connection error:**
- Ensure MongoDB is running: `mongod` or use MongoDB Atlas URI in `.env`

**Port already in use:**
- Change `PORT=5000` in `.env` and update `"proxy"` in `frontend/package.json`

**Leaflet map not loading:**
- Ensure you have internet access for tile server and CDN fonts

**npm install fails:**
- Try `npm install --legacy-peer-deps`

---

## 📝 Component Architecture

```
AuthContext (global state)
    ├── PrivateRoute (auth guard)
    ├── AdminRoute (admin guard)
    └── Pages
        ├── LoginPage / RegisterPage
        ├── DashboardPage (stats, cities, transport modes)
        ├── JourneyPage (plan + select route)
        ├── BookingPage (confirm + apply rewards)
        ├── PaymentPage (dummy card form + result)
        ├── RewardsPage (eco-points dashboard)
        ├── MyBookingsPage (booking history)
        ├── AccountPage (profile management)
        ├── AdminPage (analytics charts)
        └── MapPage (Leaflet UK map)
```

---

Built for the Smart Urban Mobility Management System academic project.
