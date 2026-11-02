import { apiClient } from './client';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  MeResponse,
} from '../types/api';

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
}

export async function me(isInitialCheck = false): Promise<MeResponse> {
  const response = await apiClient.get<MeResponse>('/auth/me', {
    headers: isInitialCheck ? { 'X-Initial-Check': 'true' } : undefined,
  });
  return response.data;
}
