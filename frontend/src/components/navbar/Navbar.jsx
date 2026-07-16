import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';
import { 
  Bell, Sun, Moon, Monitor, Maximize2, Minimize2,
  Menu, User, Settings, CreditCard, Sparkles, Search, Check, Clock,
  ChevronRight, ChevronLeft
} from 'lucide-react';
import { Breadcrumb } from '../Breadcrumb';

export const Navbar = ({ activeView, onOpenMobileMenu, isCollapsed, setIsCollapsed }) => {
  const { theme, setTheme } = useTheme();
  const { user, isMockMode } = useSelector((state) => state.auth);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifyMenu, setShowNotifyMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const navigate = useNavigate();

  // Sync fullscreen state with document state change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
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

  return (
    <header className="sticky top-0 z-30 w-full h-16 px-6 flex items-center justify-between bg-white/60 dark:bg-[#0B1120]/40 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5 transition-colors duration-300">
      
      {/* Left Section: Mobile Menu & Breadcrumb & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/70"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Desktop Sidebar Toggle Icon & Tooltip */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden md:block">
          <Breadcrumb activeView={activeView} />
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center relative max-w-xs w-full ml-4">
          <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Search platform resources..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/5 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary/50 transition-colors"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        
        {/* Sandbox Mode flag */}
        {isMockMode && (
          <div className="hidden md:flex items-center gap-1.5 bg-brandSecondary/10 border border-brandSecondary/20 px-3 py-1 rounded-full text-[10px] text-brandPrimary dark:text-brandSecondary font-bold animate-pulse">
            <Sparkles className="w-3 h-3" />
            <span>Sandbox Mode</span>
          </div>
        )}

        {/* Theme Selector */}
        <div className="flex items-center bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 p-0.5 rounded-xl">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-lg transition-colors ${theme === 'light' ? 'bg-brandPrimary text-white shadow-sm' : 'text-slate-400 dark:text-white/45 hover:text-slate-700 dark:hover:text-white'}`}
            title="Light Theme"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'bg-brandPrimary text-white shadow-sm' : 'text-slate-400 dark:text-white/45 hover:text-slate-750 dark:hover:text-white'}`}
            title="Dark Theme"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-lg transition-colors ${theme === 'system' ? 'bg-brandPrimary text-white shadow-sm' : 'text-slate-400 dark:text-white/45 hover:text-slate-750 dark:hover:text-white'}`}
            title="System Match"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Full Screen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl border border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white transition-colors"
          title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Notification Center */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifyMenu(!showNotifyMenu);
              setShowUserMenu(false);
            }}
            className="relative p-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl border border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brandSecondary rounded-full animate-pulse" />
          </button>
          {showNotifyMenu && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/60 dark:border-white/10 shadow-2xl overflow-hidden z-50 animate-scale-in">
              <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
                <span className="text-xs font-bold text-slate-800 dark:text-white">Real-time alerts</span>
                <span className="text-[9px] text-brandSecondary bg-brandSecondary/10 px-2 py-0.5 rounded-full font-bold">3 new</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-60 overflow-y-auto">
                <div className="p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white">AI Matcher passed</p>
                  <p className="text-[10px] text-slate-400 dark:text-white/40 mt-1">Biometrics check passed for Aarav Sharma.</p>
                </div>
                <div className="p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white">Sponsorship Syndicated</p>
                  <p className="text-[10px] text-slate-400 dark:text-white/40 mt-1">Tata Foundation published Eco Journalism Challenge.</p>
                </div>
                <div className="p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white">New session created</p>
                  <p className="text-[10px] text-slate-400 dark:text-white/40 mt-1">Logged in via Chrome mobile agent ip 103.44.xx.</p>
                </div>
              </div>
              <div className="p-3 border-t border-slate-100 dark:border-white/5 text-center bg-slate-50/30 dark:bg-transparent">
                <button
                  onClick={() => {
                    navigate('/notifications');
                    setShowNotifyMenu(false);
                  }}
                  className="w-full py-1 text-[11px] font-bold text-brandSecondary hover:text-brandSecondary/85 hover:underline transition-all"
                >
                  View all alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifyMenu(false);
            }}
            className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/10 rounded-xl transition-all"
          >
            <img 
              src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj'} 
              className="w-7 h-7 rounded-lg object-cover border border-slate-200/50 dark:border-white/10" 
              alt="" 
            />
            <span className="hidden lg:block text-xs font-bold px-1.5 text-slate-700 dark:text-white">
              {user?.name || 'Aarav Sharma'}
            </span>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2.5 w-52 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-2xl overflow-hidden p-1.5 z-50 animate-scale-in">
              <div className="px-3.5 py-3 border-b border-slate-100 dark:border-white/5 text-left bg-slate-50/30 dark:bg-transparent">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{user?.name || 'Aarav Sharma'}</p>
                <p className="text-[10px] text-slate-400 dark:text-white/40 mt-0.5 truncate">{user?.email || 'aarav@rcp.in'}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs text-slate-600 dark:text-white/70 hover:bg-brandPrimary/10 hover:text-brandPrimary transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My profile overview</span>
                </button>
                <button
                  onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs text-slate-600 dark:text-white/70 hover:bg-brandPrimary/10 hover:text-brandPrimary transition-colors text-left"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>General settings</span>
                </button>
                <button
                  onClick={() => { navigate('/wallet'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs text-slate-600 dark:text-white/70 hover:bg-brandPrimary/10 hover:text-brandPrimary transition-colors text-left"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Billing & Wallet</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
