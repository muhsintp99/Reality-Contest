import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWalletBalance } from '../store/authSlice';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, RefreshCw, Calendar, FileText } from 'lucide-react';
import axios from 'axios';

export const WalletDashboard = () => {
  const dispatch = useDispatch();
  const { user, isMockMode } = useSelector((state) => state.auth);
  const [balance, setBalance] = useState(user?.walletBalance || 0);
  const [amount, setAmount] = useState('500');
  const [desc, setDesc] = useState('User Deposit');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWalletData = async () => {
    if (isMockMode) {
      // Mock transactions
      setTransactions([
        { _id: 'txn-1', amount: 500, type: 'Deposit', status: 'Completed', description: 'Promo Bonus', createdAt: new Date().toISOString() },
        { _id: 'txn-2', amount: -199, type: 'Entry Fee', status: 'Completed', description: 'Tech Quiz entry', createdAt: new Date(Date.now() - 86400000).toISOString() }
      ]);
      setBalance(user?.walletBalance || 0);
      return;
    }

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
  }, [isMockMode, user?.walletBalance]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    if (isMockMode) {
      dispatch(updateWalletBalance(val));
      setAmount('');
      alert(`₹${val} loaded in mock mode.`);
      fetchWalletData();
      return;
    }

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
    <div className="space-y-6 text-left animate-fade-in">
      <div>
        <h2 className="text-xl font-bold font-poppins text-white dark:text-white light:text-black">
          Syndicate Wallet Manager
        </h2>
        <p className="text-xs text-white/50">Load funds, review receipts, and pay contest entry fees.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="glassmorphism p-6 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between h-44">
          <div>
            <span className="text-[10px] text-white/40 uppercase font-bold block tracking-wider">Available Balance</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl font-extrabold font-poppins text-white">₹{balance.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-brandSecondary">
            <Wallet className="w-4 h-4" />
            <span>Secure MERN Ledger Account</span>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-brandPrimary/10 blur-2xl pointer-events-none" />
        </div>

        {/* Quick Deposit Form */}
        <div className="glassmorphism p-6 rounded-2xl border border-white/10 col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase text-white">Quick deposit window</h3>
          <form onSubmit={handleDeposit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Amount (INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-white/45">₹</span>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-7 pr-3 py-2 text-xs text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Note</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold shadow-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Load Funds</span>
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History */}
      <div className="glassmorphism rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5 shadow-xl">
        <div className="p-4 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase text-white tracking-wider">Transaction Ledger Log</h3>
          <button onClick={fetchWalletData} className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/50 hover:text-white transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/5 text-white/50 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/40">No transactions recorded yet.</td>
                </tr>
              ) : (
                transactions.map((t, idx) => (
                  <tr key={t._id || idx} className="hover:bg-white/5">
                    <td className="px-6 py-4 font-mono text-[10px] text-white/55">{t._id}</td>
                    <td className="px-6 py-4 font-bold">
                      <span className={`flex items-center gap-1 ${t.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.amount > 0 ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {t.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-extrabold font-mono ${t.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.amount > 0 ? '+' : ''}₹{t.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/50">{t.description}</td>
                    <td className="px-6 py-4 font-mono text-white/45">
                      {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default WalletDashboard;
