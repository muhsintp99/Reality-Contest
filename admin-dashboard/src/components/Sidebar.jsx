import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Trophy, Crown, HelpCircle, ClipboardList,
  CheckSquare, Gamepad2, Award, Wallet, Landmark, ShieldCheck,
  Image, Bell, Share2, BarChart3, FileText, Megaphone,
  Ticket, ShieldAlert, Lock, TrendingUp, Settings, Search, X, UserCheck, Building, Shield,
  History, Smartphone, RefreshCw, ChevronDown, ChevronRight, Calendar, Sparkles, Vote, DollarSign,
  BookOpen, Newspaper, Info, Video, Gift, Plus, Layers, Clock, Coins
} from 'lucide-react';
import { HakaLogo } from './HakaLogo';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'user-management', label: 'User Management', icon: Users, hasSub: true },
  { id: 'contests', label: 'Contest Management', icon: Trophy },
  { id: 'daily-contest', label: 'Daily Contest Desk', icon: Clock },
  { id: 'bi-weekly-room-cycle', label: 'Bi-Weekly Room Cycle', icon: Sparkles, hasSub: true },
  { id: 'categories', label: 'Category Management', icon: Layers },

  { id: 'grand-contest', label: 'Grand Contest', icon: Crown },
  { id: 'question-bank', label: 'Question Bank', icon: HelpCircle, hasSub: true },
  { id: 'surveys', label: 'Survey Management', icon: ClipboardList },
  { id: 'tasks', label: 'Task Management', icon: CheckSquare },
  { id: 'challenges', label: 'Challenge Management', icon: Gamepad2 },
  { id: 'leaderboard', label: 'Leaderboard', icon: Award },
  { id: 'wallet', label: 'Wallet Management', icon: Wallet },
  { id: 'coin-management', label: 'Coin Management', icon: Coins },
  { id: 'withdrawals', label: 'Withdrawal Management', icon: Landmark },
  { id: 'kyc', label: 'KYC Management', icon: ShieldCheck },
  { id: 'banners', label: 'Banner Management', icon: Image, hasSub: true },
  { id: 'notifications', label: 'Notification Panel', icon: Bell },
  { id: 'referrals', label: 'Referral Management', icon: Share2, hasSub: true },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'cms', label: 'CMS', icon: FileText, hasSub: true },
  { id: 'advertisements', label: 'Advertisement Mgmt', icon: Megaphone, hasSub: true },
  { id: 'coupons', label: 'Coupon Management', icon: Ticket, hasSub: true },
  { id: 'fraud-detection', label: 'Fraud Detection', icon: ShieldAlert },
  { id: 'roles-permissions', label: 'Roles & Permissions', icon: Lock },
  { id: 'myteam', label: 'My Team Directory', icon: UserCheck },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, hasSub: true },
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

const QUESTION_BANK_SUBITEMS = [
  { id: 'question-bank/pool', label: 'Question Pool', icon: Layers },
  { id: 'question-bank/import', label: 'Bulk Excel Import', icon: FileText },
  { id: 'question-bank/analytics', label: 'Question Analytics', icon: BarChart3 }
];

const BANNER_MGMT_SUBITEMS = [
  { id: 'banners/home', label: 'Home Banner', icon: Image },
  { id: 'banners/popup', label: 'Popup Banner', icon: Megaphone },
  { id: 'banners/festival', label: 'Festival Banner', icon: Calendar },
  { id: 'banners/sponsored', label: 'Sponsored Banner', icon: Sparkles },
  { id: 'banners/announcement', label: 'Announcement', icon: Megaphone }
];

const CMS_SUBITEMS = [
  { id: 'cms/privacy', label: 'Privacy Policy', icon: Shield },
  { id: 'cms/terms', label: 'Terms & Conditions', icon: FileText },
  { id: 'cms/faq', label: 'FAQ', icon: HelpCircle },
  { id: 'cms/help', label: 'Help Center', icon: HelpCircle },
  { id: 'cms/about', label: 'About Us', icon: Info },
  { id: 'cms/blogs', label: 'Blogs', icon: BookOpen },
  { id: 'cms/news', label: 'News & Media', icon: Newspaper },
  { id: 'cms/social', label: 'Social Media', icon: Share2 }
];

