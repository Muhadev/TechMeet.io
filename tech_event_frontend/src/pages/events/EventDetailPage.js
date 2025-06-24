import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Calendar, Clock, MapPin, Users, Share2, Heart, ArrowLeft, Check, Plus, Minus, CreditCard, Shield, Star, Copy, Facebook, Twitter, Linkedin, ExternalLink } from 'lucide-react';
export default function EventDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    // State management
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [isBooking, setIsBooking] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [shareMenuOpen, setShareMenuOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [ticketType, setTicketType] = useState('STANDARD');
    const [customImage, setCustomImage] = useState(null);
    const [bookingStep, setBookingStep] = useState('booking');
    const [ticketData, setTicketData] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    // Available ticket types
    const ticketTypes = [
        { value: 'STANDARD', label: 'Standard', description: 'Access to all event activities' },
        { value: 'VIP', label: 'VIP', description: 'Premium access with exclusive benefits' },
        { value: 'EARLY_BIRD', label: 'Early Bird', description: 'Special early registration pricing' },
    ];
    const handleBookingSubmit = async () => {
        if (!event?.id)
            return;
        setIsBooking(true);
        setBookingStep('processing');
        try {
            // Create FormData for the ticket purchase
            const formData = new FormData();
            formData.append('event_id', event.id.toString());
            formData.append('ticket_type', ticketType);
            if (customImage) {
                formData.append('custom_image', customImage);
            }
            // Create ticket
            const ticketResponse = await api.post('/tickets/purchase/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const ticket = ticketResponse.data;
            setTicketData(ticket);
            // If the event is free, complete the process
            if (isFree) {
                alert(`Successfully registered! Your ticket number is ${ticket.ticket_number}`);
                setShowBookingModal(false);
                setBookingStep('booking');
                return;
            }
            // For paid events, initiate payment
            setBookingStep('payment');
            const paymentResponse = await api.post('/payments/initiate/', {
                ticket_id: ticket.id
            });
            const payment = paymentResponse.data;
            setPaymentData(payment);
            // Redirect to payment URL
            window.open(payment.authorization_url, '_blank');
            // Show success message with payment info
            alert(`Ticket created successfully! Complete your payment to confirm your booking. Reference: ${payment.reference}`);
        }
        catch (error) {
            console.error('Booking error:', error);
            const apiError = error;
            const errorMessage = apiError.response?.data?.error ||
                apiError.response?.data?.message ||
                'Booking failed. Please try again.';
            alert(errorMessage);
        }
        finally {
            setIsBooking(false);
            setBookingStep('booking');
            setShowBookingModal(false);
        }
    };
    // File upload handler
    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
                return;
            }
            setCustomImage(file);
        }
    };
    // Fetch event data
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/events/${id}/`);
                setEvent(response.data);
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An error occurred';
                setError(errorMessage);
            }
            finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchEvent();
        }
    }, [id]);
    // Loading state
    if (loading) {
        return (_jsxs("div", { children: [_jsx(Navigation, {}), _jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) })] }));
    }
    // Error state
    if (error) {
        return (_jsxs("div", { children: [_jsx(Navigation, {}), _jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Event Not Found" }), _jsx("p", { className: "text-gray-600 mb-4", children: error }), _jsx("button", { onClick: () => navigate('/events'), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Browse Events" })] }) })] }));
    }
    if (!event)
        return null;
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
    const totalPrice = parseFloat(event.ticket_price) * ticketQuantity;
    const eventUrl = `${window.location.origin}/events/${event.id}`;
    const isFree = parseFloat(event.ticket_price) === 0;
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
    return (_jsxs("div", { children: [_jsx(Navigation, {}), _jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsxs("div", { className: "relative h-96 bg-gradient-to-r from-blue-600 to-purple-700", children: [event.banner_image && (_jsxs(_Fragment, { children: [_jsx("img", { src: event.banner_image, alt: event.title, className: "absolute inset-0 w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-black bg-opacity-40" })] })), _jsx("div", { className: "relative max-w-7xl mx-auto px-4 h-full flex items-end pb-8", children: _jsxs("div", { className: "text-white", children: [_jsxs("button", { onClick: () => navigate(-1), className: "flex items-center gap-2 mb-4 text-white/80 hover:text-white transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back"] }), _jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("span", { className: `px-3 py-1 rounded-full text-sm font-medium ${event.status === 'PUBLISHED'
                                                        ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                                                        : 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30'}`, children: event.status }), _jsx("span", { className: "px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-200 border border-blue-500/30", children: event.category })] }), _jsx("h1", { className: "text-4xl md:text-5xl font-bold mb-4", children: event.title }), _jsxs("div", { className: "flex items-center gap-6 text-white/90", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5" }), _jsx("span", { children: formatDate(event.start_date) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-5 h-5" }), _jsx("span", { children: event.location })] })] })] }) })] }), _jsx("div", { className: "max-w-7xl mx-auto px-4 py-8", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-8", children: [_jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "About This Event" }), _jsx("p", { className: "text-gray-700 leading-relaxed mb-6", children: event.description }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center gap-3 p-4 bg-gray-50 rounded-lg", children: [_jsx(Calendar, { className: "w-5 h-5 text-blue-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Start Date & Time" }), _jsx("p", { className: "font-medium text-gray-900", children: formatDate(event.start_date) }), _jsx("p", { className: "text-sm text-gray-600", children: formatTime(event.start_date) })] })] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-gray-50 rounded-lg", children: [_jsx(Clock, { className: "w-5 h-5 text-purple-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "End Date & Time" }), _jsx("p", { className: "font-medium text-gray-900", children: formatDate(event.end_date) }), _jsx("p", { className: "text-sm text-gray-600", children: formatTime(event.end_date) })] })] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-gray-50 rounded-lg", children: [_jsx(MapPin, { className: "w-5 h-5 text-red-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Location" }), _jsx("p", { className: "font-medium text-gray-900", children: event.location })] })] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-gray-50 rounded-lg", children: [_jsx(Users, { className: "w-5 h-5 text-green-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Max Attendees" }), _jsx("p", { className: "font-medium text-gray-900", children: event.max_attendees })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 mb-4", children: "Event Organizer" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("img", { src: event.organizer_details.profile_picture || '/api/placeholder/64/64', alt: event.organizer_details.username, className: "w-16 h-16 rounded-full object-cover" }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900", children: event.organizer_details.first_name && event.organizer_details.last_name
                                                                        ? `${event.organizer_details.first_name} ${event.organizer_details.last_name}`
                                                                        : event.organizer_details.username }), _jsx("p", { className: "text-gray-600", children: "Event Organizer" }), _jsxs("div", { className: "flex items-center gap-1 mt-1", children: [_jsx(Star, { className: "w-4 h-4 text-yellow-500 fill-current" }), _jsx("span", { className: "text-sm text-gray-600", children: "Verified Organizer" })] })] })] })] })] }), _jsx("div", { className: "lg:col-span-1", children: _jsx("div", { className: "sticky top-8", children: _jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", children: [_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "text-3xl font-bold text-gray-900", children: isFree ? 'Free' : `₦${parseFloat(event.ticket_price).toLocaleString()}` }), _jsx("p", { className: "text-gray-600", children: "per ticket" })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Number of Tickets" }), _jsxs("div", { className: "flex items-center justify-center gap-4 p-3 border border-gray-300 rounded-lg", children: [_jsx("button", { onClick: () => setTicketQuantity(Math.max(1, ticketQuantity - 1)), className: "p-1 hover:bg-gray-100 rounded", disabled: ticketQuantity <= 1, children: _jsx(Minus, { className: "w-4 h-4" }) }), _jsx("span", { className: "font-semibold text-xl w-8 text-center", children: ticketQuantity }), _jsx("button", { onClick: () => setTicketQuantity(ticketQuantity + 1), className: "p-1 hover:bg-gray-100 rounded", children: _jsx(Plus, { className: "w-4 h-4" }) })] })] }), !isFree && (_jsxs("div", { className: "flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "font-medium", children: "Total" }), _jsxs("span", { className: "text-2xl font-bold text-blue-600", children: ["\u20A6", totalPrice.toLocaleString()] })] })), _jsxs("button", { onClick: () => setShowBookingModal(true), className: "w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2", children: [_jsx(CreditCard, { className: "w-5 h-5" }), isFree ? 'Register for Free' : 'Book Now'] }), _jsxs("div", { className: "flex items-center justify-center gap-2 mt-4 text-sm text-gray-600", children: [_jsx(Shield, { className: "w-4 h-4 text-green-600" }), "Secure booking guaranteed"] })] }), _jsxs("div", { className: "border-t border-gray-200 p-4 space-y-3", children: [_jsxs("button", { onClick: () => setIsLiked(!isLiked), className: `w-full flex items-center justify-center gap-2 py-2 px-4 border rounded-lg transition-colors ${isLiked
                                                                ? 'border-red-300 text-red-600 bg-red-50'
                                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`, children: [_jsx(Heart, { className: `w-4 h-4 ${isLiked ? 'fill-current' : ''}` }), isLiked ? 'Saved' : 'Save Event'] }), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setShareMenuOpen(!shareMenuOpen), className: "w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors", children: [_jsx(Share2, { className: "w-4 h-4" }), "Share Event"] }), shareMenuOpen && (_jsxs("div", { className: "absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded", children: [_jsx("input", { type: "text", value: eventUrl, readOnly: true, className: "flex-1 bg-transparent text-sm" }), _jsx("button", { onClick: handleCopyLink, className: "text-blue-600 hover:text-blue-800", children: _jsx(Copy, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "flex justify-center gap-2", children: [_jsx("a", { href: shareLinks.facebook, target: "_blank", rel: "noopener noreferrer", className: "p-2 bg-blue-600 text-white rounded hover:bg-blue-700", children: _jsx(Facebook, { className: "w-4 h-4" }) }), _jsx("a", { href: shareLinks.twitter, target: "_blank", rel: "noopener noreferrer", className: "p-2 bg-sky-500 text-white rounded hover:bg-sky-600", children: _jsx(Twitter, { className: "w-4 h-4" }) }), _jsx("a", { href: shareLinks.linkedin, target: "_blank", rel: "noopener noreferrer", className: "p-2 bg-blue-700 text-white rounded hover:bg-blue-800", children: _jsx(Linkedin, { className: "w-4 h-4" }) })] })] }))] })] })] }) }) })] }) }), showBookingModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsx("div", { className: "bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900", children: bookingStep === 'processing' ? 'Processing...' :
                                                    bookingStep === 'payment' ? 'Payment Required' :
                                                        'Book Your Ticket' }), _jsx("button", { onClick: () => {
                                                    setShowBookingModal(false);
                                                    setBookingStep('booking');
                                                }, className: "text-gray-400 hover:text-gray-600", disabled: isBooking, children: "\u00D7" })] }), _jsxs("div", { className: "mb-6 p-4 bg-gray-50 rounded-lg", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: event.title }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("p", { children: [formatDate(event.start_date), " at ", formatTime(event.start_date)] }), _jsx("p", { children: event.location }), _jsxs("p", { children: [ticketQuantity, " ticket(s) - ", ticketTypes.find(t => t.value === ticketType)?.label] }), !isFree && _jsxs("p", { className: "font-semibold", children: ["Total: \u20A6", totalPrice.toLocaleString()] })] })] }), bookingStep === 'booking' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Ticket Type" }), _jsx("div", { className: "space-y-2", children: ticketTypes.map((type) => (_jsxs("label", { className: "flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50", children: [_jsx("input", { type: "radio", name: "ticketType", value: type.value, checked: ticketType === type.value, onChange: (e) => setTicketType(e.target.value), className: "mr-3" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: type.label }), _jsx("div", { className: "text-sm text-gray-600", children: type.description })] })] }, type.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Custom Image (Optional)" }), _jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors", children: [_jsx("input", { type: "file", accept: "image/*", onChange: handleImageUpload, className: "hidden", id: "custom-image-upload" }), _jsx("label", { htmlFor: "custom-image-upload", className: "cursor-pointer", children: _jsxs("div", { className: "text-gray-600", children: [_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", stroke: "currentColor", fill: "none", viewBox: "0 0 48 48", children: _jsx("path", { d: "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }), _jsx("p", { className: "mt-2 text-sm", children: "Click to upload image" }), _jsx("p", { className: "text-xs text-gray-500", children: "PNG, JPG, GIF up to 5MB" })] }) }), customImage && (_jsxs("div", { className: "mt-2 text-sm text-green-600", children: ["Selected: ", customImage.name] }))] })] }), _jsx("button", { onClick: handleBookingSubmit, disabled: isBooking, className: "w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2", children: isBooking ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), "Processing..."] })) : (_jsxs(_Fragment, { children: [_jsx(CreditCard, { className: "w-5 h-5" }), isFree ? 'Register for Free' : 'Book & Pay Now'] })) })] })), bookingStep === 'processing' && (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Creating your ticket..." })] })), bookingStep === 'payment' && paymentData && (_jsxs("div", { className: "text-center py-8", children: [_jsxs("div", { className: "mb-4", children: [_jsx(Check, { className: "w-12 h-12 text-green-600 mx-auto mb-2" }), _jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Ticket Created!" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Your ticket has been created. Complete your payment to confirm your booking." }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Reference: ", paymentData.reference] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("a", { href: paymentData.authorization_url, target: "_blank", rel: "noopener noreferrer", className: "w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2", children: [_jsx(ExternalLink, { className: "w-5 h-5" }), "Complete Payment"] }), _jsx("button", { onClick: () => {
                                                            setShowBookingModal(false);
                                                            setBookingStep('booking');
                                                        }, className: "w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors", children: "I'll Pay Later" })] })] })), _jsxs("div", { className: "mt-4 flex items-center justify-center gap-2 text-sm text-gray-600", children: [_jsx(Shield, { className: "w-4 h-4 text-green-600" }), "Your information is secure and encrypted"] })] }) }) }))] })] }));
}
