import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Trophy, RefreshCw, Search, Crown
} from 'lucide-react';
import axios from 'axios';
import { setLeaderboard, setLeaderboardScope, setLoading } from '../../store/roomCycleSlice';
import { useAlert } from '../../context/AlertContext';

export const RoomCycleLeaderboardPage = () => {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { leaderboard, leaderboardScope, loading } = useSelector((state) => state.roomCycle);
  const [search, setSearch] = useState('');
  const [recalculating, setRecalculating] = useState(false);

  const fetchLeaderboard = async (scope) => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get('/api/admin/room-cycle/leaderboard', {
        params: { scope }
      });
      if (res.data?.success) {
        dispatch(setLeaderboard(res.data.data));
      } else {
        dispatch(setLeaderboard([]));
      }
    } catch (err) {
      console.error(err);
      dispatch(setLeaderboard([]));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchLeaderboard(leaderboardScope);
  }, [leaderboardScope]);

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      await axios.post('/api/admin/room-cycle/leaderboard/recalculate');
      showAlert('success', 'Leaderboard scores recalculated!');
      fetchLeaderboard(leaderboardScope);
    } catch (err) {
      showAlert('error', 'Recalculation failed');
    } finally {
      setRecalculating(false);
    }
  };

  const filteredData = leaderboard.filter((item) =>
    item.entityName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> Room Cycle Leaderboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time rankings for Room, Cycle, and Overall competition scores.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live Socket Sync
          </span>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} /> Recalculate Rankings
          </button>
        </div>
      </div>

      {/* Scope Selection Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
        {['Room', 'Cycle', 'Overall'].map((sc) => (
          <button
            key={sc}
            onClick={() => dispatch(setLeaderboardScope(sc))}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              leaderboardScope === sc
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            {sc} Leaderboard
          </button>
        ))}
      </div>

      {/* Podium Showcase (Top 3) */}
      {filteredData.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Rank 2 - Silver */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm order-2 md:order-1">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-lg mb-2">
              #2
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{filteredData[1]?.entityName}</h3>
            <p className="text-xs text-slate-500">Silver Medalist</p>
            <span className="inline-block mt-3 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-sm rounded-full">
              {(filteredData[1]?.totalPoints || 0).toLocaleString()} pts
            </span>
          </div>

          {/* Rank 1 - Gold */}
          <div className="bg-gradient-to-b from-amber-500/10 via-white to-white dark:from-amber-500/20 dark:via-slate-900 dark:to-slate-900 border-2 border-amber-500 rounded-2xl p-6 text-center shadow-lg order-1 md:order-2 scale-105">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center font-extrabold text-xl mb-2 shadow-md">
              <Crown className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{filteredData[0]?.entityName}</h3>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">🏆 Champion #1</p>
            <span className="inline-block mt-3 px-4 py-1.5 bg-amber-500 text-white font-black text-base rounded-full shadow-md">
              {(filteredData[0]?.totalPoints || 0).toLocaleString()} pts
            </span>
          </div>

          {/* Rank 3 - Bronze */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm order-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-extrabold text-lg mb-2">
              #3
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{filteredData[2]?.entityName}</h3>
            <p className="text-xs text-slate-500">Bronze Medalist</p>
            <span className="inline-block mt-3 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-sm rounded-full">
              {(filteredData[2]?.totalPoints || 0).toLocaleString()} pts
            </span>
          </div>
        </div>
      )}

      {/* Datatable */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${leaderboardScope} leaderboard...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading leaderboard...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Trophy className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No leaderboard entries found</p>
            <p className="text-xs mt-1">Scores will accumulate as members complete cycle tasks.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 w-16">Rank</th>
                  <th className="p-4">{leaderboardScope === 'Room' ? 'Room Name' : 'Member Name'}</th>
                  <th className="p-4">Task Points</th>
                  <th className="p-4">Bonus Points</th>
                  <th className="p-4">Penalty</th>
                  <th className="p-4">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredData.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-black text-slate-900 dark:text-white">#{row.rank}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{row.entityName}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">+{row.taskPoints || 0}</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400">+{row.bonusPoints || 0}</td>
                    <td className="p-4 text-red-500">-{row.penaltyPoints || 0}</td>
                    <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {(row.totalPoints || 0).toLocaleString()} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCycleLeaderboardPage;
