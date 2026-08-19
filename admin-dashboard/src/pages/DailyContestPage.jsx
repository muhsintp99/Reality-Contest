import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Clock, Plus, Trophy, Award, Sparkles, RefreshCw, Eye, Edit3, Trash2,
  CheckCircle, Play, ShieldAlert, Search, Filter, AlertTriangle, Users, Landmark, Flame,
  Check, X, ToggleLeft, ToggleRight, DollarSign, Image as ImageIcon, Video, FileText, BarChart2
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { CustomSelect } from '../components/CustomSelect';
import { FileUploadPicker, uploadPendingFile } from '../components/FileUploadPicker';



export const DailyContestPage = () => {
  const navigate = useNavigate();
  const { showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Daily Contests & Categories State
  const [dailyContests, setDailyContests] = useState([]);
  const [categories, setCategories] = useState([]);

  // Drawers
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [editingContest, setEditingContest] = useState(null);
  const [viewingContest, setViewingContest] = useState(null);

  // Add Form State
  const [formData, setFormData] = useState({
    dailyContestId: `DLC-${Math.floor(100000 + Math.random() * 900000)}`,
    title: '',
    category: 'Speed Battle',
    entryFee: '0',
    prizePool: '10000',
    timerLimit: '3 mins',
    questionsCount: '20',
    description: '',
    status: 'Registration Open',
    autoReset: true
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: 'Speed Battle',
    entryFee: '0',
    prizePool: '10000',
    timerLimit: '3 mins',
    questionsCount: '20',
    difficulty: 'Medium',
    description: '',
    rules: '',
    status: 'Registration Open',
    isActive: true,
    autoReset: true,
    imageUrl: '',
    videoUrl: ''
  });

  useEffect(() => {
    fetchDailyContests();
    fetchCategories();
  }, [isMockMode]);

  const fetchCategories = async () => {
    try {
      let res = await axios.get('/api/categories', { withCredentials: true }).catch(() => null);
      if (!res || !res.data) {
        res = await axios.get('/api/admin/categories', { withCredentials: true }).catch(() => null);
      }
      const list = res?.data?.categories || res?.data?.data || res?.data || [];
      if (Array.isArray(list)) {
        setCategories(list);
      }
    } catch (err) {
      console.warn('Error fetching categories:', err);
    }
  };

  const fetchDailyContests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/daily-contests', { withCredentials: true });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setDailyContests(res.data.data);
      } else {
        setDailyContests([]);
      }
    } catch (err) {
      console.warn('Error fetching daily contests via API:', err);
      setDailyContests([]);
    } finally {
      setLoading(false);
    }
  };

  // Combine categories fetched from /api/categories API and loaded contests
  const allCategoryNames = Array.from(new Set([
    ...categories.map(c => c.name || c.title || c.categoryName).filter(Boolean),
    ...dailyContests.map(c => c.category).filter(Boolean),
    ...dailyContests.flatMap(c => c.categories || []).filter(Boolean)
  ]));

  const filteredContests = dailyContests.filter(c => {
    // 1. Search Query Filter
    const matchesSearch =
      !searchTerm ||
      (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 2. Category Filter
    const matchesCategory =
      categoryFilter === 'All' ||
      c.category === categoryFilter ||
      (Array.isArray(c.categories) && c.categories.includes(categoryFilter));

    // 3. Execution Status Filter
    const matchesStatus =
      statusFilter === 'All' ||
      c.status === statusFilter;

    // 4. Active / Inactive Status Filter
    const isItemActive = c.isActive !== false && c.status !== 'Draft' && c.status !== 'In Progress';
    const matchesActiveState =
      activeFilter === 'All' ||
      (activeFilter === 'Active' && isItemActive) ||
      (activeFilter === 'Inactive' && !isItemActive);

    return matchesSearch && matchesCategory && matchesStatus && matchesActiveState;
  });

  const handleCreateDailyContest = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      showSnackbar('Please provide a title for the Daily Contest.', 'warning');
      return;
    }

    const payload = {
      dailyContestId: formData.dailyContestId || `DLC-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      categories: [formData.category],
      entryFee: Number(formData.entryFee) || 0,
      prizePool: Number(formData.prizePool) || 10000,
      timerLimit: formData.timerLimit,
      questionsCount: Number(formData.questionsCount) || 20,
      description: formData.description || '',
      status: formData.status
    };

    if (!isMockMode) {
      try {
        const res = await axios.post('/api/admin/daily-contests', payload, { withCredentials: true });
        if (res.data.success) {
          showSnackbar(`Daily Contest "${formData.title}" published!`, 'success');
          fetchDailyContests();
        }
      } catch (err) {
        showSnackbar(err.response?.data?.message || 'Failed to create daily contest', 'error');
        return;
      }
    } else {
      const newDaily = {
        id: `DLC-${Date.now().toString().slice(-3)}`,
        _id: `DLC-${Date.now().toString().slice(-3)}`,
        ...formData,
        entryFee: Number(formData.entryFee) || 0,
        prizePool: Number(formData.prizePool) || 10000,
        participants: 0,
        resetTimer: '24h 00m 00s'
      };
      setDailyContests([newDaily, ...dailyContests]);
      showSnackbar(`Daily Contest "${formData.title}" created!`, 'success');
    }

    setShowAddDrawer(false);
    setFormData({ title: '', category: 'Speed Battle', entryFee: '0', prizePool: '10000', timerLimit: '3 mins', questionsCount: '20', description: '', status: 'Registration Open', autoReset: true });
  };

  const handleUpdateDailyContest = async (e) => {
    e.preventDefault();
    if (!editingContest) return;

    const uploadedImageUrl = await uploadPendingFile(editFormData.imageUrl, 'daily-contest');
    const uploadedVideoUrl = await uploadPendingFile(editFormData.videoUrl, 'daily-contest');

    const payload = {
      title: editFormData.title,
      category: editFormData.category,
      categories: [editFormData.category],
      entryFee: Number(editFormData.entryFee) || 0,
      prizePool: Number(editFormData.prizePool) || 10000,
      timerLimit: editFormData.timerLimit,
      questionsCount: Number(editFormData.questionsCount) || 20,
      difficulty: editFormData.difficulty || 'Medium',
      description: editFormData.description || '',
      rules: editFormData.rules || '',
      status: editFormData.status,
      isActive: editFormData.isActive,
      autoReset: editFormData.autoReset,
      imageUrl: uploadedImageUrl || '',
      videoUrl: uploadedVideoUrl || ''
    };

    if (!isMockMode) {
      try {
        await axios.put(`/api/admin/daily-contests/${id}`, payload, { withCredentials: true });
        showSnackbar(`Daily Contest "${editFormData.title}" updated successfully!`, 'success');
        fetchDailyContests();
      } catch (err) {
        showSnackbar(err.response?.data?.message || 'Failed to update daily contest.', 'error');
        return;
      }
    } else {
      setDailyContests(dailyContests.map(c => ((c._id || c.id || c.dailyContestId) === id ? { ...c, ...payload } : c)));
      showSnackbar(`Daily Contest "${editFormData.title}" updated!`, 'info');
    }

    setEditingContest(null);
  };

  const handleToggleActive = async (contest) => {
    const id = contest._id || contest.id || contest.dailyContestId;
    const newActive = !(contest.isActive !== false);
    const updatedStatus = newActive ? 'Registration Open' : 'Draft';

    if (!isMockMode) {
      try {
        await axios.put(`/api/admin/daily-contests/${id}`, { isActive: newActive, status: updatedStatus }, { withCredentials: true });
        showSnackbar(`Daily Contest "${contest.title}" ${newActive ? 'Activated 🟢' : 'Paused 🔴'}`, 'success');
        fetchDailyContests();
      } catch (err) {
        showSnackbar(err.response?.data?.message || 'Failed to toggle status.', 'error');
      }
    } else {
      setDailyContests(dailyContests.map(c => ((c._id || c.id || c.dailyContestId) === id ? { ...c, isActive: newActive, status: updatedStatus } : c)));
      showSnackbar(`Daily Contest "${contest.title}" ${newActive ? 'Activated 🟢' : 'Paused 🔴'}`, 'info');
    }
  };

  const handleInstantResetLeaderboard = async (contest) => {
    const id = contest._id || contest.id || contest.dailyContestId;
    showConfirm('Instant 24h Reset', `Instantly reset daily standings and timer countdown for "${contest.title}"?`, async () => {
      if (!isMockMode) {
        try {
          await axios.post(`/api/admin/daily-contests/${id}/reset`, {}, { withCredentials: true });
          showSnackbar(`Daily Contest "${contest.title}" standings reset to Day 1!`, 'success');
          fetchDailyContests();
        } catch (err) {
          showSnackbar(err.response?.data?.message || 'Failed to reset daily contest.', 'error');
        }
      } else {
        setDailyContests(dailyContests.map(c => ((c._id || c.id || c.dailyContestId) === id ? { ...c, participants: 0, resetTimer: '24h 00m 00s' } : c)));
        showSnackbar(`Daily Contest "${contest.title}" standings reset!`, 'success');
      }
    });
  };

  const handleDeleteDaily = (contest) => {
    const id = contest._id || contest.id || contest.dailyContestId;
    showConfirm('Delete Daily Contest', `Delete daily contest "${contest.title}"?`, async () => {
      if (!isMockMode) {
        try {
          await axios.delete(`/api/admin/daily-contests/${id}`, { withCredentials: true });
          showSnackbar('Daily contest deleted.', 'success');
          fetchDailyContests();
        } catch (err) {
          showSnackbar(err.response?.data?.message || 'Failed to delete contest.', 'error');
        }
      } else {
        setDailyContests(dailyContests.filter(c => (c._id || c.id || c.dailyContestId) !== id));
        showSnackbar('Daily contest deleted.', 'info');
      }
    });
  };

  const openEditDrawer = (contest) => {
    setEditingContest(contest);
    setEditFormData({
      title: contest.title || '',
      category: contest.category || (Array.isArray(contest.categories) && contest.categories[0]) || 'Speed Battle',
      entryFee: String(contest.entryFee ?? '0'),
      prizePool: String(contest.prizePool ?? '10000'),
      timerLimit: contest.timerLimit || '3 mins',
      questionsCount: String(contest.questionsCount ?? '20'),
      difficulty: contest.difficulty || 'Medium',
      description: contest.description || '',
      rules: contest.rules || '',
      status: contest.status || 'Registration Open',
      isActive: contest.isActive !== false,
      autoReset: contest.autoReset ?? true,
      imageUrl: contest.imageUrl || '',
      videoUrl: contest.videoUrl || ''
    });
  };

  return (
    <div className="p-6 space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-7 h-7 text-amber-500" /> Daily Contest Management Desk ⚡
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Automated 24-hour daily quiz battles, speed tappers, and instant daily prize showdowns.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin-dashboard/daily-contest/create')}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Daily Contest
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Daily Arenas</div>
            <div className="text-2xl font-extrabold text-amber-500 mt-1">{dailyContests.length} Live</div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daily Prize Pool</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {dailyContests.reduce((sum, c) => sum + (Number(c.prizePool) || 0), 0).toLocaleString()} Coins 🪙
            </div>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Daily Joins</div>
            <div className="text-2xl font-extrabold text-brandPrimary mt-1">
              {dailyContests.reduce((sum, c) => sum + (Number(c.participantsCount || c.participants) || 0), 0).toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-brandPrimary/10 text-brandPrimary rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Multi Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Category Filter */}
          <CustomSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: 'All', label: 'All Categories' },
              ...allCategoryNames.map(name => ({
                value: name,
                label: name
              }))
            ]}
            className="w-44"
          />

          {/* Execution Status Filter */}
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Registration Open', label: 'Registration Open' },
              { value: 'Upcoming', label: 'Upcoming' },
              { value: 'Active', label: 'Active ⚡' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Maintenance', label: 'Maintenance 🛠️' }
            ]}
            className="w-48"
          />

          {/* Active / Inactive State Filter */}
          <CustomSelect
            value={activeFilter}
            onChange={setActiveFilter}
            options={[
              { value: 'All', label: 'All Modes' },
              { value: 'Active', label: 'Active (Live)' },
              { value: 'Inactive', label: 'Inactive (Paused)' }
            ]}
            className="w-44"
          />

          {/* Reset Filters Quick Button */}
          {(searchTerm || categoryFilter !== 'All' || statusFilter !== 'All' || activeFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('All');
                setStatusFilter('All');
                setActiveFilter('All');
              }}
              className="px-3 py-2 bg-slate-100 dark:bg-white/10 hover:bg-rose-500/10 text-slate-600 dark:text-slate-300 hover:text-rose-500 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Daily Contests Grid */}
      {filteredContests.length === 0 ? (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-12 text-center space-y-3">
          <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto stroke-1" />
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">No Daily Contests Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No daily contests match your selected search, category or status filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((c) => (
            <div key={c._id || c.id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-amber-500/30 transition-all space-y-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {c.category || (Array.isArray(c.categories) && c.categories[0]) || 'Speed Battle'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${
                      c.isActive !== false && c.status !== 'Draft' && c.status !== 'In Progress'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {c.isActive !== false && c.status !== 'Draft' && c.status !== 'In Progress' ? '🟢 Live' : '🔴 Paused'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-extrabold">
                      {c.entryFee === 0 || c.isFree === true || c.entryFeeType === 'Free' ? (
                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">FREE ENTRY</span>
                      ) : (
                        <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Entry: {c.entryFeeCoins || c.entryFee} Coins 🪙</span>
                      )}
                    </span>
                    <button
                      onClick={() => navigate(`/admin-dashboard/daily-contests/${c._id || c.id}/analytics`)}
                      className="p-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/20 rounded-lg transition-all cursor-pointer"
                      title="Contest Analytics 📊"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{c.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{c.description || '24h automated battle'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-white/5 p-3 rounded-xl text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Prize Pool</div>
                    <div className="font-extrabold text-amber-500">{Number(c.prizePool).toLocaleString()} Coins 🪙</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Daily Participants</div>
                    <div className="font-bold text-slate-900 dark:text-white">{c.participantsCount || c.participants || 0}</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between gap-1 flex-wrap">
                <button
                  onClick={() => navigate(`/admin-dashboard/daily-contests/${c._id || c.id}/analytics`)}
                  className="p-1.5 px-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  title="Daily Contest Analytics"
                >
                  <BarChart2 className="w-3.5 h-3.5" /> Analytics
                </button>
                <button
                  onClick={() => setViewingContest(c)}
                  className="p-1.5 px-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Specs
                </button>
                <button
                  onClick={() => openEditDrawer(c)}
                  className="p-1.5 px-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleToggleActive(c)}
                  className={`p-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                    c.isActive !== false && c.status !== 'Draft' && c.status !== 'In Progress'
                      ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                  }`}
                  title={c.isActive !== false ? 'Pause Contest' : 'Activate Contest'}
                >
                  {c.isActive !== false && c.status !== 'Draft' && c.status !== 'In Progress' ? (
                    <><ToggleRight className="w-3.5 h-3.5" /> Pause</>
                  ) : (
                    <><ToggleLeft className="w-3.5 h-3.5" /> Activate</>
                  )}
                </button>
                <button
                  onClick={() => handleInstantResetLeaderboard(c)}
                  className="p-1.5 px-2 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  title="Instant 24h Reset"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset
                </button>
                <button
                  onClick={() => handleDeleteDaily(c)}
                  className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl text-[11px] font-bold cursor-pointer"
                  title="Delete Daily Contest"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer: Edit Daily Contest */}
      <RightDrawer isOpen={!!editingContest} onClose={() => setEditingContest(null)} title="Edit Daily Contest Controls ✏️">
        {editingContest && (
          <form onSubmit={handleUpdateDailyContest} className="space-y-4 text-left text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contest Title</label>
              <input
                type="text"
                value={editFormData.title}
                onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
              <CustomSelect
                value={editFormData.category}
                onChange={val => setEditFormData({ ...editFormData, category: val })}
                options={categories.map(c => ({
                  value: c.name || c.title || c.categoryName || c._id,
                  label: c.name || c.title || c.categoryName
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Entry Fee (Coins 🪙)</label>
                <input
                  type="number"
                  value={editFormData.entryFee}
                  onChange={e => setEditFormData({ ...editFormData, entryFee: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prize Pool (Coins 🪙)</label>
                <input
                  type="number"
                  value={editFormData.prizePool}
                  onChange={e => setEditFormData({ ...editFormData, prizePool: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Timer Limit</label>
                <input
                  type="text"
                  value={editFormData.timerLimit}
                  onChange={e => setEditFormData({ ...editFormData, timerLimit: e.target.value })}
                  placeholder="3 mins"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Questions Count</label>
                <input
                  type="number"
                  value={editFormData.questionsCount}
                  onChange={e => setEditFormData({ ...editFormData, questionsCount: e.target.value })}
                  placeholder="20"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Difficulty Level</label>
                <CustomSelect
                  value={editFormData.difficulty}
                  onChange={val => setEditFormData({ ...editFormData, difficulty: val })}
                  options={[
                    { value: 'Easy', label: 'Easy' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Hard', label: 'Hard' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                <CustomSelect
                  value={editFormData.status}
                  onChange={val => setEditFormData({ ...editFormData, status: val })}
                  options={[
                    { value: 'Registration Open', label: 'Registration Open' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Draft', label: 'Draft' },
                    { value: 'Completed', label: 'Completed' }
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
              <textarea
                rows={2}
                value={editFormData.description}
                onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Daily contest description..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rules & Instructions</label>
              <textarea
                rows={2}
                value={editFormData.rules}
                onChange={e => setEditFormData({ ...editFormData, rules: e.target.value })}
                placeholder="Contest rules..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Media Attachments */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" /> Contest Banner Image
                </label>
                <FileUploadPicker
                  folder="daily-contests"
                  accept="image/*"
                  value={editFormData.imageUrl}
                  onChange={(url) => setEditFormData({ ...editFormData, imageUrl: url })}
                  label="Contest Banner Image"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-500" /> Promo Video / Teaser
                </label>
                <FileUploadPicker
                  folder="daily-contests"
                  accept="video/*"
                  value={editFormData.videoUrl}
                  onChange={(url) => setEditFormData({ ...editFormData, videoUrl: url })}
                  label="Contest Teaser Video"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingContest(null)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold shadow cursor-pointer"
              >
                Save Contest Specs
              </button>
            </div>
          </form>
        )}
      </RightDrawer>

      {/* Drawer: View Daily Contest Specs */}
      <RightDrawer isOpen={!!viewingContest} onClose={() => setViewingContest(null)} title="Daily Contest Specs 📜">
        {viewingContest && (
          <div className="space-y-4 text-xs text-left">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{viewingContest.title}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20 mt-1 inline-block">
                  {viewingContest.category || 'Speed Battle'}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${
                viewingContest.isActive !== false && viewingContest.status !== 'Draft'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}>
                {viewingContest.isActive !== false ? '🟢 Active' : '🔴 Paused'}
              </span>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Description</div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
                {viewingContest.description || 'Automated 24h daily quiz showdown arena.'}
              </p>
            </div>

            {viewingContest.rules && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Rules & Guidelines</div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
                  {viewingContest.rules}
                </p>
              </div>
            )}

            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl space-y-2.5 border border-slate-200 dark:border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Entry Fee:</span>
                <span className="font-extrabold text-emerald-500">{viewingContest.entryFee === 0 ? 'FREE ENTRY' : `${viewingContest.entryFee} Coins 🪙`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Daily Prize Pool:</span>
                <span className="font-extrabold text-amber-500">{Number(viewingContest.prizePool).toLocaleString()} Coins 🪙</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Timer Limit:</span>
                <span className="font-bold text-slate-800 dark:text-white">{viewingContest.timerLimit || '3 mins'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Questions Count:</span>
                <span className="font-bold text-slate-800 dark:text-white">{viewingContest.questionsCount || 20} Questions</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Difficulty:</span>
                <span className="font-bold text-brandPrimary">{viewingContest.difficulty || 'Medium'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Reset Schedule:</span>
                <span className="font-mono text-emerald-500 font-bold">24-Hour Automated Reset</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Status:</span>
                <span className="font-extrabold text-brandPrimary">{viewingContest.status || 'Registration Open'}</span>
              </div>
            </div>

            {viewingContest.imageUrl && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Banner Image</div>
                <img src={viewingContest.imageUrl} alt="Contest Banner" className="w-full h-36 object-cover rounded-xl border border-slate-200 dark:border-white/10" />
              </div>
            )}

            {viewingContest.videoUrl && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Teaser Video</div>
                <video src={viewingContest.videoUrl} controls className="w-full rounded-xl border border-slate-200 dark:border-white/10 max-h-48" />
              </div>
            )}

            {viewingContest.fileAttachmentUrl && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Rules & Document Attachment</div>
                <a
                  href={viewingContest.fileAttachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl font-bold text-xs border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
                >
                  <FileText className="w-4 h-4" /> View Rules PDF / Document Attachment 📄
                </a>
              </div>
            )}
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default DailyContestPage;
