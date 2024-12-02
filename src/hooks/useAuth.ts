import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAccountStore } from '@/lib/store';
import { toast } from 'sonner';
import { handleFirebaseError } from '@/lib/firebase/errors';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const initializeStore = useAccountStore((state) => state.initializeStore);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        setError(null);

        if (currentUser) {
          try {
            initializeStore(currentUser.uid);
          } catch (err) {
            const error = handleFirebaseError(err);
            setError(error);
            toast.error(`Store initialization failed: ${error.message}`);
          }
        }
      },
      (error) => {
        const handledError = handleFirebaseError(error);
        setError(handledError);
        setLoading(false);
        toast.error(`Authentication error: ${handledError.message}`);
      }
    );

    return () => unsubscribe();
  }, [initializeStore]);

  return { user, loading, error };
}