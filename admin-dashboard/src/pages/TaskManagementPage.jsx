import React, { useState } from 'react';
import {
  CheckSquare, Video, Camera, FileText, Sparkles, UserCheck, Bot,
  Award, CheckCircle2, XCircle, Eye
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const TaskManagementPage = () => {
  const { showSnackbar } = useAlert();
  const [activeTab, setActiveTab] = useState('all'); // all, video, photo, document, creative, manual, ai, score, approval

  const [tasks, setTasks] = useState([
    { id: 'TSK-501', title: 'Dance Audition Video Upload', type: 'Video Upload', submitter: 'Rahul Kapoor', reviewType: 'AI Review', score: '94/100', aiConfidence: '98.2%', status: 'Approved' },
    { id: 'TSK-502', title: 'Creative Costume Design Photo', type: 'Photo Tasks', submitter: 'Sneha Roy', reviewType: 'Manual Review', score: '88/100', aiConfidence: 'N/A', status: 'Pending Review' },
    { id: 'TSK-503', title: 'Original Song Composition Script', type: 'Document Tasks', submitter: 'Vikram Joshi', reviewType: 'Manual Review', score: 'Unscored', aiConfidence: 'N/A', status: 'Pending Review' }
  ]);

  const handleApprove = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'Approved', score: '90/100' } : t));
    showSnackbar(`Task submission ${id} approved & score allocated!`, 'success');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-emerald-500" /> Task Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Manage Video, Photo, Document & Creative submissions, AI & Manual moderation, scoring & approvals.
          </p>
        </div>
      </div>

      {/* Sub-Tabs matching document spec */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'all', label: 'All Submissions', icon: CheckSquare },
          { id: 'video', label: 'Video Upload Tasks', icon: Video },
          { id: 'photo', label: 'Photo Tasks', icon: Camera },
          { id: 'document', label: 'Document Tasks', icon: FileText },
          { id: 'creative', label: 'Creative Tasks', icon: Sparkles },
          { id: 'manual', label: 'Manual Review', icon: UserCheck },
          { id: 'ai', label: 'AI Review', icon: Bot },
          { id: 'score', label: 'Score Allocation', icon: Award },
          { id: 'approval', label: 'Approvals', icon: CheckCircle2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-5 py-3.5">Task / Submitter</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Reviewer & AI Match</th>
                <th className="px-5 py-3.5">Score</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {tasks.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{t.title}</div>
                    <div className="text-[11px] text-slate-400">{t.submitter} • {t.id}</div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">
                    {t.type}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-brandPrimary flex items-center gap-1">
                      {t.reviewType === 'AI Review' ? <Bot className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      {t.reviewType}
                    </div>
                    {t.aiConfidence !== 'N/A' && <div className="text-[10px] text-slate-400">Confidence: {t.aiConfidence}</div>}
                  </td>
                  <td className="px-5 py-4 font-bold text-emerald-500">
                    {t.score}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      t.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => showSnackbar(`Opening media preview for ${t.id}`, 'info')}
                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                        title="Preview Media"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {t.status !== 'Approved' && (
                        <button
                          onClick={() => handleApprove(t.id)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                          title="Approve & Allocate Score"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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

export default TaskManagementPage;
