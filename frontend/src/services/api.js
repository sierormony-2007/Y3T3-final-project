// src/services/api.js
const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';


function getToken() {
  return localStorage.getItem('token');
}


const cache = new Map();

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${BASE}${path}`;
  const cacheKey = `${method}:${url}`;

  if (method === 'GET' && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    // Cache for 60 seconds
    if (Date.now() - cached.timestamp < 60000) {
      console.log(`[api] CACHE HIT ${method} ${url}`);
      return cached.data;
    }
  }

  if (method !== 'GET') {
    // Simple cache invalidation: clear cache on any mutation
    cache.clear();
  }

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
    throw new Error('Cannot connect to server. Please ensure the backend is running and try again.');
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
  
  if (method === 'GET') {
    cache.set(cacheKey, { timestamp: Date.now(), data });
  }
  
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
    updateStatus: (id, status, reason)   => request('PATCH',  `/pickups/${id}/status`, { status, reason }),
    cancel:       (id)           => request('DELETE', `/pickups/${id}`),
    history:      ()             => request('GET',    '/pickups/history'),
  },
  rewards: {
    list:    ()               => request('GET',    '/rewards'),
    redeem:  (rewardId, quantity = 1) => request('POST',   '/rewards/redeem', { rewardId, quantity }),
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
  upload: {
    image: async (file) => {
      const token = getToken();
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${BASE}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      return data; // { url: '/uploads/...' }
    },
  },
};
