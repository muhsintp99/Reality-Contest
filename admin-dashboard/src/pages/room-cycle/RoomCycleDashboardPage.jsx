import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Layers, Users, Trophy, CheckSquare, Clock, TrendingUp, Award, RefreshCw,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import { setAnalytics, setLoading } from '../../store/roomCycleSlice';
import { useAlert } from '../../context/AlertContext';

export const RoomCycleDashboardPage = () => {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { analytics, loading } = useSelector((state) => state.roomCycle);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get('/api/admin/room-cycle/analytics');
      if (res.data?.success) {
        dispatch(setAnalytics(res.data.data));
      } else {
        dispatch(
          setAnalytics({
            totalRooms: 0,
            activeRooms: 0,
            completedCycles: 0,
            activeCycleNumber: 1,
            pendingTasks: 0,
            averageScore: 0,
            completionRate: 0,
            topRooms: [],
            topUsers: []
          })
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(
        setAnalytics({
          totalRooms: 0,
          activeRooms: 0,
          completedCycles: 0,
          activeCycleNumber: 1,
          pendingTasks: 0,
          averageScore: 0,
          completionRate: 0,
          topRooms: [],
          topUsers: []
        })
      );
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const data = analytics || {
    totalRooms: 0,
    activeRooms: 0,
    completedCycles: 0,
    activeCycleNumber: 1,
    pendingTasks: 0,
    averageScore: 0,
    completionRate: 0,
    topRooms: [],
    topUsers: []
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
              30-Day Blueprint Competition
            </span>
            <span className="px-3 py-1 bg-emerald-400/30 backdrop-blur-md rounded-full text-xs font-semibold">
              Cycle {data.activeCycleNumber} Active
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Bi-Weekly Room Cycle Dashboard</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Real-time analytics, room performance, cycle progression, and member task leaderboards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-medium text-sm transition-all border border-white/20 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Rooms</span>
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{data.totalRooms}</span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              {data.activeRooms} Active
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Cycle</span>
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">Cycle {data.activeCycleNumber}</span>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
              3-Day Duration
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Tasks</span>
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{data.pendingTasks}</span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
              Needs Review
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Completion Rate</span>
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{data.completionRate}%</span>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
              Avg Score {data.averageScore} pts
            </span>
          </div>
        </div>
      </div>

      {/* Top Rooms & Top Users Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rooms */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Top Performing Rooms
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ranked by total accumulated room points</p>
            </div>
          </div>
          {(data.topRooms || []).length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              <p className="text-xs">No active rooms to display yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data.topRooms || []).map((room, idx) => (
                <div key={room._id || idx} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                      idx === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                      idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{room.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{room.code} • {room.membersCount || 0} Members</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {(room.totalPoints || 0).toLocaleString()} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Individual Members */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-500" />
                Top Cycle Performers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Leading contestants across current active cycle</p>
            </div>
          </div>
          {(data.topUsers || []).length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              <p className="text-xs">No cycle member rankings recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data.topUsers || []).map((user, idx) => (
                <div key={user._id || idx} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                      {user.entityName ? user.entityName.slice(0, 2) : 'US'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{user.entityName || 'Member'}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Rank #{user.rank || idx + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                      {(user.totalPoints || 0).toLocaleString()} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCycleDashboardPage;
