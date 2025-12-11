import { Link } from 'react-router-dom';

const HeroBanner = () => {
  return (
    <div className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20 mb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Hype. Buy Authentic.
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            Your marketplace for sneakers, streetwear, and collectibles
          </p>
          <div className="space-x-4">
            <Link
              to="/create-product"
              className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              List Your Item
            </Link>
            <Link
              to="/?category=sneakers"
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;

