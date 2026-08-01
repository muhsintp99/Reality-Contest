import React, { useState } from 'react';
import { History, Trophy, Award, Search } from 'lucide-react';

export const ContestHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const history = [
    { id: 'HST-101', user: 'Aarav Sharma', contest: 'Grand Audition Season 1 Stage 4', rank: '#1 Winner', score: '9,840 pts', date: '2026-07-26' },
    { id: 'HST-102', user: 'Priya Nair', contest: 'Grand Audition Season 1 Stage 4', rank: '#2 Qualified', score: '9,620 pts', date: '2026-07-26' },
    { id: 'HST-103', user: 'Ananya Verma', contest: 'Speed Tapper Rush', rank: '#4 Completed', score: '8,990 pts', date: '2026-07-25' }
  ];

  const filteredHistory = history.filter(h =>
    h.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.contest.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-7 h-7 text-purple-500" /> Contestant Contest History Audit Log
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Review contestant participation history, ranks achieved & historical scores for Contestants only.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative z-20">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contestant history by name, contest or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary"
          />
        </div>
      </div>

      <div className="glassmorphism rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase font-medium">
            <tr>
              <th className="px-5 py-3.5">Log ID / Contestant</th>
              <th className="px-5 py-3.5">Contest Event</th>
              <th className="px-5 py-3.5">Rank Achieved</th>
              <th className="px-5 py-3.5">Score</th>
              <th className="px-5 py-3.5">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-800 dark:text-slate-200">
            {filteredHistory.map(h => (
              <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{h.user}<div className="text-[11px] text-slate-400">{h.id}</div></td>
                <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">{h.contest}</td>
                <td className="px-5 py-4 font-bold text-amber-500">{h.rank}</td>
                <td className="px-5 py-4 font-bold text-emerald-500">{h.score}</td>
                <td className="px-5 py-4 text-slate-400">{h.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContestHistoryPage;
