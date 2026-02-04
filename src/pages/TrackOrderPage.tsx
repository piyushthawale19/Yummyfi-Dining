import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/helpers';
import { CheckCircle, Flame, MapPin, ShoppingBag, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const TrackOrderPage = () => {
  const { orders } = useApp();
  const [order, setOrder] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds

  useEffect(() => {
    const lastOrderId = localStorage.getItem('lastOrderId');
    if (lastOrderId) {
      const foundOrder = orders.find(o => o.id === lastOrderId);
      if (foundOrder) {
        setOrder(foundOrder);

        // ONLY calculate time if order is confirmed
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
      }
    }
  }, [orders]);

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

  // Circular Progress Calculation
  const totalTime = 20 * 60;
  const progress = timeLeft / totalTime;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  if (!order) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center bg-brand-offWhite">
        <div className="w-24 h-24 bg-brand-cream rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-brand-maroon/40" />
        </div>
        <h2 className="text-2xl font-bold text-brand-maroon mb-2 font-serif">No Active Orders</h2>
        <p className="text-gray-500 mb-8">You haven't placed any orders yet.</p>
        <Link to="/" className="bg-brand-maroon text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-burgundy transition-colors">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-offWhite pb-20">
      {/* Header Section */}
      <div className="bg-brand-cream pt-6 pb-12 px-4 text-center sm:pt-8 sm:pb-16">
        <h1 className="text-2xl sm:text-4xl font-bold text-brand-maroon font-serif mb-2">Track Your Order</h1>
        <p className="text-brand-maroon/70 text-sm sm:text-lg">
          {order.status === 'pending' ? 'Waiting for confirmation...' :
            order.status === 'ready' ? 'Your order is ready to pick up!' :
              order.status === 'completed' ? 'Order delivered successfully' :
                'Your delicious meal is being prepared'}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 sm:-mt-10">

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-2 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-sm mb-6 sm:mb-8 text-center sm:text-left ${order.status === 'pending'
            ? 'bg-white border-brand-yellow'
            : order.status === 'completed'
              ? 'bg-white border-green-600'
              : 'bg-white border-brand-maroon'
            }`}
        >
          <div className={`w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 mx-auto sm:mx-0 ${order.status === 'pending' ? 'bg-brand-yellow' :
            order.status === 'ready' ? 'bg-green-600' :
              order.status === 'completed' ? 'bg-gray-500' : 'bg-brand-maroon'
            }`}>
            {order.status === 'pending' ? <Clock size={20} strokeWidth={3} /> :
              order.status === 'ready' ? <CheckCircle size={20} strokeWidth={3} /> :
                <CheckCircle size={20} strokeWidth={3} />}
          </div>
          <div>
            <h3 className={`text-lg sm:text-xl font-bold font-serif mb-1 ${order.status === 'pending' ? 'text-brand-mustard' :
              order.status === 'ready' ? 'text-green-700' :
                order.status === 'completed' ? 'text-gray-600' : 'text-brand-maroon'
              }`}>
              {order.status === 'pending' ? 'Order Placed' :
                order.status === 'ready' ? 'Order Ready!' :
                  order.status === 'completed' ? 'Order Completed' : 'Order Confirmed'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
              {order.status === 'pending' ? 'Waiting for restaurant to confirm...' :
                order.status === 'ready' ? 'Done! Your Order is Ready ✅' :
                  order.status === 'completed' ? 'Enjoy your meal!' : 'Kitchen is preparing your food'}
            </p>
          </div>
        </motion.div>

        {/* Timer Section - IF CONFIRMED OR READY */}
        {(order.status === 'confirmed' || order.status === 'ready') && (
          <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 mb-6 sm:mb-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center mb-6">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="46%" stroke="#FFF8F3" strokeWidth="10%" fill="none" />
                {/* Progress Circle - Green if Ready */}
                <circle
                  cx="50%" cy="50%" r="46%"
                  stroke={order.status === 'ready' ? "#16a34a" : "#7A0C0C"}
                  strokeWidth="10%" fill="none"
                  strokeDasharray={2 * Math.PI * 80 * (window.innerWidth < 640 ? 0.7 : 1)} // Approximate fix for viewing purpose, logic handled by relative sizes
                  strokeDashoffset={strokeDashoffset * (window.innerWidth < 640 ? 0.7 : 1)} // simplified for responsive SVG
                  pathLength="100"
                  className="transition-all duration-1000 ease-linear"
                  style={{
                    strokeDasharray: 100,
                    strokeDashoffset: 100 * (1 - progress)
                  }}
                />
              </svg>

              {/* Timer Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl sm:text-6xl font-bold ${order.status === 'ready' ? 'text-green-600' : 'text-brand-maroon'} font-serif tabular-nums tracking-tight`}>
                  {formatTime(timeLeft)}
                </span>
                <span className={`text-xs sm:text-base ${order.status === 'ready' ? 'text-green-600/60' : 'text-brand-maroon/60'} font-medium mt-1 uppercase tracking-wider`}>
                  Remaining
                </span>
              </div>
            </div>

            <div className={`px-6 py-3 rounded-full flex items-center gap-2 font-bold shadow-sm ${order.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-brand-cream text-brand-maroon'
              }`}>
              {order.status === 'ready' ? (
                <>
                  <CheckCircle size={20} fill="currentColor" className="text-green-500" />
                  <span>Order is Ready!</span>
                </>
              ) : (
                <>
                  <Flame size={20} fill="currentColor" className="text-brand-yellow" />
                  <span>Cooking in progress</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Pending State UI */}
        {order.status === 'pending' && (
          <div className="bg-white rounded-3xl shadow-sm p-10 mb-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-brand-yellow/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Loader2 size={40} className="text-brand-mustard animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 font-serif mb-2">Sending to Kitchen...</h3>
            <p className="text-gray-500 max-w-xs">Please wait while the restaurant confirms your order details.</p>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-3xl shadow-sm p-5 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 border-b border-gray-100 pb-4 sm:pb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-maroon font-serif mb-1">Order Details</h2>
              <p className="text-brand-maroon/60 font-mono text-xs sm:text-sm">Order ID: #{order.id.slice(-6).toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-2 text-brand-maroon font-bold bg-brand-cream px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base">
              <MapPin size={16} />
              <span>Table {order.tableNumber}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-base sm:text-lg font-bold text-brand-maroon font-serif mb-3 sm:mb-4">Items Ordered</h3>
            <div className="space-y-4 sm:space-y-6">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="text-brand-maroon font-bold text-base sm:text-lg whitespace-nowrap">{item.quantity}x</span>
                    <span className="text-gray-800 font-medium text-sm sm:text-lg leading-tight">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 text-sm sm:text-lg whitespace-nowrap">
                    {formatPrice((item.offerPrice || item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 sm:pt-6">
            <div className="flex justify-between text-xl sm:text-2xl font-bold text-brand-maroon font-serif">
              <span>Total Amount</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
