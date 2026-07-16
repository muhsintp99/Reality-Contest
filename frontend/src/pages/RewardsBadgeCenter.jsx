import React from 'react';
import { Sparkles, Trophy, Award, Lock, ShieldCheck, Flame, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../components/common/Badges';

export const RewardsBadgeCenter = () => {
  const achievements = [
    { name: 'Quiz Whiz', desc: 'Score above 85% on any quiz stage stage.', icon: '🏆', unlocked: true, date: 'June 12, 2026' },
    { name: 'Creator Rookie', desc: 'Register and enter your first tournament lobby.', icon: '⚡', unlocked: true, date: 'June 18, 2026' },
    { name: 'Identity Verified', desc: 'Pass biometrics KYC logs checks successfully.', icon: '💎', unlocked: true, date: 'July 02, 2026' },
    { name: 'Streak Champion', desc: 'Log in and check active calendar schedules for 7 consecutive days.', icon: '🔥', unlocked: false, requirement: '2 days remaining' },
    { name: 'Feedback Guru', desc: 'Leave structured remarks on contest submissions.', icon: '💬', unlocked: false, requirement: 'Requires Judge role' },
    { name: 'Sponsorship Baron', desc: 'Syndicate challenges with total budgets over ₹15L.', icon: '👑', unlocked: false, requirement: 'Requires Sponsor role' }
  ];

  return (
    <div className="space-y-6 text-left pb-10">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">XP & Badge Achievements</h2>
        <p className="text-xs text-slate-450 dark:text-white/40 mt-1">Claim points, track streaks, and review unlocked badges.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* XP Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphism p-5 rounded-[24px] border border-slate-200/50 dark:border-white/5 shadow-premium flex items-center gap-4 relative overflow-hidden bg-white/70 dark:bg-slate-900/40"
        >
          <div className="p-3 bg-brandPrimary/10 text-brandPrimary rounded-xl border border-brandPrimary/10">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 dark:text-white/35 uppercase font-bold block">Contestant XP Level</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white block">Level 3 (850 XP)</span>
            <div className="w-40 bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden border border-slate-200/20 dark:border-white/5">
              <div className="h-full bg-gradient-to-r from-brandPrimary to-brandSecondary rounded-full" style={{ width: '70%' }} />
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-brandPrimary/5 blur-2xl pointer-events-none" />
        </motion.div>

        {/* Streaks Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glassmorphism p-5 rounded-[24px] border border-slate-200/50 dark:border-white/5 shadow-premium flex items-center gap-4 relative overflow-hidden bg-white/70 dark:bg-slate-900/40"
        >
          <div className="p-3 bg-brandSecondary/10 text-brandSecondary rounded-xl border border-brandSecondary/10">
            <Flame className="w-6 h-6 text-brandSecondary animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-white/35 uppercase font-bold block">Daily Log Streaks</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white block">5 Day Streak</span>
            <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium">Streaks multiply entry XP awards by 1.5x.</p>
          </div>
        </motion.div>

        {/* Badge unlock quick stats */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glassmorphism p-5 rounded-[24px] border border-slate-200/50 dark:border-white/5 shadow-premium flex items-center gap-4 relative overflow-hidden bg-white/70 dark:bg-slate-900/40"
        >
          <div className="p-3 bg-brandAccent/10 text-brandAccent rounded-xl border border-brandAccent/10">
            <Compass className="w-6 h-6 text-brandAccent" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-white/35 uppercase font-bold block">Badges Lock Ratios</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white block">3 Unlocked / 6 Total</span>
            <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium">Unlock achievements to claim reward badges.</p>
          </div>
        </motion.div>
      </div>

      {/* Badges details grid */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold uppercase text-brandPrimary tracking-wider pl-1">Rewards Achievements Inventory</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((ach, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className={`p-5 rounded-[24px] border shadow-premium flex flex-col justify-between h-44 transition-all relative overflow-hidden ${
                ach.unlocked 
                  ? 'glassmorphism bg-white dark:bg-slate-900/40 border-slate-200/50 dark:border-emerald-500/20' 
                  : 'bg-slate-50 dark:bg-slate-950/20 border-slate-200/30 dark:border-white/2 opacity-65'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-2xl select-none">{ach.icon}</span>
                  {ach.unlocked ? (
                    <Badge variant="secondary">Unlocked</Badge>
                  ) : (
                    <Badge variant="neutral">Locked</Badge>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-white leading-tight">{ach.name}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-white/35 font-medium mt-1 leading-normal">{ach.desc}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-white/5 pt-2 mt-3 flex justify-between items-center text-[10px]">
                <span className="text-slate-400 dark:text-white/30 font-bold uppercase">Status Info</span>
                {ach.unlocked ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Earned {ach.date}</span>
                ) : (
                  <span className="text-rose-500 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {ach.requirement}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsBadgeCenter;
