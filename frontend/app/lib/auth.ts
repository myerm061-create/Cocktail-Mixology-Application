import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1';

// Token storage keys
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const KEEP_SIGNED_IN_KEY = 'auth_keep_signed_in';

// Token response from backend
export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};

// User info from /auth/me
export type User = {
  id: number;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string, keepSignedIn?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Store tokens securely
  const storeTokens = async (tokens: TokenPair, keepSignedIn: boolean) => {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.access_token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refresh_token);
      await SecureStore.setItemAsync(KEEP_SIGNED_IN_KEY, String(keepSignedIn));
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw error;
    }
  };

  // Retrieve tokens from secure storage
  const getStoredTokens = async (): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
    keepSignedIn: boolean;
  }> => {
    try {
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      const keepSignedIn = await SecureStore.getItemAsync(KEEP_SIGNED_IN_KEY);

      return {
        accessToken,
        refreshToken,
        keepSignedIn: keepSignedIn === 'true',
      };
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return { accessToken: null, refreshToken: null, keepSignedIn: false };
    }
  };

  // Clear all auth data
  const clearAuthData = async () => {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(KEEP_SIGNED_IN_KEY);
      setUser(null);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  };

  // Fetch current user info
  const fetchUser = async (accessToken: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  };

  // Refresh access token using refresh token
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const { refreshToken, keepSignedIn } = await getStoredTokens();

      if (!refreshToken) {
        return false;
      }

      // If user chose not to stay signed in, check if session should expire
      if (!keepSignedIn) {
        // For non-persistent sessions, we could add additional checks here
        // For now allow refresh, could add time-based logic
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
        await clearAuthData();
        return false;
      }

      const tokens: TokenPair = await response.json();
      await storeTokens(tokens, keepSignedIn);

      // Fetch updated user info
      const userData = await fetchUser(tokens.access_token);
      if (userData) {
        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      await clearAuthData();
      return false;
    }
  }, []);

  // Get valid access token (refresh if needed)
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const { accessToken } = await getStoredTokens();

      if (!accessToken) {
        return null;
      }

      // Try to use current token
      // In a production app, you'd decode the JWT and check expiry
      // For simplicity, we'll attempt to use it and refresh on 401

      return accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }, []);

  // Sign in with email and password
  const signIn = async (
    email: string,
    password: string,
    keepSignedIn: boolean = false,
  ) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Login failed');
      }

      const tokens: TokenPair = await response.json();
      await storeTokens(tokens, keepSignedIn);

      // Fetch user info
      const userData = await fetchUser(tokens.access_token);
      if (userData) {
        setUser(userData);
      } else {
        throw new Error('Failed to fetch user info');
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const accessToken = await getAccessToken();

      // Call logout endpoint if we have a token
      if (accessToken) {
        try {
          await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } catch (error) {
          // Continue with local logout even if API call fails
          console.error('Logout API call failed:', error);
        }
      }

      await clearAuthData();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Sign out failed:', error);
      // Clear local data anyway
      await clearAuthData();
      router.replace('/(auth)/login');
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const { accessToken, keepSignedIn } = await getStoredTokens();

        if (!accessToken) {
          setIsLoading(false);
          return;
        }

        // Try to fetch user with current token
        const userData = await fetchUser(accessToken);

        if (userData) {
          setUser(userData);
        } else {
          // Token invalid, try to refresh
          const refreshed = await refreshSession();
          if (!refreshed) {
            // Refresh failed, clear everything
            await clearAuthData();
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        await clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();
  }, [refreshSession]);

  // Set up automatic token refresh 
  useEffect(() => {
    if (!user) return;

    // Refresh token every 10 minutes (access token expires in 15)
    const interval = setInterval(() => {
      void refreshSession();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, refreshSession]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    refreshSession,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}