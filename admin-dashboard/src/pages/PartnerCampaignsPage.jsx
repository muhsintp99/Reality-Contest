import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Plus, Search, Eye, Edit, Trash2, ToggleLeft, ToggleRight, RefreshCw, Save, Image as ImageIcon, Video, ExternalLink } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { CustomSelect } from '../components/CustomSelect';
import { FileUploadPicker } from '../components/FileUploadPicker';

export const PartnerCampaignsPage = () => {
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
        params: { type: 'partner', status: statusFilter !== 'All' ? statusFilter : undefined, search: searchTerm || undefined },
        withCredentials: true
      });
      if (res.data.success) {
        setAds(res.data.ads || []);
      }
    } catch (err) {
      console.warn('[PartnerCampaignsPage] Error fetching ads:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [statusFilter, searchTerm]);

  const filteredAds = ads.filter(ad => {
    const matchesSearch = !searchTerm ||
      ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.sponsorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.partnerCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || ad.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDrawer = (mode, ad = null) => {
    setDrawerMode(mode);
    setActiveAd(ad);
    if (mode === 'add') {
      setFormData({
        title: '',
        type: 'partner',
        sponsorName: '',
        mediaUrl: '',
        imageUrl: '',
        videoUrl: '',
        redirectUrl: '',
        partnerCode: '',
        budget: 100000,
        placement: 'Partner Referral Link',
        status: 'Active',
        description: ''
      });
    } else if (ad) {
      setFormData({
        ...ad,
        imageUrl: ad.imageUrl || ad.mediaUrl || '',
        videoUrl: ad.videoUrl || ''
      });
    }
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      type: 'partner',
      mediaUrl: formData.imageUrl || formData.mediaUrl || formData.videoUrl || ''
    };
    const targetId = activeAd?._id || activeAd?.id;

    try {
      if (drawerMode === 'edit' && targetId) {
        const res = await axios.put(`/api/admin/ads/${targetId}`, payload, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('Partner Campaign updated!', 'success');
          fetchAds();
        }
      } else {
        const res = await axios.post('/api/admin/ads', payload, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('Partner Campaign created!', 'success');
          fetchAds();
        }
      }
    } catch (err) {
      if (drawerMode === 'edit' && targetId) {
        setAds(prev => prev.map(a => (a._id === targetId || a.id === targetId) ? { ...a, ...payload } : a));
        showSnackbar('Partner Campaign updated!', 'success');
      } else {
        const newObj = { ...payload, _id: `pt-${Date.now()}`, impressions: 0, clicks: 0 };
        setAds(prev => [newObj, ...prev]);
        showSnackbar('Partner Campaign created!', 'success');
      }
    }
    setDrawerOpen(false);
  };

  const handleToggleStatus = async (adObj) => {
    const targetId = adObj._id || adObj.id;
    const nextStatus = adObj.status === 'Active' ? 'Paused' : 'Active';
    try {
      await axios.patch(`/api/admin/ads/${targetId}/status`, {}, { withCredentials: true });
      setAds(prev => prev.map(a => (a._id === targetId || a.id === targetId) ? { ...a, status: nextStatus } : a));
      showSnackbar(`Status updated to ${nextStatus}`, 'success');
    } catch (err) {
      setAds(prev => prev.map(a => (a._id === targetId || a.id === targetId) ? { ...a, status: nextStatus } : a));
      showSnackbar(`Status updated to ${nextStatus}`, 'info');
    }
  };

  const handleDelete = (adObj) => {
    const targetId = adObj._id || adObj.id;
    showConfirm('Delete Campaign', 'Are you sure you want to delete this partner campaign?', async () => {
      try {
        await axios.delete(`/api/admin/ads/${targetId}`, { withCredentials: true });
        setAds(prev => prev.filter(a => a._id !== targetId && a.id !== targetId));
        showSnackbar('Campaign deleted.', 'success');
      } catch (err) {
        setAds(prev => prev.filter(a => a._id !== targetId && a.id !== targetId));
        showSnackbar('Campaign deleted.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            <span>Partner Campaign Management</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Affiliate link tracking, co-branded promotions, and cross-platform campaign attribution.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openDrawer('add')} className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center gap-2 shadow-lg shadow-brandPrimary/15 cursor-pointer">
            <Plus className="w-4 h-4" /> Add Partner Campaign
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 relative z-20">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Search partner campaigns by title or partner..."
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
          <span>Loading Partner Campaigns...</span>
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Partner Campaigns Found</h4>
          <p className="text-xs text-slate-500 dark:text-white/40">Launch co-branded affiliate campaigns to drive user referrals.</p>
          <button onClick={() => openDrawer('add')} className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow cursor-pointer">
            Add Partner Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad) => (
            <div key={ad._id || ad.id} className="glassmorphism p-5 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {(ad.imageUrl || ad.mediaUrl) && (
                  <img src={ad.imageUrl || ad.mediaUrl} alt={ad.title} className="w-full h-32 object-cover rounded-2xl border border-slate-200 dark:border-white/10" />
                )}
                {ad.videoUrl && !ad.imageUrl && !ad.mediaUrl && (
                  <video src={ad.videoUrl} controls className="w-full h-32 object-cover rounded-2xl border border-slate-200 dark:border-white/10" />
                )}
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    Partner • Code: {ad.partnerCode || 'REF-88'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ad.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600'}`}>
                    {ad.status}
                  </span>
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{ad.title}</h4>
                <p className="text-xs text-slate-500 dark:text-white/40 font-semibold">Partner: {ad.sponsorName || 'Brand Partner'}</p>
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
                  <button onClick={() => openDrawer('view', ad)} className="p-1.5 bg-blue-500/10 text-blue-600 rounded-full cursor-pointer" title="View Specs">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggleStatus(ad)} className="p-1.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white rounded-full cursor-pointer" title="Toggle Status">
                    {ad.status === 'Active' ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-rose-500" />}
                  </button>
                  <button onClick={() => openDrawer('edit', ad)} className="p-1.5 bg-amber-500/10 text-amber-600 rounded-full cursor-pointer" title="Edit Campaign">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(ad)} className="p-1.5 bg-rose-500/10 text-rose-600 rounded-full cursor-pointer" title="Delete Campaign">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RightDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={`${drawerMode.toUpperCase()} PARTNER CAMPAIGN`}>
        {drawerMode === 'view' ? (
          <div className="space-y-4 text-left text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{formData.title}</h3>
            <p className="text-slate-500 dark:text-white/50 font-bold">Partner Code: {formData.partnerCode || 'REF-88'}</p>
            {(formData.imageUrl || formData.mediaUrl) && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Partner Banner</span>
                <img src={formData.imageUrl || formData.mediaUrl} alt="Banner" className="w-full h-40 object-cover rounded-xl border border-slate-200 dark:border-white/10" />
              </div>
            )}
            {formData.videoUrl && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Promo Video</span>
                <video src={formData.videoUrl} controls className="w-full rounded-xl border border-slate-200 dark:border-white/10 max-h-48" />
              </div>
            )}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2">
              <div className="flex justify-between"><span>Budget:</span><span className="font-bold text-emerald-500">₹{formData.budget?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Partner Code:</span><span className="font-bold text-indigo-500">{formData.partnerCode || 'REF-88'}</span></div>
              {formData.redirectUrl && <div className="flex justify-between items-center"><span>Target URL:</span><a href={formData.redirectUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline flex items-center gap-1">Visit Link <ExternalLink className="w-3 h-3" /></a></div>}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-left text-xs">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Campaign Title *</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Partner Brand Name</label>
              <input
                type="text"
                value={formData.sponsorName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sponsorName: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Partner Code</label>
                <input
                  type="text"
                  value={formData.partnerCode || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, partnerCode: e.target.value }))}
                  placeholder="REF-88"
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Budget (₹)</label>
                <input
                  type="number"
                  value={formData.budget || 100000}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Target Redirect URL</label>
              <input
                type="text"
                value={formData.redirectUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, redirectUrl: e.target.value }))}
                placeholder="https://partner.com/campaign"
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Media Uploaders */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> Partner Banner Image
                </label>
                <FileUploadPicker
                  folder="advertisements"
                  accept="image/*"
                  value={formData.imageUrl || formData.mediaUrl || ''}
                  onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url, mediaUrl: url }))}
                  label="Partner Banner Asset"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-500" /> Partner Video Promo (Optional)
                </label>
                <FileUploadPicker
                  folder="advertisements"
                  accept="video/*"
                  value={formData.videoUrl || ''}
                  onChange={(url) => setFormData(prev => ({ ...prev, videoUrl: url }))}
                  label="Partner Video Asset"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-4">
              <Save className="w-4 h-4" /> Save Partner Campaign
            </button>
          </form>
        )}
      </RightDrawer>
    </div>
  );
};

export default PartnerCampaignsPage;
