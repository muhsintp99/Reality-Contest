import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  CheckSquare, Plus, Search, Trash2, Edit2, Eye, CheckCircle2, Clock, Bot, Upload, FileText, Image as ImageIcon, Video as VideoIcon
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { RightDrawer } from '../components/RightDrawer';
import { FileUploadPicker, uploadPendingFile } from '../components/FileUploadPicker';

const TASK_TYPE_OPTIONS = [
  { label: 'Quiz', value: 'Quiz' },
  { label: 'Creative', value: 'Creative' },
  { label: 'Photo', value: 'Photo' },
  { label: 'Video', value: 'Video' },
  { label: 'Document', value: 'Document' },
  { label: 'AI Prompt', value: 'AI Prompt' },
  { label: 'Puzzle', value: 'Puzzle' },
  { label: 'Logic', value: 'Logic' },
  { label: 'Survey', value: 'Survey' }
];

const SUBMISSION_TYPE_OPTIONS = [
  { label: 'Text', value: 'Text' },
  { label: 'Image', value: 'Image' },
  { label: 'Video', value: 'Video' },
  { label: 'PDF', value: 'PDF' },
  { label: 'Document', value: 'Document' },
  { label: 'URL', value: 'URL' },
  { label: 'ZIP', value: 'ZIP' }
];

const REVIEW_TYPE_OPTIONS = [
  { label: 'Manual', value: 'Manual' },
  { label: 'AI', value: 'AI' },
  { label: 'Auto', value: 'Auto' }
];

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'Draft' },
  { label: 'Published', value: 'Published' },
  { label: 'Running', value: 'Running' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Archived', value: 'Archived' }
];

