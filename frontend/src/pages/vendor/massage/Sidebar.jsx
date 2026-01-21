import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings,
  LogOut,
  X,
  MessageSquare,
  Calendar,
  Sparkles,
  Layers,
  PlusSquare
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, id, activeTab, onTabChange }) => {
  const isActive = activeTab === id;
  
  return (
    <button 
      onClick={() => onTabChange(id)}
      className={`relative w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
        isActive 
          ? 'text-green-600 bg-green-50 shadow-sm' 
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-500 rounded-r-full" />
      )}
      <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
      <span>{label}</span>
    </button>
  );
};

const SidebarSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
      {title}
    </h3>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

const Sidebar = ({ activeTab, onTabChange, isOpen, onClose, shopName = "MassageHub" }) => {
  const { logout } = useAuth();
  const handleTabChange = onTabChange || (() => {});

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        w-72 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 ease-out shadow-xl md:shadow-none
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-200">
                <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-800 tracking-tight truncate max-w-[160px]">{shopName}</span>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
          <nav className="space-y-1">
            <SidebarSection title="Overview">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" activeTab={activeTab} onTabChange={handleTabChange} />
              <SidebarItem icon={PlusSquare} label="New Service" id="new-service" activeTab={activeTab} onTabChange={handleTabChange} />
            </SidebarSection>
            
            <SidebarSection title="Service Management">
              <SidebarItem icon={Calendar} label="Appointments" id="appointments" activeTab={activeTab} onTabChange={handleTabChange} />
              <SidebarItem icon={Sparkles} label="Services" id="services" activeTab={activeTab} onTabChange={handleTabChange} />
              <SidebarItem icon={Layers} label="Categories" id="categories" activeTab={activeTab} onTabChange={handleTabChange} />
            </SidebarSection>

            <SidebarSection title="Client Relations">
              <SidebarItem icon={Users} label="Customers" id="customers" activeTab={activeTab} onTabChange={handleTabChange} />
              <SidebarItem icon={MessageSquare} label="Messages" id="messages" activeTab={activeTab} onTabChange={handleTabChange} />
            </SidebarSection>

            <SidebarSection title="Account">
              <SidebarItem icon={Settings} label="Settings" id="settings" activeTab={activeTab} onTabChange={handleTabChange} />
              <button 
                onClick={logout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </SidebarSection>
          </nav>
        </div>
      </aside>
    </>
  );
};

// Start of dummy PlusSquare import (since I missed it in import list above)

export default Sidebar;
