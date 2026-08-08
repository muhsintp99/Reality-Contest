import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, googleAuthRequest, guestLoginRequest } from '../store/authSlice';
import { signInWithGoogle } from '../config/firebase';
import {
  ArrowRight, ArrowLeft, Shield, CheckCircle2, Sparkles, AlertCircle, Camera, Check,
  Upload, HelpCircle, Phone, Lock, User as UserIcon, Mail, Calendar, MapPin, Languages, CheckSquare, Chrome
} from 'lucide-react';
import axios from 'axios';
import { HakaLogo } from '../components/HakaLogo';

export const Register = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [regToken, setRegToken] = useState('');

  // Step 1: Email verification state
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailTimer, setEmailTimer] = useState(60);
  const [canResendEmail, setCanResendEmail] = useState(false);
  const [mockEmailOtpHint, setMockEmailOtpHint] = useState('');
  const emailOtpInputRef = useRef(null);

  // Step 2: Mobile verification state
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileTimer, setMobileTimer] = useState(60);
  const [canResendMobile, setCanResendMobile] = useState(false);
  const [mockMobileOtpHint, setMockMobileOtpHint] = useState('');
  const mobileOtpInputRef = useRef(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 3: Profile creation state
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    dob: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Haka-Contestant',
    gender: 'Male',
    state: '',
    district: '',
    city: '',
    preferredLanguage: 'English'
  });
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  // Email Timer logic
  useEffect(() => {
    let interval = null;
    if (step === 1 && emailOtpSent && emailTimer > 0) {
      interval = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
    } else if (emailTimer === 0) {
      setCanResendEmail(true);
    }
    return () => clearInterval(interval);
  }, [step, emailOtpSent, emailTimer]);

  // Mobile Timer logic
  useEffect(() => {
    let interval = null;
    if (step === 2 && mobileOtpSent && mobileTimer > 0) {
      interval = setInterval(() => setMobileTimer((prev) => prev - 1), 1000);
    } else if (mobileTimer === 0) {
      setCanResendMobile(true);
    }
    return () => clearInterval(interval);
  }, [step, mobileOtpSent, mobileTimer]);

  // Calculate age from DOB
  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const handleFileUpload = async (e, typeSetter, loadingSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;

    loadingSetter(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/auth/register/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        typeSetter(res.data.fileUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed.');
    } finally {
      loadingSetter(false);
    }
  };

  const handleRollAvatar = () => {
    const seed = Math.floor(Math.random() * 10000);
    setProfileData((prev) => ({
      ...prev,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Haka-${seed}`
    }));
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setError('');
      const googleData = await signInWithGoogle();
      if (referralCode) googleData.referralCode = referralCode;

      dispatch(googleAuthRequest({
        data: googleData,
        callback: (success) => {
          setLoading(false);
          if (success) {
            navigate('/');
          }
        }
      }));
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Google registration failed.');
    }
  };

  const handleGuestSignUp = () => {
    setLoading(true);
    setError('');
    dispatch(guestLoginRequest({
      callback: (success) => {
        setLoading(false);
        if (success) {
          navigate('/');
        }
      }
    }));
  };

  // STEP 1: START EMAIL VERIFICATION
  const handleStartEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/register/email', {
        email,
        referralCode
      });
      if (res.data.success) {
        setSessionId(res.data.sessionId);
        if (res.data.mockOtp) setMockEmailOtpHint(res.data.mockOtp);
        setEmailOtpSent(true);
        setEmailTimer(60);
        setCanResendEmail(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: VERIFY EMAIL OTP
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (!emailOtp || emailOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/register/email/otp', {
        sessionId,
        otp: emailOtp
      });
      if (res.data.success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired email OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (!canResendEmail) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/register/email/resend-otp', { sessionId });
      if (res.data.success) {
        if (res.data.mockOtp) setMockEmailOtpHint(res.data.mockOtp);
        setEmailTimer(60);
        setCanResendEmail(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend email OTP.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: START MOBILE VERIFICATION
  const handleStartMobile = async (e) => {
    e.preventDefault();
    if (!phone) {
      setError('Mobile number is required.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the Terms & Conditions to proceed.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/register/mobile', {
        sessionId,
        countryCode,
        phone
      });
      if (res.data.success) {
        if (res.data.mockOtp) setMockMobileOtpHint(res.data.mockOtp);
        setMobileOtpSent(true);
        setMobileTimer(60);
        setCanResendMobile(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send mobile verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY MOBILE OTP
  const handleVerifyMobileOtp = async (e) => {
    e.preventDefault();
    if (!mobileOtp || mobileOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/register/otp', {
        sessionId,
        otp: mobileOtp
      });
      if (res.data.success) {
        setRegToken(res.data.registrationToken);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired mobile OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendMobileOtp = async () => {
    if (!canResendMobile) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/register/resend-otp', { sessionId });
      if (res.data.success) {
        if (res.data.mockOtp) setMockMobileOtpHint(res.data.mockOtp);
        setMobileTimer(60);
        setCanResendMobile(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend mobile OTP.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: SUBMIT PROFILE & COMPLETE REGISTRATION
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name || !profileData.username) {
      setError('Full Name and Username are required.');
      return;
    }
    if (!profileData.password || profileData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (profileData.password !== profileData.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }
    if (!profileData.dob) {
      setError('Date of Birth is required.');
      return;
    }

    const calculatedAge = calculateAge(profileData.dob);
    if (calculatedAge !== null && calculatedAge < 13) {
      setError('Minimum age requirement is 13 years old.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/register/profile', {
        sessionId,
        ...profileData
      }, {
        headers: { Authorization: `Bearer ${regToken}` }
      });
      if (res.data.success) {
        setRegisteredUser(res.data.user);
        if (res.data.accessToken) {
          localStorage.setItem('accessToken', res.data.accessToken);
        }
        dispatch(loginSuccess(res.data.user));
        setStep(4);
      }
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMsgs = err.response.data.errors.map(e => `${e.message}`).join(', ');
        setError(`Validation Failed: ${errorMsgs}`);
      } else {
        setError(err.response?.data?.message || 'Registration completion failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculatedAgeDisplay = calculateAge(profileData.dob);

  return (
    <div className="min-h-screen bg-[#EDF6E5] dark:bg-[#080b12] text-slate-800 dark:text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-15%] w-[400px] h-[400px] rounded-full bg-brandPrimary/5 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[450px] h-[450px] rounded-full bg-brandSecondary/5 blur-[90px] pointer-events-none"></div>

      <div className="max-w-2xl w-full mx-auto z-10">
        <div className="flex justify-center items-center gap-2 mb-8">
          <HakaLogo variant="horizontal" size={110} />
        </div>

        {step < 4 && (
          <div className="mb-10 px-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white/50 mb-3 font-semibold uppercase tracking-wider">
              <span>Step {step} of 3</span>
              <span>
                {step === 1 && '1. Email Verification'}
                {step === 2 && '2. Contact Verification'}
                {step === 3 && '3. Profile & Account Setup'}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200/20 dark:border-white/5">
              <div
                className="h-full bg-gradient-to-r from-brandPrimary to-brandSecondary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="glassmorphism p-8 rounded-[24px] border border-slate-200/50 dark:border-white/10 shadow-premium relative overflow-hidden transition-all duration-300 bg-white/80 dark:bg-slate-900/40">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-450 rounded-xl text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: EMAIL VERIFICATION */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins flex items-center gap-2">
                  <Mail className="w-5 h-5 text-brandPrimary" /> Email Verification
                </h3>
                <p className="text-sm text-slate-500 dark:text-white/60 mt-1">Enter your email address to receive your 6-digit registration code.</p>
              </div>

              {!emailOtpSent ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleGoogleSignUp}
                      disabled={loading}
                      className="w-full py-3 px-3 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
                    >
                      <Chrome className="w-4 h-4 text-red-500 shrink-0" />
                      <span>Google Sign In</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGuestSignUp}
                      disabled={loading}
                      className="w-full py-3 px-3 border border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
                    >
                      <UserIcon className="w-4 h-4 shrink-0" />
                      <span>Guest Sign In</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-white/30">Or via Email OTP</span>
                    <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
                  </div>

                  <form onSubmit={handleStartEmail} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contestant@example.com"
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Referral Code (Optional)</label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="Enter referral code for bonus credits"
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                    <a href="#" className="text-xs font-semibold text-slate-450 dark:text-white/40 hover:text-brandPrimary flex items-center gap-1">
                      <HelpCircle className="w-4 h-4" /> Need Help?
                    </a>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-brandPrimary hover:bg-brandPrimary/90 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                    >
                      <span>{loading ? 'Sending Code...' : 'Send Verification OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
              ) : (
                <form onSubmit={handleVerifyEmailOtp} className="space-y-6">
                  {mockEmailOtpHint && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-450 rounded-xl text-xs font-semibold">
                      Email OTP Code: <span className="font-mono font-bold tracking-widest text-sm underline">{mockEmailOtpHint}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 dark:text-white/50 mb-1.5">Enter Email 6-Digit OTP Code</label>
                      <input
                        type="text"
                        ref={emailOtpInputRef}
                        maxLength={6}
                        required
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        placeholder="••••••"
                        className="block w-full max-w-[180px] mx-auto px-4 py-3 bg-black/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-lg font-bold text-center tracking-widest focus:outline-none focus:border-brandPrimary/50 font-mono"
                      />
                    </div>

                    <div className="text-center text-xs text-slate-500 dark:text-white/40">
                      {emailTimer > 0 ? (
                        <span>Resend OTP in <span className="font-bold text-slate-800 dark:text-white font-mono">{emailTimer}s</span></span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendEmailOtp}
                          className="text-brandPrimary hover:underline font-bold"
                        >
                          Resend Email OTP
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setEmailOtpSent(false)}
                      className="px-5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs border border-slate-200 dark:border-white/10 flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Change Email</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-brandPrimary hover:bg-brandPrimary/90 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                    >
                      <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* STEP 2: CONTACT NUMBER VERIFICATION */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-poppins flex items-center gap-2">
                    <Phone className="w-5 h-5 text-brandSecondary" /> Contact Verification
                  </h3>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Email Verified: {email}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-white/60 mt-1">Enter your mobile phone number for 2-Factor contact verification.</p>
              </div>

              {!mobileOtpSent ? (
                <form onSubmit={handleStartMobile} className="space-y-4">
                  <div className="flex gap-2.5">
                    <div className="w-24">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Code</label>
                      <input
                        type="text"
                        required
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        placeholder="+91"
                        className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-brandSecondary/50 text-center font-semibold"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-brandSecondary/50 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 dark:border-white/10 accent-brandSecondary w-4 h-4 cursor-pointer"
                      />
                      <span className="text-slate-500 dark:text-white/60 font-medium">
                        I agree to the{' '}
                        <a href="#" className="text-brandSecondary hover:underline font-semibold">Terms & Conditions</a>
                        {' '}and{' '}
                        <a href="#" className="text-brandSecondary hover:underline font-semibold">Privacy Policy</a>.
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs border border-slate-200 dark:border-white/10 flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Email</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-brandSecondary hover:bg-brandSecondary/90 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                    >
                      <span>{loading ? 'Sending Code...' : 'Send SMS OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyMobileOtp} className="space-y-6">
                  {mockMobileOtpHint && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-450 rounded-xl text-xs font-semibold">
                      SMS Mobile OTP Code: <span className="font-mono font-bold tracking-widest text-sm underline">{mockMobileOtpHint}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 dark:text-white/50 mb-1.5">Enter Mobile 6-Digit SMS Code</label>
                      <input
                        type="text"
                        ref={mobileOtpInputRef}
                        maxLength={6}
                        required
                        value={mobileOtp}
                        onChange={(e) => setMobileOtp(e.target.value)}
                        placeholder="••••••"
                        className="block w-full max-w-[180px] mx-auto px-4 py-3 bg-black/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-lg font-bold text-center tracking-widest focus:outline-none focus:border-brandSecondary/50 font-mono"
                      />
                    </div>

                    <div className="text-center text-xs text-slate-500 dark:text-white/40">
                      {mobileTimer > 0 ? (
                        <span>Resend SMS OTP in <span className="font-bold text-slate-800 dark:text-white font-mono">{mobileTimer}s</span></span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendMobileOtp}
                          className="text-brandSecondary hover:underline font-bold"
                        >
                          Resend SMS OTP
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setMobileOtpSent(false)}
                      className="px-5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs border border-slate-200 dark:border-white/10 flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Change Mobile</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-brandSecondary hover:bg-brandSecondary/90 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                    >
                      <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* STEP 3: PROFILE CREATION */}
          {step === 3 && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-poppins flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-brandPrimary" /> Profile & Account Setup
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                    <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">✓ Email</span>
                    <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">✓ Contact</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-white/60 mt-1">Set up your profile avatar, contestant username, password, and date of birth.</p>
              </div>

              {/* Avatar Selector */}
              <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl">
                <div className="relative">
                  <img src={profileData.avatar} className="w-20 h-20 rounded-full border-2 border-brandPrimary bg-[#080b12]/50 object-cover" alt="Profile avatar" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e, (url) => setProfileData(p => ({ ...p, avatar: url })), setUploadingAvatar)}
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-brandPrimary hover:bg-brandPrimary/90 rounded-full border border-slate-200 dark:border-white/5 text-white"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-800 dark:text-white">Profile Avatar / Image</h4>
                  <p className="text-[10px] text-slate-500 dark:text-white/40 mb-2">Upload your picture or roll avatar seed.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-bold px-3 py-1 bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary hover:bg-brandPrimary/15 rounded-lg transition-colors"
                    >
                      {uploadingAvatar ? 'Uploading...' : 'Upload Picture'}
                    </button>
                    <button
                      type="button"
                      onClick={handleRollAvatar}
                      className="text-[10px] font-bold px-3 py-1 bg-white/10 hover:bg-white/15 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white transition-colors"
                    >
                      Roll Random Avatar
                    </button>
                  </div>
                </div>
              </div>

              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Username *</label>
                  <input
                    type="text"
                    required
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    placeholder="choose_username"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50 font-semibold"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Password *</label>
                  <input
                    type="password"
                    required
                    value={profileData.password}
                    onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                    placeholder="••••••••"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50 font-semibold"
                  />
                </div>
              </div>

              {/* Date of Birth & Dynamic Age Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Date of Birth (DOB) *</label>
                  <input
                    type="date"
                    required
                    value={profileData.dob}
                    onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Calculated Age</label>
                  <div className="px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white">
                    <span>{calculatedAgeDisplay !== null ? `${calculatedAgeDisplay} Years Old` : 'Select DOB above'}</span>
                    {calculatedAgeDisplay !== null && calculatedAgeDisplay >= 13 && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded">Eligible</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs border border-slate-200 dark:border-white/10 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Mobile</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-brandPrimary to-brandSecondary text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 hover:opacity-95"
                >
                  <span>{loading ? 'Completing Registration...' : 'Complete Registration'}</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: REGISTRATION COMPLETED INSTANTLY (NO KYC REQUIRED AT REGISTRATION) */}
          {step === 4 && (
            <div className="py-8 text-center space-y-6 animate-scale-in">
              <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-poppins">Registration Completed Successfully!</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-xl border border-emerald-500/20 font-bold uppercase tracking-wider inline-block">
                  Account Active & Ready
                </p>
                <p className="text-sm text-slate-500 dark:text-white/60 max-w-md mx-auto leading-relaxed pt-2">
                  Welcome to Haka! Your contestant profile for <span className="font-bold text-slate-800 dark:text-white">{registeredUser?.name || profileData.name}</span> (@{registeredUser?.username || profileData.username}) is ready.
                </p>
                <p className="text-xs text-slate-400 dark:text-white/40 italic">
                  Note: KYC verification is not required now. You will only be asked to submit KYC documents when accessing your wallet or requesting withdrawals.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-8 py-3 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-brandPrimary/10 flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Go to Contest Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {step < 4 && (
          <div className="text-center text-sm text-slate-500 dark:text-white/50 mt-6">
            Already registered?{' '}
            <button
              type="button"
              onClick={onLoginClick}
              className="text-brandPrimary hover:underline font-semibold"
            >
              Sign in to Haka Console
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
