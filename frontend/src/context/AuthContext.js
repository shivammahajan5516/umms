import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('umms_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Get logged in user details from backend
  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login function — calls your backend
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('umms_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Register function — calls your backend
  const register = async (name, email, password, phone, city) => {
    const { data } = await api.post('/auth/register', {
      name, email, password, phone, city
    });
    localStorage.setItem('umms_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Logout — clears everything
  const logout = () => {
    localStorage.removeItem('umms_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);