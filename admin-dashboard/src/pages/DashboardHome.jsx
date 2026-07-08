import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWalletBalance, fetchPendingKycsRequest, reviewKycRequest } from '../store/authSlice';
import axios from 'axios';
import { 
  Users, Activity, Wallet, Trophy, Award,
  Sparkles, ShieldAlert, ArrowUpRight, ArrowDownRight, ArrowRight, Play, Check, Clock
} from 'lucide-react';

const STATS_DATA = [
  { id: 'users', label: 'Total Auditions', value: '184,203', growth: '+14.2%', positive: true, sparkline: [12, 14, 13, 16, 15, 18, 20] },
  { id: 'active', label: 'Active Users', value: '24,802', growth: '+6.8%', positive: true, sparkline: [8, 9, 7, 10, 11, 9, 12] },
  { id: 'revenue', label: 'Revenue Generated', value: '₹24,50,000', growth: '+18.5%', positive: true, sparkline: [20, 22, 21, 25, 23, 27, 30] },
  { id: 'votes', label: 'Community Votes Cast', value: '12,45,803', growth: '-2.4%', positive: false, sparkline: [15, 16, 14, 13, 15, 12, 11] }
];

export const DashboardHome = ({ onViewChange, selectedRole }) => {
  const dispatch = useDispatch();
  const { user, pendingKycs } = useSelector((state) => state.auth);
  const [depositAmount, setDepositAmount] = useState('1000');

  // Super Admin states
  const [auditLogs, setAuditLogs] = useState([]);
  const [promotionEmail, setPromotionEmail] = useState('');
  const [promotionRole, setPromotionRole] = useState('Judge');
  const [manualResultId, setManualResultId] = useState('');
  const [manualStatus, setManualStatus] = useState('Qualified');

  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get('/api/admin/audit-logs', { withCredentials: true });
      setAuditLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  const handlePromoteRole = async (e) => {
    e.preventDefault();
    if (!promotionEmail) return;
    try {
      const res = await axios.put('/api/admin/users/role', {
        email: promotionEmail,
        role: promotionRole
      }, { withCredentials: true });
      if (res.data.success) {
        alert(res.data.message);
        setPromotionEmail('');
        fetchAuditLogs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleManualOverride = async (e) => {
    e.preventDefault();
    if (!manualResultId) return;
    try {
      const res = await axios.put('/api/admin/results/override', {
        resultId: manualResultId,
        status: manualStatus
      }, { withCredentials: true });
      if (res.data.success) {
        alert(res.data.message);
        setManualResultId('');
        fetchAuditLogs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Manual override failed.');
    }
  };

  React.useEffect(() => {
    if (selectedRole === 'Admin') {
      dispatch(fetchPendingKycsRequest());
    } else if (selectedRole === 'Super Admin') {
      fetchAuditLogs();
    }
  }, [selectedRole, dispatch]);

  const handleReviewKycSubmit = (kycId, status) => {
    const reason = status === 'Rejected' ? 'Uploaded document text is illegible.' : undefined;
    dispatch(reviewKycRequest({
      kycId,
      status,
      reason,
      callback: (success) => {
        if (success) {
          alert(`KYC application marked: ${status}.`);
        }
      }
    }));
  };

  const recentSubmissions = [
    { id: 'sub-1', name: 'Aarav Sharma', contest: 'India Creator Showdown 2026', type: 'Video', time: '10 mins ago', status: 'Approved', score: 185 },
    { id: 'sub-2', name: 'Priya Nair', contest: 'SaaS Pitch & Innovation Cup', type: 'Document', time: '1 hr ago', status: 'Pending', score: 0 },
    { id: 'sub-3', name: 'Kabir Sen', contest: 'Eco Journalism Challenge', type: 'Video', time: '3 hrs ago', status: 'Approved', score: 142 },
    { id: 'sub-4', name: 'Ananya Roy', contest: 'Street Dance Auditions', type: 'Audio/Video', time: '5 hrs ago', status: 'Pending', score: 0 }
  ];

  return (
    <div className="space-y-6 text-left animate-fade-in">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-poppins text-white dark:text-white light:text-black tracking-tight">
            Administrative Control Overview
          </h1>
          <p className="text-xs text-white/50 dark:text-white/50 light:text-black/50">
            Welcome back, <span className="font-bold text-white dark:text-white light:text-black">{user?.name || 'Raj Patel'}</span>. Operating in <span className="text-brandPrimary font-bold">{selectedRole} console</span>.
          </p>
        </div>
        
        <button
          onClick={() => onViewChange('analytics')}
          className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-semibold shadow-lg hover:shadow-brandPrimary/10 flex items-center gap-1.5 transition-all"
        >
          <span>View full charts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid statistics counter cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS_DATA.map((stat) => (
          <div 
            key={stat.id} 
            className="glassmorphism p-5 rounded-2xl border border-white/10 dark:border-white/5 light:border-black/10 flex flex-col justify-between h-36 relative overflow-hidden group hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50 dark:text-white/50 light:text-black/50 font-medium">{stat.label}</span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] flex items-center gap-0.5 ${
                stat.positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {stat.positive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                {stat.growth}
              </span>
            </div>

            <div className="flex items-end justify-between mt-3">
              <div>
                <p className="text-2xl font-extrabold text-white dark:text-white light:text-black font-poppins">
                  {stat.id === 'revenue' && '₹'}
                  {stat.id === 'users' && '184,203'}
                  {stat.id === 'active' && '24,802'}
                  {stat.id === 'revenue' && (user?.walletBalance !== undefined ? (user.walletBalance * 10).toLocaleString() : '2,50,000')}
                  {stat.id === 'votes' && '12,45,803'}
                </p>
              </div>

              {/* Sparkline Graph */}
              <div className="w-20 h-10">
                <svg className="w-full h-full" viewBox="0 0 100 30">
                  <path
                    d={`M ${stat.sparkline.map((val, index) => `${(index * 16.6).toFixed(1)},${(30 - (val / 30) * 25).toFixed(1)}`).join(' L ')}`}
                    fill="none"
                    stroke={stat.positive ? '#06b6d4' : '#f43f5e'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-brandPrimary/5 group-hover:bg-brandPrimary/10 blur-xl pointer-events-none transition-colors" />
          </div>
        ))}
      </div>

      {/* Main Grid: Left Overrides / Audits, Right Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column options */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Admin: KYC review checklists */}
          {selectedRole === 'Admin' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold uppercase text-brandPrimary tracking-wider">Pending KYC Approvals</h3>
              {pendingKycs.length === 0 ? (
                <div className="p-6 bg-white/5 rounded-2xl text-center text-xs text-white/40 border border-white/5">No pending verification queues.</div>
              ) : (
                <div className="space-y-4">
                  {pendingKycs.map((k, idx) => (
                    <div key={idx} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-white">{k.userDetail?.name || 'Contestant'}</h4>
                        <p className="text-[10px] text-white/40 mt-0.5">{k.userDetail?.email} • {k.documentType}</p>
                        <div className="flex gap-4 mt-2 text-[10px] text-brandSecondary font-bold">
                          <span>Doc: {k.documentNumber}</span>
                          <span>AI: {k.livenessScore}% Match</span>
                        </div>
                      </div>
                      <div className="flex sm:flex-col justify-end gap-2">
                        <button
                          onClick={() => handleReviewKycSubmit(k.userId, 'Approved')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-[10px] font-bold text-white flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReviewKycSubmit(k.userId, 'Rejected')}
                          className="px-3.5 py-1.5 bg-red-600/10 border border-red-500/20 hover:bg-red-600 hover:text-white rounded-xl text-[10px] font-bold text-red-400 flex items-center gap-1"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Super Admin Panels */}
          {selectedRole === 'Super Admin' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* User Promotion Panel */}
              <div className="glassmorphism p-5 rounded-2xl border border-white/10 dark:border-white/5 light:border-black/10">
                <h3 className="text-xs font-bold uppercase text-brandPrimary tracking-wider mb-3">Elevate User Role</h3>
                <form onSubmit={handlePromoteRole} className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 dark:text-white/40 uppercase mb-1">User Email Address</label>
                    <input
                      type="email"
                      value={promotionEmail}
                      onChange={(e) => setPromotionEmail(e.target.value)}
                      placeholder="e.g. user@domain.com"
                      className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-brandPrimary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 dark:text-white/40 uppercase mb-1">Target Account Role</label>
                    <select
                      value={promotionRole}
                      onChange={(e) => setPromotionRole(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-darkCard border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                    >
                      <option value="Contestant">Contestant</option>
                      <option value="Judge">Judge</option>
                      <option value="Sponsor">Sponsor</option>
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Promote Role
                  </button>
                </form>
              </div>

              {/* Manual Result Override Panel */}
              <div className="glassmorphism p-5 rounded-2xl border border-white/10 dark:border-white/5 light:border-black/10">
                <h3 className="text-xs font-bold uppercase text-brandSecondary tracking-wider mb-3">Manual Result Override</h3>
                <form onSubmit={handleManualOverride} className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 dark:text-white/40 uppercase mb-1">Result ID (MongoDB ObjectId)</label>
                    <input
                      type="text"
                      value={manualResultId}
                      onChange={(e) => setManualResultId(e.target.value)}
                      placeholder="e.g. 64fc3a79bc..."
                      className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-brandPrimary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 dark:text-white/40 uppercase mb-1">Override Status</label>
                    <select
                      value={manualStatus}
                      onChange={(e) => setManualStatus(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-darkCard border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                    >
                      <option value="Qualified">Qualified (Pass)</option>
                      <option value="Failed">Failed (Fail)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-brandSecondary hover:bg-brandSecondary/90 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Override Result Status
                  </button>
                </form>
              </div>

              {/* Platform Audit Logs Ledger */}
              <div className="glassmorphism p-5 rounded-2xl border border-white/10 dark:border-white/5 light:border-black/10">
                <h3 className="text-xs font-bold uppercase text-white dark:text-white light:text-black tracking-wider mb-3">Security Audit Trail Logs</h3>
                {auditLogs.length === 0 ? (
                  <div className="p-4 bg-white/5 rounded-xl text-center text-xs text-white/40 border border-white/5">No audit logs scanned in system.</div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {auditLogs.map((log) => (
                      <div key={log._id} className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 text-xs text-left">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-brandPrimary">{log.action}</span>
                          <span className="text-[9px] text-slate-400 dark:text-white/30">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-white/70">{log.details}</p>
                        <div className="mt-1.5 flex gap-3 text-[9px] text-slate-400 dark:text-white/40">
                          <span>IP: {log.ipAddress || '127.0.0.1'}</span>
                          <span>Device: {log.deviceInfo || 'System'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Real-time Anti-Cheat Feed */}
          <div className="glassmorphism p-5 rounded-2xl border border-white/10 dark:border-white/5 light:border-black/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase text-white dark:text-white light:text-black tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-brandSecondary animate-pulse" />
                <span>Anti-Cheat Monitor Console</span>
              </h3>
              <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold font-mono">Live Monitoring</span>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-emerald-400/90 space-y-1.5 divide-y divide-white/5 max-h-36 overflow-y-auto">
              <div className="py-1 flex justify-between">[14:32:02] Anti-Cheat Audit Daemon initialized. <span className="text-white/30">INFO</span></div>
              <div className="py-1 flex justify-between">[14:35:10] Duplicate browser fingerprint scanned for User Aarav - PASSED. <span className="text-brandSecondary">OK</span></div>
              <div className="py-1 flex justify-between">[14:38:40] AI facial match score for sub-1 returned: 98.4% - APPROVED. <span className="text-brandSecondary">OK</span></div>
              <div className="py-1 flex justify-between">[14:42:15] Plagiarism scanner completed check on pitch_deck.pdf - 0% Copied. <span className="text-brandSecondary">OK</span></div>
            </div>
          </div>

        </div>

        {/* Right column options: Submissions Lists */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glassmorphism p-5 rounded-2xl border border-white/10 dark:border-white/5 light:border-black/10">
            <h3 className="text-xs font-bold uppercase text-white dark:text-white light:text-black tracking-wider mb-4">Recent Auditions Submissions</h3>
            <div className="space-y-3.5">
              {recentSubmissions.map(sub => (
                <div key={sub.id} className="flex items-center justify-between gap-3 text-xs p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{sub.name}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-white/40 mt-0.5 truncate max-w-[160px]">{sub.contest}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                      sub.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {sub.status === 'Approved' ? <Check className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5 animate-spin" />}
                      {sub.status}
                    </span>
                    <span className="block text-[10px] text-slate-400 dark:text-white/40 mt-1">{sub.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
export default DashboardHome;
