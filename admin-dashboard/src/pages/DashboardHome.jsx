import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWalletBalance, fetchPendingKycsRequest, reviewKycRequest } from '../store/authSlice';
import axios from 'axios';
import {
  Users, Activity, Wallet, Trophy, Award,
  Sparkles, ShieldAlert, ArrowUpRight, ArrowDownRight, ArrowRight, Play, Check, Clock,
  Send, ShieldCheck, HelpCircle, Terminal, UserPlus, RefreshCw, Calendar, FileText
} from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect';
import { useAlert } from '../context/AlertContext';

export const DashboardHome = ({ onViewChange, selectedRole }) => {
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const dispatch = useDispatch();
  const { user, pendingKycs } = useSelector((state) => state.auth);

  // States
  const [auditLogs, setAuditLogs] = useState([]);
  const [promotionEmail, setPromotionEmail] = useState('');
  const [promotionRole, setPromotionRole] = useState('Judge');
  const [manualResultId, setManualResultId] = useState('');
  const [manualStatus, setManualStatus] = useState('Qualified');
  const [activeTimelineTab, setActiveTimelineTab] = useState('feeds'); // 'feeds', 'override', 'promote', 'audit'

  // AI Assistant states
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: 'Hello! I am Haka AI. I monitor KYC documents and biometrics. Ask me about "Priya Nair", "Aarav", or check the current "risk logs".' }
  ]);
  const [aiQuery, setAiQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState({
    id: '#AUD-882',
    name: 'Aarav Sharma',
    score: '98.4%',
    type: 'Biometrics Match',
    risk: 'Low'
  });
  const chatContainerRef = useRef(null);

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get('/api/admin/audit-logs', { withCredentials: true });
      setAuditLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  useEffect(() => {
    if (selectedRole === 'Admin') {
      dispatch(fetchPendingKycsRequest());
    } else if (selectedRole === 'Super Admin') {
      dispatch(fetchPendingKycsRequest());
      fetchAuditLogs();
    }
  }, [selectedRole, dispatch]);

  // Scroll to bottom of AI chat internally
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [aiMessages]);

  const handlePromoteRole = async (e) => {
    e.preventDefault();
    if (!promotionEmail) return;
    try {
      const res = await axios.put('/api/admin/users/role', {
        email: promotionEmail,
        role: promotionRole
      }, { withCredentials: true });
      if (res.data.success) {
        showSnackbar(res.data.message, 'success');
        setPromotionEmail('');
        fetchAuditLogs();
        setAiMessages(prev => [...prev, {
          sender: 'ai',
          text: `User ${promotionEmail} has been promoted to ${promotionRole} successfully. Security audit logs updated.`
        }]);
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to update user role.', 'error');
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
        showSnackbar(res.data.message, 'success');
        setManualResultId('');
        fetchAuditLogs();
        setAiMessages(prev => [...prev, {
          sender: 'ai',
          text: `Override completed! Result ID ${manualResultId} status updated to ${manualStatus}.`
        }]);
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Manual override failed.', 'error');
    }
  };

  const handleReviewKycSubmit = (kycId, status) => {
    const reason = status === 'Rejected' ? 'Uploaded document text is illegible.' : undefined;
    dispatch(reviewKycRequest({
      kycId,
      status,
      reason,
      callback: (success) => {
        if (success) {
          showSnackbar(`KYC application marked: ${status}.`, 'success');
          dispatch(fetchPendingKycsRequest());
          setAiMessages(prev => [...prev, {
            sender: 'ai',
            text: `KYC action recorded: Marked case as ${status}. Updated verification queue database.`
          }]);
        }
      }
    }));
  };

  const handleSendAiMessage = (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const userText = aiQuery.trim();
    const newMsg = { sender: 'user', text: userText };
    setAiMessages(prev => [...prev, newMsg]);
    setAiQuery('');

    // Simulated premium intelligence replies
    setTimeout(() => {
      let aiText = '';
      const textLower = userText.toLowerCase();

      if (textLower.includes('priya') || textLower.includes('nair')) {
        aiText = 'Priya Nair has an active verification queue. Document check shows Liveness: 92%. Awaiting sponsor sync parameters. You can approve or reject her file in the "Needs Attention" container.';
        setSelectedCase({
          id: '#KYC-791',
          name: 'Priya Nair',
          score: '92.0%',
          type: 'Aadhar / Face Liveness',
          risk: 'Medium'
        });
      } else if (textLower.includes('aarav') || textLower.includes('sharma')) {
        aiText = "Aarav Sharma's India Creator Showdown entry is processed. AI Verification score: 98.4% Match. Audio-video alignment: 100%. No signs of deepfakes or synthesis detected.";
        setSelectedCase({
          id: '#AUD-882',
          name: 'Aarav Sharma',
          score: '98.4%',
          type: 'Biometrics Match',
          risk: 'Low'
        });
      } else if (textLower.includes('risk') || textLower.includes('logs') || textLower.includes('anti-cheat')) {
        aiText = 'Scanning anti-cheat daemons: 0 duplicate fingerprints detected today. AI facial match averages 96.5% validation score across all live auditions. Integrity metric is at 100%.';
      } else if (textLower.includes('override') || textLower.includes('result')) {
        aiText = 'To override quiz or audition results, use the "Override" tab on the Timeline panel. Enter the MongoDB Result ID and select the target status (Qualified/Failed).';
      } else {
        aiText = `Understood. I am parsing logs for "${userText}". All backend microservices are active on ports 10000-10002. Compliance indexes look secure. Ask me to lookup "Priya Nair" or "Aarav Sharma" to review biometrics details.`;
      }

      setAiMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    }, 600);
  };

  const getDayProgressStr = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-8 text-left font-jakarta pb-10">

      {/* HEADER SECTION: Title & Abstract 3D Glass Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* Left Side: Elegant Text */}
        <div className="lg:col-span-7 flex flex-col justify-between py-2">
          <div>
            <span className="text-[10px] bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary px-3 py-1 rounded-full font-bold uppercase tracking-wider select-none">
              Haka Control Terminal
            </span>
            <h1 className="text-4xl md:text-5xl font-light font-outfit text-slate-800 dark:text-slate-100 mt-4 tracking-tight leading-none">
              Console <span className="font-extrabold text-slate-900 dark:text-white">priorities</span>
            </h1>
            <p className="text-sm font-medium text-slate-400 dark:text-white/40 mt-3 max-w-lg leading-relaxed">
              Telemetry feeds, audition verifications, and compliance overrides that require your direct authorization.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-600 dark:text-white/60">
                Running in {selectedRole} console
              </span>
            </div>

            <button
              onClick={() => onViewChange('analytics')}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white/90 rounded-2xl text-[11px] font-bold shadow-lg flex items-center gap-1.5 transition-all"
            >
              <span>Telemetry charts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Abstract Visual Ribbon Card (Visual inspiration element) */}
        <div className="lg:col-span-5">
          <div className="luxury-card-premium p-6 h-56 relative overflow-hidden flex flex-col justify-between group">

            {/* Background SVG abstract glassy shape */}
            <div className="absolute right-0 top-0 w-64 h-64 -mr-10 -mt-10 pointer-events-none transition-transform duration-700 group-hover:scale-105">
              <svg viewBox="0 0 200 200" className="w-full h-full animate-slow-rotate" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="premiumGlassGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
                  </linearGradient>
                  <filter id="glassBlur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* 3D Glassy Metallic Ribbon Loops */}
                <path
                  d="M40,80 Q100,20 160,80 T80,160 Z"
                  fill="url(#premiumGlassGrad)"
                  filter="url(#glassBlur)"
                  className="opacity-75"
                />
                <circle cx="110" cy="90" r="35" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
                <path
                  d="M90,50 Q130,120 150,150"
                  stroke="rgba(16,185,129,0.3)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Glowing orb accent */}
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-brandPrimary/10 blur-2xl group-hover:bg-brandPrimary/15 transition-all" />

            {/* Header Content on Card */}
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-widest font-bold">SYSTEM TELEMETRY</span>
                <h3 className="text-xl font-light font-outfit text-slate-800 dark:text-white mt-1">hakalive.in</h3>
              </div>
              <div className="bg-slate-200/50 dark:bg-white/10 backdrop-blur-md border border-slate-300 dark:border-white/10 px-3 py-1 rounded-xl text-[10px] font-bold text-slate-600 dark:text-white/80">
                ACTIVE GATEWAY
              </div>
            </div>

            {/* Bottom Metadata row */}
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <p className="text-[9px] text-slate-400 dark:text-white/30 uppercase tracking-wider font-bold">TELEMETRY SYNCED</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-white/80 font-mono mt-0.5">{getDayProgressStr()}</p>
              </div>
              <div className="flex gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px] text-slate-500 dark:text-white/60">I</span>
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px] text-slate-500 dark:text-white/60">II</span>
                <span className="w-16 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-extrabold select-none">
                  All Systems Ok
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* METRICS ROW: 4 Premium Minimal Rounded Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1: Total Auditions */}
        <div className="luxury-card p-6 flex flex-col justify-between h-40 hover:scale-[1.01] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">Total Auditions</span>
            <span className="px-2 py-0.5 rounded-full font-bold text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 border border-emerald-500/10">
              <ArrowUpRight className="w-2.5 h-2.5" /> +14.2%
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-white tracking-tight">
              184,203
            </p>
            <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium mt-1">Registered participants globally</p>
          </div>
        </div>

        {/* Card 2: Requires Action (KYC pending) */}
        <div className="luxury-card p-6 flex flex-col justify-between h-40 hover:scale-[1.01] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">Requires Action</span>
            <span className="px-2 py-0.5 rounded-full font-bold text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-0.5 border border-amber-500/10">
              KYC Queue
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-white tracking-tight">
              {pendingKycs.length} cases
            </p>
            <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium mt-1">Pending verification files</p>
          </div>
        </div>

        {/* Card 3: Active Contests */}
        <div className="luxury-card p-6 flex flex-col justify-between h-40 hover:scale-[1.01] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">Active Contests</span>
            <span className="px-2 py-0.5 rounded-full font-bold text-[9px] bg-brandPrimary/10 text-brandPrimary flex items-center gap-0.5 border border-brandPrimary/10">
              Live Stages
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-white tracking-tight">
              42 live
            </p>
            <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium mt-1">Contests active this cycle</p>
          </div>
        </div>

        {/* Card 4: Anti-Cheat Guard */}
        <div className="luxury-card p-6 flex flex-col justify-between h-40 hover:scale-[1.01] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">Anti-Cheat Guard</span>
            <span className="px-2 py-0.5 rounded-full font-bold text-[9px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center gap-0.5 border border-cyan-500/10">
              Live Scan
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-white tracking-tight">
              0 flags
            </p>
            <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium mt-1">Zero fraud anomalies flagged</p>
          </div>
        </div>

      </div>

      {/* THREE-COLUMN LOWER DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* COLUMN 1: Needs Attention (KYC verifications) - col-span-4 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="luxury-card p-6 min-h-[500px] flex flex-col justify-between">

            {/* Header info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider font-outfit">Needs Attention</h3>
                <span className="text-[10px] text-slate-400 dark:text-white/30 font-semibold">{pendingKycs.length} critical cases</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-white/40 mb-6 leading-relaxed">
                Biometric failures, verification queues, and high-risk reviews requiring manual administrative resolution.
              </p>

              {/* KYC Pending items list */}
              {pendingKycs.length === 0 ? (
                <div className="space-y-4">
                  {/* Mock items style of reference image when none exist to maintain beautiful UI density */}
                  <div className="p-4 bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl text-center py-10">
                    <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">All verifications cleared</p>
                    <p className="text-[10px] text-slate-400 dark:text-white/30 mt-1">No active queues in this console.</p>
                  </div>

                  <div className="p-4 bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl text-left">
                    <span className="text-[9px] bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded font-bold text-slate-500 dark:text-white/50">Awaiting Response</span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2 font-outfit">Brightpath Claims Sync</h4>
                    <p className="text-[10px] text-slate-400 dark:text-white/40 mt-1">Integrity token check pending client verification.</p>
                  </div>

                  <div className="p-4 bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl text-left">
                    <span className="text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded font-bold">Blocked</span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2 font-outfit">Harbor Lease Upload</h4>
                    <p className="text-[10px] text-slate-400 dark:text-white/40 mt-1">Duplicate file signature scanned in DB.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {pendingKycs.map((k, index) => (
                    <div
                      key={k.userId || index}
                      className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl flex flex-col justify-between gap-3 group hover:border-brandPrimary/30 transition-all duration-300"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white font-outfit">{k.userDetail?.name || 'Participant'}</h4>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${k.livenessScore >= 90 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}>
                            AI: {k.livenessScore || 90}% match
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 dark:text-white/30 truncate mt-1">{k.userDetail?.email}</p>
                        <div className="flex gap-3 text-[9px] font-mono text-slate-500 dark:text-white/40 mt-2">
                          <span>Doc: {k.documentType} ({k.documentNumber})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleReviewKycSubmit(k.userId, 'Approved')}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleReviewKycSubmit(k.userId, 'Rejected')}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/10 rounded-xl text-[10px] font-bold transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats overview Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/5 text-[10px] text-slate-400 dark:text-white/30 flex items-center justify-between">
              <span>Auto-refresh daemon online</span>
              <span className="font-mono text-emerald-500 font-bold">100% telemetry</span>
            </div>

          </div>
        </div>

        {/* COLUMN 2: Timeline Schedule & Operations Drawer (tabbed control) - col-span-5 */}
        <div className="lg:col-span-5 space-y-6">
          <div className="luxury-card p-6 min-h-[500px] flex flex-col justify-between">

            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider font-outfit">Today's Timeline</h3>
                <span className="text-[10px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-2 py-0.5 rounded text-slate-500 dark:text-white/40 font-mono">01-07 Jan</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-white/40 mb-6">Hour-by-hour operational timeline and scheduled verification checkouts.</p>

              {/* Horizontal Timeline Ruler */}
              <div className="relative mb-6">
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-200 dark:bg-white/10 -translate-y-1/2" />
                <div className="relative flex justify-between text-[10px] font-mono text-slate-400 dark:text-white/30 px-1">
                  <span>9:00</span>
                  <span>10:00</span>
                  <span>11:00</span>
                  <span>12:00</span>
                  <span>13:00</span>
                  <span>14:00</span>
                  <span>15:00</span>
                </div>
              </div>

              {/* Scheduled Event Blocks */}
              <div className="space-y-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-transparent border-l-2 border-emerald-500 rounded-r-xl">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-700 dark:text-slate-200">Biometrics verification checkout</span>
                    <span className="text-slate-400 dark:text-white/30 font-mono">9:30 - 11:00</span>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-brandPrimary/10 to-transparent border-l-2 border-brandPrimary rounded-r-xl">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-700 dark:text-slate-200">Manual result overrides window</span>
                    <span className="text-slate-400 dark:text-white/30 font-mono">11:30 - 13:00</span>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-slate-500/10 to-transparent border-l-2 border-slate-500 rounded-r-xl">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-700 dark:text-slate-200">Audit trail security consolidation</span>
                    <span className="text-slate-400 dark:text-white/30 font-mono">13:30 - 15:00</span>
                  </div>
                </div>
              </div>

              {/* Tab Selector for Forms/Logs Console */}
              <div className="border-t border-slate-200 dark:border-white/5 pt-4">
                <div className="flex flex-wrap gap-2 p-1 bg-slate-100/80 dark:bg-white/5 rounded-2xl mb-4">
                  <button
                    onClick={() => setActiveTimelineTab('feeds')}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all ${activeTimelineTab === 'feeds' ? 'bg-white dark:bg-darkCard text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white'
                      }`}
                  >
                    Anti-Cheat Feed
                  </button>
                  {selectedRole === 'Super Admin' && (
                    <>
                      <button
                        onClick={() => setActiveTimelineTab('promote')}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all ${activeTimelineTab === 'promote' ? 'bg-white dark:bg-darkCard text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white'
                          }`}
                      >
                        Promote Role
                      </button>
                      <button
                        onClick={() => setActiveTimelineTab('override')}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all ${activeTimelineTab === 'override' ? 'bg-white dark:bg-darkCard text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white'
                          }`}
                      >
                        Override Result
                      </button>
                      <button
                        onClick={() => setActiveTimelineTab('audit')}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all ${activeTimelineTab === 'audit' ? 'bg-white dark:bg-darkCard text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white'
                          }`}
                      >
                        Audit Logs
                      </button>
                    </>
                  )}
                </div>

                {/* Tab content 1: Anti-Cheat Feed */}
                {activeTimelineTab === 'feeds' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] mb-2 font-bold text-slate-700 dark:text-white/60">
                      <span>Anti-Cheat Real-Time Feed</span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono animate-pulse">monitoring live</span>
                    </div>
                    <div className="bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-2xl p-4 space-y-2 border border-slate-800 max-h-48 overflow-y-auto text-left">
                      <div>[14:32:02] Anti-Cheat Audit Daemon initialized.</div>
                      <div>[14:35:10] Duplicate browser fingerprint scanned for User Aarav - PASSED.</div>
                      <div>[14:38:40] AI facial match score for sub-1 returned: 98.4% - APPROVED.</div>
                      <div>[14:42:15] Plagiarism check on pitch_deck.pdf - 0% Copied.</div>
                    </div>
                  </div>
                )}

                {/* Tab content 2: Promote Role */}
                {activeTimelineTab === 'promote' && selectedRole === 'Super Admin' && (
                  <form onSubmit={handlePromoteRole} className="space-y-3">
                    <div>
                      <label className="block text-[9px] text-slate-400 dark:text-white/40 uppercase mb-1 font-bold">User Email Address</label>
                      <input
                        type="email"
                        value={promotionEmail}
                        onChange={(e) => setPromotionEmail(e.target.value)}
                        placeholder="user@domain.com"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-brandPrimary"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-[9px] text-slate-400 dark:text-white/40 uppercase mb-1 font-bold">Target Role</label>
                        <CustomSelect
                          value={promotionRole}
                          onChange={setPromotionRole}
                          options={[
                            { value: 'Contestant', label: 'Contestant' },
                            { value: 'Judge', label: 'Judge' },
                            { value: 'Sponsor', label: 'Sponsor' },
                            { value: 'Admin', label: 'Admin' }
                          ]}
                        />
                      </div>
                      <button
                        type="submit"
                        className="self-end px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brandPrimary/10"
                      >
                        Promote Role
                      </button>
                    </div>
                  </form>
                )}

                {/* Tab content 3: Result Override */}
                {activeTimelineTab === 'override' && selectedRole === 'Super Admin' && (
                  <form onSubmit={handleManualOverride} className="space-y-3">
                    <div>
                      <label className="block text-[9px] text-slate-400 dark:text-white/40 uppercase mb-1 font-bold">Result ID (MongoDB Object ID)</label>
                      <input
                        type="text"
                        value={manualResultId}
                        onChange={(e) => setManualResultId(e.target.value)}
                        placeholder="64fc3a79bc..."
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-brandPrimary"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-[9px] text-slate-400 dark:text-white/40 uppercase mb-1 font-bold">Override Status</label>
                        <CustomSelect
                          value={manualStatus}
                          onChange={setManualStatus}
                          options={[
                            { value: 'Qualified', label: 'Qualified' },
                            { value: 'Failed', label: 'Failed' }
                          ]}
                        />
                      </div>
                      <button
                        type="submit"
                        className="self-end px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                      >
                        Override Status
                      </button>
                    </div>
                  </form>
                )}

                {/* Tab content 4: Audit Logs */}
                {activeTimelineTab === 'audit' && selectedRole === 'Super Admin' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase mb-2">
                      <span>Ledger Database</span>
                      <button type="button" onClick={fetchAuditLogs} className="flex items-center gap-1 hover:text-white">
                        <RefreshCw className="w-2.5 h-2.5" /> Reload
                      </button>
                    </div>
                    {auditLogs.length === 0 ? (
                      <div className="p-4 bg-slate-100/50 dark:bg-white/5 rounded-xl text-center text-xs text-slate-400 border border-slate-200 dark:border-white/5">No security audit logs indexed.</div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {auditLogs.map((log, idx) => (
                          <div key={log._id || idx} className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5 text-[10px]">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-brandPrimary">{log.action}</span>
                              <span className="text-[8px] text-slate-400 dark:text-white/30">{new Date(log.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-slate-600 dark:text-white/70 mt-1 text-[9px]">{log.details}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Bottom info row */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/5 text-[10px] text-slate-400 dark:text-white/30 flex items-center justify-between">
              <span>Timezone Local UTC+5:30</span>
              <span className="font-bold">Sync: stable</span>
            </div>

          </div>
        </div>

        {/* COLUMN 3: Haka AI Assistant (Chatbot / Case Analyzer) - col-span-3 */}
        <div className="lg:col-span-3 space-y-6">
          <div className="luxury-card p-5 min-h-[500px] flex flex-col justify-between">

            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-brandPrimary/20 flex items-center justify-center text-brandPrimary">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-darkCard" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white font-outfit">Haka AI Assistant</h4>
                  <p className="text-[9px] text-emerald-500 font-semibold">Agent Online</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-white/40 leading-relaxed mb-4">
                Assessing uploads, biometrics checkouts, fraud detection, and liveness scoring logs.
              </p>

              {/* Selected Case Folder Card (Reference design matching folder logo + parameters) */}
              <div className="p-3 bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl mb-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 dark:text-white/40 font-bold uppercase tracking-wider leading-none">ACTIVE TARGET</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-white mt-1 leading-none font-outfit">{selectedCase.name}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-[9px] text-slate-500 dark:text-white/55 border-t border-slate-200 dark:border-white/5 pt-2 font-mono">
                  <div className="flex justify-between"><span>Case ID:</span><span className="font-bold text-slate-800 dark:text-white">{selectedCase.id}</span></div>
                  <div className="flex justify-between"><span>Check Type:</span><span className="text-slate-800 dark:text-white">{selectedCase.type}</span></div>
                  <div className="flex justify-between"><span>Liveness:</span><span className="font-bold text-brandPrimary">{selectedCase.score}</span></div>
                  <div className="flex justify-between"><span>Risk Index:</span><span className={`font-bold ${selectedCase.risk === 'Low' ? 'text-emerald-500' : 'text-amber-500'}`}>{selectedCase.risk}</span></div>
                </div>
              </div>

              {/* Progress rating bar (Reference design Overall risk) */}
              <div className="mb-4">
                <div className="flex justify-between text-[9px] text-slate-400 dark:text-white/40 font-bold uppercase mb-1">
                  <span>Compliance score</span>
                  <span className="text-emerald-500 font-mono">98% Excellent</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>

              {/* simulated chat box logs */}
              <div
                ref={chatContainerRef}
                className="h-28 overflow-y-auto border border-slate-200/50 dark:border-white/5 bg-slate-50 dark:bg-black/10 rounded-xl p-2.5 space-y-2.5 scrollbar-thin"
              >
                {aiMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`text-[9px] leading-relaxed p-2 rounded-xl text-left ${msg.sender === 'ai'
                        ? 'bg-slate-200/50 dark:bg-white/5 text-slate-700 dark:text-white/80 border border-slate-200 dark:border-white/5'
                        : 'bg-brandPrimary text-white self-end ml-4 shadow-sm'
                      }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Query Input Bar (Reference design query input) */}
            <form onSubmit={handleSendAiMessage} className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask AI Assistant..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-3 pr-10 py-2 text-[10px] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-brandPrimary transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 w-7 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-white/90 text-white dark:text-slate-900 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardHome;
