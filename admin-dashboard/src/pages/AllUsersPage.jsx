import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Users, Search, ShieldAlert, UserCheck, Key, Shield, Plus, Edit3, Trash2, Eye,
  Check, X, AlertTriangle, Download, ToggleLeft, ToggleRight, Lock, Unlock, Mail, Phone, RefreshCw, Wallet, Smartphone, Share2
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { CustomSelect } from '../components/CustomSelect';

const MOCK_ALL_USERS = [
  { id: 'USR-101', _id: 'USR-101', name: 'Aarav Sharma', username: 'aarav', email: 'aarav@example.com', phone: '+91 9876543210', status: 'Active', kycStatus: 'Verified', walletBalance: 1450, device: 'iPhone 14 Pro (iOS 17.2)', ip: '103.22.45.12', referrals: 14, joins: 28 },
  { id: 'USR-102', _id: 'USR-102', name: 'Priya Nair', username: 'priya', email: 'priya@example.com', phone: '+91 9812345678', status: 'Suspended', kycStatus: 'Pending', walletBalance: 320, device: 'Samsung S23 (Android 14)', ip: '49.36.12.89', referrals: 3, joins: 12 },
  { id: 'USR-103', _id: 'USR-103', name: 'Rohan Mehta', username: 'rohan', email: 'rohan@example.com', phone: '+91 9765432109', status: 'Banned', kycStatus: 'Rejected', walletBalance: 0, device: 'OnePlus 11 (Android 13)', ip: '157.33.19.4', referrals: 0, joins: 4 },
  { id: 'USR-104', _id: 'USR-104', name: 'Ananya Verma', username: 'ananya', email: 'ananya@example.com', phone: '+91 9988776655', status: 'Active', kycStatus: 'Verified', walletBalance: 2890, device: 'Google Pixel 8 (Android 14)', ip: '103.88.92.11', referrals: 29, joins: 54 },
];

