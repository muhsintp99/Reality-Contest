import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Image, Plus, Megaphone, Calendar, Sparkles, Eye, Trash2, Edit, Search, Filter,
  ToggleLeft, ToggleRight, X, ExternalLink, RefreshCw, Check, Layers, Bell, Star,
  Layout, Monitor
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { RightDrawer } from '../components/RightDrawer';

const BANNER_TYPES = [
  { label: 'Home Banner', value: 'Home Banner' },
  { label: 'Popup Banner', value: 'Popup Banner' },
  { label: 'Festival Banner', value: 'Festival Banner' },
  { label: 'Sponsored Banner', value: 'Sponsored Banner' },
  { label: 'Announcement', value: 'Announcement' }
];

const MOCK_DEFAULT_BANNERS = [
  {
    id: 'BNR-01',
    _id: 'BNR-01',
    title: 'Grand Audition Season 1 Hero Banner',
    type: 'Home Banner',
    targetUrl: '/contests/grand-2026',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
    impressions: '142.5K',
    clicks: '18.4K',
    ctr: '12.9%',
    priority: '1',
    status: 'Active',
    description: 'Main homepage hero carousel banner highlighting the Grand Audition 2026 Season.'
  },
  {
    id: 'BNR-02',
    _id: 'BNR-02',
    title: 'Diwali Festive Mega Contest Pass Popup',
    type: 'Popup Banner',
    targetUrl: '/contests/festival-pass',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    impressions: '89.1K',
    clicks: '14.2K',
    ctr: '15.9%',
    priority: '2',
    status: 'Active',
    description: 'Full-screen pop-up banner on contestant app launch promoting Diwali pass discount.'
  },
  {
    id: 'BNR-03',
    _id: 'BNR-03',
    title: 'Holi Festival Color Creator Challenge',
    type: 'Festival Banner',
    targetUrl: '/contests/holi-2026',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    impressions: '64.3K',
    clicks: '9.8K',
    ctr: '15.2%',
    priority: '1',
    status: 'Active',
    description: 'Festive special category banner for seasonal Holi video submissions.'
  },
  {
    id: 'BNR-04',
    _id: 'BNR-04',
    title: 'RedBull Energy Sponsor Arena',
    type: 'Sponsored Banner',
    targetUrl: '/sponsor/redbull',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80',
    impressions: '210.0K',
    clicks: '31.5K',
    ctr: '15.0%',
    priority: '1',
    status: 'Active',
    description: 'Official corporate sponsor promotional banner for RedBull Energy Arena.'
  },
  {
    id: 'BNR-05',
    _id: 'BNR-05',
    title: 'System Maintenance & Feature Release Alert',
    type: 'Announcement',
    targetUrl: '/news/release-v2',
    imageUrl: '',
    impressions: '45.0K',
    clicks: '3.1K',
    ctr: '6.8%',
    priority: '3',
    status: 'Inactive',
    description: 'Notification bar announcement for upcoming server maintenance.'
  }
];

