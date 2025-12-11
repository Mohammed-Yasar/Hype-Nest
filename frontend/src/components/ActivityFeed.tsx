import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

interface Activity {
  _id: string;
  type: string;
  message: string;
  user?: {
    _id: string;
    name: string;
  };
  product?: {
    _id: string;
    title: string;
    images?: string[];
  };
  createdAt: string;
}

const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await client.get<{ activities: Activity[] }>('/activity?limit=10');
        setActivities(response.data.activities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product_created':
      case 'product_approved':
        return '✨';
      case 'product_favorited':
        return '❤️';
      case 'user_registered':
        return '👤';
      case 'product_viewed':
        return '👁️';
      default:
        return '📦';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Activity Feed</h2>
        <div className="text-center py-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Activity Feed</h2>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No recent activity</div>
        ) : (
          activities.map((activity) => (
            <div key={activity._id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
              <div className="text-2xl flex-shrink-0">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">
                  {activity.product ? (
                    <Link
                      to={`/products/${activity.product._id}`}
                      className="hover:text-gray-900 underline"
                    >
                      {activity.message}
                    </Link>
                  ) : (
                    activity.message
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
              {activity.product?.images && activity.product.images.length > 0 && (
                <Link
                  to={`/products/${activity.product._id}`}
                  className="flex-shrink-0"
                >
                  <img
                    src={activity.product.images[0]}
                    alt={activity.product.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;

