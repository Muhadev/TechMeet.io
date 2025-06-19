import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  MapPin,
  Eye,
  Edit,
  MoreHorizontal,
  Loader2,
  AlertCircle
} from 'lucide-react';

const RecentEventsSection = () => {
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch recent events from API
  useEffect(() => {
    const fetchRecentEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/events/');
        // Sort by created_at and get only the 3 most recent
        const sortedEvents = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRecentEvents(sortedEvents.slice(0, 3));
        setError(null);
      } catch (err) {
        console.error('Error fetching recent events:', err);
        setError('Failed to load recent events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentEvents();
  }, []);

  // Get image URL helper function (same as in MyEventsSection)
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If the URL already starts with http:// or https://, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const serverURL = baseURL.replace('/api', '');
    const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${serverURL}${cleanImageUrl}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Event Card Component
  const EventCard = ({ event }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-200">
        {event.banner_image ? (
          <img 
            src={getImageUrl(event.banner_image)}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(event.status)}`}>
            {event.status?.charAt(0).toUpperCase() + event.status?.slice(1).toLowerCase() || 'Draft'}
          </span>
        </div>
        {event.category && (
          <div className="absolute top-3 left-3">
            <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium">
              {event.category}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {formatDate(event.start_date)} at {formatTime(event.start_date)}
              {event.end_date && event.start_date !== event.end_date && (
                <span> - {formatDate(event.end_date)}</span>
              )}
            </span>
          </div>
          
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Max {event.max_attendees} attendees</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-green-600">
            {event.ticket_price && parseFloat(event.ticket_price) > 0 
              ? `₦${parseFloat(event.ticket_price).toLocaleString()}`
              : 'Free'
            }
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              onClick={() => {
                navigate(`/events/${event.id}`);
              }}
            >
              View Details
            </button>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
              <Eye className="w-4 h-4" />
            </button>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
              <Edit className="w-4 h-4" />
            </button>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View All</button>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading recent events...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View All</button>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading recent events</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View All</button>
      </div>

      {/* Events Display */}
      {recentEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recent events</h3>
          <p className="text-gray-600 mb-4">Create your first event to get started.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            <a href="/events/create-event">Create Event</a>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentEventsSection;