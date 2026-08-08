import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Gamepad2, Zap, Puzzle, Brain, Gauge, Sparkles, Plus, Play, Settings,
  Search, Filter, Edit, Trash2, Eye, ToggleLeft, ToggleRight, X, Sliders,
  CheckCircle2, Trophy, Clock, Copy, RefreshCw, Award, RotateCcw, Target
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

const MOCK_DEFAULT_CHALLENGES = [
  {
    id: 'CHL-01',
    _id: 'CHL-01',
    title: 'Lightning Reflexes Reaction Challenge',
    category: 'Reaction Game',
    difficulty: 'Medium',
    targetTime: '180ms',
    gridSize: '3x3',
    penaltySeconds: '1.5s',
    rewardMultiplier: '1.5x',
    plays: '48,200',
    status: 'Active',
    description: 'Test contestant visual reaction time. Tap target indicator tiles as soon as they turn glowing green.'
  },
  {
    id: 'CHL-02',
    _id: 'CHL-02',
    title: 'Spatial Tile Alignment Matrix',
    category: 'Puzzle',
    difficulty: 'Medium',
    targetTime: '45s',
    gridSize: '4x4',
    penaltySeconds: '3s',
    rewardMultiplier: '2.0x',
    plays: '32,100',
    status: 'Active',
    description: 'Slide tiles into numerical order before the timer expires to achieve perfect completion accuracy.'
  },
  {
    id: 'CHL-03',
    _id: 'CHL-03',
    title: 'Number Matrix Deduction Quiz',
    category: 'Logic',
    difficulty: 'Hard',
    targetTime: '60s',
    gridSize: '5x5',
    penaltySeconds: '5s',
    rewardMultiplier: '2.5x',
    plays: '19,400',
    status: 'Inactive',
    description: 'Deduce hidden mathematical pattern equations in a 5x5 number grid.'
  },
  {
    id: 'CHL-04',
    _id: 'CHL-04',
    title: 'Speed Color Match & Stroop Test',
    category: 'Speed',
    difficulty: 'Easy',
    targetTime: '20s',
    gridSize: '2x2',
    penaltySeconds: '1s',
    rewardMultiplier: '1.2x',
    plays: '55,800',
    status: 'Active',
    description: 'Match font colors against word text names under intense time pressure.'
  },
  {
    id: 'CHL-05',
    _id: 'CHL-05',
    title: 'Memory Card Pattern Sequence',
    category: 'Memory',
    difficulty: 'Expert',
    targetTime: '30s',
    gridSize: '4x4',
    penaltySeconds: '2s',
    rewardMultiplier: '3.0x',
    plays: '12,600',
    status: 'Active',
    description: 'Memorize lit tile sequences and repeat the pattern without single miss-click.'
  }
];

