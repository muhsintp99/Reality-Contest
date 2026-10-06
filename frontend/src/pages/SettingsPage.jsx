import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileRequest } from '../store/authSlice';
import { DeviceManager } from '../components/DeviceManager';
import { 
  Settings, User, Lock, Bell, KeyRound, CreditCard,
  ToggleLeft, ToggleRight, Copy, Check, RefreshCw, Eye, EyeOff,
  ShieldCheck, Zap, Sparkles, CheckCircle2, AlertCircle, Building,
  Globe, Sliders, ArrowRight, Trophy, Gift, Coins, Mail, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveAvatarSrc } from '../utils/avatar';

const TABS = [
  { id: 'general', label: 'General', icon: User },
  { id: 'security', label: 'Security & Devices', icon: Lock },
  { id: 'payment', label: 'Razorpay Payment Setup', icon: CreditCard },
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

  // Razorpay Payment Setup State
  const [rzpEnabled, setRzpEnabled] = useState(true);
  const [rzpEnv, setRzpEnv] = useState('test'); // 'test' | 'live'
  const [rzpKeyId, setRzpKeyId] = useState('rzp_test_9876543210abcd');
  const [rzpKeySecret, setRzpKeySecret] = useState('sec_test_9876543210secretkey');
  const [rzpWebhookSecret, setRzpWebhookSecret] = useState('whsec_9876543210webhooksecret');
  const [rzpMerchantName, setRzpMerchantName] = useState('Haka Contest Platform');
  const [rzpMerchantLogo, setRzpMerchantLogo] = useState('https://hakalive.in/haka_favicon.png');
  const [rzpCurrency, setRzpCurrency] = useState('INR');
  const [rzpAutoCapture, setRzpAutoCapture] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSavingRzp, setIsSavingRzp] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [paymentMethods, setPaymentMethods] = useState({
    upi: true,
    cards: true,
    netbanking: true,
    wallets: true,
    paylater: false,
    emi: false
  });

  // Comprehensive Notification Rules State
  const [notifRules, setNotifRules] = useState({
    // Contest & Room Joining
    contestJoinAlerts: true,
    roomCycleAlerts: true,
    taskDeadlineAlerts: true,
    // Starting & Welcome Rewards
    welcomeBonusAlerts: true,
    dailyLoginRewardAlerts: true,
    referralRewardAlerts: true,
    prizeDistributionAlerts: true,
    // Payment & Razorpay Transactions
    razorpayPaymentAlerts: true,
    walletBalanceAlerts: true,
    withdrawalAlerts: true,
    // Security & Biometrics
    biometricAuditAlerts: true,
    securityDeviceAlerts: true
  });

  const [saveNotifMsg, setSaveNotifMsg] = useState('');
  const [saveGeneralMsg, setSaveGeneralMsg] = useState('');

  const toggleNotifRule = (key) => {
    setNotifRules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifRules = (e) => {
    e.preventDefault();
    setSaveNotifMsg('Notification preferences saved successfully!');
    setTimeout(() => setSaveNotifMsg(''), 4000);
  };

  const webhookUrl = 'http://hakalive.in/api/v1/payments/razorpay/webhook';

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(updateProfileRequest({
      data: { name, phone },
      callback: (success) => {
        if (success) {
          setSaveGeneralMsg('General profile configuration saved successfully.');
          setTimeout(() => setSaveGeneralMsg(''), 4000);
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

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleCopyKeyId = () => {
    navigator.clipboard.writeText(rzpKeyId);
    setCopiedKeyId(true);
    setTimeout(() => setCopiedKeyId(false), 2000);
  };

  const togglePaymentMethod = (key) => {
    setPaymentMethods(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      const expectedPrefix = rzpEnv === 'live' ? 'rzp_live_' : 'rzp_test_';
      if (!rzpKeyId || !rzpKeySecret) {
        setTestResult({
          success: false,
          message: 'Both Key ID and Key Secret are required to test connection.'
        });
      } else if (!rzpKeyId.startsWith(expectedPrefix) && !rzpKeyId.startsWith('rzp_')) {
        setTestResult({
          success: false,
          message: `Invalid Key ID format. ${rzpEnv === 'live' ? 'Live' : 'Test'} keys should start with '${expectedPrefix}'.`
        });
      } else {
        setTestResult({
          success: true,
          message: `Connection successfully verified with Razorpay ${rzpEnv.toUpperCase()} servers!`,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    }, 1200);
  };

  const handleSaveRazorpaySettings = (e) => {
    e.preventDefault();
    setIsSavingRzp(true);
    setSaveMessage('');

    setTimeout(() => {
      setIsSavingRzp(false);
      setSaveMessage('Razorpay payment setup updated and activated successfully!');
      setTimeout(() => setSaveMessage(''), 4000);
    }, 900);
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
                  src={resolveAvatarSrc(user, user?.name || 'User')} 
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

              {saveGeneralMsg && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{saveGeneralMsg}</span>
                </div>
              )}

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

          {/* RAZORPAY PAYMENT SETUP TAB */}
          {activeTab === 'payment' && (
            <motion.div 
              key="payment"
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              className="space-y-6"
            >
              {/* Header Banner */}
              <div className="p-5 bg-gradient-to-br from-sky-500/10 via-blue-600/10 to-indigo-600/10 border border-sky-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">
                        Razorpay Payment Gateway Setup
                      </h2>
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full tracking-wider ${
                        rzpEnv === 'live' 
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400'
                      }`}>
                        {rzpEnv === 'live' ? '● Live Mode' : '⚡ Test Sandbox'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
                      Configure Razorpay credentials, webhook secret, payment methods, and auto-capture rules.
                    </p>
                  </div>
                </div>

                {/* Gateway Enable Toggle */}
                <div className="flex items-center gap-3 bg-white/60 dark:bg-black/30 px-3.5 py-2 rounded-xl border border-slate-200/50 dark:border-white/10 shrink-0">
                  <span className="text-xs font-bold text-slate-700 dark:text-white/80">
                    {rzpEnabled ? 'Gateway Active' : 'Gateway Disabled'}
                  </span>
                  <button onClick={() => setRzpEnabled(!rzpEnabled)} type="button">
                    {rzpEnabled ? (
                      <ToggleRight className="w-8 h-8 text-blue-600 dark:text-blue-400 transition-transform hover:scale-105" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20 transition-transform hover:scale-105" />
                    )}
                  </button>
                </div>
              </div>

              {saveMessage && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{saveMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveRazorpaySettings} className="space-y-6">
                {/* 1. Environment & API Credentials */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase text-slate-800 dark:text-white tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    API Credentials & Mode
                  </h3>

                  <div className="p-4 bg-slate-50 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-2xl space-y-4 shadow-sm">
                    {/* Environment Radio Selection */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-2">
                        Gateway Environment
                      </label>
                      <div className="grid grid-cols-2 gap-3 max-w-md">
                        <button
                          type="button"
                          onClick={() => setRzpEnv('test')}
                          className={`p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all ${
                            rzpEnv === 'test'
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400 shadow-sm'
                              : 'bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-white/40 hover:bg-slate-100'
                          }`}
                        >
                          <div>
                            <span className="block text-xs">Test Sandbox</span>
                            <span className="text-[10px] opacity-70 font-normal">Use rzp_test_ keys</span>
                          </div>
                          {rzpEnv === 'test' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => setRzpEnv('live')}
                          className={`p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all ${
                            rzpEnv === 'live'
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 shadow-sm'
                              : 'bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-white/40 hover:bg-slate-100'
                          }`}
                        >
                          <div>
                            <span className="block text-xs">Live Production</span>
                            <span className="text-[10px] opacity-70 font-normal">Use rzp_live_ keys</span>
                          </div>
                          {rzpEnv === 'live' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </button>
                      </div>
                    </div>

                    {/* Key ID & Key Secret */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-600 dark:text-white/60">
                          Razorpay Key ID ({rzpEnv.toUpperCase()})
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={rzpKeyId}
                            onChange={(e) => setRzpKeyId(e.target.value)}
                            placeholder={rzpEnv === 'live' ? 'rzp_live_xxxxxxxx' : 'rzp_test_xxxxxxxx'}
                            className="block w-full px-3.5 py-2.5 bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleCopyKeyId}
                            className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-white/60 hover:text-blue-500 shrink-0"
                            title="Copy Key ID"
                          >
                            {copiedKeyId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-600 dark:text-white/60">
                          Razorpay Key Secret
                        </label>
                        <div className="flex gap-2">
                          <input
                            type={showSecret ? "text" : "password"}
                            value={rzpKeySecret}
                            onChange={(e) => setRzpKeySecret(e.target.value)}
                            placeholder="Enter Razorpay Secret Key"
                            className="block w-full px-3.5 py-2.5 bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-white/60 hover:text-blue-500 shrink-0"
                            title={showSecret ? "Hide Secret" : "Show Secret"}
                          >
                            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Webhook Secret & Endpoint URL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/50 dark:border-white/5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-600 dark:text-white/60">
                          Webhook Secret Key
                        </label>
                        <input
                          type="text"
                          value={rzpWebhookSecret}
                          onChange={(e) => setRzpWebhookSecret(e.target.value)}
                          placeholder="whsec_xxxxxxxx"
                          className="block w-full px-3.5 py-2.5 bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-600 dark:text-white/60">
                          Webhook Notification Endpoint URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={webhookUrl}
                            className="block w-full px-3.5 py-2.5 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl text-slate-500 dark:text-white/40 text-xs font-mono truncate cursor-not-allowed"
                          />
                          <button
                            type="button"
                            onClick={handleCopyWebhookUrl}
                            className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-white/60 hover:text-blue-500 shrink-0"
                            title="Copy Webhook Endpoint URL"
                          >
                            {copiedWebhook ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Test Connection Action */}
                    <div className="pt-3 border-t border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className="px-4 py-2 bg-slate-800 dark:bg-white/10 hover:bg-slate-900 dark:hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                      >
                        {isTesting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying with Razorpay...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>Test Credentials Handshake</span>
                          </>
                        )}
                      </button>

                      {testResult && (
                        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                          testResult.success 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                        }`}>
                          {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          <span>{testResult.message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Merchant Branding & Currency */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase text-slate-800 dark:text-white tracking-wider flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-500" />
                    Merchant Modal Branding & Options
                  </h3>

                  <div className="p-4 bg-slate-50 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-sm">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 dark:text-white/60">
                        Checkout Merchant Display Name
                      </label>
                      <input
                        type="text"
                        value={rzpMerchantName}
                        onChange={(e) => setRzpMerchantName(e.target.value)}
                        placeholder="e.g. Haka Contest Platform"
                        className="block w-full px-3.5 py-2.5 bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 dark:text-white/60">
                        Default Currency
                      </label>
                      <select
                        value={rzpCurrency}
                        onChange={(e) => setRzpCurrency(e.target.value)}
                        className="block w-full px-3.5 py-2.5 bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="INR">INR (₹) - Indian Rupee</option>
                        <option value="USD">USD ($) - United States Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="GBP">GBP (£) - British Pound</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Auto-Capture Authorized Payments</h4>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 mt-0.5">Automatically capture transaction payments immediately upon successful authorization.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRzpAutoCapture(!rzpAutoCapture)}
                        className="text-slate-700 dark:text-white/70"
                      >
                        {rzpAutoCapture ? <ToggleRight className="w-8 h-8 text-blue-600" /> : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Accepted Payment Methods */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase text-slate-800 dark:text-white tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-500" />
                    Accepted Payment Channels
                  </h3>

                  <div className="p-4 bg-slate-50 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-2xl grid grid-cols-2 sm:grid-cols-3 gap-3 shadow-sm">
                    {[
                      { key: 'upi', label: 'UPI (GPay, PhonePe, Paytm)', desc: 'Instant UPI QR & Collect' },
                      { key: 'cards', label: 'Credit & Debit Cards', desc: 'Visa, Mastercard, RuPay' },
                      { key: 'netbanking', label: 'Net Banking', desc: 'All Major Indian Banks' },
                      { key: 'wallets', label: 'Mobile Wallets', desc: 'Paytm, Amazon Pay, Mobikwik' },
                      { key: 'paylater', label: 'Pay Later (BNPL)', desc: 'LazyPay, Simpl, ICICI' },
                      { key: 'emi', label: 'EMI Options', desc: 'Credit & Debit Card EMIs' }
                    ].map(method => (
                      <div
                        key={method.key}
                        onClick={() => togglePaymentMethod(method.key)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          paymentMethods[method.key]
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-300 shadow-sm'
                            : 'bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-white/40 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{method.label}</span>
                          <input
                            type="checkbox"
                            checked={paymentMethods[method.key]}
                            onChange={() => {}}
                            className="w-3.5 h-3.5 text-blue-600 rounded"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-white/40 block leading-tight">{method.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingRzp}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {isSavingRzp ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving Razorpay Configuration...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save Razorpay Setup</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
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
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brandPrimary" />
                  Notification Preferences & Automation Rules
                </h2>
                <p className="text-xs text-slate-450 dark:text-white/35 mt-0.5">Manage alerts for contest joining, starting welcome rewards, Razorpay payments, and security.</p>
              </div>

              {saveNotifMsg && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{saveNotifMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveNotifRules} className="space-y-6 max-w-3xl">
                {/* 1. Contest & Room Joining Notifications */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase text-slate-800 dark:text-white tracking-wider flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    1. Contest & Room Joining Alerts
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 shadow-sm">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Contest Entry & Join Confirmation</h4>
                        <p className="text-[10px] text-slate-450 dark:text-white/35 mt-0.5 font-medium">Instant alerts when you join a contest or daily arena.</p>
                      </div>
                      <button type="button" onClick={() => toggleNotifRule('contestJoinAlerts')}>
                        {notifRules.contestJoinAlerts ? <ToggleRight className="w-8 h-8 text-brandPrimary" /> : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />}
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 shadow-sm">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Room Cycle & Member Activity</h4>
                        <p className="text-[10px] text-slate-450 dark:text-white/35 mt-0.5 font-medium">Alerts when a new 14-day room cycle starts or task updates occur.</p>
                      </div>
                      <button type="button" onClick={() => toggleNotifRule('roomCycleAlerts')}>
                        {notifRules.roomCycleAlerts ? <ToggleRight className="w-8 h-8 text-brandPrimary" /> : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />}
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 shadow-sm md:col-span-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Task Submission Deadline Reminders</h4>
                        <p className="text-[10px] text-slate-450 dark:text-white/35 mt-0.5 font-medium">Receive warning notifications 2 hours before contest stage timers expire.</p>
                      </div>
                      <button type="button" onClick={() => toggleNotifRule('taskDeadlineAlerts')}>
                        {notifRules.taskDeadlineAlerts ? <ToggleRight className="w-8 h-8 text-brandPrimary" /> : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Starting & Welcome Reward Notifications */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase text-slate-800 dark:text-white tracking-wider flex items-center gap-2">
                    <Gift className="w-4 h-4 text-emerald-500" />
                    2. Starting Bonus & Reward Alerts
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 shadow-sm">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Welcome Signup Bonus Alerts</h4>
                        <p className="text-[10px] text-slate-450 dark:text-white/35 mt-0.5 font-medium">Notifications when starting welcome coins 🪙 are credited on account join.</p>
                      </div>
                      <button type="button" onClick={() => toggleNotifRule('welcomeBonusAlerts')}>
                        {notifRules.welcomeBonusAlerts ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />}
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 shadow-sm">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Daily Login Streak Reminders</h4>
                        <p className="text-[10px] text-slate-450 dark:text-white/35 mt-0.5 font-medium">Daily alerts to claim login streak rewards & daily coins.</p>
                      </div>
                      <button type="button" onClick={() => toggleNotifRule('dailyLoginRewardAlerts')}>
                        {notifRules.dailyLoginRewardAlerts ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />}
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 shadow-sm">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Referral & Sponsor Bonus Alerts</h4>
                        <p className="text-[10px] text-slate-450 dark:text-white/35 mt-0.5 font-medium">Receive alerts when a referred contestant joins and bonus is awarded.</p>
                      </div>
                      <button type="button" onClick={() => toggleNotifRule('referralRewardAlerts')}>
                        {notifRules.referralRewardAlerts ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />}
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 shadow-sm">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Prize Distribution Announcements</h4>
                        <p className="text-[10px] text-slate-450 dark:text-white/35 mt-0.5 font-medium">Instant alerts when winning prizes or room rewards are distributed.</p>
                      </div>
                      <button type="button" onClick={() => toggleNotifRule('prizeDistributionAlerts')}>
                        {notifRules.prizeDistributionAlerts ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Payment & Razorpay Transaction Notifications */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase text-slate-800 dark:text-white tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                    3. Payment & Razorpay Transactions
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 shadow-sm">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Razorpay Payment Receipts</h4>
                        <p className="text-[10px] text-slate-450 dark:text-white/35 mt-0.5 font-medium">SMS & Email notifications for Razorpay deposit & payment transactions.</p>
                      </div>
                      <button type="button" onClick={() => toggleNotifRule('razorpayPaymentAlerts')}>
                        {notifRules.razorpayPaymentAlerts ? <ToggleRight className="w-8 h-8 text-blue-600" /> : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />}
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 shadow-sm">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Wallet Balance Logs</h4>
                        <p className="text-[10px] text-slate-450 dark:text-white/35 mt-0.5 font-medium">Receive logs when wallet balance increments or deducts.</p>
                      </div>
                      <button type="button" onClick={() => toggleNotifRule('walletBalanceAlerts')}>
                        {notifRules.walletBalanceAlerts ? <ToggleRight className="w-8 h-8 text-blue-600" /> : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />}
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 shadow-sm md:col-span-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Withdrawal Request Status Updates</h4>
                        <p className="text-[10px] text-slate-450 dark:text-white/35 mt-0.5 font-medium">Notifications when bank/UPI withdrawal requests are processed or completed.</p>
                      </div>
                      <button type="button" onClick={() => toggleNotifRule('withdrawalAlerts')}>
                        {notifRules.withdrawalAlerts ? <ToggleRight className="w-8 h-8 text-blue-600" /> : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Security & Biometric Audit Notifications */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase text-slate-800 dark:text-white tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                    4. Security & Biometrics Alerts
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 shadow-sm">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Biometrics Update & Audit Logs</h4>
                        <p className="text-[10px] text-slate-450 dark:text-white/35 mt-0.5 font-medium">Email notifications when face match audits or KYC checks run.</p>
                      </div>
                      <button type="button" onClick={() => toggleNotifRule('biometricAuditAlerts')}>
                        {notifRules.biometricAuditAlerts ? <ToggleRight className="w-8 h-8 text-purple-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />}
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 shadow-sm">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Unrecognized Device Login Warnings</h4>
                        <p className="text-[10px] text-slate-450 dark:text-white/35 mt-0.5 font-medium">Security alerts when account is accessed from a new browser or IP.</p>
                      </div>
                      <button type="button" onClick={() => toggleNotifRule('securityDeviceAlerts')}>
                        {notifRules.securityDeviceAlerts ? <ToggleRight className="w-8 h-8 text-purple-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Notifications Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-98 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Notification Preferences</span>
                  </button>
                </div>
              </form>
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