const ADVERTISEMENT_SUBITEMS = [
  { id: 'advertisements/create', label: 'Create Ads', icon: Plus },
  { id: 'advertisements/sponsored', label: 'Sponsored Contest', icon: Trophy },
  { id: 'advertisements/banner', label: 'Banner Ads', icon: Image },
  { id: 'advertisements/video', label: 'Video Ads', icon: Video },
  { id: 'advertisements/reward', label: 'Reward Ads', icon: Gift },
  { id: 'advertisements/partner', label: 'Partner Campaigns', icon: Users }
];

const COUPON_SUBITEMS = [
  { id: 'coupons/promo', label: 'Promo Codes', icon: Ticket },
  { id: 'coupons/discount', label: 'Discount Entry Fee', icon: DollarSign },
  { id: 'coupons/free', label: 'Free Entry', icon: Sparkles },
  { id: 'coupons/reward', label: 'Reward Coupon', icon: Gift }
];

const REFERRAL_SUBITEMS = [
  { id: 'referrals/rules', label: 'Referral Rules', icon: Settings },
  { id: 'referrals/earnings', label: 'Referral Earnings', icon: DollarSign },
  { id: 'referrals/abuse', label: 'Referral Abuse Detection', icon: ShieldAlert }
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

const ROOM_CYCLE_SUBITEMS = [
  { id: 'bi-weekly-room-cycle/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bi-weekly-room-cycle/rooms', label: 'Rooms', icon: Layers },
  { id: 'bi-weekly-room-cycle/cycles', label: 'Cycles', icon: Clock },
  { id: 'bi-weekly-room-cycle/tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'bi-weekly-room-cycle/submissions', label: 'Submissions', icon: FileText },
  { id: 'bi-weekly-room-cycle/leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'bi-weekly-room-cycle/rewards', label: 'Rewards', icon: Gift },
  { id: 'bi-weekly-room-cycle/analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'bi-weekly-room-cycle/settings', label: 'Settings', icon: Settings }
];

export const Sidebar = ({ activeView, onLogout, isOpenMobile, setIsOpenMobile, role, isCollapsed, setIsCollapsed, counts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipY, setTooltipY] = useState(0);
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);
  const [isRoomCycleOpen, setIsRoomCycleOpen] = useState(false);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);

  const [isBannerMgmtOpen, setIsBannerMgmtOpen] = useState(false);
  const [isCmsOpen, setIsCmsOpen] = useState(false);
  const [isAdsOpen, setIsAdsOpen] = useState(false);
  const [isCouponsOpen, setIsCouponsOpen] = useState(false);
  const [isReferralsOpen, setIsReferralsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!hoveredItem) return;
    const handleScroll = () => setHoveredItem(null);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hoveredItem]);

  // Dynamic role-based menu items permission filter (Memoized to prevent render violations)
  const filteredMenu = useMemo(() => {
    let allowedIds = MENU_ITEMS.map(i => i.id);

    if (role === 'Super Admin') {
      allowedIds = MENU_ITEMS.map(i => i.id);
    } else if (role === 'Admin') {
      allowedIds = MENU_ITEMS.map(i => i.id).filter(id => id !== 'roles-permissions');
    } else if (role === 'Contest Manager') {
      allowedIds = ['dashboard', 'contests', 'daily-contest', 'categories', 'grand-contest', 'question-bank', 'question-bank/pool', 'question-bank/import', 'question-bank/analytics', 'surveys', 'tasks', 'challenges', 'leaderboard', 'notifications', 'analytics'];
    } else if (role === 'Question Manager') {
      allowedIds = ['dashboard', 'question-bank', 'question-bank/pool', 'question-bank/import', 'question-bank/analytics', 'categories', 'contests', 'notifications'];
    } else if (role === 'Finance Manager') {
      allowedIds = ['dashboard', 'wallet', 'coin-management', 'withdrawals', 'referrals', 'referrals/rules', 'referrals/earnings', 'referrals/abuse', 'reports', 'coupons', 'coupons/promo', 'coupons/discount', 'coupons/free', 'coupons/reward', 'notifications', 'settings'];
    } else if (role === 'Support Manager' || role === 'Support Executive') {
      allowedIds = ['dashboard', 'user-management', 'user-management/all-users', 'user-management/kyc-status', 'user-management/wallet-balance', 'user-management/contest-history', 'user-management/login-history', 'user-management/device-details', 'user-management/referral-details', 'kyc', 'cms', 'cms/privacy', 'cms/terms', 'cms/faq', 'cms/help', 'cms/about', 'cms/blogs', 'cms/news', 'cms/social', 'notifications', 'settings'];
    } else if (role === 'Marketing Manager') {
      allowedIds = ['dashboard', 'surveys', 'banners', 'banners/home', 'banners/popup', 'banners/festival', 'banners/sponsored', 'banners/announcement', 'notifications', 'referrals', 'referrals/rules', 'referrals/earnings', 'referrals/abuse', 'advertisements', 'advertisements/create', 'advertisements/sponsored', 'advertisements/banner', 'advertisements/video', 'advertisements/reward', 'advertisements/partner', 'coupons', 'coupons/promo', 'coupons/discount', 'coupons/free', 'coupons/reward', 'analytics'];
    } else if (role === 'Content Moderator') {
      allowedIds = ['dashboard', 'contests', 'categories', 'question-bank', 'question-bank/pool', 'question-bank/import', 'question-bank/analytics', 'tasks', 'cms', 'cms/privacy', 'cms/terms', 'cms/faq', 'cms/help', 'cms/about', 'cms/blogs', 'cms/news', 'cms/social', 'notifications'];
    } else if (role === 'KYC Officer') {
      allowedIds = ['dashboard', 'user-management', 'user-management/all-users', 'user-management/kyc-status', 'kyc', 'fraud-detection', 'notifications'];
    } else if (role === 'Analytics Manager') {
      allowedIds = ['dashboard', 'reports', 'analytics', 'analytics/dau-mau', 'analytics/participation-rate', 'analytics/avg-session-time', 'analytics/completion-rate', 'analytics/question-accuracy', 'analytics/category-popularity', 'analytics/revenue-by-contest', 'analytics/top-earners', 'analytics/top-referrers', 'analytics/retention-rate', 'analytics/conversion-rate', 'analytics/withdrawal-trends', 'notifications'];
    } else if (role === 'Sponsor') {
      allowedIds = ['dashboard', 'advertisements', 'advertisements/create', 'advertisements/sponsored', 'advertisements/banner', 'advertisements/video', 'advertisements/reward', 'advertisements/partner', 'banners', 'banners/home', 'banners/popup', 'banners/festival', 'banners/sponsored', 'banners/announcement', 'reports', 'notifications'];
    }

    return MENU_ITEMS.filter(item =>
      allowedIds.includes(item.id) &&
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [role, searchQuery]);

  React.useEffect(() => {
    if (!activeView) return;
    if (activeView.startsWith('user-management')) setIsUserMgmtOpen(true);
    if (activeView.startsWith('bi-weekly-room-cycle')) setIsRoomCycleOpen(true);
    if (activeView.startsWith('question-bank')) setIsQuestionBankOpen(true);
    if (activeView.startsWith('banners')) setIsBannerMgmtOpen(true);
    if (activeView.startsWith('cms')) setIsCmsOpen(true);
    if (activeView.startsWith('advertisements')) setIsAdsOpen(true);
    if (activeView.startsWith('coupons')) setIsCouponsOpen(true);
    if (activeView.startsWith('referrals')) setIsReferralsOpen(true);
    if (activeView.startsWith('analytics')) setIsAnalyticsOpen(true);
  }, [activeView]);

  const handleMenuClick = (id) => {
    if (id === 'user-management') {
      setIsUserMgmtOpen(!isUserMgmtOpen);
      if (!isUserMgmtOpen && !location.pathname.includes('/user-management/')) {
        navigate(`/admin-dashboard/user-management/all-users`);
      }
    } else if (id === 'bi-weekly-room-cycle') {
      setIsRoomCycleOpen(!isRoomCycleOpen);
      if (!isRoomCycleOpen && !location.pathname.includes('/bi-weekly-room-cycle/')) {
        navigate(`/admin-dashboard/bi-weekly-room-cycle/dashboard`);
      }
    } else if (id === 'question-bank') {

      setIsQuestionBankOpen(!isQuestionBankOpen);
      if (!isQuestionBankOpen && !location.pathname.includes('/question-bank/')) {
        navigate(`/admin-dashboard/question-bank/pool`);
      }
    } else if (id === 'banners') {
      setIsBannerMgmtOpen(!isBannerMgmtOpen);
      setIsUserMgmtOpen(false);
      setIsQuestionBankOpen(false);
      setIsCmsOpen(false);
      setIsAdsOpen(false);
      setIsCouponsOpen(false);
      setIsReferralsOpen(false);
      setIsAnalyticsOpen(false);
      navigate(`/admin-dashboard/banners/home`);
    } else if (id === 'cms') {
      setIsCmsOpen(!isCmsOpen);
      setIsUserMgmtOpen(false);
      setIsQuestionBankOpen(false);
      setIsBannerMgmtOpen(false);
      setIsAdsOpen(false);
      setIsCouponsOpen(false);
      setIsReferralsOpen(false);
      setIsAnalyticsOpen(false);
      navigate(`/admin-dashboard/cms/privacy`);
    } else if (id === 'advertisements') {
      setIsAdsOpen(!isAdsOpen);
      setIsUserMgmtOpen(false);
      setIsQuestionBankOpen(false);
      setIsBannerMgmtOpen(false);
      setIsCmsOpen(false);
      setIsCouponsOpen(false);
      setIsReferralsOpen(false);
      setIsAnalyticsOpen(false);
      navigate(`/admin-dashboard/advertisements/sponsored`);
    } else if (id === 'coupons') {
      setIsCouponsOpen(!isCouponsOpen);
      setIsUserMgmtOpen(false);
      setIsQuestionBankOpen(false);
      setIsBannerMgmtOpen(false);
      setIsCmsOpen(false);
      setIsAdsOpen(false);
      setIsReferralsOpen(false);
      setIsAnalyticsOpen(false);
      navigate(`/admin-dashboard/coupons/promo`);
    } else if (id === 'referrals') {
      setIsReferralsOpen(!isReferralsOpen);
      setIsUserMgmtOpen(false);
      setIsQuestionBankOpen(false);
      setIsBannerMgmtOpen(false);
      setIsCmsOpen(false);
      setIsAdsOpen(false);
      setIsCouponsOpen(false);
      setIsAnalyticsOpen(false);
      navigate(`/admin-dashboard/referrals/rules`);
    } else if (id === 'analytics') {
      setIsAnalyticsOpen(!isAnalyticsOpen);
      setIsUserMgmtOpen(false);
      setIsQuestionBankOpen(false);
      setIsBannerMgmtOpen(false);
      setIsCmsOpen(false);
      setIsAdsOpen(false);
      setIsCouponsOpen(false);
      setIsReferralsOpen(false);
      navigate(`/admin-dashboard/analytics/dau-mau`);
    } else {
      setIsUserMgmtOpen(false);
      setIsQuestionBankOpen(false);
      setIsBannerMgmtOpen(false);
      setIsCmsOpen(false);
      setIsAdsOpen(false);
      setIsCouponsOpen(false);
      setIsReferralsOpen(false);
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
                    <div className="pl-2 space-y-1 border-l-2 border-brandPrimary/30 dark:border-white/10 ml-4 py-1">
                      {USER_MGMT_SUBITEMS.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeView === sub.id || activeView.startsWith(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] whitespace-nowrap transition-all duration-200 cursor-pointer ${
                              isSubActive
                                ? 'bg-brandPrimary text-white font-bold shadow-md shadow-brandPrimary/20 translate-x-0.5'
                                : 'text-slate-600 dark:text-slate-300 hover:text-brandPrimary dark:hover:text-white hover:bg-brandPrimary/10 dark:hover:bg-white/5 font-medium hover:translate-x-0.5'
                            }`}
                          >
                            <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
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

          if (item.id === 'bi-weekly-room-cycle') {
            const isRoomCycleActive = activeView.startsWith('bi-weekly-room-cycle');
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleMenuClick(item.id)}
                  onMouseEnter={(e) => handleMouseEnter(item, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`w-full flex items-center rounded-2xl text-[13px] font-medium transition-all relative group ${
                    isCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-3.5 py-2.5'
                  } ${isRoomCycleActive
                    ? 'bg-brandPrimary/10 text-brandPrimary dark:text-brandSecondary font-semibold'
                    : 'hover:bg-slate-100/50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {isRoomCycleActive && (
                    <div className="absolute left-0 top-1/3 bottom-1/3 w-1 bg-brandPrimary dark:bg-brandSecondary rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isRoomCycleActive ? 'text-brandPrimary dark:text-brandSecondary' : 'text-slate-400'}`} />
                    {(!isCollapsed || isOpenMobile) && <span className="whitespace-nowrap truncate pr-1">{item.label}</span>}
                  </div>
                  {(!isCollapsed || isOpenMobile) && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isRoomCycleOpen ? 'rotate-180' : 'rotate-0'}`} />
                  )}
                </button>

                {/* Sub-Items Dropdown */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isRoomCycleOpen && (!isCollapsed || isOpenMobile)
                      ? 'grid-rows-[1fr] opacity-100 mt-1 mb-1'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-2 space-y-1 border-l-2 border-brandPrimary/30 dark:border-white/10 ml-4 py-1">
                      {ROOM_CYCLE_SUBITEMS.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeView === sub.id || activeView.startsWith(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] whitespace-nowrap transition-all duration-200 cursor-pointer ${
                              isSubActive
                                ? 'bg-brandPrimary text-white font-bold shadow-md shadow-brandPrimary/20 translate-x-0.5'
                                : 'text-slate-600 dark:text-slate-300 hover:text-brandPrimary dark:hover:text-white hover:bg-brandPrimary/10 dark:hover:bg-white/5 font-medium hover:translate-x-0.5'
                            }`}
                          >
                            <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
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


          if (item.id === 'question-bank') {
            const isQbActive = activeView.startsWith('question-bank');
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleMenuClick(item.id)}
                  onMouseEnter={(e) => handleMouseEnter(item, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`w-full flex items-center rounded-2xl text-[13px] font-medium transition-all relative group ${
                    isCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-3.5 py-2.5'
                  } ${isQbActive
                    ? 'bg-brandPrimary/10 text-brandPrimary dark:text-brandSecondary font-semibold'
                    : 'hover:bg-slate-100/50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {isQbActive && (
                    <div className="absolute left-0 top-1/3 bottom-1/3 w-1 bg-brandPrimary dark:bg-brandSecondary rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isQbActive ? 'text-brandPrimary dark:text-brandSecondary' : 'text-slate-400'}`} />
                    {(!isCollapsed || isOpenMobile) && <span className="whitespace-nowrap truncate pr-1">{item.label}</span>}
                  </div>
                  {(!isCollapsed || isOpenMobile) && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isQuestionBankOpen ? 'rotate-180' : 'rotate-0'}`} />
                  )}
                </button>

                {/* Sub-Items Dropdown */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isQuestionBankOpen && (!isCollapsed || isOpenMobile)
                      ? 'grid-rows-[1fr] opacity-100 mt-1 mb-1'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-2 space-y-1 border-l-2 border-brandPrimary/30 dark:border-white/10 ml-4 py-1">
                      {QUESTION_BANK_SUBITEMS.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeView === sub.id || (sub.id === 'question-bank/pool' && (activeView === 'question-bank' || activeView === 'question-bank/pool'));
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] whitespace-nowrap transition-all duration-200 cursor-pointer ${
                              isSubActive
                                ? 'bg-brandPrimary text-white font-bold shadow-md shadow-brandPrimary/20 translate-x-0.5'
                                : 'text-slate-600 dark:text-slate-300 hover:text-brandPrimary dark:hover:text-white hover:bg-brandPrimary/10 dark:hover:bg-white/5 font-medium hover:translate-x-0.5'
                            }`}
                          >
                            <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
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
                    <div className="pl-2 space-y-1 border-l-2 border-brandPrimary/30 dark:border-white/10 ml-4 py-1">
                      {BANNER_MGMT_SUBITEMS.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeView === sub.id || activeView.startsWith(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] whitespace-nowrap transition-all duration-200 cursor-pointer ${
                              isSubActive
                                ? 'bg-brandPrimary text-white font-bold shadow-md shadow-brandPrimary/20 translate-x-0.5'
                                : 'text-slate-600 dark:text-slate-300 hover:text-brandPrimary dark:hover:text-white hover:bg-brandPrimary/10 dark:hover:bg-white/5 font-medium hover:translate-x-0.5'
                            }`}
                          >
                            <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
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

          if (item.id === 'cms') {
            const isCmsActive = activeView.startsWith('cms');
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleMenuClick(item.id)}
                  onMouseEnter={(e) => handleMouseEnter(item, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`w-full flex items-center rounded-2xl text-[13px] font-medium transition-all relative group ${
                    isCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-3.5 py-2.5'
                  } ${isCmsActive
                    ? 'bg-brandPrimary/10 text-brandPrimary dark:text-brandSecondary font-semibold'
                    : 'hover:bg-slate-100/50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {isCmsActive && (
                    <div className="absolute left-0 top-1/3 bottom-1/3 w-1 bg-brandPrimary dark:bg-brandSecondary rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isCmsActive ? 'text-brandPrimary dark:text-brandSecondary' : 'text-slate-400'}`} />
                    {(!isCollapsed || isOpenMobile) && <span className="whitespace-nowrap truncate pr-1">{item.label}</span>}
                  </div>
                  {(!isCollapsed || isOpenMobile) && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isCmsOpen ? 'rotate-180' : 'rotate-0'}`} />
                  )}
                </button>

                {/* Sub-Items Dropdown */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isCmsOpen && (!isCollapsed || isOpenMobile)
                      ? 'grid-rows-[1fr] opacity-100 mt-1 mb-1'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-2 space-y-1 border-l-2 border-brandPrimary/30 dark:border-white/10 ml-4 py-1">
                      {CMS_SUBITEMS.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeView === sub.id || activeView.startsWith(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] whitespace-nowrap transition-all duration-200 cursor-pointer ${
                              isSubActive
                                ? 'bg-brandPrimary text-white font-bold shadow-md shadow-brandPrimary/20 translate-x-0.5'
                                : 'text-slate-600 dark:text-slate-300 hover:text-brandPrimary dark:hover:text-white hover:bg-brandPrimary/10 dark:hover:bg-white/5 font-medium hover:translate-x-0.5'
                            }`}
                          >
                            <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
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

          if (item.id === 'advertisements') {
            const isAdsActive = activeView.startsWith('advertisements');
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleMenuClick(item.id)}
                  onMouseEnter={(e) => handleMouseEnter(item, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`w-full flex items-center rounded-2xl text-[13px] font-medium transition-all relative group ${
                    isCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-3.5 py-2.5'
                  } ${isAdsActive
                    ? 'bg-brandPrimary/10 text-brandPrimary dark:text-brandSecondary font-semibold'
                    : 'hover:bg-slate-100/50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {isAdsActive && (
                    <div className="absolute left-0 top-1/3 bottom-1/3 w-1 bg-brandPrimary dark:bg-brandSecondary rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isAdsActive ? 'text-brandPrimary dark:text-brandSecondary' : 'text-slate-400'}`} />
                    {(!isCollapsed || isOpenMobile) && <span className="whitespace-nowrap truncate pr-1">{item.label}</span>}
                  </div>
                  {(!isCollapsed || isOpenMobile) && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isAdsOpen ? 'rotate-180' : 'rotate-0'}`} />
                  )}
                </button>

                {/* Sub-Items Dropdown */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isAdsOpen && (!isCollapsed || isOpenMobile)
                      ? 'grid-rows-[1fr] opacity-100 mt-1 mb-1'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-2 space-y-1 border-l-2 border-brandPrimary/30 dark:border-white/10 ml-4 py-1">
                      {ADVERTISEMENT_SUBITEMS.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeView === sub.id || activeView.startsWith(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] whitespace-nowrap transition-all duration-200 cursor-pointer ${
                              isSubActive
                                ? 'bg-brandPrimary text-white font-bold shadow-md shadow-brandPrimary/20 translate-x-0.5'
                                : 'text-slate-600 dark:text-slate-300 hover:text-brandPrimary dark:hover:text-white hover:bg-brandPrimary/10 dark:hover:bg-white/5 font-medium hover:translate-x-0.5'
                            }`}
                          >
                            <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
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

          if (item.id === 'coupons') {
            const isCouponsActive = activeView.startsWith('coupons');
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleMenuClick(item.id)}
                  onMouseEnter={(e) => handleMouseEnter(item, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`w-full flex items-center rounded-2xl text-[13px] font-medium transition-all relative group ${
                    isCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-3.5 py-2.5'
                  } ${isCouponsActive
                    ? 'bg-brandPrimary/10 text-brandPrimary dark:text-brandSecondary font-semibold'
                    : 'hover:bg-slate-100/50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {isCouponsActive && (
                    <div className="absolute left-0 top-1/3 bottom-1/3 w-1 bg-brandPrimary dark:bg-brandSecondary rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isCouponsActive ? 'text-brandPrimary dark:text-brandSecondary' : 'text-slate-400'}`} />
                    {(!isCollapsed || isOpenMobile) && <span className="whitespace-nowrap truncate pr-1">{item.label}</span>}
                  </div>
                  {(!isCollapsed || isOpenMobile) && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isCouponsOpen ? 'rotate-180' : 'rotate-0'}`} />
                  )}
                </button>

                {/* Sub-Items Dropdown */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isCouponsOpen && (!isCollapsed || isOpenMobile)
                      ? 'grid-rows-[1fr] opacity-100 mt-1 mb-1'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-2 space-y-1 border-l-2 border-brandPrimary/30 dark:border-white/10 ml-4 py-1">
                      {COUPON_SUBITEMS.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeView === sub.id || activeView.startsWith(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] whitespace-nowrap transition-all duration-200 cursor-pointer ${
                              isSubActive
                                ? 'bg-brandPrimary text-white font-bold shadow-md shadow-brandPrimary/20 translate-x-0.5'
                                : 'text-slate-600 dark:text-slate-300 hover:text-brandPrimary dark:hover:text-white hover:bg-brandPrimary/10 dark:hover:bg-white/5 font-medium hover:translate-x-0.5'
                            }`}
                          >
                            <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
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

          if (item.id === 'referrals') {
            const isReferralsActive = activeView.startsWith('referrals');
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleMenuClick(item.id)}
                  onMouseEnter={(e) => handleMouseEnter(item, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`w-full flex items-center rounded-2xl text-[13px] font-medium transition-all relative group ${
                    isCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-3.5 py-2.5'
                  } ${isReferralsActive
                    ? 'bg-brandPrimary/10 text-brandPrimary dark:text-brandSecondary font-semibold'
                    : 'hover:bg-slate-100/50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {isReferralsActive && (
                    <div className="absolute left-0 top-1/3 bottom-1/3 w-1 bg-brandPrimary dark:bg-brandSecondary rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isReferralsActive ? 'text-brandPrimary dark:text-brandSecondary' : 'text-slate-400'}`} />
                    {(!isCollapsed || isOpenMobile) && <span className="whitespace-nowrap truncate pr-1">{item.label}</span>}
                  </div>
                  {(!isCollapsed || isOpenMobile) && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isReferralsOpen ? 'rotate-180' : 'rotate-0'}`} />
                  )}
                </button>

                {/* Sub-Items Dropdown */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isReferralsOpen && (!isCollapsed || isOpenMobile)
                      ? 'grid-rows-[1fr] opacity-100 mt-1 mb-1'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-2 space-y-1 border-l-2 border-brandPrimary/30 dark:border-white/10 ml-4 py-1">
                      {REFERRAL_SUBITEMS.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeView === sub.id || activeView.startsWith(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] whitespace-nowrap transition-all duration-200 cursor-pointer ${
                              isSubActive
                                ? 'bg-brandPrimary text-white font-bold shadow-md shadow-brandPrimary/20 translate-x-0.5'
                                : 'text-slate-600 dark:text-slate-300 hover:text-brandPrimary dark:hover:text-white hover:bg-brandPrimary/10 dark:hover:bg-white/5 font-medium hover:translate-x-0.5'
                            }`}
                          >
                            <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
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
                    <div className="pl-2 space-y-1 border-l-2 border-brandPrimary/30 dark:border-white/10 ml-4 py-1">
                      {ANALYTICS_SUBITEMS.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeView === sub.id || activeView.startsWith(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] whitespace-nowrap transition-all duration-200 cursor-pointer ${
                              isSubActive
                                ? 'bg-brandPrimary text-white font-bold shadow-md shadow-brandPrimary/20 translate-x-0.5'
                                : 'text-slate-600 dark:text-slate-300 hover:text-brandPrimary dark:hover:text-white hover:bg-brandPrimary/10 dark:hover:bg-white/5 font-medium hover:translate-x-0.5'
                            }`}
                          >
                            <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
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
