import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Play, Download, Smartphone, ShieldCheck, Zap, Star, 
  CheckCircle2, ArrowRight, Clock, Award, Users, QrCode, 
  ChevronRight, Sparkles, ExternalLink, HelpCircle, ChevronDown,
  Lock, RefreshCw, Flame, Check, AlertCircle, ArrowUpRight, Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Google Play Vector Icon
const GooglePlayIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 512 512" className={className} fill="currentColor">
    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
  </svg>
);

// Apple App Store Vector Icon
const AppleIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 384 512" className={className} fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 66.7 31.9 133.5c16.3 34.3 40.5 73.1 73.1 73.8 29.5.7 39.5-19.7 75.3-19.7 35.1 0 44.5 19.7 75.3 19 33.3-.7 54.3-33.6 70.8-67.9 19.6-40.6 27.6-80 28.1-82.1-1.3-.6-69.8-27-69.8-61.4zM245.8 91.1c15-20.2 26.6-48.4 22.9-78.1-23.7 1.9-51.2 16.9-66.9 37.1-13.7 17.5-24.9 46.1-21.2 74.9 26.2 1.3 51.9-14.4 65.2-33.9z" />
  </svg>
);

// 4 Interactive Steps Data
const HOW_TO_JOIN_STEPS = [
  {
    step: '01',
    title: 'Download & Quick Signup',
    subtitle: 'Get the app and verify your mobile number in seconds.',
    description: 'Install the HAKA mobile app from Google Play or App Store. Sign up with your mobile number via instant OTP. No lengthy paperwork required.',
    badge: 'Step 1: Onboarding',
    mockupType: 'register',
    features: ['Instant Phone OTP Verification', 'Free 100 Welcome Coins', 'Profile Customization']
  },
  {
    step: '02',
    title: 'Browse Live Contests',
    subtitle: 'Discover active tournaments, daily battles & grand arenas.',
    description: 'Explore a vibrant arena of skill-based reality contests spanning General Trivia, Speed Battles, and Mega Grand Tournaments with verified prize pools.',
    badge: 'Step 2: Exploration',
    mockupType: 'browse',
    features: ['Daily Speed Battles (Every 24h)', 'Grand Mega Showdowns', 'Free & Cash Entry Modes']
  },
  {
    step: '03',
    title: 'Select Contest & Review Rules',
    subtitle: 'Check entry fees, timers, questions & prize distribution.',
    description: 'Inspect contest details, rules, scoring criteria, and start countdown. Join using either Free Platform Coins or Cash Entry Fees via secured UPI.',
    badge: 'Step 3: Entry Confirmation',
    mockupType: 'select',
    features: ['Transparent Prize Pool Splits', 'Clear Countdown Timers', 'Guaranteed Fair-Play Rules']
  },
  {
    step: '04',
    title: 'Compete, Score & Win Cash',
    subtitle: 'Answer fast, climb the leaderboard, and withdraw instantly.',
    description: 'Put your knowledge to the test! Answer rapid-fire questions within the countdown timer. Outscore competitors to secure podium ranks and cash out directly to UPI.',
    badge: 'Step 4: Victory & Payout',
    mockupType: 'win',
    features: ['Millisecond Speed Bonus Scoring', 'Real-Time Live Leaderboard', 'Instant 1-Click UPI Withdrawals']
  }
];

// App Screenshots Data
const APP_SCREENSHOTS = [
  {
    id: 'home',
    title: 'Live Contest Hub',
    tag: 'Home Arena',
    desc: 'Browse mega tournaments, live timers, and active prize pools in a sleek cyber interface.',
    gradient: 'from-purple-900/60 to-indigo-900/60'
  },
  {
    id: 'quiz',
    title: 'Speed Trivia Engine',
    tag: 'Live Quiz',
    desc: 'High-octane rapid quiz interface with millisecond precision timers and streak multipliers.',
    gradient: 'from-amber-900/60 to-purple-900/60'
  },
  {
    id: 'leaderboard',
    title: 'Live Leaderboard',
    tag: 'Podium Standings',
    desc: 'Track your rank in real-time as contestants battle for the #1 Gold Champion spot.',
    gradient: 'from-emerald-900/60 to-blue-900/60'
  },
  {
    id: 'wallet',
    title: 'Instant Cash Wallet',
    tag: '1-Click Payout',
    desc: 'Withdraw your contest winnings in seconds via UPI, GPay, PhonePe, or direct Bank IMPS.',
    gradient: 'from-blue-900/60 to-purple-900/60'
  }
];

