import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { AuthUser, isAdminEmail } from '../utils/auth';

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticatedUser: boolean; // Regular user authenticated (for cart)
  signInWithGoogle: (forAdmin?: boolean) => Promise<AuthUser>;
  signOut: (adminOnly?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Store user session info
      if (firebaseUser) {
        localStorage.setItem('userEmail', firebaseUser.email || '');
        localStorage.setItem('userName', firebaseUser.displayName || '');
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (forAdmin: boolean = false): Promise<AuthUser> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const signedInUser = result.user ?? null;

      // If signing in for admin, verify admin status
      if (forAdmin && signedInUser) {
        const email = signedInUser.email ?? null;
        if (!isAdminEmail(email)) {
          // Not an admin, sign out immediately
          await firebaseSignOut(auth);
          throw new Error('NOT_ADMIN');
        }
        // Mark as admin session
        localStorage.setItem('isAdminSession', 'true');
      } else {
        // Regular user session
        localStorage.setItem('isAdminSession', 'false');
      }

      setUser(signedInUser);
      return signedInUser;
    } catch (error: any) {
      console.error('Sign-in error:', error);
      throw error;
    }
  };

  const signOut = async (adminOnly: boolean = false) => {
    const isAdminSession = localStorage.getItem('isAdminSession') === 'true';

    // If adminOnly is true, only sign out if this is an admin session
    if (adminOnly && !isAdminSession) {
      console.log('Not signing out - not an admin session');
      return;
    }

    await firebaseSignOut(auth);

    // Clear session markers
    localStorage.removeItem('isAdminSession');

    // Only clear user data if not adminOnly or if it was an admin session
    if (!adminOnly || isAdminSession) {
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAdmin: isAdminEmail(user?.email ?? null),
    isAuthenticatedUser: !!user, // Any authenticated user
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

