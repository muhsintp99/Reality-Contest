import React, { useState } from 'react';
import {
  Wallet, PlusCircle, MinusCircle, Gift, AlertTriangle, Snowflake, FileText, Search
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const WalletManagementPage = () => {
  const { showSnackbar } = useAlert();
  const [activeTab, setActiveTab] = useState('logs'); // credit, debit, bonus, penalty, freeze, logs
  const [showWalletModal, setShowWalletModal] = useState(null); // 'credit', 'debit', 'bonus', 'penalty', 'freeze'

  const transactions = [
    { id: 'TXN-9901', user: 'Aarav Sharma (USR-101)', type: 'Credit', amount: '+₹500', reason: 'Prize Pool Winner', date: '2026-07-27 10:14', status: 'Completed' },
    { id: 'TXN-9902', user: 'Priya Nair (USR-102)', type: 'Penalty', amount: '-₹100', reason: 'Abusive Behaviour Penalty', date: '2026-07-27 09:30', status: 'Completed' },
    { id: 'TXN-9903', user: 'Rohan Mehta (USR-103)', type: 'Freeze Wallet', amount: '₹0', reason: 'Fraud Suspicion Investigation', date: '2026-07-26 18:45', status: 'Frozen' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-7 h-7 text-emerald-500" /> Wallet Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Manual wallet adjustments (Credit, Debit, Bonus, Penalty), Freeze Wallets & Audit Logs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowWalletModal('credit')} className="flex items-center gap-1 px-3 py-2 bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow hover:bg-emerald-600">
            <PlusCircle className="w-4 h-4" /> Credit
          </button>
          <button onClick={() => setShowWalletModal('debit')} className="flex items-center gap-1 px-3 py-2 bg-rose-500 text-white font-semibold text-xs rounded-xl shadow hover:bg-rose-600">
            <MinusCircle className="w-4 h-4" /> Debit
          </button>
          <button onClick={() => setShowWalletModal('bonus')} className="flex items-center gap-1 px-3 py-2 bg-amber-500 text-white font-semibold text-xs rounded-xl shadow hover:bg-amber-600">
            <Gift className="w-4 h-4" /> Bonus
          </button>
          <button onClick={() => setShowWalletModal('freeze')} className="flex items-center gap-1 px-3 py-2 bg-slate-700 text-white font-semibold text-xs rounded-xl shadow hover:bg-slate-800">
            <Snowflake className="w-4 h-4" /> Freeze
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'logs', label: 'Transaction Logs', icon: FileText },
          { id: 'credit', label: 'Credit', icon: PlusCircle },
          { id: 'debit', label: 'Debit', icon: MinusCircle },
          { id: 'bonus', label: 'Bonus', icon: Gift },
          { id: 'penalty', label: 'Penalty', icon: AlertTriangle },
          { id: 'freeze', label: 'Freeze Wallet', icon: Snowflake }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-5 py-3.5">Transaction ID</th>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Reason / Remarks</th>
                <th className="px-5 py-3.5">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {transactions.map(txn => (
                <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{txn.id}</td>
                  <td className="px-5 py-4 font-medium">{txn.user}</td>
                  <td className="px-5 py-4 font-bold">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] ${
                      txn.type === 'Credit' || txn.type === 'Bonus' ? 'bg-emerald-500/10 text-emerald-500' :
                      txn.type === 'Freeze Wallet' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-rose-500/10 text-rose-500'
                    }`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{txn.amount}</td>
                  <td className="px-5 py-4 text-slate-400">{txn.reason}</td>
                  <td className="px-5 py-4 text-slate-400">{txn.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WalletManagementPage;
