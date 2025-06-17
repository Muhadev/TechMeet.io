import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import api from '@/lib/axios'; // Use your axios instance instead of fetch
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  DollarSign, 
  FileText, 
  Tag, 
  Clock,
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Upload,
  X,
  AlertCircle
} from 'lucide-react';

// Form validation schema - Updated to be more flexible for drafts
const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title must be less than 255 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  location: z.string().min(5, 'Location must be at least 5 characters').max(255, 'Location must be less than 255 characters'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  category: z.string().min(1, 'Category is required'),
  max_attendees: z.number().min(1, 'Must allow at least 1 attendee').max(10000, 'Maximum 10,000 attendees allowed'),
  ticket_price: z.number().min(0, 'Price cannot be negative').max(1000000, 'Price too high'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  banner_image: z.any().optional()
}).refine((data) => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  return end > start;
}, {
  message: "End date must be after start date",
  path: ["end_date"]
}).refine((data) => {
  const start = new Date(data.start_date);
  return start > new Date();
}, {
  message: "Start date must be in the future",
  path: ["start_date"]
});

// Draft schema - more lenient validation for drafts
const draftEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title must be less than 255 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  location: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  max_attendees: z.number().min(1, 'Must allow at least 1 attendee').max(10000, 'Maximum 10,000 attendees allowed'),
  ticket_price: z.number().min(0, 'Price cannot be negative').max(1000000, 'Price too high'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  banner_image: z.any().optional()
});

type EventFormData = z.infer<typeof eventSchema>;

