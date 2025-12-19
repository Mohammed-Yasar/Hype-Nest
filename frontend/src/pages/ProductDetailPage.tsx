import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
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
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: product.category, to: `/?category=${product.category}` }, { label: product.brand, to: `/?brand=${product.brand}` }, { label: product.title }]} />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              {product.images && product.images.length > 0 ? (
                <div className="w-full bg-gray-100 rounded overflow-hidden">
                  <img src={product.images[0]} alt={product.title} className="w-full object-contain" />
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold">{product.title}</h1>
                  <p className="text-sm text-gray-600">{product.brand}</p>
                </div>
                <FavoriteButton productId={product._id} size="lg" />
              </div>

              <p className="text-3xl font-bold mb-4">${product.price}</p>

              <ProductTabs product={product} user={user} onOffer={{ show: showOfferForm, setShow: setShowOfferForm, amount: offerAmount, setAmount: setOfferAmount, message: offerMessage, setMessage: setOfferMessage, loading: offerLoading, setLoading: setOfferLoading, error: offerError, setError: setOfferError }} />
            </div>
          </div>
        </div>
      </div>

      <RecentlyViewed />
    </div>
  );
};

const ProductTabs: React.FC<{ product: any; user: any; onOffer: any }> = ({ product, user, onOffer }) => {
  const [tab, setTab] = useState<'overview' | 'details' | 'seller' | 'activity'>('overview');

  const { show, setShow, amount, setAmount, message, setMessage, loading, setLoading, error, setError } = onOffer;

  const handleSubmitOffer = async () => {
    setError('');
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid offer amount');
      return;
    }
    if (parseFloat(amount) > product.price) {
      setError(`Offer cannot exceed $${product.price}`);
      return;
    }
    setLoading(true);
    try {
      await client.post('/offers', {
        productId: product._id,
        amount,
        message,
      });
      setShow(false);
      setAmount('');
      setMessage('');
      alert('Offer submitted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-6">
          <button onClick={() => setTab('overview')} className={`py-2 ${tab === 'overview' ? 'border-b-2 border-black font-semibold' : 'text-gray-600'}`}>Overview</button>
          <button onClick={() => setTab('details')} className={`py-2 ${tab === 'details' ? 'border-b-2 border-black font-semibold' : 'text-gray-600'}`}>Details</button>
          <button onClick={() => setTab('seller')} className={`py-2 ${tab === 'seller' ? 'border-b-2 border-black font-semibold' : 'text-gray-600'}`}>Seller</button>
          <button onClick={() => setTab('activity')} className={`py-2 ${tab === 'activity' ? 'border-b-2 border-black font-semibold' : 'text-gray-600'}`}>Activity</button>
        </nav>
      </div>

      <div>
        {tab === 'overview' && (
          <div className="text-sm text-gray-700">
            <p className="mb-3">{product.description}</p>
          </div>
        )}

        {tab === 'details' && (
          <div className="text-sm text-gray-700">
            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Created:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
          </div>
        )}

        {tab === 'seller' && (
          <div className="text-sm text-gray-700">
            <p>Seller: <Link to={`/seller/${product.seller._id}`} className="underline">{product.seller.name}</Link></p>
          </div>
        )}

        {tab === 'activity' && (
          <div className="text-sm text-gray-700">
            <p>👁️ Views: {product.views || 0}</p>
            <p>❤️ Favorites: {(product as any).favoritesCount || 0}</p>
          </div>
        )}

        <div className="mt-6">
          {user && user._id !== product.seller._id && product.status === 'approved' && (
            <div>
              {!show ? (
                <button onClick={() => setShow(true)} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Make Offer</button>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  {error && <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">{error}</div>}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Offer Amount ($)</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Max: $${product.price}`} min="0" max={product.price} step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Add a message to your offer..." rows={3} maxLength={500} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSubmitOffer} disabled={loading} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Submitting...' : 'Submit Offer'}</button>
                    <button onClick={() => { setShow(false); setAmount(''); setMessage(''); setError(''); }} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

