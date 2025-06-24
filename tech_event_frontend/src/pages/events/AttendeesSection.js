import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Users, Download, Mail, Search, CheckCircle, AlertCircle, Clock, UserCheck, Eye, MessageSquare, RefreshCw, Loader2 } from 'lucide-react';
// Add this component inside your Dashboard component where the attendees section is
const AttendeesSection = () => {
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        checkedIn: 0,
        pending: 0
    });
    // Fetch user's events for the dropdown
    useEffect(() => {
        fetchEvents();
    }, []);
    // Fetch attendees when selected event changes
    useEffect(() => {
        if (selectedEvent) {
            fetchAttendees(selectedEvent);
        }
    }, [selectedEvent]);
    // Calculate stats whenever attendees change
    useEffect(() => {
        calculateStats();
    }, [attendees]);
    const fetchEvents = async () => {
        try {
            const response = await api.get('/events/');
            if (response.status === 200) {
                const data = response.data;
                const eventsArray = Array.isArray(data) ? data : (data.results || []);
                setEvents(eventsArray);
                // Auto-select first event if available
                if (eventsArray.length > 0) {
                    setSelectedEvent(eventsArray[0].id);
                }
            }
        }
        catch (err) {
            console.error('Error fetching events:', err);
        }
    };
    const fetchAttendees = async (eventId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/events/${eventId}/attendees/`);
            if (response.status === 200) {
                setAttendees(response.data);
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            setAttendees([]);
        }
        finally {
            setLoading(false);
        }
    };
    const calculateStats = () => {
        const total = attendees.length;
        const checkedIn = attendees.filter(attendee => attendee.checked_in).length;
        const pending = total - checkedIn;
        setStats({ total, checkedIn, pending });
    };
    const handleRefresh = () => {
        if (selectedEvent) {
            fetchAttendees(selectedEvent);
        }
    };
    const handleCheckIn = async (ticketNumber) => {
        try {
            const response = await api.post('/tickets/check_in/', {
                ticket_number: ticketNumber
            });
            if (response.status === 200) {
                // Refresh attendees list
                fetchAttendees(selectedEvent);
            }
        }
        catch (err) {
            console.error('Error checking in attendee:', err);
            alert('Failed to check in attendee. Please try again.');
        }
    };
    const handleExport = () => {
        // Create CSV content
        const headers = ['Name', 'Email', 'Ticket Number', 'Ticket Type', 'Check-in Status', 'Check-in Time'];
        const csvContent = [
            headers.join(','),
            ...filteredAttendees.map(attendee => [
                `"${attendee.name}"`,
                attendee.email,
                attendee.ticket_number,
                attendee.ticket_type,
                attendee.checked_in ? 'Checked In' : 'Not Checked In',
                attendee.checked_in_time ? new Date(attendee.checked_in_time).toLocaleString() : 'N/A'
            ].join(','))
        ].join('\n');
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendees-${selectedEvent}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };
    // Filter attendees based on search term
    const filteredAttendees = attendees.filter(attendee => attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const getStatusBadge = (checkedIn) => {
        if (checkedIn) {
            return (_jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), "Checked In"] }));
        }
        return (_jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), "Pending"] }));
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Attendees" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage and communicate with your event attendees." })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("button", { onClick: handleRefresh, className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), _jsx("span", { children: "Refresh" })] }), _jsxs("button", { onClick: handleExport, disabled: filteredAttendees.length === 0, className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "Export" })] }), _jsxs("button", { className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2", children: [_jsx(Mail, { className: "w-4 h-4" }), _jsx("span", { children: "Send Message" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx("div", { className: "bg-white rounded-lg p-4 border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(Users, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Attendees" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: stats.total })] })] }) }), _jsx("div", { className: "bg-white rounded-lg p-4 border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(UserCheck, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Checked In" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: stats.checkedIn })] })] }) }), _jsx("div", { className: "bg-white rounded-lg p-4 border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-yellow-100 rounded-lg", children: _jsx(Clock, { className: "w-5 h-5 text-yellow-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Pending" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: stats.pending })] })] }) })] }), _jsx("div", { className: "bg-white rounded-lg p-4 border border-gray-200", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Select Event" }), _jsxs("select", { value: selectedEvent, onChange: (e) => setSelectedEvent(e.target.value), className: "w-full border border-gray-300 rounded-lg px-3 py-2", children: [_jsx("option", { value: "", children: "Select an event..." }), events.map(event => (_jsx("option", { value: event.id, children: event.title }, event.id)))] })] }), _jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search Attendees" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "text", placeholder: "Search by name, email, or ticket number...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" })] })] })] }) }), _jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-100", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-100", children: _jsx("h3", { className: "font-medium text-gray-900", children: selectedEvent ? `Attendees (${filteredAttendees.length})` : 'Select an event to view attendees' }) }), loading ? (_jsxs("div", { className: "flex items-center justify-center py-12", children: [_jsx(Loader2, { className: "w-6 h-6 animate-spin text-blue-600" }), _jsx("span", { className: "ml-2 text-gray-600", children: "Loading attendees..." })] })) : error ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-red-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Error loading attendees" }), _jsx("p", { className: "text-gray-600 mb-4", children: error }), _jsx("button", { onClick: handleRefresh, className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium", children: "Try Again" })] }) })) : !selectedEvent ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Users, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No event selected" }), _jsx("p", { className: "text-gray-600", children: "Please select an event to view its attendees." })] }) })) : filteredAttendees.length === 0 ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Users, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No attendees found" }), _jsx("p", { className: "text-gray-600", children: searchTerm ? 'No attendees match your search criteria.' : 'This event has no registered attendees yet.' })] }) })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Attendee" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Ticket Info" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Check-in Time" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredAttendees.map((attendee) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3", children: _jsx("span", { className: "text-sm font-medium text-white", children: attendee.name.split(' ').map((n) => n[0]).join('').toUpperCase() }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: attendee.name }), _jsx("div", { className: "text-sm text-gray-500", children: attendee.email })] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: attendee.ticket_number }), _jsx("div", { className: "text-sm text-gray-500 capitalize", children: attendee.ticket_type.toLowerCase() })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getStatusBadge(attendee.checked_in) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: attendee.checked_in_time
                                                    ? new Date(attendee.checked_in_time).toLocaleString()
                                                    : 'Not checked in' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: _jsxs("div", { className: "flex items-center space-x-2", children: [!attendee.checked_in && (_jsx("button", { onClick: () => handleCheckIn(attendee.ticket_number), className: "text-green-600 hover:text-green-900 font-medium", children: "Check In" })), _jsx("button", { className: "text-blue-600 hover:text-blue-900 font-medium", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx("button", { className: "text-gray-600 hover:text-gray-900 font-medium", children: _jsx(MessageSquare, { className: "w-4 h-4" }) })] }) })] }, `${attendee.user_id}-${attendee.ticket_number}`))) })] }) }))] })] }));
};
export default AttendeesSection;
