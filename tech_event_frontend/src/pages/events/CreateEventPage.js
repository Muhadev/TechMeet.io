import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import api from '@/lib/axios';
import { CalendarDays, MapPin, Users, DollarSign, FileText, Tag, Clock, ArrowLeft, Save, Eye, Loader2, Upload, X, AlertCircle } from 'lucide-react';
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
    const { register, handleSubmit, formState: { errors, isDirty }, watch, reset, trigger } = useForm({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            status: 'DRAFT',
            max_attendees: 50,
            ticket_price: 0,
            title: '',
            description: '',
            location: '',
            start_date: '',
            end_date: '',
            category: ''
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
        const file = e.target?.files?.[0];
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
                const result = e.target?.result;
                if (typeof result === 'string') {
                    setImagePreview(result);
                }
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
        if (fileInput)
            fileInput.value = '';
    };
    const submitEvent = async (data, actionType) => {
        console.log('submitEvent called with:', { data, actionType });
        const isPublish = actionType === 'publish';
        if (isPublish) {
            setIsPublishing(true);
        }
        else {
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
                    'Content-Type': 'multipart/form-data',
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
        }
        catch (unknownError) {
            console.error('Error creating event:', unknownError);
            const error = unknownError;
            if (error.response) {
                // Server responded with error status
                const errorData = error.response.data;
                console.log('Error response:', errorData);
                if (error.response.status === 401) {
                    setSubmitError('Authentication failed. Please log in again.');
                    setTimeout(() => navigate('/login'), 3000);
                }
                else if (error.response.status === 403) {
                    setSubmitError('You do not have permission to create events. Please contact an administrator.');
                }
                else if (error.response.status === 400) {
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
                        }
                        else {
                            errorMessages.push(errorData.non_field_errors);
                        }
                    }
                    setSubmitError(errorMessages.length > 0 ? errorMessages.join('\n') : 'Invalid data provided');
                }
                else {
                    setSubmitError(errorData.message || errorData.error || `Server error: ${error.response.status}`);
                }
            }
            else if (error.request) {
                // Request was made but no response received
                setSubmitError('Network error. Please check your connection and try again.');
            }
            else {
                // Something else happened
                setSubmitError(error.message || 'An unexpected error occurred. Please try again.');
            }
        }
        finally {
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
        }
        else {
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
    return (_jsxs("div", { children: [_jsx(Navigation, {}), _jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("button", { onClick: handleCancel, className: "flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 group transition-colors", disabled: isSubmitting, children: [_jsx(ArrowLeft, { className: "w-4 h-4 group-hover:-translate-x-1 transition-transform" }), "Back to Dashboard"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600", children: _jsx(CalendarDays, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Create New Event" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Fill in the details below to create your event" })] })] })] }), submitError && (_jsxs("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" }), _jsx("div", { className: "text-red-800 text-sm whitespace-pre-line", children: submitError })] })), _jsxs("form", { onSubmit: (e) => e.preventDefault(), className: "space-y-8", children: [_jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-100 p-8", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2", children: [_jsx(Upload, { className: "w-5 h-5 text-blue-600" }), "Event Banner"] }), _jsxs("div", { className: "space-y-4", children: [imagePreview ? (_jsxs("div", { className: "relative", children: [_jsx("img", { src: imagePreview, alt: "Banner preview", className: "w-full h-48 object-cover rounded-lg border border-gray-200" }), _jsx("button", { type: "button", onClick: removeImage, className: "absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors", disabled: isSubmitting, children: _jsx(X, { className: "w-4 h-4" }) })] })) : (_jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors", children: [_jsx(Upload, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-gray-600", children: "Upload event banner image" }), _jsx("p", { className: "text-sm text-gray-400", children: "PNG, JPG up to 5MB" })] })] })), _jsx("input", { id: "banner_image", type: "file", accept: "image/*", onChange: handleImageChange, className: "hidden", disabled: isSubmitting }), _jsx("button", { type: "button", onClick: () => {
                                                                const fileInput = document.getElementById('banner_image');
                                                                fileInput?.click();
                                                            }, className: "px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50", disabled: isSubmitting, children: imagePreview ? 'Change Image' : 'Upload Image' })] })] }), _jsxs("div", { className: "mb-8", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5 text-blue-600" }), "Basic Information"] }), _jsxs("div", { className: "grid grid-cols-1 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Event Title *" }), _jsx("input", { ...register('title'), type: "text", placeholder: "Enter event title", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50", disabled: isSubmitting }), errors.title && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.title.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Description *" }), _jsx("textarea", { ...register('description'), rows: 4, placeholder: "Describe your event in detail...", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50", disabled: isSubmitting }), errors.description && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.description.message }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2", children: [_jsx(Tag, { className: "w-4 h-4" }), "Category *"] }), _jsxs("select", { ...register('category'), className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50", disabled: isSubmitting, children: [_jsx("option", { value: "", children: "Select a category" }), categories.map((category) => (_jsx("option", { value: category, children: category }, category)))] }), errors.category && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.category.message }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4" }), "Location *"] }), _jsx("input", { ...register('location'), type: "text", placeholder: "Event location", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50", disabled: isSubmitting }), errors.location && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.location.message }))] })] })] })] }), _jsxs("div", { className: "mb-8", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2", children: [_jsx(Clock, { className: "w-5 h-5 text-blue-600" }), "Date & Time"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Start Date & Time *" }), _jsx("input", { ...register('start_date'), type: "datetime-local", min: formatDateTimeLocal(new Date()), className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50", disabled: isSubmitting }), errors.start_date && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.start_date.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "End Date & Time *" }), _jsx("input", { ...register('end_date'), type: "datetime-local", min: watch('start_date') || '', className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50", disabled: isSubmitting }), errors.end_date && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.end_date.message }))] })] })] }), _jsxs("div", { children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2", children: [_jsx(Users, { className: "w-5 h-5 text-blue-600" }), "Event Details"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Maximum Attendees *" }), _jsx("input", { ...register('max_attendees', { valueAsNumber: true }), type: "number", min: "1", max: "10000", placeholder: "50", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50", disabled: isSubmitting }), errors.max_attendees && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.max_attendees.message }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-4 h-4" }), "Ticket Price (\u20A6)"] }), _jsx("input", { ...register('ticket_price', { valueAsNumber: true }), type: "number", min: "0", step: "0.01", placeholder: "0.00", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50", disabled: isSubmitting }), errors.ticket_price && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.ticket_price.message })), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Set to 0 for free events" })] })] })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-end", children: [_jsx("button", { type: "button", onClick: handleCancel, disabled: isSubmitting, className: "px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50", children: "Cancel" }), _jsxs("button", { type: "button", onClick: handleSaveDraft, disabled: isSubmitting, className: "px-6 py-3 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center gap-2", children: [isDraftSaving ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsx(Save, { className: "w-4 h-4" })), "Save as Draft"] }), _jsxs("button", { type: "button", onClick: handlePublish, disabled: isSubmitting, className: "px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center gap-2", children: [isPublishing ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsx(Eye, { className: "w-4 h-4" })), "Publish Event"] })] })] }), showCancelDialog && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Unsaved Changes" }), _jsx("p", { className: "text-gray-600 mb-6", children: "You have unsaved changes. Are you sure you want to leave without saving?" }), _jsxs("div", { className: "flex gap-3 justify-end", children: [_jsx("button", { onClick: handleStayAndContinue, className: "px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors", children: "Stay & Continue" }), _jsx("button", { onClick: confirmCancel, className: "px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors", children: "Leave Without Saving" })] })] }) }))] }) })] }));
}
