import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  CheckSquare, Video, Camera, FileText, Sparkles, UserCheck, Bot,
  Award, CheckCircle2, XCircle, Eye, Plus, Search, Filter, Trash2, Edit2,
  Play, FileCode, Check, AlertTriangle, X, Clock, Calendar, Download, RefreshCw, MessageSquare
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { RightDrawer } from '../components/RightDrawer';

const TASK_TYPE_OPTIONS = [
  { label: 'Video Upload Tasks', value: 'Video Upload' },
  { label: 'Photo Tasks', value: 'Photo Tasks' },
  { label: 'Document Tasks', value: 'Document Tasks' },
  { label: 'Creative Tasks', value: 'Creative Tasks' }
];

const REVIEW_MODE_OPTIONS = [
  { label: 'Manual Review', value: 'Manual Review' },
  { label: 'AI Review', value: 'AI Review' }
];

const MOCK_DEFAULT_TASKS = [
  {
    id: 'TSK-501',
    _id: 'TSK-501',
    title: 'Stage 1 Dance Audition Video Upload',
    type: 'Video Upload',
    submitter: 'Rahul Kapoor',
    submitterEmail: 'rahul.k@rcp.com',
    reviewType: 'AI Review',
    score: '94/100',
    maxScore: '100',
    aiConfidence: '98.2%',
    status: 'Approved',
    submittedAt: '2026-08-01 10:15 AM',
    mediaUrl: 'https://example.com/media/dance_audition.mp4',
    description: '1080p high quality video submission of freestyle dance performance for Stage 1 evaluation.',
    feedback: 'Excellent rhythm control and clear camera angle.'
  },
  {
    id: 'TSK-502',
    _id: 'TSK-502',
    title: 'Creative Costume & Theme Photo Submission',
    type: 'Photo Tasks',
    submitter: 'Sneha Roy',
    submitterEmail: 'sneha.r@rcp.com',
    reviewType: 'Manual Review',
    score: '88/100',
    maxScore: '100',
    aiConfidence: 'N/A',
    status: 'Approved',
    submittedAt: '2026-08-01 11:30 AM',
    mediaUrl: 'https://example.com/media/costume_design.png',
    description: 'High-res photograph showcasing traditional costume design adhering to competition guidelines.',
    feedback: 'Vibrant colors and authentic detailing.'
  },
  {
    id: 'TSK-503',
    _id: 'TSK-503',
    title: 'Research Paper & Project Summary PDF',
    type: 'Document Tasks',
    submitter: 'Anand Varma',
    submitterEmail: 'anand.v@rcp.com',
    reviewType: 'AI Review',
    score: 'Unscored',
    maxScore: '100',
    aiConfidence: '96.5%',
    status: 'Pending Review',
    submittedAt: '2026-08-01 12:05 PM',
    mediaUrl: 'https://example.com/media/research_summary.pdf',
    description: 'Submitted 5-page PDF document summarizing environmental science research methodology.',
    feedback: ''
  },
  {
    id: 'TSK-504',
    _id: 'TSK-504',
    title: 'Digital Poster Design & Brand Logo Concept',
    type: 'Creative Tasks',
    submitter: 'Priya Sharma',
    submitterEmail: 'priya.s@rcp.com',
    reviewType: 'Manual Review',
    score: 'Unscored',
    maxScore: '100',
    aiConfidence: 'N/A',
    status: 'Pending Review',
    submittedAt: '2026-08-01 12:40 PM',
    mediaUrl: 'https://example.com/media/poster_concept.png',
    description: 'Vector graphics poster design for annual festival event branding.',
    feedback: ''
  }
];

