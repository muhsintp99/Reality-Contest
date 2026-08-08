import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Landmark, Clock, CheckCircle, XCircle, RefreshCw, Download, Building, Shield,
  Search, Eye, Check, AlertTriangle, FileSpreadsheet, ArrowUpRight, User
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { RightDrawer } from '../components/RightDrawer';

const MOCK_DEFAULT_WITHDRAWALS = [
  {
    id: 'WTD-401',
    _id: 'WTD-401',
    user: 'Rahul Sharma',
    email: 'rahul.s@rcp.com',
    amount: '₹2,500',
    rawAmount: 2500,
    bank: 'HDFC Bank (A/C: ****4892)',
    accountNumber: '501004892312',
    ifsc: 'HDFC0001234',
    upi: 'rahul@okaxis',
    status: 'Pending',
    requestedAt: '2026-08-01 04:12 AM',
    notes: 'Stage 1 Contest Payout Request'
  },
  {
    id: 'WTD-402',
    _id: 'WTD-402',
    user: 'Priya Nair',
    email: 'priya.n@rcp.com',
    amount: '₹1,200',
    rawAmount: 1200,
    bank: 'ICICI Bank (A/C: ****9102)',
    accountNumber: '623491028441',
    ifsc: 'ICIC0005678',
    upi: 'priya@ybl',
    status: 'Processing',
    requestedAt: '2026-07-31 10:30 PM',
    notes: 'Weekly Quiz Reward Redemption'
  },
  {
    id: 'WTD-403',
    _id: 'WTD-403',
    user: 'Ananya Verma',
    email: 'ananya.v@rcp.com',
    amount: '₹5,000',
    rawAmount: 5000,
    bank: 'State Bank of India (A/C: ****1190)',
    accountNumber: '334911904551',
    ifsc: 'SBIN0002100',
    upi: 'ananya@sbi',
    status: 'Approved',
    requestedAt: '2026-07-30 02:15 PM',
    notes: 'Grand Prize Podium Payout'
  },
  {
    id: 'WTD-404',
    _id: 'WTD-404',
    user: 'Rohan Mehta',
    email: 'rohan.m@rcp.com',
    amount: '₹800',
    rawAmount: 800,
    bank: 'Axis Bank (A/C: ****3321)',
    accountNumber: '912033214552',
    ifsc: 'UTIB0000123',
    upi: 'rohan@axis',
    status: 'Rejected',
    requestedAt: '2026-07-29 11:45 AM',
    notes: 'Account name mismatch with KYC document'
  }
];

