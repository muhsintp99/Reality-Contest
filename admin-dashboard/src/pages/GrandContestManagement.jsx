import React, { useState } from 'react';
import {
  Crown, Plus, Calendar, Clock, Percent, Award, Play, XCircle, CheckCircle2, Sliders, Shield,
  Search, Filter, Edit, Trash2, Eye, ToggleLeft, ToggleRight, X
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const GrandContestManagement = () => {
  const { showSnackbar } = useAlert();
  const [activeTab, setActiveTab] = useState('seasons');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [viewingSeason, setViewingSeason] = useState(null);
  const [deletingSeason, setDeletingSeason] = useState(null);

  const [seasons, setSeasons] = useState([
    { id: 'GS-2026-S1', name: 'Grand Talent Arena 2026', totalStages: 5, eliminationRate: '25%', passMarks: 75, timerSec: 60, status: 'Active', prizePool: '₹10,00,000' },
    { id: 'GS-2026-S2', name: 'Summer Idol Auditions', totalStages: 4, eliminationRate: '30%', passMarks: 80, timerSec: 45, status: 'Inactive', prizePool: '₹5,00,000' }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    totalStages: 5,
    eliminationRate: '20%',
    passMarks: 70,
    timerSec: 60,
    prizePool: '₹5,00,000',
    status: 'Active'
  });

  const filteredSeasons = seasons.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (id) => {
    setSeasons(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'Active' ? 'Inactive' : 'Active';
        showSnackbar(`Season ${s.name} is now ${nextStatus}`, 'info');
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const handleSaveAdd = () => {
    if (!formData.name) {
      showSnackbar('Please enter a season name', 'warning');
      return;
    }
    const newSeason = {
      id: `GS-2026-S${seasons.length + 1}`,
      ...formData
    };
    setSeasons([newSeason, ...seasons]);
    showSnackbar('New Grand Contest Season added successfully!', 'success');
    setShowAddModal(false);
    setFormData({ name: '', totalStages: 5, eliminationRate: '20%', passMarks: 70, timerSec: 60, prizePool: '₹5,00,000', status: 'Active' });
  };

  const handleSaveEdit = () => {
    setSeasons(prev => prev.map(s => s.id === editingSeason.id ? editingSeason : s));
    showSnackbar(`Season ${editingSeason.id} updated!`, 'success');
    setEditingSeason(null);
  };

  const handleDelete = (id) => {
    setSeasons(prev => prev.filter(s => s.id !== id));
    showSnackbar(`Season ${id} deleted successfully!`, 'success');
    setDeletingSeason(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Crown className="w-7 h-7 text-amber-500" /> Grand Contest Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Add, Edit, View, Delete, Filter & Toggle Active Status for Tournament Seasons.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brandPrimary text-white font-semibold text-xs rounded-xl shadow-lg hover:bg-brandPrimary/90 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Season
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search season by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs rounded-xl px-3 py-2 text-slate-800 dark:text-white"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Season Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSeasons.map(season => (
          <div key={season.id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                  {season.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{season.name}</h3>
              </div>
              <button
                onClick={() => handleToggleStatus(season.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  season.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}
              >
                {season.status === 'Active' ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                {season.status}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-white/5 p-3 rounded-xl text-xs">
              <div>
                <div className="text-slate-400 text-[10px]">Stages</div>
                <div className="font-bold text-slate-900 dark:text-white">{season.totalStages} Stages</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Elimination %</div>
                <div className="font-bold text-rose-500">{season.eliminationRate}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Qualify Mark</div>
                <div className="font-bold text-emerald-500">{season.passMarks} Pts</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Prize Pool</div>
                <div className="font-bold text-amber-500">{season.prizePool}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="font-medium text-slate-400">Timer: {season.timerSec}s</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setViewingSeason(season)} title="View Details" className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg font-semibold">
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingSeason(season)} title="Edit Season" className="p-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg font-semibold">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeletingSeason(season)} title="Delete Season" className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-lg font-semibold">
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Grand Season</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Season Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Winter Championship 2026" className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Total Stages</label>
                  <input type="number" value={formData.totalStages} onChange={e => setFormData({...formData, totalStages: Number(e.target.value)})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Prize Pool</label>
                  <input type="text" value={formData.prizePool} onChange={e => setFormData({...formData, prizePool: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleSaveAdd} className="px-4 py-2 text-xs font-semibold bg-brandPrimary text-white rounded-xl">Add Season</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSeason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit {editingSeason.id}</h3>
              <button onClick={() => setEditingSeason(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Season Name</label>
                <input type="text" value={editingSeason.name} onChange={e => setEditingSeason({...editingSeason, name: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Prize Pool</label>
                  <input type="text" value={editingSeason.prizePool} onChange={e => setEditingSeason({...editingSeason, prizePool: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Pass Marks</label>
                  <input type="number" value={editingSeason.passMarks} onChange={e => setEditingSeason({...editingSeason, passMarks: Number(e.target.value)})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingSeason(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 text-xs font-semibold bg-brandPrimary text-white rounded-xl">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingSeason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Details - {viewingSeason.name}</h3>
              <button onClick={() => setViewingSeason(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p><strong>ID:</strong> {viewingSeason.id}</p>
              <p><strong>Status:</strong> {viewingSeason.status}</p>
              <p><strong>Stages:</strong> {viewingSeason.totalStages}</p>
              <p><strong>Elimination Rate:</strong> {viewingSeason.eliminationRate}</p>
              <p><strong>Pass Marks:</strong> {viewingSeason.passMarks} Pts</p>
              <p><strong>Stage Timer:</strong> {viewingSeason.timerSec}s</p>
              <p><strong>Prize Pool:</strong> {viewingSeason.prizePool}</p>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingSeason(null)} className="px-4 py-2 text-xs font-semibold bg-brandPrimary text-white rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingSeason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-rose-500">Delete Season</h3>
            <p className="text-xs text-slate-400">Are you sure you want to delete <strong>{deletingSeason.name}</strong> ({deletingSeason.id})?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeletingSeason(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={() => handleDelete(deletingSeason.id)} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrandContestManagement;
