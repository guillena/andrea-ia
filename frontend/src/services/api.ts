import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Inyectar JWT en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('andrea_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el token expiró, redirigir al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('andrea_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ── Auth ──────────────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('andrea_token', res.data.accessToken);
    localStorage.setItem('andrea_refresh', res.data.refreshToken);
    return res.data;
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('andrea_token');
    localStorage.removeItem('andrea_refresh');
  },
};

// ── Dashboard ─────────────────────────────────────────────

export const dashboardApi = {
  get: async () => (await api.get('/dashboard')).data,
};

// ── Job Positions ─────────────────────────────────────────

export const jobPositionsApi = {
  list: async () => (await api.get('/job-positions')).data,
  get: async (id: string) => (await api.get(`/job-positions/${id}`)).data,
  updateCompetencies: async (id: string, competencies: any[]) =>
    (await api.patch(`/job-positions/${id}/competencies`, { competencies })).data,
};

// ── Campaigns ─────────────────────────────────────────────

export const campaignsApi = {
  list: async (page = 1) => (await api.get(`/campaigns?page=${page}`)).data,
  get: async (id: string) => (await api.get(`/campaigns/${id}`)).data,
  create: async (data: any) => (await api.post('/campaigns', data)).data,
  update: async (id: string, data: any) => (await api.patch(`/campaigns/${id}`, data)).data,
  stats: async (id: string) => (await api.get(`/campaigns/${id}/stats`)).data,
};

// ── Candidates ────────────────────────────────────────────

export const candidatesApi = {
  list: async (params: { campaignId?: string; status?: string; page?: number }) => {
    const q = new URLSearchParams(params as any).toString();
    return (await api.get(`/candidates?${q}`)).data;
  },
  get: async (id: string) => (await api.get(`/candidates/${id}`)).data,
  create: async (data: any) => (await api.post('/candidates', data)).data,
  decision: async (id: string, decision: string, notes?: string) =>
    (await api.patch(`/candidates/${id}/decision`, { decision, notes })).data,
  report: async (id: string) => (await api.get(`/candidates/${id}/report`)).data,
  transcript: async (id: string) => (await api.get(`/candidates/${id}/transcript`)).data,
};
