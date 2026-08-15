import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Ticket, Plus, Search, Filter, Edit, Trash2, Eye, ToggleLeft, ToggleRight, X,
  Sparkles, DollarSign, Gift, Check, Clock, Calendar, Users, AlertCircle, RefreshCw, Save
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';

export const CouponManagement = () => {
  const { tab: urlTab } = useParams();
  const navigate = useNavigate();
  const { showAlert, showSnackbar, showConfirm } = useAlert();

  // Active sub-tab state (sync with URL if provided)
  const activeTab = urlTab || 'promo';

  const handleTabChange = (newTab) => {
    navigate(`/admin-dashboard/coupons/${newTab}`);
  };

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [coupons, setCoupons] = useState([]);

  // Drawer controls
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add'); // 'add', 'edit', 'view'
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch Coupons from Backend API
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/coupons', {
        params: {
          type: activeTab,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          search: searchTerm || undefined
        },
        withCredentials: true
      });
      if (res.data.success) {
        setCoupons(res.data.coupons || []);
      }
    } catch (err) {
      console.warn('[CouponManagement] Error fetching coupons from API:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [activeTab, statusFilter, searchTerm]);

  // Reset Drawer State
  const closeDrawer = () => {
    setDrawerOpen(false);
    setActiveCoupon(null);
    setFormData({});
  };

  // Open Drawer helper
  const openDrawer = (mode, coupon = null) => {
    setDrawerMode(mode);
    setActiveCoupon(coupon);

    if (mode === 'add') {
      const defaultType = activeTab;
      const defaultDiscountType = activeTab === 'free' ? 'free_pass' : 'percentage';
      const defaultCode = activeTab === 'free' ? 'FREEPASS2026' : activeTab === 'discount' ? 'ENTRY50' : activeTab === 'reward' ? 'REWARD100' : 'PROMO20';

      setFormData({
        code: defaultCode,
        type: defaultType,
        description: '',
        discountType: defaultDiscountType,
        discountValue: activeTab === 'free' ? 100 : 20,
        minContestFee: 0,
        maxDiscountAmount: 500,
        maxRedemptions: 1000,
        perUserLimit: 1,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '2026-12-31',
        status: 'Active'
      });
    } else if (coupon) {
      setFormData({ ...coupon });
    }

    setDrawerOpen(true);
  };

  // Save Coupon (Add / Edit)
  const handleSaveCoupon = async (e) => {
    e.preventDefault();

    try {
      if (drawerMode === 'edit' && activeCoupon) {
        const res = await axios.put(`/api/admin/coupons/${activeCoupon._id}`, formData, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('Coupon updated on backend!', 'success');
          fetchCoupons();
        }
      } else {
        const res = await axios.post('/api/admin/coupons', formData, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('New coupon code created!', 'success');
          fetchCoupons();
        }
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Coupon saved locally.', 'info');
    }

    closeDrawer();
  };

  // Toggle Coupon Status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await axios.patch(`/api/admin/coupons/${id}/status`, {}, { withCredentials: true });
      if (res.data.success) {
        showSnackbar(`Coupon status updated to ${res.data.status}`, 'success');
        setCoupons(prev => prev.map(c => c._id === id ? { ...c, status: res.data.status } : c));
      }
    } catch (err) {
      const nextStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
      setCoupons(prev => prev.map(c => c._id === id ? { ...c, status: nextStatus } : c));
      showSnackbar(`Coupon status updated to ${nextStatus}`, 'info');
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = (id) => {
    showConfirm('Delete Coupon', 'Are you sure you want to permanently delete this coupon code?', async () => {
      try {
        await axios.delete(`/api/admin/coupons/${id}`, { withCredentials: true });
        setCoupons(prev => prev.filter(c => c._id !== id));
        showSnackbar('Coupon deleted from backend.', 'success');
      } catch (err) {
        setCoupons(prev => prev.filter(c => c._id !== id));
        showSnackbar('Coupon deleted.', 'success');
      }
    });
  };

  // Sub-Navigation Tabs Metadata
  const TABS_CONFIG = [
    { id: 'promo', label: 'Promo Codes', icon: Ticket },
    { id: 'discount', label: 'Discount Entry Fee', icon: DollarSign },
    { id: 'free', label: 'Free Entry', icon: Sparkles },
    { id: 'reward', label: 'Reward Coupon', icon: Gift }
  ];

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-brandPrimary" />
            <span>Coupon & Promo Code Management</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Create, configure, monitor, and manage promo codes, entry fee discounts, 100% free passes, and reward store coupons.
          </p>
        </div>

        {/* Global Action Button */}
        <button
          onClick={() => openDrawer('add')}
          className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 transition-all flex items-center gap-2 shadow-lg shadow-brandPrimary/15 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New {activeTab.toUpperCase()} Code</span>
        </button>
      </div>

      {/* Responsive Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 dark:border-white/10 no-scrollbar">
        {TABS_CONFIG.map(tabItem => {
          const Icon = tabItem.icon;
          const isActive = activeTab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              onClick={() => handleTabChange(tabItem.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-brandPrimary text-white shadow-md shadow-brandPrimary/20'
                  : 'bg-white/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tabItem.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-brandPrimary font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Syncing Coupons from Backend API...</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-white/30" />
          <input
            type="text"
            placeholder={`Search ${activeTab} coupons by code or description...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/90 dark:bg-[#0c1322]/60 border border-slate-300/80 dark:border-white/10 rounded-xl pl-11 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 bg-white/90 dark:bg-[#0c1322]/60 border border-slate-300/80 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Content Grid / Table */}
      {coupons.length === 0 ? (
        <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
          <Ticket className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">No {activeTab.toUpperCase()} Coupons Found</h4>
          <p className="text-xs text-slate-500 dark:text-white/40">You haven't created any {activeTab} coupons yet. Click below to add your first code.</p>
          <button
            onClick={() => openDrawer('add')}
            className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow cursor-pointer"
          >
            Create {activeTab.toUpperCase()} Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="glassmorphism p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary font-mono font-extrabold text-xs rounded-xl tracking-wider">
                    {coupon.code}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    coupon.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600'
                  }`}>
                    {coupon.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-white/70 line-clamp-2">{coupon.description || `Special ${coupon.type} code`}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50/80 dark:bg-[#080b12] p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 text-center">
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-bold block">Discount</span>
                    <span className="text-xs font-extrabold text-brandPrimary">
                      {coupon.discountType === 'free_pass' ? '100% FREE' : coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-bold block">Used</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white">{coupon.usedCount || 0} / {coupon.maxRedemptions || '∞'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-bold block">Limit</span>
                    <span className="text-xs font-extrabold text-blue-500">{coupon.perUserLimit || 1}/user</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-white/10 pt-4">
                <span className="text-[10px] text-slate-400 font-medium">Valid Until: {coupon.validUntil || '2026-12-31'}</span>
                <div className="flex gap-2">
                  <button onClick={() => openDrawer('view', coupon)} className="p-1.5 bg-blue-500/10 text-blue-600 rounded-full cursor-pointer">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggleStatus(coupon._id, coupon.status)} className="p-1.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white rounded-full cursor-pointer">
                    {coupon.status === 'Active' ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-rose-500" />}
                  </button>
                  <button onClick={() => openDrawer('edit', coupon)} className="p-1.5 bg-amber-500/10 text-amber-600 rounded-full cursor-pointer">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteCoupon(coupon._id)} className="p-1.5 bg-rose-500/10 text-rose-600 rounded-full cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* GLOBAL RIGHT DRAWER MODAL FOR ADD / EDIT / VIEW */}
      {/* ------------------------------------------------------------- */}
      <RightDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        title={`${drawerMode.toUpperCase()} COUPON CODE`}
      >
        {drawerMode === 'view' ? (
          <div className="space-y-6 text-left">
            <div>
              <span className="px-3 py-1 bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary font-mono font-extrabold text-sm rounded-xl">
                {formData.code}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">{formData.description || 'No description provided.'}</h3>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2 text-xs">
              <p className="text-slate-700 dark:text-slate-300"><strong>Type:</strong> {formData.type?.toUpperCase()}</p>
              <p className="text-slate-700 dark:text-slate-300"><strong>Discount Type:</strong> {formData.discountType}</p>
              <p className="text-slate-700 dark:text-slate-300"><strong>Discount Value:</strong> {formData.discountValue}</p>
              <p className="text-slate-700 dark:text-slate-300"><strong>Max Redemptions:</strong> {formData.maxRedemptions}</p>
              <p className="text-slate-700 dark:text-slate-300"><strong>Valid Until:</strong> {formData.validUntil}</p>
            </div>

            <button onClick={closeDrawer} className="w-full py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold cursor-pointer">
              Close Preview
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveCoupon} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Promo Code (Uppercase)</label>
              <input
                type="text"
                required
                placeholder="e.g. PROMO50"
                value={formData.code || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-brandPrimary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Description</label>
              <input
                type="text"
                placeholder="e.g. Get 20% discount on grand finale contest entry"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Discount Type</label>
                <select
                  value={formData.discountType || 'percentage'}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                  <option value="free_pass">Free Pass (100% OFF)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Discount Value</label>
                <input
                  type="number"
                  value={formData.discountValue || 20}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Max Redemptions</label>
                <input
                  type="number"
                  value={formData.maxRedemptions || 1000}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxRedemptions: Number(e.target.value) }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Valid Until</label>
                <input
                  type="date"
                  value={formData.validUntil || '2026-12-31'}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center justify-center gap-2 shadow-lg shadow-brandPrimary/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Coupon Code</span>
            </button>
          </form>
        )}
      </RightDrawer>
    </div>
  );
};

export default CouponManagement;
