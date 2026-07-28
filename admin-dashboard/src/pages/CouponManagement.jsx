import React, { useState } from 'react';
import {
  Ticket, Plus, Percent, Gift, CheckCircle, Tag, Search, Filter, Edit, Trash2, Eye, ToggleLeft, ToggleRight, X
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const CouponManagement = () => {
  const { showSnackbar } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [viewingCoupon, setViewingCoupon] = useState(null);
  const [deletingCoupon, setDeletingCoupon] = useState(null);

  const [coupons, setCoupons] = useState([
    { code: 'HAKA50', type: 'Discount Entry Fee', discount: '50% OFF Entry Fee', maxUses: 5000, used: 1420, expires: '2026-08-31', status: 'Active' },
    { code: 'FREEPASS2026', type: 'Free Entry', discount: '100% Free Contest Entry', maxUses: 1000, used: 998, expires: '2026-07-31', status: 'Active' },
    { code: 'REWARD20', type: 'Reward Coupon', discount: '₹20 Cash Bonus', maxUses: 2000, used: 2000, expires: '2026-07-15', status: 'Inactive' }
  ]);

  const [formData, setFormData] = useState({
    code: '',
    type: 'Discount Entry Fee',
    discount: '25% OFF',
    maxUses: 1000,
    expires: '2026-12-31',
    status: 'Active'
  });

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) || c.discount.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (code) => {
    setCoupons(prev => prev.map(c => {
      if (c.code === code) {
        const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
        showSnackbar(`Coupon ${c.code} status set to ${nextStatus}`, 'info');
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleSaveAdd = () => {
    if (!formData.code) {
      showSnackbar('Please enter coupon code', 'warning');
      return;
    }
    const newCoupon = {
      used: 0,
      ...formData
    };
    setCoupons([newCoupon, ...coupons]);
    showSnackbar(`Coupon ${formData.code} created!`, 'success');
    setShowAddModal(false);
    setFormData({ code: '', type: 'Discount Entry Fee', discount: '25% OFF', maxUses: 1000, expires: '2026-12-31', status: 'Active' });
  };

  const handleSaveEdit = () => {
    setCoupons(prev => prev.map(c => c.code === editingCoupon.code ? editingCoupon : c));
    showSnackbar(`Coupon ${editingCoupon.code} updated!`, 'success');
    setEditingCoupon(null);
  };

  const handleDelete = (code) => {
    setCoupons(prev => prev.filter(c => c.code !== code));
    showSnackbar(`Coupon ${code} deleted!`, 'success');
    setDeletingCoupon(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-7 h-7 text-amber-500" /> Coupon & Promo Code Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Add, Edit, View, Delete, Toggle Active Status & Filter Promo Codes & Reward Coupons.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-semibold text-xs rounded-xl shadow hover:bg-amber-600"
        >
          <Plus className="w-4 h-4" /> Add Coupon Code
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search coupon code or discount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Status:</span>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs rounded-xl px-3 py-2 text-slate-800 dark:text-white">
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Coupon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCoupons.map(cp => (
          <div key={cp.code} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                {cp.code}
              </span>
              <button
                onClick={() => handleToggleStatus(cp.code)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  cp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'
                }`}
              >
                {cp.status === 'Active' ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" /> : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />}
                {cp.status}
              </button>
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">{cp.discount}</div>
            <div className="text-[11px] text-slate-400">Type: {cp.type}</div>
            <div className="text-xs text-slate-400 flex justify-between bg-slate-50 dark:bg-white/5 p-2 rounded-xl">
              <span>Used: <strong className="text-slate-800 dark:text-white">{cp.used} / {cp.maxUses}</strong></span>
              <span>Expires: <strong className="text-slate-800 dark:text-white">{cp.expires}</strong></span>
            </div>
            <div className="flex items-center justify-end gap-1 pt-1">
              <button onClick={() => setViewingCoupon(cp)} title="View Details" className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setEditingCoupon(cp)} title="Edit Coupon" className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDeletingCoupon(cp)} title="Delete Coupon" className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Coupon Code</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Coupon Code (Uppercase)</label>
                <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. FESTIVAL100" className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white uppercase font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Discount Amount / %</label>
                  <input type="text" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Max Usage Count</label>
                  <input type="number" value={formData.maxUses} onChange={e => setFormData({...formData, maxUses: Number(e.target.value)})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleSaveAdd} className="px-4 py-2 text-xs font-semibold bg-amber-500 text-white rounded-xl">Save Coupon</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit {editingCoupon.code}</h3>
              <button onClick={() => setEditingCoupon(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Discount Text</label>
                <input type="text" value={editingCoupon.discount} onChange={e => setEditingCoupon({...editingCoupon, discount: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingCoupon(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 text-xs font-semibold bg-amber-500 text-white rounded-xl">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Coupon {viewingCoupon.code}</h3>
              <button onClick={() => setViewingCoupon(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p><strong>Code:</strong> {viewingCoupon.code}</p>
            <p><strong>Discount:</strong> {viewingCoupon.discount}</p>
            <p><strong>Type:</strong> {viewingCoupon.type}</p>
            <p><strong>Used:</strong> {viewingCoupon.used} / {viewingCoupon.maxUses}</p>
            <p><strong>Expiry Date:</strong> {viewingCoupon.expires}</p>
            <p><strong>Status:</strong> {viewingCoupon.status}</p>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingCoupon(null)} className="px-4 py-2 font-semibold bg-amber-500 text-white rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-rose-500">Delete Coupon</h3>
            <p className="text-xs text-slate-400">Are you sure you want to delete coupon <strong>{deletingCoupon.code}</strong>?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeletingCoupon(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={() => handleDelete(deletingCoupon.code)} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
