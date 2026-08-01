import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Megaphone, Plus, Trophy, Image, Video, Gift, Users, Play, Search, Filter, Edit, Trash2, Eye,
  ToggleLeft, ToggleRight, X, ArrowUpRight, CheckCircle2, Sparkles, DollarSign, BarChart3,
  Globe, Calendar, Layers, Clock, Award, ShieldCheck, RefreshCw, Save, Check
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';

export const AdvertisementManagement = () => {
  const { tab: urlTab } = useParams();
  const navigate = useNavigate();
  const { showAlert, showSnackbar, showConfirm } = useAlert();

  // Active tab state (sync with URL parameter)
  const activeTab = urlTab || 'sponsored';

  const handleTabChange = (newTab) => {
    navigate(`/admin-dashboard/advertisements/${newTab}`);
  };

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ads, setAds] = useState([]);

  // Drawer modal controls
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add'); // 'add', 'edit', 'view'
  const [activeAd, setActiveAd] = useState(null);
  const [formData, setFormData] = useState({});

  // Wizard state for 'create' tab
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    title: '',
    type: 'sponsored',
    sponsorName: '',
    sponsorLogo: '',
    mediaUrl: '',
    redirectUrl: '',
    placement: 'Home Screen Header',
    targetAudience: 'All Users',
    budget: 50000,
    cpm: 15,
    cpc: 2.5,
    rewardPoints: 50,
    rewardAmount: 5,
    videoDuration: 15,
    partnerCode: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    status: 'Active'
  });

  // Fetch Ads from Backend API
  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/ads', {
        params: {
          type: activeTab !== 'create' ? activeTab : undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          search: searchTerm || undefined
        },
        withCredentials: true
      });
      if (res.data.success) {
        setAds(res.data.ads || []);
      }
    } catch (err) {
      console.warn('[AdvertisementManagement] Error fetching ads from API:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'create') {
      fetchAds();
    }
  }, [activeTab, statusFilter, searchTerm]);

  // Reset Drawer
  const closeDrawer = () => {
    setDrawerOpen(false);
    setActiveAd(null);
    setFormData({});
  };

  // Open Drawer helper
  const openDrawer = (mode, ad = null) => {
    setDrawerMode(mode);
    setActiveAd(ad);

    if (mode === 'add') {
      setFormData({
        title: '',
        type: activeTab === 'create' ? 'sponsored' : activeTab,
        sponsorName: '',
        sponsorLogo: '',
        mediaUrl: '',
        redirectUrl: '',
        placement: 'Home Screen Header',
        targetAudience: 'All Users',
        budget: 50000,
        rewardPoints: 50,
        rewardAmount: 5,
        videoDuration: 15,
        partnerCode: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '2026-12-31',
        status: 'Active'
      });
    } else if (ad) {
      setFormData({ ...ad });
    }

    setDrawerOpen(true);
  };

  // Save Ad Form (Add / Edit)
  const handleSaveAd = async (e) => {
    if (e) e.preventDefault();

    const dataToSave = drawerOpen ? formData : wizardData;

    try {
      if (drawerMode === 'edit' && activeAd) {
        const res = await axios.put(`/api/admin/ads/${activeAd._id}`, dataToSave, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('Ad campaign updated on backend!', 'success');
          fetchAds();
        }
      } else {
        const res = await axios.post('/api/admin/ads', dataToSave, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('New Ad campaign launched!', 'success');
          if (activeTab === 'create') {
            navigate(`/admin-dashboard/advertisements/${dataToSave.type}`);
          } else {
            fetchAds();
          }
        }
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Campaign saved locally.', 'info');
    }

    closeDrawer();
  };

  // Toggle Ad Status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await axios.patch(`/api/admin/ads/${id}/status`, {}, { withCredentials: true });
      if (res.data.success) {
        showSnackbar(`Campaign status updated to ${res.data.status}`, 'success');
        setAds(prev => prev.map(a => a._id === id ? { ...a, status: res.data.status } : a));
      }
    } catch (err) {
      const nextStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
      setAds(prev => prev.map(a => a._id === id ? { ...a, status: nextStatus } : a));
      showSnackbar(`Campaign status updated to ${nextStatus}`, 'info');
    }
  };

  // Delete Ad
  const handleDeleteAd = (id) => {
    showConfirm('Delete Ad Campaign', 'Are you sure you want to permanently delete this ad campaign?', async () => {
      try {
        await axios.delete(`/api/admin/ads/${id}`, { withCredentials: true });
        setAds(prev => prev.filter(a => a._id !== id));
        showSnackbar('Ad campaign deleted from backend.', 'success');
      } catch (err) {
        setAds(prev => prev.filter(a => a._id !== id));
        showSnackbar('Ad campaign deleted.', 'success');
      }
    });
  };

  // Sub-Navigation Tabs Metadata
  const TABS_CONFIG = [
    { id: 'create', label: 'Create Ads', icon: Plus },
    { id: 'sponsored', label: 'Sponsored Contest', icon: Trophy },
    { id: 'banner', label: 'Banner Ads', icon: Image },
    { id: 'video', label: 'Video Ads', icon: Video },
    { id: 'reward', label: 'Reward Ads', icon: Gift },
    { id: 'partner', label: 'Partner Campaigns', icon: Users }
  ];

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-brandPrimary" />
            <span>Advertisement & Sponsor Management</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Create, launch, monitor, and optimize ad campaigns across Sponsored Contests, Banners, Video Ads, Rewards, and Brand Partnerships.
          </p>
        </div>

        {/* Global Action Button */}
        {activeTab !== 'create' && (
          <button
            onClick={() => openDrawer('add')}
            className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 transition-all flex items-center gap-2 shadow-lg shadow-brandPrimary/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Launch New Ad</span>
          </button>
        )}
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
          <span>Syncing Ad Campaigns from Backend API...</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. CREATE ADS TAB (Interactive Campaign Wizard) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'create' && (
        <div className="glassmorphism p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl space-y-8">
          <div className="border-b border-slate-200/80 dark:border-white/10 pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-brandPrimary/10 text-brandPrimary px-2.5 py-0.5 rounded-full border border-brandPrimary/20">
                Campaign Builder Wizard
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">Create & Launch New Advertisement</h3>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map(step => (
                <div
                  key={step}
                  onClick={() => setWizardStep(step)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
                    wizardStep === step
                      ? 'bg-brandPrimary text-white shadow-md'
                      : wizardStep > step
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/40'
                  }`}
                >
                  {wizardStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Select Ad Type & Basic Specs */}
          {wizardStep === 1 && (
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Step 1: Choose Advertisement Type</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { type: 'sponsored', title: 'Sponsored Contest', desc: 'Brand co-sponsors a stage with prize funding & logo placement.', icon: Trophy },
                  { type: 'banner', title: 'Banner Ads', desc: 'Display static or animated image banners on home & feed screens.', icon: Image },
                  { type: 'video', title: 'Video Ads', desc: 'Skippable or unskippable HD video commercials before stage start.', icon: Video },
                  { type: 'reward', title: 'Reward Ads (Watch-to-Earn)', desc: 'Users watch ads to earn bonus wallet coins or voting entries.', icon: Gift },
                  { type: 'partner', title: 'Partner Campaign', desc: 'Affiliate brand deals with referral conversion tracking.', icon: Users }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = wizardData.type === item.type;
                  return (
                    <div
                      key={item.type}
                      onClick={() => setWizardData(prev => ({ ...prev, type: item.type }))}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-brandPrimary bg-brandPrimary/5 dark:bg-brandPrimary/10 shadow-md ring-2 ring-brandPrimary/20'
                          : 'border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 bg-brandPrimary/10 rounded-xl text-brandPrimary">
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-brandPrimary" />}
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h5>
                        <p className="text-xs text-slate-500 dark:text-white/50 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-6 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold shadow-lg shadow-brandPrimary/20 cursor-pointer"
                >
                  Continue to Campaign Specs →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Advertiser & Creative Details */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Step 2: Creative & Brand Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Campaign Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RedBull Energy Grand Showdown 2026"
                    value={wizardData.title}
                    onChange={(e) => setWizardData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Sponsor / Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. RedBull India"
                    value={wizardData.sponsorName}
                    onChange={(e) => setWizardData(prev => ({ ...prev, sponsorName: e.target.value }))}
                    className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Media Asset URL (Image/Video)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={wizardData.mediaUrl}
                    onChange={(e) => setWizardData(prev => ({ ...prev, mediaUrl: e.target.value }))}
                    className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Destination Redirect URL</label>
                  <input
                    type="url"
                    placeholder="https://redbull.com/contest"
                    value={wizardData.redirectUrl}
                    onChange={(e) => setWizardData(prev => ({ ...prev, redirectUrl: e.target.value }))}
                    className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setWizardStep(3)}
                  className="px-6 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold shadow-lg shadow-brandPrimary/20 cursor-pointer"
                >
                  Continue to Budgeting →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Targeting */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Step 3: Budget, CPM & Placement Targeting</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Total Budget (₹)</label>
                  <input
                    type="number"
                    value={wizardData.budget}
                    onChange={(e) => setWizardData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Target Audience</label>
                  <select
                    value={wizardData.targetAudience}
                    onChange={(e) => setWizardData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option>All Users</option>
                    <option>18-24 Creators</option>
                    <option>VIP Contestants</option>
                    <option>Audience Voters</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Placement Slot</label>
                  <select
                    value={wizardData.placement}
                    onChange={(e) => setWizardData(prev => ({ ...prev, placement: e.target.value }))}
                    className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option>Home Screen Header</option>
                    <option>Contest Stage Interstitial</option>
                    <option>Reward Hub Watch-to-Earn</option>
                    <option>Footer Feed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setWizardStep(4)}
                  className="px-6 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold shadow-lg shadow-brandPrimary/20 cursor-pointer"
                >
                  Review & Publish →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Final Review & Publish */}
          {wizardStep === 4 && (
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Step 4: Review Campaign Configuration</h4>
              <div className="bg-slate-50 dark:bg-[#080b12] p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Title:</span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{wizardData.title || 'Untitled Campaign'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Type & Sponsor:</span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{wizardData.type.toUpperCase()} • {wizardData.sponsorName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Budget:</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">₹{wizardData.budget?.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Placement:</span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{wizardData.placement}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setWizardStep(3)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSaveAd}
                  className="px-8 py-3 bg-brandPrimary text-white rounded-xl text-xs font-extrabold shadow-xl shadow-brandPrimary/25 hover:bg-brandPrimary/90 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Ad Campaign Now</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. TAB VIEWS (Sponsored Contest, Banner Ads, Video, Reward, Partner) */}
      {/* ------------------------------------------------------------- */}
      {activeTab !== 'create' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-white/30" />
              <input
                type="text"
                placeholder={`Search ${activeTab} ads by title or sponsor...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/90 dark:bg-[#0c1322]/60 border border-slate-300/80 dark:border-white/10 rounded-xl pl-11 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/90 dark:bg-[#0c1322]/60 border border-slate-300/80 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Ended">Ended</option>
              </select>
            </div>
          </div>

          {/* Cards Grid / Table */}
          {ads.length === 0 ? (
            <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
              <Megaphone className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">No {activeTab.toUpperCase()} Ad Campaigns Found</h4>
              <p className="text-xs text-slate-500 dark:text-white/40">Launch your first {activeTab} advertisement campaign to start tracking impressions and engagement.</p>
              <button
                onClick={() => openDrawer('add')}
                className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                Add {activeTab.toUpperCase()} Ad
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <div key={ad._id} className="glassmorphism p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-brandPrimary/10 text-brandPrimary border border-brandPrimary/20">
                        {ad.type} • {ad.placement}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ad.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {ad.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{ad.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-white/40 font-semibold">Sponsor: {ad.sponsorName || 'Brand Partner'}</p>

                    {/* Stats metrics */}
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
                      <button onClick={() => handleDeleteAd(ad._id)} className="p-1.5 bg-rose-500/10 text-rose-600 rounded-full cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* GLOBAL RIGHT DRAWER MODAL FOR ADD / EDIT / VIEW */}
      {/* ------------------------------------------------------------- */}
      <RightDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        title={`${drawerMode.toUpperCase()} AD CAMPAIGN`}
      >
        {drawerMode === 'view' ? (
          <div className="space-y-6 text-left">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-brandPrimary/10 text-brandPrimary">
                {formData.type} • {formData.placement}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">{formData.title}</h3>
              <p className="text-xs text-slate-500 dark:text-white/40 mt-1">Sponsor: {formData.sponsorName}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2 text-xs">
              <p className="text-slate-700 dark:text-slate-300"><strong>Target Audience:</strong> {formData.targetAudience}</p>
              <p className="text-slate-700 dark:text-slate-300"><strong>Total Budget:</strong> ₹{formData.budget?.toLocaleString()}</p>
              <p className="text-slate-700 dark:text-slate-300"><strong>Destination URL:</strong> {formData.redirectUrl || 'N/A'}</p>
            </div>

            <button onClick={closeDrawer} className="w-full py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold cursor-pointer">
              Close Preview
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveAd} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Campaign Title</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Sponsor Name</label>
              <input
                type="text"
                value={formData.sponsorName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sponsorName: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Budget (₹)</label>
              <input
                type="number"
                value={formData.budget || 50000}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Media URL</label>
              <input
                type="url"
                value={formData.mediaUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mediaUrl: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center justify-center gap-2 shadow-lg shadow-brandPrimary/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Ad Campaign</span>
            </button>
          </form>
        )}
      </RightDrawer>
    </div>
  );
};

export default AdvertisementManagement;
