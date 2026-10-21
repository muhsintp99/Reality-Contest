import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Trophy, Plus, Search, Filter, RefreshCw, Eye, Edit3, Trash2, Copy, Layers,
  FileText, AlertCircle, CheckSquare, FileCheck, Award, X, Activity, UserCheck,
  Check, Calendar, Clock, Shield, Coins, Sparkles, ExternalLink, ChevronRight,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { usePageTitle } from '../context/PageTitleContext';
import { slugifyTitle, matchesRouteParam } from '../utils/routeUtils';

export const GrandContestManagementPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const { showSnackbar, showConfirm } = useAlert();
  const { setCustomTitle } = usePageTitle();

  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Dedicated Single Page View & Tabs State
  const [selectedContestDetail, setSelectedContestDetail] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState(tabParam || 'tasks'); // 'tasks' | 'submissions' | 'overview' | 'status'
  const [contestTasks, setContestTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [contestSubmissions, setContestSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Status & Eligibility Diagnostics State
  const [statusCheckUserId, setStatusCheckUserId] = useState('');
  const [statusCheckResult, setStatusCheckResult] = useState(null);
  const [statusCheckLoading, setStatusCheckLoading] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);

  // Quick Task Add State
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    instructions: '',
    taskType: 'Quiz',
    submissionType: 'Text',
    points: 100,
    reviewType: 'Manual',
    status: 'Published'
  });

  // Review Submission Modal State
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [reviewScore, setReviewScore] = useState(100);
  const [reviewBonus, setReviewBonus] = useState(0);
  const [reviewPenalty, setReviewPenalty] = useState(0);
  const [reviewFeedback, setReviewFeedback] = useState('');

  // Keyboard accessibility: ESC key closes open submission review
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && reviewingSubmission) {
        setReviewingSubmission(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reviewingSubmission]);

  const fetchGrandContests = async () => {
    setLoading(true);
    try {
      let res = await axios.get('/api/admin/grand-contests', { withCredentials: true }).catch(() => null);
      if (!res?.data?.success) {
        res = await axios.get('/api/grand-contests', { withCredentials: true }).catch(() => null);
      }

      if (res?.data?.success) {
        const raw = res.data.data;
        const list = Array.isArray(raw?.contests) ? raw.contests : Array.isArray(raw) ? raw : [];
        setContests(list);
      } else {
        setContests([]);
      }
    } catch (err) {
      console.error('Error fetching grand contests:', err);
      showSnackbar('Failed to fetch Grand Contests', 'error');
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  const [availableTasks, setAvailableTasks] = useState([]);

  const fetchAvailableTasks = async () => {
    try {
      let list = [];
      let res = await axios.get('/api/admin/tasks', { withCredentials: true }).catch(() => null);
      if (!res?.data?.success) {
        res = await axios.get('/api/tasks', { withCredentials: true }).catch(() => null);
      }
      if (res?.data?.success) {
        const raw = res.data.data;
        list = Array.isArray(raw?.tasks) ? raw.tasks : Array.isArray(raw) ? raw : [];
      }
      if (list.length > 0) {
        setAvailableTasks(list);
      }
    } catch (err) {
      console.error('Error loading available tasks:', err);
    }
  };

  useEffect(() => {
    fetchGrandContests();
    fetchAvailableTasks();
  }, []);

  const fetchContestTasks = async (contestId) => {
    setTasksLoading(true);
    try {
      let res = await axios.get(`/api/admin/grand-contests/${contestId}/tasks`, { withCredentials: true }).catch(() => null);
      if (!res?.data?.success) {
        res = await axios.get(`/api/grand-contests/${contestId}/tasks`, { withCredentials: true }).catch(() => null);
      }
      if (res?.data?.success) {
        setContestTasks(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading contest tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchContestSubmissions = async (contestId) => {
    setSubmissionsLoading(true);
    try {
      let res = await axios.get(`/api/admin/grand-contests/${contestId}/submissions`, { withCredentials: true }).catch(() => null);
      if (!res?.data?.success) {
        res = await axios.get(`/api/grand-contests/${contestId}/submissions`, { withCredentials: true }).catch(() => null);
      }
      if (res?.data?.success) {
        setContestSubmissions(res.data.data?.submissions || []);
      }
    } catch (err) {
      console.error('Error loading contest submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const fetchSingleContest = async (targetId) => {
    try {
      let res = await axios.get(`/api/admin/grand-contests/${targetId}`, { withCredentials: true }).catch(() => null);
      if (!res?.data?.success) {
        res = await axios.get(`/api/grand-contests/${targetId}`, { withCredentials: true }).catch(() => null);
      }
      if (res?.data?.success) {
        const found = res.data.data;
        setSelectedContestDetail(found);
        setCustomTitle(found.title);
        const t = tabParam || 'tasks';
        setActiveModalTab(t);
        fetchContestTasks(found._id || found.contestId || targetId);
        fetchContestSubmissions(found._id || found.contestId || targetId);
        if (t === 'status') {
          handleCheckStatus(found._id || found.contestId || targetId, '');
        }
      }
    } catch (err) {
      console.error('Error fetching single grand contest:', err);
    }
  };

  // Sync route param :id with selected contest detail (matches Title slug, contestId, or _id)
  useEffect(() => {
    if (id) {
      const found = contests.find((c) => matchesRouteParam(c, id));
      if (found) {
        setSelectedContestDetail(found);
        setCustomTitle(found.title);
        const t = tabParam || 'tasks';
        setActiveModalTab(t);
        fetchContestTasks(found._id || found.contestId);
        fetchContestSubmissions(found._id || found.contestId);
        if (t === 'status') {
          handleCheckStatus(found._id || found.contestId, '');
        }
      } else if (!loading) {
        fetchSingleContest(id);
      }
    } else {
      setSelectedContestDetail(null);
      setCustomTitle('');
    }
  }, [id, contests, loading, tabParam]);

  const handleOpenContestView = (contest, targetTab = 'tasks') => {
    const slug = slugifyTitle(contest.title, contest.contestId || contest._id);
    setSelectedContestDetail(contest);
    setCustomTitle(contest.title);
    setActiveModalTab(targetTab);
    const cId = contest._id || contest.contestId;
    fetchContestTasks(cId);
    fetchContestSubmissions(cId);
    if (targetTab === 'status') {
      handleCheckStatus(cId, '');
    }
    navigate(`/admin-dashboard/grand-contests/${slug}?tab=${targetTab}`);
  };

  const handleBackToList = () => {
    setSelectedContestDetail(null);
    setCustomTitle('');
    navigate('/admin-dashboard/grand-contests');
  };

  const handleTabChange = (newTab) => {
    setActiveModalTab(newTab);
    const slug = slugifyTitle(selectedContestDetail?.title, selectedContestDetail?._id || id);
    if (slug) {
      navigate(`/admin-dashboard/grand-contests/${slug}?tab=${newTab}`, { replace: true });
      if (newTab === 'status') {
        handleCheckStatus(selectedContestDetail?._id || selectedContestDetail?.contestId || id, statusCheckUserId);
      }
    }
  };

  const handleCheckStatus = async (contestId, targetUserId) => {
    setStatusCheckLoading(true);
    setStatusCheckResult(null);
    try {
      const uParam = targetUserId && targetUserId.trim() ? `?userId=${encodeURIComponent(targetUserId.trim())}` : '';
      let res = await axios.get(`/api/admin/grand-contests/${contestId}/check-status${uParam}`, { withCredentials: true }).catch(() => null);
      if (!res?.data?.success) {
        res = await axios.get(`/api/grand-contests/${contestId}/check-status${uParam}`, { withCredentials: true }).catch(() => null);
      }
      if (res?.data) {
        setStatusCheckResult(res.data);
      } else {
        setStatusCheckResult({ success: false, message: 'No response received from check-status endpoint' });
      }
    } catch (err) {
      console.error('Error checking grand contest status:', err);
      setStatusCheckResult(err.response?.data || { success: false, message: 'Failed to query check-status API' });
    } finally {
      setStatusCheckLoading(false);
    }
  };

  const handleCreateTaskForContest = async () => {
    if (!taskForm.title.trim()) {
      showSnackbar('Task Title is required', 'warning');
      return;
    }
    if (!selectedContestDetail) return;
    const cId = selectedContestDetail._id || selectedContestDetail.contestId;

    try {
      let res = await axios.post(`/api/admin/grand-contests/${cId}/tasks`, taskForm, { withCredentials: true }).catch(() => null);
      if (!res?.data?.success) {
        res = await axios.post(`/api/grand-contests/${cId}/tasks`, taskForm, { withCredentials: true }).catch(() => null);
      }
      if (res?.data?.success) {
        showSnackbar('Task added to Grand Contest successfully!', 'success');
        setTaskForm({
          title: '',
          description: '',
          instructions: '',
          taskType: 'Quiz',
          submissionType: 'Text',
          points: 100,
          reviewType: 'Manual',
          status: 'Published'
        });
        setShowAddTaskForm(false);
        fetchContestTasks(cId);
        fetchGrandContests();
      } else {
        showSnackbar(res?.data?.message || 'Failed to add task to contest', 'error');
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to add task', 'error');
    }
  };

  const handleDeleteTaskFromContest = async (taskId) => {
    if (!selectedContestDetail) return;
    const cId = selectedContestDetail._id || selectedContestDetail.contestId;

    showConfirm('Delete Task', 'Are you sure you want to remove this task from this Grand Contest?', async () => {
      try {
        let res = await axios.delete(`/api/admin/grand-contests/${cId}/tasks/${taskId}`, { withCredentials: true }).catch(() => null);
        if (!res?.data?.success) {
          await axios.delete(`/api/grand-contests/${cId}/tasks/${taskId}`, { withCredentials: true }).catch(() => null);
        }
        showSnackbar('Task removed from Grand Contest', 'success');
        fetchContestTasks(cId);
        fetchGrandContests();
      } catch (err) {
        showSnackbar('Failed to remove task', 'error');
      }
    });
  };

  const handleOpenReviewModal = (submission) => {
    setReviewingSubmission(submission);
    setReviewScore(submission.score ?? 100);
    setReviewBonus(0);
    setReviewPenalty(0);
    setReviewFeedback(submission.feedback || '');
  };

  const handleSaveReview = async (newStatus) => {
    if (!reviewingSubmission) return;
    const subId = reviewingSubmission._id || reviewingSubmission.id;

    try {
      const payload = {
        status: newStatus,
        score: Number(reviewScore),
        bonusPoints: Number(reviewBonus),
        penaltyPoints: Number(reviewPenalty),
        feedback: reviewFeedback
      };
      let res = await axios.put(`/api/admin/grand-contests/submissions/${subId}/review`, payload, { withCredentials: true }).catch(() => null);
      if (!res?.data?.success) {
        res = await axios.put(`/api/grand-contests/submissions/${subId}/review`, payload, { withCredentials: true }).catch(() => null);
      }
      showSnackbar(`Submission marked as ${newStatus}`, 'success');
      setReviewingSubmission(null);
      if (selectedContestDetail) {
        fetchContestSubmissions(selectedContestDetail._id || selectedContestDetail.contestId);
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to review submission', 'error');
    }
  };

  const handleDeleteContest = (contest) => {
    const cId = contest._id || contest.contestId;
    showConfirm('Delete Grand Contest', `Are you sure you want to delete "${contest.title}"?`, async () => {
      try {
        let res = await axios.delete(`/api/admin/grand-contests/${cId}`, { withCredentials: true }).catch(() => null);
        if (!res?.data?.success) {
          await axios.delete(`/api/grand-contests/${cId}`, { withCredentials: true }).catch(() => null);
        }
        showSnackbar(`Grand Contest "${contest.title}" deleted successfully`, 'success');
        if (selectedContestDetail && (selectedContestDetail._id === cId || selectedContestDetail.contestId === cId)) {
          setSelectedContestDetail(null);
          navigate('/admin-dashboard/grand-contests');
        }
        fetchGrandContests();
      } catch (err) {
        showSnackbar('Failed to delete Grand Contest', 'error');
      }
    });
  };

  const handleDuplicateContest = async (contest) => {
    const cId = contest._id || contest.contestId;
    try {
      let res = await axios.post(`/api/admin/grand-contests/${cId}/duplicate`, {}, { withCredentials: true }).catch(() => null);
      if (!res?.data?.success) {
        res = await axios.post(`/api/grand-contests/${cId}/duplicate`, {}, { withCredentials: true }).catch(() => null);
      }
      showSnackbar(`Grand Contest duplicated as copy`, 'success');
      fetchGrandContests();
    } catch (err) {
      showSnackbar('Failed to duplicate Grand Contest', 'error');
    }
  };

  const filteredContests = contests.filter((item) => {
    const matchesSearch =
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.contestId?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPrizePool = contests.reduce((sum, item) => sum + (Number(item.prizePool) || 0), 0);
  const activeCount = contests.filter((c) => c.status === 'Active' || c.status === 'Registration Open' || c.status === 'Live').length;

  // =========================================================================================
  // VIEW MODE 1: DEDICATED FULL SINGLE PAGE VIEW FOR GRAND CONTEST (NO MODAL BOX)
  // =========================================================================================
  if (selectedContestDetail) {
    const cId = selectedContestDetail._id || selectedContestDetail.contestId;

    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in pb-16">
        {/* Top Navigation & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Grand Contests</span>
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="cursor-pointer hover:underline" onClick={handleBackToList}>Grand Contests</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-900 dark:text-white font-bold truncate max-w-[200px] sm:max-w-xs">
                {selectedContestDetail.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => navigate(`/admin-dashboard/grand-contests/wizard?edit=${cId}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Contest</span>
            </button>
            <button
              onClick={() => {
                fetchContestTasks(cId);
                fetchContestSubmissions(cId);
                if (activeModalTab === 'status') {
                  handleCheckStatus(cId, statusCheckUserId);
                }
                showSnackbar('Data refreshed', 'success');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Hero Contest Banner */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/15 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                <Trophy className="w-8 h-8 text-amber-500 dark:text-amber-400" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    {selectedContestDetail.contestId}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    selectedContestDetail.status === 'Active' || selectedContestDetail.status === 'Registration Open'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}>
                    {selectedContestDetail.status}
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" /> ₹{Number(selectedContestDetail.prizePool || 0).toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {selectedContestDetail.durationDays || 30} Days
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedContestDetail.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl line-clamp-2">
                  {selectedContestDetail.description || 'Grand Competitive Tournament with connected tasks, milestone challenges and leaderboard rewards.'}
                </p>
              </div>
            </div>

            {/* Quick KPI Badges */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center min-w-[120px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Tasks</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{contestTasks.length}</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center min-w-[120px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Submissions</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{contestSubmissions.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Tabs Navigation Bar */}
        <div className="sticky top-2 z-20 flex items-center gap-2 p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleTabChange('tasks')}
            className={`py-2.5 px-4 text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeModalTab === 'tasks'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Tasks & Challenges</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeModalTab === 'tasks' ? 'bg-black/20 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              {contestTasks.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('submissions')}
            className={`py-2.5 px-4 text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeModalTab === 'submissions'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>User Submissions</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeModalTab === 'submissions' ? 'bg-black/20 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              {contestSubmissions.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('overview')}
            className={`py-2.5 px-4 text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeModalTab === 'overview'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Rules & Overview</span>
          </button>

          <button
            onClick={() => handleTabChange('status')}
            className={`py-2.5 px-4 text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeModalTab === 'status'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="relative">
              <Activity className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
            </div>
            <span>Check Status & Diagnostics</span>
          </button>
        </div>

        {/* Tab Content Section Container */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* TAB 1: CONNECTED TASKS */}
          {activeModalTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-500" /> Grand Contest Connected Tasks
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tasks and challenge milestones assigned to contestants in this tournament
                  </p>
                </div>
                <button
                  onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
                >
                  {showAddTaskForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{showAddTaskForm ? 'Cancel Form' : 'Add New Task'}</span>
                </button>
              </div>

              {/* Quick Add Task Form */}
              {showAddTaskForm && (
                <div className="p-6 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-emerald-500/30 space-y-4 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Create & Connect New Task to Grand Contest</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Task Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Photography Challenge - Historic Monuments"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Points (Score Value) *</label>
                      <input
                        type="number"
                        placeholder="100"
                        value={taskForm.points}
                        onChange={(e) => setTaskForm({ ...taskForm, points: Number(e.target.value) })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Task Instructions & Description</label>
                    <textarea
                      rows={2}
                      placeholder="Describe instructions for contestants to complete this task..."
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Task Type</label>
                      <select
                        value={taskForm.taskType}
                        onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                      >
                        <option value="Quiz">Quiz</option>
                        <option value="Creative">Creative</option>
                        <option value="Photo">Photo</option>
                        <option value="Video">Video</option>
                        <option value="Document">Document</option>
                        <option value="AI Prompt">AI Prompt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Submission Type</label>
                      <select
                        value={taskForm.submissionType}
                        onChange={(e) => setTaskForm({ ...taskForm, submissionType: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                      >
                        <option value="Text">Text</option>
                        <option value="Image">Image</option>
                        <option value="Video">Video</option>
                        <option value="PDF">PDF</option>
                        <option value="URL">URL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Review Method</label>
                      <select
                        value={taskForm.reviewType}
                        onChange={(e) => setTaskForm({ ...taskForm, reviewType: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                      >
                        <option value="Manual">Manual Review</option>
                        <option value="AI">AI Review</option>
                        <option value="Auto">Auto Score</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleCreateTaskForContest}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-sm"
                  >
                    Confirm & Add Task to Tournament
                  </button>
                </div>
              )}

              {/* Tasks List */}
              {tasksLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Loading connected tasks...</p>
                </div>
              ) : contestTasks.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <CheckSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No tasks connected yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Click "Add New Task" above to assign challenges to this tournament.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contestTasks.map((task, idx) => (
                    <div
                      key={task._id || idx}
                      className="p-5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4 hover:border-emerald-500/30 transition shadow-2xs"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {task.title}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold rounded-md text-[10px] border border-amber-500/20">
                            {task.points || 100} Points
                          </span>
                          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold rounded-md text-[10px] border border-indigo-500/20">
                            {task.taskType || 'Quiz'}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-md text-[10px] border border-emerald-500/20">
                            {task.submissionType || 'Text'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTaskFromContest(task._id || task.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition cursor-pointer shrink-0"
                        title="Remove Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: USER SUBMISSIONS */}
          {activeModalTab === 'submissions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-indigo-500" /> Contestant Submissions & Review
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Review and grade submissions uploaded by registered tournament participants
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    Total: <strong className="text-slate-900 dark:text-white">{contestSubmissions.length}</strong>
                  </span>
                </div>
              </div>

              {submissionsLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Loading submissions...</p>
                </div>
              ) : contestSubmissions.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <FileCheck className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No submissions uploaded yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Participants will appear here once they complete and upload their proof files.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold">
                      <tr>
                        <th className="p-3.5">Contestant</th>
                        <th className="p-3.5">Task Challenge</th>
                        <th className="p-3.5">Proof / Media</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Final Score</th>
                        <th className="p-3.5 text-right">Review Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
                      {contestSubmissions.map((sub) => (
                        <tr key={sub._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-500/20">
                                {(sub.userId?.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">{sub.userId?.name || 'User'}</span>
                                <span className="text-[10px] text-slate-400 block">{sub.userId?.email || ''}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                            {sub.taskId?.title || (availableTasks.find((at) => String(at._id || at.id) === String(sub.taskId?._id || sub.taskId))?.title) || 'Contest Task'}
                          </td>
                          <td className="p-3.5">
                            {sub.mediaUrl ? (
                              <a
                                href={sub.mediaUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>View Proof</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">{sub.proofNotes || 'No file attached'}</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              sub.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                              sub.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' :
                              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">
                            {sub.finalPoints || sub.score || 0} Pts
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleOpenReviewModal(sub)}
                              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-2xs"
                            >
                              Review & Grade
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RULES & OVERVIEW */}
          {activeModalTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Prize Pool</span>
                    <Trophy className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{Number(selectedContestDetail.prizePool || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Cash INR Wallet</p>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                  <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Duration</span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {selectedContestDetail.durationDays || 30} Days
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Tournament Schedule</p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Connected Tasks</span>
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {contestTasks.length} Tasks
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Total Milestones</p>
                </div>

                <div className="p-5 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 space-y-1">
                  <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Entry Fee</span>
                    <Coins className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {selectedContestDetail.entryFeeCoins || 0} Coins
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Registration Coin Requirement</p>
                </div>
              </div>

              {/* Tournament Timing & Registration Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span>Registration Window</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong>Starts:</strong> {selectedContestDetail.registrationStartDate ? new Date(selectedContestDetail.registrationStartDate).toLocaleDateString() : 'Immediate'}
                    <span className="mx-2">•</span>
                    <strong>Ends:</strong> {selectedContestDetail.registrationEndDate ? new Date(selectedContestDetail.registrationEndDate).toLocaleDateString() : 'Open'}
                  </p>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>Execution Window</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong>Starts:</strong> {selectedContestDetail.executionStartDate ? new Date(selectedContestDetail.executionStartDate).toLocaleDateString() : 'On Schedule'}
                    <span className="mx-2">•</span>
                    <strong>Ends:</strong> {selectedContestDetail.executionEndDate ? new Date(selectedContestDetail.executionEndDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Contest Overview & Description */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" /> Contest Overview & Description
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedContestDetail.description || 'No detailed description provided for this Grand Contest.'}
                </p>
              </div>

              {/* Contest Rules Card */}
              {selectedContestDetail.rules && (
                <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-500" /> Official Contest Rules & Terms
                  </h4>
                  <div className="space-y-2">
                    {selectedContestDetail.rules.split('\n').filter(Boolean).map((line, idx) => {
                      const cleanLine = line.replace(/^\d+[\.\)]\s*/, '');
                      return (
                        <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                          <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-500/20">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">{cleanLine}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Participation Guidelines Card */}
              {selectedContestDetail.guidelines && (
                <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-500" /> Participation Guidelines
                  </h4>
                  <div className="space-y-2">
                    {selectedContestDetail.guidelines.split('\n').filter(Boolean).map((line, idx) => {
                      const cleanLine = line.replace(/^\d+[\.\)]\s*/, '');
                      return (
                        <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">{cleanLine}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CHECK STATUS & DIAGNOSTICS */}
          {activeModalTab === 'status' && (
            <div className="space-y-6">
              {/* Inspector Header */}
              <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-500" /> Grand Contest Check-Status Inspector
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Query live endpoint <code className="font-mono text-amber-600 dark:text-amber-400 font-bold">/api/grand-contests/:id/check-status</code> to verify registration, eligibility, and completion progress.
                  </p>
                </div>
                <button
                  onClick={() => handleCheckStatus(cId, statusCheckUserId)}
                  disabled={statusCheckLoading}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${statusCheckLoading ? 'animate-spin' : ''}`} />
                  <span>{statusCheckLoading ? 'Checking...' : 'Check Status Live'}</span>
                </button>
              </div>

              {/* Target User ID Input */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target User ID <span className="text-slate-400 font-normal">(Optional: Enter specific contestant User ObjectId to check their join status, or leave blank to test unauthenticated)</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. 66bc91f24d9e123456789usr1"
                      value={statusCheckUserId}
                      onChange={(e) => setStatusCheckUserId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                  <button
                    onClick={() => handleCheckStatus(cId, statusCheckUserId)}
                    className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Verify User
                  </button>
                </div>
              </div>

              {/* Results Display */}
              {statusCheckLoading ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Querying check-status endpoint...</p>
                </div>
              ) : statusCheckResult ? (
                <div className="space-y-5">
                  {/* Metric Badges Grid */}
                  {(() => {
                    const totalTasks = statusCheckResult?.data?.totalTasks ?? 0;
                    const completedTasks = statusCheckResult?.data?.completedTasks ?? 0;
                    const pendingTasks = statusCheckResult?.data?.pendingTasks ?? 0;
                    const progressPct = totalTasks > 0 ? Math.min(100, Math.round((completedTasks / totalTasks) * 100)) : 0;
                    const isJoined = Boolean(statusCheckResult.isJoined || statusCheckResult.data?.isJoined);
                    const isCompleted = Boolean(statusCheckResult.completed || statusCheckResult.data?.completed);
                    const canJoin = Boolean(statusCheckResult.data?.canJoin);

                    return (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-1.5 shadow-2xs">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Joined Status</span>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            isJoined
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}>
                            {isJoined ? 'Registered ✓' : 'Not Joined'}
                          </span>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-1.5 shadow-2xs">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Completion Status</span>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}>
                            {isCompleted ? 'Completed 🏆' : 'Incomplete'}
                          </span>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-1 shadow-2xs">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Tasks Completed</span>
                          <strong className="text-slate-900 dark:text-white text-lg font-black block">
                            {completedTasks} / {totalTasks}
                          </strong>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div style={{ width: `${progressPct}%` }} className="h-full bg-emerald-500 rounded-full transition-all duration-500" />
                          </div>
                          <span className="text-[10px] text-slate-400 block pt-0.5">({pendingTasks} pending)</span>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-1.5 shadow-2xs">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Join Eligibility</span>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold truncate max-w-[140px] ${
                            canJoin
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          }`} title={statusCheckResult.data?.cannotJoinReason || ''}>
                            {canJoin ? 'Can Join' : (statusCheckResult.data?.cannotJoinReason || 'Cannot Join')}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Endpoint Note Banner */}
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between gap-2">
                    <span className="truncate">
                      <strong>Active Endpoint:</strong> <code className="font-mono ml-1">GET /api/grand-contests/{cId}/check-status</code>
                    </span>
                    <span className="font-mono text-[11px] bg-amber-500/20 px-2.5 py-0.5 rounded-md font-bold shrink-0">
                      HTTP 200 OK
                    </span>
                  </div>

                  {/* Raw Response JSON Viewer */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Live API Response JSON Payload</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(statusCheckResult, null, 2));
                          setJsonCopied(true);
                          setTimeout(() => setJsonCopied(false), 2000);
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition cursor-pointer"
                      >
                        {jsonCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-64 shadow-inner">
                      {JSON.stringify(statusCheckResult, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* ========================================================================================= */}
        {/* REVIEW PROOF SUBMISSION DIALOG (ONLY FOR GRADING A SPECIFIC CONTESTANT'S SUBMISSION) */}
        {/* ========================================================================================= */}
        {reviewingSubmission && typeof document !== 'undefined' && createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 dark:bg-black/85 backdrop-blur-md animate-fade-in"
            onClick={() => setReviewingSubmission(null)}
          >
            <div
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Review & Grade Submission</h3>
                </div>
                <button
                  onClick={() => setReviewingSubmission(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Submission Overview Card */}
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Contestant</span>
                    <span className="text-slate-900 dark:text-white font-bold">{reviewingSubmission.userId?.name || 'User'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Task</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{reviewingSubmission.taskId?.title || 'Grand Contest Task'}</span>
                  </div>
                  {reviewingSubmission.mediaUrl && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Proof File</span>
                      <a
                        href={reviewingSubmission.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open Attached Proof</span>
                      </a>
                    </div>
                  )}
                  {reviewingSubmission.proofNotes && (
                    <div className="pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Notes:</span>
                      <p className="text-slate-700 dark:text-slate-300 italic">{reviewingSubmission.proofNotes}</p>
                    </div>
                  )}
                </div>

                {/* Scoring Inputs */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] mb-1">Base Score</label>
                    <input
                      type="number"
                      value={reviewScore}
                      onChange={(e) => setReviewScore(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold text-center focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px] mb-1">Bonus Pts</label>
                    <input
                      type="number"
                      value={reviewBonus}
                      onChange={(e) => setReviewBonus(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-emerald-500/30 rounded-xl p-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-center focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-rose-600 dark:text-rose-400 font-bold uppercase text-[10px] mb-1">Penalty Pts</label>
                    <input
                      type="number"
                      value={reviewPenalty}
                      onChange={(e) => setReviewPenalty(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-rose-500/30 rounded-xl p-2.5 text-rose-600 dark:text-rose-400 font-bold text-center focus:outline-none focus:border-rose-500 transition"
                    />
                  </div>
                </div>

                {/* Live Points Calculated Preview */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Total Points to Award</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Base ({reviewScore || 0}) + Bonus ({reviewBonus || 0}) - Penalty ({reviewPenalty || 0})
                    </span>
                  </div>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                    {Math.max(0, Number(reviewScore || 0) + Number(reviewBonus || 0) - Number(reviewPenalty || 0))} Pts
                  </span>
                </div>

                {/* Feedback Textarea */}
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] mb-1">Review Feedback Comments</label>
                  <textarea
                    rows={2}
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    placeholder="Optional review feedback comments for contestant..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleSaveReview('Approved')}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Grant Points</span>
                  </button>
                  <button
                    onClick={() => handleSaveReview('Rejected')}
                    className="flex-1 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Submission</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // =========================================================================================
  // VIEW MODE 2: GRAND CONTEST MANAGEMENT OVERVIEW & TOURNAMENT CARDS LIST
  // =========================================================================================
  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Grand Contest Management</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Create & manage grand competitive tournaments with connected tasks</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              fetchGrandContests();
              showSnackbar('Grand contests refreshed', 'success');
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/admin-dashboard/grand-contests/wizard')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Grand Contest</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Tournaments</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{contests.length}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active / Live</span>
          <span className="text-2xl font-black text-emerald-500">{activeCount}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Prize Pool</span>
          <span className="text-2xl font-black text-amber-500">₹{totalPrizePool.toLocaleString()}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Contest Modules</span>
          <span className="text-2xl font-black text-indigo-500">Grand Milestone</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or contest ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {['All', 'Active', 'Registration Open', 'Upcoming', 'Completed', 'Draft'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Contests Grid */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading grand contests...</p>
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Grand Contests Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Create your first tournament using the setup wizard to engage users with milestone challenges.
          </p>
          <button
            onClick={() => navigate('/admin-dashboard/grand-contests/wizard')}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-sm"
          >
            Create Grand Contest
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredContests.map((contest) => {
            const cId = contest._id || contest.contestId;
            return (
              <div
                key={cId}
                className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Banner / Header Image */}
                  <div
                    onClick={() => handleOpenContestView(contest, 'overview')}
                    className="h-36 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-950 relative overflow-hidden cursor-pointer"
                  >
                    {contest.bannerUrl ? (
                      <img
                        src={contest.bannerUrl}
                        alt={contest.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/10">
                        <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-700/60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                        {contest.contestId}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md ${
                        contest.status === 'Active' || contest.status === 'Registration Open'
                          ? 'bg-emerald-500/80 text-white border-emerald-400'
                          : 'bg-slate-900/80 text-slate-300 border-white/10'
                      }`}>
                        {contest.status}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                      <div>
                        <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Prize Pool</span>
                        <span className="text-lg font-black text-amber-400 drop-shadow-sm">
                          ₹{Number(contest.prizePool || 0).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-300 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md font-semibold border border-white/10">
                        {contest.durationDays || 30} Days
                      </span>
                    </div>
                  </div>

                  {/* Contest Card Body */}
                  <div className="p-5 space-y-3">
                    <h3
                      onClick={() => handleOpenContestView(contest, 'overview')}
                      className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition line-clamp-1 cursor-pointer"
                    >
                      {contest.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {contest.description || 'Grand tournament challenge with connected contestant milestone tasks.'}
                    </p>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Entry Coins</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {contest.entryFeeCoins || 0} Coins
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Tasks Connected</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {contest.tasks?.length || 0} Tasks
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons Section */}
                <div className="p-4 pt-0 space-y-2.5">
                  {/* Card Quick Section Navigation Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      onClick={() => handleOpenContestView(contest, 'tasks')}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition border border-emerald-500/20 cursor-pointer shadow-2xs"
                      title="View Connected Tasks"
                    >
                      <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Tasks</span>
                    </button>
                    <button
                      onClick={() => handleOpenContestView(contest, 'submissions')}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl transition border border-indigo-500/20 cursor-pointer shadow-2xs"
                      title="View Submissions"
                    >
                      <FileCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Submissions</span>
                    </button>
                    <button
                      onClick={() => handleOpenContestView(contest, 'status')}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition border border-amber-500/20 cursor-pointer shadow-2xs"
                      title="Check Participation & Completion Status"
                    >
                      <Activity className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Status</span>
                    </button>
                  </div>

                  {/* Card Bottom Actions Toolbar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <button
                      onClick={() => handleOpenContestView(contest, 'overview')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                      title="View Rules, Overview & Diagnostics"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Rules & Overview</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/admin-dashboard/grand-contests/wizard?edit=${cId}`)}
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition cursor-pointer"
                        title="Edit Grand Contest"
                        aria-label="Edit Grand Contest"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateContest(contest)}
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition cursor-pointer"
                        title="Duplicate Grand Contest"
                        aria-label="Duplicate Grand Contest"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContest(contest)}
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                        title="Delete Grand Contest"
                        aria-label="Delete Grand Contest"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GrandContestManagementPage;
