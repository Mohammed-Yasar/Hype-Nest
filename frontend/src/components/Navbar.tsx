import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              HypeNest
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/create-product"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Create Product
                </Link>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
                <span className="text-gray-700">{user.name}</span>
                <button
                  onClick={logout}
                  className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

