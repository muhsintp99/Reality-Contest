import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({ 
  label, 
  value, 
  growth, 
  positive = true, 
  sparkline = [], 
  icon: Icon,
  description = ''
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="glassmorphism p-5 rounded-[24px] border border-white/20 dark:border-white/5 shadow-premium hover-lift flex flex-col justify-between h-40 relative overflow-hidden group text-left bg-white/70 dark:bg-slate-900/40"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-2 rounded-xl bg-brandPrimary/5 text-brandPrimary dark:bg-brandSecondary/5 dark:text-brandSecondary border border-brandPrimary/10 dark:border-brandSecondary/10 group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className="text-[11px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">{label}</span>
        </div>

        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] flex items-center gap-0.5 border ${
          positive 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
        }`}>
          {positive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
          {growth}
        </span>
      </div>

      {/* Numerical value & Sparkline */}
      <div className="flex items-end justify-between mt-4">
        <div className="space-y-0.5">
          <p className="text-2xl font-extrabold text-slate-800 dark:text-white font-sans tracking-tight">
            {value}
          </p>
          {description && (
            <p className="text-[10px] text-slate-500 dark:text-white/30 font-medium">
              {description}
            </p>
          )}
        </div>

        {/* Dynamic Sparkline graph */}
        {sparkline.length > 0 && (
          <div className="w-20 h-10 select-none">
            <svg className="w-full h-full" viewBox="0 0 100 30">
              <defs>
                <linearGradient id={`sparklineGrad-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={positive ? '#10B981' : '#F43F5E'} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={positive ? '#10B981' : '#F43F5E'} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`M ${sparkline.map((val, index) => `${(index * (100 / (sparkline.length - 1))).toFixed(1)},${(30 - (val / Math.max(...sparkline)) * 22 - 2).toFixed(1)}`).join(' L ')}`}
                fill="none"
                stroke={positive ? '#10B981' : '#f43f5e'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={`M 0,30 L ${sparkline.map((val, index) => `${(index * (100 / (sparkline.length - 1))).toFixed(1)},${(30 - (val / Math.max(...sparkline)) * 22 - 2).toFixed(1)}`).join(' L ')} L 100,30 Z`}
                fill={`url(#sparklineGrad-${label.replace(/\s+/g, '')})`}
              />
            </svg>
          </div>
        )}
      </div>
      
      {/* Top right gradient card blur glow */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-brandPrimary/5 group-hover:bg-brandSecondary/10 blur-xl pointer-events-none transition-all duration-500 opacity-50" />
    </motion.div>
  );
};

export default StatCard;
