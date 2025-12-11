import { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

interface FavoriteButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ productId, size = 'md' }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavorite();
    }
  }, [user, productId]);

  const checkFavorite = async () => {
    try {
      const response = await client.get('/users/me/favorites');
      const favorites = response.data.favorites.map((p: any) => p._id);
      setIsFavorite(favorites.includes(productId));
    } catch (error) {
      // User might not be logged in
      setIsFavorite(false);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to login or show message
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      const response = await client.post('/users/me/favorites', { productId });
      setIsFavorite(response.data.isFavorite);
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      alert(error.response?.data?.message || 'Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full transition-colors ${
        isFavorite
          ? 'bg-red-500 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-100'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className="w-5 h-5"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};

export default FavoriteButton;

