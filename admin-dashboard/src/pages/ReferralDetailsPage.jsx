import React, { useState } from 'react';
import { Share2, DollarSign, Users, Award, Search } from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect';

export const ReferralDetailsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const referrals = [
    { id: 'REF-101', referrer: 'Ananya Verma (USR-104)', code: 'ANANYA2026', totalShares: 29, successfulInvites: 18, totalEarnings: '₹1,800', status: 'Top Partner' },
    { id: 'REF-102', referrer: 'Aarav Sharma (USR-101)', code: 'AARAV50', totalShares: 14, successfulInvites: 9, totalEarnings: '₹900', status: 'Active' },
    { id: 'REF-103', referrer: 'Priya Nair (USR-102)', code: 'PRIYA10', totalShares: 3, successfulInvites: 1, totalEarnings: '₹100', status: 'Active' }
  ];

  const filteredReferrals = referrals.filter(r => {
    const matchesSearch = r.referrer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Share2 className="w-7 h-7 text-cyan-500" /> Contestant Referral Details & Earnings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Track referral code shares, converted user signups & affiliate earnings for Contestants only.
        </p>
      </div>

      {/* Search & CustomSelect Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative z-20">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contestant referral by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary"
          />
        </div>

        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All Partner Statuses', value: 'All' },
            { label: 'Top Partner', value: 'Top Partner' },
            { label: 'Active Partner', value: 'Active' }
          ]}
          className="w-full sm:w-48"
        />
      </div>

      <div className="glassmorphism rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase font-medium">
            <tr>
              <th className="px-5 py-3.5">Contestant Referrer</th>
              <th className="px-5 py-3.5">Referral Code</th>
              <th className="px-5 py-3.5">Code Shares</th>
              <th className="px-5 py-3.5">Converted Invites</th>
              <th className="px-5 py-3.5">Earnings</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-800 dark:text-slate-200">
            {filteredReferrals.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
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
