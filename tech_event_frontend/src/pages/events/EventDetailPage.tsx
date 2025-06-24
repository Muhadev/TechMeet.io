import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  User,
  Share2,
  Heart,
  ArrowLeft,
  Check,
  Plus,
  Minus,
  CreditCard,
  Shield,
  Star,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  ExternalLink,
  Tag
} from 'lucide-react';

// TypeScript interfaces
interface OrganizerDetails {
  username: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  ticket_price: string;
  max_attendees: number;
  status: string;
  category: string;
  banner_image?: string;
  organizer_details: OrganizerDetails;
}

interface TicketData {
  id: number;
  ticket_number: string;
  event_id: number;
  ticket_type: string;
}

interface PaymentData {
  reference: string;
  authorization_url: string;
}

interface TicketType {
  value: string;
  label: string;
  description: string;
}

interface ApiError {
  error?: string;
  message?: string;
}

export default function EventDetailPage() {
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State management
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [shareMenuOpen, setShareMenuOpen] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [ticketType, setTicketType] = useState<string>('STANDARD');
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [bookingStep, setBookingStep] = useState<'booking' | 'processing' | 'payment'>('booking');
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

// Available ticket types
const ticketTypes: TicketType[] = [
  { value: 'STANDARD', label: 'Standard', description: 'Access to all event activities' },
  { value: 'VIP', label: 'VIP', description: 'Premium access with exclusive benefits' },
  { value: 'EARLY_BIRD', label: 'Early Bird', description: 'Special early registration pricing' },
];

const handleBookingSubmit = async (): Promise<void> => {
  if (!event?.id) return;
  
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
    const ticketResponse = await api.post<TicketData>('/tickets/purchase/', formData, {
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
    
    const paymentResponse = await api.post<PaymentData>('/payments/initiate/', {
      ticket_id: ticket.id
    });

    const payment = paymentResponse.data;
    setPaymentData(payment);

    // Redirect to payment URL
    window.open(payment.authorization_url, '_blank');
    
    // Show success message with payment info
    alert(`Ticket created successfully! Complete your payment to confirm your booking. Reference: ${payment.reference}`);
    
  } catch (error: unknown) {
    console.error('Booking error:', error);
    const apiError = error as { response?: { data?: ApiError } };
    const errorMessage = apiError.response?.data?.error || 
                        apiError.response?.data?.message || 
                        'Booking failed. Please try again.';
    alert(errorMessage);
  } finally {
    setIsBooking(false);
    setBookingStep('booking');
    setShowBookingModal(false);
  }
};

// File upload handler
const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
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
    const fetchEvent = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await api.get<Event>(`/events/${id}/`);
        setEvent(response.data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/events')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPrice = parseFloat(event.ticket_price) * ticketQuantity;
  const eventUrl = `${window.location.origin}/events/${event.id}`;
  const isFree = parseFloat(event.ticket_price) === 0;

  const handleCopyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(`Check out this event: ${event.title}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`
  };

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-700">
          {event.banner_image && (
            <>
              <img
                src={event.banner_image}
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </>
          )}
          
          <div className="relative max-w-7xl mx-auto px-4 h-full flex items-end pb-8">
            <div className="text-white">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-4 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  event.status === 'PUBLISHED' 
                    ? 'bg-green-500/20 text-green-200 border border-green-500/30' 
                    : 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30'
                }`}>
                  {event.status}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-200 border border-blue-500/30">
                  {event.category}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
              
              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(event.start_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{event.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Start Date & Time</p>
                      <p className="font-medium text-gray-900">{formatDate(event.start_date)}</p>
                      <p className="text-sm text-gray-600">{formatTime(event.start_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">End Date & Time</p>
                      <p className="font-medium text-gray-900">{formatDate(event.end_date)}</p>
                      <p className="text-sm text-gray-600">{formatTime(event.end_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Max Attendees</p>
                      <p className="font-medium text-gray-900">{event.max_attendees}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizer Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Event Organizer</h3>
                <div className="flex items-center gap-4">
                  <img
                    src={event.organizer_details.profile_picture || '/api/placeholder/64/64'}
                    alt={event.organizer_details.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {event.organizer_details.first_name && event.organizer_details.last_name
                        ? `${event.organizer_details.first_name} ${event.organizer_details.last_name}`
                        : event.organizer_details.username
                      }
                    </h4>
                    <p className="text-gray-600">Event Organizer</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">Verified Organizer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-gray-900">
                        {isFree ? 'Free' : `₦${parseFloat(event.ticket_price).toLocaleString()}`}
                      </div>
                      <p className="text-gray-600">per ticket</p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Tickets
                      </label>
                      <div className="flex items-center justify-center gap-4 p-3 border border-gray-300 rounded-lg">
                        <button
                          onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                          className="p-1 hover:bg-gray-100 rounded"
                          disabled={ticketQuantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-xl w-8 text-center">{ticketQuantity}</span>
                        <button
                          onClick={() => setTicketQuantity(ticketQuantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Total Price */}
                    {!isFree && (
                      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
                        <span className="font-medium">Total</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ₦{totalPrice.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Book Button */}
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      {isFree ? 'Register for Free' : 'Book Now'}
                    </button>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600">
                      <Shield className="w-4 h-4 text-green-600" />
                      Secure booking guaranteed
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-gray-200 p-4 space-y-3">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={`w-full flex items-center justify-center gap-2 py-2 px-4 border rounded-lg transition-colors ${
                        isLiked 
                          ? 'border-red-300 text-red-600 bg-red-50' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      {isLiked ? 'Saved' : 'Save Event'}
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setShareMenuOpen(!shareMenuOpen)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        Share Event
                      </button>

                      {shareMenuOpen && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                          <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded">
                            <input
                              type="text"
                              value={eventUrl}
                              readOnly
                              className="flex-1 bg-transparent text-sm"
                            />
                            <button
                              onClick={handleCopyLink}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex justify-center gap-2">
                            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                              <Facebook className="w-4 h-4" />
                            </a>
                            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-500 text-white rounded hover:bg-sky-600">
                              <Twitter className="w-4 h-4" />
                            </a>
                            <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-700 text-white rounded hover:bg-blue-800">
                              <Linkedin className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {bookingStep === 'processing' ? 'Processing...' : 
             bookingStep === 'payment' ? 'Payment Required' : 
             'Book Your Ticket'}
          </h3>
          <button
            onClick={() => {
              setShowBookingModal(false);
              setBookingStep('booking');
            }}
            className="text-gray-400 hover:text-gray-600"
            disabled={isBooking}
          >
            ×
          </button>
        </div>

        {/* Event Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{formatDate(event.start_date)} at {formatTime(event.start_date)}</p>
            <p>{event.location}</p>
            <p>{ticketQuantity} ticket(s) - {ticketTypes.find(t => t.value === ticketType)?.label}</p>
            {!isFree && <p className="font-semibold">Total: ₦{totalPrice.toLocaleString()}</p>}
          </div>
        </div>

        {bookingStep === 'booking' && (
          <div className="space-y-4">
            {/* Ticket Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket Type
              </label>
              <div className="space-y-2">
                {ticketTypes.map((type) => (
                  <label key={type.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="ticketType"
                      value={type.value}
                      checked={ticketType === type.value}
                      onChange={(e) => setTicketType(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Image (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="custom-image-upload"
                />
                <label htmlFor="custom-image-upload" className="cursor-pointer">
                  <div className="text-gray-600">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm">Click to upload image</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </label>
                {customImage && (
                  <div className="mt-2 text-sm text-green-600">
                    Selected: {customImage.name}
                  </div>
                )}
              </div>
            </div>

            {/* Booking Button */}
            <button
              onClick={handleBookingSubmit}
              disabled={isBooking}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isBooking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  {isFree ? 'Register for Free' : 'Book & Pay Now'}
                </>
              )}
            </button>
          </div>
        )}

        {bookingStep === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Creating your ticket...</p>
          </div>
        )}

        {bookingStep === 'payment' && paymentData && (
          <div className="text-center py-8">
            <div className="mb-4">
              <Check className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Ticket Created!</h4>
              <p className="text-gray-600 mb-4">
                Your ticket has been created. Complete your payment to confirm your booking.
              </p>
              <p className="text-sm text-gray-500">
                Reference: {paymentData.reference}
              </p>
            </div>
            
            <div className="space-y-3">
              <a
                href={paymentData.authorization_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Complete Payment
              </a>
              
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingStep('booking');
                }}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                I'll Pay Later
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-green-600" />
          Your information is secure and encrypted
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}