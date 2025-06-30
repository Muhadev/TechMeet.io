import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, Download, Eye, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface TicketData {
  id: string;
  ticket_number: string;
  ticket_type: string;
  payment_status: string;
  checked_in: boolean;
  created_at: string;
  event: {
    id: string;
    title: string;
    location: string;
    start_date: string;
    end_date: string;
    category: string;
    ticket_price: number;
    banner_image: string | null;
    organizer_name: string;
  };
}

interface PaginationInfo {
  total_count: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_previous: boolean;
}

const AttendeeTickets: React.FC = () => {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total_count: 0,
    limit: 10,
    offset: 0,
    has_next: false,
    has_previous: false
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter, pagination.offset]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const params = new URLSearchParams({
        status: statusFilter,
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });
      
      if (categoryFilter) {
        params.append('category', categoryFilter);
      }

      const response = await fetch(`http://localhost:8000/api/attendee/ticket-history/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newOffset: number) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTicketStatus = (ticket: TicketData) => {
    const now = new Date();
    const eventStart = new Date(ticket.event.start_date);
    const eventEnd = new Date(ticket.event.end_date);
    
    if (eventEnd < now) return 'completed';
    if (eventStart > now) return 'upcoming';
    return 'ongoing';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const downloadTicket = (ticket: TicketData) => {
    // Mock implementation - would generate/download actual ticket
    console.log('Downloading ticket:', ticket.ticket_number);
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
        
        <div className="flex space-x-4">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'upcoming' | 'past')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past Events</option>
          </select>

          {/* Category Filter */}
          <input
            type="text"
            placeholder="Filter by category..."
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Ticket className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total_count}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Checked In</p>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter(t => t.checked_in).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter(t => getTicketStatus(t) === 'upcoming').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                ${tickets.reduce((sum, t) => sum + (t.event.ticket_price || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <Ticket className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't purchased any tickets yet.
          </p>
        </div>
      ) : (
        <>
          {/* Tickets List */}
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const status = getTicketStatus(ticket);
              
              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {ticket.event.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                          {ticket.checked_in && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>
                                {formatDate(ticket.event.start_date)} at {formatTime(ticket.event.start_date)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{ticket.event.location}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Ticket className="h-4 w-4 mr-2" />
                              <span>#{ticket.ticket_number}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2" />
                              <span>${ticket.event.ticket_price}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs text-center">
                          {ticket.event.category}
                        </span>
                        <span className="text-xs text-gray-500 text-center">
                          Purchased {formatDate(ticket.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600">
                        Organized by {ticket.event.organizer_name}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => downloadTicket(ticket)}
                          className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>
                        
                        <button className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors">
                          <Eye className="h-4 w-4 mr-1" />
                          View Event
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.total_count > pagination.limit && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">
                Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total_count)} of {pagination.total_count} tickets
              </p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.offset - pagination.limit)}
                  disabled={!pagination.has_previous}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <button
                  onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                  disabled={!pagination.has_next}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendeeTickets;