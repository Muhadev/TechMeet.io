import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MyEventsSection from './events/MyEventsSection';
import RecentEventsSection from './events/RecentEventsSection';
import AttendeesSection from './events/AttendeesSection';
import AnalyticsSection from './events/AnalyticsSection';
import EventStatistics from '../pages/EventStatistics';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Ticket, TrendingUp, Plus, Zap, Search, Bell, Settings, LogOut, BarChart3, Eye, Edit, MoreHorizontal, MapPin, Filter, Download, QrCode, Mail, CheckCircle, XCircle, AlertCircle, Heart, Share2 } from 'lucide-react';
const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [userRole, setUserRole] = useState('organizer'); // organizer, attendee, admin
    const [isMobile, setIsMobile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const navigate = useNavigate();
    // Search handler with debouncing
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }
        const searchTimeout = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(`http://localhost:8000/api/events/?search=${encodeURIComponent(searchQuery)}`);
                const data = await response.json();
                setSearchResults(data.results || data);
                setShowSearchResults(true);
            }
            catch (error) {
                console.error('Search failed:', error);
                setSearchResults([]);
            }
            finally {
                setIsSearching(false);
            }
        }, 300); // 300ms debounce
        return () => clearTimeout(searchTimeout);
    }, [searchQuery]);
    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowSearchResults(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    const organizerEvents = [
        {
            id: 1,
            title: "React Native Conference 2025",
            date: "2025-07-15",
            time: "09:00 AM",
            location: "Lagos Tech Hub",
            attendees: 250,
            capacity: 300,
            revenue: 25000,
            status: "published",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop"
        },
        {
            id: 2,
            title: "AI & Machine Learning Summit",
            date: "2025-08-22",
            time: "10:00 AM",
            location: "Abuja Innovation Center",
            attendees: 180,
            capacity: 200,
            revenue: 36000,
            status: "published",
            image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop"
        },
        {
            id: 3,
            title: "DevOps Workshop Series",
            date: "2025-09-10",
            time: "02:00 PM",
            location: "Virtual Event",
            attendees: 95,
            capacity: 150,
            revenue: 14250,
            status: "draft",
            image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop"
        }
    ];
    const attendeeEvents = [
        {
            id: 1,
            title: "React Native Conference 2025",
            date: "2025-07-15",
            time: "09:00 AM",
            location: "Lagos Tech Hub",
            ticketType: "VIP",
            price: 15000,
            status: "confirmed",
            organizer: "Tech Lagos",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop"
        },
        {
            id: 2,
            title: "AI & Machine Learning Summit",
            date: "2025-08-22",
            time: "10:00 AM",
            location: "Abuja Innovation Center",
            ticketType: "Regular",
            price: 8000,
            status: "confirmed",
            organizer: "AI Nigeria",
            image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop"
        },
        {
            id: 3,
            title: "Python Workshop",
            date: "2025-06-25",
            time: "03:00 PM",
            location: "Virtual Event",
            ticketType: "Free",
            price: 0,
            status: "completed",
            organizer: "CodeCamp NG",
            image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop"
        }
    ];
    const recentTickets = [
        {
            id: 1,
            eventTitle: "React Native Conference 2025",
            attendeeName: "John Doe",
            ticketType: "VIP",
            purchaseDate: "2025-06-10",
            amount: 15000,
            status: "confirmed"
        },
        {
            id: 2,
            eventTitle: "AI & Machine Learning Summit",
            attendeeName: "Jane Smith",
            ticketType: "Regular",
            purchaseDate: "2025-06-12",
            amount: 8000,
            status: "confirmed"
        },
        {
            id: 3,
            eventTitle: "DevOps Workshop Series",
            attendeeName: "Mike Johnson",
            ticketType: "Student",
            purchaseDate: "2025-06-14",
            amount: 5000,
            status: "pending"
        }
    ];
    const OrganizerEventCard = ({ event }) => (_jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "relative h-48 bg-gray-200", children: [_jsx("img", { src: event.image, alt: event.title, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute top-3 right-3", children: _jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${event.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'}`, children: event.status.charAt(0).toUpperCase() + event.status.slice(1) }) })] }), _jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "font-semibold text-lg text-gray-900 mb-2", children: event.title }), _jsxs("div", { className: "space-y-2 text-sm text-gray-600 mb-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-4 h-4 mr-2" }), event.date, " at ", event.time] }), _jsxs("div", { className: "flex items-center", children: [_jsx(MapPin, { className: "w-4 h-4 mr-2" }), event.location] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-4 h-4 mr-2" }), event.attendees, "/", event.capacity, " attendees"] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-lg font-semibold text-green-600", children: ["\u20A6", event.revenue?.toLocaleString() || '0'] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { className: "p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx("button", { className: "p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { className: "p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50", children: _jsx(MoreHorizontal, { className: "w-4 h-4" }) })] })] })] })] }));
    const AttendeeEventCard = ({ event }) => (_jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "relative h-48 bg-gray-200", children: [_jsx("img", { src: event.image, alt: event.title, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute top-3 right-3", children: _jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${event.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : event.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'}`, children: event.status.charAt(0).toUpperCase() + event.status.slice(1) }) }), _jsx("div", { className: "absolute top-3 left-3", children: _jsx("div", { className: "bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium", children: event.ticketType }) })] }), _jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "font-semibold text-lg text-gray-900 mb-2", children: event.title }), _jsxs("div", { className: "space-y-2 text-sm text-gray-600 mb-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-4 h-4 mr-2" }), event.date, " at ", event.time] }), _jsxs("div", { className: "flex items-center", children: [_jsx(MapPin, { className: "w-4 h-4 mr-2" }), event.location] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-4 h-4 mr-2" }), "Organized by ", event.organizer] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-lg font-semibold text-blue-600", children: (event.price && event.price > 0) ? `₦${event.price.toLocaleString()}` : 'Free' }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { className: "p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-50", children: _jsx(QrCode, { className: "w-4 h-4" }) }), _jsx("button", { className: "p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50", children: _jsx(Heart, { className: "w-4 h-4" }) }), _jsx("button", { className: "p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50", children: _jsx(Share2, { className: "w-4 h-4" }) })] })] })] })] }));
    const TicketRow = ({ ticket }) => (_jsxs("tr", { className: "border-b border-gray-100 hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: ticket.eventTitle }), _jsx("div", { className: "text-sm text-gray-500", children: ticket.attendeeName })] }) }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-900", children: ticket.ticketType }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-500", children: ticket.purchaseDate }), _jsxs("td", { className: "px-6 py-4 text-sm font-medium text-gray-900", children: ["\u20A6", ticket.amount.toLocaleString()] }), _jsx("td", { className: "px-6 py-4", children: _jsxs("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ticket.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : ticket.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'}`, children: [ticket.status === 'confirmed' && _jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), ticket.status === 'pending' && _jsx(AlertCircle, { className: "w-3 h-3 mr-1" }), ticket.status === 'cancelled' && _jsx(XCircle, { className: "w-3 h-3 mr-1" }), ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { className: "text-blue-600 hover:text-blue-800 font-medium text-sm", children: "View" }), _jsx("button", { className: "text-gray-400 hover:text-gray-600", children: _jsx(QrCode, { className: "w-4 h-4" }) })] }) })] }));
    // Get navigation items based on user role
    const getNavigationItems = () => {
        const commonItems = [
            { id: 'overview', label: 'Overview', icon: BarChart3 }
        ];
        if (userRole === 'organizer') {
            return [
                ...commonItems,
                { id: 'events', label: 'My Events', icon: Calendar },
                { id: 'tickets', label: 'Ticket Sales', icon: Ticket },
                { id: 'attendees', label: 'Attendees', icon: Users },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ];
        }
        else if (userRole === 'attendee') {
            return [
                ...commonItems,
                { id: 'events', label: 'My Events', icon: Calendar },
                { id: 'tickets', label: 'My Tickets', icon: Ticket },
                { id: 'discover', label: 'Discover Events', icon: Search },
                { id: 'favorites', label: 'Favorites', icon: Heart }
            ];
        }
        return commonItems;
    };
    // Add this inside your Dashboard component, before the return statement
    const { user, logout } = useAuth();
    // Helper function to get user initials
    const getUserInitials = (firstName, lastName, username) => {
        if (firstName && lastName) {
            return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
        }
        if (username) {
            return username.charAt(0).toUpperCase();
        }
        return 'U'; // Default fallback
    };
    // Helper function to get display name
    const getDisplayName = (firstName, lastName, username) => {
        if (firstName && lastName) {
            return `${firstName} ${lastName}`;
        }
        if (firstName) {
            return firstName;
        }
        if (username) {
            return username;
        }
        return 'User';
    };
    // Helper function to format role for display
    const formatRole = (role) => {
        if (!role)
            return 'user';
        return role.toLowerCase().replace('_', ' ');
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white border-b border-gray-200 sticky top-0 z-40", children: _jsxs("div", { className: "flex items-center justify-between px-6 py-4", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-r text-white from-blue-500 to-purple-600 rounded-xl flex items-center justify-center", children: _jsx(Zap, { className: "w-6 h-6" }) }), _jsx("h1", { className: "text-xl font-bold text-gray-900 cursor-pointer", onClick: () => navigate('/'), children: "TechMeet.io" })] }), _jsx("div", { className: "hidden md:block", children: _jsxs("div", { className: "relative", onClick: (e) => e.stopPropagation(), children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "text", placeholder: user?.role === 'ORGANIZER' || user?.role === 'ADMIN' ? "Search events, attendees..." : "Search events...", className: "pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), onFocus: () => searchQuery && setShowSearchResults(true) }), showSearchResults && (_jsx("div", { className: "absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50", children: isSearching ? (_jsxs("div", { className: "p-4 text-center text-gray-500", children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2" }), "Searching..."] })) : searchResults.length > 0 ? (_jsxs("div", { className: "py-2", children: [searchResults.slice(0, 8).map((event) => (_jsx("div", { className: "px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0", onClick: () => {
                                                                // Navigate to event details page
                                                                navigate(`/events/${event.id}`);
                                                                // Clear search
                                                                setShowSearchResults(false);
                                                                setSearchQuery('');
                                                            }, children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: event.banner_image ? (_jsx("img", { src: event.banner_image, alt: event.title, className: "w-12 h-12 rounded-lg object-cover" })) : (_jsx("div", { className: "w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center", children: _jsx(Calendar, { className: "w-6 h-6 text-gray-400" }) })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 truncate", children: event.title }), _jsxs("div", { className: "text-xs text-gray-500 mt-1 flex items-center space-x-2", children: [_jsx("span", { children: event.start_date ? new Date(event.start_date).toLocaleDateString() : 'No date' }), event.location && (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2022" }), _jsx("span", { className: "truncate", children: event.location })] }))] }), event.ticket_price && event.ticket_price > 0 && (_jsxs("div", { className: "text-xs font-medium text-blue-600 mt-1", children: ["\u20A6", event.ticket_price.toLocaleString()] }))] }), _jsx("div", { className: "flex-shrink-0", children: _jsx("span", { className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${event.status === 'PUBLISHED'
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : 'bg-yellow-100 text-yellow-800'}`, children: event.status ? event.status.toLowerCase() : 'unknown' }) })] }) }, event.id))), searchResults.length > 8 && (_jsxs("div", { className: "px-4 py-2 text-center text-sm text-gray-500 border-t border-gray-100", children: ["+", searchResults.length - 8, " more results"] }))] })) : (_jsxs("div", { className: "p-4 text-center text-gray-500", children: [_jsx(Search, { className: "w-8 h-8 text-gray-300 mx-auto mb-2" }), _jsxs("p", { children: ["No events found for \"", searchQuery, "\""] })] })) }))] }) })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [user?.role === 'ADMIN' && (_jsxs("select", { value: userRole, onChange: (e) => setUserRole(e.target.value), className: "text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white", children: [_jsx("option", { value: "organizer", children: "Organizer" }), _jsx("option", { value: "attendee", children: "Attendee" })] })), _jsxs("button", { className: "relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100", children: [_jsx(Bell, { className: "w-5 h-5" }), _jsx("span", { className: "absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [user?.profile_picture ? (_jsx("img", { src: user.profile_picture, alt: "Profile", className: "w-8 h-8 rounded-full object-cover" })) : (_jsx("div", { className: "w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-sm font-medium text-gray-700", children: getUserInitials(user?.first_name, user?.last_name, user?.username) }) })), _jsxs("div", { className: "hidden md:block", children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: getDisplayName(user?.first_name, user?.last_name, user?.username) }), _jsx("p", { className: "text-xs text-gray-500 capitalize", children: formatRole(user?.role) })] })] }), _jsx("div", { className: "relative", children: _jsx("button", { className: "p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100", onClick: () => navigate('/settings'), children: _jsx(Settings, { className: "w-5 h-5" }) }) })] })] }) }), _jsxs("div", { className: "flex", children: [_jsx("aside", { className: `bg-white border-r border-gray-200 fixed left-0 top-16 h-[calc(100vh-4rem)] z-30 transition-all duration-300 ${isMobile ? 'w-16' : 'w-64'} overflow-y-auto`, children: _jsxs("nav", { className: "p-6 h-full flex flex-col", children: [_jsx("div", { className: "space-y-2 flex-1", children: getNavigationItems().map((item) => (_jsxs("button", { onClick: () => setActiveTab(item.id), className: `w-full flex items-center ${isMobile ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 rounded-lg text-left transition-colors group relative ${activeTab === item.id
                                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50'}`, title: isMobile ? item.label : '', children: [_jsx(item.icon, { className: "w-5 h-5 flex-shrink-0" }), !isMobile && _jsx("span", { className: "font-medium", children: item.label }), isMobile && (_jsx("div", { className: "absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50", children: item.label }))] }, item.id))) }), _jsxs("div", { className: "mt-8 pt-8 border-t border-gray-200 space-y-2", children: [_jsxs("button", { className: `w-full flex items-center ${isMobile ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 text-gray-600 hover:bg-gray-50 rounded-lg group relative`, title: isMobile ? 'Messages' : '', children: [_jsx(Mail, { className: "w-5 h-5 flex-shrink-0" }), !isMobile && _jsx("span", { className: "font-medium", children: "Messages" }), isMobile && (_jsx("div", { className: "absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50", children: "Messages" }))] }), _jsxs("button", { className: `w-full flex items-center ${isMobile ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 text-gray-600 hover:bg-gray-50 rounded-lg group relative`, title: isMobile ? 'Settings' : '', onClick: () => navigate('/settings'), children: [_jsx(Settings, { className: "w-5 h-5 flex-shrink-0" }), !isMobile && _jsx("span", { className: "font-medium", children: "Settings" }), isMobile && (_jsx("div", { className: "absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50", children: "Settings" }))] }), _jsxs("button", { onClick: logout, className: `w-full flex items-center ${isMobile ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 text-red-600 hover:bg-red-50 rounded-lg group relative`, title: isMobile ? 'Sign Out' : '', children: [_jsx(LogOut, { className: "w-5 h-5 flex-shrink-0" }), !isMobile && _jsx("span", { className: "font-medium", children: "Sign Out" }), isMobile && (_jsx("div", { className: "absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50", children: "Sign Out" }))] })] })] }) }), _jsxs("main", { className: `flex-1 p-6 transition-all duration-300 ${isMobile ? 'ml-16' : 'ml-64'} overflow-y-auto h-[calc(100vh-4rem)]`, children: [activeTab === 'overview' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Dashboard Overview" }), _jsx("p", { className: "text-gray-600 mt-1", children: userRole === 'organizer'
                                                            ? "Welcome back! Here's what's happening with your events."
                                                            : "Welcome back! Here's your event activity." })] }), userRole === 'organizer' ? (_jsxs("button", { className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: _jsx("a", { href: "events/create-event", children: "Create Event" }) })] })) : (_jsxs("button", { className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors", children: [_jsx(Search, { className: "w-4 h-4" }), _jsx("span", { children: "Discover Events" })] }))] }), _jsx(EventStatistics, { eventId: 4 }), _jsx(RecentEventsSection, {})] })), activeTab === 'events' && _jsx(MyEventsSection, {}), activeTab === 'tickets' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: userRole === 'organizer' ? 'Ticket Sales' : 'My Tickets' }), _jsx("p", { className: "text-gray-600 mt-1", children: userRole === 'organizer'
                                                            ? 'Track ticket sales and manage attendee registrations.'
                                                            : 'View and manage your event tickets.' })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("button", { className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2", children: [_jsx(Filter, { className: "w-4 h-4" }), _jsx("span", { children: "Filter" })] }), _jsxs("button", { className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "Export" })] })] })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-100", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-100", children: _jsx("h3", { className: "font-medium text-gray-900", children: userRole === 'organizer' ? 'Recent Ticket Sales' : 'My Tickets' }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Event & Attendee" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Type" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Purchase Date" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Amount" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: recentTickets.map(ticket => (_jsx(TicketRow, { ticket: ticket }, ticket.id))) })] }) })] })] })), activeTab === 'attendees' && userRole === 'organizer' && _jsx(AttendeesSection, {}), activeTab === 'analytics' && userRole === 'organizer' && _jsx(AnalyticsSection, {}), activeTab === 'discover' && userRole === 'attendee' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Discover Events" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Find exciting events happening near you." })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("button", { className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2", children: [_jsx(Filter, { className: "w-4 h-4" }), _jsx("span", { children: "Filter" })] }), _jsxs("button", { className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2", children: [_jsx(MapPin, { className: "w-4 h-4" }), _jsx("span", { children: "Near Me" })] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
                                            {
                                                id: 1,
                                                title: "Flutter Conference Lagos 2025",
                                                date: "2025-07-20",
                                                time: "10:00 AM",
                                                location: "Lagos Island",
                                                organizer: "Flutter Lagos",
                                                price: 12000,
                                                image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop",
                                                category: "Technology"
                                            },
                                            {
                                                id: 2,
                                                title: "Startup Pitch Competition",
                                                date: "2025-08-15",
                                                time: "02:00 PM",
                                                location: "Abuja Tech Park",
                                                organizer: "Startup Abuja",
                                                price: 5000,
                                                image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop",
                                                category: "Business"
                                            },
                                            {
                                                id: 3,
                                                title: "Digital Marketing Masterclass",
                                                date: "2025-09-05",
                                                time: "11:00 AM",
                                                location: "Virtual Event",
                                                organizer: "DigitalNG",
                                                price: 8000,
                                                image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop",
                                                category: "Marketing"
                                            }
                                        ].map(event => (_jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "relative h-48 bg-gray-200", children: [_jsx("img", { src: event.image, alt: event.title, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute top-3 left-3", children: _jsx("span", { className: "px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur rounded-full", children: event.category }) })] }), _jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "font-semibold text-lg text-gray-900 mb-2", children: event.title }), _jsxs("div", { className: "space-y-2 text-sm text-gray-600 mb-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-4 h-4 mr-2" }), event.date, " at ", event.time] }), _jsxs("div", { className: "flex items-center", children: [_jsx(MapPin, { className: "w-4 h-4 mr-2" }), event.location] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-4 h-4 mr-2" }), "Organized by ", event.organizer] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-lg font-semibold text-blue-600", children: ["\u20A6", event.price.toLocaleString()] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors", children: "Register" }), _jsx("button", { className: "p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50", children: _jsx(Heart, { className: "w-4 h-4" }) })] })] })] })] }, event.id))) })] })), activeTab === 'favorites' && userRole === 'attendee' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Favorite Events" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Events you've saved for later." })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("button", { className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2", children: [_jsx(Filter, { className: "w-4 h-4" }), _jsx("span", { children: "Filter" })] }), _jsxs("button", { className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2", children: [_jsx(Search, { className: "w-4 h-4" }), _jsx("span", { children: "Discover More" })] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: _jsxs("div", { className: "col-span-full text-center py-12", children: [_jsx(Heart, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No favorite events yet" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Start exploring events and save your favorites here." }), _jsx("button", { className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium", children: "Discover Events" })] }) })] }))] })] })] }));
};
export default Dashboard;
