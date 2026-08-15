import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, googleAuthRequest, guestLoginRequest } from '../store/authSlice';
import { signInWithGoogle } from '../config/firebase';
import {
  ArrowRight, ArrowLeft, Shield, CheckCircle2, Sparkles, AlertCircle, Camera, Check,
  Upload, HelpCircle, Phone, Lock, User as UserIcon, Mail, Calendar, Chrome, Briefcase, Tag, Search, X, ChevronDown, RefreshCw, UserCheck, Eye, EyeOff,
  ZoomIn, ZoomOut, RotateCw, Trash2, Maximize2, FileText, Loader2
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { HakaLogo } from '../components/HakaLogo';
import { CustomDobPicker } from '../components/CustomDobPicker';

const DEFAULT_CATEGORY_OPTIONS = [
  'Technology & Coding',
  'Gaming & Esports',
  'Arts & Creative',
  'Music & Audio',
  'Business & Startup',
  'Education & Academics',
  'Sports & Fitness',
  'Entertainment & Media',
  'Photography & Video',
  'Fashion & Beauty',
  'Cooking & Culinary',
  'Artificial Intelligence',
  'Science & Innovation',
  'Writing & Literature'
];

const COUNTRY_CODE_OPTIONS = [
  { code: '+91', flag: '🇮🇳', label: 'India (+91)' },
  { code: '+1', flag: '🇺🇸', label: 'USA / Canada (+1)' },
  { code: '+44', flag: '🇬🇧', label: 'UK (+44)' },
  { code: '+971', flag: '🇦🇪', label: 'UAE (+971)' },
  { code: '+61', flag: '🇦🇺', label: 'Australia (+61)' },
  { code: '+65', flag: '🇸🇬', label: 'Singapore (+65)' }
];

const GENDER_OPTIONS = [
  'Male',
  'Female',
  'Other',
  'Prefer not to say'
];

const EMPLOYMENT_OPTIONS = [
  { value: 'Student', label: 'Student' },
  { value: 'Employed / Salaried', label: 'Employed / Salaried' },
  { value: 'Self Employed', label: 'Self Employed' },
  { value: 'Unemployed', label: 'Unemployed' }
];

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Haka1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Haka2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Haka3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Haka4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Haka5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Haka6'
];

const resolveAvatarSrc = (rawUrl) => {
  if (!rawUrl) return '';
  if (typeof rawUrl === 'string') {
    if (rawUrl.startsWith('blob:') || rawUrl.startsWith('data:') || rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }
    if (rawUrl.includes('/uploads/') || rawUrl.includes('/public/uploads/')) {
      const pathPart = rawUrl.includes('/uploads/') ? rawUrl.split('/uploads/')[1] : rawUrl.split('/public/uploads/')[1];
      return `/uploads/${pathPart}`;
    }
  }
  return rawUrl;
};

