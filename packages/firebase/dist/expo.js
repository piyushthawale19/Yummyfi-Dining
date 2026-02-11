import { ref } from 'firebase/storage';
// Re-export core Firebase
export * from './src/index';
// Expo-specific auth helpers
export async function signInWithGoogleExpo() {
    // This will be implemented with expo-auth-session
    // For now, throw an error to indicate implementation needed
    throw new Error('signInWithGoogleExpo not yet implemented. ' +
        'Requires expo-auth-session integration.');
}
// Helper to convert Firebase User to our AuthUser type
export function firebaseUserToAuthUser(user) {
    if (!user)
        return null;
    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
    };
}
// Expo file upload helper (placeholder - requires expo-file-system)
export async function uploadFileExpo(fileUri, path) {
    throw new Error('uploadFileExpo not yet implemented. ' +
        'Requires expo-file-system integration to convert URI to Blob.');
}
//  storage helpers for mobile
export function getStorageRef(path) {
    // Get storage instance from core
    const { storage } = require('./src/index');
    return ref(storage, path);
}
// Async storage helpers (placeholder - requires AsyncStorage)
export async function storeAuthTokens(tokens) {
    throw new Error('storeAuthTokens not yet implemented. ' +
        'Requires @react-native-async-storage/async-storage.');
}
export async function getStoredAuthTokens() {
    throw new Error('getStoredAuthTokens not yet implemented. ' +
        'Requires @react-native-async-storage/async-storage.');
}
//# sourceMappingURL=expo.js.map