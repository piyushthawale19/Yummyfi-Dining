import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface ToastData {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

interface ToastContextType {
    toasts: ToastData[];
    showToast: (toast: Omit<ToastData, 'id'>) => void;
    showSuccess: (message: string, title?: string) => void;
    showError: (message: string, title?: string) => void;
    showWarning: (message: string, title?: string) => void;
    showInfo: (message: string, title?: string) => void;
    showConfirm: (
        message: string,
        onConfirm: () => void,
        onCancel?: () => void,
        confirmText?: string,
        cancelText?: string,
        title?: string
    ) => void;
    hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: ToastData = {
            id,
            duration: 4000,
            ...toast,
        };

        // Keep only 1 toast at a time - replace existing with new one
        setToasts([newToast]);

        // Auto-hide toast after duration (except for confirm type)
        if (toast.type !== 'confirm' && newToast.duration) {
            setTimeout(() => {
                hideToast(id);
            }, newToast.duration);
        }
    }, [hideToast]);

    const showSuccess = useCallback((message: string, title?: string) => {
        showToast({ type: 'success', message, title });
    }, [showToast]);

    const showError = useCallback((message: string, title?: string) => {
        showToast({ type: 'error', message, title, duration: 5000 });
    }, [showToast]);

    const showWarning = useCallback((message: string, title?: string) => {
        showToast({ type: 'warning', message, title });
    }, [showToast]);

    const showInfo = useCallback((message: string, title?: string) => {
        showToast({ type: 'info', message, title });
    }, [showToast]);

    const showConfirm = useCallback((
        message: string,
        onConfirm: () => void,
        onCancel?: () => void,
        confirmText: string = 'Confirm',
        cancelText: string = 'Cancel',
        title?: string
    ) => {
        showToast({
            type: 'confirm',
            message,
            title,
            onConfirm,
            onCancel,
            confirmText,
            cancelText,
        });
    }, [showToast]);

    return (
        <ToastContext.Provider
            value={{
                toasts,
                showToast,
                showSuccess,
                showError,
                showWarning,
                showInfo,
                showConfirm,
                hideToast,
            }}
        >
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};
