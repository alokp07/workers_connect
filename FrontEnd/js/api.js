const api = {
  async request(method, endpoint, data = null) {
    const token = localStorage.getItem(LS_KEYS.TOKEN);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const json = await res.json();

    if (res.status === 401) {
      // Only redirect if user had a token (expired session), not on login attempts
      if (token) {
        localStorage.removeItem(LS_KEYS.TOKEN);
        localStorage.removeItem(LS_KEYS.USER);
        window.location.href = '/';
        return;
      }
    }

    if (!res.ok) {
      throw new Error(json.message || 'Request failed');
    }

    return json;
  },

  get(endpoint) { return this.request('GET', endpoint); },
  post(endpoint, data) { return this.request('POST', endpoint, data); },
  put(endpoint, data) { return this.request('PUT', endpoint, data); },
  delete(endpoint) { return this.request('DELETE', endpoint); },

  async upload(endpoint, formData) {
    const token = localStorage.getItem(LS_KEYS.TOKEN);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Upload failed');
    return json;
  },
};
