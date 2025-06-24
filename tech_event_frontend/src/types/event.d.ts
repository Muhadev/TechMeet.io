export interface Event {
    id: string | number;
    title: string;
    description: string;
    location: string;
    category: string;
    start_date: string;
    end_date: string;
    status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
    max_attendees: number;
    ticket_price: number;
    banner_image?: string;
    created_at: string;
    organizer_details: {
        username: string;
        first_name?: string;
        last_name?: string;
        profile_picture?: string;
    };
    statistics?: {
        total_tickets: number;
        occupancy_rate: number;
        checked_in: number;
        sold_tickets: number;
        available_capacity: number;
        ticket_types: TicketType[];
    };
}
export interface TicketType {
    id: string | number;
    name: string;
    price: number;
    quantity: number;
    sold: number;
}
export interface Attendee {
    user_id: string | number;
    name: string;
    email: string;
    ticket_number: string;
    ticket_type: string;
    checked_in: boolean;
    checked_in_time?: string;
}
export interface AnalyticsData {
    events: Event[];
    totalEvents: number;
    totalAttendees: number;
    totalRevenue: number;
}
export interface PaymentData {
    reference: string;
    authorization_url: string;
}
export interface AnalyticsOverview {
    totalEvents: number;
    totalRevenue: number;
    totalAttendees: number;
    avgOccupancyRate: number;
}
export interface AnalyticsState {
    overview: AnalyticsOverview;
    events: Event[];
}
