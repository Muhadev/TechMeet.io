// src/lib/token.ts
import axios from 'axios';
import jwtDecode from 'jwt-decode';

// Token storage keys
const ACCESS_TOKEN_KEY = 'event_access_token';
const REFRESH_TOKEN_KEY = 'event_refresh_token';

// Get stored token
export function getStoredToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// Store tokens
export function setToken(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

// Remove tokens
export function removeToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    // Check if exp field exists and compare with current time
    if (decoded.exp) {
      // Convert to milliseconds and compare with current time
      return decoded.exp * 1000 < Date.now();
    }
    return true;
  } catch (error) {
    return true;
  }
}

// Refresh access token using refresh token
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  if (!refreshToken) {
    return null;
  }
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const response = await axios.post(`${apiUrl}/users/token/refresh/`, {
      refresh: refreshToken,
    });
    
    const { access } = response.data;
    
    // Update only the access token in storage
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    
    return access;
  } catch (error) {
    // If refresh fails, clear tokens
    removeToken();
    return null;
  }
}