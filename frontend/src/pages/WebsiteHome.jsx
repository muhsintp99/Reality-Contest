import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateWalletBalance } from '../store/authSlice';
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

  // Favorites / Like state simulation
  const [likedItems, setLikedItems] = useState(['c1']);

  // Scroll to top visibility check
  const [showQuickTop, setShowQuickTop] = useState(false);

  const [categoryPills, setCategoryPills] = useState(['All', 'Trending', 'Top', 'New', 'Free Entry', 'Creator Showdown', 'Daily Quiz']);

  useEffect(() => {
    if (user?.coins) {
      setCoinBalance(user.coins);
    }
  }, [user]);

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

  // Featured Auto-Slider Carousel Data & State
  const featuredSlidesData = [
    {
      id: 'f1',
      badge: 'CURATED & TRENDING',
      title: 'Discover weekly challenge',
      sponsor: '🥤 Sponsored by Pepsi Co',
      description: 'The original slow instrumental best playlists & video talent entry. Submit your entry to win ₹10,00,000 cash pool + 25,000 Coins!',
      prizeCash: '₹10,00,000',
      prizeCoins: '25,000 Coins',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-[#B983FF] via-[#A855F7] to-[#C084FC]'
    },
    {
      id: 'f2',
      badge: 'HIGH OCTANE eSPORTS',
      title: 'Razer Speedrun Arena',
      sponsor: '🎮 Sponsored by Razer Gaming',
      description: 'Submit your tactical gaming speedruns & highlight reels. Top streamers win ₹5,00,000 cash pool + Razer Pro Gear!',
      prizeCash: '₹5,00,000',
      prizeCoins: '15,00,000 Coins',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-[#CEF500] via-[#10B981] to-[#059669]'
    },
    {
      id: 'f3',
      badge: 'TECH & INNOVATION',
      title: 'Zebronics Audio Innovation Cup',
      sponsor: '🎧 Sponsored by Zebronics',
      description: 'Showcase your tech innovation, AI prompt creations, or audio reviews. Win ₹7,50,000 cash & national recognition!',
      prizeCash: '₹7,50,000',
      prizeCoins: '30,000 Coins',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-[#6366F1] via-[#A855F7] to-[#EC4899]'
    },
    {
      id: 'f4',
      badge: 'FOOD & CREATOR VIBES',
      title: 'Swiggy Gourmet Reel Showdown',
      sponsor: '🍔 Sponsored by Swiggy',
      description: 'Upload 30-second gourmet food reels & food vlog creations. Split ₹3,00,000 cash pool & Swiggy vouchers!',
      prizeCash: '₹3,00,000',
      prizeCoins: '20,000 Coins',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-[#F59E0B] via-[#EF4444] to-[#EC4899]'
    }
  ];

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

  const handleConfirmJoinContest = (contest) => {
    if (!isAuthenticated) {
      setSelectedContestModal(null);
      navigate('/login');
      return;
    }
    setJoinedContestIds(prev => [...prev, contest.id]);
    setSelectedContestModal(null);
    alert(`🎉 Success! You joined "${contest.title}". Best of luck!`);
  };

  // Data Collections
  const dailyContestsData = [
    {
      id: 'd1',
      title: 'Daily Speed Quiz - Pop & Cinema',
      sponsor: 'Swiggy',
      sponsorLogo: '🍔',
      prizeCash: '₹50,000',
      prizeCoins: '5,000 Coins',
      entryFee: 'Free',
      participants: '22,400 Players',
      timeLeft: '1 Hour Left',
      category: 'Daily Quiz',
      tags: ['Daily Blitz', 'Free Entry'],
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      description: '10 quick questions about Indian pop culture and cinema. Top 100 players split the prize pool!'
    },
    {
      id: 'd2',
      title: 'Daily Tech & AI Trivia Sprint',
      sponsor: 'Zebronics',
      sponsorLogo: '🎧',
      prizeCash: '₹75,00,0',
      prizeCoins: '8,000 Coins',
      entryFee: '20 Coins',
      participants: '18,200 Players',
      timeLeft: '3 Hours Left',
      category: 'Daily Quiz',
      tags: ['Live Quiz', 'Tech'],
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      description: 'Fast 15-question sprint on AI tools, prompt engineering, and futuristic gadgets!'
    },
    {
      id: 'd3',
      title: 'Daily Gaming Speedrun Arena',
      sponsor: 'Razer Gaming',
      sponsorLogo: '🎮',
      prizeCash: '₹1,00,000',
      prizeCoins: '12,000 Coins',
      entryFee: '50 Coins',
      participants: '15,600 Players',
      timeLeft: '6 Hours Left',
      category: 'Gaming',
      tags: ['eSports', 'Daily Blitz'],
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      description: 'Upload your 30-second gaming clutch moment or speedrun clip. Daily leaderboards reset midnight!'
    },
    {
      id: 'd4',
      title: 'Daily Voucher Quiz - Shoppers Special',
      sponsor: 'Amazon Pay',
      sponsorLogo: '🛍️',
      prizeCash: '₹60,000',
      prizeCoins: '10,000 Coins',
      entryFee: 'Free',
      participants: '29,100 Players',
      timeLeft: '4 Hours Left',
      category: 'Free Entry',
      tags: ['Daily Voucher', 'Free Entry'],
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
      description: 'Answer 5 shopping & deal questions correctly to win instant gift cards!'
    }
  ];

  const weeklyContestsData = [
    {
      id: 'w1',
      title: 'Discover Weekly Creator Challenge',
      sponsor: 'Pepsi Co',
      sponsorLogo: '🥤',
      prizeCash: '₹10,00,000',
      prizeCoins: '25,000 Coins',
      entryFee: '50 Coins',
      participants: '14,250 Players',
      timeLeft: '2 Days Left',
      category: 'Creator Showdown',
      tags: ['Weekly Cup', 'Trending'],
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      description: 'Submit your 60-second video creation showcasing music, dance, or viral skills. Top entries win cash & viral feature!'
    },
    {
      id: 'w2',
      title: 'Weekly Eco Journalism & Green Voice',
      sponsor: 'Tata Foundation',
      sponsorLogo: '🌱',
      prizeCash: '₹5,00,000',
      prizeCoins: '15,00,000 Coins',
      entryFee: '100 Coins',
      participants: '5,410 Players',
      timeLeft: '4 Days Left',
      category: 'Weekly Cup',
      tags: ['Social Cause', 'Big Prize'],
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      description: 'Highlight environmental solutions in an audio/video report. Judged by experts with national recognition.'
    },
    {
      id: 'w3',
      title: 'Weekly Creator Music Showdown',
      sponsor: 'Spotify India',
      sponsorLogo: '🎵',
      prizeCash: '₹8,00,000',
      prizeCoins: '20,000 Coins',
      entryFee: '75 Coins',
      participants: '11,300 Players',
      timeLeft: '5 Days Left',
      category: 'Music',
      tags: ['Weekly Cup', 'Creator'],
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      description: 'Original covers, instrumental solos, or beatmaking tracks. Winner gets official playlist placement!'
    },
    {
      id: 'w4',
      title: 'Weekly Food Vlog & Reel Showdown',
      sponsor: 'Swiggy Gourmet',
      sponsorLogo: '🍔',
      prizeCash: '₹4,50,000',
      prizeCoins: '18,000 Coins',
      entryFee: '30 Coins',
      participants: '9,800 Players',
      timeLeft: '3 Days Left',
      category: 'Food',
      tags: ['Weekly Cup', 'Reels'],
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      description: 'Showcase street food hidden gems or home recipes. Top foodies win cash rewards and Swiggy Black VIP status!'
    }
  ];

  const jobContestsData = [
    {
      id: 'j1',
      title: 'Frontend & React Developer Sprint 2026',
      sponsor: 'Tech Hiring Guild',
      sponsorLogo: '💼',
      prizeCash: '₹3,50,000',
      prizeCoins: 'Job Pass',
      entryFee: 'Free',
      participants: '7,400 Candidates',
      timeLeft: '6 Days Left',
      category: 'Job Contests',
      tags: ['Hiring Hackathon', 'Career Opportunity'],
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      description: 'Build a high-performance React dashboard component. Top 10 developers receive direct interview calls from hiring partners!'
    },
    {
      id: 'j2',
      title: 'UI/UX Design Systems & Figma Sprint',
      sponsor: 'Product Design Studio',
      sponsorLogo: '🎨',
      prizeCash: '₹2,50,000',
      prizeCoins: 'Internship',
      entryFee: 'Free',
      participants: '4,900 Candidates',
      timeLeft: '4 Days Left',
      category: 'Job Contests',
      tags: ['Design Challenge', 'Career Pass'],
      image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80',
      description: 'Design a mobile-first dark mode banking app interface. Selected designers win cash rewards & paid summer fellowships!'
    },
    {
      id: 'j3',
      title: 'AI Prompt Engineering & ML Model Arena',
      sponsor: 'AI Innovation Labs',
      sponsorLogo: '🤖',
      prizeCash: '₹4,00,000',
      prizeCoins: 'Career Grant',
      entryFee: 'Free',
      participants: '8,200 Candidates',
      timeLeft: '5 Days Left',
      category: 'Job Contests',
      tags: ['AI Hiring', 'High Cash'],
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      description: 'Solve real-world NLP and computer vision tasks. Top rankers fast-tracked for Junior ML Engineer positions!'
    },
    {
      id: 'j4',
      title: 'Digital Growth & Social Marketing Challenge',
      sponsor: 'GrowthX Alliance',
      sponsorLogo: '🚀',
      prizeCash: '₹2,00,000',
      prizeCoins: 'Fellowship',
      entryFee: 'Free',
      participants: '6,100 Candidates',
      timeLeft: '3 Days Left',
      category: 'Job Contests',
      tags: ['Marketing Hiring', 'Free Entry'],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      description: 'Submit an innovative viral launch strategy deck for a D2C product. Winners receive mentorship & job offers!'
    }
  ];

  const megaContestsData = [
    {
      id: 'm1',
      title: 'India Creator Showdown Grand Finals',
      sponsor: 'Jio Entertainment',
      sponsorLogo: '🏆',
      prizeCash: '₹25,00,000',
      prizeCoins: '1,00,000 Coins',
      entryFee: '150 Coins',
      participants: '45,000 Players',
      timeLeft: '10 Days Left',
      category: 'Mega Contests',
      tags: ['Mega Grand Pool', 'National TV'],
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      description: 'The mega annual talent championship! Bumper ₹25 Lakhs cash prize pool + celebrity mentorship for final 10!'
    },
    {
      id: 'm2',
      title: 'SaaS Pitch & Startup Mega Innovation Cup',
      sponsor: 'T-Hub Startup Arena',
      sponsorLogo: '💡',
      prizeCash: '₹15,00,000',
      prizeCoins: '50,000 Coins',
      entryFee: '200 Coins',
      participants: '3,120 Players',
      timeLeft: '6 Days Left',
      category: 'Mega Contests',
      tags: ['VC Funding', 'Mega Grant'],
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      description: 'Pitch your breakthrough tech idea or MVP deck. Top 3 startups win grant funding and angel investor intros!'
    },
    {
      id: 'm3',
      title: 'National Gaming eSports Championship',
      sponsor: 'BGMI Arena',
      sponsorLogo: '🎮',
      prizeCash: '₹20,00,000',
      prizeCoins: '75,000 Coins',
      entryFee: '100 Coins',
      participants: '62,000 Players',
      timeLeft: '8 Days Left',
      category: 'Mega Contests',
      tags: ['Mega eSports', 'Trophy'],
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      description: '4-player squad tournament across 3 knockout stages. Broadcasted live with ₹20 Lakhs total prize pool!'
    },
    {
      id: 'm4',
      title: 'Global AI Innovators Mega Grand Slam',
      sponsor: 'OpenAI Community',
      sponsorLogo: '🌟',
      prizeCash: '₹30,00,000',
      prizeCoins: '1,50,000 Coins',
      entryFee: '250 Coins',
      participants: '18,500 Players',
      timeLeft: '12 Days Left',
      category: 'Mega Contests',
      tags: ['Global Mega', 'AI Grant'],
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      description: 'Build autonomous AI agents or creative generative art. Global winner takes home ₹30,00,000 cash grant!'
    }
  ];

  const contestsData = [
    ...dailyContestsData,
    ...weeklyContestsData,
    ...jobContestsData,
    ...megaContestsData
  ];

  const adsData = [
    {
      id: 'ad1',
      title: 'Pepsi Refresh & Vibe Challenge',
      brand: 'Pepsi Co',
      duration: '30 sec',
      rewardCoins: 50,
      badge: '+50 Coins',
      thumbnail: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
      description: 'Watch Pepsi\'s latest summer commercial to earn instant coin rewards.'
    },
    {
      id: 'ad2',
      title: 'Zebronics Wireless Earbuds Reveal',
      brand: 'Zebronics Audio',
      duration: '30 sec',
      rewardCoins: 75,
      badge: '+75 Coins',
      thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
      description: 'Discover active noise cancellation tech and collect your audio bonus.'
    },
    {
      id: 'ad3',
      title: 'Swiggy Gourmet Fast Delivery',
      brand: 'Swiggy',
      duration: '30 sec',
      rewardCoins: 100,
      badge: '+100 Coins',
      thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
      description: 'Get 50% OFF your next food order and earn 100 bonus coins instantly.'
    },
    {
      id: 'ad4',
      title: 'Samsung Galaxy AI Experience',
      brand: 'Samsung',
      duration: '30 sec',
      rewardCoins: 120,
      badge: '+120 Coins',
      thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
      description: 'See the power of Galaxy AI live in action and unlock maximum daily coins.'
    }
  ];

  const offersData = [
    {
      id: 'o1',
      title: 'Swiggy ₹500 Gourmet Voucher',
      brand: 'Swiggy',
      category: 'Food & Dining',
      coinCost: 1500,
      discountText: '₹500 OFF',
      tag: 'Popular',
      code: 'HAKA-SWIGGY-500X',
      validTill: '30 Aug 2026',
      image: '🍔'
    },
    {
      id: 'o2',
      title: 'Amazon ₹200 E-Gift Card',
      brand: 'Amazon',
      category: 'Shopping',
      coinCost: 2000,
      discountText: '₹200 Instant Credit',
      tag: 'Best Value',
      code: 'AMZ-HAKA-200GIFT',
      validTill: '15 Sep 2026',
      image: '📦'
    },
    {
      id: 'o3',
      title: 'Zebronics Headphone 40% Coupon',
      brand: 'Zebronics',
      category: 'Electronics',
      coinCost: 600,
      discountText: '40% Flat Discount',
      tag: 'Exclusive',
      code: 'ZEB-40OFF-HAKA',
      validTill: '31 Aug 2026',
      image: '🎧'
    },
    {
      id: 'o4',
      title: 'Netflix 1 Month VIP Sub',
      brand: 'Netflix',
      category: 'Subscriptions',
      coinCost: 4500,
      discountText: '1 Month Free VIP',
      tag: 'Hot Deal',
      code: 'NFLX-HAKA-PASS99',
      validTill: '10 Oct 2026',
      image: '🍿'
    }
  ];

  // Search & Filter Logic
  const filteredContests = contestsData.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory || c.tags.includes(selectedCategory);
    const matchesSearch = searchQuery === '' || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.sponsor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Reusable 4.5 Cards Slider Renderer for Contest Categories
  const renderContestSliderRow = (sectionTitle, sectionSubtitle, contestsList, sectionIcon) => {
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
                style={{ scrollSnapAlign: 'start' }}
                className="min-w-[85%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[21.5%] xl:min-w-[21.5%] 2xl:min-w-[21.5%] w-[21.5%] shrink-0 bg-[#1C1335]/90 backdrop-blur-xl border border-[#2E1E54] hover:border-[#CEF500]/90 rounded-[28px] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(206,245,0,0.25)] group flex flex-col justify-between relative"
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
                      onClick={() => setSelectedContestModal(c)}
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
      </section>
    );
  };

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
            if (isAuthenticated) navigate('/profile');
            else navigate('/login');
          }}
          className="w-10 h-10 rounded-full bg-[#0D0714] border border-[#CEF500]/50 p-0.5 hover:scale-110 transition-transform shadow-md"
          title="User Profile"
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
                if (isAuthenticated) navigate('/profile');
                else navigate('/login');
              }}
              className="relative w-10 h-10 shrink-0 rounded-full bg-[#0D0714] border-2 border-[#CEF500] p-0.5 shadow-lg shadow-[#CEF500]/30 hover:scale-110 transition-all flex items-center justify-center overflow-hidden cursor-pointer"
              title={isAuthenticated ? 'User Profile / Dashboard' : 'Login / Register'}
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
                onClick={() => handleManualSlide((activeSlideIndex - 1 + featuredSlidesData.length) % featuredSlidesData.length)}
                className="p-2 rounded-full bg-[#1C1335] border border-[#2E1E54] hover:border-[#CEF500] text-[#A69EC6] hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
                title="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleManualSlide((activeSlideIndex + 1) % featuredSlidesData.length)}
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

        {/* ==================== TAB CONTENT SECTIONS ==================== */}

        {/* TAB 1: CONTESTS SLIDERS & ARENA (DAILY, WEEKLY, JOB, MEGA) */}
        {activeTab === 'contests' && (
          <section className="space-y-12">
            
            {/* If Category is 'All' and no search query, show the 4 Category Card Sliders */}
            {selectedCategory === 'All' && searchQuery === '' ? (
              <div className="space-y-12">
                {/* 1. Daily Contests Card Slider */}
                {renderContestSliderRow(
                  'Daily Contests',
                  'Fast 24-hour trivia & speedrun blitzes reset every midnight.',
                  dailyContestsData,
                  <Zap className="w-5 h-5 text-[#CEF500]" />
                )}

                {/* 2. Weekly Contests Card Slider */}
                {renderContestSliderRow(
                  'Weekly Contests',
                  '7-day creator & talent cups with massive prize pools.',
                  weeklyContestsData,
                  <Trophy className="w-5 h-5 text-[#B983FF]" />
                )}

                {/* 3. Job Contests Card Slider */}
                {renderContestSliderRow(
                  'Job Contests & Hiring Sprints',
                  'Compete in tech & design sprints to land direct job passes and internships.',
                  jobContestsData,
                  <Briefcase className="w-5 h-5 text-[#3B82F6]" />
                )}

                {/* 4. Mega Contests Card Slider */}
                {renderContestSliderRow(
                  'Mega Contests & Bumper Cups',
                  'Grand bumper prize pools up to ₹30,00,000 cash!',
                  megaContestsData,
                  <Flame className="w-5 h-5 text-[#EF4444]" />
                )}
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                  {filteredContests.map((c) => {
                    const isJoined = joinedContestIds.includes(c.id);
                    return (
                      <div 
                        key={c.id}
                        className="bg-[#1C1335]/90 backdrop-blur-xl border border-[#2E1E54] hover:border-[#CEF500]/90 rounded-[28px] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(206,245,0,0.25)] group flex flex-col justify-between relative"
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
                              onClick={() => setSelectedContestModal(c)}
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
          </section>
        )}

        {/* TAB 3: SPECIAL OFFERS & VOUCHERS DISPLAY */}
        {activeTab === 'offers' && (
          <section className="space-y-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-poppins">Exclusive Sponsor Deals & Vouchers</h3>
              <p className="text-xs text-[#A69EC6] font-medium mt-1">Redeem your accumulated coin rewards for real discount vouchers and gift cards!</p>
            </div>

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

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => setSelectedContestModal(null)}
                    className="flex-1 py-3 bg-transparent text-white border border-[#2E1E54] font-black text-xs uppercase tracking-wider rounded-full hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmJoinContest(selectedContestModal)}
                    className="flex-1 py-3 bg-[#CEF500] text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#CEF500]/30 hover:scale-105 transition-all"
                  >
                    Confirm & Join Contest
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

      {/* ==================== DESKTOP FOOTER (SINGLE ROW) ==================== */}
      <footer className="bg-transparent py-8 text-xs text-[#A69EC6] relative z-10">
        <div className="max-w-[1480px] w-[calc(100%-48px)] mx-auto pr-0 lg:pr-24 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold">
          <span>© 2026 Reality Contest Platform. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#CEF500] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#CEF500] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#CEF500] transition-colors">Support & Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default WebsiteHome;
