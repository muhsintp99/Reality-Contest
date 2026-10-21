import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Layers, Plus, Search, Edit3, Trash2, Users, UserPlus, RefreshCw, Eye, Upload, Link as LinkIcon, Image as ImageIcon, X, ShieldCheck, Award, Calendar, Grid, List, Trophy, TrendingUp, BarChart3, CheckCircle2, Target, Crown, Medal, Clock, XCircle, CheckSquare, Coins, Sparkles, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { setRooms, setActiveRoom, setLoading } from '../../store/roomCycleSlice';
import { useAlert } from '../../context/AlertContext';
import { RightDrawer } from '../../components/RightDrawer';
import { CustomSelect } from '../../components/CustomSelect';
import { MultiSelect } from '../../components/MultiSelect';
import { slugifyTitle } from '../../utils/routeUtils';

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

const RoomCoverImage = ({ src, alt, code, className = 'w-full h-36' }) => {
  const [error, setError] = useState(false);
  const safeSrc = getSafeImageUrl(src);

  if (!safeSrc || error) {
    return (
      <div className={`rounded-xl bg-gradient-to-tr from-brandPrimary/20 via-emerald-500/10 to-indigo-500/20 border border-slate-200 dark:border-white/10 flex items-center justify-center font-black text-brandPrimary group-hover:scale-[1.01] transition-transform ${className}`}>
        {code || 'ROOM'}
      </div>
    );
  }

  return (
    <img
      src={safeSrc}
      loading="lazy"
      decoding="async"
      className={`${className} object-cover rounded-xl border border-slate-200 dark:border-white/10 group-hover:scale-[1.01] transition-transform`}
      alt={alt}
      onError={() => setError(true)}
    />
  );
};

