import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { loginRequest } from '../store/authSlice';
import { Eye, EyeOff, Lock, Mail, Phone, Sparkles } from 'lucide-react';
import { HakaLogo } from '../components/HakaLogo';

export const Login = ({ onForgotClick, onLoginSuccess }) => {
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      loginId: '',
      password: '',
      rememberMe: false
    },
    validationSchema: Yup.object({
      loginId: Yup.string()
        .required('Email address or mobile number is required')
        .test('valid-login-id', 'Must be a valid email or phone number (+91...)', (value) => {
          if (!value) return false;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const phoneRegex = /^\+?[0-9]{7,15}$/;
          return emailRegex.test(value) || phoneRegex.test(value);
        }),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
    }),
    onSubmit: (values) => {
      dispatch(loginRequest({
        loginId: values.loginId,
        password: values.password,
        isOtpLogin: false,
        otp: '',
        isAdminLogin: true,
        callback: (success) => {
          if (success) onLoginSuccess();
        }
      }));
    }
  });

  return (
    <div className="min-h-screen bg-[#EDF6E5] dark:bg-[#080b12] text-slate-800 dark:text-white flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-brandPrimary/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-brandSecondary/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[460px] z-10 space-y-6">
        <div className="glassmorphism p-8 rounded-3xl border border-[#C4E2A8]/70 dark:border-white/10 shadow-2xl relative flex flex-col items-center bg-white/80 dark:bg-slate-900/40">
          
          {/* Logo Showcase */}
          <div className="mb-6">
            <HakaLogo variant="icon" size={48} className="w-12 h-12" />
          </div>

          {/* Title & Subtitle */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-extrabold font-poppins tracking-tight text-slate-900 dark:text-white">
              Admin Dashboard Login
            </h2>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-white/60 font-semibold">
              Sign in to continue.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="w-full space-y-6">
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold text-left flex flex-col gap-2 w-full animate-fade-in">
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
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-white/50">
                Email Address or Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-white/40">
                  {formik.values.loginId.includes('@') ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                </div>
                <input
                  type="text"
                  name="loginId"
                  value={formik.values.loginId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoComplete="username"
                  placeholder="name@domain.com or +91..."
                  className={`block w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-[#0c1322] border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 text-xs focus:outline-none transition-colors ${
                    formik.touched.loginId && formik.errors.loginId
                      ? 'border-rose-500/60 focus:border-rose-500'
                      : 'border-slate-300/80 dark:border-white/10 focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary/20'
                  }`}
                />
              </div>
              {formik.touched.loginId && formik.errors.loginId && (
                <span className="text-[10px] text-rose-500 font-semibold mt-1 block animate-fade-in">{formik.errors.loginId}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-white/50">
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
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-white/40">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`block w-full pl-10 pr-12 py-3 bg-white/90 dark:bg-[#0c1322] border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 text-xs focus:outline-none transition-colors ${
                    formik.touched.password && formik.errors.password
                      ? 'border-rose-500/60 focus:border-rose-500'
                      : 'border-slate-300/80 dark:border-white/10 focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-white/45 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <span className="text-[10px] text-rose-500 font-semibold mt-1 block animate-fade-in">{formik.errors.password}</span>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center text-xs text-left">
              <label className="flex items-center gap-2 text-slate-700 dark:text-white/70 font-semibold select-none cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formik.values.rememberMe}
                  onChange={formik.handleChange}
                  className="w-4 h-4 rounded border-slate-300 dark:border-white/15 bg-white dark:bg-[#0c1322] text-brandPrimary focus:ring-brandPrimary/35 accent-brandPrimary cursor-pointer"
                />
                <span>Remember Me</span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl font-extrabold transition-all text-xs uppercase tracking-wider flex justify-center items-center gap-2 shadow-lg shadow-brandPrimary/20 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
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
