import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Settings, 
  Zap,
  Calendar
} from 'lucide-react';

interface Event {
  id: number;
  title: string;
  location?: string;
  status: string;
  banner_image?: string;
  start_date?: string;
  ticket_price?: number;
}

const DashboardHeader: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search handler with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(
          `https://techmeetio.up.railway.app/api/events/?search=${encodeURIComponent(searchQuery)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        setSearchResults(data.results || data);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSearchResults(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Helper functions for user display
  const getUserInitials = (firstName?: string, lastName?: string, username?: string): string => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = (firstName?: string, lastName?: string, username?: string): string => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    if (username) {
      return username;
    }
    return 'User';
  };

  const formatRole = (role?: string): string => {
    if (!role) return 'user';
    return role.toLowerCase().replace('_', ' ');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r text-white from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h1 
              className="text-xl font-bold text-gray-900 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              TechMeet.io
            </h1>
          </div>
          
          <div className="hidden md:block">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={
                  user?.role === 'ORGANIZER' || user?.role === 'ADMIN' 
                    ? "Search events, attendees..." 
                    : "Search events..."
                }
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.slice(0, 8).map((event) => (
                        <div
                          key={event.id}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => {
                            navigate(`/events/${event.id}`);
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {event.banner_image ? (
                                <img
                                  src={event.banner_image}
                                  alt={event.title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Calendar className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {event.title}
                              </h4>
                              <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                                <span>
                                  {event.start_date 
                                    ? new Date(event.start_date).toLocaleDateString() 
                                    : 'No date'
                                  }
                                </span>
                                {event.location && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">{event.location}</span>
                                  </>
                                )}
                              </div>
                              {event.ticket_price && event.ticket_price > 0 && (
                                <div className="text-xs font-medium text-blue-600 mt-1">
                                  ₦{event.ticket_price.toLocaleString()}
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                event.status === 'PUBLISHED' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {event.status ? event.status.toLowerCase() : 'unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {searchResults.length > 8 && (
                        <div className="px-4 py-2 text-center text-sm text-gray-500 border-t border-gray-100">
                          +{searchResults.length - 8} more results
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p>No events found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3">
            {/* Profile Picture or Initials */}
            {user?.profile_picture ? (
              <img 
                src={user.profile_picture} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {getUserInitials(user?.first_name, user?.last_name, user?.username)}
                </span>
              </div>
            )}
            
            {/* User Info */}
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                {getDisplayName(user?.first_name, user?.last_name, user?.username)}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {formatRole(user?.role)}
              </p>
            </div>
          </div>
          
          {/* Settings Button */}
          <div className="relative">
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;