import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';
import { 
  Bell, Sun, Moon, Monitor, Maximize2, Minimize2,
  Menu, User, Settings, Sparkles, ChevronRight, ChevronLeft,
  LogOut, Shield, Key, Activity, HelpCircle, Globe, ChevronDown, Check, X
} from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { useNotification } from '../context/NotificationContext';

const getRoleBadgeStyle = (roleName) => {
  const role = roleName || 'Super Admin';
  switch (role) {
    case 'Super Admin':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    case 'Admin':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'Contest Manager':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'Question Manager':
      return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20';
    case 'Finance Manager':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'Support Executive':
    case 'Support Manager':
      return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
    case 'Marketing Manager':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    case 'Content Moderator':
      return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
    case 'KYC Officer':
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    case 'Analytics Manager':
      return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
  }
};

export const Header = ({ activeView, onOpenMobileMenu, isCollapsed, setIsCollapsed, onLogout, selectedRole }) => {
  const { theme, setTheme } = useTheme();
  const { user, isMockMode } = useSelector((state) => state.auth);
  const { unreadCounts } = useNotification();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifyMenu, setShowNotifyMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const notifyMenuRef = useRef(null);

  const currentRole = user?.role || selectedRole || 'Super Admin';
  const fullName = user?.name || user?.fullName || 'Default Super Admin';
  const userEmail = user?.email || 'superadmin@example.com';
  const userAvatar = user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuperAdmin';

  // Sync fullscreen state with document state change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Click outside and ESC key handlers for dropdown accessibility
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
        setShowLangMenu(false);
      }
      if (notifyMenuRef.current && !notifyMenuRef.current.contains(event.target)) {
        setShowNotifyMenu(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setShowNotifyMenu(false);
        setShowLogoutModal(false);
        setShowLangMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error entering fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleDropdownNavigate = (path) => {
    setShowUserMenu(false);
    navigate(path);
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full h-16 px-6 flex items-center justify-between bg-[#EAF4E1]/85 dark:bg-[#0B1120]/60 backdrop-blur-xl border-b border-[#C4E2A8]/70 dark:border-white/5 transition-colors duration-300">
        
        {/* Left Section - Mobile Menu & Breadcrumb */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-white/70"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Desktop Sidebar Toggle Icon */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Dynamic Breadcrumbs */}
          <div className="hidden md:block">
            <Breadcrumb activeView={activeView} />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          
          {/* Sandbox Mode flag */}
          {isMockMode && (
            <div className="hidden lg:flex items-center gap-1.5 bg-brandPrimary/10 border border-brandPrimary/20 px-3 py-1 rounded-full text-[10px] text-brandPrimary font-bold animate-pulse">
              <Sparkles className="w-3 h-3" />
              <span>Sandbox Mode</span>
            </div>
          )}

          {/* Theme Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg transition-colors ${theme === 'light' ? 'bg-brandPrimary text-white shadow-sm' : 'text-slate-500 dark:text-white/45 hover:text-slate-800 dark:hover:text-white'}`}
              title="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'bg-brandPrimary text-white shadow-sm' : 'text-slate-500 dark:text-white/45 hover:text-slate-800 dark:hover:text-white'}`}
              title="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-lg transition-colors ${theme === 'system' ? 'bg-brandPrimary text-white shadow-sm' : 'text-slate-500 dark:text-white/45 hover:text-slate-800 dark:hover:text-white'}`}
              title="System Match"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Full Screen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200/60 dark:hover:bg-white/10 rounded-xl border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Notification Center */}
          <div className="relative" ref={notifyMenuRef}>
            <button
              onClick={() => {
                setShowNotifyMenu(!showNotifyMenu);
                setShowUserMenu(false);
              }}
              className="relative p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200/60 dark:hover:bg-white/10 rounded-xl border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-white/65 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCounts.total > 0 && (
                <span className="absolute -top-1 -right-1 bg-brandSecondary text-white border border-white dark:border-[#0B1120] px-1.5 py-0.5 rounded-full text-[8px] font-extrabold leading-none animate-pulse">
                  {unreadCounts.total}
                </span>
              )}
            </button>

            {showNotifyMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden z-50 animate-scale-in">
                <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Console alerts</span>
                  {unreadCounts.total > 0 && (
                    <span className="text-[10px] text-brandSecondary bg-brandSecondary/10 px-2 py-0.5 rounded-full font-bold">{unreadCounts.total} unread</span>
                  )}
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-60 overflow-y-auto">
                  <div className="p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">AI Matcher passed</p>
                    <p className="text-[10px] text-slate-500 dark:text-white/40 mt-1">Biometrics check passed for Aarav Sharma.</p>
                  </div>
                  <div className="p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">Sponsorship Syndicated</p>
                    <p className="text-[10px] text-slate-500 dark:text-white/40 mt-1">Tata Foundation published Eco Journalism Challenge.</p>
                  </div>
                  <div className="p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">New session created</p>
                    <p className="text-[10px] text-slate-500 dark:text-white/40 mt-1">Logged in via Safari mobile agent ip 103.44.xx.</p>
                  </div>
                </div>
                <div className="p-2.5 border-t border-slate-100 dark:border-white/5 text-center bg-slate-50 dark:bg-white/5">
                  <button
                    onClick={() => {
                      navigate('/admin-dashboard/notifications');
                      setShowNotifyMenu(false);
                    }}
                    className="w-full py-1 text-[11px] font-bold text-brandSecondary hover:text-brandSecondary/85 hover:underline transition-all"
                  >
                    View all in full screen →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Enterprise User Profile Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifyMenu(false);
              }}
              className="flex items-center gap-2.5 p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200/60 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/10 rounded-xl transition-all group"
            >
              <img 
                src={userAvatar} 
                className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-white/10 shadow-sm" 
                alt={fullName} 
              />
              <div className="hidden lg:flex flex-col text-left pr-1">
                <span className="text-xs font-bold text-slate-800 dark:text-white leading-none">
                  {fullName}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-white/50 leading-tight mt-0.5">
                  {currentRole}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-900/10 dark:shadow-black/60 overflow-hidden z-50 animate-scale-in">
                
                {/* 1. Header Profile Card */}
                <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-white/[0.02] flex items-start gap-3">
                  <img 
                    src={userAvatar} 
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-sm shrink-0" 
                    alt={fullName} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-white/50 truncate mt-0.5">
                      {userEmail}
                    </p>
                    <div className="mt-2">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeStyle(currentRole)}`}>
                        {currentRole}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Primary Navigation & Settings Items */}
                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => handleDropdownNavigate('/admin-dashboard/myteam')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400 dark:text-white/40" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => handleDropdownNavigate('/admin-dashboard/settings')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400 dark:text-white/40" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => handleDropdownNavigate('/admin-dashboard/settings')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Shield className="w-4 h-4 text-slate-400 dark:text-white/40" />
                    <span>Security Settings</span>
                  </button>

                  <button
                    onClick={() => handleDropdownNavigate('/admin-dashboard/settings')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Key className="w-4 h-4 text-slate-400 dark:text-white/40" />
                    <span>Change Password</span>
                  </button>

                  <button
                    onClick={() => handleDropdownNavigate('/admin-dashboard/notifications')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Bell className="w-4 h-4 text-slate-400 dark:text-white/40" />
                    <span>Notification Preferences</span>
                  </button>

                  <button
                    onClick={() => handleDropdownNavigate('/admin-dashboard/analytics')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Activity className="w-4 h-4 text-slate-400 dark:text-white/40" />
                    <span>Activity Logs</span>
                  </button>

                  <button
                    onClick={() => handleDropdownNavigate('/admin-dashboard/notifications')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400 dark:text-white/40" />
                    <span>Help & Support</span>
                  </button>
                </div>

                {/* 3. Preferences Divider & Section */}
                <div className="p-1.5 border-t border-slate-100 dark:border-white/5 space-y-0.5 bg-slate-50/50 dark:bg-white/[0.01]">
                  {/* Mode Selector */}
                  <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      {theme === 'dark' ? <Moon className="w-4 h-4 text-slate-400" /> : <Sun className="w-4 h-4 text-slate-400" />}
                      Appearance
                    </span>
                    <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/10 p-0.5 rounded-lg text-[10px]">
                      <button 
                        onClick={() => setTheme('light')}
                        className={`px-2 py-0.5 rounded-md font-bold transition-colors ${theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 dark:text-white/50'}`}
                      >
                        Light
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`px-2 py-0.5 rounded-md font-bold transition-colors ${theme === 'dark' ? 'bg-brandPrimary text-white shadow-sm' : 'text-slate-500 dark:text-white/50'}`}
                      >
                        Dark
                      </button>
                    </div>
                  </div>

                  {/* Language Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowLangMenu(!showLangMenu)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-slate-400 dark:text-white/40" />
                        <span>Language</span>
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-white/40 flex items-center gap-1 font-normal">
                        {selectedLang}
                        <ChevronDown className="w-3 h-3" />
                      </span>
                    </button>
                    {showLangMenu && (
                      <div className="absolute right-2 bottom-0 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-10 py-1 text-xs">
                        {['English', 'Hindi', 'Spanish', 'French'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => {
                              setSelectedLang(lang);
                              setShowLangMenu(false);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-between text-slate-700 dark:text-slate-200"
                          >
                            <span>{lang}</span>
                            {selectedLang === lang && <Check className="w-3 h-3 text-brandPrimary" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Danger Zone Logout Item */}
                <div className="p-1.5 border-t border-slate-100 dark:border-white/5 bg-rose-50/30 dark:bg-rose-950/10">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-500 mb-3">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-200 dark:border-rose-500/20">
                  <LogOut className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Logout</h3>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                Are you sure you want to logout from the console?
              </p>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    if (onLogout) onLogout();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-lg shadow-rose-600/20 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
