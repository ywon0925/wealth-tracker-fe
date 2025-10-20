import { apiClient } from './apiClient';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    await apiClient.setAuthToken(response.token);
    return response;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    await apiClient.setAuthToken(response.token);
    return response;
  },

  async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>('/auth/me');
  },

  async logout(): Promise<void> {
    await apiClient.clearAuthToken();
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await apiClient.getAuthToken();
    return !!token;
  },
};
