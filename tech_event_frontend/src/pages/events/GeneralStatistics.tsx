import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Ticket, 
  TrendingUp, 
  Target,
  LucideIcon
} from 'lucide-react';
import api from '../../lib/axios';

// Type definitions
interface GeneralStats {
  total_events: number;
  published_events: number;
  total_tickets_sold: number;
  total_attendees: number;
  total_revenue: number;
}

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: keyof typeof colorClasses;
  loading?: boolean;
}

// Color classes
const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  red: 'bg-red-50 text-red-600'
} as const;

// Stat Card Component
const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  color = 'blue',
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// Main General Statistics Component
const GeneralStatistics: React.FC = () => {
  const [statistics, setStatistics] = useState<GeneralStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGeneralStatistics = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user's events to calculate general stats
        const eventsResponse = await api.get('/events/');
        let eventsData = [];
        
        // Handle different response structures
        if (eventsResponse.data && eventsResponse.data.results) {
          eventsData = eventsResponse.data.results;
        } else if (Array.isArray(eventsResponse.data)) {
          eventsData = eventsResponse.data;
        } else {
          console.warn('Unexpected events data structure:', eventsResponse.data);
          eventsData = [];
        }

        // Calculate general statistics
        const totalEvents = eventsData.length;
        const publishedEvents = eventsData.filter((event: any) => 
          event.status === 'PUBLISHED'
        ).length;

        // For now, set tickets and revenue to 0 as these need separate API calls
        // You can enhance this later to fetch ticket data if needed
        setStatistics({
          total_events: totalEvents,
          published_events: publishedEvents,
          total_tickets_sold: 0,
          total_attendees: 0,
          total_revenue: 0
        });
        
      } catch (err: any) {
        console.error('Error fetching general statistics:', err);
        
        // Set error message based on error type
        if (err.response?.status === 401) {
          setError('Please log in to view statistics');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view this data');
        } else {
          setError('Failed to load statistics. Please try again.');
        }
        
        // Set default statistics on error
        setStatistics({
          total_events: 0,
          published_events: 0,
          total_tickets_sold: 0,
          total_attendees: 0,
          total_revenue: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGeneralStatistics();
  }, []);

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {/* Total Events */}
      <StatCard
        icon={Calendar}
        title="Total Events"
        value={statistics?.total_events ?? 0}
        subtitle={statistics?.total_events === 1 ? "Event created" : "Events created"}
        color="blue"
        loading={loading}
      />

      {/* Published Events */}
      <StatCard
        icon={Target}
        title="Published Events"
        value={statistics?.published_events ?? 0}
        subtitle="Live events"
        color="green"
        loading={loading}
      />

      {/* Tickets Sold */}
      <StatCard
        icon={Ticket}
        title="Tickets Sold"
        value={statistics?.total_tickets_sold ?? 0}
        subtitle="Across all events"
        color="purple"
        loading={loading}
      />

      {/* Total Attendees */}
      <StatCard
        icon={Users}
        title="Total Attendees"
        value={statistics?.total_attendees ?? 0}
        subtitle="Registered attendees"
        color="indigo"
        loading={loading}
      />

      {/* Revenue */}
      <StatCard
        icon={TrendingUp}
        title="Revenue"
        value={`₦${(statistics?.total_revenue ?? 0).toLocaleString()}`}
        subtitle="Total earnings"
        color="orange"
        loading={loading}
      />
    </div>
  );
};

export default GeneralStatistics;