export const TaskManagementPage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Drawers State
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTaskDetail, setViewingTaskDetail] = useState(null);

  // Tasks State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task Form State
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    instructions: '',
    mediaUrl: '',
    taskType: 'Quiz',
    submissionType: 'Text',
    reviewType: 'Manual',
    status: 'Draft',
    isMandatory: true,
    order: 1
  });

  useEffect(() => {
    fetchTasks();
  }, [isMockMode]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let res = await axios.get('/api/admin/tasks', { withCredentials: true }).catch(() => null);
      if (!res || !res.data?.success) {
        res = await axios.get('/api/admin/room-cycle/tasks', { withCredentials: true }).catch(() => null);
      }
      if (res?.data?.success) {
        const raw = res.data.data;
        const list = Array.isArray(raw?.tasks) ? raw.tasks : Array.isArray(raw) ? raw : [];
        setTasks(list);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      instructions: '',
      mediaUrl: '',
      taskType: 'Quiz',
      submissionType: 'Text',
      reviewType: 'Manual',
      status: 'Draft',
      isMandatory: true,
      order: 1
    });
  };

  // --- CREATE TASK ACTION ---
  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) {
      showSnackbar('Title is required', 'warning');
      return;
    }
    if (!taskForm.description.trim()) {
      showSnackbar('Description is required', 'warning');
      return;
    }

    try {
      const finalMediaUrl = await uploadPendingFile(taskForm.mediaUrl, 'tasks');
      const payload = { ...taskForm, mediaUrl: finalMediaUrl };

      let res = await axios.post('/api/admin/tasks', payload, { withCredentials: true }).catch(() => null);
      if (!res || !res.data?.success) {
        res = await axios.post('/api/admin/room-cycle/tasks', payload, { withCredentials: true }).catch(() => null);
      }
      showSnackbar(`Task "${taskForm.title}" created successfully!`, 'success');
      fetchTasks();
      setShowCreateDrawer(false);
      resetTaskForm();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to create task', 'error');
    }
  };

  // --- EDIT TASK ACTION ---
  const handleSaveEditTask = async () => {
    if (!editingTask || !editingTask.title.trim()) {
      showSnackbar('Title is required', 'warning');
      return;
    }

    const id = editingTask._id || editingTask.id;
    try {
      const finalMediaUrl = await uploadPendingFile(editingTask.mediaUrl, 'tasks');
      const payload = { ...editingTask, mediaUrl: finalMediaUrl };

      let res = await axios.put(`/api/admin/tasks/${id}`, payload, { withCredentials: true }).catch(() => null);
      if (!res || !res.data?.success) {
        await axios.put(`/api/admin/room-cycle/tasks/${id}`, payload, { withCredentials: true }).catch(() => null);
      }
      showSnackbar(`Task "${editingTask.title}" updated successfully!`, 'success');
      fetchTasks();
      setEditingTask(null);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to update task', 'error');
    }
  };

  // --- DELETE TASK ACTION ---
  const handleDeleteTask = (task) => {
    const id = task._id || task.id;
    showConfirm('Delete Task', `Are you sure you want to delete task "${task.title}"?`, async () => {
      try {
        let res = await axios.delete(`/api/admin/tasks/${id}`, { withCredentials: true }).catch(() => null);
        if (!res || !res.data?.success) {
          await axios.delete(`/api/admin/room-cycle/tasks/${id}`, { withCredentials: true }).catch(() => null);
        }
        showSnackbar(`Task deleted successfully`, 'success');
        fetchTasks();
      } catch (err) {
        showSnackbar(err.response?.data?.message || 'Failed to delete task', 'error');
      }
    });
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const searchMatch = !searchTerm || (t.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = typeFilter === 'All' || t.taskType === typeFilter;
      const statusMatch = statusFilter === 'All' || t.status === statusFilter;
      return searchMatch && typeMatch && statusMatch;
    });
  }, [tasks, searchTerm, typeFilter, statusFilter]);

  return (
    <div className="p-6 space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-emerald-500" /> Task Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Create, configure, upload media attachments, and manage system tasks.
          </p>
        </div>
        <button
          onClick={() => {
            resetTaskForm();
            setShowCreateDrawer(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Task
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Tasks</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{tasks.length}</div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Published</div>
            <div className="text-2xl font-extrabold text-emerald-500 mt-1">
              {tasks.filter(t => t.status === 'Published').length}
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Drafts</div>
            <div className="text-2xl font-extrabold text-amber-500 mt-1">
              {tasks.filter(t => t.status === 'Draft').length}
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Review</div>
            <div className="text-2xl font-extrabold text-purple-500 mt-1">
              {tasks.filter(t => t.reviewType === 'AI').length}
            </div>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <Bot className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <CustomSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'All', label: 'All Task Types' },
              ...TASK_TYPE_OPTIONS
            ]}
            className="w-44"
          />

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'All', label: 'All Statuses' },
              ...STATUS_OPTIONS
            ]}
            className="w-44"
          />
        </div>
      </div>

      {/* Datatable */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-white/10">
                <th className="p-3">#</th>
                <th className="p-3">Attachment</th>
                <th className="p-3">Title & Description</th>
                <th className="p-3">Task Type</th>
                <th className="p-3">Submission Type</th>
                <th className="p-3">Review Type</th>
                <th className="p-3">Mandatory</th>
                <th className="p-3">Order</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                [1, 2, 3, 4, 5].map((idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-3"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-4" /></td>
                    <td className="p-3"><div className="w-9 h-9 bg-slate-200 dark:bg-white/10 rounded-lg" /></td>
                    <td className="p-3 space-y-1.5">
                      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-44" />
                      <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-32" />
                    </td>
                    <td className="p-3"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-16" /></td>
                    <td className="p-3"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-16" /></td>
                    <td className="p-3"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-16" /></td>
                    <td className="p-3"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-10" /></td>
                    <td className="p-3"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-8" /></td>
                    <td className="p-3"><div className="h-5 bg-slate-200 dark:bg-white/10 rounded-full w-20" /></td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-7 h-7 bg-slate-200 dark:bg-white/10 rounded-lg" />
                        <div className="w-7 h-7 bg-slate-200 dark:bg-white/10 rounded-lg" />
                        <div className="w-7 h-7 bg-slate-200 dark:bg-white/10 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 text-xs">
                    No tasks found. Click "Create Task" to add a new task.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t, idx) => (
                  <tr key={t._id || t.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      {t.mediaUrl ? (
                        t.mediaUrl.startsWith('data:image/') || t.mediaUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)/i) ? (
                          <img src={t.mediaUrl} alt="Thumbnail" className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-white/10" />
                        ) : t.mediaUrl.startsWith('data:video/') || t.mediaUrl.match(/\.(mp4|webm|mov)/i) ? (
                          <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 inline-block" title="Video File">
                            <VideoIcon className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 inline-block" title="Document File">
                            <FileText className="w-4 h-4" />
                          </span>
                        )
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-[10px]">None</span>
                      )}
                    </td>
                    <td className="p-3 max-w-xs">
                      <span className="font-bold text-slate-900 dark:text-white block">{t.title}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{t.description}</span>
                    </td>
                    <td className="p-3 font-semibold text-emerald-500">{t.taskType}</td>
                    <td className="p-3 font-semibold text-indigo-500">{t.submissionType}</td>
                    <td className="p-3 font-semibold text-purple-500">{t.reviewType}</td>
                    <td className="p-3 font-semibold">
                      {t.isMandatory ? (
                        <span className="text-emerald-500 font-bold">Yes</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="p-3 font-bold">{t.order || 1}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                        t.status === 'Published' || t.status === 'Running'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : t.status === 'Draft'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingTaskDetail(t)}
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 cursor-pointer transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingTask(JSON.parse(JSON.stringify(t)))}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 cursor-pointer transition-all"
                          title="Edit Task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(t)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer transition-all"
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

      {/* 1. VIEW TASK DETAILS DRAWER */}
      <RightDrawer
        isOpen={Boolean(viewingTaskDetail)}
        onClose={() => setViewingTaskDetail(null)}
        title="Task Details 📋"
      >
        {viewingTaskDetail && (
          <div className="space-y-4 text-xs text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{viewingTaskDetail.title}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mt-1 inline-block">
                  {viewingTaskDetail.taskType}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white">
                {viewingTaskDetail.status}
              </span>
            </div>

            {/* Media File Attachment Preview */}
            {viewingTaskDetail.mediaUrl && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Attached Media / Reference File</div>
                {viewingTaskDetail.mediaUrl.startsWith('data:image/') || viewingTaskDetail.mediaUrl.match(/\.(jpg|jpeg|png|webp)/i) ? (
                  <img src={viewingTaskDetail.mediaUrl} alt="Attached Media" className="w-full max-h-48 rounded-xl object-cover border border-slate-200 dark:border-white/10" />
                ) : viewingTaskDetail.mediaUrl.startsWith('data:video/') || viewingTaskDetail.mediaUrl.match(/\.(mp4|webm)/i) ? (
                  <video src={viewingTaskDetail.mediaUrl} controls className="w-full max-h-48 rounded-xl border border-slate-200 dark:border-white/10" />
                ) : (
                  <a href={viewingTaskDetail.mediaUrl} download className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl font-bold text-xs inline-flex items-center gap-2 hover:bg-emerald-500/20 transition-all">
                    <FileText className="w-5 h-5" /> Download Attached Document
                  </a>
                )}
              </div>
            )}

            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl space-y-2 border border-slate-200 dark:border-white/10">
              <div className="flex justify-between"><span className="text-slate-400 font-bold">Submission Type:</span> <span>{viewingTaskDetail.submissionType}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-bold">Review Type:</span> <span>{viewingTaskDetail.reviewType}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-bold">Is Mandatory:</span> <span>{viewingTaskDetail.isMandatory ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-bold">Order:</span> <span>{viewingTaskDetail.order || 1}</span></div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Description</div>
              <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                {viewingTaskDetail.description}
              </p>
            </div>

            {viewingTaskDetail.instructions && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Instructions</div>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                  {viewingTaskDetail.instructions}
                </p>
              </div>
            )}
          </div>
        )}
      </RightDrawer>

      {/* 2. CREATE TASK DRAWER */}
      <RightDrawer
        isOpen={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
        title="Create Task 📝"
      >
        <div className="space-y-4 text-xs text-left">
          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Title *</label>
            <input
              type="text"
              value={taskForm.title}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="Task Title"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Description *</label>
            <textarea
              rows={2}
              value={taskForm.description}
              onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Task Description"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Instructions</label>
            <textarea
              rows={2}
              value={taskForm.instructions}
              onChange={e => setTaskForm({ ...taskForm, instructions: e.target.value })}
              placeholder="Task Instructions (Optional)"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
            />
          </div>

          {/* Media / File Upload Section */}
          <div>
            <FileUploadPicker
              label="Task Attachment / Image / Media Upload"
              accept="image/*,video/*,.pdf,.doc,.docx,.zip"
              value={taskForm.mediaUrl}
              onChange={(val) => setTaskForm({ ...taskForm, mediaUrl: val })}
              type={taskForm.submissionType === 'Video' ? 'video' : taskForm.submissionType === 'PDF' || taskForm.submissionType === 'Document' ? 'file' : 'image'}
              folder="tasks"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Task Type *</label>
              <CustomSelect
                value={taskForm.taskType}
                onChange={val => setTaskForm({ ...taskForm, taskType: val })}
                options={TASK_TYPE_OPTIONS}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Submission Type *</label>
              <CustomSelect
                value={taskForm.submissionType}
                onChange={val => setTaskForm({ ...taskForm, submissionType: val })}
                options={SUBMISSION_TYPE_OPTIONS}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Review Type</label>
              <CustomSelect
                value={taskForm.reviewType}
                onChange={val => setTaskForm({ ...taskForm, reviewType: val })}
                options={REVIEW_TYPE_OPTIONS}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Status</label>
              <CustomSelect
                value={taskForm.status}
                onChange={val => setTaskForm({ ...taskForm, status: val })}
                options={STATUS_OPTIONS}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center pt-2">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Order</label>
              <input
                type="number"
                value={taskForm.order}
                onChange={e => setTaskForm({ ...taskForm, order: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="isMandatory"
                checked={taskForm.isMandatory}
                onChange={e => setTaskForm({ ...taskForm, isMandatory: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="isMandatory" className="text-slate-800 dark:text-white font-bold cursor-pointer">
                Is Mandatory Task
              </label>
            </div>
          </div>

          <button
            onClick={handleCreateTask}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md mt-4 cursor-pointer"
          >
            Create Task
          </button>
        </div>
      </RightDrawer>

      {/* 3. EDIT TASK DRAWER */}
      <RightDrawer
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        title={editingTask ? `Edit Task: ${editingTask.title}` : 'Edit Task'}
      >
        {editingTask && (
          <div className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Title *</label>
              <input
                type="text"
                value={editingTask.title || ''}
                onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Description *</label>
              <textarea
                rows={2}
                value={editingTask.description || ''}
                onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Instructions</label>
              <textarea
                rows={2}
                value={editingTask.instructions || ''}
                onChange={e => setEditingTask({ ...editingTask, instructions: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
              />
            </div>

            {/* Media / File Upload Section in Edit Drawer */}
            <div>
              <FileUploadPicker
                label="Task Attachment / Image / Media Upload"
                accept="image/*,video/*,.pdf,.doc,.docx,.zip"
                value={editingTask.mediaUrl}
                onChange={(val) => setEditingTask({ ...editingTask, mediaUrl: val })}
                type={editingTask.submissionType === 'Video' ? 'video' : editingTask.submissionType === 'PDF' || editingTask.submissionType === 'Document' ? 'file' : 'image'}
                folder="tasks"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Task Type</label>
                <CustomSelect
                  value={editingTask.taskType || 'Quiz'}
                  onChange={val => setEditingTask({ ...editingTask, taskType: val })}
                  options={TASK_TYPE_OPTIONS}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Submission Type</label>
                <CustomSelect
                  value={editingTask.submissionType || 'Text'}
                  onChange={val => setEditingTask({ ...editingTask, submissionType: val })}
                  options={SUBMISSION_TYPE_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Review Type</label>
                <CustomSelect
                  value={editingTask.reviewType || 'Manual'}
                  onChange={val => setEditingTask({ ...editingTask, reviewType: val })}
                  options={REVIEW_TYPE_OPTIONS}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Status</label>
                <CustomSelect
                  value={editingTask.status || 'Draft'}
                  onChange={val => setEditingTask({ ...editingTask, status: val })}
                  options={STATUS_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center pt-2">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Order</label>
                <input
                  type="number"
                  value={editingTask.order ?? 1}
                  onChange={e => setEditingTask({ ...editingTask, order: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="editIsMandatory"
                  checked={editingTask.isMandatory !== false}
                  onChange={e => setEditingTask({ ...editingTask, isMandatory: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="editIsMandatory" className="text-slate-800 dark:text-white font-bold cursor-pointer">
                  Is Mandatory Task
                </label>
              </div>
            </div>

            <button
              onClick={handleSaveEditTask}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md mt-4 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default TaskManagementPage;
