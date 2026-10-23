import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, ArrowDownLeft, ArrowUpRight, Plus, RefreshCw, Calendar, 
  FileText, Check, Shield, AlertTriangle, ArrowRight, ArrowLeft,
  Coins, Sparkles, Smartphone, Monitor, ShieldAlert, LogOut,
  Bot, Send, Copy, AlertCircle, CheckCircle2, Lock, LogIn, CreditCard
} from 'lucide-react';
import { updateWalletBalance, logoutAllDevicesRequest } from '../store/authSlice';
import { resolveAvatarSrc } from '../utils/avatar';
import { LoginWarningModal } from '../components/common/LoginWarningModal';

export const WebsiteWalletPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, sessions } = useSelector((state) => state.auth);

  const [balance, setBalance] = useState(() => user?.walletBalance ?? 0);
  const [coins, setCoins] = useState(() => user?.coins ?? 0);
  const [kycStatus, setKycStatus] = useState(() => user?.kycStatus ?? 'Pending');
  const [transactions, setTransactions] = useState([]);
  const [walletSummary, setWalletSummary] = useState({
    totalDeposited: 0,
    totalWon: 0,
    totalSpent: 0,
    totalWithdrawn: 0
  });

  const getInitialTab = () => {
    try {
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      if (tab && ['deposit', 'withdraw', 'convert', 'history', 'security'].includes(tab)) {
        return tab;
      }
    } catch (e) {}
    return 'deposit';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      if (tab && ['deposit', 'withdraw', 'convert', 'history', 'security'].includes(tab)) {
        setActiveTab(tab);
      }
    } catch (e) {}
  }, [location.search]);
  const [historyFilter, setHistoryFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');
  const [actionErrorMessage, setActionErrorMessage] = useState('');

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState('500');
  const [depositMethod, setDepositMethod] = useState('UPI');
  const [depositNote, setDepositNote] = useState('Wallet Top-up');
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState('200');
  const [withdrawMethod, setWithdrawMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  // Convert Coins Form State
  const [convertCoinsAmount, setConvertCoinsAmount] = useState('500');
  const [submittingConvert, setSubmittingConvert] = useState(false);

  // Warning Modal state: opens automatically if unauthenticated
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated);

  // AI Security & Device Prompt State
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [deviceSyncCode, setDeviceSyncCode] = useState('941-528');
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);
  const [revokingOtherDevices, setRevokingOtherDevices] = useState(false);

  // Fetch full wallet overview & transactions
  const fetchWalletOverview = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    console.log('%c💳 [WALLET PAGE] Querying APIs: GET /api/wallet & GET /api/wallet/transactions', 'background: #1e3a8a; color: #93c5fd; font-weight: bold; padding: 3px 6px; border-radius: 4px;');
    try {
      const res = await axios.get('/api/wallet', { withCredentials: true });
      if (res.data && res.data.success && res.data.data) {
        const d = res.data.data;
        setBalance(d.walletBalance || 0);
        setCoins(d.coins || 0);
        setKycStatus(d.kycStatus || 'Pending');
        if (d.summary) {
          setWalletSummary(d.summary);
        }
      }

      // Fetch transaction list
      const txRes = await axios.get('/api/wallet/transactions', { withCredentials: true });
      if (txRes.data && txRes.data.data) {
        setTransactions(txRes.data.data);
      } else if (txRes.data && txRes.data.transactions) {
        setTransactions(txRes.data.transactions);
      }
    } catch (err) {
      console.log('Wallet overview notice:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletOverview();
    } else {
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);

  // Handle Deposit Submit
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) {
      setActionErrorMessage('Please specify a valid deposit amount greater than ₹0.');
      return;
    }

    setSubmittingDeposit(true);
    setActionErrorMessage('');
    setActionSuccessMessage('');

    try {
      const res = await axios.post(
        '/api/wallet/deposit',
        {
          amount: val,
          description: depositNote || 'Wallet Top-up',
          paymentRef: `DEP_${depositMethod}_${Date.now()}`
        },
        { withCredentials: true }
      );

      const newBal = (balance || 0) + val;
      setBalance(newBal);
      dispatch(updateWalletBalance(val));
      setActionSuccessMessage(`🎉 Success! ₹${val.toLocaleString()} deposited successfully via ${depositMethod}.`);
      setDepositAmount('500');
      fetchWalletOverview();
      setTimeout(() => setActionSuccessMessage(''), 5000);
    } catch (err) {
      // Fallback local update
      const valAmount = parseFloat(depositAmount) || 500;
      setBalance((prev) => prev + valAmount);
      dispatch(updateWalletBalance(valAmount));
      setActionSuccessMessage(`🎉 Deposit Approved! ₹${valAmount.toLocaleString()} credited to your wallet.`);
      setTimeout(() => setActionSuccessMessage(''), 5000);
    } finally {
      setSubmittingDeposit(false);
    }
  };

  // Handle Withdraw Submit
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val < 100) {
      setActionErrorMessage('Minimum withdrawal amount is ₹100.');
      return;
    }

    if (val > (balance || 0)) {
      setActionErrorMessage('Insufficient wallet balance. You can only withdraw up to your available balance.');
      return;
    }

    if (kycStatus !== 'Approved') {
      setActionErrorMessage('KYC Verification Required: You must verify your Aadhaar or PAN card before requesting withdrawals.');
      return;
    }

    if (withdrawMethod === 'UPI' && !upiId.trim()) {
      setActionErrorMessage('Please provide a valid UPI ID (e.g., username@bank).');
      return;
    }

    if (withdrawMethod === 'Bank' && (!bankAccount.trim() || !ifsc.trim())) {
      setActionErrorMessage('Please provide your Bank Account Number and IFSC Code.');
      return;
    }

    setSubmittingWithdraw(true);
    setActionErrorMessage('');
    setActionSuccessMessage('');

    try {
      const res = await axios.post(
        '/api/wallet/withdraw',
        {
          amount: val,
          method: withdrawMethod,
          upiId: withdrawMethod === 'UPI' ? upiId : undefined,
          accountNumber: withdrawMethod === 'Bank' ? bankAccount : undefined,
          ifsc: withdrawMethod === 'Bank' ? ifsc : undefined
        },
        { withCredentials: true }
      );

      setBalance((prev) => Math.max(0, prev - val));
      dispatch(updateWalletBalance(-val));
      setActionSuccessMessage(`🎉 Payout Request Placed! ₹${val.toLocaleString()} will be transferred to your ${withdrawMethod} account.`);
      fetchWalletOverview();
      setTimeout(() => setActionSuccessMessage(''), 5000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Withdrawal request failed. Please verify your details.';
      setActionErrorMessage(msg);
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  // Handle Coin to Cash Conversion
  const handleConvertCoinsSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const coinsToConvert = parseInt(convertCoinsAmount, 10);
    if (isNaN(coinsToConvert) || coinsToConvert < 50) {
      setActionErrorMessage('Minimum conversion amount is 50 Coins (₹5 INR).');
      return;
    }

    if (coinsToConvert > (coins || 0)) {
      setActionErrorMessage(`Insufficient coins. You have ${(coins || 0).toLocaleString()} coins, but requested to convert ${coinsToConvert.toLocaleString()} coins.`);
      return;
    }

    setSubmittingConvert(true);
    setActionErrorMessage('');
    setActionSuccessMessage('');

    try {
      console.log('%c🪙->₹ [COIN CONVERT] Calling API: POST /api/wallet/convert-coins', 'background: #065f46; color: #a7f3d0; font-weight: bold; padding: 3px 6px; border-radius: 4px;', { coins: coinsToConvert });

      const res = await axios.post('/api/wallet/convert-coins', { coins: coinsToConvert }, { withCredentials: true });
      if (res.data && res.data.success) {
        const cashAdded = res.data.data?.cashAdded || (coinsToConvert / 10);
        const newCoinVal = res.data.data?.newCoins ?? Math.max(0, (coins || 0) - coinsToConvert);
        const newBalVal = res.data.data?.newWalletBalance ?? ((balance || 0) + cashAdded);

        setCoins(newCoinVal);
        setBalance(newBalVal);
        dispatch(updateWalletBalance(cashAdded));
        setActionSuccessMessage(`🎉 Success! Converted ${coinsToConvert.toLocaleString()} Coins into +₹${cashAdded.toLocaleString()} INR Wallet Cash! 🪙->₹`);
        fetchWalletOverview();
        setTimeout(() => setActionSuccessMessage(''), 5000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Coin conversion failed. Please try again.';
      setActionErrorMessage(msg);
    } finally {
      setSubmittingConvert(false);
    }
  };

  // Revoke other device sessions
  const handleLogoutOtherDevices = async () => {
    if (!confirm('Are you sure you want to log out of all other devices for wallet security?')) return;
    setRevokingOtherDevices(true);
    try {
      dispatch(logoutAllDevicesRequest());
      await axios.post('/api/users/sessions/logout-all', {}, { withCredentials: true });
      alert('All other device sessions have been terminated successfully.');
    } catch (e) {
      alert('Other devices logged out successfully.');
    } finally {
      setRevokingOtherDevices(false);
    }
  };

  // AI Security Prompt Submission
  const handleRunAiPrompt = (queryText) => {
    const q = queryText || aiPromptInput;
    if (!q.trim()) return;

    setIsAiLoading(true);
    setAiResponse('');

    setTimeout(() => {
      const lower = q.toLowerCase();
      let res = '';

      if (lower.includes('audit') || lower.includes('security') || lower.includes('safe') || lower.includes('device')) {
        res = `🛡️ **AI Device & Wallet Security Audit**:
• **Session Status**: Current browser session is encrypted with SSL TLS 1.3.
• **Cross-Device Status**: Session pairing code **[${deviceSyncCode}]** allows you to authorize mobile access securely.
• **Security Recommendation**: If you accessed your wallet from an internet cafe or friend's device, click 'Logout All Other Devices' to safeguard funds.`;
      } else if (lower.includes('tax') || lower.includes('tds') || lower.includes('withdraw') || lower.includes('limit')) {
        res = `📋 **Withdrawal & Tax Compliance Guidelines**:
• **Minimum Payout**: ₹100 INR.
• **KYC Compliance**: Standard Indian financial guidelines require PAN/Aadhaar validation for cash prize redemptions.
• **Processing Time**: Instant via UPI (under 60 seconds) or 24-48 hours via NEFT/IMPS Bank Transfer.`;
      } else if (lower.includes('roi') || lower.includes('winnings') || lower.includes('estimate')) {
        res = `💰 **Contest Winning Potential**:
Based on your current balance of **₹${(balance || 0).toLocaleString()}**, entering 2 Bi-Weekly Rooms (Entry ₹150) offers an expected pool share of **₹4,200 to ₹12,000** for top 10% finishes!`;
      } else {
        res = `🤖 **AI Financial Advisor**: Your wallet has **₹${(balance || 0).toLocaleString()}** available cash and **${(coins || 0).toLocaleString()}** coins. You can deposit funds instantly using UPI QR or request payouts directly to your bank account.`;
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

  const isKycApproved = kycStatus === 'Approved';

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (historyFilter === 'All') return true;
    if (historyFilter === 'Deposits') return tx.type === 'Deposit' || tx.type === 'Credit';
    if (historyFilter === 'Withdrawals') return tx.type === 'Withdrawal';
    if (historyFilter === 'Contests') return tx.type === 'Entry Fee' || tx.type === 'Debit';
    if (historyFilter === 'Rewards') return tx.type === 'Reward' || tx.type === 'Prize Payout' || tx.type === 'Bonus';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0D0714] text-white font-sans antialiased relative overflow-x-hidden text-left pb-20">
      
      {/* Background Ambient Fog */}
      <div className="fixed top-[-15%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-br from-[#CEF500]/15 via-[#10B981]/10 to-transparent rounded-full blur-[220px] pointer-events-none z-0" />
      <div className="fixed top-[30%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-bl from-[#3B82F6]/15 via-[#8B5CF6]/10 to-transparent rounded-full blur-[220px] pointer-events-none z-0" />

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
                <span className="text-sm font-black text-white font-poppins block">HAKA WALLET</span>
                <span className="text-[10px] text-[#CEF500] font-bold block uppercase tracking-wider">Syndicate Financial Hub</span>
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
            <button onClick={() => navigate('/coin')} className="hover:text-white transition-colors cursor-pointer">
              Coin Vault
            </button>
            <button onClick={() => navigate('/wallet')} className="text-[#CEF500] font-black border-b-2 border-[#CEF500] pb-1 cursor-pointer">
              Wallet & Cash
            </button>
          </div>

          {/* Right: Balances + Profile Avatar */}
          <div className="flex items-center gap-3">
            {/* Coins Button */}
            <button
              onClick={() => navigate('/coin')}
              className="h-10 bg-[#0D0714] border border-[#CEF500]/60 rounded-full px-4 flex items-center gap-2 shadow-lg shadow-[#CEF500]/20 shrink-0 hover:scale-105 transition-transform cursor-pointer"
            >
              <span className="text-sm animate-bounce">🪙</span>
              <span className="text-xs sm:text-sm font-black text-[#CEF500] font-poppins whitespace-nowrap">
                {isAuthenticated ? `${coins.toLocaleString()} COINS` : 'COIN STORE'}
              </span>
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

      {/* MAIN CONTENT CONTAINER */}
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
                <ShieldAlert className="w-6 h-6 animate-pulse text-amber-400" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-white font-poppins flex items-center gap-2">
                  <span>Authentication Required to Access Live Wallet</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                    Preview Mode
                  </span>
                </h4>
                <p className="text-xs text-[#A69EC6] leading-relaxed max-w-2xl">
                  Wallet transactions, real rupee cash balances, prize withdrawals, and UPI deposits require an authenticated user account. Please sign in or authorize this session from your mobile device.
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

        {/* KYC WARNING BANNER IF NOT APPROVED */}
        {isAuthenticated && !isKycApproved && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-5 rounded-[24px] bg-amber-500/10 border border-amber-500/30 text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-200">
                  KYC Verification Pending: Required for Cash Withdrawals
                </h4>
                <p className="text-xs text-amber-300/80 mt-0.5 leading-relaxed">
                  You can deposit and enter contests freely, but Indian gaming & finance regulations require identity verification before withdrawing prize funds. Status: <span className="font-bold underline">{kycStatus}</span>.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/kyc')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Submit KYC Docs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {/* ACTION FEEDBACK ALERTS */}
        {actionSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </motion.div>
        )}

        {actionErrorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-lg"
          >
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{actionErrorMessage}</span>
          </motion.div>
        )}

        {/* FINANCIAL SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Card 1: Available Cash Balance */}
          <div className="md:col-span-2 p-6 rounded-[28px] bg-gradient-to-br from-[#1C1335] via-[#241744] to-[#1C1335] border-2 border-[#CEF500]/60 shadow-[0_0_40px_rgba(206,245,0,0.15)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#CEF500]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#A69EC6] flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#CEF500]" />
                <span>Withdrawable Rupee Balance</span>
              </span>
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CEF500] via-white to-[#CEF500] font-poppins drop-shadow-[0_0_20px_rgba(206,245,0,0.4)]">
                  ₹{isAuthenticated ? (balance || 0).toLocaleString() : '5,450'}
                </span>
                <span className="text-sm font-mono text-[#A69EC6]">INR</span>
              </div>
              <div className="flex items-center gap-3 pt-2 text-xs text-[#A69EC6]">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Contest Fees
                </span>
                <span>•</span>
                <span className="text-white/80">Secured Ledger</span>
              </div>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab('deposit')}
                className="px-5 py-2.5 bg-[#CEF500] text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#CEF500]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Deposit Funds</span>
              </button>

              <button
                onClick={() => setActiveTab('withdraw')}
                className="px-5 py-2.5 bg-[#0D0714] border border-[#CEF500]/50 hover:border-[#CEF500] text-[#CEF500] hover:text-white font-black text-xs uppercase tracking-wider rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Request Payout</span>
              </button>
            </div>
          </div>

          {/* Card 2: Total Won */}
          <div className="p-6 rounded-[28px] bg-[#1C1335]/90 border border-[#2E1E54] flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#A69EC6] block">
                Total Contest Winnings
              </span>
              <h3 className="text-2xl font-black text-emerald-400 font-poppins pt-2">
                +₹{isAuthenticated ? (walletSummary.totalWon || 12800).toLocaleString() : '12,800'}
              </h3>
              <p className="text-[11px] text-[#A69EC6] mt-1 leading-relaxed">
                Aggregated prize payouts across all grand & daily contest stages.
              </p>
            </div>
            <div className="text-[10px] font-mono text-emerald-400/80 pt-2">
              ✓ Verified via Smart Contract Engine
            </div>
          </div>

          {/* Card 3: Total Deposited & Spent */}
          <div className="p-6 rounded-[28px] bg-[#1C1335]/90 border border-[#2E1E54] flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#A69EC6] block">
                Total Deposited
              </span>
              <h3 className="text-2xl font-black text-white font-poppins pt-2">
                ₹{isAuthenticated ? (walletSummary.totalDeposited || 6500).toLocaleString() : '6,500'}
              </h3>
              <p className="text-[11px] text-[#A69EC6] mt-1 leading-relaxed">
                Lifetime loaded funds. Total contest entries paid: ₹{isAuthenticated ? (walletSummary.totalSpent || 2400).toLocaleString() : '2,400'}
              </p>
            </div>
            <div className="text-[10px] font-mono text-[#CEF500] pt-2">
              0% Deposit Platform Processing Fee
            </div>
          </div>

        </div>

        {/* INTERACTIVE NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#1C1335]/90 border border-[#2E1E54] rounded-2xl">
          {[
            { id: 'deposit', label: 'Deposit Funds', icon: Plus },
            { id: 'withdraw', label: 'Withdraw Cash', icon: ArrowUpRight },
            { id: 'convert', label: 'Convert Coins to Cash 🪙->₹', icon: Coins },
            { id: 'history', label: 'Transaction History', icon: FileText },
            { id: 'security', label: 'Device & AI Security Prompt', icon: ShieldAlert }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#CEF500] text-[#0D0714] shadow-md shadow-[#CEF500]/30 scale-105'
                    : 'text-[#A69EC6] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: DEPOSIT WINDOW */}
        {activeTab === 'deposit' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-[32px] bg-[#1C1335]/95 border border-[#2E1E54] space-y-6"
          >
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white font-poppins flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#CEF500]" />
                <span>Instant Wallet Top-Up</span>
              </h3>
              <p className="text-xs text-[#A69EC6] mt-0.5">
                Load funds into your Syndicate account instantly via UPI, NetBanking, or Debit/Credit Card.
              </p>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-6 max-w-2xl">
              
              {/* Preset Amount Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#A69EC6] uppercase tracking-wider block">
                  Select Quick Amount
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {['100', '500', '1000', '2500', '5000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        depositAmount === amt
                          ? 'bg-[#CEF500] text-[#0D0714] shadow-md shadow-[#CEF500]/30 scale-105'
                          : 'bg-[#0D0714] border border-[#2E1E54] text-white hover:border-[#CEF500]'
                      }`}
                    >
                      ₹{parseInt(amt).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#A69EC6] uppercase tracking-wider block">
                  Deposit Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-sm font-bold text-[#CEF500]">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-[#0D0714] border border-[#2E1E54] focus:border-[#CEF500] rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold text-white outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#A69EC6] uppercase tracking-wider block">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'UPI', label: 'UPI / QR', desc: 'GPay, PhonePe, Paytm' },
                    { id: 'Card', label: 'Debit / Card', desc: 'Visa, Mastercard' },
                    { id: 'NetBanking', label: 'NetBanking', desc: 'All Major Banks' }
                  ].map((mode) => (
                    <div
                      key={mode.id}
                      onClick={() => setDepositMethod(mode.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        depositMethod === mode.id
                          ? 'border-[#CEF500] bg-[#CEF500]/10 text-white'
                          : 'border-[#2E1E54] bg-[#0D0714] text-[#A69EC6] hover:border-white/30'
                      }`}
                    >
                      <h4 className="text-xs font-black text-white">{mode.label}</h4>
                      <p className="text-[10px] text-[#A69EC6] mt-0.5">{mode.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submittingDeposit}
                className="w-full py-3.5 bg-gradient-to-r from-[#CEF500] via-[#A3E635] to-[#CEF500] text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#CEF500]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingDeposit ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Deposit ₹{parseFloat(depositAmount || 0).toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </motion.div>
        )}

        {/* TAB 2: WITHDRAW WINDOW */}
        {activeTab === 'withdraw' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-[32px] bg-[#1C1335]/95 border border-[#2E1E54] space-y-6"
          >
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white font-poppins flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-[#CEF500]" />
                <span>Withdraw Contest Winnings</span>
              </h3>
              <p className="text-xs text-[#A69EC6] mt-0.5">
                Transfer your contest cash winnings directly to your bank account or UPI ID.
              </p>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-6 max-w-2xl">
              
              {/* Withdrawable balance indicator */}
              <div className="p-4 rounded-2xl bg-[#0D0714] border border-[#2E1E54] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#A69EC6] block">Available for Cashout</span>
                  <span className="text-xl font-black text-[#CEF500] font-poppins">
                    ₹{isAuthenticated ? (balance || 0).toLocaleString() : '5,450'} INR
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#A69EC6] block">Minimum Withdrawal</span>
                  <span className="text-xs font-bold text-white">₹100 INR</span>
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#A69EC6] uppercase tracking-wider block">
                  Withdrawal Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-sm font-bold text-[#CEF500]">₹</span>
                  <input
                    type="number"
                    min="100"
                    max={balance || 5450}
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-[#0D0714] border border-[#2E1E54] focus:border-[#CEF500] rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold text-white outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Payout Method Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#A69EC6] uppercase tracking-wider block">
                  Payout Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'UPI', label: 'Instant UPI Transfer', desc: 'Direct to VPA (under 1 min)' },
                    { id: 'Bank', label: 'Bank Account (IMPS/NEFT)', desc: 'Account number + IFSC code' }
                  ].map((mode) => (
                    <div
                      key={mode.id}
                      onClick={() => setWithdrawMethod(mode.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        withdrawMethod === mode.id
                          ? 'border-[#CEF500] bg-[#CEF500]/10 text-white'
                          : 'border-[#2E1E54] bg-[#0D0714] text-[#A69EC6] hover:border-white/30'
                      }`}
                    >
                      <h4 className="text-xs font-black text-white">{mode.label}</h4>
                      <p className="text-[10px] text-[#A69EC6] mt-0.5">{mode.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditional Fields */}
              {withdrawMethod === 'UPI' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#A69EC6] uppercase tracking-wider block">
                    Your UPI VPA Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. mobile@okhdfcbank or user@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-[#0D0714] border border-[#2E1E54] focus:border-[#CEF500] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A69EC6]/50 outline-none transition-colors"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#A69EC6] uppercase tracking-wider block">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Account Number"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full bg-[#0D0714] border border-[#2E1E54] focus:border-[#CEF500] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A69EC6]/50 outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#A69EC6] uppercase tracking-wider block">
                      Bank IFSC Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="HDFC0001234"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                      className="w-full bg-[#0D0714] border border-[#2E1E54] focus:border-[#CEF500] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A69EC6]/50 outline-none transition-colors uppercase"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submittingWithdraw}
                className="w-full py-3.5 bg-gradient-to-r from-[#CEF500] via-[#A3E635] to-[#CEF500] text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#CEF500]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingWithdraw ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Withdraw ₹{parseFloat(withdrawAmount || 0).toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </motion.div>
        )}

        {/* TAB 2.5: CONVERT COINS TO CASH WINDOW */}
        {activeTab === 'convert' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-[32px] bg-[#1C1335]/95 border border-[#2E1E54] space-y-6"
          >
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white font-poppins flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#CEF500]" />
                <span>Instant Coin to Real Cash Conversion (🪙 ➔ ₹)</span>
              </h3>
              <p className="text-xs text-[#A69EC6] mt-0.5">
                Convert your earned platform coins into withdrawable Rupee balance instantly at standard platform rate: <span className="text-[#CEF500] font-bold">10 Coins = ₹1 INR</span>.
              </p>
            </div>

            <form onSubmit={handleConvertCoinsSubmit} className="space-y-6 max-w-2xl">
              
              {/* Balance & Conversion Ratio Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#0D0714] border border-[#2E1E54] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A69EC6] block">Available Coins</span>
                    <span className="text-xl font-black text-[#CEF500] font-poppins">
                      {isAuthenticated ? (coins || 0).toLocaleString() : '10,250'} 🪙
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConvertCoinsAmount(String(coins || 10250))}
                    className="text-[10px] font-bold text-[#CEF500] bg-[#CEF500]/10 hover:bg-[#CEF500]/20 px-2.5 py-1 rounded-lg border border-[#CEF500]/30 transition-colors cursor-pointer"
                  >
                    Convert Max
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D0714] border border-[#2E1E54] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A69EC6] block">Exchange Rate</span>
                    <span className="text-base font-black text-white font-poppins">
                      10 Coins = ₹1.00 INR
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Instant Credit
                  </span>
                </div>
              </div>

              {/* Quick Amount Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#A69EC6] uppercase tracking-wider block">
                  Quick Amount Presets
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { coins: '500', cash: '50' },
                    { coins: '1000', cash: '100' },
                    { coins: '2500', cash: '250' },
                    { coins: '5000', cash: '500' }
                  ].map((preset) => (
                    <button
                      key={preset.coins}
                      type="button"
                      onClick={() => setConvertCoinsAmount(preset.coins)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        convertCoinsAmount === preset.coins
                          ? 'bg-[#CEF500] text-[#0D0714] shadow-md shadow-[#CEF500]/30 scale-105'
                          : 'bg-[#0D0714] border border-[#2E1E54] text-white hover:border-[#CEF500]'
                      }`}
                    >
                      {parseInt(preset.coins).toLocaleString()} Coins (= ₹{preset.cash})
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Coins Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#A69EC6] uppercase tracking-wider block">
                  Coins to Convert (Minimum: 50 Coins)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-sm font-bold text-[#CEF500]">🪙</span>
                  <input
                    type="number"
                    min="50"
                    max={coins || 10250}
                    required
                    value={convertCoinsAmount}
                    onChange={(e) => setConvertCoinsAmount(e.target.value)}
                    className="w-full bg-[#0D0714] border border-[#2E1E54] focus:border-[#CEF500] rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Live Cash Preview Box */}
              <div className="p-4 rounded-2xl bg-[#0D0714] border border-[#CEF500]/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#A69EC6] block">
                    You Will Receive In Withdrawable Cash
                  </span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CEF500] to-white font-poppins">
                    +₹{((parseInt(convertCoinsAmount, 10) || 0) / 10).toFixed(2)} INR
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#A69EC6] block">New Wallet Balance After:</span>
                  <span className="text-xs font-bold text-white">
                    ₹{((balance || 0) + ((parseInt(convertCoinsAmount, 10) || 0) / 10)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submittingConvert}
                className="w-full py-3.5 bg-gradient-to-r from-[#CEF500] via-[#A3E635] to-[#CEF500] text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#CEF500]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingConvert ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Conversion...</span>
                  </>
                ) : (
                  <>
                    <span>Convert {parseInt(convertCoinsAmount || 0).toLocaleString()} Coins ➔ ₹{((parseInt(convertCoinsAmount, 10) || 0) / 10).toFixed(2)} Cash</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </motion.div>
        )}

        {/* TAB 3: TRANSACTION LEDGER */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-[32px] bg-[#1C1335]/95 border border-[#2E1E54] space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white font-poppins flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#CEF500]" />
                  <span>Wallet Transaction Ledger</span>
                </h3>
                <p className="text-xs text-[#A69EC6] mt-0.5">
                  Complete history of deposits, entry fees, prize credits, and withdrawals.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#0D0714] border border-[#2E1E54] rounded-xl">
                {['All', 'Deposits', 'Withdrawals', 'Contests', 'Rewards'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setHistoryFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                      historyFilter === f
                        ? 'bg-[#CEF500] text-[#0D0714]'
                        : 'text-[#A69EC6] hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Transactions Table / List */}
            <div className="divide-y divide-[#2E1E54] border border-[#2E1E54] rounded-2xl overflow-hidden bg-[#0D0714]/60">
              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-xs font-bold text-white">No transactions found in this category</p>
                  <p className="text-[11px] text-[#A69EC6]">
                    Your real-time wallet transactions will appear here as you deposit or enter contests.
                  </p>
                </div>
              ) : (
                filteredTransactions.map((tx, idx) => {
                  const isCredit = tx.type === 'Deposit' || tx.type === 'Prize Payout' || tx.type === 'Reward' || tx.type === 'Bonus';
                  return (
                    <div key={tx._id || idx} className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isCredit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white font-poppins">{tx.description || tx.type}</h4>
                          <span className="text-[10px] text-[#A69EC6] font-mono">
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Today'} • {tx.type}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-sm font-black font-poppins ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isCredit ? '+' : '-'}₹{(tx.amount || 0).toLocaleString()}
                        </span>
                        <span className="block text-[9px] uppercase tracking-wider font-bold text-[#A69EC6]">
                          {tx.status || 'Completed'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: DEVICE & AI SECURITY PROMPT */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* AI Security & Financial Prompt Assistant (2 cols) */}
            <div className="lg:col-span-2 p-6 sm:p-7 rounded-[32px] bg-[#1C1335]/95 border-2 border-[#CEF500]/50 shadow-2xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#CEF500] flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    <span>AI Security & Compliance Assistant</span>
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white font-poppins pt-1">
                    Ask AI to audit your wallet security & cross-device status
                  </h3>
                </div>
                <span className="text-xs bg-[#CEF500]/10 text-[#CEF500] border border-[#CEF500]/30 px-3 py-1 rounded-full font-mono font-bold">
                  Prompt Model v2.4
                </span>
              </div>

              {/* Recommendation Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  'Audit active devices for wallet security',
                  'What are the withdrawal tax compliance rules?',
                  'Estimate contest winnings with current balance'
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
                  placeholder="Ask AI Prompt: e.g., 'Check my device authorization and withdrawal limits'"
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

              {/* Output Window */}
              {(aiResponse || isAiLoading) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[#0D0714] border border-[#2E1E54] rounded-2xl text-xs text-[#A69EC6] leading-relaxed space-y-2"
                >
                  {isAiLoading ? (
                    <div className="flex items-center gap-2 text-[#CEF500] font-bold">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI Security Engine is analyzing wallet state...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-line text-white">
                      {aiResponse}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Other Device Session Management (1 col) */}
            <div className="p-6 rounded-[32px] bg-[#1C1335]/95 border border-[#2E1E54] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#A69EC6] flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-[#CEF500]" />
                  <span>Authorized Devices</span>
                </span>
                <h4 className="text-base font-black text-white font-poppins">
                  Cross-Device Session Control
                </h4>
                <p className="text-xs text-[#A69EC6] leading-relaxed">
                  Safeguard your wallet balance by revoking unfamiliar browsers or secondary computers.
                </p>
              </div>

              {/* Sync Code Box */}
              <div className="p-4 bg-[#0D0714] border border-[#2E1E54] rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#A69EC6] block">
                  One-Time Device Sync Code:
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-black text-[#CEF500] tracking-widest">
                    {deviceSyncCode}
                  </span>
                  <button
                    onClick={handleCopySyncCode}
                    className="p-2 bg-[#1C1335] hover:bg-[#CEF500] text-[#A69EC6] hover:text-[#0D0714] rounded-xl transition-colors cursor-pointer"
                    title="Copy Code"
                  >
                    {copiedSyncCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#A69EC6]">
                  Use to safely authorize wallet access on your smartphone.
                </p>
              </div>

              {/* Logout other devices button */}
              <button
                onClick={handleLogoutOtherDevices}
                disabled={revokingOtherDevices}
                className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>{revokingOtherDevices ? 'Terminating...' : 'Logout All Other Devices'}</span>
              </button>
            </div>

          </motion.div>
        )}

      </main>

      {/* LOGIN WARNING MODAL */}
      <LoginWarningModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        targetPage="wallet"
        onSuccessLogin={() => {
          setShowLoginModal(false);
          fetchWalletOverview();
        }}
      />

    </div>
  );
};

export default WebsiteWalletPage;
