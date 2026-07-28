import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Shield, CheckCircle2, Sparkles, AlertCircle, Camera, Check,
  Upload, HelpCircle, Phone, Lock, User as UserIcon, Mail, Calendar, MapPin, Languages, CheckSquare
} from 'lucide-react';
import axios from 'axios';
import { HakaLogo } from '../components/HakaLogo';

const CATEGORIES = [
  'Technology', 'Business', 'Startup', 'Sports', 'Arts',
  'Dance', 'Music', 'Photography', 'Cooking', 'Gaming',
  'Comedy', 'Fitness', 'Fashion', 'Education', 'Science',
  'Movies', 'Travel', 'Content Creation', 'Social Impact', 'Entrepreneurship'
];

export const Register = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [regToken, setRegToken] = useState('');

  // Step 1: Mobile verification state
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  // Step 2: OTP Verification state
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [mockOtpHint, setMockOtpHint] = useState('');
  const otpInputRef = useRef(null);

  // Step 3: Profile creation state
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: 'Male',
    state: '',
    district: '',
    city: '',
    preferredLanguage: 'English',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RCP-Onboarding',
    pincode: '',
    occupation: '',
    education: '',
    employmentStatus: 'Student',
    notificationPermission: false,
    locationPermission: false
  });
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Step 4: Preferred topics state
  const [selectedTopics, setSelectedTopics] = useState([]);

  // Step 5: KYC Verification state
  const [docType, setDocType] = useState('Aadhaar');
  const [docNum, setDocNum] = useState('');
  const [docFrontUrl, setDocFrontUrl] = useState('');
  const [docBackUrl, setDocBackUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [addressProofUrl, setAddressProofUrl] = useState('');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const docFrontInputRef = useRef(null);
  const docBackInputRef = useRef(null);
  const selfieInputRef = useRef(null);
  const addressProofInputRef = useRef(null);

  const [uploadingDocFront, setUploadingDocFront] = useState(false);
  const [uploadingDocBack, setUploadingDocBack] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const [uploadingAddress, setUploadingAddress] = useState(false);

  // Timer logic for OTP
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Auto-focus OTP input
  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const handleFileUpload = async (e, typeSetter, loadingSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;

    loadingSetter(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use the new public registration upload endpoint
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
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=RCP-${seed}`
    }));
  };

  // STEP 1: MOBILE SUBMIT
  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    if (!phone) {
      setError('Mobile number is required.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the Terms and Conditions.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/register/mobile', {
        countryCode,
        phone,
        referralCode
      });
      if (res.data.success) {
        setSessionId(res.data.sessionId);
        if (res.data.mockOtp) {
          setMockOtpHint(res.data.mockOtp);
        }
        setTimer(60);
        setCanResend(false);
        setStep(2);
      }
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMsgs = err.response.data.errors.map(e => `${e.message}`).join(', ');
        setError(`Validation Failed: ${errorMsgs}`);
      } else {
        setError(err.response?.data?.message || 'Failed to start mobile verification.');
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: OTP VERIFY
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/register/otp', {
        sessionId,
        otp
      });
      if (res.data.success) {
        setRegToken(res.data.registrationToken);
        setStep(3);
      }
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMsgs = err.response.data.errors.map(e => `${e.message}`).join(', ');
        setError(`Validation Failed: ${errorMsgs}`);
      } else {
        setError(err.response?.data?.message || 'Invalid or expired OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/register/resend-otp', { sessionId });
      if (res.data.success) {
        if (res.data.mockOtp) {
          setMockOtpHint(res.data.mockOtp);
        }
        setTimer(60);
        setCanResend(false);
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: PROFILE SUBMIT
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (profileData.password !== profileData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!profileData.notificationPermission) {
      setError('You must accept notification permission.');
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
        setStep(4);
      }
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMsgs = err.response.data.errors.map(e => {
          const field = e.path && e.path.length > 0 ? e.path.join('.') : '';
          return field ? `${field}: ${e.message}` : e.message;
        }).join(' | ');
        setError(`Validation Failed: ${errorMsgs}`);
      } else {
        setError(err.response?.data?.message || 'Failed to save profile information.');
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 4: PREFERRED TOPICS SUBMIT
  const handleTopicsSubmit = async (e) => {
    e.preventDefault();
    if (selectedTopics.length === 0) {
      setError('Please select at least one topic.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/register/topics', {
        sessionId,
        favoriteCategories: selectedTopics
      }, {
        headers: { Authorization: `Bearer ${regToken}` }
      });
      if (res.data.success) {
        setStep(5);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferred topics.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  // STEP 5: KYC SUBMIT
  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!docFrontUrl) {
      setError('Government ID front scan is required.');
      return;
    }
    if (!selfieUrl) {
      setError('Liveness selfie snap is required.');
      return;
    }
    if (!declarationAccepted) {
      setError('You must accept the declaration checkbox.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/register/kyc', {
        sessionId,
        documentType: docType,
        documentNumber: docNum,
        documentFrontUrl: docFrontUrl,
        documentBackUrl: docBackUrl,
        selfieUrl,
        addressProofUrl,
        declarationAccepted
      }, {
        headers: { Authorization: `Bearer ${regToken}` }
      });
      if (res.data.success) {
        setStep(6);
      }
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMsgs = err.response.data.errors.map(e => {
          const field = e.path && e.path.length > 0 ? e.path.join('.') : '';
          return field ? `${field}: ${e.message}` : e.message;
        }).join(' | ');
        setError(`Validation Failed: ${errorMsgs}`);
      } else {
        setError(err.response?.data?.message || 'KYC submission failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureMockSelfie = () => {
    const randomSeed = Math.floor(Math.random() * 1000);
    setSelfieUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=Selfie-${randomSeed}`);
  };

  return (
    <div className="min-h-screen bg-[#EDF6E5] dark:bg-[#080b12] text-slate-800 dark:text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-15%] w-[400px] h-[400px] rounded-full bg-brandPrimary/5 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[450px] h-[450px] rounded-full bg-brandSecondary/5 blur-[90px] pointer-events-none"></div>

      <div className="max-w-2xl w-full mx-auto z-10">
        <div className="flex justify-center items-center gap-2 mb-8">
          <HakaLogo variant="horizontal" size={110} />
        </div>

        {step < 6 && (
          <div className="mb-10 px-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white/50 mb-3 font-semibold uppercase tracking-wider">
              <span>Step {step} of 5</span>
              <span>
                {step === 1 && 'Mobile Verification'}
                {step === 2 && 'OTP Authentication'}
                {step === 3 && 'Profile Details'}
                {step === 4 && 'Topic Preferences'}
                {step === 5 && 'KYC Verification'}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200/20 dark:border-white/5">
              <div
                className="h-full bg-gradient-to-r from-brandPrimary to-brandSecondary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="glassmorphism p-8 rounded-[24px] border border-slate-200/50 dark:border-white/10 shadow-premium relative overflow-hidden transition-all duration-300 bg-white/80 dark:bg-slate-900/40">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-450 rounded-xl text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: MOBILE VERIFICATION */}
          {step === 1 && (
            <form onSubmit={handleMobileSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins flex items-center gap-2">
                  <Phone className="w-5 h-5 text-brandPrimary" /> Mobile Verification
                </h3>
                <p className="text-sm text-slate-500 dark:text-white/60 mt-1">We will verify your mobile number first before collecting personal details.</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2.5">
                  <div className="w-24">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Code</label>
                    <input
                      type="text"
                      required
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      placeholder="+91"
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50 text-center font-semibold"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Referral Code (Optional)</label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter referral code if any"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 dark:border-white/10 accent-brandPrimary w-4 h-4 cursor-pointer"
                    />
                    <span className="text-slate-500 dark:text-white/60 font-medium">
                      I agree to the{' '}
                      <a href="#" className="text-brandPrimary hover:underline font-semibold">Terms & Conditions</a>
                      {' '}and{' '}
                      <a href="#" className="text-brandPrimary hover:underline font-semibold">Privacy Policy</a>.
                    </span>
                  </label>
                </div>
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
                  <span>{loading ? 'Sending...' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brandSecondary" /> OTP Verification
                </h3>
                <p className="text-sm text-slate-500 dark:text-white/60 mt-1">
                  Enter the 6-digit verification code sent to {countryCode} {phone}.
                </p>
              </div>

              {mockOtpHint && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-450 rounded-xl text-xs font-semibold">
                  E2E Mock OTP: <span className="font-mono font-bold tracking-widest text-sm underline">{mockOtpHint}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 dark:text-white/50 mb-1.5">Verification Code</label>
                  <input
                    type="text"
                    ref={otpInputRef}
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="••••••"
                    className="block w-full max-w-[180px] mx-auto px-4 py-3 bg-black/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-lg font-bold text-center tracking-widest focus:outline-none focus:border-brandSecondary/50 font-mono"
                  />
                </div>

                <div className="text-center text-xs text-slate-500 dark:text-white/40">
                  {timer > 0 ? (
                    <span>Resend OTP in <span className="font-bold text-slate-800 dark:text-white font-mono">{timer}s</span></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-brandSecondary hover:underline font-bold"
                    >
                      Resend Verification OTP
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs border border-slate-200 dark:border-white/10 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Change Mobile</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-brandPrimary hover:bg-brandPrimary/90 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                >
                  <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PROFILE CREATION */}
          {step === 3 && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-brandPrimary" /> Profile Creation
                </h3>
                <p className="text-sm text-slate-500 dark:text-white/60 mt-1">Configure your personal profile card details.</p>
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
                  <h4 className="text-xs font-bold uppercase text-slate-800 dark:text-white">Profile Image</h4>
                  <p className="text-[10px] text-slate-550 dark:text-white/40 mb-2">Upload custom file or roll initialization initials.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-bold px-3 py-1 bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary hover:bg-brandPrimary/15 rounded-lg transition-colors"
                    >
                      {uploadingAvatar ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <button
                      type="button"
                      onClick={handleRollAvatar}
                      className="text-[10px] font-bold px-3 py-1 bg-white/10 hover:bg-white/15 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white transition-colors"
                    >
                      Roll Avatar
                    </button>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Raj Patel"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-805 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Username *</label>
                  <input
                    type="text"
                    required
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    placeholder="rajpatel"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-805 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="raj@gmail.com"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-805 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={profileData.dob}
                    onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-805 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Password *</label>
                  <input
                    type="password"
                    required
                    value={profileData.password}
                    onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                    placeholder="••••••••"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-805 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50"
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
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-805 dark:text-white text-sm focus:outline-none focus:border-brandPrimary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Gender *</label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">State *</label>
                  <input
                    type="text"
                    required
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                    placeholder="E.g. Kerala"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-805 dark:text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">District *</label>
                  <input
                    type="text"
                    required
                    value={profileData.district}
                    onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                    placeholder="E.g. Ernakulam"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-805 dark:text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">City / Place *</label>
                  <input
                    type="text"
                    required
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    placeholder="E.g. Kochi"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-805 dark:text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Preferred Language *</label>
                  <input
                    type="text"
                    required
                    value={profileData.preferredLanguage}
                    onChange={(e) => setProfileData({ ...profileData, preferredLanguage: e.target.value })}
                    placeholder="English"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-805 dark:text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Pincode (Optional)</label>
                  <input
                    type="text"
                    value={profileData.pincode}
                    onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                    placeholder="682001"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-805 dark:text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Occupation (Optional)</label>
                  <input
                    type="text"
                    value={profileData.occupation}
                    onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                    placeholder="Student"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-805 dark:text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Education (Optional)</label>
                  <input
                    type="text"
                    value={profileData.education}
                    onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                    placeholder="BTech"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-805 dark:text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">Employment Status</label>
                  <select
                    value={profileData.employmentStatus}
                    onChange={(e) => setProfileData({ ...profileData, employmentStatus: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none"
                  >
                    <option value="Student">Student</option>
                    <option value="Employed / Salaried">Employed / Salaried</option>
                    <option value="Self Employed">Self Employed</option>
                    <option value="Unemployed">Unemployed</option>
                  </select>
                </div>
              </div>

              {/* Permissions */}
              <div className="pt-2 space-y-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/40 mb-1">Required Consent</span>
                
                <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={profileData.notificationPermission}
                    onChange={(e) => setProfileData({ ...profileData, notificationPermission: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 dark:border-white/10 accent-brandPrimary w-4 h-4 cursor-pointer"
                  />
                  <span className="text-slate-500 dark:text-white/60 font-semibold">Enable App Push Notifications (Required to receive match brackets updates) *</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={profileData.locationPermission}
                    onChange={(e) => setProfileData({ ...profileData, locationPermission: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 dark:border-white/10 accent-brandPrimary w-4 h-4 cursor-pointer"
                  />
                  <span className="text-slate-500 dark:text-white/60 font-semibold">Allow Location Services (Optional, used to personalize localized brackets)</span>
                </label>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-brandPrimary hover:bg-brandPrimary/90 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                >
                  <span>{loading ? 'Saving...' : 'Save & Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: PREFERRED TOPICS */}
          {step === 4 && (
            <form onSubmit={handleTopicsSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins">Choose Your Preferred Topics</h3>
                <p className="text-sm text-slate-500 dark:text-white/60 mt-1">Select one or more topics you want to audit or compete in.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORIES.map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      type="button"
                      key={topic}
                      onClick={() => handleToggleTopic(topic)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                        isSelected
                          ? 'bg-brandPrimary text-white border-brandPrimary shadow-md'
                          : 'bg-slate-50/50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70'
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-brandPrimary hover:bg-brandPrimary/90 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                >
                  <span>{loading ? 'Saving...' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: KYC VERIFICATION */}
          {step === 5 && (
            <form onSubmit={handleKycSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brandPrimary" /> Government KYC Center
                </h3>
                <p className="text-sm text-slate-500 dark:text-white/60 mt-1">Upload files and snap selfies. Mandatory to qualify for auditions payouts.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* ID Type & Num */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35 mb-1.5">Government ID Type *</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-xs font-semibold cursor-pointer"
                    >
                      <option value="Aadhaar">Aadhaar Card (India)</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35 mb-1.5">Document Registration Number *</label>
                    <input
                      type="text"
                      required
                      value={docNum}
                      onChange={(e) => setDocNum(e.target.value)}
                      placeholder={`Enter ${docType} Number`}
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-805 dark:text-white text-xs font-semibold"
                    />
                  </div>

                  {/* ID Scan Front */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35 mb-1">Upload ID Front Page Scan *</label>
                    <input
                      type="file"
                      ref={docFrontInputRef}
                      onChange={(e) => handleFileUpload(e, setDocFrontUrl, setUploadingDocFront)}
                      className="hidden"
                      accept="image/*,application/pdf"
                    />
                    <div
                      onClick={() => docFrontInputRef.current?.click()}
                      className="border border-dashed border-slate-300 dark:border-white/15 bg-slate-50/50 dark:bg-[#080b12]/30 rounded-xl p-4 text-center cursor-pointer hover:border-brandPrimary/50 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-[10px] text-brandPrimary font-bold block">
                        {uploadingDocFront ? 'Uploading Front page...' : 'Choose front file scan'}
                      </span>
                      {docFrontUrl && (
                        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold px-2 py-0.5 rounded mt-2.5 inline-block truncate max-w-full">
                          ✓ Front Uploaded
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ID Scan Back */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35 mb-1">Upload ID Back Page Scan (Optional)</label>
                    <input
                      type="file"
                      ref={docBackInputRef}
                      onChange={(e) => handleFileUpload(e, setDocBackUrl, setUploadingDocBack)}
                      className="hidden"
                      accept="image/*,application/pdf"
                    />
                    <div
                      onClick={() => docBackInputRef.current?.click()}
                      className="border border-dashed border-slate-300 dark:border-white/15 bg-slate-50/50 dark:bg-[#080b12]/30 rounded-xl p-4 text-center cursor-pointer hover:border-brandPrimary/50 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-[10px] text-brandPrimary font-bold block">
                        {uploadingDocBack ? 'Uploading Back page...' : 'Choose back file scan'}
                      </span>
                      {docBackUrl && (
                        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold px-2 py-0.5 rounded mt-2.5 inline-block truncate max-w-full">
                          ✓ Back Uploaded
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selfie & Address Proof */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35 mb-1">Liveness Facial Selfie Capture *</label>
                    <input
                      type="file"
                      ref={selfieInputRef}
                      onChange={(e) => handleFileUpload(e, setSelfieUrl, setUploadingSelfie)}
                      className="hidden"
                      accept="image/*"
                    />
                    <div className="border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/10 rounded-xl p-4 text-center flex flex-col items-center justify-center min-h-[175px]">
                      {selfieUrl ? (
                        <div className="space-y-2">
                          <img src={selfieUrl} className="w-20 h-20 rounded-full border border-brandSecondary bg-slate-100 dark:bg-slate-800 object-cover mx-auto" alt="Selfie" />
                          <span className="text-[9px] text-brandSecondary bg-brandSecondary/10 px-2 py-0.5 border border-brandSecondary/25 rounded font-bold uppercase tracking-wider">
                            ✓ Webcam Snap Recorded
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                          <p className="text-[9px] text-slate-500 leading-normal max-w-[150px] mx-auto font-medium">Please ensure adequate ambient lighting for matches scan check.</p>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3.5">
                        <button
                          type="button"
                          onClick={() => selfieInputRef.current?.click()}
                          className="px-3 py-1 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-[10px] font-bold rounded-lg text-slate-700 dark:text-white flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          <span>{uploadingSelfie ? 'Uploading...' : 'Choose File'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCaptureMockSelfie}
                          className="px-3 py-1 bg-brandSecondary/10 border border-brandSecondary/20 text-[10px] font-bold rounded-lg text-brandSecondary flex items-center gap-1"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Simulate Capture</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Address Proof */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35 mb-1">Upload Local Address Proof (Optional)</label>
                    <input
                      type="file"
                      ref={addressProofInputRef}
                      onChange={(e) => handleFileUpload(e, setAddressProofUrl, setUploadingAddress)}
                      className="hidden"
                      accept="image/*,application/pdf"
                    />
                    <div
                      onClick={() => addressProofInputRef.current?.click()}
                      className="border border-dashed border-slate-300 dark:border-white/15 bg-slate-50/50 dark:bg-[#080b12]/30 rounded-xl p-4 text-center cursor-pointer hover:border-brandPrimary/50 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-[10px] text-brandPrimary font-bold block">
                        {uploadingAddress ? 'Uploading address proof...' : 'Choose file scan (e.g. Utility bill)'}
                      </span>
                      {addressProofUrl && (
                        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold px-2 py-0.5 rounded mt-2.5 inline-block truncate max-w-full">
                          ✓ Address Proof Uploaded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Declaration Check */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-4">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 dark:border-white/10 accent-brandPrimary w-4 h-4 cursor-pointer"
                  />
                  <span className="text-slate-500 dark:text-white/60 font-semibold">
                    I declare that all scanned document materials and facial selfies are legitimate, accurate representations of my identity.
                  </span>
                </label>

                <div className="flex justify-between pt-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-white/35 flex items-center gap-1.5 uppercase select-none border border-slate-200 dark:border-white/5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-black/10">
                    <Shield className="w-3.5 h-3.5 text-brandPrimary animate-pulse" />
                    <span>Status: Pending Review</span>
                  </span>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-brandPrimary hover:bg-brandPrimary/90 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                  >
                    <span>{loading ? 'Submitting Registration...' : 'Complete & Submit KYC'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 6: REGISTRATION COMPLETE */}
          {step === 6 && (
            <div className="py-8 text-center space-y-6 animate-scale-in">
              <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-poppins">Registration Completed Successfully!</h3>
                <p className="text-xs text-brandSecondary bg-brandSecondary/10 px-3.5 py-1 rounded-xl border border-brandSecondary/25 font-bold uppercase tracking-wider inline-block">
                  Account Status: Pending KYC Approval
                </p>
                <p className="text-sm text-slate-500 dark:text-white/60 max-w-md mx-auto leading-relaxed pt-2">
                  Your contestant account profile has been successfully created. However, you will not be allowed to join contests, enter audition stage attempts, or claim prize awards until a KYC Officer reviews and approves your government credentials.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="px-8 py-3 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-brandPrimary/10 flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Launch Login Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {step < 6 && (
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
