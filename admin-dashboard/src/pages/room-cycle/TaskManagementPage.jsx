import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Plus, Search, Edit3, Trash2, CheckSquare, RefreshCw, Eye, Filter
} from 'lucide-react';
import axios from 'axios';
import { setTasks, setLoading } from '../../store/roomCycleSlice';
import { useAlert } from '../../context/AlertContext';
import { RightDrawer } from '../../components/RightDrawer';
import { CustomSelect } from '../../components/CustomSelect';

const TASK_TYPES = [
  'Quiz',
  'Image Upload',
  'Video Upload',
  'Document Upload',
  'Creative Writing',
  'AI Prompt',
  'Survey',
  'Puzzle',
  'Logic Challenge',
  'Daily Activity'
];

export const TaskManagementPage = () => {
  const dispatch = useDispatch();
  const { showAlert, showConfirm, showSnackbar } = useAlert();
  const { tasks, cycles, loading } = useSelector((state) => state.roomCycle);

  const [search, setSearch] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [page, setPage] = useState(1);

  // Drawers
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    cycleId: '',
    taskType: 'Quiz',
    points: 100,
    bonusPoints: 20,
    penalty: 10,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reviewType: 'Manual',
    visibility: 'Public',
    allowDuplicateSubmission: false
  });

  const fetchTasks = async () => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get('/api/admin/room-cycle/tasks', {
        params: { search, cycleId: selectedCycle, taskType: selectedType, page, limit: 10 }
      });
      if (res.data?.success) {
        dispatch(setTasks(res.data.data));
      } else {
        dispatch(setTasks({ tasks: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } }));
      }
    } catch (err) {
      console.error(err);
      dispatch(setTasks({ tasks: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, selectedCycle, selectedType, page]);

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTaskId) {
        await axios.put(`/api/admin/room-cycle/tasks/${editingTaskId}`, taskFormData);
        showSnackbar('Task updated successfully!', 'success');
      } else {
        await axios.post('/api/admin/room-cycle/tasks', taskFormData);
        showSnackbar('Task created successfully!', 'success');
      }
      setIsTaskDrawerOpen(false);
      fetchTasks();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to save task', 'error');
    }
  };

  const handleDeleteTaskClick = (task) => {
    showConfirm('Delete Task', `Are you sure you want to permanently delete task "${task.title}"?`, async () => {
      try {
        await axios.delete(`/api/admin/room-cycle/tasks/${task._id}`);
        showSnackbar(`Task "${task.title}" deleted!`, 'success');
        fetchTasks();
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to delete task', 'error');
      }
    });
  };

  const taskTypeOptions = [
    { value: 'All', label: 'All Task Types' },
    ...TASK_TYPES.map((t) => ({ value: t, label: t }))
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls matching RoomManagementPage */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Task Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create, view details, update, delete, and configure cycle tasks supporting 10 task types.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTaskId(null);
            setTaskFormData({
              title: '',
              description: '',
              instructions: '',
              cycleId: cycles[0]?._id || '',
              taskType: 'Quiz',
              points: 100,
              bonusPoints: 20,
              penalty: 10,
              deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              reviewType: 'Manual',
              visibility: 'Public',
              allowDuplicateSubmission: false
            });
            setIsTaskDrawerOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Create New Task
        </button>
      </div>

      {/* Filters matching RoomManagementPage */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <CustomSelect
            value={selectedType}
            onChange={setSelectedType}
            options={taskTypeOptions}
            className="w-52"
          />
        </div>
      </div>

      {/* Task List Datatable matching RoomManagementPage */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <CheckSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No tasks created yet</p>
            <p className="text-xs mt-1">Click "Create New Task" to configure tasks for room cycles.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Task Details</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Cycle</th>
                  <th className="p-4">Points / Bonus / Penalty</th>
                  <th className="p-4">Review Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-900 dark:text-white">{task.title}</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{task.description}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-full text-xs font-bold">
                        {task.taskType}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {task.cycleId?.title || `Cycle ${task.cycleId?.cycleNumber || 1}`}
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-semibold space-x-2">
                        <span className="text-emerald-600 dark:text-emerald-400">+{task.points} pts</span>
                        <span className="text-amber-600 dark:text-amber-400">+{task.bonusPoints} bonus</span>
                        <span className="text-red-500">-{task.penalty} pen</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {task.reviewType === 'Auto' ? '⚡ Automatic' : '🔍 Manual'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          task.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setViewingTask(task);
                            setIsDetailsDrawerOpen(true);
                          }}
                          title="View Full Task Details"
                          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTaskId(task._id);
                            setTaskFormData({
                              title: task.title,
                              description: task.description,
                              instructions: task.instructions || '',
                              cycleId: task.cycleId?._id || task.cycleId,
                              taskType: task.taskType,
                              points: task.points,
                              bonusPoints: task.bonusPoints || 0,
                              penalty: task.penalty || 0,
                              deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
                              reviewType: task.reviewType,
                              visibility: task.visibility || 'Public',
                              allowDuplicateSubmission: task.allowDuplicateSubmission || false
                            });
                            setIsTaskDrawerOpen(true);
                          }}
                          title="Edit Task"
                          className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTaskClick(task)}
                          title="Delete Task"
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Full Details Drawer */}
      <RightDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        title={viewingTask ? `Task Details: ${viewingTask.title}` : 'Task Details'}
      >
        {viewingTask && (
          <div className="space-y-6">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-200 dark:border-indigo-800">
              <span className="px-2.5 py-0.5 bg-indigo-600 text-white text-[10px] font-extrabold uppercase rounded-md">
                {viewingTask.taskType}
              </span>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mt-2">{viewingTask.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{viewingTask.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">Base Points</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">+{viewingTask.points} pts</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">Bonus Points</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">+{viewingTask.bonusPoints || 0} bonus</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">Penalty</span>
                <span className="font-bold text-red-500 text-sm">-{viewingTask.penalty || 0} pen</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">Review Type</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{viewingTask.reviewType === 'Auto' ? '⚡ Auto' : '🔍 Manual Admin'}</span>
              </div>
            </div>

            {viewingTask.instructions && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Submission Instructions</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  {viewingTask.instructions}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsDetailsDrawerOpen(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </RightDrawer>

      {/* Task Creation / Edit Drawer */}
      <RightDrawer
        isOpen={isTaskDrawerOpen}
        onClose={() => setIsTaskDrawerOpen(false)}
        title={editingTaskId ? 'Edit Task' : 'Create New Task'}
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
            <input
              type="text"
              required
              value={taskFormData.title}
              onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Type</label>
              <CustomSelect
                value={taskFormData.taskType}
                onChange={(val) => setTaskFormData({ ...taskFormData, taskType: val })}
                options={TASK_TYPES.map((t) => ({ value: t, label: t }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cycle</label>
              <CustomSelect
                value={taskFormData.cycleId}
                onChange={(val) => setTaskFormData({ ...taskFormData, cycleId: val })}
                options={cycles.map((c) => ({ value: c._id, label: `Cycle ${c.cycleNumber}: ${c.title}` }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={taskFormData.description}
              onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Base Points</label>
              <input
                type="number"
                min={0}
                value={taskFormData.points}
                onChange={(e) => setTaskFormData({ ...taskFormData, points: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bonus Points</label>
              <input
                type="number"
                min={0}
                value={taskFormData.bonusPoints}
                onChange={(e) => setTaskFormData({ ...taskFormData, bonusPoints: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Penalty</label>
              <input
                type="number"
                min={0}
                value={taskFormData.penalty}
                onChange={(e) => setTaskFormData({ ...taskFormData, penalty: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Review Type</label>
              <CustomSelect
                value={taskFormData.reviewType}
                onChange={(val) => setTaskFormData({ ...taskFormData, reviewType: val })}
                options={[
                  { value: 'Manual', label: 'Manual Admin Review' },
                  { value: 'Auto', label: 'Automatic Evaluation' }
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
              <input
                type="date"
                required
                value={taskFormData.deadline}
                onChange={(e) => setTaskFormData({ ...taskFormData, deadline: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsTaskDrawerOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
            >
              Save Task
            </button>
          </div>
        </form>
      </RightDrawer>
    </div>
  );
};

export default TaskManagementPage;
