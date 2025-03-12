// src/types/index.ts
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
    role: 'ADMIN' | 'ORGANIZER' | 'ATTENDEE';
    auth_provider?: 'email' | 'google' | 'github';
    created_at: string;
    updated_at: string;
  }