import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from '@/components/Navigation';
import { User, Camera, Save, AlertCircle, CheckCircle2, X, Settings } from 'lucide-react';
const ProfileSettings = () => {
    const { user, updateProfile, isLoading, error, clearError } = useAuth();
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.profile_picture || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const fileInputRef = useRef(null);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        clearError();
    };
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            setProfileImage(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    setPreviewUrl(result);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSuccessMessage('');
        clearError();
        try {
            const updateData = new FormData();
            updateData.append('first_name', formData.first_name);
            updateData.append('last_name', formData.last_name);
            if (profileImage) {
                updateData.append('profile_picture', profileImage);
            }
            // Type assertion for updateProfile - adjust based on your actual updateProfile function signature
            await updateProfile(updateData);
            setSuccessMessage('Profile updated successfully!');
            setProfileImage(null);
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        }
        catch (err) {
            console.error('Profile update failed:', err);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };
    const removeImage = () => {
        setProfileImage(null);
        setPreviewUrl(user?.profile_picture || '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    if (isLoading) {
        return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(Navigation, {}), _jsx("div", { className: "flex items-center justify-center min-h-[50vh]", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) })] }));
    }
    const userProfile = user;
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(Navigation, {}), _jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsx("div", { className: "mb-8", children: _jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [_jsx("div", { className: "p-2 bg-gray-100 rounded-lg", children: _jsx(Settings, { className: "h-6 w-6 text-gray-600" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Profile Settings" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage your personal information and preferences" })] })] }) }), _jsxs("div", { className: "bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden", children: [error && (_jsxs("div", { className: "mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error" }), _jsx("p", { className: "text-sm text-red-700 mt-1", children: error })] }), _jsx("button", { onClick: clearError, className: "ml-auto text-red-500 hover:text-red-700", children: _jsx(X, { className: "h-4 w-4" }) })] })), successMessage && (_jsxs("div", { className: "mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3", children: [_jsx(CheckCircle2, { className: "h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-green-800", children: "Success" }), _jsx("p", { className: "text-sm text-green-700 mt-1", children: successMessage })] })] })), _jsxs("div", { className: "px-6 py-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Current Profile" }), _jsxs("div", { className: "flex items-center space-x-6", children: [_jsx("div", { className: "flex-shrink-0", children: previewUrl ? (_jsx("img", { src: previewUrl, alt: "Profile", className: "h-20 w-20 rounded-full object-cover border-2 border-gray-200" })) : (_jsx("div", { className: "h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200", children: _jsx(User, { className: "h-10 w-10 text-gray-400" }) })) }), _jsxs("div", { className: "flex-1", children: [_jsxs("h3", { className: "text-xl font-semibold text-gray-900", children: [userProfile?.first_name, " ", userProfile?.last_name] }), _jsxs("p", { className: "text-gray-600 mt-1", children: ["@", userProfile?.username] }), _jsx("p", { className: "text-gray-500 text-sm mt-1", children: userProfile?.email }), _jsx("div", { className: "mt-2", children: _jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800", children: userProfile?.role }) })] })] })] }), _jsxs("div", { className: "p-6 space-y-8", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Profile Picture" }), _jsxs("div", { className: "flex items-start space-x-6", children: [_jsxs("div", { className: "relative", children: [previewUrl ? (_jsx("img", { src: previewUrl, alt: "Profile preview", className: "h-24 w-24 rounded-full object-cover border-2 border-gray-200" })) : (_jsx("div", { className: "h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200", children: _jsx(User, { className: "h-12 w-12 text-gray-400" }) })), _jsx("button", { type: "button", onClick: triggerFileInput, className: "absolute bottom-0 right-0 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-full p-2 shadow-sm transition-colors", children: _jsx(Camera, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsxs("button", { type: "button", onClick: triggerFileInput, className: "inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: [_jsx(Camera, { className: "h-4 w-4 mr-2" }), "Choose Photo"] }), profileImage && (_jsxs("button", { type: "button", onClick: removeImage, className: "inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500", children: [_jsx(X, { className: "h-4 w-4 mr-2" }), "Remove"] }))] }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "JPG or PNG format, up to 5MB. Recommended size: 400x400px" })] })] }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleImageChange, className: "hidden" })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Personal Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "first_name", className: "block text-sm font-medium text-gray-700 mb-2", children: "First Name *" }), _jsx("input", { type: "text", id: "first_name", name: "first_name", value: formData.first_name, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors", placeholder: "Enter your first name", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "last_name", className: "block text-sm font-medium text-gray-700 mb-2", children: "Last Name *" }), _jsx("input", { type: "text", id: "last_name", name: "last_name", value: formData.last_name, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors", placeholder: "Enter your last name", required: true })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Account Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Username" }), _jsx("input", { type: "text", value: userProfile?.username || '', className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed", disabled: true }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Username cannot be changed" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Email Address" }), _jsx("input", { type: "email", value: userProfile?.email || '', className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed", disabled: true }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Email cannot be changed" })] })] })] }), _jsxs("div", { className: "flex justify-between items-center pt-6 border-t border-gray-200", children: [_jsx("p", { className: "text-sm text-gray-500", children: "* Required fields" }), _jsx("button", { onClick: handleSubmit, disabled: isSubmitting, className: "inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Updating Profile..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save Changes"] })) })] })] })] })] })] }));
};
export default ProfileSettings;
