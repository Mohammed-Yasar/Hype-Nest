import { Link } from 'react-router-dom';

interface CategoryCardProps {
  category: string;
  emoji?: string;
  count?: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, emoji = '📦', count }) => {
  const categoryEmojis: Record<string, string> = {
    sneakers: '👟',
    streetwear: '👕',
    collectibles: '🎨',
    other: '📦',
  };

  const displayEmoji = categoryEmojis[category.toLowerCase()] || emoji;
  const displayName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <Link
      to={`/?category=${encodeURIComponent(category)}`}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center group"
    >
      <div className="text-4xl mb-3">{displayEmoji}</div>
      <h3 className="font-semibold text-lg mb-1 group-hover:text-gray-900">
        {displayName}
      </h3>
      {count !== undefined && (
        <p className="text-sm text-gray-600">{count} items</p>
      )}
    </Link>
  );
};

export default CategoryCard;

