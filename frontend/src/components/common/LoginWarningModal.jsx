import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Lock, AlertTriangle, ArrowRight, X, Sparkles, 
  Smartphone, Monitor, RefreshCw, CheckCircle2, UserCheck, 
  Key, LogIn, UserPlus, HelpCircle, Bot, Send, Copy, Check
} from 'lucide-react';
import { loginRequest, guestLoginRequest } from '../../store/authSlice';

export const LoginWarningModal = ({ 
  isOpen, 
  onClose, 
  targetPage = 'wallet', // 'wallet' or 'coin'
  onSuccessLogin
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'device' | 'ai-prompt'
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [deviceCode, setDeviceCode] = useState('749-318');
  const [codeTimer, setCodeTimer] = useState(299);
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isCopiedPrompt, setIsCopiedPrompt] = useState(false);

  // AI Prompt tab state
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiConversation, setAiConversation] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your Platform Security & Device AI Assistant. Why is login required? Coin balances and wallet funds are tied to encrypted ledgers. You can sign in directly, authorize from another device, or ask me any question!'
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Timer for 6-digit sync code
  useEffect(() => {
    if (!isOpen || activeTab !== 'device') return;
    const interval = setInterval(() => {
      setCodeTimer((prev) => {
        if (prev <= 1) {
          // Generate new random code
          const rand = Math.floor(100000 + Math.random() * 900000);
          setDeviceCode(`${String(rand).slice(0, 3)}-${String(rand).slice(3)}`);
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleGenerateNewCode = () => {
    const rand = Math.floor(100000 + Math.random() * 900000);
    setDeviceCode(`${String(rand).slice(0, 3)}-${String(rand).slice(3)}`);
    setCodeTimer(300);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(deviceCode.replace('-', ''));
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 2000);
  };

  // Direct login submission
  const handleDirectLogin = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!loginId.trim() || !password.trim()) {
      setLocalError('Please enter both your email/phone and password.');
      return;
    }

    console.log('%c🔒 [AUTH MODAL] Calling API: POST /api/auth/login', 'background: #c2410c; color: #ffedd5; font-weight: bold; padding: 3px 6px; border-radius: 4px;', { loginId: loginId.trim() });

    dispatch(
      loginRequest({
        loginId: loginId.trim(),
        password,
        callback: (success) => {
          if (success) {
            console.log('%c🎉 [AUTH MODAL] Authentication Succeeded! Entering requested page.', 'color: #4ade80; font-weight: bold;');
            if (onSuccessLogin) {
              onSuccessLogin();
            }
            if (onClose) {
              onClose();
            }
          } else {
            console.warn('%c⚠️ [AUTH MODAL] Authentication Failed for:', 'color: #f87171;', loginId);
            setLocalError('Invalid credentials. Please verify your email/phone and password.');
          }
        }
      })
    );
  };

  // One-click instant guest/demo login
  const handleGuestLogin = () => {
    setLocalError('');
    console.log('%c⚡ [AUTH MODAL] Calling API: POST /api/auth/guest-login', 'background: #7c2d12; color: #fed7aa; font-weight: bold; padding: 3px 6px; border-radius: 4px;');
    dispatch(
      guestLoginRequest({
        callback: (success) => {
          if (success) {
            if (onSuccessLogin) {
              onSuccessLogin();
            }
            if (onClose) {
              onClose();
            }
          } else {
            setLocalError('Failed to initialize demo session. Please try logging in manually.');
          }
        }
      })
    );
  };

  // AI Prompt submission
  const handleSendAiPrompt = (promptText) => {
    const query = promptText || aiPromptInput;
    if (!query.trim()) return;

    setAiConversation((prev) => [...prev, { sender: 'user', text: query }]);
    setAiPromptInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();

      if (lower.includes('other device') || lower.includes('another device') || lower.includes('phone')) {
        reply = `📱 Using another device? 1. Open the app on your mobile or second laptop. 2. Navigate to Profile > Authorized Devices. 3. Enter your current session pairing code: [${deviceCode}] or scan the QR Code in the 'Use Other Device' tab to auto-authorize without re-entering credentials!`;
      } else if (lower.includes('why') || lower.includes('require') || lower.includes('login') || lower.includes('protect')) {
        reply = `🔒 Why Authentication is Required: Your Coin Vault and Real Cash Wallet hold genuine platform currency, contest payout winnings, and bonus points. To comply with financial security standards, real-time balances and withdrawals require an authorized session.`;
      } else if (lower.includes('coin') || lower.includes('earn')) {
        reply = `🪙 Coin Rewards: Once logged in, you immediately get access to Daily Spin (+50 to +1,000 Coins), Daily Login Streak Bonuses (+100 Coins), and Sponsored Video Ad rewards. You can use coins to enter cash contests for free!`;
      } else if (lower.includes('wallet') || lower.includes('withdraw') || lower.includes('kyc')) {
        reply = `💳 Wallet Security: Your wallet supports instant UPI and Bank withdrawals once your KYC is submitted. You can deposit entry fees starting from ₹100 and track all contest prize payouts in real time.`;
      } else {
        reply = `🤖 AI Prompt Assistant: For your security on "${targetPage === 'coin' ? 'Coin Store & Rewards' : 'Wallet Manager'}", please authenticate using the Quick Sign-In form or authorize your session from your mobile device using code [${deviceCode}].`;
      }

      setAiConversation((prev) => [...prev, { sender: 'ai', text: reply }]);
      setIsAiTyping(false);
    }, 600);
  };

  const handleCopyAiPrompt = () => {
    const promptText = `Authorize Reality Contest web session on this device with code: ${deviceCode}. User is accessing ${targetPage === 'coin' ? 'Coin Store' : 'Wallet'}.`;
    navigator.clipboard.writeText(promptText);
    setIsCopiedPrompt(true);
    setTimeout(() => setIsCopiedPrompt(false), 2000);
  };

  if (!isOpen) return null;

  const targetTitle = targetPage === 'coin' ? 'Coin Vault & Rewards' : 'Syndicate Wallet & Funds';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-xl bg-[#1C1335]/95 border-2 border-[#CEF500]/60 rounded-[32px] p-6 sm:p-8 shadow-[0_0_50px_rgba(206,245,0,0.25)] text-left space-y-6 my-8 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#CEF500]/30"
        >
          {/* Neon Glow Accent Header */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#CEF500] via-[#B983FF] to-[#CEF500] rounded-t-[32px]" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-[#0D0714] text-[#A69EC6] hover:text-white hover:bg-[#2E1E54] border border-[#2E1E54] transition-all cursor-pointer"
            title="Close warning modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Warning Banner Top */}
          <div className="flex items-start gap-4 pt-1">
            <div className="p-3.5 bg-gradient-to-br from-amber-500/20 to-[#CEF500]/20 border border-[#CEF500]/40 rounded-2xl text-[#CEF500] shrink-0 shadow-lg">
              <ShieldAlert className="w-8 h-8 animate-pulse text-[#CEF500]" />
            </div>
            <div className="space-y-1 pr-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Authentication Required
                </span>
                <span className="text-[10px] font-bold text-[#A69EC6]">Security Check</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-poppins leading-tight">
                Please Log In to Access <span className="text-[#CEF500]">{targetTitle}</span>
              </h3>
              <p className="text-xs text-[#A69EC6] font-medium leading-relaxed">
                Wallet balances, real cash transactions, coin transfers, and daily bonus claims are protected under encrypted financial protocols. Log in to enter your account or authorize via your other device.
              </p>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex items-center gap-2 p-1.5 bg-[#0D0714] border border-[#2E1E54] rounded-2xl">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-[#CEF500] text-[#0D0714] shadow-md shadow-[#CEF500]/30 font-extrabold'
                  : 'text-[#A69EC6] hover:text-white hover:bg-white/5'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Quick Sign In</span>
            </button>

            <button
              onClick={() => setActiveTab('device')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'device'
                  ? 'bg-[#CEF500] text-[#0D0714] shadow-md shadow-[#CEF500]/30 font-extrabold'
                  : 'text-[#A69EC6] hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Use Other Device</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-prompt')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'ai-prompt'
                  ? 'bg-[#CEF500] text-[#0D0714] shadow-md shadow-[#CEF500]/30 font-extrabold'
                  : 'text-[#A69EC6] hover:text-white hover:bg-white/5'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Prompt</span>
            </button>
          </div>

          {/* TAB 1: QUICK SIGN IN FORM */}
          {activeTab === 'login' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {(localError || error) && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{localError || error}</span>
                </div>
              )}

              <form onSubmit={handleDirectLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#A69EC6] uppercase tracking-wider block">
                    Email or Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="contestant@example.com / 9876543210"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full bg-[#0D0714] border border-[#2E1E54] focus:border-[#CEF500] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A69EC6]/50 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#A69EC6] uppercase tracking-wider block">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/forgot-password');
                      }}
                      className="text-[10px] text-[#CEF500] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0D0714] border border-[#2E1E54] focus:border-[#CEF500] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A69EC6]/50 outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-[#CEF500] via-[#A3E635] to-[#CEF500] text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#CEF500]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In & Unlock {targetPage === 'coin' ? 'Coins' : 'Wallet'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Instant Guest Mode / Demo Access */}
              <div className="pt-2 border-t border-[#2E1E54] flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] text-[#A69EC6]">
                  <span>Want to explore instantly without credentials?</span>
                  <button
                    onClick={handleGuestLogin}
                    disabled={loading}
                    className="text-[#CEF500] font-black hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant Guest Access</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: USE OTHER DEVICE (QR & SYNC CODE) */}
          {activeTab === 'device' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 text-center"
            >
              <div className="p-4 bg-[#0D0714] border border-[#2E1E54] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                {/* Simulated QR Code Box */}
                <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-lg relative group">
                  {/* Clean SVG QR Code Representation */}
                  <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="5" y="5" width="25" height="25" rx="3" fill="#000" />
                    <rect x="9" y="9" width="17" height="17" fill="#fff" />
                    <rect x="13" y="13" width="9" height="9" fill="#000" />
                    <rect x="70" y="5" width="25" height="25" rx="3" fill="#000" />
                    <rect x="74" y="9" width="17" height="17" fill="#fff" />
                    <rect x="78" y="13" width="9" height="9" fill="#000" />
                    <rect x="5" y="70" width="25" height="25" rx="3" fill="#000" />
                    <rect x="9" y="74" width="17" height="17" fill="#fff" />
                    <rect x="13" y="78" width="9" height="9" fill="#000" />
                    <rect x="40" y="10" width="8" height="8" fill="#000" />
                    <rect x="50" y="20" width="8" height="8" fill="#000" />
                    <rect x="40" y="40" width="20" height="20" fill="#000" />
                    <rect x="70" y="45" width="10" height="10" fill="#000" />
                    <rect x="85" y="55" width="8" height="8" fill="#000" />
                    <rect x="40" y="70" width="10" height="10" fill="#000" />
                    <rect x="60" y="80" width="10" height="10" fill="#000" />
                    <rect x="80" y="75" width="12" height="12" fill="#000" />
                  </svg>
                  <div className="absolute inset-0 bg-[#CEF500]/10 rounded-xl pointer-events-none" />
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#CEF500]" />
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      Scan or Enter 6-Digit Code
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#A69EC6] leading-relaxed">
                    Open Reality Contest on your logged-in mobile or secondary device, navigate to <span className="text-white font-bold">Settings &gt; Authorized Devices</span> and approve this session.
                  </p>

                  {/* 6-Digit Code Badge */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="bg-[#1C1335] border border-[#CEF500]/60 px-3.5 py-1.5 rounded-xl font-mono font-black text-base text-[#CEF500] tracking-widest shadow-inner">
                      {deviceCode}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 bg-[#2E1E54] hover:bg-[#CEF500] text-[#A69EC6] hover:text-[#0D0714] rounded-xl transition-colors cursor-pointer"
                      title="Copy Code"
                    >
                      {isCopiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleGenerateNewCode}
                      className="p-2 bg-[#2E1E54] hover:bg-[#CEF500] text-[#A69EC6] hover:text-[#0D0714] rounded-xl transition-colors cursor-pointer"
                      title="Regenerate Code"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono text-[#A69EC6]">
                      Expires in {formatTimer(codeTimer)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Check Authorization status */}
              <button
                onClick={handleGuestLogin}
                className="w-full py-2.5 bg-[#0D0714] border border-[#CEF500]/40 hover:border-[#CEF500] text-[#CEF500] hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate / Check Authorization from Other Device</span>
              </button>
            </motion.div>
          )}

          {/* TAB 3: AI PROMPT ASSISTANT */}
          {activeTab === 'ai-prompt' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3.5"
            >
              {/* Quick Prompt Recommendation Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Authorize access from my other device',
                  'Why is login required for wallet & coins?',
                  'How to earn coins & withdraw cash'
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSendAiPrompt(chip)}
                    className="text-[10px] bg-[#0D0714] border border-[#2E1E54] hover:border-[#CEF500] text-[#A69EC6] hover:text-white px-2.5 py-1 rounded-full transition-all cursor-pointer truncate max-w-full"
                  >
                    💡 {chip}
                  </button>
                ))}
              </div>

              {/* Chat Thread */}
              <div className="h-44 overflow-y-auto space-y-2 p-3 bg-[#0D0714] border border-[#2E1E54] rounded-2xl text-xs scrollbar-thin scrollbar-thumb-[#CEF500]/30">
                {aiConversation.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-[#CEF500]/20 border border-[#CEF500]/40 flex items-center justify-center shrink-0 text-[#CEF500]">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`p-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#CEF500] text-[#0D0714] font-bold rounded-tr-none'
                          : 'bg-[#1C1335] text-white border border-[#2E1E54] rounded-tl-none font-medium'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiTyping && (
                  <div className="flex items-center gap-1.5 text-[10px] text-[#A69EC6] italic">
                    <Bot className="w-3.5 h-3.5 text-[#CEF500] animate-spin" />
                    <span>AI Assistant is analyzing security prompt...</span>
                  </div>
                )}
              </div>

              {/* Prompt Input Box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask AI how to log in, sync other device, or protect coins..."
                  value={aiPromptInput}
                  onChange={(e) => setAiPromptInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAiPrompt()}
                  className="flex-1 bg-[#0D0714] border border-[#2E1E54] focus:border-[#CEF500] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#A69EC6]/50 outline-none transition-colors"
                />
                <button
                  onClick={() => handleSendAiPrompt()}
                  disabled={!aiPromptInput.trim()}
                  className="p-2.5 bg-[#CEF500] text-[#0D0714] hover:bg-[#A3E635] rounded-xl transition-all cursor-pointer disabled:opacity-40"
                  title="Send Prompt"
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopyAiPrompt}
                  className="p-2.5 bg-[#1C1335] border border-[#2E1E54] hover:border-[#CEF500] text-[#A69EC6] hover:text-white rounded-xl transition-all cursor-pointer"
                  title="Copy Device AI Prompt String"
                >
                  {isCopiedPrompt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          )}

          {/* Footer Actions: Register & External Links */}
          <div className="pt-4 border-t border-[#2E1E54] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#A69EC6]">Don't have an account?</span>
              <button
                onClick={() => {
                  onClose();
                  navigate('/register');
                }}
                className="text-[#CEF500] font-black hover:underline cursor-pointer flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Free Account</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="text-[#A69EC6] hover:text-white transition-colors cursor-pointer text-xs"
              >
                Full Login Portal
              </button>
              <span className="text-[#2E1E54]">|</span>
              <button
                onClick={onClose}
                className="text-[#A69EC6] hover:text-[#CEF500] transition-colors cursor-pointer text-xs font-bold"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginWarningModal;
