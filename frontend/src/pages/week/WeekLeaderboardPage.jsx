import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, RefreshCw, Award, Users } from 'lucide-react';
import weekRoomApi from '../../services/weekRoomApi';

export const WeekLeaderboardPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
  const [scope, setScope] = useState('Room');
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await weekRoomApi.getLeaderboard(roomId, null, scope);
      const lbData = res.data || res.leaderboard || (Array.isArray(res) ? res : []);
      setLeaderboard(Array.isArray(lbData) ? lbData : []);
    } catch (err) {
      console.error('Error loading leaderboard page:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [roomId, scope]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await weekRoomApi.recalculateLeaderboard(null);
      await fetchLeaderboard();
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in">
      <button
        onClick={() => navigate(`/week/rooms/${roomId}`)}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200/60 dark:border-white/10 transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Room</span>
      </button>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> Room Leaderboard Standings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time rankings calculated from milestone task submission scores.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-amber-600 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Recalculating...' : 'Recalculate Leaderboard'}</span>
        </button>
      </div>

      {/* Scope Selector */}
      <div className="flex gap-2">
        {['Room', 'Cycle', 'Overall'].map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              scope === s
                ? 'bg-brandPrimary text-white shadow-md'
                : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5'
            }`}
          >
            {s} Scope
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Contestant</th>
                <th className="py-4 px-6">Score</th>
                <th className="py-4 px-6">Tasks Completed</th>
                <th className="py-4 px-6">Reward Qualified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-medium text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Loading standings...</td>
                </tr>
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">No leaderboard standings recorded.</td>
                </tr>
              ) : (
                leaderboard.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                    <td className="py-4 px-6 font-black text-sm">
                      {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      {item.userName || item.userId?.name || 'Contestant User'}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-brandPrimary dark:text-brandSecondary">
                      {item.score || item.accumulatedPoints || 0} pts
                    </td>
                    <td className="py-4 px-6">{item.tasksCompleted || 0} Tasks</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold">
                        {idx < 3 ? 'Qualified' : 'Participant'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeekLeaderboardPage;
