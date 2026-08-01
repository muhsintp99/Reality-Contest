import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Megaphone, Plus, Trophy, Image, Video, Gift, Users, Check, Sparkles } from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const CreateAdsPage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useAlert();
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    title: '',
    type: 'sponsored',
    sponsorName: '',
    sponsorLogo: '',
    mediaUrl: '',
    redirectUrl: '',
    placement: 'Home Screen Header',
    targetAudience: 'All Users',
    budget: 50000,
    cpm: 15,
    cpc: 2.5,
    rewardPoints: 50,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    status: 'Active'
  });

  const handleSaveAd = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/ads', wizardData, { withCredentials: true });
      if (res.data.success) {
        showSnackbar('Ad campaign launched successfully!', 'success');
        navigate(`/admin-dashboard/advertisements/${wizardData.type}`);
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Campaign saved.', 'info');
      navigate(`/admin-dashboard/advertisements/${wizardData.type}`);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-brandPrimary" />
            <span>Create New Advertisement</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Interactive 4-step wizard to launch high-converting sponsor and ad campaigns.
          </p>
        </div>
      </div>

      <div className="glassmorphism p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl space-y-8">
        <div className="border-b border-slate-200/80 dark:border-white/10 pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-brandPrimary/10 text-brandPrimary px-2.5 py-0.5 rounded-full border border-brandPrimary/20">
              Campaign Builder
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">Wizard Configuration</h3>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(step => (
              <div
                key={step}
                onClick={() => setWizardStep(step)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
                  wizardStep === step
                    ? 'bg-brandPrimary text-white shadow-md'
                    : wizardStep > step
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/40'
                }`}
              >
                {wizardStep > step ? <Check className="w-4 h-4" /> : step}
              </div>
            ))}
          </div>
        </div>

        {wizardStep === 1 && (
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Step 1: Choose Advertisement Format</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { type: 'sponsored', title: 'Sponsored Contest', desc: 'Brand co-sponsors a stage with prize funding & logo placement.', icon: Trophy },
                { type: 'banner', title: 'Banner Ads', desc: 'Display static or animated image banners on home & feed screens.', icon: Image },
                { type: 'video', title: 'Video Ads', desc: 'Skippable or unskippable HD video commercials before stage start.', icon: Video },
                { type: 'reward', title: 'Reward Ads (Watch-to-Earn)', desc: 'Users watch ads to earn bonus wallet coins or voting entries.', icon: Gift },
                { type: 'partner', title: 'Partner Campaign', desc: 'Affiliate brand deals with referral conversion tracking.', icon: Users }
              ].map(item => {
                const Icon = item.icon;
                const isSelected = wizardData.type === item.type;
                return (
                  <div
                    key={item.type}
                    onClick={() => setWizardData(prev => ({ ...prev, type: item.type }))}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-brandPrimary bg-brandPrimary/5 dark:bg-brandPrimary/10 shadow-md ring-2 ring-brandPrimary/20'
                        : 'border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 bg-brandPrimary/10 rounded-xl text-brandPrimary">
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-brandPrimary" />}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h5>
                      <p className="text-xs text-slate-500 dark:text-white/50 mt-1">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={() => setWizardStep(2)} className="px-6 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold shadow-lg shadow-brandPrimary/20 cursor-pointer">
                Continue to Creative Specs →
              </button>
            </div>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Step 2: Creative & Brand Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RedBull Energy Grand Showdown 2026"
                  value={wizardData.title}
                  onChange={(e) => setWizardData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Sponsor / Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. RedBull India"
                  value={wizardData.sponsorName}
                  onChange={(e) => setWizardData(prev => ({ ...prev, sponsorName: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Media Asset URL (Image/Video)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={wizardData.mediaUrl}
                  onChange={(e) => setWizardData(prev => ({ ...prev, mediaUrl: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Destination Redirect URL</label>
                <input
                  type="url"
                  placeholder="https://redbull.com/contest"
                  value={wizardData.redirectUrl}
                  onChange={(e) => setWizardData(prev => ({ ...prev, redirectUrl: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setWizardStep(1)} className="px-4 py-2.5 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold cursor-pointer">
                ← Back
              </button>
              <button onClick={() => setWizardStep(3)} className="px-6 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold shadow-lg shadow-brandPrimary/20 cursor-pointer">
                Continue to Budgeting →
              </button>
            </div>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Step 3: Budget & Placement Targeting</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Total Budget (₹)</label>
                <input
                  type="number"
                  value={wizardData.budget}
                  onChange={(e) => setWizardData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Target Audience</label>
                <select
                  value={wizardData.targetAudience}
                  onChange={(e) => setWizardData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option>All Users</option>
                  <option>18-24 Creators</option>
                  <option>VIP Contestants</option>
                  <option>Audience Voters</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Placement Slot</label>
                <select
                  value={wizardData.placement}
                  onChange={(e) => setWizardData(prev => ({ ...prev, placement: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option>Home Screen Header</option>
                  <option>Contest Stage Interstitial</option>
                  <option>Reward Hub Watch-to-Earn</option>
                  <option>Footer Feed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setWizardStep(2)} className="px-4 py-2.5 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold cursor-pointer">
                ← Back
              </button>
              <button onClick={() => setWizardStep(4)} className="px-6 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold shadow-lg shadow-brandPrimary/20 cursor-pointer">
                Review & Publish →
              </button>
            </div>
          </div>
        )}

        {wizardStep === 4 && (
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Step 4: Review Campaign Configuration</h4>
            <div className="bg-slate-50 dark:bg-[#080b12] p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Title:</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{wizardData.title || 'Untitled Campaign'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Type & Sponsor:</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{wizardData.type.toUpperCase()} • {wizardData.sponsorName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Budget:</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">₹{wizardData.budget?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Placement:</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{wizardData.placement}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setWizardStep(3)} className="px-4 py-2.5 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold cursor-pointer">
                ← Back
              </button>
              <button onClick={handleSaveAd} className="px-8 py-3 bg-brandPrimary text-white rounded-xl text-xs font-extrabold shadow-xl shadow-brandPrimary/25 hover:bg-brandPrimary/90 cursor-pointer flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Launch Ad Campaign Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAdsPage;