export const RoomManagementPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert, showConfirm, showSnackbar } = useAlert();
  const { rooms, activeRoom, roomMembers, loading, pagination } = useSelector((state) => state.roomCycle);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [brokenImageIds, setBrokenImageIds] = useState(new Set());

  // Drawer states
  const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);
  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [viewingRoom, setViewingRoom] = useState(null);
  const [detailsTab, setDetailsTab] = useState('overview'); // 'overview' | 'analytics' | 'leaderboard' | 'members'
  const [roomAnalytics, setRoomAnalytics] = useState(null);

  const [availableTasks, setAvailableTasks] = useState([]);

  // Member assignment state
  const [assignUserIds, setAssignUserIds] = useState('');

  const fetchRooms = async () => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get('/api/week/rooms', {
        params: { search, status: statusFilter, page, limit: 10 }
      });
      if (res.data?.success) {
        dispatch(setRooms(res.data.data));
      } else {
        dispatch(setRooms({ rooms: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } }));
      }
    } catch (err) {
      console.error(err);
      dispatch(setRooms({ rooms: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchTasks = async () => {
    try {
      let list = [];
      const res = await axios.get('/api/admin/tasks?limit=100').catch(() => null);
      if (res?.data?.success) {
        const raw = res.data.data;
        list = Array.isArray(raw?.tasks) ? raw.tasks : Array.isArray(raw) ? raw : (Array.isArray(res.data.tasks) ? res.data.tasks : []);
      }
      setAvailableTasks(list);
    } catch (err) {
      console.error('Error fetching tasks for room:', err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchTasks();
  }, [search, statusFilter, page]);



  const handleDeleteRoomClick = (room) => {
    showConfirm('Delete Room', `Are you sure you want to permanently delete room "${room.name}"?`, async () => {
      try {
        await axios.delete(`/api/week/rooms/${room._id}`);
        showSnackbar(`Room "${room.name}" deleted!`, 'success');
        fetchRooms();
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to delete room', 'error');
      }
    });
  };

  const handleRemoveMemberClick = (member) => {
    const memberName = member.userId?.name || 'User';
    showConfirm('Remove Member', `Are you sure you want to remove user "${memberName}" from this room?`, async () => {
      try {
        await axios.delete(`/api/admin/members/${activeRoom._id}/${member.userId?._id || member.userId}`);
        showSnackbar('Member removed from room', 'success');
        if (activeRoom) openViewMembers(activeRoom);
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to remove member', 'error');
      }
    });
  };

  const handleBulkActionClick = (action) => {
    if (!selectedRooms.length) return;
    showConfirm(`Bulk ${action}`, `Are you sure you want to execute bulk "${action}" on ${selectedRooms.length} selected rooms?`, async () => {
      try {
        await axios.post('/api/week/rooms/bulk-action', {
          roomIds: selectedRooms,
          action
        });
        showSnackbar(`Bulk ${action} executed for ${selectedRooms.length} rooms`, 'success');
        setSelectedRooms([]);
        fetchRooms();
      } catch (err) {
        showAlert(err.response?.data?.message || 'Bulk action failed', 'error');
      }
    });
  };

  const roomsList = Array.isArray(rooms) ? rooms : (Array.isArray(rooms?.rooms) ? rooms.rooms : []);

  const formatSafeDate = (d, fallback = 'N/A') => {
    if (!d) return fallback;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? fallback : dt.toLocaleDateString();
  };

  const openViewRoomDetailsDrawer = (room, tab = 'overview') => {
    const slug = slugifyTitle(room.title, room._id);
    navigate(`/admin-dashboard/bi-weekly-room/rooms/${slug}?tab=${tab}`);
  };

  const openViewDetails = (room, tab = 'tasks') => {
    const slug = slugifyTitle(room.title, room._id);
    navigate(`/admin-dashboard/bi-weekly-room/rooms/${slug}?tab=${tab}`);
  };

  const openViewMembers = (room) => {
    const slug = slugifyTitle(room.title, room._id);
    navigate(`/admin-dashboard/bi-weekly-room/rooms/${slug}?tab=members`);
  };

  const handleAssignMembers = async (e) => {
    e.preventDefault();
    if (!activeRoom) return;
    const userIdsArray = assignUserIds.split(',').map((id) => id.trim()).filter(Boolean);
    try {
      const res = await axios.post('/api/admin/members/assign', {
        roomId: activeRoom._id,
        userIds: userIdsArray
      });
      if (res.data?.success) {
        showSnackbar('Members assigned successfully!', 'success');
        setIsAssignDrawerOpen(false);
        setAssignUserIds('');
        openViewMembers(activeRoom);
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Assignment failed', 'error');
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      {/* Page Title & Controls - Exact Contest Management Desk Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-brandPrimary" />
            Room Management Desk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create, Edit, Delete, View Room Details, manage Tasks, Capacity, and Member Allocations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin-dashboard/bi-weekly-room/rooms/create')}
            className="px-4 py-2 bg-brandPrimary text-white rounded-xl text-xs font-bold shadow-md hover:bg-brandPrimary/90 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> Create Room
          </button>
        </div>
      </div>

      {/* Quick Desk KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brandPrimary/10 text-brandPrimary flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Rooms</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{pagination?.total || roomsList.length}</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Rooms</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {roomsList.filter(r => r.status === 'Active' || r.status === 'In Progress').length}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Members</span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
              {roomsList.reduce((sum, r) => sum + (Number(r.membersCount) || 0), 0)}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Points</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              {roomsList.reduce((sum, r) => sum + (Number(r.totalPoints) || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Desk Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search rooms by name, code, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active ⚡' },
              { value: 'Inactive', label: 'Inactive' },
              { value: 'Archived', label: 'Archived 📦' }
            ]}
            className="w-48"
          />

          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-brandPrimary shadow-sm' : 'text-slate-400'
                }`}
              title="Grid Cards View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-brandPrimary shadow-sm' : 'text-slate-400'
                }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Room Display Cards Grid / Datatable */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
              <div className="w-full h-32 bg-slate-200 dark:bg-white/10 rounded-xl" />
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-full" />
              <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl" />
            </div>
          ))}
        </div>
      ) : roomsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-300 dark:text-white/20" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Rooms Found</h3>
          <p className="text-xs text-slate-400 max-w-sm">No competition rooms match your current search query or filter settings.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomsList.map((room) => (
            <div
              key={room._id}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-brandPrimary/30 transition-all hover:shadow-md"
            >
              <div className="space-y-3">
                <div onClick={() => openViewRoomDetailsDrawer(room, 'overview')} className="cursor-pointer group">
                  <RoomCoverImage
                    src={room.roomImage}
                    alt={room.name}
                    code={room.code}
                    className="w-full h-36"
                  />

                  <div className="flex justify-between items-start gap-2 mt-3">
                    <div>
                      <span className="px-2 py-0.5 bg-brandPrimary/10 text-brandPrimary font-mono font-bold rounded text-[10px] inline-block mb-1">
                        {room.code}
                      </span>
                      <h3 className="font-bold font-poppins text-slate-900 dark:text-white text-base leading-snug group-hover:text-brandPrimary transition-colors">
                        {room.name}
                      </h3>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1.5 border ${room.status === 'Active' || room.status === 'In Progress'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : room.status === 'Registration Open'
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                            : room.status === 'Upcoming'
                              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                              : room.status === 'Completed'
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                                : room.status === 'Archived'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                  : 'bg-slate-500/10 text-slate-500 border-slate-500/30'
                        }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {room.status || 'Active'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {room.description || 'No description provided.'}
                </p>

                {/* PRIZE POOL & FINANCIALS BADGE */}
                <div className="grid grid-cols-2 gap-2 bg-gradient-to-r from-amber-500/5 via-brandPrimary/5 to-emerald-500/5 p-2.5 rounded-xl border border-amber-500/20 text-xs">
                  <div>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-bold uppercase flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-500" /> Prize Pool
                    </span>
                    <span className="font-extrabold text-slate-800 dark:text-white text-sm">
                      {room.entryFeeType === 'Cash'
                        ? `₹${Number(room.prizePool || 50000).toLocaleString()}`
                        : `${Number(room.prizePool || room.coinsReward || 10000).toLocaleString()} 🪙 Coins`}
                      {room.coinsReward ? <span className="text-amber-500 text-xs ml-1 font-bold">+{room.coinsReward} 🪙</span> : null}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-500" /> Entry Fee
                    </span>
                    <span className="font-extrabold text-xs text-slate-800 dark:text-white">
                      {room.entryFeeType === 'Cash'
                        ? `₹${room.entryFee || 99}`
                        : `${room.entryFeeCoins || room.entryFee || 50} 🪙 Coins`}
                    </span>
                  </div>
                </div>

                {/* TIMER & SEATS STRIP */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-400" /> Timer & Duration
                    </span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs">
                      {room.timerLimit || 30} Mins • {room.durationDays || 14}d
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3 text-brandPrimary" /> Active Seats</span>
                      <span className="text-slate-700 dark:text-slate-200 font-extrabold">{room.membersCount || 0} / {room.maxMembers || 50}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-brandPrimary h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.round(((room.membersCount || 0) / (room.maxMembers || 50)) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* SCHEDULE TIMELINES */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-white/5 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-[10px] uppercase">
                      <Calendar className="w-3 h-3 text-amber-500" /> Reg Window:
                    </span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {formatSafeDate(room.registrationStart, 'Immediate')} – {formatSafeDate(room.registrationEnd, 'Open')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-[10px] uppercase">
                      <Target className="w-3 h-3 text-emerald-500" /> Execution:
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatSafeDate(room.startDate, 'Active')} – {formatSafeDate(room.endDate, 'Ongoing')}
                    </span>
                  </div>
                </div>

                {/* Leaderboard Banner & Top Scorer (Clickable) */}
                <div
                  onClick={() => openViewRoomDetailsDrawer(room, 'leaderboard')}
                  className="bg-gradient-to-r from-amber-500/10 via-brandPrimary/10 to-indigo-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-center justify-between text-xs cursor-pointer hover:border-amber-500/50 transition-all group"
                  title="Click to view Room Leaderboard"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block uppercase">Rank #{room.rank || 1}</span>
                      <span className="font-extrabold text-slate-800 dark:text-white">
                        {(room.totalPoints || 0).toLocaleString()} pts
                      </span>
                    </div>
                  </div>
                  {room.topMember ? (
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase flex items-center gap-1 justify-end">
                        <Crown className="w-3 h-3 text-amber-400" /> Top Scorer
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[110px] block">
                        {room.topMember.name} ({room.topMember.points}p)
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No submissions yet</span>
                  )}
                </div>

                {/* Analytics Metrics Box (Clickable) */}
                <div
                  onClick={() => openViewRoomDetailsDrawer(room, 'analytics')}
                  className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-white/5 space-y-1.5 text-xs cursor-pointer hover:border-indigo-500/40 transition-all group"
                  title="Click to view Room Analytics"
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                    <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3 text-indigo-500 group-hover:scale-110 transition-transform" /> Analytics</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{room.analytics?.completionRate || 0}% Approved</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, room.analytics?.completionRate || 0)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    <span>Submissions: <strong className="text-slate-800 dark:text-white">{room.analytics?.totalSubmissions || 0}</strong></span>
                    <span>Tasks: <strong className="text-brandPrimary">{(room.taskIds?.length) || (room.analytics?.activeTasksCount) || 0}</strong></span>
                  </div>
                </div>

                {/* Connected Cycles Badges */}
                {room.cycleIds && room.cycleIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 items-center pt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 mr-1 flex items-center gap-0.5">
                      <Layers className="w-3 h-3 text-indigo-500" /> Cycle:
                    </span>
                    {room.cycleIds.map((c, cIdx) => {
                      const cNum = typeof c === 'object' ? c.cycleNumber : '';
                      const cTitle = typeof c === 'object' ? c.title : c;
                      return (
                        <span key={typeof c === 'object' ? (c._id || cIdx) : cIdx} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-md border border-indigo-500/20 truncate max-w-[200px]">
                          {cNum ? `#${cNum} ` : ''}{cTitle}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Connected Tasks Badges */}
                {room.taskIds && room.taskIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 items-center pt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 mr-1 flex items-center gap-0.5">
                      <CheckSquare className="w-3 h-3 text-brandPrimary" /> Tasks:
                    </span>
                    {room.taskIds.slice(0, 3).map((t, tIdx) => {
                      const tId = typeof t === 'object' ? String(t._id || t.id) : String(t);
                      const matchedTask = (typeof t === 'object' && t.title) ? t : availableTasks.find((at) => String(at._id || at.id) === tId);
                      const tTitle = matchedTask?.title || (typeof t === 'object' ? t.title : `Task #${tIdx + 1}`);
                      const tPoints = matchedTask?.points ? `${matchedTask.points}p` : '';
                      return (
                        <span key={tId || tIdx} className="px-2 py-0.5 bg-brandPrimary/10 text-brandPrimary text-[10px] font-bold rounded-md border border-brandPrimary/20 truncate max-w-[150px]">
                          {tTitle} {tPoints && <span className="text-amber-500 ml-0.5">• {tPoints}</span>}
                        </span>
                      );
                    })}
                    {room.taskIds.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-md">
                        +{room.taskIds.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons Desk Row */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openViewRoomDetailsDrawer(room, 'overview')}
                    title="Quick View Details Drawer"
                    className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openViewDetails(room, 'analytics')}
                    title="Room Submission Analytics (Full Page)"
                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openViewDetails(room, 'leaderboard')}
                    title="Room Leaderboard (Full Page)"
                    className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openViewMembers(room)}
                    title="Manage Members"
                    className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/admin-dashboard/bi-weekly-room/rooms/edit/${slugifyTitle(room.title || room.name, room._id)}`)}
                    title="Edit Room"
                    className="p-2 text-brandPrimary hover:bg-brandPrimary/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteRoomClick(room)}
                  title="Delete Room"
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Room</th>
                  <th className="p-4">Code</th>
                  <th className="p-4">Prize Pool & Fee</th>
                  <th className="p-4">Timer & Seats</th>
                  <th className="p-4">Schedule Timelines</th>
                  <th className="p-4">Rank / Points</th>
                  <th className="p-4">Connected Tasks</th>
                  <th className="p-4">Submissions</th>
                  <th className="p-4">Execution Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                {roomsList.map((room) => (
                  <tr key={room._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <RoomCoverImage
                        src={room.roomImage}
                        alt={room.name}
                        code={room.code ? room.code.slice(0, 3) : 'RM'}
                        className="w-10 h-10 text-xs"
                      />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{room.name}</span>
                        <span className="text-[11px] text-slate-400 line-clamp-1 max-w-[180px]">{room.description || 'No description'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold rounded">
                        {room.code}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-slate-900 dark:text-white block flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          {room.entryFeeType === 'Cash'
                            ? `₹${Number(room.prizePool || 50000).toLocaleString()}`
                            : `${Number(room.prizePool || room.coinsReward || 10000).toLocaleString()} 🪙 Coins`}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {room.entryFeeType === 'Cash'
                            ? `₹${room.entryFee || 99}`
                            : `${room.entryFeeCoins || room.entryFee || 50} 🪙 Coins`}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-400" /> {room.timerLimit || 30} Mins ({room.durationDays || 14}d)
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <Users className="w-3 h-3 text-brandPrimary" />
                          <span className="font-bold text-slate-700 dark:text-slate-200">{room.membersCount || 0} / {room.maxMembers || 50} Seats</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      <div className="space-y-0.5 text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 block">
                          Reg: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{formatSafeDate(room.registrationStart, 'Immediate')} – {formatSafeDate(room.registrationEnd, 'Open')}</strong>
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 block font-semibold">
                          Exec: {formatSafeDate(room.startDate, 'Active')} – {formatSafeDate(room.endDate, 'Ongoing')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      <button
                        onClick={() => openViewRoomDetailsDrawer(room, 'leaderboard')}
                        className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-xs rounded-lg border border-amber-500/20 inline-flex items-center gap-1 hover:bg-amber-500/20 transition-all cursor-pointer"
                        title="Click to view Room Leaderboard"
                      >
                        <Trophy className="w-3 h-3" /> Rank #{room.rank || 1}
                      </button>
                      <span className="block font-black text-emerald-600 dark:text-emerald-400 text-xs mt-1">
                        {(room.totalPoints || 0).toLocaleString()} pts
                      </span>
                    </td>
                    <td className="p-4 font-bold text-brandPrimary flex items-center gap-1 text-xs">
                      <CheckSquare className="w-3.5 h-3.5 text-brandPrimary" />
                      {(room.taskIds?.length) || (room.analytics?.activeTasksCount) || 0} Tasks
                    </td>
                    <td className="p-4 text-xs">
                      <button
                        onClick={() => openViewRoomDetailsDrawer(room, 'analytics')}
                        className="text-left hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-all cursor-pointer"
                        title="Click to view Room Analytics"
                      >
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">{room.analytics?.totalSubmissions || 0} subs</span>
                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 font-bold rounded text-[10px]">
                          {room.analytics?.completionRate || 0}% rate
                        </span>
                      </button>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${room.status === 'Active' || room.status === 'In Progress'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : room.status === 'Registration Open'
                              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                              : room.status === 'Upcoming'
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                                : room.status === 'Completed'
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                                  : room.status === 'Archived'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                    : 'bg-slate-500/10 text-slate-500 border-slate-500/30'
                          }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {room.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openViewRoomDetailsDrawer(room, 'overview')} title="Quick Room Overview" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openViewDetails(room, 'analytics')} title="Room Submission Analytics (Full Page)" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer">
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => openViewDetails(room, 'leaderboard')} title="Room Leaderboard (Full Page)" className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer">
                          <Trophy className="w-4 h-4" />
                        </button>
                        <button onClick={() => openViewMembers(room)} title="Manage Members" className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin-dashboard/bi-weekly-room/rooms/edit/${slugifyTitle(room.title || room.name, room._id)}`)}
                          title="Edit Room"
                          className="p-2 text-brandPrimary hover:bg-brandPrimary/10 rounded-lg cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteRoomClick(room)} title="Delete Room" className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Page <strong className="text-slate-800 dark:text-white">{page}</strong> of <strong className="text-slate-800 dark:text-white">{pagination.totalPages}</strong> ({pagination.total} total rooms)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Full Room Details Drawer */}
      <RightDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        title={viewingRoom ? `Room Details: ${viewingRoom.name}` : 'Room Details'}
      >
        {viewingRoom && (
          <div className="space-y-5">
            {/* Header Banner */}
            <div className="flex items-center gap-4 p-4 bg-[#E2F1D5]/60 dark:bg-slate-900/80 rounded-2xl border border-[#C4E2A8]/80 dark:border-slate-800">
              <RoomCoverImage
                src={viewingRoom.roomImage}
                alt={viewingRoom.name}
                code={viewingRoom.code ? viewingRoom.code.slice(0, 3) : 'RM'}
                className="w-16 h-16 rounded-2xl text-xl shadow-md"
              />
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{viewingRoom.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 bg-brandPrimary/10 text-brandPrimary font-mono font-bold text-xs rounded-md">
                    Code: {viewingRoom.code}
                  </span>
                  <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 font-bold text-xs rounded-md flex items-center gap-1 border border-amber-500/20">
                    <Trophy className="w-3 h-3 text-amber-500" /> Rank #{viewingRoom.rank || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Tab Navigation */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                onClick={() => setDetailsTab('overview')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${detailsTab === 'overview' ? 'bg-white dark:bg-slate-800 text-brandPrimary shadow-sm' : 'text-slate-500'
                  }`}
              >
                <Layers className="w-3.5 h-3.5" /> Overview
              </button>
              <button
                onClick={() => setDetailsTab('tasks')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${detailsTab === 'tasks' ? 'bg-white dark:bg-slate-800 text-brandPrimary shadow-sm' : 'text-slate-500'
                  }`}
              >
                <CheckSquare className="w-3.5 h-3.5" /> Tasks ({(viewingRoom.tasks || viewingRoom.taskIds || []).length})
              </button>
              <button
                onClick={() => setDetailsTab('analytics')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${detailsTab === 'analytics' ? 'bg-white dark:bg-slate-800 text-brandPrimary shadow-sm' : 'text-slate-500'
                  }`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Analytics
              </button>
              <button
                onClick={() => setDetailsTab('leaderboard')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${detailsTab === 'leaderboard' ? 'bg-white dark:bg-slate-800 text-brandPrimary shadow-sm' : 'text-slate-500'
                  }`}
              >
                <Trophy className="w-3.5 h-3.5" /> Leaderboard
              </button>
              <button
                onClick={() => setDetailsTab('members')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${detailsTab === 'members' ? 'bg-white dark:bg-slate-800 text-brandPrimary shadow-sm' : 'text-slate-500'
                  }`}
              >
                <Users className="w-3.5 h-3.5" /> Members ({roomMembers.length})
              </button>
            </div>

            {/* TAB CONTENT */}

            {/* 1. OVERVIEW TAB */}
            {detailsTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-medium block">Room Tasks</span>
                    <span className="font-bold text-brandPrimary text-sm flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-brandPrimary" />
                      {(viewingRoom.tasks || viewingRoom.taskIds || []).length} Tasks
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-medium block">Active Seats</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{viewingRoom.membersCount || 0} / {viewingRoom.maxMembers || 50}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-medium block">Duration</span>
                    <span className="font-bold text-indigo-500 text-sm">⏳ {viewingRoom.durationDays || 14} Days ({viewingRoom.timerLimit || 30}m)</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-medium block">Prize Pool</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                      {viewingRoom.entryFeeType === 'Coins'
                        ? `${Number(viewingRoom.prizePool || 0).toLocaleString()} 🪙 Coins`
                        : `₹${Number(viewingRoom.prizePool || 0).toLocaleString()}`}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-medium block">Entry Fee</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {viewingRoom.entryFeeType === 'Cash'
                        ? `₹${viewingRoom.entryFee || 99}`
                        : `${viewingRoom.entryFeeCoins || viewingRoom.entryFee || 50} 🪙 Coins`}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-medium block">Leaderboard Rank & Points</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      Rank #{viewingRoom.rank || 1} • {(viewingRoom.totalPoints || 0).toLocaleString()} pts
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Description</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    {viewingRoom.description || 'No description provided.'}
                  </p>
                </div>

                {viewingRoom.rules && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Room Rules 📜</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-line">
                      {viewingRoom.rules}
                    </p>
                  </div>
                )}

                {viewingRoom.guidelines && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Guidelines & Terms 📋</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-line">
                      {viewingRoom.guidelines}
                    </p>
                  </div>
                )}

                {((viewingRoom.tasks && viewingRoom.tasks.length > 0) || (viewingRoom.taskIds && viewingRoom.taskIds.length > 0)) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-brandPrimary" />
                        Connected Tasks ({(viewingRoom.tasks || viewingRoom.taskIds).length})
                      </h4>
                      <button
                        onClick={() => setDetailsTab('tasks')}
                        className="text-[11px] text-brandPrimary font-bold hover:underline cursor-pointer"
                      >
                        View All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(viewingRoom.tasks || viewingRoom.taskIds).slice(0, 6).map((t, idx) => (
                        <div key={typeof t === 'object' ? (t._id || t.id || idx) : t} className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                              {typeof t === 'object' ? t.title : t}
                            </span>
                          </div>
                          {typeof t === 'object' && t.points !== undefined && (
                            <span className="px-2 py-0.5 text-[10px] rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold whitespace-nowrap">
                              {t.points} pts
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connected Cycles in Drawer Overview */}
                {((viewingRoom.cycles && viewingRoom.cycles.length > 0) || (viewingRoom.cycleIds && viewingRoom.cycleIds.length > 0)) && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      Connected Cycles ({(viewingRoom.cycles || viewingRoom.cycleIds).length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(viewingRoom.cycles || viewingRoom.cycleIds).map((c, cIdx) => (
                        <div key={typeof c === 'object' ? (c._id || c.id || cIdx) : cIdx} className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-indigo-500" />
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            #{typeof c === 'object' ? (c.cycleNumber || 'Cycle') : 'Cycle'} {typeof c === 'object' ? c.title : c}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TASKS TAB */}
            {detailsTab === 'tasks' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-brandPrimary" />
                    Room Assigned Tasks ({(viewingRoom.tasks || viewingRoom.taskIds || []).length})
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Total: {(viewingRoom.tasks || viewingRoom.taskIds || []).reduce((acc, t) => acc + (typeof t === 'object' && t.points ? Number(t.points) : 0), 0)} Points
                  </span>
                </div>

                {!(viewingRoom.tasks || viewingRoom.taskIds) || (viewingRoom.tasks || viewingRoom.taskIds).length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    No tasks directly attached to this room. Edit the room to connect tasks.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                    {(viewingRoom.tasks || viewingRoom.taskIds).map((t, idx) => {
                      const isObj = typeof t === 'object';
                      const title = isObj ? t.title : `Task #${t}`;
                      const taskType = isObj ? (t.taskType || t.submissionType || 'General') : 'Task';
                      const points = isObj ? t.points : 0;
                      const status = isObj ? (t.status || 'Published') : 'Active';
                      const instructions = isObj ? t.instructions : '';

                      return (
                        <div
                          key={isObj ? (t._id || t.id || idx) : t}
                          className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 transition-all space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-xs">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                {title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[11px] rounded-md border border-amber-500/20">
                                {points} pts
                              </span>
                              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-[10px] rounded-md">
                                {taskType}
                              </span>
                            </div>
                          </div>
                          {instructions && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 pl-8">
                              {instructions}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. ANALYTICS TAB */}
            {detailsTab === 'analytics' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold block uppercase text-[10px]">Total Submissions</span>
                    <span className="font-black text-slate-900 dark:text-white text-lg">{roomAnalytics?.totalSubmissions || 0}</span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold block uppercase text-[10px]">Approved Submissions</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">{roomAnalytics?.approvedSubmissions || 0}</span>
                  </div>
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    <span className="text-rose-600 dark:text-rose-400 font-bold block uppercase text-[10px]">Rejected Submissions</span>
                    <span className="font-black text-rose-600 dark:text-rose-400 text-lg">{roomAnalytics?.rejectedSubmissions || 0}</span>
                  </div>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <span className="text-amber-600 dark:text-amber-400 font-bold block uppercase text-[10px]">Pending Review</span>
                    <span className="font-black text-amber-600 dark:text-amber-400 text-lg">{roomAnalytics?.pendingSubmissions || 0}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-200">Room Task Approval Rate</span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm font-extrabold">{roomAnalytics?.completionRate || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, roomAnalytics?.completionRate || 0)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Calculated from total verified submissions vs. total submitted tasks in this room.</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Active Tasks targeting this room</span>
                  <span className="font-extrabold text-brandPrimary text-sm">{roomAnalytics?.activeTasksCount || 0} active tasks</span>
                </div>

                {/* Recent Room Submissions List */}
                {roomAnalytics?.recentSubmissions && roomAnalytics.recentSubmissions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brandPrimary" /> Recent Submissions in Room
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {roomAnalytics.recentSubmissions.map((sub) => (
                        <div key={sub._id} className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brandPrimary/10 text-brandPrimary flex items-center justify-center font-bold text-[10px]">
                              {sub.userId?.name ? sub.userId.name.slice(0, 2) : 'US'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">{sub.userId?.name || 'User'}</span>
                              <span className="text-[10px] text-slate-500 truncate max-w-[150px] block">{sub.taskId?.title || 'Task Submission'}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${sub.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                sub.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                                  'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}>
                              {sub.status}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. LEADERBOARD TAB */}
            {detailsTab === 'leaderboard' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Room Leaderboard Standings</h4>
                  <span className="text-[11px] font-bold text-amber-500">Ranked by points</span>
                </div>

                {/* Top 3 Podium Cards */}
                {roomMembers.length >= 3 && (
                  <div className="grid grid-cols-3 gap-2 py-1">
                    {/* #2 Silver */}
                    <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-md">🥈 #2</span>
                      <p className="font-bold text-slate-900 dark:text-white text-xs mt-1 truncate">{roomMembers[1]?.userId?.name || 'Member'}</p>
                      <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">{(roomMembers[1]?.accumulatedPoints || 0).toLocaleString()} pts</span>
                    </div>
                    {/* #1 Gold */}
                    <div className="bg-amber-500/10 border-2 border-amber-500 rounded-xl p-2.5 text-center transform scale-105 shadow-sm">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-amber-400 text-slate-900 rounded-md">🥇 #1</span>
                      <p className="font-extrabold text-slate-900 dark:text-white text-xs mt-1 truncate">{roomMembers[0]?.userId?.name || 'Member'}</p>
                      <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 block mt-0.5">{(roomMembers[0]?.accumulatedPoints || 0).toLocaleString()} pts</span>
                    </div>
                    {/* #3 Bronze */}
                    <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-amber-800 text-white rounded-md">🥉 #3</span>
                      <p className="font-bold text-slate-900 dark:text-white text-xs mt-1 truncate">{roomMembers[2]?.userId?.name || 'Member'}</p>
                      <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">{(roomMembers[2]?.accumulatedPoints || 0).toLocaleString()} pts</span>
                    </div>
                  </div>
                )}

                {roomMembers.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center bg-slate-50 dark:bg-slate-900/60 rounded-xl">No leaderboard records found for this room.</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {roomMembers.map((m, idx) => (
                      <div key={m._id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs shadow-sm ${idx === 0 ? 'bg-amber-400 text-slate-900' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{m.userId?.name || 'Member'}</span>
                            <span className="text-[11px] text-slate-400">{m.completedTasksCount || 0} tasks completed</span>
                          </div>
                        </div>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{(m.accumulatedPoints || 0).toLocaleString()} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. MEMBERS TAB */}
            {detailsTab === 'members' && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Assigned Room Members ({roomMembers.length})</h4>
                {roomMembers.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center bg-slate-50 dark:bg-slate-900/60 rounded-xl">No members currently assigned to this room.</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {roomMembers.map((m) => (
                      <div key={m._id} className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800 text-xs">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{m.userId?.name || 'Member'}</span>
                          <p className="text-[11px] text-slate-500">{m.userId?.email}</p>
                        </div>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{m.accumulatedPoints || 0} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsDetailsDrawerOpen(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </RightDrawer>

      {/* Member Management Drawer */}
      <RightDrawer
        isOpen={isMemberDrawerOpen}
        onClose={() => setIsMemberDrawerOpen(false)}
        title={activeRoom ? `${activeRoom.name} Members` : 'Room Members'}
      >
        {activeRoom && (
          <div className="space-y-6">
            <div className="p-4 bg-brandPrimary/10 dark:bg-slate-900 rounded-xl border border-brandPrimary/20 flex justify-between items-center">
              <div>
                <p className="text-xs text-brandPrimary font-bold uppercase">Room Code: {activeRoom.code}</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {roomMembers.length} / {activeRoom.maxMembers} Members Assigned
                </p>
              </div>
              <button
                onClick={() => setIsAssignDrawerOpen(true)}
                className="px-3 py-1.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" /> Assign Users
              </button>
            </div>

            {roomMembers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-semibold text-xs">No members currently assigned.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {roomMembers.map((member) => (
                  <div key={member._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                        {member.userId?.name ? member.userId.name.slice(0, 2) : 'US'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                          {member.userId?.name || 'User'}
                          {member.role === 'Leader' && (
                            <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md">
                              Leader
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500">{member.userId?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {member.accumulatedPoints || 0} pts
                      </span>
                      <button
                        onClick={() => handleRemoveMemberClick(member)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </RightDrawer>

      {/* Manual Member Assign Drawer */}
      <RightDrawer
        isOpen={isAssignDrawerOpen}
        onClose={() => setIsAssignDrawerOpen(false)}
        title="Assign Members"
      >
        <form onSubmit={handleAssignMembers} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              User IDs (Comma Separated)
            </label>
            <textarea
              required
              rows={4}
              placeholder="e.g. 6601f2a..., 6601f2b..."
              value={assignUserIds}
              onChange={(e) => setAssignUserIds(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAssignDrawerOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-sm font-semibold"
            >
              Assign Members
            </button>
          </div>
        </form>
      </RightDrawer>
    </div>
  );
};

export default RoomManagementPage;
