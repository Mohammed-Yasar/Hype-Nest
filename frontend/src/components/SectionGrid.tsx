import { Product } from '../types';
import ProductCard from './ProductCard';

interface SectionGridProps {
  title: string;
  products: Product[];
  loading?: boolean;
}

const SectionGrid: React.FC<SectionGridProps> = ({ title, products, loading }) => {
  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="text-center py-8">Loading...</div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default SectionGrid;

