import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { Product } from '../types';
import RecentlyViewed from '../components/RecentlyViewed';
import FavoriteButton from '../components/FavoriteButton';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await client.get<Product>(`/products/${id}`);
        setProduct(response.data);

        // Increment view count
        try {
          await client.post(`/products/${id}/view`);
        } catch (viewErr) {
          console.error('Failed to increment view count:', viewErr);
        }

        // Add to recently viewed in localStorage
        if (id) {
          const recentlyViewed = JSON.parse(
            localStorage.getItem('recentlyViewed') || '[]'
          ) as string[];
          const updated = [id, ...recentlyViewed.filter((itemId) => itemId !== id)].slice(0, 10);
          localStorage.setItem('recentlyViewed', JSON.stringify(updated));
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-600">{error || 'Product not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div>
            {product.images && product.images.length > 0 ? (
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <FavoriteButton productId={product._id} size="lg" />
            </div>
            <p className="text-xl text-gray-600 mb-4">{product.brand}</p>
            <p className="text-4xl font-bold mb-6">${product.price}</p>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>
            <div className="mb-6 flex items-center gap-4">
              <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {product.category}
              </span>
              {product.views !== undefined && (
                <span className="text-sm text-gray-600">
                  👁️ {product.views} views
                </span>
              )}
              {product.badges && product.badges.length > 0 && (
                <div className="flex gap-2">
                  {product.badges.map((badge) => (
                    <span
                      key={badge}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">
                Seller:{' '}
                <Link
                  to={`/seller/${product.seller._id}`}
                  className="font-medium text-gray-900 hover:text-gray-700 underline"
                >
                  {product.seller.name}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <RecentlyViewed />
    </div>
  );
};

export default ProductDetailPage;

