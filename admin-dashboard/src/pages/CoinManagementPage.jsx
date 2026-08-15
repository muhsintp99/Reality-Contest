import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Coins, Plus, Edit2, Trash2, CheckCircle2, XCircle, Save,
  Search, Filter, Sliders, Sparkles, Video, UserPlus,
  Calendar, Layers, Calculator, Info, FileText, Download, Check, AlertTriangle, Gift
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';

export const CoinManagementPage = () => {
  const { showSnackbar } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  // Sub-Tab State: 'conversion' | 'packages' | 'rewards' | 'transactions'
  const [activeTab, setActiveTab] = useState('conversion');

  // Conversion & System Rules State
  const [coinSettings, setCoinSettings] = useState({
    coinRate: 10, // 10 Coins = ₹1 INR
    minRedeemCoins: 100, // Minimum 100 Coins to redeem
    maxDailyEarnLimit: 500, // Max 500 Coins earnable per day
    signupBonus: 50, // 50 free coins on register
    dailyLoginBonus: 10, // 10 coins daily login
    referralSenderBonus: 25,
    referralReceiverBonus: 25,
    videoAdBonus: 5, // 5 coins per ad watched
    surveyBonus: 20
  });

  // Interactive Live Calculator State
  const [calcCoins, setCalcCoins] = useState(500);

  // Coin Purchase Packages State
  const [packages, setPackages] = useState([]);

  // Modal State for Package Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [pkgForm, setPkgForm] = useState({ name: '', coins: 100, bonusCoins: 0, price: 10, tag: '', active: true });

  // Coin Transactions Log State
  const [transactions, setTransactions] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [txnCategoryFilter, setTxnCategoryFilter] = useState('All');

  // Fetch Settings, Packages & Transactions from Backend API
  useEffect(() => {
    fetchCoinData();
  }, [isMockMode]);

  const fetchCoinData = async () => {
    if (isMockMode) return;
    try {
      const [resSettings, resPackages, resTxns] = await Promise.all([
        axios.get('/api/admin/coins/settings', { withCredentials: true }).catch(() => null),
        axios.get('/api/admin/coins/packages', { withCredentials: true }).catch(() => null),
        axios.get('/api/admin/coins/transactions', { withCredentials: true }).catch(() => null)
      ]);

      if (resSettings?.data?.success && resSettings.data.data) {
        setCoinSettings(prev => ({ ...prev, ...resSettings.data.data }));
      }
      if (resPackages?.data?.success && Array.isArray(resPackages.data.data)) {
        setPackages(resPackages.data.data.map(p => ({
          ...p,
          id: p._id || p.id
        })));
      }
      if (resTxns?.data?.success && Array.isArray(resTxns.data.data)) {
        setTransactions(resTxns.data.data.map(t => ({
          ...t,
          id: t._id || t.id || t.transactionId,
          user: t.userName || t.user || 'Contestant',
          userEmail: t.userEmail || '',
          type: t.type || t.actionType || 'Transaction',
          category: t.category || (t.amount > 0 ? 'Reward' : 'Spent'),
          coins: t.coins || t.amount || 0,
          amount: t.value || (t.amount ? `₹${Math.abs(t.amount)}` : 'Free'),
          date: t.createdAt ? new Date(t.createdAt).toLocaleString() : (t.date || 'Recently'),
          status: t.status || 'Completed'
        })));
      }
    } catch (err) {
      console.error('Error loading coin data from API:', err);
    }
  };

  // Handle Form Change
  const handleSettingsChange = (field, val) => {
    const num = Math.max(1, Number(val));
    setCoinSettings((prev) => ({ ...prev, [field]: num }));
  };

  const handleSaveSettings = async (msg = 'Coin exchange rate and system rules updated!') => {
    if (!isMockMode) {
      try {
        await axios.put('/api/admin/coins/settings', coinSettings, { withCredentials: true });
      } catch (err) {
        console.error('API Error saving settings:', err);
      }
    }
    showSnackbar(msg, 'success');
  };

  // Preset Rate Picker
  const applyPresetRate = (rate) => {
    const updated = { ...coinSettings, coinRate: rate };
    setCoinSettings(updated);
    if (!isMockMode) {
      axios.put('/api/admin/coins/settings', updated, { withCredentials: true }).catch(() => {});
    }
    showSnackbar(`Preset Applied: ${rate} Coins = ₹1 INR`, 'success');
  };

  // Open Modal for Create or Edit
  const handleOpenModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPkgForm({ ...pkg });
    } else {
      setEditingPackage(null);
      setPkgForm({ name: '', coins: 100, bonusCoins: 0, price: 10, tag: 'Starter', active: true });
    }
    setIsModalOpen(true);
  };

  // Save Package
  const handleSavePackage = async (e) => {
    e.preventDefault();
    const payload = {
      ...pkgForm,
      coins: Number(pkgForm.coins),
      bonusCoins: Number(pkgForm.bonusCoins),
      price: Number(pkgForm.price)
    };

    if (!isMockMode) {
      try {
        if (editingPackage) {
          await axios.put(`/api/admin/coins/packages/${editingPackage.id}`, payload, { withCredentials: true });
        } else {
          const res = await axios.post('/api/admin/coins/packages', payload, { withCredentials: true });
          if (res?.data?.data) {
            payload.id = res.data.data._id || res.data.data.id;
          }
        }
      } catch (err) {
        console.error('API Error saving package:', err);
      }
    }

    if (editingPackage) {
      setPackages(packages.map((p) => (p.id === editingPackage.id ? { ...payload, id: p.id } : p)));
      showSnackbar(`Package "${pkgForm.name}" updated successfully!`, 'success');
    } else {
      setPackages([...packages, { ...payload, id: payload.id || Date.now() }]);
      showSnackbar(`New Package "${pkgForm.name}" created!`, 'success');
    }
    setIsModalOpen(false);
  };

  // Toggle Package Active Status
  const togglePackageActive = async (id) => {
    const target = packages.find(p => p.id === id);
    if (!target) return;
    const nextState = !target.active;

    if (!isMockMode) {
      try {
        await axios.put(`/api/admin/coins/packages/${id}`, { active: nextState }, { withCredentials: true });
      } catch (err) {
        console.error('API Error toggling package active status:', err);
      }
    }

    setPackages(packages.map((p) => (p.id === id ? { ...p, active: nextState } : p)));
    showSnackbar(`Package "${target.name}" is now ${nextState ? 'Active' : 'Disabled'}`, 'info');
  };

  // Delete Package
  const handleDeletePackage = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      if (!isMockMode) {
        try {
          await axios.delete(`/api/admin/coins/packages/${id}`, { withCredentials: true });
        } catch (err) {
          console.error('API Error deleting package:', err);
        }
      }
      setPackages(packages.filter((p) => p.id !== id));
      showSnackbar(`Package "${name}" deleted.`, 'success');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvHeader = 'Transaction ID,User Name,Email,Activity Type,Category,Coins,Value,Date & Time,Status\n';
    const csvRows = filteredTransactions.map(t => (
      `"${t.id}","${t.user}","${t.userEmail || ''}","${t.type}","${t.category}","${t.coins}","${t.amount}","${t.date}","${t.status}"`
    )).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `coin_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar('Coin transactions exported to CSV!', 'success');
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q ||
        t.user.toLowerCase().includes(q) ||
        (t.userEmail && t.userEmail.toLowerCase().includes(q)) ||
        t.id.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q);
      const matchesCategory = txnCategoryFilter === 'All' || t.category === txnCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchTerm, txnCategoryFilter]);

  // KPI Overview Calculations
  const summaryStats = useMemo(() => {
    const activePkgCount = packages.filter(p => p.active).length;
    const totalPkgCount = packages.length;
    return { activePkgCount, totalPkgCount };
  }, [packages]);

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      
      {/* 1. TOP HEADER BAR (Dashboard Uniform Style) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2.5">
            <Coins className="w-6 h-6 text-amber-500" />
            Coin & Currency Store Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Configure exchange rates, in-app store packages, user reward rules, and transaction history.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Add Coin Package
          </button>
        </div>
      </div>

      {/* 2. KPI OVERVIEW SUMMARY CARDS (Dashboard Uniform Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Exchange Rate</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{coinSettings.coinRate} Coins = ₹1</h3>
          <p className="text-[11px] text-amber-500 font-semibold">1 Coin ≈ ₹{(1 / coinSettings.coinRate).toFixed(2)} INR</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Active Store Packages</span>
          <h3 className="text-2xl font-bold text-indigo-400 font-mono">{summaryStats.activePkgCount} / {summaryStats.totalPkgCount}</h3>
          <p className="text-[11px] text-slate-400">Available in App Store</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Daily Login Reward</span>
          <h3 className="text-2xl font-bold text-emerald-500 font-mono">+{coinSettings.dailyLoginBonus} Coins</h3>
          <p className="text-[11px] text-emerald-400 font-semibold">Credited per Active Login</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Ad Watch Bonus</span>
          <h3 className="text-2xl font-bold text-purple-400 font-mono">+{coinSettings.videoAdBonus} Coins</h3>
          <p className="text-[11px] text-slate-400">Per Completed Video Ad</p>
        </div>

      </div>

      {/* 3. SUB-TABS NAVIGATION (Dashboard Uniform Style) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'conversion', label: 'Conversion & Rates', icon: Sliders },
          { id: 'packages', label: `Store Packages (${packages.length})`, icon: Layers },
          { id: 'rewards', label: 'Bonus Rules', icon: Gift },
          { id: 'transactions', label: 'Coin Activity Log', icon: FileText }
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
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 1: CONVERSION & RATES                                                  */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'conversion' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Rate Settings */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
            <div className="border-b border-slate-200 dark:border-white/10 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                Exchange Rate & Limits
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure how many coins equal ₹1 INR for contest entry fees and user redemptions.
              </p>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                ⚡ Quick Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: '10 Coins = ₹1', rate: 10 },
                  { label: '5 Coins = ₹1', rate: 5 },
                  { label: '1 Coin = ₹1', rate: 1 },
                  { label: '100 Coins = ₹1', rate: 100 }
                ].map((p) => (
                  <button
                    key={p.rate}
                    type="button"
                    onClick={() => applyPresetRate(p.rate)}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                      coinSettings.coinRate === p.rate
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500 ring-1 ring-amber-500'
                        : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings(); }} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Coins Per ₹1 INR
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={coinSettings.coinRate}
                      onChange={(e) => handleSettingsChange('coinRate', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="absolute right-3 top-3 text-xs font-bold text-amber-500">Coins</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Min Redemption Coins
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      value={coinSettings.minRedeemCoins}
                      onChange={(e) => handleSettingsChange('minRedeemCoins', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="absolute right-3 top-3 text-xs font-bold text-amber-500">Coins</span>
                  </div>
                </div>

              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Max Daily Free Earn Limit (Per User / Day)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    value={coinSettings.maxDailyEarnLimit}
                    onChange={(e) => handleSettingsChange('maxDailyEarnLimit', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-amber-500">Coins / Day</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Exchange Settings
                </button>
              </div>
            </form>
          </div>

          {/* Live Rate Calculator Card */}
          <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-white/10 pb-3">
                <Calculator className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Live Rate Preview</h3>
              </div>

              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Enter Coin Quantity
                  </label>
                  <input
                    type="number"
                    value={calcCoins}
                    onChange={(e) => setCalcCoins(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/10 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Rupee Value (INR)</span>
                  <div className="text-3xl font-bold font-mono text-amber-500">
                    ₹{((calcCoins || 0) / coinSettings.coinRate).toFixed(2)}
                  </div>
                  <span className="text-[11px] text-slate-400">Rate: {coinSettings.coinRate} Coins = ₹1</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>Exchange rate updates are reflected immediately in app store.</span>
            </div>
          </div>

        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 2: STORE PACKAGES                                                      */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          {packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    pkg.active
                      ? 'bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{pkg.name}</h4>
                        <p className="text-[11px] text-slate-400">{pkg.coins} Base Coins</p>
                      </div>
                    </div>

                    {pkg.tag && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        {pkg.tag}
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-white/5 space-y-1.5 mb-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Total Coins:</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">{pkg.coins + pkg.bonusCoins}</span>
                    </div>
                    {pkg.bonusCoins > 0 && (
                      <div className="flex justify-between items-center text-[11px] text-emerald-500 font-bold">
                        <span>Bonus Extra:</span>
                        <span>+{pkg.bonusCoins} FREE</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-200 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400">Price:</span>
                      <span className="font-bold font-mono text-amber-500 text-base">₹{pkg.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => togglePackageActive(pkg.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        pkg.active
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {pkg.active ? 'Active' : 'Disabled'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(pkg)}
                        className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
              <Coins className="w-12 h-12 text-amber-500 mx-auto opacity-50" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">No Coin Packages Created Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Click "Add Coin Package" above to create your first in-app store package.</p>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 3: BONUS RULES                                                         */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'rewards' && (
        <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings('Bonus reward rules saved!'); }} className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-white/10 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              Bonus & Reward Rules
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure coins automatically rewarded for registration, daily check-in, and video ads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-slate-900 dark:text-white text-xs">New Signup Bonus</span>
              </div>
              <input
                type="number"
                value={coinSettings.signupBonus}
                onChange={(e) => handleSettingsChange('signupBonus', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl font-mono font-bold text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-slate-900 dark:text-white text-xs">Daily Login Check-In</span>
              </div>
              <input
                type="number"
                value={coinSettings.dailyLoginBonus}
                onChange={(e) => handleSettingsChange('dailyLoginBonus', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl font-mono font-bold text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-500" />
                <span className="font-bold text-slate-900 dark:text-white text-xs">Watch Video Ad Bonus</span>
              </div>
              <input
                type="number"
                value={coinSettings.videoAdBonus}
                onChange={(e) => handleSettingsChange('videoAdBonus', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl font-mono font-bold text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-slate-900 dark:text-white text-xs">Survey Reward Coins</span>
              </div>
              <input
                type="number"
                value={coinSettings.surveyBonus}
                onChange={(e) => handleSettingsChange('surveyBonus', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl font-mono font-bold text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Reward Rules
            </button>
          </div>
        </form>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 4: TRANSACTIONS LOG TABLE (Dashboard Uniform Style)                     */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden space-y-4 p-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search user, ID or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                {['All', 'Purchase', 'Reward', 'Spent'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTxnCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      txnCategoryFilter === cat
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> CSV Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">TXN ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Activity Type</th>
                  <th className="py-3 px-4">Coins Amount</th>
                  <th className="py-3 px-4">Cost / Value</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{t.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{t.user}</div>
                        <div className="text-[11px] text-slate-400">{t.userEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">{t.type}</td>
                      <td className={`py-3 px-4 font-mono font-bold ${t.coins > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.coins > 0 ? `+${t.coins}` : t.coins} Coins
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{t.amount}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{t.date}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md border ${
                          t.coins > 0
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-slate-400 text-xs">
                      No coin activity records match your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SIDE DRAWER FOR CREATE/EDIT STORE PACKAGE */}
      <RightDrawer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPackage ? 'Edit Store Package' : 'Create Store Package'}
      >
        <form onSubmit={handleSavePackage} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Package Name
            </label>
            <input
              type="text"
              placeholder="e.g. Popular Booster"
              value={pkgForm.name}
              onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
              className="w-full px-3.5 py-2 bg-[#E2F1D5]/50 dark:bg-slate-900 border border-[#C4E2A8]/80 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Base Coins
              </label>
              <input
                type="number"
                min="1"
                value={pkgForm.coins}
                onChange={(e) => setPkgForm({ ...pkgForm, coins: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#E2F1D5]/50 dark:bg-slate-900 border border-[#C4E2A8]/80 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bonus Coins
              </label>
              <input
                type="number"
                min="0"
                value={pkgForm.bonusCoins}
                onChange={(e) => setPkgForm({ ...pkgForm, bonusCoins: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#E2F1D5]/50 dark:bg-slate-900 border border-[#C4E2A8]/80 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Price (₹ INR)
              </label>
              <input
                type="number"
                min="1"
                value={pkgForm.price}
                onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#E2F1D5]/50 dark:bg-slate-900 border border-[#C4E2A8]/80 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Badge Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Popular"
                value={pkgForm.tag}
                onChange={(e) => setPkgForm({ ...pkgForm, tag: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#E2F1D5]/50 dark:bg-slate-900 border border-[#C4E2A8]/80 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="pkgActiveCheck"
              checked={pkgForm.active}
              onChange={(e) => setPkgForm({ ...pkgForm, active: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="pkgActiveCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              Active in App Store
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#C4E2A8]/80 dark:border-white/10 mt-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Save Package
            </button>
          </div>
        </form>
      </RightDrawer>

    </div>
  );
};

export default CoinManagementPage;
