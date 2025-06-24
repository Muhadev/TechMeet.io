import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Ticket, UserCheck, TrendingUp, Calendar, Target } from 'lucide-react';
import api from '../lib/axios';
// Color classes type
const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    red: 'bg-red-50 text-red-600'
};
// Individual Stat Card Component
const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    return (_jsx("div", { className: "bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-600 mb-1", children: title }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: value }), subtitle && (_jsx("p", { className: "text-sm text-gray-500 mt-1", children: subtitle }))] }), _jsx("div", { className: `p-3 rounded-lg ${colorClasses[color]}`, children: _jsx(Icon, { className: "w-6 h-6" }) })] }) }));
};
// Main Event Statistics Component
const EventStatistics = ({ eventId }) => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/events/${eventId}/statistics/`);
                setStatistics(response.data);
                setError(null); // Clear any previous errors
            }
            catch (err) {
                console.error('Error fetching event statistics:', err);
                setError('Failed to load statistics');
            }
            finally {
                setLoading(false);
            }
        };
        if (eventId) {
            fetchStatistics();
        }
    }, [eventId]);
    if (loading) {
        return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6", children: [...Array(6)].map((_, index) => (_jsx("div", { className: "bg-white rounded-lg p-6 shadow-sm border border-gray-200", children: _jsx("div", { className: "animate-pulse", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-20 mb-2" }), _jsx("div", { className: "h-8 bg-gray-200 rounded w-16" })] }), _jsx("div", { className: "w-12 h-12 bg-gray-200 rounded-lg" })] }) }) }, index))) }));
    }
    if (error) {
        return (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsx("p", { className: "text-red-600 text-sm", children: error }) }));
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
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6", children: [_jsx(StatCard, { icon: Ticket, title: "Total Tickets", value: statistics.total_tickets.toLocaleString(), subtitle: "Created for this event", color: "blue" }), _jsx(StatCard, { icon: Target, title: "Sold Tickets", value: statistics.sold_tickets.toLocaleString(), subtitle: `${soldPercentage}% of total tickets`, color: "green" }), _jsx(StatCard, { icon: UserCheck, title: "Checked In", value: statistics.checked_in.toLocaleString(), subtitle: `${checkInPercentage}% of sold tickets`, color: "purple" }), _jsx(StatCard, { icon: TrendingUp, title: "Occupancy Rate", value: `${occupancyPercentage}%`, subtitle: "Current event capacity", color: "indigo" }), _jsx(StatCard, { icon: Calendar, title: "Ticket Types", value: statistics.ticket_types.length, subtitle: `${statistics.ticket_types[0]?.ticket_type || 'N/A'} available`, color: "red" })] }));
};
// Usage Example:
// <EventStatistics eventId={4} />
export { StatCard, EventStatistics };
export default EventStatistics;
