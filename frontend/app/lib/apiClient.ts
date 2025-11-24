import * as SecureStore from 'expo-secure-store';

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
};

/**
 * Authenticated API client that automatically:
 * - Adds Authorization headers
 * - Handles token refresh on 401
 * - Retries failed requests after refresh
 */
class ApiClient {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        // Refresh failed, clear tokens
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        return false;
      }

      const tokens = await response.json();
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.access_token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refresh_token);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Get the current access token
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Make an authenticated API request
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requiresAuth = true,
    } = options;

    // Build request headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add auth header if required
    if (requiresAuth) {
      const token = await this.getAccessToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    // Build request config
    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    // Make the request
    let response = await fetch(`${API_BASE}${endpoint}`, config);

    // Handle 401 by refreshing token and retrying
    if (response.status === 401 && requiresAuth) {
      // Prevent multiple simultaneous refresh attempts
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        this.refreshPromise = this.refreshAccessToken();
      }

      const refreshSuccess = await this.refreshPromise;
      this.isRefreshing = false;
      this.refreshPromise = null;

      if (refreshSuccess) {
        // Retry request with new token
        const newToken = await this.getAccessToken();
        if (newToken) {
          requestHeaders.Authorization = `Bearer ${newToken}`;
          config.headers = requestHeaders;
          response = await fetch(`${API_BASE}${endpoint}`, config);
        }
      } else {
        // Refresh failed, throw error to trigger logout
        throw new Error('Session expired. Please log in again.');
      }
    }

    // Handle response
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        errorText || `Request failed with status ${response.status}`
      );
    }

    // Return parsed JSON or empty object for 204
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  }

  // Convenience methods
  async get<T = any>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  async post<T = any>(
    endpoint: string,
    body?: any,
    requiresAuth = true
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth });
  }

  async put<T = any>(
    endpoint: string,
    body?: any,
    requiresAuth = true
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth });
  }

  async delete<T = any>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  }

  async patch<T = any>(
    endpoint: string,
    body?: any,
    requiresAuth = true
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body, requiresAuth });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export convenience functions
export const api = {
  get: <T = any>(endpoint: string, requiresAuth = true) =>
    apiClient.get<T>(endpoint, requiresAuth),
  
  post: <T = any>(endpoint: string, body?: any, requiresAuth = true) =>
    apiClient.post<T>(endpoint, body, requiresAuth),
  
  put: <T = any>(endpoint: string, body?: any, requiresAuth = true) =>
    apiClient.put<T>(endpoint, body, requiresAuth),
  
  delete: <T = any>(endpoint: string, requiresAuth = true) =>
    apiClient.delete<T>(endpoint, requiresAuth),
  
  patch: <T = any>(endpoint: string, body?: any, requiresAuth = true) =>
    apiClient.patch<T>(endpoint, body, requiresAuth),
};