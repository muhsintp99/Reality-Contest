import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWalletBalance } from '../store/authSlice';
import { 
  Activity, Wallet, Trophy, Award, Landmark, 
  ArrowUpRight, ArrowDownRight, ArrowRight, Play, Check, Clock, Plus, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

// Component imports
import { HeroSection } from '../components/HeroSection';
import { StatCard } from '../components/StatCard';
import { TaskCard } from '../components/TaskCard';
import { Timeline } from '../components/Timeline';
import { AssistantCard } from '../components/AssistantCard';
import { ActivityTable } from '../components/ActivityTable';

export const DashboardHome = ({ onViewChange }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [depositAmount, setDepositAmount] = useState('1000');

  // React state elements for dynamic lists
  const [joinedContests, setJoinedContests] = useState([]);
  const [judgeCreativity, setJudgeCreativity] = useState(8);
  const [judgeTechnique, setJudgeTechnique] = useState(7);
  const [judgeImpact, setJudgeImpact] = useState(8);

  const [campaigns, setCampaigns] = useState([
    { id: 'c-1', name: 'Pepsi Creator Challenge', budget: 1000000, target: 'Gen Z Creators', leads: 1420, clicks: 4800, ctr: '8.4%', status: 'Active' },
    { id: 'c-2', name: 'Zebronics Audio Auditions', budget: 500000, target: 'Musicians/Gamers', leads: 950, clicks: 3200, ctr: '6.2%', status: 'Active' }
  ]);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignBudget, setNewCampaignBudget] = useState('200000');

  // Checklist states
  const [tasks, setTasks] = useState({
    Contestant: [
      { id: 't-1', text: 'Submit entry for India Creator Showdown', time: '2 hours left', priority: 'High', completed: false },
      { id: 't-2', text: 'Upload selfie KYC documents in settings', time: '1 day left', priority: 'Medium', completed: false },
      { id: 't-3', text: 'Top up test wallet balance', time: 'Anytime', priority: 'Low', completed: false }
    ],
    Judge: [
      { id: 't-1', text: 'Review Aarav Sharma dance video entry', time: '1 hour left', priority: 'High', completed: false },
      { id: 't-2', text: 'Comment on Priya Nair pitch document', time: '5 hours left', priority: 'Medium', completed: false },
      { id: 't-3', text: 'Submit biometrics KYC confirmation', time: '2 days left', priority: 'High', completed: false }
    ],
    Sponsor: [
      { id: 't-1', text: 'Launch Tata Foundation Campaign', time: 'Completed', priority: 'Medium', completed: true },
      { id: 't-2', text: 'Review Pepsi Challenge clicks performance', time: '2 hours left', priority: 'High', completed: false },
      { id: 't-3', text: 'Approve campaign budget invoice', time: 'Tomorrow', priority: 'Low', completed: false }
    ]
  });

  const handleToggleTask = (role, taskId) => {
    setTasks(prev => ({
      ...prev,
      [role]: prev[role].map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  const handleQuickDeposit = () => {
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) return;
    dispatch(updateWalletBalance(val));
    alert(`₹${val} loaded into platform wallet.`);
  };

  const handleJoinContest = (id, fee) => {
    if (!user) return;
    if (user.walletBalance < fee) {
      alert('Insufficient wallet balance. Please add funds first.');
      return;
    }
    dispatch(updateWalletBalance(-fee));
    setJoinedContests(prev => [...prev, id]);
    alert('Joined contest successfully!');
  };

  const handleSponsorLaunch = (e) => {
    e.preventDefault();
    if (!newCampaignName) return;
    const item = {
      id: `c-${Date.now()}`,
      name: newCampaignName,
      budget: parseFloat(newCampaignBudget),
      target: 'Gen Z / Creators',
      leads: 0,
      clicks: 0,
      ctr: '0.0%',
      status: 'Active'
    };
    setCampaigns(prev => [item, ...prev]);
    setNewCampaignName('');
    alert('Sponsorship campaign syndicated successfully.');
  };

  const contestsList = [
    { id: 'ct-1', title: 'India Creator Showdown 2026', fee: 499, prizePool: '₹10,00,000', sponsor: 'Pepsi Co' },
    { id: 'ct-2', title: 'National Tech & AI Quiz Arena', fee: 199, prizePool: '₹2,50,000', sponsor: 'Zebronics' },
    { id: 'ct-3', title: 'SaaS Pitch & Innovation Cup', fee: 999, prizePool: '₹15,00,000', sponsor: 'T-Hub' }
  ];

  const recentSubmissions = [
    { id: 'sub-1', name: 'Aarav Sharma', contest: 'India Creator Showdown 2026', type: 'Video', time: '10 mins ago', status: 'Approved', score: 185 },
    { id: 'sub-2', name: 'Priya Nair', contest: 'SaaS Pitch & Innovation Cup', type: 'Document', time: '1 hr ago', status: 'Pending', score: 0 },
    { id: 'sub-3', name: 'Kabir Sen', contest: 'Eco Journalism Challenge', type: 'Video', time: '3 hrs ago', status: 'Approved', score: 142 },
    { id: 'sub-4', name: 'Ananya Roy', contest: 'Street Dance Auditions', type: 'Audio/Video', time: '5 hrs ago', status: 'Pending', score: 0 }
  ];

  const userRole = user?.role || 'Contestant';

  // Customizable priorities by role
  const prioritiesMap = {
    Contestant: [
      'Register for active creator showdowns',
      'Complete KYC verification in profile tab',
      'Load test funds in your platform wallet'
    ],
    Judge: [
      'Evaluate dance_remix_mumbai.mp4 entry',
      'Calibrate metrics with Super Admins',
      'Approve biometric verification sessions'
    ],
    Sponsor: [
      'Launch Tata Foundation Innovation Arena',
      'Analyze Gen Z CTR and click stats',
      'Allocate balance to campaigns'
    ]
  };

  // Customizable statistics data by role
  const getStatsData = () => {
    switch (userRole) {
      case 'Judge':
        return [
          { label: 'Auditions Evaluated', value: '142', growth: '+8.4%', positive: true, sparkline: [10, 12, 11, 15, 14, 16], icon: Activity, desc: 'Reviews completed' },
          { label: 'Pending Assessment', value: '4', growth: '-2.4%', positive: false, sparkline: [5, 6, 4, 3, 5, 4], icon: Trophy, desc: 'In assessment queue' },
          { label: 'Average Score Given', value: '7.8', growth: '+1.2%', positive: true, sparkline: [7.5, 7.6, 7.8, 7.7, 7.9], icon: Landmark, desc: 'Out of 10 points' },
          { label: 'Evaluation Time', value: '18.5h', growth: '+15.2%', positive: true, sparkline: [2, 3, 2.5, 3.2, 3.5, 3.8], icon: Clock, desc: 'Spent checking entries' }
        ];
      case 'Sponsor':
        return [
          { label: 'Active Campaigns', value: String(campaigns.length), growth: '+14.2%', positive: true, sparkline: [2, 2, 3, 2, 2], icon: Activity, desc: 'Running challenges' },
          { label: 'Budget Disbursed', value: `₹${campaigns.reduce((acc, c) => acc + (c.budget || 0), 0).toLocaleString()}`, growth: '+18.5%', positive: true, sparkline: [20, 22, 21, 25, 23, 27], icon: Wallet, desc: 'Across active events' },
          { label: 'Total Leads Generated', value: '14,802', growth: '+6.8%', positive: true, sparkline: [8, 9, 7, 10, 11, 12], icon: Landmark, desc: 'User participants' },
          { label: 'Promotional Clicks', value: '1,245,803', growth: '-2.4%', positive: false, sparkline: [15, 16, 14, 13, 15, 14], icon: Award, desc: 'Ad interactions' }
        ];
      case 'Contestant':
      default:
        return [
          { label: 'Total Auditions', value: '184,203', growth: '+14.2%', positive: true, sparkline: [12, 14, 13, 16, 15, 18, 20], icon: Activity, desc: 'Submissions platform-wide' },
          { label: 'Active Participants', value: '24,802', growth: '+6.8%', positive: true, sparkline: [8, 9, 7, 10, 11, 9, 12], icon: Trophy, desc: 'Contestants online' },
          { label: 'My Wallet Balance', value: `₹${(user?.walletBalance ?? 1000).toLocaleString()}`, growth: '+18.5%', positive: true, sparkline: [800, 950, 900, 1000, 1050, 1200], icon: Wallet, desc: 'Available testing funds' },
          { label: 'Community Votes Cast', value: '12,45,803', growth: '-2.4%', positive: false, sparkline: [15, 16, 14, 13, 15, 12, 11], icon: Landmark, desc: 'Audience submissions' }
        ];
    }
  };

  const timelineEvents = [
    { id: 'e-1', title: 'Creator Showdown Starts', description: 'Vercel SaaS innovation challenge is now open.', time: '10:00 AM', type: 'audition', color: 'emerald', tag: 'Live' },
    { id: 'e-2', title: 'Judge Calibration Meeting', description: 'Align review metrics with administrative leads.', time: '02:30 PM', type: 'meeting', color: 'indigo', tag: 'Calendar' },
    { id: 'e-3', title: 'Biometric Verification Sync', description: 'Ensure user profiles verify biometrics.', time: '05:00 PM', type: 'review', color: 'amber', tag: 'Alert' }
  ];

  // AI Assistant text generator
  const getAssistantSummary = () => {
    switch (userRole) {
      case 'Judge':
        return `Hello Judge! I've scanned the assessment queue. You have 4 submissions waiting for scoring. Aarav Sharma's dance clip is flagged as high priority. Evaluate the metrics below to compile the scorecard.`;
      case 'Sponsor':
        return `Welcome to your sponsor console! Your active campaigns have generated over 14,800 participant entries. Clicks are stable with an average CTR of 8.4%. Launch a new challenge below to expand outreach.`;
      case 'Contestant':
      default:
        return `Hi! I've checked the competition grid for today. There are 3 active tournament auditions you can register for. Pepsi Co is offering a ₹10,00,000 prize pool. Double check your KYC tab to unlock full quiz access.`;
    }
  };

  // AI Assistant quick actions
  const getAssistantActions = () => {
    const defaultActions = [
      { label: 'General Settings', onClick: () => onViewChange('settings'), primary: false },
      { label: 'Check Wallet Balance', onClick: () => onViewChange('wallet'), primary: false }
    ];

    if (userRole === 'Contestant') {
      return [
        { label: 'Explore Contests', onClick: () => onViewChange('contests'), primary: true, icon: Zap },
        ...defaultActions
      ];
    }
    if (userRole === 'Judge') {
      return [
        { label: 'Calibrate Rubrics', onClick: () => onViewChange('settings'), primary: true, icon: Zap },
        ...defaultActions
      ];
    }
    return [
      { label: 'Review Click Analytics', onClick: () => onViewChange('wallet'), primary: true, icon: Zap },
      ...defaultActions
    ];
  };

  return (
    <div className="space-y-6 text-left pb-10">
      
      {/* 1. Hero Section Layout */}
      <HeroSection 
        userName={user?.name || 'Raj Patel'}
        role={userRole}
        priorities={prioritiesMap[userRole]}
        onViewChange={onViewChange}
      />

      {/* 2. Grid Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatsData().map((stat, idx) => (
          <StatCard
            key={idx}
            label={stat.label}
            value={stat.value}
            growth={stat.growth}
            positive={stat.positive}
            sparkline={stat.sparkline}
            icon={stat.icon}
            description={stat.desc}
          />
        ))}
      </div>

      {/* 3. Task section & Timeline row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Upcoming priorities checklist */}
        <div className="lg:col-span-7 flex flex-col">
          <TaskCard 
            title="My Personal Roadmap"
            tasks={tasks[userRole]}
            onToggleTask={(taskId) => handleToggleTask(userRole, taskId)}
          />
        </div>

        {/* Schedule timeline */}
        <div className="lg:col-span-5 flex flex-col">
          <Timeline 
            title="Today's Active Schedule"
            events={timelineEvents}
          />
        </div>
      </div>

      {/* 4. AI Assistant & Role Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: AI Assistant Card */}
        <div className="lg:col-span-7 space-y-6">
          <AssistantCard 
            assistantName="Haka Co-pilot"
            summaryText={getAssistantSummary()}
            progressValue={userRole === 'Judge' ? 80 : userRole === 'Sponsor' ? 50 : 65}
            actions={getAssistantActions()}
          />
        </div>

        {/* Right Column: Interactive Role Console widgets */}
        <div className="lg:col-span-5">
          
          {/* Contestant console: Active auditions and Wallet Loader */}
          {userRole === 'Contestant' && (
            <div className="space-y-6">
              {/* Wallet Loader */}
              <div className="glassmorphism p-5 rounded-[24px] border border-slate-200/50 dark:border-white/5 shadow-premium text-left bg-white/70 dark:bg-slate-900/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white mb-1.5">Quick Fund Loader</h3>
                <p className="text-[10px] text-slate-400 dark:text-white/35 font-medium mb-4">Replenish your balance to complete entry fees.</p>
                
                <div className="flex gap-2.5 max-w-sm">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-2 text-xs text-slate-450 dark:text-white/30 font-semibold">₹</span>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/5 rounded-xl pl-8 pr-4 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary/50"
                    />
                  </div>
                  <button
                    onClick={handleQuickDeposit}
                    className="px-4 py-1.5 bg-brandPrimary text-white rounded-xl text-xs font-bold transition-all hover:bg-brandPrimary/90 active:scale-[0.98] shadow-sm"
                  >
                    Deposit Funds
                  </button>
                </div>
              </div>

              {/* Tournament Auditions quick links */}
              <div className="glassmorphism p-5 rounded-[24px] border border-slate-200/50 dark:border-white/5 shadow-premium text-left bg-white/70 dark:bg-slate-900/40 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">Active Competitions</h3>
                <div className="space-y-3">
                  {contestsList.map(c => {
                    const joined = joinedContests.includes(c.id);
                    return (
                      <div key={c.id} className="p-4 bg-white/60 dark:bg-[#080b12]/20 border border-slate-200/40 dark:border-white/5 rounded-2xl flex flex-col justify-between hover:border-brandSecondary/30 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[9px] text-brandPrimary dark:text-brandSecondary font-bold uppercase tracking-wide">{c.sponsor}</span>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight mt-0.5">{c.title}</h4>
                          </div>
                          <span className="text-[10px] text-slate-500 font-extrabold whitespace-nowrap bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-lg">₹{c.fee}</span>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-2.5 mt-2">
                          <div className="text-[10px] text-slate-400 dark:text-white/30 font-medium">
                            Pool: <span className="font-bold text-slate-700 dark:text-white/70">{c.prizePool}</span>
                          </div>
                          <button
                            onClick={() => handleJoinContest(c.id, c.fee)}
                            disabled={joined}
                            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wide uppercase transition-all ${
                              joined 
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-brandPrimary hover:bg-brandPrimary/90 text-white shadow-sm'
                            }`}
                          >
                            {joined ? 'Registered' : 'Join Entry'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Judge: Audition metrics rating dashboard */}
          {userRole === 'Judge' && (
            <div className="glassmorphism p-5 rounded-[24px] border border-slate-200/50 dark:border-white/5 shadow-premium text-left bg-white/70 dark:bg-slate-900/40 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">Submission review</h3>
                  <p className="text-[10px] text-slate-400 dark:text-white/35 font-medium mt-0.5">Rate files using rubrics.</p>
                </div>
                <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full font-bold">In Scoring</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/30 dark:border-white/5">
                <span className="text-[9px] text-slate-450 dark:text-white/30 font-bold uppercase">dance_remix_mumbai.mp4</span>
                <p className="text-xs font-bold text-brandPrimary dark:text-brandSecondary mt-1">Aarav Sharma Audition</p>
              </div>

              <div className="space-y-4 pt-1">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-white/70 mb-2">
                    <span>Creativity Metric</span>
                    <span className="font-bold text-brandPrimary">{judgeCreativity}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={judgeCreativity}
                    onChange={(e) => setJudgeCreativity(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-150 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-brandPrimary"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-white/70 mb-2">
                    <span>Technique Rubric</span>
                    <span className="font-bold text-brandSecondary">{judgeTechnique}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={judgeTechnique}
                    onChange={(e) => setJudgeTechnique(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-150 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-brandSecondary"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-white/70 mb-2">
                    <span>Impact & Expression</span>
                    <span className="font-bold text-brandAccent">{judgeImpact}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={judgeImpact}
                    onChange={(e) => setJudgeImpact(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-150 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-brandAccent"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  const total = Math.floor((judgeCreativity + judgeTechnique + judgeImpact) * 3.3);
                  alert(`Score card published! Scored ${total}/100 points for Aarav Sharma.`);
                }}
                className="w-full py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                Publish Scoresheet Card
              </button>
            </div>
          )}

          {/* Sponsor: Campaign launching Syndication tool */}
          {userRole === 'Sponsor' && (
            <div className="space-y-6">
              {/* Campaign Syndiator form */}
              <div className="glassmorphism p-5 rounded-[24px] border border-slate-200/50 dark:border-white/5 shadow-premium text-left bg-white/70 dark:bg-slate-900/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white mb-1.5">Challenge Syndicator</h3>
                <p className="text-[10px] text-slate-400 dark:text-white/35 font-medium mb-4">Syndicate a new quiz or video competition to contestant portals.</p>
                
                <form onSubmit={handleSponsorLaunch} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-450 dark:text-white/30 uppercase">Challenge Title</label>
                    <input
                      type="text"
                      required
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      placeholder="Tata Audio Tech Audition"
                      className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/5 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-450 dark:text-white/30 uppercase">Ad Campaign Budget (₹)</label>
                    <input
                      type="number"
                      required
                      value={newCampaignBudget}
                      onChange={(e) => setNewCampaignBudget(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/5 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
                  >
                    Syndicate Challenge
                  </button>
                </form>
              </div>

              {/* Active campaigns list */}
              <div className="glassmorphism p-5 rounded-[24px] border border-slate-200/50 dark:border-white/5 shadow-premium text-left bg-white/70 dark:bg-slate-900/40 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">Campaign Budgets</h3>
                <div className="space-y-3">
                  {campaigns.map(c => (
                    <div key={c.id} className="p-3.5 bg-white/60 dark:bg-[#080b12]/20 border border-slate-200/40 dark:border-white/5 rounded-2xl flex justify-between items-center gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{c.name}</h4>
                        <p className="text-[9px] text-slate-400 dark:text-white/30 mt-1 font-medium">Budget: ₹{(c.budget || 0).toLocaleString()} • Target: {c.target}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-brandSecondary block">{c.leads} Leads</span>
                        <span className="text-[10px] text-slate-400 dark:text-white/30 font-bold">CTR: {c.ctr}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 5. Recent Activity Logs Table */}
      <ActivityTable 
        title="Auditions Log Dashboard"
        data={recentSubmissions}
        rowsPerPage={4}
      />

    </div>
  );
};

export default DashboardHome;
