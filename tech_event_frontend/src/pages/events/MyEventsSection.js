import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, Eye, Edit, MoreHorizontal, Plus, Filter, Download, Loader2, AlertCircle, Search, X } from 'lucide-react';
const MyEventsSection = () => {
    const [events, setEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]); // Store all events for filtering
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilter, setShowFilter] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const navigate = useNavigate();
    // Fetch events from API
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await api.get('/events/my_events/');
                const sortedEvents = response.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setAllEvents(sortedEvents);
                // Show only the 3 newest events initially
                setEvents(sortedEvents.slice(0, 2));
                setError(null);
            }
            catch (err) {
                console.error('Error fetching events:', err);
                setError('Failed to load events. Please try again.');
            }
            finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);
    // Apply filters
    useEffect(() => {
        let filtered = [...allEvents];
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(event => event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location?.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        // Apply status filter
        if (statusFilter) {
            filtered = filtered.filter(event => event.status === statusFilter);
        }
        // Apply category filter
        if (categoryFilter) {
            filtered = filtered.filter(event => event.category === categoryFilter);
        }
        // If no filters are applied, show only 3 newest events
        if (!searchTerm && !statusFilter && !categoryFilter) {
            filtered = filtered.slice(0, 3);
        }
        setEvents(filtered);
    }, [searchTerm, statusFilter, categoryFilter, allEvents]);
    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setCategoryFilter('');
        setShowFilter(false);
    };
    // Get unique categories for filter dropdown
    const getUniqueCategories = () => {
        const categories = allEvents.map(event => event.category).filter(Boolean);
        return [...new Set(categories)];
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
    const getImageUrl = (imageUrl) => {
        if (!imageUrl)
            return null;
        // If the URL already starts with http:// or https://, return as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl; // This should work, but there might be an issue here
        }
        // The rest of this code shouldn't execute for your case
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const serverURL = baseURL.replace('/api', '');
        const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
        return `${serverURL}${cleanImageUrl}`;
    };
    // Event Card Component
    const EventCard = ({ event }) => (_jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "relative h-48 bg-gray-200", children: [event.banner_image ? (_jsx("img", { src: getImageUrl(event.banner_image) || undefined, alt: event.title, className: "w-full h-full object-cover", onError: (e) => {
                            const target = e.target;
                            target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop';
                        } })) : (_jsx("div", { className: "w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center", children: _jsx(Calendar, { className: "w-12 h-12 text-gray-400" }) })), _jsx("div", { className: "absolute top-3 right-3", children: _jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(event.status)}`, children: event.status?.charAt(0).toUpperCase() + event.status?.slice(1).toLowerCase() || 'Draft' }) }), event.category && (_jsx("div", { className: "absolute top-3 left-3", children: _jsx("div", { className: "bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium", children: event.category }) }))] }), _jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "font-semibold text-lg text-gray-900 mb-2 line-clamp-2", children: event.title }), _jsxs("div", { className: "space-y-2 text-sm text-gray-600 mb-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-4 h-4 mr-2 flex-shrink-0" }), _jsxs("span", { children: [formatDate(event.start_date), " at ", formatTime(event.start_date), event.end_date && event.start_date !== event.end_date && (_jsxs("span", { children: [" - ", formatDate(event.end_date)] }))] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(MapPin, { className: "w-4 h-4 mr-2 flex-shrink-0" }), _jsx("span", { className: "truncate", children: event.location })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-4 h-4 mr-2 flex-shrink-0" }), _jsxs("span", { children: ["Max ", event.max_attendees, " attendees"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-lg font-semibold text-green-600", children: event.ticket_price && parseFloat(event.ticket_price.toString()) > 0
                                    ? `₦${parseFloat(event.ticket_price.toString()).toLocaleString()}`
                                    : 'Free' }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { className: "px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors", onClick: () => {
                                            navigate(`/events/${event.id}`);
                                        }, children: "View Details" }), _jsx("button", { className: "p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx("button", { className: "p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { className: "p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50", children: _jsx(MoreHorizontal, { className: "w-4 h-4" }) })] })] })] })] }));
    // Loading state
    if (loading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "My Events" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage your events and track their performance." })] }) }), _jsxs("div", { className: "flex items-center justify-center py-12", children: [_jsx(Loader2, { className: "w-8 h-8 animate-spin text-blue-600" }), _jsx("span", { className: "ml-2 text-gray-600", children: "Loading events..." })] })] }));
    }
    // Error state
    if (error) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "My Events" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage your events and track their performance." })] }) }), _jsx("div", { className: "flex items-center justify-center py-12", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-red-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Error loading events" }), _jsx("p", { className: "text-gray-600 mb-4", children: error }), _jsx("button", { onClick: () => window.location.reload(), className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium", children: "Try Again" })] }) })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "My Events" }), _jsx("p", { className: "text-gray-600 mt-1", children: searchTerm || statusFilter || categoryFilter
                                    ? `Showing filtered results (${events.length} events)`
                                    : `Showing your 3 newest events (${allEvents.length} total)` })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("button", { onClick: () => setShowFilter(!showFilter), className: `px-4 py-2 border rounded-lg flex items-center space-x-2 transition-colors ${showFilter ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`, children: [_jsx(Filter, { className: "w-4 h-4" }), _jsx("span", { children: "Filter" })] }), _jsxs("button", { className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "Export" })] }), _jsxs("button", { className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: _jsx("a", { href: "events/create-event", children: "Create Event" }) })] })] })] }), showFilter && (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg border", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-medium text-gray-900", children: "Filter Events" }), _jsx("button", { onClick: () => setShowFilter(false), className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search events...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "PUBLISHED", children: "Published" }), _jsx("option", { value: "DRAFT", children: "Draft" }), _jsx("option", { value: "CANCELLED", children: "Cancelled" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Category" }), _jsxs("select", { value: categoryFilter, onChange: (e) => setCategoryFilter(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "All Categories" }), getUniqueCategories().map(category => (_jsx("option", { value: category, children: category }, category)))] })] })] }), (searchTerm || statusFilter || categoryFilter) && (_jsxs("div", { className: "mt-4 flex justify-between items-center", children: [_jsxs("span", { className: "text-sm text-gray-600", children: [events.length, " event", events.length !== 1 ? 's' : '', " found"] }), _jsx("button", { onClick: clearFilters, className: "text-sm text-blue-600 hover:text-blue-800 font-medium", children: "Clear all filters" })] }))] })), events.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Calendar, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: searchTerm || statusFilter || categoryFilter ? 'No events found' : 'No events yet' }), _jsx("p", { className: "text-gray-600 mb-4", children: searchTerm || statusFilter || categoryFilter
                            ? 'Try adjusting your filters or search terms.'
                            : 'Create your first event to get started.' }), searchTerm || statusFilter || categoryFilter ? (_jsx("button", { onClick: clearFilters, className: "bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium mr-3", children: "Clear Filters" })) : null, _jsx("button", { className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium", children: _jsx("a", { href: "/events/create-event", children: "Create Event" }) })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: events.map(event => (_jsx(EventCard, { event: event }, event.id))) }))] }));
};
export default MyEventsSection;
