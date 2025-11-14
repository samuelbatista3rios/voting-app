// src/services/api.js
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' }
});

export const setToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('voting_token', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('voting_token');
  }
};

export const loadTokenFromStorage = () => {
  const t = localStorage.getItem('voting_token');
  if (t) setToken(t);
};

export default api;