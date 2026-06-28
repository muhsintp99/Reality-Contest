import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { registerRequest, verifyOtpRequest } from '../store/authSlice';
import { ArrowRight, ArrowLeft, Shield, CheckCircle, Sparkles, AlertCircle, Camera, Check } from 'lucide-react';
import { auth as firebaseAuth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const AVAILABLE_CATEGORIES = ['Knowledge', 'Arts', 'Content Creation', 'Entrepreneurship', 'Sports', 'Science', 'Social Impact'];
const AVAILABLE_SKILLS = ['Public Speaking', 'Video Editing', 'Cognitive Analysis', 'Coding', 'UI Design', 'Music Composition', 'Business Modeling'];
const AVAILABLE_INTERESTS = ['E-Sports', 'Indie SaaS', 'Short Film Making', 'Finance Debates', 'Eco Campaigns', 'Startup Incubators'];

export const Register = ({ onLoginClick, onRegisterSuccess }) => {
  const dispatch = useDispatch();
  const { error, loading, isMockMode } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState('');
  const [formErr, setFormErr] = useState(null);

  const [confirmationResult, setConfirmationResult] = useState(null);
  const [sendingSms, setSendingSms] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Onboarding',
    dob: '',
    gender: 'Male',
    state: '',
    district: '',
    country: 'India',
    favoriteCategories: [],
    skills: [],
    interests: []
  });

  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [mockOtps, setMockOtps] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const nextStep = () => {
    setFormErr(null);
    if (step === 1) {
      if (!formData.name || !formData.username || !formData.email || !formData.phone || !formData.password) {
        setFormErr('Please complete all required fields.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormErr('Passwords do not match.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.dob || !formData.state || !formData.district) {
        setFormErr('Please fill in Date of Birth, State and District details.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setFormErr(null);
    setStep(prev => prev - 1);
  };

  const handleRegisterSubmit = () => {
    setFormErr(null);
    dispatch(registerRequest({
      data: {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        referralCode: formData.referralCode,
        dob: formData.dob,
        gender: formData.gender,
        state: formData.state,
        district: formData.district,
        country: formData.country,
        favoriteCategories: formData.favoriteCategories,
        skills: formData.skills,
        interests: formData.interests
      },
      callback: (res) => {
        if (res && res.success) {
          setUserId(res.userId);
          if (res.mockOtps) {
            setMockOtps(res.mockOtps);
          }
          setStep(4);
        } else {
          setFormErr(res?.error || 'Failed to submit registration data.');
        }
      }
    }));
  };

  const handleSendFirebaseSms = async () => {
    setFirebaseError('');
    setSendingSms(true);
    try {
      const verifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        }
      });
      const result = await signInWithPhoneNumber(firebaseAuth, formData.phone, verifier);
      setConfirmationResult(result);
      alert('Firebase SMS verification code sent!');
    } catch (err) {
      console.error(err);
      setFirebaseError(err.message || 'Firebase SMS send failed. Make sure your phone is formatted as +91XXXXXXXXXX');
    } finally {
      setSendingSms(false);
    }
  };

  const handleVerifyOtp = (type) => {
    setFormErr(null);
    
    if (type === 'phone_verify' && !isMockMode && confirmationResult) {
      setFormErr(null);
      confirmationResult.confirm(phoneOtp).then(async (result) => {
        const idToken = await result.user.getIdToken();
        dispatch(verifyOtpRequest({
          userId,
          otp: idToken,
          type: 'phone_verify',
          callback: (verified) => {
            if (verified) {
              setIsPhoneVerified(true);
              if (isEmailVerified) setStep(5);
            } else {
              setFormErr('Backend failed to verify Firebase OTP token.');
            }
          }
        }));
      }).catch((err) => {
        console.error(err);
        setFormErr('Invalid Firebase SMS code. Please check and retry.');
      });
      return;
    }

    const code = type === 'email_verify' ? emailOtp : phoneOtp;
    if (!code) {
      setFormErr('Please enter the OTP verification code.');
      return;
    }

    dispatch(verifyOtpRequest({
      userId,
      otp: code,
      type,
      callback: (verified) => {
        if (verified) {
          if (type === 'email_verify') setIsEmailVerified(true);
          if (type === 'phone_verify') setIsPhoneVerified(true);
          
          const emailStatus = type === 'email_verify' ? true : isEmailVerified;
          const phoneStatus = type === 'phone_verify' ? true : isPhoneVerified;
          if (emailStatus && phoneStatus) {
            setStep(5);
          }
        } else {
          setFormErr('Incorrect OTP code. Please check and retry.');
        }
      }
    }));
  };

  const toggleSelection = (key, item) => {
    const list = formData[key];
    const updated = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    setFormData(prev => ({ ...prev, [key]: updated }));
  };

  const availableCategories = AVAILABLE_CATEGORIES;
  const availableSkills = AVAILABLE_SKILLS;
  const availableInterests = AVAILABLE_INTERESTS;

  const rollAvatar = () => {
    const rand = Math.floor(Math.random() * 10000);
    setFormData(prev => ({
      ...prev,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=RCP-${rand}`
    }));
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-15%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[450px] h-[450px] rounded-full bg-cyan-600/10 blur-[90px] pointer-events-none"></div>

      <div className="max-w-2xl w-full mx-auto z-10">
        <div className="flex justify-center items-center gap-2.5 mb-8">
          <div className="p-2 bg-purple-600/20 border border-purple-500/30 rounded-xl">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <span className="font-poppins font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Reality Contest Platform
          </span>
        </div>

        {step < 5 && (
          <div className="mb-10 px-4">
            <div className="flex items-center justify-between text-xs text-white/50 mb-3 font-semibold uppercase tracking-wider">
              <span>Step {step} of 4</span>
              <span>
                {step === 1 && 'Credentials & Basic Info'}
                {step === 2 && 'Personal Profile Card'}
                {step === 3 && 'Category Preferences'}
                {step === 4 && 'Communication Verification'}
              </span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-cyan-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="glassmorphism p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-305">
          {formErr && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formErr}</span>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins">Get Started</h3>
                <p className="text-sm text-white/60">Create your account to start join contest auditions.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E.g. Raj Patel"
                    className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="E.g. rajpatel"
                    className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="raj@contest.in"
                    className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+919876543210"
                    className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Referral Code (Optional)</label>
                <input
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                  placeholder="Unlock ₹100 registration bonus"
                  className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins">Profile Details</h3>
                <p className="text-sm text-white/60">Configure your avatar and locations.</p>
              </div>

              <div className="flex items-center gap-6 p-4 bg-white/5 border border-white/5 rounded-xl">
                <div className="relative">
                  <img src={formData.avatar} className="w-20 h-20 rounded-full border-2 border-purple-500 bg-surfaceDark" alt="" />
                  <button
                    onClick={rollAvatar}
                    className="absolute bottom-0 right-0 p-1.5 bg-purple-600 hover:bg-purple-500 rounded-full border border-surfaceDark"
                    type="button"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Contestant Avatar</h4>
                  <p className="text-xs text-white/50 mb-2">Simulated randomly generated initials or seed avatars.</p>
                  <button
                    onClick={rollAvatar}
                    type="button"
                    className="text-xs font-semibold px-3 py-1 bg-white/10 hover:bg-white/15 rounded-lg border border-white/10 transition-colors"
                  >
                    Roll Random
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Gender Selection *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="E.g. Kerala"
                    className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">District *</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="E.g. Ernakulam"
                    className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Country</label>
                  <input
                    type="text"
                    disabled
                    value={formData.country}
                    className="block w-full px-4 py-2.5 bg-[#080b12]/30 border border-white/5 rounded-xl text-white/50 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2.5 rounded-xl hover:bg-white/5 font-semibold text-sm transition-all border border-white/10 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins">Contest Preferences</h3>
                <p className="text-sm text-white/60">Help us personalize the dashboard feeds for your skill sets.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">Favorite Categories</label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map(cat => {
                    const selected = formData.favoriteCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleSelection('favoriteCategories', cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          selected 
                            ? 'bg-purple-600 border-purple-500 text-white shadow-md' 
                            : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">Skills Inventory</label>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map(skill => {
                    const selected = formData.skills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSelection('skills', skill)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          selected 
                            ? 'bg-cyan-600 border-cyan-500 text-white shadow-md' 
                            : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">Target Interests</label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map(interest => {
                    const selected = formData.interests.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => toggleSelection('interests', interest)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          selected 
                            ? 'bg-amber-600 border-amber-500 text-white shadow-md' 
                            : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2.5 rounded-xl hover:bg-white/5 font-semibold text-sm transition-all border border-white/10 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleRegisterSubmit}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-sm transition-all flex items-center gap-2"
                >
                  {loading ? 'Submitting...' : 'Register Profile'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins">Secure Verification</h3>
                <p className="text-sm text-white/60">We sent 6-digit OTP codes to activate your contestant account profiles.</p>
              </div>

              {mockOtps && (
                <div className="p-3.5 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-medium space-y-1">
                  <div>Simulated Email OTP code is: <span className="bg-purple-500/25 px-2 py-0.5 rounded font-bold">{mockOtps.emailOtp}</span></div>
                  <div>Simulated Mobile OTP code is: <span className="bg-purple-500/25 px-2 py-0.5 rounded font-bold">{mockOtps.phoneOtp}</span></div>
                </div>
              )}

              <div className="p-5 bg-white/5 border border-white/5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Verify Email Address</h4>
                    <p className="text-xs text-white/50">{formData.email}</p>
                  </div>
                  {isEmailVerified ? (
                    <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Check className="w-3 h-3" /> Email Verified
                    </span>
                  ) : (
                    <span className="text-xs font-semibold bg-amber-500/20 text-amber-400 px-2 py-1 rounded-lg">
                      Awaiting Code
                    </span>
                  )}
                </div>

                {!isEmailVerified && (
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      maxLength={6}
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      placeholder="6-digit code"
                      className="block w-full max-w-[150px] px-3.5 py-2 bg-black border border-white/10 rounded-xl text-sm font-bold text-center tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => handleVerifyOtp('email_verify')}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-xs transition-colors"
                    >
                      Verify
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 bg-white/5 border border-white/5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Verify Mobile Number</h4>
                    <p className="text-xs text-white/50">{formData.phone}</p>
                  </div>
                  {isPhoneVerified ? (
                    <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Check className="w-3 h-3" /> Phone Verified
                    </span>
                  ) : (
                    <span className="text-xs font-semibold bg-amber-500/20 text-amber-400 px-2 py-1 rounded-lg">
                      Awaiting Code
                    </span>
                  )}
                </div>

                {!isPhoneVerified && (
                  <div className="space-y-4">
                    <div id="recaptcha-container" className="hidden"></div>
                    
                    {firebaseError && (
                      <p className="text-[11px] text-red-400 font-semibold">{firebaseError}</p>
                    )}

                    {(!isMockMode && !confirmationResult) ? (
                      <button
                        type="button"
                        onClick={handleSendFirebaseSms}
                        disabled={sendingSms}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold transition-all text-center"
                      >
                        {sendingSms ? 'Triggering SMS...' : 'Send OTP via Firebase SMS'}
                      </button>
                    ) : (
                      <div className="flex gap-2.5">
                        <input
                          type="text"
                          maxLength={6}
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value)}
                          placeholder="6-digit code"
                          className="block w-full max-w-[150px] px-3.5 py-2 bg-black border border-white/10 rounded-xl text-sm font-bold text-center tracking-widest text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyOtp('phone_verify')}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-xs transition-colors"
                        >
                          Verify
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="py-8 text-center space-y-6 animate-bounce-in">
              <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 animate-bounce">
                <CheckCircle className="w-12 h-12" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-poppins">Welcome to Reality Contest Platform!</h3>
                <p className="text-sm text-white/60 max-w-md mx-auto">
                  Your onboarding credentials and preferences are locked. Explore active contests, perform KYC, and join live voting.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onRegisterSuccess}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-purple-500/10 flex items-center gap-2.5 mx-auto"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Launch Dashboard Redirect</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {step < 4 && (
          <div className="text-center text-sm text-white/50 mt-6">
            Already registered?{' '}
            <button
              type="button"
              onClick={onLoginClick}
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              Sign in to account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Register;
