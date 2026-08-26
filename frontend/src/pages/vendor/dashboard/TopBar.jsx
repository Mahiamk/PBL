import React, { useState, useEffect, useRef } from 'react';
import { 
  List, 
  MagnifyingGlass, 
  Globe, 
  Bell, 
  SignOut, 
  CheckCircle,
  X
} from '@phosphor-icons/react';
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
  
  const getTargetTab = (type) => {
    switch(type) {
      case 'order': return 'orders';
      case 'appointment': return 'appointments';
      default: return 'messages';
    }
  };
  
  const isVendorDashboard = location.pathname.startsWith('/vendor');

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadNotifications();
        }
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.userId]);

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
      setNotifications(data || []);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleCreateRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
      setShowNotifications(false);
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
    <header className="bg-white/80 backdrop-blur-md border-b border-[#e8e8ed] h-16 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0">
      <div className="flex items-center flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 mr-2 md:hidden text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-xl transition-colors"
        >
          <List size={20} weight="bold" />
        </button>
        
        <div className="flex-1 max-w-sm relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#86868b]">
            <MagnifyingGlass size={16} weight="bold" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3.5 py-1.5 border border-[#e8e8ed] rounded-full text-xs bg-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:bg-white focus:border-[#8e6e7d] transition-all duration-200"
            placeholder="Search products, orders, records..."
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            ref={bellRef}
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#6e6e73] hover:text-[#1d1d1f] rounded-full hover:bg-[#f5f5f7] relative transition-colors"
          >
            <Bell size={19} weight="duotone" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <div ref={notificationRef} className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-xl py-2 border border-[#e8e8ed] z-50 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-[#e8e8ed] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1d1d1f]">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-[11px] text-[#8e6e7d] hover:text-[#594951] font-semibold flex items-center gap-1">
                    <CheckCircle size={13} weight="bold" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#f5f5f7]">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-xs text-[#86868b]">No notifications yet</p>
                ) : (
                  notifications.map(notif => (
                    <Link 
                      to={isVendorDashboard ? `?tab=${getTargetTab(notif.type)}&id=${notif.related_id || ''}` : '#'}
                      onClick={() => handleCreateRead(notif.id)}
                      key={notif.id}
                      className={`block px-4 py-3 hover:bg-[#fbfbfd] transition-colors relative ${notif.is_read ? 'opacity-60' : 'bg-[#f5edf0]/30'}`}
                    >
                      {!notif.is_read && (
                        <span className="absolute left-2 top-4 w-1.5 h-1.5 bg-[#8e6e7d] rounded-full"></span>
                      )}
                      <p className={`text-xs ${notif.is_read ? 'text-[#6e6e73]' : 'text-[#1d1d1f] font-bold'}`}>{notif.title}</p>
                      <p className="text-[11px] text-[#6e6e73] mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[9px] text-[#86868b] mt-1">{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(notif.created_at).toLocaleDateString()}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Language Pill */}
        <div className="flex items-center space-x-1.5 bg-[#f5f5f7] px-2.5 py-1 rounded-full border border-[#e8e8ed]">
          <Globe size={13} weight="duotone" className="text-[#86868b]" />
          <select 
            value={language} 
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-[#1d1d1f] focus:outline-none cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="my">MY</option>
          </select>
        </div>

        {/* Store Live Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Store Live</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;