import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft, Layers, Trophy, Crown, Users, CheckSquare, Clock, ShieldCheck,
  BarChart3, Edit3, Trash2, RefreshCw, Plus, Search, Filter, Eye, CheckCircle2,
  XCircle, AlertCircle, FileText, Upload, Sparkles, ExternalLink, Calendar,
  TrendingUp, Award, UserPlus, X, HelpCircle, Image as ImageIcon, Video as VideoIcon,
  Coins, Target
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../../context/AlertContext';
import { usePageTitle } from '../../context/PageTitleContext';
import { RightDrawer } from '../../components/RightDrawer';
import { MultiSelect } from '../../components/MultiSelect';
import { setActiveRoom } from '../../store/roomCycleSlice';

const formatDateForInput = (d) => {
  if (!d) return '';
  try {
    const date = new Date(d);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

const getSafeImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/')) return url;
  return `/${url}`;
};

export const RoomDetailsPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showAlert, showConfirm, showSnackbar } = useAlert();
  const { setCustomTitle } = usePageTitle();

  // Active Tab state
  const initialTab = searchParams.get('tab') || 'tasks';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    return () => setCustomTitle('');
  }, []);

  // Data states
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [cycles, setCycles] = useState([]);

  // Filter & Search states for Tasks
  const [taskSearch, setTaskSearch] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState('All');
  const [taskStatusFilter, setTaskStatusFilter] = useState('All');

  // Filter & Search states for Members
  const [memberSearch, setMemberSearch] = useState('');

  // Drawers state
  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [assignUserIds, setAssignUserIds] = useState('');
  const [imageError, setImageError] = useState(false);

  const fetchRoomDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/week/rooms/${roomId}`).catch(() => null);
      if (res?.data?.success) {
        const data = res.data.data;
        const currentRoom = data.room || data || {};
        const currentTasks = data.tasks || currentRoom.taskIds || [];
        const currentMembers = data.members || [];
        const currentAnalytics = data.analytics || {};
        const currentCycles = data.cycles || [];

        setRoomData(currentRoom);
        if (currentRoom.title) {
          setCustomTitle(currentRoom.title);
        }
        setTasks(currentTasks);
        setMembers(currentMembers);
        setAnalytics(currentAnalytics);
        setCycles(currentCycles);

        // Merge any populated task objects into availableTasks so names & points always display
        if (Array.isArray(currentTasks) && currentTasks.length > 0) {
          setAvailableTasks((prev) => {
            const map = new Map(prev.map(t => [String(t._id || t.id), t]));
            currentTasks.forEach(t => {
              if (t && typeof t === 'object' && (t._id || t.id)) {
                map.set(String(t._id || t.id), t);
              }
            });
            return Array.from(map.values());
          });
        }

        dispatch(setActiveRoom({ room: currentRoom, members: currentMembers }));
      } else {
        showAlert('Failed to load room details', 'error');
      }
    } catch (err) {
      console.error('Error fetching room details:', err);
      showAlert(err.response?.data?.message || 'Failed to load room details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTasks = async () => {
    try {
      let list = [];
      const res = await axios.get('/api/admin/tasks?limit=100').catch(() => null);
      if (res?.data?.success) {
        const raw = res.data.data;
        list = Array.isArray(raw?.tasks) ? raw.tasks : Array.isArray(raw) ? raw : (Array.isArray(res.data.tasks) ? res.data.tasks : []);
      }
      setAvailableTasks((prev) => {
        const map = new Map();
        prev.forEach(t => { if (t && (t._id || t.id)) map.set(String(t._id || t.id), t); });
        list.forEach(t => { if (t && (t._id || t.id)) map.set(String(t._id || t.id), t); });
        return Array.from(map.values());
      });
    } catch (err) {
      console.error('Error fetching available tasks:', err);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
      fetchAvailableTasks();
    }
  }, [roomId]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };



  const handleAssignMembers = async (e) => {
    e.preventDefault();
    const ids = assignUserIds
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      showAlert('Please enter at least one User ID', 'error');
      return;
    }

    try {
      const res = await axios.post('/api/admin/members/assign', {
        roomId,
        userIds: ids,
        role: 'Member'
      });
      if (res.data?.success) {
        showSnackbar(`Assigned ${ids.length} members successfully!`, 'success');
        setAssignUserIds('');
        setIsAssignDrawerOpen(false);
        fetchRoomDetails();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to assign members', 'error');
    }
  };

  const handleDeleteRoom = () => {
    showConfirm('Delete Room', `Are you sure you want to permanently delete "${roomData?.name}"?`, async () => {
      try {
        await axios.delete(`/api/week/rooms/${roomId}`);
        showSnackbar('Room deleted successfully', 'success');
        navigate('/admin-dashboard/bi-weekly-room/rooms');
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to delete room', 'error');
      }
    });
  };

  // Fully resolved tasks with titles from availableTasks
  const resolvedTasks = useMemo(() => {
    return tasks.map((t) => {
      if (typeof t === 'object' && t.title) return t;
      const tId = typeof t === 'object' ? String(t._id || t.id) : String(t);
      const found = availableTasks.find((at) => String(at._id || at.id) === tId);
      if (found) {
        return { ...(typeof t === 'object' ? t : {}), ...found };
      }
      return typeof t === 'object' ? t : { _id: t, title: `Task` };
    });
  }, [tasks, availableTasks]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return resolvedTasks.filter((t) => {
      const title = (t.title || 'Task').toLowerCase();
      const type = (t.taskType || t.submissionType || '').toLowerCase();
      const status = (t.status || 'Published').toLowerCase();

      const matchesSearch = !taskSearch || title.includes(taskSearch.toLowerCase());
      const matchesType = taskTypeFilter === 'All' || type === taskTypeFilter.toLowerCase();
      const matchesStatus = taskStatusFilter === 'All' || status === taskStatusFilter.toLowerCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [resolvedTasks, taskSearch, taskTypeFilter, taskStatusFilter]);

  // Filtered Members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const name = (m.userId?.name || '').toLowerCase();
      const email = (m.userId?.email || '').toLowerCase();
      const q = memberSearch.toLowerCase();
      return !memberSearch || name.includes(q) || email.includes(q);
    });
  }, [members, memberSearch]);

  // Distinct Task Types
  const taskTypes = useMemo(() => {
    const set = new Set();
    resolvedTasks.forEach((t) => {
      if (t.taskType) set.add(t.taskType);
    });
    return Array.from(set);
  }, [resolvedTasks]);

  // Total Points of all tasks in room
  const totalTaskPoints = useMemo(() => {
    return resolvedTasks.reduce((sum, t) => sum + (t.points ? Number(t.points) : 0), 0);
  }, [resolvedTasks]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-48" />
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Room Not Found</h2>
        <p className="text-sm text-slate-500">The requested room could not be found or has been removed.</p>
        <button
          onClick={() => navigate('/admin-dashboard/bi-weekly-room/rooms')}
          className="px-4 py-2 bg-brandPrimary text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Rooms
        </button>
      </div>
    );
  }

  const capacityPercent = roomData.maxMembers > 0
    ? Math.min(100, Math.round(((roomData.membersCount || 0) / roomData.maxMembers) * 100))
    : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin-dashboard/bi-weekly-room/rooms')}
            className="p-2.5 bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Rooms
          </button>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-black rounded-lg border border-indigo-500/20">
              {roomData.code}
            </span>
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 border ${roomData.status === 'Active' || roomData.status === 'In Progress'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : roomData.status === 'Registration Open'
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                    : roomData.status === 'Upcoming'
                      ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                      : roomData.status === 'Completed'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                        : roomData.status === 'Archived'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-slate-500/10 text-slate-500 border-slate-500/30'
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {roomData.status}
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRoomDetails}
            className="p-2.5 bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
            title="Refresh Room Data"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => setIsAssignDrawerOpen(true)}
            className="px-3.5 py-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-indigo-500/20"
          >
            <UserPlus className="w-4 h-4" /> Assign Members
          </button>
          <button
            onClick={() => navigate(`/admin-dashboard/bi-weekly-room/rooms/edit/${roomId}`)}
            className="px-4 py-2.5 bg-brandPrimary text-white hover:bg-brandPrimary/90 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all shadow-indigo-500/20 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" /> Edit Room
          </button>
          <button
            onClick={handleDeleteRoom}
            className="p-2.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded-xl border border-rose-500/20 transition-all"
            title="Delete Room"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. HERO BANNER CARD */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/90 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/20 backdrop-blur-xl">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-brandPrimary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 lg:gap-8">
          {/* Left Column: Room Identity */}
          <div className="flex items-start gap-4 sm:gap-6 flex-1 min-w-0">
            {/* Room Avatar / Cover Image */}
            <div className="relative shrink-0 group">
              {roomData.roomImage && !imageError ? (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={getSafeImageUrl(roomData.roomImage)}
                    alt={roomData.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-brandPrimary via-indigo-600 to-indigo-400 text-white flex flex-col items-center justify-center border border-white/20 shadow-xl shadow-indigo-950/50 group-hover:scale-105 transition-transform duration-300">
                  <Trophy className="w-9 h-9 text-amber-300 drop-shadow-md" />
                  <span className="text-[10px] font-mono font-extrabold tracking-wider text-indigo-100 uppercase mt-0.5">
                    {roomData.code?.replace(/^ROOM-/, '')?.split('-')[0] || 'ARENA'}
                  </span>
                </div>
              )}
              {/* Status Indicator Pip */}
              <div className="absolute -bottom-1 -right-1 p-0.5 bg-slate-900 rounded-full">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-slate-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </span>
              </div>
            </div>

            {/* Room Details & Meta */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Badges strip */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-indigo-200 border border-white/15 shadow-sm">
                  <Trophy className="w-3 h-3 text-amber-400" /> Bi-Weekly Challenge Room
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-mono font-bold border border-indigo-400/30">
                  {roomData.code || 'RM-001'}
                </span>
                {roomData.autoAssignment && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                    ⚡ Auto-Assignment Active
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {roomData.status || 'Active'}
                </span>
              </div>

              {/* Room Title with full breathing room */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight break-words">
                {roomData.name}
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-3xl line-clamp-2">
                {roomData.description || 'Special cohort competition room. Complete assigned sprint challenges to claim milestone coin bounties.'}
              </p>
            </div>
          </div>

          {/* Right Column: 4-Metric Glass Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-3 shrink-0 xl:w-[440px]">
            {/* 1. Prize Pool & Fee */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-md border border-white/10 rounded-2xl p-3.5 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" /> Prize Pool
                </span>
                {roomData.coinsReward ? (
                  <span className="text-[10px] font-bold text-amber-300 px-1.5 py-0.5 bg-amber-500/20 rounded-md">
                    +{Number(roomData.coinsReward).toLocaleString()} 🪙
                  </span>
                ) : null}
              </div>
              <p className="text-lg sm:text-xl font-black text-amber-400 flex items-center gap-1 truncate">
                {roomData.entryFeeType === 'Cash'
                  ? `₹${Number(roomData.prizePool || 50000).toLocaleString()}`
                  : `${Number(roomData.prizePool || roomData.coinsReward || 10000).toLocaleString()} 🪙`}
                <span className="text-xs font-semibold text-amber-200/80">Coins</span>
              </p>
              <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                Fee: {roomData.entryFeeType === 'Cash' ? `₹${roomData.entryFee || 99}` : `${roomData.entryFeeCoins || roomData.entryFee || 50} 🪙 Coins`}
              </span>
            </div>

            {/* 2. Timer Limit & Duration */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-md border border-white/10 rounded-2xl p-3.5 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400" /> Timer Limit
                </span>
              </div>
              <p className="text-lg sm:text-xl font-black text-indigo-200 flex items-center gap-1 truncate">
                {roomData.timerLimit || 30} <span className="text-xs font-semibold text-indigo-300/80">Mins</span>
              </p>
              <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                {roomData.durationDays || 14} Days Duration
              </span>
            </div>

            {/* 3. Seats Occupancy */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-md border border-white/10 rounded-2xl p-3.5 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <Users className="w-3 h-3 text-indigo-400" /> Seats
                </span>
                <span className="text-[10px] font-bold text-emerald-400">
                  {Math.max(0, (roomData.maxMembers || 50) - (roomData.membersCount || 0))} open
                </span>
              </div>
              <p className="text-lg sm:text-xl font-black text-white flex items-center gap-1 truncate">
                {roomData.membersCount || 0} <span className="text-xs font-normal text-slate-400">/ {roomData.maxMembers || 50}</span>
              </p>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(((roomData.membersCount || 0) / (roomData.maxMembers || 50)) * 100))}%` }}
                />
              </div>
            </div>

            {/* 4. Competition Window */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-md border border-white/10 rounded-2xl p-3.5 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-sky-400" /> Schedule
                </span>
              </div>
              <p className="text-xs font-bold text-sky-200 block truncate">
                {roomData.startDate ? new Date(roomData.startDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : 'Active'} - {roomData.endDate ? new Date(roomData.endDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : 'Ongoing'}
              </p>
              <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                Active Cycle Window
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. KEY METRICS STRIP (6 CARDS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Tasks in Room */}
        <div
          onClick={() => handleTabChange('tasks')}
          className="p-4 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-1 cursor-pointer hover:border-indigo-500/40 transition-all group min-h-[105px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Room Tasks</span>
            <CheckSquare className="w-4 h-4 text-brandPrimary group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {tasks.length}
          </p>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block truncate">
            {totalTaskPoints.toLocaleString()} Total Pts
          </span>
        </div>

        {/* 2. Seats Occupancy */}
        <div
          onClick={() => handleTabChange('members')}
          className="p-4 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-1 cursor-pointer hover:border-indigo-500/40 transition-all group min-h-[105px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Seats</span>
            <Users className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white truncate">
            {roomData.membersCount || 0} <span className="text-slate-400 font-normal text-xs">/ {roomData.maxMembers || 50}</span>
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${capacityPercent}%` }} />
          </div>
        </div>

        {/* 3. Prize Pool */}
        <div
          onClick={() => handleTabChange('overview')}
          className="p-4 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-1 cursor-pointer hover:border-amber-500/40 transition-all group min-h-[105px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Prize Pool</span>
            <Trophy className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-lg sm:text-xl font-black text-amber-500 flex items-baseline gap-1 truncate">
            {roomData.entryFeeType === 'Cash'
              ? `₹${Number(roomData.prizePool || 50000).toLocaleString()}`
              : `${Number(roomData.prizePool || roomData.coinsReward || 10000).toLocaleString()} 🪙`}
            <span className="text-xs font-bold text-amber-500/80">Coins</span>
          </p>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block truncate">
            {roomData.entryFeeType === 'Cash'
              ? `₹${roomData.entryFee || 99} Fee`
              : `${roomData.entryFeeCoins || roomData.entryFee || 50} 🪙 Fee`}
          </span>
        </div>

        {/* 4. Leaderboard Rank */}
        <div
          onClick={() => handleTabChange('leaderboard')}
          className="p-4 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-1 cursor-pointer hover:border-amber-500/40 transition-all group min-h-[105px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Room Rank</span>
            <Crown className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-amber-500 truncate">
            #{roomData.rank || 1}
          </p>
          <span className="text-[10px] font-medium text-slate-400 block truncate">Overall Arena Rank</span>
        </div>

        {/* 5. Submissions */}
        <div
          onClick={() => handleTabChange('analytics')}
          className="p-4 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-1 cursor-pointer hover:border-indigo-500/40 transition-all group min-h-[105px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Submissions</span>
            <BarChart3 className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white truncate">
            {analytics?.totalSubmissions || 0}
          </p>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block truncate">
            {analytics?.completionRate || 0}% Approved
          </span>
        </div>

        {/* 6. Pending Review */}
        <div
          onClick={() => handleTabChange('analytics')}
          className="p-4 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-1 cursor-pointer hover:border-amber-500/40 transition-all group min-h-[105px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 truncate">
            {analytics?.pendingSubmissions || 0}
          </p>
          <span className="text-[10px] font-medium text-slate-400 block truncate">Awaiting jury action</span>
        </div>
      </div>

      {/* 4. MAIN NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-x-auto">
        <button
          onClick={() => handleTabChange('tasks')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'tasks'
              ? 'bg-brandPrimary text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
        >
          <CheckSquare className="w-4 h-4" /> Room Tasks ({tasks.length})
        </button>

        <button
          onClick={() => handleTabChange('overview')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'overview'
              ? 'bg-brandPrimary text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
        >
          <Layers className="w-4 h-4" /> Overview & Guidelines
        </button>

        <button
          onClick={() => handleTabChange('analytics')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'analytics'
              ? 'bg-brandPrimary text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
        >
          <BarChart3 className="w-4 h-4" /> Submissions & Analytics
        </button>

        <button
          onClick={() => handleTabChange('leaderboard')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'leaderboard'
              ? 'bg-brandPrimary text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
        >
          <Trophy className="w-4 h-4" /> Room Leaderboard
        </button>

        <button
          onClick={() => handleTabChange('members')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'members'
              ? 'bg-brandPrimary text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
        >
          <Users className="w-4 h-4" /> Enrolled Members ({members.length})
        </button>
      </div>

      {/* 5. TAB CONTENT PANELS */}

      {/* ================= TAB 1: ROOM TASKS ================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks in this room..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-brandPrimary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={taskTypeFilter}
                onChange={(e) => setTaskTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Types</option>
                {taskTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <button
                onClick={() => setIsEditDrawerOpen(true)}
                className="px-3.5 py-2 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ml-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Connect / Manage Tasks
              </button>
            </div>
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-[#0B1120] p-12 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 text-center space-y-3">
              <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300">No Tasks Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {taskSearch || taskTypeFilter !== 'All'
                  ? 'No tasks match your active filters. Try resetting search criteria.'
                  : 'This room does not have any tasks attached yet. Click below to connect tasks.'}
              </p>
              <button
                onClick={() => setIsEditDrawerOpen(true)}
                className="px-4 py-2 bg-brandPrimary text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Connect Tasks
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((t, idx) => {
                const id = t._id || t.id || idx;
                const title = t.title || `Task #${idx + 1}`;
                const taskType = t.taskType || t.submissionType || 'General';
                const submissionType = t.submissionType || 'General';
                const points = t.points || 0;
                const bonusPoints = t.bonusPoints || 0;
                const instructions = t.instructions || '';
                const reviewType = t.reviewType || 'Manual';
                const status = t.status || 'Published';

                return (
                  <div
                    key={id || idx}
                    className="bg-white dark:bg-[#0B1120] rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm hover:border-indigo-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center border border-indigo-500/20">
                          #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold uppercase tracking-wider">
                            {taskType}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                            {submissionType}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-brandPrimary transition-colors line-clamp-2">
                        {title}
                      </h4>

                      {instructions && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          {instructions}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold rounded-md border border-amber-500/20">
                          🏆 {points} pts
                        </span>
                        {bonusPoints > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            +{bonusPoints} bonus
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        {reviewType === 'AI' ? '🤖 AI Review' : '👤 Manual Review'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: OVERVIEW & GUIDELINES ================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Schedule Timelines & Execution Status Card */}
            <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" /> Schedule Timelines & Execution Status
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border ${roomData.status === 'Active' || roomData.status === 'In Progress'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : roomData.status === 'Registration Open'
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                        : roomData.status === 'Upcoming'
                          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                          : roomData.status === 'Completed'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                            : roomData.status === 'Archived'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/30'
                    }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  {roomData.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-white/5 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Registration Window
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Starts:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {roomData.registrationStart ? new Date(roomData.registrationStart).toLocaleDateString() : 'N/A'}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Ends:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {roomData.registrationEnd ? new Date(roomData.registrationEnd).toLocaleDateString() : 'N/A'}
                    </strong>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-white/5 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-500" /> Contest Execution Run
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Start Date:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {roomData.startDate ? new Date(roomData.startDate).toLocaleDateString() : 'Active'}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">End Date:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {roomData.endDate ? new Date(roomData.endDate).toLocaleDateString() : 'N/A'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Prize Pool & Financials Card */}
            <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                <Coins className="w-4 h-4 text-amber-500" /> Prize Pool & Financial Structure
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block">Total Prize Pool</span>
                  <p className="text-2xl font-black text-amber-500">
                    {roomData.entryFeeType === 'Cash'
                      ? `₹${Number(roomData.prizePool || 50000).toLocaleString()}`
                      : `${Number(roomData.prizePool || roomData.coinsReward || 10000).toLocaleString()} 🪙 Coins`}
                  </p>
                  <span className="text-[10px] text-slate-400 block">Distributed to arena winners</span>
                </div>

                <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 block">Entry Fee</span>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {roomData.entryFeeType === 'Cash'
                      ? `₹${roomData.entryFee || 99}`
                      : `${roomData.entryFeeCoins || roomData.entryFee || 50} 🪙`}
                  </p>
                  <span className="text-[10px] text-slate-400 block">Entry requirement type</span>
                </div>

                <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">Bonus Coins</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    +{roomData.coinsReward || 0} 🪙
                  </p>
                  <span className="text-[10px] text-slate-400 block">Awarded for task milestones</span>
                </div>
              </div>
            </div>

            {/* 3. Timer & Seat Capacity Card */}
            <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                <Clock className="w-4 h-4 text-indigo-500" /> Timer Limits & Participant Seats
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-white/5 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> Challenge Timer Limit
                  </span>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{roomData.timerLimit || 30} Minutes</p>
                  <p className="text-[11px] text-slate-400">Timer allotted per contestant task challenge in this room.</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-brandPrimary" /> Capacity Seats
                    </span>
                    <span className="text-xs font-bold text-brandPrimary">{capacityPercent}% Filled</span>
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {roomData.membersCount || 0} <span className="text-slate-400 font-normal text-xs">/ {roomData.maxMembers || 50} Seats</span>
                  </p>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-brandPrimary h-full rounded-full transition-all" style={{ width: `${capacityPercent}%` }} />
                  </div>
                  <span className="text-[10px] text-emerald-500 font-bold block">
                    {Math.max(0, (roomData.maxMembers || 50) - (roomData.membersCount || 0))} Available Seats Remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-brandPrimary" /> Room Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {roomData.description || 'No description entered for this room.'}
              </p>
            </div>

            {/* Official Room Rules */}
            <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" /> Contest Rules & Scoring Policy 📜
              </h3>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 whitespace-pre-line">
                {roomData.rules || 'Standard contest rules apply. Submit original work and follow fair-play principles.'}
              </div>
            </div>

            {/* Guidelines & Terms */}
            <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" /> Participation Guidelines & Terms 📋
              </h3>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/20 whitespace-pre-line">
                {roomData.guidelines || 'Upload submissions within the stipulated daily schedule to maintain active streaks.'}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
                Room Parameters
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-400">Room Code</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{roomData.code}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-400">Execution Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{roomData.status}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-400">Prize Pool</span>
                  <span className="font-extrabold text-amber-500">
                    {roomData.entryFeeType === 'Cash'
                      ? `₹${Number(roomData.prizePool || 50000).toLocaleString()}`
                      : `${Number(roomData.prizePool || roomData.coinsReward || 10000).toLocaleString()} 🪙 Coins`}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-400">Entry Fee</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {roomData.entryFeeType === 'Cash' ? `₹${roomData.entryFee || 99}` : `${roomData.entryFeeCoins || roomData.entryFee || 50} 🪙`}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-400">Timer Limit</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{roomData.timerLimit || 30} Minutes</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{roomData.durationDays || 14} Days</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-400">Seats Capacity</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{roomData.membersCount || 0} / {roomData.maxMembers || 50}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-400">Auto-Assignment</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {roomData.autoAssignment ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Created Date</span>
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    {roomData.createdDate ? new Date(roomData.createdDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: SUBMISSIONS & ANALYTICS ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-[10px] tracking-wider block">
                Total Submissions
              </span>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {analytics?.totalSubmissions || 0}
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px] tracking-wider block">
                Approved Submissions
              </span>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {analytics?.approvedSubmissions || 0}
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <span className="text-rose-600 dark:text-rose-400 font-bold uppercase text-[10px] tracking-wider block">
                Rejected Submissions
              </span>
              <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {analytics?.rejectedSubmissions || 0}
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <span className="text-amber-600 dark:text-amber-400 font-bold uppercase text-[10px] tracking-wider block">
                Pending Verification
              </span>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {analytics?.pendingSubmissions || 0}
              </p>
            </div>
          </div>

          {/* Recent Submissions List */}
          <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center justify-between">
              <span>Recent Participant Submissions</span>
              <button
                onClick={() => navigate('/admin-dashboard/bi-weekly-room/submissions')}
                className="text-xs text-brandPrimary hover:underline normal-case font-bold"
              >
                Go to Submissions Desk →
              </button>
            </h3>

            {(!analytics?.recentSubmissions || analytics.recentSubmissions.length === 0) ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No submissions recorded yet for this room.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {analytics.recentSubmissions.map((sub) => (
                  <div key={sub._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brandPrimary/10 text-brandPrimary font-bold flex items-center justify-center">
                        {sub.userId?.name ? sub.userId.name.charAt(0) : 'U'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {sub.userId?.name || 'Participant'}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          Task: {sub.taskId?.title || 'General Task'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : sub.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: LEADERBOARD ================= */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Room Standings & Leaderboard
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Live Room Scoreboard
            </span>
          </div>

          {members.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No members enrolled in this room yet. Assign members to view room standings.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Rank</th>
                    <th className="pb-3">Participant</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Tasks Completed</th>
                    <th className="pb-3 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {members.map((m, idx) => (
                    <tr key={m._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 font-extrabold text-sm">
                        {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brandPrimary/10 text-brandPrimary font-extrabold flex items-center justify-center text-xs">
                          {m.userId?.name ? m.userId.name.charAt(0) : 'U'}
                        </div>
                        {m.userId?.name || 'Member'}
                      </td>
                      <td className="py-3 text-slate-400">{m.userId?.email || '—'}</td>
                      <td className="py-3 font-bold text-brandPrimary">{m.completedTasksCount || 0}</td>
                      <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {(m.accumulatedPoints || 0).toLocaleString()} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: MEMBERS DIRECTORY ================= */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search room members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-brandPrimary focus:outline-none"
              />
            </div>

            <button
              onClick={() => setIsAssignDrawerOpen(true)}
              className="px-4 py-2 bg-brandPrimary text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Add / Assign Members
            </button>
          </div>

          <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
            {filteredMembers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">
                No members found matching your search.
              </p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-white/5 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="p-4">Member</th>
                    <th className="p-4">Email / Contact</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Accumulated Points</th>
                    <th className="p-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredMembers.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brandPrimary/10 text-brandPrimary font-black flex items-center justify-center text-xs">
                          {m.userId?.name ? m.userId.name.charAt(0) : 'U'}
                        </div>
                        {m.userId?.name || 'Participant'}
                      </td>
                      <td className="p-4 text-slate-400">
                        {m.userId?.email || m.userId?.phone || '—'}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                          {m.role || 'Member'}
                        </span>
                      </td>
                      <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">
                        {(m.accumulatedPoints || 0).toLocaleString()} pts
                      </td>
                      <td className="p-4 text-slate-400">
                        {m.joinedDate ? new Date(m.joinedDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 7. ASSIGN MEMBERS DRAWER */}
      <RightDrawer
        isOpen={isAssignDrawerOpen}
        onClose={() => setIsAssignDrawerOpen(false)}
        title="Assign Members to Room"
      >
        <form onSubmit={handleAssignMembers} className="space-y-4">
          <p className="text-xs text-slate-500">
            Enter one or more User ObjectIDs or Emails (comma or newline separated) to assign members directly to <strong>{roomData.name}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              User IDs / Identifiers
            </label>
            <textarea
              rows={5}
              required
              placeholder="e.g. 64d9f1..., 64d9f2..."
              value={assignUserIds}
              onChange={(e) => setAssignUserIds(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAssignDrawerOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90"
            >
              Assign Members
            </button>
          </div>
        </form>
      </RightDrawer>
    </div>
  );
};

export default RoomDetailsPage;
