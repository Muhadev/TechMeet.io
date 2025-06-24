import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Check, Calendar, MapPin, Users, DollarSign, Share2, Eye, Edit, Plus, Home, Clock, Tag, Copy, Facebook, Twitter, Linkedin, ArrowRight } from 'lucide-react';
export default function EventSuccessPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);
    const [isAutoRedirect, setIsAutoRedirect] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);
    // Get event data from navigation state with proper typing
    const { event, action } = location.state || {};
    // Redirect to dashboard if no event data
    useEffect(() => {
        if (!event) {
            navigate('/dashboard');
            return;
        }
    }, [event, navigate]);
    // Auto-redirect countdown
    useEffect(() => {
        if (!isAutoRedirect)
            return;
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    navigate('/dashboard');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isAutoRedirect, navigate]);
    // Don't render if no event data
    if (!event) {
        return null;
    }
    const isPublished = action === 'published';
    const eventUrl = `${window.location.origin}/events/${event.id}`;
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(eventUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
        catch (err) {
            console.error('Failed to copy link:', err);
        }
    };
    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(`Check out this event: ${event.title}`)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`
    };
    return (_jsxs("div", { children: [_jsx(Navigation, {}), _jsx("div", { className: "min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 py-8", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6", children: _jsx(Check, { className: "w-10 h-10 text-white" }) }), _jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-4", children: isPublished ? 'Event Published Successfully!' : 'Event Saved as Draft!' }), _jsx("p", { className: "text-xl text-gray-600 max-w-2xl mx-auto", children: isPublished
                                        ? 'Your event is now live and people can start registering. Share it with your audience!'
                                        : 'Your event has been saved as a draft. You can continue editing and publish it when ready.' })] }), _jsxs("div", { className: "bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8", children: [event.banner_image && (_jsxs("div", { className: "h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden", children: [_jsx("img", { src: event.banner_image, alt: event.title, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-black bg-opacity-20" })] })), _jsxs("div", { className: "p-8", children: [_jsx("div", { className: "flex items-start justify-between mb-6", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: event.title }), _jsx("span", { className: `px-3 py-1 rounded-full text-sm font-medium ${isPublished
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'}`, children: event.status })] }), _jsx("p", { className: "text-gray-600 leading-relaxed", children: event.description })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "flex items-center gap-3 p-4 bg-gray-50 rounded-lg", children: [_jsx(Calendar, { className: "w-5 h-5 text-blue-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Start Date" }), _jsx("p", { className: "font-medium text-gray-900", children: formatDate(event.start_date) }), _jsx("p", { className: "text-sm text-gray-600", children: formatTime(event.start_date) })] })] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-gray-50 rounded-lg", children: [_jsx(Clock, { className: "w-5 h-5 text-purple-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "End Date" }), _jsx("p", { className: "font-medium text-gray-900", children: formatDate(event.end_date) }), _jsx("p", { className: "text-sm text-gray-600", children: formatTime(event.end_date) })] })] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-gray-50 rounded-lg", children: [_jsx(MapPin, { className: "w-5 h-5 text-red-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Location" }), _jsx("p", { className: "font-medium text-gray-900", children: event.location })] })] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-gray-50 rounded-lg", children: [_jsx(Tag, { className: "w-5 h-5 text-indigo-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Category" }), _jsx("p", { className: "font-medium text-gray-900", children: event.category })] })] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-gray-50 rounded-lg", children: [_jsx(Users, { className: "w-5 h-5 text-green-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Max Attendees" }), _jsx("p", { className: "font-medium text-gray-900", children: event.max_attendees })] })] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-gray-50 rounded-lg", children: [_jsx(DollarSign, { className: "w-5 h-5 text-orange-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Price" }), _jsx("p", { className: "font-medium text-gray-900", children: event.ticket_price > 0 ? `₦${event.ticket_price}` : 'Free' })] })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: [_jsxs("button", { onClick: () => navigate('/dashboard'), className: "flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all", children: [_jsx(Home, { className: "w-4 h-4" }), "Dashboard"] }), isPublished && (_jsxs("button", { onClick: () => window.open(eventUrl, '_blank'), className: "flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all", children: [_jsx(Eye, { className: "w-4 h-4" }), "View Event"] })), _jsxs("button", { onClick: () => navigate(`/events/${event.id}/edit`), className: "flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all", children: [_jsx(Edit, { className: "w-4 h-4" }), "Edit Event"] }), _jsxs("button", { onClick: () => navigate('/events/create'), className: "flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all", children: [_jsx(Plus, { className: "w-4 h-4" }), "Create Another"] })] }), isPublished && (_jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8", children: [_jsxs("h3", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(Share2, { className: "w-5 h-5 text-blue-600" }), "Share Your Event"] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center gap-2 p-3 bg-gray-50 rounded-lg", children: [_jsx("input", { type: "text", value: eventUrl, readOnly: true, className: "flex-1 bg-transparent border-none outline-none text-gray-700" }), _jsxs("button", { onClick: handleCopyLink, className: "flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors", children: [_jsx(Copy, { className: "w-4 h-4" }), copySuccess ? 'Copied!' : 'Copy'] })] }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("a", { href: shareLinks.facebook, target: "_blank", rel: "noopener noreferrer", className: "p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: _jsx(Facebook, { className: "w-4 h-4" }) }), _jsx("a", { href: shareLinks.twitter, target: "_blank", rel: "noopener noreferrer", className: "p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors", children: _jsx(Twitter, { className: "w-4 h-4" }) }), _jsx("a", { href: shareLinks.linkedin, target: "_blank", rel: "noopener noreferrer", className: "p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors", children: _jsx(Linkedin, { className: "w-4 h-4" }) })] })] })] })), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(ArrowRight, { className: "w-4 h-4 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-blue-900 font-medium", children: isAutoRedirect
                                                        ? `Redirecting to dashboard in ${countdown} seconds`
                                                        : 'Auto-redirect disabled' }), _jsx("p", { className: "text-blue-700 text-sm", children: "You'll be taken to your dashboard automatically" })] })] }), _jsxs("button", { onClick: () => setIsAutoRedirect(!isAutoRedirect), className: "px-4 py-2 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors", children: [isAutoRedirect ? 'Stop' : 'Start', " Auto-redirect"] })] })] }) })] }));
}
