import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export const AssistantCard = ({ 
  assistantName = "Haka Assistant",
  summaryText = "", 
  progressValue = 65, 
  actions = [],
  profileImage = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glassmorphism p-6 rounded-[24px] border border-white/20 dark:border-white/5 shadow-premium text-left bg-white/70 dark:bg-slate-900/40 relative overflow-hidden flex flex-col justify-between"
    >
      {/* Background neon glows */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-brandSecondary/5 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-brandPrimary/5 blur-xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt={assistantName} 
                className="w-11 h-11 rounded-full object-cover border-2 border-brandPrimary/20 shadow-md"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-brandPrimary to-brandSecondary flex items-center justify-center text-white border-2 border-white/20 dark:border-slate-800 shadow-md">
                <Cpu className="w-5 h-5" />
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-white font-sans">{assistantName}</h4>
              <Sparkles className="w-3.5 h-3.5 text-brandSecondary fill-brandSecondary/15" />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-white/35 font-bold uppercase tracking-wider">AI Co-pilot</p>
          </div>
        </div>

        {/* Co-Pilot metrics */}
        <div className="w-full md:w-36 space-y-1 md:text-right">
          <div className="flex md:justify-end justify-between items-center text-[10px] text-slate-500 dark:text-white/40">
            <span>Contest Progress</span>
            <span className="font-bold text-brandPrimary dark:text-brandSecondary ml-1">{progressValue}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden border border-slate-200/20 dark:border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressValue}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-gradient-to-r from-brandPrimary to-brandSecondary h-full rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="my-4">
        <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed font-medium">
          {summaryText || "Welcome back to the portal! You are currently participating in the active stage auditions. Complete your pending submissions and review requirements in the Tournaments panel to lock in your scores."}
        </p>
      </div>

      {/* Quick Action Buttons */}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2.5 pt-1">
          {actions.map((act, index) => (
            <button
              key={index}
              onClick={act.onClick}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 transition-all active:scale-[0.98] ${
                act.primary 
                  ? 'bg-brandPrimary text-white shadow-md hover:bg-brandPrimary/90 hover:shadow-brandPrimary/10' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800/40 dark:border-white/5 dark:text-white/80 dark:hover:bg-slate-850'
              }`}
            >
              {act.icon && <act.icon className="w-3.5 h-3.5" />}
              <span>{act.label}</span>
              {!act.primary && <ArrowRight className="w-3 h-3 text-slate-400" />}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AssistantCard;
