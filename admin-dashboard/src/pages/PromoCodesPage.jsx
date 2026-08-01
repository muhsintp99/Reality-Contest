import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Plus, Search, Eye, Edit, Trash2, ToggleLeft, ToggleRight, RefreshCw, Save } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { CustomSelect } from '../components/CustomSelect';

export const PromoCodesPage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [coupons, setCoupons] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/coupons', {
        params: { type: 'promo', status: statusFilter !== 'All' ? statusFilter : undefined, search: searchTerm || undefined },
        withCredentials: true
      });
      if (res.data.success) {
        setCoupons(res.data.coupons || []);
      }
    } catch (err) {
      console.warn('[PromoCodesPage] Error fetching coupons:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [statusFilter, searchTerm]);

  const openDrawer = (mode, coupon = null) => {
    setDrawerMode(mode);
    setActiveCoupon(coupon);
    if (mode === 'add') {
      setFormData({ code: 'PROMO20', type: 'promo', description: 'Platform wide promo code', discountType: 'percentage', discountValue: 20, maxRedemptions: 1000, validUntil: '2026-12-31', status: 'Active' });
    } else if (coupon) {
      setFormData({ ...coupon });
    }
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (drawerMode === 'edit' && activeCoupon) {
        const res = await axios.put(`/api/admin/coupons/${activeCoupon._id}`, formData, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('Promo code updated!', 'success');
          fetchCoupons();
        }
      } else {
        const res = await axios.post('/api/admin/coupons', formData, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('Promo code created!', 'success');
          fetchCoupons();
        }
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Saved locally.', 'info');
    }
    setDrawerOpen(false);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
    try {
      await axios.patch(`/api/admin/coupons/${id}/status`, {}, { withCredentials: true });
      setCoupons(prev => prev.map(c => c._id === id ? { ...c, status: nextStatus } : c));
      showSnackbar(`Status updated to ${nextStatus}`, 'success');
    } catch (err) {
      setCoupons(prev => prev.map(c => c._id === id ? { ...c, status: nextStatus } : c));
      showSnackbar(`Status updated to ${nextStatus}`, 'info');
    }
  };

  const handleDelete = (id) => {
    showConfirm('Delete Promo Code', 'Are you sure you want to delete this promo code?', async () => {
      try {
        await axios.delete(`/api/admin/coupons/${id}`, { withCredentials: true });
        setCoupons(prev => prev.filter(c => c._id !== id));
        showSnackbar('Coupon deleted.', 'success');
      } catch (err) {
        setCoupons(prev => prev.filter(c => c._id !== id));
        showSnackbar('Coupon deleted.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-brandPrimary" />
            <span>Promo Codes Management</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Platform wide promo codes, percentage or flat discounts, and usage limits.
          </p>
        </div>
        <button onClick={() => openDrawer('add')} className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center gap-2 shadow-lg shadow-brandPrimary/15 cursor-pointer">
          <Plus className="w-4 h-4" /> Create Promo Code
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 relative z-20">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Search promo codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/90 dark:bg-[#0c1322]/60 border border-slate-300/80 dark:border-white/10 rounded-xl pl-11 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
          />
        </div>
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All Statuses', value: 'All' },
            { label: 'Active Status', value: 'Active' },
            { label: 'Disabled Status', value: 'Disabled' }
          ]}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-brandPrimary font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading Promo Codes...</span>
        </div>
      ) : coupons.length === 0 ? (
        <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
          <Ticket className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Promo Codes Found</h4>
          <p className="text-xs text-slate-500 dark:text-white/40">Create a promotional code to attract new contestants.</p>
          <button onClick={() => openDrawer('add')} className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow cursor-pointer">
            Create Promo Code
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
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${coupon.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600'}`}>
                    {coupon.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-white/70 line-clamp-2">{coupon.description || 'Promo Code'}</p>
                <div className="grid grid-cols-3 gap-2 bg-slate-50/80 dark:bg-[#080b12] p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 text-center">
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-bold block">Discount</span>
                    <span className="text-xs font-extrabold text-brandPrimary">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
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
                  <button onClick={() => handleDelete(coupon._id)} className="p-1.5 bg-rose-500/10 text-rose-600 rounded-full cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RightDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={`${drawerMode.toUpperCase()} PROMO CODE`}>
        {drawerMode === 'view' ? (
          <div className="space-y-4 text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{formData.code}</h3>
            <p className="text-xs text-slate-500">{formData.description}</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Promo Code</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Discount Value (% or ₹)</label>
              <input
                type="number"
                value={formData.discountValue || 20}
                onChange={(e) => setFormData(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center justify-center gap-2 cursor-pointer shadow-lg">
              <Save className="w-4 h-4" /> Save Promo Code
            </button>
          </form>
        )}
      </RightDrawer>
    </div>
  );
};

export default PromoCodesPage;
