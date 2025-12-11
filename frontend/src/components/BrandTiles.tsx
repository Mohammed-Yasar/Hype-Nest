import { Link } from 'react-router-dom';

interface BrandTilesProps {
  brands: string[];
  loading?: boolean;
}

const BrandTiles: React.FC<BrandTilesProps> = ({ brands, loading }) => {
  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Popular Brands</h2>
        <div className="text-center py-8">Loading...</div>
      </section>
    );
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Popular Brands</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {brands.slice(0, 12).map((brand) => (
          <Link
            key={brand}
            to={`/?brand=${encodeURIComponent(brand)}`}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center font-semibold hover:bg-gray-50"
          >
            {brand}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BrandTiles;

