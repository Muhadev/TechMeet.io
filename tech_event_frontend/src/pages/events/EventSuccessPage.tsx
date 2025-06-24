import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import {
  Check,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Share2,
  Eye,
  Edit,
  Plus,
  Home,
  Clock,
  Tag,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  ArrowRight
} from 'lucide-react';

// Define interfaces for type safety
interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  category: string;
  max_attendees: number;
  ticket_price: number;
  status: string;
  banner_image?: string;
}

interface LocationState {
  event?: Event;
  action?: string;
}

export default function EventSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number>(10);
  const [isAutoRedirect, setIsAutoRedirect] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Get event data from navigation state with proper typing
  const { event, action } = (location.state as LocationState) || {};

  // Redirect to dashboard if no event data
  useEffect(() => {
    if (!event) {
      navigate('/dashboard');
      return;
    }
  }, [event, navigate]);

  // Auto-redirect countdown
  useEffect(() => {
    if (!isAutoRedirect) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoRedirect, navigate]);

  // Don't render if no event data
  if (!event) {
    return null;
  }

  const isPublished = action === 'published';
  const eventUrl = `${window.location.origin}/events/${event.id}`;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(`Check out this event: ${event.title}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`
  };

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {isPublished ? 'Event Published Successfully!' : 'Event Saved as Draft!'}
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isPublished 
                ? 'Your event is now live and people can start registering. Share it with your audience!'
                : 'Your event has been saved as a draft. You can continue editing and publish it when ready.'
              }
            </p>
          </div>

          {/* Event Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            {/* Banner Image */}
            {event.banner_image && (
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
                <img
                  src={event.banner_image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              </div>
            )}
            
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{event.description}</p>
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium text-gray-900">{formatDate(event.start_date)}</p>
                    <p className="text-sm text-gray-600">{formatTime(event.start_date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium text-gray-900">{formatDate(event.end_date)}</p>
                    <p className="text-sm text-gray-600">{formatTime(event.end_date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Tag className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium text-gray-900">{event.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Max Attendees</p>
                    <p className="font-medium text-gray-900">{event.max_attendees}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium text-gray-900">
                      {event.ticket_price > 0 ? `₦${event.ticket_price}` : 'Free'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>

            {isPublished && (
              <button
                onClick={() => window.open(eventUrl, '_blank')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                <Eye className="w-4 h-4" />
                View Event
              </button>
            )}

            <button
              onClick={() => navigate(`/events/${event.id}/edit`)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit Event
            </button>

            <button
              onClick={() => navigate('/events/create')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Another
            </button>
          </div>

          {/* Share Section (only for published events) */}
          {isPublished && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                Share Your Event
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={eventUrl}
                      readOnly
                      className="flex-1 bg-transparent border-none outline-none text-gray-700"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Auto-redirect Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-blue-900 font-medium">
                  {isAutoRedirect 
                    ? `Redirecting to dashboard in ${countdown} seconds`
                    : 'Auto-redirect disabled'
                  }
                </p>
                <p className="text-blue-700 text-sm">
                  You'll be taken to your dashboard automatically
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsAutoRedirect(!isAutoRedirect)}
              className="px-4 py-2 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {isAutoRedirect ? 'Stop' : 'Start'} Auto-redirect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}