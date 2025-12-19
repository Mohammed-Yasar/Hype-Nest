import { Link } from 'react-router-dom';
import { Product } from '../types';
import FavoriteButton from './FavoriteButton';
import { useState } from 'react';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

const getBadgeColor = (badge: string) => {
  const colors: Record<string, string> = {
    new: 'bg-green-500',
    hot: 'bg-red-500',
    limited: 'bg-yellow-500',
    premium: 'bg-purple-500',
  };
  return colors[badge.toLowerCase()] || 'bg-gray-500';
};

const initials = (name?: string) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const viewCount = product.views || 0;
  const likes = (product as any).favoritesCount || 0;
  const [openQuick, setOpenQuick] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-shadow duration-200">
      {/* Image Container */}
      <Link to={`/products/${product._id}`} className="relative w-full h-64 bg-gray-100 overflow-hidden block">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}

        {/* Badges */}
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className={`${getBadgeColor(badge)} text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg`}
              >
                {badge.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* Favorite Button */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <FavoriteButton productId={product._id} size="md" />
        </div>

        {/* View Count */}
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
          <span>👁</span>
          <span>{viewCount}</span>
        </div>

        {/* Hover Action Buttons */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex flex-col items-center justify-end pb-4 gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.preventDefault();
              setOpenQuick(true);
            }}
            className="w-11/12 px-4 py-3 bg-white text-black rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg"
          >
            Quick View
          </button>
          <Link
            to={`/products/${product._id}`}
            className="w-11/12 px-4 py-3 bg-black text-white rounded-lg font-bold text-sm text-center hover:bg-gray-800 transition-colors shadow-lg"
          >
            View Details
          </Link>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-base line-clamp-2 mb-1 text-gray-900">{product.title}</h3>
        
        <p className="text-xs text-gray-500 mb-3">
          {product.brand} · {product.category}
        </p>

        {/* Seller Info */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {initials(product.seller?.name)}
          </div>
          <span className="text-xs text-gray-600 truncate">{product.seller?.name}</span>
        </div>

        {/* Price and Stats */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl font-bold text-gray-900">${product.price}</div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1 font-medium">
              <span>❤️</span>
              <span>{likes}</span>
            </div>
          </div>
        </div>

        {/* Date */}
        <p className="text-xs text-gray-400">{new Date(product.createdAt).toLocaleDateString()}</p>
      </div>

      {openQuick && (
        <QuickViewModal product={product} onClose={() => setOpenQuick(false)} />
      )}
    </div>
  );
};

export default ProductCard;

