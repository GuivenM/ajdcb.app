// Client HTTP léger pour l'API AJDCB (Laravel + Sanctum, auth par token Bearer).
// L'URL de base vient de VITE_API_URL (voir .env.example). En dev, elle pointe
// généralement vers http://localhost:8000/api.

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000/api';
const TOKEN_KEY = 'ajdcb_admin_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // 401 = token expiré/invalide : on nettoie la session locale.
  if (res.status === 401) {
    setToken(null);
  }

  let body: ApiResponse<T> | null = null;
  try {
    body = await res.json();
  } catch {
    // réponse non-JSON (ex: CSV export) — laissé à l'appelant
  }

  if (!res.ok) {
    throw new ApiError(
      body?.message || `Erreur ${res.status}`,
      res.status,
      body?.errors
    );
  }

  return (body?.data ?? (body as unknown)) as T;
}

export const api = {
  get: <T,>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T,>(path: string, data?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),
  put: <T,>(path: string, data?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),
  delete: <T,>(path: string) => request<T>(path, { method: 'DELETE' }),
};
