import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

const DashboardPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'favorites'>('listings');
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [stats, setStats] = useState({
    listingsCount: 0,
    totalViews: 0,
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    brand: '',
    category: '',
    images: [] as string[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyProducts();
    fetchFavorites();
    fetchStats();
  }, []);

  const fetchFavorites = async () => {
    setFavoritesLoading(true);
    try {
      const response = await client.get<{ favorites: Product[] }>('/users/me/favorites');
      setFavorites(response.data.favorites);
    } catch (err: any) {
      console.error('Error fetching favorites:', err);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await client.get<{ products: Product[] }>('/products/user/my-products');
      const myProducts = response.data.products;
      const totalViews = myProducts.reduce((sum, p) => sum + (p.views || 0), 0);
      setStats({
        listingsCount: myProducts.length,
        totalViews,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchMyProducts = async () => {
    setLoading(true);
    try {
      const response = await client.get<{ products: Product[] }>('/products/user/my-products');
      setProducts(response.data.products);
      fetchStats(); // Update stats
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await client.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      brand: product.brand,
      category: product.category,
      images: product.images,
    });
    setShowEditForm(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      setError('Please select an image first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', imageFile);

      const response = await client.post('/upload/image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, response.data.url],
      }));
      setImageFile(null);
      setImagePreview('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setError('');
    try {
      await client.patch(`/products/${editingProduct._id}`, formData);
      setShowEditForm(false);
      setEditingProduct(null);
      fetchMyProducts();
      fetchFavorites(); // Refresh favorites in case it was removed
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (showEditForm && editingProduct) {
    return (
      <div className="max-w-2xl mx-auto mt-12 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Product</h2>
            <button
              onClick={() => {
                setShowEditForm(false);
                setEditingProduct(null);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images
              </label>
              <div className="flex gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={!imageFile || uploading}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div>
              )}
              {formData.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Current Images:</p>
                  <div className="flex gap-2 flex-wrap">
                    {formData.images.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800"
            >
              Update Product
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={() => navigate('/create-product')}
          className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Create New Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">My Listings</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.listingsCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Views</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalViews}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'listings'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Listings ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'favorites'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Favorites ({favorites.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {activeTab === 'listings' ? (
        <>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg">Loading your products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600 mb-4">You haven't created any products yet.</div>
              <button
                onClick={() => navigate('/create-product')}
                className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800"
              >
                Create Your First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg truncate flex-1">{product.title}</h3>
                  {getStatusBadge(product.status)}
                </div>
                <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
                <p className="text-2xl font-bold text-gray-900 mb-4">${product.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {favoritesLoading ? (
            <div className="text-center py-12">
              <div className="text-lg">Loading favorites...</div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600 mb-4">You haven't favorited any products yet.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;

