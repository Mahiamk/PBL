import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Globe, LogOut, Bell, X, Check } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../../lib/api';
import { Link, useLocation } from 'react-router-dom';

const TopBar = ({ 
  onMenuClick, 
  language = 'en', 
  onLanguageChange, 
  searchQuery = '', 
  onSearchChange 
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const bellRef = useRef(null);
  
  // Helper to determine target tab based on notification type
  const getTargetTab = (type) => {
      switch(type) {
          case 'order': return 'orders';
          case 'appointment': return 'appointments';
          default: return 'messages';
      }
  };
  
  // Helper to check if we are already on the dashboard page
  // Assuming all vendor dashboards start with /vendor/
  const isVendorDashboard = location.pathname.startsWith('/vendor/');

  // Poll for notifications
  useEffect(() => {
    if (user) {
        // Initial fetch
        loadNotifications();
        
        const interval = setInterval(() => {
             if (document.visibilityState === 'visible') {
                 loadNotifications();
             }
        }, 60000); // Check every 60s
        
        return () => clearInterval(interval);
    }
  }, [user?.userId]); // Depend on ID instead of object
  
  // Reload on visibility change
  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible' && user) {
              loadNotifications();
          }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.userId]);
  
  // Close on click outside
  useEffect(() => {
      const handleClickOutside = (event) => {
          if (notificationRef.current && !notificationRef.current.contains(event.target) && !bellRef.current.contains(event.target)) {
               setShowNotifications(false);
          }
      };
      
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
       try {
           const data = await fetchNotifications();
           setNotifications(data);
       } catch (error) {
           console.error("Failed to fetch notifications", error);
       }
  };

  const handleCreateRead = async (id, relatedId, type) => {
       try {
           await markNotificationAsRead(id);
           // Update local state immediately
           setNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
           
           // Close dropdown
           setShowNotifications(false);
           
           // Note: Navigation happens automatically via Link or parent logic if implemented elsewhere, 
           // but here we are using Link in the render.
           
       } catch (error) {
           console.error("Failed to mark read", error);
       }
  };
  
  const handleMarkAllRead = async () => {
      try {
          await markAllNotificationsAsRead();
          setNotifications(prev => prev.map(n => ({...n, is_read: true})));
      } catch (error) {
           console.error("Failed to mark all read", error);
      }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-6 z-20">
      <div className="flex items-center flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 mr-2 md:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex-1 max-w-lg relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
            placeholder="Search products, orders, customers..."
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
             <button 
                ref={bellRef}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 relative"
             >
                 <Bell className="w-6 h-6" />
                 {unreadCount > 0 && (
                     <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                 )}
             </button>
             
             {showNotifications && (
                 <div ref={notificationRef} className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 border border-gray-100 z-50 animate-fade-in">
                     <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                         <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                         {unreadCount > 0 && (
                             <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                 <Check className="w-3 h-3" /> Mark all read
                             </button>
                         )}
                     </div>
                     <div className="max-h-96 overflow-y-auto">
                         {notifications.length === 0 ? (
                             <p className="px-4 py-8 text-center text-sm text-gray-500">No notifications</p>
                         ) : (
                             notifications.map(notif => (
                                 <Link 
                                    to={isVendorDashboard ? `?tab=${getTargetTab(notif.type)}&id=${notif.related_id || ''}` : '#'}
                                    onClick={(e) => {
                                        // If we are NOT on a vendor dashboard (e.g. settings page), we might need to navigate to root dashboard first.
                                        // But TopBar is usually used IN the dashboard.
                                        handleCreateRead(notif.id);
                                    }}
                                    key={notif.id}
                                    className={`block px-4 py-3 hover:bg-gray-50 border-b border-gray-50 relative ${notif.is_read ? 'opacity-60' : 'bg-blue-50/30'}`}
                                 >
                                     {!notif.is_read && (
                                         <span className="absolute left-1 top-4 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                     )}
                                     <p className={`text-sm ${notif.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{notif.title}</p>
                                     <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                                     <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.created_at).toLocaleTimeString()} · {new Date(notif.created_at).toLocaleDateString()}</p>
                                 </Link>
                             ))
                         )}
                     </div>
                 </div>
             )}
        </div>

        {/* Language Selector */}
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <select 
            value={language} 
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="my">Malay</option>
          </select>
        </div>

        {/* User Profile / Logout */}
        <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
           <span className="text-sm font-medium text-gray-700 hidden sm:block">
             {user?.name || 'Vendor'}
           </span>
           <button 
             onClick={logout}
             className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
             title="Logout"
           >
             <LogOut className="w-5 h-5" />
           </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;