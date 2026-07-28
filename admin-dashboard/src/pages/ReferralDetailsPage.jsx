import React from 'react';
import { Share2, DollarSign, Users, Award } from 'lucide-react';

export const ReferralDetailsPage = () => {
  const referrals = [
    { id: 'REF-101', referrer: 'Ananya Verma (USR-104)', code: 'ANANYA2026', totalShares: 29, successfulInvites: 18, totalEarnings: '₹1,800', status: 'Top Partner' },
    { id: 'REF-102', referrer: 'Aarav Sharma (USR-101)', code: 'AARAV50', totalShares: 14, successfulInvites: 9, totalEarnings: '₹900', status: 'Active' },
    { id: 'REF-103', referrer: 'Priya Nair (USR-102)', code: 'PRIYA10', totalShares: 3, successfulInvites: 1, totalEarnings: '₹100', status: 'Active' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Share2 className="w-7 h-7 text-cyan-500" /> Referral Details & Earnings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Track referral code shares, converted user signups & affiliate earnings.</p>
      </div>

      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase font-medium">
            <tr>
              <th className="px-5 py-3.5">Referrer</th>
              <th className="px-5 py-3.5">Referral Code</th>
              <th className="px-5 py-3.5">Code Shares</th>
              <th className="px-5 py-3.5">Converted Invites</th>
              <th className="px-5 py-3.5">Earnings</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {referrals.map(r => (
              <tr key={r.id}>
                <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{r.referrer}<div className="text-[11px] text-slate-400">{r.id}</div></td>
                <td className="px-5 py-4 font-mono font-bold text-brandPrimary bg-brandPrimary/10 px-2 py-0.5 rounded w-fit">{r.code}</td>
                <td className="px-5 py-4 font-semibold">{r.totalShares} Shares</td>
                <td className="px-5 py-4 font-bold text-emerald-500">{r.successfulInvites} Users</td>
                <td className="px-5 py-4 font-bold text-amber-500 text-sm">{r.totalEarnings}</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-500">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReferralDetailsPage;
