// src/api/client.ts
import axios, { AxiosError } from 'axios';

/**
 * API base:
 * Centralized config — baseURL from env, timeout, default headers.
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
console.log('API baseURL =', API_URL);

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// --- Response interceptors (optional — currently just logs errors) ---
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<any>) => {
    // You can expand error handling here (monitoring, toast messages, etc.)
    return Promise.reject(err);
  }
);

// ------------------- AUTH -------------------
export const AuthAPI = {
  /**
   * POST /api/auth/check
   * Check if a user exists by phone number.
   */
  check: (phone: string) =>
    api.post('/api/auth/check', { phone }),

  /**
   * POST /api/auth/register
   * Register a new user (name + phone).
   */
  register: (name: string, phone: string) =>
    api.post('/api/auth/register', { name, phone }),
};

// ------------------- USERS (not required for the front-end, but handy for admin) -------------------
export const UsersAPI = {
  /** Create a user */
  create: (payload: { name: string; phone: string }) =>
    api.post('/api/users', payload),

  /** List users (supports paging params) */
  list: (params?: { page?: number; pageSize?: number }) =>
    api.get('/api/users', { params }),

  /** Fetch a single user by id */
  getOne: (id: number) =>
    api.get(`/api/users/${id}`),

  /** Partial update for a user */
  update: (id: number, payload: Partial<{ name: string; phone: string }>) =>
    api.patch(`/api/users/${id}`, payload),

  /** Delete a user */
  remove: (id: number) =>
    api.delete(`/api/users/${id}`),
};

// ------------------- CATALOG -------------------
export const CatalogAPI = {
  /**
   * GET /api/categories
   * Returns categories including sub-categories.
   */
  getCategories: () =>
    api.get('/api/categories'),
};

// ------------------- LESSONS -------------------
export const LessonsAPI = {
  /**
   * POST /api/lessons
   * Create a new lesson via the AI.
   */
  create: (payload: {
    userId: number;
    categoryId: number;
    subCategoryId: number;
    prompt: string;
  }) => api.post('/api/lessons', payload),

  /**
   * GET /api/users/:id/lessons  ← primary route
   * If it doesn't exist in your project — falls back to /api/lessons?userId=...
   */
  listByUser: async (userId: number) => {
    try {
      return await api.get(`/api/users/${userId}/lessons`);
    } catch (err) {
      // Fallback: support an alternative route if your project is set up that way
      return await api.get('/api/lessons', { params: { userId } });
    }
  },

  /**
   * GET /api/lessons/:id
   * Fetch a single lesson for display.
   */
  getOne: (id: number) =>
    api.get(`/api/lessons/${id}`),
};

// ------------------- Helper (optional) -------------------
/**
 * If you later add token-based auth,
 * call this function after login:
 *
 *   setAuthToken(token)
 */
export function setAuthToken(token?: string) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}
