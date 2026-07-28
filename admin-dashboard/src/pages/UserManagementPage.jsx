import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users, Search, ShieldAlert, UserCheck, Key, Shield, Wallet, History,
  Smartphone, Share2, Filter, AlertTriangle, CheckCircle, RefreshCw, X
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

const MOCK_USERS = [
  { id: 'USR-101', name: 'Aarav Sharma', email: 'aarav@example.com', phone: '+91 9876543210', status: 'Active', kyc: 'Verified', balance: 1450, device: 'iPhone 14 Pro (iOS 17.2)', ip: '103.22.45.12', referrals: 14, joins: 28 },
  { id: 'USR-102', name: 'Priya Nair', email: 'priya@example.com', phone: '+91 9812345678', status: 'Suspended', kyc: 'Pending', balance: 320, device: 'Samsung S23 (Android 14)', ip: '49.36.12.89', referrals: 3, joins: 12 },
  { id: 'USR-103', name: 'Rohan Mehta', email: 'rohan@example.com', phone: '+91 9765432109', status: 'Banned', kyc: 'Rejected', balance: 0, device: 'OnePlus 11 (Android 13)', ip: '157.33.19.4', referrals: 0, joins: 4 },
  { id: 'USR-104', name: 'Ananya Verma', email: 'ananya@example.com', phone: '+91 9988776655', status: 'Active', kyc: 'Verified', balance: 2890, device: 'Google Pixel 8 (Android 14)', ip: '103.88.92.11', referrals: 29, joins: 54 },
];

export const UserManagementPage = () => {
  const { showSnackbar } = useAlert();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('all'); // all, kyc, balance, history, login, device, referral
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalAction, setModalAction] = useState(null);

  // Sync tab with URL search parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['all', 'kyc', 'balance', 'history', 'login', 'device', 'referral'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const filteredUsers = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (user, action) => {
    setSelectedUser(user);
    setModalAction(action);
  };

  const confirmAction = () => {
    showSnackbar(`Successfully executed ${modalAction} for ${selectedUser?.name}`, 'success');
    setModalAction(null);
    setSelectedUser(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-brandPrimary" /> User Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Manage all platform users, KYC verification, security actions, wallet balances & history.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs matching reference spec */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'all', label: 'All Users', icon: Users },
          { id: 'kyc', label: 'KYC Status', icon: Shield },
          { id: 'balance', label: 'Wallet Balance', icon: Wallet },
          { id: 'history', label: 'Contest History', icon: History },
          { id: 'login', label: 'Login History', icon: RefreshCw },
          { id: 'device', label: 'Device Details', icon: Smartphone },
          { id: 'referral', label: 'Referral Details', icon: Share2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brandPrimary text-white shadow-md shadow-brandPrimary/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Active View Tab: <strong className="text-brandPrimary capitalize">{activeTab}</strong> | </span>
          <span>Showing <strong>{filteredUsers.length}</strong> total users</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-5 py-3.5">User Info</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">KYC Status</th>
                <th className="px-5 py-3.5">Wallet</th>
                <th className="px-5 py-3.5">Device & IP</th>
                <th className="px-5 py-3.5">Referrals</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                    <div className="text-[11px] text-slate-400">{user.email} • {user.id}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      user.status === 'Suspended' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      user.kyc === 'Verified' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                      user.kyc === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {user.kyc}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                    ₹{user.balance.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-[11px] font-medium">{user.device}</div>
                    <div className="text-[10px] text-slate-400">{user.ip}</div>
                  </td>
                  <td className="px-5 py-4 font-bold text-brandPrimary">
                    {user.referrals} Code Shares
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleAction(user, 'Verify')}
                        title="Verify User"
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAction(user, 'Reset Password')}
                        title="Reset Password"
                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAction(user, 'Suspend')}
                        title="Suspend User"
                        className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAction(user, 'Ban')}
                        title="Ban User"
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {modalAction && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {modalAction} - {selectedUser.name}
              </h3>
              <button onClick={() => setModalAction(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <p className="text-sm text-slate-500">
              Are you sure you want to perform <strong>{modalAction}</strong> for {selectedUser.email}? This action will be logged in system audit.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setModalAction(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 text-xs font-semibold bg-brandPrimary text-white rounded-xl shadow-md hover:bg-brandPrimary/90"
              >
                Confirm {modalAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
