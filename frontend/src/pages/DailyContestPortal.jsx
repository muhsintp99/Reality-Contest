import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Clock, Trophy, Award, Sparkles, Check, ArrowRight, Zap, RefreshCw, Flame, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { GuestViewBanner, GuestRestrictionModal } from '../components/common/GuestViewMode';

const MOCK_DAILY_BATTLES = [
  {
    id: 'DLC-101',
    _id: 'DLC-101',
    title: 'Daily Speed Quiz Rush 2026',
    category: 'Speed Battle',
    entryFee: 0,
    prizePool: 10000,
    participants: 1420,
    timerLimit: '3 mins',
    questionsCount: 20,
    description: '20 rapid-fire questions in 3 minutes. Top 10 rankers win daily coin rewards.',
    badge: 'Free Entry'
  },
  {
    id: 'DLC-102',
    _id: 'DLC-102',
    title: 'Daily Logic & Deduction Matrix',
    category: 'Logic & Deduction',
    entryFee: 50,
    prizePool: 25000,
    participants: 850,
    timerLimit: '5 mins',
    questionsCount: 15,
    description: 'Solve spatial puzzle matrices and logic deduction patterns within timer limits.',
    badge: 'Entry: 50 Coins 🪙'
  },
  {
    id: 'DLC-103',
    _id: 'DLC-103',
    title: 'Daily Reaction Tapper 24h',
    category: 'Reaction Reflex',
    entryFee: 0,
    prizePool: 15000,
    participants: 1980,
    timerLimit: '2 mins',
    questionsCount: 10,
    description: 'Test sub-200ms reflex speeds on target tiles matrix with live leaderboard.',
    badge: 'Free Entry'
  },
  {
    id: 'DLC-104',
    _id: 'DLC-104',
    title: 'Daily Trivia Showdown',
    category: 'Trivia Rush',
    entryFee: 20,
    prizePool: 12000,
    participants: 640,
    timerLimit: '4 mins',
    questionsCount: 15,
    description: 'Daily entertainment & pop culture trivia showdown with instant score grading.',
    badge: 'Entry: 20 Coins 🪙'
  }
];

export const DailyContestPortal = () => {
  const { user } = useSelector((state) => state.auth);
  const [dailyBattles, setDailyBattles] = useState([]);
  const [showGuestModal, setShowGuestModal] = useState(false);

  useEffect(() => {
    fetchDailyBattles();
  }, []);

  const fetchDailyBattles = async () => {
    try {
      const res = await axios.get('/api/daily-contests', { withCredentials: true });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setDailyBattles(res.data.data.length > 0 ? res.data.data : MOCK_DAILY_BATTLES);
      }
    } catch (err) {
      console.warn('Error fetching daily contests:', err);
      setDailyBattles(MOCK_DAILY_BATTLES);
    }
  };

  return (
    <div className="space-y-6 text-left pb-10 animate-fade-in">
      {user?.role === 'Guest' && <GuestViewBanner />}
      <GuestRestrictionModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        actionName="play this daily contest battle"
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-brandPrimary/15 to-purple-500/15 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 uppercase tracking-widest animate-pulse">24h Daily Reset</span>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Clock className="w-7 h-7 text-amber-500" /> Daily Contest Arena ⚡
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
              Automated 24-hour daily quiz battles, speed tappers, and instant daily prize showdowns with live leaderboards.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 text-white px-4 py-2 rounded-2xl border border-white/10 text-xs font-mono shadow-inner">
            <span className="text-slate-400 font-sans text-[11px]">Daily Reset Countdown:</span>
            <span className="text-emerald-400 font-extrabold text-sm">14h 22m 10s</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="bg-white/80 dark:bg-white/5 p-3 rounded-2xl border border-amber-500/15">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Daily Battles Active</div>
            <div className="text-lg font-extrabold text-amber-500 mt-0.5">4 Live Arenas</div>
          </div>
          <div className="bg-white/80 dark:bg-white/5 p-3 rounded-2xl border border-amber-500/15">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Total Daily Prize Coins</div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">62,000 Coins 🪙</div>
          </div>
          <div className="bg-white/80 dark:bg-white/5 p-3 rounded-2xl border border-amber-500/15">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Participants Today</div>
            <div className="text-lg font-extrabold text-brandPrimary mt-0.5">5,890 Contestants</div>
          </div>
          <div className="bg-white/80 dark:bg-white/5 p-3 rounded-2xl border border-amber-500/15">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Leaderboard Status</div>
            <div className="text-lg font-extrabold text-emerald-500 mt-0.5">Auto-Reset Enabled</div>
          </div>
        </div>
      </div>

      {/* KYC Alert if not approved */}
      {user?.kycStatus !== 'Approved' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400">KYC Verification Notice</h4>
            <p className="text-[10px] text-slate-500 dark:text-white/45 mt-0.5">
              Complete your KYC in Settings to claim coin prize distributions from daily leaderboard wins.
            </p>
          </div>
        </div>
      )}

      {/* Daily Battle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dailyBattles.map((b) => (
          <motion.div
            key={b.id}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-md flex flex-col justify-between hover:border-amber-500/40 transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                  {b.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${b.entryFee === 0 || b.isFree === true || b.entryFeeType === 'Free' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                  {b.entryFee === 0 || b.isFree === true || b.entryFeeType === 'Free' ? '🎁 Free Entry' : `🪙 ${b.entryFeeCoins || b.entryFee} Coins`}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{b.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{b.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl text-xs">
                <div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Prize Pool</div>
                  <div className="font-extrabold text-amber-500 text-sm mt-0.5">{b.prizePool.toLocaleString()} Coins 🪙</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Questions</div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{b.questionsCount} Qs</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Timer Limit</div>
                  <div className="font-bold text-indigo-500 text-sm mt-0.5">{b.timerLimit}</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400">
                <strong className="text-brandPrimary">{b.participants.toLocaleString()}</strong> contestants playing today
              </div>
              <button
                onClick={() => {
                  if (user?.role === 'Guest') {
                    setShowGuestModal(true);
                    return;
                  }
                  alert(`Entering ${b.title}...`);
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-2xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Play Battle Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DailyContestPortal;