export const WithdrawalManagementPage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  // Sub-Tab State: 'all' | 'pending' | 'processing' | 'approved' | 'rejected'
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Drawers
  const [viewingWithdrawal, setViewingWithdrawal] = useState(null);

  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    fetchWithdrawals();
  }, [isMockMode]);

  const fetchWithdrawals = async () => {
    if (isMockMode) {
      setWithdrawals(MOCK_DEFAULT_WITHDRAWALS);
      return;
    }
    try {
      const res = await axios.get('/api/admin/withdrawals', { withCredentials: true });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setWithdrawals(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching withdrawal requests via API:', err);
    }
  };

  const handleStatusChange = async (withdrawal, newStatus) => {
    const id = withdrawal.id || withdrawal._id;

    if (!isMockMode) {
      try {
        await axios.put(`/api/admin/withdrawals/${withdrawal._id || id}/status`, { status: newStatus }, { withCredentials: true });
      } catch (err) {
        console.error('Error updating withdrawal status via API:', err);
      }
    }

    setWithdrawals(prev => prev.map(w => (w.id === id || w._id === id) ? { ...w, status: newStatus } : w));
    if (viewingWithdrawal && (viewingWithdrawal.id === id || viewingWithdrawal._id === id)) {
      setViewingWithdrawal(prev => ({ ...prev, status: newStatus }));
    }
    showSnackbar(`Withdrawal request ${id} updated to ${newStatus}!`, 'success');
  };

  const handleExportCSV = () => {
    const csvHeader = 'Withdrawal ID,Contestant User,Email,Amount,Bank Name,Account Number,IFSC Code,UPI ID,Status,Requested Date & Time\n';
    const csvRows = filteredWithdrawals.map(w => (
      `"${w.id}","${w.user}","${w.email || ''}","${w.amount}","${w.bank}","${w.accountNumber || ''}","${w.ifsc}","${w.upi}","${w.status}","${w.requestedAt}"`
    )).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `withdrawal_requests_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar('Withdrawal requests report exported to CSV successfully!', 'success');
  };

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter(w => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        w.user.toLowerCase().includes(q) ||
        (w.email && w.email.toLowerCase().includes(q)) ||
        (w.id && w.id.toLowerCase().includes(q)) ||
        (w.upi && w.upi.toLowerCase().includes(q));

      let matchesTab = true;
      if (activeTab === 'pending') matchesTab = w.status === 'Pending';
      else if (activeTab === 'processing') matchesTab = w.status === 'Processing';
      else if (activeTab === 'approved') matchesTab = w.status === 'Approved';
      else if (activeTab === 'rejected') matchesTab = w.status === 'Rejected';

      const matchesStatus = statusFilter === 'All' || w.status === statusFilter;

      return matchesSearch && matchesTab && matchesStatus;
    });
  }, [withdrawals, searchTerm, activeTab, statusFilter]);

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2.5">
            <Landmark className="w-6 h-6 text-blue-500" />
            Withdrawal Request & Payout Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Audit, process, approve or reject contestant withdrawal requests with bank and UPI detail verification.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Payouts Report (.csv)</span>
        </button>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'pending', label: 'Pending Approval', icon: Clock },
          { id: 'processing', label: 'In Processing', icon: RefreshCw },
          { id: 'approved', label: 'Approved Payouts', icon: CheckCircle },
          { id: 'rejected', label: 'Rejected Requests', icon: XCircle },
          { id: 'all', label: 'All Requests', icon: Landmark }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search request ID, user, email or UPI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="w-full sm:w-auto">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Statuses', value: 'All' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Processing', value: 'Processing' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Rejected', value: 'Rejected' }
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="py-3 px-4">Request ID & User</th>
                <th className="py-3 px-4">Payout Amount</th>
                <th className="py-3 px-4">Bank / UPI Transfer Details</th>
                <th className="py-3 px-4">Requested Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No withdrawal requests match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map(w => (
                  <tr key={w.id || w._id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-blue-500 font-mono">{w.id || w._id}</div>
                      <strong className="text-slate-900 dark:text-white block font-bold">{w.user}</strong>
                      {w.email && <span className="text-[11px] text-slate-400">{w.email}</span>}
                    </td>

                    <td className="py-3 px-4 font-bold text-emerald-500 text-sm font-mono">
                      {w.amount}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{w.bank}</div>
                      <div className="text-[11px] text-slate-400 font-mono">IFSC: {w.ifsc} • UPI: {w.upi}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {w.requestedAt}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        w.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        w.status === 'Processing' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                        w.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {w.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingWithdrawal(w)}
                          title="View Payout Specs Drawer"
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {w.status !== 'Approved' && (
                          <button
                            onClick={() => handleStatusChange(w, 'Approved')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 cursor-pointer"
                            title="Approve & Release Payout"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {w.status !== 'Rejected' && (
                          <button
                            onClick={() => handleStatusChange(w, 'Rejected')}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer"
                            title="Reject Payout Request"
                          >
                            <XCircle className="w-4 h-4" />
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

      {/* WITHDRAWAL SPECS RIGHTDRAWER */}
      <RightDrawer
        isOpen={Boolean(viewingWithdrawal)}
        onClose={() => setViewingWithdrawal(null)}
        title={viewingWithdrawal ? `Withdrawal Request: ${viewingWithdrawal.id || viewingWithdrawal._id}` : 'Withdrawal Specs'}
      >
        {viewingWithdrawal && (
          <div className="space-y-5 text-xs text-left">
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold font-mono text-blue-500 uppercase bg-blue-500/10 px-2 py-0.5 rounded">
                  {viewingWithdrawal.id || viewingWithdrawal._id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  viewingWithdrawal.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                  viewingWithdrawal.status === 'Processing' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                  viewingWithdrawal.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                  'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                  {viewingWithdrawal.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewingWithdrawal.user}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{viewingWithdrawal.email}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Payout Amount</span>
                <strong className="text-emerald-500 font-mono font-bold text-base">{viewingWithdrawal.amount}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Requested On</span>
                <strong className="text-slate-800 dark:text-white font-mono font-bold text-xs">{viewingWithdrawal.requestedAt}</strong>
              </div>
            </div>

            {/* Bank Specs */}
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2">
              <strong className="block text-slate-800 dark:text-white font-bold text-sm">Banking & Transfer Details:</strong>
              <div className="space-y-1 text-slate-300 font-mono">
                <div>Bank: <strong className="text-white">{viewingWithdrawal.bank}</strong></div>
                <div>Account No: <strong className="text-white">{viewingWithdrawal.accountNumber || '501004892312'}</strong></div>
                <div>IFSC Code: <strong className="text-amber-400">{viewingWithdrawal.ifsc}</strong></div>
                <div>UPI Address: <strong className="text-emerald-400">{viewingWithdrawal.upi}</strong></div>
              </div>
            </div>

            {/* Notes */}
            {viewingWithdrawal.notes && (
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Request Audit Note</span>
                <p className="text-slate-300 text-xs">{viewingWithdrawal.notes}</p>
              </div>
            )}

            {/* Action Buttons inside Drawer */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admin Payout Decision</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStatusChange(viewingWithdrawal, 'Approved')}
                  disabled={viewingWithdrawal.status === 'Approved'}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <CheckCircle className="w-4 h-4" /> Approve & Payout
                </button>

                <button
                  onClick={() => handleStatusChange(viewingWithdrawal, 'Rejected')}
                  disabled={viewingWithdrawal.status === 'Rejected'}
                  className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <XCircle className="w-4 h-4" /> Reject Request
                </button>
              </div>
            </div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default WithdrawalManagementPage;
