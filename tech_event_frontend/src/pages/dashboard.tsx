import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  Ticket, 
  DollarSign, 
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
  Clock,
  Star,
  Filter,
  Download,
  QrCode,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  Share2,
  UserCheck,
  CreditCard,
  Calendar as CalendarIcon,
  Target,
  Award
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState('organizer'); // organizer, attendee, admin

  // Mock data for organizers
  const organizerStats = {
    totalEvents: 12,
    totalAttendees: 1247,
    totalRevenue: 89750,
    activeEvents: 3
  };

  // Mock data for attendees
  const attendeeStats = {
    upcomingEvents: 3,
    totalTickets: 8,
    eventsAttended: 12,
    favoriteEvents: 5
  };

  const organizerEvents = [
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

  const attendeeEvents = [
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

  const recentTickets = [
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

  const StatCard = ({ icon: Icon, title, value, change, changeType, subtitle }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 flex items-center ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change}% from last month
            </p>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const OrganizerEventCard = ({ event }) => (
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
            ₦{event.revenue.toLocaleString()}
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

  const AttendeeEventCard = ({ event }) => (
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
            {event.price > 0 ? `₦${event.price.toLocaleString()}` : 'Free'}
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

  const TicketRow = ({ ticket }) => (
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
  const getNavigationItems = () => {
    const commonItems = [
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
              <h1 className="text-xl font-bold text-gray-900">TechMeet.io</h1>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={userRole === 'organizer' ? "Search events, attendees..." : "Search events..."}
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Role Switcher for Demo */}
            <select 
              value={userRole} 
              onChange={(e) => setUserRole(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white"
            >
              <option value="organizer">Organizer</option>
              <option value="attendee">Attendee</option>
            </select>
            
            <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">JD</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-6">
            <div className="space-y-2">
              {getNavigationItems().map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === item.id 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5" />
                <span className="font-medium">Messages</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg mt-2">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg mt-2">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
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
                    <span>Create Event</span>
                  </button>
                ) : (
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
                    <Search className="w-4 h-4" />
                    <span>Discover Events</span>
                  </button>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {userRole === 'organizer' ? (
                  <>
                    <StatCard
                      icon={Calendar} 
                      title="Total Events" 
                      value={organizerStats.totalEvents} 
                      change={12} 
                      changeType="positive" 
                    />
                    <StatCard 
                      icon={Users} 
                      title="Total Attendees" 
                      value={organizerStats.totalAttendees.toLocaleString()} 
                      change={8} 
                      changeType="positive" 
                    />
                    <StatCard 
                      icon={DollarSign} 
                      title="Total Revenue" 
                      value={`₦${organizerStats.totalRevenue.toLocaleString()}`} 
                      change={15} 
                      changeType="positive" 
                    />
                    <StatCard 
                      icon={TrendingUp} 
                      title="Active Events" 
                      value={organizerStats.activeEvents} 
                      change={25} 
                      changeType="positive" 
                    />
                  </>
                ) : (
                  <>
                    <StatCard
                      icon={CalendarIcon} 
                      title="Upcoming Events" 
                      value={attendeeStats.upcomingEvents} 
                      subtitle="Next event in 3 days"
                    />
                    <StatCard 
                      icon={Ticket} 
                      title="Total Tickets" 
                      value={attendeeStats.totalTickets} 
                      subtitle="Active tickets"
                    />
                    <StatCard 
                      icon={Award} 
                      title="Events Attended" 
                      value={attendeeStats.eventsAttended} 
                      subtitle="All time"
                    />
                    <StatCard 
                      icon={Heart} 
                      title="Favorite Events" 
                      value={attendeeStats.favoriteEvents} 
                      subtitle="Saved for later"
                    />
                  </>
                )}
              </div>

              {/* Recent Events */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {userRole === 'organizer' ? 'Recent Events' : 'My Upcoming Events'}
                  </h3>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userRole === 'organizer' 
                    ? organizerEvents.map(event => (
                        <OrganizerEventCard key={event.id} event={event} />
                      ))
                    : attendeeEvents.filter(event => event.status !== 'completed').map(event => (
                        <AttendeeEventCard key={event.id} event={event} />
                      ))
                  }
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {userRole === 'organizer' ? 'My Events' : 'My Events'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {userRole === 'organizer' 
                      ? 'Manage your events and track their performance.' 
                      : 'View and manage your event registrations.'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  {userRole === 'organizer' && (
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  )}
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
                    {userRole === 'organizer' ? (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Create Event</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Find Events</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userRole === 'organizer' 
                  ? organizerEvents.map(event => (
                      <OrganizerEventCard key={event.id} event={event} />
                    ))
                  : attendeeEvents.map(event => (
                      <AttendeeEventCard key={event.id} event={event} />
                    ))
                }
              </div>
            </div>
          )}

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

                {activeTab === 'attendees' && userRole === 'organizer' && (
                <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                    <h2 className="text-2xl font-bold text-gray-900">Attendees</h2>
                    <p className="text-gray-600 mt-1">Manage and communicate with your event attendees.</p>
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
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Send Message</span>
                    </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-medium text-gray-900">All Attendees</h3>
                    </div>
                    <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {[
                            { name: "John Doe", email: "john@example.com", event: "React Native Conference 2025", ticketType: "VIP", status: "confirmed" },
                            { name: "Jane Smith", email: "jane@example.com", event: "AI & Machine Learning Summit", ticketType: "Regular", status: "confirmed" },
                            { name: "Mike Johnson", email: "mike@example.com", event: "DevOps Workshop Series", ticketType: "Student", status: "pending" },
                        ].map((attendee, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-sm font-medium text-gray-700">{attendee.name.charAt(0)}</span>
                                </div>
                                <div className="font-medium text-gray-900">{attendee.name}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendee.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attendee.event}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attendee.ticketType}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                attendee.status === 'confirmed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {attendee.status === 'confirmed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {attendee.status === 'pending' && <AlertCircle className="w-3 h-3 mr-1" />}
                                {attendee.status.charAt(0).toUpperCase() + attendee.status.slice(1)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">View</button>
                                <button className="text-green-600 hover:text-green-900">Message</button>
                                </div>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
                </div>
                )}

                {activeTab === 'analytics' && userRole === 'organizer' && (
                <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                    <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                    <p className="text-gray-600 mt-1">Track your event performance and attendee engagement.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
                        <option>Last 30 days</option>
                        <option>Last 3 months</option>
                        <option>Last year</option>
                    </select>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Export Report</span>
                    </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">Event Performance</h3>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Views</span>
                        <span className="font-medium">12,543</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Conversion Rate</span>
                        <span className="font-medium text-green-600">24.5%</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg. Ticket Price</span>
                        <span className="font-medium">₦8,750</span>
                        </div>
                    </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">Revenue Growth</h3>
                        <DollarSign className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">This Month</span>
                        <span className="font-medium">₦45,200</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Last Month</span>
                        <span className="font-medium">₦38,950</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Growth</span>
                        <span className="font-medium text-green-600">+16.1%</span>
                        </div>
                    </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">Attendee Insights</h3>
                        <Users className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Repeat Attendees</span>
                        <span className="font-medium">68%</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg. Age</span>
                        <span className="font-medium">28 years</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Satisfaction</span>
                        <span className="font-medium text-green-600">4.8/5</span>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
                )}

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