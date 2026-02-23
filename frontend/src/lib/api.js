const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4001').replace(/\/$/, '');

async function postJson(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }

  return response.json();
}

async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }

  return response.json();
}

async function deleteJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }

  return response.json();
}

function slugifyCity(city) {
  if (!city) return null;
  const overrides = { bengaluru: 'bangalore', bangalore: 'bangalore' };
  const normalized = city.trim().toLowerCase();
  return overrides[normalized] || normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export const authApi = {
  signup: (email, password) => postJson('/api/users/signup', { email, password }),
  login: (email, password) => postJson('/api/users/login', { email, password }),
  logout: () => postJson('/api/users/logout', {}),
  me: () => getJson('/api/users/me'),
};

export const historyApi = {
  save: (data) => postJson('/api/history', data),
  list: (limit = 20) => getJson(`/api/history?limit=${limit}`),
  getById: (id) => getJson(`/api/history/${id}`),
  remove: (id) => deleteJson(`/api/history/${id}`),
};

export const planItApi = {
  getWeather: (city, date) => {
    const slug = slugifyCity(city);
    if (!slug) return Promise.resolve(null);
    const d = date || new Date().toISOString().slice(0, 10);
    return getJson(`/api/weather?city=${encodeURIComponent(slug)}&date=${encodeURIComponent(d)}`);
  },
  getMoviePlan: (payload) => postJson('/api/movies', payload),
  getRestaurants: (payload) => postJson('/api/restaurants', payload),
  getScrapedRestaurants: (city) => {
    const slug = slugifyCity(city);
    if (!slug) return Promise.resolve([]);
    return getJson(`/api/restaurants?url=https://www.zomato.com/${encodeURIComponent(slug)}`);
  },
  getScrapedMovies: (city) => {
    const slug = slugifyCity(city);
    if (!slug) return Promise.resolve([]);
    return getJson(`/api/movies?url=https://in.bookmyshow.com/explore/movies-${encodeURIComponent(slug)}?cat=MT`);
  },
};
