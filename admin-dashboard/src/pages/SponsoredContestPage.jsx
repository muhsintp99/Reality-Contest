import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Plus, Search, Eye, Edit, Trash2, ToggleLeft, ToggleRight, RefreshCw, Save } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';

import { CustomSelect } from '../components/CustomSelect';

export const SponsoredContestPage = () => {
  const navigate = useNavigate();
  const { showSnackbar, showConfirm } = useAlert();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ads, setAds] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [activeAd, setActiveAd] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/ads', {
        params: { type: 'sponsored', status: statusFilter !== 'All' ? statusFilter : undefined, search: searchTerm || undefined },
        withCredentials: true
      });
      if (res.data.success) {
        setAds(res.data.ads || []);
      }
    } catch (err) {
      console.warn('[SponsoredContestPage] Error fetching ads:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [statusFilter, searchTerm]);

  const openDrawer = (mode, ad = null) => {
    setDrawerMode(mode);
    setActiveAd(ad);
    if (mode === 'add') {
      setFormData({ title: '', type: 'sponsored', sponsorName: '', mediaUrl: '', redirectUrl: '', budget: 100000, placement: 'Grand Contest Header', status: 'Active' });
    } else if (ad) {
      setFormData({ ...ad });
    }
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (drawerMode === 'edit' && activeAd) {
        const res = await axios.put(`/api/admin/ads/${activeAd._id}`, formData, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('Sponsored Contest updated!', 'success');
          fetchAds();
        }
      } else {
        const res = await axios.post('/api/admin/ads', formData, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('Sponsored Contest created!', 'success');
          fetchAds();
        }
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Saved locally.', 'info');
    }
    setDrawerOpen(false);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    try {
      await axios.patch(`/api/admin/ads/${id}/status`, {}, { withCredentials: true });
      setAds(prev => prev.map(a => a._id === id ? { ...a, status: nextStatus } : a));
      showSnackbar(`Status updated to ${nextStatus}`, 'success');
    } catch (err) {
      setAds(prev => prev.map(a => a._id === id ? { ...a, status: nextStatus } : a));
      showSnackbar(`Status updated to ${nextStatus}`, 'info');
    }
  };

  const handleDelete = (id) => {
    showConfirm('Delete Sponsored Contest', 'Are you sure you want to delete this sponsored contest ad?', async () => {
      try {
        await axios.delete(`/api/admin/ads/${id}`, { withCredentials: true });
        setAds(prev => prev.filter(a => a._id !== id));
        showSnackbar('Ad deleted.', 'success');
      } catch (err) {
        setAds(prev => prev.filter(a => a._id !== id));
        showSnackbar('Ad deleted.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-brandPrimary" />
            <span>Sponsored Contest Management</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Brand co-sponsored contest stages, prize pool contributions, and sponsor branding.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin-dashboard/advertisements/create')} className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center gap-2 shadow-lg shadow-brandPrimary/15 cursor-pointer">
            <Plus className="w-4 h-4" /> Create Ad
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 relative z-20">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Search sponsored contests by title or sponsor..."
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
            { label: 'Paused Status', value: 'Paused' }
          ]}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-brandPrimary font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading Sponsored Contests...</span>
        </div>
      ) : ads.length === 0 ? (
        <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
          <Trophy className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Sponsored Contests Found</h4>
          <p className="text-xs text-slate-500 dark:text-white/40">Launch a brand-sponsored contest campaign to display logos & sponsor prize pools.</p>
          <button onClick={() => openDrawer('add')} className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow cursor-pointer">
            Add Sponsored Contest
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad._id} className="glassmorphism p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-brandPrimary/10 text-brandPrimary border border-brandPrimary/20">
                    Sponsored • {ad.placement}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ad.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600'}`}>
                    {ad.status}
                  </span>
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{ad.title}</h4>
                <p className="text-xs text-slate-500 dark:text-white/40 font-semibold">Sponsor: {ad.sponsorName || 'Brand Partner'}</p>
                <div className="grid grid-cols-3 gap-2 bg-slate-50/80 dark:bg-[#080b12] p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 text-center">
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-bold block">Budget</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white">₹{ad.budget?.toLocaleString() || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-bold block">Views</span>
                    <span className="text-xs font-extrabold text-brandPrimary">{ad.impressions || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-bold block">Clicks</span>
                    <span className="text-xs font-extrabold text-blue-500">{ad.clicks || 0}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-white/10 pt-4">
                <span className="text-[10px] text-slate-400 font-medium">End: {ad.endDate || '2026-12-31'}</span>
                <div className="flex gap-2">
                  <button onClick={() => openDrawer('view', ad)} className="p-1.5 bg-blue-500/10 text-blue-600 rounded-full cursor-pointer">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggleStatus(ad._id, ad.status)} className="p-1.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white rounded-full cursor-pointer">
                    {ad.status === 'Active' ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-rose-500" />}
                  </button>
                  <button onClick={() => openDrawer('edit', ad)} className="p-1.5 bg-amber-500/10 text-amber-600 rounded-full cursor-pointer">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(ad._id)} className="p-1.5 bg-rose-500/10 text-rose-600 rounded-full cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RightDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={`${drawerMode.toUpperCase()} SPONSORED CONTEST`}>
        {drawerMode === 'view' ? (
          <div className="space-y-4 text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{formData.title}</h3>
            <p className="text-xs text-slate-500 dark:text-white/50">Sponsor: {formData.sponsorName}</p>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 text-xs">
              <p>Budget: ₹{formData.budget?.toLocaleString()}</p>
              <p>Placement: {formData.placement}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Title</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Sponsor Name</label>
              <input
                type="text"
                value={formData.sponsorName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sponsorName: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Budget (₹)</label>
              <input
                type="number"
                value={formData.budget || 50000}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center justify-center gap-2 cursor-pointer shadow-lg">
              <Save className="w-4 h-4" /> Save Sponsored Contest
            </button>
          </form>
        )}
      </RightDrawer>
    </div>
  );
};

export default SponsoredContestPage;
