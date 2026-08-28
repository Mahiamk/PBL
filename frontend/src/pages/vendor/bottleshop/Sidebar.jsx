import React from 'react';
import { 
  SquaresFour, 
  PlusCircle, 
  Package, 
  Folders, 
  Tag, 
  SlidersHorizontal, 
  Receipt, 
  Users, 
  ChatTeardropText, 
  Image,
  SignOut, 
  X,
  Drop,
  SidebarSimple,
  CaretRight
} from '@phosphor-icons/react';
import { useAuth } from '../../../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, id, activeTab, onTabChange, isCollapsed }) => {
  const isActive = activeTab === id;
  
  return (
    <button 
      onClick={() => onTabChange(id)}
      title={isCollapsed ? label : undefined}
      className={`group relative w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-3.5 py-2.5'} text-xs font-semibold rounded-2xl transition-all duration-200 ${
        isActive 
          ? 'bg-[#f5edf0] text-[#1d1d1f] shadow-xs' 
          : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
      }`}
    >
      <Icon 
        size={20} 
        weight={isActive ? "fill" : "duotone"} 
        className={`transition-colors shrink-0 ${isActive ? 'text-[#8e6e7d]' : 'text-[#86868b] group-hover:text-[#1d1d1f]'}`} 
      />
      {!isCollapsed && (
        <>
          <span className="truncate">{label}</span>
          {isActive && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#8e6e7d] shrink-0" />
          )}
        </>
      )}
    </button>
  );
};

const SidebarSection = ({ title, children, isCollapsed }) => (
  <div className="mb-4">
    {!isCollapsed ? (
      <h3 className="px-3.5 text-[10px] font-bold text-[#86868b] uppercase tracking-widest mb-1.5">
        {title}
      </h3>
    ) : (
      <div className="my-2 border-t border-[#f0eaed] mx-2" />
    )}
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

const Sidebar = ({ 
  activeTab, 
  onTabChange, 
  isOpen, 
  onClose, 
  shopName = "AIU Flask & Bottle Shop",
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { user, logout } = useAuth();
  const handleTabChange = onTabChange || (() => {});

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#1d1d1f]/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        ${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-[#e8e8ed] fixed inset-y-0 left-0 z-50 flex flex-col justify-between transition-all duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div>
          {/* Header */}
          <div className={`h-18 px-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-[#e8e8ed]`}>
            {!isCollapsed ? (
              <div className="flex items-center space-x-3 truncate">
                <div className="w-9 h-9 bg-[#1d1d1f] text-white rounded-2xl flex items-center justify-center shadow-xs shrink-0">
                  <Drop size={20} weight="duotone" />
                </div>
                <div className="truncate">
                  <span className="text-sm font-extrabold text-[#1d1d1f] tracking-tight block truncate">
                    {shopName}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e6e7d] flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Campus Drinkware</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-9 h-9 bg-[#1d1d1f] text-white rounded-2xl flex items-center justify-center shadow-xs shrink-0" title={shopName}>
                <Drop size={20} weight="duotone" />
              </div>
            )}

            <div className="flex items-center space-x-1">
              {onToggleCollapse && !isCollapsed && (
                <button 
                  onClick={onToggleCollapse}
                  title="Collapse sidebar"
                  className="hidden md:flex p-1.5 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-xl transition-colors"
                >
                  <SidebarSimple size={18} weight="bold" />
                </button>
              )}

              <button 
                onClick={onClose} 
                className="md:hidden p-1.5 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition-colors"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
          </div>

          {onToggleCollapse && isCollapsed && (
            <div className="px-3 pt-3 flex justify-center hidden md:flex">
              <button 
                onClick={onToggleCollapse}
                title="Expand sidebar"
                className="w-full py-1.5 flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-xl transition-colors"
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className={`overflow-y-auto ${isCollapsed ? 'py-3 px-2' : 'py-5 px-3'} max-h-[calc(100vh-140px)] space-y-1`}>
            <SidebarSection title="Quick Actions" isCollapsed={isCollapsed}>
              <SidebarItem icon={SquaresFour} label="Overview & Stats" id="dashboard" activeTab={activeTab} onTabChange={handleTabChange} isCollapsed={isCollapsed} />
              <SidebarItem icon={PlusCircle} label="Add Bottle / Flask" id="new-product" activeTab={activeTab} onTabChange={handleTabChange} isCollapsed={isCollapsed} />
            </SidebarSection>

            <SidebarSection title="Inventory & Drinkware" isCollapsed={isCollapsed}>
              <SidebarItem icon={Package} label="Flasks & Tumblers" id="products" activeTab={activeTab} onTabChange={handleTabChange} isCollapsed={isCollapsed} />
              <SidebarItem icon={Folders} label="Categories" id="categories" activeTab={activeTab} onTabChange={handleTabChange} isCollapsed={isCollapsed} />
              <SidebarItem icon={Tag} label="Special Series" id="collections" activeTab={activeTab} onTabChange={handleTabChange} isCollapsed={isCollapsed} />
              <SidebarItem icon={SlidersHorizontal} label="Colors & Sizes" id="attributes" activeTab={activeTab} onTabChange={handleTabChange} isCollapsed={isCollapsed} />
            </SidebarSection>

            <SidebarSection title="Sales & Orders" isCollapsed={isCollapsed}>
              <SidebarItem icon={Receipt} label="Customer Orders" id="orders" activeTab={activeTab} onTabChange={handleTabChange} isCollapsed={isCollapsed} />
              <SidebarItem icon={Users} label="Customer Directory" id="customers" activeTab={activeTab} onTabChange={handleTabChange} isCollapsed={isCollapsed} />
              <SidebarItem icon={ChatTeardropText} label="Customer Messages" id="messages" activeTab={activeTab} onTabChange={handleTabChange} isCollapsed={isCollapsed} />
            </SidebarSection>

            <SidebarSection title="Storefront & Branding" isCollapsed={isCollapsed}>
              <SidebarItem icon={Image} label="Shop Banner" id="banner" activeTab={activeTab} onTabChange={handleTabChange} isCollapsed={isCollapsed} />
            </SidebarSection>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-3 border-t border-[#e8e8ed] bg-[#fbfbfd] ${isCollapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between px-2 py-1 mb-2">
                <div className="flex items-center space-x-2 truncate">
                  <div className="w-7 h-7 rounded-full bg-[#f5edf0] text-[#594951] font-bold text-xs flex items-center justify-center shrink-0">
                    {user?.firstName?.[0] || user?.name?.[0] || 'F'}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-[#1d1d1f] block truncate">
                      {user?.firstName || user?.name || 'Bottle Vendor'}
                    </span>
                    <span className="text-[10px] text-[#86868b] block truncate">
                      {user?.email || 'bottleshop@aiu.edu'}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={logout}
                className="flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-[#86868b] hover:text-rose-600 hover:bg-rose-50 rounded-2xl w-full transition-all duration-200"
              >
                <SignOut size={16} weight="duotone" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <div 
                className="w-8 h-8 rounded-full bg-[#f5edf0] text-[#594951] font-bold text-xs flex items-center justify-center"
                title={`${user?.firstName || user?.name || 'Bottle Vendor'} (${user?.email || ''})`}
              >
                {user?.firstName?.[0] || user?.name?.[0] || 'F'}
              </div>
              <button 
                onClick={logout}
                title="Sign Out"
                className="p-2 text-[#86868b] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <SignOut size={18} weight="duotone" />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;