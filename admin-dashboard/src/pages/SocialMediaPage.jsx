import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Share2, Plus, Edit, Trash2, ArrowUpRight, RefreshCw, Save, Image as ImageIcon } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { FileUploadPicker, uploadPendingFile } from '../components/FileUploadPicker';

const PRESET_PLATFORMS = [
  'Instagram',
  'Facebook',
  'YouTube',
  'Twitter / X',
  'Telegram',
  'LinkedIn',
  'Discord',
  'TikTok',
  'WhatsApp',
  'Website',
  'Other'
];

export const SocialMediaPage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
      setFormData({
        platform: 'Instagram',
        username: '',
        handle: '',
        url: '',
        logoUrl: '',
        followerCount: '',
        status: 'Active'
      });
    } else if (item) {
      setFormData({
        ...item,
        username: item.username || item.handle || '',
        handle: item.handle || item.username || ''
      });
    }
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Upload pending Base64 logo file to disk (/uploads/social/...)
      const uploadedLogoUrl = await uploadPendingFile(formData.logoUrl, 'social');
      const finalLogo = uploadedLogoUrl || formData.logoUrl || '';

      const payload = {
        ...formData,
        logoUrl: finalLogo,
        username: formData.username || formData.handle || '',
        handle: formData.handle || formData.username || ''
      };

      if (drawerMode === 'edit' && activeSocial) {
        const res = await axios.put(`/api/admin/cms/social/${activeSocial._id}`, payload, { withCredentials: true });
        if (res.data.success) {
          setSocialLinks(prev => prev.map(s => s._id === activeSocial._id ? res.data.social : s));
          showSnackbar('Social link updated successfully!', 'success');
        }
      } else {
        const res = await axios.post('/api/admin/cms/social', payload, { withCredentials: true });
        if (res.data.success) {
          setSocialLinks(prev => [res.data.social, ...prev]);
          showSnackbar('Social link added successfully!', 'success');
        }
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to save social link.', 'error');
    } finally {
      setSaving(false);
      setDrawerOpen(false);
    }
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
            Manage official platform name, user name, profile link, and custom logo image uploads.
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
                  <img
                    src={social.logoUrl || 'https://cdn.simpleicons.org/x/499A13'}
                    className="w-10 h-10 rounded-2xl p-2 bg-slate-100 dark:bg-white/10 object-contain border border-slate-200 dark:border-white/10"
                    alt={social.platform}
                    onError={(e) => { e.target.src = 'https://cdn.simpleicons.org/x/499A13'; }}
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{social.platform}</h4>
                    <p className="text-xs text-brandPrimary font-semibold">{social.username || social.handle}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${social.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                  {social.status}
                </span>
              </div>

              <div className="text-xs text-slate-500 dark:text-white/50 truncate">
                <span className="font-bold text-slate-700 dark:text-white/70">Link: </span>
                <a href={social.url} target="_blank" rel="noreferrer" className="underline text-brandPrimary">
                  {social.url}
                </a>
              </div>

              <div className="flex justify-between items-center border-t border-slate-200/80 dark:border-white/10 pt-4">
                <span className="text-xs text-slate-500 dark:text-white/40 font-extrabold">{social.followerCount || 'Official'}</span>
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

      <RightDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={`${drawerMode.toUpperCase()} SOCIAL MEDIA LINK`}>
        <form onSubmit={handleSave} className="space-y-4 text-left">
          {/* 1. Platform Name */}
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Platform Name</label>
            <select
              value={PRESET_PLATFORMS.includes(formData.platform) ? formData.platform : 'Other'}
              onChange={(e) => {
                const val = e.target.value;
                setFormData(prev => ({ ...prev, platform: val === 'Other' ? '' : val }));
              }}
              className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none mb-1.5"
            >
              {PRESET_PLATFORMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder="e.g. Instagram, YouTube, TikTok"
              value={formData.platform || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
              className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* 2. User Name / Handle */}
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">User Name / Handle (@username)</label>
            <input
              type="text"
              required
              placeholder="e.g. @hakaofficial or Haka Platform"
              value={formData.username || formData.handle || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value, handle: e.target.value }))}
              className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* 3. Profile Link / URL */}
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Profile Link / URL</label>
            <input
              type="url"
              required
              placeholder="https://instagram.com/hakaofficial"
              value={formData.url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* 4. Logo Upload */}
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-brandPrimary" />
              <span>Platform Logo Upload</span>
            </label>
            <FileUploadPicker
              label="Upload Social Logo Image"
              type="image"
              folder="social"
              value={formData.logoUrl || ''}
              onChange={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))}
            />
            <input
              type="text"
              placeholder="Or paste Logo Image URL (SVG/PNG)"
              value={formData.logoUrl || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
              className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-[11px] text-slate-900 dark:text-white focus:outline-none mt-1"
            />
          </div>

          {/* 5. Follower Count (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Follower Count (Optional)</label>
            <input
              type="text"
              value={formData.followerCount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, followerCount: e.target.value }))}
              placeholder="e.g. 50K+ or 100K Subscribers"
              className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* 6. Status */}
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Status</label>
            <select
              value={formData.status || 'Active'}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Social Link'}</span>
          </button>
        </form>
      </RightDrawer>
    </div>
  );
};

export default SocialMediaPage;