export const TaskManagementPage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  // Sub-Tabs State
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Drawers State
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [scoringTask, setScoringTask] = useState(null);
  const [previewMediaTask, setPreviewMediaTask] = useState(null);

  // Score Allocation Drawer Form
  const [scoreInput, setScoreInput] = useState('90');
  const [feedbackInput, setFeedbackInput] = useState('');

  // Tasks State
  const [tasks, setTasks] = useState([]);

  // Create Task Form State
  const [taskForm, setTaskForm] = useState({
    title: '',
    type: 'Video Upload',
    submitter: 'Contestant User',
    submitterEmail: 'contestant@rcp.com',
    reviewType: 'AI Review',
    score: 'Unscored',
    maxScore: '100',
    aiConfidence: '98.5%',
    status: 'Pending Review',
    mediaUrl: '',
    description: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [isMockMode]);

  const fetchTasks = async () => {
    if (isMockMode) {
      setTasks(MOCK_DEFAULT_TASKS);
      return;
    }
    try {
      const res = await axios.get('/api/admin/tasks', { withCredentials: true });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching tasks from backend API:', err);
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      type: 'Video Upload',
      submitter: 'Contestant User',
      submitterEmail: 'contestant@rcp.com',
      reviewType: 'AI Review',
      score: 'Unscored',
      maxScore: '100',
      aiConfidence: '98.5%',
      status: 'Pending Review',
      mediaUrl: '',
      description: ''
    });
  };

  // --- CREATE TASK ACTION ---
  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) {
      showSnackbar('Task title is mandatory.', 'warning');
      return;
    }

    const newT = {
      id: `TSK-${Date.now().toString().slice(-4)}`,
      _id: `TSK-${Date.now().toString().slice(-4)}`,
      submittedAt: new Date().toLocaleString(),
      ...taskForm
    };

    if (!isMockMode) {
      try {
        const res = await axios.post('/api/admin/tasks', newT, { withCredentials: true });
        if (res.data && res.data.data) {
          newT._id = res.data.data._id || res.data.data.id || newT.id;
        }
      } catch (err) {
        console.error('Error creating task via API:', err);
      }
    }

    setTasks(prev => [newT, ...prev]);
    showSnackbar('New task published successfully!', 'success');
    setShowCreateDrawer(false);
    resetTaskForm();
  };

  // --- EDIT TASK ACTION ---
  const handleSaveEditTask = async () => {
    if (!editingTask || !editingTask.title.trim()) {
      showSnackbar('Task title cannot be empty.', 'warning');
      return;
    }

    if (!isMockMode) {
      try {
        await axios.put(`/api/admin/tasks/${editingTask._id || editingTask.id}`, editingTask, { withCredentials: true });
      } catch (err) {
        console.error('Error updating task via API:', err);
      }
    }

    setTasks(prev => prev.map(t => (t.id === editingTask.id || t._id === editingTask._id) ? editingTask : t));
    if (previewMediaTask && (previewMediaTask.id === editingTask.id || previewMediaTask._id === editingTask._id)) {
      setPreviewMediaTask(editingTask);
    }
    showSnackbar(`Task "${editingTask.title}" updated successfully!`, 'success');
    setEditingTask(null);
  };

  // --- SCORE & APPROVE ACTION ---
  const handleScoreAndApprove = async () => {
    if (!scoringTask) return;
    const max = scoringTask.maxScore || '100';
    const finalScore = `${scoreInput}/${max}`;

    const updated = {
      ...scoringTask,
      score: finalScore,
      feedback: feedbackInput,
      status: 'Approved'
    };

    if (!isMockMode) {
      try {
        await axios.put(`/api/admin/tasks/${scoringTask._id || scoringTask.id}`, updated, { withCredentials: true });
      } catch (err) {
        console.error('Error updating task score via API:', err);
      }
    }

    setTasks(prev => prev.map(t => (t.id === scoringTask.id || t._id === scoringTask._id) ? updated : t));
    if (previewMediaTask && (previewMediaTask.id === scoringTask.id || previewMediaTask._id === scoringTask._id)) {
      setPreviewMediaTask(updated);
    }
    showSnackbar(`Task ${scoringTask.id || scoringTask._id} approved & score (${finalScore}) allocated!`, 'success');
    setScoringTask(null);
  };

  // --- REJECT TASK SUBMISSION ---
  const handleRejectTask = async (task) => {
    showConfirm('Reject Task Submission', `Are you sure you want to reject submission for "${task.title}"?`, async () => {
      const updated = { ...task, status: 'Rejected' };
      if (!isMockMode) {
        try {
          await axios.put(`/api/admin/tasks/${task._id || task.id}`, updated, { withCredentials: true });
        } catch (err) {
          console.error('Error rejecting task via API:', err);
        }
      }
      setTasks(prev => prev.map(t => (t.id === task.id || t._id === task._id) ? updated : t));
      if (previewMediaTask && (previewMediaTask.id === task.id || previewMediaTask._id === task._id)) {
        setPreviewMediaTask(updated);
      }
      showSnackbar(`Submission for ${task.title} rejected.`, 'info');
    });
  };

  // --- DELETE TASK ACTION ---
  const handleDeleteTask = (task) => {
    showConfirm('Delete Task', `Are you sure you want to permanently delete task "${task.title}"?`, async () => {
      if (!isMockMode) {
        try {
          await axios.delete(`/api/admin/tasks/${task._id || task.id}`, { withCredentials: true });
        } catch (err) {
          console.error('Error deleting task via API:', err);
        }
      }
      setTasks(prev => prev.filter(t => (t.id !== task.id && t._id !== task._id)));
      if (previewMediaTask && (previewMediaTask.id === task.id || previewMediaTask._id === task._id)) {
        setPreviewMediaTask(null);
      }
      if (scoringTask && (scoringTask.id === task.id || scoringTask._id === task._id)) {
        setScoringTask(null);
      }
      if (editingTask && (editingTask.id === task.id || editingTask._id === task._id)) {
        setEditingTask(null);
      }
      showSnackbar(`Task "${task.title}" deleted.`, 'success');
    });
  };

  // --- FILTERED TASKS LOGIC ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.submitter && t.submitter.toLowerCase().includes(q)) ||
        (t.id && t.id.toLowerCase().includes(q));

      // Tab Filtering
      let matchesTab = true;
      if (activeTab === 'video') matchesTab = t.type === 'Video Upload';
      else if (activeTab === 'photo') matchesTab = t.type === 'Photo Tasks';
      else if (activeTab === 'document') matchesTab = t.type === 'Document Tasks';
      else if (activeTab === 'creative') matchesTab = t.type === 'Creative Tasks';
      else if (activeTab === 'manual') matchesTab = t.reviewType === 'Manual Review';
      else if (activeTab === 'ai') matchesTab = t.reviewType === 'AI Review';
      else if (activeTab === 'score') matchesTab = t.score !== 'Unscored';
      else if (activeTab === 'approval') matchesTab = t.status === 'Approved';

      const matchesType = typeFilter === 'All' || t.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

      return matchesSearch && matchesTab && matchesType && matchesStatus;
    });
  }, [tasks, searchTerm, activeTab, typeFilter, statusFilter]);

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-emerald-500" />
            Task Management & Submissions Moderation
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Manage Video, Photo, Document & Creative tasks, AI & Manual moderation, score allocation and approvals.
          </p>
        </div>

        <button
          onClick={() => { resetTaskForm(); setShowCreateDrawer(true); }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Task</span>
        </button>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'all', label: 'All Submissions', icon: CheckSquare },
          { id: 'video', label: 'Video Upload Tasks', icon: Video },
          { id: 'photo', label: 'Photo Tasks', icon: Camera },
          { id: 'document', label: 'Document Tasks', icon: FileText },
          { id: 'creative', label: 'Creative Tasks', icon: Sparkles },
          { id: 'manual', label: 'Manual Review', icon: UserCheck },
          { id: 'ai', label: 'AI Review', icon: Bot },
          { id: 'score', label: 'Score Allocation', icon: Award },
          { id: 'approval', label: 'Approvals', icon: CheckCircle2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search task title, ID or submitter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <CustomSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: 'All Task Types', value: 'All' },
              ...TASK_TYPE_OPTIONS
            ]}
            className="w-44"
          />

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Statuses', value: 'All' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Pending Review', value: 'Pending Review' },
              { label: 'Rejected', value: 'Rejected' }
            ]}
            className="w-40"
          />
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="py-3 px-4">Task & Submitter</th>
                <th className="py-3 px-4">Task Type</th>
                <th className="py-3 px-4">Reviewer Mode & AI Confidence</th>
                <th className="py-3 px-4">Score Allocated</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No task submissions match your current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(t => (
                  <tr key={t.id || t._id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-mono font-bold rounded text-[10px] inline-block mb-1">
                        {t.id || t._id}
                      </span>
                      <strong className="text-slate-900 dark:text-white font-bold block">{t.title}</strong>
                      <span className="text-[11px] text-slate-400">Submitted by: {t.submitter}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 font-bold rounded-lg border border-slate-200 dark:border-white/10 inline-flex items-center gap-1">
                        {t.type === 'Video Upload' && <Video className="w-3.5 h-3.5 text-indigo-500" />}
                        {t.type === 'Photo Tasks' && <Camera className="w-3.5 h-3.5 text-pink-500" />}
                        {t.type === 'Document Tasks' && <FileText className="w-3.5 h-3.5 text-blue-500" />}
                        {t.type === 'Creative Tasks' && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {t.reviewType === 'AI Review' ? <Bot className="w-4 h-4 text-purple-500" /> : <UserCheck className="w-4 h-4 text-emerald-500" />}
                        <span>{t.reviewType}</span>
                      </div>
                      {t.aiConfidence && t.aiConfidence !== 'N/A' && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">AI Confidence: {t.aiConfidence}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-mono font-bold text-xs ${t.score === 'Unscored' ? 'text-slate-400' : 'text-emerald-500'}`}>
                        {t.score}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        t.status === 'Pending Review' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewMediaTask(t)}
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 cursor-pointer"
                          title="Preview Submission & Specs Drawer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setScoringTask(t);
                            setScoreInput(t.score !== 'Unscored' ? t.score.split('/')[0] : '90');
                            setFeedbackInput(t.feedback || '');
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 cursor-pointer"
                          title="Score Allocation & Moderation Drawer"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingTask(JSON.parse(JSON.stringify(t)))}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 cursor-pointer"
                          title="Edit Task Drawer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {t.status !== 'Rejected' && (
                          <button
                            onClick={() => handleRejectTask(t)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer"
                            title="Reject Submission"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(t)}
                          className="p-1.5 rounded-lg bg-slate-500/10 text-slate-400 hover:bg-rose-500/20 hover:text-rose-500 cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. CREATE NEW TASK DRAWER */}
      <RightDrawer
        isOpen={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
        title="Create & Assign New Task"
      >
        <div className="space-y-4 text-xs text-left">
          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Task Title *</label>
            <input
              type="text"
              value={taskForm.title}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="e.g. Dance Audition Video Upload"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Task Type</label>
              <CustomSelect
                value={taskForm.type}
                onChange={val => setTaskForm({ ...taskForm, type: val })}
                options={TASK_TYPE_OPTIONS}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Review Mode</label>
              <CustomSelect
                value={taskForm.reviewType}
                onChange={val => setTaskForm({ ...taskForm, reviewType: val })}
                options={REVIEW_MODE_OPTIONS}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Assignee / Submitter Name</label>
              <input
                type="text"
                value={taskForm.submitter}
                onChange={e => setTaskForm({ ...taskForm, submitter: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Max Score Points</label>
              <input
                type="text"
                value={taskForm.maxScore}
                onChange={e => setTaskForm({ ...taskForm, maxScore: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Task Guidelines & Requirements</label>
            <textarea
              rows={3}
              value={taskForm.description}
              onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Enter instructions regarding format, resolution, content rules..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
            />
          </div>

          <button
            onClick={handleCreateTask}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md mt-4 cursor-pointer"
          >
            Publish Task
          </button>
        </div>
      </RightDrawer>

      {/* 2. EDIT TASK DRAWER */}
      <RightDrawer
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        title={editingTask ? `Edit Task: ${editingTask.id || editingTask._id}` : 'Edit Task'}
      >
        {editingTask && (
          <div className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Task Title *</label>
              <input
                type="text"
                value={editingTask.title || ''}
                onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Task Type</label>
                <CustomSelect
                  value={editingTask.type || 'Video Upload'}
                  onChange={val => setEditingTask({ ...editingTask, type: val })}
                  options={TASK_TYPE_OPTIONS}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Review Mode</label>
                <CustomSelect
                  value={editingTask.reviewType || 'AI Review'}
                  onChange={val => setEditingTask({ ...editingTask, reviewType: val })}
                  options={REVIEW_MODE_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Submitter Name</label>
                <input
                  type="text"
                  value={editingTask.submitter || ''}
                  onChange={e => setEditingTask({ ...editingTask, submitter: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Max Score</label>
                <input
                  type="text"
                  value={editingTask.maxScore || '100'}
                  onChange={e => setEditingTask({ ...editingTask, maxScore: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Guidelines & Notes</label>
              <textarea
                rows={3}
                value={editingTask.description || ''}
                onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
              />
            </div>

            <button
              onClick={handleSaveEditTask}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md mt-4 cursor-pointer"
            >
              Save & Apply Changes
            </button>
          </div>
        )}
      </RightDrawer>

      {/* 3. SCORE ALLOCATION & MODERATION DRAWER */}
      <RightDrawer
        isOpen={Boolean(scoringTask)}
        onClose={() => setScoringTask(null)}
        title={scoringTask ? `Score & Moderation: ${scoringTask.id || scoringTask._id}` : 'Score Allocation'}
      >
        {scoringTask && (
          <div className="space-y-4 text-xs text-left">
            <div className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl space-y-1.5 border border-slate-200/60 dark:border-white/5">
              <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase">{scoringTask.id || scoringTask._id}</span>
              <strong className="text-slate-900 dark:text-white block font-bold text-sm">{scoringTask.title}</strong>
              <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
                <span>Submitter: <strong className="text-slate-700 dark:text-slate-200">{scoringTask.submitter}</strong></span>
                <span>Type: <strong className="text-slate-700 dark:text-slate-200">{scoringTask.type}</strong></span>
                <span>Reviewer: <strong className="text-slate-700 dark:text-slate-200">{scoringTask.reviewType}</strong></span>
              </div>
            </div>

            {scoringTask.reviewType === 'AI Review' && (
              <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-purple-400 uppercase flex items-center gap-1">
                  <Bot className="w-4 h-4" /> Automated AI Vision Analysis
                </span>
                <p className="text-[11px] text-slate-300">
                  AI Confidence Match: <strong>{scoringTask.aiConfidence || '98.5%'}</strong>. No content policy or plagiarism violations detected.
                </p>
              </div>
            )}

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                Allocate Score Points (Out of {scoringTask.maxScore || 100}) *
              </label>
              <input
                type="number"
                min="0"
                max={scoringTask.maxScore || 100}
                value={scoreInput}
                onChange={e => setScoreInput(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-mono text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Reviewer Feedback Notes</label>
              <textarea
                rows={3}
                value={feedbackInput}
                onChange={e => setFeedbackInput(e.target.value)}
                placeholder="Message sent to contestant regarding score & feedback..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <button
                onClick={handleScoreAndApprove}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Submission & Allocate Score
              </button>

              <button
                onClick={() => {
                  const target = scoringTask;
                  setScoringTask(null);
                  handleRejectTask(target);
                }}
                className="w-full py-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject Submission
              </button>
            </div>
          </div>
        )}
      </RightDrawer>

      {/* 4. SUBMISSION PREVIEW & SPECS DRAWER */}
      <RightDrawer
        isOpen={Boolean(previewMediaTask)}
        onClose={() => setPreviewMediaTask(null)}
        title={previewMediaTask ? `Submission Preview: ${previewMediaTask.id || previewMediaTask._id}` : 'Submission Preview'}
      >
        {previewMediaTask && (
          <div className="space-y-5 text-xs text-left">
            {/* Header info */}
            <div className="p-4 bg-slate-900 rounded-xl flex flex-col items-center justify-center min-h-[160px] text-center space-y-2 border border-white/10">
              {previewMediaTask.type === 'Video Upload' && <Video className="w-10 h-10 text-indigo-400 animate-pulse" />}
              {previewMediaTask.type === 'Photo Tasks' && <Camera className="w-10 h-10 text-pink-400" />}
              {previewMediaTask.type === 'Document Tasks' && <FileText className="w-10 h-10 text-blue-400" />}
              {previewMediaTask.type === 'Creative Tasks' && <Sparkles className="w-10 h-10 text-amber-400" />}

              <strong className="text-white text-sm block">{previewMediaTask.title}</strong>
              <p className="text-slate-400 text-[11px]">Submitted by {previewMediaTask.submitter} ({previewMediaTask.type})</p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Reviewer Mode</span>
                <strong className="text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1">
                  {previewMediaTask.reviewType === 'AI Review' ? <Bot className="w-3.5 h-3.5 text-purple-500" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-500" />}
                  {previewMediaTask.reviewType}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">AI Confidence</span>
                <strong className="text-purple-400 font-bold text-xs font-mono">{previewMediaTask.aiConfidence || 'N/A'}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Allocated Score</span>
                <strong className="text-emerald-500 font-bold text-xs font-mono">{previewMediaTask.score}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Current Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                  previewMediaTask.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                  previewMediaTask.status === 'Pending Review' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-rose-500/10 text-rose-500'
                }`}>
                  {previewMediaTask.status}
                </span>
              </div>
            </div>

            {/* Description & Feedback */}
            <div className="space-y-2 bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5">
              <strong className="block text-slate-800 dark:text-white font-bold">Guidelines & Submission Details:</strong>
              <p className="text-slate-600 dark:text-slate-300">{previewMediaTask.description || 'No additional submission notes provided.'}</p>
              {previewMediaTask.feedback && (
                <div className="pt-2 border-t border-slate-200 dark:border-white/5 mt-2">
                  <strong className="block text-emerald-500 font-bold">Moderator Feedback:</strong>
                  <p className="text-slate-500 dark:text-slate-400 italic">"{previewMediaTask.feedback}"</p>
                </div>
              )}
            </div>

            {/* Quick Actions Footer inside Drawer */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Actions</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const target = previewMediaTask;
                    setPreviewMediaTask(null);
                    setScoringTask(target);
                    setScoreInput(target.score !== 'Unscored' ? target.score.split('/')[0] : '90');
                    setFeedbackInput(target.feedback || '');
                  }}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Award className="w-4 h-4" /> Score & Approve
                </button>

                <button
                  onClick={() => {
                    const target = previewMediaTask;
                    setPreviewMediaTask(null);
                    setEditingTask(JSON.parse(JSON.stringify(target)));
                  }}
                  className="py-2.5 px-3 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" /> Edit Task
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleRejectTask(previewMediaTask)}
                  className="py-2 px-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> Reject Submission
                </button>

                <button
                  onClick={() => handleDeleteTask(previewMediaTask)}
                  className="py-2 px-3 bg-slate-500/10 text-slate-400 hover:bg-rose-500/20 hover:text-rose-500 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete Task
                </button>
              </div>
            </div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default TaskManagementPage;
