import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';

export const UserMenu = () => {
  const { products } = useApp();

  return (
    <div className="min-h-screen pb-24 bg-brand-offWhite">
      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-20">
             <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔍</div>
             <h3 className="text-xl font-bold text-gray-600">No dishes found</h3>
             <p className="text-gray-400">Try searching for something else</p>
          </div>
        )}
      </div>
    </div>
  );
};
