import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Crown, Plus, Calendar, Clock, Percent, Award, Play, XCircle, CheckCircle2, Sliders, Shield,
  Search, Filter, Edit2, Trash2, Eye, ToggleLeft, ToggleRight, X, Sparkles, Layers, FileText,
  UserCheck, Trophy, AlertTriangle, Send, CheckSquare, RefreshCw, ChevronRight, Copy
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { RightDrawer } from '../components/RightDrawer';
import { RichTextEditor } from '../components/RichTextEditor';

export const GrandContestManagement = () => {
  const navigate = useNavigate();
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth.isMockMode);

  // Active Main Tab: 'seasons' | 'stages' | 'winners'
  const [activeTab, setActiveTab] = useState('seasons');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);

  // State lists
  const [seasons, setSeasons] = useState([]);
  const [stages, setStages] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [winners, setWinners] = useState({
    first: '',
    second: '',
    third: '',
    announced: false
  });

  // Drawer Control States
  const [showAddSeasonDrawer, setShowAddSeasonDrawer] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [viewingSeason, setViewingSeason] = useState(null);

  const [showAddStageDrawer, setShowAddStageDrawer] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [viewingStage, setViewingStage] = useState(null);

  const [showWinnerDrawer, setShowWinnerDrawer] = useState(false);

  // Season Form State
  const [seasonForm, setSeasonForm] = useState({
    name: '',
    prizePool: '5,00,000 Coins 🪙',
    totalStages: 4,
    eliminationRate: '20%',
    passMarks: 70,
    timerSec: 60,
    startDate: '',
    endDate: '',
    rules: '1. Complete preliminary quiz stages.\n2. Negative marking applies.\n3. Top scorers advance.',
    status: 'Scheduled'
  });

  // Stage Form State
  const [stageForm, setStageForm] = useState({
    seasonId: 'GS-2026-S1',
    name: '',
    stageNumber: 1,
    timerSec: 60,
    eliminationRate: '25%',
    qualificationMarks: 75,
    rules: '',
    startDate: '',
    endDate: '',
    status: 'Scheduled'
  });

  useEffect(() => {
    fetchSeasons();
  }, [isMockMode]);

  const fetchSeasons = async () => {
    try {
      let res = await axios.get('/api/admin/grand-contests', { withCredentials: true }).catch(() => null);
      if (!res?.data?.success) {
        res = await axios.get('/api/grand-contests', { withCredentials: true }).catch(() => null);
      }
      if (!res?.data?.success) {
        res = await axios.get('/api/contests', { withCredentials: true }).catch(() => null);
      }

      const raw = res?.data?.data || res?.data;
      const contestsList = Array.isArray(raw?.contests) ? raw.contests : Array.isArray(raw) ? raw : [];

      if (contestsList.length > 0) {
        const mapped = contestsList.map((c, idx) => ({
          id: c.contestId || `GS-2026-S${idx + 1}`,
          _id: c._id,
          name: c.title,
          totalStages: c.tasksCount || (c.tasks ? c.tasks.length : 5),
          eliminationRate: '25%',
          passMarks: 75,
          timerSec: c.timerLimit ? c.timerLimit * 60 : 60,
          status: c.status === 'Registration Open' || c.status === 'Live' ? 'Published' : c.status,
          prizePool: `₹${c.prizePool?.toLocaleString() || 0}`,
          startDate: c.startDate ? c.startDate.split('T')[0] : '',
          endDate: c.endDate ? c.endDate.split('T')[0] : '',
          rules: c.rules || '',
          guidelines: c.guidelines || ''
        }));
        setSeasons(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch seasons:', err);
    }
  };

  const handleSaveSeason = async () => {
    if (!seasonForm.name) {
      showSnackbar('Please enter a valid Season Name', 'warning');
      return;
    }
    try {
      const payload = {
        title: seasonForm.name,
        description: seasonForm.name,
        prizePool: Number(String(seasonForm.prizePool).replace(/[^0-9]/g, '')) || 500000,
        rules: seasonForm.rules,
        durationDays: 14,
        status: seasonForm.status === 'Scheduled' ? 'Registration Open' : seasonForm.status
      };
      let res = await axios.post('/api/admin/grand-contests', payload, { withCredentials: true }).catch(() => null);
      if (!res?.data?.success) {
        await axios.post('/api/grand-contests', payload, { withCredentials: true }).catch(() => null);
      }
      showSnackbar('New Grand Contest created successfully!', 'success');
      setShowAddSeasonDrawer(false);
      resetSeasonForm();
      fetchSeasons();
    } catch (err) {
      showSnackbar('Failed to create Grand Contest', 'error');
    }
  };

  const handleUpdateSeason = () => {
    setSeasons(prev => prev.map(s => s.id === editingSeason.id ? editingSeason : s));
    showSnackbar(`Season "${editingSeason.name}" updated successfully!`, 'success');
    setEditingSeason(null);
  };

  const handlePublishSeason = (season) => {
    setSeasons(prev => prev.map(s => s.id === season.id ? { ...s, status: 'Published' } : s));
    showSnackbar(`Season "${season.name}" is now Live & Published!`, 'success');
  };

  const handleCancelSeason = (season) => {
    showConfirm('Cancel Season', `Are you sure you want to cancel "${season.name}"?`, () => {
      setSeasons(prev => prev.map(s => s.id === season.id ? { ...s, status: 'Cancelled' } : s));
      showSnackbar(`Season "${season.name}" has been Cancelled.`, 'info');
    });
  };

  const handleDeleteSeason = (season) => {
    showConfirm('Delete Season', `Permanently delete season "${season.name}"?`, () => {
      setSeasons(prev => prev.filter(s => s.id !== season.id));
      showSnackbar(`Season "${season.name}" deleted.`, 'success');
    });
  };

  const resetSeasonForm = () => {
    setSeasonForm({
      name: '',
      prizePool: '₹5,00,000',
      totalStages: 4,
      eliminationRate: '20%',
      passMarks: 70,
      timerSec: 60,
      startDate: '',
      endDate: '',
      rules: 'Standard tournament rules apply.',
      status: 'Scheduled'
    });
  };

  // Stage Handlers
  const handleSaveStage = () => {
    if (!stageForm.name) {
      showSnackbar('Please enter Stage Name', 'warning');
      return;
    }
    const newStage = {
      id: `STG-${Date.now().toString().slice(-3)}`,
      ...stageForm
    };
    setStages([...stages, newStage]);
    showSnackbar(`Stage "${stageForm.name}" created successfully!`, 'success');
    setShowAddStageDrawer(false);
    resetStageForm();
  };

  const handleUpdateStage = () => {
    setStages(prev => prev.map(st => st.id === editingStage.id ? editingStage : st));
    showSnackbar(`Stage "${editingStage.name}" updated!`, 'success');
    setEditingStage(null);
  };

  const handlePublishStage = (stage) => {
    setStages(prev => prev.map(st => st.id === stage.id ? { ...st, status: 'Published' } : st));
    showSnackbar(`Stage "${stage.name}" published successfully!`, 'success');
  };

  const handleCancelStage = (stage) => {
    showConfirm('Cancel Stage', `Are you sure you want to cancel "${stage.name}"?`, () => {
      setStages(prev => prev.map(st => st.id === stage.id ? { ...st, status: 'Cancelled' } : st));
      showSnackbar(`Stage "${stage.name}" cancelled.`, 'info');
    });
  };

  const handleDeleteStage = (stage) => {
    showConfirm('Delete Stage', `Permanently delete stage "${stage.name}"?`, () => {
      setStages(prev => prev.filter(st => st.id !== stage.id));
      showSnackbar(`Stage "${stage.name}" deleted.`, 'success');
    });
  };

  const resetStageForm = () => {
    setStageForm({
      seasonId: selectedSeasonId || 'GS-2026-S1',
      name: '',
      stageNumber: stages.length + 1,
      timerSec: 60,
      eliminationRate: '25%',
      qualificationMarks: 75,
      rules: '',
      startDate: '',
      endDate: '',
      status: 'Scheduled'
    });
  };

  // Winner Selection Handlers
  const handleAnnounceWinners = () => {
    setWinners(prev => ({ ...prev, announced: true }));
    showSnackbar('Grand Winners officially selected and prize pool disbursed!', 'success');
    setShowWinnerDrawer(false);
  };

  const filteredSeasons = seasons.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredStages = stages.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(searchTerm.toLowerCase()) || st.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeason = selectedSeasonId ? st.seasonId === selectedSeasonId : true;
    const matchesStatus = statusFilter === 'All' || st.status === statusFilter;
    return matchesSearch && matchesSeason && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2.5">
            <Crown className="w-6 h-6 text-amber-500" />
            Grand Contest & Tournament Management Console
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Build multi-stage tournament seasons, configure stage rules, timers, elimination rates & conduct winner selections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'seasons' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/admin-dashboard/grand-contests/wizard')}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-all shadow-md text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Grand Contest Wizard</span>
              </button>
              <button
                onClick={() => { resetSeasonForm(); setShowAddSeasonDrawer(true); }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Season Drawer</span>
              </button>
            </div>
          )}

          {activeTab === 'stages' && (
            <button
              onClick={() => { resetStageForm(); setShowAddStageDrawer(true); }}
              className="px-4 py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stage</span>
            </button>
          )}

          {activeTab === 'winners' && (
            <button
              onClick={() => setShowWinnerDrawer(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Confirm Winner Selection</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-white/10 text-xs font-bold space-x-6">
        <button
          onClick={() => setActiveTab('seasons')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'seasons'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Seasons Overview ({seasons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stages')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'stages'
              ? 'border-brandPrimary text-brandPrimary'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Stage Builder ({stages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('winners')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'winners'
              ? 'border-purple-500 text-purple-500'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Winner Selection Desk</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'stages' ? "Search stages..." : "Search seasons..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {activeTab === 'stages' && (
            <CustomSelect
              value={selectedSeasonId || 'All'}
              onChange={(val) => setSelectedSeasonId(val === 'All' ? null : val)}
              options={[
                { value: 'All', label: 'All Seasons' },
                ...seasons.map(s => ({ value: s.id, label: `${s.id}: ${s.name}` }))
              ]}
              className="w-48"
            />
          )}

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Published', label: 'Published' },
              { value: 'Scheduled', label: 'Scheduled' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Cancelled', label: 'Cancelled' }
            ]}
            className="w-44"
          />
        </div>
      </div>

      {/* TAB 1: SEASONS OVERVIEW */}
      {activeTab === 'seasons' && (
        filteredSeasons.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl text-center space-y-3">
            <Crown className="w-10 h-10 text-slate-300 dark:text-white/20" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Grand Contest Seasons Available</h3>
            <p className="text-xs text-slate-400 max-w-sm">No tournament seasons match your filter. Click "Create Season" to register a new Grand Contest season.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSeasons.map((s) => (
              <div key={s.id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 font-mono font-bold rounded text-[10px] inline-block mb-1">
                        {s.id}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'Published' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : s.status === 'Cancelled'
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {s.status}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Prize Pool</span>
                      <strong className="text-emerald-500 font-bold">{s.prizePool}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Stages</span>
                      <strong className="text-slate-800 dark:text-white font-bold">{s.totalStages} Stages</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Elimination</span>
                      <strong className="text-rose-500 font-bold">{s.eliminationRate}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Pass Score</span>
                      <strong className="text-amber-500 font-bold">{s.passMarks} Pts</strong>
                    </div>
                  </div>

                  {/* Rules preview */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 bg-slate-50/50 dark:bg-black/20 p-2 rounded-lg font-mono text-[11px]">
                    {s.rules || 'No rules guidelines specified.'}
                  </p>
                </div>

                {/* Action Controls */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setViewingSeason(s)} title="View Season Details" className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingSeason(s)} title="Edit Season" className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteSeason(s)} title="Delete Season" className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {s.status !== 'Published' && (
                      <button
                        onClick={() => handlePublishSeason(s)}
                        className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-600 flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" /> Publish
                      </button>
                    )}

                    {s.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancelSeason(s)}
                        className="px-3 py-1 bg-slate-100 dark:bg-white/10 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-white rounded-lg text-[11px] font-bold transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* TAB 2: STAGE BUILDER */}
      {activeTab === 'stages' && (
        filteredStages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-300 dark:text-white/20" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Tournament Stages Found</h3>
            <p className="text-xs text-slate-400 max-w-sm">No stages match your search query or selected season. Click "Add Stage" to build a tournament stage.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredStages.map((st) => (
                <div key={st.id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-brandPrimary/40 transition-all">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 bg-brandPrimary/10 text-brandPrimary font-mono font-bold rounded text-[10px]">
                        {st.seasonId} • {st.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        st.status === 'Published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {st.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{st.name}</h4>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-white/5 p-2 rounded-xl text-center text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 block">Timer</span>
                        <strong className="text-slate-800 dark:text-white font-bold">{st.timerSec}s</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Elimination</span>
                        <strong className="text-rose-500 font-bold">{st.eliminationRate}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Qualify Score</span>
                        <strong className="text-amber-500 font-bold">{st.qualificationMarks} Pts</strong>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 font-mono">
                      {st.rules || 'No custom stage rules.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewingStage(st)} title="View Stage Details" className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingStage(st)} title="Edit Stage" className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteStage(st)} title="Delete Stage" className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {st.status !== 'Published' && (
                      <button
                        onClick={() => handlePublishStage(st)}
                        className="px-3 py-1 bg-brandPrimary text-white text-[10px] font-bold rounded-lg hover:bg-brandPrimary/90"
                      >
                        Publish Stage
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* TAB 3: WINNER SELECTION DESK */}
      {activeTab === 'winners' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" /> Season Qualifier Leaderboard & Podium Selection
                </h3>
                <p className="text-xs text-slate-500 dark:text-white/50">Top performers from final round ready for rank confirmation.</p>
              </div>

              {winners.announced ? (
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Winners Announced & Disbursed
                </span>
              ) : (
                <button
                  onClick={() => setShowWinnerDrawer(true)}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md"
                >
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>Select & Award Winners</span>
                </button>
              )}
            </div>

            {/* Candidates Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">Stages Completed</th>
                    <th className="py-2.5 px-3">Total Score</th>
                    <th className="py-2.5 px-3">Current Status</th>
                    <th className="py-2.5 px-3 text-right">Award Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {candidates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No stage qualifiers available for winner selection yet.
                      </td>
                    </tr>
                  ) : (
                    candidates.map((cand, idx) => (
                      <tr key={cand.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="py-3 px-3 flex items-center gap-3">
                          <img src={cand.avatar} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-white/10" alt="Avatar" />
                          <div>
                            <strong className="text-slate-900 dark:text-white font-bold block">{cand.name}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">{cand.id}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-bold">{cand.stageCompleted} / 3 Stages</td>
                        <td className="py-3 px-3"><strong className="text-emerald-500 font-bold">{cand.score} Pts</strong></td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-brandPrimary/10 text-brandPrimary text-[10px] font-bold rounded">
                            {cand.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {idx === 0 && <span className="px-3 py-1 bg-amber-500/10 text-amber-500 font-bold rounded-lg border border-amber-500/20">🥇 1st Winner</span>}
                          {idx === 1 && <span className="px-3 py-1 bg-slate-500/10 text-slate-400 font-bold rounded-lg border border-slate-500/20">🥈 2nd Runner-Up</span>}
                          {idx === 2 && <span className="px-3 py-1 bg-amber-700/10 text-amber-700 font-bold rounded-lg border border-amber-700/20">🥉 3rd Finalist</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SEASON DRAWER */}
      <RightDrawer
        isOpen={showAddSeasonDrawer}
        onClose={() => setShowAddSeasonDrawer(false)}
        title="Create Grand Contest Season"
      >
        <div className="space-y-4 text-xs text-left">
          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Season Title / Name</label>
            <input
              type="text"
              value={seasonForm.name}
              onChange={e => setSeasonForm({...seasonForm, name: e.target.value})}
              placeholder="e.g. Winter Grand Championship 2026"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Prize Pool (INR)</label>
              <input
                type="text"
                value={seasonForm.prizePool}
                onChange={e => setSeasonForm({...seasonForm, prizePool: e.target.value})}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Total Stages</label>
              <input
                type="number"
                value={seasonForm.totalStages}
                onChange={e => setSeasonForm({...seasonForm, totalStages: Number(e.target.value)})}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Elimination %</label>
              <input
                type="text"
                value={seasonForm.eliminationRate}
                onChange={e => setSeasonForm({...seasonForm, eliminationRate: e.target.value})}
                placeholder="25%"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Qualify Score</label>
              <input
                type="number"
                value={seasonForm.passMarks}
                onChange={e => setSeasonForm({...seasonForm, passMarks: Number(e.target.value)})}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Timer (Sec)</label>
              <input
                type="number"
                value={seasonForm.timerSec}
                onChange={e => setSeasonForm({...seasonForm, timerSec: Number(e.target.value)})}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Start Schedule Date</label>
              <input
                type="date"
                value={seasonForm.startDate}
                onChange={e => setSeasonForm({...seasonForm, startDate: e.target.value})}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">End Schedule Date</label>
              <input
                type="date"
                value={seasonForm.endDate}
                onChange={e => setSeasonForm({...seasonForm, endDate: e.target.value})}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <RichTextEditor
            label="Season Rules & Regulations"
            value={seasonForm.rules}
            onChange={val => setSeasonForm({...seasonForm, rules: val})}
            rows={4}
          />

          <button
            onClick={handleSaveSeason}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-md mt-4"
          >
            Create Season
          </button>
        </div>
      </RightDrawer>

      {/* EDIT SEASON DRAWER */}
      <RightDrawer
        isOpen={Boolean(editingSeason)}
        onClose={() => setEditingSeason(null)}
        title={editingSeason ? `Edit Season: ${editingSeason.id}` : 'Edit Season'}
      >
        {editingSeason && (
          <div className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Season Name</label>
              <input
                type="text"
                value={editingSeason.name}
                onChange={e => setEditingSeason({...editingSeason, name: e.target.value})}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Prize Pool</label>
                <input
                  type="text"
                  value={editingSeason.prizePool}
                  onChange={e => setEditingSeason({...editingSeason, prizePool: e.target.value})}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Total Stages</label>
                <input
                  type="number"
                  value={editingSeason.totalStages}
                  onChange={e => setEditingSeason({...editingSeason, totalStages: Number(e.target.value)})}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Elimination %</label>
                <input
                  type="text"
                  value={editingSeason.eliminationRate}
                  onChange={e => setEditingSeason({...editingSeason, eliminationRate: e.target.value})}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Qualify Score</label>
                <input
                  type="number"
                  value={editingSeason.passMarks}
                  onChange={e => setEditingSeason({...editingSeason, passMarks: Number(e.target.value)})}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Timer (Sec)</label>
                <input
                  type="number"
                  value={editingSeason.timerSec}
                  onChange={e => setEditingSeason({...editingSeason, timerSec: Number(e.target.value)})}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <RichTextEditor
              label="Season Rules & Regulations"
              value={editingSeason.rules}
              onChange={val => setEditingSeason({...editingSeason, rules: val})}
              rows={4}
            />

            <button
              onClick={handleUpdateSeason}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-md mt-4"
            >
              Save Changes
            </button>
          </div>
        )}
      </RightDrawer>

      {/* VIEW SEASON DRAWER */}
      <RightDrawer
        isOpen={Boolean(viewingSeason)}
        onClose={() => setViewingSeason(null)}
        title="Season Details"
      >
        {viewingSeason && (
          <div className="space-y-4 text-xs text-left">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <span className="font-mono text-[10px] font-bold text-amber-500 block mb-1">{viewingSeason.id}</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewingSeason.name}</h3>
              <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full mt-2 uppercase">
                {viewingSeason.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-400 block">Prize Pool</span>
                <strong className="text-emerald-500 font-bold">{viewingSeason.prizePool}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Total Stages</span>
                <strong className="text-slate-800 dark:text-white font-bold">{viewingSeason.totalStages} Stages</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Elimination Rate</span>
                <strong className="text-rose-500 font-bold">{viewingSeason.eliminationRate}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Pass Score</span>
                <strong className="text-amber-500 font-bold">{viewingSeason.passMarks} Pts</strong>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Season Schedule</span>
              <p className="text-slate-800 dark:text-white font-semibold">
                {viewingSeason.startDate || 'N/A'} to {viewingSeason.endDate || 'N/A'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Rules & Regulations</span>
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl font-mono text-[11px] whitespace-pre-line text-slate-800 dark:text-slate-200">
                {viewingSeason.rules}
              </div>
            </div>
          </div>
        )}
      </RightDrawer>

      {/* CREATE STAGE DRAWER */}
      <RightDrawer
        isOpen={showAddStageDrawer}
        onClose={() => setShowAddStageDrawer(false)}
        title="Create Tournament Stage"
      >
        <div className="space-y-4 text-xs text-left">
          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Target Season</label>
            <CustomSelect
              value={stageForm.seasonId}
              onChange={val => setStageForm({...stageForm, seasonId: val})}
              options={seasons.map(s => ({ label: `${s.id}: ${s.name}`, value: s.id }))}
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Stage Name</label>
            <input
              type="text"
              value={stageForm.name}
              onChange={e => setStageForm({...stageForm, name: e.target.value})}
              placeholder="e.g. Stage 1: Speed Quiz Qualifier"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Stage Timer (Sec)</label>
              <input
                type="number"
                value={stageForm.timerSec}
                onChange={e => setStageForm({...stageForm, timerSec: Number(e.target.value)})}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Elimination %</label>
              <input
                type="text"
                value={stageForm.eliminationRate}
                onChange={e => setStageForm({...stageForm, eliminationRate: e.target.value})}
                placeholder="25%"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Qualify Score</label>
              <input
                type="number"
                value={stageForm.qualificationMarks}
                onChange={e => setStageForm({...stageForm, qualificationMarks: Number(e.target.value)})}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <RichTextEditor
            label="Stage Rules & Guidelines"
            value={stageForm.rules}
            onChange={val => setStageForm({...stageForm, rules: val})}
            rows={4}
          />

          <button
            onClick={handleSaveStage}
            className="w-full py-3 bg-brandPrimary hover:bg-brandPrimary/90 text-white font-bold rounded-xl transition-all shadow-md mt-4"
          >
            Create Stage
          </button>
        </div>
      </RightDrawer>

      {/* EDIT STAGE DRAWER */}
      <RightDrawer
        isOpen={Boolean(editingStage)}
        onClose={() => setEditingStage(null)}
        title={editingStage ? `Edit Stage: ${editingStage.name}` : 'Edit Stage'}
      >
        {editingStage && (
          <div className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Stage Name</label>
              <input
                type="text"
                value={editingStage.name}
                onChange={e => setEditingStage({...editingStage, name: e.target.value})}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Timer (Sec)</label>
                <input
                  type="number"
                  value={editingStage.timerSec}
                  onChange={e => setEditingStage({...editingStage, timerSec: Number(e.target.value)})}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Elimination Rate</label>
                <input
                  type="text"
                  value={editingStage.eliminationRate}
                  onChange={e => setEditingStage({...editingStage, eliminationRate: e.target.value})}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Qualify Score</label>
                <input
                  type="number"
                  value={editingStage.qualificationMarks}
                  onChange={e => setEditingStage({...editingStage, qualificationMarks: Number(e.target.value)})}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <RichTextEditor
              label="Stage Rules & Guidelines"
              value={editingStage.rules}
              onChange={val => setEditingStage({...editingStage, rules: val})}
              rows={4}
            />

            <button
              onClick={handleUpdateStage}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-md mt-4"
            >
              Save Stage Changes
            </button>
          </div>
        )}
      </RightDrawer>

      {/* VIEW STAGE DRAWER */}
      <RightDrawer
        isOpen={Boolean(viewingStage)}
        onClose={() => setViewingStage(null)}
        title="Stage Details"
      >
        {viewingStage && (
          <div className="space-y-4 text-xs text-left">
            <div className="p-4 bg-brandPrimary/10 border border-brandPrimary/20 rounded-2xl">
              <span className="font-mono text-[10px] font-bold text-brandPrimary block mb-1">{viewingStage.seasonId} • {viewingStage.id}</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewingStage.name}</h3>
              <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full mt-2 uppercase">
                {viewingStage.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-white/5 p-3 rounded-xl text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">Stage Timer</span>
                <strong className="text-slate-800 dark:text-white font-bold">{viewingStage.timerSec}s</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Elimination</span>
                <strong className="text-rose-500 font-bold">{viewingStage.eliminationRate}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Qualify Score</span>
                <strong className="text-amber-500 font-bold">{viewingStage.qualificationMarks} Pts</strong>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Stage Rules</span>
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl font-mono text-[11px] whitespace-pre-line text-slate-800 dark:text-slate-200">
                {viewingStage.rules || 'Standard stage rules apply.'}
              </div>
            </div>
          </div>
        )}
      </RightDrawer>

      {/* WINNER SELECTION DRAWER */}
      <RightDrawer
        isOpen={showWinnerDrawer}
        onClose={() => setShowWinnerDrawer(false)}
        title="Confirm Winner Selection"
      >
        <div className="space-y-4 text-xs text-left">
          <div>
            <label className="block text-amber-500 font-bold uppercase text-[10px] mb-1">🥇 1st Place Champion</label>
            <input
              type="text"
              value={winners.first}
              onChange={e => setWinners({...winners, first: e.target.value})}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-amber-500/40 text-slate-800 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">🥈 2nd Place Runner-Up</label>
            <input
              type="text"
              value={winners.second}
              onChange={e => setWinners({...winners, second: e.target.value})}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-amber-700 font-bold uppercase text-[10px] mb-1">🥉 3rd Place Finalist</label>
            <input
              type="text"
              value={winners.third}
              onChange={e => setWinners({...winners, third: e.target.value})}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold"
            />
          </div>

          <button
            onClick={handleAnnounceWinners}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-md mt-4"
          >
            Announce & Award Winners
          </button>
        </div>
      </RightDrawer>
    </div>
  );
};

export default GrandContestManagement;
