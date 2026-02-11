// Web-specific Firebase exports (maintains existing web app behavior)
import { GoogleAuthProvider } from 'firebase/auth';
export * from './src/index';
// Web-specific Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
//# sourceMappingURL=web.js.map