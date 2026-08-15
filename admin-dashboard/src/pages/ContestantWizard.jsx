import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { User, ShieldAlert, Sparkles, ChevronLeft, ChevronRight, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { CustomDobPicker } from '../components/CustomDobPicker';
import { useNavigate } from 'react-router-dom';

export const ContestantWizard = () => {
  const navigate = useNavigate();
  const { showAlert, showSnackbar } = useAlert();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const steps = [
    { id: 1, title: 'Credentials', desc: 'Account credentials', icon: User },
    { id: 2, title: 'Profile details', desc: 'Location & demographics', icon: Sparkles },
    { id: 3, title: 'Verification', desc: 'Status & consent details', icon: ShieldAlert },
  ];

  const formik = useFormik({
    initialValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      dob: '2000-01-01',
      gender: 'Male',
      state: 'Kerala',
      district: 'Ernakulam',
      city: '',
      preferredLanguage: 'English',
      pincode: '',
      occupation: '',
      education: '',
      employmentStatus: 'Unemployed',
      notificationPermission: false,
      locationPermission: false,
      kycStatus: 'Pending'
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .max(50, 'Name must be 50 characters or less')
        .required('Full name is required'),
      username: Yup.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be 20 characters or less')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores')
        .required('Username is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email address is required'),
      phone: Yup.string()
        .matches(/^\+?[0-9]{10,15}$/, 'Phone number must be between 10 and 15 digits (+91...)')
        .required('Mobile phone is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
    }),
    onSubmit: async (values) => {
      setSubmitting(true);
      const payload = {
        name: values.name,
        username: values.username,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: 'Contestant',
        dob: values.dob,
        gender: values.gender,
        state: values.state,
        district: values.district,
        city: values.city,
        preferredLanguage: values.preferredLanguage,
        pincode: values.pincode,
        occupation: values.occupation,
        education: values.education,
        employmentStatus: values.employmentStatus,
        notificationPermission: values.notificationPermission,
        locationPermission: values.locationPermission,
        kycStatus: values.kycStatus
      };

      try {
        const res = await axios.post('/api/admin/users', payload, { withCredentials: true });
        if (res.data.success) {
          showSnackbar(`Contestant ${values.name} created successfully.`, 'success');
          navigate('/admin-dashboard/contestants');
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to create contestant account', 'error');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const validateStep = (step) => {
    if (step === 1) {
      formik.setFieldTouched('name', true);
      formik.setFieldTouched('username', true);
      formik.setFieldTouched('email', true);
      formik.setFieldTouched('phone', true);
      formik.setFieldTouched('password', true);
      if (
        formik.errors.name ||
        formik.errors.username ||
        formik.errors.email ||
        formik.errors.phone ||
        formik.errors.password ||
        !formik.values.name ||
        !formik.values.username ||
        !formik.values.email ||
        !formik.values.phone ||
        !formik.values.password
      ) {
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      showSnackbar('Please resolve all validation errors before proceeding.', 'error');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 text-brandPrimary border-b border-white/5 pb-2 mb-4">
              <User className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Step 1: Account Credentials</span>
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Aarav Sharma"
                className={`w-full bg-[#080b12] border rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-all ${
                  formik.touched.name && formik.errors.name ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-brandPrimary'
                }`}
              />
              {formik.touched.name && formik.errors.name && (
                <span className="text-[10px] text-red-400 mt-1 block">{formik.errors.name}</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="aarav"
                  className={`w-full bg-[#080b12] border rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-all ${
                    formik.touched.username && formik.errors.username ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-brandPrimary'
                  }`}
                />
                {formik.touched.username && formik.errors.username && (
                  <span className="text-[10px] text-red-400 mt-1 block">{formik.errors.username}</span>
                )}
              </div>
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="aarav@domain.com"
                  className={`w-full bg-[#080b12] border rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-all ${
                    formik.touched.email && formik.errors.email ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-brandPrimary'
                  }`}
                />
                {formik.touched.email && formik.errors.email && (
                  <span className="text-[10px] text-red-400 mt-1 block">{formik.errors.email}</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Mobile Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="+9199..."
                  className={`w-full bg-[#080b12] border rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-all ${
                    formik.touched.phone && formik.errors.phone ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-brandPrimary'
                  }`}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <span className="text-[10px] text-red-400 mt-1 block">{formik.errors.phone}</span>
                )}
              </div>
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Initial Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="••••••••"
                    className={`w-full bg-[#080b12] border rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-all ${
                      formik.touched.password && formik.errors.password ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-brandPrimary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <span className="text-[10px] text-red-400 mt-1 block">{formik.errors.password}</span>
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 text-brandPrimary border-b border-white/5 pb-2 mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Step 2: Personal Profile Details</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <CustomDobPicker
                  label="Date of Birth"
                  value={formik.values.dob}
                  onChange={(val) => formik.setFieldValue('dob', val)}
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Gender</label>
                <CustomSelect
                  value={formik.values.gender}
                  onChange={(val) => formik.setFieldValue('gender', val)}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Non-Binary', label: 'Non-Binary' }
                  ]}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">State</label>
                <input
                  type="text"
                  name="state"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  placeholder="Kerala"
                  className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">District</label>
                <input
                  type="text"
                  name="district"
                  value={formik.values.district}
                  onChange={formik.handleChange}
                  placeholder="Ernakulam"
                  className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">City</label>
                <input
                  type="text"
                  name="city"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  placeholder="Kochi"
                  className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formik.values.pincode}
                  onChange={formik.handleChange}
                  placeholder="682001"
                  className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={formik.values.occupation}
                  onChange={formik.handleChange}
                  placeholder="Student, Developer..."
                  className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Education</label>
                <input
                  type="text"
                  name="education"
                  value={formik.values.education}
                  onChange={formik.handleChange}
                  placeholder="BTech, High School..."
                  className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Preferred Language</label>
                <input
                  type="text"
                  name="preferredLanguage"
                  value={formik.values.preferredLanguage}
                  onChange={formik.handleChange}
                  placeholder="English, Hindi..."
                  className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Employment Status</label>
                <CustomSelect
                  value={formik.values.employmentStatus}
                  onChange={(val) => formik.setFieldValue('employmentStatus', val)}
                  options={[
                    { value: 'Student', label: 'Student' },
                    { value: 'Employed / Salaried', label: 'Employed / Salaried' },
                    { value: 'Self Employed', label: 'Self Employed' },
                    { value: 'Unemployed', label: 'Unemployed' }
                  ]}
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 text-brandPrimary border-b border-white/5 pb-2 mb-4">
              <ShieldAlert className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Step 3: Verification & Consents</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Initial KYC Review Status</label>
                <CustomSelect
                  value={formik.values.kycStatus}
                  onChange={(val) => formik.setFieldValue('kycStatus', val)}
                  options={[
                    { value: 'Pending', label: 'Pending Documents' },
                    { value: 'Under Review', label: 'Under Review / AI Verdict' },
                    { value: 'Approved', label: 'KYC Approved' },
                    { value: 'Rejected', label: 'KYC Rejected' }
                  ]}
                />
              </div>

              <div className="pt-2 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="notificationPermission"
                    checked={formik.values.notificationPermission}
                    onChange={formik.handleChange}
                    className="w-4 h-4 rounded border-white/10 bg-[#080b12] text-brandPrimary focus:ring-brandPrimary mt-0.5"
                  />
                  <div>
                    <span className="text-xs text-white font-semibold">Enable Notifications Consent</span>
                    <p className="text-[10px] text-white/40">Opt-in to SMS updates and verification alerts</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="locationPermission"
                    checked={formik.values.locationPermission}
                    onChange={formik.handleChange}
                    className="w-4 h-4 rounded border-white/10 bg-[#080b12] text-brandPrimary focus:ring-brandPrimary mt-0.5"
                  />
                  <div>
                    <span className="text-xs text-white font-semibold">Enable Location Mapping Consent</span>
                    <p className="text-[10px] text-white/40">Opt-in to geolocation services for audit security compliance</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left animate-fade-in">
      <button
        onClick={() => navigate('/admin-dashboard/contestants')}
        className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Contestant Directory
      </button>

      <div>
        <h2 className="text-xl font-bold text-white font-poppins flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-brandPrimary" />
          Onboard New Contestant
        </h2>
        <p className="text-xs text-white/50 mt-1">
          Create a contestant profile complete with credentials, local region details, and KYC status logs.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-4">
        {steps.map((s) => {
          const StepIcon = s.icon;
          const isActive = s.id === currentStep;
          const isCompleted = s.id < currentStep;

          return (
            <div 
              key={s.id} 
              className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all ${
                isActive 
                  ? 'bg-brandPrimary/10 border-brandPrimary text-white' 
                  : isCompleted 
                  ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-400' 
                  : 'bg-white/5 border-white/5 text-white/40'
              }`}
            >
              <StepIcon className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold mt-1 tracking-wider uppercase hidden sm:inline">{s.title}</span>
            </div>
          );
        })}
      </div>

      {/* Main Form Container */}
      <form onSubmit={formik.handleSubmit} className="glassmorphism border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        {renderStepContent()}

        {/* Action Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-white/5">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-gradient-to-r from-brandPrimary to-brandSecondary hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Create Contestant Account</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ContestantWizard;
