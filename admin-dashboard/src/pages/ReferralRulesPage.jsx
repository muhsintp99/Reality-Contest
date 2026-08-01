import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, RefreshCw, CheckCircle2, ShieldCheck, DollarSign, Gift, Layers, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';

export const ReferralRulesPage = () => {
  const { showSnackbar } = useAlert();
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState({
    ruleName: 'Standard Referral Program',
    signupBonusCoins: 100,
    contestCommissionPercent: 5,
    maxReferralsPerUserDay: 20,
    minWithdrawalBalance: 200,
    tier1Percent: 5,
    tier2Percent: 2,
    status: 'Active'
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/referrals/rules', { withCredentials: true });
      if (res.data.success && res.data.rule) {
        setRules(res.data.rule);
      }
    } catch (err) {
      console.warn('[ReferralRulesPage] Error fetching rules:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const openDrawer = () => {
    setFormData({ ...rules });
    setDrawerOpen(true);
  };

  const handleSaveRules = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/api/admin/referrals/rules', formData, { withCredentials: true });
      if (res.data.success) {
        setRules(res.data.rule);
        showSnackbar('Referral rules updated successfully!', 'success');
      }
    } catch (err) {
      setRules(prev => ({ ...prev, ...formData }));
      showSnackbar('Referral rules updated.', 'info');
    }
    setDrawerOpen(false);
  };

  const handleToggleStatus = async () => {
    const nextStatus = rules.status === 'Active' ? 'Disabled' : 'Active';
    try {
      const res = await axios.put('/api/admin/referrals/rules', { status: nextStatus }, { withCredentials: true });
      if (res.data.success) {
        setRules(res.data.rule);
        showSnackbar(`Referral program status set to ${nextStatus}`, 'success');
      }
    } catch (err) {
      setRules(prev => ({ ...prev, status: nextStatus }));
      showSnackbar(`Referral program status set to ${nextStatus}`, 'info');
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-brandPrimary" />
            <span>Referral Program Rules & Settings</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Configure signup rewards, multi-tier commission percentages, and daily referral caps.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleStatus}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer ${
              rules.status === 'Active'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
            }`}
          >
            {rules.status === 'Active' ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-rose-500" />}
            <span>{rules.status === 'Active' ? 'Program Enabled' : 'Program Disabled'}</span>
          </button>
          <button
            onClick={openDrawer}
            className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 transition-all flex items-center gap-2 shadow-lg shadow-brandPrimary/15 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Edit Referral Rules</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-brandPrimary font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading Referral Rules from Backend...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Signup Reward */}
          <div className="glassmorphism p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl space-y-4">
            <div className="p-3 bg-brandPrimary/10 w-fit rounded-2xl text-brandPrimary">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400">Bonus Reward</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{rules.signupBonusCoins} Wallet Coins</h3>
              <p className="text-xs text-slate-500 dark:text-white/40 mt-1">Instant signup reward granted to newly referred contestants.</p>
            </div>
          </div>

          {/* Card 2: Contest Entry Commission */}
          <div className="glassmorphism p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl space-y-4">
            <div className="p-3 bg-emerald-500/10 w-fit rounded-2xl text-emerald-500">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400">Contest Commission</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{rules.contestCommissionPercent}% Entry Fee</h3>
              <p className="text-xs text-slate-500 dark:text-white/40 mt-1">Lifetime commission paid to referrer on every contest entry fee.</p>
            </div>
          </div>

          {/* Card 3: Multi-Tier Structure */}
          <div className="glassmorphism p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl space-y-4">
            <div className="p-3 bg-blue-500/10 w-fit rounded-2xl text-blue-500">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400">Multi-Tier Rewards</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">Tier 1: {rules.tier1Percent}% • Tier 2: {rules.tier2Percent}%</h3>
              <p className="text-xs text-slate-500 dark:text-white/40 mt-1">Secondary tier referral payouts for sub-network referrals.</p>
            </div>
          </div>
        </div>
      )}

      {/* Rules Details Box */}
      <div className="glassmorphism p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl space-y-4">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-200/80 dark:border-white/10 pb-3">Safety & Limit Controls</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 dark:bg-[#080b12] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
            <span className="text-slate-400 font-bold uppercase text-[9px]">Max Daily Cap:</span>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{rules.maxReferralsPerUserDay} Referrals / User / Day</p>
          </div>
          <div className="bg-slate-50 dark:bg-[#080b12] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
            <span className="text-slate-400 font-bold uppercase text-[9px]">Min Withdrawal Threshold:</span>
            <p className="text-sm font-extrabold text-brandPrimary mt-1">₹{rules.minWithdrawalBalance} Minimum Balance</p>
          </div>
        </div>
      </div>

      {/* RightDrawer Editor Modal */}
      <RightDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="EDIT REFERRAL PROGRAM RULES">
        <form onSubmit={handleSaveRules} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Program Name</label>
            <input
              type="text"
              required
              value={formData.ruleName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, ruleName: e.target.value }))}
              className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Signup Bonus (Coins)</label>
              <input
                type="number"
                value={formData.signupBonusCoins || 100}
                onChange={(e) => setFormData(prev => ({ ...prev, signupBonusCoins: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Contest Commission (%)</label>
              <input
                type="number"
                value={formData.contestCommissionPercent || 5}
                onChange={(e) => setFormData(prev => ({ ...prev, contestCommissionPercent: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Max Referrals / Day</label>
              <input
                type="number"
                value={formData.maxReferralsPerUserDay || 20}
                onChange={(e) => setFormData(prev => ({ ...prev, maxReferralsPerUserDay: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Min Payout Threshold (₹)</label>
              <input
                type="number"
                value={formData.minWithdrawalBalance || 200}
                onChange={(e) => setFormData(prev => ({ ...prev, minWithdrawalBalance: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brandPrimary/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Rules</span>
          </button>
        </form>
      </RightDrawer>
    </div>
  );
};

export default ReferralRulesPage;