// FAQs Data
const FAQS = [
  {
    q: 'Is the HAKA Contest mobile app completely free to download?',
    a: 'Yes! The HAKA mobile app is 100% free to download on both Google Play Store (Android) and Apple App Store (iOS). Upon signup, you also receive 100 Free Bonus Coins to enter select practice contests immediately.'
  },
  {
    q: 'How do I enter and join a contest through the app?',
    a: 'Simply open the app, tap on any active contest card (Daily Battle, Grand Contest, or Room Cycle), review the rules and prize pool, and tap "Join Contest". You can use Free Coins or Cash Entry via UPI.'
  },
  {
    q: 'Are contests on HAKA legally compliant and skill-based?',
    a: 'Yes. All contests on HAKA are recognized as Games of Skill under the Public Gambling Act, 1867 and relevant Supreme Court of India precedents. Winners are decided purely on speed, accuracy, and knowledge.'
  },
  {
    q: 'How quickly are contest cash prizes credited and withdrawn?',
    a: 'Winning prizes are credited to your in-app wallet instantly upon contest conclusion. You can withdraw your balance anytime via UPI (Google Pay, PhonePe, Paytm) or direct Bank Transfer with 99.8% instant processing.'
  },
  {
    q: 'What phone versions are compatible with the app?',
    a: 'HAKA runs smoothly on Android devices running Android 8.0 (Oreo) and above, and Apple iPhones/iPads running iOS 14.0 or higher.'
  }
];

