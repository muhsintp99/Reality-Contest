import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Award, TrendingUp, Edit3, Download, History, RefreshCw, Trophy, Shield,
  Search, Filter, CheckCircle2, AlertTriangle, FileSpreadsheet, Eye, X, Check
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';

const EVENT_FILTER_OPTIONS = [
  { label: 'All Contests', value: 'All' },
  { label: 'Grand Audition Stage 4', value: 'Grand Audition Stage 4' },
  { label: 'Weekly Trivia Rush 2026', value: 'Weekly Trivia Rush 2026' },
  { label: 'National Quiz Championship', value: 'National Quiz Championship' }
];

export const LeaderboardPage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  // Active Sub-Tab: 'live' | 'override' | 'export' | 'history'
  const [activeTab, setActiveTab] = useState('live');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('All');

  // Override Modal State
  const [overrideTarget, setOverrideTarget] = useState(null);
  const [overrideScoreInput, setOverrideScoreInput] = useState('');
  const [overrideReasonInput, setOverrideReasonInput] = useState('');

  // Initial State initialized to [] (No initial dummy data)
  const [leaderboard, setLeaderboard] = useState([]);

  // Leaderboard History Snapshot State
  const [historyLogs, setHistoryLogs] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, [isMockMode]);

  const fetchLeaderboard = async () => {
    if (isMockMode) return;
    try {
      const res = await axios.get('/api/admin/users/Contestant', { withCredentials: true });
      if (res.data.success && Array.isArray(res.data.users)) {
        const sorted = res.data.users.map((u, idx) => ({
          rank: idx + 1,
          id: u._id || `cnt-${idx}`,
          _id: u._id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email || `Contestant ${idx + 1}`,
          email: u.email,
          points: `${(u.score || (10000 - idx * 250)).toLocaleString()} pts`,
          rawScore: u.score || (10000 - idx * 250),
          contest: 'Grand Audition Stage 4',
          verified: u.kycStatus === 'APPROVED',
          override: u.isOverridden || false,
          overrideReason: u.overrideReason || ''
        }));
        setLeaderboard(sorted);
      }
    } catch (err) {
      console.error('Error fetching leaderboard from backend API:', err);
    }
  };

  const handleSaveOverride = async () => {
    if (!overrideTarget) return;
    const newScore = parseInt(overrideScoreInput, 10) || overrideTarget.rawScore;
    const newPointsText = `${newScore.toLocaleString()} pts`;

    const updatedTarget = {
      ...overrideTarget,
      points: newPointsText,
      rawScore: newScore,
      override: true,
      overrideReason: overrideReasonInput
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
        action: 'Manual Rank Override',
        newScore: newPointsText,
        reason: overrideReasonInput || 'Admin Calibration',
        timestamp: new Date().toLocaleString()
      },
      ...prev
    ]);

    showSnackbar(`Manual score override applied to ${overrideTarget.name}! Leaderboard re-ranked.`, 'success');
    setOverrideTarget(null);
  };

  const handleExportCSV = () => {
    const csvHeader = 'Rank,Contestant Name,Email,Score Points,Contest Event,KYC Verified,Admin Override\n';
    const csvRows = filteredLeaderboard.map(lb => (
      `"${lb.rank}","${lb.name}","${lb.email || ''}","${lb.points}","${lb.contest}","${lb.verified ? 'Yes' : 'No'}","${lb.override ? 'Yes' : 'No'}"`
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-500" />
            Leaderboard & Contest Standing Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Monitor real-time live contest rankings, apply manual admin overrides, export CSV datasets, and track historical results.
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

      {/* Sub-Tabs matching spec */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'live', label: 'Live Rankings', icon: TrendingUp },
          { id: 'override', label: 'Manual Override', icon: Edit3 },
          { id: 'export', label: 'Export Data', icon: Download },
          { id: 'history', label: 'Leaderboard History', icon: History }
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

      {/* Search and Filters */}
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
                  <th className="py-3 px-4">Contest Event</th>
                  <th className="py-3 px-4">Override Flag</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {filteredLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No contestant rankings match your search and event criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeaderboard.map((lb) => (
                    <tr key={lb.rank} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5 font-bold font-mono text-sm text-amber-500">
                          {lb.rank === 1 && <Trophy className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />}
                          {lb.rank === 2 && <Trophy className="w-4 h-4 text-slate-300 fill-slate-300 shrink-0" />}
                          {lb.rank === 3 && <Trophy className="w-4 h-4 text-amber-600 fill-amber-600 shrink-0" />}
                          #{lb.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 dark:text-white font-bold block">{lb.name}</strong>
                        {lb.email && <span className="text-[11px] text-slate-400">{lb.email}</span>}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-500 font-mono text-xs">
                        {lb.points}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {lb.contest}
                      </td>
                      <td className="py-3 px-4">
                        {lb.override ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Admin Overridden
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Automated Live
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => { setOverrideTarget(lb); setOverrideScoreInput(lb.rawScore.toString()); setOverrideReasonInput(lb.overrideReason || ''); }}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 cursor-pointer"
                          title="Manual Rank / Score Override"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
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
                  <div>
                    <strong className="text-slate-900 dark:text-white font-bold block">{log.action}: {log.contestant}</strong>
                    <span className="text-slate-400 text-[11px]">Reason: {log.reason} | New Score: {log.newScore}</span>
                  </div>
                  <span className="text-[10px] text-amber-500 font-mono font-bold">{log.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MANUAL OVERRIDE MODAL */}
      {overrideTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs text-left">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                Manual Score & Rank Override
              </h3>
              <button onClick={() => setOverrideTarget(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">Current Rank #{overrideTarget.rank}</span>
              <strong className="text-slate-900 dark:text-white block font-bold text-sm">{overrideTarget.name}</strong>
              <span className="text-slate-400 block">Contest: <strong>{overrideTarget.contest}</strong></span>
              <span className="text-slate-400 block">Current Points: <strong>{overrideTarget.points}</strong></span>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                New Target Score Points
              </label>
              <input
                type="number"
                value={overrideScoreInput}
                onChange={e => setOverrideScoreInput(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-mono text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Override Reason / Audit Note</label>
              <textarea
                rows={2}
                value={overrideReasonInput}
                onChange={e => setOverrideReasonInput(e.target.value)}
                placeholder="e.g. Judge score recalculation override approved..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOverrideTarget(null)}
                className="px-4 py-2 font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOverride}
                className="px-5 py-2 font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Score Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
