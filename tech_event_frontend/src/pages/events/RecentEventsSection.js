import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, Eye, Edit, MoreHorizontal, Loader2, AlertCircle } from 'lucide-react';
const RecentEventsSection = () => {
    const [recentEvents, setRecentEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    // Fetch recent events from API
    useEffect(() => {
        const fetchRecentEvents = async () => {
            try {
                setLoading(true);
                const response = await api.get('/events/');
                // Sort by created_at and get only the 3 most recent
                const sortedEvents = response.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setRecentEvents(sortedEvents.slice(0, 3));
                setError(null);
            }
            catch (err) {
                console.error('Error fetching recent events:', err);
                setError('Failed to load recent events. Please try again.');
            }
            finally {
                setLoading(false);
            }
        };
        fetchRecentEvents();
    }, []);
    // Get image URL helper function (same as in MyEventsSection)
    const getImageUrl = (imageUrl) => {
        if (!imageUrl)
            return null;
        // If the URL already starts with http:// or https://, return as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const serverURL = baseURL.replace('/api', '');
        const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
        return `${serverURL}${cleanImageUrl}`;
    };
    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    // Format time for display
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };
    // Get status badge styling
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'published':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    // Event Card Component
    const EventCard = ({ event }) => (_jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "relative h-48 bg-gray-200", children: [event.banner_image ? (_jsx("img", { src: getImageUrl(event.banner_image) || undefined, alt: event.title, className: "w-full h-full object-cover", onError: (e) => {
                            const target = e.target;
                            target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop';
                        } })) : (_jsx("div", { className: "w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center", children: _jsx(Calendar, { className: "w-12 h-12 text-gray-400" }) })), _jsx("div", { className: "absolute top-3 right-3", children: _jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(event.status)}`, children: event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1).toLowerCase() : 'Draft' }) }), event.category && (_jsx("div", { className: "absolute top-3 left-3", children: _jsx("div", { className: "bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium", children: event.category }) }))] }), _jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "font-semibold text-lg text-gray-900 mb-2 line-clamp-2", children: event.title }), _jsxs("div", { className: "space-y-2 text-sm text-gray-600 mb-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-4 h-4 mr-2 flex-shrink-0" }), _jsxs("span", { children: [formatDate(event.start_date), " at ", formatTime(event.start_date), event.end_date && event.start_date !== event.end_date && (_jsxs("span", { children: [" - ", formatDate(event.end_date)] }))] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(MapPin, { className: "w-4 h-4 mr-2 flex-shrink-0" }), _jsx("span", { className: "truncate", children: event.location })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-4 h-4 mr-2 flex-shrink-0" }), _jsxs("span", { children: ["Max ", event.max_attendees, " attendees"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-lg font-semibold text-green-600", children: event.ticket_price && parseFloat(event.ticket_price.toString()) > 0
                                    ? `₦${parseFloat(event.ticket_price.toString()).toLocaleString()}`
                                    : 'Free' }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { className: "px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors", onClick: () => {
                                            navigate(`/events/${event.id}`);
                                        }, children: "View Details" }), _jsx("button", { className: "p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx("button", { className: "p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { className: "p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50", children: _jsx(MoreHorizontal, { className: "w-4 h-4" }) })] })] })] })] }));
    // Loading state
    if (loading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Recent Events" }), _jsx("button", { className: "text-blue-600 hover:text-blue-700 font-medium text-sm", children: "View All" })] }), _jsxs("div", { className: "flex items-center justify-center py-12", children: [_jsx(Loader2, { className: "w-8 h-8 animate-spin text-blue-600" }), _jsx("span", { className: "ml-2 text-gray-600", children: "Loading recent events..." })] })] }));
    }
    // Error state
    if (error) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Recent Events" }), _jsx("button", { className: "text-blue-600 hover:text-blue-700 font-medium text-sm", children: "View All" })] }), _jsx("div", { className: "flex items-center justify-center py-12", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-red-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Error loading recent events" }), _jsx("p", { className: "text-gray-600 mb-4", children: error }), _jsx("button", { onClick: () => window.location.reload(), className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium", children: "Try Again" })] }) })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Recent Events" }), _jsx("button", { className: "text-blue-600 hover:text-blue-700 font-medium text-sm", children: "View All" })] }), recentEvents.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Calendar, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No recent events" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Create your first event to get started." }), _jsx("button", { className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium", children: _jsx("a", { href: "/events/create-event", children: "Create Event" }) })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: recentEvents.map(event => (_jsx(EventCard, { event: event }, event.id))) }))] }));
};
export default RecentEventsSection;
