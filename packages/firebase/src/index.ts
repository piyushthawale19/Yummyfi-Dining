// Core Firebase initialization for both web and mobile
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Environment-agnostic config loader
function getFirebaseConfig(): FirebaseConfig {
  // Try web environment variables first (Vite)
  if (typeof window !== 'undefined' && (globalThis as any).import?.meta?.env) {
    const env = (globalThis as any).import.meta.env;
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    };
  }
  
  // Try Expo environment variables
  if (typeof process !== 'undefined' && process.env) {
    return {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
    };
  }
  
  // Fallback - should not happen in production
  throw new Error('Firebase configuration not found. Please check your environment variables.');
}

let firebaseApp: FirebaseApp;
let firebaseAuth: Auth;
let firebaseDb: Firestore;
let firebaseStorage: FirebaseStorage;

// Initialize Firebase (should be called once)
export function initializeFirebase(): void {
  if (firebaseApp) {
    return; // Already initialized
  }
  
  const config = getFirebaseConfig();
  firebaseApp = initializeApp(config);
  firebaseAuth = getAuth(firebaseApp);
  firebaseDb = getFirestore(firebaseApp);
  firebaseStorage = getStorage(firebaseApp);
}

// Validation function
export function isFirebaseConfigured(): boolean {
  try {
    const config = getFirebaseConfig();
    return Boolean(
      config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.appId
    );
  } catch {
    return false;
  }
}

// Export getters to ensure Firebase is initialized
export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    initializeFirebase();
  }
  return firebaseAuth;
}

export function getFirebaseDb(): Firestore {
  if (!firebaseDb) {
    initializeFirebase();
  }
  return firebaseDb;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!firebaseStorage) {
    initializeFirebase();
  }
  return firebaseStorage;
}

// Legacy exports for compatibility
export const app = getFirebaseApp();
export const auth = getFirebaseAuth();
export const db = getFirebaseDb();
export const storage = getFirebaseStorage();