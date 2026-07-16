import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWalletBalance } from '../store/authSlice';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, RefreshCw, Calendar, FileText, Check } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Badge } from '../components/common/Badges';

export const WalletDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [balance, setBalance] = useState(user?.walletBalance || 0);
  const [amount, setAmount] = useState('500');
  const [desc, setDesc] = useState('User Deposit');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/wallet/transactions', { withCredentials: true });
      setTransactions(res.data.transactions || []);
      
      const profileRes = await axios.get('/api/users/profile', { withCredentials: true });
      if (profileRes.data.success) {
        setBalance(profileRes.data.user.walletBalance);
      }
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [user?.walletBalance]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    try {
      const res = await axios.post('/api/wallet/deposit', { amount: val, description: desc }, { withCredentials: true });
      if (res.data.success) {
        setBalance(res.data.walletBalance);
        setAmount('');
        alert('₹' + val + ' deposited successfully!');
        fetchWalletData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Deposit failed');
    }
  };

  return (
    <div className="space-y-6 text-left pb-10">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">
          Syndicate Wallet Manager
        </h2>
        <p className="text-xs text-slate-450 dark:text-white/40 mt-1">Load funds, review receipts, and pay contest entry fees.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphism p-6 rounded-[24px] border border-slate-200/50 dark:border-white/5 shadow-premium relative overflow-hidden flex flex-col justify-between h-44 bg-white/70 dark:bg-slate-900/40"
        >
          <div>
            <span className="text-[10px] text-slate-400 dark:text-white/35 uppercase font-bold block tracking-wider">Available Balance</span>
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-3xl font-extrabold font-sans text-slate-800 dark:text-white">₹{(balance || 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-brandPrimary dark:text-brandSecondary font-semibold">
            <Wallet className="w-4 h-4" />
            <span>Secure MERN Ledger Account</span>
          </div>
          <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-brandPrimary/5 blur-2xl pointer-events-none" />
        </motion.div>

        {/* Quick Deposit Form */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glassmorphism p-6 rounded-[24px] border border-slate-200/50 dark:border-white/5 md:col-span-2 space-y-4 bg-white/70 dark:bg-slate-900/40 shadow-premium"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-850 dark:text-white">Quick deposit window</h3>
          <form onSubmit={handleDeposit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-450 dark:text-white/30 font-bold uppercase">Amount (INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-450 dark:text-white/30 font-semibold">₹</span>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/5 rounded-xl pl-7 pr-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary/50"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-450 dark:text-white/30 font-bold uppercase">Note / Description</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/5 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary/50"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Load Funds</span>
            </button>
          </form>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glassmorphism rounded-[24px] border border-slate-200/50 dark:border-white/5 overflow-hidden shadow-premium bg-white/70 dark:bg-slate-900/40"
      >
        <div className="p-5 flex justify-between items-center border-b border-slate-100 dark:border-white/5 bg-slate-50/20">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">Transaction Ledger Log</h3>
            <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium mt-0.5">Auditable history of account deposits and withdrawals.</p>
          </div>
          <button 
            onClick={fetchWalletData} 
            className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10 rounded-xl text-slate-500 hover:text-slate-800 dark:text-white/55 dark:hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-750 dark:text-white/80">
            <thead className="bg-slate-50/50 dark:bg-[#080b12]/10 text-slate-400 dark:text-white/30 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-white/5">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-405 dark:text-white/30 font-semibold">No transactions recorded yet.</td>
                </tr>
              ) : (
                transactions.map((t, idx) => (
                  <tr key={t._id || idx} className="hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400 dark:text-white/40">{t._id}</td>
                    <td className="px-6 py-4 font-bold">
                      <span className={`flex items-center gap-1.5 ${t.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-450'}`}>
                        {t.amount > 0 ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        {t.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-extrabold font-mono ${t.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-450'}`}>
                      {t.amount > 0 ? '+' : ''}₹{(t.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">
                        <span className="flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          {t.status}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-white/50">{t.description}</td>
                    <td className="px-6 py-4 font-mono text-slate-400 dark:text-white/30">
                      {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default WalletDashboard;
