import { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';
import client from '../api/client';
import { Product, ProductsResponse } from '../types';
import ProductCard from '../components/ProductCard';
import HeroBanner from '../components/HeroBanner';
import SectionGrid from '../components/SectionGrid';
import BrandTiles from '../components/BrandTiles';
import CategoryCard from '../components/CategoryCard';

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    page: 1,
  });

  // Check if we're in browse mode (has filters)
  const isBrowseMode = filters.search || filters.brand || filters.category || filters.minPrice || filters.maxPrice;

  // Fetch homepage sections
  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        const [trendingRes, newArrivalsRes, brandsRes] = await Promise.all([
          client.get<{ products: Product[] }>('/products/trending?limit=8'),
          client.get<{ products: Product[] }>('/products/new-arrivals?limit=8'),
          client.get<{ brands: string[] }>('/products/brands'),
        ]);

        setTrending(trendingRes.data.products);
        setNewArrivals(newArrivalsRes.data.products);
        setBrands(brandsRes.data.brands);

        // Generate recommended (random picks from approved products)
        const allRes = await client.get<ProductsResponse>('/products?limit=20');
        const shuffled = [...allRes.data.products].sort(() => 0.5 - Math.random());
        setRecommended(shuffled.slice(0, 8));
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      }
    };

    if (!isBrowseMode) {
      fetchHomepageData();
    }
  }, [isBrowseMode]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      params.append('sort', filters.sort);
      params.append('page', filters.page.toString());
      params.append('limit', '12');

      const response = await client.get<ProductsResponse>(
        `/products?${params.toString()}`
      );
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchProducts();
  }, 500);

  useEffect(() => {
    if (isBrowseMode) {
      fetchProducts();
    }
  }, [filters.brand, filters.category, filters.minPrice, filters.maxPrice, filters.sort, filters.page]);

  useEffect(() => {
    if (isBrowseMode) {
      debouncedSearch();
      return () => {
        debouncedSearch.cancel();
      };
    }
  }, [filters.search]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const categories = ['sneakers', 'streetwear', 'collectibles', 'other'];

  // Show homepage sections if not browsing
  if (!isBrowseMode) {
    return (
      <div>
        <HeroBanner />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Shop by Category */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category} category={category} />
              ))}
            </div>
          </section>

          {/* Trending Now */}
          <SectionGrid title="Trending Now" products={trending} />

          {/* New Arrivals */}
          <SectionGrid title="New Arrivals" products={newArrivals} />

          {/* Popular Brands */}
          <BrandTiles brands={brands} />

          {/* Recommended for You */}
          <SectionGrid title="Recommended for You" products={recommended} />

          {/* Browse All Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Browse All Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show browse/filter view
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Discover Products</h1>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search products..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <input
              type="text"
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              placeholder="Filter by brand..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              placeholder="Filter by category..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price
            </label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              placeholder="Min price..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              placeholder="Max price..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg">Loading products...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">No products found</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center space-x-2">
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={filters.page === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={filters.page >= pagination.totalPages}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
