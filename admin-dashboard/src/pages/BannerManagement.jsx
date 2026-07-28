import React, { useState } from 'react';
import {
  Image, Plus, Megaphone, Calendar, Sparkles, Eye, Trash2, Edit, Search, Filter, ToggleLeft, ToggleRight, X
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const BannerManagement = () => {
  const { showSnackbar } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [viewingBanner, setViewingBanner] = useState(null);
  const [deletingBanner, setDeletingBanner] = useState(null);

  const [banners, setBanners] = useState([
    { id: 'BNR-01', title: 'Grand Audition Season 1 Header', type: 'Home Banner', targetUrl: '/contests/grand-2026', impressions: '142.5K', status: 'Active' },
    { id: 'BNR-02', title: 'Diwali Special Contest Popup', type: 'Festival Banner', targetUrl: '/contests/festival-pass', impressions: '89.1K', status: 'Active' },
    { id: 'BNR-03', title: 'RedBull Energy Sponsored Hero', type: 'Sponsored Banner', targetUrl: '/sponsor/redbull', impressions: '210.0K', status: 'Active' },
    { id: 'BNR-04', title: 'Scheduled System Maintenance Alert', type: 'Announcement', targetUrl: '#', impressions: '45.0K', status: 'Inactive' }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Home Banner',
    targetUrl: '/contests',
    status: 'Active'
  });

  const filteredBanners = banners.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || b.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleToggleStatus = (id) => {
    setBanners(prev => prev.map(b => {
      if (b.id === id) {
        const nextStatus = b.status === 'Active' ? 'Inactive' : 'Active';
        showSnackbar(`Banner ${b.id} status set to ${nextStatus}`, 'info');
        return { ...b, status: nextStatus };
      }
      return b;
    }));
  };

  const handleSaveAdd = () => {
    if (!formData.title) {
      showSnackbar('Please enter banner title', 'warning');
      return;
    }
    const newBanner = {
      id: `BNR-${Date.now().toString().slice(-4)}`,
      impressions: '0K',
      ...formData
    };
    setBanners([newBanner, ...banners]);
    showSnackbar('New Banner added!', 'success');
    setShowAddModal(false);
    setFormData({ title: '', type: 'Home Banner', targetUrl: '/contests', status: 'Active' });
  };

  const handleSaveEdit = () => {
    setBanners(prev => prev.map(b => b.id === editingBanner.id ? editingBanner : b));
    showSnackbar(`Banner ${editingBanner.id} updated!`, 'success');
    setEditingBanner(null);
  };

  const handleDelete = (id) => {
    setBanners(prev => prev.filter(b => b.id !== id));
    showSnackbar(`Banner ${id} deleted!`, 'success');
    setDeletingBanner(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Image className="w-7 h-7 text-rose-500" /> Banner Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Add, Edit, View, Delete, Toggle Active Status & Filter Home, Popup, Festival & Sponsored Banners.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white font-semibold text-xs rounded-xl shadow hover:bg-rose-700"
        >
          <Plus className="w-4 h-4" /> Add New Banner
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search banner title or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Type:</span>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-white">
              <option value="All">All Types</option>
              <option value="Home Banner">Home Banner</option>
              <option value="Festival Banner">Festival Banner</option>
              <option value="Sponsored Banner">Sponsored Banner</option>
              <option value="Announcement">Announcement</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Status:</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-white">
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBanners.map(b => (
          <div key={b.id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="h-28 bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-dashed border-rose-500/30">
              <span className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
                <Image className="w-4 h-4" /> {b.title} Preview
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">{b.id} • {b.type}</span>
              <button
                onClick={() => handleToggleStatus(b.id)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  b.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'
                }`}
              >
                {b.status === 'Active' ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" /> : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />}
                {b.status}
              </button>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{b.title}</h3>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Impressions: <strong className="text-slate-800 dark:text-white">{b.impressions}</strong></span>
              <div className="flex items-center gap-1">
                <button onClick={() => setViewingBanner(b)} title="View Details" className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingBanner(b)} title="Edit Banner" className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeletingBanner(b)} title="Delete Banner" className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Banner</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Banner Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Banner Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white">
                    <option value="Home Banner">Home Banner</option>
                    <option value="Festival Banner">Festival Banner</option>
                    <option value="Sponsored Banner">Sponsored Banner</option>
                    <option value="Announcement">Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target Link URL</label>
                  <input type="text" value={formData.targetUrl} onChange={e => setFormData({...formData, targetUrl: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleSaveAdd} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl">Save Banner</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit {editingBanner.id}</h3>
              <button onClick={() => setEditingBanner(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Banner Title</label>
                <input type="text" value={editingBanner.title} onChange={e => setEditingBanner({...editingBanner, title: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingBanner(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Banner {viewingBanner.id}</h3>
              <button onClick={() => setViewingBanner(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p><strong>Title:</strong> {viewingBanner.title}</p>
            <p><strong>Type:</strong> {viewingBanner.type}</p>
            <p><strong>Target URL:</strong> {viewingBanner.targetUrl}</p>
            <p><strong>Impressions:</strong> {viewingBanner.impressions}</p>
            <p><strong>Status:</strong> {viewingBanner.status}</p>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingBanner(null)} className="px-4 py-2 font-semibold bg-rose-600 text-white rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-rose-500">Delete Banner</h3>
            <p className="text-xs text-slate-400">Are you sure you want to delete <strong>{deletingBanner.title}</strong>?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeletingBanner(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={() => handleDelete(deletingBanner.id)} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
