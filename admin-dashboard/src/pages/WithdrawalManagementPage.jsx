import React, { useState } from 'react';
import {
  Landmark, Clock, CheckCircle, XCircle, RefreshCw, Download, Building, Shield
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const WithdrawalManagementPage = () => {
  const { showSnackbar } = useAlert();
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected, processing, export, bank

  const [withdrawals, setWithdrawals] = useState([
    { id: 'WTD-401', user: 'Aarav Sharma', amount: '₹2,500', bank: 'HDFC Bank (A/C: ****4892)', ifsc: 'HDFC0001234', upi: 'aarav@okaxis', status: 'Pending', requestedAt: '2026-07-27 04:12' },
    { id: 'WTD-402', user: 'Priya Nair', amount: '₹1,200', bank: 'ICICI Bank (A/C: ****9102)', ifsc: 'ICIC0005678', upi: 'priya@ybl', status: 'Processing', requestedAt: '2026-07-26 22:30' }
  ]);

  const handleStatusChange = (id, newStatus) => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: newStatus } : w));
    showSnackbar(`Withdrawal ${id} marked as ${newStatus}`, 'success');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-7 h-7 text-blue-500" /> Withdrawal Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Approve, process or reject withdrawal requests, view bank/UPI details & export reports.
          </p>
        </div>
        <button
          onClick={() => showSnackbar('Exporting Withdrawal Requests to Excel', 'success')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow hover:bg-emerald-600"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'pending', label: 'Pending', icon: Clock },
          { id: 'processing', label: 'Processing', icon: RefreshCw },
          { id: 'approved', label: 'Approved', icon: CheckCircle },
          { id: 'rejected', label: 'Rejected', icon: XCircle },
          { id: 'bank', label: 'Bank Details', icon: Building },
          { id: 'export', label: 'Export', icon: Download }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-5 py-3.5">ID / User</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Bank / UPI Info</th>
                <th className="px-5 py-3.5">Requested At</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {withdrawals.map(w => (
                <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{w.id}</div>
                    <div className="text-[11px] text-slate-400">{w.user}</div>
                  </td>
                  <td className="px-5 py-4 font-bold text-emerald-500 text-sm">
                    {w.amount}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{w.bank}</div>
                    <div className="text-[10px] text-slate-400">IFSC: {w.ifsc} • UPI: {w.upi}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-400">{w.requestedAt}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      w.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                      w.status === 'Processing' ? 'bg-blue-500/10 text-blue-500' :
                      w.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {w.status !== 'Approved' && (
                        <button
                          onClick={() => handleStatusChange(w.id, 'Approved')}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                          title="Approve Withdrawal"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {w.status !== 'Rejected' && (
                        <button
                          onClick={() => handleStatusChange(w.id, 'Rejected')}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                          title="Reject Withdrawal"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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

export default WithdrawalManagementPage;
