import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Ticket
} from 'lucide-react';

// Type definitions
interface TicketType {
  ticket_type: string;
  count: number;
}

interface EventStatistics {
  total_tickets: number;
  sold_tickets: number;
  checked_in: number;
  available_capacity: number;
  occupancy_rate: number;
  ticket_types?: TicketType[];
}

interface Event {
  id: number;
  title: string;
  date: string;
  price?: number;
  statistics?: EventStatistics;
}

interface EventWithStatistics extends Event {
  statistics: EventStatistics;
}

interface OverviewData {
  totalEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  avgOccupancyRate: number;
}

interface AnalyticsData {
  overview: OverviewData;
  events: EventWithStatistics[];
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

interface EventAnalyticsCardProps {
  event: EventWithStatistics;
}

const AnalyticsSection: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: {
      totalEvents: 0,
      totalRevenue: 0,
      totalAttendees: 0,
      avgOccupancyRate: 0
    },
    events: []
  });

  const [userEvents, setUserEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchUserEvents();
  }, []);

  useEffect(() => {
    if (userEvents.length > 0) {
      fetchAnalyticsData();
    }
  }, [selectedPeriod, selectedEvent, userEvents]);

  const fetchUserEvents = async (): Promise<void> => {
    try {
      // Fetch events where current user is the organizer
      const response = await api.get('/events/?organizer=me');
      // If that doesn't work, try just getting all events and filtering client-side
      // const response = await api.get('/events/');
      setUserEvents(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching user events:', error);
      setUserEvents([]);
    }
  };

  const fetchAnalyticsData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      let overview: OverviewData = {
        totalEvents: 0,
        totalRevenue: 0,
        totalAttendees: 0,
        avgOccupancyRate: 0
      };
      let eventsData: EventWithStatistics[] = [];

      if (selectedEvent === 'all') {
        // Fetch analytics for all events using axios
        const promises = userEvents.map(async (event: Event) => {
          try {
            const response = await api.get(`/events/${event.id}/statistics/`);
            return {
              ...event,
              statistics: response.data
            } as EventWithStatistics;
          } catch (error) {
            console.error(`Error fetching stats for event ${event.id}:`, error);
            return null;
          }
        });

        const results = await Promise.all(promises);
        eventsData = results.filter((item): item is EventWithStatistics => item !== null);

        // Calculate overview metrics - Fix occupancy rate calculation
        overview = eventsData.reduce((acc: OverviewData, event: EventWithStatistics) => {
          const stats = event.statistics;
          return {
            totalEvents: acc.totalEvents + 1,
            totalRevenue: acc.totalRevenue + (stats.sold_tickets * (event.price || 0)),
            totalAttendees: acc.totalAttendees + stats.sold_tickets,
            // API returns occupancy_rate as decimal, so multiply by 100 for percentage
            // API returns occupancy_rate as percentage already
            avgOccupancyRate: acc.avgOccupancyRate + stats.occupancy_rate
          };
        }, overview);

        if (eventsData.length > 0) {
          overview.avgOccupancyRate = overview.avgOccupancyRate / eventsData.length;
        }

      } else {
        // Fetch analytics for specific event using axios
        const response = await api.get(`/events/${selectedEvent}/statistics/`);
        const stats: EventStatistics = response.data;
        const event = userEvents.find((e: Event) => e.id.toString() === selectedEvent);
        
        if (event) {
          eventsData = [{
            ...event,
            statistics: stats
          }];

          overview = {
            totalEvents: 1,
            totalRevenue: stats.sold_tickets * (event.price || 0),
            totalAttendees: stats.sold_tickets,
            // API returns occupancy_rate as decimal, so multiply by 100 for percentage
            avgOccupancyRate: stats.occupancy_rate
          };
        }
      }

      setAnalyticsData({
        overview,
        events: eventsData
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = (): void => {
    fetchAnalyticsData();
  };

  const exportReport = (): void => {
    // Implement export functionality
    const csvContent = generateCSVReport();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSVReport = (): string => {
    const headers = ['Event Name', 'Total Tickets', 'Sold Tickets', 'Checked In', 'Available Capacity', 'Occupancy Rate'];
    const rows = analyticsData.events.map((event: EventWithStatistics) => [
      event.title,
      event.statistics.total_tickets,
      event.statistics.sold_tickets,
      event.statistics.checked_in,
      event.statistics.available_capacity,
      `${(event.statistics.occupancy_rate * 100).toFixed(2)}%`
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <Icon className={`w-5 h-5 text-${color}-500`} />
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
      </div>
    </div>
  );

  const EventAnalyticsCard: React.FC<EventAnalyticsCardProps> = ({ event }) => {
    const stats = event.statistics;
    const occupancyPercentage = stats.occupancy_rate.toFixed(1);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{event.title}</h3>
            <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            parseFloat(occupancyPercentage) >= 80 
              ? 'bg-green-100 text-green-800' 
              : parseFloat(occupancyPercentage) >= 50 
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {occupancyPercentage}% Occupied
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.sold_tickets}</div>
            <div className="text-sm text-blue-600">Sold Tickets</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.checked_in}</div>
            <div className="text-sm text-green-600">Checked In</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Capacity:</span>
            <span className="font-medium">{stats.total_tickets}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Available:</span>
            <span className="font-medium">{stats.available_capacity}</span>
          </div>
          
          {/* Occupancy Rate Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Occupancy Rate:</span>
              <span className="font-medium">{occupancyPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  parseFloat(occupancyPercentage) >= 80 
                    ? 'bg-green-500' 
                    : parseFloat(occupancyPercentage) >= 50 
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${occupancyPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Ticket Types Breakdown */}
          {stats.ticket_types && stats.ticket_types.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Ticket Types</h4>
              <div className="space-y-2">
                {stats.ticket_types.map((type: TicketType, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 capitalize">{type.ticket_type.toLowerCase()}</span>
                    <span className="font-medium">{type.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600 mt-1">Track your event performance and attendee engagement.</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedEvent} 
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="all">All Events</option>
            {userEvents.map((event: Event) => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <button 
            onClick={handleRefresh}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={exportReport}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
          <button 
            onClick={handleRefresh}
            className="ml-auto text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Calendar}
          title="Total Events"
          value={analyticsData.overview.totalEvents}
          subtitle={selectedEvent === 'all' ? 'All events' : 'Selected event'}
          color="blue"
        />
        <StatCard
          icon={Users}
          title="Total Attendees"
          value={analyticsData.overview.totalAttendees.toLocaleString()}
          subtitle="Tickets sold"
          color="green"
        />
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`₦${analyticsData.overview.totalRevenue.toLocaleString()}`}
          subtitle="From ticket sales"
          color="purple"
        />
        <StatCard
          icon={Target}
          title="Avg Occupancy"
          value={`${analyticsData.overview.avgOccupancyRate.toFixed(1)}%`}
          subtitle="Capacity utilization"
          color="orange"
        />
      </div>

      {/* Individual Event Analytics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {selectedEvent === 'all' ? 'Event Performance' : 'Event Details'}
        </h3>
        
        {analyticsData.events.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Create your first event to see analytics data here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyticsData.events.map((event: EventWithStatistics) => (
              <EventAnalyticsCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Additional Insights */}
      {analyticsData.events.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-medium text-gray-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {analyticsData.events.filter((e: EventWithStatistics) => e.statistics.occupancy_rate >= 0.8).length}
              </div>
              <div className="text-sm text-gray-600">High-performing events (80%+ occupancy)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {analyticsData.events.reduce((sum: number, e: EventWithStatistics) => sum + e.statistics.checked_in, 0)}
              </div>
              <div className="text-sm text-gray-600">Total attendees checked in</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {((analyticsData.events.reduce((sum: number, e: EventWithStatistics) => sum + e.statistics.checked_in, 0) / 
                   analyticsData.events.reduce((sum: number, e: EventWithStatistics) => sum + e.statistics.sold_tickets, 0)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Average check-in rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsSection;