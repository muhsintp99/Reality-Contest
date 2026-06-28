import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Shield, Eye, EyeOff, Lock, Mail, Phone, KeyRound, Sparkles, Chrome, Github, Facebook } from 'lucide-react';

export const Login = ({ onRegisterClick, onForgotClick, onLoginSuccess }) => {
  const { login, sendOtp, error, loading, isMockMode, toggleMockMode } = useAuthStore();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sentOtpVal, setSentOtpVal] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(loginId, password, isOtpLogin, otpCode);
    if (success) {
      onLoginSuccess();
    }
  };

  const handleSendOtp = async () => {
    if (!loginId) {
      alert('Please enter your email or mobile number first.');
      return;
    }
    const otp = await sendOtp(loginId, 'login');
    setOtpSent(true);
    setSentOtpVal(otp);
  };

  const handleSocialLogin = async (provider) => {
    const success = await login(
      `${provider.toLowerCase()}-user@realitycontest.in`, 
      'password'
    );
    if (success) {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#080b12] text-white">
      {/* Left side Panel: Brand Showcase */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-gradient-to-br from-[#0f1424] to-[#080b12] border-r border-white/5 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-cyan-600/10 blur-[80px] animate-pulse"></div>

        <div className="flex items-center gap-3 z-10">
          <div className="p-2.5 bg-purple-600/20 border border-purple-500/30 rounded-xl">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <span className="font-poppins font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Reality Contest Platform
          </span>
        </div>

        <div className="my-auto z-10">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-2xl blur-xl opacity-20 animate-float"></div>
            <div className="glassmorphism p-6 rounded-2xl border border-white/10 relative overflow-hidden animate-float">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 bg-cyan-500/20 text-cyan-400 rounded-full">
                  Featured Challenge
                </span>
                <span className="text-xs text-white/50">Live Showcase</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">India Creator Showdown 2026</h3>
              <p className="text-sm text-white/70 mb-4">
                Join 10,000+ creators validating live media skills, climbing user voting leaderboards, and winning cash reward distributions.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img className="w-8 h-8 rounded-full border border-surfaceDark" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav" alt="" />
                  <img className="w-8 h-8 rounded-full border border-surfaceDark" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" alt="" />
                  <img className="w-8 h-8 rounded-full border border-surfaceDark" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir" alt="" />
                </div>
                <span className="text-xs text-white/60 font-medium">1,420 Contestants Active</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-purple-400">Previous Winners</h4>
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3">
              <img className="w-10 h-10 rounded-full" src="https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaI" alt="" />
              <div>
                <p className="text-xs font-semibold">Ananya Iyer</p>
                <p className="text-[11px] text-white/60">Credited ₹10 Lakhs • Creator Cup Winner</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/40 z-10">
          Secure JWT, MFA & AI Liveness capture framework. Ready for audit compliance.
        </p>
      </div>

      {/* Right side Panel: Login Form */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-12 relative overflow-hidden">
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[90px] pointer-events-none"></div>

        <div className="absolute top-6 right-6 flex items-center gap-2 bg-surfaceDark/60 px-3 py-1.5 rounded-full border border-white/10 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-white/60">Mock Environment:</span>
          <button
            type="button"
            onClick={() => toggleMockMode(!isMockMode)}
            className={`px-2 py-0.5 rounded font-bold uppercase transition-colors ${
              isMockMode ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/50'
            }`}
          >
            {isMockMode ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="text-left">
            <h2 className="text-3xl font-extrabold font-poppins tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Sign in to manage contestant profile, judge scoring sheets, or campaign leads.
            </p>
          </div>

          <div className="glassmorphism p-8 rounded-2xl border border-white/10 shadow-2xl relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    {loginId.includes('@') ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="name@domain.com or +919876543210"
                    className="block w-full pl-10 pr-4 py-3 bg-[#080b12]/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              {!isOtpLogin ? (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/60">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={onForgotClick}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!isOtpLogin}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-10 py-3 bg-[#080b12]/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/60"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/60">
                      Verification OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                    >
                      {otpSent ? 'Resend OTP' : 'Request OTP'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required={isOtpLogin}
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="6-digit verification code"
                      className="block w-full pl-10 pr-4 py-3 bg-[#080b12]/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm tracking-widest text-center font-bold"
                    />
                  </div>
                  {otpSent && isMockMode && (
                    <div className="mt-2 text-xs text-purple-400 font-medium">
                      Simulated Login OTP is: <span className="bg-purple-500/20 px-2 py-0.5 rounded font-bold">{sentOtpVal}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-white/60">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-black border-white/10 text-purple-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Remember my device</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setIsOtpLogin(!isOtpLogin);
                    setOtpSent(false);
                  }}
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  {isOtpLogin ? 'Use Password Sign-in' : 'Sign in with OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white text-sm font-semibold transition-all shadow-lg hover:shadow-purple-500/10 flex justify-center items-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 border-t border-white/5 pt-6 text-center">
              <span className="text-xs text-white/40 font-medium uppercase tracking-wider block mb-4">
                Or Continue With
              </span>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center justify-center py-2.5 border border-white/10 hover:border-white/20 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-xs font-semibold gap-2"
                >
                  <Chrome className="w-4 h-4 text-red-400" />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('GitHub')}
                  className="flex items-center justify-center py-2.5 border border-white/10 hover:border-white/20 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-xs font-semibold gap-2"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Facebook')}
                  className="flex items-center justify-center py-2.5 border border-white/10 hover:border-white/20 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-xs font-semibold gap-2"
                >
                  <Facebook className="w-4 h-4 text-blue-500" />
                  <span>Facebook</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-white/50">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-purple-400 hover:text-purple-300 font-semibold"
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
