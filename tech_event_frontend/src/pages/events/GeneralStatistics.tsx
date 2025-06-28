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
        
        // Fetch user's events to calculate general stats
        const eventsResponse = await api.get('/events/');
        let eventsData = [];
        
        if (eventsResponse.data.results) {
          eventsData = eventsResponse.data.results;
        } else if (Array.isArray(eventsResponse.data)) {
          eventsData = eventsResponse.data;
        }

        // Calculate general statistics
        const totalEvents = eventsData.length;
        const publishedEvents = eventsData.filter((event: any) => 
          event.status === 'PUBLISHED'
        ).length;

        // Set statistics with calculated or default values
        setStatistics({
          total_events: totalEvents,
          published_events: publishedEvents,
          total_tickets_sold: 0, // This would need a separate API call
          total_attendees: 0,    // This would need a separate API call
          total_revenue: 0       // This would need a separate API call
        });
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching general statistics:', err);
        setError('Failed to load statistics');
        
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-600 text-sm">{error}</p>
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
        subtitle="Events created"
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