export const AllUsersPage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [kycFilter, setKycFilter] = useState('All');

  // Drawers
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  // Form States
  const [userForm, setUserForm] = useState({ name: '', username: '', email: '', phone: '', role: 'Contestant', password: '', walletBalance: '500', kycStatus: 'Verified', status: 'Active' });
  const [editForm, setEditForm] = useState({ name: '', phone: '', status: 'Active', kycStatus: 'Verified', walletBalance: '0' });

  useEffect(() => {
    fetchUsers();
  }, [isMockMode]);

  const fetchUsers = async () => {
    if (isMockMode) {
      setUsers(MOCK_ALL_USERS);
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
          joins: u.joins || Math.floor(Math.random() * 40)
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.warn('Error fetching all users via API:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.id && u.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    const matchesKyc = kycFilter === 'All' || u.kycStatus === kycFilter;
    return matchesSearch && matchesStatus && matchesKyc;
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) {
      showSnackbar('Please enter Name and Email address.', 'warning');
      return;
    }
    const username = userForm.username || userForm.email.split('@')[0] + Date.now().toString().slice(-3);

    if (!isMockMode) {
      try {
        const payload = { ...userForm, username, role: 'Contestant', walletBalance: Number(userForm.walletBalance) || 0 };
        const res = await axios.post('/api/admin/users', payload, { withCredentials: true });
        if (res.data.success) {
          showSnackbar(`Contestant "${userForm.name}" created successfully!`, 'success');
          fetchUsers();
        }
      } catch (err) {
        showSnackbar(err.response?.data?.message || 'Failed to create contestant.', 'error');
        return;
      }
    } else {
      const newUser = {
        id: `USR-${Date.now().toString().slice(-3)}`,
        _id: `USR-${Date.now().toString().slice(-3)}`,
        ...userForm,
        username,
        walletBalance: Number(userForm.walletBalance) || 0,
        device: 'Web App',
        ip: '127.0.0.1',
        referrals: 0,
        joins: 0
      };
      setUsers([newUser, ...users]);
      showSnackbar(`Contestant "${userForm.name}" created!`, 'success');
    }
    setShowAddDrawer(false);
    setUserForm({ name: '', username: '', email: '', phone: '', role: 'Contestant', password: '', walletBalance: '500', kycStatus: 'Verified', status: 'Active' });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    const id = selectedUser._id || selectedUser.id;

    if (!isMockMode) {
      try {
        const payload = {
          name: editForm.name,
          phone: editForm.phone,
          status: editForm.status,
          kycStatus: editForm.kycStatus,
          walletBalance: Number(editForm.walletBalance) || 0
        };
        await axios.put(`/api/admin/users/${id}`, payload, { withCredentials: true });
        showSnackbar(`Updated contestant profile for "${editForm.name}"`, 'success');
        fetchUsers();
      } catch (err) {
        showSnackbar(err.response?.data?.message || 'Failed to update contestant', 'error');
      }
    } else {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...editForm, walletBalance: Number(editForm.walletBalance) || 0 } : u));
      showSnackbar(`Updated "${editForm.name}" profile`, 'info');
    }
    setSelectedUser(null);
  };

  const handleDeleteUser = (u) => {
    const id = u._id || u.id;
    showConfirm('Delete User', `Permanently delete ${u.name}? This action cannot be undone.`, async () => {
      if (!isMockMode) {
        try {
          await axios.delete(`/api/admin/users/${id}`, { withCredentials: true });
          showSnackbar('User account deleted.', 'success');
          fetchUsers();
        } catch (err) {
          showSnackbar(err.response?.data?.message || 'Failed to delete user.', 'error');
        }
      } else {
        setUsers(users.filter(x => x.id !== u.id));
        showSnackbar('User deleted.', 'info');
      }
    });
  };

  return (
    <div className="p-6 space-y-6 text-left animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-brandPrimary" /> All Platform Contestants
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Overview of all active, suspended, and pending contestant records.</p>
        </div>
        <button
          onClick={() => setShowAddDrawer(true)}
          className="px-4 py-2 bg-brandPrimary text-white rounded-xl text-xs font-bold shadow hover:bg-brandPrimary/90 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Contestant
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contestants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Suspended', label: 'Suspended' },
              { value: 'Banned', label: 'Banned' }
            ]}
            className="w-36"
          />
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

      {/* Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase font-medium border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-5 py-3.5">Contestant</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">KYC Status</th>
                <th className="px-5 py-3.5">Wallet Balance</th>
                <th className="px-5 py-3.5">Device & IP</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-400">@{u.username} • {u.email}</div>
                  </td>
                  <td className="px-5 py-4 font-bold">{u.status}</td>
                  <td className="px-5 py-4 font-bold text-blue-500">{u.kycStatus}</td>
                  <td className="px-5 py-4 font-bold text-amber-500">₹{Number(u.walletBalance).toLocaleString()}</td>
                  <td className="px-5 py-4">{u.device}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => setViewingUser(u)} className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg mr-1 cursor-pointer"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { setSelectedUser(u); setEditForm({ name: u.name, phone: u.phone, status: u.status, kycStatus: u.kycStatus, walletBalance: String(u.walletBalance) }); }} className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg mr-1 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteUser(u)} className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Drawer */}
      <RightDrawer isOpen={showAddDrawer} onClose={() => setShowAddDrawer(false)} title="Add Contestant Account">
        <form onSubmit={handleCreateUser} className="space-y-4 text-left">
          <input type="text" placeholder="Full Name" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-xs text-slate-900 dark:text-white" />
          <input type="text" placeholder="Username" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-xs text-slate-900 dark:text-white" />
          <input type="email" placeholder="Email Address" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-xs text-slate-900 dark:text-white" />
          <input type="text" placeholder="Mobile Phone" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-xs text-slate-900 dark:text-white" />
          <input type="password" placeholder="Password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-xs text-slate-900 dark:text-white" />
          <input type="number" placeholder="Initial Wallet Balance" value={userForm.walletBalance} onChange={e => setUserForm({ ...userForm, walletBalance: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-xs text-slate-900 dark:text-white" />
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowAddDrawer(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button><button type="submit" className="px-4 py-2 text-xs bg-brandPrimary text-white rounded-xl font-bold">Create Contestant</button></div>
        </form>
      </RightDrawer>

      {/* Edit Drawer */}
      <RightDrawer isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Edit Contestant Controls">
        {selectedUser && (
          <form onSubmit={handleUpdateUser} className="space-y-4 text-left">
            <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-xs text-slate-900 dark:text-white" />
            <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-xs text-slate-900 dark:text-white" />
            <CustomSelect value={editForm.status} onChange={val => setEditForm({ ...editForm, status: val })} options={[{ value: 'Active', label: 'Active' }, { value: 'Suspended', label: 'Suspended' }, { value: 'Banned', label: 'Banned' }]} />
            <CustomSelect value={editForm.kycStatus} onChange={val => setEditForm({ ...editForm, kycStatus: val })} options={[{ value: 'Verified', label: 'Verified' }, { value: 'Pending', label: 'Pending' }, { value: 'Rejected', label: 'Rejected' }]} />
            <input type="number" value={editForm.walletBalance} onChange={e => setEditForm({ ...editForm, walletBalance: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-xs text-slate-900 dark:text-white" />
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setSelectedUser(null)} className="px-4 py-2 text-xs text-slate-400">Cancel</button><button type="submit" className="px-4 py-2 text-xs bg-brandPrimary text-white rounded-xl font-bold">Save Changes</button></div>
          </form>
        )}
      </RightDrawer>

      {/* View Drawer */}
      <RightDrawer isOpen={!!viewingUser} onClose={() => setViewingUser(null)} title="Contestant Specs">
        {viewingUser && (
          <div className="space-y-3 text-xs text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewingUser.name}</h3>
            <p className="text-slate-400">@{viewingUser.username} • {viewingUser.email}</p>
            <p className="text-slate-400">Phone: {viewingUser.phone}</p>
            <p className="font-bold text-amber-500">Wallet: ₹{Number(viewingUser.walletBalance).toLocaleString()}</p>
            <p className="text-slate-400">Device: {viewingUser.device} ({viewingUser.ip})</p>
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default AllUsersPage;
