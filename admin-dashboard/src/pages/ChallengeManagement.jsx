import React, { useState } from 'react';
import {
  Gamepad2, Zap, Puzzle, Brain, Gauge, Sparkles, Plus, Play, Settings,
  Search, Filter, Edit, Trash2, Eye, ToggleLeft, ToggleRight, X
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const ChallengeManagement = () => {
  const { showSnackbar } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [viewingChallenge, setViewingChallenge] = useState(null);
  const [deletingChallenge, setDeletingChallenge] = useState(null);

  const [challenges, setChallenges] = useState([
    { id: 'CHL-01', title: 'Lightning Reflexes', category: 'Reaction Game', targetTime: '180ms', plays: '48.2K', difficulty: 'Easy', status: 'Active' },
    { id: 'CHL-02', title: 'Spatial Tile Align', category: 'Puzzle', targetTime: '45s', plays: '32.1K', difficulty: 'Medium', status: 'Active' },
    { id: 'CHL-03', title: 'Number Matrix Deduction', category: 'Logic', targetTime: '60s', plays: '19.4K', difficulty: 'Hard', status: 'Inactive' },
    { id: 'CHL-04', title: 'Rapid Tapper Rush', category: 'Speed', targetTime: '15s', plays: '89.0K', difficulty: 'Medium', status: 'Active' },
    { id: 'CHL-05', title: 'Card Flip Memory Grid', category: 'Memory', targetTime: '30s', plays: '55.3K', difficulty: 'Easy', status: 'Active' }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Reaction Game',
    targetTime: '30s',
    difficulty: 'Medium',
    status: 'Active'
  });

  const filteredChallenges = challenges.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleToggleStatus = (id) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
        showSnackbar(`Challenge ${c.title} is now ${nextStatus}`, 'info');
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleSaveAdd = () => {
    if (!formData.title) {
      showSnackbar('Please enter challenge title', 'warning');
      return;
    }
    const newChallenge = {
      id: `CHL-${Date.now().toString().slice(-4)}`,
      plays: '0K',
      ...formData
    };
    setChallenges([newChallenge, ...challenges]);
    showSnackbar('New Challenge Created!', 'success');
    setShowAddModal(false);
    setFormData({ title: '', category: 'Reaction Game', targetTime: '30s', difficulty: 'Medium', status: 'Active' });
  };

  const handleSaveEdit = () => {
    setChallenges(prev => prev.map(c => c.id === editingChallenge.id ? editingChallenge : c));
    showSnackbar(`Challenge ${editingChallenge.id} updated!`, 'success');
    setEditingChallenge(null);
  };

  const handleDelete = (id) => {
    setChallenges(prev => prev.filter(c => c.id !== id));
    showSnackbar(`Challenge ${id} deleted!`, 'success');
    setDeletingChallenge(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gamepad2 className="w-7 h-7 text-purple-500" /> Challenge Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Add, Edit, View, Delete, Toggle Active Status & Filter Mini Game Challenges.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold text-xs rounded-xl shadow hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" /> Add New Challenge
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search challenge title or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Category:</span>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-white">
              <option value="All">All Categories</option>
              <option value="Reaction Game">Reaction Game</option>
              <option value="Puzzle">Puzzle</option>
              <option value="Logic">Logic</option>
              <option value="Speed">Speed</option>
              <option value="Memory">Memory</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Status:</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-white">
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredChallenges.map(c => (
          <div key={c.id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded">
                {c.category}
              </span>
              <button
                onClick={() => handleToggleStatus(c.id)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'
                }`}
              >
                {c.status === 'Active' ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" /> : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />}
                {c.status}
              </button>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{c.title}</h3>
            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl">
              <div>Plays: <strong className="text-slate-800 dark:text-white">{c.plays}</strong></div>
              <div>Target: <strong className="text-purple-500">{c.targetTime}</strong></div>
              <div>Level: <strong className="text-slate-800 dark:text-white">{c.difficulty}</strong></div>
            </div>
            <div className="pt-1 flex items-center justify-between">
              <button onClick={() => showSnackbar(`Testing sandbox for ${c.title}`, 'info')} className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 text-white rounded-lg font-semibold text-xs hover:bg-purple-700">
                <Play className="w-3 h-3" /> Test
              </button>
              <div className="flex items-center gap-1">
                <button onClick={() => setViewingChallenge(c)} title="View Details" className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingChallenge(c)} title="Edit Challenge" className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeletingChallenge(c)} title="Delete Challenge" className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20">
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Challenge Game</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white">
                    <option value="Reaction Game">Reaction Game</option>
                    <option value="Puzzle">Puzzle</option>
                    <option value="Logic">Logic</option>
                    <option value="Speed">Speed</option>
                    <option value="Memory">Memory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Difficulty</label>
                  <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleSaveAdd} className="px-4 py-2 text-xs font-semibold bg-purple-600 text-white rounded-xl">Save Challenge</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit {editingChallenge.id}</h3>
              <button onClick={() => setEditingChallenge(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Title</label>
                <input type="text" value={editingChallenge.title} onChange={e => setEditingChallenge({...editingChallenge, title: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingChallenge(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 text-xs font-semibold bg-purple-600 text-white rounded-xl">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Challenge {viewingChallenge.id}</h3>
              <button onClick={() => setViewingChallenge(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p><strong>Title:</strong> {viewingChallenge.title}</p>
            <p><strong>Category:</strong> {viewingChallenge.category}</p>
            <p><strong>Target Time:</strong> {viewingChallenge.targetTime}</p>
            <p><strong>Total Plays:</strong> {viewingChallenge.plays}</p>
            <p><strong>Difficulty:</strong> {viewingChallenge.difficulty}</p>
            <p><strong>Status:</strong> {viewingChallenge.status}</p>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingChallenge(null)} className="px-4 py-2 font-semibold bg-purple-600 text-white rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-rose-500">Delete Challenge</h3>
            <p className="text-xs text-slate-400">Are you sure you want to delete <strong>{deletingChallenge.title}</strong>?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeletingChallenge(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={() => handleDelete(deletingChallenge.id)} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeManagement;
