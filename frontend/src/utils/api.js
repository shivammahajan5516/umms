import axios from 'axios';

const api = axios.create({
  baseURL: 'https://umms-backend.onrender.com/api' || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('umms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;