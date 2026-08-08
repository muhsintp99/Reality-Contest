import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Users, Search, ShieldAlert, UserCheck, Key, Shield, Wallet, History,
  Smartphone, Share2, Filter, AlertTriangle, CheckCircle, RefreshCw, X, Plus, Edit3, Trash2, Eye, Sparkles, Lock, Mail, Phone, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { CustomSelect } from '../components/CustomSelect';

const MOCK_DEFAULT_CONTESTANTS = [
  { id: 'USR-101', _id: 'USR-101', name: 'Aarav Sharma', username: 'aarav', email: 'aarav@example.com', phone: '+91 9876543210', status: 'Active', kycStatus: 'Verified', walletBalance: 1450, device: 'iPhone 14 Pro (iOS 17.2)', ip: '103.22.45.12', referrals: 14, joins: 28, createdAt: '2026-07-15' },
  { id: 'USR-102', _id: 'USR-102', name: 'Priya Nair', username: 'priya', email: 'priya@example.com', phone: '+91 9812345678', status: 'Suspended', kycStatus: 'Pending', walletBalance: 320, device: 'Samsung S23 (Android 14)', ip: '49.36.12.89', referrals: 3, joins: 12, createdAt: '2026-07-20' },
  { id: 'USR-103', _id: 'USR-103', name: 'Rohan Mehta', username: 'rohan', email: 'rohan@example.com', phone: '+91 9765432109', status: 'Banned', kycStatus: 'Rejected', walletBalance: 0, device: 'OnePlus 11 (Android 13)', ip: '157.33.19.4', referrals: 0, joins: 4, createdAt: '2026-07-22' },
  { id: 'USR-104', _id: 'USR-104', name: 'Ananya Verma', username: 'ananya', email: 'ananya@example.com', phone: '+91 9988776655', status: 'Active', kycStatus: 'Verified', walletBalance: 2890, device: 'Google Pixel 8 (Android 14)', ip: '103.88.92.11', referrals: 29, joins: 54, createdAt: '2026-07-25' },
];

