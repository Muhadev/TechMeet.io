import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Ticket, ExternalLink, CheckCircle } from 'lucide-react';

interface Event {
  ticket_id: string;
  ticket_number: string;
  ticket_type: string;
  checked_in: boolean;
  event: {
    id: string;
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

const AttendeeEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      let endpoint = '/api/attendee/upcoming-events/';
      if (filter !== 'upcoming') {
        endpoint = `/api/attendee/ticket-history/?status=${filter}`;
      }

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (filter === 'upcoming') {
          setEvents(data.upcoming_events || []);
        } else {
          setEvents(data.tickets || []);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
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

  const getEventStatus = (event: Event) => {
    if (filter === 'past') return 'completed';
    if (event.is_soon) return 'soon';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'soon':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        
        <div className="flex space-x-2">
          {(['upcoming', 'past', 'all'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'upcoming' 
              ? "You don't have any upcoming events." 
              : "No events match your current filter."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((eventData) => {
            const status = getEventStatus(eventData);
            const event = eventData.event;
            
            return (
              <div
                key={eventData.ticket_id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  {/* Event Image */}
                  <div className="w-32 h-32 bg-gray-200 flex-shrink-0">
                    {event.banner_image ? (
                      <img
                        src={event.banner_image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                        <Calendar className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {event.title}
                        </h3>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>
                              {formatDate(event.start_date)} at {formatTime(event.start_date)}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{event.location}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Ticket className="h-4 w-4 mr-2" />
                            <span>Ticket #{eventData.ticket_number}</span>
                            {eventData.checked_in && (
                              <CheckCircle className="h-4 w-4 ml-2 text-green-600" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                          {status === 'soon' ? `${eventData.days_until_event} days left` : 
                           status === 'completed' ? 'Completed' : 'Upcoming'}
                        </span>
                        
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {event.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600">
                        Organized by {event.organizer_name}
                      </span>
                      
                      <div className="flex space-x-2">
                        {eventData.checked_in && (
                          <span className="flex items-center text-sm text-green-600 font-medium">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Checked In
                          </span>
                        )}
                        
                        <button className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                          View Details
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttendeeEvents;