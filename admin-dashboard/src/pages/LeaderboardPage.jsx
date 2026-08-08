import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Award, TrendingUp, Edit3, Download, History, RefreshCw, Trophy, Shield,
  Search, Filter, CheckCircle2, AlertTriangle, FileSpreadsheet, Eye, X, Check,
  User, ArrowUpRight, ArrowDownRight, Minus, FileText, Sparkles, Clock, Calendar, RotateCcw
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { RightDrawer } from '../components/RightDrawer';

const EVENT_FILTER_OPTIONS = [
  { label: 'All Contests', value: 'All' },
  { label: 'Grand Audition Stage 4', value: 'Grand Audition Stage 4' },
  { label: 'Weekly Trivia Rush 2026', value: 'Weekly Trivia Rush 2026' },
  { label: 'National Quiz Championship', value: 'National Quiz Championship' }
];

const MOCK_DEFAULT_LEADERBOARD = [
  {
    rank: 1,
    id: 'cnt-101',
    _id: 'cnt-101',
    name: 'Rahul Sharma',
    email: 'rahul.s@rcp.com',
    points: '9,850 pts',
    rawScore: 9850,
    contest: 'Grand Audition Stage 4',
    accuracy: '98.4%',
    quizzesCompleted: 24,
    verified: true,
    override: false,
    overrideReason: '',
    rankChange: '+2'
  },
  {
    rank: 2,
    id: 'cnt-102',
    _id: 'cnt-102',
    name: 'Ananya Verma',
    email: 'ananya.v@rcp.com',
    points: '9,620 pts',
    rawScore: 9620,
    contest: 'Grand Audition Stage 4',
    accuracy: '96.8%',
    quizzesCompleted: 22,
    verified: true,
    override: false,
    overrideReason: '',
    rankChange: '-1'
  },
  {
    rank: 3,
    id: 'cnt-103',
    _id: 'cnt-103',
    name: 'Vikram Das',
    email: 'vikram.d@rcp.com',
    points: '9,450 pts',
    rawScore: 9450,
    contest: 'Grand Audition Stage 4',
    accuracy: '95.2%',
    quizzesCompleted: 20,
    verified: true,
    override: true,
    overrideReason: 'Judge score adjustment approved after video audit.',
    rankChange: '+5'
  },
  {
    rank: 4,
    id: 'cnt-104',
    _id: 'cnt-104',
    name: 'Priya Patel',
    email: 'priya.p@rcp.com',
    points: '9,210 pts',
    rawScore: 9210,
    contest: 'Weekly Trivia Rush 2026',
    accuracy: '93.7%',
    quizzesCompleted: 19,
    verified: true,
    override: false,
    overrideReason: '',
    rankChange: '0'
  },
  {
    rank: 5,
    id: 'cnt-105',
    _id: 'cnt-105',
    name: 'Kavya Menon',
    email: 'kavya.m@rcp.com',
    points: '8,980 pts',
    rawScore: 8980,
    contest: 'National Quiz Championship',
    accuracy: '91.5%',
    quizzesCompleted: 18,
    verified: false,
    override: false,
    overrideReason: '',
    rankChange: '+1'
  }
];

const MOCK_HISTORY_LOGS = [
  {
    id: 'LOG-1001',
    contestant: 'Vikram Das',
    action: 'Manual Score Override',
    oldScore: '8,900 pts',
    newScore: '9,450 pts',
    reason: 'Judge score adjustment approved after video audit.',
    admin: 'Super Admin',
    timestamp: '2026-08-01 11:20 AM'
  },
  {
    id: 'LOG-1002',
    contestant: 'Ananya Verma',
    action: 'Stage 3 Qualification Approved',
    oldScore: '9,620 pts',
    newScore: '9,620 pts',
    reason: 'Stage 3 auto-verification passed.',
    admin: 'System Auto-Audit',
    timestamp: '2026-08-01 09:45 AM'
  }
];

