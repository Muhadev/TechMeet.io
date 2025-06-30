import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Mail,
  Settings, 
  LogOut
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
}

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigationItems: NavigationItem[];
  isMobile: boolean;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  navigationItems,
  isMobile
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className={`bg-white border-r border-gray-200 fixed left-0 top-16 h-[calc(100vh-4rem)] z-30 transition-all duration-300 ${
      isMobile ? 'w-16' : 'w-64'
    } overflow-y-auto`}>
      <nav className="p-6 h-full flex flex-col">
        <div className="space-y-2 flex-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${
                isMobile ? 'justify-center px-2' : 'space-x-3 px-3'
              } py-2 rounded-lg text-left transition-colors group relative ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title={isMobile ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isMobile && <span className="font-medium">{item.label}</span>}
              
              {/* Tooltip for mobile */}
              {isMobile && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Bottom section with Messages, Settings, and Sign Out */}
        <div className="mt-8 pt-8 border-t border-gray-200 space-y-2">
          <button 
            className={`w-full flex items-center ${
              isMobile ? 'justify-center px-2' : 'space-x-3 px-3'
            } py-2 text-gray-600 hover:bg-gray-50 rounded-lg group relative`}
            title={isMobile ? 'Messages' : ''}
          >
            <Mail className="w-5 h-5 flex-shrink-0" />
            {!isMobile && <span className="font-medium">Messages</span>}
            {isMobile && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                Messages
              </div>
            )}
          </button>
          
          <button 
            className={`w-full flex items-center ${
              isMobile ? 'justify-center px-2' : 'space-x-3 px-3'
            } py-2 text-gray-600 hover:bg-gray-50 rounded-lg group relative`}
            title={isMobile ? 'Settings' : ''}
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isMobile && <span className="font-medium">Settings</span>}
            {isMobile && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                Settings
              </div>
            )}
          </button>
          
          <button 
            onClick={logout}
            className={`w-full flex items-center ${
              isMobile ? 'justify-center px-2' : 'space-x-3 px-3'
            } py-2 text-red-600 hover:bg-red-50 rounded-lg group relative`}
            title={isMobile ? 'Sign Out' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isMobile && <span className="font-medium">Sign Out</span>}
            {isMobile && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                Sign Out
              </div>
            )}
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;