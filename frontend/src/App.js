// ── App.js ────────────────────────────────────────────────────
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import DashboardPage  from './pages/DashboardPage';
import JourneyPage    from './pages/JourneyPage';
import BookingPage    from './pages/BookingPage';
import PaymentPage    from './pages/PaymentPage';
import RewardsPage    from './pages/RewardsPage';
import AccountPage    from './pages/AccountPage';
import AdminPage      from './pages/AdminPage';
import MapPage        from './pages/MapPage';
import MyBookingsPage from './pages/MyBookingsPage';

// Layout
import Navbar from './components/common/Navbar';

// ── Protected Route wrapper ───────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loader-wrap mesh-bg" style={{minHeight:'100vh'}}>
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

// ── Admin Route wrapper ───────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader-wrap"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

// ── App with Layout ───────────────────────────────────────────
const AppContent = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/"         element={<Navigate to="/dashboard" />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard"   element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/journey"     element={<PrivateRoute><JourneyPage /></PrivateRoute>} />
        <Route path="/booking/:id" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
        <Route path="/payment/:id" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
        <Route path="/rewards"     element={<PrivateRoute><RewardsPage /></PrivateRoute>} />
        <Route path="/account"     element={<PrivateRoute><AccountPage /></PrivateRoute>} />
        <Route path="/my-bookings" element={<PrivateRoute><MyBookingsPage /></PrivateRoute>} />
        <Route path="/map"         element={<PrivateRoute><MapPage /></PrivateRoute>} />

        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
