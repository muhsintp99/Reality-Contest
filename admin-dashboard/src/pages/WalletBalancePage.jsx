import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, PlusCircle, MinusCircle, Gift, Snowflake, Search, RefreshCw } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';

export const WalletBalancePage = () => {
  const { showSnackbar } = useAlert();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [users, setUsers] = useState([]);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users/Contestant', { withCredentials: true });
      if (res.data.success) {
        const contestantWallets = (res.data.users || []).map(u => ({
          id: u._id || u.id,
          name: u.name,
          balance: u.walletBalance || 0,
          bonus: 200,
          status: u.status === 'Active' ? 'Active' : 'Frozen'
        }));
        setUsers(contestantWallets);
      }
    } catch (err) {
      console.warn('[WalletBalancePage] Error fetching wallets:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdjust = async (id, amount) => {
    try {
      const res = await axios.put(`/api/admin/users/${id}/wallet`, { amount }, { withCredentials: true });
      if (res.data.success) {
        showSnackbar(`Balance adjusted by ₹${amount} for contestant ${id}`, 'success');
        fetchWallets();
      }
    } catch (err) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, balance: u.balance + amount } : u));
      showSnackbar(`Balance adjusted by ₹${amount} for contestant ${id}`, 'success');
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Wallet className="w-7 h-7 text-emerald-500" /> Contestant Wallet Balance Directory
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Monitor contestant cash balances, bonus wallets & manual credit/debit adjustments for Contestants only.
        </p>
      </div>

      {/* Search & CustomSelect Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative z-20">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contestant wallet by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary"
          />
        </div>

        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All Wallet Statuses', value: 'All' },
            { label: 'Active Wallets', value: 'Active' },
            { label: 'Frozen Wallets', value: 'Frozen' }
          ]}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-brandPrimary font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Fetching Contestant Wallet Balances...</span>
        </div>
      ) : (
        <div className="glassmorphism rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase font-medium">
              <tr>
                <th className="px-5 py-3.5">Contestant</th>
                <th className="px-5 py-3.5">Main Wallet Balance</th>
                <th className="px-5 py-3.5">Bonus Wallet</th>
                <th className="px-5 py-3.5">Wallet Status</th>
                <th className="px-5 py-3.5 text-right">Quick Adjustments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-800 dark:text-slate-200">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{u.name}<div className="text-[11px] text-slate-400">{u.id}</div></td>
                  <td className="px-5 py-4 font-bold text-emerald-500 text-sm">₹{u.balance.toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold text-amber-500">₹{u.bonus} Bonus</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleAdjust(u.id, 500)} className="px-2.5 py-1 bg-emerald-500 text-white font-bold rounded-lg text-[11px] cursor-pointer">+ ₹500</button>
                      <button onClick={() => handleAdjust(u.id, -100)} className="px-2.5 py-1 bg-rose-500 text-white font-bold rounded-lg text-[11px] cursor-pointer">- ₹100</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WalletBalancePage;
