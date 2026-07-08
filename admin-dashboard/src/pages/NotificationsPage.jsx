import React, { useState } from 'react';
import { 
  Bell, Trash2, CheckCheck, ShieldAlert, Sparkles, Wallet, 
  CheckCircle2, Info, Calendar
} from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  { 
    id: 'n-1', 
    title: 'Identity Verified Successfully', 
    message: 'Your biometric liveness scan matches and KYC documentation check has passed.', 
    category: 'security', 
    time: '10 mins ago', 
    read: false,
    icon: CheckCircle2,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  },
  { 
    id: 'n-2', 
    title: 'New Challenge: Pepsi Creator Showdown 2026', 
    message: 'Sponsor Pepsi Co just launched a new challenge stage with a prize pool of ₹10,00,000.', 
    category: 'contests', 
    time: '1 hour ago', 
    read: false,
    icon: Sparkles,
    color: 'text-brandSecondary bg-brandSecondary/10 border-brandSecondary/20'
  },
  { 
    id: 'n-3', 
    title: 'Wallet Balance Loaded', 
    message: 'Successfully loaded ₹1,000 credits to your play balance via simulation gateway.', 
    category: 'wallet', 
    time: '3 hours ago', 
    read: true,
    icon: Wallet,
    color: 'text-brandAccent bg-brandAccent/10 border-brandAccent/20'
  },
  { 
    id: 'n-4', 
    title: 'Security Session Alert', 
    message: 'Your account was accessed from a new Windows Desktop device using Chrome.', 
    category: 'security', 
    time: '1 day ago', 
    read: true,
    icon: ShieldAlert,
    color: 'text-red-400 bg-red-500/10 border-red-500/20'
  },
  { 
    id: 'n-5', 
    title: 'Auditor System Log', 
    message: 'Manual stage qualification overrides were simulated for result log res-105.', 
    category: 'system', 
    time: '2 days ago', 
    read: true,
    icon: Info,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
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
    <div className="space-y-6 text-left animate-fade-in max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-poppins text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-brandPrimary" />
            <span>Notification Command Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-white/50">
            Monitor and manage system audits, wallet status logs, and tournament challenges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 border border-slate-200 dark:border-white/10 hover:border-brandPrimary/30 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/80 hover:text-brandPrimary text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 border border-red-500/20 hover:border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-500 hover:text-red-400 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
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
        <nav className="space-y-1 bg-slate-100 dark:bg-white/5 p-2.5 rounded-2xl border border-slate-200/50 dark:border-white/5">
          <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-white/30 px-3.5 py-2">Category Filters</span>
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
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeFilter === tab.id
                  ? 'bg-brandPrimary/15 border border-brandPrimary/20 text-brandPrimary shadow-md'
                  : 'hover:bg-slate-200 dark:hover:bg-white/5 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeFilter === tab.id ? 'bg-brandPrimary/20 text-brandPrimary' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white/40'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right Side: Notification list */}
        <div className="lg:col-span-3 space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="glassmorphism p-12 rounded-2xl border border-slate-200 dark:border-white/10 text-center space-y-3">
              <div className="inline-flex p-4 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 dark:text-white/30 border border-slate-200/50 dark:border-white/5">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-poppins">No notifications found</h3>
              <p className="text-xs text-slate-400 dark:text-white/40 max-w-sm mx-auto">
                No notification logs are currently logged under this category filter. System check reports are healthy.
              </p>
            </div>
          ) : (
            filteredNotifs.map(notif => {
              const Icon = notif.icon;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleToggleRead(notif.id)}
                  className={`glassmorphism p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 select-none relative group ${
                    notif.read 
                      ? 'opacity-65 border-slate-200 dark:border-white/5 hover:opacity-90' 
                      : 'border-brandPrimary/30 dark:border-brandPrimary/30 shadow-lg shadow-brandPrimary/5'
                  }`}
                >
                  {/* Category Indicator Icon */}
                  <div className={`p-3 rounded-xl shrink-0 h-11 w-11 flex items-center justify-center border ${notif.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Body details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className={`text-xs font-bold leading-none ${notif.read ? 'text-slate-700 dark:text-white/80' : 'text-slate-900 dark:text-white'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[10px] text-slate-400 dark:text-white/30 flex items-center gap-1 font-mono shrink-0">
                        <Calendar className="w-3 h-3" />
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-white/50 leading-relaxed pr-6">
                      {notif.message}
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <span className="bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white/40 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                        {getCategoryLabel(notif.category)}
                      </span>
                      {!notif.read && (
                        <span className="bg-brandPrimary/10 text-brandPrimary border border-brandPrimary/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                          New Alert
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions wrapper on right */}
                  <div className="absolute right-4 bottom-4 lg:right-6 lg:top-1/2 lg:-translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDelete(notif.id, e)}
                      className="p-1.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 hover:text-red-400 rounded-lg transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};

export default NotificationsPage;
