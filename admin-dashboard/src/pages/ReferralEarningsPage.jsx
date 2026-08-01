import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Search, Eye, RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { RightDrawer } from '../components/RightDrawer';

export const ReferralEarningsPage = () => {
  const { showSnackbar } = useAlert();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [earnings, setEarnings] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/referrals/earnings', {
        params: { status: statusFilter !== 'All' ? statusFilter : undefined, search: searchTerm || undefined },
        withCredentials: true
      });
      if (res.data.success) {
        setEarnings(res.data.earnings || []);
      }
    } catch (err) {
      console.warn('[ReferralEarningsPage] Error fetching earnings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [statusFilter, searchTerm]);

  const openDrawer = (tx) => {
    setSelectedTx(tx);
    setDrawerOpen(true);
  };

  // Metrics calculation
  const totalPayout = earnings.reduce((acc, curr) => acc + (curr.earningAmount || 0), 0);
  const totalCredited = earnings.filter(e => e.status === 'Credited').length;

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-brandPrimary" />
            <span>Referral Earnings Ledger</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Real-time audit log of referral commissions, signup bonuses, and payout distributions.
          </p>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glassmorphism p-5 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Referral Earnings</span>
          <h3 className="text-xl font-extrabold text-brandPrimary mt-1">₹{totalPayout.toLocaleString()}</h3>
        </div>
        <div className="glassmorphism p-5 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Credited Transactions</span>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{totalCredited} Payouts</h3>
        </div>
        <div className="glassmorphism p-5 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Entries Logged</span>
          <h3 className="text-xl font-extrabold text-blue-500 mt-1">{earnings.length} Records</h3>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 relative z-20">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Search earnings by code or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/90 dark:bg-[#0c1322]/60 border border-slate-300/80 dark:border-white/10 rounded-xl pl-11 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
          />
        </div>
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All Statuses', value: 'All' },
            { label: 'Credited Payouts', value: 'Credited' },
            { label: 'Pending Approval', value: 'Pending' },
            { label: 'Flagged Entries', value: 'Flagged' }
          ]}
        />
      </div>

      {/* Table / Empty State */}
      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-brandPrimary font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading Earnings Data...</span>
        </div>
      ) : earnings.length === 0 ? (
        <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
          <DollarSign className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Referral Earnings Logged Yet</h4>
          <p className="text-xs text-slate-500 dark:text-white/40">Referral payout transactions will automatically populate here as contestants sign up.</p>
        </div>
      ) : (
        <div className="glassmorphism rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden divide-y divide-slate-200/50 dark:divide-white/5 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/70 dark:bg-white/5 text-slate-600 dark:text-white/50 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Referrer Code & User</th>
                  <th className="px-6 py-4">Referred Contestant</th>
                  <th className="px-6 py-4">Bonus Type</th>
                  <th className="px-6 py-4">Earning Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 text-slate-800 dark:text-white/80">
                {earnings.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary rounded-md font-mono font-bold text-[11px]">
                        {tx.referrerCode}
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white text-xs mt-1">{tx.referrerUser}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      {tx.referredUser}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {tx.bonusType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      +₹{tx.earningAmount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.status === 'Credited' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right pr-6">
                      <button onClick={() => openDrawer(tx)} className="p-1.5 bg-blue-500/10 text-blue-600 rounded-full cursor-pointer">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RightDrawer Detail Preview */}
      <RightDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="REFERRAL PAYOUT DETAILS">
        {selectedTx && (
          <div className="space-y-4 text-left">
            <span className="px-3 py-1 bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary font-mono font-bold text-sm rounded-xl">
              {selectedTx.referrerCode}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">Referrer: {selectedTx.referrerUser}</h3>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2 text-xs">
              <p><strong>Referred User:</strong> {selectedTx.referredUser}</p>
              <p><strong>Bonus Type:</strong> {selectedTx.bonusType}</p>
              <p><strong>Amount Credited:</strong> ₹{selectedTx.earningAmount}</p>
              <p><strong>Status:</strong> {selectedTx.status}</p>
            </div>
            <button onClick={() => setDrawerOpen(false)} className="w-full py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold cursor-pointer">
              Close Preview
            </button>
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default ReferralEarningsPage;
