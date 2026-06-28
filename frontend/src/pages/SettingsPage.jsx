import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { DeviceManager } from '../components/DeviceManager';
import { 
  Settings, User, Lock, Bell, Globe, KeyRound, 
  CreditCard, ToggleLeft, ToggleRight, Copy, Check, RefreshCw
} from 'lucide-react';

const TABS = [
  { id: 'general', label: 'General', icon: User },
  { id: 'security', label: 'Security & Devices', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'keys', label: 'API Developer Keys', icon: KeyRound }
];

export const SettingsPage = () => {
  const { user, updateProfile } = useAuthStore();
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
    updateProfile({ name, phone });
    alert('Configuration saved successfully.');
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
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-fade-in">
      
      {/* Left Column: Tab switcher selectors */}
      <nav className="lg:col-span-3 space-y-1 bg-white/5 dark:bg-white/5 light:bg-black/5 p-2.5 rounded-2xl border border-white/5 h-fit">
        <div className="px-3.5 py-2.5 mb-2 flex items-center gap-2 border-b border-white/5">
          <Settings className="w-4 h-4 text-brandPrimary" />
          <span className="text-xs font-extrabold uppercase text-white dark:text-white light:text-black font-poppins">Settings Panel</span>
        </div>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                isActive 
                  ? 'bg-brandPrimary/15 border border-brandPrimary/20 text-brandPrimary shadow-md' 
                  : 'hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 text-white/60 dark:text-white/60 light:text-black/60 hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brandPrimary' : 'text-white/40'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Column: Tab View panel */}
      <main className="lg:col-span-9 glassmorphism p-6 rounded-2xl border border-white/10 dark:border-white/5 light:border-black/10">
        
        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-white dark:text-white light:text-black font-poppins uppercase tracking-wider">General Configurations</h2>
              <p className="text-xs text-white/50 dark:text-white/50 light:text-black/50 mt-0.5">Manage your primary display credentials and email identifiers.</p>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-white/65 uppercase tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 dark:border-white/10 light:border-black/15 rounded-xl text-white dark:text-white light:text-black text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/65 uppercase tracking-wider mb-2">Mobile Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 dark:border-white/10 light:border-black/15 rounded-xl text-white dark:text-white light:text-black text-sm focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-semibold shadow-lg hover:shadow-brandPrimary/10 transition-colors"
              >
                Save General Profile
              </button>
            </form>
          </div>
        )}

        {/* SECURITY & DEVICES TAB */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-white dark:text-white light:text-black font-poppins uppercase tracking-wider">Security & Devices</h2>
              <p className="text-xs text-white/50 dark:text-white/50 light:text-black/50 mt-0.5">Manage active logins, revoke unauthorized browsers, or enable MFA.</p>
            </div>

            {/* Simulated MFA configuration */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between gap-4 max-w-lg">
              <div>
                <h4 className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</h4>
                <p className="text-[10px] text-white/40 mt-0.5">Require verification codes sent to mobile number on login attempt.</p>
              </div>
              <button
                onClick={() => setTwoFactor(!twoFactor)}
                className="text-white/70 hover:text-white transition-colors"
              >
                {twoFactor ? <ToggleRight className="w-9 h-9 text-brandSecondary" /> : <ToggleLeft className="w-9 h-9 text-white/30" />}
              </button>
            </div>

            <div className="border-t border-white/5 pt-6">
              <DeviceManager />
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-white dark:text-white light:text-black font-poppins uppercase tracking-wider">Notification Rules</h2>
              <p className="text-xs text-white/50 dark:text-white/50 light:text-black/50 mt-0.5">Set up automation warnings for audits, voting updates, and payments.</p>
            </div>

            <div className="max-w-lg space-y-3.5">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white">Email biometrics update notifications</h4>
                  <p className="text-[10px] text-white/40 mt-0.5">Receive alert logs when face match audits run.</p>
                </div>
                <button onClick={() => setEmailAlerts(!emailAlerts)}>
                  {emailAlerts ? <ToggleRight className="w-8 h-8 text-brandPrimary" /> : <ToggleLeft className="w-8 h-8 text-white/30" />}
                </button>
              </div>
              
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white">SMS balance transaction notifications</h4>
                  <p className="text-[10px] text-white/40 mt-0.5">Receive message logs when wallet balance increments or deducts.</p>
                </div>
                <button onClick={() => setSmsAlerts(!smsAlerts)}>
                  {smsAlerts ? <ToggleRight className="w-8 h-8 text-brandPrimary" /> : <ToggleLeft className="w-8 h-8 text-white/30" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API DEVELOPER KEYS TAB */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-white dark:text-white light:text-black font-poppins uppercase tracking-wider">Developer API Credentials</h2>
              <p className="text-xs text-white/50 dark:text-white/50 light:text-black/50 mt-0.5">Secure client keys used for programmatically syndicating contests or fetching stats.</p>
            </div>

            <div className="p-4 bg-[#080b12]/50 border border-white/10 dark:border-white/10 light:border-black/15 rounded-2xl max-w-lg space-y-4">
              <div>
                <span className="block text-[10px] text-white/40 font-bold uppercase tracking-wider mb-2">Live Secret Token</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled
                    value={apiKey}
                    className="w-full bg-black/60 border border-white/5 text-[11px] font-mono text-cyan-400 font-semibold px-3 py-2 rounded-xl focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyKey}
                    className="p-2.5 bg-white/5 hover:bg-brandSecondary/15 text-white/60 hover:text-brandSecondary border border-white/10 rounded-xl transition-all shrink-0"
                    title="Copy to Clipboard"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex gap-2">
                <button
                  onClick={handleGenerateKey}
                  className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-semibold shadow-lg hover:shadow-brandPrimary/10 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate New Key</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
export default SettingsPage;
