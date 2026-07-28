import React, { useState } from 'react';
import {
  BarChart3, FileSpreadsheet, FileText, Download, Calendar, DollarSign, Users, Trophy
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const ReportsPage = () => {
  const { showSnackbar } = useAlert();
  const [activeTab, setActiveTab] = useState('revenue'); // revenue, gst, contest, player, daily, monthly, winner, excel, pdf

  const reportsList = [
    { name: 'Revenue & GST Summary Report', type: 'Financial', date: 'July 2026', format: 'Excel / PDF' },
    { name: 'Contest Participation & Entry Fees Report', type: 'Contests', date: 'July 2026', format: 'Excel / PDF' },
    { name: 'Player Performance & Retention Report', type: 'Players', date: 'July 2026', format: 'Excel / PDF' },
    { name: 'Winner & Prize Distribution Audit Log', type: 'Winners', date: 'July 2026', format: 'Excel / PDF' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-teal-500" /> Platform Reports & Audit Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Generate and download Revenue, GST, Contest, Player, Daily, Monthly & Winner Reports in Excel or PDF formats.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => showSnackbar('Exporting all report suites to Excel (.xlsx)', 'success')}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow hover:bg-emerald-700"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={() => showSnackbar('Generating & Downloading PDF Summary', 'success')}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-600 text-white font-semibold text-xs rounded-xl shadow hover:bg-rose-700"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Sub-Tabs from spec */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'revenue', label: 'Revenue Report', icon: DollarSign },
          { id: 'gst', label: 'GST Report', icon: FileText },
          { id: 'contest', label: 'Contest Report', icon: Trophy },
          { id: 'player', label: 'Player Report', icon: Users },
          { id: 'daily', label: 'Daily Report', icon: Calendar },
          { id: 'monthly', label: 'Monthly Report', icon: Calendar },
          { id: 'winner', label: 'Winner Report', icon: Trophy },
          { id: 'excel', label: 'Export Excel', icon: FileSpreadsheet },
          { id: 'pdf', label: 'Export PDF', icon: Download }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((rep, idx) => (
          <div key={idx} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded">{rep.type}</span>
              <span className="text-[10px] text-slate-400">{rep.date}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{rep.name}</h3>
            <div className="flex gap-2 pt-2">
              <button onClick={() => showSnackbar(`Downloading Excel for ${rep.name}`, 'success')} className="flex-1 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs rounded-xl hover:bg-emerald-500/20 flex items-center justify-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4" /> Download XLSX
              </button>
              <button onClick={() => showSnackbar(`Downloading PDF for ${rep.name}`, 'success')} className="flex-1 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs rounded-xl hover:bg-rose-500/20 flex items-center justify-center gap-1.5">
                <FileText className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
