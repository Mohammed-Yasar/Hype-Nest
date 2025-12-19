import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import { Product, ProductsResponse } from '../types';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import EmptyState from '../components/EmptyState';

interface SellerProfile {
  _id: string;
  name: string;
  bio: string;
  productCount: number;
  rating: number;
  joinedAt: string;
}

const SellerProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (id) {
      fetchSeller();
      fetchProducts();
    }
  }, [id, currentPage]);

  const fetchSeller = async () => {
    setLoading(true);
    try {
      const response = await client.get<SellerProfile>(`/users/${id}`);
      setSeller(response.data);
    } catch (err: any) {
      console.error('Error fetching seller:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await client.get<ProductsResponse>(
        `/users/${id}/products?page=${currentPage}&limit=12`
      );
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (err: any) {
      console.error('Error fetching products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading seller profile...</div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-600">Seller not found</div>
      </div>
    );
  }

  const joinDate = new Date(seller.joinedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  // Calculate seller trust score based on joined date and product count
  const daysSinceJoined = Math.floor((Date.now() - new Date(seller.joinedAt).getTime()) / (1000 * 60 * 60 * 24));
  const isTrustedSeller = seller.productCount >= 3 && seller.rating >= 4;
  const isVerifiedSeller = daysSinceJoined >= 30;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Sellers' }, { label: seller.name }]} />
      {/* Seller Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{seller.name}</h1>
              {isVerifiedSeller && (
                <span title="Verified Seller" className="text-blue-500 text-2xl">
                  ✓
                </span>
              )}
              {isTrustedSeller && (
                <span title="Trusted Seller" className="text-yellow-500 text-2xl">
                  ⭐
                </span>
              )}
            </div>
            {seller.bio && (
              <p className="text-gray-700 mb-4 max-w-2xl">{seller.bio}</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
              <div className="flex flex-col">
                <span className="font-semibold text-lg">{seller.productCount}</span>
                <span>Products Listed</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg">⭐ {seller.rating.toFixed(1)}</span>
                <span>Rating</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg">{daysSinceJoined}</span>
                <span>Days Active</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg">Joined</span>
                <span>{joinDate}</span>
              </div>
            </div>
            {/* Trust Badges */}
            <div className="flex gap-2 flex-wrap mt-4">
              {isVerifiedSeller && (
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
                  ✓ Verified Seller
                </span>
              )}
              {isTrustedSeller && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-semibold">
                  ⭐ Trusted Seller
                </span>
              )}
              {seller.productCount >= 1 && (
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                  ✓ Active Seller
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seller's Products */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Products from {seller.name}</h2>
        {productsLoading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products from this seller"
            description="This seller hasn't listed any products yet. Check back later or browse trending items."
            icon="🧾"
            action={{ label: 'Browse Trending', path: '/' }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage >= pagination.totalPages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SellerProfilePage;

