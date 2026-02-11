import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  AlertCircle,
} from 'lucide-react';
import { useToast, ToastData } from '../context/ToastContext';
import { cn } from '../utils/helpers';

// Brand colors configuration for mobile-first design
const toastConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-white',
    borderColor: 'border-green-500',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    titleColor: 'text-brand-maroon',
    messageColor: 'text-gray-700',
    progressBg: 'bg-green-500',
    confirmBtnBg: 'bg-green-600 hover:bg-green-700',
  },
  error: {
    icon: XCircle,
    bg: 'bg-white',
    borderColor: 'border-red-500',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    titleColor: 'text-brand-maroon',
    messageColor: 'text-gray-700',
    progressBg: 'bg-red-500',
    confirmBtnBg: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-brand-yellow',
    borderColor: 'border-brand-maroon',
    iconBg: 'bg-white',
    iconColor: 'text-brand-maroon',
    titleColor: 'text-brand-maroon',
    messageColor: 'text-gray-800',
    progressBg: 'bg-brand-maroon',
    confirmBtnBg: 'bg-brand-maroon hover:bg-brand-burgundy',
  },
  info: {
    icon: Info,
    bg: 'bg-brand-cream',
    borderColor: 'border-brand-maroon',
    iconBg: 'bg-white',
    iconColor: 'text-brand-maroon',
    titleColor: 'text-brand-maroon',
    messageColor: 'text-gray-700',
    progressBg: 'bg-brand-maroon',
    confirmBtnBg: 'bg-brand-maroon hover:bg-brand-burgundy',
  },
  confirm: {
    icon: AlertCircle,
    bg: 'bg-white',
    borderColor: 'border-brand-maroon',
    iconBg: 'bg-brand-cream',
    iconColor: 'text-brand-maroon',
    titleColor: 'text-brand-maroon',
    messageColor: 'text-gray-700',
    progressBg: 'bg-brand-maroon',
    confirmBtnBg: 'bg-brand-maroon hover:bg-brand-burgundy',
  },
};

interface ToastItemProps {
  toast: ToastData;
}

const ToastItem = ({ toast }: ToastItemProps) => {
  const { hideToast } = useToast();
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  // Handle confirm dialog actions
  const handleConfirm = () => {
    toast.onConfirm?.();
    hideToast(toast.id);
  };

  const handleCancel = () => {
    toast.onCancel?.();
    hideToast(toast.id);
  };

  // Auto-dismiss logic
  useEffect(() => {
    if (toast.type !== 'confirm' && toast.duration) {
      const timer = setTimeout(() => {
        hideToast(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }}
      className="w-full"
    >
      <div
        className={cn(
          'relative shadow-lg rounded-xl overflow-hidden border-2',
          config.bg,
          config.borderColor
        )}
      >
        {/* Progress bar for auto-dismiss toasts */}
        {toast.type !== 'confirm' && toast.duration && (
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: toast.duration / 1000, ease: 'linear' }}
            className={cn('absolute top-0 left-0 h-1 z-10', config.progressBg)}
          />
        )}

        <div className="p-3 sm:p-4">
          {/* Main content */}
          <div className="flex gap-2 sm:gap-3">
            {/* Icon - Smaller on mobile */}
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
              className={cn('flex-shrink-0 rounded-lg p-1.5 sm:p-2', config.iconBg)}
            >
              <Icon className={cn('w-4 h-4 sm:w-5 sm:h-5', config.iconColor)} strokeWidth={2.5} />
            </motion.div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className={cn('font-bold text-xs sm:text-sm mb-0.5 leading-tight', config.titleColor)}>
                  {toast.title}
                </h4>
              )}
              <p className={cn('text-xs sm:text-sm leading-snug', config.messageColor)}>
                {toast.message}
              </p>

              {/* Confirm dialog buttons - Mobile optimized */}
              {toast.type === 'confirm' && (
                <div className="flex gap-2 mt-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirm}
                    className={cn(
                      'flex-1 text-white font-bold px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm shadow-sm',
                      config.confirmBtnBg
                    )}
                  >
                    {toast.confirmText || 'OK'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold px-3 py-2 rounded-lg transition-colors border-2 border-gray-200 text-xs sm:text-sm"
                  >
                    {toast.cancelText || 'Cancel'}
                  </motion.button>
                </div>
              )}
            </div>

            {/* Close button - Smaller on mobile */}
            {toast.type !== 'confirm' && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => hideToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-16 sm:top-20 right-2 sm:right-4 left-2 sm:left-auto z-[100] flex flex-col gap-2 sm:gap-3 pointer-events-none sm:max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
