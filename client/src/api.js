import axios from 'axios';

// In dev, Vite proxies /api → localhost:5000.
// In production (Render), VITE_API_URL points to the deployed backend.
const BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${BASE}/api` });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('imovies_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    err.friendly = err.response?.data?.message || 'Cannot reach the server. Check that the API is running.';
    return Promise.reject(err);
  }
);

export const errMsg = (e) => e.friendly || e.message || 'Something went wrong.';
export default api;
