import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Gamepad2, Zap, Puzzle, Brain, Gauge, Sparkles, Plus, Play, Settings,
  Search, Filter, Edit, Trash2, Eye, ToggleLeft, ToggleRight, X, Sliders, CheckCircle2, Trophy
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { RightDrawer } from '../components/RightDrawer';

const CHALLENGE_CATEGORIES = [
  { label: 'Reaction Game', value: 'Reaction Game' },
  { label: 'Puzzle', value: 'Puzzle' },
  { label: 'Logic', value: 'Logic' },
  { label: 'Speed', value: 'Speed' },
  { label: 'Memory', value: 'Memory' }
];

const DIFFICULTY_OPTIONS = [
  { label: 'Easy', value: 'Easy' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Hard', value: 'Hard' },
  { label: 'Expert', value: 'Expert' }
];

export const ChallengeManagement = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Drawers
  const [showBuilderDrawer, setShowCreateDrawer] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [viewingChallenge, setViewingChallenge] = useState(null);
  const [testingChallenge, setTestingChallenge] = useState(null);

  // Initial State initialized to [] (No dummy data)
  const [challenges, setChallenges] = useState([]);

  // Custom Challenge Builder Form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Reaction Game',
    difficulty: 'Medium',
    targetTime: '30s',
    gridSize: '4x4',
    penaltySeconds: '2',
    status: 'Active'
  });

  useEffect(() => {
    fetchChallenges();
  }, [isMockMode]);

  const fetchChallenges = async () => {
    if (isMockMode) return;
    try {
      const res = await axios.get('/api/admin/challenges', { withCredentials: true });
      if (res.data.success && Array.isArray(res.data.data)) {
        setChallenges(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching challenges from backend API:', err);
    }
  };

  const handleToggleStatus = async (id) => {
    const target = challenges.find(c => c.id === id || c._id === id);
    if (!target) return;
    const nextStatus = target.status === 'Active' ? 'Inactive' : 'Active';

    if (!isMockMode) {
      try {
        await axios.patch(`/api/admin/challenges/${target._id || id}/status`, {}, { withCredentials: true });
      } catch (err) {
        console.error('Error toggling challenge status via API:', err);
      }
    }

    setChallenges(prev => prev.map(c => (c.id === id || c._id === id) ? { ...c, status: nextStatus } : c));
    showSnackbar(`Challenge ${target.title} is now ${nextStatus}`, 'info');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Reaction Game',
      difficulty: 'Medium',
      targetTime: '30s',
      gridSize: '4x4',
      penaltySeconds: '2',
      status: 'Active'
    });
  };

  const handleSaveAdd = async () => {
    if (!formData.title.trim()) {
      showSnackbar('Please enter challenge title', 'warning');
      return;
    }

    const newChallenge = {
      id: `CHL-${Date.now().toString().slice(-4)}`,
      _id: `chl-${Date.now()}`,
      plays: '0',
      ...formData
    };

    if (!isMockMode) {
      try {
        const res = await axios.post('/api/admin/challenges', newChallenge, { withCredentials: true });
        if (res.data.data) {
          newChallenge._id = res.data.data._id || res.data.data.id;
        }
      } catch (err) {
        console.error('Error creating challenge via API:', err);
      }
    }

    setChallenges(prev => [newChallenge, ...prev]);
    showSnackbar('Custom Challenge built and published!', 'success');
    setShowCreateDrawer(false);
    resetForm();
  };

  const handleSaveEdit = async () => {
    if (!editingChallenge.title.trim()) {
      showSnackbar('Challenge title cannot be empty.', 'warning');
      return;
    }

    if (!isMockMode) {
      try {
        await axios.put(`/api/admin/challenges/${editingChallenge._id || editingChallenge.id}`, editingChallenge, { withCredentials: true });
      } catch (err) {
        console.error('Error updating challenge via API:', err);
      }
    }

    setChallenges(prev => prev.map(c => (c.id === editingChallenge.id || c._id === editingChallenge._id) ? editingChallenge : c));
    showSnackbar(`Challenge ${editingChallenge.id || editingChallenge._id} updated!`, 'success');
    setEditingChallenge(null);
  };

  const handleDelete = (c) => {
    showConfirm('Delete Challenge', `Are you sure you want to delete challenge "${c.title}"?`, async () => {
      if (!isMockMode) {
        try {
          await axios.delete(`/api/admin/challenges/${c._id || c.id}`, { withCredentials: true });
        } catch (err) {
          console.error('Error deleting challenge via API:', err);
        }
      }
      setChallenges(prev => prev.filter(item => (item.id !== c.id && item._id !== c._id)));
      showSnackbar(`Challenge deleted.`, 'success');
    });
  };

  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || c.title.toLowerCase().includes(q) || (c.id && c.id.toLowerCase().includes(q));

      let matchesTab = true;
      if (activeTab === 'reaction') matchesTab = c.category === 'Reaction Game';
      else if (activeTab === 'puzzle') matchesTab = c.category === 'Puzzle';
      else if (activeTab === 'logic') matchesTab = c.category === 'Logic';
      else if (activeTab === 'speed') matchesTab = c.category === 'Speed';
      else if (activeTab === 'memory') matchesTab = c.category === 'Memory';

      const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

      return matchesSearch && matchesTab && matchesCat && matchesStatus;
    });
  }, [challenges, searchTerm, activeTab, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2.5">
            <Gamepad2 className="w-6 h-6 text-purple-500" />
            Mini Game Challenge Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Build and configure Reaction, Puzzle, Logic, Speed, and Memory challenges with custom rule configurations.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowCreateDrawer(true); }}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Custom Challenge Builder</span>
        </button>
      </div>

      {/* Sub-Tabs matching spec */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'all', label: 'All Challenges', icon: Gamepad2 },
          { id: 'reaction', label: 'Reaction Game', icon: Zap },
          { id: 'puzzle', label: 'Puzzle', icon: Puzzle },
          { id: 'logic', label: 'Logic', icon: Brain },
          { id: 'speed', label: 'Speed', icon: Gauge },
          { id: 'memory', label: 'Memory', icon: Sparkles },
          { id: 'builder', label: 'Custom Challenge Builder', icon: Sliders }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'builder') {
                  resetForm();
                  setShowCreateDrawer(true);
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search challenge title or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <CustomSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { label: 'All Categories', value: 'All' },
              ...CHALLENGE_CATEGORIES
            ]}
            className="w-44"
          />

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Statuses', value: 'All' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' }
            ]}
            className="w-40"
          />
        </div>
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filteredChallenges.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 text-xs">
            No mini game challenges match your search or filter criteria.
          </div>
        ) : (
          filteredChallenges.map(c => (
            <div key={c.id || c._id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3 hover:border-purple-500/30 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded">
                    {c.category}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(c.id || c._id)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'
                    }`}
                  >
                    {c.status === 'Active' ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" /> : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{c.status}</span>
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">{c.title}</h3>
                {c.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{c.description}</p>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl">
                  <div>Plays: <strong className="text-slate-800 dark:text-white">{c.plays || '0'}</strong></div>
                  <div>Target: <strong className="text-purple-500 font-mono">{c.targetTime || '30s'}</strong></div>
                  <div>Level: <strong className="text-slate-800 dark:text-white">{c.difficulty || 'Medium'}</strong></div>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => setTestingChallenge(c)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" /> Test Play
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewingChallenge(c)} title="View Specs" className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 cursor-pointer">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingChallenge(c)} title="Edit Challenge" className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 cursor-pointer">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c)} title="Delete Challenge" className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CUSTOM CHALLENGE BUILDER DRAWER */}
      <RightDrawer
        isOpen={showBuilderDrawer}
        onClose={() => setShowCreateDrawer(false)}
        title="Custom Challenge Builder"
      >
        <div className="space-y-4 text-xs text-left">
          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Challenge Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Speed Reaction Grid Test"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Instructions and target goals for players..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Challenge Category</label>
              <CustomSelect
                value={formData.category}
                onChange={val => setFormData({ ...formData, category: val })}
                options={CHALLENGE_CATEGORIES}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Difficulty Level</label>
              <CustomSelect
                value={formData.difficulty}
                onChange={val => setFormData({ ...formData, difficulty: val })}
                options={DIFFICULTY_OPTIONS}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Target Time Limit</label>
              <input
                type="text"
                value={formData.targetTime}
                onChange={e => setFormData({ ...formData, targetTime: e.target.value })}
                placeholder="e.g. 30s or 200ms"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Grid Dimension / Size</label>
              <input
                type="text"
                value={formData.gridSize}
                onChange={e => setFormData({ ...formData, gridSize: e.target.value })}
                placeholder="e.g. 3x3, 4x4, 5x5"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <button
            onClick={handleSaveAdd}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md mt-4 cursor-pointer"
          >
            Publish Challenge
          </button>
        </div>
      </RightDrawer>

      {/* EDIT CHALLENGE DRAWER */}
      <RightDrawer
        isOpen={Boolean(editingChallenge)}
        onClose={() => setEditingChallenge(null)}
        title={editingChallenge ? `Edit Challenge: ${editingChallenge.id || editingChallenge._id}` : 'Edit Challenge'}
      >
        {editingChallenge && (
          <div className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Challenge Title *</label>
              <input
                type="text"
                value={editingChallenge.title}
                onChange={e => setEditingChallenge({ ...editingChallenge, title: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Category</label>
                <CustomSelect
                  value={editingChallenge.category}
                  onChange={val => setEditingChallenge({ ...editingChallenge, category: val })}
                  options={CHALLENGE_CATEGORIES}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Difficulty</label>
                <CustomSelect
                  value={editingChallenge.difficulty}
                  onChange={val => setEditingChallenge({ ...editingChallenge, difficulty: val })}
                  options={DIFFICULTY_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            <button
              onClick={handleSaveEdit}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md mt-4 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        )}
      </RightDrawer>

      {/* TEST PLAY SANDBOX MODAL */}
      {testingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs text-left">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-purple-500" />
                Test Sandbox: {testingChallenge.title}
              </h3>
              <button onClick={() => setTestingChallenge(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-900 rounded-xl flex flex-col items-center justify-center space-y-3 text-center border border-white/10">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 font-mono font-bold rounded-lg text-xs">
                Category: {testingChallenge.category}
              </span>
              <div className="w-16 h-16 rounded-full bg-purple-600/30 flex items-center justify-center border border-purple-500/40">
                <Play className="w-8 h-8 text-purple-400 animate-pulse ml-1" />
              </div>
              <p className="text-xs text-slate-400">Target Goal: {testingChallenge.targetTime || '30s'} | Difficulty: {testingChallenge.difficulty}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTestingChallenge(null)}
                className="px-5 py-2 font-bold bg-purple-600 text-white rounded-xl"
              >
                Close Sandbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeManagement;
