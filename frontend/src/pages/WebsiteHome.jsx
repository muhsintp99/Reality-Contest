import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateWalletBalance, updateUserData } from '../store/authSlice';
import { 
  Trophy, Play, Tag, Gift, Zap, Sparkles, Coins, Star, ShieldCheck, 
  ArrowRight, CheckCircle2, Clock, Eye, ShoppingBag, Award, Users, 
  ChevronRight, ChevronLeft, LogIn, UserPlus, Flame, AlertCircle, X, RotateCw, Check,
  Home, Search, Heart, Sliders, Volume2, User, Download, MoreHorizontal,
  ExternalLink, Copy, HelpCircle, ChevronUp, Sparkle, ArrowUp, Briefcase
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveAvatarSrc } from '../utils/avatar';

// Reusable 4.5 Cards Slider Component for Contest Categories
const ContestSliderRow = ({ sectionTitle, sectionSubtitle, contestsList, sectionIcon, joinedContestIds, setSelectedContestModal }) => {
  const trackRef = useRef(null);

  const scrollTrack = (direction) => {
    if (trackRef.current) {
      const scrollAmount = trackRef.current.clientWidth * 0.22; // 4.5 cards visible per row
      trackRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="space-y-3 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-poppins flex items-center gap-2">
            {sectionIcon}
            <span>{sectionTitle}</span>
          </h3>
          <p className="text-xs text-[#A69EC6] font-medium mt-0.5">{sectionSubtitle}</p>
        </div>

        {/* Prev / Next Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollTrack('prev')}
            className="p-2 rounded-full bg-[#1C1335] border border-[#2E1E54] hover:border-[#CEF500] text-[#A69EC6] hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollTrack('next')}
            className="p-2 rounded-full bg-[#1C1335] border border-[#2E1E54] hover:border-[#CEF500] text-[#A69EC6] hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4.5 Cards Slider Track */}
      {contestsList.length === 0 ? (
        <div className="w-full py-8 px-6 bg-[#1C1335]/60 border border-[#2E1E54] rounded-[28px] text-center space-y-1">
          <p className="text-xs font-bold text-white">No active competitions currently in {sectionTitle}</p>
          <p className="text-[11px] text-[#A69EC6]">Contests are dynamically created and published from the platform dashboard.</p>
        </div>
      ) : (
        <div 
          ref={trackRef}
          className="flex gap-3.5 overflow-x-auto scrollbar-none scroll-smooth pb-3 px-0.5"
          style={{ scrollSnapType: 'x mandatory' }}
        >
        {contestsList.map((c) => {
          const isJoined = joinedContestIds.includes(c.id);
          return (
            <div 
              key={c.id}
              onClick={() => setSelectedContestModal(c)}
              style={{ scrollSnapAlign: 'start' }}
              className="min-w-[85%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[21.5%] xl:min-w-[21.5%] 2xl:min-w-[21.5%] w-[21.5%] shrink-0 bg-[#1C1335]/90 backdrop-blur-xl border border-[#2E1E54] hover:border-[#CEF500]/90 rounded-[28px] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(206,245,0,0.25)] group flex flex-col justify-between relative cursor-pointer"
            >
              {/* Top Neon Glow Edge Accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CEF500] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

              {/* Gaming Card Image Header */}
              <div className="relative h-38 sm:h-42 overflow-hidden bg-black">
                <img 
                  src={c.image} 
                  alt={c.title} 
                  className="w-full h-full object-cover opacity-85 group-hover:scale-110 transition-transform duration-700 brightness-95" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1335] via-transparent to-black/40" />

                {/* Cyber Top Badges */}
                <div className="absolute top-2.5 left-2.5 bg-[#0D0714]/90 backdrop-blur-md text-[#CEF500] border border-[#CEF500]/50 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CEF500] animate-ping" />
                  <span>{c.sponsorLogo}</span>
                  <span className="truncate max-w-[75px] font-poppins">{c.sponsor}</span>
                </div>

                <div className="absolute top-2.5 right-2.5 bg-[#0D0714]/90 backdrop-blur-md text-white border border-[#2E1E54] group-hover:border-[#CEF500]/40 text-[9px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 z-10">
                  <Clock className="w-3 h-3 text-[#CEF500]" />
                  <span>{c.timeLeft}</span>
                </div>
              </div>

              {/* Gaming Card Info Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-left">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-[#A69EC6] uppercase tracking-widest truncate max-w-[60%]">
                      {c.category}
                    </span>
                    <span className="text-[10px] font-black text-[#0D0714] bg-[#CEF500] px-2 py-0.5 rounded-full shadow-sm font-poppins">
                      {c.entryFee}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-white group-hover:text-[#CEF500] transition-colors leading-snug font-poppins line-clamp-1" title={c.title}>
                    {c.title}
                  </h4>

                  <p className="text-[11px] text-[#A69EC6] font-medium line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                {/* Gaming HUD Stats Box */}
                <div className="pt-2.5 border-t border-[#2E1E54]/80 space-y-2.5">
                  <div className="bg-[#0D0714]/80 border border-[#2E1E54] group-hover:border-[#CEF500]/30 rounded-2xl p-2.5 flex items-center justify-between shadow-inner transition-colors">
                    <div>
                      <span className="text-[8px] text-[#A69EC6] font-bold uppercase tracking-wider block">Cash Pool</span>
                      <span className="text-xs font-black text-[#CEF500] font-poppins drop-shadow-[0_0_8px_rgba(206,245,0,0.3)]">{c.prizeCash}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[8px] text-[#A69EC6] font-bold uppercase tracking-wider block">Players</span>
                      <span className="text-[11px] font-black text-white font-poppins">{c.participants}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedContestModal(c);
                    }}
                    className={`w-full py-2.5 rounded-full font-black text-[11px] uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer ${
                      isJoined 
                        ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-emerald-500/20' 
                        : 'bg-gradient-to-r from-[#CEF500] via-[#A3E635] to-[#CEF500] text-[#0D0714] shadow-[#CEF500]/30 hover:scale-[1.03] active:scale-95'
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Joined ✓</span>
                      </>
                    ) : (
                      <>
                        <span>Enter Contest</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </section>
  );
};

export const WebsiteHome = ({ onNavigateToLogin, onNavigateToRegister }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Local interactive state
  const [coinBalance, setCoinBalance] = useState(() => user?.coins ?? 0);
  const [claimedBonusToday, setClaimedBonusToday] = useState(false);
  const [activeTab, setActiveTab] = useState('contests');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Ad player modal state
  const [activeAd, setActiveAd] = useState(null);
  const [adTimer, setAdTimer] = useState(5);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);

  // Offer modal state
  const [claimedOffer, setClaimedOffer] = useState(null);

  // Contest Detail Modal state
  const [selectedContestModal, setSelectedContestModal] = useState(null);
  const [joinedContestIds, setJoinedContestIds] = useState([]);

  // Daily Wheel state
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelWinMessage, setWheelWinMessage] = useState('');

  // Legal Document Modal state
  const [legalModal, setLegalModal] = useState({
    isOpen: false,
    type: '',
    title: '',
    content: '',
    loading: false
  });

  const openLegalModal = async (type) => {
    const docTitle = type === 'privacy' ? 'Privacy Policy' : type === 'terms' ? 'Terms of Service' : 'Legal Document';
    setLegalModal({
      isOpen: true,
      type,
      title: docTitle,
      content: '',
      loading: true
    });

    try {
      const res = await axios.get(`/api/cms/${type}`, { timeout: 4000 });
      const doc = res.data?.document;
      setLegalModal({
        isOpen: true,
        type,
        title: doc?.title || docTitle,
        content: doc?.content || `<p>Official platform ${docTitle} content loaded from server.</p>`,
        loading: false
      });
    } catch (err) {
      const fallbackContent = type === 'privacy'
        ? `<h2>Platform Privacy Policy</h2><p>Your privacy is important to us at Reality Contest Platform. We collect minimal personal data including name, email, and identity verification details strictly for KYC compliance and platform rewards distribution.</p><p>We employ enterprise encryption standards to safeguard your data and will never share or sell personal information to unauthorized third parties.</p>`
        : `<h2>Terms of Service</h2><p>Welcome to Reality Contest Platform. By registering or participating in contests, quizzes, and room cycles, you agree to abide by all platform rules, KYC guidelines, and terms of service.</p><p>Fair play is mandatory. Any attempt at automated entry, fraudulent activity, or system abuse will result in immediate disqualification and account termination.</p>`;
      setLegalModal({
        isOpen: true,
        type,
        title: docTitle,
        content: fallbackContent,
        loading: false
      });
    }
  };

  // Favorites / Like state simulation
  const [likedItems, setLikedItems] = useState(['c1']);

  // Scroll to top visibility check
  const [showQuickTop, setShowQuickTop] = useState(false);

  const [categoryPills, setCategoryPills] = useState(['All', 'Trending', 'Top', 'New', 'Free Entry', 'Creator Showdown', 'Daily Quiz', 'Completed Contests']);

  // Backend State for all API categories (No static dummy data)
  const [apiGeneralContests, setApiGeneralContests] = useState([]);
  const [apiCompletedContests, setApiCompletedContests] = useState([]);
  const [apiDailyContests, setApiDailyContests] = useState([]);
  const [apiGrandContests, setApiGrandContests] = useState([]);
  const [apiBiWeeklyContests, setApiBiWeeklyContests] = useState([]);
  const [apiAds, setApiAds] = useState([]);
  const [apiOffers, setApiOffers] = useState([]);

  useEffect(() => {
    if (user?.coins) {
      setCoinBalance(user.coins);
    }
  }, [user]);

  // Fetch Public Contests, Ads & Coupons strictly from Backend API
  useEffect(() => {
    const fetchWebsiteData = async () => {
      try {
        const [activeRes, completedRes, dailyRes, grandRes, biWeeklyRes, adsRes, couponsRes] = await Promise.allSettled([
          axios.get('/api/public/contests', { timeout: 4000 }),
          axios.get('/api/public/contests/completed', { timeout: 4000 }),
          axios.get('/api/public/daily-contests', { timeout: 4000 }),
          axios.get('/api/public/grand-contests', { timeout: 4000 }),
          axios.get('/api/public/bi-weekly-contests', { timeout: 4000 }),
          axios.get('/api/ads', { timeout: 4000 }),
          axios.get('/api/public/coupons', { timeout: 4000 })
        ]);

        const extractList = (res, keys = ['contests', 'dailyContests', 'grandContests', 'cycles', 'rooms', 'ads', 'coupons', 'data']) => {
          if (res.status === 'fulfilled' && res.value?.data) {
            const raw = res.value.data;
            if (Array.isArray(raw)) return raw;
            for (const key of keys) {
              if (Array.isArray(raw[key])) return raw[key];
            }
            if (raw.data && Array.isArray(raw.data)) return raw.data;
          }
          return [];
        };

        const formatContest = (c, defaultCat = 'General') => ({
          id: c._id || c.id || c.contestId || c.cycleId || c.roomId,
          _id: c._id || c.id || c.contestId || c.cycleId || c.roomId,
          title: c.title || c.name || c.roomName || 'Platform Contest',
          sponsor: c.sponsor || c.organization || c.brand || 'Haka Official',
          sponsorLogo: c.sponsorLogo || '🏆',
          prizeCash: typeof c.prizePool === 'number' ? `₹${c.prizePool.toLocaleString()}` : (c.prizePool || c.prizeCash || '₹50,000'),
          prizeCoins: c.entryFeeCoins ? `${c.entryFeeCoins} Coins` : (c.prizeCoins || '10,000 Coins'),
          entryFee: c.entryFee === 0 || c.entryFeeType === 'Free' ? 'Free' : (typeof c.entryFee === 'number' ? `₹${c.entryFee}` : (c.entryFee || 'Free')),
          participants: `${c.participantsCount || c.participants || c.maxParticipants || 100} Players`,
          timeLeft: c.status === 'Completed' ? 'Completed' : (c.endDate ? `${Math.max(0, Math.ceil((new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24)))} Days Left` : 'Active'),
          category: c.status === 'Completed' ? 'Completed Contests' : (c.category || defaultCat),
          tags: [c.status || 'Active', c.entryFee === 0 ? 'Free Entry' : 'Prize Pool'],
          image: c.bannerImage || c.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
          description: c.description || c.rules || 'Join this exciting platform contest to showcase your skills and win rewards!'
        });

        const activeList = extractList(activeRes).map(c => formatContest(c, 'General'));
        const completedList = extractList(completedRes).map(c => formatContest(c, 'Completed Contests'));
        const dailyList = extractList(dailyRes).map(c => formatContest(c, 'Daily Quiz'));
        const grandList = extractList(grandRes).map(c => formatContest(c, 'Mega Contests'));
        const biWeeklyList = extractList(biWeeklyRes).map(c => formatContest(c, 'Weekly Cup'));

        if (activeList.length > 0) setApiGeneralContests(activeList);
        if (completedList.length > 0) setApiCompletedContests(completedList);
        if (dailyList.length > 0) setApiDailyContests(dailyList);
        if (grandList.length > 0) setApiGrandContests(grandList);
        if (biWeeklyList.length > 0) setApiBiWeeklyContests(biWeeklyList);

        const rawAds = extractList(adsRes, ['ads', 'data']);
        if (rawAds.length > 0) {
          setApiAds(rawAds.map(a => ({
            id: a._id || a.id,
            title: a.title || 'Sponsored Advertisement',
            brand: a.sponsor || a.advertiser || 'Partner Brand',
            duration: a.duration ? `${a.duration} sec` : '30 sec',
            rewardCoins: a.rewardCoins || a.coins || 50,
            badge: `+${a.rewardCoins || 50} Coins`,
            thumbnail: a.bannerImage || a.imageUrl || 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
            description: a.description || 'Watch video ad to claim instant coin rewards.'
          })));
        }

        const rawCoupons = extractList(couponsRes, ['coupons', 'data']);
        if (rawCoupons.length > 0) {
          setApiOffers(rawCoupons.map(o => ({
            id: o._id || o.id,
            title: o.title || o.code || 'Voucher Coupon',
            brand: o.brand || 'Partner Merchant',
            category: o.category || 'Deals',
            coinCost: o.coinCost || o.coinsRequired || 500,
            discountText: o.discountText || `${o.discountAmount || 20}% OFF`,
            tag: o.tag || 'Hot Offer',
            code: o.code || 'SAVE20NOW',
            validTill: o.expiryDate ? new Date(o.expiryDate).toLocaleDateString() : 'Valid Soon',
            image: '🎁'
          })));
        }

      } catch (err) {
        console.log('Public Website Data fetch notice:', err?.message);
      }
    };

    fetchWebsiteData();
  }, []);

  // Fetch dynamic categories from /api/categories
  useEffect(() => {
    const fetchCategoriesFromAPI = async () => {
      try {
        const res = await axios.get('/api/categories', { timeout: 3000, withCredentials: true });
        const catsData = res.data?.categories || res.data;
        if (Array.isArray(catsData) && catsData.length > 0) {
          const titles = catsData.map(c => typeof c === 'string' ? c : (c.title || c.name || c.categoryName)).filter(Boolean);
          if (titles.length > 0) {
            setCategoryPills(['All', ...Array.from(new Set(titles))]);
          }
        }
      } catch (err) {
        console.log('Categories API info:', err?.message);
      }
    };
    fetchCategoriesFromAPI();
  }, []);

  // Featured Auto-Slider Carousel State

  const sliderRef = useRef(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);

  // Auto Slider Effect (Every 3.5 Seconds)
  useEffect(() => {
    if (isSlidePaused) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % featuredSlidesData.length;
        if (sliderRef.current) {
          const scrollAmount = sliderRef.current.clientWidth * 0.40;
          sliderRef.current.scrollTo({
            left: nextIndex * scrollAmount,
            behavior: 'smooth'
          });
        }
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isSlidePaused]);

  const handleManualSlide = (index) => {
    setActiveSlideIndex(index);
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.40;
      sliderRef.current.scrollTo({
        left: index * scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowQuickTop(true);
      } else {
        setShowQuickTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleLike = (id) => {
    setLikedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Handle daily reward bonus claim
  const handleClaimDailyBonus = () => {
    if (claimedBonusToday) {
      alert("You've already claimed today's bonus! Come back tomorrow for more coins.");
      return;
    }
    const bonus = 100;
    setCoinBalance(prev => prev + bonus);
    setClaimedBonusToday(true);
    if (isAuthenticated) {
      dispatch(updateWalletBalance(bonus));
    }
    alert(`🎉 Congratulations! You claimed +${bonus} Daily Bonus Coins!`);
  };

  // Watch Ad Simulator
  const handleStartWatchAd = (ad) => {
    setActiveAd(ad);
    setAdTimer(5);
    setIsWatchingAd(true);
    setAdCompleted(false);
  };

  useEffect(() => {
    let interval = null;
    if (isWatchingAd && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer(prev => prev - 1);
      }, 1000);
    } else if (isWatchingAd && adTimer === 0) {
      setIsWatchingAd(false);
      setAdCompleted(true);
      if (activeAd) {
        setCoinBalance(prev => prev + activeAd.rewardCoins);
        if (isAuthenticated) {
          dispatch(updateWalletBalance(activeAd.rewardCoins));
        }
      }
    }
    return () => clearInterval(interval);
  }, [isWatchingAd, adTimer, activeAd, isAuthenticated, dispatch]);

  // Wheel Spin Logic
  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWheelWinMessage('');

    const rewards = [50, 100, 250, 500, 1000];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    const extraRotations = 360 * 5;
    const randomDegrees = Math.floor(Math.random() * 360);
    const totalRotation = wheelRotation + extraRotations + randomDegrees;

    setWheelRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setCoinBalance(prev => prev + randomReward);
      if (isAuthenticated) {
        dispatch(updateWalletBalance(randomReward));
      }
      setWheelWinMessage(`🎉 Jackpot! You won +${randomReward} Coins!`);
    }, 3200);
  };

  // Redeem Offer
  const handleRedeemOffer = (offer) => {
    if (coinBalance < offer.coinCost) {
      alert(`Insufficient coins! You need ${offer.coinCost} coins to claim this offer.`);
      return;
    }
    setCoinBalance(prev => prev - offer.coinCost);
    if (isAuthenticated) {
      dispatch(updateWalletBalance(-offer.coinCost));
    }
    setClaimedOffer(offer);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleConfirmJoinContest = async (contest) => {
    if (!isAuthenticated) {
      setSelectedContestModal(null);
      if (onNavigateToLogin) {
        onNavigateToLogin();
      } else {
        navigate('/login');
      }
      return;
    }

    try {
      const contestId = contest._id || contest.id || contest.contestId;
      let res;
      try {
        res = await axios.post(`/api/contests/${contestId}/join`, {}, { withCredentials: true });
      } catch (e1) {
        try {
          res = await axios.post(`/api/contest/${contestId}/join`, {}, { withCredentials: true });
        } catch (e2) {
          try {
            res = await axios.post(`/api/v1/mobile/contests/${contestId}/join`, {}, { withCredentials: true });
          } catch (e3) {
            try {
              res = await axios.post(`/api/daily-contests/${contestId}/join`, {}, { withCredentials: true });
            } catch (e4) {
              res = await axios.post(`/api/grand-contests/${contestId}/join`, {}, { withCredentials: true });
            }
          }
        }
      }

      if (res && res.data && (res.data.success || res.status === 200)) {
        if (res.data.user) {
          dispatch(updateUserData(res.data.user));
        }
        setJoinedContestIds(prev => [...prev, contest.id || contest._id]);
        setSelectedContestModal(null);
        alert(res.data.message || `🎉 Success! You joined "${contest.title}". Best of luck!`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join contest');
    }
  };

  // Data Collections (Derived strictly from API responses - No static dummy data)
  const dailyContestsData = apiDailyContests;
  const weeklyContestsData = apiBiWeeklyContests;
  const jobContestsData = useMemo(() => {
    return apiGeneralContests.filter(c => {
      const catMatch = String(c.category || '').toLowerCase().includes('job');
      const tagList = Array.isArray(c.tags) ? c.tags : (c.tags ? [c.tags] : []);
      const tagMatch = tagList.some(t => String(t || '').toLowerCase().includes('job'));
      return catMatch || tagMatch;
    });
  }, [apiGeneralContests]);

  const megaContestsData = apiGrandContests;
  const defaultCompletedContestsData = apiCompletedContests;

  const contestsData = useMemo(() => [
    ...apiGeneralContests,
    ...apiDailyContests,
    ...apiBiWeeklyContests,
    ...apiGrandContests,
    ...apiCompletedContests
  ], [apiGeneralContests, apiDailyContests, apiBiWeeklyContests, apiGrandContests, apiCompletedContests]);

  const featuredSlidesData = useMemo(() => {
    const combined = [...apiGrandContests, ...apiGeneralContests, ...apiDailyContests, ...apiBiWeeklyContests];
    if (combined.length === 0) return [];
    
    const gradients = [
      'from-[#B983FF] via-[#A855F7] to-[#C084FC]',
      'from-[#CEF500] via-[#10B981] to-[#059669]',
      'from-[#6366F1] via-[#A855F7] to-[#EC4899]',
      'from-[#F59E0B] via-[#EF4444] to-[#EC4899]'
    ];
    
    return combined.slice(0, 4).map((c, idx) => ({
      id: c.id || c._id || `f_${idx}`,
      badge: c.category ? `${c.category.toUpperCase()} ARENA` : 'FEATURED CONTEST',
      title: c.title,
      sponsor: `Sponsored by ${c.sponsor}`,
      description: c.description,
      prizeCash: c.prizeCash,
      prizeCoins: c.prizeCoins,
      image: c.image,
      gradient: gradients[idx % gradients.length]
    }));
  }, [apiGrandContests, apiGeneralContests, apiDailyContests, apiBiWeeklyContests]);

  const adsData = apiAds;
  const offersData = apiOffers;

  // Search & Filter Logic
  const filteredContests = contestsData.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory || c.tags.includes(selectedCategory);
    const matchesSearch = searchQuery === '' || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.sponsor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0D0714] text-white font-sans antialiased relative overflow-x-hidden">

      {/* Multi-Color Ambient Fog Background */}
      <div className="fixed top-[-15%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-[#B983FF]/20 via-[#A855F7]/15 to-transparent rounded-full blur-[200px] pointer-events-none z-0 animate-pulse" />
      <div className="fixed top-[25%] right-[-10%] w-[850px] h-[850px] bg-gradient-to-bl from-[#CEF500]/15 via-[#10B981]/10 to-transparent rounded-full blur-[220px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[15%] w-[900px] h-[900px] bg-gradient-to-tr from-[#3B82F6]/15 via-[#8B5CF6]/15 to-transparent rounded-full blur-[240px] pointer-events-none z-0" />

      {/* ==================== 1. DESKTOP RIGHT FLOATING NAVIGATION RAIL (>= 1024px) ==================== */}
      <div className="hidden lg:flex flex-col items-center fixed right-6 top-1/2 -translate-y-1/2 z-50 bg-[#1C1335]/95 border border-[#2E1E54] hover:border-[#CEF500]/60 rounded-[32px] py-4 px-2.5 shadow-2xl backdrop-blur-xl space-y-3 transition-all">
        
        {/* Profile Avatar Top */}
        <button 
          onClick={() => {
            if (isAuthenticated) {
              const defaultRoute = user?.role === 'Judge' ? '/judge' : user?.role === 'Sponsor' ? '/sponsor' : '/dashboard';
              navigate(defaultRoute);
            } else {
              navigate('/login');
            }
          }}
          className="w-10 h-10 rounded-full bg-[#0D0714] border border-[#CEF500]/50 p-0.5 hover:scale-110 transition-transform shadow-md cursor-pointer"
          title={isAuthenticated ? `Go to Dashboard (${user?.name || 'Member'})` : "Login / Member Portal"}
        >
          <img 
            src={resolveAvatarSrc(user, user?.name || 'Samantha')} 
            alt="User" 
            className="w-full h-full rounded-full object-cover"
          />
        </button>

        <div className="w-6 h-[1px] bg-[#CEF500]/20" />

        {/* Navigation Items (Icons as per wireframe) */}
        <button
          onClick={() => { setActiveTab('contests'); scrollToTop(); }}
          className={`p-3 rounded-full transition-all ${
            activeTab === 'contests' 
              ? 'bg-[#CEF500] text-[#0D0714] shadow-lg shadow-[#CEF500]/40 scale-110 font-black' 
              : 'text-[#A69EC6] hover:text-white hover:bg-white/5'
          }`}
          title="Home"
        >
          <Home className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('contests')}
          className={`p-3 rounded-full transition-all ${
            activeTab === 'contests' 
              ? 'bg-[#CEF500] text-[#0D0714] shadow-lg shadow-[#CEF500]/40 scale-110 font-black' 
              : 'text-[#A69EC6] hover:text-white hover:bg-white/5'
          }`}
          title="Contests"
        >
          <Trophy className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('ads')}
          className={`p-3 rounded-full transition-all ${
            activeTab === 'ads' 
              ? 'bg-[#CEF500] text-[#0D0714] shadow-lg shadow-[#CEF500]/40 scale-110 font-black' 
              : 'text-[#A69EC6] hover:text-white hover:bg-white/5'
          }`}
          title="Watch & Earn"
        >
          <Play className="w-5 h-5 fill-current" />
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`p-3 rounded-full transition-all ${
            activeTab === 'offers' 
              ? 'bg-[#CEF500] text-[#0D0714] shadow-lg shadow-[#CEF500]/40 scale-110 font-black' 
              : 'text-[#A69EC6] hover:text-white hover:bg-white/5'
          }`}
          title="Offers"
        >
          <Tag className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`p-3 rounded-full transition-all ${
            activeTab === 'rewards' 
              ? 'bg-[#CEF500] text-[#0D0714] shadow-lg shadow-[#CEF500]/40 scale-110 font-black' 
              : 'text-[#A69EC6] hover:text-white hover:bg-white/5'
          }`}
          title="Rewards"
        >
          <Gift className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('wheel')}
          className={`p-3 rounded-full transition-all ${
            activeTab === 'wheel' 
              ? 'bg-[#CEF500] text-[#0D0714] shadow-lg shadow-[#CEF500]/40 scale-110 font-black' 
              : 'text-[#A69EC6] hover:text-white hover:bg-white/5'
          }`}
          title="Lucky Wheel"
        >
          <Zap className="w-5 h-5 fill-current" />
        </button>

        <div className="w-6 h-[1px] bg-[#CEF500]/20" />

        {/* Quick Top Button (↑) */}
        <button
          onClick={scrollToTop}
          className="p-3 rounded-full bg-[#0D0714] border border-[#CEF500]/40 text-[#CEF500] hover:bg-[#CEF500] hover:text-[#0D0714] transition-all hover:scale-110 shadow-lg"
          title="Quick Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

      </div>

      {/* ==================== 2. MOBILE & TABLET BOTTOM FIXED NAVIGATION BAR (< 1024px) ==================== */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50 max-w-lg mx-auto">
        <div className="bg-[#1C1335]/95 backdrop-blur-2xl border border-[#CEF500]/60 rounded-full py-3 px-6 shadow-2xl flex items-center justify-around">
          <button onClick={() => { setActiveTab('contests'); scrollToTop(); }} className={`p-2 rounded-full ${activeTab === 'contests' ? 'bg-[#CEF500] text-[#0D0714]' : 'text-[#A69EC6]'}`}>
            <Home className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveTab('contests')} className={`p-2 rounded-full ${activeTab === 'contests' ? 'text-[#CEF500]' : 'text-[#A69EC6]'}`}>
            <Trophy className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveTab('ads')} className={`p-2 rounded-full ${activeTab === 'ads' ? 'bg-[#CEF500] text-[#0D0714]' : 'text-[#A69EC6]'}`}>
            <Play className="w-5 h-5 fill-current" />
          </button>
          <button onClick={() => setActiveTab('offers')} className={`p-2 rounded-full ${activeTab === 'offers' ? 'bg-[#CEF500] text-[#0D0714]' : 'text-[#A69EC6]'}`}>
            <Tag className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveTab('rewards')} className={`p-2 rounded-full ${activeTab === 'rewards' ? 'bg-[#CEF500] text-[#0D0714]' : 'text-[#A69EC6]'}`}>
            <Gift className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ==================== 3. DESKTOP STICKY HEADER ==================== */}
      <header className="sticky top-0 z-40 w-full bg-transparent border-none border-b-0 shadow-none backdrop-blur-md transition-all">
        <div className="max-w-[1480px] w-[calc(100%-48px)] mx-auto h-20 flex items-center justify-between">
          
          {/* Left: Logo (/haka_favicon.png) + Compact Greeting */}
          <div className="flex items-center gap-3">
            
            {/* Logo Image */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src="/haka_favicon.png" 
                alt="HAKA Logo" 
                className="w-10 h-10 object-contain rounded-xl hover:scale-105 transition-transform" 
              />
            </div>

            {/* Compact Greeting Message next to Logo (Clean No-Background) */}
            <div className="hidden sm:flex items-center ml-1">
              <span className="text-[#A69EC6] text-xs font-bold flex items-center gap-1.5">
                <span className="text-[#CEF500]">👋</span>
                <span>Hi, {user?.name || 'Samantha'}! 🚀</span>
              </span>
            </div>

          </div>

          {/* Right: Search Input + Coin Balance (Default 0) + User Icon */}
          <div className="flex items-center gap-3">
            
            {/* Search Input Bar (with inside Search Icon - Uniform h-10) */}
            <div className="relative flex items-center h-10">
              <Search className="w-4 h-4 text-[#CEF500] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search contests, sponsors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-40 sm:w-56 md:w-64 pl-10 pr-8 bg-[#1C1335]/95 border border-[#2E1E54] focus:border-[#CEF500] rounded-full text-xs text-white placeholder-[#A69EC6]/70 outline-none transition-all shadow-lg focus:shadow-[#CEF500]/20 flex items-center"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-[#A69EC6] hover:text-white text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Coin Balance Pill (Uniform h-10) */}
            <div className="h-10 bg-[#1C1335]/90 border border-[#CEF500]/60 rounded-full px-4 flex items-center gap-2 shadow-lg shadow-[#CEF500]/20 shrink-0">
              <span className="text-sm animate-bounce">🪙</span>
              <span className="text-xs sm:text-sm font-black text-[#CEF500] font-poppins whitespace-nowrap">{coinBalance.toLocaleString()} COINS</span>
            </div>

            {/* User Icon Avatar Button (Uniform h-10) */}
            <button
              onClick={() => {
                if (isAuthenticated) {
                  const defaultRoute = user?.role === 'Judge' ? '/judge' : user?.role === 'Sponsor' ? '/sponsor' : '/dashboard';
                  navigate(defaultRoute);
                } else {
                  navigate('/login');
                }
              }}
              className="relative w-10 h-10 shrink-0 rounded-full bg-[#0D0714] border-2 border-[#CEF500] p-0.5 shadow-lg shadow-[#CEF500]/30 hover:scale-110 transition-all flex items-center justify-center overflow-hidden cursor-pointer"
              title={isAuthenticated ? `Go to Dashboard (${user?.name || 'Member'})` : 'Login / Member Portal'}
            >
              <img 
                src={resolveAvatarSrc(user, user?.name || 'Samantha')} 
                alt="User Profile" 
                className="w-full h-full rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#CEF500] border-2 border-[#0D0714]" />
            </button>

          </div>

        </div>
      </header>

      {/* ==================== 4. MAIN DESKTOP CONTENT CONTAINER ==================== */}
      <main className="max-w-[1480px] w-[calc(100%-48px)] mx-auto pr-0 lg:pr-24 relative z-10 py-4 space-y-8 pb-24">
        
        {/* HERO GREETING AREA */}
        <section className="pb-1">
          <div className="text-left space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-[#A69EC6] font-poppins flex items-center gap-2">
              <span>Hi, {user?.name || 'Samantha'}</span>
              <span className="text-[#CEF500]">👋</span>
            </h2>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#CEF500] via-[#B983FF] to-[#CEF500] leading-tight font-poppins tracking-tight">
              Win Beyond Reward, Ready to play 🚀
            </h1>
          </div>
        </section>

        {/* CATEGORY FILTERS (All, Trending, Top, New, Free Entry) */}
        <section className="pt-1">
          <div className="flex flex-wrap gap-2.5">
            {categoryPills.map((pill) => (
              <button
                key={pill}
                onClick={() => setSelectedCategory(pill)}
                className={`px-5 py-2.5 rounded-full text-xs font-black transition-all ${
                  selectedCategory === pill
                    ? 'bg-[#CEF500] text-[#0D0714] shadow-lg shadow-[#CEF500]/40 scale-105'
                    : 'bg-[#1C1335] text-[#A69EC6] hover:text-white border border-[#2E1E54] hover:border-[#CEF500]'
                }`}
              >
                {pill}
              </button>
            ))}
          </div>
        </section>

        {/* FEATURED CONTEST AUTO-SLIDER SWIPER (2 FULL CARDS + 3RD HALF VISIBLE) */}
        {featuredSlidesData.length > 0 && (
          <section 
            className="space-y-4 pt-2"
            onMouseEnter={() => setIsSlidePaused(true)}
            onMouseLeave={() => setIsSlidePaused(false)}
          >
            {/* Swiper Controls Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-black text-white font-poppins flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#CEF500]" />
                <span>Discover Weekly Challenges</span>
              </h3>

              {/* Slider Navigation Dots & Arrows */}
              <div className="flex items-center gap-3">
                {/* Pagination Dots */}
                <div className="hidden sm:flex items-center gap-1.5 mr-2">
                  {featuredSlidesData.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleManualSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        activeSlideIndex === idx
                          ? 'w-6 bg-[#CEF500]'
                          : 'w-2 bg-[#2E1E54] hover:bg-[#CEF500]/50'
                      }`}
                    />
                  ))}
                </div>

                {/* Prev / Next Arrows */}
                <button
                  onClick={() => handleManualSlide((activeSlideIndex - 1 + featuredSlidesData.length) % (featuredSlidesData.length || 1))}
                  className="p-2 rounded-full bg-[#1C1335] border border-[#2E1E54] hover:border-[#CEF500] text-[#A69EC6] hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleManualSlide((activeSlideIndex + 1) % (featuredSlidesData.length || 1))}
                  className="p-2 rounded-full bg-[#1C1335] border border-[#2E1E54] hover:border-[#CEF500] text-[#A69EC6] hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          {/* Swiper Track Container: Exact 2.5 Cards Visible Per Row */}
          <div 
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-4 px-0.5"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {featuredSlidesData.map((slide) => (
              <div
                key={slide.id}
                style={{ scrollSnapAlign: 'start' }}
                className={`min-w-[85%] sm:min-w-[55%] md:min-w-[38.5%] lg:min-w-[38.5%] xl:min-w-[38.5%] w-[38.5%] shrink-0 rounded-[32px] overflow-hidden bg-gradient-to-r ${slide.gradient} border border-white/20 p-5 sm:p-6 shadow-2xl relative group transition-transform duration-500 hover:scale-[1.01]`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  
                  {/* Left Info Column (65%) */}
                  <div className="sm:col-span-7 space-y-3 text-left">
                    <span className="px-3 py-0.5 rounded-full bg-[#0D0714] text-[#CEF500] text-[10px] font-black uppercase tracking-wider inline-block shadow-md">
                      {slide.badge}
                    </span>

                    <h4 className="text-xl sm:text-2xl font-black text-[#0D0714] leading-tight font-poppins">
                      {slide.title}
                    </h4>

                    <p className="text-xs text-[#0D0714]/85 font-semibold line-clamp-2 leading-relaxed">
                      {slide.description}
                    </p>

                    {/* Actions Row */}
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (!isAuthenticated) navigate('/login');
                          else navigate('/contests');
                        }}
                        className="w-11 h-11 rounded-full bg-[#0D0714] text-white hover:scale-110 active:scale-95 transition-all shadow-xl flex items-center justify-center cursor-pointer"
                        title="Play Challenge"
                      >
                        <Play className="w-5 h-5 fill-current text-white translate-x-0.5" />
                      </button>

                      <button
                        onClick={() => toggleLike(slide.id)}
                        className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                          likedItems.includes(slide.id)
                            ? 'bg-[#0D0714] text-rose-400 border-[#0D0714]'
                            : 'bg-[#0D0714]/10 text-[#0D0714] border-[#0D0714]/20 hover:bg-[#0D0714]/20'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedItems.includes(slide.id) ? 'fill-current text-rose-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Right Image Artwork Column (35%) */}
                  <div className="sm:col-span-5">
                    <div className="relative w-full h-36 sm:h-44 rounded-[22px] overflow-hidden border border-[#0D0714]/20 shadow-xl bg-black">
                      <img 
                        src={slide.image} 
                        alt={slide.title} 
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                        <span className="text-[10px] font-black text-[#CEF500] bg-[#0D0714]/90 px-2.5 py-0.5 rounded-full border border-[#CEF500]/40 truncate max-w-full">
                          {slide.sponsor}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* ==================== TAB CONTENT SECTIONS ==================== */}

        {/* TAB 1: CONTESTS SLIDERS & ARENA (DAILY, WEEKLY, JOB, MEGA) */}
        {activeTab === 'contests' && (
          <section className="space-y-12">
            
            {/* If Category is 'All' and no search query, show the 4 Category Card Sliders */}
            {selectedCategory === 'All' && searchQuery === '' ? (
              <div className="space-y-12">
                {/* 1. Daily Contests Card Slider */}
                <ContestSliderRow
                  sectionTitle="Daily Contests"
                  sectionSubtitle="Fast 24-hour trivia & speedrun blitzes reset every midnight."
                  contestsList={dailyContestsData}
                  sectionIcon={<Zap className="w-5 h-5 text-[#CEF500]" />}
                  joinedContestIds={joinedContestIds}
                  setSelectedContestModal={setSelectedContestModal}
                />

                {/* 2. Weekly Contests Card Slider */}
                <ContestSliderRow
                  sectionTitle="Weekly Contests"
                  sectionSubtitle="7-day creator & talent cups with massive prize pools."
                  contestsList={weeklyContestsData}
                  sectionIcon={<Trophy className="w-5 h-5 text-[#B983FF]" />}
                  joinedContestIds={joinedContestIds}
                  setSelectedContestModal={setSelectedContestModal}
                />

                {/* 3. Job Contests Card Slider */}
                <ContestSliderRow
                  sectionTitle="Job Contests & Hiring Sprints"
                  sectionSubtitle="Compete in tech & design sprints to land direct job passes and internships."
                  contestsList={jobContestsData}
                  sectionIcon={<Briefcase className="w-5 h-5 text-[#3B82F6]" />}
                  joinedContestIds={joinedContestIds}
                  setSelectedContestModal={setSelectedContestModal}
                />

                {/* 4. Mega Contests Card Slider */}
                <ContestSliderRow
                  sectionTitle="Mega Contests & Bumper Cups"
                  sectionSubtitle="Grand bumper prize pools up to ₹30,00,000 cash!"
                  contestsList={megaContestsData}
                  sectionIcon={<Flame className="w-5 h-5 text-[#EF4444]" />}
                  joinedContestIds={joinedContestIds}
                  setSelectedContestModal={setSelectedContestModal}
                />

                {/* 5. Completed Contests Card Slider (Displayed by default) */}
                <ContestSliderRow
                  sectionTitle="Completed Contests & Hall of Fame"
                  sectionSubtitle="Past completed contests, prize pool distributions, and verified winners."
                  contestsList={defaultCompletedContestsData}
                  sectionIcon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  joinedContestIds={joinedContestIds}
                  setSelectedContestModal={setSelectedContestModal}
                />
              </div>
            ) : (
              /* Filtered Contests Grid View when user searches or selects a pill */
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white font-poppins">Filtered Contests</h3>
                    <p className="text-xs text-[#A69EC6] font-medium mt-1">Showing active competitions for "{selectedCategory}".</p>
                  </div>
                  <span className="text-xs text-[#CEF500] font-bold cursor-pointer hover:underline">
                    {filteredContests.length} Contests Found
                  </span>
                </div>

                {filteredContests.length === 0 ? (
                  <div className="w-full py-12 px-6 bg-[#1C1335]/60 border border-[#2E1E54] rounded-[28px] text-center space-y-2">
                    <p className="text-sm font-bold text-white">No active competitions matching "{selectedCategory}"</p>
                    <p className="text-xs text-[#A69EC6]">Try selecting another category pill or clearing your search filter.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                    {filteredContests.map((c) => {
                      const isJoined = joinedContestIds.includes(c.id);
                      return (
                        <div 
                          key={c.id}
                          onClick={() => setSelectedContestModal(c)}
                          className="bg-[#1C1335]/90 backdrop-blur-xl border border-[#2E1E54] hover:border-[#CEF500]/90 rounded-[28px] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(206,245,0,0.25)] group flex flex-col justify-between relative cursor-pointer"
                        >
                          {/* Top Neon Glow Edge Accent */}
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CEF500] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

                          {/* Gaming Card Image Header */}
                          <div className="relative h-44 overflow-hidden bg-black">
                            <img 
                              src={c.image} 
                              alt={c.title} 
                              className="w-full h-full object-cover opacity-85 group-hover:scale-110 transition-transform duration-700 brightness-95" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1335] via-transparent to-black/40" />

                            {/* Cyber Top Badges */}
                            <div className="absolute top-3 left-3 bg-[#0D0714]/90 backdrop-blur-md text-[#CEF500] border border-[#CEF500]/50 text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 z-10">
                              <span className="w-2 h-2 rounded-full bg-[#CEF500] animate-ping" />
                              <span>{c.sponsorLogo}</span>
                              <span className="font-poppins">{c.sponsor}</span>
                            </div>

                            <div className="absolute top-3 right-3 bg-[#0D0714]/90 backdrop-blur-md text-white border border-[#2E1E54] group-hover:border-[#CEF500]/40 text-xs font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1 z-10">
                              <Clock className="w-3.5 h-3.5 text-[#CEF500]" />
                              <span>{c.timeLeft}</span>
                            </div>
                          </div>

                          {/* Gaming Card Info Body */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-[#A69EC6] uppercase tracking-widest">
                                  {c.category}
                                </span>
                                <span className="text-xs font-black text-[#0D0714] bg-[#CEF500] px-2.5 py-0.5 rounded-full shadow-sm font-poppins">
                                  {c.entryFee}
                                </span>
                              </div>

                              <h4 className="text-base font-black text-white group-hover:text-[#CEF500] transition-colors leading-snug font-poppins line-clamp-1" title={c.title}>
                                {c.title}
                              </h4>

                              <p className="text-xs text-[#A69EC6] font-medium line-clamp-2 leading-relaxed">
                                {c.description}
                              </p>
                            </div>

                            {/* Gaming HUD Stats Box */}
                            <div className="pt-3 border-t border-[#2E1E54]/80 space-y-3">
                              <div className="bg-[#0D0714]/80 border border-[#2E1E54] group-hover:border-[#CEF500]/30 rounded-2xl p-3 flex items-center justify-between shadow-inner transition-colors">
                                <div>
                                  <span className="text-[9px] text-[#A69EC6] font-bold uppercase tracking-wider block">Cash Pool</span>
                                  <span className="text-sm font-black text-[#CEF500] font-poppins drop-shadow-[0_0_8px_rgba(206,245,0,0.3)]">{c.prizeCash}</span>
                                </div>

                                <div className="text-right">
                                  <span className="text-[9px] text-[#A69EC6] font-bold uppercase tracking-wider block">Players</span>
                                  <span className="text-xs font-black text-white font-poppins">{c.participants}</span>
                                </div>
                              </div>

                              {/* Action Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedContestModal(c);
                                }}
                                className={`w-full py-3 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                                  isJoined 
                                    ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-emerald-500/20' 
                                    : 'bg-gradient-to-r from-[#CEF500] via-[#A3E635] to-[#CEF500] text-[#0D0714] shadow-[#CEF500]/30 hover:scale-[1.03] active:scale-95'
                                }`}
                              >
                                {isJoined ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    <span>Joined ✓</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Enter Contest</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: WATCH ADS & EARN DISPLAY */}
        {activeTab === 'ads' && (
          <section className="space-y-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-poppins">Watch Sponsored Ads & Earn Instant Coins</h3>
              <p className="text-xs text-[#A69EC6] font-medium mt-1">Watch 30-second sponsored video ads from top brands and collect real coins immediately!</p>
            </div>

            {adsData.length === 0 ? (
              <div className="w-full py-12 px-6 bg-[#1C1335]/60 border border-[#2E1E54] rounded-[28px] text-center space-y-2">
                <p className="text-sm font-bold text-white">No active sponsored ads currently available</p>
                <p className="text-xs text-[#A69EC6]">Check back later for sponsored video ads to earn instant coin rewards.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {adsData.map((ad) => (
                  <div 
                    key={ad.id}
                    className="bg-[#1C1335] border border-[#2E1E54] hover:border-[#CEF500] rounded-[32px] overflow-hidden shadow-2xl flex flex-col justify-between transition-all hover:-translate-y-1"
                  >
                    <div className="relative h-48 overflow-hidden bg-black">
                      <img src={ad.thumbnail} alt={ad.title} className="w-full h-full object-cover opacity-80 hover:scale-105 transition-all duration-500" />
                      <div className="absolute top-3 right-3 bg-[#CEF500] text-[#0D0714] text-xs font-black px-3 py-1 rounded-full shadow-lg">
                        {ad.badge}
                      </div>
                      <div className="absolute bottom-3 left-3 bg-[#0D0714]/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                        ⏱️ {ad.duration}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-[#CEF500] font-black uppercase tracking-wider">{ad.brand}</span>
                        <h4 className="text-base font-black text-white mt-1 leading-snug">{ad.title}</h4>
                        <p className="text-xs text-[#A69EC6] font-medium mt-2 leading-relaxed">{ad.description}</p>
                      </div>

                      <button
                        onClick={() => handleStartWatchAd(ad)}
                        className="mt-6 w-full py-3 bg-[#CEF500] hover:bg-[#CEF500]/90 text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-full shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-[#0D0714]" />
                        <span>Watch Ad (+{ad.rewardCoins} Coins)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: SPECIAL OFFERS & VOUCHERS DISPLAY */}
        {activeTab === 'offers' && (
          <section className="space-y-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-poppins">Exclusive Sponsor Deals & Vouchers</h3>
              <p className="text-xs text-[#A69EC6] font-medium mt-1">Redeem your accumulated coin rewards for real discount vouchers and gift cards!</p>
            </div>

            {offersData.length === 0 ? (
              <div className="w-full py-12 px-6 bg-[#1C1335]/60 border border-[#2E1E54] rounded-[28px] text-center space-y-2">
                <p className="text-sm font-bold text-white">No active vouchers or offers currently available</p>
                <p className="text-xs text-[#A69EC6]">Check back later for exclusive partner deals and reward coupons.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {offersData.map((offer) => (
                  <div 
                    key={offer.id}
                    className="bg-gradient-to-b from-[#1C1335] to-[#2E1E54]/40 border border-[#2E1E54] hover:border-[#CEF500] rounded-[32px] p-6 shadow-2xl flex flex-col justify-between relative group"
                  >
                    <div className="absolute top-4 right-4 bg-[#CEF500] text-[#0D0714] text-[10px] font-black px-3 py-1 rounded-full">
                      {offer.tag}
                    </div>

                    <div>
                      <div className="text-4xl mb-3">{offer.image}</div>
                      <span className="text-[10px] font-black uppercase text-[#B983FF] tracking-wider">{offer.brand}</span>
                      <h4 className="text-base font-black text-white mt-1 leading-snug">{offer.title}</h4>
                      <div className="mt-3 text-lg font-black text-[#CEF500]">{offer.discountText}</div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-[#A69EC6] font-bold uppercase block">Required</span>
                        <span className="text-sm font-black text-[#CEF500]">🪙 {offer.coinCost}</span>
                      </div>

                      <button
                        onClick={() => handleRedeemOffer(offer)}
                        className="px-5 py-2.5 bg-[#CEF500] hover:bg-[#CEF500]/90 text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-full shadow-md transition-all hover:scale-105 active:scale-95"
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 4: LUCKY WHEEL DISPLAY */}
        {activeTab === 'wheel' && (
          <section className="max-w-xl mx-auto text-center space-y-6 bg-gradient-to-b from-[#1C1335] to-[#2E1E54]/60 border border-[#CEF500] p-10 rounded-[36px] shadow-2xl">
            <h3 className="text-3xl font-black text-white font-poppins flex items-center justify-center gap-2">
              <Zap className="w-8 h-8 text-[#CEF500]" />
              <span>Wheel of Fortune Daily Spin</span>
            </h3>
            <p className="text-xs text-[#A69EC6] font-medium">Spin the wheel to win up to 1,000 bonus coins instantly!</p>

            <div className="relative w-64 h-64 mx-auto my-6 flex items-center justify-center">
              <div className="absolute -top-3 z-20 text-3xl text-[#CEF500] animate-bounce">
                ▼
              </div>

              <div 
                style={{ transform: `rotate(${wheelRotation}deg)` }}
                className="w-full h-full rounded-full border-8 border-[#CEF500] bg-gradient-to-tr from-[#0D0714] via-[#1C1335] to-[#B983FF] shadow-2xl flex items-center justify-center text-[#CEF500] font-black text-lg transition-transform duration-[3000ms] ease-out"
              >
                <div className="text-center space-y-1">
                  <div className="text-4xl">🎡</div>
                  <div className="text-xs font-black tracking-widest text-white">SPIN NOW</div>
                </div>
              </div>
            </div>

            {wheelWinMessage && (
              <div className="p-4 rounded-2xl bg-[#CEF500] text-[#0D0714] font-black text-sm animate-bounce shadow-lg">
                {wheelWinMessage}
              </div>
            )}

            <button
              onClick={handleSpinWheel}
              disabled={isSpinning}
              className={`w-full py-4 rounded-full font-black text-base uppercase tracking-wider shadow-xl transition-all ${
                isSpinning
                  ? 'bg-[#1C1335] text-white/40 border border-[#2E1E54] cursor-not-allowed'
                  : 'bg-[#CEF500] hover:bg-[#CEF500]/90 text-[#0D0714] hover:scale-105 active:scale-95 shadow-[#CEF500]/40'
              }`}
            >
              {isSpinning ? 'Spinning Wheel...' : '⚡ SPIN WHEEL NOW ⚡'}
            </button>
          </section>
        )}

      </main>

      {/* ==================== MODAL: CONTEST DETAILS ==================== */}
      <AnimatePresence>
        {selectedContestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1C1335] border border-[#CEF500] w-full max-w-2xl rounded-[36px] overflow-hidden shadow-2xl relative"
            >
              <div className="relative h-56 bg-black">
                <img src={selectedContestModal.image} alt="" className="w-full h-full object-cover opacity-80" />
                <button 
                  onClick={() => setSelectedContestModal(null)}
                  className="absolute top-4 right-4 bg-[#0D0714]/80 text-white hover:text-[#CEF500] p-2 rounded-full border border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 bg-[#0D0714]/90 text-[#CEF500] px-3.5 py-1 rounded-full text-xs font-black border border-[#CEF500]/40">
                  {selectedContestModal.sponsorLogo} {selectedContestModal.sponsor}
                </div>
              </div>

              <div className="p-8 space-y-6 text-left">
                <div>
                  <h3 className="text-2xl font-black text-white font-poppins">{selectedContestModal.title}</h3>
                  <p className="text-xs text-[#A69EC6] mt-2 leading-relaxed">{selectedContestModal.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 bg-[#0D0714] p-4 rounded-2xl border border-[#2E1E54] text-center">
                  <div>
                    <span className="text-[10px] text-[#A69EC6] font-bold uppercase block">Cash Pool</span>
                    <span className="text-sm font-black text-[#CEF500]">{selectedContestModal.prizeCash}</span>
                  </div>
                  <div className="border-x border-[#2E1E54]">
                    <span className="text-[10px] text-[#A69EC6] font-bold uppercase block">Coin Pool</span>
                    <span className="text-sm font-black text-[#B983FF]">{selectedContestModal.prizeCoins}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A69EC6] font-bold uppercase block">Entry Fee</span>
                    <span className="text-sm font-black text-white">{selectedContestModal.entryFee}</span>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="bg-[#0D0714] border border-[#CEF500]/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-white">
                      <LogIn className="w-4 h-4 text-[#CEF500] shrink-0" />
                      <span className="font-semibold">Log in to enter this contest and claim cash & coin rewards!</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedContestModal(null);
                        if (onNavigateToLogin) onNavigateToLogin();
                        else navigate('/login');
                      }}
                      className="px-4 py-2 bg-[#CEF500] text-[#0D0714] font-black rounded-full text-xs uppercase tracking-wider shrink-0 hover:scale-105 transition-transform cursor-pointer shadow-md"
                    >
                      Login Now
                    </button>
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => setSelectedContestModal(null)}
                    className="flex-1 py-3 bg-transparent text-white border border-[#2E1E54] font-black text-xs uppercase tracking-wider rounded-full hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmJoinContest(selectedContestModal)}
                    className={`flex-1 py-3 font-black text-xs uppercase tracking-wider rounded-full shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      !isAuthenticated
                        ? 'bg-gradient-to-r from-[#CEF500] via-[#A3E635] to-[#CEF500] text-[#0D0714] shadow-[#CEF500]/30 hover:scale-105'
                        : joinedContestIds.includes(selectedContestModal.id || selectedContestModal._id)
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-[#CEF500] text-[#0D0714] shadow-[#CEF500]/30 hover:scale-105'
                    }`}
                  >
                    {!isAuthenticated ? (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Login to Enter Contest</span>
                      </>
                    ) : joinedContestIds.includes(selectedContestModal.id || selectedContestModal._id) ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Already Joined ✓</span>
                      </>
                    ) : (
                      <span>Confirm & Join Contest</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== MODAL: AD PLAYER SIMULATOR ==================== */}
      <AnimatePresence>
        {activeAd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1C1335] border border-[#CEF500] w-full max-w-lg rounded-[36px] p-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black uppercase text-[#CEF500]">{activeAd.brand}</span>
                <button onClick={() => setActiveAd(null)} className="text-white/60 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative h-60 rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10 mb-4">
                <img src={activeAd.thumbnail} alt="" className="w-full h-full object-cover opacity-60" />
                
                {isWatchingAd && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 space-y-2">
                    <div className="w-16 h-16 rounded-full bg-[#CEF500] text-[#0D0714] font-black text-2xl flex items-center justify-center animate-spin">
                      {adTimer}
                    </div>
                    <span className="text-xs font-bold text-white">Watching Sponsored Video Ad...</span>
                  </div>
                )}

                {adCompleted && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1C1335]/95 border border-[#CEF500] space-y-2 text-center p-4">
                    <CheckCircle2 className="w-12 h-12 text-[#CEF500]" />
                    <span className="text-lg font-black text-white">Reward Claimed!</span>
                    <span className="text-sm font-extrabold text-[#CEF500]">+{activeAd.rewardCoins} Coins Added</span>
                  </div>
                )}
              </div>

              <h4 className="text-base font-black text-white">{activeAd.title}</h4>
              <p className="text-xs text-[#A69EC6] mt-1">{activeAd.description}</p>

              <div className="mt-6 flex justify-end">
                {adCompleted ? (
                  <button
                    onClick={() => setActiveAd(null)}
                    className="w-full py-3 bg-[#CEF500] text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-full"
                  >
                    Done & Collect Coins
                  </button>
                ) : (
                  <span className="text-xs text-white/50 font-bold">Please wait {adTimer}s to complete...</span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== MODAL: OFFER CLAIMED CODE ==================== */}
      <AnimatePresence>
        {claimedOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1C1335] border border-[#CEF500] w-full max-w-md rounded-[36px] p-6 shadow-2xl text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#CEF500] text-[#0D0714] mx-auto flex items-center justify-center text-3xl">
                {claimedOffer.image}
              </div>

              <h4 className="text-xl font-black text-white font-poppins">{claimedOffer.title}</h4>
              <p className="text-xs text-[#A69EC6]">Your voucher coupon code has been generated!</p>

              <div className="p-4 bg-[#0D0714] border border-[#CEF500] rounded-2xl flex items-center justify-between">
                <span className="text-[#CEF500] font-mono font-black text-lg tracking-wider">{claimedOffer.code}</span>
                <button
                  onClick={() => handleCopyCode(claimedOffer.code)}
                  className="px-3 py-1.5 bg-[#CEF500] text-[#0D0714] rounded-lg text-xs font-black flex items-center gap-1 hover:scale-105"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <button
                onClick={() => setClaimedOffer(null)}
                className="w-full py-3 bg-[#CEF500] text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-full shadow-lg"
              >
                Close & Use Code
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== LEGAL DOCUMENT MODAL (PRIVACY POLICY & TERMS OF SERVICE) ==================== */}
      <AnimatePresence>
        {legalModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-3xl bg-[#1C1335] border border-[#CEF500]/40 rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#2E1E54] pb-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-7 h-7 text-[#CEF500]" />
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white font-poppins">
                      {legalModal.title}
                    </h3>
                    <p className="text-xs text-[#A69EC6] font-medium">
                      Official Platform Compliance Document
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setLegalModal(prev => ({ ...prev, isOpen: false }))}
                  className="p-2 rounded-full bg-[#0D0714] text-[#A69EC6] hover:text-white hover:bg-[#2E1E54] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto pr-2 space-y-4 text-xs sm:text-sm text-[#A69EC6] leading-relaxed flex-1 scrollbar-thin scrollbar-thumb-[#CEF500]/30">
                {legalModal.loading ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#CEF500]/30 border-t-[#CEF500] mx-auto" />
                    <p className="text-xs font-semibold text-white/70">Fetching document from server...</p>
                  </div>
                ) : (
                  <div 
                    className="prose prose-invert max-w-none text-[#A69EC6] space-y-4 font-sans [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#CEF500] [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:text-white font-sans leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: legalModal.content }}
                  />
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#2E1E54] flex justify-end">
                <button
                  onClick={() => setLegalModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-6 py-2.5 bg-[#CEF500] text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-full shadow-lg hover:scale-105 transition-transform cursor-pointer"
                >
                  I Understand & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== DESKTOP FOOTER (SINGLE ROW) ==================== */}
      <footer className="bg-transparent py-8 text-xs text-[#A69EC6] relative z-10">
        <div className="max-w-[1480px] w-[calc(100%-48px)] mx-auto pr-0 lg:pr-24 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold">
          <span>© 2026 Reality Contest Platform. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/privacy-policy')} className="hover:text-[#CEF500] transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => navigate('/terms-of-service')} className="hover:text-[#CEF500] transition-colors cursor-pointer">Terms of Service</button>
            <button onClick={() => navigate('/support-contact')} className="hover:text-[#CEF500] transition-colors cursor-pointer">Support & Contact</button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default WebsiteHome;
