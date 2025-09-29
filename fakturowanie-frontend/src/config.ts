export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) || '/api';

export const ENDPOINTS = {
  register: `${API_URL}/auth/register`,
  login: `${API_URL}/auth/login`,
  me: `${API_URL}/me`,
  clients: `${API_URL}/clients`,
  invoices: `${API_URL}/invoices`,
  health: `${API_URL}/health`,
} as const;