import { useState, useEffect } from 'react';
import { useAccountStore } from '@/lib/store';
import { handleError } from '@/lib/errors';

interface User {
  id: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const initializeStore = useAccountStore((state) => state.initializeStore);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // For testing, create a mock user
        const mockUser = {
          id: 'test-user',
          email: 'test@example.com'
        };
        
        if (mounted) {
          setUser(mockUser);
          console.log('User authenticated, initializing store...');
          await initializeStore();
          console.log('Store initialized successfully');
        }
      } catch (err) {
        console.error('Error in Auth State Change');
        console.error('Error details:', err);
        
        if (mounted) {
          const error = handleError(err, { 
            operation: 'Auth State Change',
            silent: true
          });
          setError(error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [initializeStore]);

  return { user, loading, error };
}