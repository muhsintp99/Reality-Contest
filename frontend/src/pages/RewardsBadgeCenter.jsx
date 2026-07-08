import React from 'react';
import { Sparkles } from 'lucide-react';

export const RewardsBadgeCenter = () => (
  <div className="space-y-6 text-left animate-fade-in">
    <div>
      <h2 className="text-xl font-bold font-poppins text-white dark:text-white light:text-black">XP & Badge Achievements</h2>
      <p className="text-xs text-white/50">Claim points, track streaks, and review unlocked badges.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* XP Card */}
      <div className="glassmorphism p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden">
        <div className="p-3 bg-brandPrimary/10 text-brandPrimary rounded-xl">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] text-white/40 uppercase font-bold block">Contestant XP Level</span>
          <span className="text-xl font-extrabold font-poppins">Level 3 (850 XP)</span>
          <div className="w-40 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-brandPrimary rounded-full" style={{ width: '70%' }} />
          </div>
        </div>
      </div>

      {/* Badges unlocked */}
      <div className="glassmorphism p-5 rounded-2xl border border-white/10 col-span-2 space-y-3">
        <span className="text-[10px] text-white/40 uppercase font-bold block">Unlocked Badges</span>
        <div className="flex flex-wrap gap-2.5">
          <span className="bg-brandSecondary/15 text-brandSecondary px-3 py-1 rounded-xl text-xs font-bold border border-brandSecondary/25">
            🏆 Quiz Whiz
          </span>
          <span className="bg-brandPrimary/15 text-brandPrimary px-3 py-1 rounded-xl text-xs font-bold border border-brandPrimary/25">
            ⚡ Creator Rookie
          </span>
          <span className="bg-brandAccent/15 text-brandAccent px-3 py-1 rounded-xl text-xs font-bold border border-brandAccent/25">
            💎 AI Verify Verified
          </span>
        </div>
      </div>

    </div>
  </div>
);

export default RewardsBadgeCenter;
