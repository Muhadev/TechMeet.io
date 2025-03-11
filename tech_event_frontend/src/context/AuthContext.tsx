// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '../lib/axios';
import { User } from '../types';
import { getStoredToken, setToken, removeToken } from '../lib/token';

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  socialLogin: (provider: string, accessToken: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setAuthToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verify token and load user data
    const loadUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('/users/profile/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load user:', err);
        removeToken();
        setAuthToken(null);
        setError('Session expired. Please log in again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/users/token/', { email, password });
      const { access, refresh } = response.data;
      
      setToken(access, refresh);
      setAuthToken(access);
      
      // Load user profile
      const userResponse = await axios.get('/users/profile/', {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });
      
      setUser(userResponse.data);
      setError(null);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      await axios.post('/users/register/', userData);
      setError(null);
      // After successful registration, log the user in
      await login(userData.email, userData.password);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: string, accessToken: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`/users/${provider}/`, {
        access_token: accessToken,
      });
      
      const { access, refresh } = response.data;
      setToken(access, refresh);
      setAuthToken(access);
      
      // Load user profile
      const userResponse = await axios.get('/users/profile/', {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });
      
      setUser(userResponse.data);
      setError(null);
    } catch (err: any) {
      console.error(`${provider} login failed:`, err);
      setError(err.response?.data?.detail || `${provider} login failed.`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setAuthToken(null);
    setUser(null);
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!token) {
      setError('Not authenticated');
      throw new Error('Not authenticated');
    }

    try {
      const response = await axios.patch('/users/profile/', userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUser(response.data);
      setError(null);
      return response.data;
    } catch (err: any) {
      console.error('Profile update failed:', err);
      setError(err.response?.data?.detail || 'Profile update failed.');
      throw err;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
    socialLogin,
    updateProfile,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}