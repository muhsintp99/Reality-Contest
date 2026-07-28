import React, { useState } from 'react';
import { Wallet, PlusCircle, MinusCircle, Gift, Snowflake } from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const WalletBalancePage = () => {
  const { showSnackbar } = useAlert();
  const [users, setUsers] = useState([
    { id: 'USR-101', name: 'Aarav Sharma', balance: 1450, bonus: 200, status: 'Active' },
    { id: 'USR-102', name: 'Priya Nair', balance: 320, bonus: 50, status: 'Active' },
    { id: 'USR-103', name: 'Rohan Mehta', balance: 0, bonus: 0, status: 'Frozen' }
  ]);

  const handleAdjust = (id, amount) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, balance: u.balance + amount } : u));
    showSnackbar(`Balance adjusted by ₹${amount} for user ${id}`, 'success');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Wallet className="w-7 h-7 text-emerald-500" /> Wallet Balance Directory
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor user cash balances, bonus wallets & manual credit/debit adjustments.</p>
      </div>

      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase font-medium">
            <tr>
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5">Main Wallet Balance</th>
              <th className="px-5 py-3.5">Bonus Wallet</th>
              <th className="px-5 py-3.5">Wallet Status</th>
              <th className="px-5 py-3.5 text-right">Quick Adjustments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {users.map(u => (
              <tr key={u.id}>
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
                    <button onClick={() => handleAdjust(u.id, 500)} className="px-2.5 py-1 bg-emerald-500 text-white font-bold rounded-lg text-[11px]">+ ₹500</button>
                    <button onClick={() => handleAdjust(u.id, -100)} className="px-2.5 py-1 bg-rose-500 text-white font-bold rounded-lg text-[11px]">- ₹100</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WalletBalancePage;
