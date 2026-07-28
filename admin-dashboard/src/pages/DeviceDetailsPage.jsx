import React from 'react';
import { Smartphone, Shield, Eye } from 'lucide-react';

export const DeviceDetailsPage = () => {
  const devices = [
    { id: 'DEV-01', user: 'Aarav Sharma', model: 'iPhone 14 Pro', os: 'iOS 17.2', build: '21C62', appVersion: 'v2.4.0', status: 'Registered' },
    { id: 'DEV-02', user: 'Priya Nair', model: 'Samsung Galaxy S23', os: 'Android 14', build: 'UP1A.231005.007', appVersion: 'v2.4.0', status: 'Registered' },
    { id: 'DEV-03', user: 'Rohan Mehta', model: 'OnePlus 11', os: 'Android 13 (Rooted)', build: 'NE2211_11_C.32', appVersion: 'v2.3.1', status: 'Flagged Root' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Smartphone className="w-7 h-7 text-cyan-500" /> Device Details Directory
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Hardware fingerprints, OS build versions & root/jailbreak detection logs.</p>
      </div>

      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase font-medium">
            <tr>
              <th className="px-5 py-3.5">Device ID / User</th>
              <th className="px-5 py-3.5">Hardware Model</th>
              <th className="px-5 py-3.5">OS & Build</th>
              <th className="px-5 py-3.5">App Version</th>
              <th className="px-5 py-3.5">Security Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {devices.map(d => (
              <tr key={d.id}>
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
