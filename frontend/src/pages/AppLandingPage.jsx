import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Play, Download, Smartphone, ShieldCheck, Zap, Star, 
  CheckCircle2, ArrowRight, Clock, Award, Users, QrCode, 
  ChevronRight, ChevronLeft, Sparkles, ExternalLink, HelpCircle, ChevronDown,
  Lock, RefreshCw, Flame, Check, AlertCircle, ArrowUpRight, Coins,
  BarChart2, Wallet, Send, Mail, Phone, MapPin, TrendingUp,
  Globe, X, Layers, MessageSquare, Gift
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

// Import the user's mobile app screenshots directly from frontend/src/screenshot
import fristScreen from '../screenshot/frist.jpeg';
import homeScreen from '../screenshot/home.jpeg';
import leadboardScreen from '../screenshot/leadboard.jpeg';
import walletScreen from '../screenshot/wallet.jpeg';

// =========================================================================
// REUSABLE VECTOR CURVES, WAVE DIVIDERS & BACKGROUND DESIGNS
// =========================================================================

// Top Wave Curve Divider
const TopWaveCurve = ({ fill = "#F8FAFC", className = "" }) => (
  <div className={`w-full overflow-hidden leading-none pointer-events-none select-none ${className}`}>
    <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" className="w-full h-10 sm:h-16 lg:h-20 block">
      <path 
        d="M0,32 C280,95 560,0 840,48 C1120,96 1320,30 1440,40 L1440,120 L0,120 Z" 
        fill={fill} 
      />
    </svg>
  </div>
);

// Bottom Wave Curve Divider
const BottomWaveCurve = ({ fill = "#F8FAFC", className = "" }) => (
  <div className={`w-full overflow-hidden leading-none pointer-events-none select-none ${className}`}>
    <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" className="w-full h-10 sm:h-16 lg:h-20 block">
      <path 
        d="M0,0 C240,75 520,120 780,60 C1040,0 1280,65 1440,30 L1440,0 L0,0 Z" 
        fill={fill} 
      />
    </svg>
  </div>
);

// Fluid Contour / Topographic Vector Curves for Dark Card Backdrops
const FluidContourCurves = ({ className = "opacity-10" }) => (
  <svg viewBox="0 0 800 600" fill="none" className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}>
    <path d="M-100,100 C150,50 300,250 600,150 C750,100 850,200 950,300" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 8" />
    <path d="M-80,200 C180,150 320,350 620,250 C780,200 880,300 980,400" stroke="currentColor" strokeWidth="2" />
    <path d="M-60,300 C200,250 350,450 650,350 C800,300 900,400 1000,500" stroke="currentColor" strokeWidth="1.2" />
    <path d="M-40,400 C220,350 380,550 680,450 C820,400 920,500 1020,600" stroke="currentColor" strokeWidth="1.8" strokeDasharray="6 6" />
    <circle cx="240" cy="180" r="120" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <circle cx="240" cy="180" r="180" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.3" />
  </svg>
);

// Decorative Curving Dashed Journey Path Vector
const CurvingDashedJourney = ({ className = "" }) => (
  <svg viewBox="0 0 1200 400" fill="none" preserveAspectRatio="none" className={`absolute w-full h-full pointer-events-none select-none ${className}`}>
    <path 
      d="M50,80 C350,20 450,280 750,180 C1000,80 1100,320 1250,220" 
      stroke="url(#journeyGrad)" 
      strokeWidth="2.5" 
      strokeDasharray="8 8" 
      opacity="0.35"
    />
    <defs>
      <linearGradient id="journeyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF4B55" />
        <stop offset="50%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#1877F2" />
      </linearGradient>
    </defs>
  </svg>
);

// Botanical Palm Leaf Vector in Bottom-Left (Referencing original template)
const PalmLeafVector = ({ className = "" }) => (
  <svg viewBox="0 0 320 320" fill="none" className={`pointer-events-none select-none ${className}`}>
    <g opacity="0.85">
      {/* Stem */}
      <path d="M20,300 Q120,200 240,60" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
      {/* Left Fronds */}
      <path d="M50,260 Q10,210 2,170 Q40,210 80,240 Z" fill="#10B981" opacity="0.75" />
      <path d="M80,220 Q40,160 30,110 Q70,160 115,200 Z" fill="#059669" opacity="0.85" />
      <path d="M120,170 Q80,100 80,50 Q110,110 150,150 Z" fill="#34D399" opacity="0.9" />
      <path d="M160,120 Q130,50 140,10 Q160,65 190,105 Z" fill="#10B981" />
      {/* Right Fronds */}
      <path d="M70,270 Q140,240 180,250 Q125,270 70,270 Z" fill="#047857" opacity="0.7" />
      <path d="M100,230 Q180,190 230,195 Q165,225 100,230 Z" fill="#10B981" opacity="0.8" />
      <path d="M140,180 Q220,135 270,140 Q200,175 140,180 Z" fill="#34D399" opacity="0.85" />
      <path d="M180,130 Q250,80 300,80 Q235,125 180,130 Z" fill="#059669" />
      <path d="M220,80 Q270,30 310,20 Q265,70 220,80 Z" fill="#10B981" />
    </g>
  </svg>
);

// Modern Geometric Floating Accents
const FloatingVectorAccents = () => (
  <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
    {/* Floating Plus/Crosshairs */}
    <div className="absolute top-[12%] right-[10%] text-[#FF4B55]/30 text-xl font-black">✦</div>
    <div className="absolute top-[35%] left-[6%] text-[#8B5CF6]/35 text-2xl font-black">✦</div>
    <div className="absolute top-[58%] right-[8%] text-[#1877F2]/30 text-lg font-black">✦</div>
    <div className="absolute top-[82%] left-[12%] text-emerald-500/35 text-xl font-black">✦</div>

    {/* Hollow geometric circles */}
    <div className="absolute top-[18%] left-[15%] w-12 h-12 rounded-full border-2 border-dashed border-[#FF4B55]/20 animate-spin" style={{ animationDuration: '25s' }} />
    <div className="absolute top-[48%] right-[14%] w-16 h-16 rounded-full border-2 border-[#1877F2]/15" />
    <div className="absolute top-[72%] right-[20%] w-10 h-10 rounded-full border-2 border-dashed border-[#8B5CF6]/25 animate-spin" style={{ animationDuration: '20s' }} />
    
    {/* Concentric Dot Matrix Cluster */}
    <div className="absolute top-[28%] right-[5%] opacity-20 bg-[radial-gradient(#1877F2_2px,transparent_2px)] [background-size:16px_16px] w-36 h-36" />
    <div className="absolute top-[65%] left-[4%] opacity-20 bg-[radial-gradient(#8B5CF6_2px,transparent_2px)] [background-size:16px_16px] w-32 h-32" />
  </div>
);

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

