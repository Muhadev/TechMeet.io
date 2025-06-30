import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import dashboard sections
import OrganizerOverview from './organizer/OrganizerOverview';
import AttendeeOverview from './attendee/AttendeeOverview';
import OrganizerEvents from './organizer/OrganizerEvents';
import AttendeeEvents from './attendee/AttendeeEvents';
import OrganizerTickets from './organizer/OrganizerTickets';
import AttendeeTickets from './attendee/AttendeeTickets';
import OrganizerAttendees from './organizer/OrganizerAttendees';
import OrganizerAnalytics from './organizer/OrganizerAnalytics';
import AttendeeDiscover from './attendee/AttendeeDiscover';
import AttendeeFavorites from './attendee/AttendeeFavorites';
import DashboardHeader from './shared/DashboardHeader';
import DashboardSidebar from './shared/DashboardSidebar';

import { 
  Calendar, 
  Users, 
  Ticket, 
  TrendingUp, 
  BarChart3,
  Search, 
  Heart
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const commonItems: NavigationItem[] = [
      { id: 'overview', label: 'Overview', icon: BarChart3 }
    ];

    if (user?.role === 'ORGANIZER' || user?.role === 'ADMIN') {
      return [
        ...commonItems,
        { id: 'events', label: 'My Events', icon: Calendar },
        { id: 'tickets', label: 'Ticket Sales', icon: Ticket },
        { id: 'attendees', label: 'Attendees', icon: Users },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp }
      ];
    } else {
      return [
        ...commonItems,
        { id: 'events', label: 'My Events', icon: Calendar },
        { id: 'tickets', label: 'My Tickets', icon: Ticket },
        { id: 'discover', label: 'Discover Events', icon: Search },
        { id: 'favorites', label: 'Favorites', icon: Heart }
      ];
    }
  };

  const renderContent = () => {
    const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';
    
    switch (activeTab) {
      case 'overview':
        return isOrganizer ? <OrganizerOverview /> : <AttendeeOverview />;
      case 'events':
        return isOrganizer ? <OrganizerEvents /> : <AttendeeEvents />;
      case 'tickets':
        return isOrganizer ? <OrganizerTickets /> : <AttendeeTickets />;
      case 'attendees':
        return isOrganizer ? <OrganizerAttendees /> : null;
      case 'analytics':
        return isOrganizer ? <OrganizerAnalytics /> : null;
      case 'discover':
        return !isOrganizer ? <AttendeeDiscover /> : null;
      case 'favorites':
        return !isOrganizer ? <AttendeeFavorites /> : null;
      default:
        return isOrganizer ? <OrganizerOverview /> : <AttendeeOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="flex">
        <DashboardSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          navigationItems={getNavigationItems()}
          isMobile={isMobile}
        />

        {/* Main Content */}
        <main className={`flex-1 p-6 transition-all duration-300 ${
          isMobile ? 'ml-16' : 'ml-64'
        } overflow-y-auto h-[calc(100vh-4rem)]`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;