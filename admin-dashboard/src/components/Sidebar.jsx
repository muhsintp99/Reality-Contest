import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Trophy, Layers, Milestone, TrendingUp, 
  Bell, Settings, User, LogOut, ChevronLeft, ChevronRight, Search, ShieldCheck
} from 'lucide-react';
import { HakaLogo } from './HakaLogo';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Admin Console', icon: LayoutDashboard },
  { id: 'users', label: 'User Directory', icon: Users },
  { id: 'contests', label: 'Contest Management', icon: Trophy },
  { id: 'categories', label: 'Quiz & Category Builder', icon: Layers },
  { id: 'stages', label: 'Audition Stage Builder', icon: Milestone },
  { id: 'analytics', label: 'Analytics & Audit Logs', icon: TrendingUp },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: 3 },
  { id: 'settings', label: 'System Settings', icon: Settings },
  { id: 'profile', label: 'Profile Overview', icon: User }
];

export const Sidebar = ({ activeView, onLogout, isOpenMobile, setIsOpenMobile, role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const isSuperAdmin = role === 'Super Admin';
  
  // Super Admin can access everything. Admin has restricted access.
  const allowedIds = isSuperAdmin
    ? ['dashboard', 'users', 'contests', 'categories', 'stages', 'analytics', 'notifications', 'settings', 'profile']
    : ['dashboard', 'users', 'contests', 'notifications', 'settings', 'profile'];

  const filteredMenu = MENU_ITEMS.filter(item => 
    allowedIds.includes(item.id) &&
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMenuClick = (id) => {
    navigate(`/admin-dashboard/${id}`);
    setIsOpenMobile(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full text-slate-700 dark:text-white/90">
      <div className="flex items-center justify-between p-4 border-b border-white/5 dark:border-white/5 light:border-black/5">
        {isCollapsed ? (
          <div className="mx-auto">
            <HakaLogo variant="icon" size={28} className="w-7 h-7" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <HakaLogo variant="horizontal" size={90} />
            <span className="text-[9px] bg-brandPrimary/20 text-brandPrimary px-1.5 py-0.5 rounded font-bold uppercase select-none">
              Console
            </span>
          </div>
        )}
        
        {/* Toggle Collapse Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5 text-slate-400 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Mini Search Filter */}
      {!isCollapsed && (
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-white/30" />
            <input
              type="text"
              placeholder="Search console..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#080b12]/30 border border-slate-200 dark:border-white/5 light:border-black/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-brandPrimary/50 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Menu Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {filteredMenu.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group ${
                isActive 
                  ? 'bg-brandPrimary/10 text-brandPrimary border border-brandPrimary/20 shadow-md' 
                  : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              {/* Left active line glow indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brandPrimary rounded-r" />
              )}
              
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-brandPrimary' : 'text-slate-400 dark:text-white/40 group-hover:text-slate-700 dark:group-hover:text-white/80'}`} />
                {(!isCollapsed || isOpenMobile) && <span>{item.label}</span>}
              </div>

              {item.badge && (!isCollapsed || isOpenMobile) && (
                <span className="bg-brandSecondary/20 text-brandSecondary px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed sidebar */}
              {isCollapsed && !isOpenMobile && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-white dark:bg-darkCard text-slate-800 dark:text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-slate-200 dark:border-white/10 select-none whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-t border-white/5 dark:border-white/5 light:border-black/5">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 dark:text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!isCollapsed || isOpenMobile) && <span>Logout Console</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:block shrink-0 h-[calc(100vh-2rem)] sticky top-4 left-4 my-4 ml-4 glassmorphism border border-white/10 dark:border-white/5 light:border-black/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-brandPrimary/5 via-transparent to-transparent opacity-40 pointer-events-none" />
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Slide-out Menu */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            onClick={() => setIsOpenMobile(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <div className="relative flex flex-col w-72 h-full bg-[#0B1120] border-r border-white/10 shadow-2xl z-50 animate-slide-in">
            <button
              onClick={() => setIsOpenMobile(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 text-white/55 hover:text-white"
            >
              ✕
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
