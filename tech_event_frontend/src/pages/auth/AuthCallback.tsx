// src/pages/auth/AuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function AuthCallback() {
  const { socialLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Parse the URL parameters
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('access_token');
        const errorParam = params.get('error');
        
        console.log('Callback URL params:', {
          accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : null,
          error: errorParam,
          fullUrl: window.location.href,
          pathname: location.pathname
        });
        
        // Check for error parameter first
        if (errorParam) {
          let errorMessage = 'Authentication failed. Please try again.';
          switch (errorParam) {
            case 'access_denied':
              errorMessage = 'Access was denied. Please grant the required permissions.';
              break;
            case 'no_code':
              errorMessage = 'No authorization code received from the provider.';
              break;
            case 'config_error':
              errorMessage = 'Authentication service is not properly configured.';
              break;
            case 'token_exchange_failed':
              errorMessage = 'Failed to exchange authorization code for access token.';
              break;
            case 'server_error':
              errorMessage = 'Server error occurred during authentication.';
              break;
          }
          setError(errorMessage);
          setIsLoading(false);
          return;
        }

        // Determine the provider based on the current URL path
        const provider = location.pathname.includes('google') ? 'google' : 'github';

        if (!accessToken) {
          setError('No access token received from the authentication provider.');
          setIsLoading(false);
          return;
        }

        console.log(`Processing ${provider} authentication with token...`);

        // Call socialLogin from context - this will make POST request to /api/auth/{provider}/
        await socialLogin(provider, accessToken);
        
        console.log('Social login successful, navigating to dashboard');
        navigate('/dashboard');
        
      } catch (err: any) {
        console.error('Social login error:', err);
        let errorMessage = 'Failed to authenticate with social provider';
        
        if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response?.data?.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0];
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    processCallback();
  }, [location, socialLogin, navigate]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert className="mb-4">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/login')}
                className="flex-1"
              >
                Back to Login
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Completing authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}