export const AppLandingPage = () => {
  const navigate = useNavigate();
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [activeScreenIdx, setActiveScreenIdx] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const activeStep = HOW_TO_JOIN_STEPS[activeStepIdx];

  const handleDownloadClick = (storeName) => {
    alert(`Redirecting to official ${storeName} listing... Download will begin automatically!`);
  };

  return (
    <div className="min-h-screen bg-[#0D0714] text-white font-sans antialiased selection:bg-[#CEF500] selection:text-[#0D0714] overflow-x-hidden">
      
      {/* Background Cyber Ambient Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#CEF500]/12 via-[#B983FF]/8 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[35%] -left-60 w-[600px] h-[600px] bg-[#B983FF]/10 rounded-full blur-[160px]" />
        <div className="absolute top-[65%] -right-60 w-[600px] h-[600px] bg-[#CEF500]/8 rounded-full blur-[160px]" />
        {/* Subtle Cyber Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2E1E54_1px,transparent_1px),linear-gradient(to_bottom,#2E1E54_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />
      </div>

      {/* ========================================================================= */}
      {/* 1. STICKY GLASSMORPHISM HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-[#0D0714]/85 backdrop-blur-xl border-b border-[#2E1E54]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Live Badge */}
          <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="relative w-11 h-11 rounded-2xl p-0.5 bg-gradient-to-br from-[#CEF500] via-[#8ECA3C] to-[#2E1E54] shadow-lg shadow-[#CEF500]/25 group-hover:scale-105 transition-transform">
              <img 
                src="/haka_favicon.png" 
                alt="HAKA App Icon" 
                className="w-full h-full object-contain rounded-[14px] bg-[#0D0714]" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black font-poppins tracking-wider text-white">HAKA</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#CEF500]/15 text-[#CEF500] border border-[#CEF500]/40 font-mono">
                  MOBILE APP
                </span>
              </div>
              <p className="text-[10px] text-[#A69EC6] font-bold tracking-tight">Reality Contest Platform</p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-[#A69EC6]">
            <a href="#how-to-join" className="hover:text-[#CEF500] transition-colors">How to Join</a>
            <a href="#how-it-works" className="hover:text-[#CEF500] transition-colors">How It Works</a>
            <a href="#screenshots" className="hover:text-[#CEF500] transition-colors">App Showcase</a>
            <a href="#faqs" className="hover:text-[#CEF500] transition-colors">FAQs</a>
            <button 
              onClick={() => navigate('/contest')} 
              className="text-[#CEF500] hover:text-white font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Web Arena</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQrModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C1335] border border-[#2E1E54] hover:border-[#CEF500] text-xs font-bold text-white transition-all shadow-md cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-[#CEF500]" />
              <span>QR Code</span>
            </button>

            <a
              href="#download"
              className="px-5 py-2.5 rounded-xl bg-[#CEF500] hover:bg-[#bce000] text-[#0D0714] font-black text-xs transition-all shadow-lg shadow-[#CEF500]/25 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download App</span>
            </a>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION – APP INTRODUCTION */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-12 pb-20 lg:pt-20 lg:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, App Availability, Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Live Availability Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#1C1335]/90 border border-[#CEF500]/50 shadow-lg shadow-[#CEF500]/10">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CEF500] animate-ping" />
              <span className="text-xs font-black text-[#CEF500] tracking-wide">
                MOBILE APP IS NOW LIVE ON ANDROID & iOS
              </span>
            </div>

            {/* Suggested Hero Headlines */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-poppins leading-[1.1]">
                <span className="block text-white">Discover. Compete.</span>
                <span className="bg-gradient-to-r from-[#CEF500] via-[#8ECA3C] to-[#B983FF] bg-clip-text text-transparent">
                  Win.
                </span>
              </h1>
              <h2 className="text-xl sm:text-2xl font-bold text-[#A69EC6] font-poppins">
                Your Next Big Opportunity Starts Here.
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl font-medium leading-relaxed">
              Step into India's premier reality gaming arena. Download the HAKA mobile app to compete in high-stakes speed quizzes, challenge thousands of players in real time, and claim guaranteed cash rewards deposited directly into your UPI account.
            </p>

            {/* Official App Icon Badge Card */}
            <div className="flex items-center gap-4 p-3.5 sm:p-4 rounded-3xl bg-[#1C1335]/90 border border-[#2E1E54] hover:border-[#CEF500]/60 max-w-md shadow-2xl backdrop-blur-xl group transition-all">
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-[20px] p-0.5 bg-gradient-to-br from-[#CEF500] via-[#8ECA3C] to-[#2E1E54] shadow-xl shadow-[#CEF500]/20 shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                <img 
                  src="/haka_favicon.png" 
                  alt="HAKA Mobile App Icon" 
                  className="w-full h-full object-contain rounded-[18px] bg-[#0D0714]"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white font-poppins leading-tight">HAKA Contest</h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#CEF500]/20 text-[#CEF500] border border-[#CEF500]/30 font-mono">
                    OFFICIAL APP
                  </span>
                </div>
                <p className="text-xs text-[#A69EC6] font-medium leading-tight">Reality Contests • Speed Trivia • Instant Cash</p>
                <div className="flex items-center gap-2 text-[11px] font-bold text-white pt-0.5">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="ml-1 text-white font-black">4.9</span>
                  </div>
                  <span className="text-[#A69EC6]">•</span>
                  <span className="text-[#CEF500]">100K+ Installs</span>
                  <span className="text-[#A69EC6]">•</span>
                  <span className="text-slate-400">Android & iOS</span>
                </div>
              </div>
            </div>

            {/* Store Download CTA Row */}
            <div id="download" className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              
              {/* Google Play Store Button */}
              <button
                onClick={() => handleDownloadClick('Google Play Store')}
                className="flex items-center gap-3.5 px-6 py-3.5 bg-[#1C1335] hover:bg-[#251a44] border-2 border-[#2E1E54] hover:border-[#CEF500] rounded-2xl transition-all shadow-xl hover:shadow-[0_0_30px_rgba(206,245,0,0.25)] group cursor-pointer text-left"
              >
                <GooglePlayIcon className="w-8 h-8 text-[#CEF500] group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#A69EC6] tracking-wider leading-none">Get it on</div>
                  <div className="text-base font-black text-white font-poppins mt-0.5 leading-none">Google Play</div>
                </div>
              </button>

              {/* Apple App Store Button */}
              <button
                onClick={() => handleDownloadClick('Apple App Store')}
                className="flex items-center gap-3.5 px-6 py-3.5 bg-[#1C1335] hover:bg-[#251a44] border-2 border-[#2E1E54] hover:border-[#CEF500] rounded-2xl transition-all shadow-xl hover:shadow-[0_0_30px_rgba(206,245,0,0.25)] group cursor-pointer text-left"
              >
                <AppleIcon className="w-8 h-8 text-[#CEF500] group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#A69EC6] tracking-wider leading-none">Download on the</div>
                  <div className="text-base font-black text-white font-poppins mt-0.5 leading-none">App Store</div>
                </div>
              </button>

            </div>

            {/* Trust & Guarantee Markers */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#A69EC6] font-semibold border-t border-[#2E1E54]/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#CEF500]" />
                <span>100% Legal & Skill-Based</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#CEF500]" />
                <span>Instant UPI Withdrawals</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">4.9/5 Rating (45K+ Reviews)</span>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-4 pt-4 max-w-lg">
              <div className="bg-[#1C1335]/70 border border-[#2E1E54] p-3.5 rounded-2xl">
                <div className="text-xl sm:text-2xl font-black text-[#CEF500] font-mono">100K+</div>
                <div className="text-[11px] text-[#A69EC6] font-bold mt-0.5">Active Players</div>
              </div>
              <div className="bg-[#1C1335]/70 border border-[#2E1E54] p-3.5 rounded-2xl">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">₹50L+</div>
                <div className="text-[11px] text-[#A69EC6] font-bold mt-0.5">Won in Prizes</div>
              </div>
              <div className="bg-[#1C1335]/70 border border-[#2E1E54] p-3.5 rounded-2xl">
                <div className="text-xl sm:text-2xl font-black text-[#B983FF] font-mono">99.8%</div>
                <div className="text-[11px] text-[#A69EC6] font-bold mt-0.5">Instant Payouts</div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Phone Device Showcase */}
          <div className="lg:col-span-5 flex justify-center relative">
            
            {/* Outer Ambient Glow Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 bg-gradient-to-tr from-[#CEF500]/20 via-[#B983FF]/30 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Floating Live Indicator Badge 1 (Top Right) */}
            <div className="absolute -top-4 -right-4 sm:right-0 bg-[#1C1335]/95 border-2 border-[#CEF500]/70 p-3 rounded-2xl shadow-2xl backdrop-blur-xl z-20 animate-bounce duration-1000 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#CEF500]/20 text-[#CEF500] border border-[#CEF500]/30 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#CEF500]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-[#A69EC6] font-bold uppercase">Podium Champion</div>
                <div className="text-xs font-black text-white">+₹25,000 Credited</div>
              </div>
            </div>

            {/* Floating Live Indicator Badge 2 (Bottom Left) */}
            <div className="absolute -bottom-6 -left-4 sm:left-0 bg-[#1C1335]/95 border-2 border-[#B983FF]/70 p-3 rounded-2xl shadow-2xl backdrop-blur-xl z-20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B983FF]/20 text-[#B983FF] flex items-center justify-center">
                <Flame className="w-5 h-5 text-[#B983FF]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-[#A69EC6] font-bold uppercase">Speed Trivia</div>
                <div className="text-xs font-black text-[#CEF500]">3.2s Avg Response</div>
              </div>
            </div>

            {/* High-Fidelity Mobile Device Mockup Frame */}
            <div className="relative w-[290px] sm:w-[320px] h-[580px] sm:h-[630px] bg-[#000000] rounded-[52px] border-[10px] border-[#1C1335] shadow-[0_0_60px_rgba(206,245,0,0.2)] overflow-hidden flex flex-col justify-between">
              
              {/* Dynamic Island / Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-end px-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1C1335] border border-white/10" />
              </div>

              {/* Inside Mobile Screen Content */}
              <div className="flex-1 bg-gradient-to-b from-[#1C1335] via-[#0D0714] to-[#13005A] p-4 text-left pt-10 flex flex-col justify-between relative overflow-hidden">
                
                {/* Status Bar */}
                <div className="flex items-center justify-between text-[11px] font-bold text-white/70 px-2 pt-1">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">5G</span>
                    <span className="w-4 h-2.5 border border-white/70 rounded-sm relative">
                      <span className="absolute inset-0.5 bg-[#CEF500] rounded-xs" />
                    </span>
                  </div>
                </div>

                {/* In-App Header */}
                <div className="flex items-center justify-between pt-3 border-b border-[#2E1E54] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="relative w-7 h-7 rounded-lg p-0.5 bg-gradient-to-br from-[#CEF500] to-[#8ECA3C] shadow-sm shrink-0">
                      <img 
                        src="/haka_favicon.png" 
                        alt="HAKA App Icon" 
                        className="w-full h-full object-contain rounded-[6px] bg-[#0D0714]"
                      />
                    </div>
                    <span className="text-xs font-black text-white font-poppins">HAKA LIVE</span>
                  </div>
                  <span className="text-[10px] font-black bg-[#CEF500]/20 text-[#CEF500] px-2 py-0.5 rounded-full border border-[#CEF500]/30">
                    🪙 4,850 COINS
                  </span>
                </div>

                {/* Active Live Quiz Card Mockup */}
                <div className="bg-[#1C1335]/90 border border-[#CEF500]/40 rounded-2xl p-3.5 space-y-2.5 my-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-[#CEF500] uppercase tracking-wider">Mega Arena • Round 3</span>
                    <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                      ⏱ 00:07s
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white leading-snug">
                    Which Indian city is celebrated as the "Silicon Valley of India"?
                  </h4>

                  {/* Options */}
                  <div className="space-y-1.5 pt-1">
                    <div className="p-2 rounded-xl bg-black/40 border border-[#2E1E54] text-[10px] font-bold text-white/80 flex justify-between items-center">
                      <span>A) Hyderabad</span>
                      <span className="text-[9px] text-[#A69EC6]">18%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#CEF500]/20 border-2 border-[#CEF500] text-[10px] font-black text-[#CEF500] flex justify-between items-center shadow-md shadow-[#CEF500]/10">
                      <span>B) Bengaluru</span>
                      <Check className="w-3.5 h-3.5 text-[#CEF500]" />
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-[#2E1E54] text-[10px] font-bold text-white/80 flex justify-between items-center">
                      <span>C) Pune</span>
                      <span className="text-[9px] text-[#A69EC6]">9%</span>
                    </div>
                  </div>
                </div>

                {/* Mini Leaderboard Ticker */}
                <div className="bg-black/50 border border-[#2E1E54] rounded-xl p-2.5 flex items-center justify-between text-[10px] font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">👑 Rank #1</span>
                    <span className="text-white">Rihan K.</span>
                  </div>
                  <span className="text-[#CEF500] font-mono font-black">940 pts</span>
                </div>

                {/* In-App Bottom Navigation Mockup */}
                <div className="bg-[#1C1335] border border-[#2E1E54] rounded-2xl py-2 px-4 flex items-center justify-around text-slate-400">
                  <div className="text-center text-[#CEF500]">
                    <Trophy className="w-4 h-4 mx-auto" />
                    <span className="text-[8px] font-bold">Arena</span>
                  </div>
                  <div className="text-center">
                    <Zap className="w-4 h-4 mx-auto" />
                    <span className="text-[8px]">Daily</span>
                  </div>
                  <div className="text-center">
                    <Award className="w-4 h-4 mx-auto" />
                    <span className="text-[8px]">Ranks</span>
                  </div>
                  <div className="text-center">
                    <Users className="w-4 h-4 mx-auto" />
                    <span className="text-[8px]">Wallet</span>
                  </div>
                </div>

              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="h-4 bg-black flex items-center justify-center">
                <div className="w-28 h-1 bg-white/40 rounded-full" />
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. STEP-BY-STEP VISUAL GUIDE: HOW TO JOIN A CONTEST */}
      {/* ========================================================================= */}
      <section id="how-to-join" className="relative z-10 py-20 bg-[#1C1335]/40 border-y border-[#2E1E54]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#CEF500] bg-[#CEF500]/10 border border-[#CEF500]/30 px-3 py-1 rounded-full">
              Simple 4-Step Walkthrough
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-poppins text-white">
              How to Join a Contest on the App
            </h2>
            <p className="text-sm text-[#A69EC6] font-medium">
              Joining a tournament is effortless. Follow our simple visual guide to register, choose your contest, and start winning.
            </p>
          </div>

          {/* Interactive Steps Layout: Left Nav + Right Preview Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-14">
            
            {/* Left 4 Step Selectors */}
            <div className="lg:col-span-7 space-y-3 text-left">
              {HOW_TO_JOIN_STEPS.map((s, idx) => {
                const isActive = activeStepIdx === idx;
                return (
                  <div
                    key={s.step}
                    onClick={() => setActiveStepIdx(idx)}
                    className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-[#1C1335] border-[#CEF500] shadow-[0_0_25px_rgba(206,245,0,0.15)] ring-1 ring-[#CEF500]/50'
                        : 'bg-[#1C1335]/40 border-[#2E1E54] hover:border-[#CEF500]/40'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Step Number Badge */}
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-black text-sm shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#CEF500] text-[#0D0714] shadow-md shadow-[#CEF500]/30'
                          : 'bg-[#0D0714] text-[#A69EC6] border border-[#2E1E54]'
                      }`}>
                        {s.step}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-base font-black font-poppins ${isActive ? 'text-white' : 'text-slate-300'}`}>
                            {s.title}
                          </h3>
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-[#CEF500]/15 text-[#CEF500]' : 'text-[#A69EC6]'
                          }`}>
                            {s.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#A69EC6] font-medium leading-relaxed">
                          {s.description}
                        </p>

                        {/* Expandable Feature Checklist when Active */}
                        {isActive && (
                          <div className="pt-2 flex flex-wrap gap-2 animate-fade-in">
                            {s.features.map((feat, fIdx) => (
                              <span key={fIdx} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#CEF500] bg-[#CEF500]/10 border border-[#CEF500]/20 px-2.5 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{feat}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Interactive Mockup Screen matching active step */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[340px] bg-[#1C1335] border-2 border-[#CEF500]/50 rounded-[36px] p-6 text-left shadow-2xl relative overflow-hidden space-y-4">
                
                {/* Corner Accent Badge */}
                <div className="flex items-center justify-between border-b border-[#2E1E54] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#CEF500] animate-ping" />
                    <span className="text-xs font-black text-white font-mono">LIVE APP VIEW</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#CEF500]/10 text-[#CEF500] px-2.5 py-0.5 rounded-full border border-[#CEF500]/30">
                    Step {activeStep.step} of 04
                  </span>
                </div>

                {/* Mockup Dynamic Content */}
                <div className="space-y-4 pt-1">
                  
                  {activeStepIdx === 0 && (
                    <div className="space-y-3 bg-[#0D0714] p-4 rounded-2xl border border-[#2E1E54]">
                      <div className="w-12 h-12 rounded-2xl bg-[#CEF500]/15 border border-[#CEF500]/30 p-1 flex items-center justify-center shadow-lg shadow-[#CEF500]/10">
                        <img src="/haka_favicon.png" alt="HAKA App Icon" className="w-full h-full object-contain rounded-xl" />
                      </div>
                      <h4 className="text-sm font-black text-white">Instant One-Tap Signup</h4>
                      <p className="text-xs text-[#A69EC6]">Enter your mobile number and submit the 6-digit OTP to access the full tournament lineup.</p>
                      <div className="p-2.5 rounded-xl bg-[#1C1335] text-xs font-mono text-[#CEF500] border border-[#2E1E54]">
                        +91 98765 43210  ✓ Verified
                      </div>
                    </div>
                  )}

                  {activeStepIdx === 1 && (
                    <div className="space-y-3 bg-[#0D0714] p-4 rounded-2xl border border-[#2E1E54]">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h4 className="text-sm font-black text-white">Browse Contest Roster</h4>
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-xl bg-[#1C1335] border border-[#CEF500]/40 flex justify-between items-center text-xs">
                          <span className="font-bold text-white">⚡ Speed Battle Daily</span>
                          <span className="text-[#CEF500] font-mono font-black">Free Entry</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#1C1335] border border-[#2E1E54] flex justify-between items-center text-xs">
                          <span className="font-bold text-white">🏆 Grand Mega Reality</span>
                          <span className="text-amber-400 font-mono font-black">₹50L Pool</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStepIdx === 2 && (
                    <div className="space-y-3 bg-[#0D0714] p-4 rounded-2xl border border-[#2E1E54]">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                        <Award className="w-6 h-6 text-amber-400" />
                      </div>
                      <h4 className="text-sm font-black text-white">Review Rules & Lock Entry</h4>
                      <div className="text-xs text-[#A69EC6] space-y-1.5">
                        <div className="flex justify-between"><span>Format:</span><span className="font-bold text-white">20 Speed Questions</span></div>
                        <div className="flex justify-between"><span>Timer:</span><span className="font-bold text-white">10s per Question</span></div>
                        <div className="flex justify-between"><span>Entry Fee:</span><span className="font-bold text-[#CEF500]">₹49 or 50 Coins</span></div>
                      </div>
                      <button className="w-full py-2 bg-[#CEF500] text-[#0D0714] font-black text-xs rounded-xl shadow-md">
                        Confirm & Enter Arena
                      </button>
                    </div>
                  )}

                  {activeStepIdx === 3 && (
                    <div className="space-y-3 bg-[#0D0714] p-4 rounded-2xl border border-[#2E1E54]">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h4 className="text-sm font-black text-emerald-400">Podium Winner Declared!</h4>
                      <p className="text-xs text-[#A69EC6]">Congratulations! Your rank #1 standing earned ₹15,000 cash reward.</p>
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center text-xs font-black text-emerald-400">
                        ⚡ ₹15,000 Credited to UPI Instantly
                      </div>
                    </div>
                  )}

                  {/* Step Selector Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setActiveStepIdx(prev => Math.max(0, prev - 1))}
                      disabled={activeStepIdx === 0}
                      className="px-3 py-1.5 bg-[#0D0714] hover:bg-black text-xs font-bold rounded-lg disabled:opacity-40"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setActiveStepIdx(prev => Math.min(HOW_TO_JOIN_STEPS.length - 1, prev + 1))}
                      disabled={activeStepIdx === HOW_TO_JOIN_STEPS.length - 1}
                      className="px-3 py-1.5 bg-[#CEF500] text-[#0D0714] text-xs font-black rounded-lg disabled:opacity-40"
                    >
                      Next Step →
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS – COMPLETE PARTICIPATION PROCESS */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#B983FF] bg-[#B983FF]/10 border border-[#B983FF]/30 px-3 py-1 rounded-full">
            Under the Hood
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-poppins text-white">
            The Complete Contest Participation Process
          </h2>
          <p className="text-sm text-[#A69EC6] font-medium">
            Built on proprietary speed-scoring algorithms and real-time multiplayer telemetry to ensure 100% fair play.
          </p>
        </div>

        {/* 4 Engine Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-14 text-left">
          
          {/* Pillar 1 */}
          <div className="bg-[#1C1335]/70 border border-[#2E1E54] hover:border-[#CEF500]/60 p-6 rounded-3xl space-y-4 transition-all duration-300 hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6 text-[#CEF500]" />
            </div>
            <h3 className="text-base font-black font-poppins text-white group-hover:text-[#CEF500] transition-colors">
              1. Anti-Cheat & Fair Play
            </h3>
            <p className="text-xs text-[#A69EC6] leading-relaxed">
              Every round is protected with AI anti-cheat algorithms, tab-switch penalties, and randomized question ordering to guarantee genuine player competition.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#1C1335]/70 border border-[#2E1E54] hover:border-[#CEF500]/60 p-6 rounded-3xl space-y-4 transition-all duration-300 hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-black">
              <Flame className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-base font-black font-poppins text-white group-hover:text-[#CEF500] transition-colors">
              2. Millisecond Speed Scoring
            </h3>
            <p className="text-xs text-[#A69EC6] leading-relaxed">
              Points are calculated based on both accuracy and answer speed. The quicker you submit correct answers, the higher your velocity multiplier climbs.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#1C1335]/70 border border-[#2E1E54] hover:border-[#CEF500]/60 p-6 rounded-3xl space-y-4 transition-all duration-300 hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-black">
              <Trophy className="w-6 h-6 text-[#B983FF]" />
            </div>
            <h3 className="text-base font-black font-poppins text-white group-hover:text-[#CEF500] transition-colors">
              3. Live Automated Ranks
            </h3>
            <p className="text-xs text-[#A69EC6] leading-relaxed">
              Upon final question completion, scores are instantly aggregated and verified across all participants without delays or manual intervention.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-[#1C1335]/70 border border-[#2E1E54] hover:border-[#CEF500]/60 p-6 rounded-3xl space-y-4 transition-all duration-300 hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-base font-black font-poppins text-white group-hover:text-[#CEF500] transition-colors">
              4. Instant 1-Click Payouts
            </h3>
            <p className="text-xs text-[#A69EC6] leading-relaxed">
              Cash prizes automatically reflect in your in-app wallet balance and can be transferred to your bank account or UPI ID with 1-tap processing.
            </p>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. APP SCREENSHOTS & INTERACTIVE PREVIEW */}
      {/* ========================================================================= */}
      <section id="screenshots" className="relative z-10 py-20 bg-[#1C1335]/40 border-y border-[#2E1E54]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#CEF500] bg-[#CEF500]/10 border border-[#CEF500]/30 px-3 py-1 rounded-full">
              Mobile App Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-poppins text-white">
              Attractive In-App Screenshots & Showcase
            </h2>
            <p className="text-sm text-[#A69EC6] font-medium">
              Crafted with smooth 60 FPS transitions, dark-mode cyberpunk ergonomics, and lightning-fast quiz controls.
            </p>
          </div>

          {/* Screenshot Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14 text-left">
            {APP_SCREENSHOTS.map((sc, i) => (
              <div 
                key={sc.id}
                className="bg-[#0D0714] border border-[#2E1E54] hover:border-[#CEF500] rounded-3xl p-5 shadow-2xl space-y-4 group transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Phone Mockup Screen Representation */}
                <div className={`h-64 rounded-2xl bg-gradient-to-b ${sc.gradient} p-4 border border-white/10 flex flex-col justify-between relative overflow-hidden`}>
                  
                  {/* Top Header inside screenshot */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-white/70">
                    <span>9:41 AM</span>
                    <span className="text-[#CEF500] font-black">{sc.tag}</span>
                  </div>

                  {/* Center Graphic */}
                  <div className="space-y-2 text-center py-4">
                    {sc.id === 'home' && (
                      <div className="w-14 h-14 mx-auto rounded-2xl p-1 bg-gradient-to-br from-[#CEF500] to-[#8ECA3C] shadow-xl shadow-[#CEF500]/20 flex items-center justify-center">
                        <img src="/haka_favicon.png" alt="HAKA" className="w-full h-full object-contain rounded-xl bg-[#0D0714]" />
                      </div>
                    )}
                    {sc.id === 'quiz' && (
                      <div className="w-14 h-14 mx-auto rounded-full border-4 border-[#CEF500] bg-[#CEF500]/10 text-[#CEF500] flex items-center justify-center shadow-lg shadow-[#CEF500]/20">
                        <Clock className="w-7 h-7 text-[#CEF500]" />
                      </div>
                    )}
                    {sc.id === 'leaderboard' && (
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg">
                        <Award className="w-7 h-7 text-amber-400" />
                      </div>
                    )}
                    {sc.id === 'wallet' && (
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg">
                        <Coins className="w-7 h-7 text-emerald-400" />
                      </div>
                    )}
                    <div className="text-xs font-black text-white">{sc.title}</div>
                  </div>

                  {/* Bottom App Pill */}
                  <div className="h-2 w-20 bg-white/30 rounded-full mx-auto" />
                </div>

                {/* Info Text below screen */}
                <div>
                  <span className="text-[10px] font-mono font-black text-[#CEF500] uppercase tracking-wider">{sc.tag}</span>
                  <h3 className="text-base font-black text-white font-poppins mt-0.5">{sc.title}</h3>
                  <p className="text-xs text-[#A69EC6] font-medium mt-1 leading-relaxed">{sc.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION (CTA) – CONVERSION SECTION */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#1C1335] via-[#2E1E54] to-[#1C1335] border-2 border-[#CEF500]/70 rounded-[40px] p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl shadow-[#CEF500]/10">
          
          {/* Subtle Ambient Flare */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#CEF500]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#0D0714] bg-[#CEF500] px-3.5 py-1 rounded-full shadow-md">
              Start Winning Today
            </span>

            <h2 className="text-3xl sm:text-5xl font-black font-poppins text-white tracking-tight leading-tight">
              Ready to Join the Arena and Claim Your Prize?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Download the official HAKA app now on your smartphone. Claim your 100 free welcome coins and jump into your first live contest within 60 seconds!
            </p>

            {/* Store Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => handleDownloadClick('Google Play Store')}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-[#0D0714] hover:bg-black border border-[#CEF500] rounded-2xl transition-all shadow-xl hover:scale-105 cursor-pointer"
              >
                <GooglePlayIcon className="w-6 h-6 text-[#CEF500]" />
                <div className="text-left">
                  <div className="text-[9px] uppercase font-bold text-[#A69EC6]">Get it on</div>
                  <div className="text-sm font-black text-white font-poppins">Google Play</div>
                </div>
              </button>

              <button
                onClick={() => handleDownloadClick('Apple App Store')}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-[#0D0714] hover:bg-black border border-[#CEF500] rounded-2xl transition-all shadow-xl hover:scale-105 cursor-pointer"
              >
                <AppleIcon className="w-6 h-6 text-[#CEF500]" />
                <div className="text-left">
                  <div className="text-[9px] uppercase font-bold text-[#A69EC6]">Download on the</div>
                  <div className="text-sm font-black text-white font-poppins">App Store</div>
                </div>
              </button>
            </div>

            {/* QR Code quick scan prompt */}
            <div className="pt-2">
              <button
                onClick={() => setShowQrModal(true)}
                className="text-xs text-[#CEF500] hover:underline font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-4 h-4" /> Prefer to scan QR Code with your camera? Click here
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQS) */}
      {/* ========================================================================= */}
      <section id="faqs" className="relative z-10 py-16 max-w-4xl mx-auto px-4 sm:px-6 text-left">
        <div className="text-center space-y-3 mb-10">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#A69EC6] bg-[#1C1335] border border-[#2E1E54] px-3 py-1 rounded-full">
            Got Questions?
          </span>
          <h2 className="text-3xl font-black font-poppins text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div 
                key={idx}
                className="bg-[#1C1335]/70 border border-[#2E1E54] rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-black text-sm text-white hover:text-[#CEF500] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#CEF500] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#A69EC6] font-medium leading-relaxed border-t border-[#2E1E54]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER */}
      {/* ========================================================================= */}
      <footer className="relative z-10 border-t border-[#2E1E54] bg-[#09040E] py-12 text-xs text-[#A69EC6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl p-0.5 bg-gradient-to-br from-[#CEF500] to-[#2E1E54] shadow-md shadow-[#CEF500]/20 shrink-0">
              <img src="/haka_favicon.png" alt="HAKA" className="w-full h-full object-contain rounded-[10px] bg-[#0D0714]" />
            </div>
            <div className="text-left">
              <div className="font-black text-white font-poppins">HAKA Contest Platform</div>
              <div className="text-[10px] text-slate-400">© 2026 Reality Contest Platform. All Rights Reserved.</div>
            </div>
          </div>

          <div className="flex items-center gap-6 font-bold">
            <button onClick={() => navigate('/privacy')} className="hover:text-[#CEF500] cursor-pointer">Privacy Policy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-[#CEF500] cursor-pointer">Terms of Service</button>
            <button onClick={() => navigate('/support')} className="hover:text-[#CEF500] cursor-pointer">Support</button>
            <button onClick={() => navigate('/contest')} className="hover:text-[#CEF500] cursor-pointer">Contest Arena</button>
          </div>

        </div>
      </footer>

      {/* ========================================================================= */}
      {/* QR CODE DOWNLOAD MODAL */}
      {/* ========================================================================= */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1335] border-2 border-[#CEF500] p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-[#A69EC6] hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="w-16 h-16 p-1 bg-gradient-to-br from-[#CEF500] to-[#8ECA3C] shadow-lg shadow-[#CEF500]/20 rounded-2xl flex items-center justify-center mx-auto">
              <img src="/haka_favicon.png" alt="HAKA App Icon" className="w-full h-full object-contain rounded-xl bg-[#0D0714]" />
            </div>

            <h3 className="text-lg font-black text-white font-poppins">Scan to Download App</h3>
            <p className="text-xs text-[#A69EC6]">Open your smartphone camera and scan the QR code to install the HAKA mobile app directly.</p>

            {/* Visual QR Code Display */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center border-4 border-[#CEF500]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://realitycontest.com/download')}&color=0D0714`}
                alt="QR Code to Download HAKA App"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-[11px] font-mono text-[#CEF500] font-bold">
              Compatible with Android & iOS
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-[#CEF500] text-[#0D0714] font-black text-xs rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppLandingPage;

