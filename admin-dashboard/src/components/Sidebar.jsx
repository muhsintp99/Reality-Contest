import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Trophy, Layers, Milestone, TrendingUp, 
  Bell, Settings, User, LogOut, Search, FileText, X
} from 'lucide-react';
import { HakaLogo } from './HakaLogo';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Admin Console', icon: LayoutDashboard },
  { id: 'users', label: 'User Directory', icon: Users },
  { id: 'contests', label: 'Contest Management', icon: Trophy },
  { id: 'categories', label: 'Category Management', icon: Layers },
  { id: 'quiz-builder', label: 'Quiz Builder', icon: FileText },
  { id: 'stages', label: 'Audition Stage Builder', icon: Milestone },
  { id: 'analytics', label: 'Analytics & Audit Logs', icon: TrendingUp },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: 3 },
  { id: 'settings', label: 'System Settings', icon: Settings }
];

export const Sidebar = ({ activeView, onLogout, isOpenMobile, setIsOpenMobile, role, isCollapsed, setIsCollapsed }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipY, setTooltipY] = useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!hoveredItem) return;
    const handleScroll = () => setHoveredItem(null);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const scrollContainers = document.querySelectorAll('.overflow-y-auto, .overflow-y-scroll');
    scrollContainers.forEach(container => {
      container.addEventListener('scroll', handleScroll, { passive: true });
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      scrollContainers.forEach(container => {
        container.removeEventListener('scroll', handleScroll);
      });
    };
  }, [hoveredItem]);

  const isSuperAdmin = role === 'Super Admin';
  
  // Super Admin can access everything. Admin has restricted access.
  const allowedIds = isSuperAdmin
    ? ['dashboard', 'users', 'contests', 'categories', 'quiz-builder', 'stages', 'analytics', 'notifications', 'settings']
    : ['dashboard', 'users', 'contests', 'notifications', 'settings'];

  const filteredMenu = MENU_ITEMS.filter(item => 
    allowedIds.includes(item.id) &&
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMenuClick = (id) => {
    navigate(`/admin-dashboard/${id}`);
    setIsOpenMobile(false);
  };

  const handleMouseEnter = (item, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredItem(item);
    setTooltipY(rect.top + rect.height / 2);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full text-slate-650 dark:text-slate-350 overflow-hidden">
      {/* Brand logo container aligned with Header height */}
      <div className={`h-16 flex items-center border-b border-slate-200/50 dark:border-white/5 ${isCollapsed ? 'justify-center px-2' : 'px-5'}`}>
        {isCollapsed ? (
          <div className="cursor-pointer flex items-center justify-center animate-fade-in" onClick={() => navigate('/admin-dashboard/dashboard')}>
            <HakaLogo variant="icon" size={24} className="text-brandPrimary" />
          </div>
        ) : (
          <div className="flex flex-col justify-center pl-1 cursor-pointer" onClick={() => navigate('/admin-dashboard/dashboard')}>
            <div className="flex items-center gap-2">
              <HakaLogo variant="horizontal" size={90} />
              <span className="text-[9px] bg-brandPrimary/10 text-brandPrimary border border-brandPrimary/20 px-1.5 py-0.5 rounded font-bold uppercase select-none">
                Console
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mini Search Filter */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-white/30" />
            <input
              type="text"
              placeholder="Search console..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary/50 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Navigation menu list - scrolls independently and hides scrollbars */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-6 space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {filteredMenu.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              onMouseEnter={(e) => handleMouseEnter(item, e)}
              onMouseLeave={handleMouseLeave}
              className={`w-full flex items-center rounded-2xl text-[13px] font-medium transition-all relative group ${
                isCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-3.5 py-2.5'
              } ${
                isActive 
                  ? 'bg-brandPrimary/10 text-brandPrimary dark:text-brandSecondary font-semibold' 
                  : 'hover:bg-slate-100/50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {/* Active bullet dot or bar */}
              {isActive && (
                <div className="absolute left-0 top-1/3 bottom-1/3 w-1 bg-brandPrimary dark:bg-brandSecondary rounded-r-full" />
              )}
              
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors ${isActive ? 'text-brandPrimary dark:text-brandSecondary' : 'text-slate-400 dark:text-white/20 group-hover:text-slate-650 dark:group-hover:text-white/60'}`} />
                {(!isCollapsed || isOpenMobile) && <span>{item.label}</span>}
              </div>

              {item.badge && (!isCollapsed || isOpenMobile) && (
                <span className="bg-brandSecondary/10 text-brandSecondary border border-brandSecondary/20 px-2 py-0.5 rounded-full text-[9px] font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Logout Footer - fixed at the bottom, centered when collapsed */}
      <div className={`border-t border-slate-100 dark:border-white/5 ${isCollapsed ? 'p-2' : 'p-3'}`}>
        <button
          onClick={onLogout}
          onMouseEnter={(e) => handleMouseEnter({ label: 'Logout Console' }, e)}
          onMouseLeave={handleMouseLeave}
          className={`w-full flex items-center gap-3 py-2.5 rounded-2xl text-[13px] font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all ${
            isCollapsed ? 'justify-center px-0' : 'justify-start px-3.5'
          }`}
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          {(!isCollapsed || isOpenMobile) && <span>Logout Console</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Layout - full height, zero scrollbars on wrapper */}
      <aside 
        className={`hidden md:block shrink-0 h-screen sticky top-0 border-r border-slate-200/50 dark:border-white/5 transition-all duration-300 z-40 bg-white/60 dark:bg-[#0B1120]/40 overflow-hidden ${
          isCollapsed ? 'w-20' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Custom Floating Tooltip for collapsed sidebar */}
      {isCollapsed && hoveredItem && (
        <div 
          className="fixed left-20 z-[9999] px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-semibold rounded-xl shadow-xl border border-slate-200/10 dark:border-white/5 whitespace-nowrap pointer-events-none transition-all duration-150 animate-scale-in"
          style={{ 
            top: `${tooltipY}px`,
            transform: 'translateY(-50%)'
          }}
        >
          {/* Subtle triangle point */}
          <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-l border-b border-slate-250/10 dark:border-white/5 rotate-45" />
          <span className="relative z-10">{hoveredItem.label}</span>
        </div>
      )}

      {/* Mobile Drawer Layout */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            onClick={() => setIsOpenMobile(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <div className="relative flex flex-col w-64 h-full bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-white/10 shadow-2xl z-50 animate-slide-in overflow-hidden">
            <button
              onClick={() => setIsOpenMobile(false)}
              className="absolute top-4 right-4 p-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-550 dark:text-white/70"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="h-full pt-4">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
