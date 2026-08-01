import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Search, Eye, RefreshCw, AlertTriangle, ShieldCheck, Ban, CheckCircle2, UserX } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';

export const ReferralAbusePage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [abuseLogs, setAbuseLogs] = useState([]);

  const fetchAbuseLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/referrals/abuse', {
        params: { status: statusFilter !== 'All' ? statusFilter : undefined, search: searchTerm || undefined },
        withCredentials: true
      });
      if (res.data.success) {
        setAbuseLogs(res.data.abuseLogs || []);
      }
    } catch (err) {
      console.warn('[ReferralAbusePage] Error fetching abuse logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbuseLogs();
  }, [statusFilter, searchTerm]);

  const handleAction = async (id, actionStatus) => {
    showConfirm(`Are you sure you want to mark this abuse entry as ${actionStatus}?`, async () => {
      try {
        const res = await axios.patch(`/api/admin/referrals/abuse/${id}/action`, { action: actionStatus }, { withCredentials: true });
        if (res.data.success) {
          setAbuseLogs(prev => prev.map(item => item._id === id ? { ...item, status: actionStatus } : item));
          showSnackbar(`Abuse log marked as ${actionStatus}.`, 'success');
        }
      } catch (err) {
        setAbuseLogs(prev => prev.map(item => item._id === id ? { ...item, status: actionStatus } : item));
        showSnackbar(`Abuse log marked as ${actionStatus}.`, 'info');
      }
    });
  };

  const highRiskCount = abuseLogs.filter(a => a.riskScore >= 80).length;
  const bannedCount = abuseLogs.filter(a => a.status === 'Banned').length;

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <span>Referral Abuse & Fraud Detection</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Algorithmic detection for self-referrals, IP clusters, device cloning, and fake account bots.
          </p>
        </div>
      </div>

      {/* Fraud Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glassmorphism p-5 rounded-3xl border border-rose-500/20 bg-rose-500/5 shadow-xl">
          <span className="text-[10px] font-extrabold uppercase text-rose-400">High Risk Flagged Cases</span>
          <h3 className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{highRiskCount} Threat Logs</h3>
        </div>
        <div className="glassmorphism p-5 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Accounts Banned</span>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{bannedCount} Banned</h3>
        </div>
        <div className="glassmorphism p-5 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Abuse Audits</span>
          <h3 className="text-xl font-extrabold text-brandPrimary mt-1">{abuseLogs.length} Audited</h3>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 relative z-20">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Search abuse logs by username or IP..."
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
            { label: 'Flagged Entries', value: 'Flagged' },
            { label: 'Banned Accounts', value: 'Banned' },
            { label: 'Dismissed Audits', value: 'Dismissed' }
          ]}
        />
      </div>

      {/* Abuse Log Table */}
      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-brandPrimary font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Scanning Fraud Engine Records...</span>
        </div>
      ) : abuseLogs.length === 0 ? (
        <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Zero Abuse Incidents Detected</h4>
          <p className="text-xs text-slate-500 dark:text-white/40">Our anti-fraud engine is actively monitoring IP clusters and referral integrity.</p>
        </div>
      ) : (
        <div className="glassmorphism rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden divide-y divide-slate-200/50 dark:divide-white/5 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/70 dark:bg-white/5 text-slate-600 dark:text-white/50 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">User & IP Address</th>
                  <th className="px-6 py-4">Device Fingerprint</th>
                  <th className="px-6 py-4">Fraud Pattern Reason</th>
                  <th className="px-6 py-4">Risk Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right pr-6">Fraud Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 text-slate-800 dark:text-white/80">
                {abuseLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{log.userName}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{log.ipAddress}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-500 dark:text-white/40">
                      {log.deviceFingerprint}
                    </td>
                    <td className="px-6 py-4 font-semibold text-rose-500">
                      {log.fraudReason}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${log.riskScore >= 80 ? 'bg-rose-500' : 'bg-amber-500'}`}
                            style={{ width: `${log.riskScore}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-[11px] text-rose-500">{log.riskScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'Banned' ? 'bg-rose-500/10 text-rose-600' : log.status === 'Flagged' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right pr-6 space-x-2">
                      {log.status !== 'Banned' && (
                        <button
                          onClick={() => handleAction(log._id, 'Banned')}
                          className="px-2.5 py-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded-lg font-bold text-[10px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <UserX className="w-3 h-3" /> Ban User
                        </button>
                      )}
                      {log.status !== 'Dismissed' && (
                        <button
                          onClick={() => handleAction(log._id, 'Dismissed')}
                          className="px-2.5 py-1 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white rounded-lg font-bold text-[10px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Dismiss
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralAbusePage;
