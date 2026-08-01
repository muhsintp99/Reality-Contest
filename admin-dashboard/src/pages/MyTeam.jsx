import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { CustomSelect } from '../components/CustomSelect';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { useNotification } from '../context/NotificationContext';
import { 
  UserPlus, ShieldAlert, Check, ToggleLeft, ToggleRight, 
  Trash2, Search, X, Mail, Phone, Lock, Sparkles, Edit, Shield, Eye, EyeOff, ChevronLeft, ChevronRight
} from 'lucide-react';

const ROLE_COLORS = {
  'Super Admin': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Admin': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Contest Manager': 'bg-amber-500/10 text-amber-450 border-amber-500/20',
  'Question Manager': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Finance Manager': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Support Manager': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Support Executive': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Marketing Manager': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Content Moderator': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'KYC Officer': 'bg-blue-500/10 text-blue-455 border-blue-500/20',
  'Analytics Manager': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Sponsor': 'bg-sky-500/10 text-sky-400 border-sky-500/20'
};

export const MyTeam = () => {
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { markModuleAsRead } = useNotification();
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modals & Drawers
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showViewDrawer, setShowViewDrawer] = useState(false);
  const [viewingMember, setViewingMember] = useState(null);

  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updateSubmitting, setUpdateSubmitting] = useState(false);

  const availableRoles = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Contest Manager', label: 'Contest Manager' },
    { value: 'Question Manager', label: 'Question Manager' },
    { value: 'Finance Manager', label: 'Finance Manager' },
    { value: 'Support Executive', label: 'Support Executive' },
    { value: 'Support Manager', label: 'Support Manager' },
    { value: 'Marketing Manager', label: 'Marketing Manager' },
    { value: 'Content Moderator', label: 'Content Moderator' },
    { value: 'KYC Officer', label: 'KYC Officer' },
    { value: 'Analytics Manager', label: 'Analytics Manager' },
    { value: 'Sponsor', label: 'Sponsor' }
  ];

  // Formik: Create Team Member
  const createFormik = useFormik({
    initialValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      role: 'Admin'
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
        .required('Work email is required'),
      phone: Yup.string()
        .matches(/^\+?[0-9]{10,15}$/, 'Phone must be between 10 and 15 digits (+91...)')
        .required('Mobile phone is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Initial password is required')
    }),
    onSubmit: async (values) => {
      setFormError('');
      try {
        const res = await axios.post('/api/admin/users', {
          name: values.name,
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password,
          role: values.role
        }, { withCredentials: true });

        if (res.data.success) {
          showSnackbar(`Team member ${values.name} added successfully.`, 'success');
          setShowCreateDrawer(false);
          createFormik.resetForm();
          setShowPassword(false);
          fetchTeam();
        }
      } catch (err) {
        setFormError(err.response?.data?.message || 'Failed to create team member.');
      }
    }
  });

  // Formik: Edit Team Member
  const editFormik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      role: ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string()
        .max(50, 'Full name must be 50 characters or less')
        .required('Full name is required'),
      email: Yup.string()
        .email('Invalid email address format')
        .required('Work email is required'),
      phone: Yup.string()
        .matches(/^\+?[0-9]{10,15}$/, 'Phone must be between 10 and 15 digits (+91...)')
        .required('Mobile phone is required')
    }),
    onSubmit: async (values) => {
      setFormError('');
      setUpdateSubmitting(true);
      try {
        const res = await axios.put(`/api/admin/users/${selectedMember._id}`, {
          name: values.name,
          email: values.email,
          phone: values.phone,
          role: values.role
        }, { withCredentials: true });

        if (res.data.success) {
          showSnackbar(`Profile of ${values.name} updated.`, 'success');
          setShowEditDrawer(false);
          editFormik.resetForm();
          setSelectedMember(null);
          fetchTeam();
        }
      } catch (err) {
        setFormError(err.response?.data?.message || 'Failed to update details.');
      } finally {
        setUpdateSubmitting(false);
      }
    }
  });

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users/Admin', { withCredentials: true });
      if (res.data.success) {
        setMembers(res.data.users || []);
        markModuleAsRead('System');
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleDelete = (member) => {
    showConfirm('Remove Team Member', `Are you sure you want to remove ${member.name} from your team?`, async () => {
      try {
        const res = await axios.delete(`/api/admin/users/${member._id}`, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('Team member removed.', 'success');
          fetchTeam();
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to remove team member.', 'error');
      }
    });
  };

  const handleToggleStatus = (member) => {
    const action = member.status === 'Active' ? 'Suspend' : 'Activate';
    showConfirm(`${action} Member`, `Are you sure you want to ${action.toLowerCase()} ${member.name}?`, async () => {
      try {
        const res = await axios.put(`/api/admin/users/${member._id}/status`, {}, { withCredentials: true });
        if (res.data.success) {
          showSnackbar(`Status updated to ${res.data.user.status}.`, 'success');
          fetchTeam();
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to update status.', 'error');
      }
    });
  };

  const openCreateDrawer = () => {
    createFormik.resetForm();
    createFormik.setFieldValue('role', 'Admin');
    setFormError('');
    setShowCreateDrawer(true);
  };

  const openEditDrawer = (member) => {
    setSelectedMember(member);
    editFormik.setValues({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role
    });
    setFormError('');
    setShowEditDrawer(true);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filtered list
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'All' ? true : m.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Pagination details
  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const currentOffsetIndex = (currentPage - 1) * pageSize;
  const paginatedMembersList = filteredMembers.slice(currentOffsetIndex, currentOffsetIndex + pageSize);

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-brandPrimary" />
            <span>My Team Directory</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">Manage administrative staff credentials, roles, and console clearances.</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={openCreateDrawer}
            className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-semibold hover:bg-brandPrimary/90 transition-colors flex items-center gap-2 shadow-lg shadow-brandPrimary/10"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Search team member by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/90 dark:bg-[#0c1322]/60 border border-slate-300/80 dark:border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-brandPrimary/60"
          />
        </div>
        <div className="w-full md:w-56">
          <CustomSelect
            value={roleFilter}
            onChange={(val) => {
              setRoleFilter(val);
              setCurrentPage(1);
            }}
            options={[
              { value: 'All', label: 'All Roles' },
              { value: 'Super Admin', label: 'Super Admin' },
              ...availableRoles
            ]}
          />
        </div>
      </div>

      {/* Load Spinner */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] animate-pulse">
          <div className="flex flex-col items-center gap-3 text-slate-600 dark:text-white/55">
            <div className="w-8 h-8 border-2 border-brandPrimary/30 border-t-brandPrimary rounded-full animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Loading Team Registry...</p>
          </div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="glassmorphism p-12 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
          <ShieldAlert className="w-8 h-8 text-slate-400 dark:text-white/20 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white/70">No Team Members Found</h4>
          <p className="text-xs text-slate-500 dark:text-white/40 mt-1">There are no administrative accounts matching the filters.</p>
        </div>
      ) : (
        /* Team Table Display with Pagination */
        <div className="space-y-6">
          <div className="glassmorphism rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden divide-y divide-slate-200/50 dark:divide-white/5 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/70 dark:bg-white/5 text-slate-600 dark:text-white/50 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Member Info</th>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Role Badge</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4 text-right pr-12">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 text-slate-800 dark:text-white/80">
                  {paginatedMembersList.map((member) => {
                    const initials = getInitials(member.name);
                    const roleColorClass = ROLE_COLORS[member.role] || 'bg-white/10 text-white/70 border-white/20';

                    return (
                      <tr key={member._id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-slate-900 dark:text-white">
                          <div className="flex items-start gap-3">
                            {member.avatar ? (
                              <img 
                                src={member.avatar} 
                                className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 object-cover mt-0.5 shrink-0" 
                                alt="" 
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brandPrimary/20 to-brandSecondary/25 border border-slate-200 dark:border-white/10 flex items-center justify-center font-bold text-xs text-brandPrimary shrink-0 mt-0.5">
                                {initials}
                              </div>
                            )}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white text-sm leading-none">{member.name}</span>
                                {(member._id === currentUser?._id || member.email === currentUser?.email) && (
                                  <span className="px-1.5 py-0.5 rounded bg-brandPrimary/15 text-brandPrimary text-[9px] font-extrabold uppercase tracking-wider">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-500 dark:text-white/40 text-[11px] flex items-center gap-1.5 select-all">
                                <Mail className="w-3 h-3 text-brandPrimary/60" />
                                {member.email}
                              </span>
                              {member.phone && (
                                <span className="text-slate-500 dark:text-white/40 text-[11px] flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 text-brandPrimary/60" />
                                  {member.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-white/60 font-mono">@{member.username}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-bold uppercase border px-2 py-0.5 rounded ${roleColorClass}`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${member.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right pr-6">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setViewingMember(member);
                                setShowViewDrawer(true);
                              }}
                              title="View Details"
                              className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 dark:text-blue-400 rounded-full transition-all"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {isSuperAdmin && member._id !== currentUser?._id && member.email !== currentUser?.email && (
                              <>
                                <button
                                  onClick={() => handleToggleStatus(member)}
                                  title={member.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                                  className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-full transition-all text-slate-700 dark:text-white"
                                >
                                  {member.status === 'Active' ? (
                                    <ToggleRight className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                  ) : (
                                    <ToggleLeft className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                                  )}
                                </button>
                                <button
                                  onClick={() => openEditDrawer(member)}
                                  title="Edit Clearance"
                                  className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-450 rounded-full transition-all"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(member)}
                                  title="Delete Profile"
                                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-full transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination controls */}
          <div className="glassmorphism p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-white/50 shadow-xl">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-[#080b12] border border-slate-300 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary transition-all cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span>Showing {currentOffsetIndex + 1}-{Math.min(currentOffsetIndex + pageSize, filteredMembers.length)} of {filteredMembers.length} members</span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 dark:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-semibold text-slate-800 dark:text-white">Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 dark:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TEAM DRAWER */}
      {isSuperAdmin && (
        <RightDrawer
          isOpen={showCreateDrawer}
          onClose={() => setShowCreateDrawer(false)}
          title="Add Team Member"
        >
          <form onSubmit={createFormik.handleSubmit} className="space-y-5 p-1 text-left">
            {formError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Full Name</label>
              <input
                type="text"
                name="name"
                value={createFormik.values.name}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                placeholder="e.g. Sarah Connor"
                className={`w-full bg-white/90 dark:bg-[#0c1322] border rounded-xl px-3.5 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none ${
                  createFormik.touched.name && createFormik.errors.name ? 'border-rose-500/60' : 'border-slate-300 dark:border-white/10'
                }`}
              />
              {createFormik.touched.name && createFormik.errors.name && (
                <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{createFormik.errors.name}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Console Username</label>
              <input
                type="text"
                name="username"
                value={createFormik.values.username}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                placeholder="e.g. sarahc"
                className={`w-full bg-white/90 dark:bg-[#0c1322] border rounded-xl px-3.5 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none ${
                  createFormik.touched.username && createFormik.errors.username ? 'border-rose-500/60' : 'border-slate-300 dark:border-white/10'
                }`}
              />
              {createFormik.touched.username && createFormik.errors.username && (
                <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{createFormik.errors.username}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Work Email Address</label>
              <input
                type="email"
                name="email"
                value={createFormik.values.email}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                placeholder="e.g. sarah@realitycontest.com"
                className={`w-full bg-white/90 dark:bg-[#0c1322] border rounded-xl px-3.5 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none ${
                  createFormik.touched.email && createFormik.errors.email ? 'border-rose-500/60' : 'border-slate-300 dark:border-white/10'
                }`}
              />
              {createFormik.touched.email && createFormik.errors.email && (
                <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{createFormik.errors.email}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Mobile Phone Number</label>
              <input
                type="text"
                name="phone"
                value={createFormik.values.phone}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                placeholder="e.g. +919876543210"
                className={`w-full bg-white/90 dark:bg-[#0c1322] border rounded-xl px-3.5 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none ${
                  createFormik.touched.phone && createFormik.errors.phone ? 'border-rose-500/60' : 'border-slate-300 dark:border-white/10'
                }`}
              />
              {createFormik.touched.phone && createFormik.errors.phone && (
                <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{createFormik.errors.phone}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Initial Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={createFormik.values.password}
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                  placeholder="••••••••"
                  className={`w-full bg-white/90 dark:bg-[#0c1322] border rounded-xl pl-3.5 pr-10 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none ${
                    createFormik.touched.password && createFormik.errors.password ? 'border-rose-500/60' : 'border-slate-300 dark:border-white/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {createFormik.touched.password && createFormik.errors.password && (
                <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{createFormik.errors.password}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Assigned Role</label>
              <CustomSelect
                value={createFormik.values.role}
                onChange={(val) => createFormik.setFieldValue('role', val)}
                options={availableRoles}
                position="top"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex justify-center items-center gap-2 shadow-lg shadow-brandPrimary/15"
            >
              <span>Add Member</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        </RightDrawer>
      )}

      {/* EDIT TEAM MEMBER DRAWER */}
      {isSuperAdmin && selectedMember && (
        <RightDrawer
          isOpen={showEditDrawer}
          onClose={() => setShowEditDrawer(false)}
          title={`Edit details: ${selectedMember.name}`}
        >
          <form onSubmit={editFormik.handleSubmit} className="space-y-5 p-1 text-left">
            {formError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Full Name</label>
              <input
                type="text"
                name="name"
                value={editFormik.values.name}
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                className={`w-full bg-white/90 dark:bg-[#0c1322] border rounded-xl px-3.5 py-3 text-xs text-slate-900 dark:text-white focus:outline-none ${
                  editFormik.touched.name && editFormik.errors.name ? 'border-rose-500/60' : 'border-slate-300 dark:border-white/10'
                }`}
              />
              {editFormik.touched.name && editFormik.errors.name && (
                <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{editFormik.errors.name}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Work Email Address</label>
              <input
                type="email"
                name="email"
                value={editFormik.values.email}
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                className={`w-full bg-white/90 dark:bg-[#0c1322] border rounded-xl px-3.5 py-3 text-xs text-slate-900 dark:text-white focus:outline-none ${
                  editFormik.touched.email && editFormik.errors.email ? 'border-rose-500/60' : 'border-slate-300 dark:border-white/10'
                }`}
              />
              {editFormik.touched.email && editFormik.errors.email && (
                <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{editFormik.errors.email}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Mobile Phone Number</label>
              <input
                type="text"
                name="phone"
                value={editFormik.values.phone}
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                className={`w-full bg-white/90 dark:bg-[#0c1322] border rounded-xl px-3.5 py-3 text-xs text-slate-900 dark:text-white focus:outline-none ${
                  editFormik.touched.phone && editFormik.errors.phone ? 'border-rose-500/60' : 'border-slate-300 dark:border-white/10'
                }`}
              />
              {editFormik.touched.phone && editFormik.errors.phone && (
                <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{editFormik.errors.phone}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Override Clearance Role</label>
              <CustomSelect
                value={editFormik.values.role}
                onChange={(val) => editFormik.setFieldValue('role', val)}
                options={availableRoles}
                position="top"
              />
            </div>

            <button
              type="submit"
              disabled={updateSubmitting}
              className="w-full mt-4 py-3.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex justify-center items-center gap-2 shadow-lg shadow-brandPrimary/15 disabled:opacity-50"
            >
              <span>{updateSubmitting ? 'Saving...' : 'Save Changes'}</span>
              <Check className="w-4 h-4" />
            </button>
          </form>
        </RightDrawer>
      )}

      {/* Drawer: Read-only Details View */}
      <RightDrawer
        isOpen={showViewDrawer}
        onClose={() => {
          setShowViewDrawer(false);
          setViewingMember(null);
        }}
        title="Team Member Profile Details"
      >
        {viewingMember && (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
              {viewingMember.avatar ? (
                <img 
                  src={viewingMember.avatar} 
                  className="w-16 h-16 rounded-full border border-slate-200 dark:border-white/10 object-cover" 
                  alt="" 
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brandPrimary/20 to-brandSecondary/25 border border-slate-200 dark:border-white/10 flex items-center justify-center font-bold text-base text-brandPrimary shrink-0">
                  {getInitials(viewingMember.name)}
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{viewingMember.name}</h3>
                <p className="text-xs text-slate-500 dark:text-white/40 mt-1">@{viewingMember.username}</p>
                <span className="inline-block mt-2 bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                  {viewingMember.role}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-white/40 uppercase font-extrabold tracking-wider">Contact Info</label>
                <div className="mt-2 space-y-2.5 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-xl text-xs text-slate-700 dark:text-white/80">
                  <p className="flex justify-between"><span className="text-slate-500 dark:text-white/40">Email:</span> <span className="font-semibold select-all text-slate-900 dark:text-white">{viewingMember.email}</span></p>
                  <p className="flex justify-between"><span className="text-slate-500 dark:text-white/40">Phone:</span> <span className="font-semibold text-slate-900 dark:text-white">{viewingMember.phone || 'N/A'}</span></p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-white/40 uppercase font-extrabold tracking-wider">Account Metrics & Status</label>
                <div className="mt-2 space-y-2.5 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-xl text-xs text-slate-700 dark:text-white/80">
                  <p className="flex justify-between">
                    <span className="text-slate-500 dark:text-white/40">Status:</span> 
                    <span className={`font-bold ${viewingMember.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {viewingMember.status}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500 dark:text-white/40">Registration Date:</span> 
                    <span className="font-semibold text-slate-900 dark:text-white">{new Date(viewingMember.createdAt || new Date()).toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500 dark:text-white/40">Wallet Balance:</span> 
                    <span className="font-extrabold text-brandPrimary dark:text-brandSecondary">₹{(viewingMember.walletBalance || 0).toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500 dark:text-white/40">Profile ID:</span> 
                    <span className="font-mono text-[9px] text-slate-500 dark:text-white/45 select-all">{viewingMember._id}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  setShowViewDrawer(false);
                  setViewingMember(null);
                }}
                className="w-full py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors"
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

export default MyTeam;
