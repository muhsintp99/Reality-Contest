import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Search, Filter, RefreshCw, Eye, Edit3, Trash2, Copy, Sparkles, Layers, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';

export const GrandContestManagementPage = () => {
  const navigate = useNavigate();
  const { showSnackbar, showConfirm } = useAlert();

  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedContestDetail, setSelectedContestDetail] = useState(null);

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
            className="p-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-xl transition border border-slate-700/50"
            title="Refresh List"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/admin/grand-contests/wizard')}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20"
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
            onClick={() => navigate('/admin/grand-contests/wizard')}
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
                  <button
                    onClick={() => setSelectedContestDetail(contest)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/admin/grand-contests/wizard?edit=${contest._id || contest.contestId}`)}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                      title="Edit Grand Contest"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateContest(contest)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContest(contest)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
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

      {/* Details Modal */}
      {selectedContestDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400">{selectedContestDetail.contestId}</span>
                <h2 className="text-xl font-bold text-white">{selectedContestDetail.title}</h2>
              </div>
              <button
                onClick={() => setSelectedContestDetail(null)}
                className="text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-lg text-xs"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <p><strong className="text-white">Description:</strong> {selectedContestDetail.description}</p>
              {selectedContestDetail.rules && (
                <div>
                  <strong className="text-white block mb-1">Contest Rules:</strong>
                  <div className="p-3 bg-slate-950 rounded-xl text-xs whitespace-pre-line border border-slate-800">{selectedContestDetail.rules}</div>
                </div>
              )}
              {selectedContestDetail.guidelines && (
                <div>
                  <strong className="text-white block mb-1">Participation Guidelines:</strong>
                  <div className="p-3 bg-slate-950 rounded-xl text-xs whitespace-pre-line border border-slate-800">{selectedContestDetail.guidelines}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
                <div><strong className="text-white">Prize Pool:</strong> ₹{selectedContestDetail.prizePool}</div>
                <div><strong className="text-white">Duration (Days):</strong> {selectedContestDetail.durationDays || 7} Days</div>
                <div><strong className="text-white">Tasks Connected:</strong> {selectedContestDetail.tasksCount || (selectedContestDetail.tasks ? selectedContestDetail.tasks.length : 0)}</div>
                <div><strong className="text-white">Status:</strong> {selectedContestDetail.status}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrandContestManagementPage;