const categories = [
  'Technology',
  'Business',
  'Education',
  'Entertainment',
  'Sports',
  'Arts & Culture',
  'Health & Wellness',
  'Food & Drink',
  'Music',
  'Networking',
  'Workshop',
  'Conference',
  'Other'
];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset,
    trigger
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      status: 'DRAFT',
      max_attendees: 50,
      ticket_price: 0
    },
    mode: 'onChange'
  });

  const formatDateTimeLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSubmitError('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setSubmitError('');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    // Reset the file input
    const fileInput = document.getElementById('banner_image');
    if (fileInput) fileInput.value = '';
  };

  const submitEvent = async (data, actionType) => {
    console.log('submitEvent called with:', { data, actionType });
    
    const isPublish = actionType === 'publish';
    
    if (isPublish) {
      setIsPublishing(true);
    } else {
      setIsDraftSaving(true);
    }
    
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all form fields
      formData.append('title', data.title || '');
      formData.append('description', data.description || '');
      formData.append('location', data.location || '');
      
      // Handle dates - convert to ISO format if provided
      if (data.start_date) {
        const startDate = new Date(data.start_date);
        formData.append('start_date', startDate.toISOString());
      }
      
      if (data.end_date) {
        const endDate = new Date(data.end_date);
        formData.append('end_date', endDate.toISOString());
      }
      
      formData.append('category', data.category || '');
      formData.append('max_attendees', String(data.max_attendees || 50));
      formData.append('ticket_price', String(data.ticket_price || 0));
      formData.append('status', isPublish ? 'PUBLISHED' : 'DRAFT');
      
      // Add banner image if selected
      if (selectedImage) {
        formData.append('banner_image', selectedImage);
      }

      // Debug: Log what we're sending
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Use your axios instance instead of fetch
      const response = await api.post('/events/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set proper content type for file upload
        },
      });

      console.log('Response:', response.data);
      const createdEvent = response.data;

      // Navigate to success page with event data
      navigate('/events/success', { 
        state: { 
          event: createdEvent,
          action: isPublish ? 'published' : 'saved'
        }
      });
    } catch (error) {
      console.error('Error creating event:', error);
      
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        console.log('Error response:', errorData);
        
        if (error.response.status === 401) {
          setSubmitError('Authentication failed. Please log in again.');
          setTimeout(() => navigate('/login'), 3000);
        } else if (error.response.status === 403) {
          setSubmitError('You do not have permission to create events. Please contact an administrator.');
        } else if (error.response.status === 400) {
          // Handle validation errors
          const errorMessages = [];
          if (errorData.errors) {
            Object.entries(errorData.errors).forEach(([field, messages]) => {
              errorMessages.push(`${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`);
            });
          }
          if (errorData.error) {
            errorMessages.push(errorData.error);
          }
          if (errorData.message) {
            errorMessages.push(errorData.message);
          }
          if (errorData.non_field_errors) {
            if (Array.isArray(errorData.non_field_errors)) {
              errorMessages.push(...errorData.non_field_errors);
            } else {
              errorMessages.push(errorData.non_field_errors);
            }
          }
          setSubmitError(errorMessages.length > 0 ? errorMessages.join('\n') : 'Invalid data provided');
        } else {
          setSubmitError(errorData.message || errorData.error || `Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        setSubmitError('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        setSubmitError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
      setIsDraftSaving(false);
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    console.log('handleSaveDraft called');
    
    // Get current form values
    const currentValues = watch();
    console.log('Current form values:', currentValues);
    
    // Validate minimal required fields for draft
    const requiredFields = ['title', 'description', 'category'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!currentValues[field] || String(currentValues[field]).trim() === '') {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      setSubmitError(`The following fields are required: ${missingFields.join(', ')}`);
      return;
    }
    
    // Clear any previous errors
    setSubmitError('');
    
    // Submit as draft with current values
    await submitEvent(currentValues, 'draft');
  };

  const handlePublish = async () => {
    console.log('handlePublish called');
    
    // For publishing, use full form validation
    const isValid = await trigger();
    console.log('Form validation result:', isValid);
    
    if (!isValid) {
      console.log('Form errors:', errors);
      setSubmitError('Please fix all validation errors before publishing');
      return;
    }
    
    // Clear any previous errors
    setSubmitError('');
    
    // Submit the form with full validation
    handleSubmit((data) => {
      console.log('Publishing with data:', data);
      submitEvent(data, 'publish');
    })();
  };

  const handleCancel = () => {
    // Check if form has been modified
    const currentValues = watch();
    const hasChanges = isDirty || selectedImage || 
      currentValues.title || 
      currentValues.description || 
      currentValues.location ||
      currentValues.category ||
      currentValues.start_date ||
      currentValues.end_date ||
      currentValues.max_attendees !== 50 ||
      currentValues.ticket_price !== 0;

    if (hasChanges) {
      setShowCancelDialog(true);
    } else {
      navigate('/dashboard');
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    // Clear form data
    reset();
    setSelectedImage(null);
    setImagePreview('');
    navigate('/dashboard');
  };

  const handleStayAndContinue = () => {
    setShowCancelDialog(false);
  };

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 group transition-colors"
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
                <p className="text-gray-600 mt-1">Fill in the details below to create your event</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-red-800 text-sm whitespace-pre-line">{submitError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {/* Banner Image Upload */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Event Banner
                </h2>
                
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Banner preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-gray-600">Upload event banner image</p>
                        <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  )}
                  
                  <input
                    id="banner_image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  
                  <button
                    type="button"
                    onClick={() => document.getElementById('banner_image').click()}
                    className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title *
                    </label>
                    <input
                      {...register('title')}
                      type="text"
                      placeholder="Enter event title"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      placeholder="Describe your event in detail..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Category and Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Category *
                      </label>
                      <select
                        {...register('category')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                        disabled={isSubmitting}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location *
                      </label>
                      <input
                        {...register('location')}
                        type="text"
                        placeholder="Event location"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                        disabled={isSubmitting}
                      />
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Date & Time
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date & Time *
                    </label>
                    <input
                      {...register('start_date')}
                      type="datetime-local"
                      min={formatDateTimeLocal(new Date())}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                    {errors.start_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date & Time *
                    </label>
                    <input
                      {...register('end_date')}
                      type="datetime-local"
                      min={watch('start_date')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                    {errors.end_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Event Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Attendees *
                    </label>
                    <input
                      {...register('max_attendees', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      max="10000"
                      placeholder="50"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                    {errors.max_attendees && (
                      <p className="mt-1 text-sm text-red-600">{errors.max_attendees.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Ticket Price (₦)
                    </label>
                    <input
                      {...register('ticket_price', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                    {errors.ticket_price && (
                      <p className="mt-1 text-sm text-red-600">{errors.ticket_price.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Set to 0 for free events</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="px-6 py-3 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isDraftSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save as Draft
              </button>
              
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting}
                className="px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isPublishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                Publish Event
              </button>
            </div>
          </form>

          {/* Cancel Confirmation Dialog */}
          {showCancelDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Unsaved Changes</h3>
                <p className="text-gray-600 mb-6">
                  You have unsaved changes. Are you sure you want to leave without saving?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleStayAndContinue}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Stay & Continue
                  </button>
                  <button
                    onClick={confirmCancel}
                    className="px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Leave Without Saving
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}