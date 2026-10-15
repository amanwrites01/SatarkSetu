async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Something went wrong. Please try again.');
    error.details = data.details;
    error.status = res.status;
    throw error;
  }
  return data;
}

const adminRequest = (token, path, options = {}) =>
  request(`/admin${path}`, { ...options, headers: { Authorization: `Bearer ${token}` } });

export const api = {
  list: (params = {}) => request(`/reports?${new URLSearchParams(params)}`),
  get: (id) => request(`/reports/${encodeURIComponent(id)}`),
  create: (body) => request('/reports', { method: 'POST', body: JSON.stringify(body) }),
  confirm: (id) => request(`/reports/${encodeURIComponent(id)}/confirm`, { method: 'POST' }),
  flag: (id) => request(`/reports/${encodeURIComponent(id)}/flag`, { method: 'POST' }),
  lookup: (value) => request(`/lookup?value=${encodeURIComponent(value)}`),
  stats: () => request('/stats'),
  advisories: (type) => request(`/advisories${type ? `?type=${type}` : ''}`),
  admin: {
    list: (token, params = {}) => adminRequest(token, `/reports?${new URLSearchParams(params)}`),
    setStatus: (token, id, status) =>
      adminRequest(token, `/reports/${encodeURIComponent(id)}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
    remove: (token, id) => adminRequest(token, `/reports/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  },
  auth: {
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    me: (token) => request('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
    logout: (token) => request('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  },
};
