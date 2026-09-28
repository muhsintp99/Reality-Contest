import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Search, Filter, RefreshCw, Eye, Edit3, Trash2, Copy, Layers, FileText, AlertCircle, CheckSquare, FileCheck, Award, X } from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';

export const GrandContestManagementPage = () => {
  const navigate = useNavigate();
  const { showSnackbar, showConfirm } = useAlert();

  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Detail Modal & Tabs State
  const [selectedContestDetail, setSelectedContestDetail] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('tasks'); // 'overview' | 'tasks' | 'submissions'
  const [contestTasks, setContestTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [contestSubmissions, setContestSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

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

  useEffect(() => {
    fetchGrandContests();
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

  const handleOpenDetailModal = (contest, initialTab = 'tasks') => {
    setSelectedContestDetail(contest);
    setActiveModalTab(initialTab);
    const id = contest._id || contest.contestId;
    fetchContestTasks(id);
    fetchContestSubmissions(id);
  };

  const handleCreateTaskForContest = async () => {
    if (!taskForm.title.trim()) {
      showSnackbar('Task Title is required', 'warning');
      return;
    }
    const id = selectedContestDetail._id || selectedContestDetail.contestId;
    try {
      let res = await axios.post(`/api/admin/grand-contests/${id}/tasks`, taskForm, { withCredentials: true }).catch(() => null);
      if (!res?.data?.success) {
        res = await axios.post(`/api/grand-contests/${id}/tasks`, taskForm, { withCredentials: true }).catch(() => null);
      }
      showSnackbar('Task created and attached to Grand Contest!', 'success');
      setShowAddTaskForm(false);
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
      fetchContestTasks(id);
      fetchGrandContests();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to create task', 'error');
    }
  };

  const handleRemoveTask = (taskId) => {
    const id = selectedContestDetail._id || selectedContestDetail.contestId;
    showConfirm('Remove Task', 'Are you sure you want to unlink this task from the Grand Contest?', async () => {
      try {
        let res = await axios.delete(`/api/admin/grand-contests/${id}/tasks/${taskId}`, { withCredentials: true }).catch(() => null);
        if (!res?.data?.success) {
          await axios.delete(`/api/grand-contests/${id}/tasks/${taskId}`, { withCredentials: true }).catch(() => null);
        }
        showSnackbar('Task removed from Grand Contest', 'success');
        fetchContestTasks(id);
        fetchGrandContests();
      } catch (err) {
        showSnackbar('Failed to remove task', 'error');
      }
    });
  };

  const handleOpenReviewModal = (submission) => {
    setReviewingSubmission(submission);
    setReviewScore(submission.score || submission.taskId?.points || 100);
    setReviewBonus(submission.bonus || 0);
    setReviewPenalty(submission.penalty || 0);
    setReviewFeedback(submission.feedback || '');
  };

  const handleSaveReview = async (status) => {
    if (!reviewingSubmission) return;
    const subId = reviewingSubmission._id || reviewingSubmission.id;
    try {
      const payload = {
        status,
        score: Number(reviewScore),
        bonus: Number(reviewBonus),
        penalty: Number(reviewPenalty),
        feedback: reviewFeedback
      };

      let res = await axios.put(`/api/admin/grand-contests/submissions/${subId}/review`, payload, { withCredentials: true }).catch(() => null);
      if (!res?.data?.success) {
        res = await axios.put(`/api/grand-contests/submissions/${subId}/review`, payload, { withCredentials: true }).catch(() => null);
      }

      showSnackbar(`Submission status updated to ${status}!`, 'success');
      setReviewingSubmission(null);
      if (selectedContestDetail) {
        const id = selectedContestDetail._id || selectedContestDetail.contestId;
        fetchContestSubmissions(id);
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to review submission', 'error');
    }
  };

  const handleDeleteContest = (contest) => {
    const id = contest._id || contest.contestId;
    showConfirm('Delete Grand Contest', `Are you sure you want to delete "${contest.title}"?`, async () => {
      try {
        let res = await axios.delete(`/api/admin/grand-contests/${id}`, { withCredentials: true }).catch(() => null);
        if (!res?.data?.success) {
          await axios.delete(`/api/grand-contests/${id}`, { withCredentials: true }).catch(() => null);
        }
        showSnackbar(`Grand Contest "${contest.title}" deleted successfully`, 'success');
        fetchGrandContests();
      } catch (err) {
        showSnackbar('Failed to delete Grand Contest', 'error');
      }
    });
  };

  const handleDuplicateContest = async (contest) => {
    const id = contest._id || contest.contestId;
    try {
      let res = await axios.post(`/api/admin/grand-contests/${id}/duplicate`, {}, { withCredentials: true }).catch(() => null);
      if (!res?.data?.success) {
        res = await axios.post(`/api/grand-contests/${id}/duplicate`, {}, { withCredentials: true }).catch(() => null);
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Grand Contest Management</h1>
              <p className="text-slate-400 text-sm">Create & manage grand competitive contests with connected task challenges</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchGrandContests}
            className="p-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-xl transition border border-slate-700/50 cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/admin-dashboard/grand-contests/wizard')}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Create Grand Contest
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Contests</p>
          <p className="text-2xl font-black text-white mt-1">{contests.length}</p>
        </div>
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Contests</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{activeCount}</p>
        </div>
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Prize Pool</p>
          <p className="text-2xl font-black text-amber-400 mt-1">₹{totalPrizePool.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tasks Connected</p>
          <p className="text-2xl font-black text-indigo-400 mt-1">
            {contests.reduce((sum, item) => sum + (item.tasksCount || (item.tasks ? item.tasks.length : 0)), 0)}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by contest title or custom ID..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 text-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Registration Open">Registration Open</option>
            <option value="Active">Active</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Contests Grid */}
      {loading ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">Loading Grand Contests...</p>
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-white font-bold text-lg mb-1">No Grand Contests Found</h3>
          <p className="text-slate-400 text-sm mb-4">Click below to create your first Grand Contest connected with tasks.</p>
          <button
            onClick={() => navigate('/admin-dashboard/grand-contests/wizard')}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition"
          >
            Create Grand Contest
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((contest) => {
            const connectedCount = contest.tasksCount || (contest.tasks ? contest.tasks.length : 0);
            return (
              <div
                key={contest._id || contest.contestId}
                className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition flex flex-col justify-between group"
              >
                <div>
                  {contest.bannerUrl ? (
                    <img src={contest.bannerUrl} alt={contest.title} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 flex items-center justify-center">
                      <Trophy className="w-12 h-12 text-emerald-400/40" />
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        {contest.contestId}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          contest.status === 'Active' || contest.status === 'Registration Open'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {contest.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition line-clamp-1">
                      {contest.title}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2">{contest.description || 'No description provided.'}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 block">Prize Pool</span>
                        <span className="font-bold text-amber-400">₹{Number(contest.prizePool || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Tasks Connected</span>
                        <span className="font-bold text-indigo-400">{connectedCount} Tasks</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenDetailModal(contest, 'tasks')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition border border-indigo-500/20 cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" /> Tasks ({connectedCount})
                    </button>
                    <button
                      onClick={() => handleOpenDetailModal(contest, 'submissions')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition border border-emerald-500/20 cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5" /> Reviews
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/admin-dashboard/grand-contests/wizard?edit=${contest._id || contest.contestId}`)}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition cursor-pointer"
                      title="Edit Grand Contest"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateContest(contest)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContest(contest)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grand Contest Tasks & Submissions Management Modal */}
      {selectedContestDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400">{selectedContestDetail.contestId}</span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" /> {selectedContestDetail.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedContestDetail(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div className="flex items-center gap-4 px-6 border-b border-slate-800 bg-slate-950/30">
              <button
                onClick={() => setActiveModalTab('tasks')}
                className={`py-3.5 px-2 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
                  activeModalTab === 'tasks' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <CheckSquare className="w-4 h-4" /> Tasks & Challenges ({contestTasks.length})
              </button>
              <button
                onClick={() => setActiveModalTab('submissions')}
                className={`py-3.5 px-2 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
                  activeModalTab === 'submissions' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileCheck className="w-4 h-4" /> User Task Submissions ({contestSubmissions.length})
              </button>
              <button
                onClick={() => setActiveModalTab('overview')}
                className={`py-3.5 px-2 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
                  activeModalTab === 'overview' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" /> Contest Rules & Overview
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: CONNECTED TASKS */}
              {activeModalTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Grand Contest Connected Tasks</h3>
                      <p className="text-xs text-slate-400">Tasks assigned to contestants in this contest</p>
                    </div>
                    <button
                      onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> {showAddTaskForm ? 'Cancel' : 'Add New Task'}
                    </button>
                  </div>

                  {/* Quick Add Task Form */}
                  {showAddTaskForm && (
                    <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-3 animate-fade-in">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Create & Link New Task</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Task Title *"
                          value={taskForm.title}
                          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                        <input
                          type="number"
                          placeholder="Points (Score) *"
                          value={taskForm.points}
                          onChange={(e) => setTaskForm({ ...taskForm, points: Number(e.target.value) })}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Task Description..."
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <select
                          value={taskForm.taskType}
                          onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value })}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white text-xs"
                        >
                          <option value="Quiz">Quiz</option>
                          <option value="Creative">Creative</option>
                          <option value="Photo">Photo</option>
                          <option value="Video">Video</option>
                          <option value="Document">Document</option>
                          <option value="AI Prompt">AI Prompt</option>
                        </select>
                        <select
                          value={taskForm.submissionType}
                          onChange={(e) => setTaskForm({ ...taskForm, submissionType: e.target.value })}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white text-xs"
                        >
                          <option value="Text">Text</option>
                          <option value="Image">Image</option>
                          <option value="Video">Video</option>
                          <option value="PDF">PDF</option>
                          <option value="URL">URL</option>
                        </select>
                        <select
                          value={taskForm.reviewType}
                          onChange={(e) => setTaskForm({ ...taskForm, reviewType: e.target.value })}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white text-xs"
                        >
                          <option value="Manual">Manual Review</option>
                          <option value="AI">AI Review</option>
                          <option value="Auto">Auto Score</option>
                        </select>
                      </div>
                      <button
                        onClick={handleCreateTaskForContest}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        Attach Task to Grand Contest
                      </button>
                    </div>
                  )}

                  {/* Tasks Table */}
                  {tasksLoading ? (
                    <div className="text-center py-8 text-slate-400 text-xs">Loading tasks...</div>
                  ) : contestTasks.length === 0 ? (
                    <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                      No tasks connected to this contest. Click "Add New Task" or connect tasks via Grand Contest Wizard.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                            <th className="p-3">#</th>
                            <th className="p-3">Title & Description</th>
                            <th className="p-3">Task Type</th>
                            <th className="p-3">Submission Type</th>
                            <th className="p-3">Points</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {contestTasks.map((t, idx) => (
                            <tr key={t._id || idx} className="hover:bg-slate-950/40">
                              <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                              <td className="p-3">
                                <span className="font-bold text-white block">{t.title}</span>
                                <span className="text-[10px] text-slate-400 block truncate max-w-xs">{t.description}</span>
                              </td>
                              <td className="p-3 text-emerald-400 font-semibold">{t.taskType}</td>
                              <td className="p-3 text-indigo-400 font-semibold">{t.submissionType}</td>
                              <td className="p-3 text-amber-400 font-bold">{t.points || 100} Pts</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleRemoveTask(t._id)}
                                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                                  title="Unlink Task"
                                >
                                  <Trash2 className="w-4 h-4" />
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

              {/* TAB 2: USER SUBMISSIONS & REVIEW */}
              {activeModalTab === 'submissions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Contestant Task Proof Submissions</h3>
                      <p className="text-xs text-slate-400">Review contestant proof submissions, assign points, bonus or penalty</p>
                    </div>
                    <button
                      onClick={() => fetchContestSubmissions(selectedContestDetail._id || selectedContestDetail.contestId)}
                      className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs transition cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {submissionsLoading ? (
                    <div className="text-center py-8 text-slate-400 text-xs">Loading proof submissions...</div>
                  ) : contestSubmissions.length === 0 ? (
                    <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                      No task proof submissions submitted yet for this Grand Contest.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                            <th className="p-3">Contestant</th>
                            <th className="p-3">Task</th>
                            <th className="p-3">Proof / File</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Final Score</th>
                            <th className="p-3 text-right">Review</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {contestSubmissions.map((sub) => (
                            <tr key={sub._id} className="hover:bg-slate-950/40">
                              <td className="p-3">
                                <span className="font-bold text-white block">{sub.userId?.name || 'User'}</span>
                                <span className="text-[10px] text-slate-400 block">{sub.userId?.email || ''}</span>
                              </td>
                              <td className="p-3 font-semibold text-emerald-400">
                                {sub.taskId?.title || 'Contest Task'}
                              </td>
                              <td className="p-3">
                                {sub.mediaUrl ? (
                                  <a href={sub.mediaUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 underline truncate max-w-xs block">
                                    View Proof Attachment
                                  </a>
                                ) : (
                                  <span className="text-slate-500">{sub.proofNotes || 'No file attached'}</span>
                                )}
                              </td>
                              <td className="p-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                  sub.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                  sub.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                                  'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                }`}>
                                  {sub.status}
                                </span>
                              </td>
                              <td className="p-3 font-bold text-amber-400">
                                {sub.finalPoints || sub.score || 0} Pts
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleOpenReviewModal(sub)}
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer"
                                >
                                  Review
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

              {/* TAB 3: OVERVIEW */}
              {activeModalTab === 'overview' && (
                <div className="space-y-4 text-sm text-slate-300">
                  <p><strong className="text-white">Description:</strong> {selectedContestDetail.description}</p>
                  {selectedContestDetail.rules && (
                    <div>
                      <strong className="text-white block mb-1">Contest Rules:</strong>
                      <div className="p-4 bg-slate-950 rounded-xl text-xs whitespace-pre-line border border-slate-800">{selectedContestDetail.rules}</div>
                    </div>
                  )}
                  {selectedContestDetail.guidelines && (
                    <div>
                      <strong className="text-white block mb-1">Participation Guidelines:</strong>
                      <div className="p-4 bg-slate-950 rounded-xl text-xs whitespace-pre-line border border-slate-800">{selectedContestDetail.guidelines}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
                    <div><strong className="text-white">Prize Pool:</strong> ₹{selectedContestDetail.prizePool}</div>
                    <div><strong className="text-white">Duration (Days):</strong> {selectedContestDetail.durationDays || 7} Days</div>
                    <div><strong className="text-white">Tasks Connected:</strong> {selectedContestDetail.tasksCount || (selectedContestDetail.tasks ? selectedContestDetail.tasks.length : 0)}</div>
                    <div><strong className="text-white">Status:</strong> {selectedContestDetail.status}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Proof Submission Modal */}
      {reviewingSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> Review Task Submission
              </h3>
              <button onClick={() => setReviewingSubmission(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div><span className="text-slate-400 font-bold">Contestant:</span> <span className="text-white">{reviewingSubmission.userId?.name || 'User'}</span></div>
                <div><span className="text-slate-400 font-bold">Task:</span> <span className="text-emerald-400">{reviewingSubmission.taskId?.title || 'Grand Contest Task'}</span></div>
                {reviewingSubmission.mediaUrl && (
                  <div>
                    <span className="text-slate-400 font-bold">Proof Attachment:</span>{' '}
                    <a href={reviewingSubmission.mediaUrl} target="_blank" rel="noreferrer" className="text-indigo-400 underline">
                      Open Attached Proof File
                    </a>
                  </div>
                )}
                {reviewingSubmission.proofNotes && (
                  <div><span className="text-slate-400 font-bold">Notes:</span> <span className="text-slate-300">{reviewingSubmission.proofNotes}</span></div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Base Score</label>
                  <input
                    type="number"
                    value={reviewScore}
                    onChange={(e) => setReviewScore(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Bonus Pts</label>
                  <input
                    type="number"
                    value={reviewBonus}
                    onChange={(e) => setReviewBonus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Penalty Pts</label>
                  <input
                    type="number"
                    value={reviewPenalty}
                    onChange={(e) => setReviewPenalty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-rose-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Feedback Comments</label>
                <textarea
                  rows={2}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Optional review feedback for contestant..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleSaveReview('Approved')}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Approve & Grant Points
                </button>
                <button
                  onClick={() => handleSaveReview('Rejected')}
                  className="flex-1 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrandContestManagementPage;
