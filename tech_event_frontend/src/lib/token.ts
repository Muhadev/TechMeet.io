// src/lib/token.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Token storage keys
const ACCESS_TOKEN_KEY = 'event_access_token';
const REFRESH_TOKEN_KEY = 'event_refresh_token';

// JWT payload interface
interface JWTPayload {
  exp?: number;
  user_id?: number;
  email?: string;
}

// Get stored access token
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// Get stored refresh token
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// Store tokens
export function setToken(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

// Remove tokens
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const decoded: JWTPayload = jwtDecode(token);
    // Check if exp field exists and compare with current time
    if (decoded.exp) {
      // Add 30 second buffer to account for network delays
      const bufferTime = 30 * 1000; // 30 seconds in milliseconds
      return (decoded.exp * 1000) < (Date.now() + bufferTime);
    }
    return true;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
}

// Check if user is authenticated with valid token
export function isAuthenticated(): boolean {
  const token = getStoredToken();
  return token !== null && !isTokenExpired(token);
}

// Get user info from token
export function getUserFromToken(): JWTPayload | null {
  const token = getStoredToken();
  if (!token || isTokenExpired(token)) {
    return null;
  }
  
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

// Refresh access token using refresh token
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    console.warn('No refresh token available');
    return null;
  }
  
  // Check if refresh token is expired
  if (isTokenExpired(refreshToken)) {
    console.warn('Refresh token is expired');
    removeToken();
    return null;
  }
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://techmeetio.up.railway.app/api';
    
    // Note: Fixed the endpoint URL - it should be /auth/token/refresh/ not /users/token/refresh/
    const response = await axios.post(`${apiUrl}/auth/token/refresh/`, {
      refresh: refreshToken,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });
    
    const { access } = response.data;
    
    if (!access) {
      throw new Error('No access token received from refresh endpoint');
    }
    
    // Update only the access token in storage
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    
    return access;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // If refresh fails, clear tokens
    removeToken();
    return null;
  }
}

// Auto-refresh token if it's about to expire
export async function ensureValidToken(): Promise<string | null> {
  const token = getStoredToken();
  
  if (!token) {
    return null;
  }
  
  // If token is expired or about to expire, try to refresh
  if (isTokenExpired(token)) {
    console.log('Token expired, attempting to refresh...');
    return await refreshAccessToken();
  }
  
  return token;
}

// Clear all authentication data
export function logout(): void {
  removeToken();
  // You might want to redirect to login page here
}