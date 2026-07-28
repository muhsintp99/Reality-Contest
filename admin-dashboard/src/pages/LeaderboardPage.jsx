import React, { useState } from 'react';
import {
  Award, TrendingUp, Edit3, Download, History, RefreshCw, Trophy, Shield
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const LeaderboardPage = () => {
  const { showSnackbar } = useAlert();
  const [activeTab, setActiveTab] = useState('live'); // live, override, export, history

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'Aarav Sharma', points: '9,840 pts', contest: 'Grand Audition Stage 4', verified: true, override: false },
    { rank: 2, name: 'Priya Nair', points: '9,620 pts', contest: 'Grand Audition Stage 4', verified: true, override: false },
    { rank: 3, name: 'Rohan Mehta', points: '9,150 pts', contest: 'Grand Audition Stage 4', verified: false, override: true },
    { rank: 4, name: 'Ananya Verma', points: '8,990 pts', contest: 'Grand Audition Stage 4', verified: true, override: false }
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-7 h-7 text-amber-500" /> Leaderboard Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Monitor real-time live contest rankings, apply admin rank overrides, export leaderboard files & track historical results.
          </p>
        </div>
        <button
          onClick={() => showSnackbar('Exporting Leaderboard Data to CSV/Excel', 'success')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg hover:bg-emerald-600"
        >
          <Download className="w-4 h-4" /> Export CSV / Excel
        </button>
      </div>

      {/* Sub-Tabs from spec */}
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
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-5 py-3.5">Rank</th>
                <th className="px-5 py-3.5">Contestant</th>
                <th className="px-5 py-3.5">Score / Points</th>
                <th className="px-5 py-3.5">Contest Event</th>
                <th className="px-5 py-3.5">Override Flag</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {leaderboard.map(lb => (
                <tr key={lb.rank} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-bold text-amber-500">
                    <span className="flex items-center gap-1.5">
                      {lb.rank === 1 && <Trophy className="w-4 h-4 text-amber-400" />}
                      #{lb.rank}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                    {lb.name}
                  </td>
                  <td className="px-5 py-4 font-bold text-emerald-500">
                    {lb.points}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {lb.contest}
                  </td>
                  <td className="px-5 py-4">
                    {lb.override ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Admin Overridden
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Automated Live
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => showSnackbar(`Manual rank override modal opened for ${lb.name}`, 'info')}
                      className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                      title="Override Rank"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
