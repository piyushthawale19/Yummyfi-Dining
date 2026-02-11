import React from 'react';
import { useToast } from '../context/ToastContext';
import { Bell, Check, X, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// This component demonstrates all the toast notification types
export const ToastDemo = () => {
    const { showSuccess, showError, showWarning, showInfo, showConfirm } = useToast();

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-offWhite to-brand-cream p-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-brand-maroon p-3 rounded-2xl">
                            <Bell className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-brand-maroon font-serif">
                                Professional Toast Notifications
                            </h1>
                            <p className="text-gray-600">
                                Beautiful, modern notifications for your application
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Success Toast */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => showSuccess('Your action completed successfully!', '✅ Success')}
                            className="flex items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 hover:border-emerald-400 transition-all group"
                        >
                            <div className="bg-emerald-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                <Check className="text-emerald-600" size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-emerald-900">Success Toast</h3>
                                <p className="text-sm text-emerald-700">Show success message</p>
                            </div>
                        </motion.button>

                        {/* Error Toast */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => showError('Something went wrong. Please try again.', '❌ Error')}
                            className="flex items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 hover:border-red-400 transition-all group"
                        >
                            <div className="bg-red-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                <X className="text-red-600" size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-red-900">Error Toast</h3>
                                <p className="text-sm text-red-700">Show error message</p>
                            </div>
                        </motion.button>

                        {/* Warning Toast */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => showWarning('Please check your input before proceeding.', '⚠️ Warning')}
                            className="flex items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 hover:border-amber-400 transition-all group"
                        >
                            <div className="bg-amber-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                <AlertTriangle className="text-amber-600" size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-amber-900">Warning Toast</h3>
                                <p className="text-sm text-amber-700">Show warning message</p>
                            </div>
                        </motion.button>

                        {/* Info Toast */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => showInfo('Here is some helpful information for you.', 'ℹ️ Information')}
                            className="flex items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-blue-400 transition-all group"
                        >
                            <div className="bg-blue-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                <Info className="text-blue-600" size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-blue-900">Info Toast</h3>
                                <p className="text-sm text-blue-700">Show info message</p>
                            </div>
                        </motion.button>

                        {/* Confirm Dialog */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                                showConfirm(
                                    'Are you sure you want to proceed with this action? This cannot be undone.',
                                    () => {
                                        showSuccess('Action confirmed!');
                                    },
                                    () => {
                                        showInfo('Action cancelled');
                                    },
                                    'Yes, Proceed',
                                    'Cancel',
                                    '❓ Confirmation Required'
                                )
                            }
                            className="flex items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 hover:border-violet-400 transition-all group col-span-full"
                        >
                            <div className="bg-violet-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                <HelpCircle className="text-violet-600" size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-violet-900">Confirmation Dialog</h3>
                                <p className="text-sm text-violet-700">
                                    Show confirmation with custom actions
                                </p>
                            </div>
                        </motion.button>
                    </div>

                    <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="text-brand-maroon">✨</span>
                            Features
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-center gap-2">
                                <Check size={16} className="text-green-600" />
                                Beautiful gradient backgrounds and smooth animations
                            </li>
                            <li className="flex items-center gap-2">
                                <Check size={16} className="text-green-600" />
                                Auto-dismiss with progress bar (except confirmations)
                            </li>
                            <li className="flex items-center gap-2">
                                <Check size={16} className="text-green-600" />
                                Custom titles and messages for each notification
                            </li>
                            <li className="flex items-center gap-2">
                                <Check size={16} className="text-green-600" />
                                Confirmation dialogs with custom button text
                            </li>
                            <li className="flex items-center gap-2">
                                <Check size={16} className="text-green-600" />
                                Fully responsive and accessible
                            </li>
                        </ul>
                    </div>
                </motion.div>

                <div className="text-center text-gray-500 text-sm">
                    <p>
                        This notification system replaces all unprofessional browser alerts and confirms
                    </p>
                </div>
            </div>
        </div>
    );
};
