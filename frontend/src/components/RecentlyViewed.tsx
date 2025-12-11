import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { Product } from '../types';

const RecentlyViewed = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const recentlyViewedIds = JSON.parse(
          localStorage.getItem('recentlyViewed') || '[]'
        ) as string[];

        if (recentlyViewedIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch products for recently viewed IDs
        const productPromises = recentlyViewedIds.map((id) =>
          client.get<Product>(`/products/${id}`).catch(() => null)
        );

        const results = await Promise.all(productPromises);
        const validProducts = results
          .filter((result) => result !== null && result.data)
          .map((result) => result!.data)
          .slice(0, 5); // Show top 5

        setProducts(validProducts);
      } catch (error) {
        console.error('Error fetching recently viewed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, []);

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <Link
            key={product._id}
            to={`/products/${product._id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square bg-gray-200">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No Image
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm mb-1 truncate">{product.title}</h3>
              <p className="text-lg font-bold text-gray-900">${product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;

