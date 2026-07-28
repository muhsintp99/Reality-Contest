import React, { useState } from 'react';
import { Shield, ShieldAlert, UserCheck, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const KycStatusPage = () => {
  const { showSnackbar } = useAlert();
  const [kycs, setKycs] = useState([
    { id: 'KYC-901', user: 'Aarav Sharma', docType: 'Aadhar Card', docNo: 'XXXX-XXXX-4892', status: 'Verified', liveness: '98.4%' },
    { id: 'KYC-902', user: 'Priya Nair', docType: 'PAN Card', docNo: 'ABCDE1234F', status: 'Pending', liveness: '92.0%' },
    { id: 'KYC-903', user: 'Rohan Mehta', docType: 'Passport', docNo: 'Z9876543', status: 'Rejected', liveness: '45.1%' }
  ]);

  const handleAction = (id, newStatus) => {
    setKycs(prev => prev.map(k => k.id === id ? { ...k, status: newStatus } : k));
    showSnackbar(`KYC ${id} marked as ${newStatus}`, 'success');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-7 h-7 text-blue-500" /> KYC Status & Identity Verification
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Review identity verification files, Aadhar/PAN cards & biometrics liveness score.</p>
      </div>

      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase font-medium">
            <tr>
              <th className="px-5 py-3.5">User / ID</th>
              <th className="px-5 py-3.5">Document Type</th>
              <th className="px-5 py-3.5">Document Number</th>
              <th className="px-5 py-3.5">AI Liveness Score</th>
              <th className="px-5 py-3.5">KYC Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {kycs.map(k => (
              <tr key={k.id}>
                <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{k.user}<div className="text-[11px] text-slate-400">{k.id}</div></td>
                <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">{k.docType}</td>
                <td className="px-5 py-4 font-mono text-slate-400">{k.docNo}</td>
                <td className="px-5 py-4 font-bold text-emerald-500">{k.liveness}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    k.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-500' :
                    k.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {k.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    {k.status !== 'Verified' && (
                      <button onClick={() => handleAction(k.id, 'Verified')} className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg"><CheckCircle className="w-3.5 h-3.5" /></button>
                    )}
                    {k.status !== 'Rejected' && (
                      <button onClick={() => handleAction(k.id, 'Rejected')} className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg"><XCircle className="w-3.5 h-3.5" /></button>
                    )}
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

export default KycStatusPage;
