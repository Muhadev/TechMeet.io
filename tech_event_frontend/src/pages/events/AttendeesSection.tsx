import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { 
  Users, 
  Filter, 
  Download, 
  Mail, 
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  UserCheck,
  Eye,
  MessageSquare,
  RefreshCw,
  Loader2
} from 'lucide-react';

// Add this component inside your Dashboard component where the attendees section is
const AttendeesSection = () => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    pending: 0
  });

  // Fetch user's events for the dropdown
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch attendees when selected event changes
  useEffect(() => {
    if (selectedEvent) {
      fetchAttendees(selectedEvent);
    }
  }, [selectedEvent]);

  // Calculate stats whenever attendees change
  useEffect(() => {
    calculateStats();
  }, [attendees]);

  const fetchEvents = async () => {
  try {
    const response = await api.get('/events/');
    
    if (response.status === 200) {
      const data = response.data;
      setEvents(data.results || data);
      // Auto-select first event if available
      if (data.results && data.results.length > 0) {
        setSelectedEvent(data.results[0].id);
      } else if (data.length > 0) {
        setSelectedEvent(data[0].id);
      }
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

  const fetchAttendees = async (eventId) => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await api.get(`/events/${eventId}/attendees/`);
    
    if (response.status === 200) {
      setAttendees(response.data);
    }
  } catch (error) {
    setError(error.message);
    setAttendees([]);
  } finally {
    setLoading(false);
  }
};


  const calculateStats = () => {
    const total = attendees.length;
    const checkedIn = attendees.filter(attendee => attendee.checked_in).length;
    const pending = total - checkedIn;
    
    setStats({ total, checkedIn, pending });
  };

  const handleRefresh = () => {
    if (selectedEvent) {
      fetchAttendees(selectedEvent);
    }
  };

  const handleCheckIn = async (attendeeId, ticketNumber) => {
  try {
    const response = await api.post('/tickets/check_in/', {
      ticket_number: ticketNumber
    });

    if (response.status === 200) {
      // Refresh attendees list
      fetchAttendees(selectedEvent);
    }
  } catch (error) {
    console.error('Error checking in attendee:', error);
    alert('Failed to check in attendee. Please try again.');
  }
};

  const handleExport = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Ticket Number', 'Ticket Type', 'Check-in Status', 'Check-in Time'];
    const csvContent = [
      headers.join(','),
      ...filteredAttendees.map(attendee => [
        `"${attendee.name}"`,
        attendee.email,
        attendee.ticket_number,
        attendee.ticket_type,
        attendee.checked_in ? 'Checked In' : 'Not Checked In',
        attendee.checked_in_time ? new Date(attendee.checked_in_time).toLocaleString() : 'N/A'
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees-${selectedEvent}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Filter attendees based on search term
  const filteredAttendees = attendees.filter(attendee =>
    attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.ticket_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (checkedIn) => {
    if (checkedIn) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <Clock className="w-4 h-4 text-yellow-600" />;
  };

  const getStatusBadge = (checkedIn, checkedInTime) => {
    if (checkedIn) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Checked In
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendees</h2>
          <p className="text-gray-600 mt-1">Manage and communicate with your event attendees.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={handleExport}
            disabled={filteredAttendees.length === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Send Message</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Attendees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Checked In</p>
              <p className="text-2xl font-bold text-gray-900">{stats.checkedIn}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select an event...</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Attendees</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or ticket number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">
            {selectedEvent ? `Attendees (${filteredAttendees.length})` : 'Select an event to view attendees'}
          </h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading attendees...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading attendees</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={handleRefresh}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : !selectedEvent ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No event selected</h3>
              <p className="text-gray-600">Please select an event to view its attendees.</p>
            </div>
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No attendees match your search criteria.' : 'This event has no registered attendees yet.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendees.map((attendee, index) => (
                  <tr key={`${attendee.user_id}-${attendee.ticket_number}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-white">
                            {attendee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{attendee.name}</div>
                          <div className="text-sm text-gray-500">{attendee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{attendee.ticket_number}</div>
                        <div className="text-sm text-gray-500 capitalize">{attendee.ticket_type.toLowerCase()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(attendee.checked_in, attendee.checked_in_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendee.checked_in_time 
                        ? new Date(attendee.checked_in_time).toLocaleString()
                        : 'Not checked in'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {!attendee.checked_in && (
                          <button 
                            onClick={() => handleCheckIn(attendee.user_id, attendee.ticket_number)}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            Check In
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-900 font-medium">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 font-medium">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AttendeesSection;
