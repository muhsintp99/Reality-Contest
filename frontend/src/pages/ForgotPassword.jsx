import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { forgotPasswordRequest, resetPasswordRequest } from '../store/authSlice';
import { KeyRound, Mail, Lock, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { HakaLogo } from '../components/HakaLogo';
import { motion } from 'framer-motion';

export const ForgotPassword = ({ onBackToLogin }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    dispatch(forgotPasswordRequest({
      email,
      callback: (res) => {
        setLoading(false);
        if (res && res.success) {
          setUserId(res.userId);
          setStep(2);
        } else {
          setError(res?.message || 'Failed to request reset OTP.');
        }
      }
    }));
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError(null);
    setStep(3);
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    dispatch(resetPasswordRequest({
      data: { userId, otp, newPassword },
      callback: (success) => {
        setLoading(false);
        if (success) {
          setStep(4);
        } else {
          setError('Failed to update credentials. Please retry.');
        }
      }
    }));
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#080b12] text-slate-800 dark:text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-brandPrimary/5 blur-[80px] pointer-events-none"></div>

      <div className="max-w-md w-full mx-auto z-10 space-y-8">
        <div className="flex justify-center items-center gap-2">
          <HakaLogo variant="horizontal" size={110} />
        </div>

        <div className="glassmorphism p-8 rounded-[24px] border border-slate-200/50 dark:border-white/10 shadow-premium relative bg-white/80 dark:bg-slate-900/40">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-450 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="text-left">
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Forgot Password?</h3>
                <p className="text-xs text-slate-450 dark:text-white/40 mt-1 font-medium leading-relaxed">Enter your registered email address to receive a recovery OTP.</p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-white/30">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary/50 text-xs transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98] flex justify-center items-center gap-1.5"
              >
                <span>{loading ? 'Sending OTP...' : 'Send Recovery OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-left">
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Verify Reset OTP</h3>
                <p className="text-xs text-slate-450 dark:text-white/40 mt-1 font-medium leading-relaxed">Please input the OTP sent to <span className="font-semibold text-brandPrimary dark:text-brandSecondary">{email}</span>.</p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35">
                  Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-white/30">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit reset OTP"
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary/50 text-xs tracking-widest text-center font-extrabold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98]"
              >
                Verify Reset Code
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-6">
              <div className="text-left">
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Set New Password</h3>
                <p className="text-xs text-slate-450 dark:text-white/40 mt-1 font-medium leading-relaxed">Establish a secure credentials password to login.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35">
                    New Security Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-white/30">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary/50 text-xs transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-white/30">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary/50 text-xs transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98]"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="text-center space-y-5 py-4">
              <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">Credentials Reset Complete</h3>
                <p className="text-xs text-slate-450 dark:text-white/40 mt-2 leading-relaxed font-semibold">Your password has been securely updated in the database. You can now login with your new credentials.</p>
              </div>
              <button
                onClick={onBackToLogin}
                className="w-full py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98]"
              >
                Sign In Now
              </button>
            </div>
          )}

          {step !== 4 && (
            <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/5 text-center">
              <button
                onClick={onBackToLogin}
                className="inline-flex items-center gap-1.5 text-xs text-slate-505 dark:text-white/50 hover:text-brandPrimary dark:hover:text-white font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login screen</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
