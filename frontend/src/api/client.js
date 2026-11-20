const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let body = null;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { message: text || res.statusText };
  }

  if (!res.ok) {
    const err = new Error(body?.message || body?.detail || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export const api = {
  getCollege: () => request('/college'),
  getModules: () => request('/modules'),
  getFeatured: () => request('/featured'),
  getAnnouncements: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/announcements${q ? `?${q}` : ''}`);
  },
  getAnnouncement: (id) => request(`/announcements/${id}`),
  createAnnouncement: (body) =>
    request('/announcements', { method: 'POST', body: JSON.stringify(body) }),
  health: () => request('/health'),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  getProfile: () => request('/users/profile'),
  updateProfile: (body) =>
    request('/users/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (body) =>
    request('/users/password', { method: 'PATCH', body: JSON.stringify(body) }),
  getSettings: () => request('/users/settings'),
  saveSettings: (body) =>
    request('/users/settings', { method: 'PUT', body: JSON.stringify(body) }),
  getLibraryIntegration: () => request('/integrations/library'),
  getModuleLive: (moduleId) => request(`/integrations/modules/${moduleId}`),
  getModulesLive: (ids) => {
    const q = ids && ids.length ? `?ids=${ids.join(',')}` : '';
    return request(`/integrations/modules${q}`);
  },
};
