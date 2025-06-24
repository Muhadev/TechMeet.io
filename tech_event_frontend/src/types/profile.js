// // types/profile.ts
export {};
// /**
//  * User role types
//  */
// export type UserRole = 'admin' | 'user' | 'moderator' | 'editor' | string;
// /**
//  * Core User interface
//  */
// export interface User {
//   id: string | number;
//   username: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   profile_picture?: string | null;
//   role: UserRole;
//   created_at?: string;
//   updated_at?: string;
// }
// /**
//  * Form data for profile updates
//  */
// export interface ProfileFormData {
//   first_name: string;
//   last_name: string;
// }
// /**
//  * Profile update payload that gets sent to the API
//  */
// export interface ProfileUpdateData extends ProfileFormData {
//   profile_picture?: File | null;
// }
// /**
//  * Auth context interface
//  */
// export interface AuthContextType {
//   user: User | null;
//   isLoading: boolean;
//   error: string | null;
//   updateProfile: (data: FormData) => Promise<void>;
//   clearError: () => void;
// }
// /**
//  * Component state interfaces
//  */
// export interface ProfileSettingsState {
//   formData: ProfileFormData;
//   profileImage: File | null;
//   previewUrl: string;
//   isSubmitting: boolean;
//   successMessage: string;
// }
// /**
//  * File validation result
//  */
// export interface FileValidationResult {
//   isValid: boolean;
//   error?: string;
// }
// /**
//  * File validation constraints
//  */
// export interface FileValidationConstraints {
//   maxSizeInBytes: number;
//   allowedTypes: string[];
// }
// /**
//  * Component props (if needed for future extensibility)
//  */
// export interface ProfileSettingsProps {
//   className?: string;
//   onProfileUpdate?: (user: User) => void;
//   onError?: (error: string) => void;
// }
// /**
//  * Form input change event
//  */
// export interface FormInputChangeEvent {
//   target: {
//     name: keyof ProfileFormData;
//     value: string;
//   };
// }
// /**
//  * File input change event
//  */
// export interface FileInputChangeEvent {
//   target: {
//     files: FileList | null;
//   };
// }
// /**
//  * API response types
//  */
// export interface ApiResponse<T = any> {
//   success: boolean;
//   data?: T;
//   message?: string;
//   error?: string;
// }
// export interface ProfileUpdateResponse extends ApiResponse {
//   data?: {
//     user: User;
//   };
// }
// /**
//  * Error types for better error handling
//  */
// export type ProfileError = 
//   | 'VALIDATION_ERROR'
//   | 'NETWORK_ERROR'
//   | 'FILE_TOO_LARGE'
//   | 'INVALID_FILE_TYPE'
//   | 'UPLOAD_FAILED'
//   | 'UNAUTHORIZED'
//   | 'SERVER_ERROR';
// export interface ProfileErrorDetails {
//   type: ProfileError;
//   message: string;
//   field?: keyof ProfileFormData | 'profile_picture';
// }
// /**
//  * Navigation component props (referenced in the component)
//  */
// export interface NavigationProps {
//   className?: string;
//   user?: User | null;
// }
// /**
//  * Utility types for form handling
//  */
// export type FormFieldName = keyof ProfileFormData;
// export type FormFieldValue = ProfileFormData[FormFieldName];
// /**
//  * Constants for validation
//  */
// export const PROFILE_CONSTANTS = {
//   MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
//   ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
//   SUCCESS_MESSAGE_DURATION: 3000,
//   RECOMMENDED_IMAGE_SIZE: '400x400px'
// } as const;
// /**
//  * Type guards for runtime type checking
//  */
// export const isUser = (obj: any): obj is User => {
//   return (
//     obj &&
//     typeof obj === 'object' &&
//     typeof obj.id !== 'undefined' &&
//     typeof obj.username === 'string' &&
//     typeof obj.email === 'string' &&
//     typeof obj.first_name === 'string' &&
//     typeof obj.last_name === 'string' &&
//     typeof obj.role === 'string'
//   );
// };
// export const isValidImageFile = (file: File): boolean => {
//   return (
//     file instanceof File &&
//     PROFILE_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.type) &&
//     file.size <= PROFILE_CONSTANTS.MAX_FILE_SIZE
//   );
// };
// /**
//  * Hook return type for useAuth
//  */
// export type UseAuthReturn = AuthContextType;
