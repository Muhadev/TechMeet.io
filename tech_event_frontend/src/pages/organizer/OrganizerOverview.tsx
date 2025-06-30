import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios'; // Using your axios configuration
import { 
  Calendar, 
  Users, 
  Ticket, 
  TrendingUp,
  DollarSign,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface OrganizerStats {
  overview: {
    total_events: number;
    active_events: number;
    total_tickets_sold: number;
    total_revenue: number;
    total_attendees: number;
    average_attendance_rate: number;
  };
  recent_activity: {
    new_registrations_today: number;
    events_this_month: number;
    revenue_this_month: number;
  };
  top_performing_events: Array<{
    id: number;
    title: string;
    tickets_sold: number;
    revenue: number;
    attendance_rate: number;
  }>;
}

interface RecentEvent {
  id: number;
  title: string;
  start_date: string;
  status: string;
  tickets_sold: number;
  capacity: number;
  revenue: number;
}

const OrganizerOverview: React.FC = () => {
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const fetchOrganizerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch organizer statistics - corrected endpoint
      const statsResponse = await api.get('/auth/organizer/statistics/');
      setStats(statsResponse.data);

      // Fetch recent events - corrected endpoint
      const eventsResponse = await api.get('/auth/organizer/dashboard-summary/');
      // Ensure recent_events is always an array
      const recentEventsData = eventsResponse.data.recent_events || [];
      setRecentEvents(Array.isArray(recentEventsData) ? recentEventsData : []);

    } catch (err: any) {
      console.error('Error fetching organizer data:', err);
      
      // Handle different types of errors
      if (err.response?.status === 403) {
        setError('You do not have permission to access this information.');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(err.message || 'Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRetry = () => {
    fetchOrganizerData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.first_name || 'Organizer'}!
        </h1>
        <p className="text-gray-600">
          Here's how your events are performing today.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.overview.total_events}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.overview.active_events} active
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Ticket className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.overview.total_tickets_sold}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.overview.total_revenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Attendees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.overview.total_attendees}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.overview.average_attendance_rate}% avg attendance
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Registrations</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.recent_activity.new_registrations_today}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Events This Month</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.recent_activity.events_this_month}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue This Month</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(stats.recent_activity.revenue_this_month)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Events</h3>
            <div className="space-y-3">
              {stats.top_performing_events.length > 0 ? (
                stats.top_performing_events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {event.tickets_sold} tickets sold • {event.attendance_rate}% attendance
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(event.revenue)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No top performing events data available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Events</h3>
          {recentEvents.length > 0 && (
            <p className="text-sm text-gray-500">Showing {recentEvents.length} most recent events</p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentEvents && recentEvents.length > 0 ? (
                recentEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(event.start_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {event.tickets_sold} / {event.capacity}
                      </div>
                      <div className="text-xs text-gray-500">
                        {event.capacity > 0 ? Math.round((event.tickets_sold / event.capacity) * 100) : 0}% sold
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(event.revenue)}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No events found</p>
                    <p>You haven't created any events yet. Create your first event to get started!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrganizerOverview;