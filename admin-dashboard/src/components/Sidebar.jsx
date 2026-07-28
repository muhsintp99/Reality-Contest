import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Trophy, Crown, HelpCircle, ClipboardList,
  CheckSquare, Gamepad2, Award, Wallet, Landmark, ShieldCheck,
  Image, Bell, Share2, BarChart3, FileText, Megaphone,
  Ticket, ShieldAlert, Lock, TrendingUp, Settings, Search, X, UserCheck, Building, Shield,
  History, Smartphone, RefreshCw, ChevronDown, ChevronRight, Calendar, Sparkles, Vote, DollarSign
} from 'lucide-react';
import { HakaLogo } from './HakaLogo';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'user-management', label: 'User Management', icon: Users, hasSub: true },
  { id: 'contests', label: 'Contest Management', icon: Trophy },
  { id: 'grand-contest', label: 'Grand Contest', icon: Crown },
  { id: 'question-bank', label: 'Question Bank', icon: HelpCircle },
  { id: 'surveys', label: 'Survey Management', icon: ClipboardList },
  { id: 'tasks', label: 'Task Management', icon: CheckSquare },
  { id: 'challenges', label: 'Challenge Management', icon: Gamepad2 },
  { id: 'leaderboard', label: 'Leaderboard', icon: Award },
  { id: 'wallet', label: 'Wallet Management', icon: Wallet },
  { id: 'withdrawals', label: 'Withdrawal Management', icon: Landmark },
  { id: 'kyc', label: 'KYC Management', icon: ShieldCheck },
  { id: 'banners', label: 'Banner Management', icon: Image },
  { id: 'notifications', label: 'Notification Panel', icon: Bell },
  { id: 'referrals', label: 'Referral Management', icon: Share2 },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'cms', label: 'CMS', icon: FileText },
  { id: 'advertisements', label: 'Advertisement Mgmt', icon: Megaphone },
  { id: 'coupons', label: 'Coupon Management', icon: Ticket },
  { id: 'fraud-detection', label: 'Fraud Detection', icon: ShieldAlert },
  { id: 'roles-permissions', label: 'Roles & Permissions', icon: Lock },
  { id: 'myteam', label: 'My Team Directory', icon: UserCheck },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'settings', label: 'System Settings', icon: Settings }
];

const USER_MGMT_SUBITEMS = [
  { id: 'user-management/all-users', label: 'All Users', icon: Users },
  { id: 'user-management/kyc-status', label: 'KYC Status', icon: Shield },
  { id: 'user-management/wallet-balance', label: 'Wallet Balance', icon: Wallet },
  { id: 'user-management/contest-history', label: 'Contest History', icon: History },
  { id: 'user-management/login-history', label: 'Login History', icon: RefreshCw },
  { id: 'user-management/device-details', label: 'Device Details', icon: Smartphone },
  { id: 'user-management/referral-details', label: 'Referral Details', icon: Share2 }
];

const BANNER_MGMT_SUBITEMS = [
  { id: 'banners/home', label: 'Home Banner', icon: Image },
  { id: 'banners/popup', label: 'Popup Banner', icon: Megaphone },
  { id: 'banners/festival', label: 'Festival Banner', icon: Calendar },
  { id: 'banners/sponsored', label: 'Sponsored Banner', icon: Sparkles },
  { id: 'banners/announcement', label: 'Announcement', icon: Megaphone }
];

const ANALYTICS_SUBITEMS = [
  { id: 'analytics/dau-mau', label: 'DAU / MAU', icon: Users },
  { id: 'analytics/participation-rate', label: 'Contest Participation Rate', icon: Vote },
  { id: 'analytics/avg-session-time', label: 'Average Session Time', icon: History },
  { id: 'analytics/completion-rate', label: 'Contest Completion Rate', icon: CheckSquare },
  { id: 'analytics/question-accuracy', label: 'Question Accuracy', icon: HelpCircle },
  { id: 'analytics/category-popularity', label: 'Category Popularity', icon: Trophy },
  { id: 'analytics/revenue-by-contest', label: 'Revenue by Contest', icon: DollarSign },
  { id: 'analytics/top-earners', label: 'Top Earners', icon: Award },
  { id: 'analytics/top-referrers', label: 'Top Referrers', icon: Share2 },
  { id: 'analytics/retention-rate', label: 'Retention Rate', icon: TrendingUp },
  { id: 'analytics/conversion-rate', label: 'Conversion Rate', icon: Sparkles },
  { id: 'analytics/withdrawal-trends', label: 'Withdrawal Trends', icon: Landmark }
];

export const Sidebar = ({ activeView, onLogout, isOpenMobile, setIsOpenMobile, role, isCollapsed, setIsCollapsed, counts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipY, setTooltipY] = useState(0);
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(true);
  const [isBannerMgmtOpen, setIsBannerMgmtOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
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

  // Dynamic role-based menu items permission filter
  let allowedIds = MENU_ITEMS.map(i => i.id);

  if (role === 'Contest Manager') {
    allowedIds = ['dashboard', 'contests', 'grand-contest', 'question-bank', 'tasks', 'challenges', 'leaderboard', 'notifications', 'analytics'];
  } else if (role === 'Finance Manager') {
    allowedIds = ['dashboard', 'wallet', 'withdrawals', 'reports', 'coupons', 'notifications', 'settings'];
  } else if (role === 'Support Manager' || role === 'Support Executive') {
    allowedIds = ['dashboard', 'user-management', 'user-management/all-users', 'user-management/kyc-status', 'user-management/wallet-balance', 'user-management/contest-history', 'user-management/login-history', 'user-management/device-details', 'user-management/referral-details', 'kyc', 'notifications', 'settings'];
  } else if (role === 'Marketing Manager') {
    allowedIds = ['dashboard', 'surveys', 'banners', 'banners/home', 'banners/popup', 'banners/festival', 'banners/sponsored', 'banners/announcement', 'notifications', 'referrals', 'advertisements', 'coupons', 'analytics'];
  } else if (role === 'Content Moderator') {
    allowedIds = ['dashboard', 'contests', 'question-bank', 'tasks', 'cms', 'notifications'];
  } else if (role === 'KYC Officer') {
    allowedIds = ['dashboard', 'user-management', 'user-management/kyc-status', 'kyc', 'notifications', 'fraud-detection'];
  } else if (role === 'Analytics Manager') {
    allowedIds = ['dashboard', 'reports', 'analytics', 'notifications'];
  } else if (role === 'Question Manager') {
    allowedIds = ['dashboard', 'question-bank', 'contests', 'notifications'];
  }

  const filteredMenu = MENU_ITEMS.filter(item =>
    allowedIds.includes(item.id) &&
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  React.useEffect(() => {
    if (activeView && activeView.startsWith('user-management')) {
      setIsUserMgmtOpen(true);
    } else {
      setIsUserMgmtOpen(false);
    }

    if (activeView && activeView.startsWith('banners')) {
      setIsBannerMgmtOpen(true);
    } else {
      setIsBannerMgmtOpen(false);
    }

    if (activeView && activeView.startsWith('analytics')) {
      setIsAnalyticsOpen(true);
    } else {
      setIsAnalyticsOpen(false);
    }
  }, [activeView]);

  const handleMenuClick = (id) => {
    if (id === 'user-management') {
      setIsUserMgmtOpen(!isUserMgmtOpen);
      setIsBannerMgmtOpen(false);
      setIsAnalyticsOpen(false);
      navigate(`/admin-dashboard/user-management/all-users`);
    } else if (id === 'banners') {
      setIsBannerMgmtOpen(!isBannerMgmtOpen);
      setIsUserMgmtOpen(false);
      setIsAnalyticsOpen(false);
      navigate(`/admin-dashboard/banners/home`);
    } else if (id === 'analytics') {
      setIsAnalyticsOpen(!isAnalyticsOpen);
      setIsUserMgmtOpen(false);
      setIsBannerMgmtOpen(false);
      navigate(`/admin-dashboard/analytics/dau-mau`);
    } else {
      setIsUserMgmtOpen(false);
      setIsBannerMgmtOpen(false);
      setIsAnalyticsOpen(false);
      navigate(`/admin-dashboard/${id}`);
    }
    setIsOpenMobile(false);
  };

  const handleSubItemClick = (routeId) => {
    navigate(`/admin-dashboard/${routeId}`);
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
      {/* Brand logo container */}
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

      {/* Navigation menu list */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-6 space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {filteredMenu.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          if (item.id === 'user-management') {
            const isUserMgmtActive = activeView.startsWith('user-management');
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleMenuClick(item.id)}
                  onMouseEnter={(e) => handleMouseEnter(item, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`w-full flex items-center rounded-2xl text-[13px] font-medium transition-all relative group ${
                    isCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-3.5 py-2.5'
                  } ${isUserMgmtActive
                    ? 'bg-brandPrimary/10 text-brandPrimary dark:text-brandSecondary font-semibold'
                    : 'hover:bg-slate-100/50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {isUserMgmtActive && (
                    <div className="absolute left-0 top-1/3 bottom-1/3 w-1 bg-brandPrimary dark:bg-brandSecondary rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-brandPrimary dark:text-brandSecondary' : 'text-slate-400'}`} />
                    {(!isCollapsed || isOpenMobile) && <span className="whitespace-nowrap truncate pr-1">{item.label}</span>}
                  </div>
                  {(!isCollapsed || isOpenMobile) && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isUserMgmtOpen ? 'rotate-180' : 'rotate-0'}`} />
                  )}
                </button>

                {/* Sub-Items Dropdown with CSS Smooth Expand/Collapse Transition */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isUserMgmtOpen && (!isCollapsed || isOpenMobile)
                      ? 'grid-rows-[1fr] opacity-100 mt-1 mb-1'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-3 space-y-1 border-l-2 border-slate-200 dark:border-white/10 ml-3 py-1">
                      {USER_MGMT_SUBITEMS.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeView === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] whitespace-nowrap transition-all ${
                              isSubActive
                                ? 'bg-brandPrimary text-white font-bold shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                          >
                            <SubIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="whitespace-nowrap truncate">{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (item.id === 'banners') {
            const isBannerMgmtActive = activeView.startsWith('banners');
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleMenuClick(item.id)}
                  onMouseEnter={(e) => handleMouseEnter(item, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`w-full flex items-center rounded-2xl text-[13px] font-medium transition-all relative group ${
                    isCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-3.5 py-2.5'
                  } ${isBannerMgmtActive
                    ? 'bg-brandPrimary/10 text-brandPrimary dark:text-brandSecondary font-semibold'
                    : 'hover:bg-slate-100/50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {isBannerMgmtActive && (
                    <div className="absolute left-0 top-1/3 bottom-1/3 w-1 bg-brandPrimary dark:bg-brandSecondary rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isBannerMgmtActive ? 'text-brandPrimary dark:text-brandSecondary' : 'text-slate-400'}`} />
                    {(!isCollapsed || isOpenMobile) && <span className="whitespace-nowrap truncate pr-1">{item.label}</span>}
                  </div>
                  {(!isCollapsed || isOpenMobile) && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isBannerMgmtOpen ? 'rotate-180' : 'rotate-0'}`} />
                  )}
                </button>

                {/* Sub-Items Dropdown */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isBannerMgmtOpen && (!isCollapsed || isOpenMobile)
                      ? 'grid-rows-[1fr] opacity-100 mt-1 mb-1'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-3 space-y-1 border-l-2 border-slate-200 dark:border-white/10 ml-3 py-1">
                      {BANNER_MGMT_SUBITEMS.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeView === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] whitespace-nowrap transition-all ${
                              isSubActive
                                ? 'bg-brandPrimary text-white font-bold shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                          >
                            <SubIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="whitespace-nowrap truncate">{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (item.id === 'analytics') {
            const isAnalyticsActive = activeView.startsWith('analytics');
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleMenuClick(item.id)}
                  onMouseEnter={(e) => handleMouseEnter(item, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`w-full flex items-center rounded-2xl text-[13px] font-medium transition-all relative group ${
                    isCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-3.5 py-2.5'
                  } ${isAnalyticsActive
                    ? 'bg-brandPrimary/10 text-brandPrimary dark:text-brandSecondary font-semibold'
                    : 'hover:bg-slate-100/50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {isAnalyticsActive && (
                    <div className="absolute left-0 top-1/3 bottom-1/3 w-1 bg-brandPrimary dark:bg-brandSecondary rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isAnalyticsActive ? 'text-brandPrimary dark:text-brandSecondary' : 'text-slate-400'}`} />
                    {(!isCollapsed || isOpenMobile) && <span className="whitespace-nowrap truncate pr-1">{item.label}</span>}
                  </div>
                  {(!isCollapsed || isOpenMobile) && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isAnalyticsOpen ? 'rotate-180' : 'rotate-0'}`} />
                  )}
                </button>

                {/* Sub-Items Dropdown with CSS Smooth Expand/Collapse Transition */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isAnalyticsOpen && (!isCollapsed || isOpenMobile)
                      ? 'grid-rows-[1fr] opacity-100 mt-1 mb-1'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-3 space-y-1 border-l-2 border-slate-200 dark:border-white/10 ml-3 py-1">
                      {ANALYTICS_SUBITEMS.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeView === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] whitespace-nowrap transition-all ${
                              isSubActive
                                ? 'bg-brandPrimary text-white font-bold shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                          >
                            <SubIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="whitespace-nowrap truncate">{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              onMouseEnter={(e) => handleMouseEnter(item, e)}
              onMouseLeave={handleMouseLeave}
              className={`w-full flex items-center rounded-2xl text-[13px] font-medium transition-all relative group ${
                isCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-3.5 py-2.5'
              } ${isActive
                ? 'bg-brandPrimary/10 text-brandPrimary dark:text-brandSecondary font-semibold'
                : 'hover:bg-slate-100/50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/3 bottom-1/3 w-1 bg-brandPrimary dark:bg-brandSecondary rounded-r-full" />
              )}
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-brandPrimary dark:text-brandSecondary' : 'text-slate-400'}`} />
                {(!isCollapsed || isOpenMobile) && <span className="whitespace-nowrap truncate pr-1">{item.label}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden md:block shrink-0 h-screen sticky top-0 border-r border-[#C4E2A8]/70 dark:border-white/5 transition-all duration-300 z-40 bg-[#E3F0D7]/90 backdrop-blur-md dark:bg-[#0B1120]/40 overflow-hidden ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {isCollapsed && hoveredItem && (
        <div
          className="fixed left-20 z-[9999] px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-semibold rounded-xl shadow-xl border border-slate-200/10 dark:border-white/5 whitespace-nowrap pointer-events-none transition-all duration-150 animate-scale-in"
          style={{
            top: `${tooltipY}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-l border-b border-slate-250/10 dark:border-white/5 rotate-45" />
          <span className="relative z-10">{hoveredItem.label}</span>
        </div>
      )}

      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div onClick={() => setIsOpenMobile(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative flex flex-col w-64 h-full bg-[#EDF6E5] dark:bg-[#0B1120] border-r border-[#C4E2A8] dark:border-white/10 shadow-2xl z-50 animate-slide-in overflow-hidden">
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
