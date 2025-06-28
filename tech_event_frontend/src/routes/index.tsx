// src/routes/index.tsx
import { Navigate, Routes as RouterRoutes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Public pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import AuthCallback from '../pages/auth/AuthCallback';

// Protected pages
import DashboardPage from '../pages/dashboard';
import CreateEventPage from '../pages/events/CreateEventPage';
import EventSuccessPage from '../pages/events/EventSuccessPage';
import EventDetailPage from '../pages/events/EventDetailPage';
import ProfileSettings from '../pages/ProfileSettings';

export function Routes() {
  const { isAuthenticated } = useAuth();

  return (
    <RouterRoutes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/events/create-event" element={<CreateEventPage />} />
      <Route path="/events/success" element={<EventSuccessPage />} />
      
      {/* Auth callback routes - MUST come before conditional auth routes */}
      <Route path="/auth/google/callback" element={<AuthCallback />} />
      <Route path="/auth/github/callback" element={<AuthCallback />} />
      
      {/* Conditional auth routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} 
      />
      <Route path="/reset-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />

      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/settings" 
        element={isAuthenticated ? <ProfileSettings /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/events/:id" 
        element={<EventDetailPage />} 
      />
    </RouterRoutes>
  );
}