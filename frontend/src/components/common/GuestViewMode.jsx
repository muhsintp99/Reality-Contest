import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ShieldAlert, Sparkles, UserPlus, LogIn, X, Trophy, Vote, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GuestViewBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-brandPrimary/15 to-purple-500/15 border border-amber-500/30 text-slate-800 dark:text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
      <div className="flex items-center gap-3 text-left">
        <div className="p-2.5 bg-amber-500/20 text-amber-500 rounded-xl shrink-0">
          <Eye className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full uppercase tracking-wider">
              Guest View-Only Mode
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
            You are exploring the contest arena as a Guest. Sign in or register to join contests, vote, and claim real rewards!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
        <button
          onClick={() => navigate('/login')}
          className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-xs font-bold transition-all border border-slate-200 dark:border-white/10 flex items-center gap-1.5"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>

        <button
          onClick={() => navigate('/register')}
          className="px-4 py-2 rounded-xl bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Register Free</span>
        </button>
      </div>
    </div>
  );
};

export const GuestRestrictionModal = ({ isOpen, onClose, actionName = 'participate in this contest' }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="max-w-md w-full glassmorphism p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl relative text-left"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-5">
            <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500">
              <Eye className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-poppins text-slate-900 dark:text-white">
                Guest View-Only Mode
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                Guest accounts can browse contests and view leaderboards. To <span className="font-bold text-slate-800 dark:text-white">{actionName}</span>, please register a free account or sign in.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/10 space-y-2.5">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-white/40">
                Member Benefits Unlock
              </div>
              <ul className="text-xs space-y-2 font-medium text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Join live audition contests & cash prize pools</span>
                </li>
                <li className="flex items-center gap-2">
                  <Vote className="w-4 h-4 text-brandPrimary shrink-0" />
                  <span>Cast votes on contestant media submissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Earn daily contest rewards & rank badges</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/register')}
                className="w-full py-2.5 px-4 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Free Account</span>
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white font-semibold block pt-1"
            >
              Continue Browsing as Guest
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
