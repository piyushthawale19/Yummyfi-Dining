import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/helpers';
import { CheckCircle, Flame, MapPin, ShoppingBag, Clock, Loader2, ChefHat, UtensilsCrossed, Bell, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const TrackOrderPage = () => {
  const { orders, ordersLoading, cancelOrder } = useApp();
  const { user } = useAuth();
  const { showConfirm, showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(20 * 60);

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (!user) {
      showError('Please Order to track them');
      navigate('/');
    }
  }, [user, navigate, showError]);

  useEffect(() => {
    if (ordersLoading || !user) return;

    const lastOrderId = localStorage.getItem('lastOrderId');
    if (lastOrderId) {
      const foundOrder = orders.find(o => o.id === lastOrderId);
      
      // Verify the order belongs to the current user (by email or name)
      const isUserOrder = foundOrder && (
        foundOrder.customerEmail === user.email ||
        foundOrder.customerName === user.displayName
      );
      
      if (isUserOrder) {
        setOrder(foundOrder);

        if (foundOrder.status === 'confirmed' && foundOrder.confirmedAt) {
          const confirmedTime = new Date(foundOrder.confirmedAt).getTime();
          const now = new Date().getTime();
          const elapsedSeconds = Math.floor((now - confirmedTime) / 1000);
          const remaining = Math.max(0, (20 * 60) - elapsedSeconds);
          setTimeLeft(remaining);
        } else if (foundOrder.status === 'ready' && foundOrder.confirmedAt && foundOrder.readyAt) {
          const confirmedTime = new Date(foundOrder.confirmedAt).getTime();
          const readyTime = new Date(foundOrder.readyAt).getTime();
          const elapsedSeconds = Math.floor((readyTime - confirmedTime) / 1000);
          const remaining = Math.max(0, (20 * 60) - elapsedSeconds);
          setTimeLeft(remaining);
        } else if (foundOrder.status === 'completed') {
          setTimeLeft(0);
        }
      } else if (foundOrder) {
        // Order exists but doesn't belong to current user - clear it
        localStorage.removeItem('lastOrderId');
        setOrder(null);
      }
    }
  }, [orders, ordersLoading, user]);

  useEffect(() => {
    if (!order || order.status !== 'confirmed' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [order, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCancelOrder = () => {
    if (!order) return;
    
    showConfirm(
      'Are you sure you want to cancel this order? This action cannot be undone.',
      async () => {
        try {
          await cancelOrder(order.id, 'user');
          showSuccess('Order cancelled successfully', '✓ Cancelled');
          // Clear the last order ID from localStorage
          localStorage.removeItem('lastOrderId');
          // Navigate back to menu
          navigate('/');
        } catch (error) {
          console.error('Error cancelling order:', error);
          showError('Failed to cancel order. Please try again.');
        }
      }
    );
  };

  const totalTime = 20 * 60;
  const progress = timeLeft / totalTime;

  // Status steps for timeline
  const getStatusStep = () => {
    switch (order?.status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'ready': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const statusSteps = [
    { label: 'Order Placed', icon: ShoppingBag, description: 'Order received' },
    { label: 'Preparing', icon: ChefHat, description: 'Kitchen is cooking' },
    { label: 'Ready', icon: Bell, description: 'Ready for pickup' },
    { label: 'Completed', icon: CheckCircle, description: 'Enjoy your meal!' },
  ];

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  if (ordersLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-brand-offWhite via-white to-brand-cream">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-28 h-28 bg-gradient-to-br from-brand-maroon to-brand-burgundy rounded-full flex items-center justify-center mb-6 shadow-2xl"
        >
          <Loader2 size={48} className="text-white animate-spin" />
        </motion.div>
        <h2 className="text-2xl font-bold text-brand-maroon mb-2 font-serif">Loading your order</h2>
        <p className="text-gray-500">Fetching your latest order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-brand-offWhite via-white to-brand-cream">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-28 h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6 shadow-xl"
        >
          <ShoppingBag size={48} className="text-gray-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-brand-maroon mb-2 font-serif">No Active Orders</h2>
        <p className="text-gray-500 mb-8">You haven't placed any orders yet.</p>
        <Link to="/" className="bg-gradient-to-r from-brand-maroon to-brand-burgundy text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105">
          Browse Menu
        </Link>
      </div>
    );
  }

  const currentStep = getStatusStep();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-offWhite via-white to-brand-cream/50 pb-24">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-brand-maroon via-brand-burgundy to-brand-maroon pt-8 pb-20 px-4 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-brand-yellow rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-serif mb-2 drop-shadow-lg">Track Your Order</h1>
          <p className="text-white/80 text-sm sm:text-lg">
            {order.status === 'pending' ? '⏳ Waiting for confirmation...' :
              order.status === 'ready' ? '🎉 Your order is ready!' :
                order.status === 'completed' ? '✅ Order completed' :
                  order.status === 'cancelled' ? '❌ Order cancelled' :
                    '👨‍🍳 Your meal is being prepared'}
          </p>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-12 relative z-10">

        {/* Status Timeline Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-brand-maroon font-serif">Order Status</h3>
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              #{order.id.slice(-6).toUpperCase()}
            </span>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="flex justify-between items-start">
              {statusSteps.map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={idx} className="flex flex-col items-center flex-1 relative">
                    {/* Connector line */}
                    {idx < statusSteps.length - 1 && (
                      <div
                        className={`absolute top-5 left-1/2 w-full h-1 transition-all duration-500 ${idx < currentStep ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gray-200'
                          }`}
                        style={{ zIndex: 0 }}
                      />
                    )}

                    {/* Icon circle */}
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1.1 : 1,
                        backgroundColor: isActive ? (idx === currentStep && order.status !== 'completed' ? '#7A0C0C' : '#22c55e') : '#e5e7eb'
                      }}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${isCurrent ? 'ring-4 ring-opacity-30 shadow-lg' : ''
                        } ${isCurrent && order.status !== 'completed' ? 'ring-brand-maroon/30' : 'ring-green-500/30'}`}
                    >
                      <StepIcon size={18} className={`${isActive ? 'text-white' : 'text-gray-400'}`} />
                    </motion.div>

                    {/* Label */}
                    <span className={`text-[10px] sm:text-xs font-bold mt-2 text-center transition-colors ${isActive ? 'text-brand-maroon' : 'text-gray-400'
                      }`}>
                      {step.label}
                    </span>
                    <span className={`text-[8px] sm:text-[10px] text-center hidden sm:block ${isActive ? 'text-gray-600' : 'text-gray-300'
                      }`}>
                      {step.description}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Timer Section - Cooking */}
        {order.status === 'confirmed' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 mb-6 border border-gray-100 relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-brand-yellow/10 to-transparent rounded-full blur-2xl"></div>

            <div className="relative flex flex-col items-center justify-center">
              {/* Animated rings */}
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center mb-6">
                {/* Outer pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 border-4 border-brand-maroon/20 rounded-full"
                />

                {/* Progress ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="50%" cy="50%" r="45%" stroke="#FFF3E8" strokeWidth="12" fill="none" />
                  <circle
                    cx="50%" cy="50%" r="45%"
                    stroke="url(#gradient)"
                    strokeWidth="12" fill="none"
                    strokeLinecap="round"
                    style={{
                      strokeDasharray: 100,
                      strokeDashoffset: 100 * (1 - progress),
                      transition: 'stroke-dashoffset 1s linear'
                    }}
                    pathLength="100"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7A0C0C" />
                      <stop offset="100%" stopColor="#B91C1C" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Timer content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Flame size={28} className="text-brand-yellow mb-2" />
                  </motion.div>
                  <span className="text-5xl sm:text-7xl font-bold text-brand-maroon font-serif tabular-nums tracking-tight">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-sm sm:text-base text-brand-maroon/60 font-medium mt-1 uppercase tracking-widest">
                    minutes left
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="px-8 py-3 bg-gradient-to-r from-brand-cream to-brand-yellow/30 rounded-full flex items-center gap-3 font-bold text-brand-maroon shadow-lg"
              >
                <ChefHat size={22} className="text-brand-maroon" />
                <span>Chef is cooking your order</span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Ready State - Celebration */}
        {order.status === 'ready' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-xl p-8 sm:p-10 mb-6 border-2 border-green-200 relative overflow-hidden"
          >
            {/* Celebration particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 100, opacity: [0, 1, 0] }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                  className="absolute text-2xl"
                  style={{ left: `${15 + i * 15}%` }}
                >
                  {['🎉', '✨', '🍽️', '⭐', '🎊', '🍕'][i]}
                </motion.div>
              ))}
            </div>

            <div className="relative flex flex-col items-center justify-center text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-2xl"
              >
                <Bell size={48} className="text-white" />
              </motion.div>

              <h2 className="text-3xl sm:text-4xl font-bold text-green-700 font-serif mb-2">Order Ready!</h2>
              <p className="text-green-600 text-lg mb-4">Please Wait for your order to be served</p>

              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-md">
                <MapPin size={20} className="text-green-600" />
                <span className="font-bold text-green-700">Table {order.tableNumber}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pending State */}
        {order.status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-10 mb-6 flex flex-col items-center justify-center text-center border border-gray-100"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 bg-gradient-to-br from-brand-yellow to-amber-400 rounded-full flex items-center justify-center mb-4 shadow-lg"
            >
              <Clock size={40} className="text-white" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-800 font-serif mb-2">Sending to Kitchen...</h3>
            <p className="text-gray-500 max-w-xs">Please wait while the restaurant confirms your order.</p>

            {/* Loading dots */}
            <div className="flex gap-1 mt-4">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                  className="w-2 h-2 bg-brand-maroon rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Cancelled State */}
        {order.status === 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl shadow-xl p-10 mb-6 flex flex-col items-center justify-center text-center border-2 border-red-200"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg"
            >
              <XCircle size={40} className="text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-red-700 font-serif mb-2">Order Cancelled</h3>
            <p className="text-red-600 max-w-md mb-4">
              This order was cancelled {order.cancelledBy === 'admin' ? 'by the restaurant' : 'by you'} on{' '}
              {order.cancelledAt && new Date(order.cancelledAt).toLocaleString('en-IN', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true 
              })}
            </p>
            <Link
              to="/"
              className="mt-4 bg-brand-maroon text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-burgundy transition-all shadow-lg"
            >
              Back to Menu
            </Link>
          </motion.div>
        )}

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-maroon font-serif mb-1">Order Summary</h2>
              <p className="text-gray-500 text-sm">
                {order.customerName && <span className="font-medium text-brand-maroon">{order.customerName}</span>}
                {order.customerName && ' • '}
                Table {order.tableNumber}
              </p>
            </div>
            <div className="flex items-center gap-2 text-brand-maroon font-bold bg-gradient-to-r from-brand-cream to-brand-yellow/20 px-4 py-2 rounded-xl text-sm shadow-sm">
              <UtensilsCrossed size={16} />
              <span>{order.items.length} Items</span>
            </div>
          </div>

          {/* Items list */}
          <div className="space-y-4 mb-6">
            {order.items.map((item: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex justify-between items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-cream rounded-lg flex items-center justify-center font-bold text-brand-maroon">
                    {item.quantity}x
                  </div>
                  <div>
                    <span className="text-gray-800 font-medium block">{item.name}</span>
                    <span className="text-xs text-gray-400">{item.category}</span>
                  </div>
                </div>
                <span className="font-bold text-brand-maroon">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t-2 border-dashed border-gray-200 pt-4 mb-6">
            <div className="flex justify-between text-xl sm:text-2xl font-bold text-brand-maroon font-serif">
              <span>Total</span>
              <span className="text-2xl sm:text-3xl">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* User Cancel Button - Only show if order is not completed or already cancelled */}
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <button
                onClick={handleCancelOrder}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-300 hover:border-red-400 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <XCircle size={20} />
                Cancel Order
              </button>
            </motion.div>
          )}

          {/* Payment Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-2xl">💳</span>
            </div>
            <div>
              <h4 className="font-bold text-amber-800 mb-1 text-lg sm:text-base">Payment at Counter</h4>
              <p className="text-amber-700 text-base sm:text-sm leading-relaxed">
                Pay at the counter after you finish your meal. We accept <span className="font-semibold">Cash</span>, <span className="font-semibold">UPI</span>, and <span className="font-semibold">Cards</span>.
              </p>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
};
