// src/pages/auth/AuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';

export default function AuthCallback() {
  const { socialLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      // Parse the URL parameters
      const params = new URLSearchParams(location.search);
      const accessToken = params.get('access_token');
      const provider = params.get('provider') || 'google'; // Default to Google if not specified

      if (!accessToken) {
        setError('No access token provided in the callback URL');
        return;
      }

      try {
        await socialLogin(provider, accessToken);
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to authenticate with social provider');
      }
    };

    processCallback();
  }, [location, socialLogin, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md p-6">
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="text-center text-muted-foreground">Completing authentication...</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}