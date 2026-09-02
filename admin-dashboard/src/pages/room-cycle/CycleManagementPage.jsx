import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Clock, Play, RefreshCw, X, Calendar, Sparkles, Eye, Edit3, Plus, Search, Trash2, CheckCircle2, Layers,
  Coins, Users, FileText, Upload, Image as ImageIcon, Video as VideoIcon, Award, AlertCircle, CheckSquare,
  ArrowLeft, Grid, List, Check, ShieldCheck, Flame, ExternalLink, ChevronRight, FileUp, Zap, HelpCircle
} from 'lucide-react';
import axios from 'axios';
import { setCycles, setLoading } from '../../store/roomCycleSlice';
import { useAlert } from '../../context/AlertContext';
import { CustomSelect } from '../../components/CustomSelect';

const STATUS_OPTIONS = [
  { label: 'Draft 📝', value: 'Draft' },
  { label: 'Published 🟢', value: 'Published' },
  { label: 'Running ⚡', value: 'Running' },
  { label: 'Completed ✅', value: 'Completed' },
  { label: 'Upcoming ⏳', value: 'Upcoming' },
  { label: 'Active 🔥', value: 'Active' },
  { label: 'Archived 📁', value: 'Archived' }
];

export const CycleManagementPage = () => {
  const dispatch = useDispatch();
  const { showAlert, showConfirm, showSnackbar } = useAlert();
  const { cycles, loading } = useSelector((state) => state.roomCycle);

  // Layout View Mode: 'list' | 'details' | 'form'
  const [viewMode, setViewMode] = useState('list');
  const [displayType, setDisplayType] = useState('grid'); // 'grid' | 'table'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'media'

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Rooms & Tasks State
  const [rooms, setRooms] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  // Active Selection for Details / Editing
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Drag State for Uploader Dropzones
  const [dragOverType, setDragOverType] = useState(null); // 'image' | 'video' | 'pdf' | null

  // Form State according to Schema Specification
  const [cycleForm, setCycleForm] = useState({
    cycleNumber: 1,
    title: '',
    description: '',
    rules: '',
    guidelines: '',
    durationDays: 14,
    prizePoolCoins: 5000,
    timerMinutes: 60,
    maxSeats: 100,
    coverImage: '',
    promoVideoUrl: '',
    rulesPdfUrl: '',
    roomId: 'All',
    taskIds: [],
    startDate: '',
    endDate: '',
    status: 'Draft'
  });

  const fetchCycles = async () => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get('/api/admin/room-cycle/cycles');
      if (res.data?.success) {
        dispatch(setCycles(res.data.data));
      } else {
        dispatch(setCycles([]));
      }
    } catch (err) {
      console.error(err);
      dispatch(setCycles([]));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchRoomsAndTasks = async () => {
    try {
      const [rRes, tRes] = await Promise.all([
        axios.get('/api/admin/room-cycle/rooms').catch(() => null),
        axios.get('/api/admin/tasks').catch(() => null)
      ]);
      if (rRes?.data?.success && Array.isArray(rRes.data.data)) {
        setRooms(rRes.data.data);
      }
      if (tRes?.data?.success && Array.isArray(tRes.data.data)) {
        setAllTasks(tRes.data.data);
      }
    } catch (err) {
      console.warn('Error fetching rooms/tasks for cycle management:', err);
    }
  };

  useEffect(() => {
    fetchCycles();
    fetchRoomsAndTasks();
  }, []);

  // Compute Next Auto Cycle Number
  const nextAutoCycleNumber = useMemo(() => {
    if (!cycles || cycles.length === 0) return 1;
    const maxNum = cycles.reduce((max, c) => Math.max(max, c.cycleNumber || 0), 0);
    return maxNum + 1;
  }, [cycles]);

  // Format Cycle ID as CY-01, CY-02, CY-10 etc.
  const formatCycleId = (num) => {
    if (!num && num !== 0) return 'CY-01';
    const parsed = typeof num === 'number' ? num : parseInt(num, 10) || 1;
    return `CY-${String(parsed).padStart(2, '0')}`;
  };

  const openCreatePage = () => {
    setIsEditing(false);
    setSelectedCycle(null);
    const nextNum = nextAutoCycleNumber;
    setCycleForm({
      cycleNumber: nextNum,
      title: `Cycle ${formatCycleId(nextNum)}: 3-Day Challenge`,
      description: '',
      rules: '',
      guidelines: '',
      prizePoolCoins: 5000,
      timerMinutes: 60,
      maxSeats: 100,
      coverImage: '',
      promoVideoUrl: '',
      rulesPdfUrl: '',
      roomId: 'All',
      taskIds: [],
      startDate: '',
      endDate: '',
      status: 'Draft'
    });
    setViewMode('form');
  };

  const openEditPage = (cycle) => {
    setIsEditing(true);
    setSelectedCycle(cycle);
    setCycleForm({
      _id: cycle._id || cycle.id,
      cycleNumber: cycle.cycleNumber || 1,
      title: cycle.title || '',
      description: cycle.description || '',
      rules: cycle.rules || '',
      guidelines: cycle.guidelines || '',
      prizePoolCoins: cycle.prizePoolCoins ?? 5000,
      timerMinutes: cycle.timerMinutes ?? 60,
      maxSeats: cycle.maxSeats ?? 100,
      coverImage: cycle.coverImage || '',
      promoVideoUrl: cycle.promoVideoUrl || '',
      rulesPdfUrl: cycle.rulesPdfUrl || '',
      roomId: cycle.roomId?._id || cycle.roomId || 'All',
      taskIds: cycle.taskIds || [],
      startDate: cycle.startDate ? new Date(cycle.startDate).toISOString().slice(0, 16) : '',
      endDate: cycle.endDate ? new Date(cycle.endDate).toISOString().slice(0, 16) : '',
      status: cycle.status || 'Draft'
    });
    setViewMode('form');
  };

  const openDetailsPage = (cycle) => {
    setSelectedCycle(cycle);
    setActiveTab('overview');
    setViewMode('details');
  };

  // Helper for File Reading Base64
  const processFileUpload = (file, key) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCycleForm(prev => ({ ...prev, [key]: reader.result }));
      showSnackbar(`${file.name} uploaded successfully!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop Handlers
  const handleDrop = (e, key) => {
    e.preventDefault();
    setDragOverType(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFileUpload(file, key);
    }
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    setDragOverType(type);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverType(null);
  };

  // --- SAVE / PUBLISH CYCLE ---
  const handleSaveCycle = async () => {
    if (!cycleForm.title.trim()) {
      showSnackbar('Cycle title is mandatory.', 'warning');
      return;
    }

    const payload = {
      ...cycleForm,
      roomId: cycleForm.roomId !== 'All' ? cycleForm.roomId : undefined
    };

    try {
      let res;
      if (isEditing && cycleForm._id) {
        res = await axios.put(`/api/admin/room-cycle/cycles/${cycleForm._id}`, payload);
      } else {
        res = await axios.post('/api/admin/room-cycle/cycles', payload);
      }

      if (res.data?.success) {
        showSnackbar(`Cycle "${cycleForm.title}" ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
        setViewMode('list');
        fetchCycles();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} cycle`, 'error');
    }
  };

  // --- DELETE CYCLE ---
  const handleDeleteCycle = (cycle) => {
    showConfirm('Delete Cycle', `Permanently delete "${cycle.title}" (${formatCycleId(cycle.cycleNumber)})?`, async () => {
      try {
        const res = await axios.delete(`/api/admin/room-cycle/cycles/${cycle._id || cycle.id}`);
        if (res.data?.success) {
          showSnackbar(`Cycle deleted successfully!`, 'success');
          if (viewMode === 'details') setViewMode('list');
          fetchCycles();
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to delete cycle', 'error');
      }
    });
  };

  // --- SET ACTIVE CYCLE ---
  const handleSetActiveCycle = (cycle) => {
    showConfirm('Activate Cycle', `Set ${formatCycleId(cycle.cycleNumber)} ("${cycle.title}") as Active? This completes any currently active cycle.`, async () => {
      try {
        const res = await axios.put(`/api/admin/room-cycle/cycles/${cycle._id || cycle.id}/set-active`);
        if (res.data?.success) {
          showSnackbar(`${formatCycleId(cycle.cycleNumber)} activated!`, 'success');
          fetchCycles();
          if (selectedCycle && selectedCycle._id === cycle._id) {
            setSelectedCycle({ ...selectedCycle, status: 'Active' });
          }
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to update active cycle', 'error');
      }
    });
  };

  const filteredCycles = useMemo(() => {
    return cycles.filter(c => {
      const titleMatch = (c.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const numberMatch = String(c.cycleNumber || '').includes(searchTerm);
      const codeMatch = formatCycleId(c.cycleNumber).toLowerCase().includes(searchTerm.toLowerCase());
      const searchMatch = !searchTerm || titleMatch || numberMatch || codeMatch;
      const statusMatch = statusFilter === 'All' || c.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [cycles, searchTerm, statusFilter]);

  // =========================================================================
  // VIEW 1: DEDICATED FULL CYCLE DETAILS PAGE
  // =========================================================================
  if (viewMode === 'details' && selectedCycle) {
    const attachedTaskObjects = allTasks.filter(t => (selectedCycle.taskIds || []).includes(t._id || t.id));

    return (
      <div className="p-6 space-y-6 text-left max-w-7xl mx-auto animate-fade-in">
        {/* Top Header Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B1120] p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('list')}
              className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-2xl transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[11px] font-black bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  {formatCycleId(selectedCycle.cycleNumber)}
                </span>
                <span className={`px-3 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 border ${
                  selectedCycle.status === 'Active' || selectedCycle.status === 'Running'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                  {selectedCycle.status}
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">{selectedCycle.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedCycle.status !== 'Active' && (
              <button
                onClick={() => handleSetActiveCycle(selectedCycle)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> Activate Cycle
              </button>
            )}
            <button
              onClick={() => openEditPage(selectedCycle)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Edit3 className="w-4 h-4" /> Edit Blueprint
            </button>
            <button
              onClick={() => handleDeleteCycle(selectedCycle)}
              className="flex items-center gap-2 px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Cover Banner Header */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-white/10 shadow-xl">
          {selectedCycle.coverImage ? (
            <img src={selectedCycle.coverImage} alt="Cover Banner" className="w-full h-64 object-cover opacity-70" />
          ) : (
            <div className="w-full h-64 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 opacity-90 flex items-center justify-center">
              <Layers className="w-24 h-24 text-indigo-400/20" />
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-extrabold uppercase tracking-wider mb-1">
                <Flame className="w-4 h-4 text-amber-400" /> Bi-Weekly Room Cycle Blueprint ({formatCycleId(selectedCycle.cycleNumber)})
              </div>
              <h2 className="text-3xl font-black text-white">{selectedCycle.title}</h2>
              <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">{selectedCycle.description || 'No additional summary details provided.'}</p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-2xl">
              <div>
                <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Prize Pool 🪙</div>
                <div className="text-xl font-black text-amber-400">{selectedCycle.prizePoolCoins ? selectedCycle.prizePoolCoins.toLocaleString() : 0} Coins</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Timer Limit ⏳</div>
                <div className="text-xl font-black text-white">{selectedCycle.timerMinutes || 60} Mins</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📋 Blueprint & Rules
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🎯 Attached Tasks ({attachedTaskObjects.length})
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'media'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🎥 Media & Attachments
          </button>
        </div>

        {/* TAB 1: OVERVIEW & SPECS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" /> Contest Rules & Guidelines 📜
                </h3>
                {selectedCycle.rules ? (
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedCycle.rules}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific rules or guidelines have been configured for this cycle.</p>
                )}
              </div>
            </div>

            {/* Sidebar Specifications Summary */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Cycle Specifications</h3>
                <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                  <div className="py-3 flex justify-between"><span className="text-slate-400 font-bold">Cycle ID:</span> <span className="font-black text-indigo-500">{formatCycleId(selectedCycle.cycleNumber)}</span></div>
                  <div className="py-3 flex justify-between"><span className="text-slate-400 font-bold">Assigned Room:</span> <span className="font-bold text-indigo-500">{selectedCycle.roomId?.name || 'All Rooms'}</span></div>
                  <div className="py-3 flex justify-between"><span className="text-slate-400 font-bold">Prize Pool Coins:</span> <span className="font-black text-amber-500">{selectedCycle.prizePoolCoins || 0} Coins 🪙</span></div>
                  <div className="py-3 flex justify-between"><span className="text-slate-400 font-bold">Timer Limit:</span> <span className="font-bold text-slate-800 dark:text-white">{selectedCycle.timerMinutes || 60} Mins</span></div>
                  <div className="py-3 flex justify-between"><span className="text-slate-400 font-bold">Max Seats Capacity:</span> <span className="font-bold text-slate-800 dark:text-white">{selectedCycle.maxSeats || 100} Contestants</span></div>
                  <div className="py-3 flex justify-between"><span className="text-slate-400 font-bold">Start Schedule:</span> <span className="font-medium text-slate-600 dark:text-slate-300">{selectedCycle.startDate ? new Date(selectedCycle.startDate).toLocaleString() : 'N/A'}</span></div>
                  <div className="py-3 flex justify-between"><span className="text-slate-400 font-bold">End Schedule:</span> <span className="font-medium text-slate-600 dark:text-slate-300">{selectedCycle.endDate ? new Date(selectedCycle.endDate).toLocaleString() : 'N/A'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTACHED TASKS */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {attachedTaskObjects.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#0B1120] rounded-3xl border border-slate-200 dark:border-white/10">
                <CheckSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <p className="font-bold text-slate-700 dark:text-slate-300">No tasks assigned to this cycle</p>
                <p className="text-xs mt-1">Click "Edit Blueprint" to attach tasks to this cycle.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attachedTaskObjects.map((t, idx) => (
                  <div key={t._id || idx} className="bg-white dark:bg-[#0B1120] p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                        {t.taskType || 'Task'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Order #{t.order || idx + 1}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{t.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{t.description}</p>
                    <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-100 dark:border-white/5">
                      <span className="text-slate-400 font-medium">Submission: <strong className="text-slate-700 dark:text-slate-300">{t.submissionType}</strong></span>
                      <span className="text-slate-400 font-medium">Review: <strong className="text-indigo-500">{t.reviewType}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MEDIA & ATTACHMENTS */}
        {activeTab === 'media' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedCycle.promoVideoUrl ? (
              <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <VideoIcon className="w-4 h-4 text-indigo-500" /> Promo Teaser Video
                </div>
                <video src={selectedCycle.promoVideoUrl} controls className="w-full h-72 rounded-2xl shadow-md border border-slate-200 dark:border-white/10" />
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#0B1120] rounded-3xl border border-slate-200 dark:border-white/10">
                No promo video attached.
              </div>
            )}

            {selectedCycle.rulesPdfUrl ? (
              <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-emerald-500" /> Official Rules PDF Document
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Download the complete official rules PDF attached to this cycle blueprint.</p>
                </div>
                <a
                  href={selectedCycle.rulesPdfUrl}
                  download
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <FileText className="w-4 h-4" /> Download Rules PDF Document
                </a>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#0B1120] rounded-3xl border border-slate-200 dark:border-white/10">
                No PDF rules document attached.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: DEDICATED CREATE / EDIT CYCLE FORM PAGE
  // =========================================================================
  if (viewMode === 'form') {
    return (
      <div className="p-6 space-y-6 text-left max-w-5xl mx-auto animate-fade-in">
        {/* Navigation & Header Bar */}
        <div className="flex items-center justify-between bg-white dark:bg-[#0B1120] p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('list')}
              className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-2xl transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                {isEditing ? `Edit Cycle Blueprint ${formatCycleId(cycleForm.cycleNumber)}` : `Create & Assign New Cycle ${formatCycleId(cycleForm.cycleNumber)} 📝`}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cycle ID: <strong className="text-indigo-500 font-black">{formatCycleId(cycleForm.cycleNumber)}</strong>. Configure prize pool, drag & drop media attachments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCycle}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl text-xs font-black shadow-lg transition-all cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Publish Cycle Blueprint'}
            </button>
          </div>
        </div>

        {/* Form Body Container */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-6">
          {/* Section 1: Basic Specifications (Auto Created CY-<number>) */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-wider border-b border-slate-100 dark:border-white/5 pb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> 1. Basic Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1 flex items-center justify-between">
                  <span>Cycle ID</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-black">Auto Generated ⚡</span>
                </label>
                <input
                  type="text"
                  value={formatCycleId(cycleForm.cycleNumber)}
                  readOnly
                  className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-indigo-500 font-black text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Execution Status *</label>
                <CustomSelect
                  value={cycleForm.status}
                  onChange={val => setCycleForm({ ...cycleForm, status: val })}
                  options={STATUS_OPTIONS}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Assigned Bi-Weekly Room</label>
                <CustomSelect
                  value={cycleForm.roomId}
                  onChange={val => setCycleForm({ ...cycleForm, roomId: val })}
                  options={[
                    { value: 'All', label: 'All Bi-Weekly Rooms' },
                    ...rooms.map(r => ({
                      value: r._id || r.id,
                      label: `${r.name} (${r.code})`
                    }))
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Cycle Title *</label>
              <input
                type="text"
                value={cycleForm.title}
                onChange={e => setCycleForm({ ...cycleForm, title: e.target.value })}
                placeholder="e.g. Cycle CY-01: 3-Day Grand Challenge"
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Cycle Description</label>
              <textarea
                rows={2}
                value={cycleForm.description}
                onChange={e => setCycleForm({ ...cycleForm, description: e.target.value })}
                placeholder="Enter summary description of this cycle..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Economics, Timer & Limits */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-wider border-b border-slate-100 dark:border-white/5 pb-2 flex items-center gap-1.5">
              <Coins className="w-4 h-4" /> 2. Economics, Timer & Limits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Prize Pool Coins 🪙</label>
                <input
                  type="number"
                  value={cycleForm.prizePoolCoins}
                  onChange={e => setCycleForm({ ...cycleForm, prizePoolCoins: Number(e.target.value) })}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-amber-500 font-black text-base focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Timer Limit (Minutes) ⏳</label>
                <input
                  type="number"
                  value={cycleForm.timerMinutes}
                  onChange={e => setCycleForm({ ...cycleForm, timerMinutes: Number(e.target.value) })}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Maximum Seats 👥</label>
                <input
                  type="number"
                  value={cycleForm.maxSeats}
                  onChange={e => setCycleForm({ ...cycleForm, maxSeats: Number(e.target.value) })}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Schedule Timelines */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-emerald-500 uppercase tracking-wider border-b border-slate-100 dark:border-white/5 pb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> 3. Schedule Timelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Schedule Start Date & Time 🗓️</label>
                <input
                  type="datetime-local"
                  value={cycleForm.startDate}
                  onChange={e => {
                    const startVal = e.target.value;
                    let endVal = cycleForm.endDate;
                    if (startVal && cycleForm.durationDays) {
                      const dt = new Date(startVal);
                      if (!isNaN(dt.getTime())) {
                        dt.setDate(dt.getDate() + Number(cycleForm.durationDays));
                        endVal = dt.toISOString().slice(0, 16);
                      }
                    }
                    setCycleForm({ ...cycleForm, startDate: startVal, endDate: endVal });
                  }}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Duration (in Days) ⏳</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={cycleForm.durationDays || 14}
                  onChange={e => {
                    const days = Number(e.target.value) || 14;
                    let endVal = cycleForm.endDate;
                    if (cycleForm.startDate) {
                      const dt = new Date(cycleForm.startDate);
                      if (!isNaN(dt.getTime())) {
                        dt.setDate(dt.getDate() + days);
                        endVal = dt.toISOString().slice(0, 16);
                      }
                    }
                    setCycleForm({ ...cycleForm, durationDays: days, endDate: endVal });
                  }}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-indigo-500 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Schedule End Date & Time 🏁</label>
                <input
                  type="datetime-local"
                  value={cycleForm.endDate}
                  onChange={e => setCycleForm({ ...cycleForm, endDate: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Task Attachment Checklist */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-purple-500 uppercase tracking-wider border-b border-slate-100 dark:border-white/5 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><CheckSquare className="w-4 h-4" /> 4. Attach Contest Tasks</span>
              <span className="text-[11px] font-black text-indigo-500">{cycleForm.taskIds.length} Tasks Selected</span>
            </h3>
            <div className="max-h-52 overflow-y-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-3 space-y-2">
              {allTasks.length === 0 ? (
                <span className="text-slate-400 text-xs block p-3 text-center">No tasks available in Task Management.</span>
              ) : (
                allTasks.map(t => {
                  const id = t._id || t.id;
                  const isChecked = cycleForm.taskIds.includes(id);
                  return (
                    <label key={id} className="flex items-center gap-3 text-slate-800 dark:text-white cursor-pointer hover:bg-slate-200/50 dark:hover:bg-white/5 p-2.5 rounded-xl transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCycleForm({ ...cycleForm, taskIds: [...cycleForm.taskIds, id] });
                          } else {
                            setCycleForm({ ...cycleForm, taskIds: cycleForm.taskIds.filter(tId => tId !== id) });
                          }
                        }}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs truncate block">{t.title}</span>
                        <span className="text-[10px] text-slate-400 truncate block">{t.description}</span>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-extrabold">{t.taskType || 'Task'}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 5: Media & Document Drag and Drop Attachments */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-cyan-500 uppercase tracking-wider border-b border-slate-100 dark:border-white/5 pb-2 flex items-center gap-1.5">
              <Upload className="w-4 h-4" /> 5. Media & Document Drag & Drop Attachments 📁
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Cover Image Drag and Drop */}
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Cover Banner Image 🖼️</label>
                <div
                  onDragOver={(e) => handleDragOver(e, 'image')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'coverImage')}
                  className={`relative border-2 border-dashed rounded-3xl p-4 text-center transition-all cursor-pointer bg-slate-50 dark:bg-slate-900 ${
                    dragOverType === 'image'
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-300 dark:border-white/10 hover:border-indigo-400'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => processFileUpload(e.target.files?.[0], 'coverImage')}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {cycleForm.coverImage ? (
                    <div className="space-y-2">
                      <img src={cycleForm.coverImage} alt="Cover Preview" className="w-full h-28 object-cover rounded-2xl border border-slate-200 dark:border-white/10" />
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-emerald-500 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Image Ready</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCycleForm({ ...cycleForm, coverImage: '' }); }}
                          className="text-rose-500 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-5 space-y-1.5">
                      <FileUp className="w-8 h-8 mx-auto text-indigo-400 animate-bounce" />
                      <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Drag & Drop Image Here</p>
                      <p className="text-[10px] text-slate-400">or click to browse (.jpg, .png, .webp)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Promo Video Drag and Drop */}
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Promo Teaser Video 🎥</label>
                <div
                  onDragOver={(e) => handleDragOver(e, 'video')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'promoVideoUrl')}
                  className={`relative border-2 border-dashed rounded-3xl p-4 text-center transition-all cursor-pointer bg-slate-50 dark:bg-slate-900 ${
                    dragOverType === 'video'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-300 dark:border-white/10 hover:border-purple-400'
                  }`}
                >
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => processFileUpload(e.target.files?.[0], 'promoVideoUrl')}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {cycleForm.promoVideoUrl ? (
                    <div className="space-y-2">
                      <video src={cycleForm.promoVideoUrl} controls className="w-full h-28 object-cover rounded-2xl border border-slate-200 dark:border-white/10" />
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-emerald-500 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Video Ready</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCycleForm({ ...cycleForm, promoVideoUrl: '' }); }}
                          className="text-rose-500 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-5 space-y-1.5">
                      <VideoIcon className="w-8 h-8 mx-auto text-purple-400 animate-pulse" />
                      <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Drag & Drop Video Here</p>
                      <p className="text-[10px] text-slate-400">or click to browse (.mp4, .webm)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Rules PDF Document Drag and Drop */}
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Rules PDF Document 📄</label>
                <div
                  onDragOver={(e) => handleDragOver(e, 'pdf')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'rulesPdfUrl')}
                  className={`relative border-2 border-dashed rounded-3xl p-4 text-center transition-all cursor-pointer bg-slate-50 dark:bg-slate-900 ${
                    dragOverType === 'pdf'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-300 dark:border-white/10 hover:border-emerald-400'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => processFileUpload(e.target.files?.[0], 'rulesPdfUrl')}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {cycleForm.rulesPdfUrl ? (
                    <div className="py-3 space-y-2">
                      <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl font-black text-xs flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5" /> Rules PDF Attached
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-emerald-500 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> PDF Ready</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCycleForm({ ...cycleForm, rulesPdfUrl: '' }); }}
                          className="text-rose-500 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-5 space-y-1.5">
                      <FileText className="w-8 h-8 mx-auto text-emerald-400" />
                      <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Drag & Drop PDF Here</p>
                      <p className="text-[10px] text-slate-400">or click to browse (.pdf format)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Contest Rules & Guidelines */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-rose-500 uppercase tracking-wider border-b border-slate-100 dark:border-white/5 pb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 6. Contest Rules & Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Contest Rules 📜</label>
                <textarea
                  rows={4}
                  value={cycleForm.rules}
                  onChange={e => setCycleForm({ ...cycleForm, rules: e.target.value })}
                  placeholder="Enter specific contest rules, scoring formula, and penalties..."
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs leading-relaxed resize-none focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Participation Guidelines & Terms 📋</label>
                <textarea
                  rows={4}
                  value={cycleForm.guidelines}
                  onChange={e => setCycleForm({ ...cycleForm, guidelines: e.target.value })}
                  placeholder="Enter participation guidelines, eligibility criteria, and anti-cheat policies..."
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs leading-relaxed resize-none focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
            <button
              onClick={() => setViewMode('list')}
              className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCycle}
              className="px-7 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl text-xs font-black shadow-lg transition-all cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Publish Cycle Blueprint'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN VIEW: DEDICATED CYCLE LIST & BLUEPRINT DASHBOARD
  // =========================================================================
  return (
    <div className="p-6 space-y-6 text-left animate-fade-in max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-8 h-8 text-indigo-500" /> Bi-Weekly Room Cycle Blueprint
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure rules, prize pool coins 🪙, timers, seats, media attachments, schedule timelines, and status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreatePage}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl text-xs font-black shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create & Assign Cycle
          </button>
          <button
            onClick={fetchCycles}
            className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Cycles</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{cycles.length}</div>
          </div>
          <div className="p-3.5 bg-indigo-500/10 text-indigo-500 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Active Cycles</div>
            <div className="text-2xl font-black text-emerald-500 mt-1">
              {cycles.filter(c => c.status === 'Active' || c.status === 'Running').length}
            </div>
          </div>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <Play className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Prize Pool 🪙</div>
            <div className="text-2xl font-black text-amber-500 mt-1">
              {cycles.reduce((acc, c) => acc + (c.prizePoolCoins || 0), 0).toLocaleString()} Coins
            </div>
          </div>
          <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Drafts</div>
            <div className="text-2xl font-black text-purple-500 mt-1">
              {cycles.filter(c => c.status === 'Draft').length}
            </div>
          </div>
          <div className="p-3.5 bg-purple-500/10 text-purple-500 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search title or CY-01 ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'All', label: 'All Execution Statuses' },
              ...STATUS_OPTIONS
            ]}
            className="w-52"
          />

          {/* Grid vs Table View Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setDisplayType('grid')}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                displayType === 'grid' ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
              title="Grid Cards View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDisplayType('table')}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                displayType === 'table' ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
              title="Table Rows View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RENDER VIEW 1: GRID CARDS */}
      {displayType === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCycles.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400 bg-white dark:bg-[#0B1120] rounded-3xl border border-slate-200 dark:border-white/10">
              <Layers className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="font-bold text-slate-700 dark:text-slate-300">No cycles match your filter</p>
              <p className="text-xs mt-1">Click "Create & Assign Cycle" to publish a new cycle blueprint.</p>
            </div>
          ) : (
            filteredCycles.map((c, idx) => (
              <div
                key={c._id || c.id || idx}
                className={`relative rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden bg-white dark:bg-[#0B1120] hover:-translate-y-1 ${
                  c.status === 'Active' || c.status === 'Running'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-white/10'
                }`}
              >
                {/* Cover Header */}
                <div className="relative h-40 bg-slate-950 overflow-hidden">
                  {c.coverImage ? (
                    <img src={c.coverImage} alt="Cover" className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
                      <Layers className="w-14 h-14 text-indigo-400/20" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-black/70 backdrop-blur-md text-white border border-white/20">
                      {formatCycleId(c.cycleNumber)}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black backdrop-blur-md border ${
                      c.status === 'Active' || c.status === 'Running'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-black/70 text-slate-300 border-white/20'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4 flex-1">
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug">{c.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{c.description || 'No additional summary'}</p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Prize Pool 🪙</span>
                      <span className="font-black text-amber-500 text-sm">{c.prizePoolCoins ? c.prizePoolCoins.toLocaleString() : 0} Coins</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Timer Limit ⏳</span>
                      <span className="font-extrabold text-slate-800 dark:text-white text-xs">{c.timerMinutes || 60} Mins</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 text-slate-500 font-medium">
                    <span>👥 {c.maxSeats || 100} Seats</span>
                    <span>🎯 {Array.isArray(c.taskIds) ? c.taskIds.length : 0} Tasks Attached</span>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openDetailsPage(c)}
                    className="flex-1 py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    View Details <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {c.status !== 'Active' && (
                      <button
                        onClick={() => handleSetActiveCycle(c)}
                        className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 cursor-pointer transition-all"
                        title="Set Active"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditPage(c)}
                      className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 cursor-pointer transition-all"
                      title="Edit Blueprint"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCycle(c)}
                      className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer transition-all"
                      title="Delete Cycle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* RENDER VIEW 2: DATATABLE */
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-white/10">
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Cover</th>
                  <th className="p-3.5">Cycle Specifications</th>
                  <th className="p-3.5">Prize Pool 🪙</th>
                  <th className="p-3.5">Timer & Seats</th>
                  <th className="p-3.5">Schedule Timelines</th>
                  <th className="p-3.5">Execution Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredCycles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                      No cycles match your search criteria. Click "Create & Assign Cycle" to add one.
                    </td>
                  </tr>
                ) : (
                  filteredCycles.map((c, idx) => (
                    <tr key={c._id || c.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-black text-indigo-500">{formatCycleId(c.cycleNumber)}</td>
                      <td className="p-3.5">
                        {c.coverImage ? (
                          <img src={c.coverImage} alt="Cover" className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
                            C{c.cycleNumber}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <span className="font-extrabold text-slate-900 dark:text-white block">{c.title}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{c.description || 'No description'}</span>
                      </td>
                      <td className="p-3.5 font-black text-amber-500">
                        {c.prizePoolCoins ? `${c.prizePoolCoins.toLocaleString()} Coins 🪙` : '0 Coins'}
                      </td>
                      <td className="p-3.5 space-y-0.5">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">⏳ {c.timerMinutes || 60} Mins</span>
                        <span className="text-[10px] font-bold text-indigo-500 block">👥 {c.maxSeats || 100} Seats Max</span>
                      </td>
                      <td className="p-3.5 space-y-0.5 text-[11px]">
                        <div className="text-slate-600 dark:text-slate-300 font-medium">
                          🗓️ {c.startDate ? new Date(c.startDate).toLocaleString() : 'Not Set'}
                        </div>
                        <div className="text-slate-400">
                          🏁 {c.endDate ? new Date(c.endDate).toLocaleString() : 'Not Set'}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                          c.status === 'Active' || c.status === 'Running' || c.status === 'Published'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : c.status === 'Completed'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {c.status || 'Draft'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.status !== 'Active' && (
                            <button
                              onClick={() => handleSetActiveCycle(c)}
                              className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 cursor-pointer transition-all"
                              title="Set Active"
                            >
                              <Play className="w-4 h-4 fill-current" />
                            </button>
                          )}
                          <button
                            onClick={() => openDetailsPage(c)}
                            className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 cursor-pointer transition-all"
                            title="View Full Page Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditPage(c)}
                            className="p-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 cursor-pointer transition-all"
                            title="Edit Cycle"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCycle(c)}
                            className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer transition-all"
                            title="Delete Cycle"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CycleManagementPage;
