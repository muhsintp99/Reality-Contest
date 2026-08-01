import React, { useState } from 'react';
import { RefreshCw, Smartphone, Globe, ShieldCheck, Search } from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect';

export const LoginHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const logins = [
    { id: 'LOG-01', user: 'Aarav Sharma', ip: '103.22.45.12', location: 'Mumbai, Maharashtra', device: 'iPhone 14 Pro (iOS 17.2)', time: '2026-07-27 05:12', status: 'Success' },
    { id: 'LOG-02', user: 'Priya Nair', ip: '49.36.12.89', location: 'Bengaluru, Karnataka', device: 'Samsung S23 (Android 14)', time: '2026-07-27 04:30', status: 'Success' },
    { id: 'LOG-03', user: 'Rohan Mehta', ip: '157.33.19.4', location: 'Delhi, India (VPN)', device: 'OnePlus 11 (Android 13)', time: '2026-07-26 23:14', status: 'Flagged Proxy' }
  ];

  const filteredLogins = logins.filter(l => {
    const matchesSearch = l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.ip.includes(searchTerm) ||
                          l.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <RefreshCw className="w-7 h-7 text-indigo-500" /> Contestant Login History & Session Audit
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Track contestant authentication sessions, IP addresses & security anomalies for Contestants only.
        </p>
      </div>

      {/* Search & CustomSelect Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative z-20">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contestant logins by name, IP, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary"
          />
        </div>

        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All Login Statuses', value: 'All' },
            { label: 'Successful Logins', value: 'Success' },
            { label: 'Flagged Proxies', value: 'Flagged Proxy' }
          ]}
        />
      </div>

      <div className="glassmorphism rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase font-medium">
            <tr>
              <th className="px-5 py-3.5">Log ID / Contestant</th>
              <th className="px-5 py-3.5">IP & Location</th>
              <th className="px-5 py-3.5">Device & OS</th>
              <th className="px-5 py-3.5">Timestamp</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-800 dark:text-slate-200">
            {filteredLogins.map(l => (
              <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{l.user}<div className="text-[11px] text-slate-400">{l.id}</div></td>
                <td className="px-5 py-4 font-mono">{l.ip}<div className="text-[10px] text-slate-400 font-sans">{l.location}</div></td>
                <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">{l.device}</td>
                <td className="px-5 py-4 text-slate-400">{l.time}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${l.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoginHistoryPage;
