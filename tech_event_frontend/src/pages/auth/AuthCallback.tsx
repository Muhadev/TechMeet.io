// src/pages/auth/AuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      // Determine the provider based on the current URL path
      const provider = location.pathname.includes('google') ? 'google' : 'github';


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

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardContent className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Completing authentication...</p>
        </CardContent>
      </Card>
    </div>
  );
}