import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Download, Search, RefreshCw, X, FileText, Eye, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { setSubmissions, setLoading } from '../../store/roomCycleSlice';
import { useAlert } from '../../context/AlertContext';
import { RightDrawer } from '../../components/RightDrawer';
import { CustomSelect } from '../../components/CustomSelect';

export const SubmissionManagementPage = () => {
  const dispatch = useDispatch();
  const { showAlert, showConfirm, showSnackbar } = useAlert();
  const { submissions, cycles, rooms, loading } = useSelector((state) => state.roomCycle);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [selectedCycle, setSelectedCycle] = useState('All');
  const [page, setPage] = useState(1);

  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [viewingSubmission, setViewingSubmission] = useState(null);

  const [reviewFormData, setReviewFormData] = useState({
    status: 'Approved',
    score: 100,
    bonus: 0,
    penalty: 0,
    feedback: ''
  });

  const fetchSubmissions = async () => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get('/api/admin/room-cycle/submissions', {
        params: { search, status: selectedStatus, cycleId: selectedCycle, page, limit: 10 }
      });
      if (res.data?.success) {
        dispatch(setSubmissions(res.data.data));
      } else {
        dispatch(setSubmissions({ submissions: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } }));
      }
    } catch (err) {
      console.error(err);
      dispatch(setSubmissions({ submissions: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [search, selectedStatus, selectedCycle, page]);

  const handleReviewSubmission = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    try {
      const res = await axios.put(`/api/admin/room-cycle/submissions/${selectedSubmission._id}/review`, reviewFormData);
      if (res.data?.success) {
        showSnackbar(`Submission ${reviewFormData.status.toLowerCase()}!`, 'success');
        setIsReviewDrawerOpen(false);
        fetchSubmissions();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Review failed', 'error');
    }
  };

  const exportSubmissions = () => {
    if (!submissions.length) {
      showAlert('No submissions to export', 'info');
      return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(submissions, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `room_cycle_submissions_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Header matching RoomManagementPage */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Submission Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review member task submissions, assign scores/bonus/penalty, provide feedback, and export evaluation reports.
          </p>
        </div>
        <button
          onClick={exportSubmissions}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <Download className="w-4 h-4" /> Export Submissions (JSON)
        </button>
      </div>

      {/* Filters matching RoomManagementPage */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search member name or task..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <CustomSelect
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Pending', label: 'Pending Review ⏳' },
              { value: 'Approved', label: 'Approved ✅' },
              { value: 'Rejected', label: 'Rejected ❌' },
              { value: 'Resubmit_Requested', label: 'Resubmit Requested 🔄' }
            ]}
            className="w-52"
          />
        </div>
      </div>

      {/* Datatable matching RoomManagementPage */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No submissions found</p>
            <p className="text-xs mt-1">User task submissions will appear here for admin review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Member</th>
                  <th className="p-4">Task</th>
                  <th className="p-4">Room</th>
                  <th className="p-4">Submission Content</th>
                  <th className="p-4">Score / Final Pts</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                          {sub.userId?.name ? sub.userId.name.slice(0, 2) : 'US'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{sub.userId?.name || 'Member'}</span>
                          <p className="text-xs text-slate-500">{sub.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{sub.taskId?.title || 'Task'}</span>
                      <span className="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400">{sub.taskId?.taskType}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {sub.roomId?.name || 'Room'} ({sub.roomId?.code})
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-slate-700 dark:text-slate-300 max-w-xs line-clamp-2">{sub.content || 'File upload'}</p>
                    </td>
                    <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {sub.finalPoints || 0} pts
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          sub.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : sub.status === 'Rejected'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : sub.status === 'Resubmit_Requested'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setViewingSubmission(sub);
                            setIsDetailsDrawerOpen(true);
                          }}
                          title="View Submission Details"
                          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setReviewFormData({
                              status: 'Approved',
                              score: sub.taskId?.points || 100,
                              bonus: 0,
                              penalty: 0,
                              feedback: sub.feedback || ''
                            });
                            setIsReviewDrawerOpen(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                        >
                          Review
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

      {/* Submission Full Details Drawer */}
      <RightDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        title={viewingSubmission ? `Submission: ${viewingSubmission.taskId?.title}` : 'Submission Details'}
      >
        {viewingSubmission && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold uppercase">Member: {viewingSubmission.userId?.name}</p>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-1">Task: {viewingSubmission.taskId?.title}</h3>
              <p className="text-xs text-slate-500 mt-1">Room: {viewingSubmission.roomId?.name} ({viewingSubmission.roomId?.code})</p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Submitted Content</h4>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {viewingSubmission.content || 'File Submission Attachment'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">Awarded Score</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">+{viewingSubmission.score || 0} pts</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">Final Points</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{viewingSubmission.finalPoints || 0} pts</span>
              </div>
            </div>

            {viewingSubmission.feedback && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Admin Feedback</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  {viewingSubmission.feedback}
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

      {/* Review Submission Drawer */}
      <RightDrawer
        isOpen={isReviewDrawerOpen}
        onClose={() => setIsReviewDrawerOpen(false)}
        title="Review Task Submission"
      >
        {selectedSubmission && (
          <form onSubmit={handleReviewSubmission} className="space-y-4">
            <div className="p-3 bg-[#E2F1D5]/50 dark:bg-slate-900 rounded-xl text-xs space-y-1 border border-[#C4E2A8]/60 dark:border-slate-800">
              <p className="font-bold text-slate-900 dark:text-white">Task: {selectedSubmission.taskId?.title}</p>
              <p className="text-slate-500">Submitted by: {selectedSubmission.userId?.name}</p>
              <p className="text-slate-700 dark:text-slate-300 mt-2 font-mono text-[11px] bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                {selectedSubmission.content || 'File Attachment Submission'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Decision</label>
              <CustomSelect
                value={reviewFormData.status}
                onChange={(val) => setReviewFormData({ ...reviewFormData, status: val })}
                options={[
                  { value: 'Approved', label: 'Approve ✅' },
                  { value: 'Rejected', label: 'Reject ❌' },
                  { value: 'Resubmit_Requested', label: 'Request Resubmission 🔄' }
                ]}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Base Score</label>
                <input
                  type="number"
                  min={0}
                  value={reviewFormData.score}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, score: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bonus</label>
                <input
                  type="number"
                  min={0}
                  value={reviewFormData.bonus}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, bonus: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Penalty</label>
                <input
                  type="number"
                  min={0}
                  value={reviewFormData.penalty}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, penalty: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Admin Feedback</label>
              <textarea
                rows={3}
                value={reviewFormData.feedback}
                onChange={(e) => setReviewFormData({ ...reviewFormData, feedback: e.target.value })}
                placeholder="Feedback comments for member..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsReviewDrawerOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
              >
                Submit Review
              </button>
            </div>
          </form>
        )}
      </RightDrawer>
    </div>
  );
};

export default SubmissionManagementPage;
