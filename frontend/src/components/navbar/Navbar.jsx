import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { 
  Search, Bell, Globe, Sun, Moon, Monitor, Command, 
  Menu, ShieldAlert, Sparkles, User, Settings, CreditCard, HelpCircle
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'es', label: 'Español' }
];

export const Navbar = ({ activeView, onViewChange, onOpenMobileMenu, selectedRole, setSelectedRole }) => {
  const { theme, setTheme } = useTheme();
  const { user, sessions, isMockMode } = useAuthStore();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifyMenu, setShowNotifyMenu] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const [currentLang, setCurrentLang] = useState('en');

  // Listen for Ctrl+K command shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowSpotlight(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const COMMAND_ITEMS = [
    { label: 'Go to Dashboard', action: () => onViewChange('dashboard'), desc: 'Overview statistics and analytics summaries' },
    { label: 'Manage Contestants / Users', action: () => onViewChange('users'), desc: 'Search and inspect registered users' },
    { label: 'Explore Contests & Challenges', action: () => onViewChange('contests'), desc: 'View active syndicates and entry stages' },
    { label: 'Check Wallet & Deposit Funds', action: () => onViewChange('wallet'), desc: 'Credit simulation parameters' },
    { label: 'Platform Security Settings', action: () => onViewChange('settings'), desc: 'Toggle MFA, view device sessions' },
    { label: 'Switch to Dark Mode', action: () => setTheme('dark'), desc: 'Sleek dark theme' },
    { label: 'Switch to Light Mode', action: () => setTheme('light'), desc: 'Vibrant clean theme' }
  ];

  const filteredCommands = COMMAND_ITEMS.filter(cmd =>
    cmd.label.toLowerCase().includes(spotlightQuery.toLowerCase()) ||
    cmd.desc.toLowerCase().includes(spotlightQuery.toLowerCase())
  );

  const activeLangLabel = LANGUAGES.find(l => l.code === currentLang)?.label || 'English';

  return (
    <>
      <header className="sticky top-0 z-30 w-full px-6 py-4 flex items-center justify-between bg-[#0B1120]/65 dark:bg-[#0B1120]/65 light:bg-[#F8FAFC]/75 backdrop-blur-md border-b border-white/5 dark:border-white/5 light:border-black/5 transition-colors duration-300">
        
        {/* Left Section: Mobile toggle and search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 rounded-xl border border-white/10 dark:border-white/10 light:border-black/10 text-white/70 dark:text-white/70 light:text-black/70"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setShowSpotlight(true)}
            className="hidden sm:flex items-center gap-3 bg-[#0B1120]/40 dark:bg-[#0B1120]/40 light:bg-black/5 border border-white/10 dark:border-white/5 light:border-black/10 hover:border-brandPrimary/40 px-3.5 py-2 rounded-xl text-xs text-white/40 dark:text-white/40 light:text-black/40 w-72 text-left transition-all"
          >
            <Search className="w-4 h-4 shrink-0 text-white/30 dark:text-white/30 light:text-black/30" />
            <span>Search console...</span>
            <span className="ml-auto bg-white/10 dark:bg-white/10 light:bg-black/10 text-[10px] px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5 select-none">
              <Command className="w-2.5 h-2.5" /> K
            </span>
          </button>
        </div>

        {/* Right Section: Toggles, Notification, Profiles */}
        <div className="flex items-center gap-3">
          
          {/* Simulator Role Selector Dropdown */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white/5 dark:bg-white/5 light:bg-black/5 border border-white/10 dark:border-white/10 light:border-black/10 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-white/45 dark:text-white/45 light:text-black/45">Simulator:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-transparent font-bold text-white dark:text-white light:text-black focus:outline-none border-none cursor-pointer"
            >
              <option value="Contestant" className="bg-darkCard text-white dark:bg-darkCard dark:text-white light:bg-white light:text-black">Contestant</option>
              <option value="Judge" className="bg-darkCard text-white dark:bg-darkCard dark:text-white light:bg-white light:text-black">Judge</option>
              <option value="Sponsor" className="bg-darkCard text-white dark:bg-darkCard dark:text-white light:bg-white light:text-black">Sponsor</option>
              <option value="Admin" className="bg-darkCard text-white dark:bg-darkCard dark:text-white light:bg-white light:text-black">Admin</option>
              <option value="Super Admin" className="bg-darkCard text-white dark:bg-darkCard dark:text-white light:bg-white light:text-black">Super Admin</option>
            </select>
          </div>
          
          {/* Mock Status Flag */}
          {isMockMode && (
            <div className="hidden lg:flex items-center gap-1.5 bg-brandPrimary/10 border border-brandPrimary/20 px-3 py-1 rounded-full text-[10px] text-brandPrimary font-bold animate-pulse">
              <Sparkles className="w-3 h-3" />
              <span>Sandbox Mode</span>
            </div>
          )}

          {/* Theme Selector */}
          <div className="flex items-center bg-white/5 dark:bg-white/5 light:bg-black/5 border border-white/10 dark:border-white/10 light:border-black/10 p-1 rounded-xl">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg transition-colors ${theme === 'light' ? 'bg-brandPrimary text-white shadow-sm' : 'text-white/45 dark:text-white/45 light:text-black/45 hover:text-white'}`}
              title="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'bg-brandPrimary text-white shadow-sm' : 'text-white/45 dark:text-white/45 light:text-black/45 hover:text-white'}`}
              title="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-lg transition-colors ${theme === 'system' ? 'bg-brandPrimary text-white shadow-sm' : 'text-white/45 dark:text-white/45 light:text-black/45 hover:text-white'}`}
              title="System Match"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowUserMenu(false);
                setShowNotifyMenu(false);
              }}
              className="p-2.5 bg-white/5 dark:bg-white/5 light:bg-black/5 hover:bg-white/10 rounded-xl border border-white/10 dark:border-white/10 light:border-black/10 text-white/60 dark:text-white/60 light:text-black/60 hover:text-white transition-colors"
              title="Language"
            >
              <Globe className="w-4 h-4" />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-40 glassmorphism rounded-xl border border-white/10 dark:border-white/5 light:border-black/15 shadow-2xl p-1 z-50">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setCurrentLang(l.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-brandPrimary/10 hover:text-brandPrimary transition-colors ${currentLang === l.code ? 'text-brandPrimary bg-brandPrimary/5' : 'text-white/70 dark:text-white/70 light:text-black/70'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Center */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifyMenu(!showNotifyMenu);
                setShowUserMenu(false);
                setShowLangMenu(false);
              }}
              className="relative p-2.5 bg-white/5 dark:bg-white/5 light:bg-black/5 hover:bg-white/10 rounded-xl border border-white/10 dark:border-white/10 light:border-black/10 text-white/60 dark:text-white/60 light:text-black/60 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brandSecondary rounded-full animate-ping" />
            </button>
            {showNotifyMenu && (
              <div className="absolute right-0 mt-2 w-80 glassmorphism rounded-2xl border border-white/10 dark:border-white/5 light:border-black/15 shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-white dark:text-white light:text-black">Real-time alerts</span>
                  <span className="text-[10px] text-brandSecondary bg-brandSecondary/10 px-2 py-0.5 rounded-full font-bold">3 new</span>
                </div>
                <div className="divide-y divide-white/5 max-h-60 overflow-y-auto">
                  <div className="p-3.5 hover:bg-white/5 transition-colors text-left">
                    <p className="text-xs font-semibold text-white dark:text-white light:text-black">AI Matcher passed</p>
                    <p className="text-[10px] text-white/40 dark:text-white/40 light:text-black/40 mt-1">Biometrics check passed for Aarav Sharma.</p>
                  </div>
                  <div className="p-3.5 hover:bg-white/5 transition-colors text-left">
                    <p className="text-xs font-semibold text-white dark:text-white light:text-black">Sponsorship Syndicated</p>
                    <p className="text-[10px] text-white/40 dark:text-white/40 light:text-black/40 mt-1">Tata Foundation published Eco Journalism Challenge.</p>
                  </div>
                  <div className="p-3.5 hover:bg-white/5 transition-colors text-left">
                    <p className="text-xs font-semibold text-white dark:text-white light:text-black">New session created</p>
                    <p className="text-[10px] text-white/40 dark:text-white/40 light:text-black/40 mt-1">Logged in via Safari mobile agent ip 103.44.xx.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowLangMenu(false);
                setShowNotifyMenu(false);
              }}
              className="flex items-center gap-2 p-1 bg-white/5 dark:bg-white/5 light:bg-black/5 hover:bg-white/10 border border-white/10 dark:border-white/10 light:border-black/10 rounded-xl transition-all"
            >
              <img 
                src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj'} 
                className="w-7 h-7 rounded-lg object-cover border border-white/10" 
                alt="" 
              />
              <span className="hidden lg:block text-xs font-bold px-1 text-white dark:text-white light:text-black">
                {user?.name || 'Raj Patel'}
              </span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 glassmorphism rounded-2xl border border-white/10 dark:border-white/5 light:border-black/15 shadow-2xl overflow-hidden p-1.5 z-50">
                <div className="px-3.5 py-3 border-b border-white/5 text-left">
                  <p className="text-xs font-bold text-white dark:text-white light:text-black">{user?.name || 'Raj Patel'}</p>
                  <p className="text-[10px] text-white/40 dark:text-white/40 light:text-black/40 mt-0.5 truncate">{user?.email || 'raj.patel@realitycontest.in'}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { onViewChange('profile'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/70 dark:text-white/70 light:text-black/70 hover:bg-brandPrimary/10 hover:text-brandPrimary transition-colors text-left"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My profile overview</span>
                  </button>
                  <button
                    onClick={() => { onViewChange('settings'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/70 dark:text-white/70 light:text-black/70 hover:bg-brandPrimary/10 hover:text-brandPrimary transition-colors text-left"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>General settings</span>
                  </button>
                  <button
                    onClick={() => { onViewChange('wallet'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/70 dark:text-white/70 light:text-black/70 hover:bg-brandPrimary/10 hover:text-brandPrimary transition-colors text-left"
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

      {/* Spotlight Command Modal */}
      {showSpotlight && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            onClick={() => setShowSpotlight(false)}
            className="fixed inset-0 z-0"
          />
          
          <div className="relative w-full max-w-xl bg-[#0F1424] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 p-2 animate-scale-in">
            <div className="flex items-center gap-3 px-3 py-2.5 border-b border-white/5 mb-2">
              <Search className="w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="What do you want to open?"
                value={spotlightQuery}
                onChange={(e) => setSpotlightQuery(e.target.value)}
                className="w-full bg-transparent text-white text-xs placeholder-white/30 focus:outline-none"
                autoFocus
              />
              <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[9px] text-white/40 font-mono">
                ESC
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="p-4 text-center text-xs text-white/40">No matching search links.</div>
              ) : (
                filteredCommands.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      cmd.action();
                      setShowSpotlight(false);
                      setSpotlightQuery('');
                    }}
                    className="w-full flex items-start justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 text-left group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-brandPrimary transition-colors">{cmd.label}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{cmd.desc}</p>
                    </div>
                    <span className="text-[10px] text-brandSecondary opacity-0 group-hover:opacity-100 transition-opacity">
                      Open →
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Navbar;
