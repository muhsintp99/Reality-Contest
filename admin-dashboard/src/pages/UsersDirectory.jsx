import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { CustomSelect } from '../components/CustomSelect';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { 
  Users, UserPlus, ShieldAlert, Check, ToggleLeft, ToggleRight, 
  Trash2, Search, Eye, X, Mail, Phone, Lock, Sparkles, ChevronLeft, ChevronRight, Filter, Settings
} from 'lucide-react';

const PAGE_SIZE = 5;

export const UsersDirectory = () => {
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // Only Super Admin can manage Admins. Normal Admins cannot see/manage Admin accounts.
  const availableTabs = currentUser?.role === 'Super Admin'
    ? ['Admin', 'Contestant', 'Judge', 'Sponsor']
    : ['Contestant', 'Judge', 'Sponsor'];

  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Active, Suspended
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create User Form fields
  const [createName, setCreateName] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState('Contestant');
  const [createError, setCreateError] = useState('');

  // Edit User Form fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('');

  const canManageSelected = currentUser?.role === 'Super Admin' || !['Admin', 'Super Admin'].includes(selectedUser?.role);

  const fetchUsers = async (roleName) => {
    setLoading(true);
    setUsers([]); // Clear users immediately when starting a new fetch
    try {
      const res = await axios.get(`/api/admin/users/${roleName}`, { withCredentials: true });
      if (res.data.success) {
        // Double-check: filter out current user on client-side just in case
        const filteredList = (res.data.users || [])
          .filter(u => u._id !== currentUser?._id)
          .filter(u => u.role !== 'Super Admin');
        setUsers(filteredList);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]); // Clear users on error to avoid showing stale data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role && !activeTab) {
      setActiveTab(currentUser.role === 'Super Admin' ? 'Admin' : 'Contestant');
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
    if (activeTab) {
      fetchUsers(activeTab);
    }
  }, [activeTab]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');
    try {
      const payload = {
        name: createName,
        username: createUsername,
        email: createEmail,
        phone: createPhone,
        password: createPassword,
        role: createRole
      };
      const res = await axios.post('/api/admin/users', payload, { withCredentials: true });
      if (res.data.success) {
        showSnackbar(res.data.message, 'success');
        setShowCreateModal(false);
        setCreateName('');
        setCreateUsername('');
        setCreateEmail('');
        setCreatePhone('');
        setCreatePassword('');
        setCreateRole(activeTab);
        if (activeTab === createRole) {
          fetchUsers(activeTab);
        } else {
          setActiveTab(createRole);
        }
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create user.');
    }
  };

  const handleUpdateUser = async (userId) => {
    // Rule 11 check
    if (userId === currentUser?._id) {
      showAlert('Action blocked: You cannot edit your own profile here.', 'error');
      return;
    }
    try {
      const payload = {
        name: editName,
        phone: editPhone,
        role: editRole
      };
      const res = await axios.put(`/api/admin/users/${userId}`, payload, { withCredentials: true });
      if (res.data.success) {
        showSnackbar('User details updated successfully.', 'success');
        setSelectedUser(null);
        fetchUsers(activeTab);
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to update user.', 'error');
    }
  };

  const handleToggleStatus = async (userToToggle) => {
    // Rule 11 check
    if (userToToggle._id === currentUser?._id) {
      showAlert('Action blocked: You cannot suspend your own account.', 'error');
      return;
    }
    showConfirm('Suspend User', `Are you sure you want to change the status for ${userToToggle.name}?`, async () => {
      try {
        const res = await axios.put(`/api/admin/users/${userToToggle._id}/status`, {}, { withCredentials: true });
        if (res.data.success) {
          const updatedUser = res.data.user;
          showSnackbar(`User is now ${updatedUser.status}.`, 'success');
          setSelectedUser(prev => prev ? { ...prev, status: updatedUser.status } : null);
          fetchUsers(activeTab);
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to change status.', 'error');
      }
    });
  };

  const handleDeleteUser = async (userId) => {
    // Rule 11 check
    if (userId === currentUser?._id) {
      showAlert('Action blocked: You cannot delete your own account.', 'error');
      return;
    }
    showConfirm('Delete User', 'Are you sure you want to permanently delete this user account? This cannot be undone.', async () => {
      try {
        const res = await axios.delete(`/api/admin/users/${userId}`, { withCredentials: true });
        if (res.data.success) {
          showSnackbar(res.data.message, 'success');
          setSelectedUser(null);
          fetchUsers(activeTab);
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to delete user.', 'error');
      }
    });
  };

  // Rule 2 & 12: Filtering list dynamically (excluding logged-in user)
  const filteredAndStatusList = users
    .filter(u => u._id !== currentUser?._id)
    .filter(u => u.role === activeTab) // Strictly enforce role match for the current tab
    .filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                            u.email.toLowerCase().includes(search.toLowerCase()) ||
                            u.username.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' ? true : u.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt || b._id).getTime() - new Date(a.createdAt || a._id).getTime());

  // Rule 12: Pagination details
  const totalPages = Math.ceil(filteredAndStatusList.length / PAGE_SIZE) || 1;
  const currentOffsetIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedUsersList = filteredAndStatusList.slice(currentOffsetIndex, currentOffsetIndex + PAGE_SIZE);

  if (!activeTab || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-pulse">
        <div className="flex flex-col items-center gap-3 text-white/50">
          <div className="w-8 h-8 border-2 border-brandPrimary/30 border-t-brandPrimary rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-widest">Initializing Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-poppins text-white">
            {activeTab} Management Page
          </h2>
          <p className="text-xs text-white/50">Browse, edit, search, and perform administrative actions on {activeTab} accounts.</p>
        </div>
        <button
          onClick={() => {
            setCreateRole(activeTab);
            setShowCreateModal(true);
          }}
          className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-semibold hover:bg-brandPrimary/90 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create User Account</span>
        </button>
      </div>

      {/* Separation Tab Selector */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
        {availableTabs.map(role => (
          <button
            key={role}
            onClick={() => {
              setActiveTab(role);
              setStatusFilter('All');
              setSearch('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === role
                ? 'bg-brandPrimary/15 border border-brandPrimary/20 text-brandPrimary shadow-md'
                : 'hover:bg-white/5 text-white/60 hover:text-white border border-transparent'
            }`}
          >
            {role} Management
          </button>
        ))}
      </div>

      {/* Search, Filter, and Status Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder={`Search ${activeTab}s...`}
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brandPrimary/50"
          />
        </div>

        {/* Rule 12: Status Filter Option */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-white/40 shrink-0" />
          <CustomSelect
            value={statusFilter}
            onChange={val => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active Only' },
              { value: 'Suspended', label: 'Suspended Only' }
            ]}
            className="w-40"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="glassmorphism rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5 shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-white/40">Querying user records...</div>
        ) : paginatedUsersList.length === 0 ? (
          <div className="p-12 text-center text-xs text-white/40">No {activeTab} profiles found matching filters.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-white/5 text-white/50 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Role Badge</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {paginatedUsersList.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                        <img 
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} 
                          className="w-6 h-6 rounded-full border border-white/10" 
                          alt="" 
                        />
                        <span>{u.name}</span>
                      </td>
                      <td className="px-6 py-4 text-white/60 font-mono">@{u.username}</td>
                      <td className="px-6 py-4 text-white/60">{u.email}</td>
                      <td className="px-6 py-4 text-white/60">{u.phone}</td>
                      <td className="px-6 py-4">
                        <span className="bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${u.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                          }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setEditName(u.name);
                            setEditEmail(u.email);
                            setEditPhone(u.phone);
                            setEditRole(u.role);
                          }}
                          title="Manage User"
                          className="p-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-full transition-all"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          title="Delete User"
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rule 12: Pagination controls */}
            <div className="p-4 flex items-center justify-between text-xs text-white/50">
              <span>Showing {currentOffsetIndex + 1}-{Math.min(currentOffsetIndex + PAGE_SIZE, filteredAndStatusList.length)} of {filteredAndStatusList.length} users</span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 font-semibold text-white">Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Drawer: Create User */}
      <RightDrawer
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create User Account"
      >

            {createError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-6">
              
              <div>
                <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Account Details</div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="Aarav Sharma"
                      className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={createUsername}
                      onChange={(e) => setCreateUsername(e.target.value)}
                      placeholder="aarav"
                      className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                      placeholder="aarav@domain.com"
                      className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      required
                      value={createPhone}
                      onChange={(e) => setCreatePhone(e.target.value)}
                      placeholder="+9199..."
                      className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Security & Roles</div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Initial Password</label>
                    <input
                      type="password"
                      required
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Account Role</label>
                    <CustomSelect
                      value={createRole}
                      onChange={setCreateRole}
                      options={currentUser?.role === 'Super Admin' ? [
                        { value: 'Admin', label: 'Admin' },
                        { value: 'Sponsor', label: 'Sponsor' },
                        { value: 'Judge', label: 'Judge' },
                        { value: 'Contestant', label: 'Contestant' }
                      ] : [
                        { value: 'Sponsor', label: 'Sponsor' },
                        { value: 'Judge', label: 'Judge' },
                        { value: 'Contestant', label: 'Contestant' }
                      ]}
                      position="top"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all mt-4 flex justify-center items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publish New Account</span>
              </button>
            </form>
      </RightDrawer>

      {/* Drawer: Manage/Details */}
      <RightDrawer
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Manage User Account"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`} 
                className="w-10 h-10 rounded-full border border-white/10" 
                alt="" 
              />
              <div>
                <h3 className="text-base font-extrabold text-white font-poppins">{selectedUser.name}</h3>
                <p className="text-[10px] text-white/40">@{selectedUser.username} • Role: {selectedUser.role}</p>
              </div>
            </div>

            {/* Read-only User Details */}
            <div className="bg-[#080b12] p-4 rounded-xl border border-white/5 space-y-3">
              <span className="text-[10px] text-brandPrimary uppercase font-extrabold tracking-wider block">User Information</span>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                   <p className="text-white/40 uppercase font-bold text-[9px] mb-0.5">Email Address</p>
                   <p className="text-white truncate" title={selectedUser.email}>{selectedUser.email}</p>
                </div>
                <div>
                   <p className="text-white/40 uppercase font-bold text-[9px] mb-0.5">Mobile Phone</p>
                   <p className="text-white truncate">{selectedUser.phone}</p>
                </div>
                <div>
                   <p className="text-white/40 uppercase font-bold text-[9px] mb-0.5">Current Role</p>
                   <p className="text-white">{selectedUser.role}</p>
                </div>
                <div>
                   <p className="text-white/40 uppercase font-bold text-[9px] mb-0.5">Account Status</p>
                   <p className={`font-bold ${selectedUser.status === 'Active' ? 'text-emerald-400' : 'text-red-400'}`}>
                     {selectedUser.status}
                   </p>
                </div>
              </div>
            </div>

            {/* Rule 3 & 11: Block self actions on UI completely */}
            {selectedUser._id === currentUser?._id ? (
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl space-y-2 text-center">
                <ShieldAlert className="w-6 h-6 text-red-500 mx-auto" />
                <h4 className="text-xs font-bold text-white">Self-Modification Blocked</h4>
                <p className="text-[10px] text-white/50">
                  You cannot update, suspend, or delete your own logged-in user profile from this directory page.
                </p>
              </div>
            ) : canManageSelected ? (
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4 mt-2">Account Settings</div>
                
                {/* Form fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Username (Uneditable)</label>
                    <input
                      type="text"
                      value={selectedUser?.username || ''}
                      disabled
                      className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/50 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Email Address (Uneditable)</label>
                    <input
                      type="email"
                      value={editEmail}
                      disabled
                      className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/50 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Display Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Override Role</label>
                  <CustomSelect
                    value={editRole}
                      onChange={setEditRole}
                      options={currentUser?.role === 'Super Admin' ? [
                        { value: 'Admin', label: 'Admin' },
                        { value: 'Sponsor', label: 'Sponsor' },
                        { value: 'Judge', label: 'Judge' },
                        { value: 'Contestant', label: 'Contestant' }
                      ] : [
                        { value: 'Sponsor', label: 'Sponsor' },
                        { value: 'Judge', label: 'Judge' },
                        { value: 'Contestant', label: 'Contestant' }
                      ]}
                      position="top"
                    />
                  </div>

                {/* Save and Controls */}
                <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4 mt-8">Administrative Actions</div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleUpdateUser(selectedUser._id)}
                    disabled={updateSubmitting}
                    className="py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => handleToggleStatus(selectedUser._id, selectedUser.status)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedUser.status === 'Active'
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    {selectedUser.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl space-y-2 text-center">
                <ShieldAlert className="w-6 h-6 text-red-500 mx-auto" />
                <h4 className="text-xs font-bold text-white">Privileged Override Blocked</h4>
                <p className="text-[10px] text-white/50">
                  As an Admin, you do not have permission to manage other administrators.
                </p>
              </div>
            )}
          </div>
        )}
      </RightDrawer>

    </div>
  );
};

export default UsersDirectory;
