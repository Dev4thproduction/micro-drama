import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global Errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired or invalid, clear storage and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Optional: Redirect logic can go here or be handled by AuthContext
      }
    }
    return Promise.reject(error);
  }
);

// ... existing imports

export const updateEpisode = async (id: string, data: any) => {
  const response = await api.put(`/content/episodes/${id}`, data);
  return response.data;
};

export const deleteEpisode = async (id: string) => {
  const response = await api.delete(`/content/episodes/${id}`);
  return response.data;
};

export const getMyList = async () => {
  const response = await api.get('/users/mylist');
  return response.data;
};

export const addToMyList = async (seriesId: string) => {
  const response = await api.post(`/users/mylist/${seriesId}`);
  return response.data;
};

export const removeFromMyList = async (seriesId: string) => {
  const response = await api.delete(`/users/mylist/${seriesId}`);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateProfile = async (data: { displayName?: string, currentPassword?: string, newPassword?: string }) => {
  const response = await api.patch('/auth/profile', data);
  return response.data;
};

export const getWatchHistory = async () => {
  const response = await api.get('/users/history');
  return response.data;
};

export const addToWatchHistory = async (data: { episodeId: string, progressSeconds: number, completed: boolean }) => {
  const response = await api.post('/users/history', data);
  return response.data;
};

export const checkMyListStatus = async (seriesId: string) => {
  const response = await api.get(`/users/mylist/check/${seriesId}`);
  return response.data;
};

export const incrementView = async (data: { seriesId?: string, episodeId?: string }) => {
  const response = await api.post('/analytics/view', data);
  return response.data;
};

// ... existing exports

export default api;