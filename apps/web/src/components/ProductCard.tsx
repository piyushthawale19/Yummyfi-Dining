import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, cn } from '../utils/helpers';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useApp();
  const { user, signInWithGoogle } = useAuth();
  const { showConfirm, showError } = useToast();
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!user) {
      showConfirm(
        'Please sign in with your Google account to add items to cart. This helps us track your delivery later.',
        async () => {
          try {
            // Pass forAdmin=false to indicate this is a regular user login
            await signInWithGoogle(false);
            // After successful sign-in, add to cart
            setIsAdding(true);
            addToCart(product);
            setTimeout(() => setIsAdding(false), 600);
          } catch (error) {
            console.error('Sign-in failed:', error);
            showError('Sign-in failed. Please try again.');
          }
        },
        undefined,
        'Sign In',
        'Cancel',
        '🔐 Authentication Required'
      );
      return;
    }

    // User is already authenticated, proceed with adding to cart
    setIsAdding(true);
    addToCart(product);
    setTimeout(() => setIsAdding(false), 600);
  };

  // Logic based on User Audio:
  // product.price = Selling Price (e.g. 10)
  // product.offerPrice = Discount Amount (e.g. 2)
  // Original Price = Selling + Discount (10 + 2 = 12)
  const sellingPrice = product.price;
  const discountAmount = product.offerPrice || 0;
  const originalPrice = sellingPrice + discountAmount;

  const discount = discountAmount > 0
    ? Math.round((discountAmount / originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full border border-transparent hover:border-brand-goldGlow/30"
    >
      <div className="relative h-44 sm:h-48 md:h-56 overflow-hidden p-2 sm:p-3 pb-0">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 shadow-inner"
          style={{ objectPosition: `center ${product.imageFocus || 50}%` }}
        />

        {/* Veg/Non-Veg Indicator */}
        <div className={cn(
          "absolute top-3 sm:top-4 left-3 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 border-2 flex items-center justify-center z-10 rounded-sm  bg-white shadow-sm",
          product.isVeg ? "border-green-600" : "border-red-600"
        )}>
          <div className={cn(
            "w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full",
            product.isVeg ? "bg-green-600" : "bg-red-600"
          )} />
        </div>

        {/* Discount Badge - Only if offer exists */}
        {/* Discount Badge - Only if offer exists */}
        {discount > 0 && (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-brand-yellow text-brand-maroon text-[9px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-md z-10">
            {discount}% OFF
          </div>
        )}

        {/* Category Tag (Optional visual enhancement based on Image 2 style) */}
        <div className="absolute bottom-2 left-6 bg-black/30 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {product.category}
        </div>
      </div>

      <div className="p-3 sm:p-5 pt-2 sm:pt-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-sm sm:text-xl font-bold text-brand-maroon font-serif mb-1 sm:mb-2 leading-tight line-clamp-2">{product.name}</h3>
        </div>

        <div className="mt-2 sm:mt-4 space-y-2 sm:space-y-4">
          <div className="flex items-center gap-2">
            {discountAmount > 0 ? (
              <>
                <span className="text-lg sm:text-2xl font-bold text-brand-maroon">{formatPrice(sellingPrice)}</span>
                <span className="text-xs sm:text-sm text-gray-400 line-through decoration-gray-400">{formatPrice(originalPrice)}</span>
              </>
            ) : (
              <span className="text-lg sm:text-2xl font-bold text-brand-maroon">{formatPrice(sellingPrice)}</span>
            )}
          </div>

          <motion.button
            onClick={handleAddToCart}
            disabled={isAdding}
            animate={isAdding ? { scale: [1, 0.95, 1.05, 1] } : {}}
            transition={{ duration: 0.4 }}
            className={cn(
              "w-full bg-brand-yellow hover:bg-brand-mustard text-brand-maroon font-bold py-2 sm:py-3.5 rounded-xl flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base transition-all active:scale-[0.98] shadow-sm hover:shadow-md",
              isAdding && "bg-green-500 text-white"
            )}
          >
            <motion.div
              animate={isAdding ? { rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              <ShoppingCart size={18} strokeWidth={2.5} />
            </motion.div>
            {isAdding ? 'Added!' : 'Add to Cart'}
          </motion.button>
        </div>
      </div>
    </motion.div >
  );
};
