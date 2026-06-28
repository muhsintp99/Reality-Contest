import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { KycVerification } from './KycVerification';
import { DeviceManager } from '../components/DeviceManager';
import { 
  User, Shield, Wallet, Trophy, CheckCircle, RefreshCw, Star, 
  Layers, Users, Sparkles, BookOpen, AlertCircle, FilePlus, Play, Check, X
} from 'lucide-react';

const CONTESTS_LIST = [
  { id: 'ct-1', title: 'India Creator Showdown 2026', fee: 499, prizePool: '₹10,00,000', sponsor: 'Pepsi Co' },
  { id: 'ct-2', title: 'National Tech & AI Quiz Arena', fee: 199, prizePool: '₹2,50,000', sponsor: 'Zebronics' },
  { id: 'ct-3', title: 'SaaS Pitch & Innovation Cup', fee: 999, prizePool: '₹15,00,000', sponsor: 'T-Hub' }
];

export const Dashboard = ({ onLogoutClick }) => {
  const { user, pendingKycs, updateProfile, updateAvatar, updateWalletBalance, fetchPendingKycs, reviewKyc, isMockMode } = useAuthStore();
  const [activeTab, setActiveTab] = useState('panels');
  const [selectedRole, setSelectedRole] = useState(user?.role || 'Contestant');

  // Profile forms
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');

  // Contestant states
  const [walletAmount, setWalletAmount] = useState('1000');
  const [joinedContests, setJoinedContests] = useState([]);
  const [submissions, setSubmissions] = useState([
    { id: 'sub-1', title: 'India Creator Showdown 2026', type: 'video', status: 'Approved', score: 185 },
    { id: 'sub-2', title: 'SaaS Pitch Innovation Cup', type: 'document', status: 'Pending', score: 0 }
  ]);

  // Judge states
  const [judgeCreativity, setJudgeCreativity] = useState(8);
  const [judgeTechnique, setJudgeTechnique] = useState(7);
  const [judgeImpact, setJudgeImpact] = useState(8);

  // Sponsor states
  const [campaigns, setCampaigns] = useState([
    { id: 'c-1', name: 'Pepsi Creator Challenge', budget: 1000000, target: 'Gen Z Creators', leads: 1420, clicks: 4800, ctr: '8.4%', status: 'Active' },
    { id: 'c-2', name: 'Zebronics Audio Auditions', budget: 500000, target: 'Musicians/Gamers', leads: 950, clicks: 3200, ctr: '6.2%', status: 'Active' }
  ]);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignBudget, setNewCampaignBudget] = useState('200000');

  useEffect(() => {
    if (['Admin', 'Super Admin'].includes(selectedRole)) {
      fetchPendingKycs();
    }
  }, [selectedRole]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const success = await updateProfile({ name: editName, phone: editPhone });
    if (success) {
      alert('Profile details updated successfully.');
    }
  };

  const handleUpdateAvatar = async () => {
    const rand = Math.floor(Math.random() * 10000);
    const av = `https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar-${rand}`;
    setEditAvatar(av);
    await updateAvatar(av);
  };

  const handleWalletDeposit = () => {
    const val = parseFloat(walletAmount);
    if (isNaN(val) || val <= 0) return;
    updateWalletBalance(val);
    alert(`₹${val} loaded into your platform wallet via simulated PG transaction.`);
  };

  const handleJoinContest = (id, fee) => {
    if (!user) return;
    if (user.walletBalance < fee) {
      alert('Insufficient wallet balance. Please add funds first.');
      return;
    }
    updateWalletBalance(-fee);
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

  const handleReviewKycSubmit = async (kycId, status) => {
    const reason = status === 'Rejected' ? 'Uploaded document text is illegible.' : undefined;
    const success = await reviewKyc(kycId, status, reason);
    if (success) {
      alert(`KYC application marked: ${status}.`);
    }
  };

  const contestsList = CONTESTS_LIST;

  return (
    <div className="min-h-screen bg-[#080b12] text-white flex flex-col">
      <header className="border-b border-white/5 bg-[#0f1424]/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 border border-purple-500/30 rounded-xl">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <span className="font-poppins font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            RCP Dashboard Shell
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-white/60">Simulator Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-transparent font-bold text-white focus:outline-none border-none cursor-pointer"
            >
              <option value="Contestant" className="bg-surfaceDark text-white">Contestant</option>
              <option value="Judge" className="bg-surfaceDark text-white">Judge</option>
              <option value="Sponsor" className="bg-surfaceDark text-white">Sponsor</option>
              <option value="Admin" className="bg-surfaceDark text-white">Admin / Super Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <img src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj'} className="w-8 h-8 rounded-full border border-purple-500 bg-surfaceDark" alt="" />
            <div className="hidden md:block text-left text-xs">
              <p className="font-bold">{user?.name}</p>
              <p className="text-white/40">{user?.role} Mode</p>
            </div>
            <button
              onClick={onLogoutClick}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl w-full mx-auto p-6 gap-8">
        
        <nav className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab('panels')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 border ${
              activeTab === 'panels' 
                ? 'bg-purple-600/10 border-purple-500/30 text-purple-400' 
                : 'bg-transparent border-transparent hover:bg-white/5 text-white/70'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Role Panel Modules</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 border ${
              activeTab === 'profile' 
                ? 'bg-purple-600/10 border-purple-500/30 text-purple-400' 
                : 'bg-transparent border-transparent hover:bg-white/5 text-white/70'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 border ${
              activeTab === 'kyc' 
                ? 'bg-purple-600/10 border-purple-500/30 text-purple-400' 
                : 'bg-transparent border-transparent hover:bg-white/5 text-white/70'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>KYC Verification</span>
            {user?.kycStatus && (
              <span className={`text-[10px] ml-auto px-2 py-0.5 rounded font-bold uppercase ${
                user.kycStatus === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                user.kycStatus === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {user.kycStatus}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 border ${
              activeTab === 'devices' 
                ? 'bg-purple-600/10 border-purple-500/30 text-purple-400' 
                : 'bg-transparent border-transparent hover:bg-white/5 text-white/70'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Device Security</span>
          </button>
        </nav>

        <main className="lg:col-span-9 space-y-6">
          {activeTab === 'panels' && (
            <div className="space-y-6">
              
              {/* Contestant Dashboard */}
              {selectedRole === 'Contestant' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                      <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-white/50 block font-semibold uppercase">Wallet balance</span>
                        <span className="text-xl font-extrabold font-poppins">₹{user?.walletBalance}</span>
                      </div>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                      <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-white/50 block font-semibold uppercase">Joined Challenges</span>
                        <span className="text-xl font-extrabold font-poppins">{joinedContests.length} Contests</span>
                      </div>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                      <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                        <Star className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-white/50 block font-semibold uppercase">XP Rankings</span>
                        <span className="text-sm font-bold block mt-0.5">850 XP • Level 3</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-purple-500/5 blur-[50px] pointer-events-none"></div>
                    <h3 className="text-base font-bold mb-1">Add Platform Funds</h3>
                    <p className="text-xs text-white/50 mb-4">Simulate card/UPI checkout deposits to join cash entry-fee tournaments.</p>
                    <div className="flex gap-3 max-w-xs">
                      <input
                        type="number"
                        value={walletAmount}
                        onChange={(e) => setWalletAmount(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white w-full"
                      />
                      <button
                        onClick={handleWalletDeposit}
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-semibold transition-colors shrink-0"
                      >
                        Simulate Payment
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">Explore Active Contests</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {contestsList.map(c => {
                        const joined = joinedContests.includes(c.id);
                        return (
                          <div key={c.id} className="p-5 bg-white/5 border border-white/5 hover:border-white/15 rounded-2xl transition-all space-y-4 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center text-[10px] text-white/40 font-bold uppercase mb-2">
                                <span>{c.sponsor} Presents</span>
                                <span>Fee: ₹{c.fee}</span>
                              </div>
                              <h4 className="text-sm font-bold">{c.title}</h4>
                            </div>
                            <div className="space-y-3.5">
                              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3.5">
                                <span className="text-white/50">Prize Pool:</span>
                                <span className="font-extrabold text-purple-400">{c.prizePool}</span>
                              </div>
                              <button
                                onClick={() => handleJoinContest(c.id, c.fee)}
                                disabled={joined}
                                className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                                  joined 
                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                                }`}
                              >
                                {joined ? 'Joined Application' : 'Register Entry'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Judge Dashboard */}
              {selectedRole === 'Judge' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold mb-1">Judge Submission Reviews</h3>
                    <p className="text-xs text-white/50">Audit contestant uploads and award scores based on grading metrics.</p>
                  </div>

                  <div className="glassmorphism p-6 rounded-2xl border border-white/10 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold">Dance Fusion Audition.mp4</h4>
                        <p className="text-xs text-purple-400">Contestant: Aarav Sharma</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-lg">
                        Under Review
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs text-white/60 mb-2">
                          <span>Creativity Metric (1 - 10)</span>
                          <span className="font-bold text-white">{judgeCreativity}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={judgeCreativity}
                          onChange={(e) => setJudgeCreativity(parseInt(e.target.value))}
                          className="w-full accent-purple-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-white/60 mb-2">
                          <span>Technique Rubric (1 - 10)</span>
                          <span className="font-bold text-white">{judgeTechnique}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={judgeTechnique}
                          onChange={(e) => setJudgeTechnique(parseInt(e.target.value))}
                          className="w-full accent-cyan-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-white/60 mb-2">
                          <span>Impact & Quality (1 - 10)</span>
                          <span className="font-bold text-white">{judgeImpact}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={judgeImpact}
                          onChange={(e) => setJudgeImpact(parseInt(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => {
                          const total = Math.floor((judgeCreativity + judgeTechnique + judgeImpact) * 6.6);
                          alert(`Score of ${total} points successfully compiled and awarded to Aarav Sharma.`);
                        }}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Publish Scoresheet
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sponsor Dashboard */}
              {selectedRole === 'Sponsor' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold mb-1">Sponsor ROI Analytics</h3>
                      <p className="text-xs text-white/50">Manage marketing campaign syndications and leads click CTRs.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSponsorLaunch} className="p-6 bg-white/5 border border-white/5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">Challenge Name</label>
                      <input
                        type="text"
                        required
                        value={newCampaignName}
                        onChange={(e) => setNewCampaignName(e.target.value)}
                        placeholder="E.g. Zeb-Sound Challenge"
                        className="block w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">Campaign Budget</label>
                      <input
                        type="number"
                        required
                        value={newCampaignBudget}
                        onChange={(e) => setNewCampaignBudget(e.target.value)}
                        className="block w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-semibold transition-colors w-full"
                    >
                      Syndicate Challenge
                    </button>
                  </form>

                  <div className="glassmorphism rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5 shadow-xl">
                    {campaigns.map(c => (
                      <div key={c.id} className="p-5 flex justify-between items-center gap-4">
                        <div>
                          <h4 className="text-sm font-semibold">{c.name}</h4>
                          <p className="text-[11px] text-white/40 mt-1">
                            Budget: ₹{c.budget.toLocaleString()} • Target: {c.target}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-cyan-400 block">{c.leads} Leads</span>
                          <span className="text-[10px] text-white/40">CTR: {c.ctr}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Dashboard */}
              {['Admin', 'Super Admin'].includes(selectedRole) && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold mb-1">Admin Fraud & Verification Console</h3>
                    <p className="text-xs text-white/50">Approve/Reject pending KYC applications and trace security logs.</p>
                  </div>

                  <div className="p-4 bg-black/50 border border-white/5 rounded-2xl font-mono text-[11px] text-emerald-400 space-y-1">
                    <div className="text-white/40 font-bold uppercase text-[10px] font-sans tracking-widest mb-2">Anti-Cheat Real-Time Feed</div>
                    <div>[21:02:14] Anti-Cheat Monitor Initialized.</div>
                    <div>[21:04:32] Duplicate device fingerprint scan for User: Kabir Sen - PASSED.</div>
                    <div>[21:06:50] AI Plagiarism Check: pitch_deck_v1.pdf - 0% Match - PASSED.</div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-purple-400">Awaiting KYC Approval</h4>
                    
                    {pendingKycs.length === 0 ? (
                      <div className="p-6 bg-white/5 border border-white/5 rounded-2xl text-center text-xs text-white/40">
                        No pending KYC validation queues found.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingKycs.map((k, idx) => (
                          <div key={idx} className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-sm font-bold">{k.userDetail?.name || 'Contestant'}</h4>
                                <p className="text-xs text-white/40">{k.userDetail?.email} • {k.userDetail?.phone}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-xs text-white/60 bg-black/20 p-3 rounded-xl border border-white/5">
                                <div>
                                  <span className="block text-[10px] text-white/40 uppercase font-semibold">Doc Type:</span>
                                  <span>{k.documentType}</span>
                                </div>
                                <div>
                                  <span className="block text-[10px] text-white/40 uppercase font-semibold">Doc Num:</span>
                                  <span>{k.documentNumber}</span>
                                </div>
                                <div>
                                  <span className="block text-[10px] text-white/40 uppercase font-semibold">AI Match Score:</span>
                                  <span className="font-extrabold text-cyan-400">{k.livenessScore}% Matching</span>
                                </div>
                                <div>
                                  <span className="block text-[10px] text-white/40 uppercase font-semibold">AI Verdict:</span>
                                  <span className="font-bold text-emerald-400">{k.aiMatchResult}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex md:flex-col justify-end gap-2.5 shrink-0">
                              <button
                                onClick={() => handleReviewKycSubmit(k.userId, 'Approved')}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleReviewKycSubmit(k.userId, 'Rejected')}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-poppins text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" />
                  <span>Profile Settings</span>
                </h2>
                <p className="text-xs text-white/50">Manage your basic details, avatar seed, and linked login parameters.</p>
              </div>

              <div className="glassmorphism p-8 rounded-2xl border border-white/10 space-y-6">
                <div className="flex items-center gap-5 p-4 bg-white/5 border border-white/5 rounded-xl">
                  <img src={editAvatar || user?.avatar} className="w-16 h-16 rounded-full border-2 border-purple-500 bg-surfaceDark" alt="" />
                  <div>
                    <h4 className="text-xs font-bold text-white/60 mb-2 uppercase tracking-wide">Avatar Display</h4>
                    <button
                      onClick={handleUpdateAvatar}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Roll Random Seed
                    </button>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Display Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Mobile Phone</label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 text-right">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Save Configuration Details
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'kyc' && <KycVerification />}

          {activeTab === 'devices' && <DeviceManager />}
        </main>

      </div>
    </div>
  );
};
export default Dashboard;
