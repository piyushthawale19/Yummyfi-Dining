import { useState } from 'react';
import { X, User, Mail, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createUserSession } from '../utils/sessionManager';

interface UserLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const UserLoginModal = ({ isOpen, onClose, onSuccess }: UserLoginModalProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        if (!email.trim()) {
            setError('Please enter your email');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Create user session
        createUserSession(name.trim(), email.trim(), tableNumber.trim() || undefined);

        // Reset form
        setName('');
        setEmail('');
        setTableNumber('');
        setError('');

        // Call success callback
        onSuccess();
    };

    const handleClose = () => {
        setError('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 z-[70]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            {/* Header */}
                            <div className="bg-brand-maroon text-white p-6 relative">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                                <h2 className="text-2xl font-bold">Welcome to Yummy-Fi!</h2>
                                <p className="text-white/80 text-sm mt-1">
                                    Please provide your details to continue
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Name Input */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                                        Your Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-maroon focus:border-transparent outline-none transition-all"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Email Input */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-maroon focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Table Number Input (Optional) */}
                                <div>
                                    <label htmlFor="tableNumber" className="block text-sm font-bold text-gray-700 mb-2">
                                        Table Number <span className="text-gray-400 font-normal">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            id="tableNumber"
                                            value={tableNumber}
                                            onChange={(e) => setTableNumber(e.target.value)}
                                            placeholder="5"
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-maroon focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Info Text */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-xs text-blue-800">
                                        <strong>Why do we need this?</strong> Your details help us track your order and notify you when it's ready for delivery.
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-brand-maroon text-white font-bold py-3 rounded-lg hover:bg-brand-burgundy transition-colors shadow-lg shadow-brand-maroon/20"
                                >
                                    Continue to Order
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
