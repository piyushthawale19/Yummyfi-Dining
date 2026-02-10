import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import { Minus, Plus, Trash2, ArrowLeft, CheckCircle, ShoppingCart, MapPin, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, placeOrder, tableNumber, setTableInfo } = useApp();
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showTableModal, setShowTableModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Local state for the modal inputs
  const [tempTable, setTempTable] = useState(tableNumber || '');
  const [orderLoading, setOrderLoading] = useState(false);



  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrderClick = () => {
    // Always show modal to confirm details before placing order
    setTempTable(tableNumber || '');
    setShowTableModal(true);
  };

  // Helper function to extract a clean name from email
  //  e.g., "piyushthawale19@gmail.com" -> "Piyush Thawale"
  const getNameFromEmail = (email: string): string => {
    // Get the part before @
    const localPart = email.split('@')[0];
    // Remove numbers
    const withoutNumbers = localPart.replace(/\d/g, '');
    // Split by common separators (., _, -)
    const parts = withoutNumbers.split(/[._-]/);
    // Capitalize each part
    const capitalizedParts = parts
      .filter(p => p.length > 0)
      .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
    return capitalizedParts.join(' ') || 'Customer';
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempTable.trim() && user) {
      setOrderLoading(true);
      try {
        // Get customer name - Priority:
        // 1. Google displayName (e.g., "Piyush Thawale" from Google account)
        // 2. Fallback: Extract from email if displayName not available
        let finalName = 'Guest';
        if (user.displayName) {
          finalName = user.displayName;
        } else if (user.email) {
          finalName = getNameFromEmail(user.email);
        }

        setTableInfo(tempTable, finalName);

        // Pass the table number, name, and email DIRECTLY to placeOrder
        const orderId = await placeOrder(tempTable, finalName, user.email || undefined);
        if (orderId) {
          navigate('/track-order');
        }
      } finally {
        setOrderLoading(false);
      }
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setAuthError('');
      setAuthLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setAuthError('Failed to sign in with Google. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-brand-cream rounded-full flex items-center justify-center mb-6">
          <ShoppingCart size={40} className="text-brand-maroon/40" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/" className="bg-brand-maroon text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-burgundy transition-colors">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-brand-maroon">Your Order</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        {cart.map((item) => (
          <div key={item.id} className="p-3 sm:p-4 border-b border-gray-100 last:border-0 flex gap-3 sm:gap-4">
            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg bg-gray-100" />

            <div className="flex-grow flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800 font-serif text-sm sm:text-base">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{item.category}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>

              <div className="flex justify-between items-end">
                <div className="font-bold text-brand-maroon text-sm sm:text-base">
                  {formatPrice(item.price * item.quantity)}
                </div>

                <div className="flex items-center gap-3 bg-brand-offWhite rounded-lg p-1">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-brand-maroon hover:bg-gray-50"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-brand-maroon hover:bg-gray-50"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Details */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-24">
        <h3 className="font-bold text-gray-800 mb-4">Bill Details</h3>
        <div className="space-y-2 text-sm">
          <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between font-bold text-lg text-brand-maroon">
            <span>Total Amount</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Total Amount</span>
            <span className="text-xl font-bold text-brand-maroon">{formatPrice(totalAmount)}</span>
          </div>
          <button
            onClick={handlePlaceOrderClick}
            className="flex-grow bg-brand-yellow text-brand-maroon font-bold py-3 px-6 rounded-xl hover:bg-brand-mustard transition-colors flex items-center justify-center gap-2"
          >
            Place Order <CheckCircle size={20} />
          </button>
        </div>
      </div>

      {/* TABLE NUMBER MODAL */}
      {showTableModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowTableModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-brand-maroon" />
            </div>

            <h2 className="text-2xl font-bold text-brand-maroon mb-2 font-serif text-center">Final Step</h2>
            <p className="text-gray-500 mb-6 text-center">Sign in with Google and confirm your table details</p>

            {/* Auth section */}
            {!user && (
              <div className="mb-6 space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={authLoading}
                  className="w-full bg-white border border-gray-200 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-50 disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
                >
                  {authLoading ? 'Connecting to Google…' : 'Continue with Google to place order'}
                </button>
                {authError && (
                  <p className="text-xs text-red-500 text-center">{authError}</p>
                )}
              </div>
            )}
            {user && (
              <p className="mb-4 text-xs text-center text-green-700 font-medium">
                Signed in as {user.email}
              </p>
            )}



            <form onSubmit={handleConfirmOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Table Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-bold">#</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 5"
                    className="w-full pl-10 pr-4 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-brand-maroon outline-none py-3 bg-gray-50 placeholder:text-gray-400"
                    value={tempTable}
                    onChange={(e) => setTempTable(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!tempTable || !user || orderLoading}
                className="w-full bg-brand-maroon text-white font-bold py-3.5 rounded-xl hover:bg-brand-burgundy disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-maroon/20 mt-4 flex items-center justify-center gap-2"
              >
                {orderLoading ? (
                  <><span className="animate-pulse">Sending...</span></>
                ) : user ? (
                  <>Confirm & Place Order <CheckCircle size={20} /></>
                ) : (
                  'Sign in to place order'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
