import React, { useState } from 'react';
import {
  Share2, ShieldAlert, DollarSign, Settings, AlertTriangle, CheckCircle, Users
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const ReferralManagement = () => {
  const { showSnackbar } = useAlert();
  const [activeTab, setActiveTab] = useState('rules'); // rules, earnings, abuse

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-7 h-7 text-cyan-500" /> Referral Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Set up referral program rewards, track invite earnings & detect referral abuse / self-referrals.
          </p>
        </div>
      </div>

      {/* Sub-Tabs from spec */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'rules', label: 'Referral Rules', icon: Settings },
          { id: 'earnings', label: 'Referral Earnings', icon: DollarSign },
          { id: 'abuse', label: 'Referral Abuse Detection', icon: ShieldAlert }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Referral Rules & Config Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-500" /> Referrer Reward Rule
          </h3>
          <div className="text-xs space-y-2">
            <label className="block text-slate-400">Coins per successful signup</label>
            <input type="number" defaultValue={100} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
            <label className="block text-slate-400">Bonus on first contest join</label>
            <input type="number" defaultValue={50} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
          </div>
          <button onClick={() => showSnackbar('Referral Rules Saved!', 'success')} className="w-full py-2 bg-cyan-600 text-white text-xs font-semibold rounded-xl hover:bg-cyan-700">Save Rules</button>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-4 md:col-span-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" /> Abuse Detection Logs
          </h3>
          <div className="space-y-3">
            {[
              { id: 'AB-01', user: 'Rohan Mehta', ip: '157.33.19.4', trigger: '5 Accounts Created from Same Device Fingerprint', risk: 'High', action: 'Bonus Revoked' },
              { id: 'AB-02', user: 'User992', ip: '49.36.12.89', trigger: 'Rapid Sequential Referral Registrations', risk: 'Medium', action: 'Flagged for Review' }
            ].map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{log.user} ({log.ip})</div>
                  <div className="text-slate-400 text-[11px]">{log.trigger}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500">{log.risk} Risk</span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{log.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralManagement;