export const ChallengeManagement = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  // Sub-Tabs State
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Drawers State
  const [showBuilderDrawer, setShowCreateDrawer] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [viewingChallenge, setViewingChallenge] = useState(null);
  const [testingChallenge, setTestingChallenge] = useState(null);

  // Interactive Game Sandbox State inside Test Drawer
  const [sandboxState, setSandboxState] = useState({
    isPlaying: false,
    startTime: 0,
    elapsedMs: 0,
    score: 0,
    activeTile: -1,
    testResult: null
  });

  // Challenges List
  const [challenges, setChallenges] = useState([]);

  // Custom Challenge Builder Form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Reaction Game',
    difficulty: 'Medium',
    targetTime: '30s',
    gridSize: '4x4',
    penaltySeconds: '2s',
    rewardMultiplier: '1.5x',
    status: 'Active'
  });

  useEffect(() => {
    fetchChallenges();
  }, [isMockMode]);

  const fetchChallenges = async () => {
    if (isMockMode) {
      setChallenges(MOCK_DEFAULT_CHALLENGES);
      return;
    }
    try {
      const res = await axios.get('/api/admin/challenges', { withCredentials: true });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setChallenges(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching challenges from backend API:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Reaction Game',
      difficulty: 'Medium',
      targetTime: '30s',
      gridSize: '4x4',
      penaltySeconds: '2s',
      rewardMultiplier: '1.5x',
      status: 'Active'
    });
  };

  // --- SAVE CREATE CHALLENGE ---
  const handleSaveAdd = async () => {
    if (!formData.title.trim()) {
      showSnackbar('Please enter a challenge title', 'warning');
      return;
    }

    const newChallenge = {
      id: `CHL-${Date.now().toString().slice(-4)}`,
      _id: `CHL-${Date.now().toString().slice(-4)}`,
      plays: '0',
      ...formData
    };

    if (!isMockMode) {
      try {
        const res = await axios.post('/api/admin/challenges', newChallenge, { withCredentials: true });
        if (res.data && res.data.data) {
          newChallenge._id = res.data.data._id || res.data.data.id || newChallenge.id;
        }
      } catch (err) {
        console.error('Error creating challenge via API:', err);
      }
    }

    setChallenges(prev => [newChallenge, ...prev]);
    showSnackbar(`Custom Challenge "${newChallenge.title}" published!`, 'success');
    setShowCreateDrawer(false);
    resetForm();
  };

  // --- SAVE EDIT CHALLENGE ---
  const handleSaveEdit = async () => {
    if (!editingChallenge || !editingChallenge.title.trim()) {
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
    if (viewingChallenge && (viewingChallenge.id === editingChallenge.id || viewingChallenge._id === editingChallenge._id)) {
      setViewingChallenge(editingChallenge);
    }
    showSnackbar(`Challenge "${editingChallenge.title}" updated!`, 'success');
    setEditingChallenge(null);
  };

  // --- DUPLICATE CHALLENGE ---
  const handleDuplicateChallenge = (c) => {
    const cloned = {
      ...JSON.parse(JSON.stringify(c)),
      id: `CHL-${Date.now().toString().slice(-4)}`,
      _id: `CHL-${Date.now().toString().slice(-4)}`,
      title: `${c.title} (Copy)`,
      plays: '0'
    };
    setEditingChallenge(cloned);
    showSnackbar(`Cloned challenge draft created. Edit rules and save!`, 'info');
  };

  // --- TOGGLE STATUS ---
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
    if (viewingChallenge && (viewingChallenge.id === id || viewingChallenge._id === id)) {
      setViewingChallenge(prev => ({ ...prev, status: nextStatus }));
    }
    showSnackbar(`Challenge "${target.title}" is now ${nextStatus}`, 'info');
  };

  // --- DELETE CHALLENGE ---
  const handleDelete = (c) => {
    showConfirm('Delete Challenge', `Are you sure you want to permanently delete challenge "${c.title}"?`, async () => {
      if (!isMockMode) {
        try {
          await axios.delete(`/api/admin/challenges/${c._id || c.id}`, { withCredentials: true });
        } catch (err) {
          console.error('Error deleting challenge via API:', err);
        }
      }
      setChallenges(prev => prev.filter(item => (item.id !== c.id && item._id !== c._id)));
      if (viewingChallenge && (viewingChallenge.id === c.id || viewingChallenge._id === c._id)) {
        setViewingChallenge(null);
      }
      if (editingChallenge && (editingChallenge.id === c.id || editingChallenge._id === c._id)) {
        setEditingChallenge(null);
      }
      if (testingChallenge && (testingChallenge.id === c.id || testingChallenge._id === c._id)) {
        setTestingChallenge(null);
      }
      showSnackbar(`Challenge "${c.title}" deleted.`, 'success');
    });
  };

  // --- TEST SANDBOX SIMULATION LOGIC ---
  const startSandboxTest = () => {
    const randomTile = Math.floor(Math.random() * 9);
    setSandboxState({
      isPlaying: true,
      startTime: Date.now(),
      elapsedMs: 0,
      score: 0,
      activeTile: randomTile,
      testResult: null
    });
  };

  const handleSandboxTileClick = (index) => {
    if (!sandboxState.isPlaying) return;
    if (index === sandboxState.activeTile) {
      const reactionTime = Date.now() - sandboxState.startTime;
      const nextScore = sandboxState.score + 10;

      if (nextScore >= 30) {
        setSandboxState({
          isPlaying: false,
          startTime: 0,
          elapsedMs: reactionTime,
          score: 30,
          activeTile: -1,
          testResult: `PASSED! Avg Reaction: ${Math.round(reactionTime / 3)}ms | Rating: Excellent`
        });
      } else {
        const nextTile = Math.floor(Math.random() * 9);
        setSandboxState(prev => ({
          ...prev,
          score: nextScore,
          activeTile: nextTile
        }));
      }
    } else {
      showSnackbar('Missed target tile! +1.5s penalty added.', 'warning');
    }
  };

  // --- FILTERED CHALLENGES LOGIC ---
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
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2.5">
            <Gamepad2 className="w-6 h-6 text-purple-500" />
            Mini Game Challenge Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Build and configure Reaction, Puzzle, Logic, Speed, and Memory challenges with custom rule configurations and sandbox testing.
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

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'all', label: 'All Challenges', icon: Gamepad2 },
          { id: 'reaction', label: 'Reaction Game', icon: Zap },
          { id: 'puzzle', label: 'Puzzle', icon: Puzzle },
          { id: 'logic', label: 'Logic', icon: Brain },
          { id: 'speed', label: 'Speed', icon: Gauge },
          { id: 'memory', label: 'Memory', icon: Sparkles },
          { id: 'builder', label: 'Custom Builder Drawer', icon: Sliders }
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

      {/* Search and Filters Bar */}
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

      {/* Challenge Cards Grid */}
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
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
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
                  <div>Plays: <strong className="text-slate-800 dark:text-white font-mono">{c.plays || '0'}</strong></div>
                  <div>Target: <strong className="text-purple-500 font-mono font-bold">{c.targetTime || '30s'}</strong></div>
                  <div>Level: <strong className="text-slate-800 dark:text-white">{c.difficulty || 'Medium'}</strong></div>
                </div>

                {/* Card Actions */}
                <div className="pt-1 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => {
                      setTestingChallenge(c);
                      setSandboxState({ isPlaying: false, startTime: 0, elapsedMs: 0, score: 0, activeTile: -1, testResult: null });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" /> Test Sandbox
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingChallenge(c)}
                      title="View Specs Drawer"
                      className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingChallenge(JSON.parse(JSON.stringify(c)))}
                      title="Edit Challenge Drawer"
                      className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateChallenge(c)}
                      title="Duplicate Challenge"
                      className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      title="Delete Challenge"
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 1. CUSTOM CHALLENGE BUILDER DRAWER */}
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
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Game Description & Guidelines</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Instructions, visual cues and target goals for contestants..."
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
                placeholder="e.g. 30s or 180ms"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Grid Dimension</label>
              <input
                type="text"
                value={formData.gridSize}
                onChange={e => setFormData({ ...formData, gridSize: e.target.value })}
                placeholder="e.g. 3x3, 4x4, 5x5"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Penalty Seconds / Miss</label>
              <input
                type="text"
                value={formData.penaltySeconds}
                onChange={e => setFormData({ ...formData, penaltySeconds: e.target.value })}
                placeholder="e.g. 1.5s"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Reward Multiplier</label>
              <input
                type="text"
                value={formData.rewardMultiplier}
                onChange={e => setFormData({ ...formData, rewardMultiplier: e.target.value })}
                placeholder="e.g. 1.5x"
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

      {/* 2. EDIT CHALLENGE DRAWER */}
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
                value={editingChallenge.title || ''}
                onChange={e => setEditingChallenge({ ...editingChallenge, title: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Description</label>
              <textarea
                rows={2}
                value={editingChallenge.description || ''}
                onChange={e => setEditingChallenge({ ...editingChallenge, description: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Category</label>
                <CustomSelect
                  value={editingChallenge.category || 'Reaction Game'}
                  onChange={val => setEditingChallenge({ ...editingChallenge, category: val })}
                  options={CHALLENGE_CATEGORIES}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Difficulty</label>
                <CustomSelect
                  value={editingChallenge.difficulty || 'Medium'}
                  onChange={val => setEditingChallenge({ ...editingChallenge, difficulty: val })}
                  options={DIFFICULTY_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Target Time</label>
                <input
                  type="text"
                  value={editingChallenge.targetTime || '30s'}
                  onChange={e => setEditingChallenge({ ...editingChallenge, targetTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Grid Size</label>
                <input
                  type="text"
                  value={editingChallenge.gridSize || '4x4'}
                  onChange={e => setEditingChallenge({ ...editingChallenge, gridSize: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleSaveEdit}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md mt-4 cursor-pointer"
            >
              Save & Apply Changes
            </button>
          </div>
        )}
      </RightDrawer>

      {/* 3. VIEW CHALLENGE SPECS DRAWER */}
      <RightDrawer
        isOpen={Boolean(viewingChallenge)}
        onClose={() => setViewingChallenge(null)}
        title={viewingChallenge ? `Challenge Specs: ${viewingChallenge.id || viewingChallenge._id}` : 'Challenge Specs'}
      >
        {viewingChallenge && (
          <div className="space-y-5 text-xs text-left">
            {/* Header info */}
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold font-mono text-purple-500 uppercase bg-purple-500/10 px-2 py-0.5 rounded">
                  {viewingChallenge.id || viewingChallenge._id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  viewingChallenge.status === 'Active'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                  {viewingChallenge.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewingChallenge.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{viewingChallenge.description || 'No detailed instructions provided.'}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Category</span>
                <strong className="text-purple-400 font-bold text-xs">{viewingChallenge.category}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Difficulty</span>
                <strong className="text-slate-800 dark:text-white font-bold text-xs">{viewingChallenge.difficulty}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Target Time Goal</span>
                <strong className="text-purple-500 font-mono font-bold text-xs">{viewingChallenge.targetTime || '30s'}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Grid Dimension</span>
                <strong className="text-slate-800 dark:text-white font-mono font-bold text-xs">{viewingChallenge.gridSize || '4x4'}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Miss Penalty</span>
                <strong className="text-rose-500 font-mono font-bold text-xs">{viewingChallenge.penaltySeconds || '1.5s'}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Total Plays</span>
                <strong className="text-indigo-400 font-mono font-bold text-xs">{viewingChallenge.plays || '0'}</strong>
              </div>
            </div>

            {/* Quick Actions Footer inside Drawer */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Actions</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const target = viewingChallenge;
                    setViewingChallenge(null);
                    setTestingChallenge(target);
                    setSandboxState({ isPlaying: false, startTime: 0, elapsedMs: 0, score: 0, activeTile: -1, testResult: null });
                  }}
                  className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Play className="w-4 h-4" /> Test Sandbox
                </button>

                <button
                  onClick={() => {
                    const target = viewingChallenge;
                    setViewingChallenge(null);
                    setEditingChallenge(JSON.parse(JSON.stringify(target)));
                  }}
                  className="py-2.5 px-3 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-4 h-4" /> Edit Challenge
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDuplicateChallenge(viewingChallenge)}
                  className="py-2 px-3 bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </button>

                <button
                  onClick={() => handleToggleStatus(viewingChallenge.id || viewingChallenge._id)}
                  className="py-2 px-3 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Toggle Status
                </button>
              </div>

              <button
                onClick={() => handleDelete(viewingChallenge)}
                className="w-full py-2 px-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Challenge Permanently
              </button>
            </div>
          </div>
        )}
      </RightDrawer>

      {/* 4. INTERACTIVE TEST PLAY SANDBOX DRAWER */}
      <RightDrawer
        isOpen={Boolean(testingChallenge)}
        onClose={() => setTestingChallenge(null)}
        title={testingChallenge ? `Test Sandbox: ${testingChallenge.title}` : 'Test Sandbox'}
      >
        {testingChallenge && (
          <div className="space-y-4 text-xs text-left">
            {/* Header stats */}
            <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200/60 dark:border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase block">{testingChallenge.category}</span>
                <strong className="text-slate-900 dark:text-white font-bold text-sm">{testingChallenge.title}</strong>
              </div>
              <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 font-mono font-bold rounded-lg text-xs">
                Goal: {testingChallenge.targetTime || '30s'}
              </span>
            </div>

            {/* Interactive Simulator Grid */}
            <div className="p-5 bg-slate-900 rounded-2xl flex flex-col items-center justify-center space-y-4 border border-white/10 shadow-inner">
              <div className="flex items-center justify-between w-full text-slate-300 font-mono text-xs px-2">
                <span>Score: <strong className="text-emerald-400 text-sm">{sandboxState.score} / 30</strong></span>
                <span>Tile Grid: <strong className="text-purple-400">{testingChallenge.gridSize || '3x3'}</strong></span>
              </div>

              {/* 3x3 Tile Matrix Interactive Simulation */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(idx => {
                  const isActive = sandboxState.isPlaying && sandboxState.activeTile === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSandboxTileClick(idx)}
                      disabled={!sandboxState.isPlaying}
                      className={`h-16 rounded-xl border transition-all cursor-pointer flex items-center justify-center font-bold text-sm ${
                        isActive
                          ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50 scale-105'
                          : 'bg-slate-800 text-slate-600 border-white/10 hover:border-purple-500/40'
                      }`}
                    >
                      {isActive ? 'TAP!' : ''}
                    </button>
                  );
                })}
              </div>

              {/* Simulation Result Message */}
              {sandboxState.testResult && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-center font-bold text-xs w-full">
                  🎉 {sandboxState.testResult}
                </div>
              )}

              {/* Start / Reset Simulation Button */}
              {!sandboxState.isPlaying ? (
                <button
                  onClick={startSandboxTest}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer text-xs"
                >
                  <Play className="w-4 h-4" /> Start Interactive Test
                </button>
              ) : (
                <button
                  onClick={() => setSandboxState({ isPlaying: false, startTime: 0, elapsedMs: 0, score: 0, activeTile: -1, testResult: null })}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl flex items-center gap-1.5 transition-all text-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Stop Simulation
                </button>
              )}
            </div>

            {/* Rule Parameters Summary */}
            <div className="space-y-2 bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5">
              <strong className="block text-slate-800 dark:text-white font-bold">Rule Specs & Difficulty:</strong>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div>Difficulty: <span className="text-slate-200 font-bold">{testingChallenge.difficulty}</span></div>
                <div>Target Time: <span className="text-purple-400 font-mono font-bold">{testingChallenge.targetTime}</span></div>
                <div>Miss Penalty: <span className="text-rose-400 font-mono font-bold">{testingChallenge.penaltySeconds || '1.5s'}</span></div>
                <div>Reward Rate: <span className="text-emerald-400 font-mono font-bold">{testingChallenge.rewardMultiplier || '1.5x'}</span></div>
              </div>
            </div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default ChallengeManagement;
