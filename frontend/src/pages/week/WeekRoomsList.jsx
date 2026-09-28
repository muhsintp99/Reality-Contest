import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Users, Calendar, ArrowRight, Search, Filter, RefreshCw, 
  Sparkles, CheckCircle2, ShieldAlert, Award, Layers, ChevronRight
} from 'lucide-react';
import weekRoomApi from '../../services/weekRoomApi';

export const WeekRoomsList = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await weekRoomApi.getWeekRooms({
        search: searchQuery,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        page: pagination.page,
        limit: pagination.limit
      });

      if (res && res.data) {
        const roomData = res.data.rooms || (Array.isArray(res.data) ? res.data : []);
        setRooms(roomData);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      } else if (Array.isArray(res)) {
        setRooms(res);
      } else {
        setRooms([]);
      }
    } catch (err) {
      console.error('Error fetching week rooms:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load week rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [statusFilter, pagination.page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRooms();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-brandPrimary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brandPrimary/20 border border-brandPrimary/30 rounded-full text-xs font-bold text-brandPrimary tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bi-Weekly Cohort System</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight font-poppins text-white">
              Week Rooms Arena 🏆
            </h1>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Join exclusive cohort rooms, participate in bi-weekly task cycles, track milestone progress, submit proofs, and conquer global leaderboards for real rewards.
            </p>
          </div>

          <button 
            onClick={fetchRooms} 
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Rooms</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-md">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search week rooms by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brandPrimary text-slate-800 dark:text-white placeholder-slate-400"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 px-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['All', 'Active', 'Archived', 'Inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === status
                  ? 'bg-brandPrimary text-white shadow-md'
                  : 'bg-white/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton View */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-6 bg-slate-200 dark:bg-white/10 rounded-lg w-28" />
                <div className="h-5 bg-slate-200 dark:bg-white/10 rounded-full w-16" />
              </div>
              <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
              <div className="h-10 bg-slate-200 dark:bg-white/10 rounded-xl w-full" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="h-12 bg-slate-200 dark:bg-white/10 rounded-xl" />
                <div className="h-12 bg-slate-200 dark:bg-white/10 rounded-xl" />
              </div>
              <div className="h-10 bg-slate-200 dark:bg-white/10 rounded-2xl w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error View */}
      {!loading && error && (
        <div className="glassmorphism p-8 rounded-3xl border border-red-500/20 text-center space-y-4 max-w-lg mx-auto">
          <div className="inline-flex p-4 bg-red-500/10 border border-red-500/20 rounded-full text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Unable to load Week Rooms</h3>
            <p className="text-xs text-slate-500 dark:text-white/60 mt-1 font-medium">{error}</p>
          </div>
          <button
            onClick={fetchRooms}
            className="px-5 py-2.5 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow-lg hover:bg-brandPrimary/90 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty State View */}
      {!loading && !error && rooms.length === 0 && (
        <div className="glassmorphism p-12 rounded-3xl border border-slate-200 dark:border-white/10 text-center space-y-4 max-w-md mx-auto">
          <div className="inline-flex p-4 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Week Rooms Available</h3>
          <p className="text-xs text-slate-500 dark:text-white/60 font-medium">
            There are currently no bi-weekly room cohorts matching your search criteria.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
            className="px-4 py-2 bg-slate-800 text-white dark:bg-white/10 text-xs font-semibold rounded-xl"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Rooms Grid */}
      {!loading && !error && rooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const roomId = room._id || room.id;
            const memberCount = room.membersCount || (Array.isArray(room.members) ? room.members.length : 0);
            const maxCapacity = room.maxMembers || 50;
            const capacityPercentage = Math.min(100, Math.round((memberCount / maxCapacity) * 100));
            const cycleCount = room.cycleIds ? room.cycleIds.length : (room.cycleCount || 0);

            return (
              <div 
                key={roomId}
                className="group relative bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 hover:border-brandPrimary/50 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Status Badge & Code */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-extrabold rounded-full tracking-wider uppercase">
                      {room.code || 'RM-COHORT'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                      room.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                      ● {room.status || 'Active'}
                    </span>
                  </div>

                  {/* Room Name & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins group-hover:text-brandPrimary transition-colors line-clamp-1">
                      {room.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed font-medium">
                      {room.description || 'Participate in structured weekly milestone tasks with your room cohort.'}
                    </p>
                  </div>

                  {/* Top Scorer Highlight if available */}
                  {room.topMember && (
                    <div className="flex items-center gap-2.5 p-2.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Top Contender</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{room.topMember.name}</p>
                      </div>
                      <span className="text-xs font-extrabold text-amber-500 px-2 py-0.5 bg-amber-500/10 rounded-lg">
                        {room.topMember.points} pts
                      </span>
                    </div>
                  )}

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        <span>Capacity</span>
                      </div>
                      <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                        {memberCount} / {maxCapacity}
                      </p>
                      {/* Capacity Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-brandPrimary rounded-full transition-all duration-500" 
                          style={{ width: `${capacityPercentage}%` }} 
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Total Cycles</span>
                      </div>
                      <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                        {cycleCount} Cycles
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">
                        {room.durationDays ? `${room.durationDays} Days Duration` : '14 Days Standard'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* View Room Action CTA */}
                <div className="pt-6 mt-4 border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => navigate(`/week/rooms/${roomId}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brandPrimary/10 hover:bg-brandPrimary text-brandPrimary hover:text-white text-xs font-bold rounded-2xl transition-all shadow-sm group-hover:shadow-md"
                  >
                    <span>View Room Details</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeekRoomsList;
