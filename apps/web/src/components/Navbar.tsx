import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { cart, tableNumber } = useApp();
  const { user, isAdmin, signOut } = useAuth();
  const { showConfirm, showError } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [cartBounce, setCartBounce] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const prevCartLength = React.useRef(cart.length);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  // Handle sign out
  const handleSignOut = async () => {
    const isAdminSession = localStorage.getItem('isAdminSession') === 'true';
    const confirmMessage = isAdminSession
      ? 'Are you sure you want to sign out from admin session?'
      : 'Are you sure you want to sign out? Your cart will be cleared.';

    showConfirm(
      confirmMessage,
      async () => {
        try {
          await signOut(false); // Sign out completely (not admin-only)
          setIsUserMenuOpen(false);

          // If was admin session, redirect to admin login
          if (isAdminSession) {
            navigate('/admin');
          } else {
            // Regular user, just refresh the page
            window.location.reload();
          }
        } catch (error) {
          console.error('Sign-out failed:', error);
          showError('Sign-out failed. Please try again.');
        }
      },
      undefined,
      'Sign Out',
      'Cancel',
      '🚪 Sign Out Confirmation'
    );
  };

  // Don't show the main navbar on Admin Dashboard as it has its own sidebar
  if (isAdminRoute && location.pathname.includes('dashboard')) return null;

  return (
    <>
      <nav className={cn(
        "sticky top-0 z-50 shadow-sm px-4 sm:px-6 py-4 transition-colors bg-brand-yellow"
      )}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo Section */}
          <Link to={isAdminRoute ? "/admin" : "/"} className="flex items-center gap-3 group">
            <img
              src="/542169443-ff628a00-4675-44b8-9fb4-6c3b6630590b.png"
              alt="Yummy-Fi Logo"
              className="w-12 h-12 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300 rounded-full"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold leading-none text-brand-maroon font-serif">Yummy-Fi</h1>
              <p className="text-[10px] sm:text-xs text-brand-maroon/70 font-sans font-medium tracking-wide">
                {isAdminRoute ? 'Admin Panel' : 'Restaurant System'}
              </p>
            </div>
          </Link>

          {/* Center Navigation (Tablet & Desktop) */}
          {!isAdminRoute && (
            <div className="hidden sm:flex items-center gap-8">
              <Link to="/" className="text-brand-maroon font-bold hover:text-brand-burgundy transition-colors">Menu</Link>
              <Link to="/track-order" className="text-gray-600 font-medium hover:text-brand-maroon transition-colors">Track Order</Link>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            {!isAdminRoute && tableNumber && location.pathname !== '/' && (
              <span className="hidden lg:block text-sm font-bold text-brand-maroon bg-white px-4 py-1.5 rounded-full shadow-sm border border-brand-maroon/10">
                Table {tableNumber}
              </span>
            )}

            {/* Tablet & Desktop Cart */}
            {!isAdminRoute && (
              <Link to="/cart" className="relative p-2 text-gray-800 hover:text-brand-maroon transition-colors hidden sm:block">
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

            {/* Mobile Only - Hamburger Menu */}
            {!isAdminRoute && (
              <div className="flex items-center gap-4 sm:hidden">
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



            {/* User Profile Dropdown (Tablet & Desktop) */}
            {!isAdminRoute && user && (
              <div ref={userMenuRef} className="relative hidden sm:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-brand-maroon/20"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-maroon text-white flex items-center justify-center text-sm font-bold">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-black leading-none">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-[10px] text-black leading-none mt-0.5">
                      {isAdmin ? 'Admin' : 'Customer'}
                    </p>
                  </div>
                  <ChevronDown size={16} className={cn(
                    "text-black transition-transform",
                    isUserMenuOpen && "rotate-180"
                  )} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      {/* User Info */}
                      <div className="p-4 bg-brand-cream border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-maroon text-white flex items-center justify-center text-sm font-bold">
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-700 truncate">
                              {user.displayName || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="mt-2 px-2 py-1 bg-brand-maroon/10 rounded text-xs font-bold text-brand-maroon text-center">
                            Admin Account
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <LogOut size={18} />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
              {/* User Profile in Mobile Menu */}
              {user && (
                <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-brand-maroon text-white flex items-center justify-center text-lg font-bold">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-700 truncate">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-brand-maroon/10 rounded text-[10px] font-bold text-brand-maroon">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium text-sm"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

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
