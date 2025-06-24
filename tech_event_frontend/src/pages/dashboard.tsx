import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'
import MyEventsSection from './events/MyEventsSection';
import RecentEventsSection from './events/RecentEventsSection';
import AttendeesSection from './events/AttendeesSection';
import AnalyticsSection from './events/AnalyticsSection';
import EventStatistics from '../pages/EventStatistics';
import { useNavigate } from 'react-router-dom';

import { 
  Calendar, 
  Users, 
  Ticket, 
  TrendingUp, 
  Plus,
  Zap,
  Search, 
  Bell, 
  Settings, 
  LogOut,
  BarChart3,
  Eye,
  Edit,
  MoreHorizontal,
  MapPin,
  Filter,
  Download,
  QrCode,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  Share2
} from 'lucide-react';

// Define interfaces for type safety
interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees?: number;
  capacity?: number;
  revenue?: number;
  status: string;
  image: string;
  ticketType?: string;
  price?: number;
  organizer?: string;
  banner_image?: string;
  start_date?: string;
  ticket_price?: number;
}

interface Ticket {
  id: number;
  eventTitle: string;
  attendeeName: string;
  ticketType: string;
  purchaseDate: string;
  amount: number;
  status: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
}

interface User {
  first_name?: string;
  last_name?: string;
  username?: string;
  role?: string;
  profile_picture?: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState('organizer'); // organizer, attendee, admin
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
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
      const response = await fetch(`http://localhost:8000/api/events/?search=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data.results || data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, 300); // 300ms debounce

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

  useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };
  
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  return () => window.removeEventListener('resize', checkMobile);
}, []);

  const organizerEvents: Event[] = [
    {
      id: 1,
      title: "React Native Conference 2025",
      date: "2025-07-15",
      time: "09:00 AM",
      location: "Lagos Tech Hub",
      attendees: 250,
      capacity: 300,
      revenue: 25000,
      status: "published",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop"
    },
    {
      id: 2,
      title: "AI & Machine Learning Summit",
      date: "2025-08-22",
      time: "10:00 AM", 
      location: "Abuja Innovation Center",
      attendees: 180,
      capacity: 200,
      revenue: 36000,
      status: "published",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop"
    },
    {
      id: 3,
      title: "DevOps Workshop Series",
      date: "2025-09-10",
      time: "02:00 PM",
      location: "Virtual Event",
      attendees: 95,
      capacity: 150,
      revenue: 14250,
      status: "draft",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop"
    }
  ];

  const attendeeEvents: Event[] = [
    {
      id: 1,
      title: "React Native Conference 2025",
      date: "2025-07-15",
      time: "09:00 AM",
      location: "Lagos Tech Hub",
      ticketType: "VIP",
      price: 15000,
      status: "confirmed",
      organizer: "Tech Lagos",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop"
    },
    {
      id: 2,
      title: "AI & Machine Learning Summit",
      date: "2025-08-22",
      time: "10:00 AM",
      location: "Abuja Innovation Center",
      ticketType: "Regular",
      price: 8000,
      status: "confirmed",
      organizer: "AI Nigeria",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop"
    },
    {
      id: 3,
      title: "Python Workshop",
      date: "2025-06-25",
      time: "03:00 PM",
      location: "Virtual Event",
      ticketType: "Free",
      price: 0,
      status: "completed",
      organizer: "CodeCamp NG",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop"
    }
  ];

  const recentTickets: Ticket[] = [
    {
      id: 1,
      eventTitle: "React Native Conference 2025",
      attendeeName: "John Doe",
      ticketType: "VIP",
      purchaseDate: "2025-06-10",
      amount: 15000,
      status: "confirmed"
    },
    {
      id: 2,
      eventTitle: "AI & Machine Learning Summit", 
      attendeeName: "Jane Smith",
      ticketType: "Regular",
      purchaseDate: "2025-06-12",
      amount: 8000,
      status: "confirmed"
    },
    {
      id: 3,
      eventTitle: "DevOps Workshop Series",
      attendeeName: "Mike Johnson",
      ticketType: "Student",
      purchaseDate: "2025-06-14",
      amount: 5000,
      status: "pending"
    }
  ];

  const OrganizerEventCard = ({ event }: { event: Event }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-200">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            event.status === 'published' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">{event.title}</h3>
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {event.date} at {event.time}
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {event.location}
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            {event.attendees}/{event.capacity} attendees
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-green-600">
            ₦{event.revenue?.toLocaleString() || '0'}
          </div>
          <div className="flex items-center space-x-2">
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

  const AttendeeEventCard = ({ event }: { event: Event }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-200">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            event.status === 'confirmed' 
              ? 'bg-green-100 text-green-800' 
              : event.status === 'completed'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>
        <div className="absolute top-3 left-3">
          <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium">
            {event.ticketType}
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">{event.title}</h3>
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {event.date} at {event.time}
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {event.location}
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Organized by {event.organizer}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-blue-600">
            {(event.price && event.price > 0) ? `₦${event.price.toLocaleString()}` : 'Free'}
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-50">
              <QrCode className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50">
              <Heart className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const TicketRow = ({ ticket }: { ticket: Ticket }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div>
          <div className="font-medium text-gray-900">{ticket.eventTitle}</div>
          <div className="text-sm text-gray-500">{ticket.attendeeName}</div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">{ticket.ticketType}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{ticket.purchaseDate}</td>
      <td className="px-6 py-4 text-sm font-medium text-gray-900">₦{ticket.amount.toLocaleString()}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          ticket.status === 'confirmed' 
            ? 'bg-green-100 text-green-800' 
            : ticket.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {ticket.status === 'confirmed' && <CheckCircle className="w-3 h-3 mr-1" />}
          {ticket.status === 'pending' && <AlertCircle className="w-3 h-3 mr-1" />}
          {ticket.status === 'cancelled' && <XCircle className="w-3 h-3 mr-1" />}
          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            View
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  // Get navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const commonItems: NavigationItem[] = [
      { id: 'overview', label: 'Overview', icon: BarChart3 }
    ];

    if (userRole === 'organizer') {
      return [
        ...commonItems,
        { id: 'events', label: 'My Events', icon: Calendar },
        { id: 'tickets', label: 'Ticket Sales', icon: Ticket },
        { id: 'attendees', label: 'Attendees', icon: Users },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp }
      ];
    } else if (userRole === 'attendee') {
      return [
        ...commonItems,
        { id: 'events', label: 'My Events', icon: Calendar },
        { id: 'tickets', label: 'My Tickets', icon: Ticket },
        { id: 'discover', label: 'Discover Events', icon: Search },
        { id: 'favorites', label: 'Favorites', icon: Heart }
      ];
    }

    return commonItems;
  };

  // Add this inside your Dashboard component, before the return statement
const { user, logout } = useAuth();

// Helper function to get user initials
const getUserInitials = (firstName?: string, lastName?: string, username?: string): string => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (username) {
    return username.charAt(0).toUpperCase();
  }
  return 'U'; // Default fallback
};

// Helper function to get display name
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

// Helper function to format role for display
const formatRole = (role?: string): string => {
  if (!role) return 'user';
  return role.toLowerCase().replace('_', ' ');
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r text-white from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 cursor-pointer" onClick={() => navigate('/')}>TechMeet.io</h1>
            </div>
            <div className="hidden md:block">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                type="text"
                placeholder={user?.role === 'ORGANIZER' || user?.role === 'ADMIN' ? "Search events, attendees..." : "Search events..."}
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
                                // Navigate to event details page
                                navigate(`/events/${event.id}`);
                                // Clear search
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
                                    <span>{event.start_date ? new Date(event.start_date).toLocaleDateString() : 'No date'}</span>
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
            {/* Role Switcher - Only show for testing/demo purposes, you might want to remove this in production */}
            {user?.role === 'ADMIN' && (
                <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white"
                >
                <option value="organizer">Organizer</option>
                <option value="attendee">Attendee</option>
                </select>
            )}
            
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
            
            {/* Settings/Logout Dropdown */}
            <div className="relative">
                <button 
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    onClick={() => navigate('/settings')}
                >
                <Settings className="w-5 h-5" />
                </button>
                {/* You can add a dropdown menu here for settings and logout */}
            </div>
            </div>
        </div>
        </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`bg-white border-r border-gray-200 fixed left-0 top-16 h-[calc(100vh-4rem)] z-30 transition-all duration-300 ${
            isMobile ? 'w-16' : 'w-64'
            } overflow-y-auto`}>
            <nav className="p-6 h-full flex flex-col">
                <div className="space-y-2 flex-1">
                {getNavigationItems().map((item) => (
                    <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center ${isMobile ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 rounded-lg text-left transition-colors group relative ${
                        activeTab === item.id 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title={isMobile ? item.label : ''}
                    >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isMobile && <span className="font-medium">{item.label}</span>}
                    
                    {/* Tooltip for mobile */}
                    {isMobile && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {item.label}
                        </div>
                    )}
                    </button>
                ))}
                </div>

                {/* Bottom section with Messages, Settings, and Sign Out */}
                <div className="mt-8 pt-8 border-t border-gray-200 space-y-2">
                <button className={`w-full flex items-center ${isMobile ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 text-gray-600 hover:bg-gray-50 rounded-lg group relative`}
                        title={isMobile ? 'Messages' : ''}>
                    <Mail className="w-5 h-5 flex-shrink-0" />
                    {!isMobile && <span className="font-medium">Messages</span>}
                    {isMobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        Messages
                    </div>
                    )}
                </button>
                
                <button 
                    className={`w-full flex items-center ${isMobile ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 text-gray-600 hover:bg-gray-50 rounded-lg group relative`}
                    title={isMobile ? 'Settings' : ''}
                    onClick={() => navigate('/settings')}
                >
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    {!isMobile && <span className="font-medium">Settings</span>}
                    {isMobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        Settings
                    </div>
                    )}
                </button>
                
                <button 
                    onClick={logout}
                    className={`w-full flex items-center ${isMobile ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 text-red-600 hover:bg-red-50 rounded-lg group relative`}
                    title={isMobile ? 'Sign Out' : ''}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!isMobile && <span className="font-medium">Sign Out</span>}
                    {isMobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        Sign Out
                    </div>
                    )}
                </button>
                </div>
            </nav>
            </aside>

        {/* Main Content */}
        <main className={`flex-1 p-6 transition-all duration-300 ${
        isMobile ? 'ml-16' : 'ml-64'
        } overflow-y-auto h-[calc(100vh-4rem)]`}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                  <p className="text-gray-600 mt-1">
                    {userRole === 'organizer' 
                      ? "Welcome back! Here's what's happening with your events." 
                      : "Welcome back! Here's your event activity."}
                  </p>
                </div>
                {userRole === 'organizer' ? (
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span><a href="events/create-event">Create Event</a></span>
                  </button>
                ) : (
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
                    <Search className="w-4 h-4" />
                    <span>Discover Events</span>
                  </button>
                )}
              </div>

              {/* Stats Grid */}
              <EventStatistics eventId={4} />

              {/* Recent Events */}
              <RecentEventsSection/>
            </div>
          )}

          {activeTab === 'events' && <MyEventsSection />}
          
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {userRole === 'organizer' ? 'Ticket Sales' : 'My Tickets'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {userRole === 'organizer' 
                      ? 'Track ticket sales and manage attendee registrations.' 
                      : 'View and manage your event tickets.'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-medium text-gray-900">
                    {userRole === 'organizer' ? 'Recent Ticket Sales' : 'My Tickets'}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event & Attendee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                        {/* Completing the table header from where it was cut off */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {recentTickets.map(ticket => (
                        <TicketRow key={ticket.id} ticket={ticket} />
                    ))}
                    </tbody>
                </table>
                </div>
                </div>
                </div>
                )}

                {activeTab === 'attendees' && userRole === 'organizer' && <AttendeesSection />}

                {activeTab === 'analytics' && userRole === 'organizer' && <AnalyticsSection />}
                
                {activeTab === 'discover' && userRole === 'attendee' && (
                <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                    <h2 className="text-2xl font-bold text-gray-900">Discover Events</h2>
                    <p className="text-gray-600 mt-1">Find exciting events happening near you.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>Near Me</span>
                    </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                    {
                        id: 1,
                        title: "Flutter Conference Lagos 2025",
                        date: "2025-07-20",
                        time: "10:00 AM",
                        location: "Lagos Island",
                        organizer: "Flutter Lagos",
                        price: 12000,
                        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop",
                        category: "Technology"
                    },
                    {
                        id: 2,
                        title: "Startup Pitch Competition",
                        date: "2025-08-15",
                        time: "02:00 PM",
                        location: "Abuja Tech Park",
                        organizer: "Startup Abuja",
                        price: 5000,
                        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop",
                        category: "Business"
                    },
                    {
                        id: 3,
                        title: "Digital Marketing Masterclass",
                        date: "2025-09-05",
                        time: "11:00 AM",
                        location: "Virtual Event",
                        organizer: "DigitalNG",
                        price: 8000,
                        image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop",
                        category: "Marketing"
                    }
                    ].map(event => (
                    <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative h-48 bg-gray-200">
                        <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur rounded-full">
                            {event.category}
                            </span>
                        </div>
                        </div>
                        <div className="p-6">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{event.title}</h3>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {event.date} at {event.time}
                            </div>
                            <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.location}
                            </div>
                            <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Organized by {event.organizer}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold text-blue-600">
                            ₦{event.price.toLocaleString()}
                            </div>
                            <div className="flex items-center space-x-2">
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                Register
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50">
                                <Heart className="w-4 h-4" />
                            </button>
                            </div>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
                )}

                {activeTab === 'favorites' && userRole === 'attendee' && (
                <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                    <h2 className="text-2xl font-bold text-gray-900">Favorite Events</h2>
                    <p className="text-gray-600 mt-1">Events you've saved for later.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
                        <Search className="w-4 h-4" />
                        <span>Discover More</span>
                    </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Favorites would be populated based on user's saved events */}
                    <div className="col-span-full text-center py-12">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite events yet</h3>
                    <p className="text-gray-600 mb-4">Start exploring events and save your favorites here.</p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                        Discover Events
                    </button>
                    </div>
                </div>
                </div>
                )}
                </main>
                </div>
                </div>
                );
                };

                export default Dashboard;