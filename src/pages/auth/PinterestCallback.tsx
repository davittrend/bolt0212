import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectPinterestAccount } from '@/lib/pinterest/account';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { handleError } from '@/lib/errors';

export function PinterestCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    let mounted = true;

    const processCallback = async () => {
      console.group('Pinterest Callback Processing');

      try {
        if (loading) {
          console.log('Still loading auth state...');
          return;
        }

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

        console.log('Callback parameters:', {
          hasCode: !!code,
          error,
          errorDescription,
          state
        });

        if (error) {
          throw new Error(errorDescription || `Pinterest authorization failed: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Invalid callback parameters');
        }

        setIsProcessing(true);
        await connectPinterestAccount(code);

        if (mounted) {
          toast.success('Pinterest account connected successfully!');
          navigate('/dashboard/accounts', { replace: true });
        }
      } catch (error) {
        console.error('Callback processing failed:', error);
        
        if (mounted) {
          const handledError = handleError(error, { 
            operation: 'Process Pinterest Callback'
          });
          navigate('/dashboard/accounts', { replace: true });
        }
      } finally {
        if (mounted) {
          setIsProcessing(false);
        }
        console.groupEnd();
      }
    };

    processCallback();

    return () => {
      mounted = false;
    };
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