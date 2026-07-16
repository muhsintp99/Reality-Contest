import React, { useState } from 'react';
import { 
  Bell, Trash2, CheckCheck, ShieldAlert, Sparkles, Wallet, 
  CheckCircle2, Info, Calendar, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../components/common/Badges';

const INITIAL_NOTIFICATIONS = [
  { 
    id: 'n-1', 
    title: 'Identity Verified Successfully', 
    message: 'Your biometric liveness scan matches and KYC documentation check has passed.', 
    category: 'security', 
    time: '10 mins ago', 
    read: false,
    icon: CheckCircle2,
    color: 'text-teal-650 bg-teal-500/10 border-teal-500/15 dark:text-teal-400'
  },
  { 
    id: 'n-2', 
    title: 'New Challenge: Pepsi Creator Showdown 2026', 
    message: 'Sponsor Pepsi Co just launched a new challenge stage with a prize pool of ₹10,00,000.', 
    category: 'contests', 
    time: '1 hour ago', 
    read: false,
    icon: Sparkles,
    color: 'text-brandSecondary bg-brandSecondary/10 border-brandSecondary/15 dark:text-brandSecondary'
  },
  { 
    id: 'n-3', 
    title: 'Wallet Balance Loaded', 
    message: 'Successfully loaded ₹1,000 credits to your play balance via simulation gateway.', 
    category: 'wallet', 
    time: '3 hours ago', 
    read: true,
    icon: Wallet,
    color: 'text-brandAccent bg-brandAccent/10 border-brandAccent/15 dark:text-brandAccent'
  },
  { 
    id: 'n-4', 
    title: 'Security Session Alert', 
    message: 'Your account was accessed from a new Windows Desktop device using Chrome.', 
    category: 'security', 
    time: '1 day ago', 
    read: true,
    icon: ShieldAlert,
    color: 'text-rose-600 bg-rose-500/10 border-rose-500/15 dark:text-rose-400'
  },
  { 
    id: 'n-5', 
    title: 'Auditor System Log', 
    message: 'Manual stage qualification overrides were simulated for result log res-105.', 
    category: 'system', 
    time: '2 days ago', 
    read: true,
    icon: Info,
    color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/15 dark:text-indigo-400'
  }
];

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredNotifs = notifications.filter(n => 
    activeFilter === 'all' ? true : n.category === activeFilter
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleToggleRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: !n.read } : n
    ));
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'security': return 'Security';
      case 'contests': return 'Contest Arena';
      case 'wallet': return 'Billing & Wallet';
      case 'system': return 'System Audit';
      default: return category;
    }
  };

  return (
    <div className="space-y-6 text-left pb-10">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-[#080b12]/10 p-5 rounded-[24px] border border-slate-200/50 dark:border-white/5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-5.5 h-5.5 text-brandPrimary" />
            <span>Notification Command Center</span>
          </h1>
          <p className="text-xs text-slate-450 dark:text-white/40 mt-1">
            Monitor and manage system audits, wallet status logs, and tournament challenges.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 border border-slate-200 dark:border-white/10 hover:border-brandPrimary/30 bg-white dark:bg-white/5 text-slate-600 hover:text-brandPrimary dark:text-white/80 dark:hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-[0.98] shadow-sm"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 border border-rose-500/20 hover:border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 hover:text-rose-500 dark:text-rose-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-[0.98] shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs and Content container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Filter Options */}
        <nav className="space-y-1 bg-white/70 dark:bg-slate-900/40 p-2.5 rounded-[24px] border border-slate-200/50 dark:border-white/5 shadow-premium">
          <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-white/35 px-3.5 py-2">Category Filters</span>
          {[
            { id: 'all', label: 'All Activities', count: notifications.length },
            { id: 'security', label: 'Security Alerts', count: notifications.filter(n => n.category === 'security').length },
            { id: 'contests', label: 'Contest Updates', count: notifications.filter(n => n.category === 'contests').length },
            { id: 'wallet', label: 'Wallet Actions', count: notifications.filter(n => n.category === 'wallet').length },
            { id: 'system', label: 'System Logs', count: notifications.filter(n => n.category === 'system').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === tab.id
                  ? 'bg-brandPrimary/10 border border-brandPrimary/15 text-brandPrimary shadow-sm'
                  : 'hover:bg-slate-55 dark:hover:bg-white/5 text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  activeFilter === tab.id ? 'bg-brandPrimary/20 text-brandPrimary' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/40'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right Side: Notification list */}
        <div className="lg:col-span-3 space-y-3.5">
          <AnimatePresence mode="popLayout">
            {filteredNotifs.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glassmorphism bg-white dark:bg-slate-900/40 p-12 rounded-[24px] border border-slate-200/50 dark:border-white/5 text-center space-y-3 shadow-premium"
              >
                <div className="inline-flex p-4 bg-slate-50 dark:bg-white/5 rounded-full text-slate-400 dark:text-white/20 border border-slate-200/40 dark:border-white/5 shadow-inner">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">No notifications found</h3>
                <p className="text-xs text-slate-400 dark:text-white/35 max-w-xs mx-auto leading-relaxed">
                  No notifications are logged under this filter. Platform subsystems are functioning normally.
                </p>
              </motion.div>
            ) : (
              filteredNotifs.map(notif => {
                const Icon = notif.icon;
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleToggleRead(notif.id)}
                    className={`glassmorphism p-5 rounded-[24px] border transition-all cursor-pointer flex gap-4 select-none relative group bg-white/70 dark:bg-slate-900/40 shadow-premium ${
                      notif.read 
                        ? 'opacity-65 border-slate-200 dark:border-white/5 hover:opacity-90' 
                        : 'border-brandPrimary/30 dark:border-brandPrimary/30 shadow-md shadow-brandPrimary/5'
                    }`}
                  >
                    {/* Category Indicator Icon */}
                    <div className={`p-2.5 rounded-xl shrink-0 h-11 w-11 flex items-center justify-center border ${notif.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Body details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className={`text-xs font-bold leading-none ${notif.read ? 'text-slate-700 dark:text-white/80' : 'text-slate-900 dark:text-white'}`}>
                          {notif.title}
                        </h3>
                        <span className="text-[9px] text-slate-400 dark:text-white/30 flex items-center gap-1 font-mono font-bold shrink-0">
                          <Calendar className="w-3 h-3" />
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-white/55 leading-relaxed pr-6 mt-1 font-medium">
                        {notif.message}
                      </p>
                      <div className="pt-2 flex items-center gap-2">
                        <span className="bg-slate-100 dark:bg-white/5 border border-slate-200/20 dark:border-white/5 text-slate-500 dark:text-white/40 px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">
                          {getCategoryLabel(notif.category)}
                        </span>
                        {!notif.read && (
                          <span className="bg-brandPrimary/10 text-brandPrimary border border-brandPrimary/20 px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">
                            New Alert
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions wrapper on right */}
                    <div className="absolute right-4 bottom-4 lg:right-6 lg:top-1/2 lg:-translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDelete(notif.id, e)}
                        className="p-1.5 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 hover:text-rose-500 rounded-lg transition-colors shadow-sm"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};

export default NotificationsPage;
