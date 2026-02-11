// Firebase configuration shim - re-exports from shared package
// This file maintains compatibility with existing web app imports

// Re-export everything from the shared web adapter
export * from '../../../packages/firebase/web';

// Maintain legacy named exports for compatibility
import { 
  app, 
  auth, 
  db, 
  storage, 
  isFirebaseConfigured,
  googleProvider 
} from '../../../packages/firebase/web';

export { 
  app, 
  auth, 
  db, 
  storage, 
  isFirebaseConfigured,
  googleProvider 
};

