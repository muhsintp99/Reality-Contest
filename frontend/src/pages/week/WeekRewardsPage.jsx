import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Trophy, Star, ShieldCheck } from 'lucide-react';
import weekRoomApi from '../../services/weekRoomApi';

export const WeekRewardsPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const res = await weekRoomApi.getRewards();
        setRewards(res.data || res.rewards || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, [roomId]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in">
      <button
        onClick={() => navigate(`/week/rooms/${roomId}`)}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200/60 dark:border-white/10 transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Room</span>
      </button>

      <div>
        <h1 className="text-2xl font-black font-poppins text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" /> Room Tiers & Rewards Center
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View eligibility requirements and prize distribution for this room cohort.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl space-y-3">
          <Trophy className="w-8 h-8 text-amber-500" />
          <h4 className="text-base font-bold text-amber-600 dark:text-amber-400">1st Place Winner</h4>
          <p className="text-2xl font-black text-slate-800 dark:text-white">₹5,000 + Gold Badge</p>
          <p className="text-xs text-slate-400 font-medium">Auto-credited upon judge validation.</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-slate-400/10 via-slate-400/5 to-transparent border border-slate-400/20 rounded-3xl space-y-3">
          <Award className="w-8 h-8 text-slate-400" />
          <h4 className="text-base font-bold text-slate-600 dark:text-slate-300">2nd Place Runner-Up</h4>
          <p className="text-2xl font-black text-slate-800 dark:text-white">₹2,500 + Silver Badge</p>
          <p className="text-xs text-slate-400 font-medium">Auto-credited upon cycle end.</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 rounded-3xl space-y-3">
          <Star className="w-8 h-8 text-orange-500" />
          <h4 className="text-base font-bold text-orange-600 dark:text-orange-400">3rd Place Finisher</h4>
          <p className="text-2xl font-black text-slate-800 dark:text-white">₹1,000 + Bronze Badge</p>
          <p className="text-xs text-slate-400 font-medium">Auto-credited upon cycle end.</p>
        </div>
      </div>
    </div>
  );
};

export default WeekRewardsPage;
