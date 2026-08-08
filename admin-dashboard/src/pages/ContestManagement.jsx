import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Trophy, Plus, Settings, Sparkles, ShieldAlert, Check, X, Save, Layers, Trash2, Eye, Search,
  Copy, FileText, Video, Image, Clock, HelpCircle, FileCheck, Award, Upload
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { MultiSelect } from '../components/MultiSelect';
import { CustomSelect } from '../components/CustomSelect';
import { FileUploadPicker } from '../components/FileUploadPicker';
import { RichTextEditor } from '../components/RichTextEditor';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const getLocalDateString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentDateString = () => getLocalDateString(new Date());

const getCurrentTimeString = () => {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const splitDateTime = (dateVal) => {
  if (!dateVal) return { date: '', time: '' };
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return { date: '', time: '' };
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`
  };
};

const combineDateTime = (dateStr, timeStr) => {
  if (!dateStr) return null;
  const t = timeStr || '00:00';
  return new Date(`${dateStr}T${t}`);
};

export const ContestManagement = () => {
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth.isMockMode);
  const { markModuleAsRead } = useNotification();
  // Sub-Tab State: 'all' | 'daily' | 'grand' | 'special'
  const [activeTab, setActiveTab] = useState('all');
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingContest, setViewingContest] = useState(null);
  const navigate = useNavigate();

  // Fetched categories
  const [categories, setCategories] = useState([]);

  // Search & Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      rules: '1. Each correct answer carries 10 points.\n2. Negative marking -2 for wrong attempts.\n3. Complete within timer countdown.',
      prize: '100000',
      fee: '499',
      maxPart: '500',
      timerLimit: '30', // Contest Timer in minutes
      difficulty: 'Medium',
      questionsCount: '20',
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500',
      videoUrl: 'https://www.youtube.com/watch?v=sample',
      fileAttachmentUrl: 'https://example.com/rules-guide.pdf',
      selectedCategories: [],
      status: 'Registration Open',
      regStartDate: getCurrentDateString(),
      regStartTime: getCurrentTimeString(),
      regEndDate: '',
      regEndTime: '',
      tStartDate: '',
      tStartTime: '',
      tEndDate: '',
      tEndTime: ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string().required('Contest title is required'),
      description: Yup.string().required('Contest description is required'),
      prize: Yup.number().min(0, 'Prize pool must be positive').required('Prize pool is required'),
      fee: Yup.number().min(0, 'Entry fee must be positive').required('Entry fee is required'),
      maxPart: Yup.number().min(1, 'Max participants must be at least 1').required('Max participants is required'),
      timerLimit: Yup.number().min(1, 'Timer limit must be at least 1 minute').required('Timer is required')
    }),
    onSubmit: async (values) => {
      const data = {
        title: values.title,
        description: values.description,
        rules: values.rules,
        prizePool: parseFloat(values.prize),
        entryFee: parseFloat(values.fee),
        maxParticipants: parseInt(values.maxPart, 10),
        timerLimit: parseInt(values.timerLimit, 10),
        difficulty: values.difficulty,
        questionsCount: parseInt(values.questionsCount, 10),
        imageUrl: values.imageUrl,
        videoUrl: values.videoUrl,
        fileAttachmentUrl: values.fileAttachmentUrl,
        registrationStart: combineDateTime(values.regStartDate, values.regStartTime),
        registrationEnd: combineDateTime(values.regEndDate, values.regEndTime),
        startDate: combineDateTime(values.tStartDate, values.tStartTime),
        endDate: combineDateTime(values.tEndDate, values.tEndTime),
        categories: values.selectedCategories,
        status: values.status
      };

      if (isMockMode) {
        if (editingId) {
          setContests(prev => prev.map(c => c._id === editingId ? { ...c, ...data } : c));
          showSnackbar('Mock contest updated.', 'success');
        } else {
          setContests(prev => [{ _id: `ct-${Date.now()}`, ...data }, ...prev]);
          showSnackbar('Mock contest created.', 'success');
        }
        resetForm();
        return;
      }

      try {
        if (editingId) {
          const res = await axios.put(`/api/contests/${editingId}`, data, { withCredentials: true });
          if (res.data.success) {
            showSnackbar('Contest updated successfully.', 'success');
            resetForm();
            fetchContests();
          }
        } else {
          const res = await axios.post('/api/contests', data, { withCredentials: true });
          if (res.data.success) {
            showSnackbar('Contest created successfully.', 'success');
            resetForm();
            fetchContests();
          }
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to save contest', 'error');
      }
    }
  });

  const fetchContests = async () => {
    if (isMockMode) {
      setContests([
        { 
          _id: 'ct-1', 
          title: 'India Creator Showdown 2026', 
          description: 'Vlogging, photography, and cinematography creative expression.', 
          rules: 'Submit short film before deadline.',
          entryFee: 499, 
          prizePool: 1000000, 
          status: 'Registration Open', 
          timerLimit: 45,
          difficulty: 'Medium',
          questionsCount: 25,
          imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500',
          startDate: '2026-07-01T12:00:00', 
          endDate: '2026-07-15T18:00:00', 
          maxParticipants: 1000, 
          categories: ['cat-2'] 
        },
        { 
          _id: 'ct-2', 
          title: 'National Tech & AI Quiz Arena', 
          description: 'Coding algorithms, spatial logic, and AI machine building quizzes.', 
          rules: 'Negative marking -2 for wrong attempts.',
          entryFee: 199, 
          prizePool: 250000, 
          status: 'Registration Open', 
          timerLimit: 30,
          difficulty: 'Hard',
          questionsCount: 30,
          imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
          startDate: '2026-07-05T10:00:00', 
          endDate: '2026-07-20T20:00:00', 
          maxParticipants: 500, 
          categories: ['cat-1', 'cat-3'] 
        }
      ]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get('/api/contests', { withCredentials: true });
      let data = res.data.contests || [];
      data.sort((a, b) => new Date(b.createdAt || b._id).getTime() - new Date(a.createdAt || a._id).getTime());
      setContests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (isMockMode) {
      setCategories([
        { _id: 'cat-1', title: 'Knowledge' },
        { _id: 'cat-2', title: 'Arts' },
        { _id: 'cat-3', title: 'Gaming' }
      ]);
      return;
    }
    try {
      const res = await axios.get('/api/categories', { withCredentials: true });
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContests();
    fetchCategories();
  }, [isMockMode]);

  const handleEditClick = (c) => {
    setEditingId(c._id);
    const regStartSplit = splitDateTime(c.registrationStart);
    const regEndSplit = splitDateTime(c.registrationEnd);
    const tStartSplit = splitDateTime(c.startDate);
    const tEndSplit = splitDateTime(c.endDate);

    formik.setValues({
      title: c.title,
      description: c.description || '',
      rules: c.rules || '',
      prize: String(c.prizePool),
      fee: String(c.entryFee),
      maxPart: String(c.maxParticipants),
      timerLimit: String(c.timerLimit || 30),
      difficulty: c.difficulty || 'Medium',
      questionsCount: String(c.questionsCount || 20),
      imageUrl: c.imageUrl || '',
      videoUrl: c.videoUrl || '',
      fileAttachmentUrl: c.fileAttachmentUrl || '',
      selectedCategories: c.categories || [],
      status: c.status || 'Registration Open',
      regStartDate: regStartSplit.date,
      regStartTime: regStartSplit.time,
      regEndDate: regEndSplit.date,
      regEndTime: regEndSplit.time,
      tStartDate: tStartSplit.date,
      tStartTime: tStartSplit.time,
      tEndDate: tEndSplit.date,
      tEndTime: tEndSplit.time
    });
    setIsDrawerOpen(true);
  };

  const handleDuplicateClick = (contest) => {
    showConfirm('Duplicate Contest', `Create a duplicate copy of "${contest.title}"?`, async () => {
      if (isMockMode) {
        const cloned = {
          ...contest,
          _id: `ct-${Date.now()}`,
          title: `${contest.title} (Copy)`,
          status: 'Registration Open',
          createdAt: new Date().toISOString()
        };
        setContests([cloned, ...contests]);
        showSnackbar(`Contest "${contest.title}" duplicated!`, 'success');
        return;
      }
      try {
        const res = await axios.post(`/api/contests/${contest._id}/duplicate`, {}, { withCredentials: true });
        if (res.data.success) {
          showSnackbar(`Contest "${contest.title}" duplicated successfully!`, 'success');
          fetchContests();
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to duplicate contest', 'error');
      }
    });
  };

  const handleViewClick = (c) => {
    setViewingContest(c);
    setIsViewDrawerOpen(true);
  };

  const handleDeleteClick = (id, contestTitle) => {
    showConfirm('Delete Contest', `Are you sure you want to permanently delete contest "${contestTitle}"?`, async () => {
      if (isMockMode) {
        setContests(prev => prev.filter(c => c._id !== id));
        showSnackbar('Mock contest deleted.', 'success');
        return;
      }
      try {
        const res = await axios.delete(`/api/contests/${id}`, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('Contest deleted.', 'success');
          fetchContests();
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to delete contest', 'error');
      }
    });
  };

  const resetForm = () => {
    setEditingId(null);
    formik.resetForm();
    setIsDrawerOpen(false);
  };

  const filteredContests = useMemo(() => {
    const q = search.toLowerCase().trim();
    return contests.filter(c => {
      const matchesSearch = 
        !q ||
        (c.title && c.title.toLowerCase().includes(q)) || 
        (c.contestId && c.contestId.toLowerCase().includes(q)) || 
        (c.description && c.description.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || (c.categories && c.categories.includes(categoryFilter));

      let matchesTab = true;
      if (activeTab === 'daily') {
        matchesTab = (c.type === 'Daily Contest') || (c.title && c.title.toLowerCase().includes('daily')) || (c.categories && c.categories.includes('Daily Contest'));
      } else if (activeTab === 'grand') {
        matchesTab = (c.type === 'Grand Audition') || (c.title && c.title.toLowerCase().includes('grand'));
      } else if (activeTab === 'special') {
        matchesTab = (c.type === 'Special Event') || (c.title && c.title.toLowerCase().includes('special'));
      }

      return matchesSearch && matchesStatus && matchesCategory && matchesTab;
    });
  }, [contests, search, statusFilter, categoryFilter, activeTab]);

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-brandPrimary" />
            Contest Management Desk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create, Edit, Delete, Duplicate contests, manage Prize Pools, Entry Fees, Timers & Questions.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin-dashboard/contests/create')}
          className="px-4 py-2 bg-brandPrimary text-white rounded-xl text-xs font-bold shadow-md hover:bg-brandPrimary/90 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Contest
        </button>
      </div>

      {/* Sub-Tabs Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'all', label: 'All Contests', icon: Trophy },
          { id: 'daily', label: 'Daily Contest ⚡', icon: Clock },
          { id: 'grand', label: 'Grand Auditions 🏆', icon: Award },
          { id: 'special', label: 'Special Events 🎉', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-brandPrimary text-white shadow-md shadow-brandPrimary/20'
                  : 'bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Daily Contest Featured Banner (Shown when activeTab === 'daily') */}
      {activeTab === 'daily' && (
        <div className="bg-gradient-to-r from-amber-500/10 via-brandPrimary/10 to-purple-500/10 border border-amber-500/20 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">Daily Arena Live</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-5 h-5 text-amber-500" /> Daily Contests & 24h Reset Arena
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Automated 24-hour daily quiz battles, speed tappers, and instant daily prize challenges with auto-reset leaderboards.
              </p>
            </div>
            <button
              onClick={() => navigate('/admin-dashboard/contests/create')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold shadow flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Daily Contest
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/60 dark:bg-white/5 p-3 rounded-xl border border-amber-500/10">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Daily Battles Active</div>
              <div className="text-lg font-extrabold text-amber-500">4 Live Battles</div>
            </div>
            <div className="bg-white/60 dark:bg-white/5 p-3 rounded-xl border border-amber-500/10">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Daily Reset Countdown</div>
              <div className="text-lg font-extrabold text-emerald-500 font-mono">14h 22m 10s</div>
            </div>
            <div className="bg-white/60 dark:bg-white/5 p-3 rounded-xl border border-amber-500/10">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Daily Prize Money Pool</div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">₹50,000</div>
            </div>
            <div className="bg-white/60 dark:bg-white/5 p-3 rounded-xl border border-amber-500/10">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Today's Daily Joins</div>
              <div className="text-lg font-extrabold text-brandPrimary">2,840 Participants</div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contests by title, rules..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Registration Open', label: 'Registration Open' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' }
            ]}
            className="w-44"
          />
        </div>
      </div>

      {/* Contest Grid / Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
              <div className="w-full h-32 bg-slate-200 dark:bg-white/10 rounded-xl" />
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-full" />
              <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl text-center space-y-3">
          <Trophy className="w-10 h-10 text-slate-300 dark:text-white/20" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Contests Found</h3>
          <p className="text-xs text-slate-400 max-w-sm">No contests match your current search query or filter settings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map(c => (
            <div key={c._id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-brandPrimary/30 transition-all">
              <div className="space-y-3">
                {c.imageUrl && (
                  <img src={c.imageUrl} loading="lazy" decoding="async" className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-white/10" alt="Cover" />
                )}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="px-2 py-0.5 bg-brandPrimary/10 text-brandPrimary font-mono font-bold rounded text-[10px] inline-block mb-1">
                      {c.contestId || `CNT-2026-${String(c._id).slice(-4).toUpperCase()}`}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{c.title}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.status === 'Registration Open' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{c.description}</p>
                
                {/* Financial & Logistics Info */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl text-center text-xs">
                  <div><span className="text-[10px] text-slate-400 block">Prize Pool</span><strong className="text-emerald-500 font-bold">₹{c.prizePool?.toLocaleString()}</strong></div>
                  <div><span className="text-[10px] text-slate-400 block">Entry Fee</span><strong className="text-brandPrimary font-bold">₹{c.entryFee}</strong></div>
                  <div><span className="text-[10px] text-slate-400 block">Timer</span><strong className="text-slate-800 dark:text-white font-bold">{c.timerLimit || 30} mins</strong></div>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3">
                <div className="flex items-center gap-1">
                  <button onClick={() => handleViewClick(c)} title="View Contest Details" className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => navigate(`/admin-dashboard/contests/edit/${c._id}`)} title="Edit Contest" className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDuplicateClick(c)} title="Duplicate Contest" className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-lg">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteClick(c._id, c.title)} title="Delete Contest" className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => navigate(`/admin-dashboard/contests/${c._id}`)}
                  className="px-3 py-1 bg-brandPrimary text-white rounded-lg text-[11px] font-bold hover:bg-brandPrimary/90"
                >
                  Manage Stages
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Drawer */}
      <RightDrawer
        isOpen={isDrawerOpen}
        onClose={resetForm}
        title={editingId ? 'Edit Contest Parameters' : 'Create New Tournament Contest'}
      >
        <form onSubmit={formik.handleSubmit} className="space-y-4 text-left text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contest Title</label>
            <input type="text" name="title" value={formik.values.title} onChange={formik.handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-800 dark:text-white" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
            <textarea name="description" value={formik.values.description} onChange={formik.handleChange} rows={2} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-800 dark:text-white resize-none" />
          </div>

          <RichTextEditor
            label="Contest Rules & Guidelines"
            value={formik.values.rules}
            onChange={(val) => formik.setFieldValue('rules', val)}
            placeholder="Enter rules, negative marking guidelines, disqualification policies..."
            rows={4}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prize Pool (INR)</label>
              <input type="number" name="prize" value={formik.values.prize} onChange={formik.handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Entry Fee (INR)</label>
              <input type="number" name="fee" value={formik.values.fee} onChange={formik.handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-800 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Timer (Mins)</label>
              <input type="number" name="timerLimit" value={formik.values.timerLimit} onChange={formik.handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Max Seats</label>
              <input type="number" name="maxPart" value={formik.values.maxPart} onChange={formik.handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Difficulty</label>
              <CustomSelect value={formik.values.difficulty} onChange={v => formik.setFieldValue('difficulty', v)} options={[{value:'Easy',label:'Easy'},{value:'Medium',label:'Medium'},{value:'Hard',label:'Hard'},{value:'Expert',label:'Expert'}]} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Questions Count</label>
              <input type="number" name="questionsCount" value={formik.values.questionsCount} onChange={formik.handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contest Status</label>
              <CustomSelect
                value={formik.values.status}
                onChange={v => formik.setFieldValue('status', v)}
                options={[
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Upcoming', label: 'Upcoming' },
                  { value: 'Registration Open', label: 'Registration Open' },
                  { value: 'Registration Closed', label: 'Registration Closed' },
                  { value: 'Live', label: 'Live' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Cancelled', label: 'Cancelled' }
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contest Categories</label>
            <MultiSelect
              options={categories.map(c => ({ value: c._id, label: c.title || c.name || c._id }))}
              selected={formik.values.selectedCategories}
              onChange={(vals) => formik.setFieldValue('selectedCategories', vals)}
              placeholder="Select Contest Categories..."
            />
          </div>

          <FileUploadPicker
            label="Cover Image Upload"
            type="image"
            accept="image/*"
            value={formik.values.imageUrl}
            onChange={(val) => formik.setFieldValue('imageUrl', val)}
          />

          <FileUploadPicker
            label="Trailer Video Upload"
            type="video"
            accept="video/*"
            value={formik.values.videoUrl}
            onChange={(val) => formik.setFieldValue('videoUrl', val)}
          />

          <FileUploadPicker
            label="Rules PDF / Document Upload"
            type="file"
            accept=".pdf,.doc,.docx"
            value={formik.values.fileAttachmentUrl}
            onChange={(val) => formik.setFieldValue('fileAttachmentUrl', val)}
          />

          <div className="pt-3">
            <button type="submit" className="w-full py-3 bg-brandPrimary text-white font-bold rounded-xl text-xs shadow-md hover:bg-brandPrimary/90">
              {editingId ? 'Save Contest Updates' : 'Create Contest'}
            </button>
          </div>
        </form>
      </RightDrawer>

      {/* View Drawer */}
      <RightDrawer isOpen={isViewDrawerOpen} onClose={() => setIsViewDrawerOpen(false)} title="Contest Overview & Configuration">
        {viewingContest && (
          <div className="space-y-4 text-left text-xs text-slate-800 dark:text-slate-200">
            {viewingContest.imageUrl && (
              <img src={viewingContest.imageUrl} className="w-full h-40 object-cover rounded-xl border border-slate-200 dark:border-white/10" alt="Cover" />
            )}
            <div><span className="text-[10px] font-bold text-slate-400 block">Contest ID</span><strong className="text-brandPrimary font-mono text-xs">{viewingContest.contestId || `CNT-2026-${String(viewingContest._id).slice(-4).toUpperCase()}`}</strong></div>
            <div><span className="text-[10px] font-bold text-slate-400 block">Title</span><strong className="text-slate-900 dark:text-white text-sm">{viewingContest.title}</strong></div>
            <div><span className="text-[10px] font-bold text-slate-400 block">Description</span><p className="text-slate-600 dark:text-slate-300">{viewingContest.description}</p></div>
            <div><span className="text-[10px] font-bold text-slate-400 block">Contest Rules</span><p className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl font-mono text-[11px]">{viewingContest.rules || 'Standard contest rules apply.'}</p></div>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
              <div><span className="text-slate-400 block text-[10px]">Prize Pool</span><strong className="text-emerald-500 font-bold text-sm">₹{viewingContest.prizePool?.toLocaleString()}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">Entry Fee</span><strong className="text-brandPrimary font-bold text-sm">₹{viewingContest.entryFee}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">Timer Limit</span><strong>{viewingContest.timerLimit || 30} mins</strong></div>
              <div><span className="text-slate-400 block text-[10px]">Difficulty</span><strong>{viewingContest.difficulty || 'Medium'}</strong></div>
            </div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default ContestManagement;
