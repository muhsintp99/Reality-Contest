import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginRequest, sendOtpRequest } from '../store/authSlice';
import { Eye, EyeOff, Lock, Mail, Phone, KeyRound, Sparkles, Chrome, Github, Facebook } from 'lucide-react';
import { HakaLogo } from '../components/HakaLogo';
import { motion } from 'framer-motion';

export const Login = ({ onRegisterClick, onForgotClick, onLoginSuccess }) => {
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.auth);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginRequest({
      loginId,
      password,
      isOtpLogin,
      otp: otpCode,
      isAdminLogin: false,
      callback: (success) => {
        if (success) onLoginSuccess();
      }
    }));
  };

  const handleSendOtp = () => {
    if (!loginId) {
      alert('Please enter your email or mobile number first.');
      return;
    }
    dispatch(sendOtpRequest({
      loginId,
      type: 'login',
      callback: () => {
        setOtpSent(true);
      }
    }));
  };

  const handleSocialLogin = (provider) => {
    dispatch(loginRequest({
      loginId: `${provider.toLowerCase()}-user@realitycontest.in`,
      password: 'password',
      isAdminLogin: false,
      callback: (success) => {
        if (success) onLoginSuccess();
      }
    }));
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F7F8FA] dark:bg-[#080b12] text-slate-800 dark:text-white transition-colors duration-300">
      
      {/* Left side Panel: Brand Showcase (gorgeous minimalist gradient) */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-white dark:bg-[#0f1424] border-r border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-brandPrimary/5 blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-brandSecondary/5 blur-[80px] animate-pulse"></div>

        <div className="flex items-center gap-3 z-10">
          <HakaLogo variant="horizontal" size={110} />
        </div>

        <div className="my-auto z-10 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brandPrimary to-brandSecondary rounded-[24px] blur-xl opacity-10 animate-float"></div>
            <div className="glassmorphism p-6 rounded-[24px] border border-slate-200/50 dark:border-white/10 relative overflow-hidden bg-white/80 dark:bg-slate-900/50 shadow-premium animate-float">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-extrabold px-2.5 py-1 bg-brandSecondary/10 text-brandPrimary dark:text-brandSecondary rounded-full uppercase tracking-wider">
                  Featured Challenge
                </span>
                <span className="text-[10px] text-slate-400 dark:text-white/40 font-bold uppercase">Live Arena</span>
              </div>
              <h3 className="font-extrabold text-lg mb-2 text-slate-800 dark:text-white leading-tight">India Creator Showdown 2026</h3>
              <p className="text-xs text-slate-500 dark:text-white/60 mb-4 leading-relaxed font-medium">
                Join 10,000+ creators validating live media skills, climbing user voting leaderboards, and winning cash reward distributions.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img className="w-8 h-8 rounded-full border border-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav" alt="" />
                  <img className="w-8 h-8 rounded-full border border-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" alt="" />
                  <img className="w-8 h-8 rounded-full border border-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir" alt="" />
                </div>
                <span className="text-[11px] text-slate-400 dark:text-white/50 font-bold">1,420 Contestants Active</span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/35">Previous Winner</h4>
            <div className="p-4 bg-slate-55 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl flex items-center gap-3 shadow-sm">
              <img className="w-10 h-10 rounded-full animate-float-delayed" src="https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaI" alt="" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Ananya Iyer</p>
                <p className="text-[10px] text-slate-450 dark:text-white/50 font-medium">Credited ₹10 Lakhs • Creator Cup Winner</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 dark:text-white/35 z-10 font-bold uppercase tracking-wider">
          Secure Identity Verification, MFA & Liveness Checks.
        </p>
      </div>

      {/* Right side Panel: Login Form */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-12 relative overflow-hidden">
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-brandPrimary/5 blur-[90px] pointer-events-none"></div>

        <div className="max-w-md w-full mx-auto space-y-8 z-10">
          <div className="text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-xs text-slate-450 dark:text-white/50 font-semibold leading-relaxed">
              Sign in to manage contestant profile, judge scoring sheets, or campaign leads.
            </p>
          </div>

          <div className="glassmorphism p-8 rounded-[24px] border border-slate-200/50 dark:border-white/10 shadow-premium relative bg-white/80 dark:bg-slate-900/40">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold flex flex-col gap-2">
                  <span>{error}</span>
                  {error.includes('only allowed to access the Admin Dashboard') && (
                    <a
                      href={window.location.protocol + '//' + window.location.hostname + ':' + String(Number(window.location.port || '10001') + 1)}
                      className="inline-flex items-center justify-center py-2 px-3 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-[10px] font-bold mt-1.5 transition-all text-center"
                    >
                      Go to Admin Dashboard
                    </a>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-white/30">
                    {loginId.includes('@') ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    autoComplete="username"
                    placeholder="name@domain.com or +919876543210"
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary/50 text-xs transition-all"
                  />
                </div>
              </div>

              {!isOtpLogin ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={onForgotClick}
                      className="text-xs text-brandPrimary hover:text-brandPrimary/80 font-bold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-white/30">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!isOtpLogin}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary/50 text-xs transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-white/40 hover:text-slate-650"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35">
                      Verification OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs text-brandPrimary hover:text-brandPrimary/80 font-bold"
                    >
                      {otpSent ? 'Resend OTP' : 'Request OTP'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-white/30">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required={isOtpLogin}
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="6-digit verification code"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary/50 text-xs tracking-widest text-center font-extrabold"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white/60">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-200 dark:border-white/10 text-brandPrimary accent-brandPrimary w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-500 dark:text-white/50">Remember my device</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setIsOtpLogin(!isOtpLogin);
                    setOtpSent(false);
                  }}
                  className="text-brandPrimary hover:text-brandPrimary/80 font-bold"
                >
                  {isOtpLogin ? 'Use Password Sign-in' : 'Sign in with OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-brandPrimary hover:bg-brandPrimary/90 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200/60 dark:border-white/5 pt-6 text-center">
              <span className="text-[10px] text-slate-400 dark:text-white/35 font-bold uppercase tracking-wider block mb-4">
                Or Continue With
              </span>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center justify-center py-2 border border-slate-200 dark:border-white/10 hover:border-slate-350 dark:hover:border-white/20 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white transition-all text-xs font-bold gap-2 shadow-sm active:scale-[0.98]"
                >
                  <Chrome className="w-4 h-4 text-red-500" />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('GitHub')}
                  className="flex items-center justify-center py-2 border border-slate-200 dark:border-white/10 hover:border-slate-350 dark:hover:border-white/20 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white transition-all text-xs font-bold gap-2 shadow-sm active:scale-[0.98]"
                >
                  <Github className="w-4 h-4 text-slate-705 dark:text-white" />
                  <span>GitHub</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Facebook')}
                  className="flex items-center justify-center py-2 border border-slate-200 dark:border-white/10 hover:border-slate-350 dark:hover:border-white/20 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white transition-all text-xs font-bold gap-2 shadow-sm active:scale-[0.98]"
                >
                  <Facebook className="w-4 h-4 text-blue-500" />
                  <span>Facebook</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-white/40 font-semibold">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-brandPrimary hover:text-brandPrimary/80 font-bold"
            >
              Sign up today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
