import React, { useState } from 'react';
import {
  Users, Search, ShieldAlert, UserCheck, Key, Shield, Plus, Edit3, Trash2, Eye,
  Check, X, AlertTriangle, Download, ToggleLeft, ToggleRight, Filter, Lock, Unlock, Mail, Phone
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

const INITIAL_USERS = [
  { id: 'USR-101', name: 'Aarav Sharma', email: 'aarav@example.com', phone: '+91 9876543210', role: 'Contestant', status: 'Active', kyc: 'Verified', balance: 1450, device: 'iPhone 14 Pro (iOS 17.2)', ip: '103.22.45.12', joined: '2026-01-15' },
  { id: 'USR-102', name: 'Priya Nair', email: 'priya@example.com', phone: '+91 9812345678', role: 'Contestant', status: 'Suspended', kyc: 'Pending', balance: 320, device: 'Samsung S23 (Android 14)', ip: '49.36.12.89', joined: '2026-02-01' },
  { id: 'USR-103', name: 'Rohan Mehta', email: 'rohan@example.com', phone: '+91 9765432109', role: 'Contestant', status: 'Banned', kyc: 'Rejected', balance: 0, device: 'OnePlus 11 (Android 13)', ip: '157.33.19.4', joined: '2026-03-10' },
  { id: 'USR-104', name: 'Ananya Verma', email: 'ananya@example.com', phone: '+91 9988776655', role: 'Contestant', status: 'Active', kyc: 'Verified', balance: 2890, device: 'Google Pixel 8 (Android 14)', ip: '103.88.92.11', joined: '2026-03-22' }
];

export const AllUsersPage = () => {
  const { showSnackbar } = useAlert();
  const [users, setUsers] = useState(INITIAL_USERS);
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

  // Filtering
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.phone.includes(searchTerm) ||
                          u.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleCreateUser = () => {
    if (!userForm.name || !userForm.email) {
      showSnackbar('Please enter Name and Email', 'warning');
      return;
    }
    const newUser = {
      id: `USR-${Date.now().toString().slice(-3)}`,
      ...userForm,
      kyc: 'Pending',
      balance: 0,
      device: 'Web Client',
      ip: '127.0.0.1',
      joined: new Date().toISOString().split('T')[0]
    };
    setUsers([newUser, ...users]);
    setShowAddModal(false);
    setUserForm({ name: '', email: '', phone: '', role: 'Contestant', password: '', status: 'Active' });
    showSnackbar(`User "${newUser.name}" created successfully!`, 'success');
  };

  const handleUpdateUser = () => {
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...userForm } : u));
    setShowEditModal(false);
    setSelectedUser(null);
    showSnackbar(`User profile updated for "${userForm.name}"`, 'success');
  };

  const handleDeleteUser = () => {
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setShowDeleteModal(false);
    showSnackbar(`User "${selectedUser.name}" deleted.`, 'info');
    setSelectedUser(null);
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    showSnackbar(`Status for ${user.name} changed to ${newStatus}`, 'info');
  };

  const executeActionModal = () => {
    if (showActionModal === 'Suspend') {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'Suspended' } : u));
      showSnackbar(`User ${selectedUser.name} suspended (Reason: ${suspendReason})`, 'warning');
    } else if (showActionModal === 'Ban') {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'Banned' } : u));
      showSnackbar(`User ${selectedUser.name} banned & IP blocked`, 'error');
    } else if (showActionModal === 'Verify') {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, kyc: 'Verified' } : u));
      showSnackbar(`KYC verification completed for ${selectedUser.name}`, 'success');
    } else if (showActionModal === 'Reset Password') {
      showSnackbar(`Password reset successfully for ${selectedUser.name}`, 'success');
    }
    setShowActionModal(null);
    setSelectedUser(null);
  };

  const exportCSV = () => {
    showSnackbar('Exporting User Directory to CSV...', 'success');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-brandPrimary" /> All Users Directory & Controls
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Add, Edit, View, Delete, Suspend, Ban, Verify KYC & Reset Password for platform users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-200"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => {
              setUserForm({ name: '', email: '', phone: '', role: 'Contestant', password: '', status: 'Active' });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-brandPrimary text-white font-semibold text-xs rounded-xl shadow-md hover:bg-brandPrimary/90"
          >
            <Plus className="w-4 h-4" /> Add New User
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-semibold">Status:</span>
          {['All', 'Active', 'Suspended', 'Banned'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-brandPrimary text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-5 py-3.5">User Info</th>
                <th className="px-5 py-3.5">Phone & Joined</th>
                <th className="px-5 py-3.5">Account Status</th>
                <th className="px-5 py-3.5">KYC Status</th>
                <th className="px-5 py-3.5">Active Toggle</th>
                <th className="px-5 py-3.5 text-right">Actions (View/Edit/Suspend/Ban/Verify/Reset/Delete)</th>
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
                    <div className="font-medium text-slate-800 dark:text-slate-200">{user.phone}</div>
                    <div className="text-[10px] text-slate-400">{user.joined}</div>
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
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggleStatus(user)} className="flex items-center gap-1 font-bold text-xs">
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
                        title="View Profile"
                        className="p-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setUserForm({ name: user.name, email: user.email, phone: user.phone, role: user.role, status: user.status });
                          setShowEditModal(true);
                        }}
                        title="Edit User"
                        className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {/* Verify */}
                      <button
                        onClick={() => { setSelectedUser(user); setShowActionModal('Verify'); }}
                        title="Verify KYC"
                        className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                      {/* Reset Password */}
                      <button
                        onClick={() => { setSelectedUser(user); setShowActionModal('Reset Password'); }}
                        title="Reset Password"
                        className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg hover:bg-indigo-500/20"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      {/* Suspend */}
                      <button
                        onClick={() => { setSelectedUser(user); setShowActionModal('Suspend'); }}
                        title="Suspend Account"
                        className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                      {/* Ban */}
                      <button
                        onClick={() => { setSelectedUser(user); setShowActionModal('Ban'); }}
                        title="Ban Account & IP"
                        className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                        title="Delete User"
                        className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20"
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New User</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vikramaditya Singh"
                  value={userForm.name}
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="vikram@example.com"
                  value={userForm.email}
                  onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={userForm.phone}
                  onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={userForm.password}
                  onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs text-slate-400 font-semibold">Cancel</button>
              <button onClick={handleCreateUser} className="px-4 py-2 text-xs font-semibold bg-brandPrimary text-white rounded-xl">Create User</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit User - {selectedUser.id}</h3>
              <button onClick={() => setShowEditModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  value={userForm.phone}
                  onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-xs text-slate-400 font-semibold">Cancel</button>
              <button onClick={handleUpdateUser} className="px-4 py-2 text-xs font-semibold bg-brandPrimary text-white rounded-xl">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Profile Details</h3>
              <button onClick={() => setShowViewModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400">User ID</span>
                <div className="font-bold text-slate-800 dark:text-white">{selectedUser.id}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400">Full Name</span>
                <div className="font-bold text-slate-800 dark:text-white">{selectedUser.name}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400">Email</span>
                <div className="font-bold text-slate-800 dark:text-white">{selectedUser.email}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400">Phone</span>
                <div className="font-bold text-slate-800 dark:text-white">{selectedUser.phone}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400">Wallet Balance</span>
                <div className="font-bold text-emerald-500">₹{selectedUser.balance}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400">Device & IP</span>
                <div className="font-bold text-slate-800 dark:text-white">{selectedUser.device}</div>
                <div className="text-[10px] text-slate-400">{selectedUser.ip}</div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 text-xs font-semibold bg-brandPrimary text-white rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-rose-500">Confirm User Deletion</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to permanently delete user <strong>{selectedUser.name} ({selectedUser.email})</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-xs text-slate-400 font-semibold">Cancel</button>
              <button onClick={handleDeleteUser} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl">Delete User</button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Suspend, Ban, Verify, Reset Password) */}
      {showActionModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{showActionModal} User - {selectedUser.name}</h3>
            
            {showActionModal === 'Suspend' && (
              <div className="space-y-2 text-xs">
                <label className="block text-slate-400 font-semibold">Select Reason for Suspension:</label>
                <select
                  value={suspendReason}
                  onChange={e => setSuspendReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                >
                  <option value="Terms Violation">Terms of Service Violation</option>
                  <option value="Abusive Behavior">Abusive Behavior in Contests</option>
                  <option value="Suspicious Activity">Suspicious Activity / Multi-Account</option>
                </select>
              </div>
            )}

            {showActionModal === 'Reset Password' && (
              <div className="space-y-2 text-xs">
                <label className="block text-slate-400 font-semibold">Enter New Password (or send reset email):</label>
                <input
                  type="password"
                  placeholder="New password..."
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            )}

            {(showActionModal === 'Ban' || showActionModal === 'Verify') && (
              <p className="text-xs text-slate-400">
                Proceeding will mark user <strong>{selectedUser.name}</strong> as <strong>{showActionModal}</strong>.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowActionModal(null)} className="px-4 py-2 text-xs text-slate-400 font-semibold">Cancel</button>
              <button onClick={executeActionModal} className="px-4 py-2 text-xs font-semibold bg-brandPrimary text-white rounded-xl">Confirm {showActionModal}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AllUsersPage;
