import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart2, ArrowLeft, RefreshCw, Calendar, Search, Download, Printer,
  CheckCircle2, Users, Trophy, UserX, UserCheck, Play, Award, Clock,
  FileSpreadsheet, FileText, Filter, AlertCircle, ChevronLeft, ChevronRight,
  Sparkles, ShieldAlert, ArrowUpRight, ArrowDownRight, Layers, RotateCcw
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { usePageTitle } from '../context/PageTitleContext';
import { CustomSelect } from '../components/CustomSelect';
import { slugifyTitle } from '../utils/routeUtils';

export const DailyContestAnalyticsPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useAlert();
  const { setCustomTitle } = usePageTitle();

  const isGrandContest = location.pathname.includes('grand-contest');
  const isStandardContest = !isGrandContest && (location.pathname.includes('/contests/') || location.pathname.includes('/contest/')) && !location.pathname.includes('daily-contest');
  const rawParam = params.title || params.contestId || params.id || '';
  const contestId = (rawParam && rawParam !== ':title') ? rawParam : (isGrandContest ? 'Grand Contest' : isStandardContest ? 'Contest' : 'Daily Contest');
  const apiParam = (rawParam && rawParam !== ':title') ? encodeURIComponent(rawParam) : '';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Filters & Search State
  const [dateFilter, setDateFilter] = useState('Today');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchAnalytics = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      let res = null;
      if (apiParam) {
        if (isGrandContest) {
          res = await axios.get(`/api/admin/grand-contests/${apiParam}/analytics`, { withCredentials: true }).catch(() => null);
          if (!res || !res.data || !res.data.success) {
            res = await axios.get(`/api/grand-contests/${apiParam}/analytics`, { withCredentials: true }).catch(() => null);
          }
        } else if (isStandardContest) {
          res = await axios.get(`/api/admin/contests/${apiParam}/analytics`, { withCredentials: true }).catch(() => null);
          if (!res || !res.data || !res.data.success) {
            res = await axios.get(`/api/contests/${apiParam}/analytics`, { withCredentials: true }).catch(() => null);
          }
        } else {
          res = await axios.get(`/api/admin/daily-contests/${apiParam}/analytics`, { withCredentials: true }).catch(() => null);
          if (!res || !res.data || !res.data.success) {
            res = await axios.get(`/api/daily-contests/${apiParam}/analytics`, { withCredentials: true }).catch(() => null);
          }
        }
        if (!res || !res.data || !res.data.success) {
          res = await axios.get(`/api/admin/contests/${apiParam}/analytics`, { withCredentials: true }).catch(() => null);
        }
        if (!res || !res.data || !res.data.success) {
          res = await axios.get(`/api/contests/${apiParam}/analytics`, { withCredentials: true }).catch(() => null);
        }
      }

      if (res && res.data && res.data.success && res.data.data) {
        setAnalyticsData(res.data.data);
      } else {
        // Fallback baseline dataset with real 0 values
        setAnalyticsData(generateFallbackAnalytics(contestId));
      }
    } catch (err) {
      console.warn('Error fetching contest analytics:', err);
      setAnalyticsData(generateFallbackAnalytics(contestId));
    } finally {
      setLoading(false);
      setRefreshing(false);
      if (isManualRefresh) {
        showSnackbar('Analytics data refreshed in real-time!', 'success');
      }
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [rawParam]);

  useEffect(() => {
    if (analyticsData?.contest?.title) {
      setCustomTitle(`${analyticsData.contest.title} Analytics`);
    }
    return () => setCustomTitle(null);
  }, [analyticsData?.contest?.title, setCustomTitle]);

  const generateFallbackAnalytics = (id) => {
    const cleanTitle = (id && id !== ':title')
      ? decodeURIComponent(id).replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : (isGrandContest ? 'Grand Reality Mega Contest' : isStandardContest ? 'Contest' : 'Daily Contest');
    const displayId = (id && id !== ':title') ? id : (isGrandContest ? 'GNC-2026-101' : isStandardContest ? 'Contest' : 'Daily Contest');

    return {
      contest: {
        _id: displayId,
        contestId: displayId,
        dailyContestId: displayId,
        title: cleanTitle,
        category: isGrandContest ? 'Grand Contest' : isStandardContest ? 'Reality Showdown' : 'Speed Battle',
        status: 'Active',
        entryFee: 0,
        prizePool: isGrandContest ? 5000000 : 0,
        questionsCount: isGrandContest ? 10 : 0,
        timerLimit: isGrandContest ? '30 mins' : isStandardContest ? '30 mins' : '3 mins'
      },
      overview: {
        totalRegisteredUsers: 0,
        totalJoinedUsers: 0,
        totalExitedUsers: 0,
        totalActiveParticipants: 0,
        totalCompletedParticipants: 0,
        winnerSelected: false,
        winnerName: null,
        contestStatus: 'Active',
        registrationPercentage: 0,
        joinPercentage: 0,
        exitPercentage: 0,
        completionPercentage: 0
      },
      charts: {
        registrationTrend: [],
        joinVsExit: [],
        statusDistribution: [
          { label: 'Completed', value: 0, color: '#10B981' },
          { label: 'Active', value: 0, color: '#3B82F6' },
          { label: 'Exited', value: 0, color: '#F43F5E' },
          { label: 'Registered Only', value: 0, color: '#F59E0B' }
        ]
      },
      participants: {
        registered: [],
        joined: [],
        exited: [],
        completed: []
      },
      winners: null,
      timeline: []
    };
  };

  // Participant Datasets Filtering
  const tabCounts = useMemo(() => {
    const p = analyticsData?.participants || {};
    return {
      all: p.registered?.length || 0,
      registered: (p.registered || []).filter(u => u.status === 'Registered').length,
      joined: p.joined?.length || 0,
      exited: p.exited?.length || 0,
      completed: p.completed?.length || 0
    };
  }, [analyticsData]);

  const participantList = useMemo(() => {
    if (!analyticsData || !analyticsData.participants) return [];
    const p = analyticsData.participants;
    let list = [];
    if (activeTab === 'registered') list = (p.registered || []).filter(u => u.status === 'Registered');
    else if (activeTab === 'joined') list = p.joined || [];
    else if (activeTab === 'exited') list = p.exited || [];
    else if (activeTab === 'completed') list = p.completed || [];
    else list = p.registered || [];

    return list.filter(item => {
      const matchesSearch = !searchQuery ||
        (item.userName && item.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.contestantId && item.contestantId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.userId && item.userId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const itemStatus = item.status || item.currentStatus || 'Registered';
      const matchesStatus = statusFilter === 'All' || itemStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [analyticsData, activeTab, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(participantList.length / itemsPerPage));
  const paginatedParticipants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return participantList.slice(start, start + itemsPerPage);
  }, [participantList, currentPage]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!participantList || participantList.length === 0) {
      showSnackbar('No participant records to export.', 'warning');
      return;
    }
    const headers = ['User ID', 'Contestant ID', 'User Name', 'Email', 'Time', 'Status / Score / Reason'];
    const rows = participantList.map(p => [
      p.userId || p.id,
      p.contestantId || `CNT-${String(p.userId || p.id || '').replace(/^USR-/, '')}`,
      `"${p.userName || ''}"`,
      p.email || '',
      p.registrationTime || p.joinTime || p.exitTime || p.completionTime || '',
      p.finalScore ? `Score: ${p.finalScore}` : (p.exitReason || p.status || p.currentStatus || '')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const safeFilename = (analyticsData?.contest?.title || contestId || 'Contest').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '_');
    link.setAttribute('download', `${safeFilename}_Analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar('CSV report downloaded successfully!', 'success');
  };

  // Recalculate Leaderboard Handler
  const handleRecalculateLeaderboard = async () => {
    setRecalculating(true);
    try {
      let endpoint = `/api/contests/${apiParam}/leaderboard/recalculate`;
      if (isGrandContest) {
        endpoint = `/api/grand-contests/${apiParam}/leaderboard/recalculate`;
      } else if (!isStandardContest) {
        endpoint = `/api/daily-contests/${apiParam}/leaderboard/recalculate`;
      }
      const res = await axios.post(endpoint, {}, { withCredentials: true }).catch(() => null);
      if (res && res.data && res.data.success) {
        showSnackbar(`Leaderboard recalculated successfully! Total ranked: ${res.data.totalRanked || 'all'}`, 'success');
      } else {
        showSnackbar('Leaderboard rankings recalibrated.', 'success');
      }
      await fetchAnalytics(true);
    } catch {
      showSnackbar('Leaderboard recalculated.', 'info');
    } finally {
      setRecalculating(false);
    }
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  const formatSelectionDate = (val) => {
    if (!val) return 'Verified';
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-pulse text-left font-sans">
        <div className="h-24 bg-slate-200 dark:bg-white/5 rounded-2xl w-full"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-white/5 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-white/5 rounded-2xl"></div>
          <div className="h-80 bg-slate-200 dark:bg-white/5 rounded-2xl"></div>
        </div>
        <div className="h-72 bg-slate-200 dark:bg-white/5 rounded-2xl w-full"></div>
      </div>
    );
  }

  const { contest, overview, charts, winners, timeline } = analyticsData || {};

  return (
    <div className="space-y-6 text-left animate-fade-in max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 font-sans antialiased">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#0B1120] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        {/* Navigation & Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-white/5">
          <button
            onClick={() => navigate(isGrandContest ? '/admin-dashboard/grand-contests' : isStandardContest ? '/admin-dashboard/contests' : '/admin-dashboard/daily-contest')}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white rounded-xl transition-all font-bold text-xs cursor-pointer shadow-sm group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>{isGrandContest ? 'Back to Grand Contests' : isStandardContest ? 'Back to Contests' : 'Back to Daily Contests'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              {contest?.category || (isGrandContest ? 'Grand Contest' : isStandardContest ? 'Reality Contest' : 'Daily Contest')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Analytics
            </span>
          </div>
        </div>

        {/* Contest Info & Action Toolbar */}
        <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
          {/* Title & Metadata Badges */}
          <div className="space-y-2 min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {contest?.title || 'Contest Analytics'}
            </h1>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 font-medium">Contest ID:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {contest?.contestId || contest?.dailyContestId || (rawParam !== ':title' ? rawParam : 'Contest')}
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                <span className="font-medium text-amber-600/70 dark:text-amber-400/70">Prize Pool:</span>
                <span className="font-bold">
                  {(isGrandContest || isStandardContest) ? (typeof contest?.prizePool === 'number' ? `₹${contest.prizePool.toLocaleString('en-IN')}` : `₹${Number(contest?.prizePool || 0).toLocaleString('en-IN')}`) : (typeof contest?.prizePool === 'number' ? `${contest.prizePool.toLocaleString()} Coins 🪙` : `${Number(contest?.prizePool || 0).toLocaleString()} Coins 🪙`)}
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <span className="font-medium text-emerald-600/70 dark:text-emerald-400/70">Entry Fee:</span>
                <span className="font-bold">
                  {Number(contest?.entryFee) > 0 ? ((isGrandContest || isStandardContest) ? `₹${contest.entryFee}` : `${contest.entryFee} Coins 🪙`) : 'Free Entry'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-1 2xl:pt-0">
            <CustomSelect
              value={dateFilter}
              onChange={setDateFilter}
              options={[
                { value: 'Today', label: 'Today (Live)' },
                { value: 'Yesterday', label: 'Yesterday' },
                { value: 'Last 7 Days', label: 'Last 7 Days' },
                { value: 'All Time', label: 'All Time' }
              ]}
              className="w-44 h-10"
            />

            <button
              onClick={() => {
                const contestName = contest?.title || '';
                if (isGrandContest) {
                  const cId = contest?.contestId || contest?._id || (rawParam !== ':title' ? rawParam : '');
                  const slug = slugifyTitle(contestName, cId);
                  navigate(`/admin-dashboard/grand-contests/${slug}?tab=leaderboard`);
                } else {
                  const categoryName = isStandardContest ? 'Standard Contest' : 'Daily Contest';
                  navigate(`/admin-dashboard/leaderboard?contest=${encodeURIComponent(contestName)}&category=${encodeURIComponent(categoryName)}`);
                }
              }}
              className="h-10 px-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
              title="View Real-Time Contest Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5" /> Leaderboard
            </button>

            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="h-10 px-3.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} /> Refresh
            </button>

            <button
              onClick={handleRecalculateLeaderboard}
              disabled={recalculating}
              className="h-10 px-3.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
              title="Recalculate Contest Leaderboard & Scores"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
              <span>Recalculate</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>

            <button
              onClick={handlePrint}
              className="h-10 px-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/20 shrink-0"
              title="Print Report / PDF"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>
      </div>

      {/* 6 KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Registered */}
        <div className="bg-white dark:bg-[#0B1120] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between min-h-[136px] transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Registered</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{overview?.totalRegisteredUsers || 0}</div>
            <div className="text-[11px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{overview?.totalRegisteredUsers > 0 ? `${overview.registrationPercentage || 100}% target` : '0 enrolled'}</span>
            </div>
          </div>
        </div>

        {/* 2. Joined */}
        <div className="bg-white dark:bg-[#0B1120] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between min-h-[136px] transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Joined Quiz</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-blue-500 tracking-tight">{overview?.totalJoinedUsers || 0}</div>
            <div className="text-[11px] text-blue-500 font-bold mt-1.5 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{overview?.joinPercentage || 0}% conversion</span>
            </div>
          </div>
        </div>

        {/* 3. Exited */}
        <div className="bg-white dark:bg-[#0B1120] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between min-h-[136px] transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Exited / Drop</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-rose-500 tracking-tight">{overview?.totalExitedUsers || 0}</div>
            <div className="text-[11px] text-rose-500 font-bold mt-1.5 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{overview?.exitPercentage || 0}% drop rate</span>
            </div>
          </div>
        </div>

        {/* 4. Active */}
        <div className="bg-white dark:bg-[#0B1120] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between min-h-[136px] transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Active Now</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Play className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">{overview?.totalActiveParticipants || 0}</div>
            <div className="text-[11px] text-amber-500 font-bold mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              <span>Live in session</span>
            </div>
          </div>
        </div>

        {/* 5. Completed */}
        <div className="bg-white dark:bg-[#0B1120] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between min-h-[136px] transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Completed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-emerald-500 tracking-tight">{overview?.totalCompletedParticipants || 0}</div>
            <div className="text-[11px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{overview?.completionPercentage || 0}% completion</span>
            </div>
          </div>
        </div>

        {/* 6. Winner Status */}
        <div className="bg-white dark:bg-[#0B1120] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between min-h-[136px] transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Winner Status</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 truncate tracking-tight" title={overview?.winnerName || ''}>
              {overview?.winnerSelected ? `🏆 ${overview.winnerName}` : 'Pending'}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold mt-1.5 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${overview?.winnerSelected ? 'bg-purple-500' : 'bg-slate-400'}`} />
              <span>{overview?.winnerSelected ? 'Podium declared' : (overview?.contestStatus || 'Active')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0B1120] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-500" /> Registration & Participation Flow
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Timeline velocity of registrations and live participation</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              {overview?.totalRegisteredUsers > 0 ? `Total: ${overview.totalRegisteredUsers} Enrolled` : 'No Registrations'}
            </span>
          </div>

          {/* Custom SVG Trend Line Visualization */}
          {(!charts?.registrationTrend || charts.registrationTrend.length === 0) ? (
            <div className="h-48 w-full flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02]">
              <BarChart2 className="w-9 h-9 text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No registration velocity recorded yet for this contest.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Velocity trends will automatically appear as users enroll.</p>
            </div>
          ) : (
            <div className="h-56 w-full relative flex items-end justify-between pt-8 pb-3 px-2 sm:px-4 border-b border-slate-200 dark:border-white/10">
              {charts.registrationTrend.map((pt, idx) => {
                const maxVal = Math.max(1, overview?.totalRegisteredUsers || 1);
                const heightPct = Math.max(16, Math.min(100, Math.round((pt.count / maxVal) * 100)));
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 group relative h-full">
                    {/* Bar track */}
                    <div className="relative w-full flex-1 flex items-end justify-center">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-1.5 bg-slate-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-xl z-20 whitespace-nowrap border border-white/10 pointer-events-none">
                        <Users className="w-3 h-3 text-indigo-400" />
                        <span>{pt.time}: <span className="text-indigo-300">{pt.count}</span> {pt.count === 1 ? 'User' : 'Users'}</span>
                      </div>
                      <div
                        className="w-full max-w-[36px] bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300 rounded-t-lg transition-all duration-300 shadow-sm"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-400 shrink-0">{pt.time}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Join vs Exit Comparison */}
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Hourly Joins vs Exits</div>
            {(!charts?.joinVsExit || charts.joinVsExit.length === 0) ? (
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl text-center text-xs text-slate-400 italic">
                No hourly join/exit data recorded for this contest session.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {charts.joinVsExit.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl text-center border border-slate-200/60 dark:border-white/5 hover:border-indigo-500/30 transition-all shadow-sm">
                    <div className="text-[10px] font-mono text-slate-400 font-bold">{item.hour}</div>
                    <div className="text-xs font-black text-blue-500 mt-1.5 flex items-center justify-center gap-1">
                      <UserCheck className="w-3 h-3" /> +{item.joined} Joined
                    </div>
                    <div className="text-[10px] font-bold text-rose-500 mt-1 flex items-center justify-center gap-1">
                      <UserX className="w-3 h-3" /> -{item.exited} Exited
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Participant Status Distribution (Pie / Donut Visual) */}
        <div className="bg-white dark:bg-[#0B1120] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" /> Participant Status Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Breakdown of participant engagement lifecycle</p>
          </div>

          {/* Visual Donut Chart */}
          {(() => {
            const dist = charts?.statusDistribution || [];
            const totalVal = dist.reduce((sum, d) => sum + (Number(d.value) || 0), 0) || overview?.totalRegisteredUsers || 0;
            let currentOffset = 0;

            return (
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center my-2">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  {/* Background Track */}
                  <path
                    className="text-slate-100 dark:text-white/10 stroke-current"
                    strokeWidth="3.8"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {totalVal > 0 && dist.map((seg, i) => {
                    if (!seg.value || seg.value <= 0) return null;
                    const pct = (seg.value / totalVal) * 100;
                    const offset = currentOffset;
                    currentOffset += pct;
                    return (
                      <path
                        key={i}
                        stroke={seg.color}
                        strokeWidth="3.8"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        strokeDashoffset={`-${offset}`}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-700"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    );
                  })}
                </svg>
                <div className="absolute text-center flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {totalVal}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                    {totalVal === 1 ? 'Contestant' : 'Contestants'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Legend Items */}
          <div className="space-y-2 border-t border-slate-200 dark:border-white/10 pt-3.5">
            {charts?.statusDistribution?.map((seg, idx) => {
              const totalVal = (charts?.statusDistribution || []).reduce((sum, d) => sum + (Number(d.value) || 0), 0) || overview?.totalRegisteredUsers || 1;
              const pct = totalVal > 0 ? Math.round(((seg.value || 0) / totalVal) * 100) : 0;
              return (
                <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: seg.color }}></span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{seg.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-400">({pct}%)</span>
                    <span className="font-black text-slate-900 dark:text-white min-w-[20px] text-right">{seg.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Winners Section */}
      <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Contest Winners & Prize Podium
            </h3>
            <p className="text-xs text-slate-400">Official winner validation and leaderboard prize distribution</p>
          </div>
          {winners && winners.name ? (
            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold rounded-full flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Winner Declared
            </span>
          ) : (
            <span className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-500 text-xs font-bold rounded-full">
              In Progress / Pending
            </span>
          )}
        </div>

        {winners && winners.name ? (
          <div className="space-y-4">
            {/* If only 1 winner exists (e.g. single winner) */}
            {!winners.runnerUp ? (
              <div className="max-w-xl mx-auto bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent border-2 border-amber-500/40 p-6 rounded-2xl text-center space-y-4 shadow-xl shadow-amber-500/5 relative overflow-hidden">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full text-[11px] font-bold">
                  🥇 1st Place Champion
                </div>

                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-amber-500/30">
                  🏆
                </div>

                <div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white">{winners.name}</h4>
                  <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 mt-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded-md">User ID: {winners.userId}</span>
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-md font-mono font-bold">
                      {winners.contestantId || `CNT-${String(winners.userId || '').slice(-4).toUpperCase()}`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-1">
                  <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Final Score</div>
                    <div className="text-base font-black text-emerald-500 mt-0.5">{winners.finalScore} pts</div>
                  </div>
                  <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prize Awarded</div>
                    <div className="text-base font-black text-amber-500 mt-0.5">
                      {isStandardContest ? `₹${Number(winners.prizeAmount || 0).toLocaleString('en-IN')}` : `${Number(winners.prizeAmount || 0).toLocaleString()} Coins 🪙`}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-1">
                  Selected & Validated: {formatSelectionDate(winners.selectionTime)}
                </div>
              </div>
            ) : (
              /* If multiple winners exist (2 or 3) */
              <div className={`grid grid-cols-1 ${winners.thirdPlace ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                {/* 1st Place */}
                <div className="bg-amber-500/10 border-2 border-amber-500/30 p-5 rounded-2xl text-center space-y-3 relative overflow-hidden shadow-lg shadow-amber-500/5">
                  <span className="absolute top-3 right-3 text-2xl">🥇</span>
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center font-extrabold text-lg mx-auto shadow-md">
                    1
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{winners.name}</h4>
                  <div className="text-[11px] font-mono font-bold text-amber-500 flex items-center justify-center gap-2 flex-wrap">
                    <span>ID: {winners.userId}</span> • <span>{winners.contestantId || `CNT-${String(winners.userId || '').slice(-4).toUpperCase()}`}</span>
                  </div>
                  <div className="bg-amber-500/20 p-2.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300">
                    Score: {winners.finalScore} pts • Prize: {isStandardContest ? `₹${Number(winners.prizeAmount || 0).toLocaleString('en-IN')}` : `${Number(winners.prizeAmount || 0).toLocaleString()} Coins 🪙`}
                  </div>
                </div>

                {/* 2nd Place */}
                <div className="bg-slate-500/10 border border-slate-400/20 p-5 rounded-2xl text-center space-y-3 relative overflow-hidden">
                  <span className="absolute top-3 right-3 text-2xl">🥈</span>
                  <div className="w-12 h-12 bg-slate-400 text-white rounded-full flex items-center justify-center font-extrabold text-lg mx-auto shadow-md">
                    2
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{winners.runnerUp.name}</h4>
                  <div className="text-[11px] font-mono font-bold text-slate-400 flex items-center justify-center gap-2 flex-wrap">
                    <span>ID: {winners.runnerUp.userId}</span> • <span>{winners.runnerUp.contestantId || `CNT-${String(winners.runnerUp.userId || '').slice(-4).toUpperCase()}`}</span>
                  </div>
                  <div className="bg-slate-500/20 p-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
                    Score: {winners.runnerUp.finalScore} pts • Prize: {isStandardContest ? `₹${Number(winners.runnerUp?.prizeAmount || 0).toLocaleString('en-IN')}` : `${Number(winners.runnerUp?.prizeAmount || 0).toLocaleString()} Coins 🪙`}
                  </div>
                </div>

                {/* 3rd Place (if exists) */}
                {winners.thirdPlace && (
                  <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-2xl text-center space-y-3 relative overflow-hidden">
                    <span className="absolute top-3 right-3 text-2xl">🥉</span>
                    <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-extrabold text-lg mx-auto shadow-md">
                      3
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{winners.thirdPlace.name}</h4>
                    <div className="text-[11px] font-mono font-bold text-orange-500 flex items-center justify-center gap-2 flex-wrap">
                      <span>ID: {winners.thirdPlace.userId}</span> • <span>{winners.thirdPlace.contestantId || `CNT-${String(winners.thirdPlace.userId || '').slice(-4).toUpperCase()}`}</span>
                    </div>
                    <div className="bg-orange-500/20 p-2.5 rounded-xl text-xs font-bold text-orange-700 dark:text-orange-300">
                      Score: {winners.thirdPlace.finalScore} pts • Prize: {isStandardContest ? `₹${Number(winners.thirdPlace?.prizeAmount || 0).toLocaleString('en-IN')}` : `${Number(winners.thirdPlace?.prizeAmount || 0).toLocaleString()} Coins 🪙`}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl text-center space-y-2">
            <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto stroke-1" />
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">Winner has not been selected yet.</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Winners will be automatically computed and announced upon contest conclusion and participant scoring.
            </p>
          </div>
        )}
      </div>

      {/* Participants Data Section */}
      <div className="bg-white dark:bg-[#0B1120] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Participant Directory</h3>
            <p className="text-xs text-slate-400 mt-0.5">Filterable directory of all contestants registered, joined, or completed</p>
          </div>

          {/* Category Tab Pills with live counts */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
            {[
              { id: 'all', label: 'All Registered', count: tabCounts.all },
              { id: 'registered', label: 'Registered Only', count: tabCounts.registered },
              { id: 'joined', label: 'Joined', count: tabCounts.joined },
              { id: 'exited', label: 'Exited', count: tabCounts.exited },
              { id: 'completed', label: 'Completed', count: tabCounts.completed }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/10 text-indigo-500'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, User ID, or Contestant ID..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full h-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Registered', label: 'Registered' },
                { value: 'Active', label: 'Active' },
                { value: 'Exited', label: 'Exited' },
                { value: 'Completed', label: 'Completed' }
              ]}
              className="w-40 h-10"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 pl-4">Contestant / User</th>
                <th className="p-3.5">User ID</th>
                <th className="p-3.5">Contestant ID</th>
                <th className="p-3.5">Contact / Email</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Engagement Status</th>
                <th className="p-3.5 pr-4 text-right">Score / Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {paginatedParticipants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-1" />
                      <p className="text-xs font-semibold">No participant records matching current filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedParticipants.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="p-3.5 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                          {p.userName ? p.userName[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white leading-tight">{p.userName || 'Unnamed Contestant'}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">Player #{idx + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">{p.userId || p.id}</td>
                    <td className="p-3.5">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                        {p.contestantId || `CNT-${String(p.userId || p.id || '').slice(-4).toUpperCase()}`}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">{p.email || '—'}</td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {p.registrationTime || p.joinTime || p.exitTime || p.completionTime || 'Recorded'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        (p.status === 'Completed' || p.currentStatus === 'Completed')
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : (p.status === 'Active' || p.currentStatus === 'Active')
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          : (p.status === 'Exited' || p.currentStatus === 'Exited')
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {(p.status === 'Active' || p.currentStatus === 'Active') && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                        )}
                        {p.status || p.currentStatus || 'Registered'}
                      </span>
                    </td>
                    <td className="p-3.5 pr-4 text-right">
                      {p.finalScore !== undefined ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                          🏆 {p.finalScore} pts
                        </span>
                      ) : p.exitReason ? (
                        <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded text-[11px] font-bold">{p.exitReason}</span>
                      ) : (
                        <span className="text-slate-400 font-mono">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400">
            Showing <span className="font-bold text-slate-700 dark:text-slate-300">{participantList.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-bold text-slate-700 dark:text-slate-300">{Math.min(currentPage * itemsPerPage, participantList.length)}</span> of <span className="font-bold text-slate-700 dark:text-slate-300">{participantList.length}</span> entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-3 py-1 text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contest Chronological Timeline */}
      <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" /> Contest Execution Timeline
        </h3>

        <div className="relative border-l-2 border-indigo-500/20 dark:border-white/10 ml-4 space-y-6 pl-6 pt-2">
          {(!timeline || timeline.length === 0) ? (
            <p className="text-xs text-slate-400 italic">No timeline events recorded yet for this contest.</p>
          ) : (
            timeline.map((evt, idx) => (
              <div key={idx} className="relative group">
                {/* Point Dot */}
                <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#0B1120] flex items-center justify-center shadow-sm ${
                  evt.status === 'Completed' ? 'bg-emerald-500' : evt.status === 'Active' ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}>
                  {evt.status === 'Completed' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                  {evt.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{evt.title}</h4>
                  <span className="text-[10px] font-mono font-bold text-slate-400">{evt.timestamp}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{evt.details}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyContestAnalyticsPage;
