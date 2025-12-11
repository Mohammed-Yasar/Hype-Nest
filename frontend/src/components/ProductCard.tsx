import { Link } from 'react-router-dom';
import { Product } from '../types';
import FavoriteButton from './FavoriteButton';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link
      to={`/products/${product._id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative"
    >
      <div className="aspect-square bg-gray-200 relative">
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
        <div className="absolute top-2 right-2">
          <FavoriteButton productId={product._id} size="sm" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-lg truncate flex-1">{product.title}</h3>
          {product.badges && product.badges.length > 0 && (
            <div className="flex gap-1 ml-2">
              {product.badges.slice(0, 2).map((badge) => (
                <span
                  key={badge}
                  className="text-xs bg-red-500 text-white px-2 py-0.5 rounded"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
        <p className="text-2xl font-bold text-gray-900">${product.price}</p>
      </div>
    </Link>
  );
};

export default ProductCard;

