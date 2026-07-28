import React, { useState } from 'react';
import {
  ShieldAlert, Smartphone, Users, Globe, Shield, MapPin, Eye, Search, AlertTriangle
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const FraudDetection = () => {
  const { showSnackbar } = useAlert();
  const [activeTab, setActiveTab] = useState('devices'); // devices, accounts, vpn, rooted, location, activity, manual

  const fraudAlerts = [
    { id: 'FRD-801', user: 'Rohan Mehta (USR-103)', riskScore: '96/100', trigger: 'Multiple Devices (4 IMEIs) & VPN Proxy', location: 'Mumbai, IN (IP: 157.33.19.4)', device: 'Rooted Android 13', status: 'Under Manual Investigation' },
    { id: 'FRD-802', user: 'Unknown Suspicious User', riskScore: '88/100', trigger: 'Location Mismatch (GPS vs IP)', location: 'London, UK vs Delhi, IN', device: 'iOS Emulator', status: 'Account Suspended' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-rose-500" /> Fraud Detection & Security Engine
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Detect Multiple Devices/Accounts, VPN Users, Rooted/Jailbroken Devices, Location Mismatch & conduct Manual Investigations.
          </p>
        </div>
      </div>

      {/* Sub-Tabs from spec */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'devices', label: 'Multiple Devices', icon: Smartphone },
          { id: 'accounts', label: 'Multiple Accounts', icon: Users },
          { id: 'vpn', label: 'VPN Users', icon: Globe },
          { id: 'rooted', label: 'Rooted Devices', icon: Shield },
          { id: 'location', label: 'Location Mismatch', icon: MapPin },
          { id: 'activity', label: 'Suspicious Activity', icon: AlertTriangle },
          { id: 'manual', label: 'Manual Investigation', icon: Eye }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Fraud Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-5 py-3.5">Flag ID / User</th>
                <th className="px-5 py-3.5">Risk Score</th>
                <th className="px-5 py-3.5">Trigger Cause</th>
                <th className="px-5 py-3.5">Location & IP</th>
                <th className="px-5 py-3.5">Device Type</th>
                <th className="px-5 py-3.5 text-right">Investigation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {fraudAlerts.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{f.user}</div>
                    <div className="text-[11px] text-slate-400">{f.id}</div>
                  </td>
                  <td className="px-5 py-4 font-bold text-rose-500 text-sm">
                    {f.riskScore}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                    {f.trigger}
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {f.location}
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-amber-500">
                    {f.device}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => showSnackbar(`Opened Deep Forensic Investigation for ${f.id}`, 'info')}
                      className="px-3 py-1.5 bg-rose-500/10 text-rose-500 font-semibold text-xs rounded-lg hover:bg-rose-500/20"
                    >
                      Investigate & Ban
                    </button>
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

export default FraudDetection;
