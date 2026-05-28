import axios, { AxiosInstance } from 'axios';
import { Assignment } from '@/types';
import { User } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'veda_token';

export const getStoredToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

export const getMediaUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  return `${API_URL}${path}`;
};

const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      const publicAuth =
        path.startsWith('/login') ||
        path.startsWith('/signup') ||
        path.startsWith('/forgot-password');
      if (!publicAuth) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  signupSendOtp: (data: {
    name: string;
    email: string;
    password: string;
    schoolName?: string;
  }) => apiClient.post('/auth/signup/send-otp', data),

  signupResendOtp: (email: string) =>
    apiClient.post('/auth/signup/resend-otp', { email }),

  signupVerify: (data: { email: string; otp: string }) =>
    apiClient.post('/auth/signup/verify', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    apiClient.post('/auth/reset-password', data),

  logout: () => apiClient.post('/auth/logout'),

  me: () => apiClient.get<{ user: User }>('/auth/me'),

  updateProfile: (data: { name?: string; schoolName?: string }) =>
    apiClient.patch('/auth/profile', data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post('/auth/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteAccount: (password: string) =>
    apiClient.delete('/auth/account', { data: { password } }),
};

export const assignmentService = {
  list: () => apiClient.get('/assignments'),
  delete: (id: string) => apiClient.delete(`/assignments/${id}`),
  create: (data: Assignment, file?: File | null) => {
    if (file) {
      const formData = new FormData();
      formData.append('referenceFile', file);
      formData.append('title', data.title);
      formData.append('subject', data.subject);
      formData.append('totalMarks', String(data.totalMarks));
      formData.append('numberOfQuestions', String(data.numberOfQuestions));
      formData.append('questionTypes', JSON.stringify(data.questionTypes));
      formData.append('difficulty', data.difficulty);
      formData.append('dueDate', new Date(data.dueDate).toISOString());
      if (data.description) formData.append('description', data.description);
      if (data.additionalInstructions) {
        formData.append('additionalInstructions', data.additionalInstructions);
      }
      return apiClient.post('/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.post('/assignments', {
      ...data,
      dueDate: new Date(data.dueDate),
    });
  },
  get: (id: string) => apiClient.get(`/assignments/${id}`),
  generate: (id: string, options?: { force?: boolean }) =>
    apiClient.post(`/assignments/${id}/generate`, {
      force: options?.force ?? false,
    }),
};

export const generationService = {
  getJobStatus: (jobId: string) => apiClient.get(`/jobs/${jobId}`),
  getPaper: (assignmentId: string) =>
    apiClient.get(`/papers/${assignmentId}`),
  getPaperPdfUrl: (assignmentId: string) =>
    `${API_URL}/api/papers/${assignmentId}/pdf`,
  downloadPaperPdf: async (assignmentId: string) => {
    const token = getStoredToken();
    const res = await fetch(
      `${API_URL}/api/papers/${assignmentId}/pdf`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    if (!res.ok) throw new Error('PDF download failed');
    return res.blob();
  },
};

export default apiClient;
