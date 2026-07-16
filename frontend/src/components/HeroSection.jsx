import React from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, ArrowRight } from 'lucide-react';

export const HeroSection = ({ userName = 'Guest', role = 'Contestant', priorities = [], onViewChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="glassmorphism shadow-premium rounded-[24px] overflow-hidden p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative border border-white/20 dark:border-white/5"
    >
      {/* Light glow inside card */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-brandSecondary/10 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-brandPrimary/10 blur-[80px] pointer-events-none" />

      {/* Left side text */}
      <div className="flex-1 space-y-4 md:space-y-5 text-left z-10 w-full">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brandSecondary/10 text-brandPrimary border border-brandSecondary/15 text-[10px] font-bold uppercase tracking-wider mb-3">
            <Star className="w-3 h-3 fill-brandSecondary text-brandSecondary" />
            <span>Platform portal</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandPrimary to-brandSecondary">{userName}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-white/45 mt-1">
            Account Role: <span className="font-semibold text-brandPrimary dark:text-brandSecondary">{role}</span>
          </p>
        </div>

        {/* Priorities Section */}
        <div className="space-y-2 border-t border-slate-100 dark:border-white/5 pt-4">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/35">
            Today's Priorities
          </h2>
          
          <div className="space-y-2">
            {priorities.length > 0 ? (
              priorities.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/70">
                  <CheckCircle className="w-4 h-4 text-brandSecondary flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/30">
                <CheckCircle className="w-4 h-4" />
                <span>No pending priorities. Enjoy your day!</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => onViewChange(role === 'Contestant' ? 'contests' : 'settings')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-semibold shadow-md transition-all hover:shadow-brandPrimary/10"
          >
            <span>{role === 'Contestant' ? 'Explore Tournaments' : 'Account Console'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right side abstract green 3D SVG illustration */}
      <div className="flex-1 w-full flex items-center justify-center md:justify-end z-10 relative">
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, 0.5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-56 h-56 md:w-64 md:h-64 relative drop-shadow-xl"
        >
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Definitions for gradients */}
            <defs>
              <linearGradient id="primaryGlow" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#0F766E" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#22C55E" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="orbGradient" x1="50" y1="50" x2="150" y2="150" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="40%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#065F46" />
              </linearGradient>
              <linearGradient id="glassGradient" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.03" />
              </linearGradient>
            </defs>

            {/* Background 3D grid lines */}
            <path d="M 30,120 L 170,120 M 30,140 L 170,140 M 30,160 L 170,160 M 30,100 L 170,100" stroke="#0F766E" strokeOpacity="0.08" strokeWidth="1" />
            <path d="M 60,80 L 60,180 M 100,80 L 100,180 M 140,80 L 140,180" stroke="#0F766E" strokeOpacity="0.08" strokeWidth="1" />

            {/* Glowing bottom platform */}
            <ellipse cx="100" cy="150" rx="60" ry="15" fill="url(#primaryGlow)" filter="blur(8px)" opacity="0.3" />
            <ellipse cx="100" cy="150" rx="45" ry="10" fill="#10B981" opacity="0.2" />

            {/* Floating connecting elements */}
            <line x1="100" y1="60" x2="60" y2="110" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.6" />
            <line x1="100" y1="60" x2="140" y2="110" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.6" />
            <line x1="60" y1="110" x2="140" y2="110" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.3" />

            {/* Large Floating Sphere in center */}
            <circle cx="100" cy="65" r="28" fill="url(#orbGradient)" />
            <circle cx="100" cy="65" r="28" fill="white" opacity="0.1" />

            {/* Semi-transparent Glass Cube (layered in isometric perspective) */}
            <path d="M 60,110 L 100,90 L 140,110 L 100,130 Z" fill="url(#glassGradient)" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" backdrop-filter="blur(5px)" />
            <path d="M 60,110 L 60,135 L 100,155 L 100,130 Z" fill="url(#glassGradient)" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
            <path d="M 140,110 L 140,135 L 100,155 L 100,130 Z" fill="url(#glassGradient)" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" />

            {/* Sparkles / Floating small geometric spheres */}
            <circle cx="50" cy="80" r="4" fill="#34D399" opacity="0.8" />
            <circle cx="155" cy="95" r="3" fill="#22C55E" opacity="0.6" />
            <circle cx="130" cy="50" r="5" fill="#10B981" opacity="0.9" />

            {/* Glowing ring */}
            <ellipse cx="100" cy="65" rx="42" ry="12" stroke="url(#primaryGlow)" strokeWidth="1.5" strokeOpacity="0.5" transform="rotate(-10, 100, 65)" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
