import { User, UserCredential } from 'firebase/auth';
import { UploadResult } from 'firebase/storage';
import type { AuthUser } from '@yummyfi/types';
export * from './src/index.js';
export declare function signInWithGoogleExpo(): Promise<UserCredential>;
export declare function firebaseUserToAuthUser(user: User | null): AuthUser | null;
export declare function uploadFileExpo(fileUri: string, path: string): Promise<UploadResult>;
export declare function getStorageRef(path: string): import("@firebase/storage").StorageReference;
export declare function storeAuthTokens(tokens: any): Promise<void>;
export declare function getStoredAuthTokens(): Promise<any>;
//# sourceMappingURL=expo.d.ts.map