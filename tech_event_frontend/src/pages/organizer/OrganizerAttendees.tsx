import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Download, Mail, Calendar, MapPin, Phone, UserCheck } from 'lucide-react';
import api from '../../lib/axios';

interface Attendee {
  id: string;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  ticket_number: string;
  ticket_type: string;
  event_title: string;
  event_date: string;
  purchase_date: string;
  checked_in: boolean;
  checked_in_time?: string;
  payment_status: string;
}

interface AttendeeStats {
  total_attendees: number;
  checked_in_count: number;
  upcoming_events_attendees: number;
  recent_registrations: number;
}

interface Event {
  id: string;
  title: string;
}

const OrganizerAttendees: React.FC = () => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [stats, setStats] = useState<AttendeeStats>({
    total_attendees: 0,
    checked_in_count: 0,
    upcoming_events_attendees: 0,
    recent_registrations: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    event: 'all',
    status: 'all',
    checkedIn: 'all'
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [bulkEmailLoading, setBulkEmailLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAttendeeData();
  }, [filters, searchTerm]);

  const fetchInitialData = async () => {
    try {
      await Promise.all([
        fetchEvents(),
        fetchAttendeeStats()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load initial data');
    }
  };

  const fetchAttendeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (filters.event !== 'all') {
        params.append('event', filters.event);
      }
      
      if (filters.status !== 'all') {
        params.append('payment_status', filters.status);
      }
      
      if (filters.checkedIn !== 'all') {
        params.append('checked_in', filters.checkedIn);
      }

      const response = await api.get(`/auth/organizer/attendees/?${params.toString()}`);
      setAttendees(response.data.results || response.data);
    } catch (error: any) {
      console.error('Error fetching attendee data:', error);
      setError(error.response?.data?.error || 'Failed to fetch attendees');
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendeeStats = async () => {
    try {
      const response = await api.get('/auth/organizer/attendee-stats/');
      setStats(response.data);
    } catch (error: any) {
      console.error('Error fetching attendee stats:', error);
      // Don't set error state here as this is not critical
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get('/auth/organizer/events/');
      const eventData = response.data.results || response.data;
      setEvents(eventData.map((event: any) => ({
        id: event.id.toString(),
        title: event.title
      })));
    } catch (error: any) {
      console.error('Error fetching events:', error);
      // Don't set error state here as this is not critical for the main functionality
    }
  };

  const handleCheckIn = async (attendeeId: string) => {
    try {
      await api.patch(`/auth/organizer/attendees/${attendeeId}/check-in/`);
      
      // Update local state
      setAttendees(prev => 
        prev.map(attendee => 
          attendee.id === attendeeId 
            ? { ...attendee, checked_in: true, checked_in_time: new Date().toISOString() }
            : attendee
        )
      );

      // Update stats
      setStats(prev => ({
        ...prev,
        checked_in_count: prev.checked_in_count + 1
      }));
    } catch (error: any) {
      console.error('Error checking in attendee:', error);
      alert(error.response?.data?.error || 'Failed to check in attendee');
    }
  };

  const handleSelectAttendee = (attendeeId: string) => {
    setSelectedAttendees(prev => 
      prev.includes(attendeeId)
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAttendees.length === attendees.length) {
      setSelectedAttendees([]);
    } else {
      setSelectedAttendees(attendees.map(a => a.id));
    }
  };

  const exportAttendees = async () => {
    try {
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (filters.event !== 'all') {
        params.append('event', filters.event);
      }
      
      if (filters.status !== 'all') {
        params.append('payment_status', filters.status);
      }
      
      if (filters.checkedIn !== 'all') {
        params.append('checked_in', filters.checkedIn);
      }

      params.append('export', 'csv');

      const response = await api.get(`/auth/organizer/attendees/?${params.toString()}`, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendees-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error exporting attendees:', error);
      alert(error.response?.data?.error || 'Failed to export attendees');
    }
  };

  const sendBulkEmail = async () => {
    if (selectedAttendees.length === 0) {
      alert('Please select attendees to send email to');
      return;
    }

    const subject = prompt('Enter email subject:');
    if (!subject) return;

    const message = prompt('Enter email message:');
    if (!message) return;

    try {
      setBulkEmailLoading(true);
      await api.post('/auth/organizer/attendees/bulk-email/', {
        attendee_ids: selectedAttendees,
        subject: subject,
        message: message
      });
      
      alert(`Email sent to ${selectedAttendees.length} attendees`);
      setSelectedAttendees([]);
    } catch (error: any) {
      console.error('Error sending bulk email:', error);
      alert(error.response?.data?.error || 'Failed to send emails');
    } finally {
      setBulkEmailLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  if (loading && attendees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Attendees</h1>
          <p className="text-gray-600">Manage your event attendees and track check-ins</p>
        </div>
        <button
          onClick={exportAttendees}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Attendees"
          value={stats.total_attendees}
          color="bg-blue-600"
        />
        <StatCard
          icon={UserCheck}
          title="Checked In"
          value={stats.checked_in_count}
          subtitle={`${Math.round((stats.checked_in_count / stats.total_attendees) * 100) || 0}% check-in rate`}
          color="bg-green-600"
        />
        <StatCard
          icon={Calendar}
          title="Upcoming Events"
          value={stats.upcoming_events_attendees}
          subtitle="Attendees registered"
          color="bg-purple-600"
        />
        <StatCard
          icon={Mail}
          title="Recent Registrations"
          value={stats.recent_registrations}
          subtitle="Last 30 days"
          color="bg-orange-600"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search attendees by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filters.event}
              onChange={(e) => setFilters(prev => ({ ...prev, event: e.target.value }))}
              className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Events</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Paid</option>
              <option value="PENDING">Pending</option>
            </select>
            <select
              value={filters.checkedIn}
              onChange={(e) => setFilters(prev => ({ ...prev, checkedIn: e.target.value }))}
              className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Check-ins</option>
              <option value="true">Checked In</option>
              <option value="false">Not Checked In</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedAttendees.length === attendees.length && attendees.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <h3 className="ml-3 text-lg font-medium text-gray-900">
              Attendees ({attendees.length})
            </h3>
            {loading && <div className="ml-2 text-sm text-gray-500">Loading...</div>}
          </div>
          {selectedAttendees.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedAttendees.length} selected
              </span>
              <button 
                onClick={sendBulkEmail}
                disabled={bulkEmailLoading}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
              >
                {bulkEmailLoading ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendees.map((attendee) => (
                <tr key={attendee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedAttendees.includes(attendee.id)}
                      onChange={() => handleSelectAttendee(attendee.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {/* <span className="text-sm font-medium text-gray-700 flex items-center justify-center"> */}
                        <span className="text-sm font-medium text-gray-700">
                          {attendee.first_name.charAt(0)}{attendee.last_name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {attendee.first_name} {attendee.last_name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {attendee.email}
                        </div>
                        {attendee.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {attendee.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {attendee.event_title}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(attendee.event_date).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{attendee.ticket_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {attendee.ticket_type}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(attendee.purchase_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        attendee.payment_status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {attendee.payment_status === 'COMPLETED' ? 'Paid' : 'Pending'}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        attendee.checked_in 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {attendee.checked_in ? 'Checked In' : 'Not Checked In'}
                      </span>
                      {attendee.checked_in && attendee.checked_in_time && (
                        <div className="text-xs text-gray-500">
                          {new Date(attendee.checked_in_time).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!attendee.checked_in && attendee.payment_status === 'COMPLETED' && (
                      <button
                        onClick={() => handleCheckIn(attendee.id)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                      >
                        Check In
                      </button>
                    )}
                    {attendee.checked_in && (
                      <span className="text-green-600 font-medium">✓ Checked In</span>
                    )}
                    {attendee.payment_status !== 'COMPLETED' && (
                      <span className="text-yellow-600 font-medium">Payment Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {attendees.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No attendees found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filters.event !== 'all' || filters.status !== 'all' || filters.checkedIn !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No attendees have registered for your events yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerAttendees;