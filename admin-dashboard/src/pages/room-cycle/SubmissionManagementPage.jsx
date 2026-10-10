import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Download, Search, RefreshCw, X, FileText, Eye, CheckCircle,
  ExternalLink, Image as ImageIcon, Video, File, Maximize2, Link as LinkIcon
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
  const [previewMediaUrl, setPreviewMediaUrl] = useState(null);

  const [reviewFormData, setReviewFormData] = useState({
    status: 'Approved',
    score: 100,
    bonus: 0,
    penalty: 0,
    feedback: ''
  });

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return url.startsWith('/') ? url : `/${url}`;
  };

  const isImageFile = (url) => {
    if (!url) return false;
    return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url) || url.startsWith('data:image/');
  };

  const isVideoFile = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(url);
  };

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

  const renderMediaPreviewBlock = (sub) => {
    const rawUrl = sub.mediaUrl || sub.files?.[0]?.url;
    const mediaUrl = getMediaUrl(rawUrl);

    if (!mediaUrl && !sub.content && !sub.proofNotes) {
      return <p className="text-xs text-slate-400 italic">No media proof attached.</p>;
    }

    return (
      <div className="space-y-3">
        {mediaUrl && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Uploaded Proof ({sub.submissionType || 'File'})
              </span>
              <a
                href={mediaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
              </a>
            </div>

            {isImageFile(mediaUrl) ? (
              <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                <img
                  src={mediaUrl}
                  alt="Submission Proof"
                  className="w-full max-h-64 object-contain rounded-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x200?text=Preview+Unavailable';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPreviewMediaUrl(mediaUrl)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5"
                >
                  <Maximize2 className="w-4 h-4" /> Click to View Full Image
                </button>
              </div>
            ) : isVideoFile(mediaUrl) ? (
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black">
                <video src={mediaUrl} controls className="w-full max-h-64 rounded-xl" />
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <File className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs">
                      {rawUrl.split('/').pop() || 'Attachment Document'}
                    </p>
                    <span className="text-[11px] text-slate-500">{sub.submissionType || 'Document'}</span>
                  </div>
                </div>
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        )}

        {(sub.content || sub.proofNotes) && (
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Text Notes / Answers</h5>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {sub.content || sub.proofNotes}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header matching RoomManagementPage */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Submission Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review member task submissions, inspect uploaded image/video proofs, assign scores/bonus/penalty, and provide feedback.
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
                  <th className="p-4">Proof / Upload</th>
                  <th className="p-4">Score / Final Pts</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {submissions.map((sub) => {
                  const mediaUrl = getMediaUrl(sub.mediaUrl || sub.files?.[0]?.url);
                  const isImg = isImageFile(mediaUrl);
                  const isVid = isVideoFile(mediaUrl);

                  return (
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
                        <span className="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400">{sub.taskId?.taskType || 'Quiz / Task'}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                        {sub.roomId?.name || 'Room'} {sub.roomId?.code ? `(${sub.roomId.code})` : ''}
                      </td>
                      <td className="p-4">
                        {mediaUrl ? (
                          <div className="flex items-center gap-2">
                            {isImg ? (
                              <button
                                type="button"
                                onClick={() => setPreviewMediaUrl(mediaUrl)}
                                className="relative group w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0"
                                title="Click to enlarge"
                              >
                                <img src={mediaUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Maximize2 className="w-3 h-3" />
                                </div>
                              </button>
                            ) : isVid ? (
                              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600">
                                <Video className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                <File className="w-4 h-4" />
                              </div>
                            )}
                            <div className="max-w-[140px]">
                              <a
                                href={mediaUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 truncate"
                              >
                                {sub.submissionType || 'View Proof'} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                              <p className="text-[11px] text-slate-500 truncate">{sub.proofNotes || sub.content || 'Uploaded file'}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-700 dark:text-slate-300 max-w-xs line-clamp-2">
                            {sub.content || sub.proofNotes || 'Text submission'}
                          </p>
                        )}
                      </td>
                      <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                        {sub.finalPoints || sub.score || 0} pts
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
                            title="View Submission Details & Proof"
                            className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setReviewFormData({
                                status: sub.status === 'Pending' ? 'Approved' : sub.status,
                                score: sub.score || sub.taskId?.points || 100,
                                bonus: sub.bonus || 0,
                                penalty: sub.penalty || 0,
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submission Full Details Drawer */}
      <RightDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        title={viewingSubmission ? `Submission: ${viewingSubmission.taskId?.title || 'Proof Details'}` : 'Submission Details'}
      >
        {viewingSubmission && (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold uppercase">Member: {viewingSubmission.userId?.name}</p>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-1">Task: {viewingSubmission.taskId?.title || 'Contest Task'}</h3>
              <p className="text-xs text-slate-500 mt-1">Room: {viewingSubmission.roomId?.name} ({viewingSubmission.roomId?.code || 'RM-001'})</p>
            </div>

            {/* Uploaded File Media Viewer */}
            {renderMediaPreviewBlock(viewingSubmission)}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">Awarded Score</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">+{viewingSubmission.score || 0} pts</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium block">Final Points</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{viewingSubmission.finalPoints || viewingSubmission.score || 0} pts</span>
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
              <p className="font-bold text-slate-900 dark:text-white">Task: {selectedSubmission.taskId?.title || 'Contest Task'}</p>
              <p className="text-slate-500">Submitted by: {selectedSubmission.userId?.name}</p>
            </div>

            {/* Proof Preview inside Review Drawer */}
            {renderMediaPreviewBlock(selectedSubmission)}

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

      {/* Fullscreen Media Lightbox Preview Modal */}
      {previewMediaUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewMediaUrl(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewMediaUrl} alt="Enlarged Proof" className="max-w-full max-h-[85vh] object-contain mx-auto rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionManagementPage;