export const Register = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 2-Step Flow: Step 1 = Phone Verification, Step 2 = Profile Creation / Google Sign-Up
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');

  // Step 1: Mobile verification state
  const [countryCode, setCountryCode] = useState('+91');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef(null);

  const [phone, setPhone] = useState('');
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileTimer, setMobileTimer] = useState(60);
  const [canResendMobile, setCanResendMobile] = useState(false);
  const [mockMobileOtpHint, setMockMobileOtpHint] = useState('');
  const mobileOtpInputRef = useRef(null);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Step 2: Profile creation state
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
    avatar: PRESET_AVATARS[0],
    gender: 'Male',
    referralCode: '',
    employmentStatus: 'Student',
    categories: []
  });

  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const genderDropdownRef = useRef(null);

  const [showEmploymentDropdown, setShowEmploymentDropdown] = useState(false);
  const employmentDropdownRef = useRef(null);

  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Image Upload Preview & Lightbox Modal State
  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [customImageDetails, setCustomImageDetails] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewRotation, setPreviewRotation] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);

  // Category Search Select State
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef(null);
  const [categoryOptionsList, setCategoryOptionsList] = useState(DEFAULT_CATEGORY_OPTIONS);

  // Fetch Categories dynamically from /api/categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories');
        if (res.data.success && Array.isArray(res.data.categories)) {
          const fetchedNames = res.data.categories
            .map((c) => (typeof c === 'string' ? c : (c.title || c.name)))
            .filter(Boolean);
          const combined = Array.from(new Set([...fetchedNames, ...DEFAULT_CATEGORY_OPTIONS]));
          setCategoryOptionsList(combined);
        }
      } catch (err) {
        console.warn('Could not fetch categories from /api/categories, using defaults.', err);
      }
    };
    fetchCategories();
  }, []);

  // Close all custom dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(event.target)) {
        setShowGenderDropdown(false);
      }
      if (employmentDropdownRef.current && !employmentDropdownRef.current.contains(event.target)) {
        setShowEmploymentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mobile OTP countdown timer logic
  useEffect(() => {
    let interval = null;
    if (step === 1 && mobileOtpSent && mobileTimer > 0) {
      interval = setInterval(() => setMobileTimer((prev) => prev - 1), 1000);
    } else if (mobileTimer === 0) {
      setCanResendMobile(true);
    }
    return () => clearInterval(interval);
  }, [step, mobileOtpSent, mobileTimer]);

  // Process avatar file selection (LOCAL PREVIEW ONLY - NO UPLOAD UNTIL FORM SUBMIT)
  const processAvatarFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPEG, WEBP, GIF, SVG, etc.).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB.');
      return;
    }

    setError('');

    // Save File object to state for deferred upload on form submission
    setSelectedImageFile(file);

    // Create instant local preview URL (blob URL)
    const localPreviewUrl = URL.createObjectURL(file);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    
    setCustomImageDetails({
      name: file.name,
      size: `${sizeMB} MB`,
      type: file.type,
      url: localPreviewUrl
    });

    // Instantly set profile avatar to local preview URL for local preview display
    setProfileData((prev) => ({ ...prev, avatar: localPreviewUrl }));
    setPreviewRotation(0);
    setPreviewZoom(1);
  };

  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) processAvatarFile(file);
  };

  const handleAvatarDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleAvatarDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleAvatarDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAvatarFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveCustomAvatar = () => {
    setProfileData((prev) => ({ ...prev, avatar: PRESET_AVATARS[0] }));
    setSelectedImageFile(null);
    setCustomImageDetails(null);
    setShowImagePreviewModal(false);
  };

  // Google Sign-Up Handler
  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setError('');
      const googleData = await signInWithGoogle();
      if (profileData.referralCode) googleData.referralCode = profileData.referralCode;

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

  // STEP 1: START PHONE VERIFICATION (SEND OTP)
  const handleStartMobile = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/register/mobile', {
        countryCode,
        phone,
        sessionId: sessionId || undefined
      });
      if (res.data.success) {
        setSessionId(res.data.sessionId);
        if (res.data.mockOtp) setMockMobileOtpHint(res.data.mockOtp);
        setMobileOtpSent(true);
        setMobileTimer(60);
        setCanResendMobile(false);
        setTimeout(() => mobileOtpInputRef.current?.focus(), 200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send Mobile OTP.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: VERIFY MOBILE OTP
  const handleVerifyMobileOtp = async (e) => {
    e.preventDefault();
    if (!mobileOtp || mobileOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/register/verify-mobile-otp', {
        sessionId,
        otp: mobileOtp
      });
      if (res.data.success) {
        if (res.data.isRegistered && res.data.user) {
          dispatch(loginSuccess(res.data.user));
          navigate('/');
          return;
        }
        setPhoneVerified(true);
        setStep(2); // Proceed to Step 2: Complete Profile
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Mobile OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Category selection
  const toggleCategory = (cat) => {
    setProfileData((prev) => {
      const exists = prev.categories.includes(cat);
      const updated = exists
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: updated };
    });
  };

  // STEP 2: SAVE PROFILE AND COMPLETE REGISTRATION
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();

    if (!profileData.name.trim()) return setError('Full Name is required.');
    if (!profileData.username.trim()) return setError('Username is required.');
    if (!profileData.email.trim()) return setError('Email address is required.');
    if (!profileData.password) return setError('Password is required.');
    if (profileData.password.length < 6) return setError('Password must be at least 6 characters.');
    if (profileData.password !== profileData.confirmPassword) return setError('Passwords do not match.');
    if (!profileData.dob) return setError('Date of birth is required.');
    if (!termsAccepted) return setError('You must accept the Terms of Service & Privacy Policy.');

    setLoading(true);
    setError('');

    let finalAvatarUrl = profileData.avatar;

    try {
      // 1. Upload custom image ONLY now when the user submits the registration form
      if (selectedImageFile) {
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('file', selectedImageFile);

        try {
          const uploadRes = await axios.post('/api/auth/register/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (uploadRes.data && uploadRes.data.success) {
            finalAvatarUrl = uploadRes.data.fileUrl || uploadRes.data.url || uploadRes.data.relativePath || finalAvatarUrl;
          }
        } catch (uploadErr) {
          console.warn('Backend image upload endpoint notice on submit:', uploadErr);
        } finally {
          setUploadingAvatar(false);
        }
      }

      // 2. Submit complete profile registration payload
      const res = await axios.post('/api/auth/register/complete-profile', {
        sessionId,
        profileData: {
          name: profileData.name.trim(),
          username: profileData.username.trim().toLowerCase(),
          email: profileData.email.trim().toLowerCase(),
          password: profileData.password,
          dob: profileData.dob,
          avatar: finalAvatarUrl,
          gender: profileData.gender,
          referralCode: profileData.referralCode.trim(),
          employmentStatus: profileData.employmentStatus,
          categories: profileData.categories,
          favoriteCategories: profileData.categories
        }
      });

      if (res.data.success && res.data.accessToken) {
        dispatch(loginSuccess({
          user: res.data.user,
          token: res.data.accessToken,
          accessToken: res.data.accessToken
        }));
        navigate('/kyc');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
      setUploadingAvatar(false);
    }
  };

  const selectedCountryObj = COUNTRY_CODE_OPTIONS.find((c) => c.code === countryCode) || COUNTRY_CODE_OPTIONS[0];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white p-4 sm:p-6 relative overflow-hidden">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brandPrimary/25 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brandSecondary/25 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl relative z-10 my-6"
      >
        {/* Header Branding */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex justify-center mb-2">
            <HakaLogo className="w-14 h-14 drop-shadow-xl" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Contestant Registration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-md mx-auto">
            {step === 1 ? 'Verify your mobile number via SMS OTP to start.' : 'Complete your contestant profile credentials.'}
          </p>

          {/* Glowing Step Indicator */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-300 ${
              step === 1
                ? 'bg-gradient-to-r from-brandPrimary to-brandSecondary text-white shadow-lg shadow-brandPrimary/30 ring-2 ring-brandPrimary/40'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            }`}>
              {phoneVerified ? <Check className="w-4 h-4 text-emerald-400" /> : <Phone className="w-4 h-4" />}
              <span>1. Phone Verification</span>
            </div>

            <div className="w-10 h-0.5 bg-slate-800 rounded-full" />

            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-300 ${
              step === 2
                ? 'bg-gradient-to-r from-brandPrimary to-brandSecondary text-white shadow-lg shadow-brandPrimary/30 ring-2 ring-brandPrimary/40'
                : 'bg-slate-800/80 text-slate-400 border border-white/5'
            }`}>
              <UserIcon className="w-4 h-4" />
              <span>2. Profile Details</span>
            </div>
          </div>
        </div>

        {/* Animated Error Banner */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-400 text-xs sm:text-sm shadow-md"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <span className="font-semibold leading-relaxed">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= STEP 1: PHONE VERIFICATION ================= */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {!mobileOtpSent ? (
              <form onSubmit={handleStartMobile} className="space-y-6">
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2.5">
                    Mobile Phone Number
                  </label>
                  <div className="flex gap-2 sm:gap-3">
                    {/* CUSTOM COUNTRY CODE DROPDOWN */}
                    <div className="relative" ref={countryDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="bg-slate-800/90 border border-white/10 hover:border-brandPrimary/50 rounded-2xl px-3.5 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-inner flex items-center gap-2 cursor-pointer transition"
                      >
                        <span>{selectedCountryObj.flag}</span>
                        <span>{selectedCountryObj.code}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>

                      <AnimatePresence>
                        {showCountryDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-30 left-0 mt-2 w-48 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl p-1.5 space-y-1"
                          >
                            {COUNTRY_CODE_OPTIONS.map((c) => (
                              <button
                                type="button"
                                key={c.code}
                                onClick={() => {
                                  setCountryCode(c.code);
                                  setShowCountryDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold flex items-center justify-between transition ${
                                  countryCode === c.code
                                    ? 'bg-brandPrimary/20 text-brandPrimary border border-brandPrimary/30'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span>{c.flag}</span>
                                  <span>{c.label}</span>
                                </span>
                                {countryCode === c.code && <Check className="w-3.5 h-3.5 text-brandPrimary" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative flex-1">
                      <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-800/90 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base font-bold text-white focus:outline-none focus:border-brandPrimary focus:ring-2 focus:ring-brandPrimary/20 placeholder-slate-500 shadow-inner"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-brandPrimary via-indigo-600 to-brandSecondary text-white font-extrabold rounded-2xl shadow-xl shadow-brandPrimary/25 hover:brightness-110 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 text-sm tracking-wide"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Mobile Verification OTP</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyMobileOtp} className="space-y-6">
                <div className="p-4 bg-slate-800/60 border border-white/10 rounded-2xl text-center space-y-1">
                  <p className="text-xs text-slate-400 font-medium">
                    Verification SMS OTP code sent to <span className="font-extrabold text-white">{countryCode} {phone}</span>
                  </p>
                  <div className="mt-2 text-xs font-mono bg-emerald-500/10 text-emerald-400 py-2 px-4 rounded-xl border border-emerald-500/20 inline-block font-bold">
                    SMS Test OTP Code: <span className="text-white underline font-extrabold">{mockMobileOtpHint || '123456'}</span> (or use test code <span className="text-white underline font-extrabold">123456</span>)
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2.5 text-center">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    ref={mobileOtpInputRef}
                    type="text"
                    placeholder="123456"
                    value={mobileOtp}
                    onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-800/90 border border-white/10 rounded-2xl px-4 py-4 text-center font-mono text-2xl sm:text-3xl tracking-[0.5em] text-white focus:outline-none focus:border-brandPrimary focus:ring-2 focus:ring-brandPrimary/20 placeholder-slate-600 shadow-inner"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <button
                    type="button"
                    onClick={() => { setMobileOtpSent(false); setMobileOtp(''); }}
                    className="text-slate-400 hover:text-white font-semibold transition"
                  >
                    ← Change Mobile Number
                  </button>
                  <button
                    type="button"
                    disabled={!canResendMobile || loading}
                    onClick={handleStartMobile}
                    className="text-brandPrimary font-extrabold hover:underline disabled:opacity-40"
                  >
                    {canResendMobile ? 'Resend OTP Code' : `Resend in ${mobileTimer}s`}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-brandPrimary via-indigo-600 to-brandSecondary text-white font-extrabold rounded-2xl shadow-xl shadow-brandPrimary/25 hover:brightness-110 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 text-sm tracking-wide"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Verifying OTP Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify OTP & Continue</span>
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick Google Sign-Up */}
            <div className="pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-slate-400 font-semibold mb-3">Or instantly register with Google ID</p>
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-slate-800/90 hover:bg-slate-700/80 border border-white/10 text-white font-bold rounded-2xl transition duration-200 flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99]"
              >
                <Chrome className="w-5 h-5 text-rose-400" />
                <span className="text-sm">Continue with Google Account</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 2: PROFILE DETAILS SETUP ================= */}
        {step === 2 && (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleCompleteRegistration}
            className="space-y-6"
          >
            {/* Mobile Verified Status Banner */}
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Verified Phone Number:</span>
              <span className="font-extrabold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1 rounded-xl">
                <Check className="w-4 h-4 text-emerald-400" /> {countryCode} {phone}
              </span>
            </div>

            {/* Avatar Selection & Custom Upload with Instant Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Choose Avatar or Upload Profile Picture
                </label>
                {!PRESET_AVATARS.includes(profileData.avatar) && profileData.avatar && (
                  <span className="text-[11px] font-extrabold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5" /> Custom Image Active
                  </span>
                )}
              </div>

              {/* Preset Avatars & Custom Photo Grid */}
              <div
                onDragOver={handleAvatarDragOver}
                onDragLeave={handleAvatarDragLeave}
                onDrop={handleAvatarDrop}
                className={`p-4 rounded-2xl border-2 border-dashed transition-all duration-200 ${
                  isDragActive
                    ? 'border-brandPrimary bg-brandPrimary/15 shadow-xl shadow-brandPrimary/20'
                    : 'border-white/10 bg-slate-800/40 hover:border-white/20'
                }`}
              >
                <div className="flex flex-wrap items-center gap-3.5 mb-3">
                  {PRESET_AVATARS.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt={`Avatar ${idx}`}
                      onClick={() => {
                        setProfileData((prev) => ({ ...prev, avatar: av }));
                        setSelectedImageFile(null);
                        setCustomImageDetails(null);
                      }}
                      className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl cursor-pointer border-2 transition-all duration-200 hover:scale-105 shadow-md ${
                        profileData.avatar === av ? 'border-brandPrimary ring-4 ring-brandPrimary/30 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      title={`Preset Avatar ${idx + 1}`}
                    />
                  ))}

                  {/* Display uploaded custom avatar thumbnail preview */}
                  {!PRESET_AVATARS.includes(profileData.avatar) && profileData.avatar && (
                    <div className="relative group cursor-pointer" onClick={() => setShowImagePreviewModal(true)}>
                      <img
                        src={resolveAvatarSrc(profileData.avatar)}
                        alt="Uploaded Avatar Preview"
                        onError={(e) => {
                          console.warn('Avatar image preview error:', profileData.avatar);
                        }}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-brandSecondary ring-4 ring-brandSecondary/30 shadow-lg group-hover:scale-105 transition duration-200"
                      />
                      <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-1.5 backdrop-blur-[2px]">
                        <Eye className="w-5 h-5 text-white drop-shadow-md" />
                      </div>
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-brandPrimary to-brandSecondary text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase shadow-md">
                        Preview
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload & Preview Action Controls */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/10">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="py-2.5 px-4 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 border border-white/15 rounded-xl text-xs font-extrabold text-white flex items-center gap-2 transition active:scale-[0.98] shadow-md disabled:opacity-50"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-4 h-4 text-brandPrimary animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-brandPrimary" />
                    )}
                    <span>{uploadingAvatar ? 'Uploading Image...' : 'Upload Custom Photo'}</span>
                  </button>

                  {!PRESET_AVATARS.includes(profileData.avatar) && profileData.avatar && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowImagePreviewModal(true)}
                        className="py-2.5 px-4 bg-brandPrimary/20 hover:bg-brandPrimary/30 border border-brandPrimary/40 text-brandPrimary hover:text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition active:scale-[0.98] shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Preview Full Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveCustomAvatar}
                        className="py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition active:scale-[0.98]"
                        title="Remove custom photo and reset to preset"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </>
                  )}

                  <span className="text-[11px] text-slate-400 ml-auto hidden md:inline-block font-medium">
                    Drag & drop image here or browse file (PNG, JPG, WEBP, max 10MB)
                  </span>
                </div>
              </div>
            </div>

            {/* Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-[16px] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Rahul Sharma"
                    value={profileData.name}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-[48px] w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-brandPrimary placeholder-slate-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Username *
                </label>
                <div className="relative">
                  <span className="w-4 h-4 text-slate-400 absolute left-3.5 top-[14px] font-mono text-sm font-bold flex items-center justify-center pointer-events-none">@</span>
                  <input
                    type="text"
                    placeholder="rahul_sharma"
                    value={profileData.username}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') }))}
                    className="h-[48px] w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-brandPrimary placeholder-slate-500 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email & Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-[16px] pointer-events-none" />
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={profileData.email}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    className="h-[48px] w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-brandPrimary placeholder-slate-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <CustomDobPicker
                  value={profileData.dob}
                  onChange={(val) => setProfileData((prev) => ({ ...prev, dob: val }))}
                  required={true}
                />
              </div>
            </div>

            {/* Gender & Employment Status - CUSTOM DROPDOWNS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CUSTOM GENDER DROPDOWN */}
              <div className="relative" ref={genderDropdownRef}>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <button
                  type="button"
                  onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                  className="h-[48px] w-full bg-slate-800/80 border border-white/10 hover:border-brandPrimary/50 rounded-xl px-3.5 text-xs sm:text-sm text-white font-medium flex items-center justify-between cursor-pointer transition"
                >
                  <span className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{profileData.gender}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                <AnimatePresence>
                  {showGenderDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-30 w-full mt-2 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl p-1.5 space-y-1"
                    >
                      {GENDER_OPTIONS.map((g) => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => {
                            setProfileData((prev) => ({ ...prev, gender: g }));
                            setShowGenderDropdown(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition ${
                            profileData.gender === g
                              ? 'bg-brandPrimary/20 text-brandPrimary border border-brandPrimary/30'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span>{g}</span>
                          {profileData.gender === g && <Check className="w-4 h-4 text-brandPrimary" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CUSTOM EMPLOYMENT DROPDOWN */}
              <div className="relative" ref={employmentDropdownRef}>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Employment Status
                </label>
                <button
                  type="button"
                  onClick={() => setShowEmploymentDropdown(!showEmploymentDropdown)}
                  className="h-[48px] w-full bg-slate-800/80 border border-white/10 hover:border-brandPrimary/50 rounded-xl px-3.5 text-xs sm:text-sm text-white font-medium flex items-center justify-between cursor-pointer transition"
                >
                  <span className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{profileData.employmentStatus}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                <AnimatePresence>
                  {showEmploymentDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-30 w-full mt-2 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl p-1.5 space-y-1"
                    >
                      {EMPLOYMENT_OPTIONS.map((opt) => (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => {
                            setProfileData((prev) => ({ ...prev, employmentStatus: opt.value }));
                            setShowEmploymentDropdown(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition ${
                            profileData.employmentStatus === opt.value
                              ? 'bg-brandPrimary/20 text-brandPrimary border border-brandPrimary/30'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {profileData.employmentStatus === opt.value && <Check className="w-4 h-4 text-brandPrimary" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* CUSTOM SEARCH SELECT FAVORITE CATEGORIES */}
            <div className="relative" ref={categoryDropdownRef}>
              <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Favorite Contest Categories
              </label>

              {/* Selected Categories Pills */}
              {profileData.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {profileData.categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-extrabold bg-brandPrimary text-white shadow-md shadow-brandPrimary/20 animate-fade-in"
                    >
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className="hover:bg-white/20 rounded-full p-0.5 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search Box Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-[16px] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search or type a category and press Enter..."
                  value={categorySearch}
                  onFocus={() => setShowCategoryDropdown(true)}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setShowCategoryDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && categorySearch.trim()) {
                      e.preventDefault();
                      const customVal = categorySearch.trim();
                      if (!profileData.categories.includes(customVal)) {
                        toggleCategory(customVal);
                      }
                      if (!categoryOptionsList.includes(customVal)) {
                        setCategoryOptionsList((prev) => [...prev, customVal]);
                      }
                      setCategorySearch('');
                    }
                  }}
                  className="h-[48px] w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-10 text-xs sm:text-sm text-white focus:outline-none focus:border-brandPrimary placeholder-slate-500 font-medium"
                />
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-[16px] pointer-events-none" />
              </div>

              {/* Search Dropdown Results */}
              <AnimatePresence>
                {showCategoryDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-30 w-full mt-2 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2"
                  >
                    {categorySearch.trim() && !categoryOptionsList.some((c) => c.toLowerCase() === categorySearch.trim().toLowerCase()) && (
                      <button
                        type="button"
                        onClick={() => {
                          const customVal = categorySearch.trim();
                          if (!profileData.categories.includes(customVal)) {
                            toggleCategory(customVal);
                          }
                          if (!categoryOptionsList.includes(customVal)) {
                            setCategoryOptionsList((prev) => [...prev, customVal]);
                          }
                          setCategorySearch('');
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-brandPrimary bg-brandPrimary/10 border border-brandPrimary/30 hover:bg-brandPrimary/20 mb-1 flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-brandPrimary" />
                        <span>Add "{categorySearch.trim()}" as custom category</span>
                      </button>
                    )}

                    {categoryOptionsList.filter((cat) =>
                      cat.toLowerCase().includes(categorySearch.toLowerCase())
                    ).length > 0 ? (
                      categoryOptionsList.filter((cat) =>
                        cat.toLowerCase().includes(categorySearch.toLowerCase())
                      ).map((cat) => {
                        const isSelected = profileData.categories.includes(cat);
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => {
                              toggleCategory(cat);
                              setCategorySearch('');
                            }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                              isSelected
                                ? 'bg-brandPrimary/20 text-brandPrimary border border-brandPrimary/30'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <span>{cat}</span>
                            {isSelected && <Check className="w-4 h-4 text-brandPrimary" />}
                          </button>
                        );
                      })
                    ) : (
                      !categorySearch.trim() && (
                        <div className="p-3 text-center text-xs text-slate-400">
                          No matching categories found
                        </div>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Referral Code (Optional) */}
            <div>
              <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-[16px] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter referral code if any"
                  value={profileData.referralCode}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, referralCode: e.target.value.toUpperCase() }))}
                  className="h-[48px] w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-brandPrimary placeholder-slate-500 font-mono tracking-wider font-medium"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-[16px] pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={profileData.password}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, password: e.target.value }))}
                    className={`h-[48px] w-full bg-slate-800/80 border rounded-xl pl-10 pr-10 text-xs sm:text-sm text-white focus:outline-none transition-all placeholder-slate-500 font-medium ${
                      profileData.confirmPassword && profileData.password !== profileData.confirmPassword
                        ? 'border-rose-500/80 focus:border-rose-500'
                        : 'border-white/10 focus:border-brandPrimary'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-[16px] text-slate-400 hover:text-white transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-[16px] pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`h-[48px] w-full bg-slate-800/80 border rounded-xl pl-10 pr-10 text-xs sm:text-sm text-white focus:outline-none transition-all placeholder-slate-500 font-medium ${
                      profileData.confirmPassword && profileData.password !== profileData.confirmPassword
                        ? 'border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-white/10 focus:border-brandPrimary'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-[16px] text-slate-400 hover:text-white transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {profileData.confirmPassword && profileData.password !== profileData.confirmPassword && (
                  <span className="text-[11px] text-rose-400 font-extrabold mt-1.5 flex items-center gap-1.5 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" /> Passwords do not match
                  </span>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2.5 text-xs text-slate-400 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded bg-slate-800 border-white/10 text-brandPrimary focus:ring-0 cursor-pointer"
              />
              <label htmlFor="terms" className="cursor-pointer font-medium leading-relaxed">
                I agree to the <span className="text-slate-200 font-bold underline">Terms of Service</span> & <span className="text-slate-200 font-bold underline">Privacy Policy</span> of Haka Platform.
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold rounded-2xl text-xs sm:text-sm transition flex items-center gap-2 active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-brandPrimary via-indigo-600 to-brandSecondary text-white font-extrabold rounded-2xl shadow-xl shadow-brandPrimary/25 hover:brightness-110 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 text-xs sm:text-sm tracking-wide"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Creating Contestant Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-slate-400 font-medium">
          Already have a contestant account?{' '}
          <button
            onClick={() => onLoginClick ? onLoginClick() : navigate('/login')}
            className="text-brandPrimary font-extrabold hover:underline"
          >
            Log In
          </button>
        </div>
      </motion.div>

      {/* ================= FULL IMAGE PREVIEW LIGHTBOX MODAL ================= */}
      <AnimatePresence>
        {showImagePreviewModal && profileData.avatar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md"
            onClick={() => setShowImagePreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brandPrimary/20 text-brandPrimary rounded-2xl border border-brandPrimary/30">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">Profile Photo Preview</h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {customImageDetails?.name ? customImageDetails.name : 'Custom Uploaded Image'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowImagePreviewModal(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image Preview Canvas Box */}
              <div className="relative w-full h-72 sm:h-80 bg-slate-950/90 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center p-4 group">
                <img
                  src={resolveAvatarSrc(profileData.avatar)}
                  alt="Full Avatar Preview"
                  style={{
                    transform: `scale(${previewZoom}) rotate(${previewRotation}deg)`,
                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
                />

                {/* Floating Controls Toolbar */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-white/15 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-2xl">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.max(0.6, z - 0.2))}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] font-mono font-bold text-brandPrimary px-1">
                    {Math.round(previewZoom * 100)}%
                  </span>

                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.min(2.5, z + 0.2))}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <div className="w-px h-4 bg-white/20" />

                  <button
                    type="button"
                    onClick={() => setPreviewRotation((r) => (r + 90) % 360)}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition flex items-center gap-1 text-xs"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <div className="w-px h-4 bg-white/20" />

                  <button
                    type="button"
                    onClick={() => { setPreviewZoom(1); setPreviewRotation(0); }}
                    className="text-[10px] font-extrabold text-slate-400 hover:text-white px-1.5 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Image Metadata Info Pill */}
              {customImageDetails && (
                <div className="flex flex-wrap items-center justify-between text-xs bg-slate-800/50 p-3 rounded-2xl border border-white/5 gap-2">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold truncate">
                    <FileText className="w-4 h-4 text-brandPrimary shrink-0" />
                    <span className="truncate max-w-[200px]">{customImageDetails.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                    <span>Size: {customImageDetails.size}</span>
                    <span>Type: {customImageDetails.type.split('/')[1]?.toUpperCase() || 'IMAGE'}</span>
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRemoveCustomAvatar}
                  className="py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-extrabold rounded-2xl text-xs flex items-center gap-2 transition active:scale-[0.98]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Photo</span>
                </button>

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold rounded-2xl text-xs flex items-center gap-2 transition active:scale-[0.98]"
                  >
                    <Upload className="w-4 h-4 text-brandPrimary" />
                    <span>Change Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowImagePreviewModal(false)}
                    className="py-3 px-5 bg-gradient-to-r from-brandPrimary to-brandSecondary text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-brandPrimary/25 hover:brightness-110 active:scale-[0.98] transition flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm Photo</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
