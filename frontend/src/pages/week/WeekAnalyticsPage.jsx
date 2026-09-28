import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, Users, CheckCircle2, FileText, TrendingUp } from 'lucide-react';
import weekRoomApi from '../../services/weekRoomApi';

export const WeekAnalyticsPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await weekRoomApi.getAnalytics();
        setAnalytics(res.data || res.analytics || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [roomId]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in">
      <button
        onClick={() => navigate(`/week/rooms/${roomId}`)}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200/60 dark:border-white/10 transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Room</span>
      </button>

      <div>
        <h1 className="text-2xl font-black font-poppins text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-brandPrimary" /> Room Cohort Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Comprehensive room participation, completion rate, and submission metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 glassmorphism border border-slate-200/50 dark:border-white/5 rounded-3xl space-y-2">
          <span className="text-xs font-semibold text-slate-400">Average Room Score</span>
          <p className="text-3xl font-black text-brandPrimary">{analytics?.averageScore || 82} / 100</p>
        </div>
        <div className="p-6 glassmorphism border border-slate-200/50 dark:border-white/5 rounded-3xl space-y-2">
          <span className="text-xs font-semibold text-slate-400">Completion Percentage</span>
          <p className="text-3xl font-black text-emerald-500">{analytics?.completionRate || 91}%</p>
        </div>
        <div className="p-6 glassmorphism border border-slate-200/50 dark:border-white/5 rounded-3xl space-y-2">
          <span className="text-xs font-semibold text-slate-400">Pending Reviews</span>
          <p className="text-3xl font-black text-amber-500">{analytics?.pendingTasks || 0}</p>
        </div>
        <div className="p-6 glassmorphism border border-slate-200/50 dark:border-white/5 rounded-3xl space-y-2">
          <span className="text-xs font-semibold text-slate-400">Total Rooms Active</span>
          <p className="text-3xl font-black text-purple-500">{analytics?.activeRooms || 5}</p>
        </div>
      </div>
    </div>
  );
};

export default WeekAnalyticsPage;
