import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { forgotPasswordRequest, resetPasswordRequest } from '../store/authSlice';
import { KeyRound, Mail, Lock, CheckCircle, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { HakaLogo } from '../components/HakaLogo';

export const ForgotPassword = ({ onBackToLogin }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const emailFormik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address format')
        .required('Email address is required')
    }),
    onSubmit: (values) => {
      setError(null);
      setLoading(true);
      dispatch(forgotPasswordRequest({
        email: values.email,
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
    }
  });

  // Step 2: Verify OTP
  const otpFormik = useFormik({
    initialValues: { otp: '' },
    validationSchema: Yup.object({
      otp: Yup.string()
        .matches(/^\d{6}$/, 'Verification code must be exactly 6 digits')
        .required('Verification code is required')
    }),
    onSubmit: () => {
      setError(null);
      setStep(3);
    }
  });

  // Step 3: Reset Password
  const resetFormik = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Confirm new password is required')
    }),
    onSubmit: (values) => {
      setError(null);
      setLoading(true);
      dispatch(resetPasswordRequest({
        data: { userId, otp: otpFormik.values.otp, newPassword: values.newPassword },
        callback: (success) => {
          setLoading(false);
          if (success) {
            setStep(4);
          } else {
            setError('Failed to update credentials. Please retry.');
          }
        }
      }));
    }
  });

  return (
    <div className="min-h-screen bg-[#080b12] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[80px] pointer-events-none"></div>

      <div className="max-w-md w-full mx-auto z-10 space-y-8">
        <div className="flex justify-center items-center gap-2.5">
          <HakaLogo size={40} variant="icon" className="w-10 h-10" />
          <span className="font-poppins font-extrabold text-2xl tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent uppercase font-extrabold">
            Haka
          </span>
        </div>

        <div className="glassmorphism p-8 rounded-2xl border border-white/10 shadow-2xl relative">
          {error && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold animate-fade-in">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={emailFormik.handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins mb-1">Forgot Password?</h3>
                <p className="text-xs text-white/50">Enter your registered email address to receive a recovery OTP.</p>
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={emailFormik.values.email}
                    onChange={emailFormik.handleChange}
                    onBlur={emailFormik.handleBlur}
                    placeholder="name@domain.com"
                    className={`block w-full pl-10 pr-4 py-3 bg-[#080b12]/50 border rounded-xl text-white placeholder-white/30 text-sm focus:outline-none transition-all ${
                      emailFormik.touched.email && emailFormik.errors.email
                        ? 'border-red-500/60 focus:ring-red-500'
                        : 'border-white/10 focus:ring-purple-500'
                    }`}
                  />
                </div>
                {emailFormik.touched.email && emailFormik.errors.email && (
                  <span className="text-[10px] text-red-400 block mt-1 animate-fade-in">{emailFormik.errors.email}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white text-sm font-semibold transition-all flex justify-center items-center gap-2"
              >
                <span>{loading ? 'Sending...' : 'Send Recovery OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={otpFormik.handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins mb-1">Verify Code</h3>
                <p className="text-xs text-white/50">Enter the recovery code sent to {emailFormik.values.email}.</p>
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60">
                  Verification OTP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="otp"
                    maxLength={6}
                    value={otpFormik.values.otp}
                    onChange={otpFormik.handleChange}
                    onBlur={otpFormik.handleBlur}
                    placeholder="6-digit code"
                    className={`block w-full pl-10 pr-4 py-3 bg-[#080b12]/50 border rounded-xl text-white text-sm tracking-widest text-center font-bold focus:outline-none transition-all ${
                      otpFormik.touched.otp && otpFormik.errors.otp
                        ? 'border-red-500/60 focus:ring-red-500'
                        : 'border-white/10 focus:ring-purple-500'
                    }`}
                  />
                </div>
                {otpFormik.touched.otp && otpFormik.errors.otp && (
                  <span className="text-[10px] text-red-400 block mt-1 animate-fade-in">{otpFormik.errors.otp}</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all flex justify-center items-center gap-2"
              >
                <span>Verify OTP Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={resetFormik.handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins mb-1">Reset Password</h3>
                <p className="text-xs text-white/50">Declare a secure new password for your platform profile.</p>
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={resetFormik.values.newPassword}
                    onChange={resetFormik.handleChange}
                    onBlur={resetFormik.handleBlur}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`block w-full pl-10 pr-10 py-3 bg-[#080b12]/50 border rounded-xl text-white text-sm focus:outline-none transition-all ${
                      resetFormik.touched.newPassword && resetFormik.errors.newPassword
                        ? 'border-red-500/60'
                        : 'border-white/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetFormik.touched.newPassword && resetFormik.errors.newPassword && (
                  <span className="text-[10px] text-red-400 block mt-1 animate-fade-in">{resetFormik.errors.newPassword}</span>
                )}
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={resetFormik.values.confirmPassword}
                    onChange={resetFormik.handleChange}
                    onBlur={resetFormik.handleBlur}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`block w-full pl-10 pr-10 py-3 bg-[#080b12]/50 border rounded-xl text-white text-sm focus:outline-none transition-all ${
                      resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword
                        ? 'border-red-500/60'
                        : 'border-white/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword && (
                  <span className="text-[10px] text-red-400 block mt-1 animate-fade-in">{resetFormik.errors.confirmPassword}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white text-sm font-semibold transition-all flex justify-center items-center gap-2"
              >
                <span>{loading ? 'Updating...' : 'Save New Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-6 space-y-6">
              <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                <CheckCircle className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h4 className="text-lg font-bold">Password Reset Successful!</h4>
                <p className="text-xs text-white/50 mt-1">Your credentials are updated. Active device logins have been revoked.</p>
              </div>
              <button
                type="button"
                onClick={onBackToLogin}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-semibold transition-colors w-full"
              >
                Go Back to Sign In
              </button>
            </div>
          )}
        </div>

        {step < 4 && (
          <div className="text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-xs text-white/40 hover:text-white/60 font-semibold flex items-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel and return to Login</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
