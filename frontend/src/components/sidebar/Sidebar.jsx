import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Trophy, Layers, Milestone, Scale, Award, 
  CreditCard, Wallet, Gift, Medal, TrendingUp, FileSpreadsheet, Bell, 
  MessageSquare, HelpCircle, Settings, User, LogOut, ChevronLeft, ChevronRight, Search, Menu, X
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'contests', label: 'Contests', icon: Trophy },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'stages', label: 'Stages', icon: Milestone },
  { id: 'judges', label: 'Judges', icon: Scale },
  { id: 'sponsors', label: 'Sponsors', icon: Award },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'leaderboard', label: 'Leaderboard', icon: Medal },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: 3 },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'support', label: 'Support', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile', label: 'Profile', icon: User }
];

export const Sidebar = ({ activeView, onViewChange, onLogout, isOpenMobile, setIsOpenMobile }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMenu = MENU_ITEMS.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarContent = (
    <div className="flex flex-col h-full text-white/90">
      {/* Brand Section */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 dark:border-white/5 light:border-black/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brandPrimary/10 border border-brandPrimary/30 rounded-xl text-brandPrimary">
            <Trophy className="w-5 h-5 shrink-0" />
          </div>
          {!isCollapsed && (
            <span className="font-poppins font-extrabold text-sm tracking-wider uppercase bg-gradient-to-r from-brandPrimary to-brandSecondary bg-clip-text text-transparent">
              RCP Syndicate
            </span>
          )}
        </div>
        
        {/* Toggle Collapse Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 hover:bg-white/5 rounded-lg border border-white/5 text-white/50 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Mini Search Filter */}
      {!isCollapsed && (
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080b12]/30 border border-white/5 dark:border-white/5 light:border-black/10 rounded-xl pl-9 pr-4 py-2 text-xs placeholder-white/30 focus:outline-none focus:border-brandPrimary/50 transition-colors"
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
              onClick={() => {
                onViewChange(item.id);
                setIsOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group ${
                isActive 
                  ? 'bg-brandPrimary/10 text-brandPrimary border border-brandPrimary/20 shadow-md' 
                  : 'hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 text-white/60 hover:text-white border border-transparent'
              }`}
            >
              {/* Left active line glow indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brandPrimary rounded-r" />
              )}
              
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-brandPrimary' : 'text-white/40 group-hover:text-white/80'}`} />
                {(!isCollapsed || isOpenMobile) && <span>{item.label}</span>}
              </div>

              {item.badge && (!isCollapsed || isOpenMobile) && (
                <span className="bg-brandSecondary/20 text-brandSecondary px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed sidebar */}
              {isCollapsed && !isOpenMobile && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-darkCard text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-white/10 select-none whitespace-nowrap">
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
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!isCollapsed || isOpenMobile) && <span>Logout Session</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Floating Glass container) */}
      <aside 
        className={`hidden md:block shrink-0 h-[calc(100vh-2rem)] sticky top-4 left-4 my-4 ml-4 glassmorphism border border-white/10 dark:border-white/5 light:border-black/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Dynamic Aurora Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-brandPrimary/5 via-transparent to-transparent opacity-40 pointer-events-none" />
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Slide-out Menu */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay backdrop */}
          <div 
            onClick={() => setIsOpenMobile(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <div className="relative flex flex-col w-72 h-full bg-[#0B1120] border-r border-white/10 shadow-2xl z-50 animate-slide-in">
            {/* Close button inside mobile menu */}
            <button
              onClick={() => setIsOpenMobile(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 text-white/55 hover:text-white"
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
