import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import RecentlyViewed from '../components/RecentlyViewed';
import FavoriteButton from '../components/FavoriteButton';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState('');

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
            <div className="border-t pt-4 mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Seller:{' '}
                <Link
                  to={`/seller/${product.seller._id}`}
                  className="font-medium text-gray-900 hover:text-gray-700 underline"
                >
                  {product.seller.name}
                </Link>
              </p>
              
              {user && user._id !== product.seller._id && product.status === 'approved' && (
                <div>
                  {!showOfferForm ? (
                    <button
                      onClick={() => setShowOfferForm(true)}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Make Offer
                    </button>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Make an Offer</h3>
                      {offerError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
                          {offerError}
                        </div>
                      )}
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Offer Amount ($)
                        </label>
                        <input
                          type="number"
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                          placeholder={`Max: $${product.price}`}
                          min="0"
                          max={product.price}
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message (optional)
                        </label>
                        <textarea
                          value={offerMessage}
                          onChange={(e) => setOfferMessage(e.target.value)}
                          placeholder="Add a message to your offer..."
                          rows={3}
                          maxLength={500}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            setOfferError('');
                            if (!offerAmount || parseFloat(offerAmount) <= 0) {
                              setOfferError('Please enter a valid offer amount');
                              return;
                            }
                            if (parseFloat(offerAmount) > product.price) {
                              setOfferError(`Offer cannot exceed $${product.price}`);
                              return;
                            }
                            
                            setOfferLoading(true);
                            try {
                              await client.post('/offers', {
                                productId: product._id,
                                amount: offerAmount,
                                message: offerMessage,
                              });
                              setShowOfferForm(false);
                              setOfferAmount('');
                              setOfferMessage('');
                              alert('Offer submitted successfully!');
                            } catch (err: any) {
                              setOfferError(err.response?.data?.message || 'Failed to submit offer');
                            } finally {
                              setOfferLoading(false);
                            }
                          }}
                          disabled={offerLoading}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {offerLoading ? 'Submitting...' : 'Submit Offer'}
                        </button>
                        <button
                          onClick={() => {
                            setShowOfferForm(false);
                            setOfferAmount('');
                            setOfferMessage('');
                            setOfferError('');
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <RecentlyViewed />
    </div>
  );
};

export default ProductDetailPage;

