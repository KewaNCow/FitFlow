import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login/signup pages
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updatePassword: (data) => api.put('/users/password', data),
  changePassword: (data) => api.put('/users/password', data),
  deleteAccount: () => api.delete('/users/account'),
};

// Exercise API
export const exerciseAPI = {
  getAll: (params) => api.get('/exercises', { params }),
  getById: (id) => api.get(`/exercises/${id}`),
  getCategories: () => api.get('/exercises/categories'),
  create: (data) => api.post('/exercises', data),
  update: (id, data) => api.put(`/exercises/${id}`, data),
  delete: (id) => api.delete(`/exercises/${id}`),
};

// Workout API
export const workoutAPI = {
  getAll: (params) => api.get('/workouts', { params }),
  getById: (id) => api.get(`/workouts/${id}`),
  create: (data) => api.post('/workouts', data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
  duplicate: (id) => api.post(`/workouts/${id}/duplicate`),
  copy: (id) => api.post(`/workouts/${id}/copy`),
};

// Program API
export const programAPI = {
  getAll: (params) => api.get('/programs', { params }),
  getById: (id) => api.get(`/programs/${id}`),
  create: (data) => api.post('/programs', data),
  update: (id, data) => api.put(`/programs/${id}`, data),
  delete: (id) => api.delete(`/programs/${id}`),
  copy: (id) => api.post(`/programs/${id}/copy`),
};

// Workout Log API
export const workoutLogAPI = {
  getAll: (params) => api.get('/workout-logs', { params }),
  getStats: (params) => api.get('/workout-logs/stats', { params }),
  create: (data) => api.post('/workout-logs', data),
  update: (id, data) => api.put(`/workout-logs/${id}`, data),
  delete: (id) => api.delete(`/workout-logs/${id}`),
};

// Route Planner API
export const routeAPI = {
  getAll: () => api.get('/routes'),
  getById: (id) => api.get(`/routes/${id}`),
  create: (data) => api.post('/routes', data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`),
  toggleFavorite: (id) => api.post(`/routes/${id}/favorite`),
  log: (id, data) => api.post(`/routes/${id}/log`, data),
  getHistory: () => api.get('/routes/logs/history'),
  getStats: () => api.get('/routes/stats/summary'),
};

// Statistics API
export const statisticsAPI = {
  getOverview: (params) => api.get('/statistics/overview', { params }),
  getExerciseProgress: (exerciseId, params) => api.get(`/statistics/exercise/${exerciseId}`, { params }),
  getExercisesProgress: (params) => api.get('/statistics/exercises/progress', { params }),
  getVolume: (params) => api.get('/statistics/volume', { params }),
  getMuscleGroups: (params) => api.get('/statistics/muscle-groups', { params }),
  getWorkoutTypes: (params) => api.get('/statistics/workout-types', { params }),
  getRecords: () => api.get('/statistics/records'),
  getTimeDistribution: (params) => api.get('/statistics/time-distribution', { params }),
};

// Equipment API
export const equipmentAPI = {
  getAll: (params) => api.get('/equipment', { params }),
  getById: (id) => api.get(`/equipment/${id}`),
  getCategories: () => api.get('/equipment/categories'),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
};

// Exercise Images API
export const exerciseImageAPI = {
  getAll: (exerciseId) => api.get(`/exercises/${exerciseId}/images`),
  add: (exerciseId, data) => api.post(`/exercises/${exerciseId}/images`, data),
  update: (exerciseId, imageId, data) => api.put(`/exercises/${exerciseId}/images/${imageId}`, data),
  delete: (exerciseId, imageId) => api.delete(`/exercises/${exerciseId}/images/${imageId}`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  
  // Workouts
  getWorkouts: () => api.get('/admin/workouts'),
  createWorkout: (data) => api.post('/admin/workouts', data),
  updateWorkout: (id, data) => api.put(`/admin/workouts/${id}`, data),
  deleteWorkout: (id) => api.delete(`/admin/workouts/${id}`),
  
  // Programs
  getPrograms: () => api.get('/admin/programs'),
  createProgram: (data) => api.post('/admin/programs', data),
  updateProgram: (id, data) => api.put(`/admin/programs/${id}`, data),
  deleteProgram: (id) => api.delete(`/admin/programs/${id}`),
  
  // Exercises
  getExercises: () => api.get('/admin/exercises'),
  createExercise: (data) => api.post('/admin/exercises', data),
  updateExercise: (id, data) => api.put(`/admin/exercises/${id}`, data),
  deleteExercise: (id) => api.delete(`/admin/exercises/${id}`),
  
  // Equipment
  getEquipment: () => api.get('/admin/equipment'),
  createEquipment: (data) => api.post('/admin/equipment', data),
  updateEquipment: (id, data) => api.put(`/admin/equipment/${id}`, data),
  deleteEquipment: (id) => api.delete(`/admin/equipment/${id}`),
};

// Rating API
export const ratingAPI = {
  // Workout ratings
  getWorkoutRating: (id) => api.get(`/ratings/workout/${id}`),
  rateWorkout: (id, data) => api.post(`/ratings/workout/${id}`, data),
  deleteWorkoutRating: (id) => api.delete(`/ratings/workout/${id}`),
  
  // Program ratings
  getProgramRating: (id) => api.get(`/ratings/program/${id}`),
  rateProgram: (id, data) => api.post(`/ratings/program/${id}`, data),
  deleteProgramRating: (id) => api.delete(`/ratings/program/${id}`),
};

export default api;
