import React, { useState } from 'react';
import { Smartphone, Shield, Eye, Search } from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect';

export const DeviceDetailsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const devices = [
    { id: 'DEV-01', user: 'Aarav Sharma', model: 'iPhone 14 Pro', os: 'iOS 17.2', build: '21C62', appVersion: 'v2.4.0', status: 'Registered' },
    { id: 'DEV-02', user: 'Priya Nair', model: 'Samsung Galaxy S23', os: 'Android 14', build: 'UP1A.231005.007', appVersion: 'v2.4.0', status: 'Registered' },
    { id: 'DEV-03', user: 'Rohan Mehta', model: 'OnePlus 11', os: 'Android 13 (Rooted)', build: 'NE2211_11_C.32', appVersion: 'v2.3.1', status: 'Flagged Root' }
  ];

  const filteredDevices = devices.filter(d => {
    const matchesSearch = d.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.os.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Smartphone className="w-7 h-7 text-cyan-500" /> Contestant Device Details Directory
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Hardware fingerprints, OS build versions & root/jailbreak detection logs for Contestants only.
        </p>
      </div>

      {/* Search & CustomSelect Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative z-20">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contestant device by name, model, or OS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary"
          />
        </div>

        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All Security Statuses', value: 'All' },
            { label: 'Registered Devices', value: 'Registered' },
            { label: 'Flagged Root Devices', value: 'Flagged Root' }
          ]}
        />
      </div>

      <div className="glassmorphism rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase font-medium">
            <tr>
              <th className="px-5 py-3.5">Device ID / Contestant</th>
              <th className="px-5 py-3.5">Hardware Model</th>
              <th className="px-5 py-3.5">OS & Build</th>
              <th className="px-5 py-3.5">App Version</th>
              <th className="px-5 py-3.5">Security Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-800 dark:text-slate-200">
            {filteredDevices.map(d => (
              <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{d.user}<div className="text-[11px] text-slate-400">{d.id}</div></td>
                <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">{d.model}</td>
                <td className="px-5 py-4 font-mono text-slate-400">{d.os} ({d.build})</td>
                <td className="px-5 py-4 font-bold text-cyan-500">{d.appVersion}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${d.status === 'Registered' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {d.status}
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

export default DeviceDetailsPage;
