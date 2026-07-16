import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileRequest } from '../store/authSlice';
import { DeviceManager } from '../components/DeviceManager';
import { 
  Settings, User, Lock, Bell, KeyRound, 
  ToggleLeft, ToggleRight, Copy, Check, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'general', label: 'General', icon: User },
  { id: 'security', label: 'Security & Devices', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'keys', label: 'API Developer Keys', icon: KeyRound }
];

export const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('general');
  const [copiedKey, setCopiedKey] = useState(false);
  const [apiKey, setApiKey] = useState('rcp_live_token_7c3aed06b6d4f59e0b2382');
  
  // General forms
  const [name, setName] = useState(user?.name || 'Raj Patel');
  const [phone, setPhone] = useState(user?.phone || '+919876543210');

  // Toggle configurations
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(updateProfileRequest({
      data: { name, phone },
      callback: (success) => {
        if (success) {
          alert('Configuration saved successfully.');
        }
      }
    }));
  };

  const handleGenerateKey = () => {
    const chars = 'abcdef0123456789';
    let rand = '';
    for (let i = 0; i < 24; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setApiKey(`rcp_live_token_${rand}`);
    setCopiedKey(false);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left pb-10">
      
      {/* Left Column: Tab switcher selectors */}
      <nav className="lg:col-span-3 space-y-1 bg-white/70 dark:bg-slate-900/40 p-2.5 rounded-[24px] border border-slate-200/50 dark:border-white/5 h-fit shadow-premium">
        <div className="px-3.5 py-3 mb-2 flex items-center gap-2 border-b border-slate-100 dark:border-white/5">
          <Settings className="w-4 h-4 text-brandPrimary" />
          <span className="text-xs font-extrabold uppercase text-slate-800 dark:text-white tracking-wider">Settings Panel</span>
        </div>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-brandPrimary/10 border border-brandPrimary/15 text-brandPrimary shadow-sm' 
                  : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brandPrimary' : 'text-slate-400 dark:text-white/30'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Column: Tab View panel */}
      <main className="lg:col-span-9 glassmorphism p-6 rounded-[24px] border border-slate-200/50 dark:border-white/5 bg-white/70 dark:bg-slate-900/40 shadow-premium">
        <AnimatePresence mode="wait">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <motion.div 
              key="general"
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              className="space-y-6"
            >
              {/* Profile Header Summary with Image */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-slate-50 dark:bg-[#080b12]/20 border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-sm">
                <img 
                  src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj'} 
                  className="w-20 h-20 rounded-full object-cover border border-slate-200 dark:border-white/10 shadow-md"
                  alt="Profile"
                />
                <div className="text-center sm:text-left space-y-1">
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">
                    {user?.name || 'Aarav Sharma'}
                  </h3>
                  <p className="text-xs text-slate-450 dark:text-white/40 font-mono font-bold">
                    @{user?.username || 'aaravsharma'}
                  </p>
                  <div className="pt-1">
                    <span className="bg-brandPrimary/10 text-brandPrimary dark:text-brandSecondary border border-brandPrimary/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {user?.role || 'Contestant'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">General Configurations</h2>
                <p className="text-xs text-slate-450 dark:text-white/35 mt-0.5">Manage your primary display credentials and email identifiers.</p>
              </div>
              
              <form onSubmit={handleUpdate} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-450 dark:text-white/35 uppercase tracking-wider">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-slate-55 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-xl text-slate-800 dark:text-white text-xs focus:outline-none focus:border-brandPrimary/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-450 dark:text-white/35 uppercase tracking-wider">Mobile Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-slate-55 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-xl text-slate-800 dark:text-white text-xs focus:outline-none focus:border-brandPrimary/50"
                    />
                  </div>

                  <div className="space-y-1.5 opacity-70">
                    <label className="block text-xs font-bold text-slate-450 dark:text-white/35 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Email Address</span>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || 'name@domain.com'}
                      className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-black/40 border border-slate-200/40 dark:border-white/5 rounded-xl text-slate-500 dark:text-white/50 text-xs focus:outline-none cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5 opacity-70">
                    <label className="block text-xs font-bold text-slate-450 dark:text-white/35 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Username</span>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user?.username || 'username'}
                      className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-black/40 border border-slate-200/40 dark:border-white/5 rounded-xl text-slate-500 dark:text-white/50 text-xs focus:outline-none cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5 opacity-70">
                    <label className="block text-xs font-bold text-slate-450 dark:text-white/35 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Account Role</span>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user?.role || 'Contestant'}
                      className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-black/40 border border-slate-200/40 dark:border-white/5 rounded-xl text-slate-500 dark:text-white/50 text-xs focus:outline-none cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5 opacity-70">
                    <label className="block text-xs font-bold text-slate-450 dark:text-white/35 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Identity Verification (KYC)</span>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user?.kycStatus || 'Pending'}
                      className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-black/40 border border-slate-200/40 dark:border-white/5 rounded-xl text-slate-500 dark:text-white/50 text-xs focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98]"
                >
                  Save General Profile
                </button>
              </form>
            </motion.div>
          )}

          {/* SECURITY & DEVICES TAB */}
          {activeTab === 'security' && (
            <motion.div 
              key="security"
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Security & Devices</h2>
                <p className="text-xs text-slate-450 dark:text-white/35 mt-0.5">Manage active logins, revoke unauthorized browsers, or enable MFA.</p>
              </div>

              {/* Simulated MFA configuration */}
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 max-w-lg shadow-sm">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">Two-Factor Authentication (2FA)</h4>
                  <p className="text-[10px] text-slate-450 dark:text-white/35 mt-1 font-medium">Require verification codes sent to mobile number on login attempt.</p>
                </div>
                <button
                  onClick={() => setTwoFactor(!twoFactor)}
                  className="text-slate-700 dark:text-white/70 transition-colors"
                >
                  {twoFactor ? <ToggleRight className="w-9 h-9 text-brandSecondary" /> : <ToggleLeft className="w-9 h-9 text-slate-300 dark:text-white/20" />}
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-white/5 pt-6">
                <DeviceManager />
              </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <motion.div 
              key="notifications"
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Notification Rules</h2>
                <p className="text-xs text-slate-450 dark:text-white/35 mt-0.5">Set up automation warnings for audits, voting updates, and payments.</p>
              </div>

              <div className="max-w-lg space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Email biometrics update notifications</h4>
                    <p className="text-[10px] text-slate-450 dark:text-white/35 mt-1 font-medium">Receive alert logs when face match audits run.</p>
                  </div>
                  <button onClick={() => setEmailAlerts(!emailAlerts)}>
                    {emailAlerts ? <ToggleRight className="w-8 h-8 text-brandPrimary" /> : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />}
                  </button>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">SMS balance transaction notifications</h4>
                    <p className="text-[10px] text-slate-450 dark:text-white/35 mt-1 font-medium">Receive message logs when wallet balance increments or deducts.</p>
                  </div>
                  <button onClick={() => setSmsAlerts(!smsAlerts)}>
                    {smsAlerts ? <ToggleRight className="w-8 h-8 text-brandPrimary" /> : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* API DEVELOPER KEYS TAB */}
          {activeTab === 'keys' && (
            <motion.div 
              key="keys"
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Developer API Credentials</h2>
                <p className="text-xs text-slate-450 dark:text-white/35 mt-0.5">Secure client keys used for programmatically syndicating contests or fetching stats.</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-2xl max-w-lg space-y-4 shadow-sm">
                <div>
                  <span className="block text-[10px] text-slate-400 dark:text-white/40 font-bold uppercase tracking-wider mb-2">Live Secret Token</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled
                      value={apiKey}
                      className="w-full bg-slate-200/60 dark:bg-black/60 border border-slate-300/40 dark:border-white/5 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold px-3.5 py-2 rounded-xl focus:outline-none truncate"
                    />
                    <button
                      onClick={handleCopyKey}
                      className="p-2.5 bg-white hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-brandPrimary dark:text-white/60 dark:hover:text-white border border-slate-200 dark:border-white/5 rounded-xl transition-all shrink-0 shadow-sm"
                      title="Copy to Clipboard"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-250 dark:border-white/5 flex gap-2">
                  <button
                    onClick={handleGenerateKey}
                    className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate New Key</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
};

export default SettingsPage;
