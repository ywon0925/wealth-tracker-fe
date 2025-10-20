import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const AUTH_TOKEN_KEY = '@wealth_tracker_auth_token';

// Callback to handle 401 errors (logout)
let onUnauthorized: (() => void) | null = null;
let isLoggingOut = false; // Prevent multiple logout triggers

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && !isLoggingOut) {
          console.log('401 Unauthorized - clearing auth and triggering logout');
          isLoggingOut = true;

          // Clear token
          await AsyncStorage.removeItem(AUTH_TOKEN_KEY);

          // Trigger logout callback if set (only once)
          if (onUnauthorized) {
            setTimeout(() => {
              onUnauthorized?.();
              // Reset flag after a delay to allow for navigation
              setTimeout(() => {
                isLoggingOut = false;
              }, 1000);
            }, 100);
          } else {
            isLoggingOut = false;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Set callback for 401 errors
  setUnauthorizedCallback(callback: () => void) {
    onUnauthorized = callback;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  }

  async clearAuthToken(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export const apiClient = new ApiClient();
