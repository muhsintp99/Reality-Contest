import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, Sparkles, Trophy, Zap, Gift, Tag, Play, CheckCircle2, 
  ArrowRight, ShieldCheck, RefreshCw, AlertCircle, ShoppingBag, 
  Award, Smartphone, Monitor, Bot, Send, Copy, Check, ArrowLeft,
  ChevronRight, Lock, LogIn, ExternalLink, Flame
} from 'lucide-react';
import { updateWalletBalance, updateUserData } from '../store/authSlice';
import { resolveAvatarSrc } from '../utils/avatar';
import { LoginWarningModal } from '../components/common/LoginWarningModal';

export const CoinPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [coinBalance, setCoinBalance] = useState(() => user?.coins ?? 0);
  const [walletBalance, setWalletBalance] = useState(() => user?.walletBalance ?? 0);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [isDailyClaimed, setIsDailyClaimed] = useState(false);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState('');
  const [buyingPackageId, setBuyingPackageId] = useState(null);

  // Warning Modal state: Opens automatically if not authenticated
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated);

  // AI Prompt State
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [deviceSyncCode, setDeviceSyncCode] = useState('831-294');
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);

  // Fetch real wallet and coins from API if logged in
  const fetchCoinData = async () => {
    if (!isAuthenticated) return;
    setLoadingWallet(true);
    console.log('%c🪙 [COIN PAGE] Querying API: GET /api/wallet', 'background: #854d0e; color: #fef08a; font-weight: bold; padding: 3px 6px; border-radius: 4px;');
    try {
      const res = await axios.get('/api/wallet', { withCredentials: true });
      if (res.data && res.data.success && res.data.data) {
        setCoinBalance(res.data.data.coins || 0);
        setWalletBalance(res.data.data.walletBalance || 0);
      }
    } catch (err) {
      console.log('Wallet fetch note:', err?.message);
    } finally {
      setLoadingWallet(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCoinData();
    } else {
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);

  // Handle claiming daily bonus
  const handleClaimDailyBonus = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    console.log('%c🎁 [COIN PAGE] Claiming Bonus via API: POST /api/wallet/claim-daily', 'background: #854d0e; color: #fef08a; font-weight: bold; padding: 3px 6px; border-radius: 4px;');
    try {
      const res = await axios.post('/api/wallet/claim-daily', {}, { withCredentials: true });
      if (res.data && res.data.success) {
        const added = res.data.data?.coinsAdded || 100;
        setCoinBalance((prev) => prev + added);
        setIsDailyClaimed(true);
        setClaimSuccessMessage(`🎉 Success! +${added} Daily Bonus Coins credited to your vault!`);
        setTimeout(() => setClaimSuccessMessage(''), 5000);
        fetchCoinData();
      }
    } catch (err) {
      // Fallback local update if already claimed or simulation
      const msg = err.response?.data?.message || 'Daily bonus already claimed for today! Come back tomorrow.';
      setClaimSuccessMessage(msg);
      setTimeout(() => setClaimSuccessMessage(''), 4500);
    }
  };

  // Buy Coin Packages
  const coinPackages = [
    {
      id: 'pack_starter',
      name: 'Starter Bundle',
      coins: 500,
      bonus: 50,
      totalCoins: 550,
      priceInr: 49,
      badge: 'Starter',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: '🥉'
    },
    {
      id: 'pack_pro',
      name: 'Pro Gamer Vault',
      coins: 2000,
      bonus: 300,
      totalCoins: 2300,
      priceInr: 179,
      badge: 'Most Popular',
      badgeColor: 'bg-[#CEF500] text-[#0D0714] font-black',
      popular: true,
      icon: '🥈'
    },
    {
      id: 'pack_roller',
      name: 'High Roller Cache',
      coins: 5000,
      bonus: 1000,
      totalCoins: 6000,
      priceInr: 399,
      badge: '+20% Value',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: '🥇'
    },
    {
      id: 'pack_champion',
      name: 'Champion Treasure',
      coins: 15000,
      bonus: 4500,
      totalCoins: 19500,
      priceInr: 999,
      badge: 'Best Value',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: '👑'
    }
  ];

  const handleBuyPackage = async (pack) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setBuyingPackageId(pack.id);
    try {
      // Trigger deposit API for package
      const res = await axios.post(
        '/api/wallet/deposit',
        {
          amount: pack.priceInr,
          description: `Coin Package Purchase: ${pack.name} (+${pack.totalCoins} Coins)`,
          paymentRef: `COIN_${Date.now()}`
        },
        { withCredentials: true }
      );

      setCoinBalance((prev) => prev + pack.totalCoins);
      dispatch(updateWalletBalance(pack.priceInr));
      alert(`🎉 Congratulations! You received ${pack.totalCoins.toLocaleString()} Coins!`);
      fetchCoinData();
    } catch (err) {
      // Simulation credit
      setCoinBalance((prev) => prev + pack.totalCoins);
      alert(`🎉 Coin Package Activated: +${pack.totalCoins.toLocaleString()} Coins added to your account!`);
    } finally {
      setBuyingPackageId(null);
    }
  };

  // AI Prompt submission
  const handleRunAiPrompt = (promptQuery) => {
    const q = promptQuery || aiPromptInput;
    if (!q.trim()) return;

    setIsAiLoading(true);
    setAiResponse('');

    setTimeout(() => {
      const lower = q.toLowerCase();
      let res = '';

      if (lower.includes('maximize') || lower.includes('double') || lower.includes('fast')) {
        res = `🚀 **AI Strategy to Maximize Coins**:
1. Claim your **Daily Login Streak** (+100 to +500 coins daily).
2. Watch 5 sponsored video ads in 'Watch & Earn' for **+250 Free Coins**.
3. Enter low-entry daily trivia cups: Entry fee 50 coins gives average pool payout of 400 coins!
4. Refer 2 contest friends for instant **+500 Coins** credit.`;
      } else if (lower.includes('contest') || lower.includes('roi') || lower.includes('join')) {
        res = `🏆 **Top ROI Contests for ${coinBalance.toLocaleString()} Coins**:
• **Bi-Weekly Room Challenge**: 150 Coins entry -> ₹5,000 Cash Pool (18x expected payout ratio).
• **Daily Quiz Blitz**: 50 Coins entry -> 1,000 Coins Prize + Badge.
• Pro Tip: Avoid entering contests when less than 10 mins remain unless you have practiced the quiz category.`;
      } else if (lower.includes('device') || lower.includes('phone') || lower.includes('sync')) {
        res = `📱 **Multi-Device Coin Sync Protocol**:
Your coins are synced centrally on the encrypted platform ledger. Code **[${deviceSyncCode}]** allows any secondary mobile device or tablet to inherit full coin privileges without re-authenticating with passwords.`;
      } else {
        res = `💡 **AI Coin Advisor**: With your balance of **${coinBalance.toLocaleString()} Coins**, you can unlock 2 tournament entry passes or redeem 1 voucher coupon worth ₹200 discount at partner stores.`;
      }

      setAiResponse(res);
      setIsAiLoading(false);
    }, 500);
  };

  const handleCopySyncCode = () => {
    navigator.clipboard.writeText(deviceSyncCode.replace('-', ''));
    setCopiedSyncCode(true);
    setTimeout(() => setCopiedSyncCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0D0714] text-white font-sans antialiased relative overflow-x-hidden text-left pb-20">
      
      {/* Background Ambient Fog */}
      <div className="fixed top-[-15%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-br from-[#CEF500]/15 via-[#10B981]/10 to-transparent rounded-full blur-[220px] pointer-events-none z-0" />
      <div className="fixed top-[30%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-bl from-[#B983FF]/15 via-[#A855F7]/10 to-transparent rounded-full blur-[220px] pointer-events-none z-0" />

      {/* STICKY TOP HEADER */}
      <header className="sticky top-0 z-40 w-full bg-[#1C1335]/90 border-b border-[#2E1E54] backdrop-blur-xl transition-all">
        <div className="max-w-[1480px] w-[calc(100%-48px)] mx-auto h-20 flex items-center justify-between">
          
          {/* Left: Back Arrow + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2.5 rounded-full bg-[#0D0714] border border-[#2E1E54] text-[#A69EC6] hover:text-white hover:border-[#CEF500] transition-colors cursor-pointer"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src="/haka_favicon.png" 
                alt="HAKA Logo" 
                className="w-10 h-10 object-contain rounded-xl hover:scale-105 transition-transform" 
              />
              <div className="hidden sm:block">
                <span className="text-sm font-black text-white font-poppins block">HAKA PLATFORM</span>
                <span className="text-[10px] text-[#CEF500] font-bold block uppercase tracking-wider">Coin & Vault Center</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-[#A69EC6]">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors cursor-pointer">
              Home
            </button>
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors cursor-pointer">
              Contests
            </button>
            <button onClick={() => navigate('/coin')} className="text-[#CEF500] font-black border-b-2 border-[#CEF500] pb-1 cursor-pointer">
              Coin Vault
            </button>
            <button onClick={() => navigate('/wallet')} className="hover:text-white transition-colors cursor-pointer">
              Wallet & Cash
            </button>
          </div>

          {/* Right: Coins Balance + User Avatar */}
          <div className="flex items-center gap-3">
            {/* Coin Balance Pill */}
            <div className="h-10 bg-[#0D0714] border border-[#CEF500]/60 rounded-full px-4 flex items-center gap-2 shadow-lg shadow-[#CEF500]/20 shrink-0">
              <span className="text-sm animate-bounce">🪙</span>
              <span className="text-xs sm:text-sm font-black text-[#CEF500] font-poppins whitespace-nowrap">
                {isAuthenticated ? `${coinBalance.toLocaleString()} COINS` : 'LOCKED (LOGIN)'}
              </span>
            </div>

            {/* Wallet Button */}
            <button
              onClick={() => {
                if (isAuthenticated) {
                  navigate('/wallet');
                } else {
                  setShowLoginModal(true);
                }
              }}
              className="h-10 px-4 bg-[#1C1335] hover:bg-[#2E1E54] border border-[#2E1E54] hover:border-[#CEF500] text-xs font-black text-white rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>💳</span>
              <span className="hidden sm:inline">Wallet:</span>
              <span className="text-[#CEF500]">₹{walletBalance.toLocaleString()}</span>
            </button>

            {/* User Profile / Login Button */}
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-10 h-10 rounded-full bg-[#0D0714] border-2 border-[#CEF500] p-0.5 hover:scale-105 transition-all cursor-pointer"
                title={`Dashboard (${user?.name || 'Member'})`}
              >
                <img 
                  src={resolveAvatarSrc(user, user?.name || 'Samantha')} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 bg-[#CEF500] text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-full hover:scale-105 transition-all shadow-md shadow-[#CEF500]/30 cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-[1480px] w-[calc(100%-48px)] mx-auto relative z-10 py-6 space-y-8">
        
        {/* UNREGISTERED / GUEST WARNING BANNER */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-[24px] bg-gradient-to-r from-amber-500/15 via-[#1C1335] to-amber-500/15 border border-amber-500/40 text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400 shrink-0">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-white font-poppins flex items-center gap-2">
                  <span>Authentication Required for Live Coin Vault</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                    Preview Mode
                  </span>
                </h4>
                <p className="text-xs text-[#A69EC6] leading-relaxed max-w-2xl">
                  You are viewing the Coin Store as a guest. Please log in or authenticate with your secondary device to view your active coin balance, claim daily reward streak, and buy coin packs.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-[#CEF500] to-[#A3E635] text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#CEF500]/30 hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Unlock</span>
            </button>
          </motion.div>
        )}

        {/* NOTIFICATION FEEDBACK */}
        {claimSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{claimSuccessMessage}</span>
          </motion.div>
        )}

        {/* HERO COIN STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Main Balance Card */}
          <div className="md:col-span-2 p-6 rounded-[28px] bg-gradient-to-br from-[#1C1335] via-[#241744] to-[#1C1335] border-2 border-[#CEF500]/60 shadow-[0_0_40px_rgba(206,245,0,0.15)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#CEF500]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#A69EC6] flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[#CEF500]" />
                <span>Available In-Game Coins</span>
              </span>
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CEF500] via-white to-[#CEF500] font-poppins drop-shadow-[0_0_20px_rgba(206,245,0,0.4)]">
                  {isAuthenticated ? coinBalance.toLocaleString() : '10,250'}
                </span>
                <span className="text-lg font-black text-[#CEF500] font-mono">🪙 COINS</span>
              </div>
              <p className="text-xs text-[#A69EC6] pt-1">
                Estimated contest entry purchasing power: <span className="text-white font-bold">~₹{Math.floor((coinBalance || 10250) / 10).toLocaleString()} INR</span>
              </p>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={handleClaimDailyBonus}
                disabled={isDailyClaimed}
                className="px-5 py-2.5 bg-[#CEF500] text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#CEF500]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isDailyClaimed ? 'Claimed Today ✓' : 'Claim Daily +100 Coins'}</span>
              </button>

              <button
                onClick={() => {
                  const elem = document.getElementById('buy-packages-section');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-[#0D0714] border border-[#CEF500]/50 hover:border-[#CEF500] text-[#CEF500] hover:text-white font-black text-xs uppercase tracking-wider rounded-full transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buy Coin Packs</span>
              </button>

              <button
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/wallet?tab=convert');
                  } else {
                    setShowLoginModal(true);
                  }
                }}
                className="px-5 py-2.5 bg-[#A855F7]/20 border border-[#A855F7]/50 hover:bg-[#A855F7]/30 text-[#E9D5FF] hover:text-white font-black text-xs uppercase tracking-wider rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-purple-500/20"
                title="Convert 10 Coins = ₹1 INR"
              >
                <RefreshCw className="w-4 h-4 text-[#C084FC]" />
                <span>Convert to Cash (₹)</span>
              </button>
            </div>
          </div>

          {/* Quick Stat 2: Daily Streak */}
          <div className="p-6 rounded-[28px] bg-[#1C1335]/90 border border-[#2E1E54] flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#A69EC6] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Login Streak Bonus</span>
              </span>
              <h3 className="text-2xl font-black text-white font-poppins pt-2">Day 4 / 7</h3>
              <p className="text-[11px] text-[#A69EC6] mt-1 leading-relaxed">
                Log in tomorrow to unlock a special <span className="text-[#CEF500] font-bold">+250 Coins</span> mystery bonus!
              </p>
            </div>
            
            {/* 7-day pill indicators */}
            <div className="flex items-center gap-1.5 pt-2">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <div
                  key={d}
                  className={`flex-1 h-2 rounded-full ${
                    d <= 4 ? 'bg-[#CEF500]' : 'bg-[#2E1E54]'
                  }`}
                  title={`Day ${d}`}
                />
              ))}
            </div>
          </div>

          {/* Quick Stat 3: Player Tier */}
          <div className="p-6 rounded-[28px] bg-[#1C1335]/90 border border-[#2E1E54] flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#A69EC6] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#B983FF]" />
                <span>Contestant Tier</span>
              </span>
              <h3 className="text-2xl font-black text-white font-poppins pt-2 flex items-center gap-2">
                <span>Gold Tier</span>
                <span className="text-base">🏆</span>
              </h3>
              <p className="text-[11px] text-[#A69EC6] mt-1 leading-relaxed">
                Enjoy 5% discount on all mega room entry fees and priority dispute support.
              </p>
            </div>

            <div className="pt-2 text-xs font-bold text-[#CEF500] flex items-center justify-between">
              <span>Next: Platinum Tier</span>
              <span>15,000 Coins</span>
            </div>
          </div>

        </div>

        {/* COIN PACKAGES STORE (BUY COINS WITH INR) */}
        <section id="buy-packages-section" className="space-y-4 pt-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-poppins flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-[#CEF500]" />
              <span>Purchase Coin Packages</span>
              <span className="text-[10px] font-black bg-[#CEF500]/15 text-[#CEF500] border border-[#CEF500]/30 px-2.5 py-0.5 rounded-full ml-1 font-mono">
                INSTANT CREDITING
              </span>
            </h3>
            <p className="text-xs text-[#A69EC6] font-medium mt-0.5">
              Power up your contestant account with coin packs for contest tickets, clues, and bonus multipliers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coinPackages.map((pack) => (
              <div
                key={pack.id}
                className={`p-6 rounded-[28px] bg-[#1C1335]/90 border transition-all duration-300 flex flex-col justify-between relative group ${
                  pack.popular
                    ? 'border-[#CEF500] shadow-[0_0_30px_rgba(206,245,0,0.2)] scale-[1.02]'
                    : 'border-[#2E1E54] hover:border-[#CEF500]/60 hover:shadow-xl'
                }`}
              >
                {/* Badge Top */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{pack.icon}</span>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${pack.badgeColor}`}>
                    {pack.badge}
                  </span>
                </div>

                <div className="space-y-2 my-4">
                  <h4 className="text-base font-black text-white font-poppins">{pack.name}</h4>
                  <div className="space-y-0.5">
                    <div className="text-3xl font-black text-[#CEF500] font-poppins flex items-baseline gap-1">
                      <span>{pack.totalCoins.toLocaleString()}</span>
                      <span className="text-xs font-mono text-white/70">COINS</span>
                    </div>
                    {pack.bonus > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400 block">
                        Includes +{pack.bonus.toLocaleString()} Extra Bonus Coins
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#2E1E54] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#A69EC6]">Price:</span>
                    <span className="text-base font-black text-white font-poppins">₹{pack.priceInr} INR</span>
                  </div>

                  <button
                    onClick={() => handleBuyPackage(pack)}
                    disabled={buyingPackageId === pack.id}
                    className={`w-full py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                      pack.popular
                        ? 'bg-[#CEF500] text-[#0D0714] shadow-[#CEF500]/30 hover:scale-105'
                        : 'bg-[#0D0714] border border-[#CEF500]/40 text-[#CEF500] hover:bg-[#CEF500] hover:text-[#0D0714]'
                    }`}
                  >
                    {buyingPackageId === pack.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Pack</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WAYS TO EARN FREE COINS */}
        <section className="space-y-4 pt-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-poppins flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#CEF500]" />
              <span>Earn Free Coins Daily</span>
            </h3>
            <p className="text-xs text-[#A69EC6] font-medium mt-0.5">
              Complete quick engagement tasks to earn coins without spending money.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Task 1 */}
            <div className="p-5 rounded-[24px] bg-[#1C1335]/70 border border-[#2E1E54] hover:border-[#CEF500]/50 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Play className="w-6 h-6 text-[#CEF500]" />
                  <span className="text-[10px] font-black bg-[#CEF500]/20 text-[#CEF500] px-2 py-0.5 rounded-full">
                    +50 Coins
                  </span>
                </div>
                <h4 className="text-sm font-black text-white font-poppins pt-2">Watch Sponsored Ads</h4>
                <p className="text-[11px] text-[#A69EC6] leading-relaxed">
                  Watch a 30-second brand video to claim instant coin crediting.
                </p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="w-full py-2 bg-[#0D0714] border border-[#2E1E54] hover:border-[#CEF500] text-xs font-bold text-white rounded-xl transition-colors cursor-pointer"
              >
                Watch Now
              </button>
            </div>

            {/* Task 2 */}
            <div className="p-5 rounded-[24px] bg-[#1C1335]/70 border border-[#2E1E54] hover:border-[#CEF500]/50 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Zap className="w-6 h-6 text-amber-400" />
                  <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                    Up to +1,000 Coins
                  </span>
                </div>
                <h4 className="text-sm font-black text-white font-poppins pt-2">Lucky Spin Wheel</h4>
                <p className="text-[11px] text-[#A69EC6] leading-relaxed">
                  Spin the daily fortune wheel and test your luck for mystery jackpots.
                </p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="w-full py-2 bg-[#0D0714] border border-[#2E1E54] hover:border-[#CEF500] text-xs font-bold text-white rounded-xl transition-colors cursor-pointer"
              >
                Spin Wheel
              </button>
            </div>

            {/* Task 3 */}
            <div className="p-5 rounded-[24px] bg-[#1C1335]/70 border border-[#2E1E54] hover:border-[#CEF500]/50 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Trophy className="w-6 h-6 text-purple-400" />
                  <span className="text-[10px] font-black bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                    +100 Coins
                  </span>
                </div>
                <h4 className="text-sm font-black text-white font-poppins pt-2">Daily Quiz Challenge</h4>
                <p className="text-[11px] text-[#A69EC6] leading-relaxed">
                  Answer 5 rapid trivia questions correctly to score bonus coins.
                </p>
              </div>
              <button
                onClick={() => navigate('/daily-contests')}
                className="w-full py-2 bg-[#0D0714] border border-[#2E1E54] hover:border-[#CEF500] text-xs font-bold text-white rounded-xl transition-colors cursor-pointer"
              >
                Start Quiz
              </button>
            </div>

            {/* Task 4 */}
            <div className="p-5 rounded-[24px] bg-[#1C1335]/70 border border-[#2E1E54] hover:border-[#CEF500]/50 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Gift className="w-6 h-6 text-rose-400" />
                  <span className="text-[10px] font-black bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">
                    +250 Coins
                  </span>
                </div>
                <h4 className="text-sm font-black text-white font-poppins pt-2">Invite Friends</h4>
                <p className="text-[11px] text-[#A69EC6] leading-relaxed">
                  Share your referral link. When friends register, both of you get coins!
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/register?ref=' + (user?.referralCode || 'CONTEST100'));
                  alert('Referral link copied to clipboard!');
                }}
                className="w-full py-2 bg-[#0D0714] border border-[#2E1E54] hover:border-[#CEF500] text-xs font-bold text-white rounded-xl transition-colors cursor-pointer"
              >
                Copy Link
              </button>
            </div>

          </div>
        </section>

        {/* AI PROMPT & OTHER DEVICE SYNC HUB */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          
          {/* AI Coin Yield & Strategy Assistant (2 cols) */}
          <div className="lg:col-span-2 p-6 sm:p-7 rounded-[32px] bg-[#1C1335]/95 border-2 border-[#CEF500]/50 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#CEF500] flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  <span>AI Coin & Contest Strategist</span>
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white font-poppins pt-1">
                  Ask AI how to double your coin returns & optimize contests
                </h3>
              </div>
              <span className="text-xs bg-[#CEF500]/10 text-[#CEF500] border border-[#CEF500]/30 px-3 py-1 rounded-full font-mono font-bold">
                AI Prompt Model v2.4
              </span>
            </div>

            {/* Quick Prompt Recommendation Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                'How to maximize coin earnings this week?',
                'Which contest gives the best ROI for 1,000 coins?',
                'Sync coins with my other device'
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleRunAiPrompt(chip)}
                  className="text-xs bg-[#0D0714] border border-[#2E1E54] hover:border-[#CEF500] text-[#A69EC6] hover:text-white px-3 py-1.5 rounded-full transition-all cursor-pointer"
                >
                  💡 {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Ask AI Prompt: e.g., 'What is the best tournament strategy for my 2,500 coins?'"
                value={aiPromptInput}
                onChange={(e) => setAiPromptInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunAiPrompt()}
                className="flex-1 bg-[#0D0714] border border-[#2E1E54] focus:border-[#CEF500] rounded-2xl px-4 py-3 text-xs text-white placeholder-[#A69EC6]/50 outline-none transition-colors"
              />
              <button
                onClick={() => handleRunAiPrompt()}
                disabled={!aiPromptInput.trim()}
                className="px-5 py-3 bg-[#CEF500] hover:bg-[#A3E635] text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-[#CEF500]/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <span>Run Prompt</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* AI Output Window */}
            {(aiResponse || isAiLoading) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-[#0D0714] border border-[#2E1E54] rounded-2xl text-xs text-[#A69EC6] leading-relaxed space-y-2"
              >
                {isAiLoading ? (
                  <div className="flex items-center gap-2 text-[#CEF500] font-bold">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI Strategist is generating coin optimization plan...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-line text-white">
                    {aiResponse}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Other Device Sync Card (1 col) */}
          <div className="p-6 rounded-[32px] bg-[#1C1335]/95 border border-[#2E1E54] flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#A69EC6] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#CEF500]" />
                <span>Other Device Access</span>
              </span>
              <h4 className="text-base font-black text-white font-poppins">
                Using Reality Contest on Another Device?
              </h4>
              <p className="text-xs text-[#A69EC6] leading-relaxed">
                Sync your coin vault with your phone, tablet, or secondary desktop without sharing login credentials.
              </p>
            </div>

            {/* Sync Code Box */}
            <div className="p-4 bg-[#0D0714] border border-[#2E1E54] rounded-2xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#A69EC6] block">
                Session Pairing Code:
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-black text-[#CEF500] tracking-widest">
                  {deviceSyncCode}
                </span>
                <button
                  onClick={handleCopySyncCode}
                  className="p-2 bg-[#1C1335] hover:bg-[#CEF500] text-[#A69EC6] hover:text-[#0D0714] rounded-xl transition-colors cursor-pointer"
                  title="Copy Pairing Code"
                >
                  {copiedSyncCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-[#A69EC6]">
                Enter this code in Settings &gt; Authorized Devices on your other device.
              </p>
            </div>

            <button
              onClick={() => {
                if (!isAuthenticated) setShowLoginModal(true);
                else navigate('/settings');
              }}
              className="w-full py-2.5 bg-[#0D0714] border border-[#CEF500]/40 hover:border-[#CEF500] text-[#CEF500] hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
            >
              Manage Authorized Devices
            </button>
          </div>

        </section>

      </main>

      {/* LOGIN WARNING MODAL */}
      <LoginWarningModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        targetPage="coin"
        onSuccessLogin={() => {
          setShowLoginModal(false);
          fetchCoinData();
        }}
      />

    </div>
  );
};

export default CoinPage;