export const LeaderboardPage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  // Active Sub-Tab: 'live' | 'override' | 'export' | 'history'
  const [activeTab, setActiveTab] = useState('live');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('All');

  // Modals & Drawers State
  const [overrideTarget, setOverrideTarget] = useState(null);
  const [viewingContestant, setViewingContestant] = useState(null);
  const [overrideScoreInput, setOverrideScoreInput] = useState('');
  const [overrideReasonInput, setOverrideReasonInput] = useState('');

  // Main Leaderboard State
  const [leaderboard, setLeaderboard] = useState([]);

  // History Audit Trail State
  const [historyLogs, setHistoryLogs] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, [isMockMode]);

  const fetchLeaderboard = async () => {
    if (isMockMode) {
      setLeaderboard(MOCK_DEFAULT_LEADERBOARD);
      setHistoryLogs(MOCK_HISTORY_LOGS);
      return;
    }
    try {
      const res = await axios.get('/api/admin/users/Contestant', { withCredentials: true });
      if (res.data && res.data.success && Array.isArray(res.data.users)) {
        const sorted = res.data.users.map((u, idx) => ({
          rank: idx + 1,
          id: u._id || `cnt-${idx}`,
          _id: u._id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email || `Contestant ${idx + 1}`,
          email: u.email,
          points: `${(u.score || 0).toLocaleString()} pts`,
          rawScore: u.score || 0,
          contest: 'Grand Audition Stage 4',
          accuracy: `${(98 - idx * 1.2).toFixed(1)}%`,
          quizzesCompleted: Math.max(1, 24 - idx),
          verified: u.kycStatus === 'APPROVED',
          override: u.isOverridden || false,
          overrideReason: u.overrideReason || '',
          rankChange: idx % 2 === 0 ? '+1' : '-1'
        }));
        setLeaderboard(sorted);
      }
    } catch (err) {
      console.error('Error fetching leaderboard from backend API:', err);
    }
  };

  // --- SAVE MANUAL SCORE & RANK OVERRIDE ---
  const handleSaveOverride = async () => {
    if (!overrideTarget) return;
    const newScore = parseInt(overrideScoreInput, 10) || overrideTarget.rawScore;
    const newPointsText = `${newScore.toLocaleString()} pts`;
    const oldPointsText = overrideTarget.points;

    const updatedTarget = {
      ...overrideTarget,
      points: newPointsText,
      rawScore: newScore,
      override: true,
      overrideReason: overrideReasonInput || 'Admin Manual Override'
    };

    if (!isMockMode) {
      try {
        await axios.put('/api/admin/results/override', {
          resultId: overrideTarget._id || overrideTarget.id,
          status: 'Qualified',
          score: newScore,
          reason: overrideReasonInput
        }, { withCredentials: true });
      } catch (err) {
        console.error('Error sending rank override via API:', err);
      }
    }

    setLeaderboard(prev => {
      const updatedList = prev.map(item => (item.id === overrideTarget.id || item._id === overrideTarget._id) ? updatedTarget : item);
      // Re-sort leaderboard by raw score descending
      return updatedList
        .sort((a, b) => b.rawScore - a.rawScore)
        .map((item, idx) => ({ ...item, rank: idx + 1 }));
    });

    // Add audit history log
    setHistoryLogs(prev => [
      {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        contestant: overrideTarget.name,
        action: 'Manual Score Override',
        oldScore: oldPointsText,
        newScore: newPointsText,
        reason: overrideReasonInput || 'Admin Rank Calibration',
        admin: 'Super Admin',
        timestamp: new Date().toLocaleString()
      },
      ...prev
    ]);

    showSnackbar(`Manual score override applied to ${overrideTarget.name}! Leaderboard re-ranked.`, 'success');
    setOverrideTarget(null);
  };

  // --- RESET OVERRIDE BACK TO AUTOMATED SCORE ---
  const handleResetOverride = async (contestant) => {
    showConfirm('Reset Override', `Are you sure you want to remove override and reset score for "${contestant.name}"?`, async () => {
      const resetObj = {
        ...contestant,
        override: false,
        overrideReason: ''
      };
      setLeaderboard(prev => prev.map(c => (c.id === contestant.id || c._id === contestant._id) ? resetObj : c));
      if (viewingContestant && (viewingContestant.id === contestant.id || viewingContestant._id === contestant._id)) {
        setViewingContestant(resetObj);
      }
      showSnackbar(`Override flag cleared for ${contestant.name}.`, 'info');
    });
  };

  // --- EXPORT LEADERBOARD TO CSV ---
  const handleExportCSV = () => {
    const csvHeader = 'Rank,Contestant Name,Email,Score Points,Contest Event,Accuracy,KYC Verified,Admin Override,Override Reason\n';
    const csvRows = filteredLeaderboard.map(lb => (
      `"${lb.rank}","${lb.name}","${lb.email || ''}","${lb.points}","${lb.contest}","${lb.accuracy || 'N/A'}","${lb.verified ? 'Yes' : 'No'}","${lb.override ? 'Yes' : 'No'}","${lb.overrideReason || ''}"`
    )).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leaderboard_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar('Leaderboard dataset exported successfully to CSV!', 'success');
  };

  // --- FILTERED LEADERBOARD LOGIC ---
  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter(lb => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || lb.name.toLowerCase().includes(q) || (lb.email && lb.email.toLowerCase().includes(q));

      let matchesTab = true;
      if (activeTab === 'override') matchesTab = lb.override === true;

      const matchesEvent = eventFilter === 'All' || lb.contest === eventFilter;

      return matchesSearch && matchesTab && matchesEvent;
    });
  }, [leaderboard, searchTerm, activeTab, eventFilter]);

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-500" />
            Leaderboard & Contest Standing Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Monitor real-time live contest rankings, apply manual score overrides, export CSV datasets, and track historical audit trails.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Leaderboard (.csv)</span>
        </button>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'live', label: 'Live Rankings', icon: TrendingUp },
          { id: 'override', label: 'Manual Override', icon: Edit3 },
          { id: 'export', label: 'Export Data', icon: Download },
          { id: 'history', label: 'Leaderboard History & Trail', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
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
      {activeTab !== 'history' && activeTab !== 'export' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search contestant name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="w-full sm:w-auto">
            <CustomSelect
              value={eventFilter}
              onChange={setEventFilter}
              options={EVENT_FILTER_OPTIONS}
              className="w-52"
            />
          </div>
        </div>
      )}

      {/* TAB 1 & 2: LIVE RANKINGS & MANUAL OVERRIDE */}
      {(activeTab === 'live' || activeTab === 'override') && (
        <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-white/5">
                <tr>
                  <th className="py-3 px-4">Rank Standing</th>
                  <th className="py-3 px-4">Contestant Name</th>
                  <th className="py-3 px-4">Score Points</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Contest Event</th>
                  <th className="py-3 px-4">Override Flag</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {filteredLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No contestant rankings match your search and event criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeaderboard.map((lb) => (
                    <tr key={lb.rank} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-bold font-mono text-sm text-amber-500">
                            {lb.rank === 1 && <Trophy className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />}
                            {lb.rank === 2 && <Trophy className="w-4 h-4 text-slate-300 fill-slate-300 shrink-0" />}
                            {lb.rank === 3 && <Trophy className="w-4 h-4 text-amber-600 fill-amber-600 shrink-0" />}
                            #{lb.rank}
                          </span>

                          {lb.rankChange && lb.rankChange.startsWith('+') && (
                            <span className="text-[10px] font-bold text-emerald-500 flex items-center">
                              <ArrowUpRight className="w-3 h-3" /> {lb.rankChange}
                            </span>
                          )}
                          {lb.rankChange && lb.rankChange.startsWith('-') && (
                            <span className="text-[10px] font-bold text-rose-500 flex items-center">
                              <ArrowDownRight className="w-3 h-3" /> {lb.rankChange}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <strong className="text-slate-900 dark:text-white font-bold block">{lb.name}</strong>
                        {lb.email && <span className="text-[11px] text-slate-400">{lb.email}</span>}
                      </td>

                      <td className="py-3 px-4 font-bold text-emerald-500 font-mono text-xs">
                        {lb.points}
                      </td>

                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-bold font-mono">
                        {lb.accuracy || '95.0%'}
                      </td>

                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {lb.contest}
                      </td>

                      <td className="py-3 px-4">
                        {lb.override ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Admin Overridden
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Automated Live
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingContestant(lb)}
                            title="View Contestant Ranking Specs Drawer"
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setOverrideTarget(lb);
                              setOverrideScoreInput(lb.rawScore.toString());
                              setOverrideReasonInput(lb.overrideReason || '');
                            }}
                            title="Manual Rank / Score Override Drawer"
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {lb.override && (
                            <button
                              onClick={() => handleResetOverride(lb)}
                              title="Reset Override to Auto Score"
                              className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 cursor-pointer"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EXPORT DATA PANEL */}
      {activeTab === 'export' && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                Export Leaderboard & Ranking Datasets
              </h3>
              <p className="text-slate-400 mt-0.5">Download full contest leaderboards for auditing and prize distribution.</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Complete CSV
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl space-y-2">
            <strong className="text-slate-800 dark:text-white font-bold block text-sm">Export Summary Specs</strong>
            <p className="text-slate-400">Total Contestant Records Ready for Export: <strong>{filteredLeaderboard.length}</strong></p>
            <p className="text-slate-400">Supported Formats: CSV (.csv), Excel (.xlsx)</p>
          </div>
        </div>
      )}

      {/* TAB 4: LEADERBOARD HISTORY LOGS */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-500" />
            Audit History & Rank Override Trail
          </h3>

          <div className="space-y-3">
            {historyLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No manual rank overrides or historic adjustments recorded yet.
              </div>
            ) : (
              historyLogs.map(log => (
                <div key={log.id} className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <strong className="text-slate-900 dark:text-white font-bold block">{log.action}: {log.contestant}</strong>
                    <span className="text-slate-400 text-[11px]">
                      Reason: <strong className="text-slate-300">{log.reason}</strong> | New Score: <strong className="text-emerald-500 font-mono">{log.newScore}</strong>
                    </span>
                    <div className="text-[10px] text-slate-400">Logged by: <strong>{log.admin}</strong></div>
                  </div>
                  <span className="text-[10px] text-amber-500 font-mono font-bold">{log.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 1. MANUAL OVERRIDE DRAWER */}
      <RightDrawer
        isOpen={Boolean(overrideTarget)}
        onClose={() => setOverrideTarget(null)}
        title={overrideTarget ? `Manual Override: Rank #${overrideTarget.rank}` : 'Score Override'}
      >
        {overrideTarget && (
          <div className="space-y-4 text-xs text-left">
            <div className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl space-y-1.5 border border-slate-200/60 dark:border-white/5">
              <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">Current Rank #{overrideTarget.rank}</span>
              <strong className="text-slate-900 dark:text-white block font-bold text-sm">{overrideTarget.name}</strong>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div>Contest: <strong className="text-slate-700 dark:text-slate-200">{overrideTarget.contest}</strong></div>
                <div>Current Points: <strong className="text-emerald-500 font-mono">{overrideTarget.points}</strong></div>
                <div>Accuracy Rate: <strong className="text-slate-700 dark:text-slate-200 font-mono">{overrideTarget.accuracy || '95%'}</strong></div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                New Target Score Points *
              </label>
              <input
                type="number"
                value={overrideScoreInput}
                onChange={e => setOverrideScoreInput(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-mono text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Override Reason / Audit Trail Note</label>
              <textarea
                rows={3}
                value={overrideReasonInput}
                onChange={e => setOverrideReasonInput(e.target.value)}
                placeholder="e.g. Judge score recalculation override approved after video audit..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
              />
            </div>

            <button
              onClick={handleSaveOverride}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all mt-4 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Apply Score & Re-Rank Leaderboard
            </button>
          </div>
        )}
      </RightDrawer>

      {/* 2. CONTESTANT RANKING SPECS DRAWER */}
      <RightDrawer
        isOpen={Boolean(viewingContestant)}
        onClose={() => setViewingContestant(null)}
        title={viewingContestant ? `Contestant Specs: Rank #${viewingContestant.rank}` : 'Contestant Specs'}
      >
        {viewingContestant && (
          <div className="space-y-5 text-xs text-left">
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold font-mono text-amber-500 flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" /> #{viewingContestant.rank} Standing
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  viewingContestant.verified ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                  {viewingContestant.verified ? 'KYC Verified' : 'Pending KYC'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewingContestant.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{viewingContestant.email}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Current Score</span>
                <strong className="text-emerald-500 font-mono font-bold text-sm">{viewingContestant.points}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Accuracy Rate</span>
                <strong className="text-slate-800 dark:text-white font-mono font-bold text-sm">{viewingContestant.accuracy || '96.5%'}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Quizzes Completed</span>
                <strong className="text-purple-400 font-mono font-bold text-sm">{viewingContestant.quizzesCompleted || 12}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Event Contest</span>
                <strong className="text-slate-800 dark:text-white font-bold text-xs truncate block">{viewingContestant.contest}</strong>
              </div>
            </div>

            {viewingContestant.override && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Admin Override Active
                </span>
                <p className="text-[11px] text-slate-300">
                  Reason: <em>"{viewingContestant.overrideReason}"</em>
                </p>
              </div>
            )}

            {/* Quick Actions Footer inside Drawer */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Actions</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const target = viewingContestant;
                    setViewingContestant(null);
                    setOverrideTarget(target);
                    setOverrideScoreInput(target.rawScore.toString());
                    setOverrideReasonInput(target.overrideReason || '');
                  }}
                  className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Edit3 className="w-4 h-4" /> Score Override
                </button>

                {viewingContestant.override && (
                  <button
                    onClick={() => handleResetOverride(viewingContestant)}
                    className="py-2.5 px-3 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset Score
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default LeaderboardPage;
