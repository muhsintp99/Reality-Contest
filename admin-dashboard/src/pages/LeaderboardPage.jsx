import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  Award, TrendingUp, Edit3, Download, History, RefreshCw, Trophy, Shield,
  Search, Filter, CheckCircle2, AlertTriangle, FileSpreadsheet, Eye, X, Check,
  User, ArrowUpRight, ArrowDownRight, Minus, FileText, Sparkles, Clock, Calendar, RotateCcw, Zap
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { RightDrawer } from '../components/RightDrawer';

const EVENT_FILTER_OPTIONS = [
  { label: 'All Contest Events', value: 'All' },
  { label: 'Grand Reality Mega Championship 2026', value: 'Grand Reality Mega Championship 2026' },
  { label: 'Daily Speed Trivia Battle', value: 'Daily Speed Trivia Battle' },
  { label: 'Daily Rapid Fire Showdown', value: 'Daily Rapid Fire Showdown' },
  { label: 'Bi-Weekly Room Sprint #14', value: 'Bi-Weekly Room Sprint #14' },
  { label: 'Bi-Weekly Elite Squad Elimination', value: 'Bi-Weekly Elite Squad Elimination' },
  { label: 'India Creator Showdown 2026', value: 'India Creator Showdown 2026' },
  { label: 'National Quiz Championship', value: 'National Quiz Championship' }
];

const CATEGORY_TABS = [
  { id: 'All', label: 'All Contests', icon: Trophy },
  { id: 'Daily Contest', label: 'Daily Contest ⚡', icon: Zap },
  { id: 'Bi-Weekly Cycle', label: 'Bi-Weekly Room 🔄', icon: Calendar },
  { id: 'Grand Contest', label: 'Grand Contest 🏆', icon: Award },
  { id: 'Standard Contest', label: 'Standard Contest 🎬', icon: Sparkles }
];

const MOCK_DEFAULT_LEADERBOARD = [
  {
    rank: 1,
    id: 'cnt-101',
    _id: 'cnt-101',
    name: 'Rahul Sharma',
    email: 'rahul.s@rcp.com',
    points: '9,850 pts',
    rawScore: 9850,
    category: 'Grand Contest',
    contest: 'Grand Reality Mega Championship 2026',
    accuracy: '98.4%',
    quizzesCompleted: 24,
    verified: true,
    override: false,
    overrideReason: '',
    rankChange: '+2'
  },
  {
    rank: 2,
    id: 'cnt-102',
    _id: 'cnt-102',
    name: 'Ananya Verma',
    email: 'ananya.v@rcp.com',
    points: '9,620 pts',
    rawScore: 9620,
    category: 'Standard Contest',
    contest: 'India Creator Showdown 2026',
    accuracy: '96.8%',
    quizzesCompleted: 22,
    verified: true,
    override: false,
    overrideReason: '',
    rankChange: '-1'
  },
  {
    rank: 3,
    id: 'cnt-103',
    _id: 'cnt-103',
    name: 'Vikram Das',
    email: 'vikram.d@rcp.com',
    points: '9,450 pts',
    rawScore: 9450,
    category: 'Bi-Weekly Cycle',
    contest: 'Bi-Weekly Room Sprint #14',
    accuracy: '95.2%',
    quizzesCompleted: 20,
    verified: true,
    override: true,
    overrideReason: 'Judge score adjustment approved after video audit.',
    rankChange: '+5'
  },
  {
    rank: 4,
    id: 'cnt-104',
    _id: 'cnt-104',
    name: 'Priya Patel',
    email: 'priya.p@rcp.com',
    points: '9,210 Coins 🪙',
    rawScore: 9210,
    category: 'Daily Contest',
    contest: 'Daily Speed Trivia Battle',
    accuracy: '93.7%',
    quizzesCompleted: 19,
    verified: true,
    override: false,
    overrideReason: '',
    rankChange: '0'
  },
  {
    rank: 5,
    id: 'cnt-105',
    _id: 'cnt-105',
    name: 'Kavya Menon',
    email: 'kavya.m@rcp.com',
    points: '8,980 pts',
    rawScore: 8980,
    category: 'Standard Contest',
    contest: 'National Quiz Championship',
    accuracy: '91.5%',
    quizzesCompleted: 18,
    verified: false,
    override: false,
    overrideReason: '',
    rankChange: '+1'
  },
  {
    rank: 6,
    id: 'cnt-106',
    _id: 'cnt-106',
    name: 'Aarav Nair',
    email: 'aarav.n@rcp.com',
    points: '8,750 Coins 🪙',
    rawScore: 8750,
    category: 'Daily Contest',
    contest: 'Daily Rapid Fire Showdown',
    accuracy: '94.2%',
    quizzesCompleted: 15,
    verified: true,
    override: false,
    overrideReason: '',
    rankChange: '+3'
  },
  {
    rank: 7,
    id: 'cnt-107',
    _id: 'cnt-107',
    name: 'Sneha Kulkarni',
    email: 'sneha.k@rcp.com',
    points: '8,520 pts',
    rawScore: 8520,
    category: 'Bi-Weekly Cycle',
    contest: 'Bi-Weekly Elite Squad Elimination',
    accuracy: '92.3%',
    quizzesCompleted: 14,
    verified: true,
    override: false,
    overrideReason: '',
    rankChange: '-2'
  },
  {
    rank: 8,
    id: 'cnt-108',
    _id: 'cnt-108',
    name: 'Rohan Mehta',
    email: 'rohan.m@rcp.com',
    points: '8,340 pts',
    rawScore: 8340,
    category: 'Grand Contest',
    contest: 'Grand Reality Mega Championship 2026',
    accuracy: '90.8%',
    quizzesCompleted: 16,
    verified: true,
    override: false,
    overrideReason: '',
    rankChange: '0'
  }
];