// Realistic Smartphone Frame Component with Smooth Hover Tilt
const PhoneMockup = ({ src, alt = "Mobile Screen", className = "", priority = false }) => {
  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative mx-auto rounded-[46px] p-2.5 sm:p-3 bg-gradient-to-b from-[#2B303C] via-[#1A1E29] to-[#12151D] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border-[3px] border-slate-700/60 ring-1 ring-white/10 ${className}`}
    >
      {/* Glossy edge highlight */}
      <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      
      {/* Top Speaker / Dynamic Island */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-20 flex items-center justify-center shadow-md">
        <div className="w-2.5 h-2.5 rounded-full bg-[#1e293b] mr-2 ring-1 ring-white/10" />
        <div className="w-2 h-2 rounded-full bg-[#0f172a]" />
      </div>

      {/* Screen Frame */}
      <div className="relative rounded-[36px] overflow-hidden bg-black aspect-[9/19.5] w-full shadow-inner select-none">
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-[1.02]"
          loading={priority ? "eager" : "lazy"}
        />
        {/* Subtle glass reflection overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/15 opacity-60" />
      </div>

      {/* Bottom home indicator bar */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/40 rounded-full" />
    </motion.div>
  );
};

// Floating Animated Avatar Badge with Live Pulse & Level Tag
const FloatingAvatarBadge = ({
  image,
  name,
  action,
  amount,
  badgeText,
  badgeColor = "bg-[#FF4B55]",
  className = "",
  delay = 0,
  duration = 4
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 15 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once: true }}
    animate={{ y: [0, -10, 0] }}
    transition={{
      y: { repeat: Infinity, duration, ease: "easeInOut", delay },
      opacity: { duration: 0.5, delay }
    }}
    className={`absolute z-30 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md text-slate-800 shadow-xl border border-slate-100/90 flex items-center gap-2.5 hover:scale-105 transition-transform duration-200 select-none ${className}`}
  >
    <div className="relative">
      <img src={image} alt={name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm" />
      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${badgeColor} ring-2 ring-white flex items-center justify-center text-[7px] text-white font-black`}>
        ✓
      </span>
    </div>
    <div className="text-left text-[11px] leading-tight">
      <div className="flex items-center gap-1.5">
        <span className="font-extrabold text-slate-900">{name}</span>
        {badgeText && (
          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">
            {badgeText}
          </span>
        )}
      </div>
      <p className="text-[10px] text-slate-500 font-medium">
        {action} {amount && <span className="font-bold text-emerald-600">{amount}</span>}
      </p>
    </div>
  </motion.div>
);

export const AppLandingPage = () => {
  const navigate = useNavigate();

  // Scroll Progress Bar calculation with Framer Motion
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // State management
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState(1);
  const [openFaqIdx, setOpenFaqIdx] = useState(0);
  const [showQrModal, setShowQrModal] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [teamSlideIdx, setTeamSlideIdx] = useState(1);
  const [slideDirection, setSlideDirection] = useState(1);
  const [isTeamHovered, setIsTeamHovered] = useState(false);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Screenshots data matching the screenshots folder
  const SCREENSHOTS_DATA = [
    {
      id: 'frist',
      src: fristScreen,
      title: 'Welcome & Onboarding',
      category: 'Start Your Journey',
      tag: '01. Instant OTP Onboarding',
      description: 'Superfast seamless phone login with 100 free bonus practice coins.'
    },
    {
      id: 'home',
      src: homeScreen,
      title: 'Contest Arena Hub',
      category: 'Daily Speed Battles',
      tag: '02. Live Contests',
      description: 'Browse grand tournaments, mega prize pools, and live countdown timers.'
    },
    {
      id: 'leadboard',
      src: leadboardScreen,
      title: 'Live Podium & Leaderboard',
      category: 'Real-Time Standings',
      tag: '03. Champion Standings',
      description: 'Real-time score updates and millisecond speed bonuses on the national board.'
    },
    {
      id: 'wallet',
      src: walletScreen,
      title: 'Instant Cash Wallet',
      category: '1-Click UPI Payouts',
      tag: '04. Instant Withdrawals',
      description: 'Withdraw winning cash directly to Google Pay, PhonePe, Paytm, or Bank in seconds.'
    }
  ];

  // Testimonials
  const TESTIMONIALS = [
    {
      quote: "HAKA revolutionized mobile gaming for me! The speed trivia questions are pure adrenaline, and when I won ₹10,000 in the Grand Arena, the UPI withdrawal was in my bank account in 3 seconds!",
      name: "Rahul Verma",
      role: "Grand Arena Champion 2026",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      location: "Bangalore, India"
    },
    {
      quote: "The interface is slick, transparent, and completely fair. The millisecond streak scoring makes every round exciting. Highly recommend to everyone who loves skill contests!",
      name: "Sneha Nair",
      role: "Daily Speed Battle Pro",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      location: "Kochi, Kerala"
    },
    {
      quote: "Withdrawal reliability is unmatched. Instant UPI support means you truly own what you win. The graphics and smooth animations make it feel like a premier console game on mobile.",
      name: "Arun Kumar",
      role: "Reality Contestant",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      location: "Mumbai, India"
    }
  ];

  // FAQs
  const FAQS = [
    {
      q: 'Is the HAKA mobile app free to download and join?',
      a: 'Yes! The HAKA mobile app is 100% free to download on both Google Play Store (Android) and Apple App Store (iOS). When you create an account, you instantly receive 100 Free Welcome Coins to participate in practice battles.'
    },
    {
      q: 'How fast are UPI cash withdrawals credited?',
      a: 'Winnings are credited to your in-app wallet immediately upon contest completion. You can withdraw your balance anytime via UPI (Google Pay, PhonePe, Paytm) or direct Bank IMPS with 99.9% instant processing in under 5 seconds.'
    },
    {
      q: 'Are contests on HAKA legally compliant and skill-based?',
      a: 'Yes. All contests hosted on HAKA are recognized as Games of Skill under the Public Gambling Act, 1867 and Indian Supreme Court precedents. Success relies purely on knowledge, mental speed, and accuracy.'
    },
    {
      q: 'Can I play with friends in private rooms?',
      a: 'Absolutely! You can create custom room codes, invite friends or family, set customized question rounds, and battle head-to-head for bragging rights and custom stakes.'
    },
    {
      q: 'What mobile devices are compatible with the app?',
      a: 'HAKA runs smoothly on Android smartphones running Android 8.0+ and Apple iPhones running iOS 14.0 or higher, with optimized low battery consumption and lightweight footprint.'
    }
  ];

  // Team members matching the 3 circle cards in reference image (Slider Roster)
  const TEAM_MEMBERS = [
    {
      id: 'cto',
      name: "Aravind Nair",
      role: "Chief Technology Officer",
      tag: "Tech & Architecture",
      badge: "CTO",
      ringColor: "border-[#8B5CF6]",
      glowColor: "shadow-[#8B5CF6]/35",
      accentBg: "bg-[#8B5CF6]",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 'ceo',
      name: "Siddharth Rao",
      role: "Founder & Chief Executive",
      tag: "Vision & Strategy",
      badge: "FOUNDER & CEO",
      ringColor: "border-[#FF4B55]",
      glowColor: "shadow-[#FF4B55]/45",
      accentBg: "bg-[#FF4B55]",
      featured: true,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 'design',
      name: "Kavya Menon",
      role: "Head of Game Design",
      tag: "UX & Trivia Mechanics",
      badge: "GAME DESIGN",
      ringColor: "border-[#1877F2]",
      glowColor: "shadow-[#1877F2]/35",
      accentBg: "bg-[#1877F2]",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80"
    }
  ];

  // Auto-play slider rotation (advances smoothly every 4.5 seconds unless hovered)
  useEffect(() => {
    if (isTeamHovered) return;
    const interval = setInterval(() => {
      setSlideDirection(1);
      setTeamSlideIdx((prev) => (prev + 1) % TEAM_MEMBERS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isTeamHovered, TEAM_MEMBERS.length]);

  const handleNextTeam = () => {
    setSlideDirection(1);
    setTeamSlideIdx((prev) => (prev + 1) % TEAM_MEMBERS.length);
  };

  const handlePrevTeam = () => {
    setSlideDirection(-1);
    setTeamSlideIdx((prev) => (prev === 0 ? TEAM_MEMBERS.length - 1 : prev - 1));
  };

  const handleDotClick = (idx) => {
    setSlideDirection(idx > teamSlideIdx ? 1 : -1);
    setTeamSlideIdx(idx);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmailInput('');
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', subject: '', message: '' });
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased overflow-x-hidden selection:bg-[#FF4B55] selection:text-white relative">
      
      {/* ========================================================================= */}
      {/* 0. GLOBAL SCROLL PROGRESS & AMBIENT VECTOR ELEMENTS */}
      {/* ========================================================================= */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF4B55] via-[#8B5CF6] to-[#2563EB] z-[60] origin-left shadow-sm"
        style={{ scaleX }}
      />

      {/* Floating Geometric Vector Accents across full page */}
      <FloatingVectorAccents />

      {/* Ambient Background Decorative Avatars / Blurs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ y: [0, -25, 0], x: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-[20%] -left-12 w-48 h-48 rounded-full bg-gradient-to-tr from-[#FF4B55]/10 to-transparent blur-2xl"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute top-[50%] -right-16 w-64 h-64 rounded-full bg-gradient-to-bl from-[#8B5CF6]/10 to-transparent blur-3xl"
        />
        <motion.div 
          animate={{ y: [0, -20, 0], x: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
          className="absolute top-[75%] left-10 w-56 h-56 rounded-full bg-gradient-to-tr from-[#2563EB]/10 to-transparent blur-3xl"
        />
      </div>

      {/* ========================================================================= */}
      {/* 1. STICKY TOP NAVBAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF4B55] via-[#8B5CF6] to-[#2563EB] p-0.5 shadow-md shadow-[#FF4B55]/20 group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center p-1.5">
                <img src="/haka-logo.svg" alt="HAKA Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-[#FF4B55] transition-colors">
                HAKA<span className="text-[#FF4B55]">.</span>
              </span>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Contest Arena</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#hero" className="hover:text-[#FF4B55] transition-colors">Home</a>
            <a href="#features" className="hover:text-[#FF4B55] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#FF4B55] transition-colors">How It Works</a>
            <a href="#screenshots" className="hover:text-[#FF4B55] transition-colors">Screenshots</a>
            <a href="#testimonials" className="hover:text-[#FF4B55] transition-colors">Reviews</a>
            <a href="#team" className="hover:text-[#FF4B55] transition-colors">Team</a>
            <a href="#faq" className="hover:text-[#FF4B55] transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-[#FF4B55] transition-colors">Contact</a>
          </nav>

          {/* Action CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1877F2] hover:bg-[#1565d8] text-white text-xs font-bold shadow-md shadow-[#1877F2]/25 hover:shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Get App</span>
            </button>
          </div>

        </div>
      </header>


      {/* ========================================================================= */}
      {/* 2. HERO SECTION – FULL-WIDTH EDGE-TO-EDGE WITH ORGANIC BOTTOM WAVE */}
      {/* ========================================================================= */}
      <section id="hero" className="relative w-full bg-[#0E121B] text-white overflow-hidden">
        
        {/* Integrated High-Res Hero Photo on Right / Background with Professional Blend */}
        <div className="absolute top-0 right-0 w-full lg:w-[62%] h-full pointer-events-none select-none">
          <img
            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80"
            alt="Happy friends celebrating with mobile app"
            className="w-full h-full object-cover object-center lg:object-right opacity-40 lg:opacity-75 filter contrast-110"
          />
          {/* Smooth Gradient Masks to blend photo naturally with dark hero container */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E121B] via-[#0E121B]/60 to-transparent lg:hidden" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E121B] via-[#0E121B]/85 to-transparent hidden lg:block" />
          <div className="absolute inset-0 bg-[#0E121B]/20" />
        </div>

        {/* Internal Topography & Contour Lines Vector Overlay */}
        <FluidContourCurves className="text-white/10" />

        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF4B55]/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-[#1877F2]/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-[#8B5CF6]/15 rounded-full blur-[110px] pointer-events-none" />

        {/* Inner Content Container - Centered to max-w-7xl */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[560px] lg:min-h-[620px]">
            
            {/* Left Content Column */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Pill Badge with Vector Sparkle */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-white shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#FF4B55] animate-ping" />
                <span className="text-white/90">#1 Reality Contest & Speed Quiz Arena</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
                Get your next app landing page <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A5F] via-[#FF7A60] to-[#FF4B55]">ready.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 font-normal max-w-xl leading-relaxed">
                Experience high-stakes speed trivia, challenge live contestants across India, and claim guaranteed cash winnings deposited straight into your UPI account.
              </p>

              {/* Email Subscription / Signup Input Form */}
              <form onSubmit={handleSubscribe} className="pt-2 max-w-lg">
                <div className="relative flex items-center p-1.5 rounded-full bg-white shadow-2xl">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full pl-5 pr-36 py-3.5 rounded-full text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 px-7 py-3 rounded-full bg-[#FF4B55] hover:bg-[#e63e48] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {subscribed && (
                  <p className="mt-2 text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Thank you! Welcome link sent to your email.
                  </p>
                )}
              </form>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-5 pt-3 text-xs font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF4B55]" />
                  <span>Free Download</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant UPI Withdrawal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                  <span>100 Free Bonus Coins</span>
                </div>
              </div>

            </motion.div>

            {/* Right Column: Hero Smartphone Showcase + Floating Widgets */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:col-span-5 relative flex items-center justify-center lg:justify-end pr-0 lg:pr-4"
            >
              {/* Main Smartphone Mockup (Larger, more prominent) */}
              <div className="relative w-[260px] sm:w-[290px] z-20 hover:scale-105 transition-transform duration-300 drop-shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
                <PhoneMockup src={fristScreen} alt="HAKA Mobile Onboarding Screen" priority={true} />
              </div>

              {/* Floating Dark Play / Media Widget (Left of Phone, matching reference design) */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="absolute top-1/4 -left-3 sm:left-4 lg:-left-6 z-30 p-3.5 rounded-full bg-slate-900/90 text-white shadow-2xl border border-white/20 backdrop-blur-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
              >
                <Play className="w-5 h-5 text-[#FF4B55] fill-[#FF4B55]" />
              </motion.div>

              {/* Floating Live Winner Notification Pill with Avatar */}
              <FloatingAvatarBadge
                image="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
                name="Rahul K."
                action="Won"
                amount="₹5,000"
                badgeText="Daily Arena"
                badgeColor="bg-emerald-500"
                className="-bottom-4 -left-2 sm:left-6 z-30"
                delay={0.4}
                duration={4.2}
              />

              {/* Floating Colorful Dots / Bubbles (Matching reference design) */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1], y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -top-4 right-10 w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF4B55] to-[#FF8566] shadow-lg shadow-[#FF4B55]/50 z-30"
              />
              <motion.div 
                animate={{ scale: [1, 1.25, 1], y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, delay: 0.5, ease: "easeInOut" }}
                className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-gradient-to-tr from-[#10B981] to-[#34D399] shadow-lg shadow-emerald-500/50 z-30"
              />
              <motion.div 
                animate={{ scale: [1, 1.15, 1], y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 5, delay: 1, ease: "easeInOut" }}
                className="absolute bottom-16 -left-2 w-5 h-5 rounded-full bg-gradient-to-tr from-[#1877F2] to-[#60A5FA] shadow-lg shadow-blue-500/50 z-30"
              />

            </motion.div>

          </div>
        </div>

        {/* Full-Width Organic Bottom Wave Curve of the Hero (Flowing 100% edge-to-edge into Features) */}
        <div className="w-full overflow-hidden leading-none pointer-events-none select-none relative -mb-1">
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="w-full h-10 sm:h-16 lg:h-20 block">
            <path 
              d="M0,0 C320,65 680,85 1040,30 C1200,5 1340,35 1440,60 L1440,80 L0,80 Z" 
              fill="#F8FAFC" 
            />
          </svg>
        </div>

      </section>


      {/* ========================================================================= */}
      {/* 3. FEATURES SECTION (WHY CHOOSE US / 4 FLOATING CARDS + CURVE VECTOR) */}
      {/* ========================================================================= */}
      <section id="features" className="w-full relative overflow-hidden bg-[#F8FAFC]">
        
        {/* Curving Dashed Vector Line Flowing Across Section */}
        <CurvingDashedJourney className="-top-10 left-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 space-y-6 text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              We have very easy and simple features for you
            </h2>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Designed for speed, clarity, and pure competitive thrill. Every contest is audited with cryptographic fairness, millisecond latency timers, and direct bank payouts.
            </p>

            <ul className="space-y-3 pt-2 text-sm text-slate-600 font-medium">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Zero latency rapid-fire question engine</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Transparent national prize pool distribution</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Instant 1-click payouts directly to UPI</span>
              </li>
            </ul>

            <div className="pt-4">
              <a
                href="#screenshots"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#8B5CF6] hover:bg-[#7c4deb] text-white text-xs font-bold shadow-lg shadow-[#8B5CF6]/30 transition-all hover:scale-105 active:scale-95"
              >
                <span>Discover More</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Right 2x2 Feature Cards Grid + Background Avatar Accent */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            
            {/* Card 1: Red Icon (Speed / Quizzes) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-7 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 relative overflow-hidden group"
            >
              {/* Subtle top-right curve vector highlight */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#FF4B55]/10 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="w-14 h-14 rounded-2xl bg-[#FF4B55]/10 text-[#FF4B55] flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform">
                <Flame className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Speed Battles</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Answer trivia within milliseconds. Earn exponential streak multipliers and outpace thousands of live rivals.
              </p>
            </motion.div>

            {/* Card 2: Blue Icon (Live Leaderboards) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-7 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#2563EB]/10 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform">
                <BarChart2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Live Leaderboards</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Real-time national podium standings. Watch rank shifts and point margins update with zero screen refresh.
              </p>
            </motion.div>

            {/* Card 3: Green Icon (Instant Withdrawals) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-7 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform">
                <Wallet className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Instant UPI Payouts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cash rewards land directly in PhonePe, Google Pay, or Paytm within 3 seconds of contest finish.
              </p>
            </motion.div>

            {/* Card 4: Purple Icon (Fair Play) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-7 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#8B5CF6]/10 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">100% Fair Play</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cryptographically randomized questions, anti-cheat detection, and zero tolerance for bots.
              </p>
            </motion.div>

            {/* Stylized Standing Character Avatar (Matching reference image's avatar peeking on the right!) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              animate={{ y: [0, -12, 0] }}
              transition={{ 
                y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
                opacity: { duration: 0.6 }
              }}
              className="hidden xl:flex absolute -right-6 bottom-0 z-20 flex-col items-center select-none"
            >
              <div className="relative p-2.5 bg-gradient-to-tr from-[#8B5CF6] via-[#FF4B55] to-[#2563EB] rounded-3xl shadow-2xl">
                <div className="w-28 h-36 rounded-2xl bg-white p-2 flex flex-col items-center justify-between text-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=260&q=80"
                    alt="Top Contestant Avatar"
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-[#8B5CF6] shadow-md mt-1"
                  />
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-100 text-[#8B5CF6]">
                      Top Rated
                    </span>
                    <p className="text-[10px] font-extrabold text-slate-900 mt-0.5">Meera S.</p>
                    <p className="text-[8px] text-emerald-600 font-black">₹45,000 Won</p>
                  </div>
                </div>
                {/* Floating Trophy Pill */}
                <div className="absolute -top-3 -right-2 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shadow-lg flex items-center gap-1">
                  <Trophy className="w-3 h-3 fill-slate-950" />
                  <span>#1</span>
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>


      {/* ========================================================================= */}
      {/* 4. APP SHOWCASE & HOW IT WORKS (ORGANIC BLUE FLUID WAVE BACKDROP ON LEFT) */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="w-full relative overflow-hidden bg-white">
        
        {/* Asymmetrical Organic Fluid Blue Wave Backdrop (Touching left screen edge) */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[90%] sm:w-[75%] lg:w-[50%] xl:w-[48%] h-[560px] lg:h-[660px] pointer-events-none z-0">
          <svg 
            viewBox="0 0 600 600" 
            fill="none" 
            preserveAspectRatio="none"
            className="w-full h-full drop-shadow-[0_20px_50px_rgba(24,119,242,0.25)]"
          >
            <defs>
              <linearGradient id="fluidWaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="40%" stopColor="#1877F2" />
                <stop offset="100%" stopColor="#0B4FD8" />
              </linearGradient>
              <linearGradient id="fluidWaveGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#1877F2" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            
            {/* Soft Outer Wave Layer (Touching left edge with zero gap) */}
            <path 
              d="M0,20 C180,-10 330,90 440,220 C540,340 500,480 380,550 C250,600 120,590 0,590 Z" 
              fill="url(#fluidWaveGlow)" 
            />

            {/* Main Fluid Wave Shape (Touching left edge with zero gap) */}
            <path 
              d="M0,40 C160,10 300,120 400,240 C490,350 450,470 340,540 C220,580 90,570 0,570 Z" 
              fill="url(#fluidWaveGradient)" 
            />

            {/* Internal Decorative Wave Curves */}
            <path 
              d="M0,130 C130,190 230,110 330,220 C390,290 370,390 290,450" 
              stroke="white" 
              strokeWidth="2" 
              strokeDasharray="6 6" 
              opacity="0.35" 
            />
            <path 
              d="M0,250 C110,310 210,230 310,330" 
              stroke="white" 
              strokeWidth="1.5" 
              opacity="0.25" 
            />
          </svg>

          {/* Ambient Radial Soft Glow */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/20 blur-3xl pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Smartphone Mockup with home.jpeg Screen */}
            <div className="lg:col-span-5 flex justify-center relative">
              
              {/* Ambient Floating Avatar Badge */}
              <FloatingAvatarBadge
                image="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
                name="Divya P."
                action="Climbed to"
                amount="Podium #2"
                badgeText="Live"
                badgeColor="bg-emerald-500"
                className="-top-4 -left-4 sm:left-4 z-30"
                delay={0.3}
                duration={5.2}
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                whileInView={{ opacity: 1, scale: 1, rotate: -1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="w-[270px] sm:w-[310px] transform hover:rotate-0 transition-transform duration-500 shadow-2xl relative z-10"
              >
                <PhoneMockup src={homeScreen} alt="HAKA Live Contest Arena Home Screen" />
              </motion.div>
            </div>

            {/* Right: Steps & Workflow Highlights */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-7 space-y-8 text-left pl-0 lg:pl-6"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold mb-3 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>How It Works</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                  Easy to use & intuitive UI designed for seamless play
                </h2>
                <p className="mt-3 text-slate-500 text-sm sm:text-base leading-relaxed">
                  Join millions of reality contest players in three simple steps. Download, compete, and withdraw real cash effortlessly.
                </p>
              </div>

              {/* 3 Step Cards with Vertical Timeline Track */}
              <div className="relative space-y-4 pl-2 sm:pl-4">
                
                {/* Vertical Connecting Track */}
                <div className="absolute top-8 bottom-8 left-[34px] sm:left-[42px] w-0.5 border-l-2 border-dashed border-slate-200 pointer-events-none z-0" />

                {/* Step 1 */}
                <motion.div 
                  whileHover={{ x: 6 }}
                  className="relative z-10 flex items-start gap-4 p-5 rounded-2xl bg-white shadow-md shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-[#1877F2]/30 ring-4 ring-blue-50">
                    01
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">Download & Instant OTP Login</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Install the HAKA mobile app and verify your phone number via instant OTP. Receive 100 Free Bonus Coins instantly on signup.
                    </p>
                  </div>
                </motion.div>

                {/* Step 2 */}
                <motion.div 
                  whileHover={{ x: 6 }}
                  className="relative z-10 flex items-start gap-4 p-5 rounded-2xl bg-white shadow-md shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:border-purple-100 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-[#8B5CF6]/30 ring-4 ring-purple-50">
                    02
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">Pick Your Arena & Compete</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Choose between Daily Speed Quizzes, Mega Grand Tournaments, or private friend rooms. Answer rapid-fire questions within the timer.
                    </p>
                  </div>
                </motion.div>

                {/* Step 3 */}
                <motion.div 
                  whileHover={{ x: 6 }}
                  className="relative z-10 flex items-start gap-4 p-5 rounded-2xl bg-white shadow-md shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:border-red-100 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FF4B55] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-[#FF4B55]/30 ring-4 ring-red-50">
                    03
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">Podium Victory & Instant Cashout</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Climb the national leaderboard, take home cash winnings, and transfer funds directly to Google Pay, PhonePe, or Paytm with 1 click.
                    </p>
                  </div>
                </motion.div>

              </div>

            </motion.div>

          </div>
        </div>

      </section>


      {/* ========================================================================= */}
      {/* 5. SPLIT FEATURE 1 – REAL-TIME ANALYTICS + ASYMMETRIC BLOB ACCENT */}
      {/* ========================================================================= */}
      <section id="analytics" className="w-full relative overflow-hidden bg-[#F8FAFC]">
        
        {/* Soft Organic Curved Background Blob Vector */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#FF4B55]/10 via-[#FF8566]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Interactive Analytics Dashboard Mockup Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
              
              {/* Subtle top background wave curve */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full pointer-events-none opacity-60" />

              <div className="flex items-center justify-between pb-6 border-b border-slate-100 relative z-10">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Performance Metrics</p>
                  <h4 className="text-xl font-black text-slate-900 mt-1">Speed Accuracy Ratio</h4>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 flex items-center gap-1 shadow-sm">
                  <TrendingUp className="w-3.5 h-3.5" /> +28.4%
                </span>
              </div>

              {/* Simulated Chart Graphic */}
              <div className="py-6 space-y-4 relative z-10">
                <div className="h-40 w-full relative flex items-end justify-between gap-2 px-2">
                  <div className="w-1/7 bg-slate-100 rounded-t-lg h-[40%]" />
                  <div className="w-1/7 bg-slate-100 rounded-t-lg h-[55%]" />
                  <div className="w-1/7 bg-slate-100 rounded-t-lg h-[45%]" />
                  <div className="w-1/7 bg-slate-200 rounded-t-lg h-[70%]" />
                  <div className="w-1/7 bg-[#FF4B55]/60 rounded-t-lg h-[65%]" />
                  <div className="w-1/7 bg-[#FF4B55]/80 rounded-t-lg h-[85%]" />
                  <div className="w-1/7 bg-[#FF4B55] rounded-t-lg h-[100%] shadow-lg shadow-[#FF4B55]/30" />
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-400 px-1">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span>
                </div>
              </div>

              {/* Mini Stat Pills */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center relative z-10">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Speed</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">1.24s</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">96.8%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Rank Score</p>
                  <p className="text-sm font-black text-[#FF4B55] mt-0.5">48,250</p>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Right: Text & Action */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Track your performance with real-time analytics
            </h2>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Gain millisecond insights into your quiz reaction speeds, category competencies, and streak bonuses. Identify your strongest trivia domains and optimize your strategy to secure podium gold.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setShowQrModal(true)}
                className="px-7 py-3 rounded-full bg-[#FF4B55] hover:bg-[#e63e48] text-white text-xs font-bold shadow-lg shadow-[#FF4B55]/30 transition-all hover:scale-105 active:scale-95"
              >
                Explore Analytics
              </button>
            </div>
          </motion.div>

          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 6. SPLIT FEATURE 2 – COMMUNITY & NETWORK CONSTELLATION VECTOR */}
      {/* ========================================================================= */}
      <section id="community" className="w-full relative overflow-hidden bg-white">
        
        {/* Soft Violet Curve Blob */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-gradient-to-bl from-[#8B5CF6]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Text & Action */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-6 text-left order-2 lg:order-1"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Connect & compete with thousands of active players
            </h2>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Enter a thriving nationwide ecosystem of trivia competitors. Join official community challenges, engage with fellow contestants, and rise from novice to grand master.
            </p>

            {/* Stacked Community Avatars Indicator */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
                  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80"
                ].map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Player Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md hover:scale-110 transition-transform"
                  />
                ))}
                <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white text-xs font-black flex items-center justify-center border-2 border-white shadow-md">
                  +10k
                </div>
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-slate-900">Active Gladiators</p>
                <p className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Now
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowQrModal(true)}
                className="px-7 py-3 rounded-full bg-[#1877F2] hover:bg-[#1565d8] text-white text-xs font-bold shadow-lg shadow-[#1877F2]/30 transition-all hover:scale-105 active:scale-95"
              >
                Join The Arena
              </button>
            </div>
          </motion.div>

          {/* Right: Visual Card with Player Photo & Badges */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 relative order-1 lg:order-2 flex justify-center"
          >
            <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
                alt="Active Contestants Community"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                <span className="px-3 py-1 rounded-full bg-[#8B5CF6] text-xs font-bold">100,000+ Active Players</span>
                <h4 className="text-xl font-bold mt-2">Daily Live Showdowns</h4>
                <p className="text-xs text-slate-300 mt-1">Every hour on the hour • Guaranteed Cash Pool</p>
              </div>
            </div>
          </motion.div>

          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 7. APP DOWNLOAD & MILESTONES (WITH RICH BOTANICAL PALM LEAF VECTOR) */}
      {/* ========================================================================= */}
      <section id="download" className="w-full relative overflow-hidden bg-gradient-to-b from-[#F0F4FF] via-[#F8FAFC] to-white">
        
        {/* Layered Botanical Palm Leaf Vector in Bottom-Left Corner */}
        <div className="absolute -bottom-6 -left-6 w-64 h-64 pointer-events-none select-none z-10">
          <PalmLeafVector className="w-full h-full" />
        </div>

        {/* Organic Curved Wave Watermark in Background */}
        <svg viewBox="0 0 1200 400" fill="none" className="absolute -top-10 right-0 w-full h-full opacity-30 pointer-events-none select-none">
          <path d="M400,0 C600,120 800,20 1200,80 L1200,400 L400,400 Z" fill="#E2E8F0" opacity="0.4" />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Download Pitch & Store Badges */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-6 text-left pl-0 sm:pl-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1877F2]/10 text-[#1877F2] text-xs font-bold">
              <Download className="w-3.5 h-3.5" />
              <span>Mobile App Available Now</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
              Experience the ultimate contest app right on your phone
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Download the official HAKA app today on Android and iOS. Start with 100 Free Bonus Coins and compete for real cash prizes on a 100% skill-based arena.
            </p>

            {/* Official Store Buttons in Black Pill Style */}
            <div className="flex flex-wrap gap-4 pt-2">
              
              {/* Google Play Button */}
              <button
                onClick={() => alert('Starting Google Play download for HAKA Contest App...')}
                className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <GooglePlayIcon className="w-7 h-7 text-white" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Get it on</p>
                  <p className="text-sm font-extrabold text-white leading-tight">Google Play</p>
                </div>
              </button>

              {/* Apple App Store Button */}
              <button
                onClick={() => alert('Starting Apple App Store download for HAKA Contest App...')}
                className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <AppleIcon className="w-7 h-7 text-white" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Download on the</p>
                  <p className="text-sm font-extrabold text-white leading-tight">App Store</p>
                </div>
              </button>

            </div>

          </motion.div>

          {/* Right: 4 Metric Cards with Staggered Scroll Animation */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-5">
            
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 border border-slate-100 text-left relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center mb-4">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">10M+</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">App Downloads</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 border border-slate-100 text-left relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 fill-emerald-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">4.9 ★</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Store Rating (85k+)</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 border border-slate-100 text-left relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FF4B55]/10 text-[#FF4B55] flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">₹50L+</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Cash Prizes Paid</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 border border-slate-100 text-left relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">99.9%</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Instant Payout Success</p>
            </motion.div>

          </div>

        </div>
      </div>
    </section>


      {/* ========================================================================= */}
      {/* 8. WORLD MAP & USER TESTIMONIAL SECTION + PULSING AVATAR NODES */}
      {/* ========================================================================= */}
      <section id="testimonials" className="w-full relative overflow-hidden bg-white">
        
        {/* Curving Wave Divider Line in Background */}
        <svg viewBox="0 0 1000 200" fill="none" preserveAspectRatio="none" className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-full opacity-20 pointer-events-none select-none">
          <path d="M0,100 C300,180 700,20 1000,100" stroke="#2563EB" strokeWidth="2" strokeDasharray="5 5" />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Dotted Map with Active Winner Pins */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl bg-slate-100/60 p-6 flex items-center justify-center border border-slate-200/60 overflow-hidden">
              
              {/* Stylized world dot matrix */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1877F2_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

              {/* Floating avatar pins with pulse effect */}
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute top-1/4 left-1/4 transform -translate-x-1/2 p-1 bg-white rounded-full shadow-lg border-2 border-[#FF4B55]"
              >
                <img src={TESTIMONIALS[0].avatar} alt="Winner Pin" className="w-8 h-8 rounded-full object-cover" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              </motion.div>

              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
                className="absolute top-1/2 right-1/4 transform translate-x-1/2 p-1 bg-white rounded-full shadow-lg border-2 border-[#2563EB]"
              >
                <img src={TESTIMONIALS[1].avatar} alt="Winner Pin" className="w-8 h-8 rounded-full object-cover" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              </motion.div>

              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 4, delay: 1 }}
                className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 p-1 bg-white rounded-full shadow-lg border-2 border-emerald-500"
              >
                <img src={TESTIMONIALS[2].avatar} alt="Winner Pin" className="w-8 h-8 rounded-full object-cover" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              </motion.div>

              <div className="text-center z-10 bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-slate-100">
                <p className="text-2xl font-black text-slate-900">100,000+</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Winners Across India</p>
              </div>

            </div>
          </motion.div>

          {/* Right: Testimonial Quote Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* Red quote badge */}
            <div className="w-12 h-12 rounded-2xl bg-[#FF4B55] text-white flex items-center justify-center shadow-lg shadow-[#FF4B55]/30">
              <MessageSquare className="w-6 h-6" />
            </div>

            <p className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed italic">
              "{TESTIMONIALS[testimonialIdx].quote}"
            </p>

            <div className="flex items-center gap-4 pt-2">
              <img
                src={TESTIMONIALS[testimonialIdx].avatar}
                alt={TESTIMONIALS[testimonialIdx].name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#FF4B55] shadow-md"
              />
              <div>
                <h4 className="text-base font-extrabold text-slate-900">{TESTIMONIALS[testimonialIdx].name}</h4>
                <p className="text-xs font-semibold text-slate-400">{TESTIMONIALS[testimonialIdx].role} • {TESTIMONIALS[testimonialIdx].location}</p>
                <div className="flex items-center gap-1 mt-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonial Nav Arrows */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setTestimonialIdx((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-[#FF4B55] hover:border-[#FF4B55] flex items-center justify-center shadow-sm transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTestimonialIdx((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1))}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-[#FF4B55] hover:border-[#FF4B55] flex items-center justify-center shadow-sm transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="text-xs font-semibold text-slate-400 ml-2">
                {testimonialIdx + 1} of {TESTIMONIALS.length}
              </span>
            </div>

          </motion.div>

          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 9. MOBILE APP SCREENSHOTS GALLERY (WITH PERSPECTIVE WAVE BASE) */}
      {/* ========================================================================= */}
      <section id="screenshots" className="w-full relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white text-center">
        
        {/* Curving Backdrop Vector Waves Underneath Phones */}
        <svg viewBox="0 0 1440 320" fill="none" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-44 sm:h-56 opacity-40 pointer-events-none select-none">
          <path d="M0,192 C480,288 960,96 1440,192 L1440,320 L0,320 Z" fill="#E2E8F0" />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 space-y-12 relative z-10">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App Interface</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explore The App Interface
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Designed with millisecond response timers, high contrast color coding, and crystal-clear leaderboard visibility.
            </p>
          </motion.div>

          {/* Interactive Screen Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {SCREENSHOTS_DATA.map((screen, idx) => (
              <button
                key={screen.id}
                onClick={() => setActiveScreenshotIdx(idx)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                  activeScreenshotIdx === idx
                    ? 'bg-[#1877F2] text-white shadow-md shadow-[#1877F2]/30 scale-105'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-[#1877F2]'
                }`}
              >
                {screen.tag}
              </button>
            ))}
          </div>

          {/* Gallery Showcase of All 4 Screenshots in Phone Mockups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-6">
            {SCREENSHOTS_DATA.map((screen, idx) => {
              const isActive = activeScreenshotIdx === idx;
              return (
                <motion.div
                  key={screen.id}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  onClick={() => setActiveScreenshotIdx(idx)}
                  className={`group relative cursor-pointer rounded-3xl p-4 transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-50/70 border-2 border-[#1877F2] shadow-2xl -translate-y-2' 
                      : 'bg-white border border-slate-100 shadow-md hover:-translate-y-1'
                  }`}
                >
                  {/* Phone frame */}
                  <div className="w-[210px] sm:w-[230px] mx-auto">
                    <PhoneMockup src={screen.src} alt={screen.title} />
                  </div>

                  {/* Caption & Info */}
                  <div className="mt-5 text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#1877F2]">
                      {screen.category}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900">{screen.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 px-2">{screen.description}</p>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPreviewImage(screen.src);
                      }}
                      className="mt-2 text-[11px] font-bold text-[#FF4B55] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Expand Screen</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 10. INTEGRATIONS & PARTNERS CLOUD (ORGANIC BEZIER CONTAINER) */}
      {/* ========================================================================= */}
      <section id="integrations" className="w-full relative overflow-hidden bg-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-[40px] sm:rounded-[48px] bg-gradient-to-b from-blue-50/70 via-purple-50/40 to-white border border-blue-100/70 p-10 sm:p-16 overflow-hidden shadow-xl"
          >
            {/* Subtle Concentric Rings Vector Behind Partners */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-blue-200/40 rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-dashed border-purple-200/50 rounded-full pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#1877F2] shadow-md mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                Seamless Integrations & 100% Secure Payments
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Fully compliant and integrated with Indian NPCI UPI standards, supporting all popular payment apps and bank networks.
              </p>

              {/* Floating Brand & Payment Partner Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-6">
                {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Visa', 'Mastercard', 'RuPay', 'AWS Cloud', '256-Bit SSL'].map((partner) => (
                  <motion.div
                    key={partner}
                    whileHover={{ scale: 1.08 }}
                    className="px-4 py-2.5 rounded-2xl bg-white shadow-md border border-slate-100 text-xs font-bold text-slate-800 flex items-center gap-2 transition-transform select-none"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{partner}</span>
                  </motion.div>
                ))}
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-8 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  Start Playing Today
                </button>
              </div>

            </div>

          </motion.div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 11. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      {/* ========================================================================= */}
      <section id="faq" className="w-full relative overflow-hidden bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10 text-center space-y-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-[#FF4B55]" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm">
              Everything you need to know about playing, scoring, and withdrawing on HAKA.
            </p>
          </motion.div>

          {/* Accordion List */}
          <div className="space-y-4 text-left">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-[#1877F2] transition-colors"
                  >
                    <span className="text-sm sm:text-base">{faq.q}</span>
                    <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-[#1877F2] text-white' : 'text-slate-600'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 12. TEAM MEMBERS SECTION (PREMIUM INTERACTIVE SPOTLIGHT SHOWCASE) */}
      {/* ========================================================================= */}
      <section id="team" className="w-full relative overflow-hidden bg-gradient-to-b from-[#FAF5FF]/50 via-[#F8FAFC] to-white text-center">
        
        {/* Ambient Mesh Glow Orbs in Background */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-tr from-[#8B5CF6]/15 via-[#FF4B55]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-bl from-[#1877F2]/15 via-[#8B5CF6]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Curving Trajectory Vectors Flowing Across Team Section */}
        <CurvingDashedJourney className="-top-8 left-0 opacity-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 space-y-14 relative z-10">
          
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-4"
          >
            {/* Glowing Glass Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-purple-200/70 shadow-sm shadow-purple-500/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4B55] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4B55]"></span>
              </span>
              <Users className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span className="text-[11px] font-black uppercase tracking-widest bg-gradient-to-r from-[#8B5CF6] via-[#FF4B55] to-[#1877F2] bg-clip-text text-transparent">
                Leadership
              </span>
            </div>

            {/* Gradient Multi-tone Title with Decorative Wave Accent */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Meet Our{' '}
              <span className="relative inline-block whitespace-nowrap">
                <span className="bg-gradient-to-r from-[#FF4B55] via-[#8B5CF6] to-[#1877F2] bg-clip-text text-transparent">
                  Expert Team
                </span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#FF4B55]/40 -z-10" viewBox="0 0 120 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 9C38 2 82 2 118 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h2>

            {/* Elegant Subtitle with generous line-height */}
            <p className="text-slate-500 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
              The visionaries, technologists, and game designers pioneering India's premier reality gaming tournament platform.
            </p>
          </motion.div>

          {/* Interactive Perspective Slider Showcase */}
          <div 
            className="relative max-w-5xl mx-auto flex items-center justify-center px-4 sm:px-14 py-4 select-none touch-pan-y"
            onMouseEnter={() => setIsTeamHovered(true)}
            onMouseLeave={() => setIsTeamHovered(false)}
            onTouchStart={(e) => {
              touchStartXRef.current = e.touches[0].clientX;
              touchStartYRef.current = e.touches[0].clientY;
            }}
            onTouchEnd={(e) => {
              const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
              const diffY = touchStartYRef.current - e.changedTouches[0].clientY;
              if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) handleNextTeam();
                else handlePrevTeam();
              }
            }}
          >
            {/* Left Carousel Arrow Button (Safely inside container padding) */}
            <button
              onClick={handlePrevTeam}
              aria-label="Previous Team Member"
              className="absolute left-1 sm:left-2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl shadow-slate-300/60 flex items-center justify-center text-slate-700 hover:text-[#FF4B55] hover:border-[#FF4B55] hover:scale-110 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Slider Viewport with Fixed Height to Prevent ANY Vertical Page Jump */}
            <div className="w-full overflow-hidden relative min-h-[380px] sm:min-h-[420px] flex items-center justify-center">
              <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                <motion.div 
                  key={teamSlideIdx}
                  custom={slideDirection}
                  variants={{
                    enter: (dir) => ({
                      x: dir > 0 ? 320 : -320,
                      opacity: 0,
                    }),
                    center: {
                      x: 0,
                      opacity: 1,
                      transition: {
                        x: { type: "spring", stiffness: 280, damping: 28 },
                        opacity: { duration: 0.28 }
                      }
                    },
                    exit: (dir) => ({
                      x: dir > 0 ? -320 : 320,
                      opacity: 0,
                      transition: {
                        x: { type: "spring", stiffness: 280, damping: 28 },
                        opacity: { duration: 0.28 }
                      }
                    })
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full items-center"
                >
                  {[-1, 0, 1].map((offset) => {
                    const memberIdx = (teamSlideIdx + offset + TEAM_MEMBERS.length) % TEAM_MEMBERS.length;
                    const member = TEAM_MEMBERS[memberIdx];
                    const isCenter = offset === 0;

                    return (
                      <div
                        key={member.id}
                        onClick={() => {
                          if (offset === -1) handlePrevTeam();
                          if (offset === 1) handleNextTeam();
                        }}
                        className={`group relative rounded-[32px] transition-all duration-500 flex flex-col items-center text-center select-none ${
                          isCenter 
                            ? 'z-20 cursor-default bg-white p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(139,92,246,0.22)] border-2 border-purple-200/90 ring-4 ring-purple-100/50 scale-100 sm:scale-105 opacity-100' 
                            : 'hidden md:flex z-10 cursor-pointer bg-white/70 backdrop-blur-md p-6 sm:p-7 shadow-md border border-slate-200/70 hover:bg-white hover:border-slate-300 scale-95 opacity-60 hover:opacity-90'
                        }`}
                      >
                        {/* Subtle corner decorative gradient on center card */}
                        {isCenter && (
                          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-purple-500/10 via-rose-500/5 to-transparent rounded-bl-[80px] pointer-events-none" />
                        )}

                        {/* Portrait Frame with double colored ring and floating badge */}
                        <div className="relative mb-4 flex items-center justify-center">
                          <div className={`relative ${isCenter ? 'w-36 h-36 sm:w-44 sm:h-44' : 'w-28 h-28 sm:w-32 sm:h-32'} rounded-full p-2 border-[3.5px] ${member.ringColor} bg-white shadow-xl ${member.glowColor} group-hover:scale-105 transition-all duration-300 overflow-hidden`}>
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-500 pointer-events-none"
                            />
                          </div>

                          {/* Floating Badge below circle */}
                          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-20">
                            {isCenter ? (
                              <span className="px-4 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-[#FF4B55] to-[#8B5CF6] text-white shadow-md shadow-[#FF4B55]/30 tracking-wider uppercase whitespace-nowrap">
                                {member.badge}
                              </span>
                            ) : (
                              <span className="px-3 py-0.5 rounded-full text-[9px] font-black bg-white text-slate-700 border border-slate-200 shadow-sm uppercase whitespace-nowrap">
                                {member.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Typography: Department Tag, Name, Role */}
                        <div className="mt-3 text-center w-full max-w-xs flex flex-col items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] bg-purple-50 px-2.5 py-0.5 rounded-full">
                            {member.tag}
                          </span>
                          <h4 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#FF4B55] transition-colors mt-2">
                            {member.name}
                          </h4>
                          <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Carousel Arrow Button (Safely inside container padding) */}
            <button
              onClick={handleNextTeam}
              aria-label="Next Team Member"
              className="absolute right-1 sm:right-2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl shadow-slate-300/60 flex items-center justify-center text-slate-700 hover:text-[#FF4B55] hover:border-[#FF4B55] hover:scale-110 active:scale-95 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Slider Status & Dot Indicators */}
          <div className="flex flex-col items-center gap-3 pt-4">
            <div className="flex items-center justify-center gap-2">
              {TEAM_MEMBERS.map((m, dotIdx) => (
                <button
                  key={m.id}
                  onClick={() => handleDotClick(dotIdx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    teamSlideIdx === dotIdx 
                      ? 'w-9 bg-gradient-to-r from-[#FF4B55] to-[#8B5CF6] shadow-md shadow-[#FF4B55]/30' 
                      : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Go to slide ${dotIdx + 1}: ${m.name}`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/50">
              Leader {teamSlideIdx + 1} of {TEAM_MEMBERS.length} • Swipe or click arrows
            </span>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 13. CONTACT FORM & SUPPORT CARD (WITH CONTOUR CURVE OVERLAY) */}
      {/* ========================================================================= */}
      <section id="contact" className="w-full relative overflow-hidden bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch"
          >
          {/* Left: Organic Contact Info Card */}
          <div className="lg:col-span-5 rounded-[40px] bg-gradient-to-br from-[#1E232F] to-[#12151D] text-white p-8 sm:p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            {/* Internal Topography & Contour Lines Vector Overlay */}
            <FluidContourCurves className="text-white/10" />

            <div className="space-y-6 relative z-10">
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white">Contact Us</span>
              <h3 className="text-3xl font-extrabold text-white leading-tight">
                Have a question? We're here to help 24/7.
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Whether you need help with withdrawals, contest inquiries, or enterprise partnerships, our dedicated support crew responds in minutes.
              </p>

              <div className="space-y-4 pt-4 text-xs font-medium text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#FF4B55]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Support Email</p>
                    <p className="text-white font-bold">support@hakacontest.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Helpline</p>
                    <p className="text-white font-bold">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#1877F2]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Headquarters</p>
                    <p className="text-white font-bold">Infopark, Kochi, Kerala, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 text-xs text-slate-400 relative z-10">
              ⚡ 99.8% customer support resolution rate within 15 minutes.
            </div>
          </div>

          {/* Right: Clean Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-[40px] p-8 sm:p-12 shadow-xl border border-slate-100 flex flex-col justify-center relative overflow-hidden">
            
            {/* Subtle top-right decorative vector curve */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full pointer-events-none opacity-60" />

            <div className="mb-6 relative z-10">
              <h3 className="text-2xl font-black text-slate-900">Send us a message</h3>
              <p className="text-xs text-slate-500 mt-1">Fill out the quick form below and our team will get back to you.</p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Rahul Verma"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="rahul@example.com"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="Contest Inquiry / UPI Support"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Message</label>
                <textarea
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="How can we assist you today?"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#8B5CF6]/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </div>

              {contactSubmitted && (
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 pt-2">
                  <CheckCircle2 className="w-4 h-4" /> Message delivered successfully! We will get in touch shortly.
                </p>
              )}
            </form>

          </div>

          </motion.div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 14. NEWSLETTER BANNER (WITH RADIATING CONCENTRIC VECTOR RIPPLES) */}
      {/* ========================================================================= */}
      <section id="newsletter" className="w-full relative overflow-hidden bg-white text-center border-t border-slate-100">
        
        {/* Radiating Ripple Curves */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] border border-red-100/60 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] border border-dashed border-red-100/40 rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FF4B55]/10 text-[#FF4B55] mx-auto flex items-center justify-center shadow-sm">
              <Mail className="w-6 h-6" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 max-w-xl mx-auto leading-tight">
              Subscribe To Get The Latest Updates & Exclusive Contest Alerts
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Get early access to Mega Grand Arenas, exclusive bonus coin drop codes, and weekly leaderboard digests.
            </p>

            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex items-center gap-2 pt-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-5 py-3 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF4B55] shadow-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-[#FF4B55] hover:bg-[#e63e48] text-white text-xs font-bold shadow-md transition-all shrink-0 active:scale-95"
              >
                Subscribe
              </button>
            </form>

          </motion.div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 15. COMPREHENSIVE FOOTER */}
      {/* ========================================================================= */}
      <div className="relative w-full">
        <footer className="w-full bg-white border-t border-slate-100 py-16 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-left">
              
              {/* Col 1: Brand Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF4B55] via-[#8B5CF6] to-[#2563EB] p-0.5">
                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center p-1.5">
                      <img src="/haka-logo.svg" alt="HAKA Logo" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <span className="text-2xl font-black text-slate-900">HAKA<span className="text-[#FF4B55]">.</span></span>
                </div>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  India's premier skill-based reality gaming & contest platform. Compete in live trivia speed battles, earn leaderboard podium ranks, and claim instant cash rewards.
                </p>

                {/* Supported payment badges in footer */}
                <div className="pt-2 flex items-center gap-3 text-slate-400 text-xs font-bold">
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600">UPI</span>
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600">GPay</span>
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600">PhonePe</span>
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600">Paytm</span>
                </div>
              </div>

              {/* Col 2: Quick Links */}
              <div className="space-y-3">
                <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">Quick Navigation</h5>
                <ul className="space-y-2 text-xs font-medium text-slate-500">
                  <li><a href="#hero" className="hover:text-[#FF4B55] transition-colors">Home</a></li>
                  <li><a href="#features" className="hover:text-[#FF4B55] transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-[#FF4B55] transition-colors">How It Works</a></li>
                  <li><a href="#screenshots" className="hover:text-[#FF4B55] transition-colors">Screenshots</a></li>
                  <li><a href="#testimonials" className="hover:text-[#FF4B55] transition-colors">Reviews</a></li>
                </ul>
              </div>

              {/* Col 3: Compliance & Legal */}
              <div className="space-y-3">
                <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">Legal & Compliance</h5>
                <ul className="space-y-2 text-xs font-medium text-slate-500">
                  <li><button onClick={() => navigate('/terms')} className="hover:text-[#FF4B55] transition-colors">Terms of Service</button></li>
                  <li><button onClick={() => navigate('/privacy')} className="hover:text-[#FF4B55] transition-colors">Privacy Policy</button></li>
                  <li><span className="text-slate-400">Games of Skill Policy</span></li>
                  <li><span className="text-slate-400">Fair Play Certification</span></li>
                  <li><span className="text-slate-400">Responsible Gaming</span></li>
                </ul>
              </div>

              {/* Col 4: App Download Badges */}
              <div className="space-y-3">
                <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">Download App</h5>
                <p className="text-xs text-slate-400">Available on Android and iOS devices.</p>
                
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => alert('Download HAKA APK from Google Play')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-left hover:bg-slate-800 transition-colors"
                  >
                    <GooglePlayIcon className="w-5 h-5" />
                    <div>
                      <p className="text-[8px] uppercase font-bold text-slate-400 leading-none">Get it on</p>
                      <p className="text-xs font-bold leading-none">Google Play</p>
                    </div>
                  </button>

                  <button
                    onClick={() => alert('Download HAKA from Apple App Store')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-left hover:bg-slate-800 transition-colors"
                  >
                    <AppleIcon className="w-5 h-5" />
                    <div>
                      <p className="text-[8px] uppercase font-bold text-slate-400 leading-none">Download on</p>
                      <p className="text-xs font-bold leading-none">App Store</p>
                    </div>
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Copyright & Compliance Bar */}
            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400">
              <p>© 2026 HAKA Reality Contests. All rights reserved.</p>
              <p className="text-[11px] text-center sm:text-right">
                Contests are classified as Games of Skill protected under the Public Gambling Act, 1867.
              </p>
            </div>

          </div>
        </footer>
      </div>


      {/* ========================================================================= */}
      {/* 16. LIGHTBOX IMAGE PREVIEW MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedPreviewImage && (
          <div 
            onClick={() => setSelectedPreviewImage(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center cursor-pointer"
          >
            <div className="relative max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedPreviewImage(null)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <PhoneMockup src={selectedPreviewImage} alt="Expanded App Screen" priority={true} />
            </div>
          </div>
        )}
      </AnimatePresence>


      {/* ========================================================================= */}
      {/* 17. QR CODE DOWNLOAD MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showQrModal && (
          <div
            onClick={() => setShowQrModal(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] mx-auto flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900">Scan to Download HAKA</h4>
                <p className="text-xs text-slate-500 mt-1">Open camera on your phone to install directly.</p>
              </div>

              {/* QR Code Graphic Frame */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 inline-block shadow-inner">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://hakacontest.com/app&color=0f172a"
                  alt="QR Code to Download HAKA App"
                  className="w-40 h-40 mx-auto rounded-lg"
                />
              </div>

              <div className="flex gap-2 justify-center pt-1">
                <button
                  onClick={() => alert('Starting direct Android APK download...')}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Download APK
                </button>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AppLandingPage;
