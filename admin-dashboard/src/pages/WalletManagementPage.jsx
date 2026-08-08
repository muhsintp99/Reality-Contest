import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Wallet, PlusCircle, MinusCircle, Gift, AlertTriangle, Snowflake,
  FileText, Search, Download, Filter, RefreshCw, UserCheck, ShieldAlert,
  CheckCircle2, X, ArrowUpRight, ArrowDownRight, Clock, User
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { RightDrawer } from '../components/RightDrawer';

const MOCK_DEFAULT_TRANSACTIONS = [
  {
    id: 'TXN-9901',
    user: 'Rahul Sharma',
    userEmail: 'rahul.s@rcp.com',
    userId: 'cnt-101',
    type: 'Credit',
    amount: '+₹500',
    rawAmount: 500,
    reason: 'Grand Audition Stage 1 Prize Pool Winnings',
    date: '2026-08-01 10:14 AM',
    status: 'Completed'
  },
  {
    id: 'TXN-9902',
    user: 'Priya Nair',
    userEmail: 'priya.n@rcp.com',
    userId: 'cnt-102',
    type: 'Penalty',
    amount: '-₹100',
    rawAmount: -100,
    reason: 'Abusive Chat Behaviour Fine',
    date: '2026-08-01 09:30 AM',
    status: 'Completed'
  },
  {
    id: 'TXN-9903',
    user: 'Rohan Mehta',
    userEmail: 'rohan.m@rcp.com',
    userId: 'cnt-103',
    type: 'Freeze Wallet',
    amount: '₹0',
    rawAmount: 0,
    reason: 'Multiple Account Fraud Suspicion Investigation',
    date: '2026-07-31 06:45 PM',
    status: 'Frozen'
  },
  {
    id: 'TXN-9904',
    user: 'Ananya Verma',
    userEmail: 'ananya.v@rcp.com',
    userId: 'cnt-104',
    type: 'Bonus',
    amount: '+₹250',
    rawAmount: 250,
    reason: 'Festival Contest Milestone Reward',
    date: '2026-07-31 02:15 PM',
    status: 'Completed'
  },
  {
    id: 'TXN-9905',
    user: 'Vikram Das',
    userEmail: 'vikram.d@rcp.com',
    userId: 'cnt-105',
    type: 'Debit',
    amount: '-₹200',
    rawAmount: -200,
    reason: 'Duplicate Withdrawal Reversal Adjust',
    date: '2026-07-30 11:20 AM',
    status: 'Completed'
  }
];