export const BannerManagement = ({ defaultTab = 'all' }) => {
  const { showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  // Sub-Tab State: 'all' | 'home' | 'popup' | 'festival' | 'sponsored' | 'announcement'
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Drawers State
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [viewingBanner, setViewingBanner] = useState(null);

  const [banners, setBanners] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Home Banner',
    targetUrl: '/contests',
    imageUrl: '',
    priority: '1',
    status: 'Active'
  });

  useEffect(() => {
    fetchBanners();
  }, [isMockMode]);

  const fetchBanners = async () => {
    if (isMockMode) {
      setBanners(MOCK_DEFAULT_BANNERS);
      return;
    }
    try {
      const res = await axios.get('/api/admin/banners', { withCredentials: true });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setBanners(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching banners via API:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'Home Banner',
      targetUrl: '/contests',
      imageUrl: '',
      priority: '1',
      status: 'Active'
    });
  };

  // --- TOGGLE BANNER ACTIVE STATUS ---
  const handleToggleStatus = async (id) => {
    const target = banners.find(b => b.id === id || b._id === id);
    if (!target) return;
    const nextStatus = target.status === 'Active' ? 'Inactive' : 'Active';

    if (!isMockMode) {
      try {
        await axios.patch(`/api/admin/banners/${target._id || id}/status`, {}, { withCredentials: true });
      } catch (err) {
        console.error('Error toggling banner status via API:', err);
      }
    }

    setBanners(prev => prev.map(b => (b.id === id || b._id === id) ? { ...b, status: nextStatus } : b));
    if (viewingBanner && (viewingBanner.id === id || viewingBanner._id === id)) {
      setViewingBanner(prev => ({ ...prev, status: nextStatus }));
    }
    showSnackbar(`Banner "${target.title}" status changed to ${nextStatus}`, 'info');
  };

  // --- PUBLISH NEW BANNER ---
  const handleSaveAdd = async () => {
    if (!formData.title.trim()) {
      showSnackbar('Please enter a banner title', 'warning');
      return;
    }

    const newBanner = {
      id: `BNR-${Date.now().toString().slice(-4)}`,
      _id: `BNR-${Date.now().toString().slice(-4)}`,
      impressions: '0K',
      clicks: '0',
      ctr: '0%',
      ...formData
    };

    if (!isMockMode) {
      try {
        const res = await axios.post('/api/admin/banners', newBanner, { withCredentials: true });
        if (res.data && res.data.data) {
          newBanner._id = res.data.data._id || res.data.data.id || newBanner.id;
        }
      } catch (err) {
        console.error('Error creating banner via API:', err);
      }
    }

    setBanners(prev => [newBanner, ...prev]);
    showSnackbar(`New Banner "${newBanner.title}" published!`, 'success');
    setShowAddDrawer(false);
    resetForm();
  };

  // --- SAVE EDIT BANNER ---
  const handleSaveEdit = async () => {
    if (!editingBanner || !editingBanner.title.trim()) {
      showSnackbar('Banner title cannot be empty.', 'warning');
      return;
    }

    if (!isMockMode) {
      try {
        await axios.put(`/api/admin/banners/${editingBanner._id || editingBanner.id}`, editingBanner, { withCredentials: true });
      } catch (err) {
        console.error('Error updating banner via API:', err);
      }
    }

    setBanners(prev => prev.map(b => (b.id === editingBanner.id || b._id === editingBanner._id) ? editingBanner : b));
    if (viewingBanner && (viewingBanner.id === editingBanner.id || viewingBanner._id === editingBanner._id)) {
      setViewingBanner(editingBanner);
    }
    showSnackbar(`Banner "${editingBanner.title}" updated!`, 'success');
    setEditingBanner(null);
  };

  // --- DELETE BANNER ---
  const handleDelete = (banner) => {
    showConfirm('Delete Banner', `Are you sure you want to permanently delete banner "${banner.title}"?`, async () => {
      if (!isMockMode) {
        try {
          await axios.delete(`/api/admin/banners/${banner._id || banner.id}`, { withCredentials: true });
        } catch (err) {
          console.error('Error deleting banner via API:', err);
        }
      }
      setBanners(prev => prev.filter(b => b.id !== banner.id && b._id !== banner._id));
      if (viewingBanner && (viewingBanner.id === banner.id || viewingBanner._id === banner._id)) {
        setViewingBanner(null);
      }
      if (editingBanner && (editingBanner.id === banner.id || editingBanner._id === banner._id)) {
        setEditingBanner(null);
      }
      showSnackbar(`Banner "${banner.title}" deleted!`, 'success');
    });
  };

  // --- FILTERED BANNERS LOGIC ---
  const filteredBanners = useMemo(() => {
    return banners.filter(b => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || b.title.toLowerCase().includes(q) || (b.id && b.id.toLowerCase().includes(q));

      let matchesTab = true;
      if (activeTab === 'home') matchesTab = b.type === 'Home Banner';
      else if (activeTab === 'popup') matchesTab = b.type === 'Popup Banner';
      else if (activeTab === 'festival') matchesTab = b.type === 'Festival Banner';
      else if (activeTab === 'sponsored') matchesTab = b.type === 'Sponsored Banner';
      else if (activeTab === 'announcement') matchesTab = b.type === 'Announcement';

      const matchesType = typeFilter === 'All' || b.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;

      return matchesSearch && matchesTab && matchesType && matchesStatus;
    });
  }, [banners, searchTerm, activeTab, typeFilter, statusFilter]);

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2.5">
            <Image className="w-6 h-6 text-rose-500" />
            Banner & Promotional Media Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Publish and manage Home Banners, Popup Ads, Festival Specials, Sponsored Hero Banners & Announcements.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowAddDrawer(true); }}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Sub-Tabs Navigation matching spec */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'all', label: 'All Banners', icon: Layers },
          { id: 'home', label: 'Home Banner', icon: Layout },
          { id: 'popup', label: 'Popup Banner', icon: Megaphone },
          { id: 'festival', label: 'Festival Banner', icon: Sparkles },
          { id: 'sponsored', label: 'Sponsored Banner', icon: Star },
          { id: 'announcement', label: 'Announcement', icon: Bell }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search banner title or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <CustomSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: 'All Banner Types', value: 'All' },
              ...BANNER_TYPES
            ]}
            className="w-48"
          />

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Statuses', value: 'All' },
              { label: 'Active Status', value: 'Active' },
              { label: 'Inactive Status', value: 'Inactive' }
            ]}
            className="w-40"
          />
        </div>
      </div>

      {/* Banner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBanners.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 text-xs">
            No banners match your current search and filter criteria.
          </div>
        ) : (
          filteredBanners.map(b => (
            <div key={b.id || b._id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3.5 hover:border-rose-500/30 transition-all flex flex-col justify-between">
              {/* Visual Asset Box */}
              <div className="h-32 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-blue-500/10 rounded-xl flex items-center justify-center border border-dashed border-rose-500/30 overflow-hidden relative group">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform" />
                ) : (
                  <span className="text-xs font-bold text-rose-500 flex items-center gap-1.5 p-2 text-center">
                    <Image className="w-4 h-4" /> {b.title} Visual Preview
                  </span>
                )}
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white font-bold">
                  {b.type}
                </span>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-500/80 text-white font-mono text-[10px] font-bold">
                  P-{b.priority || '1'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
                    {b.id || b._id}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(b.id || b._id)}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      b.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'
                    }`}
                  >
                    {b.status === 'Active' ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" /> : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{b.status}</span>
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">{b.title}</h3>
                {b.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{b.description}</p>
                )}
                <p className="text-xs text-slate-400 flex items-center gap-1 truncate pt-0.5">
                  <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" /> Target: <span className="text-slate-300 font-mono underline">{b.targetUrl || '#'}</span>
                </p>
              </div>

              {/* Metrics Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span>Impressions: <strong className="text-slate-800 dark:text-white font-mono">{b.impressions || '0K'}</strong></span>
                  <span>CTR: <strong className="text-emerald-500 font-mono">{b.ctr || '0%'}</strong></span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingBanner(b)}
                    title="View Banner Specs Drawer"
                    className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingBanner(JSON.parse(JSON.stringify(b)))}
                    title="Edit Banner Drawer"
                    className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b)}
                    title="Delete Banner"
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 1. ADD BANNER RIGHTDRAWER */}
      <RightDrawer
        isOpen={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        title="Add New Promotional Banner"
      >
        <div className="space-y-4 text-xs text-left">
          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Banner Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Grand Season 2 Hero Campaign"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Campaign Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Overview of promotional campaign objective..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Banner Type</label>
              <CustomSelect
                value={formData.type}
                onChange={val => setFormData({ ...formData, type: val })}
                options={BANNER_TYPES}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Display Priority</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Target Link URL</label>
            <input
              type="text"
              value={formData.targetUrl}
              onChange={e => setFormData({ ...formData, targetUrl: e.target.value })}
              placeholder="e.g. /contests/season-2"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Image Asset URL (Optional)</label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-mono text-[11px]"
            />
          </div>

          <button
            onClick={handleSaveAdd}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md mt-4 cursor-pointer"
          >
            Publish Banner
          </button>
        </div>
      </RightDrawer>

      {/* 2. EDIT BANNER RIGHTDRAWER */}
      <RightDrawer
        isOpen={Boolean(editingBanner)}
        onClose={() => setEditingBanner(null)}
        title={editingBanner ? `Edit Banner: ${editingBanner.id || editingBanner._id}` : 'Edit Banner'}
      >
        {editingBanner && (
          <div className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Banner Title *</label>
              <input
                type="text"
                value={editingBanner.title || ''}
                onChange={e => setEditingBanner({ ...editingBanner, title: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Description</label>
              <textarea
                rows={2}
                value={editingBanner.description || ''}
                onChange={e => setEditingBanner({ ...editingBanner, description: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Banner Type</label>
                <CustomSelect
                  value={editingBanner.type || 'Home Banner'}
                  onChange={val => setEditingBanner({ ...editingBanner, type: val })}
                  options={BANNER_TYPES}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Display Priority</label>
                <input
                  type="number"
                  value={editingBanner.priority || '1'}
                  onChange={e => setEditingBanner({ ...editingBanner, priority: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Target Link URL</label>
              <input
                type="text"
                value={editingBanner.targetUrl || ''}
                onChange={e => setEditingBanner({ ...editingBanner, targetUrl: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Image Asset URL</label>
              <input
                type="text"
                value={editingBanner.imageUrl || ''}
                onChange={e => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-mono text-[11px]"
              />
            </div>

            <button
              onClick={handleSaveEdit}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md mt-4 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        )}
      </RightDrawer>

      {/* 3. VIEW BANNER SPECS RIGHTDRAWER */}
      <RightDrawer
        isOpen={Boolean(viewingBanner)}
        onClose={() => setViewingBanner(null)}
        title={viewingBanner ? `Banner Specs: ${viewingBanner.id || viewingBanner._id}` : 'Banner Specs'}
      >
        {viewingBanner && (
          <div className="space-y-5 text-xs text-left">
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold font-mono text-rose-500 uppercase bg-rose-500/10 px-2 py-0.5 rounded">
                  {viewingBanner.id || viewingBanner._id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  viewingBanner.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                  {viewingBanner.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewingBanner.title}</h3>
              {viewingBanner.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{viewingBanner.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Category Type</span>
                <strong className="text-rose-400 font-bold text-xs">{viewingBanner.type}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Priority Rank</span>
                <strong className="text-slate-800 dark:text-white font-mono font-bold text-xs">P-{viewingBanner.priority || '1'}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Total Impressions</span>
                <strong className="text-indigo-400 font-mono font-bold text-xs">{viewingBanner.impressions || '0K'}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Click Rate (CTR)</span>
                <strong className="text-emerald-400 font-mono font-bold text-xs">{viewingBanner.ctr || '0%'}</strong>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Target Link URL</span>
              <span className="text-slate-200 font-mono text-xs underline break-all">{viewingBanner.targetUrl || '#'}</span>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Actions</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const target = viewingBanner;
                    setViewingBanner(null);
                    setEditingBanner(JSON.parse(JSON.stringify(target)));
                  }}
                  className="py-2.5 px-3 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-4 h-4" /> Edit Banner
                </button>

                <button
                  onClick={() => handleToggleStatus(viewingBanner.id || viewingBanner._id)}
                  className="py-2.5 px-3 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Toggle Status
                </button>
              </div>

              <button
                onClick={() => handleDelete(viewingBanner)}
                className="w-full py-2 px-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Banner Permanently
              </button>
            </div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default BannerManagement;
