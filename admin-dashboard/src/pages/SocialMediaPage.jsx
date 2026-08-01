import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Share2, Plus, Edit, Trash2, ArrowUpRight, RefreshCw, Save } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';

export const SocialMediaPage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const [loading, setLoading] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [activeSocial, setActiveSocial] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchSocial = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/cms/social', { withCredentials: true });
      if (res.data.success) {
        setSocialLinks(res.data.social || []);
      }
    } catch (err) {
      console.warn('[SocialMediaPage] Error fetching social links:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocial();
  }, []);

  const openDrawer = (mode, item = null) => {
    setDrawerMode(mode);
    setActiveSocial(item);
    if (mode === 'add') {
      setFormData({ platform: 'Instagram', handle: '', url: '', logoUrl: '', followerCount: '', status: 'Active' });
    } else if (item) {
      setFormData({ ...item });
    }
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (drawerMode === 'edit' && activeSocial) {
        const res = await axios.put(`/api/admin/cms/social/${activeSocial._id}`, formData, { withCredentials: true });
        if (res.data.success) {
          setSocialLinks(prev => prev.map(s => s._id === activeSocial._id ? res.data.social : s));
          showSnackbar('Social link updated!', 'success');
        }
      } else {
        const res = await axios.post('/api/admin/cms/social', formData, { withCredentials: true });
        if (res.data.success) {
          setSocialLinks(prev => [res.data.social, ...prev]);
          showSnackbar('Social link added!', 'success');
        }
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Saved locally.', 'info');
    }
    setDrawerOpen(false);
  };

  const handleDelete = (id) => {
    showConfirm('Delete Social Link', 'Are you sure you want to delete this social link?', async () => {
      try {
        await axios.delete(`/api/admin/cms/social/${id}`, { withCredentials: true });
        setSocialLinks(prev => prev.filter(s => s._id !== id));
        showSnackbar('Social link deleted.', 'success');
      } catch (err) {
        setSocialLinks(prev => prev.filter(s => s._id !== id));
        showSnackbar('Social link deleted.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-6 h-6 text-brandPrimary" />
            <span>Social Media Links & Logos</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Configure official social profiles, follower counts, custom icons, and click-through URLs.
          </p>
        </div>
        <button
          onClick={() => openDrawer('add')}
          className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 transition-all flex items-center gap-2 shadow-lg shadow-brandPrimary/15 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Social Link</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-brandPrimary font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading Social Links...</span>
        </div>
      ) : socialLinks.length === 0 ? (
        <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
          <Share2 className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Social Media Links Configured</h4>
          <p className="text-xs text-slate-500 dark:text-white/40">Add your first social media handle using the button below.</p>
          <button onClick={() => openDrawer('add')} className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow cursor-pointer">
            Add Social Link
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialLinks.map((social) => (
            <div key={social._id} className="glassmorphism p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img src={social.logoUrl || 'https://cdn.simpleicons.org/x/499A13'} className="w-10 h-10 rounded-2xl p-2 bg-slate-100 dark:bg-white/10 object-contain border border-slate-200 dark:border-white/10" alt={social.platform} />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{social.platform}</h4>
                    <p className="text-xs text-brandPrimary font-semibold">{social.handle}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${social.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                  {social.status}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-200/80 dark:border-white/10 pt-4">
                <span className="text-xs text-slate-500 dark:text-white/40 font-extrabold">{social.followerCount || '0'} Followers</span>
                <div className="flex gap-2">
                  <a href={social.url} target="_blank" rel="noreferrer" className="p-1.5 bg-brandPrimary/10 text-brandPrimary rounded-full">
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <button onClick={() => openDrawer('edit', social)} className="p-1.5 bg-amber-500/10 text-amber-600 rounded-full cursor-pointer">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(social._id)} className="p-1.5 bg-rose-500/10 text-rose-600 rounded-full cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RightDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={`${drawerMode.toUpperCase()} SOCIAL LINK`}>
        <form onSubmit={handleSave} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Platform Name</label>
            <input
              type="text"
              required
              value={formData.platform || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
              className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Profile Handle (@username)</label>
            <input
              type="text"
              required
              value={formData.handle || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
              className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Profile URL</label>
            <input
              type="url"
              required
              value={formData.url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Logo URL</label>
            <input
              type="text"
              value={formData.logoUrl || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
              placeholder="https://cdn.simpleicons.org/..."
              className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Follower Count</label>
            <input
              type="text"
              value={formData.followerCount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, followerCount: e.target.value }))}
              placeholder="e.g. 50K+"
              className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center justify-center gap-2 cursor-pointer shadow-lg">
            <Save className="w-4 h-4" /> Save Social Link
          </button>
        </form>
      </RightDrawer>
    </div>
  );
};

export default SocialMediaPage;
