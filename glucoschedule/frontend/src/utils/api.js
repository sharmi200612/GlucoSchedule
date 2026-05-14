// ============================================
// Utility: API (Axios instance)
// ============================================
// Automatically attaches JWT token to requests

import axios from 'axios';

const API = axios.create({
  baseURL: '/api', // proxied to http://localhost:5000/api
});

// Before every request, attach the auth token from localStorage
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('glucoUser'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;
