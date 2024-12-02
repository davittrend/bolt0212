import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAccountStore } from '@/lib/store';
import { handleError } from '@/lib/errors';
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const initializeStore = useAccountStore((state) => state.initializeStore);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!mounted) return;

        try {
          setUser(currentUser);
          
          if (currentUser) {
            console.log('User authenticated, initializing store...');
            await initializeStore();
            console.log('Store initialized successfully');
          }
        } catch (err) {
          const error = handleError(err, { 
            operation: 'Auth State Change',
            silent: true // Already handled by store
          });
          setError(error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        if (!mounted) return;
        
        const handledError = handleError(error, { 
          operation: 'Auth State Change' 
        });
        setError(handledError);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [initializeStore]);

  return { user, loading, error };
}