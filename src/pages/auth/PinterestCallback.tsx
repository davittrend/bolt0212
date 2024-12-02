import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectPinterestAccount } from '@/lib/pinterest/account';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { PinterestAuthError, PinterestAPIError } from '@/lib/pinterest/errors';

export function PinterestCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        if (loading) return;

        if (!user) {
          console.log('No authenticated user, redirecting to signin');
          navigate('/signin', { replace: true });
          return;
        }

        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const state = searchParams.get('state');

        if (error) {
          console.error('Pinterest authorization error:', { error, description: errorDescription });
          toast.error(errorDescription || `Pinterest authorization failed: ${error}`);
          navigate('/dashboard/accounts', { replace: true });
          return;
        }

        if (!code || !state) {
          console.error('Invalid callback parameters');
          toast.error('Invalid Pinterest callback URL');
          navigate('/dashboard/accounts', { replace: true });
          return;
        }

        setIsProcessing(true);
        await connectPinterestAccount(code);
        toast.success('Pinterest account connected successfully!');
        navigate('/dashboard/accounts', { replace: true });
      } catch (error) {
        console.error('Error processing Pinterest callback:', error);
        
        if (error instanceof PinterestAuthError) {
          toast.error(`Authentication failed: ${error.message}`);
        } else if (error instanceof PinterestAPIError) {
          toast.error(`Pinterest API error: ${error.message}`);
        } else {
          toast.error('Failed to connect Pinterest account. Please try again.');
        }
        
        navigate('/dashboard/accounts', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [navigate, user, loading]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {loading ? 'Checking authentication...' : 'Connecting your Pinterest account...'}
        </p>
      </div>
    </div>
  );
}