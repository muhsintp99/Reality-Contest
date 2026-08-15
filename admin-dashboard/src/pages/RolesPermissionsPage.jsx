import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Lock, Shield, Check, X, Save, Plus, RotateCcw, ShieldCheck, Users, Eye, Edit3, Trash2, Download
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

const INITIAL_ROLES = [
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

const MODULES_LIST = [
  'Dashboard',
  'User Management',
  'Contest Management',
  'Daily Contest Desk',
  'Category Management',
  'Grand Contest',
  'Question Bank',
  'Survey Management',
  'Task Management',
  'Challenge Management',
  'Leaderboard',
  'Wallet Management',
  'Coin Management',
  'Withdrawal Management',
  'KYC Management',
  'Banner Management',
  'Notification Panel',
  'Referral Management',
  'Reports',
  'CMS',
  'Advertisement Management',
  'Coupon Management',
  'Fraud Detection',
  'Roles & Permissions',
  'My Team Directory',
  'Analytics',
  'System Settings'
];

export const RolesPermissionsPage = () => {
  const { showSnackbar } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState('Super Admin');
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [saving, setSaving] = useState(false);

  // Matrix state: role -> module -> { view: boolean, edit: boolean, delete: boolean, export: boolean }
  const [permissionMatrix, setPermissionMatrix] = useState(() => {
    const matrix = {};
    INITIAL_ROLES.forEach(r => {
      matrix[r] = {};
      MODULES_LIST.forEach(m => {
        const isSuper = r === 'Super Admin';
        const isAdmin = r === 'Admin';
        
        let canView = isSuper || isAdmin;
        let canEdit = isSuper || isAdmin;
        let canDelete = isSuper;
        let canExport = isSuper || isAdmin;

        if (r === 'Contest Manager') {
          canView = ['Dashboard', 'Contest Management', 'Daily Contest Desk', 'Category Management', 'Grand Contest', 'Question Bank', 'Survey Management', 'Task Management', 'Challenge Management', 'Leaderboard', 'Analytics'].includes(m);
          canEdit = canView;
        } else if (r === 'Question Manager') {
          canView = ['Dashboard', 'Question Bank', 'Category Management', 'Contest Management'].includes(m);
          canEdit = canView;
        } else if (r === 'Finance Manager') {
          canView = ['Dashboard', 'Wallet Management', 'Coin Management', 'Withdrawal Management', 'Referral Management', 'Reports', 'Coupon Management', 'System Settings'].includes(m);
          canEdit = canView;
          canExport = true;
        } else if (r === 'Support Manager' || r === 'Support Executive') {
          canView = ['Dashboard', 'User Management', 'KYC Management', 'CMS', 'Notification Panel', 'System Settings'].includes(m);
          canEdit = r === 'Support Manager' && ['User Management', 'KYC Management'].includes(m);
        } else if (r === 'Marketing Manager') {
          canView = ['Dashboard', 'Survey Management', 'Banner Management', 'Referral Management', 'Advertisement Management', 'Coupon Management', 'Analytics'].includes(m);
          canEdit = canView;
        } else if (r === 'Content Moderator') {
          canView = ['Dashboard', 'Contest Management', 'Category Management', 'Question Bank', 'Task Management', 'CMS'].includes(m);
          canEdit = ['CMS', 'Category Management'].includes(m);
        } else if (r === 'KYC Officer') {
          canView = ['Dashboard', 'User Management', 'KYC Management', 'Fraud Detection'].includes(m);
          canEdit = ['KYC Management', 'User Management'].includes(m);
        } else if (r === 'Analytics Manager') {
          canView = ['Dashboard', 'Reports', 'Analytics', 'Leaderboard'].includes(m);
          canExport = true;
        }

        matrix[r][m] = {
          view: canView,
          edit: canEdit,
          delete: canDelete,
          export: canExport
        };
      });
    });
    return matrix;
  });

  // Fetch Matrix from API
  useEffect(() => {
    if (!isMockMode) {
      axios.get('/api/admin/roles-permissions', { withCredentials: true })
        .then(res => {
          if (res.data?.success && res.data?.data && Object.keys(res.data.data).length > 0) {
            setPermissionMatrix(prev => {
              const updated = { ...prev };
              Object.keys(res.data.data).forEach(r => {
                if (!updated[r]) updated[r] = {};
                Object.keys(res.data.data[r]).forEach(m => {
                  updated[r][m] = {
                    ...updated[r][m],
                    ...res.data.data[r][m]
                  };
                });
              });
              return updated;
            });
            if (res.data.roles && res.data.roles.length > 0) {
              setRoles(prev => Array.from(new Set([...prev, ...res.data.roles])));
            }
          }
        })
        .catch(err => console.error('Failed to load permissions matrix from API:', err));
    }
  }, [isMockMode]);

  const isSuperAdminSelected = selectedRole === 'Super Admin';

  const togglePermission = (moduleName, permType) => {
    if (isSuperAdminSelected) return; // Super Admin has permanent full access
    setPermissionMatrix(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [moduleName]: {
          ...prev[selectedRole]?.[moduleName],
          [permType]: !prev[selectedRole]?.[moduleName]?.[permType]
        }
      }
    }));
  };

  const handleGrantAll = () => {
    if (isSuperAdminSelected) return;
    setPermissionMatrix(prev => {
      const next = { ...prev };
      next[selectedRole] = {};
      MODULES_LIST.forEach(m => {
        next[selectedRole][m] = { view: true, edit: true, delete: true, export: true };
      });
      return next;
    });
    showSnackbar(`Granted full access for ${selectedRole}`, 'success');
  };

  const handleRevokeAll = () => {
    if (isSuperAdminSelected) return;
    setPermissionMatrix(prev => {
      const next = { ...prev };
      next[selectedRole] = {};
      MODULES_LIST.forEach(m => {
        next[selectedRole][m] = { view: false, edit: false, delete: false, export: false };
      });
      return next;
    });
    showSnackbar(`Revoked all permissions for ${selectedRole}`, 'info');
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      showSnackbar('Please enter a role title', 'warning');
      return;
    }
    const roleTitle = newRoleName.trim();
    if (roles.includes(roleTitle)) {
      showSnackbar('Role already exists!', 'warning');
      return;
    }

    if (!isMockMode) {
      try {
        await axios.post('/api/admin/roles-permissions/role', { role: roleTitle }, { withCredentials: true });
      } catch (err) {
        console.error('API error creating custom role:', err);
      }
    }

    setRoles([...roles, roleTitle]);
    setPermissionMatrix(prev => {
      const next = { ...prev };
      next[roleTitle] = {};
      MODULES_LIST.forEach(m => {
        next[roleTitle][m] = { view: true, edit: false, delete: false, export: false };
      });
      return next;
    });
    setSelectedRole(roleTitle);
    setShowAddRoleModal(false);
    setNewRoleName('');
    showSnackbar(`New Role "${roleTitle}" created!`, 'success');
  };

  const handleSaveMatrix = async () => {
    setSaving(true);
    try {
      if (!isMockMode) {
        const res = await axios.put('/api/admin/roles-permissions', {
          role: selectedRole,
          permissions: permissionMatrix[selectedRole]
        }, { withCredentials: true });

        if (res.data?.success) {
          showSnackbar(`Permission matrix for "${selectedRole}" saved successfully!`, 'success');
        } else {
          showSnackbar(res.data?.message || 'Failed to save matrix.', 'error');
        }
      } else {
        showSnackbar(`Permission matrix for "${selectedRole}" saved in Mock Mode!`, 'success');
      }
    } catch (err) {
      console.error('API Error saving permission matrix:', err);
      showSnackbar(err.response?.data?.message || 'Failed to save permission matrix to DB.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetRole = () => {
    if (isSuperAdminSelected) return;
    setPermissionMatrix(prev => {
      const next = { ...prev };
      next[selectedRole] = {};
      MODULES_LIST.forEach(m => {
        const isSuper = selectedRole === 'Super Admin';
        const isAdmin = selectedRole === 'Admin';

        let canView = isSuper || isAdmin;
        let canEdit = isSuper || isAdmin;
        let canDelete = isSuper;
        let canExport = isSuper || isAdmin;

        if (selectedRole === 'Contest Manager') {
          canView = ['Dashboard', 'Contest Management', 'Daily Contest Desk', 'Category Management', 'Grand Contest', 'Question Bank', 'Survey Management', 'Task Management', 'Challenge Management', 'Leaderboard', 'Analytics'].includes(m);
          canEdit = canView;
        } else if (selectedRole === 'Question Manager') {
          canView = ['Dashboard', 'Question Bank', 'Category Management', 'Contest Management'].includes(m);
          canEdit = canView;
        } else if (selectedRole === 'Finance Manager') {
          canView = ['Dashboard', 'Wallet Management', 'Coin Management', 'Withdrawal Management', 'Referral Management', 'Reports', 'Coupon Management', 'System Settings'].includes(m);
          canEdit = canView;
          canExport = true;
        } else if (selectedRole === 'Support Manager' || selectedRole === 'Support Executive') {
          canView = ['Dashboard', 'User Management', 'KYC Management', 'CMS', 'Notification Panel', 'System Settings'].includes(m);
          canEdit = selectedRole === 'Support Manager' && ['User Management', 'KYC Management'].includes(m);
        } else if (selectedRole === 'Marketing Manager') {
          canView = ['Dashboard', 'Survey Management', 'Banner Management', 'Referral Management', 'Advertisement Management', 'Coupon Management', 'Analytics'].includes(m);
          canEdit = canView;
        } else if (selectedRole === 'Content Moderator') {
          canView = ['Dashboard', 'Contest Management', 'Category Management', 'Question Bank', 'Task Management', 'CMS'].includes(m);
          canEdit = ['CMS', 'Category Management'].includes(m);
        } else if (selectedRole === 'KYC Officer') {
          canView = ['Dashboard', 'User Management', 'KYC Management', 'Fraud Detection'].includes(m);
          canEdit = ['KYC Management', 'User Management'].includes(m);
        } else if (selectedRole === 'Analytics Manager') {
          canView = ['Dashboard', 'Reports', 'Analytics', 'Leaderboard'].includes(m);
          canExport = true;
        }

        next[selectedRole][m] = {
          view: canView,
          edit: canEdit,
          delete: canDelete,
          export: canExport
        };
      });
      return next;
    });
    showSnackbar(`Permissions reset to default for "${selectedRole}"`, 'info');
  };

  const getActivePermissionsCount = (roleName) => {
    const roleObj = permissionMatrix[roleName];
    if (!roleObj) return 0;
    let count = 0;
    Object.values(roleObj).forEach((mod) => {
      if (mod.view) count++;
      if (mod.edit) count++;
      if (mod.delete) count++;
      if (mod.export) count++;
    });
    return count;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-7 h-7 text-purple-500" /> Roles & Permissions Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Configure access controls, module visibility, create/edit/delete & export rights per admin role.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetRole}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-200"
          >
            <RotateCcw className="w-4 h-4" /> Reset Defaults
          </button>
          <button
            onClick={() => setShowAddRoleModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-500/10 text-purple-500 font-semibold text-xs rounded-xl hover:bg-purple-500/20 border border-purple-500/20"
          >
            <Plus className="w-4 h-4" /> Add Custom Role
          </button>
          <button
            onClick={handleSaveMatrix}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold text-xs rounded-xl shadow-lg hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Matrix'}
          </button>
        </div>
      </div>

      {/* Role Selection Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {roles.map(r => {
          const isActive = selectedRole === r;
          const permCount = getActivePermissionsCount(r);
          return (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-2xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-500'}`} />
              <span>{r}</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-purple-500/10 text-purple-500'
              }`}>
                {permCount} Perms
              </span>
            </button>
          );
        })}
      </div>

      {/* Role Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Configuring Matrix for:</span>
          <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 text-xs font-extrabold">
            {selectedRole}
          </span>
          {isSuperAdminSelected && (
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> System Root (Full Unrestricted Access)
            </span>
          )}
        </div>

        {!isSuperAdminSelected && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleGrantAll}
              className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Grant All Access
            </button>
            <button
              onClick={handleRevokeAll}
              className="px-3 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Revoke All Access
            </button>
          </div>
        )}
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-5 py-4">Module Name</th>
                <th className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-blue-500" /> View Access
                  </div>
                </th>
                <th className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-amber-500" /> Create / Edit
                  </div>
                </th>
                <th className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete / Approve
                  </div>
                </th>
                <th className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Download className="w-3.5 h-3.5 text-emerald-500" /> Export Data
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {MODULES_LIST.map(mod => {
                const perms = permissionMatrix[selectedRole]?.[mod] || { view: false, edit: false, delete: false, export: false };
                return (
                  <tr key={mod} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-purple-500" /> {mod}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSuperAdminSelected ? true : perms.view}
                        disabled={isSuperAdminSelected}
                        onChange={() => togglePermission(mod, 'view')}
                        className="w-4 h-4 accent-purple-600 rounded cursor-pointer disabled:opacity-80"
                      />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSuperAdminSelected ? true : perms.edit}
                        disabled={isSuperAdminSelected}
                        onChange={() => togglePermission(mod, 'edit')}
                        className="w-4 h-4 accent-purple-600 rounded cursor-pointer disabled:opacity-80"
                      />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSuperAdminSelected ? true : perms.delete}
                        disabled={isSuperAdminSelected}
                        onChange={() => togglePermission(mod, 'delete')}
                        className="w-4 h-4 accent-purple-600 rounded cursor-pointer disabled:opacity-80"
                      />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSuperAdminSelected ? true : perms.export}
                        disabled={isSuperAdminSelected}
                        onChange={() => togglePermission(mod, 'export')}
                        className="w-4 h-4 accent-purple-600 rounded cursor-pointer disabled:opacity-80"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Custom Staff Role</h3>
              <button onClick={() => setShowAddRoleModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <label className="block text-slate-400 mb-1 font-semibold">Role Name / Title</label>
              <input
                type="text"
                placeholder="e.g. Compliance Auditor or Regional Moderator"
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddRoleModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleAddRole} className="px-4 py-2 text-xs font-semibold bg-purple-600 text-white rounded-xl">Create Role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissionsPage;
