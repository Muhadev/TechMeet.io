// src/routes/index.tsx
import { Navigate, Routes as RouterRoutes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
// import MainLayout from '../components/layout/MainLayout';
// import DashboardLayout from '../components/layout/DashboardLayout';

// Public pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
// import EventsPage from '../pages/events/EventsPage';
// import EventDetailPage from '../pages/events/EventDetailPage';
import AuthCallback from '../pages/auth/AuthCallback';

// Protected pages
import DashboardPage from '../pages/dashboard';
// import ProfilePage from '../pages/user/ProfilePage';
// import SettingsPage from '../pages/user/SettingsPage';
// import TicketWalletPage from '../pages/tickets/TicketWalletPage';
// import NotificationsPage from '../pages/dashboard/NotificationsPage';

// Admin and Organizer pages
// import EventDashboardPage from '../pages/organizer/EventDashboardPage';
import CreateEventPage from '../pages/events/CreateEventPage';
import EventSuccessPage from '../pages/events/EventSuccessPage';
// import ScanTicketPage from '../pages/organizer/ScanTicketPage';

import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';
// import NotFoundPage from '../pages/NotFoundPage';

export function Routes() {
  const { isAuthenticated } = useAuth();

  return (
    <RouterRoutes>
      {/* Public routes */}
      {/* <Route element={<MainLayout />}> */}
        <Route path="/" element={<HomePage />} />
        <Route path="/events/create-event" element={<CreateEventPage />} />
        <Route path="/events/success" element={<EventSuccessPage />} />
        {/* <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} /> */}
        
        {/* Redirect authenticated users away from auth pages */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} 
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
        <Route path="/auth/google/callback" element={<AuthCallback />} />
        <Route path="/auth/github/callback" element={<AuthCallback />} />
      {/* </Route> */}

      {/* Protected routes */}
      <Route path="/dashboard" element={<DashboardPage />} />
      {/* <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}> */}
        {/* <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/tickets" element={<TicketWalletPage />} />
        <Route path="/notifications" element={<NotificationsPage />} /> */}
        
        {/* Organizer and Admin only routes */}
        {/* <Route 
          path="/events/create" 
          element={
            <RoleBasedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
              <CreateEventPage />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/organizer/events/:id" 
          element={
            <RoleBasedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
              <EventDashboardPage />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/organizer/scan" 
          element={
            <RoleBasedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
              <ScanTicketPage />
            </RoleBasedRoute>
          } 
        />
      </Route> */}

      {/* Catch all route */}
     {/* <Route path="*" element={<NotFoundPage />} /> */}
    </RouterRoutes>
  );
}