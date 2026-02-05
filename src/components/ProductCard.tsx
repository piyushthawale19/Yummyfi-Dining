import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { formatPrice, cn } from '../utils/helpers';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useApp();
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product);
    setTimeout(() => setIsAdding(false), 600);
  };

  const discount = product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full border border-transparent hover:border-brand-goldGlow/30"
    >
      <div className="relative h-36 sm:h-56 overflow-hidden p-2 sm:p-3 pb-0">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 shadow-inner"
        />

        {/* Veg/Non-Veg Indicator */}
        <div className="absolute top-3 left-3 sm:top-5 sm:left-5 bg-white p-[2px] rounded-md shadow-sm z-10">
          <div className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 border-2 flex items-center justify-center rounded-[4px]",
            product.isVeg ? "border-green-600" : "border-red-600"
          )}>
            <div className={cn(
              "w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full",
              product.isVeg ? "bg-green-600" : "bg-red-600"
            )} />
          </div>
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 sm:top-5 sm:right-5 bg-brand-yellow text-brand-maroon text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-md z-10">
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
          <div className="flex items-center gap-3">
            {product.offerPrice ? (
              <>
                <span className="text-2xl font-bold text-brand-maroon">{formatPrice(product.offerPrice)}</span>
                <span className="text-sm text-gray-400 line-through decoration-gray-400 decoration-2">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-lg sm:text-2xl font-bold text-brand-maroon">{formatPrice(product.price)}</span>
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
