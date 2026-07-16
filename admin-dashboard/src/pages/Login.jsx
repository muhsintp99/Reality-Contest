import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginRequest, clearError } from '../store/authSlice';
import { Eye, EyeOff, Lock, Mail, Phone, Sparkles } from 'lucide-react';
import { HakaLogo } from '../components/HakaLogo';

export const Login = ({ onForgotClick, onLoginSuccess }) => {
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.auth);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginRequest({
      loginId,
      password,
      isOtpLogin: false,
      otp: '',
      isAdminLogin: true,
      callback: (success) => {
        if (success) onLoginSuccess();
      }
    }));
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-brandPrimary/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-brandSecondary/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[460px] z-10 space-y-6">
        <div className="glassmorphism p-8 rounded-2xl border border-white/10 shadow-2xl relative flex flex-col items-center">
          
          {/* Logo Showcase */}
          <div className="mb-6">
            <HakaLogo variant="icon" size={48} className="w-12 h-12" />
          </div>

          {/* Title & Subtitle */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-extrabold font-poppins tracking-tight text-white">
              Admin Dashboard Login
            </h2>
            <p className="mt-1.5 text-xs text-white/50">
              Sign in to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold text-left flex flex-col gap-2 w-full">
                <span>{error}</span>
                {error.includes('not authorized to access the Admin Dashboard') && (
                  <a
                    href="http://localhost:10001"
                    className="inline-flex items-center justify-center py-2 px-3 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-lg text-[10px] font-bold mt-1.5 transition-all text-center w-full"
                  >
                    Go to Main Website
                  </a>
                )}
              </div>
            )}

            {/* Email / Mobile Field */}
            <div className="space-y-2 text-left">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/55">
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
                  autoComplete="username"
                  placeholder="name@domain.com or +91..."
                  className="block w-full pl-10 pr-4 py-3 bg-[#0c1322] border border-white/10 rounded-xl text-white placeholder-white/20 text-xs focus:outline-none focus:border-brandPrimary/65 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/55">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onForgotClick}
                  className="text-[10px] font-bold text-brandPrimary hover:underline hover:text-brandPrimary/85 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-12 py-3 bg-[#0c1322] border border-white/10 rounded-xl text-white placeholder-white/20 text-xs focus:outline-none focus:border-brandPrimary/65 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/45 hover:text-white/75 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center text-xs text-left">
              <label className="flex items-center gap-2 text-white/60 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/15 bg-[#0c1322] text-brandPrimary focus:ring-brandPrimary/35"
                />
                <span>Remember Me</span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex justify-center items-center gap-2 shadow-lg shadow-brandPrimary/10"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
