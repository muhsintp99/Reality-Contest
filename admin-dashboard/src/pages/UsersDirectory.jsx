import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Users, UserPlus, ShieldAlert, Check, ToggleLeft, ToggleRight, 
  Trash2, Search, Eye, X, Mail, Phone, Lock, Sparkles, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';

const PAGE_SIZE = 5;

export const UsersDirectory = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // Rule 9: Create separate management tabs for each role, showing Super Admin only to Super Admins
  const availableTabs = currentUser?.role === 'Super Admin'
    ? ['Super Admin', 'Admin', 'Contestant', 'Judge', 'Sponsor']
    : ['Admin', 'Contestant', 'Judge', 'Sponsor'];

  const [activeTab, setActiveTab] = useState(availableTabs[0]);
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

  const fetchUsers = async (roleName) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/users/${roleName}`, { withCredentials: true });
      if (res.data.success) {
        // Double-check: filter out current user on client-side just in case
        const filteredList = (res.data.users || []).filter(u => u._id !== currentUser?._id);
        setUsers(filteredList);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(activeTab);
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
        alert(res.data.message);
        setShowCreateModal(false);
        setCreateName('');
        setCreateUsername('');
        setCreateEmail('');
        setCreatePhone('');
        setCreatePassword('');
        setCreateRole('Contestant');
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
      alert('Action blocked: You cannot edit your own profile here.');
      return;
    }
    try {
      const payload = {
        name: editName,
        email: editEmail,
        phone: editPhone,
        role: editRole
      };
      const res = await axios.put(`/api/admin/users/${userId}`, payload, { withCredentials: true });
      if (res.data.success) {
        alert('User details updated successfully.');
        setSelectedUser(null);
        fetchUsers(activeTab);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleToggleStatus = async (userToToggle) => {
    // Rule 11 check
    if (userToToggle._id === currentUser?._id) {
      alert('Action blocked: You cannot suspend your own account.');
      return;
    }
    try {
      const res = await axios.put(`/api/admin/users/${userToToggle._id}/status`, {}, { withCredentials: true });
      if (res.data.success) {
        const updatedUser = res.data.user;
        alert(`User is now ${updatedUser.status}.`);
        setSelectedUser(prev => prev ? { ...prev, status: updatedUser.status } : null);
        fetchUsers(activeTab);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    // Rule 11 check
    if (userId === currentUser?._id) {
      alert('Action blocked: You cannot delete your own account.');
      return;
    }
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      const res = await axios.delete(`/api/admin/users/${userId}`, { withCredentials: true });
      if (res.data.success) {
        alert(res.data.message);
        setSelectedUser(null);
        fetchUsers(activeTab);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Rule 2 & 12: Filtering list dynamically (excluding logged-in user)
  const filteredAndStatusList = users
    .filter(u => u._id !== currentUser?._id)
    .filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                            u.email.toLowerCase().includes(search.toLowerCase()) ||
                            u.username.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' ? true : u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  // Rule 12: Pagination details
  const totalPages = Math.ceil(filteredAndStatusList.length / PAGE_SIZE) || 1;
  const currentOffsetIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedUsersList = filteredAndStatusList.slice(currentOffsetIndex, currentOffsetIndex + PAGE_SIZE);

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
            setCreateRole('Contestant');
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
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0B1222] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Suspended">Suspended Only</option>
          </select>
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
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setEditName(u.name);
                            setEditEmail(u.email);
                            setEditPhone(u.phone);
                            setEditRole(u.role);
                          }}
                          className="px-2.5 py-1.5 bg-brandPrimary/10 border border-brandPrimary/20 hover:bg-brandPrimary/20 text-brandPrimary rounded-lg font-semibold flex items-center gap-1 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
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

      {/* Modal: Create User */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0B1222] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <h3 className="text-base font-extrabold text-white font-poppins">Create User Account</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-white/5 rounded-lg text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
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
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value)}
                  className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Contestant">Contestant</option>
                  <option value="Judge">Judge</option>
                  <option value="Sponsor">Sponsor</option>
                  {currentUser?.role === 'Super Admin' && (
                    <>
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                    </>
                  )}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all mt-4 flex justify-center items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publish New Account</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manage/Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0B1222] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 text-left space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
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
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-1 hover:bg-white/5 rounded-lg text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
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
                <span className="text-[10px] text-brandPrimary uppercase font-extrabold tracking-wider block">Account Settings</span>
                
                {/* Form fields */}
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
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Override Role</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Contestant">Contestant</option>
                      <option value="Judge">Judge</option>
                      <option value="Sponsor">Sponsor</option>
                      {currentUser?.role === 'Super Admin' && (
                        <>
                          <option value="Admin">Admin</option>
                          <option value="Super Admin">Super Admin</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Save and Controls */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleUpdateUser(selectedUser._id)}
                    className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Edits</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(selectedUser)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedUser.status === 'Active'
                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {selectedUser.status === 'Active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    <span>{selectedUser.status === 'Active' ? 'Suspend Session' : 'Activate User'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteUser(selectedUser._id)}
                    className="px-4 py-2 bg-red-600/10 border border-red-500/20 hover:bg-red-600 hover:text-white text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl space-y-2 text-center">
                <ShieldAlert className="w-6 h-6 text-red-500 mx-auto" />
                <h4 className="text-xs font-bold text-white">Privileged Override Blocked</h4>
                <p className="text-[10px] text-white/50">
                  As an Admin, you do not have permission to manage other administrators or Super Admin accounts. Only Super Admins can update administrative account parameters.
                </p>
              </div>
            )}

            <div className="border-t border-white/5 pt-4 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white text-xs font-bold transition-all"
              >
                Close Panel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default UsersDirectory;
