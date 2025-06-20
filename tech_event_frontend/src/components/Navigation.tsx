// src/components/Navigation.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Menu, 
  X,
  User,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  currentPage?: string;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentPage = '' 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { isAuthenticated, user, logout } = useAuth();

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Reviews" }
  ];

  // Scroll detection effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 20);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on scroll
  useEffect(() => {
    if (isMenuOpen && scrollY > 100) {
      setIsMenuOpen(false);
    }
  }, [scrollY, isMenuOpen]);

  // Helper function to get user initials
  const getUserInitials = (user: any) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    } else if (user?.first_name) {
      return user.first_name.substring(0, 2).toUpperCase();
    } else if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'US';
  };

  // Helper function to get display name
  const getDisplayName = (user: any) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user?.first_name) {
      return user.first_name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    
    // If it's a hash link and we're on the homepage, scroll to section
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  // Dynamic classes based on scroll state
  const getNavClasses = () => {
    const baseClasses = "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out";
    
    if (isScrolled) {
      return `${baseClasses} px-6 py-3 bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50`;
    } else {
      return `${baseClasses} px-6 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 backdrop-blur-xl border-b border-white/20`;
    }
  };

  const getLogoClasses = () => {
    if (isScrolled) {
      return "w-9 h-9 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300";
    } else {
      return "w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300";
    }
  };

  const getTextClasses = (isActive = false) => {
    const baseClasses = "transition-all duration-300 font-medium";
    
    if (isScrolled) {
      return `${baseClasses} ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`;
    } else {
      return `${baseClasses} ${isActive ? 'text-blue-200' : 'text-white hover:text-blue-200'}`;
    }
  };

  const getBrandClasses = () => {
    const baseClasses = "text-2xl font-bold drop-shadow-lg transition-all duration-300";
    
    if (isScrolled) {
      return `${baseClasses} text-gray-800`;
    } else {
      return `${baseClasses} text-white`;
    }
  };

  const getButtonClasses = (variant: 'primary' | 'secondary') => {
    const baseClasses = "transition-all duration-300 font-medium backdrop-blur-sm";
    
    if (isScrolled) {
      if (variant === 'primary') {
        return `${baseClasses} px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg`;
      } else {
        return `${baseClasses} px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200`;
      }
    } else {
      if (variant === 'primary') {
        return `${baseClasses} px-6 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 shadow-lg`;
      } else {
        return `${baseClasses} px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30`;
      }
    }
  };

  const getUserMenuButtonClasses = () => {
    const baseClasses = "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 font-medium backdrop-blur-sm border";
    
    if (isScrolled) {
      return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200`;
    } else {
      return `${baseClasses} bg-white/10 text-white hover:bg-white/20 border-white/20`;
    }
  };

  const getMobileMenuClasses = () => {
    const baseClasses = "md:hidden absolute top-full left-0 right-0 backdrop-blur-xl border-b transition-all duration-300";
    
    if (isScrolled) {
      return `${baseClasses} bg-white/95 border-gray-200/50 shadow-lg`;
    } else {
      return `${baseClasses} bg-gradient-to-r from-blue-700 via-blue-800 to-purple-800 border-white/20`;
    }
  };

  return (
    <>
      {/* Spacer to prevent content jump when nav becomes fixed */}
      <div className="h-20"></div>
      
      <nav className={getNavClasses()}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className={getLogoClasses()}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className={getBrandClasses()}>
              TechMeet.io
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links - Show different links based on auth status */}
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={getTextClasses(currentPage === '/dashboard')}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/events" 
                  className={getTextClasses(currentPage === '/events')}
                >
                  Events
                </Link>
                <Link 
                  to="/settings" 
                  className={getTextClasses(currentPage === '/settings')}
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                {navLinks.map((link) => (
                  <a 
                    key={link.href}
                    href={link.href} 
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className={getTextClasses(currentPage === link.href)}
                  >
                    {link.label}
                  </a>
                ))}
              </>
            )}
            
            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={getUserMenuButtonClasses()}
                >
                  {/* User Avatar */}
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-inner">
                    {getUserInitials(user)}
                  </div>
                  
                  {/* User Name */}
                  <span className="text-sm font-medium max-w-32 truncate">
                    {getDisplayName(user)}
                  </span>
                  
                  {/* Dropdown Arrow */}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 overflow-hidden">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {getUserInitials(user)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {getDisplayName(user)}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3 text-gray-500" />
                        Account Settings
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <button className={getButtonClasses('secondary')}>
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <button className={getButtonClasses('primary')}>
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`md:hidden transition-colors duration-300 ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={getMobileMenuClasses()}>
            <div className="px-6 py-4 space-y-4">
              {/* Mobile Navigation Links */}
              {isAuthenticated ? (
                <>
                  <div className={`pb-4 border-b ${
                    isScrolled ? 'border-gray-200' : 'border-white/20'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {getUserInitials(user)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${
                          isScrolled ? 'text-gray-800' : 'text-white'
                        }`}>
                          {getDisplayName(user)}
                        </p>
                        <p className={`text-xs truncate ${
                          isScrolled ? 'text-gray-600' : 'text-blue-200'
                        }`}>
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block font-medium transition-colors ${
                      currentPage === '/dashboard' 
                        ? (isScrolled ? 'text-blue-600' : 'text-blue-200')
                        : (isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200')
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/events"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block font-medium transition-colors ${
                      currentPage === '/events' 
                        ? (isScrolled ? 'text-blue-600' : 'text-blue-200')
                        : (isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200')
                    }`}
                  >
                    Events
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block font-medium transition-colors ${
                      currentPage === '/profile' 
                        ? (isScrolled ? 'text-blue-600' : 'text-blue-200')
                        : (isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200')
                    }`}
                  >
                    Profile
                  </Link>
                  
                  <div className={`border-t pt-4 ${
                    isScrolled ? 'border-gray-200' : 'border-white/20'
                  }`}>
                    <button
                      onClick={handleLogout}
                      className={`flex items-center w-full px-4 py-2 font-medium rounded-lg transition-colors ${
                        isScrolled 
                          ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
                          : 'text-red-200 hover:text-red-100 bg-red-500/20'
                      }`}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {navLinks.map((link) => (
                    <a 
                      key={link.href}
                      href={link.href} 
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link.href);
                      }}
                      className={`block font-medium transition-colors ${
                        currentPage === link.href 
                          ? (isScrolled ? 'text-blue-600' : 'text-blue-200')
                          : (isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200')
                      }`}
                    >
                      {link.label}
                    </a>
                  ))}
                  
                  <div className={`space-y-2 pt-4 border-t ${
                    isScrolled ? 'border-gray-200' : 'border-white/20'
                  }`}>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <button className={`block w-full text-left px-4 py-2 rounded-lg font-medium backdrop-blur-sm transition-colors ${
                        isScrolled 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}>
                        Sign In
                      </button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <button className={`block w-full px-6 py-2 rounded-lg font-semibold shadow-lg transition-all ${
                        isScrolled
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-white text-blue-700 hover:bg-blue-50'
                      }`}>
                        Get Started
                      </button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Click outside handler for user menu */}
        {isUserMenuOpen && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsUserMenuOpen(false)}
          />
        )}
      </nav>
    </>
  );
};

export default Navigation;