import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin = () => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Pass forAdmin=true to indicate this is an admin login
      await signInWithGoogle(true);

      // If we reach here, user is an admin (signInWithGoogle would have thrown otherwise)
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Admin login error:', err);

      if (err.message === 'NOT_ADMIN') {
        setErrorMessage('This Google account is not authorized for admin access.');
      } else {
        setErrorMessage('Failed to sign in with Google. Please try again.');
      }

      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-offWhite p-4">
      {/* Error Toast */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -100, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[60] max-w-md w-full mx-4"
          >
            <motion.div
              animate={{
                scale: [1, 1.02, 1],
                rotate: [0, -1, 1, -1, 0]
              }}
              transition={{
                duration: 0.5,
                repeat: 2
              }}
              className="bg-white rounded-2xl shadow-2xl border-2 border-red-500 p-4 flex items-center gap-4"
            >
              <div className="bg-red-100 rounded-full p-2 flex-shrink-0">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <div className="flex-grow">
                <p className="font-bold text-red-600 text-sm">Access Denied</p>
                <p className="text-gray-600 text-xs mt-0.5">
                  {errorMessage || 'Please check your credentials and try again.'}
                </p>
              </div>
              <button
                onClick={() => setShowError(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-brand-maroon">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-maroon/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-maroon">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-brand-maroon">Staff Login</h2>
          <p className="text-gray-500">Secure access for restaurant staff only</p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-brand-maroon text-white font-bold py-3 rounded-lg hover:bg-brand-burgundy transition-colors shadow-lg shadow-brand-maroon/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Continue with Google</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Only authorized staff Google accounts can access the admin dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};
