import React from 'react';
import { History, Trophy, Award } from 'lucide-react';

export const ContestHistoryPage = () => {
  const history = [
    { id: 'HST-101', user: 'Aarav Sharma', contest: 'Grand Audition Season 1 Stage 4', rank: '#1 Winner', score: '9,840 pts', date: '2026-07-26' },
    { id: 'HST-102', user: 'Priya Nair', contest: 'Grand Audition Season 1 Stage 4', rank: '#2 Qualified', score: '9,620 pts', date: '2026-07-26' },
    { id: 'HST-103', user: 'Ananya Verma', contest: 'Speed Tapper Rush', rank: '#4 Completed', score: '8,990 pts', date: '2026-07-25' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-7 h-7 text-purple-500" /> Contest History Audit Log
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Review contestant participation history, ranks achieved & historical scores.</p>
      </div>

      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase font-medium">
            <tr>
              <th className="px-5 py-3.5">Log ID / User</th>
              <th className="px-5 py-3.5">Contest Event</th>
              <th className="px-5 py-3.5">Rank Achieved</th>
              <th className="px-5 py-3.5">Score</th>
              <th className="px-5 py-3.5">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {history.map(h => (
              <tr key={h.id}>
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
