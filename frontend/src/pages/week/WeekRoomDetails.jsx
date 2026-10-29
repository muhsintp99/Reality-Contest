import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Trophy, Users, Calendar, ArrowLeft, Layers, CheckCircle2, 
  Clock, ShieldAlert, Award, BarChart2, RefreshCw, FileText, 
  ChevronRight, Lock, Play, Star, AlertCircle, Check, Send
} from 'lucide-react';
import weekRoomApi from '../../services/weekRoomApi';

export const WeekRoomDetails = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const currentUserId = user?._id || user?.id || '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');

  // Sub-data states
  const [leaderboard, setLeaderboard] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [recalculating, setRecalculating] = useState(false);
  const [reviewModalSubmission, setReviewModalSubmission] = useState(null);
  const [reviewScore, setReviewScore] = useState('');
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchRoomDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await weekRoomApi.getWeekRoomDetails(roomId);
      if (res && res.data) {
        setData(res.data);
      } else {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching room details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await weekRoomApi.getLeaderboard(roomId, null, 'Room');
      const lbData = res.data || res.leaderboard || (Array.isArray(res) ? res : []);
      setLeaderboard(Array.isArray(lbData) ? lbData : []);
    } catch (err) {
      console.error('Leaderboard error:', err);
    }
  };

  const fetchRewards = async () => {
    try {
      const res = await weekRoomApi.getRewards();
      setRewards(res.data || res.rewards || []);
    } catch (err) {
      console.error('Rewards error:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await weekRoomApi.getAnalytics();
      setAnalytics(res.data || res.analytics || null);
    } catch (err) {
      console.error('Analytics error:', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await weekRoomApi.getSubmissions({ roomId });
      const subList = res.data?.submissions || res.data || [];
      setSubmissions(Array.isArray(subList) ? subList : []);
    } catch (err) {
      console.error('Submissions error:', err);
    }
  };

  const fetchMySubmissions = async () => {
    try {
      const res = await weekRoomApi.getMySubmissions(roomId);
      const list = res.data?.submissions || res.data || [];
      setMySubmissions(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('My submissions fetch fallback:', err);
    }
  };

  useEffect(() => {
    fetchRoomDetails();
    fetchMySubmissions();
  }, [roomId]);

  useEffect(() => {
    if (activeTab === 'leaderboard') fetchLeaderboard();
    if (activeTab === 'rewards') fetchRewards();
    if (activeTab === 'analytics') fetchAnalytics();
    if (activeTab === 'submissions') fetchSubmissions();
  }, [activeTab, roomId]);

  const handleRecalculateLeaderboard = async () => {
    setRecalculating(true);
    try {
      const activeCycle = data?.cycles?.find((c) => c.status === 'Active') || data?.cycles?.[0];
      await weekRoomApi.recalculateLeaderboard(activeCycle?._id || activeCycle?.id);
      await fetchLeaderboard();
      await fetchRoomDetails();
    } catch (err) {
      console.error('Recalculate error:', err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModalSubmission) return;
    setSubmittingReview(true);
    try {
      await weekRoomApi.reviewSubmission(reviewModalSubmission._id || reviewModalSubmission.id, {
        score: Number(reviewScore) || 0,
        status: reviewStatus,
        feedback: reviewNotes
      });
      setReviewModalSubmission(null);
      fetchSubmissions();
      fetchRoomDetails();
    } catch (err) {
      console.error('Review submit error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-white/10 w-48 rounded-xl" />
        <div className="h-64 bg-slate-200 dark:bg-white/10 rounded-3xl w-full" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-white/10 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-4">
        <div className="inline-flex p-4 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Room Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-white/60">{error || 'Room details unavailable'}</p>
        <button
          onClick={() => navigate('/week/rooms')}
          className="px-5 py-2.5 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow-lg"
        >
          Back to Week Rooms
        </button>
      </div>
    );
  }

  const room = data.room || data;
  const tasks = data.tasks || (Array.isArray(room.taskIds) ? room.taskIds : []);
  const members = data.members || [];
  const stats = data.analytics || {};

  const memberCount = room.membersCount || members.length;
  const maxCapacity = room.maxMembers || 50;
  const capacityPercentage = Math.min(100, Math.round((memberCount / maxCapacity) * 100));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate('/week/rooms')}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200/60 dark:border-white/10 transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Week Rooms</span>
      </button>

      {/* Room Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brandPrimary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 bg-brandPrimary/20 border border-brandPrimary/40 text-brandPrimary text-xs font-extrabold rounded-full tracking-wider uppercase">
                {room.code || 'RM-ROOM'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                room.status === 'Active' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}>
                ● {room.status || 'Active'}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black font-poppins tracking-tight text-white">
              {room.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
              {room.description || 'Welcome to this bi-weekly room cohort. Complete milestone cycles and rank on the room leaderboard.'}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="p-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl text-right">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Room Capacity</span>
              <span className="text-2xl font-black text-white">{memberCount} / {maxCapacity}</span>
              <div className="w-32 h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-brandPrimary rounded-full" style={{ width: `${capacityPercentage}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Quick Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glassmorphism p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-brandPrimary" /> Members
          </span>
          <p className="text-xl font-black text-slate-800 dark:text-white">{memberCount}</p>
        </div>

        <div className="glassmorphism p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-500" /> Total Tasks
          </span>
          <p className="text-xl font-black text-slate-800 dark:text-white">{tasks.length}</p>
        </div>

        <div className="glassmorphism p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Completion Rate
          </span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.completionRate !== undefined ? `${stats.completionRate}%` : '85%'}
          </p>
        </div>

        <div className="glassmorphism p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-purple-500" /> Submissions
          </span>
          <p className="text-xl font-black text-slate-800 dark:text-white">
            {stats.totalSubmissions !== undefined ? stats.totalSubmissions : 0}
          </p>
        </div>

        <div className="glassmorphism p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending Review
          </span>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400">
            {stats.pendingSubmissions !== undefined ? stats.pendingSubmissions : 0}
          </p>
        </div>

        <div className="glassmorphism p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-rose-500" /> Active Tasks
          </span>
          <p className="text-xl font-black text-slate-800 dark:text-white">
            {stats.activeTasksCount !== undefined ? stats.activeTasksCount : tasks.length}
          </p>
        </div>
      </div>

      {/* Room Tabs Header */}
      <div className="flex border-b border-slate-200 dark:border-white/10 overflow-x-auto no-scrollbar gap-2">
        {[
          { id: 'tasks', label: 'Tasks & Challenges 🎯', icon: Layers },
          { id: 'leaderboard', label: 'Leaderboard 🏆', icon: Trophy },
          { id: 'rewards', label: 'Rewards 🎁', icon: Award },
          { id: 'analytics', label: 'Analytics 📊', icon: BarChart2 },
          { id: 'submissions', label: 'Submissions Review 📝', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-brandPrimary text-brandPrimary dark:text-brandSecondary bg-brandPrimary/5 rounded-t-2xl'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TASKS & CHALLENGES */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white font-poppins">
              Room Challenges & Tasks ({tasks.length})
            </h3>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200/50 dark:border-white/5">
              <p className="text-xs font-semibold text-slate-500">No tasks assigned to this room yet.</p>
            </div>
          ) : (
            (() => {
              const submittedTaskIds = new Set(
                (mySubmissions || []).map(s => (s.taskId?._id || s.taskId || '').toString()).filter(Boolean)
              );
              if (currentUserId && data?.analytics?.recentSubmissions) {
                data.analytics.recentSubmissions.forEach(s => {
                  const subUid = (s.userId?._id || s.userId || '').toString();
                  if (subUid === currentUserId.toString()) {
                    const tid = (s.taskId?._id || s.taskId || '').toString();
                    if (tid) submittedTaskIds.add(tid);
                  }
                });
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map((task, index) => {
                    const taskId = task._id || task.id || index;
                    const taskIdStr = (task._id || task.id || '').toString();
                    const taskNum = task.order !== undefined ? task.order + 1 : index + 1;
                    const isSubmitted = taskIdStr ? submittedTaskIds.has(taskIdStr) : false;
                    const status = isSubmitted ? 'Completed' : (task.status || 'Active');

                    return (
                      <div
                        key={taskId}
                        className={`bg-white dark:bg-slate-900/80 border ${isSubmitted ? 'border-emerald-500/30 ring-1 ring-emerald-500/20' : 'border-slate-200/80 dark:border-white/10'} rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] rounded-full uppercase">
                              Task #{taskNum} • {task.taskType || 'Challenge'}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isSubmitted || status === 'Completed' 
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                : status === 'Active' || status === 'Published'
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}>
                              {isSubmitted ? '✓ Completed' : (status === 'Active' || status === 'Published' ? '● Active' : status)}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 dark:text-white font-poppins">
                            {task.title || `Task Challenge ${taskNum}`}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-medium">
                            {task.description || task.instructions || 'Complete this task challenge to earn points and climb the room leaderboard.'}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                            <span>Reward Points</span>
                            <span className="text-emerald-500 dark:text-emerald-400 font-black">+{task.points || 50} Pts 🪙</span>
                          </div>

                          {isSubmitted ? (
                            <button
                              onClick={() => navigate(`/week/rooms/${roomId}/tasks/${taskId}/contest/${taskId}/result`)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-2xl hover:bg-emerald-500/25 transition-all cursor-pointer shadow-sm"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>Completed • View Result</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/week/rooms/${roomId}/tasks/${taskId}`)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brandPrimary text-white text-xs font-bold rounded-2xl shadow-md hover:bg-brandPrimary/90 transition-all cursor-pointer"
                            >
                              <span>Open Task & Submit</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* TAB 2: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white font-poppins">
                Room Standings Leaderboard
              </h3>
              <p className="text-xs text-slate-400">Rankings updated automatically from task submission scores.</p>
            </div>

            <button
              onClick={handleRecalculateLeaderboard}
              disabled={recalculating}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-amber-600 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
              <span>{recalculating ? 'Recalculating...' : 'Recalculate Scores'}</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                    <th className="py-3.5 px-6">Rank</th>
                    <th className="py-3.5 px-6">Contestant</th>
                    <th className="py-3.5 px-6">Score / Points</th>
                    <th className="py-3.5 px-6">Tasks Completed</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-medium text-slate-700 dark:text-slate-200">
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No leaderboard data available for this room yet.
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6 font-black text-sm">
                          {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="w-7 h-7 bg-brandPrimary/20 rounded-full flex items-center justify-center text-brandPrimary text-xs font-black">
                            {(item.userName || item.userId?.name || 'U')[0]}
                          </div>
                          <span>{item.userName || item.userId?.name || 'Contestant User'}</span>
                        </td>
                        <td className="py-4 px-6 font-extrabold text-brandPrimary dark:text-brandSecondary">
                          {item.score || item.accumulatedPoints || 0} pts
                        </td>
                        <td className="py-4 px-6">{item.tasksCompleted || 0} Tasks</td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold">
                            Active Participant
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
      )}

      {/* TAB 3: REWARDS */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white font-poppins">
            Room Tier Rewards & Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl space-y-3">
              <Trophy className="w-8 h-8 text-amber-500" />
              <h4 className="text-base font-bold text-amber-600 dark:text-amber-400">1st Place Reward</h4>
              <p className="text-2xl font-black text-slate-800 dark:text-white">₹5,000 + Gold Badge</p>
              <p className="text-xs text-slate-400 font-medium">Awarded to the top scorer at cycle conclusion.</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-slate-400/10 via-slate-400/5 to-transparent border border-slate-400/20 rounded-3xl space-y-3">
              <Award className="w-8 h-8 text-slate-400" />
              <h4 className="text-base font-bold text-slate-600 dark:text-slate-300">2nd Place Reward</h4>
              <p className="text-2xl font-black text-slate-800 dark:text-white">₹2,500 + Silver Badge</p>
              <p className="text-xs text-slate-400 font-medium">Awarded to runner-up contestant.</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 rounded-3xl space-y-3">
              <Star className="w-8 h-8 text-orange-500" />
              <h4 className="text-base font-bold text-orange-600 dark:text-orange-400">3rd Place Reward</h4>
              <p className="text-2xl font-black text-slate-800 dark:text-white">₹1,000 + Bronze Badge</p>
              <p className="text-xs text-slate-400 font-medium">Awarded to 3rd place finisher.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white font-poppins">
            Room Performance Analytics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 glassmorphism border border-slate-200/50 dark:border-white/5 rounded-3xl space-y-2">
              <span className="text-xs font-semibold text-slate-400">Average Room Score</span>
              <p className="text-3xl font-black text-brandPrimary">{analytics?.averageScore || 82} / 100</p>
            </div>
            <div className="p-6 glassmorphism border border-slate-200/50 dark:border-white/5 rounded-3xl space-y-2">
              <span className="text-xs font-semibold text-slate-400">Submissions Completion Rate</span>
              <p className="text-3xl font-black text-emerald-500">{analytics?.completionRate || 91}%</p>
            </div>
            <div className="p-6 glassmorphism border border-slate-200/50 dark:border-white/5 rounded-3xl space-y-2">
              <span className="text-xs font-semibold text-slate-400">Pending Reviews</span>
              <p className="text-3xl font-black text-amber-500">{analytics?.pendingTasks || 0}</p>
            </div>
            <div className="p-6 glassmorphism border border-slate-200/50 dark:border-white/5 rounded-3xl space-y-2">
              <span className="text-xs font-semibold text-slate-400">Completed Cycles</span>
              <p className="text-3xl font-black text-purple-500">{analytics?.completedCycles || 2}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUBMISSIONS REVIEW */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white font-poppins">
            Contestant Proof Submissions
          </h3>

          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                    <th className="py-3.5 px-6">Contestant</th>
                    <th className="py-3.5 px-6">Task</th>
                    <th className="py-3.5 px-6">Type</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Score</th>
                    <th className="py-3.5 px-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-medium text-slate-700 dark:text-slate-200">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No submissions recorded for this room yet.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => (
                      <tr key={sub._id || sub.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                        <td className="py-4 px-6 font-bold">{sub.userId?.name || 'Contestant'}</td>
                        <td className="py-4 px-6">{sub.taskId?.title || 'Cycle Task'}</td>
                        <td className="py-4 px-6 uppercase font-bold text-[10px] text-indigo-500">{sub.submissionType || 'Proof'}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                            sub.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {sub.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-black">{sub.finalPoints || sub.score || 0}</td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => {
                              setReviewModalSubmission(sub);
                              setReviewScore(sub.finalPoints || sub.score || '');
                              setReviewStatus(sub.status || 'Approved');
                            }}
                            className="px-3 py-1 bg-brandPrimary text-white text-[11px] font-bold rounded-lg hover:bg-brandPrimary/90"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Admin Review Modal */}
      {reviewModalSubmission && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Review Task Submission</h3>
            
            {reviewModalSubmission.mediaUrl && (
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Uploaded Proof:</span>
                <a 
                  href={reviewModalSubmission.mediaUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs font-bold text-brandPrimary hover:underline truncate block"
                >
                  {reviewModalSubmission.mediaUrl}
                </a>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Score (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={reviewScore}
                  onChange={(e) => setReviewScore(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Status</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                >
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Pending">Under Review</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Feedback / Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter feedback for contestant..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-slate-800 dark:text-white h-20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalSubmission(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekRoomDetails;
