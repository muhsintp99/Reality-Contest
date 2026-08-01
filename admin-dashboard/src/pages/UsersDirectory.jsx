import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { CustomSelect } from '../components/CustomSelect';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { useNotification } from '../context/NotificationContext';
import { 
  Users, UserPlus, ShieldAlert, Check, ToggleLeft, ToggleRight, 
  Trash2, Search, Eye, EyeOff, X, Mail, Phone, Lock, Sparkles, ChevronLeft, ChevronRight, Filter, Settings
} from 'lucide-react';

export const UsersDirectory = ({ type = 'Contestant' }) => {
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { markModuleAsRead } = useNotification();

  const [activeTab, setActiveTab] = useState(type);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Active, Suspended
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);

  const [createError, setCreateError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updateSubmitting, setUpdateSubmitting] = useState(false);

  const adminRoles = [
    'Super Admin',
    'Admin',
    'Contest Manager',
    'Question Manager',
    'Finance Manager',
    'Support Manager',
    'Support Executive',
    'Marketing Manager',
    'Content Moderator',
    'KYC Officer',
    'Analytics Manager'
  ];
  const canManageSelected = currentUser?.role === 'Super Admin' || !adminRoles.includes(selectedUser?.role);

  // Create Formik Instance
  const createFormik = useFormik({
    initialValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      role: type
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string()
        .max(50, 'Full name must be 50 characters or less')
        .required('Full name is required'),
      username: Yup.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be 20 characters or less')
        .matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed')
        .required('Username is required'),
      email: Yup.string()
        .email('Invalid email address format')
        .required('Email address is required'),
      phone: Yup.string()
        .matches(/^\+?[0-9]{10,15}$/, 'Phone must be between 10 and 15 digits (+91...)')
        .required('Mobile phone is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Initial password is required')
    }),
    onSubmit: async (values) => {
      setCreateError('');
      try {
        const payload = {
          name: values.name,
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password,
          role: values.role
        };
        const res = await axios.post('/api/admin/users', payload, { withCredentials: true });
        if (res.data.success) {
          showSnackbar(res.data.message, 'success');
          setShowCreateModal(false);
          createFormik.resetForm();
          setShowPassword(false);
          fetchUsers(activeTab);
        }
      } catch (err) {
        setCreateError(err.response?.data?.message || 'Failed to create user.');
      }
    }
  });

  // Edit Formik Instance
  const editFormik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      role: ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string()
        .max(50, 'Display name must be 50 characters or less')
        .required('Display name is required'),
      phone: Yup.string()
        .matches(/^\+?[0-9]{10,15}$/, 'Phone must be between 10 and 15 digits (+91...)')
        .required('Mobile phone is required')
    }),
    onSubmit: async (values) => {
      if (selectedUser?._id === currentUser?._id) {
        showAlert('Action blocked: You cannot edit your own profile here.', 'error');
        return;
      }
      setUpdateSubmitting(true);
      try {
        const payload = {
          name: values.name,
          phone: values.phone,
          role: values.role
        };
        const res = await axios.put(`/api/admin/users/${selectedUser._id}`, payload, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('User details updated successfully.', 'success');
          setSelectedUser(null);
          fetchUsers(activeTab);
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to update user.', 'error');
      } finally {
        setUpdateSubmitting(false);
      }
    }
  });

  const fetchUsers = async (roleName) => {
    setLoading(true);
    setUsers([]); // Clear users immediately
    try {
      const res = await axios.get(`/api/admin/users/${roleName}`, { withCredentials: true });
      if (res.data.success) {
        const filteredList = (res.data.users || [])
          .filter(u => u._id !== currentUser?._id)
          .filter(u => u.role !== 'Super Admin');
        setUsers(filteredList);
        setCurrentPage(1);

        // Auto-clear notifications only after successful load
        if (roleName === 'Contestant') {
          markModuleAsRead('Contestant');
        } else if (roleName === 'Judge') {
          markModuleAsRead('Judge');
        } else if (roleName === 'Sponsor') {
          markModuleAsRead('Sponsor');
        }
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveTab(type);
    createFormik.setFieldValue('role', type);
    setSearch('');
    setStatusFilter('All');
  }, [type]);

  useEffect(() => {
    if (activeTab) {
      fetchUsers(activeTab);
    }
  }, [activeTab]);

  const handleToggleStatus = async (userId, currentStatus) => {
    if (userId === currentUser?._id) {
      showAlert('Action blocked: You cannot suspend your own account.', 'error');
      return;
    }
    showConfirm('Toggle Status', `Are you sure you want to change the status for this user?`, async () => {
      try {
        const res = await axios.put(`/api/admin/users/${userId}/status`, {}, { withCredentials: true });
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

  // Filtering list dynamically
  const filteredAndStatusList = users
    .filter(u => u._id !== currentUser?._id)
    .filter(u => {
      const adminRolesList = [
        'Admin',
        'Super Admin',
        'Contest Manager',
        'Finance Manager',
        'Support Manager',
        'Marketing Manager',
        'Content Moderator',
        'KYC Officer',
        'Analytics Manager'
      ];
      if (activeTab === 'Admin') {
        return adminRolesList.includes(u.role);
      }
      return u.role === activeTab;
    })
    .filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                            u.email.toLowerCase().includes(search.toLowerCase()) ||
                            u.username.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' ? true : u.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt || b._id).getTime() - new Date(a.createdAt || a._id).getTime());

  // Pagination details
  const totalPages = Math.ceil(filteredAndStatusList.length / pageSize) || 1;
  const currentOffsetIndex = (currentPage - 1) * pageSize;
  const paginatedUsersList = filteredAndStatusList.slice(currentOffsetIndex, currentOffsetIndex + pageSize);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-pulse">
        <div className="flex flex-col items-center gap-3 text-white/50">
          <div className="w-8 h-8 border-2 border-brandPrimary/30 border-t-brandPrimary rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-widest">Initializing Directory...</p>
        </div>
      </div>
    );
  }

  const getPageHeaderLabel = () => {
    if (activeTab === 'Admin') return 'Staff & Admin';
    return activeTab;
  };

  return (
    <div className="space-y-6 text-left animate-fade-in relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-poppins text-white flex items-center gap-2">
            {getPageHeaderLabel()} Console Directory
          </h2>
          <p className="text-xs text-white/50">Browse, edit, search, and perform administrative actions on {getPageHeaderLabel().toLowerCase()} accounts.</p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'Contestant') {
              navigate('/admin-dashboard/contestants/create');
            } else {
              createFormik.resetForm();
              createFormik.setFieldValue('role', activeTab);
              setShowCreateModal(true);
            }
          }}
          className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-semibold hover:bg-brandPrimary/90 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create {getPageHeaderLabel()} Account</span>
        </button>
      </div>

      {/* Search, Filter, and Status Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder={`Search ${getPageHeaderLabel().toLowerCase()}s...`}
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#0c1322]/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brandPrimary/50"
          />
        </div>

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
          <div className="p-12 text-center text-xs text-white/40">No {getPageHeaderLabel().toLowerCase()} profiles found matching filters.</div>
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
                    {activeTab === 'Contestant' && <th className="px-6 py-4">KYC Status</th>}
                    <th className="px-6 py-4 text-right pr-12">Actions</th>
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
                      {activeTab === 'Contestant' && (
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            u.kycStatus === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : u.kycStatus === 'Under Review'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : u.kycStatus === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                              : 'bg-white/5 text-white/50 border border-white/5'
                          }`}>
                            {u.kycStatus || 'Pending'}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 text-right pr-6">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setViewingUser(u);
                              setIsViewDrawerOpen(true);
                            }}
                            title="View Full Details"
                            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-full transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              editFormik.setValues({
                                name: u.name,
                                phone: u.phone || '',
                                role: u.role
                              });
                            }}
                            title="Configure Settings"
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#080b12] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-brandPrimary transition-all cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span>Showing {currentOffsetIndex + 1}-{Math.min(currentOffsetIndex + pageSize, filteredAndStatusList.length)} of {filteredAndStatusList.length} users</span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 font-semibold text-white">Page {currentPage} of {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Drawer: Create User */}
      <RightDrawer
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={`Create ${getPageHeaderLabel()} Account`}
      >
        {createError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
            {createError}
          </div>
        )}

        <form onSubmit={createFormik.handleSubmit} className="space-y-6 text-left">
          <div>
            <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Account Details</div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={createFormik.values.name}
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                  placeholder="Aarav Sharma"
                  className={`w-full bg-[#080b12] border rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none ${
                    createFormik.touched.name && createFormik.errors.name ? 'border-red-500/60' : 'border-white/10'
                  }`}
                />
                {createFormik.touched.name && createFormik.errors.name && (
                  <span className="text-[10px] text-red-400 mt-1 block animate-fade-in">{createFormik.errors.name}</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={createFormik.values.username}
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                  placeholder="aarav"
                  className={`w-full bg-[#080b12] border rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none ${
                    createFormik.touched.username && createFormik.errors.username ? 'border-red-500/60' : 'border-white/10'
                  }`}
                />
                {createFormik.touched.username && createFormik.errors.username && (
                  <span className="text-[10px] text-red-400 mt-1 block animate-fade-in">{createFormik.errors.username}</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={createFormik.values.email}
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                  placeholder="aarav@domain.com"
                  className={`w-full bg-[#080b12] border rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none ${
                    createFormik.touched.email && createFormik.errors.email ? 'border-red-500/60' : 'border-white/10'
                  }`}
                />
                {createFormik.touched.email && createFormik.errors.email && (
                  <span className="text-[10px] text-red-400 mt-1 block animate-fade-in">{createFormik.errors.email}</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Mobile Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={createFormik.values.phone}
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                  placeholder="+9199..."
                  className={`w-full bg-[#080b12] border rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none ${
                    createFormik.touched.phone && createFormik.errors.phone ? 'border-red-500/60' : 'border-white/10'
                  }`}
                />
                {createFormik.touched.phone && createFormik.errors.phone && (
                  <span className="text-[10px] text-red-400 mt-1 block animate-fade-in">{createFormik.errors.phone}</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Security & Roles</div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Initial Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={createFormik.values.password}
                    onChange={createFormik.handleChange}
                    onBlur={createFormik.handleBlur}
                    placeholder="••••••••"
                    className={`w-full bg-[#080b12] border rounded-xl pl-3 pr-10 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brandPrimary transition-all ${
                      createFormik.touched.password && createFormik.errors.password ? 'border-red-500/60' : 'border-white/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {createFormik.touched.password && createFormik.errors.password && (
                  <span className="text-[10px] text-red-400 mt-1 block animate-fade-in">{createFormik.errors.password}</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Account Role</label>
                {activeTab === 'Admin' ? (
                  <CustomSelect
                    value={createFormik.values.role}
                    onChange={(val) => createFormik.setFieldValue('role', val)}
                    options={[
                      { value: 'Admin', label: 'Admin' },
                      { value: 'Contest Manager', label: 'Contest Manager' },
                      { value: 'Question Manager', label: 'Question Manager' },
                      { value: 'Finance Manager', label: 'Finance Manager' },
                      { value: 'Support Executive', label: 'Support Executive' },
                      { value: 'Support Manager', label: 'Support Manager' },
                      { value: 'Marketing Manager', label: 'Marketing Manager' },
                      { value: 'Content Moderator', label: 'Content Moderator' },
                      { value: 'KYC Officer', label: 'KYC Officer' },
                      { value: 'Analytics Manager', label: 'Analytics Manager' }
                    ]}
                    position="top"
                  />
                ) : (
                  <input
                    type="text"
                    disabled
                    value={createFormik.values.role}
                    className="w-full bg-[#080b12]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/50 cursor-not-allowed focus:outline-none"
                  />
                )}
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

      {/* Drawer: Manage Settings */}
      <RightDrawer
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Manage User Account"
      >
        {selectedUser && (
          <div className="space-y-6 text-left">
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

            {selectedUser._id === currentUser?._id ? (
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl space-y-2 text-center">
                <ShieldAlert className="w-6 h-6 text-red-500 mx-auto" />
                <h4 className="text-xs font-bold text-white">Self-Modification Blocked</h4>
                <p className="text-[10px] text-white/50">
                  You cannot update, suspend, or delete your own logged-in user profile from this directory page.
                </p>
              </div>
            ) : canManageSelected ? (
              <form onSubmit={editFormik.handleSubmit} className="space-y-4">
                <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4 mt-2">Account Settings</div>
                
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
                      value={selectedUser?.email || ''}
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
                      name="name"
                      value={editFormik.values.name}
                      onChange={editFormik.handleChange}
                      onBlur={editFormik.handleBlur}
                      className={`w-full bg-[#080b12] border rounded-xl px-3 py-2 text-xs text-white focus:outline-none ${
                        editFormik.touched.name && editFormik.errors.name ? 'border-red-500/60' : 'border-white/10'
                      }`}
                    />
                    {editFormik.touched.name && editFormik.errors.name && (
                      <span className="text-[10px] text-red-400 mt-1 block animate-fade-in">{editFormik.errors.name}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={editFormik.values.phone}
                      onChange={editFormik.handleChange}
                      onBlur={editFormik.handleBlur}
                      className={`w-full bg-[#080b12] border rounded-xl px-3 py-2 text-xs text-white focus:outline-none ${
                        editFormik.touched.phone && editFormik.errors.phone ? 'border-red-500/60' : 'border-white/10'
                      }`}
                    />
                    {editFormik.touched.phone && editFormik.errors.phone && (
                      <span className="text-[10px] text-red-400 mt-1 block animate-fade-in">{editFormik.errors.phone}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 uppercase font-bold mb-1">Override Role</label>
                  {activeTab === 'Admin' ? (
                    <CustomSelect
                      value={editFormik.values.role}
                      onChange={(val) => editFormik.setFieldValue('role', val)}
                      options={[
                        { value: 'Admin', label: 'Admin' },
                        { value: 'Contest Manager', label: 'Contest Manager' },
                        { value: 'Question Manager', label: 'Question Manager' },
                        { value: 'Finance Manager', label: 'Finance Manager' },
                        { value: 'Support Executive', label: 'Support Executive' },
                        { value: 'Support Manager', label: 'Support Manager' },
                        { value: 'Marketing Manager', label: 'Marketing Manager' },
                        { value: 'Content Moderator', label: 'Content Moderator' },
                        { value: 'KYC Officer', label: 'KYC Officer' },
                        { value: 'Analytics Manager', label: 'Analytics Manager' }
                      ]}
                      position="top"
                    />
                  ) : (
                    <input
                      type="text"
                      disabled
                      value={editFormik.values.role}
                      className="w-full bg-[#080b12]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/50 cursor-not-allowed focus:outline-none"
                    />
                  )}
                </div>

                <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4 mt-8">Administrative Actions</div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="submit"
                    disabled={updateSubmitting}
                    className="py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
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
              </form>
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

      {/* Drawer: Read-only Details View */}
      <RightDrawer
        isOpen={isViewDrawerOpen}
        onClose={() => setIsViewDrawerOpen(false)}
        title={`${getPageHeaderLabel()} Profile Details`}
      >
        {viewingUser && (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-4 border-b border-white/10 pb-5">
              <img 
                src={viewingUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingUser.username}`} 
                className="w-16 h-16 rounded-full border border-white/10" 
                alt="" 
              />
              <div>
                <h3 className="text-base font-bold text-white leading-tight">{viewingUser.name}</h3>
                <p className="text-xs text-white/40 mt-1">@{viewingUser.username}</p>
                <span className="inline-block mt-2 bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                  {viewingUser.role}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-white/40 uppercase font-extrabold tracking-wider">Contact Info</label>
                <div className="mt-2 space-y-2.5 bg-white/5 border border-white/5 p-4 rounded-xl text-xs text-white/80">
                  <p className="flex justify-between"><span className="text-white/40">Email:</span> <span className="font-semibold select-all">{viewingUser.email}</span></p>
                  <p className="flex justify-between"><span className="text-white/40">Phone:</span> <span className="font-semibold">{viewingUser.phone || 'N/A'}</span></p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-white/40 uppercase font-extrabold tracking-wider">Account Metrics & Status</label>
                <div className="mt-2 space-y-2.5 bg-white/5 border border-white/5 p-4 rounded-xl text-xs text-white/80">
                  <p className="flex justify-between">
                    <span className="text-white/40">Status:</span> 
                    <span className={`font-bold ${viewingUser.status === 'Active' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {viewingUser.status}
                    </span>
                  </p>
                  {viewingUser.role === 'Contestant' && (
                    <p className="flex justify-between">
                      <span className="text-white/40">KYC Status:</span> 
                      <span className={`font-bold ${
                        viewingUser.kycStatus === 'Approved' ? 'text-emerald-400' :
                        viewingUser.kycStatus === 'Under Review' ? 'text-amber-400' :
                        viewingUser.kycStatus === 'Rejected' ? 'text-rose-400' : 'text-white/50'
                      }`}>
                        {viewingUser.kycStatus || 'Pending'}
                      </span>
                    </p>
                  )}
                  <p className="flex justify-between">
                    <span className="text-white/40">Registration Date:</span> 
                    <span className="font-semibold">{new Date(viewingUser.createdAt || new Date()).toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-white/40">Wallet Balance:</span> 
                    <span className="font-extrabold text-brandSecondary">₹{(viewingUser.walletBalance || 0).toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-white/40">Profile ID:</span> 
                    <span className="font-mono text-[9px] text-white/45 select-all">{viewingUser._id}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsViewDrawerOpen(false)}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default UsersDirectory;
