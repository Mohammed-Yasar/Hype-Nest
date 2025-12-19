import axios from 'axios';

const RAW_API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = (RAW_API.endsWith('/api') ? RAW_API : RAW_API.replace(/\/$/, '') + '/api');

const client = axios.create({
  baseURL: API_URL,
});

// Add token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;

