import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, UtensilsCrossed, ChefHat, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { cart, tableNumber } = useApp();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [cartBounce, setCartBounce] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prevCartLength = React.useRef(cart.length);

  useEffect(() => {
    if (cart.length > prevCartLength.current) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 500);
    }
    prevCartLength.current = cart.length;
  }, [cart.length]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Don't show the main navbar on Admin Dashboard as it has its own sidebar
  if (isAdmin && location.pathname.includes('dashboard')) return null;

  return (
    <>
      <nav className={cn(
        "sticky top-0 z-50 shadow-sm px-4 sm:px-6 py-4 transition-colors bg-brand-cream"
      )}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo Section */}
          <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-3 group">
            <img
              src="/542169443-ff628a00-4675-44b8-9fb4-6c3b6630590b.png"
              alt="Yummy-Fi Logo"
              className="w-12 h-12 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300 rounded-full"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold leading-none text-brand-maroon font-serif">Yummy-Fi</h1>
              <p className="text-[10px] sm:text-xs text-brand-maroon/70 font-sans font-medium tracking-wide">
                {isAdmin ? 'Admin Panel' : 'Restaurant System'}
              </p>
            </div>
          </Link>

          {/* Center Navigation (Desktop Only) */}
          {!isAdmin && (
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-brand-maroon font-bold hover:text-brand-burgundy transition-colors">Menu</Link>
              <Link to="/track-order" className="text-gray-600 font-medium hover:text-brand-maroon transition-colors">Track Order</Link>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            {!isAdmin && tableNumber && (
              <span className="hidden lg:block text-sm font-bold text-brand-maroon bg-white px-4 py-1.5 rounded-full shadow-sm border border-brand-maroon/10">
                Table {tableNumber}
              </span>
            )}

            {/* Desktop Cart */}
            {!isAdmin && (
              <Link to="/cart" className="relative p-2 text-gray-800 hover:text-brand-maroon transition-colors hidden md:block">
                <motion.div
                  animate={cartBounce ? {
                    scale: [1, 1.3, 0.9, 1.1, 1],
                    rotate: [0, -10, 10, -5, 0]
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <ShoppingCart size={26} strokeWidth={2} />
                </motion.div>
                {cart.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-brand-maroon text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-brand-cream"
                  >
                    {cart.length}
                  </motion.span>
                )}
              </Link>
            )}

            {/* Mobile Cart & Menu Toggle */}
            {!isAdmin && (
              <div className="flex items-center gap-4 md:hidden">
                <Link to="/cart" className="relative text-gray-800">
                  <ShoppingCart size={24} strokeWidth={2} />
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-maroon text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                      {cart.length}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="text-gray-800 hover:text-brand-maroon"
                >
                  <Menu size={28} />
                </button>
              </div>
            )}

            {isAdmin && (
              <Link to="/" className="text-sm font-medium text-gray-500 hover:text-brand-maroon">Exit Admin</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-white md:hidden flex flex-col"
          >
            {/* Mobile Menu Header */}
            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 shadow-sm bg-white">
              <div className="flex items-center gap-3">
                <img
                  src="/542169443-ff628a00-4675-44b8-9fb4-6c3b6630590b.png"
                  alt="Yummy-Fi Logo"
                  className="w-10 h-10 object-contain rounded-full"
                />
                <span className="text-xl font-bold text-brand-maroon font-serif leading-none">Yummy-Fi</span>
              </div>

              <div className="flex items-center gap-4">
                <Link to="/cart" className="relative text-gray-800" onClick={() => setIsMobileMenuOpen(false)}>
                  <ShoppingCart size={24} strokeWidth={2} />
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-maroon text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                      {cart.length}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full border-2 border-brand-yellow flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Mobile Menu Links */}
            <div className="p-8 flex flex-col gap-6">
              <Link
                to="/"
                className="text-lg font-bold text-gray-800 hover:text-brand-maroon transition-colors py-2 border-b border-gray-50 flex justify-between items-center"
              >
                Menu
              </Link>
              <Link
                to="/track-order"
                className="text-lg font-bold text-gray-800 hover:text-brand-maroon transition-colors py-2 border-b border-gray-50 flex justify-between items-center"
              >
                Track Order
              </Link>
            </div>

            <div className="mt-auto p-8 bg-brand-offWhite">
              <p className="text-center text-xs text-gray-400 font-medium">
                Yummy-Fi Restaurant System
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
