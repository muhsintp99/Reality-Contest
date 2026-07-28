import React, { useState } from 'react';
import {
  ClipboardList, Plus, Target, Calendar, Gift, BarChart2,
  Users, CheckCircle2, Clock, Search, Filter, Edit, Trash2, Eye, ToggleLeft, ToggleRight, X
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const SurveyManagement = () => {
  const { showSnackbar } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [viewingSurvey, setViewingSurvey] = useState(null);
  const [deletingSurvey, setDeletingSurvey] = useState(null);

  const [surveys, setSurveys] = useState([
    { id: 'SRV-101', title: 'User Experience & Contest Feedback 2026', targetGroup: 'Active Contestants', responses: 412, reward: '50 Bonus Coins', status: 'Active', schedule: '27 Jul - 10 Aug' },
    { id: 'SRV-102', title: 'New Feature Interest Survey', targetGroup: 'All Registered Users', responses: 1280, reward: 'Free Contest Entry Ticket', status: 'Inactive', schedule: '01 Jul - 20 Jul' }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    targetGroup: 'All Registered Users',
    reward: '50 Bonus Coins',
    schedule: '27 Jul - 31 Aug',
    status: 'Active'
  });

  const filteredSurveys = surveys.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (id) => {
    setSurveys(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'Active' ? 'Inactive' : 'Active';
        showSnackbar(`Survey ${s.id} is now ${nextStatus}`, 'info');
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const handleSaveAdd = () => {
    if (!formData.title) {
      showSnackbar('Please enter survey title', 'warning');
      return;
    }
    const newSurvey = {
      id: `SRV-${Date.now().toString().slice(-4)}`,
      responses: 0,
      ...formData
    };
    setSurveys([newSurvey, ...surveys]);
    showSnackbar('New Survey created!', 'success');
    setShowAddModal(false);
    setFormData({ title: '', targetGroup: 'All Registered Users', reward: '50 Bonus Coins', schedule: '27 Jul - 31 Aug', status: 'Active' });
  };

  const handleSaveEdit = () => {
    setSurveys(prev => prev.map(s => s.id === editingSurvey.id ? editingSurvey : s));
    showSnackbar(`Survey ${editingSurvey.id} updated!`, 'success');
    setEditingSurvey(null);
  };

  const handleDelete = (id) => {
    setSurveys(prev => prev.filter(s => s.id !== id));
    showSnackbar(`Survey ${id} deleted!`, 'success');
    setDeletingSurvey(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-indigo-500" /> Survey Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Add, Edit, View Details, Delete, Toggle Active Status, Search & Filter User Surveys.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Add Survey
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search survey title or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Status:</span>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs rounded-xl px-3 py-2 text-slate-800 dark:text-white">
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Survey Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSurveys.map(srv => (
          <div key={srv.id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">
                  {srv.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{srv.title}</h3>
              </div>
              <button
                onClick={() => handleToggleStatus(srv.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  srv.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}
              >
                {srv.status === 'Active' ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" /> : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />}
                {srv.status}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-white/5 p-3 rounded-xl text-xs">
              <div>
                <div className="text-slate-400 text-[10px]">Target Audience</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{srv.targetGroup}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Responses</div>
                <div className="font-bold text-indigo-500">{srv.responses.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Reward</div>
                <div className="font-bold text-emerald-500">{srv.reward}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-slate-400 text-[11px]">Schedule: <strong>{srv.schedule}</strong></span>
              <div className="flex items-center gap-1">
                <button onClick={() => setViewingSurvey(srv)} title="View Details" className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingSurvey(srv)} title="Edit Survey" className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeletingSurvey(srv)} title="Delete Survey" className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Survey</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Survey Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Target Audience</label>
                  <input type="text" value={formData.targetGroup} onChange={e => setFormData({...formData, targetGroup: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Completion Reward</label>
                  <input type="text" value={formData.reward} onChange={e => setFormData({...formData, reward: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleSaveAdd} className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl">Save Survey</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit {editingSurvey.id}</h3>
              <button onClick={() => setEditingSurvey(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Title</label>
                <input type="text" value={editingSurvey.title} onChange={e => setEditingSurvey({...editingSurvey, title: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Target Group</label>
                  <input type="text" value={editingSurvey.targetGroup} onChange={e => setEditingSurvey({...editingSurvey, targetGroup: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Reward</label>
                  <input type="text" value={editingSurvey.reward} onChange={e => setEditingSurvey({...editingSurvey, reward: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingSurvey(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Survey {viewingSurvey.id}</h3>
              <button onClick={() => setViewingSurvey(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p><strong>Title:</strong> {viewingSurvey.title}</p>
            <p><strong>Target Group:</strong> {viewingSurvey.targetGroup}</p>
            <p><strong>Responses:</strong> {viewingSurvey.responses}</p>
            <p><strong>Reward:</strong> {viewingSurvey.reward}</p>
            <p><strong>Schedule:</strong> {viewingSurvey.schedule}</p>
            <p><strong>Status:</strong> {viewingSurvey.status}</p>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingSurvey(null)} className="px-4 py-2 font-semibold bg-indigo-600 text-white rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-rose-500">Delete Survey</h3>
            <p className="text-xs text-slate-400">Are you sure you want to delete survey <strong>{deletingSurvey.id}</strong>?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeletingSurvey(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={() => handleDelete(deletingSurvey.id)} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyManagement;
