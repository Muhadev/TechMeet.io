import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { DollarSign, Users, Calendar, Download, RefreshCw, BarChart3, Target, AlertCircle } from 'lucide-react';
const AnalyticsSection = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('30');
    const [selectedEvent, setSelectedEvent] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [analyticsData, setAnalyticsData] = useState({
        overview: {
            totalEvents: 0,
            totalRevenue: 0,
            totalAttendees: 0,
            avgOccupancyRate: 0
        },
        events: []
    });
    const [userEvents, setUserEvents] = useState([]);
    useEffect(() => {
        fetchUserEvents();
    }, []);
    useEffect(() => {
        if (userEvents.length > 0) {
            fetchAnalyticsData();
        }
    }, [selectedPeriod, selectedEvent, userEvents]);
    const fetchUserEvents = async () => {
        try {
            // Fetch events where current user is the organizer
            const response = await api.get('/events/?organizer=me');
            // If that doesn't work, try just getting all events and filtering client-side
            // const response = await api.get('/events/');
            setUserEvents(response.data.results || response.data);
        }
        catch (error) {
            console.error('Error fetching user events:', error);
            setUserEvents([]);
        }
    };
    const fetchAnalyticsData = async () => {
        setLoading(true);
        setError(null);
        try {
            let overview = {
                totalEvents: 0,
                totalRevenue: 0,
                totalAttendees: 0,
                avgOccupancyRate: 0
            };
            let eventsData = [];
            if (selectedEvent === 'all') {
                // Fetch analytics for all events using axios
                const promises = userEvents.map(async (event) => {
                    try {
                        const response = await api.get(`/events/${event.id}/statistics/`);
                        return {
                            ...event,
                            statistics: response.data
                        };
                    }
                    catch (error) {
                        console.error(`Error fetching stats for event ${event.id}:`, error);
                        return null;
                    }
                });
                const results = await Promise.all(promises);
                eventsData = results.filter((item) => item !== null);
                // Calculate overview metrics - Fix occupancy rate calculation
                overview = eventsData.reduce((acc, event) => {
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
            }
            else {
                // Fetch analytics for specific event using axios
                const response = await api.get(`/events/${selectedEvent}/statistics/`);
                const stats = response.data;
                const event = userEvents.find((e) => e.id.toString() === selectedEvent);
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
        }
        catch (error) {
            console.error('Error fetching analytics data:', error);
            setError('Failed to load analytics data. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleRefresh = () => {
        fetchAnalyticsData();
    };
    const exportReport = () => {
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
    const generateCSVReport = () => {
        const headers = ['Event Name', 'Total Tickets', 'Sold Tickets', 'Checked In', 'Available Capacity', 'Occupancy Rate'];
        const rows = analyticsData.events.map((event) => [
            event.title,
            event.statistics.total_tickets,
            event.statistics.sold_tickets,
            event.statistics.checked_in,
            event.statistics.available_capacity,
            `${(event.statistics.occupancy_rate * 100).toFixed(2)}%`
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    };
    const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (_jsxs("div", { className: "bg-white rounded-xl p-6 shadow-sm border border-gray-100", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-medium text-gray-900", children: title }), _jsx(Icon, { className: `w-5 h-5 text-${color}-500` })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: value }), subtitle && _jsx("div", { className: "text-sm text-gray-600", children: subtitle })] })] }));
    const EventAnalyticsCard = ({ event }) => {
        const stats = event.statistics;
        const occupancyPercentage = stats.occupancy_rate.toFixed(1);
        return (_jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-100 p-6", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg text-gray-900 mb-1", children: event.title }), _jsx("p", { className: "text-sm text-gray-600", children: new Date(event.date).toLocaleDateString() })] }), _jsxs("div", { className: `px-2 py-1 rounded-full text-xs font-medium ${parseFloat(occupancyPercentage) >= 80
                                ? 'bg-green-100 text-green-800'
                                : parseFloat(occupancyPercentage) >= 50
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'}`, children: [occupancyPercentage, "% Occupied"] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { className: "text-center p-3 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: stats.sold_tickets }), _jsx("div", { className: "text-sm text-blue-600", children: "Sold Tickets" })] }), _jsxs("div", { className: "text-center p-3 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: stats.checked_in }), _jsx("div", { className: "text-sm text-green-600", children: "Checked In" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Total Capacity:" }), _jsx("span", { className: "font-medium", children: stats.total_tickets })] }), _jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Available:" }), _jsx("span", { className: "font-medium", children: stats.available_capacity })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Occupancy Rate:" }), _jsxs("span", { className: "font-medium", children: [occupancyPercentage, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${parseFloat(occupancyPercentage) >= 80
                                            ? 'bg-green-500'
                                            : parseFloat(occupancyPercentage) >= 50
                                                ? 'bg-yellow-500'
                                                : 'bg-red-500'}`, style: { width: `${occupancyPercentage}%` } }) })] }), stats.ticket_types && stats.ticket_types.length > 0 && (_jsxs("div", { className: "mt-4 pt-4 border-t border-gray-100", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Ticket Types" }), _jsx("div", { className: "space-y-2", children: stats.ticket_types.map((type, index) => (_jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-600 capitalize", children: type.ticket_type.toLowerCase() }), _jsx("span", { className: "font-medium", children: type.count })] }, index))) })] }))] })] }));
    };
    if (loading) {
        return (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "flex items-center justify-center py-12", children: [_jsx(RefreshCw, { className: "w-8 h-8 animate-spin text-blue-500" }), _jsx("span", { className: "ml-2 text-gray-600", children: "Loading analytics..." })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Analytics" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Track your event performance and attendee engagement." })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("select", { value: selectedEvent, onChange: (e) => setSelectedEvent(e.target.value), className: "px-4 py-2 border border-gray-300 rounded-lg bg-white", children: [_jsx("option", { value: "all", children: "All Events" }), userEvents.map((event) => (_jsx("option", { value: event.id, children: event.title }, event.id)))] }), _jsxs("select", { value: selectedPeriod, onChange: (e) => setSelectedPeriod(e.target.value), className: "px-4 py-2 border border-gray-300 rounded-lg bg-white", children: [_jsx("option", { value: "7", children: "Last 7 days" }), _jsx("option", { value: "30", children: "Last 30 days" }), _jsx("option", { value: "90", children: "Last 3 months" }), _jsx("option", { value: "365", children: "Last year" })] }), _jsx("button", { onClick: handleRefresh, className: "p-2 border border-gray-300 rounded-lg hover:bg-gray-50", disabled: loading, children: _jsx(RefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }) }), _jsxs("button", { onClick: exportReport, className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "Export Report" })] })] })] }), error && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-500" }), _jsx("span", { className: "text-red-700", children: error }), _jsx("button", { onClick: handleRefresh, className: "ml-auto text-red-600 hover:text-red-800 font-medium", children: "Retry" })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(StatCard, { icon: Calendar, title: "Total Events", value: analyticsData.overview.totalEvents, subtitle: selectedEvent === 'all' ? 'All events' : 'Selected event', color: "blue" }), _jsx(StatCard, { icon: Users, title: "Total Attendees", value: analyticsData.overview.totalAttendees.toLocaleString(), subtitle: "Tickets sold", color: "green" }), _jsx(StatCard, { icon: DollarSign, title: "Total Revenue", value: `₦${analyticsData.overview.totalRevenue.toLocaleString()}`, subtitle: "From ticket sales", color: "purple" }), _jsx(StatCard, { icon: Target, title: "Avg Occupancy", value: `${analyticsData.overview.avgOccupancyRate.toFixed(1)}%`, subtitle: "Capacity utilization", color: "orange" })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-6", children: selectedEvent === 'all' ? 'Event Performance' : 'Event Details' }), analyticsData.events.length === 0 ? (_jsxs("div", { className: "bg-white rounded-xl p-12 text-center border border-gray-100", children: [_jsx(BarChart3, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No events found" }), _jsx("p", { className: "text-gray-600", children: "Create your first event to see analytics data here." })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: analyticsData.events.map((event) => (_jsx(EventAnalyticsCard, { event: event }, event.id))) }))] }), analyticsData.events.length > 0 && (_jsxs("div", { className: "bg-white rounded-xl p-6 shadow-sm border border-gray-100", children: [_jsx("h3", { className: "font-medium text-gray-900 mb-4", children: "Key Insights" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600 mb-1", children: analyticsData.events.filter((e) => e.statistics.occupancy_rate >= 0.8).length }), _jsx("div", { className: "text-sm text-gray-600", children: "High-performing events (80%+ occupancy)" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600 mb-1", children: analyticsData.events.reduce((sum, e) => sum + e.statistics.checked_in, 0) }), _jsx("div", { className: "text-sm text-gray-600", children: "Total attendees checked in" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600 mb-1", children: [((analyticsData.events.reduce((sum, e) => sum + e.statistics.checked_in, 0) /
                                                analyticsData.events.reduce((sum, e) => sum + e.statistics.sold_tickets, 0)) * 100).toFixed(1), "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Average check-in rate" })] })] })] }))] }));
};
export default AnalyticsSection;
