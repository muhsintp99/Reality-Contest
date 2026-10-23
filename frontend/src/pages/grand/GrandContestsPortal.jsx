import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Search, Filter, Calendar, Clock, DollarSign, Award, 
  ArrowRight, ShieldCheck, Sparkles, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import grandContestApi from '../../services/grandContestApi';

export const GrandContestsPortal = () => {
  const navigate = useNavigate();

  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchContests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await grandContestApi.getGrandContests();
      const list = res.data?.contests || res.contests || res.data || (Array.isArray(res) ? res : []);
      setContests(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching grand contests:', err);
      setError(err.response?.data?.message || 'Failed to load grand contests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const filteredContests = contests.filter((c) => {
    const titleMatch = (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (c.contestId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === 'All' || c.status === statusFilter;
    return titleMatch && statusMatch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brandPrimary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Elite Cash Tournament Series</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-poppins tracking-tight text-white">
              Grand Contests 🏆
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
              Compete in high-stakes multi-skill grand tournaments. Win verified cash prizes credited directly to your INR cash wallet.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchContests}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 transition-all cursor-pointer"
              title="Refresh Contests"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glassmorphism p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search grand tournaments..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {['All', 'Active', 'Registration Open', 'Upcoming', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === status
                  ? 'bg-brandPrimary text-white shadow-md'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-white/50 dark:bg-white/5 rounded-3xl animate-pulse border border-slate-200/60 dark:border-white/5" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-3xl space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-base font-bold text-red-500">Failed to Load Tournaments</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={fetchContests}
            className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl"
          >
            Retry
          </button>
        </div>
      )}

      {/* Contests Grid */}
      {!loading && !error && filteredContests.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 rounded-3xl space-y-3">
          <Trophy className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No Grand Tournaments Found</h3>
          <p className="text-xs text-slate-400">Check back soon for new grand challenges and tournament seasons.</p>
        </div>
      )}

      {!loading && !error && filteredContests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((c) => {
            const contestId = c._id || c.id || c.contestId;
            const tasksCount = Array.isArray(c.tasks) ? c.tasks.length : (c.tasksCount || c.totalTasks || 0);
            const prize = Number(c.prizePool || 0);
            const fee = Number(c.entryFee || 0);

            return (
              <div
                key={contestId}
                className="group relative bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 hover:border-brandPrimary/50 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Status & ID Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                      {c.contestId || 'GRAND-CONTEST'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      c.status === 'Active' || c.status === 'Registration Open'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      ● {c.status || 'Active'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins group-hover:text-brandPrimary transition-colors line-clamp-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed font-medium">
                      {c.description || 'Exclusive multi-skill grand tournament with milestone task progression.'}
                    </p>
                  </div>

                  {/* Metrics Box */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl border border-amber-500/15">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                        Cash Prize Pool
                      </span>
                      <span className="text-base font-black text-amber-600 dark:text-amber-300 mt-0.5 block">
                        ₹{prize.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Entry Fee
                      </span>
                      <span className="text-base font-black text-slate-800 dark:text-white mt-0.5 block">
                        {fee === 0 ? 'FREE' : `₹${fee} Cash`}
                      </span>
                    </div>
                  </div>

                  {/* Additional Tags */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{tasksCount} Tasks</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-brandPrimary" />
                      <span>{c.durationDays || 30} Days</span>
                    </div>
                  </div>
                </div>

                {/* View Contest Button */}
                <button
                  onClick={() => navigate(`/grand-contests/${c.contestId || contestId}`)}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-brandPrimary text-white text-xs font-bold rounded-2xl shadow-md hover:bg-brandPrimary/90 transition-all cursor-pointer"
                >
                  <span>View Tournament & Tasks</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GrandContestsPortal;
