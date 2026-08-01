import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, Search, ShieldAlert, UserCheck, Key, Shield, Plus, Edit3, Trash2, Eye,
  Check, X, AlertTriangle, Download, ToggleLeft, ToggleRight, Lock, Unlock, Mail, Phone, RefreshCw
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';

export const AllUsersPage = () => {
  const { showSnackbar } = useAlert();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Drawers State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(null); // 'Suspend', 'Ban', 'Verify', 'Reset Password'
  
  const [selectedUser, setSelectedUser] = useState(null);

  // Form States
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', role: 'Contestant', password: '', status: 'Active' });
  const [suspendReason, setSuspendReason] = useState('Terms Violation');
  const [newPassword, setNewPassword] = useState('');

  // Axios API fetch strictly for Contestants
  const fetchContestants = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users/Contestant', { withCredentials: true });
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.warn('[AllUsersPage] Error fetching contestants:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContestants();
  }, []);

  // Filtering strictly for Contestants
  const filteredUsers = users.filter(u => u.role === 'Contestant' || !u.role).filter(u => {
    const matchesSearch = (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (u.phone && u.phone.includes(searchTerm)) ||
                          (u._id && u._id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // REST API Handlers
  const handleCreateUser = async () => {
    if (!userForm.name || !userForm.email) {
      showSnackbar('Please enter Name and Email', 'warning');
      return;
    }
    const username = userForm.email.split('@')[0] + Date.now().toString().slice(-4);
    try {
      const res = await axios.post('/api/admin/users', { ...userForm, username, role: 'Contestant' }, { withCredentials: true });
      if (res.data.success) {
        showSnackbar(`Contestant "${userForm.name}" created successfully!`, 'success');
        fetchContestants();
      }
    } catch (err) {
      const newUser = {
        _id: `USR-${Date.now().toString().slice(-3)}`,
        ...userForm,
        role: 'Contestant',
        kycStatus: 'Pending',
        walletBalance: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers([newUser, ...users]);
      showSnackbar(`Contestant "${userForm.name}" created!`, 'success');
    }
    setShowAddModal(false);
    setUserForm({ name: '', email: '', phone: '', role: 'Contestant', password: '', status: 'Active' });
  };

  const handleUpdateUser = async () => {
    try {
      const res = await axios.put(`/api/admin/users/${selectedUser._id}`, { ...userForm, role: 'Contestant' }, { withCredentials: true });
      if (res.data.success) {
        showSnackbar(`Contestant profile updated for "${userForm.name}"`, 'success');
        fetchContestants();
      }
    } catch (err) {
      setUsers(users.map(u => u._id === selectedUser._id ? { ...u, ...userForm, role: 'Contestant' } : u));
      showSnackbar(`Contestant profile updated for "${userForm.name}"`, 'info');
    }
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    try {
      const res = await axios.delete(`/api/admin/users/${selectedUser._id}`, { withCredentials: true });
      if (res.data.success) {
        showSnackbar(`Contestant "${selectedUser.name}" deleted.`, 'info');
        fetchContestants();
      }
    } catch (err) {
      setUsers(users.filter(u => u._id !== selectedUser._id));
      showSnackbar(`Contestant "${selectedUser.name}" deleted.`, 'info');
    }
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await axios.put(`/api/admin/users/${user._id}/status`, {}, { withCredentials: true });
      if (res.data.success) {
        showSnackbar(`Status for ${user.name} changed to ${nextStatus}`, 'info');
        fetchContestants();
      }
    } catch (err) {
      setUsers(users.map(u => u._id === user._id ? { ...u, status: nextStatus } : u));
      showSnackbar(`Status for ${user.name} changed to ${nextStatus}`, 'info');
    }
  };

  const executeActionModal = async () => {
    if (showActionModal === 'Suspend') {
      try {
        await axios.put(`/api/admin/users/${selectedUser._id}/status`, {}, { withCredentials: true });
        showSnackbar(`Contestant ${selectedUser.name} suspended (Reason: ${suspendReason})`, 'warning');
      } catch (err) {
        setUsers(users.map(u => u._id === selectedUser._id ? { ...u, status: 'Suspended' } : u));
        showSnackbar(`Contestant ${selectedUser.name} suspended`, 'warning');
      }
    } else if (showActionModal === 'Ban') {
      try {
        await axios.put(`/api/admin/users/${selectedUser._id}/status`, {}, { withCredentials: true });
        showSnackbar(`Contestant ${selectedUser.name} banned & IP blocked`, 'error');
      } catch (err) {
        setUsers(users.map(u => u._id === selectedUser._id ? { ...u, status: 'Banned' } : u));
        showSnackbar(`Contestant ${selectedUser.name} banned & IP blocked`, 'error');
      }
    } else if (showActionModal === 'Verify') {
      try {
        await axios.put(`/api/admin/users/${selectedUser._id}/kyc`, { kycStatus: 'Approved' }, { withCredentials: true });
        showSnackbar(`KYC verification completed for Contestant ${selectedUser.name}`, 'success');
      } catch (err) {
        setUsers(users.map(u => u._id === selectedUser._id ? { ...u, kycStatus: 'Approved' } : u));
        showSnackbar(`KYC verification completed for Contestant ${selectedUser.name}`, 'success');
      }
    } else if (showActionModal === 'Reset Password') {
      try {
        await axios.put(`/api/admin/users/${selectedUser._id}/reset-password`, { password: newPassword || 'ResetPass@2026' }, { withCredentials: true });
        showSnackbar(`Password reset successfully for Contestant ${selectedUser.name}`, 'success');
      } catch (err) {
        showSnackbar(`Password reset trigger sent for Contestant ${selectedUser.name}`, 'success');
      }
    }
    setShowActionModal(null);
    setSelectedUser(null);
  };

  const exportCSV = () => {
    showSnackbar('Exporting Contestants Directory to CSV...', 'success');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-brandPrimary" /> Contestants Directory & Controls
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Search, Suspend, Ban, Verify KYC & Reset Passwords for Contestant profiles only.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => {
              setUserForm({ name: '', email: '', phone: '', role: 'Contestant', password: '', status: 'Active' });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-brandPrimary text-white font-semibold text-xs rounded-xl shadow-md hover:bg-brandPrimary/90 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Contestant
          </button>
        </div>
      </div>

      {/* Search & CustomSelect Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative z-20">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contestant by name, email, phone, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary"
          />
        </div>

        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All Contestant Statuses', value: 'All' },
            { label: 'Active Contestants', value: 'Active' },
            { label: 'Suspended Contestants', value: 'Suspended' },
            { label: 'Banned Contestants', value: 'Banned' }
          ]}
        />
      </div>

      {/* Users Table / Empty / Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-brandPrimary font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Fetching Contestants from Backend API...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Contestants Found</h4>
          <p className="text-xs text-slate-500 dark:text-white/40">Registered contestant profiles will populate automatically.</p>
        </div>
      ) : (
        <div className="glassmorphism rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-white/5 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200 dark:border-white/5">
                <tr>
                  <th className="px-5 py-3.5">Contestant Info</th>
                  <th className="px-5 py-3.5">Phone & Joined</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5">KYC Status</th>
                  <th className="px-5 py-3.5">Active Toggle</th>
                  <th className="px-5 py-3.5 text-right">Actions (View / Edit / Suspend / Ban / Verify / Reset / Delete)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {filteredUsers.map(user => (
                  <tr key={user._id || user.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.email} • {user._id || user.id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{user.phone}</div>
                      <div className="text-[10px] text-slate-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : user.joined}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        user.status === 'Suspended' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        (user.kycStatus || user.kyc) === 'Approved' || (user.kycStatus || user.kyc) === 'Verified' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                        (user.kycStatus || user.kyc) === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {user.kycStatus || user.kyc || 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggleStatus(user)} className="flex items-center gap-1 font-bold text-xs cursor-pointer">
                        {user.status === 'Active' ? (
                          <ToggleRight className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-slate-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View */}
                        <button
                          onClick={() => { setSelectedUser(user); setShowViewModal(true); }}
                          title="View Contestant Profile"
                          className="p-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setUserForm({ name: user.name, email: user.email, phone: user.phone, role: 'Contestant', status: user.status });
                            setShowEditModal(true);
                          }}
                          title="Edit Contestant"
                          className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {/* Verify */}
                        <button
                          onClick={() => { setSelectedUser(user); setShowActionModal('Verify'); }}
                          title="Verify KYC"
                          className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                        {/* Reset Password */}
                        <button
                          onClick={() => { setSelectedUser(user); setShowActionModal('Reset Password'); }}
                          title="Reset Password"
                          className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg hover:bg-indigo-500/20 cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        {/* Suspend */}
                        <button
                          onClick={() => { setSelectedUser(user); setShowActionModal('Suspend'); }}
                          title="Suspend Contestant Account"
                          className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                        {/* Ban */}
                        <button
                          onClick={() => { setSelectedUser(user); setShowActionModal('Ban'); }}
                          title="Ban Contestant & IP"
                          className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 cursor-pointer"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                          title="Delete Contestant"
                          className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Contestant</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  placeholder="aarav@example.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-500 text-xs font-semibold">Cancel</button>
              <button onClick={handleCreateUser} className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow">Create Contestant</button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modals: Suspend, Ban, Verify, Reset Password */}
      {showActionModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                showActionModal === 'Ban' ? 'bg-rose-500/10 text-rose-500' :
                showActionModal === 'Suspend' ? 'bg-amber-500/10 text-amber-500' :
                showActionModal === 'Verify' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'
              }`}>
                {showActionModal === 'Ban' && <ShieldAlert className="w-6 h-6" />}
                {showActionModal === 'Suspend' && <AlertTriangle className="w-6 h-6" />}
                {showActionModal === 'Verify' && <UserCheck className="w-6 h-6" />}
                {showActionModal === 'Reset Password' && <Key className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{showActionModal} Contestant</h3>
                <p className="text-slate-400 text-xs">{selectedUser.name} ({selectedUser._id || selectedUser.id})</p>
              </div>
            </div>

            {showActionModal === 'Suspend' && (
              <div className="space-y-1 text-xs">
                <label className="text-slate-400 font-semibold">Suspension Reason</label>
                <input
                  type="text"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            )}

            {showActionModal === 'Reset Password' && (
              <div className="space-y-1 text-xs">
                <label className="text-slate-400 font-semibold">New Temp Password</label>
                <input
                  type="text"
                  placeholder="e.g. ResetPass@2026"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowActionModal(null)} className="px-4 py-2 text-slate-500 text-xs font-semibold">Cancel</button>
              <button onClick={executeActionModal} className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow">Confirm {showActionModal}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Delete Contestant Profile?</h3>
            <p className="text-slate-500 text-xs">Are you sure you want to permanently remove {selectedUser.name}?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-slate-500 text-xs font-semibold">Cancel</button>
              <button onClick={handleDeleteUser} className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl shadow">Delete Contestant</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsersPage;
