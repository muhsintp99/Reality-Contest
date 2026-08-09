import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPendingKycsRequest, reviewKycRequest } from '../store/authSlice';
import axios from 'axios';
import {
  Users, Activity, Wallet, Trophy, Award, Sparkles, ShieldAlert,
  ArrowUpRight, ArrowDownRight, ArrowRight, Play, Check, Clock,
  Send, ShieldCheck, HelpCircle, UserPlus, RefreshCw, Calendar, FileText,
  Filter, DollarSign, Landmark, CheckCircle, Flame, PieChart, TrendingUp,
  Bot, Terminal, Globe
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

// Dynamic timeframe metric LEDGER
const TIMEFRAME_DATA = {
  today: {
    todaysUsers: '142',
    todaysUsersChange: '+18%',
    todaysRevenue: '₹18,450',
    todaysRevenueChange: '+12.4%',
    todaysWithdrawals: '₹6,200',
    todaysEntries: '412',
    todaysEntriesChange: '+8.5%',
    graphLabels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    revenueSeries: [1200, 2400, 4800, 8900, 14200, 16800, 18450],
    completionRate: '94.2%',
    avgSessionTime: '18m 45s',
    accuracyRate: '88.5%',
    popularCategory: 'Logic & Reaction'
  },
  week: {
    todaysUsers: '1,280',
    todaysUsersChange: '+24%',
    todaysRevenue: '₹1,42,000',
    todaysRevenueChange: '+19.8%',
    todaysWithdrawals: '₹45,000',
    todaysEntries: '2,890',
    todaysEntriesChange: '+15.2%',
    graphLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    revenueSeries: [14000, 18000, 22000, 19500, 26000, 31000, 28000],
    completionRate: '92.8%',
    avgSessionTime: '21m 10s',
    accuracyRate: '86.2%',
    popularCategory: 'Grand Auditions'
  },
  month: {
    todaysUsers: '5,420',
    todaysUsersChange: '+31%',
    todaysRevenue: '₹5,80,000',
    todaysRevenueChange: '+28.4%',
    todaysWithdrawals: '₹1,80,000',
    todaysEntries: '11,400',
    todaysEntriesChange: '+22.0%',
    graphLabels: ['W1', 'W2', 'W3', 'W4'],
    revenueSeries: [120000, 145000, 160000, 155000],
    completionRate: '91.5%',
    avgSessionTime: '24m 00s',
    accuracyRate: '85.0%',
    popularCategory: 'Speed & Memory'
  },
  year: {
    todaysUsers: '48,200',
    todaysUsersChange: '+85%',
    todaysRevenue: '₹42,50,000',
    todaysRevenueChange: '+64.5%',
    todaysWithdrawals: '₹12,40,000',
    todaysEntries: '94,000',
    todaysEntriesChange: '+45.1%',
    graphLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    revenueSeries: [380000, 450000, 520000, 610000, 720000, 780000, 790000],
    completionRate: '93.0%',
    avgSessionTime: '26m 30s',
    accuracyRate: '87.4%',
    popularCategory: 'All Reality Categories'
  }
};

const RECENT_WINNERS_LIST = [
  { rank: 1, name: 'Aarav Sharma', prize: '₹1,00,000', contest: 'Grand Audition Season 1', time: '10 mins ago' },
  { rank: 2, name: 'Priya Nair', prize: '₹50,000', contest: 'Grand Audition Season 1', time: '25 mins ago' },
  { rank: 3, name: 'Rohan Mehta', prize: '₹25,000', contest: 'Speed Tapper Rush', time: '1 hour ago' },
  { rank: 4, name: 'Ananya Verma', prize: '₹10,000', contest: 'Logic Matrix Arena', time: '2 hours ago' }
];

export const DashboardHome = ({ onViewChange, selectedRole }) => {
  const { showAlert, showSnackbar } = useAlert();
  const dispatch = useDispatch();
  const { user, pendingKycs } = useSelector((state) => state.auth);

  // Dynamic Backend Counts State
  const [counts, setCounts] = useState({
    totalUsers: 0,
    activeContests: 0,
    pendingWithdrawals: 0,
    totalContests: 0,
    activeUsers: 0
  });

  // Timeframe & Tab Filter States
  const [timeframeFilter, setTimeframeFilter] = useState('today');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [activeTimelineTab, setActiveTimelineTab] = useState('feeds');

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

  const [promotionEmail, setPromotionEmail] = useState('');
  const [promotionRole, setPromotionRole] = useState('Judge');
  const [manualResultId, setManualResultId] = useState('');
  const [manualStatus, setManualStatus] = useState('Qualified');

  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchMetrics();
    dispatch(fetchPendingKycsRequest());
  }, [dispatch]);

  const fetchMetrics = async () => {
    try {
      const [userRes, contestRes, wtdRes] = await Promise.allSettled([
        axios.get('/api/admin/users/Contestant', { withCredentials: true }),
        axios.get('/api/contests', { withCredentials: true }),
        axios.get('/api/admin/withdrawals', { withCredentials: true })
      ]);

      const userList = userRes.status === 'fulfilled' && userRes.value?.data?.users ? userRes.value.data.users : [];
      const contestList = contestRes.status === 'fulfilled' && contestRes.value?.data?.contests ? contestRes.value.data.contests : [];
      const wtdList = wtdRes.status === 'fulfilled' && wtdRes.value?.data?.data ? wtdRes.value.data.data : [];

      setCounts({
        totalUsers: userRes.status === 'fulfilled' ? userList.length : 0,
        activeContests: contestRes.status === 'fulfilled' ? contestList.filter(c => c.status === 'Active' || c.status === 'Published').length : 0,
        pendingWithdrawals: wtdRes.status === 'fulfilled' ? wtdList.filter(w => w.status === 'Pending').length : 0,
        totalContests: contestRes.status === 'fulfilled' ? contestList.length : 0,
        activeUsers: userRes.status === 'fulfilled' ? userList.filter(u => u.status === 'Active').length : 0
      });
    } catch (err) {
      console.error('Error fetching dashboard counts:', err);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [aiMessages]);

  const metrics = TIMEFRAME_DATA[timeframeFilter] || TIMEFRAME_DATA['today'];
  const maxRevenue = Math.max(...metrics.revenueSeries) * 1.15;

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
      } else {
        aiText = `Understood. I am parsing logs for "${userText}". All backend microservices are active. Ask me to lookup "Priya Nair" or "Aarav Sharma" for biometrics.`;
      }

      setAiMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    }, 500);
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

      {/* HEADER SECTION: Premium 3D Glass Ribbon Card & Title */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
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

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-600 dark:text-white/60">
                Running in {selectedRole} console
              </span>
            </div>

            {/* Timeframe Filter Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
              {[
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'Last Week' },
                { id: 'month', label: 'This Month' },
                { id: 'year', label: 'This Year' }
              ].map(tf => (
                <button
                  key={tf.id}
                  onClick={() => { setTimeframeFilter(tf.id); showSnackbar(`Filtered to ${tf.label}`, 'info'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    timeframeFilter === tf.id
                      ? 'bg-brandPrimary text-white shadow-md shadow-brandPrimary/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: 3D Wireframe Spinning Globe System Telemetry Card */}
        <div className="lg:col-span-5">
          <div className="luxury-card-premium p-6 h-56 relative overflow-hidden flex flex-col justify-between group rounded-3xl border border-[#C4E2A8]/70 dark:border-white/10 bg-gradient-to-br from-[#E2F1D5]/90 via-[#EDF6E5] to-[#F6FCF0] dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 text-slate-800 dark:text-white transition-colors duration-300">
            {/* Centered Spinning 3D Wireframe Globe Background SVG */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-700 group-hover:scale-110">
              <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-52 sm:h-52 animate-slow-rotate opacity-75 dark:opacity-80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="globeGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#499A13" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#8ECA3C" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#BBDC12" stopOpacity="0.25" />
                  </linearGradient>
                  <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#8ECA3C" stopOpacity="0.3" />
                    <stop offset="70%" stopColor="#499A13" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#276F27" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Soft ambient background glow */}
                <circle cx="100" cy="100" r="75" fill="url(#globeGlow)" />

                {/* Outer Globe Circle Ring */}
                <circle cx="100" cy="100" r="68" stroke="url(#globeGradPrimary)" strokeWidth="2.5" className="opacity-90" />

                {/* Latitude lines */}
                <ellipse cx="100" cy="100" rx="68" ry="24" stroke="url(#globeGradPrimary)" strokeWidth="1.5" strokeDasharray="4 3" className="opacity-75" />
                <ellipse cx="100" cy="100" rx="68" ry="48" stroke="url(#globeGradPrimary)" strokeWidth="1.5" className="opacity-60" />
                <line x1="32" y1="100" x2="168" y2="100" stroke="url(#globeGradPrimary)" strokeWidth="1.5" className="opacity-80" />

                {/* Longitude lines */}
                <ellipse cx="100" cy="100" rx="24" ry="68" stroke="url(#globeGradPrimary)" strokeWidth="1.5" strokeDasharray="4 3" className="opacity-75" />
                <ellipse cx="100" cy="100" rx="48" ry="68" stroke="url(#globeGradPrimary)" strokeWidth="1.5" className="opacity-60" />
                <line x1="100" y1="32" x2="100" y2="168" stroke="url(#globeGradPrimary)" strokeWidth="1.5" className="opacity-80" />

                {/* Orbiting Telemetry nodes */}
                <circle cx="140" cy="65" r="4" fill="#BBDC12" className="animate-ping opacity-90" />
                <circle cx="140" cy="65" r="3.5" fill="#499A13" />

                <circle cx="65" cy="135" r="4" fill="#8ECA3C" className="animate-ping opacity-90" />
                <circle cx="65" cy="135" r="3.5" fill="#276F27" />

                <circle cx="125" cy="130" r="3" fill="#BBDC12" />
                <circle cx="75" cy="70" r="3" fill="#8ECA3C" />
              </svg>
            </div>

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-white/40">
                  <Globe className="w-3.5 h-3.5 text-brandPrimary animate-spin-slow" />
                  <span className="text-[10px] uppercase tracking-widest font-extrabold">SYSTEM TELEMETRY</span>
                </div>
                <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white mt-1">hakalive.in</h3>
              </div>
              <div className="bg-brandPrimary/15 dark:bg-white/10 backdrop-blur-md border border-brandPrimary/30 dark:border-white/10 px-3 py-1 rounded-xl text-[10px] font-bold text-brandPrimary dark:text-white/80 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brandPrimary animate-ping" />
                ACTIVE GATEWAY
              </div>
            </div>

            <div className="relative z-10 flex items-end justify-between">
              <div>
                <p className="text-[9px] text-slate-600 dark:text-white/30 uppercase tracking-wider font-bold">TELEMETRY SYNCED</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-white/80 font-mono mt-0.5">{getDayProgressStr()}</p>
              </div>
              <div className="flex gap-2">
                <span className="w-24 h-6 rounded-full bg-brandPrimary/15 border border-brandPrimary/30 text-brandPrimary dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400 flex items-center justify-center text-[10px] font-extrabold gap-1">
                  <Globe className="w-3 h-3" /> All Systems Ok
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 10 CORE KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>Today's Users</span><Users className="w-4 h-4 text-brandPrimary" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{metrics.todaysUsers}</div>
          <div className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> {metrics.todaysUsersChange}</div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>Total Users</span><Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{counts.totalUsers.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-1">Platform Total</div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>Online Users</span><Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-500 mt-2 flex items-center gap-2">{counts.activeUsers} <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" /></div>
          <div className="text-[10px] text-slate-400 mt-1">Live active sessions</div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>Today's Revenue</span><DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-500 mt-2">{metrics.todaysRevenue}</div>
          <div className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> {metrics.todaysRevenueChange}</div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>Today's Withdrawals</span><Landmark className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{metrics.todaysWithdrawals}</div>
          <div className="text-[10px] text-slate-400 mt-1">Processed Payouts</div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>Today's Entries</span><Trophy className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{metrics.todaysEntries}</div>
          <div className="text-[10px] text-emerald-500 font-bold mt-1">{metrics.todaysEntriesChange} joins</div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>Total Contests</span><FileText className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{counts.totalContests}</div>
          <div className="text-[10px] text-slate-400 mt-1">Hosted contests</div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>Active Contests</span><Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-500 mt-2">{counts.activeContests} Live</div>
          <div className="text-[10px] text-slate-400 mt-1">Running stages</div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>Pending KYC</span><ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-500 mt-2">{pendingKycs ? pendingKycs.length : 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">Files in queue</div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>Pending Withdrawals</span><Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-500 mt-2">{counts.pendingWithdrawals}</div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting approval</div>
        </div>
      </div>

      {/* THREE-COLUMN EXECUTIVE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* COLUMN 1: Needs Attention Container - col-span-4 */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Needs Attention</h3>
            <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">{pendingKycs ? pendingKycs.length : 0} Pending</span>
          </div>
          <p className="text-xs text-slate-400">Biometric verifications requiring administrative action.</p>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {pendingKycs.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-center space-y-2">
                <Check className="w-6 h-6 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">All verifications cleared!</p>
              </div>
            ) : (
              pendingKycs.map((k, idx) => (
                <div key={k.userId || idx} className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">{k.userDetail?.name || 'Participant'}</h4>
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">AI: {k.livenessScore || 90}% Match</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{k.userDetail?.email}</p>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleReviewKycSubmit(k.userId, 'Approved')} className="flex-1 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1">
                      <Check className="w-3 h-3" /> Approve
                    </button>
                    <button onClick={() => handleReviewKycSubmit(k.userId, 'Rejected')} className="px-3 py-1.5 bg-rose-500/10 text-rose-500 text-[10px] font-bold rounded-xl">
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: Haka AI Assistant Chat Drawer - col-span-4 */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col h-[460px] justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-brandPrimary" /> Haka Intelligence AI Assistant
              </h3>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Online</span>
            </div>
            <p className="text-[11px] text-slate-400">Ask about biometrics, user verification or risk logs.</p>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
            {aiMessages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] ${
                  m.sender === 'user'
                    ? 'bg-brandPrimary text-white'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendAiMessage} className="relative mt-2">
            <input
              type="text"
              placeholder="Ask Haka AI assistant..."
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl pl-4 pr-10 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
            />
            <button type="submit" className="absolute right-2 top-2 p-1.5 bg-brandPrimary text-white rounded-xl">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* COLUMN 3: Revenue Telemetry Graph & Contest Analytics - col-span-4 */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brandPrimary" /> Revenue Telemetry Graph
            </h3>
            <span className="text-[10px] font-bold text-brandPrimary bg-brandPrimary/10 px-2 py-0.5 rounded capitalize">{timeframeFilter}</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-100 dark:border-white/5">
            {metrics.revenueSeries.map((val, idx) => {
              const heightPercent = Math.round((val / maxRevenue) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div style={{ height: `${heightPercent}%` }} className="w-full bg-gradient-to-t from-brandPrimary/50 to-brandPrimary rounded-t-lg group-hover:from-brandPrimary group-hover:to-emerald-400 transition-all duration-300" />
                  <span className="text-[9px] font-bold text-slate-400">{metrics.graphLabels[idx] || `P${idx+1}`}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 text-xs pt-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Completion Rate:</span>
              <strong className="text-emerald-500 font-bold">{metrics.completionRate}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Session Duration:</span>
              <strong className="text-indigo-500 font-bold">{metrics.avgSessionTime}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* RECENT WINNERS SPOTLIGHT */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Recent Contest Winners Spotlight
          </h3>
          <button onClick={() => onViewChange('leaderboard')} className="text-xs font-bold text-amber-500 hover:underline">View Leaderboard</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {RECENT_WINNERS_LIST.map(w => (
            <div key={w.rank} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">Rank #{w.rank}</span>
                <span className="text-[10px] text-slate-400">{w.time}</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">{w.name}</div>
              <div className="text-xs font-bold text-emerald-500">Prize: {w.prize}</div>
              <div className="text-[10px] text-slate-400 truncate">{w.contest}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DashboardHome;
