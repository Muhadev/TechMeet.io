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
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState('organizer'); // organizer, attendee, admin

  // Mock data
  const stats = {
    totalEvents: 12,
    totalAttendees: 1247,
    totalRevenue: 89750,
    activeEvents: 3
  };

  const recentEvents = [
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

  const StatCard = ({ icon: Icon, title, value, change, changeType }) => (
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
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const EventCard = ({ event }) => (
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
                  placeholder="Search events, attendees..."
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
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
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'overview' 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Overview</span>
              </button>
              
              <button
                onClick={() => setActiveTab('events')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'events' 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Events</span>
              </button>
              
              <button
                onClick={() => setActiveTab('tickets')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'tickets' 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Ticket className="w-5 h-5" />
                <span className="font-medium">Tickets</span>
              </button>
              
              <button
                onClick={() => setActiveTab('attendees')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'attendees' 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Attendees</span>
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'analytics' 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Analytics</span>
              </button>
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
                  <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your events.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span><a href="events/create-event">Create Event</a></span>
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={Calendar} 
                  title="Total Events" 
                  value={stats.totalEvents} 
                  change={12} 
                  changeType="positive" 
                />
                <StatCard 
                  icon={Users} 
                  title="Total Attendees" 
                  value={stats.totalAttendees.toLocaleString()} 
                  change={8} 
                  changeType="positive" 
                />
                <StatCard 
                  icon={DollarSign} 
                  title="Total Revenue" 
                  value={`₦${stats.totalRevenue.toLocaleString()}`} 
                  change={15} 
                  changeType="positive" 
                />
                <StatCard 
                  icon={TrendingUp} 
                  title="Active Events" 
                  value={stats.activeEvents} 
                  change={25} 
                  changeType="positive" 
                />
              </div>

              {/* Recent Events */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Events</h2>
                  <p className="text-gray-600 mt-1">Manage your events and track their performance.</p>
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
                    <Plus className="w-4 h-4" />
                    <span>Create Event</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tickets</h2>
                  <p className="text-gray-600 mt-1">Track ticket sales and manage attendee registrations.</p>
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
                  <h3 className="font-medium text-gray-900">Recent Ticket Sales</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event & Attendee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
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

          {activeTab === 'attendees' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Attendees</h2>
                  <p className="text-gray-600 mt-1">Manage your event attendees and their information.</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees data</h3>
                <p className="text-gray-500">Attendee management features will be available here.</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                  <p className="text-gray-600 mt-1">Detailed insights and performance metrics.</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-500">Comprehensive analytics and reporting tools will be available here.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;