// Expo-specific Firebase adapters for mobile app
import { 
  signInWithCredential, 
  GoogleAuthProvider, 
  User,
  UserCredential 
} from 'firebase/auth';
import { ref, uploadBytes, UploadResult } from 'firebase/storage';

// For now, define the AuthUser type locally to avoid cross-package import issues
// This will be resolved when we implement proper module resolution
interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Re-export core Firebase
export * from './src/index';

// Expo-specific auth helpers
export async function signInWithGoogleExpo(): Promise<UserCredential> {
  // This will be implemented with expo-auth-session
  // For now, throw an error to indicate implementation needed
  throw new Error(
    'signInWithGoogleExpo not yet implemented. ' +
    'Requires expo-auth-session integration.'
  );
}

// Helper to convert Firebase User to our AuthUser type
export function firebaseUserToAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

// Expo file upload helper (placeholder - requires expo-file-system)
export async function uploadFileExpo(
  fileUri: string, 
  path: string
): Promise<UploadResult> {
  throw new Error(
    'uploadFileExpo not yet implemented. ' +
    'Requires expo-file-system integration to convert URI to Blob.'
  );
}

//  storage helpers for mobile
export function getStorageRef(path: string) {
  // Get storage instance from core
  const { storage } = require('./src/index');
  return ref(storage, path);
}

// Async storage helpers (placeholder - requires AsyncStorage)
export async function storeAuthTokens(tokens: any): Promise<void> {
  throw new Error(
    'storeAuthTokens not yet implemented. ' +
    'Requires @react-native-async-storage/async-storage.'
  );
}

export async function getStoredAuthTokens(): Promise<any> {
  throw new Error(
    'getStoredAuthTokens not yet implemented. ' +
    'Requires @react-native-async-storage/async-storage.'
  );
}