import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchPendingProducts();
  }, [user, navigate]);

  const fetchPendingProducts = async () => {
    setLoading(true);
    try {
      const response = await client.get<{ products: Product[] }>('/admin/products/pending');
      setProducts(response.data.products);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch pending products');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await client.patch(`/admin/products/${id}/approve`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve product');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this product?')) {
      return;
    }

    try {
      await client.patch(`/admin/products/${id}/reject`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject product');
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin - Pending Products</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg">Loading pending products...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">No pending products to review.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-square bg-gray-200">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                <p className="text-gray-600 text-sm mb-1">{product.brand}</p>
                <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">${product.price}</p>
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{product.description}</p>
                <div className="mb-4">
                  <p className="text-xs text-gray-500">
                    Seller: {product.seller.name} ({product.seller.email})
                  </p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(product._id)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(product._id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;

