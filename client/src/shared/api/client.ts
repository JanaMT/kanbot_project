import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorBody } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Type for our custom error
export class ApiError extends Error {
  status: number;
  code: string;
  details?: { path: string; message: string }[];

  constructor(
    status: number,
    code: string,
    message: string,
    details?: { path: string; message: string }[]
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Store for auth token getter and session expired callback
let getAuthToken: (() => string | null) | null = null;
let onSessionExpired: (() => void) | null = null;

export function setAuthTokenGetter(getter: () => string | null) {
  getAuthToken = getter;
}

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (getAuthToken) {
      const token = getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    // Network error
    if (!error.response) {
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        'Cannot reach the server. Is it running?'
      );
    }

    const { status, data } = error.response;
    const errorBody = data?.error;

    if (errorBody) {
      const apiError = new ApiError(
        status,
        errorBody.code,
        errorBody.message,
        errorBody.details
      );

      // Handle session expiry (401 on authenticated endpoints)
      // Do NOT treat login 401 or initial /auth/me check as expired session
      const isLoginEndpoint = error.config?.url?.endsWith('/auth/login');
      const isInitialCheck = error.config?.headers?.['X-Initial-Check'] === 'true';
      
      if (status === 401 && !isLoginEndpoint && !isInitialCheck && onSessionExpired) {
        onSessionExpired();
      }

      throw apiError;
    }

    // Fallback error
    throw new ApiError(
      status,
      'UNKNOWN_ERROR',
      'An unexpected error occurred'
    );
  }
);

// Helper to extract field errors for forms
export function getFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ApiError && error.details) {
    return error.details.reduce((acc, detail) => {
      acc[detail.path] = detail.message;
      return acc;
    }, {} as Record<string, string>);
  }
  return {};
}