export const UserManagementPage = () => {
  const { showSnackbar, showAlert, showConfirm } = useAlert();
  const location = useLocation();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  // Active Navigation Sub-Tab: 'all' | 'kyc' | 'balance' | 'history' | 'login' | 'device' | 'referral'
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [kycFilter, setKycFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Contestants List State
  const [contestants, setContestants] = useState([]);

  // Drawers State
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [showAddDrawer, setShowAddDrawer] = useState(false);

  // Add Contestant Form
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    walletBalance: '500',
    kycStatus: 'Verified',
    status: 'Active'
  });

  // Edit User Form inside Drawer
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: '0'
  });

  // Reset Password State inside Drawer
  const [resetPasswordInput, setResetPasswordInput] = useState('');

  // Sync sub-tab with URL query param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['all', 'kyc', 'balance', 'history', 'login', 'device', 'referral'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Fetch Contestants from REST API
  useEffect(() => {
    fetchContestants();
  }, [isMockMode]);

  const fetchContestants = async () => {
    if (isMockMode) {
      setContestants(MOCK_DEFAULT_CONTESTANTS);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users/Contestant', { withCredentials: true });
      if (res.data && res.data.success && Array.isArray(res.data.users)) {
        const mapped = res.data.users.map((u, idx) => ({
          id: u._id || u.id || `USR-${100 + idx}`,
          _id: u._id || u.id,
          name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Contestant User',
          username: u.username || u.email?.split('@')[0] || `user_${idx}`,
          email: u.email || 'user@example.com',
          phone: u.phone || '+91 9999999999',
          status: u.status || 'Active',
          kycStatus: u.kycStatus || 'Pending',
          walletBalance: u.walletBalance || 0,
          device: u.device || 'Android 14 / Chrome',
          ip: u.ip || '103.22.45.12',
          referrals: u.referrals || Math.floor(Math.random() * 20),
          joins: u.joins || Math.floor(Math.random() * 40),
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-07-20'
        }));
        setContestants(mapped);
      }
    } catch (err) {
      console.error('Error fetching contestants from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter List Logic
  const filteredContestants = contestants.filter(u => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.id && u.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    const matchesKyc = kycFilter === 'All' || u.kycStatus === kycFilter;

    if (activeTab === 'kyc') return matchesSearch && matchesStatus && u.kycStatus === 'Pending';
    if (activeTab === 'balance') return matchesSearch && matchesStatus && u.walletBalance > 0;
    return matchesSearch && matchesStatus && matchesKyc;
  });

  // KPI Calculations
  const totalContestantsCount = contestants.length;
  const verifiedKycCount = contestants.filter(u => u.kycStatus === 'Verified' || u.kycStatus === 'APPROVED').length;
  const totalWalletPool = contestants.reduce((sum, u) => sum + (Number(u.walletBalance) || 0), 0);
  const activeSessionsCount = contestants.filter(u => u.status === 'Active').length;

  // Actions
  const handleOpenEditDrawer = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || '',
      phone: user.phone || '',
      status: user.status || 'Active',
      kycStatus: user.kycStatus || 'Verified',
      walletBalance: String(user.walletBalance || '0')
    });
    setResetPasswordInput('');
  };

  const handleCreateContestant = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.username) {
      showSnackbar('Please complete Name, Username, and Email fields.', 'warning');
      return;
    }

    if (!isMockMode) {
      try {
        const payload = {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          phone: formData.phone || '+919999999999',
          password: formData.password || 'password123',
          role: 'Contestant',
          walletBalance: Number(formData.walletBalance) || 0,
          kycStatus: formData.kycStatus,
          status: formData.status
        };
        const res = await axios.post('/api/admin/users', payload, { withCredentials: true });
        if (res.data && res.data.success) {
          showSnackbar(`Contestant "${formData.name}" created successfully!`, 'success');
          fetchContestants();
        }
      } catch (err) {
        showSnackbar(err.response?.data?.message || 'Failed to create contestant account.', 'error');
        return;
      }
    } else {
      const newContestant = {
        id: `USR-${Date.now().toString().slice(-3)}`,
        _id: `USR-${Date.now().toString().slice(-3)}`,
        ...formData,
        walletBalance: Number(formData.walletBalance) || 0,
        device: 'Web Client',
        ip: '127.0.0.1',
        referrals: 0,
        joins: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setContestants([newContestant, ...contestants]);
      showSnackbar(`Contestant "${formData.name}" added to list!`, 'success');
    }

    setShowAddDrawer(false);
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      walletBalance: '500',
      kycStatus: 'Verified',
      status: 'Active'
    });
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    const id = selectedUser._id || selectedUser.id;

    if (!isMockMode) {
      try {
        const payload = {
          name: editFormData.name,
          phone: editFormData.phone,
          status: editFormData.status,
          kycStatus: editFormData.kycStatus,
          walletBalance: Number(editFormData.walletBalance) || 0
        };
        await axios.put(`/api/admin/users/${id}`, payload, { withCredentials: true });
        showSnackbar(`Contestant details updated for "${editFormData.name}"`, 'success');
        fetchContestants();
      } catch (err) {
        showSnackbar(err.response?.data?.message || 'Failed to update user profile.', 'error');
      }
    } else {
      setContestants(contestants.map(u => u.id === selectedUser.id ? {
        ...u,
        name: editFormData.name,
        phone: editFormData.phone,
        status: editFormData.status,
        kycStatus: editFormData.kycStatus,
        walletBalance: Number(editFormData.walletBalance) || 0
      } : u));
      showSnackbar(`Contestant "${editFormData.name}" updated!`, 'info');
    }
    setSelectedUser(null);
  };

  const handleToggleStatus = async (user) => {
    const id = user._id || user.id;
    const nextStatus = user.status === 'Active' ? 'Suspended' : 'Active';

    showConfirm('Toggle Account Status', `Are you sure you want to change status to ${nextStatus} for ${user.name}?`, async () => {
      if (!isMockMode) {
        try {
          await axios.put(`/api/admin/users/${id}/status`, { status: nextStatus }, { withCredentials: true });
          showSnackbar(`Contestant status set to ${nextStatus}`, 'success');
          fetchContestants();
        } catch (err) {
          showSnackbar(err.response?.data?.message || 'Failed to toggle status', 'error');
        }
      } else {
        setContestants(contestants.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
        showSnackbar(`User set to ${nextStatus}`, 'info');
      }
    });
  };

  const handleDeleteUser = async (user) => {
    const id = user._id || user.id;
    showConfirm('Delete Contestant Account', `Permanently delete account for "${user.name}" (${user.email})? This action cannot be undone.`, async () => {
      if (!isMockMode) {
        try {
          await axios.delete(`/api/admin/users/${id}`, { withCredentials: true });
          showSnackbar(`Contestant account deleted.`, 'success');
          fetchContestants();
        } catch (err) {
          showSnackbar(err.response?.data?.message || 'Failed to delete user.', 'error');
        }
      } else {
        setContestants(contestants.filter(u => u.id !== user.id));
        showSnackbar(`Contestant deleted from list.`, 'info');
      }
    });
  };

  const handleResetPasswordSubmit = async () => {
    if (!resetPasswordInput || resetPasswordInput.length < 6) {
      showSnackbar('Please enter a new password of at least 6 characters.', 'warning');
      return;
    }
    const id = selectedUser._id || selectedUser.id;

    if (!isMockMode) {
      try {
        await axios.put(`/api/admin/users/${id}/reset-password`, { password: resetPasswordInput }, { withCredentials: true });
        showSnackbar(`Password reset successfully for ${selectedUser.name}!`, 'success');
      } catch (err) {
        showSnackbar(err.response?.data?.message || 'Failed to reset password.', 'error');
      }
    } else {
      showSnackbar(`Mock password reset for ${selectedUser.name}!`, 'success');
    }
    setResetPasswordInput('');
  };

  return (
    <div className="p-6 space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-brandPrimary" /> Contestant Console Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Manage registered contestants, KYC verifications, wallet balances, security controls, and active sessions.
          </p>
        </div>
        <button
          onClick={() => setShowAddDrawer(true)}
          className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold shadow-lg hover:bg-brandPrimary/90 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Contestant</span>
        </button>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Contestants</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalContestantsCount}</div>
          </div>
          <div className="p-3 bg-brandPrimary/10 text-brandPrimary rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">KYC Verified</div>
            <div className="text-2xl font-extrabold text-emerald-500 mt-1">{verifiedKycCount}</div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Wallet Balance Pool</div>
            <div className="text-2xl font-extrabold text-amber-500 mt-1">₹{totalWalletPool.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Sessions</div>
            <div className="text-2xl font-extrabold text-blue-500 mt-1">{activeSessionsCount}</div>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs matching original spec */}
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
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-brandPrimary text-white shadow-md shadow-brandPrimary/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
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
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, username, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active Only' },
              { value: 'Suspended', label: 'Suspended Only' },
              { value: 'Banned', label: 'Banned Only' }
            ]}
            className="w-36"
          />

          <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0 ml-2">
            <Shield className="w-3.5 h-3.5" />
            <span>KYC:</span>
          </div>
          <CustomSelect
            value={kycFilter}
            onChange={(val) => setKycFilter(val)}
            options={[
              { value: 'All', label: 'All KYC' },
              { value: 'Verified', label: 'Verified' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Rejected', label: 'Rejected' }
            ]}
            className="w-36"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-5 py-3.5">Contestant Info</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">KYC Status</th>
                <th className="px-5 py-3.5">Wallet Balance</th>
                <th className="px-5 py-3.5">Device & Location</th>
                <th className="px-5 py-3.5">Referral Shares</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-slate-400 animate-pulse">
                    Querying contestant database...
                  </td>
                </tr>
              ) : filteredContestants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-slate-400">
                    No contestant records matching current search or status filter.
                  </td>
                </tr>
              ) : (
                filteredContestants.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username || u.name}`}
                          alt=""
                          className="w-9 h-9 rounded-full border border-slate-200 dark:border-white/10"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">(@{u.username})</span>
                          </div>
                          <div className="text-[11px] text-slate-400">{u.email} • {u.phone}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        u.status === 'Suspended' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.kycStatus === 'Verified' || u.kycStatus === 'APPROVED' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                        u.kycStatus === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {u.kycStatus}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      ₹{Number(u.walletBalance).toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-[11px] font-medium">{u.device}</div>
                      <div className="text-[10px] text-slate-400">{u.ip}</div>
                    </td>

                    <td className="px-5 py-4 font-bold text-brandPrimary">
                      {u.referrals} Shares ({u.joins} Joins)
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingUser(u)}
                          title="View Contestant Specs"
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditDrawer(u)}
                          title="Edit Profile & Controls"
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          title="Toggle Status"
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Delete Contestant"
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER 1: Add Contestant Drawer */}
      <RightDrawer
        isOpen={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        title="Add New Contestant"
      >
        <form onSubmit={handleCreateContestant} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Username</label>
            <input
              type="text"
              placeholder="e.g. aarav_sharma"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
            <input
              type="email"
              placeholder="e.g. aarav@example.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile Phone</label>
            <input
              type="text"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Initial Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Initial Wallet Credit (₹)</label>
            <input
              type="number"
              placeholder="500"
              value={formData.walletBalance}
              onChange={e => setFormData({ ...formData, walletBalance: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">KYC Status</label>
            <CustomSelect
              value={formData.kycStatus}
              onChange={val => setFormData({ ...formData, kycStatus: val })}
              options={[
                { value: 'Verified', label: 'Verified' },
                { value: 'Pending', label: 'Pending Review' },
                { value: 'Rejected', label: 'Rejected' }
              ]}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddDrawer(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-brandPrimary text-white rounded-xl shadow-lg hover:bg-brandPrimary/90"
            >
              Save Contestant
            </button>
          </div>
        </form>
      </RightDrawer>

      {/* DRAWER 2: View Contestant Specs Drawer */}
      <RightDrawer
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        title="Contestant Profile Specs"
      >
        {viewingUser && (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingUser.username || viewingUser.name}`}
                alt=""
                className="w-14 h-14 rounded-full border border-slate-200 dark:border-white/10"
              />
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{viewingUser.name}</h3>
                <p className="text-xs text-slate-400 font-mono">@{viewingUser.username} • Role: Contestant</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{viewingUser.status}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">KYC: {viewingUser.kycStatus}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                <span className="text-slate-400">User ID:</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{viewingUser.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                <span className="text-slate-400">Email Address:</span>
                <span className="text-slate-900 dark:text-white font-semibold">{viewingUser.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                <span className="text-slate-400">Mobile Phone:</span>
                <span className="text-slate-900 dark:text-white font-semibold">{viewingUser.phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                <span className="text-slate-400">Wallet Balance:</span>
                <span className="font-bold text-amber-500">₹{Number(viewingUser.walletBalance).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                <span className="text-slate-400">Active Device:</span>
                <span className="text-slate-900 dark:text-white">{viewingUser.device}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                <span className="text-slate-400">IP Address:</span>
                <span className="font-mono text-slate-400">{viewingUser.ip}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                <span className="text-slate-400">Referral Code Shares:</span>
                <span className="font-bold text-brandPrimary">{viewingUser.referrals}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                <span className="text-slate-400">Contest Joins:</span>
                <span className="font-bold text-indigo-500">{viewingUser.joins}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  const u = viewingUser;
                  setViewingUser(null);
                  handleOpenEditDrawer(u);
                }}
                className="w-full py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold shadow-lg hover:bg-brandPrimary/90 flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Open Edit Controls Drawer</span>
              </button>
            </div>
          </div>
        )}
      </RightDrawer>

      {/* DRAWER 3: Edit Profile & Admin Controls Drawer */}
      <RightDrawer
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Edit Contestant & Controls"
      >
        {selectedUser && (
          <form onSubmit={handleSaveEditUser} className="space-y-5 text-left">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username || selectedUser.name}`}
                alt=""
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedUser.name}</h4>
                <p className="text-[10px] text-slate-400">ID: {selectedUser.id} • @{selectedUser.username}</p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Display Name</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile Phone</label>
              <input
                type="text"
                value={editFormData.phone}
                onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Account Status</label>
              <CustomSelect
                value={editFormData.status}
                onChange={val => setEditFormData({ ...editFormData, status: val })}
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Suspended', label: 'Suspended' },
                  { value: 'Banned', label: 'Banned' }
                ]}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">KYC Status</label>
              <CustomSelect
                value={editFormData.kycStatus}
                onChange={val => setEditFormData({ ...editFormData, kycStatus: val })}
                options={[
                  { value: 'Verified', label: 'Verified' },
                  { value: 'Pending', label: 'Pending Review' },
                  { value: 'Rejected', label: 'Rejected' }
                ]}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Wallet Balance (₹)</label>
              <input
                type="number"
                value={editFormData.walletBalance}
                onChange={e => setEditFormData({ ...editFormData, walletBalance: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-white/10">
              <label className="block text-[10px] font-bold text-amber-500 uppercase mb-1">Reset Password</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="New password min 6 chars"
                  value={resetPasswordInput}
                  onChange={e => setResetPasswordInput(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleResetPasswordSubmit}
                  className="px-3 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-brandPrimary text-white rounded-xl shadow-lg hover:bg-brandPrimary/90"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </RightDrawer>
    </div>
  );
};

export default UserManagementPage;
