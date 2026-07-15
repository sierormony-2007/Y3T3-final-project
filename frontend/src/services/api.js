// src/services/api.js
const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
import.meta.env.VITE_API_URL

function getToken() {
  return localStorage.getItem('token');
}


async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${BASE}${path}`;
  console.log(`[api] ${method} ${url}`, body || '');

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    console.error('[api] network error:', networkErr);
    throw new Error('Cannot connect to server. The backend at https://ewaste-db.onrender.com may be sleeping (Render free tier spins down after inactivity). Please wait a moment and try again.');
  }

  console.log(`[api] ${method} ${url} -> ${res.status}`);

  // Safely parse — response may have no body (204, network cut, etc.)
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Invalid response from server: ${text.slice(0, 100)}`);
  }

  if (!res.ok) throw new Error(data.message || `Server error (${res.status})`);
  return data;
}

// Auth
export const api = {
  auth: {
    register: (body)  => request('POST', '/auth/register', body),
    login:    (body)  => request('POST', '/auth/login', body),
    me:       ()      => request('GET',  '/auth/me'),
    updateMe: (body)  => request('PATCH','/auth/me', body),
    users:    ()      => request('GET',  '/auth/users'),
  },
  categories: {
  list: () => request('GET', '/categories')
},
  pickups: {
    create:       (body)         => request('POST',   '/pickups', body),
    list:         ()             => request('GET',    '/pickups'),
    get:          (id)           => request('GET',    `/pickups/${id}`),
    updateStatus: (id, status)   => request('PATCH',  `/pickups/${id}/status`, { status }),
    cancel:       (id)           => request('DELETE', `/pickups/${id}`),
    history:      ()             => request('GET',    '/pickups/history'),
  },
  rewards: {
    list:    ()               => request('GET',    '/rewards'),
    redeem:  (rewardId)       => request('POST',   '/rewards/redeem', { rewardId }),
    history: ()               => request('GET',    '/rewards/history'),
    // Staff only — manage the Rewards Store
    add:     (body)           => request('POST',   '/rewards', body),
    update:  (id, body)       => request('PATCH',  `/rewards/${id}`, body),
    remove:  (id)             => request('DELETE', `/rewards/${id}`),
  },
  impact: {
    mine: () => request('GET', '/impact'),
    all:  () => request('GET', '/impact/all'),
  },
  articles: {
    list: ()    => request('GET', '/articles'),
    get:  (id)  => request('GET', `/articles/${id}`),
  },
  notifications: {
    list:        ()     => request('GET',   '/notifications'),
    unreadCount: ()     => request('GET',   '/notifications/unread-count'),
    markRead:    (id)   => request('PATCH', `/notifications/${id}/read`),
    markAllRead: ()     => request('PATCH', '/notifications/read-all'),
  },
};
