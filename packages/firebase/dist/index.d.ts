import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
export declare function initializeFirebase(): void;
export declare function isFirebaseConfigured(): boolean;
export declare function getFirebaseApp(): FirebaseApp;
export declare function getFirebaseAuth(): Auth;
export declare function getFirebaseDb(): Firestore;
export declare function getFirebaseStorage(): FirebaseStorage;
export declare const app: FirebaseApp;
export declare const auth: Auth;
export declare const db: Firestore;
export declare const storage: FirebaseStorage;
//# sourceMappingURL=index.d.ts.map