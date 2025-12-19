import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client';
import { Product, ProductsResponse } from '../types';
import ProductCard from '../components/ProductCard';
import HeroBanner from '../components/HeroBanner';
import SectionGrid from '../components/SectionGrid';
import BrandTiles from '../components/BrandTiles';
import CategoryCard from '../components/CategoryCard';
import ActivityFeed from '../components/ActivityFeed';
import EmptyState from '../components/EmptyState';
import { ProductGridSkeleton } from '../components/Skeleton';
import FilterSidebar from '../components/FilterSidebar';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
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

  // Fetch products whenever filters change
  useEffect(() => {
    if (isBrowseMode) {
      fetchProducts();
    }
  }, [filters.search, filters.brand, filters.category, filters.minPrice, filters.maxPrice, filters.sort, filters.page]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    // Update URL query parameters
    const params = new URLSearchParams();
    if (newFilters.search) params.append('search', newFilters.search);
    if (newFilters.brand) params.append('brand', newFilters.brand);
    if (newFilters.category) params.append('category', newFilters.category);
    if (newFilters.minPrice) params.append('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.append('maxPrice', newFilters.maxPrice);
    if (newFilters.sort !== 'newest') params.append('sort', newFilters.sort);
    setSearchParams(params);
    
    // Scroll to filters when browsing
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const categories = ['sneakers', 'streetwear', 'collectibles', 'other'];

  // Show homepage sections if not browsing
  if (!isBrowseMode) {
    return (
      <div>
        <HeroBanner />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
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
                  onClick={() => {
                    const emptyFilters = {
                      search: '',
                      brand: '',
                      category: '',
                      minPrice: '',
                      maxPrice: '',
                      sort: 'newest',
                      page: 1,
                    };
                    setFilters(emptyFilters);
                    setSearchParams(new URLSearchParams());
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Browse All Products
                </button>
              </div>
            </div>
            <div className="lg:col-span-1">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show browse/filter view
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const clearAll = () => {
    const emptyFilters = {
      search: '',
      brand: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      page: 1,
    };
    setFilters(emptyFilters);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Discover Products</h1>
        <div className="md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="px-3 py-2 bg-gray-100 rounded">Filters</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block lg:col-span-1">
          <FilterSidebar filters={filters} categories={categories} brands={brands} onChange={handleFilterChange} onClearAll={clearAll} />
        </div>

        <div className="lg:col-span-3">
          {/* Products Grid */}
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search terms. You can also browse all products to discover new items."
              icon="🔍"
              action={{ label: 'Browse All Products', path: '/' }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40">
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white p-4 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setSidebarOpen(false)} className="text-sm text-gray-500">Close</button>
            </div>
            <FilterSidebar filters={filters} categories={categories} brands={brands} onChange={handleFilterChange} onClearAll={() => { clearAll(); setSidebarOpen(false); }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
