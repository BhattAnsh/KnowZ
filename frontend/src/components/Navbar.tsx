import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserAlt, FaExchangeAlt, FaComments, FaUsers, FaSignOutAlt, FaTachometerAlt, FaBars, FaTimes, FaHome } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="fixed w-full top-0 z-50 bg-[#1a221b] border-b border-green-700/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-green-500 text-xl font-bold">KnowZ</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'text-green-400 bg-green-900/20' : 'text-gray-300 hover:text-green-400 hover:bg-green-900/10'}`}>
                  Home
                </Link>
                <Link to="/features" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/features') ? 'text-green-400 bg-green-900/20' : 'text-gray-300 hover:text-green-400 hover:bg-green-900/10'}`}>
                  Features
                </Link>
                <Link to="/auth" className="ml-4 px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700">
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${isActive('/dashboard') ? 'text-green-400 bg-green-900/20' : 'text-gray-300 hover:text-green-400 hover:bg-green-900/10'}`}>
                  <FaHome className="mr-1.5" />
                  Home
                </Link>
                <Link to="/matchmaking" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${isActive('/matchmaking') ? 'text-green-400 bg-green-900/20' : 'text-gray-300 hover:text-green-400 hover:bg-green-900/10'}`}>
                  <FaExchangeAlt className="mr-1.5" />
                  Match
                </Link>
                <Link to="/messages" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${isActive('/messages') ? 'text-green-400 bg-green-900/20' : 'text-gray-300 hover:text-green-400 hover:bg-green-900/10'}`}>
                  <FaComments className="mr-1.5" />
                  Messages
                </Link>
                <Link to="/profile" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${isActive('/profile') ? 'text-green-400 bg-green-900/20' : 'text-gray-300 hover:text-green-400 hover:bg-green-900/10'}`}>
                  <FaUserAlt className="mr-1.5" />
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="ml-2 px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-900/20 flex items-center"
                >
                  <FaSignOutAlt className="mr-1.5" />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-green-900/20 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <FaTimes className="block h-6 w-6" /> : <FaBars className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-green-700/30">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {!isAuthenticated ? (
              <>
                <Link to="/" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'text-green-400 bg-green-900/20' : 'text-gray-300 hover:text-green-400 hover:bg-green-900/10'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link to="/features" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/features') ? 'text-green-400 bg-green-900/20' : 'text-gray-300 hover:text-green-400 hover:bg-green-900/10'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link to="/auth" 
                  className="block px-3 py-2 rounded-md text-base font-medium bg-green-600 text-white hover:bg-green-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" 
                  className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${isActive('/dashboard') ? 'text-green-400 bg-green-900/20' : 'text-gray-300 hover:text-green-400 hover:bg-green-900/10'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaTachometerAlt className="mr-2" />
                  Dashboard
                </Link>
                <Link to="/profile" 
                  className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${isActive('/profile') ? 'text-green-400 bg-green-900/20' : 'text-gray-300 hover:text-green-400 hover:bg-green-900/10'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaUserAlt className="mr-2" />
                  Profile
                </Link>
                <Link to="/matchmaking" 
                  className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${isActive('/matchmaking') ? 'text-green-400 bg-green-900/20' : 'text-gray-300 hover:text-green-400 hover:bg-green-900/10'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaExchangeAlt className="mr-2" />
                  Match
                </Link>
                <Link to="/messages" 
                  className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${isActive('/messages') ? 'text-green-400 bg-green-900/20' : 'text-gray-300 hover:text-green-400 hover:bg-green-900/10'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaComments className="mr-2" />
                  Messages
                </Link>
                <Link to="/community" 
                  className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${isActive('/community') ? 'text-green-400 bg-green-900/20' : 'text-gray-300 hover:text-green-400 hover:bg-green-900/10'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaUsers className="mr-2" />
                  Community
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-900/20 flex items-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;