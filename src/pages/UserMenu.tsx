import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';

export const UserMenu = () => {
  const { products, productsLoading } = useApp();

  // Removed debug logging to avoid spamming production logs

  return (
    <div className="min-h-screen pb-24 bg-brand-offWhite">
      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-8">
        {productsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl shadow-sm animate-pulse h-48 sm:h-64"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🍽️</div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">No products available</h3>
                <p className="text-gray-500 mb-4">Products haven't been added yet.</p>
                <p className="text-sm text-gray-400">
                  Admin can add products from the <a href="/admin" className="text-brand-maroon underline">Admin Dashboard</a>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