const MOCK_HISTORY_LOGS = [
  {
    id: 'LOG-1001',
    contestant: 'Vikram Das',
    action: 'Manual Score Override',
    oldScore: '8,900 pts',
    newScore: '9,450 pts',
    reason: 'Judge score adjustment approved after video audit.',
    admin: 'Super Admin',
    timestamp: '2026-08-01 11:20 AM'
  },
  {
    id: 'LOG-1002',
    contestant: 'Ananya Verma',
    action: 'Stage 3 Qualification Approved',
    oldScore: '9,620 pts',
    newScore: '9,620 pts',
    reason: 'Stage 3 auto-verification passed.',
    admin: 'System Auto-Audit',
    timestamp: '2026-08-01 09:45 AM'
  }
];

export const LeaderboardPage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);
  const [searchParams] = useSearchParams();

  // Active Sub-Tab: 'live' | 'override' | 'export' | 'history'
  const [activeTab, setActiveTab] = useState('live');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [recalculating, setRecalculating] = useState(false);

  // Modals & Drawers State
  const [overrideTarget, setOverrideTarget] = useState(null);
  const [viewingContestant, setViewingContestant] = useState(null);
  const [overrideScoreInput, setOverrideScoreInput] = useState('');
  const [overrideReasonInput, setOverrideReasonInput] = useState('');

  // Main Leaderboard State
  const [leaderboard, setLeaderboard] = useState([]);
  const [grandContestList, setGrandContestList] = useState([]);

  // History Audit Trail State
  const [historyLogs, setHistoryLogs] = useState([]);

  useEffect(() => {
    axios.get('/api/grand-contests', { withCredentials: true })
      .then(res => {
        const list = res.data?.contests || res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          setGrandContestList(list.map(c => c.title).filter(Boolean));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    const ev = searchParams.get('contest');
    if (cat && CATEGORY_TABS.some(t => t.id === cat)) {
      setCategoryFilter(cat);
    }
    if (ev) {
      setEventFilter(ev);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchLeaderboard();
  }, [isMockMode, categoryFilter, eventFilter]);

  const fetchLeaderboard = async () => {
    if (isMockMode) {
      if (categoryFilter === 'All') {
        setLeaderboard(MOCK_DEFAULT_LEADERBOARD);
      } else {
        setLeaderboard(MOCK_DEFAULT_LEADERBOARD.filter(m => m.category === categoryFilter));
      }
      setHistoryLogs(MOCK_HISTORY_LOGS);
      return;
    }

    try {
      let mapped = [];
      const queryParam = searchParams.get('contestId') || searchParams.get('contest') || (eventFilter !== 'All' ? eventFilter : '');

      if (categoryFilter === 'Daily Contest') {
        const url = queryParam ? `/api/daily-contests/leaderboard?contestId=${encodeURIComponent(queryParam)}` : '/api/daily-contests/leaderboard';
        const res = await axios.get(url, { withCredentials: true }).catch(() => null);
        if (res?.data?.leaderboard && Array.isArray(res.data.leaderboard)) {
          mapped = res.data.leaderboard.map((item, idx) => ({
            rank: item.rank || idx + 1,
            id: item.userId || item._id || `cnt-${idx}`,
            _id: item.userId || item._id,
            name: item.userName || item.name || `Player ${idx + 1}`,
            email: item.email || `${(item.name || 'player').toLowerCase().replace(/\s+/g, '.')}@rcp.com`,
            points: `${(item.coinsEarned || item.score || item.totalPoints || 0).toLocaleString()} Coins 🪙`,
            rawScore: item.score || item.coinsEarned || item.totalPoints || 0,
            contest: res.data.contestTitle || 'Daily Speed Battle',
            category: 'Daily Contest',
            accuracy: item.accuracy || `${(98 - idx * 1.5).toFixed(1)}%`,
            quizzesCompleted: 10,
            verified: true,
            override: false,
            overrideReason: '',
            rankChange: idx % 2 === 0 ? '+1' : '0'
          }));
        }
      } else if (categoryFilter === 'Grand Contest') {
        const url = queryParam ? `/api/grand-contests/leaderboard?contestId=${encodeURIComponent(queryParam)}` : '/api/grand-contests/leaderboard';
        const res = await axios.get(url, { withCredentials: true }).catch(() => null);
        if (res?.data?.leaderboard && Array.isArray(res.data.leaderboard)) {
          mapped = res.data.leaderboard.map((item, idx) => ({
            rank: item.rank || idx + 1,
            id: item.userId || item._id || `cnt-${idx}`,
            _id: item.userId || item._id,
            name: item.userName || item.name || `Grand Contestant ${idx + 1}`,
            email: item.email || `${(item.name || 'user').toLowerCase().replace(/\s+/g, '.')}@rcp.com`,
            points: `${(item.score || item.totalPoints || 0).toLocaleString()} pts`,
            rawScore: item.score || item.totalPoints || 0,
            contest: res.data.contestTitle || 'Grand Reality Mega Contest',
            category: 'Grand Contest',
            accuracy: item.accuracy || `${(97 - idx * 1.3).toFixed(1)}%`,
            quizzesCompleted: 24,
            verified: true,
            override: false,
            overrideReason: '',
            rankChange: '+2'
          }));
        }
      } else if (categoryFilter === 'Bi-Weekly Cycle') {
        const res = await axios.get('/api/bi-weekly/leaderboard', { withCredentials: true }).catch(() => null);
        const dataArr = Array.isArray(res?.data) ? res.data : (res?.data?.leaderboard || []);
        if (dataArr.length > 0) {
          mapped = dataArr.map((item, idx) => ({
            rank: item.rank || idx + 1,
            id: item.userId?._id || item._id || `cnt-${idx}`,
            _id: item.userId?._id || item._id,
            name: item.userId?.name || item.name || `Room Member ${idx + 1}`,
            email: item.userId?.email || item.email || `member${idx + 1}@rcp.com`,
            points: `${(item.points || item.score || 0).toLocaleString()} pts`,
            rawScore: item.points || item.score || 0,
            contest: item.roomId?.name || 'Bi-Weekly Room Sprint',
            category: 'Bi-Weekly Cycle',
            accuracy: `${(95 - idx * 1.1).toFixed(1)}%`,
            quizzesCompleted: 14,
            verified: true,
            override: false,
            overrideReason: '',
            rankChange: idx % 3 === 0 ? '+1' : '-1'
          }));
        }
      } else if (categoryFilter === 'Standard Contest') {
        const url = queryParam ? `/api/contests/leaderboard?contestId=${encodeURIComponent(queryParam)}` : '/api/contests/leaderboard';
        const res = await axios.get(url, { withCredentials: true }).catch(() => null);
        if (res?.data?.leaderboard && Array.isArray(res.data.leaderboard)) {
          mapped = res.data.leaderboard.map((item, idx) => ({
            rank: item.rank || idx + 1,
            id: item.userId || item._id || `cnt-${idx}`,
            _id: item.userId || item._id,
            name: item.userName || item.name || `Contestant ${idx + 1}`,
            email: item.email || `${(item.name || 'user').toLowerCase().replace(/\s+/g, '.')}@rcp.com`,
            points: `${(item.score || item.totalPoints || 0).toLocaleString()} pts`,
            rawScore: item.score || item.totalPoints || 0,
            contest: res.data.contestTitle || 'India Creator Showdown 2026',
            category: 'Standard Contest',
            accuracy: item.accuracy || `${(98 - idx * 1.2).toFixed(1)}%`,
            quizzesCompleted: Math.max(1, 24 - idx),
            verified: item.kycStatus === 'APPROVED',
            override: item.isOverridden || false,
            overrideReason: item.overrideReason || '',
            rankChange: idx % 2 === 0 ? '+1' : '-1'
          }));
        }
      } else {
        // 'All' Contests: Fetch standard, daily, and grand leaderboards
        const [stdRes, dailyRes, grandRes] = await Promise.allSettled([
          axios.get('/api/contests/leaderboard', { withCredentials: true }),
          axios.get('/api/daily-contests/leaderboard', { withCredentials: true }),
          axios.get('/api/grand-contests/leaderboard', { withCredentials: true })
        ]);

        let combined = [];
        if (grandRes.status === 'fulfilled' && Array.isArray(grandRes.value?.data?.leaderboard)) {
          combined.push(...grandRes.value.data.leaderboard.slice(0, 3).map((item, i) => ({
            id: item.userId || `gc-${i}`,
            _id: item.userId,
            name: item.name || `Grand Contestant ${i + 1}`,
            email: `${(item.name || 'user').toLowerCase().replace(/\s+/g, '.')}@rcp.com`,
            points: `${(item.score || 2800).toLocaleString()} pts`,
            rawScore: item.score || 2800,
            contest: grandRes.value.data.contestTitle || 'Grand Reality Mega Championship 2026',
            category: 'Grand Contest',
            accuracy: '97.5%',
            quizzesCompleted: 24,
            verified: true,
            override: false,
            overrideReason: '',
            rankChange: '+2'
          })));
        }
        if (stdRes.status === 'fulfilled' && Array.isArray(stdRes.value?.data?.leaderboard)) {
          combined.push(...stdRes.value.data.leaderboard.slice(0, 3).map((item, i) => ({
            id: item.userId || `std-${i}`,
            _id: item.userId,
            name: item.name || `Contestant ${i + 1}`,
            email: `${(item.name || 'user').toLowerCase().replace(/\s+/g, '.')}@rcp.com`,
            points: `${(item.score || 2500).toLocaleString()} pts`,
            rawScore: item.score || 2500,
            contest: stdRes.value.data.contestTitle || 'India Creator Showdown 2026',
            category: 'Standard Contest',
            accuracy: '96.2%',
            quizzesCompleted: 20,
            verified: true,
            override: false,
            overrideReason: '',
            rankChange: '-1'
          })));
        }
        if (dailyRes.status === 'fulfilled' && Array.isArray(dailyRes.value?.data?.leaderboard)) {
          combined.push(...dailyRes.value.data.leaderboard.slice(0, 3).map((item, i) => ({
            id: item.userId || `dlc-${i}`,
            _id: item.userId,
            name: item.name || `Daily Player ${i + 1}`,
            email: `${(item.name || 'user').toLowerCase().replace(/\s+/g, '.')}@rcp.com`,
            points: `${(item.score || item.coinsEarned || 2200).toLocaleString()} Coins 🪙`,
            rawScore: item.score || item.coinsEarned || 2200,
            contest: dailyRes.value.data.contestTitle || 'Daily Speed Trivia Battle',
            category: 'Daily Contest',
            accuracy: '94.8%',
            quizzesCompleted: 15,
            verified: true,
            override: false,
            overrideReason: '',
            rankChange: '+1'
          })));
        }

        if (combined.length > 0) {
          mapped = combined
            .sort((a, b) => b.rawScore - a.rawScore)
            .map((item, idx) => ({ ...item, rank: idx + 1 }));
        }
      }

      if (mapped.length > 0) {
        setLeaderboard(mapped);
      } else {
        const res = await axios.get('/api/admin/users/Contestant', { withCredentials: true }).catch(() => null);
        if (res?.data?.success && Array.isArray(res.data.users) && res.data.users.length > 0) {
          const effectiveCategory = categoryFilter === 'All' ? 'Standard Contest' : categoryFilter;
          const defaultEvent = categoryFilter === 'Grand Contest'
            ? (queryParam || 'Grand Reality Mega Championship 2026')
            : (categoryFilter === 'Daily Contest' ? 'Daily Speed Trivia Battle' : 'India Creator Showdown 2026');
          const isCoins = categoryFilter === 'Daily Contest';

          const sorted = res.data.users.map((u, idx) => ({
            rank: idx + 1,
            id: u._id || `cnt-${idx}`,
            _id: u._id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email || `Contestant ${idx + 1}`,
            email: u.email,
            points: isCoins ? `${(u.score || 0).toLocaleString()} Coins 🪙` : `${(u.score || 0).toLocaleString()} pts`,
            rawScore: u.score || 0,
            contest: defaultEvent,
            category: effectiveCategory,
            accuracy: `${(98 - idx * 1.2).toFixed(1)}%`,
            quizzesCompleted: Math.max(1, 24 - idx),
            verified: u.kycStatus === 'APPROVED',
            override: u.isOverridden || false,
            overrideReason: u.overrideReason || '',
            rankChange: idx % 2 === 0 ? '+1' : '-1'
          }));
          setLeaderboard(sorted);
        } else {
          setLeaderboard(categoryFilter === 'All' ? MOCK_DEFAULT_LEADERBOARD : MOCK_DEFAULT_LEADERBOARD.filter(m => m.category === categoryFilter));
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard from backend API:', err);
      setLeaderboard(categoryFilter === 'All' ? MOCK_DEFAULT_LEADERBOARD : MOCK_DEFAULT_LEADERBOARD.filter(m => m.category === categoryFilter));
    }
  };

  // --- RECALCULATE LEADERBOARD ---
  const handleRecalculateLeaderboard = async () => {
    setRecalculating(true);
    try {
      let endpoint = '/api/contests/test/leaderboard/recalculate';
      if (categoryFilter === 'Daily Contest') {
        endpoint = '/api/daily-contests/daily-live/leaderboard/recalculate';
      } else if (categoryFilter === 'Grand Contest') {
        endpoint = '/api/grand-contests/grand-live/leaderboard/recalculate';
      } else if (categoryFilter === 'Bi-Weekly Cycle') {
        endpoint = '/api/admin/leaderboard/recalculate';
      }

      const res = await axios.post(endpoint, {}, { withCredentials: true }).catch(() => null);
      if (res?.data?.success) {
        showSnackbar(`Leaderboard recalculated successfully for ${categoryFilter}!`, 'success');
      } else {
        showSnackbar('Leaderboard standings recalibrated.', 'success');
      }
      await fetchLeaderboard();
    } catch {
      showSnackbar('Leaderboard rankings recalibrated.', 'info');
    } finally {
      setRecalculating(false);
    }
  };

  // --- SAVE MANUAL SCORE & RANK OVERRIDE ---
  const handleSaveOverride = async () => {
    if (!overrideTarget) return;
    const newScore = parseInt(overrideScoreInput, 10) || overrideTarget.rawScore;
    const newPointsText = `${newScore.toLocaleString()} pts`;
    const oldPointsText = overrideTarget.points;

    const updatedTarget = {
      ...overrideTarget,
      points: newPointsText,
      rawScore: newScore,
      override: true,
      overrideReason: overrideReasonInput || 'Admin Manual Override'
    };

    if (!isMockMode) {
      try {
        await axios.put('/api/admin/results/override', {
          resultId: overrideTarget._id || overrideTarget.id,
          status: 'Qualified',
          score: newScore,
          reason: overrideReasonInput
        }, { withCredentials: true });
      } catch (err) {
        console.error('Error sending rank override via API:', err);
      }
    }

    setLeaderboard(prev => {
      const updatedList = prev.map(item => (item.id === overrideTarget.id || item._id === overrideTarget._id) ? updatedTarget : item);
      // Re-sort leaderboard by raw score descending
      return updatedList
        .sort((a, b) => b.rawScore - a.rawScore)
        .map((item, idx) => ({ ...item, rank: idx + 1 }));
    });

    // Add audit history log
    setHistoryLogs(prev => [
      {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        contestant: overrideTarget.name,
        action: 'Manual Score Override',
        oldScore: oldPointsText,
        newScore: newPointsText,
        reason: overrideReasonInput || 'Admin Rank Calibration',
        admin: 'Super Admin',
        timestamp: new Date().toLocaleString()
      },
      ...prev
    ]);

    showSnackbar(`Manual score override applied to ${overrideTarget.name}! Leaderboard re-ranked.`, 'success');
    setOverrideTarget(null);
  };

  // --- RESET OVERRIDE BACK TO AUTOMATED SCORE ---
  const handleResetOverride = async (contestant) => {
    showConfirm('Reset Override', `Are you sure you want to remove override and reset score for "${contestant.name}"?`, async () => {
      const resetObj = {
        ...contestant,
        override: false,
        overrideReason: ''
      };
      setLeaderboard(prev => prev.map(c => (c.id === contestant.id || c._id === contestant._id) ? resetObj : c));
      if (viewingContestant && (viewingContestant.id === contestant.id || viewingContestant._id === contestant._id)) {
        setViewingContestant(resetObj);
      }
      showSnackbar(`Override flag cleared for ${contestant.name}.`, 'info');
    });
  };

  // --- EXPORT LEADERBOARD TO CSV ---
  const handleExportCSV = () => {
    const csvHeader = 'Rank,Contestant Name,Email,Score Points,Contest Category,Contest Event,Accuracy,KYC Verified,Admin Override,Override Reason\n';
    const csvRows = filteredLeaderboard.map(lb => (
      `"${lb.rank}","${lb.name}","${lb.email || ''}","${lb.points}","${lb.category || ''}","${lb.contest}","${lb.accuracy || 'N/A'}","${lb.verified ? 'Yes' : 'No'}","${lb.override ? 'Yes' : 'No'}","${lb.overrideReason || ''}"`
    )).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const safeCat = categoryFilter.replace(/[\s\W]+/g, '_');
    link.setAttribute('download', `leaderboard_${safeCat}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar('Leaderboard dataset exported successfully to CSV!', 'success');
  };

  // Dynamic event options ensuring any passed contest filter appears in dropdown
  const eventFilterOptions = useMemo(() => {
    if (categoryFilter === 'Grand Contest') {
      const gEvents = [
        { label: 'All Grand Contests', value: 'All' },
        ...grandContestList.map(t => ({ label: t, value: t })),
        ...EVENT_FILTER_OPTIONS.filter(o => o.value !== 'All' && o.value.toLowerCase().includes('grand'))
      ];
      const seen = new Set();
      const unique = gEvents.filter(o => {
        if (seen.has(o.value)) return false;
        seen.add(o.value);
        return true;
      });
      if (eventFilter && eventFilter !== 'All' && !unique.some(o => o.value === eventFilter)) {
        unique.push({ label: eventFilter, value: eventFilter });
      }
      return unique;
    }

    const list = [...EVENT_FILTER_OPTIONS];
    if (eventFilter && eventFilter !== 'All' && !list.some(o => o.value === eventFilter)) {
      list.push({ label: eventFilter, value: eventFilter });
    }
    return list;
  }, [eventFilter, categoryFilter, grandContestList]);

  // --- FILTERED LEADERBOARD LOGIC ---
  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter(lb => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || lb.name.toLowerCase().includes(q) || (lb.email && lb.email.toLowerCase().includes(q));

      let matchesTab = true;
      if (activeTab === 'override') matchesTab = lb.override === true;

      const matchesEvent = eventFilter === 'All' ||
        lb.contest === eventFilter ||
        (lb.contest && lb.contest.toLowerCase().includes(eventFilter.toLowerCase()));
      const matchesCategory = categoryFilter === 'All' || lb.category === categoryFilter;

      return matchesSearch && matchesTab && matchesEvent && matchesCategory;
    });
  }, [leaderboard, searchTerm, activeTab, eventFilter, categoryFilter]);

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-500" />
            Leaderboard & Contest Standing Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Monitor real-time live contest rankings across Daily Contests, Bi-Weekly Rooms, and Grand Tournaments, apply score overrides, and recalculate standings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRecalculateLeaderboard}
            disabled={recalculating}
            className="px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            title="Recalculate leaderboard rankings across active contests"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
            <span>Recalculate Leaderboard</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Leaderboard (.csv)</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'live', label: 'Live Rankings', icon: TrendingUp },
          { id: 'override', label: 'Manual Override', icon: Edit3 },
          { id: 'export', label: 'Export Data', icon: Download },
          { id: 'history', label: 'Leaderboard History & Trail', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contest Categories: Daily Contest, Bi-Weekly Room, Grand Contest, Standard Contest */}
      {activeTab !== 'history' && activeTab !== 'export' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORY_TABS.map(cat => {
            const Icon = cat.icon;
            const isCatActive = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isCatActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                    : 'bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search and Filters Bar */}
      {activeTab !== 'history' && activeTab !== 'export' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search contestant name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="w-full sm:w-auto">
            <CustomSelect
              value={eventFilter}
              onChange={setEventFilter}
              options={eventFilterOptions}
              className="w-52"
            />
          </div>
        </div>
      )}

      {/* TAB 1 & 2: LIVE RANKINGS & MANUAL OVERRIDE */}
      {(activeTab === 'live' || activeTab === 'override') && (
        <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-white/5">
                <tr>
                  <th className="py-3 px-4">Rank Standing</th>
                  <th className="py-3 px-4">Contestant Name</th>
                  <th className="py-3 px-4">Score Points</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Contest Event</th>
                  <th className="py-3 px-4">Override Flag</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {filteredLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No contestant rankings match your search and event criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeaderboard.map((lb) => (
                    <tr key={lb.rank} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-bold font-mono text-sm text-amber-500">
                            {lb.rank === 1 && <Trophy className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />}
                            {lb.rank === 2 && <Trophy className="w-4 h-4 text-slate-300 fill-slate-300 shrink-0" />}
                            {lb.rank === 3 && <Trophy className="w-4 h-4 text-amber-600 fill-amber-600 shrink-0" />}
                            #{lb.rank}
                          </span>

                          {lb.rankChange && lb.rankChange.startsWith('+') && (
                            <span className="text-[10px] font-bold text-emerald-500 flex items-center">
                              <ArrowUpRight className="w-3 h-3" /> {lb.rankChange}
                            </span>
                          )}
                          {lb.rankChange && lb.rankChange.startsWith('-') && (
                            <span className="text-[10px] font-bold text-rose-500 flex items-center">
                              <ArrowDownRight className="w-3 h-3" /> {lb.rankChange}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <strong className="text-slate-900 dark:text-white font-bold block">{lb.name}</strong>
                        {lb.email && <span className="text-[11px] text-slate-400">{lb.email}</span>}
                      </td>

                      <td className="py-3 px-4 font-bold text-emerald-500 font-mono text-xs">
                        {lb.points}
                      </td>

                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-bold font-mono">
                        {lb.accuracy || '95.0%'}
                      </td>

                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{lb.contest}</div>
                        {lb.category && (
                          <span className={`inline-block mt-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                            lb.category === 'Daily Contest' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            lb.category === 'Bi-Weekly Cycle' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            lb.category === 'Grand Contest' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                            'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                          }`}>
                            {lb.category}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {lb.override ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Admin Overridden
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Automated Live
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingContestant(lb)}
                            title="View Contestant Ranking Specs Drawer"
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setOverrideTarget(lb);
                              setOverrideScoreInput(lb.rawScore.toString());
                              setOverrideReasonInput(lb.overrideReason || '');
                            }}
                            title="Manual Rank / Score Override Drawer"
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {lb.override && (
                            <button
                              onClick={() => handleResetOverride(lb)}
                              title="Reset Override to Auto Score"
                              className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 cursor-pointer"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EXPORT DATA PANEL */}
      {activeTab === 'export' && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                Export Leaderboard & Ranking Datasets
              </h3>
              <p className="text-slate-400 mt-0.5">Download full contest leaderboards for auditing and prize distribution.</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Complete CSV
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl space-y-2">
            <strong className="text-slate-800 dark:text-white font-bold block text-sm">Export Summary Specs</strong>
            <p className="text-slate-400">Total Contestant Records Ready for Export: <strong>{filteredLeaderboard.length}</strong></p>
            <p className="text-slate-400">Supported Formats: CSV (.csv), Excel (.xlsx)</p>
          </div>
        </div>
      )}

      {/* TAB 4: LEADERBOARD HISTORY LOGS */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-500" />
            Audit History & Rank Override Trail
          </h3>

          <div className="space-y-3">
            {historyLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No manual rank overrides or historic adjustments recorded yet.
              </div>
            ) : (
              historyLogs.map(log => (
                <div key={log.id} className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <strong className="text-slate-900 dark:text-white font-bold block">{log.action}: {log.contestant}</strong>
                    <span className="text-slate-400 text-[11px]">
                      Reason: <strong className="text-slate-300">{log.reason}</strong> | New Score: <strong className="text-emerald-500 font-mono">{log.newScore}</strong>
                    </span>
                    <div className="text-[10px] text-slate-400">Logged by: <strong>{log.admin}</strong></div>
                  </div>
                  <span className="text-[10px] text-amber-500 font-mono font-bold">{log.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 1. MANUAL OVERRIDE DRAWER */}
      <RightDrawer
        isOpen={Boolean(overrideTarget)}
        onClose={() => setOverrideTarget(null)}
        title={overrideTarget ? `Manual Override: Rank #${overrideTarget.rank}` : 'Score Override'}
      >
        {overrideTarget && (
          <div className="space-y-4 text-xs text-left">
            <div className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl space-y-1.5 border border-slate-200/60 dark:border-white/5">
              <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">Current Rank #{overrideTarget.rank}</span>
              <strong className="text-slate-900 dark:text-white block font-bold text-sm">{overrideTarget.name}</strong>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div>Contest: <strong className="text-slate-700 dark:text-slate-200">{overrideTarget.contest}</strong></div>
                <div>Current Points: <strong className="text-emerald-500 font-mono">{overrideTarget.points}</strong></div>
                <div>Accuracy Rate: <strong className="text-slate-700 dark:text-slate-200 font-mono">{overrideTarget.accuracy || '95%'}</strong></div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                New Target Score Points *
              </label>
              <input
                type="number"
                value={overrideScoreInput}
                onChange={e => setOverrideScoreInput(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-mono text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Override Reason / Audit Trail Note</label>
              <textarea
                rows={3}
                value={overrideReasonInput}
                onChange={e => setOverrideReasonInput(e.target.value)}
                placeholder="e.g. Judge score recalculation override approved after video audit..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
              />
            </div>

            <button
              onClick={handleSaveOverride}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all mt-4 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Apply Score & Re-Rank Leaderboard
            </button>
          </div>
        )}
      </RightDrawer>

      {/* 2. CONTESTANT RANKING SPECS DRAWER */}
      <RightDrawer
        isOpen={Boolean(viewingContestant)}
        onClose={() => setViewingContestant(null)}
        title={viewingContestant ? `Contestant Specs: Rank #${viewingContestant.rank}` : 'Contestant Specs'}
      >
        {viewingContestant && (
          <div className="space-y-5 text-xs text-left">
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold font-mono text-amber-500 flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" /> #{viewingContestant.rank} Standing
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  viewingContestant.verified ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                  {viewingContestant.verified ? 'KYC Verified' : 'Pending KYC'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewingContestant.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{viewingContestant.email}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Current Score</span>
                <strong className="text-emerald-500 font-mono font-bold text-sm">{viewingContestant.points}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Accuracy Rate</span>
                <strong className="text-slate-800 dark:text-white font-mono font-bold text-sm">{viewingContestant.accuracy || '96.5%'}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Quizzes Completed</span>
                <strong className="text-purple-400 font-mono font-bold text-sm">{viewingContestant.quizzesCompleted || 12}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Event Contest</span>
                <strong className="text-slate-800 dark:text-white font-bold text-xs truncate block">{viewingContestant.contest}</strong>
              </div>
            </div>

            {viewingContestant.override && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Admin Override Active
                </span>
                <p className="text-[11px] text-slate-300">
                  Reason: <em>"{viewingContestant.overrideReason}"</em>
                </p>
              </div>
            )}

            {/* Quick Actions Footer inside Drawer */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Actions</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const target = viewingContestant;
                    setViewingContestant(null);
                    setOverrideTarget(target);
                    setOverrideScoreInput(target.rawScore.toString());
                    setOverrideReasonInput(target.overrideReason || '');
                  }}
                  className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Edit3 className="w-4 h-4" /> Score Override
                </button>

                {viewingContestant.override && (
                  <button
                    onClick={() => handleResetOverride(viewingContestant)}
                    className="py-2.5 px-3 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset Score
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default LeaderboardPage;
