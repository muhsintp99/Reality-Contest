import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Clock, Play, RefreshCw, X, Calendar, Sparkles, Eye, Edit3
} from 'lucide-react';
import axios from 'axios';
import { setCycles, setLoading } from '../../store/roomCycleSlice';
import { useAlert } from '../../context/AlertContext';
import { RightDrawer } from '../../components/RightDrawer';

export const CycleManagementPage = () => {
  const dispatch = useDispatch();
  const { showAlert, showConfirm, showSnackbar } = useAlert();
  const { cycles, loading } = useSelector((state) => state.roomCycle);

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  const [viewingCycle, setViewingCycle] = useState(null);

  const [cycleFormData, setCycleFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    autoStart: true,
    autoEnd: true,
    completionPercentage: 0
  });

  const fetchCycles = async () => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get('/api/admin/room-cycle/cycles');
      if (res.data?.success) {
        dispatch(setCycles(res.data.data));
      } else {
        dispatch(setCycles([]));
      }
    } catch (err) {
      console.error(err);
      dispatch(setCycles([]));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  const handleSetActiveCycle = (cycle) => {
    showConfirm('Activate Cycle', `Setting Cycle #${cycle.cycleNumber} as Active will complete any currently active cycle. Proceed?`, async () => {
      try {
        const res = await axios.put(`/api/admin/room-cycle/cycles/${cycle._id}/set-active`);
        if (res.data?.success) {
          showSnackbar(`Cycle #${cycle.cycleNumber} activated!`, 'success');
          fetchCycles();
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to update active cycle', 'error');
      }
    });
  };

  const handleEditCycle = async (e) => {
    e.preventDefault();
    if (!editingCycle) return;
    try {
      const res = await axios.put(`/api/admin/room-cycle/cycles/${editingCycle._id}`, cycleFormData);
      if (res.data?.success) {
        showSnackbar('Cycle details updated!', 'success');
        setIsEditDrawerOpen(false);
        fetchCycles();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to update cycle', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner matching RoomManagementPage */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">10-Cycle Blueprint Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            30-day competition divided into 10 3-day Cycles. Only ONE cycle can remain active at a time.
          </p>
        </div>
        <button
          onClick={fetchCycles}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Cycles
        </button>
      </div>

      {/* 10 Cycles Grid Cards matching RoomManagementPage */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading cycles...
        </div>
      ) : cycles.length === 0 ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="font-bold text-slate-700 dark:text-slate-300">No cycles initialized</p>
          <p className="text-xs mt-1">Click refresh to auto-generate the 10 bi-weekly cycles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {cycles.map((cycle) => (
            <div
              key={cycle._id}
              className={`relative rounded-2xl p-5 border transition-all shadow-sm ${
                cycle.status === 'Active'
                  ? 'bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-900 border-emerald-500 ring-2 ring-emerald-500/20'
                  : cycle.status === 'Completed'
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-90'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                    cycle.status === 'Active'
                      ? 'bg-emerald-600 text-white'
                      : cycle.status === 'Completed'
                      ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}
                >
                  #{cycle.cycleNumber}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    cycle.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse'
                      : cycle.status === 'Completed'
                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}
                >
                  {cycle.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{cycle.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Duration: 3 Days</p>

              {/* Progress bar */}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  <span>Progress</span>
                  <span>{cycle.completionPercentage || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${cycle.completionPercentage || 0}%` }}
                  />
                </div>
              </div>

              {/* Action buttons matching RoomManagementPage */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setViewingCycle(cycle);
                      setIsDetailsDrawerOpen(true);
                    }}
                    title="View Cycle Details"
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingCycle(cycle);
                      setCycleFormData({
                        title: cycle.title,
                        description: cycle.description || '',
                        startDate: cycle.startDate ? new Date(cycle.startDate).toISOString().split('T')[0] : '',
                        endDate: cycle.endDate ? new Date(cycle.endDate).toISOString().split('T')[0] : '',
                        autoStart: cycle.autoStart,
                        autoEnd: cycle.autoEnd,
                        completionPercentage: cycle.completionPercentage || 0
                      });
                      setIsEditDrawerOpen(true);
                    }}
                    title="Edit Cycle"
                    className="p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {cycle.status !== 'Active' && (
                  <button
                    onClick={() => handleSetActiveCycle(cycle)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current" /> Activate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cycle Full Details Drawer */}
      <RightDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        title={viewingCycle ? `Cycle #${viewingCycle.cycleNumber} Details` : 'Cycle Details'}
      >
        {viewingCycle && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold uppercase rounded-md">
                Cycle #{viewingCycle.cycleNumber}
              </span>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mt-2">{viewingCycle.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{viewingCycle.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">Start Date</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{viewingCycle.startDate ? new Date(viewingCycle.startDate).toLocaleDateString() : '—'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">End Date</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{viewingCycle.endDate ? new Date(viewingCycle.endDate).toLocaleDateString() : '—'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">Completion %</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{viewingCycle.completionPercentage || 0}%</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">Status</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{viewingCycle.status}</span>
              </div>
            </div>

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

      {/* Edit Cycle Drawer */}
      <RightDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        title={editingCycle ? `Edit Cycle #${editingCycle.cycleNumber}` : 'Edit Cycle'}
      >
        {editingCycle && (
          <form onSubmit={handleEditCycle} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cycle Title</label>
              <input
                type="text"
                required
                value={cycleFormData.title}
                onChange={(e) => setCycleFormData({ ...cycleFormData, title: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={cycleFormData.startDate}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={cycleFormData.endDate}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Completion %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={cycleFormData.completionPercentage}
                onChange={(e) => setCycleFormData({ ...cycleFormData, completionPercentage: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoStart"
                  checked={cycleFormData.autoStart}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, autoStart: e.target.checked })}
                />
                <label htmlFor="autoStart" className="text-xs text-slate-700 dark:text-slate-300">
                  Auto-Start on Start Date
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoEnd"
                  checked={cycleFormData.autoEnd}
                  onChange={(e) => setCycleFormData({ ...cycleFormData, autoEnd: e.target.checked })}
                />
                <label htmlFor="autoEnd" className="text-xs text-slate-700 dark:text-slate-300">
                  Auto-End on End Date & activate next cycle
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditDrawerOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </RightDrawer>
    </div>
  );
};

export default CycleManagementPage;
