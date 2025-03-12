// src/App.tsx
import { useEffect, useState } from 'react';
import { Routes } from './routes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from './components/ui/toaster';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    // Initialize any required app resources
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="event-management-theme">
      <AuthProvider>
        <Routes />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;