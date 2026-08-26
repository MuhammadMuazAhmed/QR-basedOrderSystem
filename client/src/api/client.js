import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('staffToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Public (customer) ----
export const resolveTable = (token) => api.get(`/tables/resolve/${token}`).then((r) => r.data.data);
export const getMenu = () => api.get('/menu').then((r) => r.data.data);
export const getMenuItem = (id) => api.get(`/menu/items/${id}`).then((r) => r.data.data);
export const placeOrder = (payload) => api.post('/orders', payload).then((r) => r.data.data);
export const getOrder = (id) => api.get(`/orders/${id}`).then((r) => r.data.data);
export const callWaiter = (tableToken) =>
  api.post('/orders/waiter-call', { tableToken }).then((r) => r.data.data);

// ---- Staff ----
export const staffLogin = (username, password) =>
  api.post('/auth/login', { username, password }).then((r) => r.data.data);
export const listOrders = (all = false) =>
  api.get(`/orders${all ? '?all=true' : ''}`).then((r) => r.data.data);
export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/status`, { status }).then((r) => r.data.data);
export const listWaiterCalls = () => api.get('/orders/waiter-calls/all').then((r) => r.data.data);
export const resolveWaiterCall = (id) =>
  api.patch(`/orders/waiter-call/${id}/resolve`).then((r) => r.data.data);

export default api;
