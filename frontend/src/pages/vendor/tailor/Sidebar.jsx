import React from 'react';
import { 
  LayoutDashboard, 
  PlusSquare, 
  Package, 
  Link as LinkIcon, 
  Tags, 
  Hash, 
  Box, 
  Users, 
  Settings,
  LogOut,
  X,
  Calendar,
  Scissors,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, id, activeTab, onTabChange }) => {
  const isActive = activeTab === id;
  
  return (
    <button 
      onClick={() => onTabChange(id)}
      className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
        isActive 
          ? 'text-primary bg-green-50' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
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

const Sidebar = ({ activeTab, onTabChange, isOpen, onClose, shopName = "TailorHub" }) => {
  const { logout } = useAuth();
  const handleTabChange = onTabChange || (() => {});

  return (
    <>
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
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-200">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-800 tracking-tight truncate max-w-[160px]">{shopName}</span>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
          <nav className="space-y-1">
            <SidebarSection title="Quick Links">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" activeTab={activeTab} onTabChange={handleTabChange} />
              <SidebarItem icon={PlusSquare} label="New Service/Product" id="new-product" activeTab={activeTab} onTabChange={handleTabChange} />
            </SidebarSection>

            <SidebarSection title="Management">
              <SidebarItem icon={Calendar} label="Appointments" id="appointments" activeTab={activeTab} onTabChange={handleTabChange} />
              <SidebarItem icon={Scissors} label="Measurements" id="measurements" activeTab={activeTab} onTabChange={handleTabChange} />
            </SidebarSection>

            <SidebarSection title="Catalog">
              <SidebarItem icon={Package} label="Products & Fabrics" id="products" activeTab={activeTab} onTabChange={handleTabChange} />
              <SidebarItem icon={Scissors} label="Services" id="services" activeTab={activeTab} onTabChange={handleTabChange} />
              <SidebarItem icon={LinkIcon} label="Categories" id="categories" activeTab={activeTab} onTabChange={handleTabChange} />
              <SidebarItem icon={Tags} label="Collections" id="collections" activeTab={activeTab} onTabChange={handleTabChange} />
              <SidebarItem icon={Hash} label="Attributes" id="attributes" activeTab={activeTab} onTabChange={handleTabChange} />
              <SidebarItem icon={Box} label="Featured Items" id="featured" activeTab={activeTab} onTabChange={handleTabChange} />
            </SidebarSection>

            <SidebarSection title="Sale">
              <SidebarItem icon={Box} label="Orders" id="orders" activeTab={activeTab} onTabChange={handleTabChange} />
            </SidebarSection>

            <SidebarSection title="Customer">
              <SidebarItem icon={Users} label="Customers" id="customers" activeTab={activeTab} onTabChange={handleTabChange} />
              <SidebarItem icon={MessageSquare} label="Messages" id="messages" activeTab={activeTab} onTabChange={handleTabChange} />
            </SidebarSection>

            <SidebarSection title="Promotion">
              <SidebarItem icon={Settings} label="Setting" id="settings" activeTab={activeTab} onTabChange={handleTabChange} />
            </SidebarSection>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg w-full transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;