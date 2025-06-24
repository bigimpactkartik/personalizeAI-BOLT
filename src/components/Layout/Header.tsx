import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-neural-200/50 transition-all duration-300 sticky top-0 z-50 neural-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Brain className="h-8 w-8 text-primary-600 transition-all duration-300 group-hover:scale-110 neural-glow" />
              <div className="absolute inset-0 bg-primary-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
            </div>
            <span className="text-xl font-bold ai-text-gradient transition-all duration-300">
              PERSONALIZED-AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    location.pathname === '/dashboard'
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg ai-glow'
                      : 'text-neural-700 hover:text-primary-600 hover:bg-neural-100/50 backdrop-blur-sm'
                  }`}
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-neural-100/80 to-neural-200/80 backdrop-blur-sm rounded-lg border border-neural-300/50 transition-all duration-300 hover:shadow-md">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-neural-700 font-medium">{getUserDisplayName()}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-neural-700 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all duration-300 border border-transparent hover:border-error-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-neural-700 hover:text-primary-600 hover:bg-neural-100/50 rounded-lg transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ai-button-glow"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-neural-700 hover:bg-neural-100/50 transition-all duration-300"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neural-200/50 py-4 fade-in-up bg-white/80 backdrop-blur-sm rounded-b-lg">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-neural-100/80 to-neural-200/80 rounded-lg border border-neural-300/50">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-neural-700 font-medium">{getUserDisplayName()}</span>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    location.pathname === '/dashboard'
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                      : 'text-neural-700 hover:text-primary-600 hover:bg-neural-100/50'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-neural-700 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-neural-700 hover:text-primary-600 hover:bg-neural-100/50 rounded-lg transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-sm font-medium rounded-lg transition-all duration-300 text-center shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;