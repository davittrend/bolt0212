import { getDatabase, ref, set, get, remove, Database } from 'firebase/database';
import { app } from './init';
import { handleFirebaseError, logFirebaseError } from './errors';
import { toast } from 'sonner';

class DatabaseService {
  private static instance: Database | null = null;

  static initialize(): Database {
    if (!this.instance) {
      try {
        this.instance = getDatabase(app);
        console.log('Firebase Realtime Database initialized successfully');
      } catch (error) {
        logFirebaseError('Database Initialization', error);
        throw error;
      }
    }
    return this.instance;
  }

  static async write(path: string, data: any): Promise<void> {
    try {
      const dbRef = ref(this.initialize(), path);
      await set(dbRef, data);
      console.log(`Data written successfully to path: ${path}`);
    } catch (error) {
      logFirebaseError(`Database Write to ${path}`, error);
      const handledError = handleFirebaseError(error);
      toast.error(`Failed to save data: ${handledError.message}`);
      throw handledError;
    }
  }

  static async read<T>(path: string): Promise<T | null> {
    try {
      const dbRef = ref(this.initialize(), path);
      const snapshot = await get(dbRef);
      console.log(`Data read successfully from path: ${path}`);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      logFirebaseError(`Database Read from ${path}`, error);
      const handledError = handleFirebaseError(error);
      toast.error(`Failed to read data: ${handledError.message}`);
      throw handledError;
    }
  }

  static async delete(path: string): Promise<void> {
    try {
      const dbRef = ref(this.initialize(), path);
      await remove(dbRef);
      console.log(`Data deleted successfully from path: ${path}`);
    } catch (error) {
      logFirebaseError(`Database Delete at ${path}`, error);
      const handledError = handleFirebaseError(error);
      toast.error(`Failed to delete data: ${handledError.message}`);
      throw handledError;
    }
  }
}

export const database = DatabaseService.initialize();
export const { write: writeToDatabase, read: readFromDatabase, delete: deleteFromDatabase } = DatabaseService;