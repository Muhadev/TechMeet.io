import { LucideIcon } from 'lucide-react';
interface TicketType {
    ticket_type: string;
}
interface EventStatistics {
    total_tickets: number;
    sold_tickets: number;
    checked_in: number;
    occupancy_rate: number;
    ticket_types: TicketType[];
}
interface StatCardProps {
    icon: LucideIcon;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: keyof typeof colorClasses;
}
interface EventStatisticsProps {
    eventId: string | number;
}
declare const colorClasses: {
    readonly blue: "bg-blue-50 text-blue-600";
    readonly green: "bg-green-50 text-green-600";
    readonly purple: "bg-purple-50 text-purple-600";
    readonly orange: "bg-orange-50 text-orange-600";
    readonly indigo: "bg-indigo-50 text-indigo-600";
    readonly red: "bg-red-50 text-red-600";
};
declare const StatCard: React.FC<StatCardProps>;
declare const EventStatistics: React.FC<EventStatisticsProps>;
export { StatCard, EventStatistics };
export default EventStatistics;
