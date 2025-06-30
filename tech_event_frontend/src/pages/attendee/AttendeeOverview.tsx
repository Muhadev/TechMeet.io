import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  TrendingUp, 
  Activity,
  Search,
  ChevronRight,
  DollarSign,
  Target,
  Star
} from 'lucide-react';

interface AttendeeStats {
  overview: {
    total_tickets_purchased: number;
    pending_tickets: number;
    upcoming_events: number;
    past_events_attended: number;
    total_spent: number;
    attendance_rate: number;
  };
  engagement: {
    events_checked_into: number;
    recent_activity_30_days: number;
    favorite_categories: Array<{
      category: string;
      count: number;
    }>;
  };
  financial: {
    total_spending: number;
    average_ticket_price: number;
    monthly_spending_trend: Array<{
      month: string;
      amount: number;
    }>;
  };
}

interface DashboardSummary {
  next_event: {
    title: string;
    location: string;
    start_date: string;
    days_until: number;
    ticket_number: string;
    checked_in: boolean;
  } | null;
  total_events_attended: number;
  recent_activity_count: number;
  spending_this_year: number;
}

interface UpcomingEvent {
  ticket_id: number;
  ticket_number: string;
  ticket_type: string;
  checked_in: boolean;
  event: {
    id: number;
    title: string;
    location: string;
    start_date: string;
    end_date: string;
    category: string;
    banner_image: string | null;
    organizer_name: string;
  };
  days_until_event: number;
  is_soon: boolean;
}

const AttendeeOverview: React.FC = () => {
  const [stats, setStats] = useState<AttendeeStats | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendeeData();
  }, []);

  const fetchAttendeeData = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch all attendee data concurrently
      const [statsRes, summaryRes, upcomingRes] = await Promise.all([
        fetch('https://techmeetio.up.railway.app/api/attendee/statistics/', { headers }),
        fetch('https://techmeetio.up.railway.app/api/attendee/dashboard-summary/', { headers }),
        fetch('https://techmeetio.up.railway.app/api/attendee/upcoming-events/', { headers })
      ]);

      if (!statsRes.ok || !summaryRes.ok || !upcomingRes.ok) {
        throw new Error('Failed to fetch attendee data');
      }

      const [statsData, summaryData, upcomingData] = await Promise.all([
        statsRes.json(),
        summaryRes.json(),
        upcomingRes.json()
      ]);

      setStats(statsData);
      setSummary(summaryData);
      setUpcomingEvents(upcomingData.upcoming_events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={fetchAttendeeData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's your event activity and upcoming events.
          </p>
        </div>
        <button 
          onClick={() => navigate('/discover')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Discover Events</span>
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.overview.total_tickets_purchased}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.overview.upcoming_events} upcoming
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.overview.total_spent.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg: ${stats.financial.average_ticket_price.toFixed(2)}/ticket
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.overview.attendance_rate}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.engagement.events_checked_into} checked in
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.engagement.recent_activity_30_days}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Last 30 days
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Event Card */}
      {summary?.next_event && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Next Event</h3>
              <h4 className="text-xl font-bold mb-2">{summary.next_event.title}</h4>
              <div className="flex items-center space-x-4 text-blue-100">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{summary.next_event.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{formatDate(summary.next_event.start_date)}</span>
                </div>
              </div>
              <div className="mt-3 inline-flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
                <Ticket className="w-4 h-4 mr-1" />
                Ticket: {summary.next_event.ticket_number}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{summary.next_event.days_until}</div>
              <div className="text-sm text-blue-100">days to go</div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
              <button 
                onClick={() => navigate('/events')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <div key={event.ticket_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.event.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{event.event.location}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {event.event.category}
                        </span>
                        {event.is_soon && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            Soon
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(event.event.start_date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(event.event.start_date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming events</p>
                <button 
                  onClick={() => navigate('/discover')}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Discover events to attend
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Favorite Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Favorite Categories</h3>
          </div>
          <div className="p-6">
            {stats?.engagement.favorite_categories && stats.engagement.favorite_categories.length > 0 ? (
              <div className="space-y-4">
                {stats.engagement.favorite_categories.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Star className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{category.category}</p>
                        <p className="text-sm text-gray-500">{category.count} events attended</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No favorite categories yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Attend more events to see your preferences
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/discover')}
            className="flex items-center justify-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-700">Discover Events</span>
          </button>
          <button 
            onClick={() => navigate('/tickets')}
            className="flex items-center justify-center space-x-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Ticket className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-700">My Tickets</span>
          </button>
          <button 
            onClick={() => navigate('/favorites')}
            className="flex items-center justify-center space-x-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Star className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-700">Favorites</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendeeOverview;