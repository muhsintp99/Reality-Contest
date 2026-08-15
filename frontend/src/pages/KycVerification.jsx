import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { uploadKycRequest, fetchKycStatusRequest } from '../store/authSlice';
import { Shield, UploadCloud, Camera, CheckCircle2, AlertTriangle, RefreshCw, UserCheck, MapPin, GraduationCap, Briefcase, FileText } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

export const KycVerification = () => {
  const dispatch = useDispatch();
  const { user, currentKyc, loading } = useSelector((state) => state.auth);

  // Address & Location State
  const [address, setAddress] = useState('');
  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Education & Occupation State
  const [education, setEducation] = useState('Higher Secondary');
  const [occupation, setOccupation] = useState('');

  // Document State
  const [docType, setDocType] = useState('Aadhaar');
  const [docNum, setDocNum] = useState('');
  const [docFrontUrl, setDocFrontUrl] = useState('');
  const [docFrontName, setDocFrontName] = useState('');
  const [docBackUrl, setDocBackUrl] = useState('');
  const [docBackName, setDocBackName] = useState('');

  // Proofs State
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [selfieUrl, setSelfieUrl] = useState('');
  const [addressProofUrl, setAddressProofUrl] = useState('');
  const [addressProofName, setAddressProofName] = useState('');
  const [otherDocUrl, setOtherDocUrl] = useState('');
  const [otherDocName, setOtherDocName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState('');

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const addressProofInputRef = useRef(null);
  const otherDocInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchKycStatusRequest());
  }, [dispatch]);

  // Handle Generic File Upload
  const handleFileUpload = async (e, urlSetter, nameSetter, fieldKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldKey);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (res.data.success) {
        urlSetter(res.data.fileUrl);
        nameSetter(file.name);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload document file.');
    } finally {
      setUploadingField('');
    }
  };

  const handleCaptureSelfie = () => {
    setSelfieCaptured(true);
    const rand = Math.floor(Math.random() * 10000);
    setSelfieUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=Selfie-${rand}`);
  };

  const handleSubmitKyc = (e) => {
    e.preventDefault();
    if (!docFrontUrl) {
      alert('Please upload front side image of your identity document.');
      return;
    }
    if (!selfieCaptured && !selfieUrl) {
      alert('Please capture or upload a liveness selfie.');
      return;
    }

    setSubmitting(true);
    dispatch(uploadKycRequest({
      data: {
        address,
        state: stateName,
        district,
        city,
        pincode,
        education,
        occupation,
        documentType: docType,
        documentNumber: docNum,
        documentFrontUrl: docFrontUrl,
        documentBackUrl: docBackUrl,
        selfieUrl: selfieUrl,
        addressProofUrl: addressProofUrl,
        otherDocUrl: otherDocUrl
      },
      callback: (success) => {
        setSubmitting(false);
        if (success) {
          alert('KYC application submitted successfully! Under review.');
        }
      }
    }));
  };

  if (currentKyc) {
    const isApproved = currentKyc.status === 'Approved';
    const isRejected = currentKyc.status === 'Rejected';
    const isReview = currentKyc.status === 'Under Review';

    return (
      <div className="space-y-6 text-left pb-10">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
            <Shield className="w-6 h-6 text-brandPrimary" />
            <span>KYC Verification Dashboard</span>
          </h2>
          <p className="text-xs text-slate-450 dark:text-white/40 mt-1">View your identity verification status and recorded details.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphism p-6 md:p-8 rounded-[24px] border border-slate-200/50 dark:border-white/5 bg-white/70 dark:bg-slate-900/40 shadow-premium"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-2xl mb-8">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-white/35 uppercase block tracking-wider mb-1">Verification Status</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border ${
                  isApproved ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                  isRejected ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                  'bg-amber-500/10 text-amber-600 border-amber-500/20'
                }`}>
                  {currentKyc.status}
                </span>
                {isApproved && <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-pulse" />}
                {isRejected && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                {isReview && <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />}
              </div>
            </div>
            {isApproved && (
              <span className="text-xs text-emerald-600 bg-emerald-500/10 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 border border-emerald-500/20 shadow-sm">
                <UserCheck className="w-4 h-4" /> Verified Contestant Account
              </span>
            )}
          </div>

          {/* AI Ledger & Upload Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brandPrimary dark:text-brandSecondary">Submitted Details</h3>
              <div className="p-4 bg-slate-50 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-2xl space-y-2 text-xs">
                <p><span className="text-slate-400">Document Type:</span> <strong className="text-slate-800 dark:text-white">{currentKyc.documentType}</strong></p>
                <p><span className="text-slate-400">Doc Number:</span> <strong className="text-slate-800 dark:text-white">••••{currentKyc.documentNumber?.slice(-4)}</strong></p>
                {currentKyc.address && <p><span className="text-slate-400">Address:</span> <span className="text-slate-700 dark:text-slate-300">{currentKyc.address}, {currentKyc.city}, {currentKyc.state} - {currentKyc.pincode}</span></p>}
                {currentKyc.education && <p><span className="text-slate-400">Education:</span> <span className="text-slate-700 dark:text-slate-300">{currentKyc.education}</span></p>}
                {currentKyc.occupation && <p><span className="text-slate-400">Occupation:</span> <span className="text-slate-700 dark:text-slate-300">{currentKyc.occupation}</span></p>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brandSecondary">Uploaded Proofs</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Front Document Scan</span>
                  <div className="w-full h-20 bg-slate-100 dark:bg-black/20 rounded-lg flex items-center justify-center text-[10px] text-emerald-500 font-bold mt-2">
                    ✓ Scan Uploaded
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Selfie Snapshot</span>
                  {currentKyc.selfieUrl ? (
                    <img src={currentKyc.selfieUrl} className="w-full h-20 object-cover rounded-lg mt-2 border border-slate-200 dark:border-white/10" alt="Selfie" />
                  ) : (
                    <div className="w-full h-20 bg-slate-100 dark:bg-black/20 rounded-lg flex items-center justify-center text-[10px] text-slate-400 mt-2">No Photo</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-10">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
          <Shield className="w-6 h-6 text-brandPrimary" />
          <span>Identity KYC Center</span>
        </h2>
        <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
          Complete address, professional profile, and submit government ID proofs to unlock contestant features.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glassmorphism p-6 md:p-8 rounded-[24px] border border-slate-200/50 dark:border-white/10 bg-white/70 dark:bg-slate-900/40 shadow-premium"
      >
        <form onSubmit={handleSubmitKyc} className="space-y-8">
          
          {/* SECTION 1: ADDRESS DETAILS */}
          <div className="space-y-4 border-b border-slate-200/60 dark:border-white/5 pb-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-brandPrimary flex items-center gap-2">
              <MapPin className="w-4 h-4" /> 1. Address & Location Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/40 mb-1">
                  Street Address Line *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / Flat No, Street Name, Area"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/40 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/40 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Kerala / Tamil Nadu / Maharashtra"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/40 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/40 mb-1">
                  District *
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District name"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/40 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/40 mb-1">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City name"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/40 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/40 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="682001"
                  maxLength={6}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/40 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: EDUCATION & OCCUPATION */}
          <div className="space-y-4 border-b border-slate-200/60 dark:border-white/5 pb-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-brandPrimary flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> 2. Qualification & Occupation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/40 mb-1">
                  Education Level
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/40 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                >
                  <option value="High School">High School (10th)</option>
                  <option value="Higher Secondary">Higher Secondary (12th)</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor Degree">Bachelor's Degree</option>
                  <option value="Master Degree">Master's Degree</option>
                  <option value="Doctorate">Doctorate / Ph.D.</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/40 mb-1">
                  Occupation / Job Title
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Software Engineer / Student / Freelancer"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/40 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: DOCUMENT DETAILS & SCANS */}
          <div className="space-y-4 border-b border-slate-200/60 dark:border-white/5 pb-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-brandPrimary flex items-center gap-2">
              <FileText className="w-4 h-4" /> 3. Government Identity Document
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/40 mb-1">
                  Select Document Type *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/40 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                >
                  <option value="Aadhaar">Aadhaar Card (India)</option>
                  <option value="PAN">PAN Card (India)</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID Card</option>
                  <option value="Other">Other Government ID</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/40 mb-1">
                  Document Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={docNum}
                  onChange={(e) => setDocNum(e.target.value)}
                  placeholder={`Enter ${docType} number`}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/40 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>

            {/* Document Scans Front & Back */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Front Image */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/40 mb-1">
                  Document Front Image *
                </label>
                <input
                  type="file"
                  ref={frontInputRef}
                  onChange={(e) => handleFileUpload(e, setDocFrontUrl, setDocFrontName, 'front')}
                  className="hidden"
                  accept="image/*,application/pdf"
                />
                {docFrontUrl ? (
                  <div className="relative group border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-slate-100 dark:bg-black/40">
                    <img src={docFrontUrl} alt="Document Front Preview" className="w-full h-32 object-cover" />
                    <div className="p-2 bg-slate-900/90 text-white flex items-center justify-between text-xs">
                      <span className="truncate font-medium">{docFrontName || 'Front Document Scan'}</span>
                      <button
                        type="button"
                        onClick={() => frontInputRef.current?.click()}
                        className="text-brandPrimary hover:underline text-[11px] font-bold"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => frontInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-brandPrimary rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 dark:bg-[#080b12]/30"
                  >
                    <UploadCloud className="w-6 h-6 text-brandPrimary mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      {uploadingField === 'front' ? 'Uploading...' : 'Upload Front Image Scan'}
                    </span>
                  </div>
                )}
              </div>

              {/* Back Image */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/40 mb-1">
                  Document Back Image (Optional)
                </label>
                <input
                  type="file"
                  ref={backInputRef}
                  onChange={(e) => handleFileUpload(e, setDocBackUrl, setDocBackName, 'back')}
                  className="hidden"
                  accept="image/*,application/pdf"
                />
                {docBackUrl ? (
                  <div className="relative group border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-slate-100 dark:bg-black/40">
                    <img src={docBackUrl} alt="Document Back Preview" className="w-full h-32 object-cover" />
                    <div className="p-2 bg-slate-900/90 text-white flex items-center justify-between text-xs">
                      <span className="truncate font-medium">{docBackName || 'Back Document Scan'}</span>
                      <button
                        type="button"
                        onClick={() => backInputRef.current?.click()}
                        className="text-brandPrimary hover:underline text-[11px] font-bold"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => backInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-brandPrimary rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 dark:bg-[#080b12]/30"
                  >
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      {uploadingField === 'back' ? 'Uploading...' : 'Upload Back Image Scan'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: SELFIE & OTHER PROOFS */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-brandPrimary flex items-center gap-2">
              <Camera className="w-4 h-4" /> 4. Liveness Selfie & Additional Proofs
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Liveness Selfie */}
              <div className="bg-slate-50 dark:bg-black/20 border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-3">
                {selfieCaptured ? (
                  <div className="space-y-2">
                    <img src={selfieUrl} className="w-24 h-24 rounded-2xl object-cover border-2 border-brandSecondary mx-auto shadow-md" alt="Selfie" />
                    <span className="text-[10px] text-brandSecondary bg-brandSecondary/10 px-2.5 py-1 rounded-full font-bold uppercase block">
                      ✓ Live Selfie Recorded
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-[11px] text-slate-400 font-medium">Liveness photo verification</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleCaptureSelfie}
                  className="px-4 py-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold rounded-xl text-slate-700 dark:text-white hover:bg-slate-100 transition shadow-sm"
                >
                  {selfieCaptured ? 'Retake Snapshot' : 'Capture Live Photo'}
                </button>
              </div>

              {/* Address Proof & Other Docs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/40 mb-1">
                    Address Proof (Electricity Bill / Passbook)
                  </label>
                  <input
                    type="file"
                    ref={addressProofInputRef}
                    onChange={(e) => handleFileUpload(e, setAddressProofUrl, setAddressProofName, 'addressProof')}
                    className="hidden"
                    accept="image/*,application/pdf"
                  />
                  {addressProofUrl ? (
                    <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-[#080b12]/40 border border-emerald-500/30 rounded-xl">
                      <img src={addressProofUrl} alt="Address Proof" className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-white/10" />
                      <div className="flex-1 truncate">
                        <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">{addressProofName || 'Address Proof Uploaded'}</span>
                        <span className="text-[10px] text-emerald-500 font-bold">✓ Ready for submission</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addressProofInputRef.current?.click()}
                        className="text-xs font-bold text-brandPrimary hover:underline px-2"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addressProofInputRef.current?.click()}
                      className="w-full py-2.5 px-3 bg-slate-50 dark:bg-[#080b12]/40 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 text-left flex items-center justify-between"
                    >
                      <span className="truncate">{uploadingField === 'addressProof' ? 'Uploading...' : 'Upload Address Proof Document'}</span>
                      <UploadCloud className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/40 mb-1">
                    Other Supporting Document (Optional)
                  </label>
                  <input
                    type="file"
                    ref={otherDocInputRef}
                    onChange={(e) => handleFileUpload(e, setOtherDocUrl, setOtherDocName, 'otherDoc')}
                    className="hidden"
                    accept="image/*,application/pdf"
                  />
                  {otherDocUrl ? (
                    <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-[#080b12]/40 border border-emerald-500/30 rounded-xl">
                      <img src={otherDocUrl} alt="Other Document" className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-white/10" />
                      <div className="flex-1 truncate">
                        <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">{otherDocName || 'Additional Document Uploaded'}</span>
                        <span className="text-[10px] text-emerald-500 font-bold">✓ Ready for submission</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => otherDocInputRef.current?.click()}
                        className="text-xs font-bold text-brandPrimary hover:underline px-2"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => otherDocInputRef.current?.click()}
                      className="w-full py-2.5 px-3 bg-slate-50 dark:bg-[#080b12]/40 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 text-left flex items-center justify-between"
                    >
                      <span className="truncate">{uploadingField === 'otherDoc' ? 'Uploading...' : 'Upload Additional Document'}</span>
                      <UploadCloud className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200/60 dark:border-white/5 text-right">
            <button
              type="submit"
              disabled={loading || submitting}
              className="px-6 py-3 bg-gradient-to-r from-brandPrimary to-brandSecondary hover:brightness-110 text-white rounded-xl text-xs font-extrabold transition shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Submitting Application...' : 'Submit Full KYC Application'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default KycVerification;
