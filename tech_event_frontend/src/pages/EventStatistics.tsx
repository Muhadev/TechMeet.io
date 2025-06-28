import { useState, useEffect } from 'react';
import { 
  Ticket, 
  UserCheck, 
  TrendingUp,
  Calendar,
  Target,
  LucideIcon
} from 'lucide-react';
import api from '../lib/axios';

// Type definitions
interface TicketType {
  ticket_type: string;
  // Add other properties as needed
}

interface EventStatistics {
  total_tickets: number;
  sold_tickets: number;
  checked_in: number;
  occupancy_rate: number;
  ticket_types: TicketType[];
}

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: keyof typeof colorClasses;
}

interface EventStatisticsProps {
  eventId: string | number;
}

// Color classes type
const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  red: 'bg-red-50 text-red-600'
} as const;

// Individual Stat Card Component
const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  color = 'blue' 
}) => {
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

// Main Event Statistics Component
const EventStatistics: React.FC<EventStatisticsProps> = ({ eventId }) => {
  const [statistics, setStatistics] = useState<EventStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Check if eventId exists before making the request
      if (!eventId) {
        setError('No event ID provided');
        return;
      }
      
      const response = await api.get<EventStatistics>(`/events/${eventId}/statistics/`);
      setStatistics(response.data);
      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error('Error fetching event statistics:', err);
      
      // Handle different error types
      if (err.response?.status === 404) {
        setError('Event not found or statistics not available');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view these statistics');
      } else if (err.response?.status === 401) {
        setError('Please log in to view statistics');
      } else {
        setError('Failed to load statistics');
      }
      
      // Set default statistics for error state
      setStatistics({
        total_tickets: 0,
        sold_tickets: 0,
        checked_in: 0,
        occupancy_rate: 0,
        ticket_types: []
      });
    } finally {
      setLoading(false);
    }
  };

    if (eventId) {
      fetchStatistics();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
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
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  // Calculate derived metrics
  const soldPercentage = statistics.total_tickets > 0 
    ? Math.round((statistics.sold_tickets / statistics.total_tickets) * 100) 
    : 0;

  const checkInPercentage = statistics.sold_tickets > 0 
    ? Math.round((statistics.checked_in / statistics.sold_tickets) * 100) 
    : 0;

  const occupancyPercentage = Math.round(statistics.occupancy_rate * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {/* Total Tickets */}
      <StatCard
        icon={Ticket}
        title="Total Tickets"
        value={statistics.total_tickets.toLocaleString()}
        subtitle="Created for this event"
        color="blue"
      />

      {/* Sold Tickets */}
      <StatCard
        icon={Target}
        title="Sold Tickets"
        value={statistics.sold_tickets.toLocaleString()}
        subtitle={`${soldPercentage}% of total tickets`}
        color="green"
      />

      {/* Checked In */}
      <StatCard
        icon={UserCheck}
        title="Checked In"
        value={statistics.checked_in.toLocaleString()}
        subtitle={`${checkInPercentage}% of sold tickets`}
        color="purple"
      />

      {/* Occupancy Rate */}
      <StatCard
        icon={TrendingUp}
        title="Occupancy Rate"
        value={`${occupancyPercentage}%`}
        subtitle="Current event capacity"
        color="indigo"
      />

      {/* Ticket Types */}
      <StatCard
        icon={Calendar}
        title="Ticket Types"
        value={statistics.ticket_types.length}
        subtitle={`${statistics.ticket_types[0]?.ticket_type || 'N/A'} available`}
        color="red"
      />
    </div>
  );
};

// Usage Example:
// <EventStatistics eventId={4} />

export { StatCard, EventStatistics };
export default EventStatistics;