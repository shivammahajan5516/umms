import axios from 'axios';

// Automatically uses localhost in development, Render URL in production
const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://umms-backend.onrender.com/api'
  : 'http://localhost:5000/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('umms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;