export const WalletManagementPage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  // Sub-Tab State: 'logs' | 'credit' | 'debit' | 'bonus' | 'penalty' | 'freeze'
  const [activeTab, setActiveTab] = useState('logs');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Multi-Mode RightDrawer State: null | 'credit' | 'debit' | 'bonus' | 'penalty' | 'freeze'
  const [activeDrawerMode, setActiveDrawerMode] = useState(null);

  // Contestant Users List for Dropdown
  const [contestants, setContestants] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [amountInput, setAmountInput] = useState('100');
  const [reasonInput, setReasonInput] = useState('');
  const [freezeActionType, setFreezeActionType] = useState('Freeze');

  // Transactions State
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchContestants();
  }, [isMockMode]);

  const fetchContestants = async () => {
    if (isMockMode) {
      setTransactions(MOCK_DEFAULT_TRANSACTIONS);
      return;
    }
    try {
      const res = await axios.get('/api/admin/users/Contestant', { withCredentials: true });
      if (res.data && res.data.success && Array.isArray(res.data.users)) {
        const mapped = res.data.users.map(u => ({
          label: `${u.name || u.username} (${u.email}) - Bal: ₹${u.walletBalance || 0}`,
          value: u._id || u.id,
          name: u.name || u.username,
          email: u.email,
          balance: u.walletBalance || 0,
          status: u.status
        }));
        setContestants(mapped);
        if (mapped.length > 0) setSelectedUser(mapped[0].value);
      }
    } catch (err) {
      console.error('Error fetching contestants for wallet management:', err);
    }
  };

  const handleOpenDrawer = (mode) => {
    setActiveDrawerMode(mode);
    setAmountInput(mode === 'bonus' ? '50' : mode === 'penalty' ? '100' : '500');
    setReasonInput('');
  };

  // --- SUBMIT WALLET ADJUSTMENT DRAWER ACTION ---
  const handleSubmitWalletAction = async () => {
    if (!selectedUser) {
      showSnackbar('Please select a contestant user.', 'warning');
      return;
    }

    const selectedObj = contestants.find(c => c.value === selectedUser) || {
      name: 'Selected Contestant',
      email: 'contestant@rcp.com',
      value: selectedUser
    };

    const numAmount = parseInt(amountInput, 10) || 0;
    let formattedAmount = `₹${numAmount}`;
    let txnType = 'Credit';

    if (activeDrawerMode === 'credit') {
      formattedAmount = `+₹${numAmount}`;
      txnType = 'Credit';
    } else if (activeDrawerMode === 'debit') {
      formattedAmount = `-₹${numAmount}`;
      txnType = 'Debit';
    } else if (activeDrawerMode === 'bonus') {
      formattedAmount = `+₹${numAmount}`;
      txnType = 'Bonus';
    } else if (activeDrawerMode === 'penalty') {
      formattedAmount = `-₹${numAmount}`;
      txnType = 'Penalty';
    } else if (activeDrawerMode === 'freeze') {
      formattedAmount = '₹0';
      txnType = freezeActionType === 'Freeze' ? 'Freeze Wallet' : 'Unfreeze Wallet';
    }

    const payload = {
      amount: activeDrawerMode === 'debit' || activeDrawerMode === 'penalty' ? -Math.abs(numAmount) : Math.abs(numAmount),
      actionType: txnType,
      reason: reasonInput || `Admin ${txnType} action`
    };

    if (!isMockMode) {
      try {
        await axios.put(`/api/admin/users/${selectedUser}/wallet`, payload, { withCredentials: true });
      } catch (err) {
        console.error('Error adjusting wallet via API:', err);
      }
    }

    // Add entry to Transaction Audit Logs
    const newTxn = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      user: selectedObj.name,
      userEmail: selectedObj.email,
      userId: selectedUser,
      type: txnType,
      amount: formattedAmount,
      rawAmount: payload.amount,
      reason: reasonInput || `Admin ${txnType} Manual Action`,
      date: new Date().toLocaleString(),
      status: txnType === 'Freeze Wallet' ? 'Frozen' : 'Completed'
    };

    setTransactions(prev => [newTxn, ...prev]);
    showSnackbar(`Wallet ${txnType} action processed for ${selectedObj.name}!`, 'success');
    setActiveDrawerMode(null);
    fetchContestants();
  };

  // --- EXPORT TRANSACTIONS TO CSV ---
  const handleExportCSV = () => {
    const csvHeader = 'Transaction ID,User Name,Email,Type,Amount,Reason / Remarks,Date & Time,Status\n';
    const csvRows = filteredTransactions.map(t => (
      `"${t.id}","${t.user}","${t.userEmail || ''}","${t.type}","${t.amount}","${t.reason || ''}","${t.date}","${t.status}"`
    )).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `wallet_transactions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar('Wallet transaction logs exported successfully to CSV!', 'success');
  };

  // --- FILTERED TRANSACTIONS LOGIC ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.user.toLowerCase().includes(q) ||
        (t.userEmail && t.userEmail.toLowerCase().includes(q)) ||
        (t.id && t.id.toLowerCase().includes(q));

      let matchesTab = true;
      if (activeTab === 'credit') matchesTab = t.type === 'Credit';
      else if (activeTab === 'debit') matchesTab = t.type === 'Debit';
      else if (activeTab === 'bonus') matchesTab = t.type === 'Bonus';
      else if (activeTab === 'penalty') matchesTab = t.type === 'Penalty';
      else if (activeTab === 'freeze') matchesTab = t.type === 'Freeze Wallet' || t.type === 'Unfreeze Wallet';

      const matchesType = typeFilter === 'All' || t.type === typeFilter;

      return matchesSearch && matchesTab && matchesType;
    });
  }, [transactions, searchTerm, activeTab, typeFilter]);

  // Analytics summary for Wallet
  const summaryStats = useMemo(() => {
    const totalTxns = transactions.length;
    const totalCredited = transactions
      .filter(t => t.type === 'Credit' || t.type === 'Bonus')
      .reduce((acc, t) => acc + Math.abs(t.rawAmount || 0), 0);
    const totalDebited = transactions
      .filter(t => t.type === 'Debit' || t.type === 'Penalty')
      .reduce((acc, t) => acc + Math.abs(t.rawAmount || 0), 0);
    const frozenCount = transactions.filter(t => t.type === 'Freeze Wallet').length;

    return { totalTxns, totalCredited, totalDebited, frozenCount };
  }, [transactions]);

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-emerald-500" />
            Wallet & Transaction Audit Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Manual wallet adjustments (Credit, Debit, Bonus, Penalty), Freeze Account controls, and full transaction audit logs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleOpenDrawer('credit')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Credit Wallet
          </button>
          <button
            onClick={() => handleOpenDrawer('debit')}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            <MinusCircle className="w-4 h-4" /> Debit Wallet
          </button>
          <button
            onClick={() => handleOpenDrawer('bonus')}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Gift className="w-4 h-4" /> Issue Bonus
          </button>
          <button
            onClick={() => handleOpenDrawer('penalty')}
            className="flex items-center gap-1.5 px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            <AlertTriangle className="w-4 h-4" /> Penalty Fine
          </button>
          <button
            onClick={() => handleOpenDrawer('freeze')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Snowflake className="w-4 h-4" /> Freeze / Unfreeze
          </button>
        </div>
      </div>

      {/* KPI Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Total Logged Transactions</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{summaryStats.totalTxns}</h3>
          <p className="text-[11px] text-slate-400">Processed Audit Records</p>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Total Credited / Bonus</span>
          <h3 className="text-2xl font-bold text-emerald-500 font-mono">+₹{summaryStats.totalCredited.toLocaleString()}</h3>
          <p className="text-[11px] text-emerald-400 font-semibold">Credited to Contestants</p>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Total Debited / Penalty</span>
          <h3 className="text-2xl font-bold text-rose-500 font-mono">-₹{summaryStats.totalDebited.toLocaleString()}</h3>
          <p className="text-[11px] text-rose-400 font-semibold">Deducted Fines & Adjustments</p>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Frozen Contestant Wallets</span>
          <h3 className="text-2xl font-bold text-blue-400 font-mono">{summaryStats.frozenCount}</h3>
          <p className="text-[11px] text-slate-400">Under Investigation</p>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'logs', label: 'All Transaction Logs', icon: FileText },
          { id: 'credit', label: 'Credit', icon: PlusCircle },
          { id: 'debit', label: 'Debit', icon: MinusCircle },
          { id: 'bonus', label: 'Bonus', icon: Gift },
          { id: 'penalty', label: 'Penalty Fines', icon: AlertTriangle },
          { id: 'freeze', label: 'Freeze Actions', icon: Snowflake }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Export Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transaction ID, user or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <CustomSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: 'All Transaction Types', value: 'All' },
              { label: 'Credit', value: 'Credit' },
              { label: 'Debit', value: 'Debit' },
              { label: 'Bonus', value: 'Bonus' },
              { label: 'Penalty', value: 'Penalty' },
              { label: 'Freeze Wallet', value: 'Freeze Wallet' }
            ]}
            className="w-48"
          />

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Transactions Audit Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Contestant User</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Amount Adjustment</th>
                <th className="py-3 px-4">Reason / Remarks</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No wallet transaction logs match your current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-500">
                      {txn.id}
                    </td>

                    <td className="py-3 px-4">
                      <strong className="text-slate-900 dark:text-white font-bold block">{txn.user}</strong>
                      {txn.userEmail && <span className="text-[11px] text-slate-400">{txn.userEmail}</span>}
                    </td>

                    <td className="py-3 px-4 font-bold">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        txn.type === 'Credit' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        txn.type === 'Bonus' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        txn.type === 'Debit' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        txn.type === 'Penalty' ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' :
                        'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {txn.type}
                      </span>
                    </td>

                    <td className={`py-3 px-4 font-mono font-bold text-sm ${
                      txn.type === 'Credit' || txn.type === 'Bonus' ? 'text-emerald-500' :
                      txn.type === 'Debit' || txn.type === 'Penalty' ? 'text-rose-500' :
                      'text-slate-400'
                    }`}>
                      {txn.amount}
                    </td>

                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {txn.reason}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {txn.date}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        txn.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                        txn.status === 'Frozen' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MULTI-MODE WALLET ACTION RIGHTDRAWER */}
      <RightDrawer
        isOpen={Boolean(activeDrawerMode)}
        onClose={() => setActiveDrawerMode(null)}
        title={
          activeDrawerMode === 'credit' ? 'Credit Contestant Wallet' :
          activeDrawerMode === 'debit' ? 'Debit Contestant Wallet' :
          activeDrawerMode === 'bonus' ? 'Issue Contest Bonus Reward' :
          activeDrawerMode === 'penalty' ? 'Issue Penalty Fine' :
          'Freeze / Unfreeze Contestant Wallet'
        }
      >
        {activeDrawerMode && (
          <div className="space-y-4 text-xs text-left">
            {/* Contestant User Selection */}
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Target Contestant User *</label>
              {contestants.length > 0 ? (
                <CustomSelect
                  value={selectedUser}
                  onChange={setSelectedUser}
                  options={contestants}
                  className="w-full"
                />
              ) : (
                <input
                  type="text"
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value)}
                  placeholder="Enter contestant email or User ID..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              )}
            </div>

            {/* Amount Field for Credit / Debit / Bonus / Penalty */}
            {activeDrawerMode !== 'freeze' && (
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Amount Adjustment (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={amountInput}
                  onChange={e => setAmountInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-mono text-sm font-bold"
                />
              </div>
            )}

            {/* Freeze Action Mode Switch */}
            {activeDrawerMode === 'freeze' && (
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Wallet Control Action</label>
                <CustomSelect
                  value={freezeActionType}
                  onChange={setFreezeActionType}
                  options={[
                    { label: 'Freeze Account (Suspend Wallet)', value: 'Freeze' },
                    { label: 'Unfreeze Account (Restore Active)', value: 'Unfreeze' }
                  ]}
                  className="w-full"
                />
              </div>
            )}

            {/* Reason / Remarks Field */}
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Audit Reason / Remarks *</label>
              <textarea
                rows={3}
                value={reasonInput}
                onChange={e => setReasonInput(e.target.value)}
                placeholder={
                  activeDrawerMode === 'credit' ? 'e.g. Stage 1 Grand Audition Prize Pool Payout...' :
                  activeDrawerMode === 'debit' ? 'e.g. Manual reversal for duplicate payout...' :
                  activeDrawerMode === 'bonus' ? 'e.g. Festival Season Login Promotion Bonus...' :
                  activeDrawerMode === 'penalty' ? 'e.g. Penalty fine for chat rule violation...' :
                  'e.g. Wallet account suspended pending KYC verification audit...'
                }
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleSubmitWalletAction}
              className={`w-full py-3 text-white font-bold rounded-xl shadow-md transition-all mt-4 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeDrawerMode === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700' :
                activeDrawerMode === 'debit' ? 'bg-rose-600 hover:bg-rose-700' :
                activeDrawerMode === 'bonus' ? 'bg-amber-600 hover:bg-amber-700' :
                activeDrawerMode === 'penalty' ? 'bg-pink-600 hover:bg-pink-700' :
                'bg-slate-700 hover:bg-slate-800'
              }`}
            >
              {activeDrawerMode === 'credit' && <><PlusCircle className="w-4 h-4" /> Confirm Credit Wallet</>}
              {activeDrawerMode === 'debit' && <><MinusCircle className="w-4 h-4" /> Confirm Debit Wallet</>}
              {activeDrawerMode === 'bonus' && <><Gift className="w-4 h-4" /> Confirm Issue Bonus</>}
              {activeDrawerMode === 'penalty' && <><AlertTriangle className="w-4 h-4" /> Confirm Apply Penalty</>}
              {activeDrawerMode === 'freeze' && <><Snowflake className="w-4 h-4" /> Process Wallet Controls</>}
            </button>
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default WalletManagementPage;
