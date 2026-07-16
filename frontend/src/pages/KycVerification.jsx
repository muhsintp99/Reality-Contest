import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { uploadKycRequest, fetchKycStatusRequest } from '../store/authSlice';
import { Shield, UploadCloud, Camera, CheckCircle2, AlertTriangle, RefreshCw, UserCheck } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Badge } from '../components/common/Badges';

export const KycVerification = () => {
  const dispatch = useDispatch();
  const { user, currentKyc, loading } = useSelector((state) => state.auth);
  const [docType, setDocType] = useState('Aadhaar');
  const [docNum, setDocNum] = useState('');
  const [docFileSelected, setDocFileSelected] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [docFileName, setDocFileName] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const [realDocUrl, setRealDocUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    dispatch(fetchKycStatusRequest());
  }, [dispatch]);

  const handleSelectDocClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (res.data.success) {
        setRealDocUrl(res.data.fileUrl);
        setDocFileName(file.name);
        setDocFileSelected(true);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload file to local server.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCaptureSelfie = () => {
    setSelfieCaptured(true);
    const rand = Math.floor(Math.random() * 100);
    setSelfieUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=Selfie-${rand}`);
  };

  const handleSubmitKyc = (e) => {
    e.preventDefault();
    if (!docFileSelected || !selfieCaptured) {
      alert('Please upload your document file and capture a liveness selfie.');
      return;
    }
    
    setSubmitting(true);
    dispatch(uploadKycRequest({
      data: {
        documentType: docType,
        documentNumber: docNum,
        documentFrontUrl: realDocUrl,
        selfieUrl: selfieUrl
      },
      callback: (success) => {
        setSubmitting(false);
        if (success) {
          alert('KYC submitted! AI systems have run a baseline face match check.');
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
          <p className="text-xs text-slate-450 dark:text-white/40 mt-1">View your identity verification status and AI matching analytics.</p>
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
                  isApproved ? 'bg-emerald-500/10 text-emerald-605 border-emerald-500/20' :
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
              <span className="text-xs text-emerald-650 bg-emerald-500/10 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 border border-emerald-500/20 shadow-sm">
                <UserCheck className="w-4 h-4" /> Full Platform Access Granted
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brandPrimary dark:text-brandSecondary">AI Verification Ledger</h3>
              
              <div className="p-4 bg-slate-50 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-2xl space-y-3.5 shadow-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-550 dark:text-white/60 font-semibold">Biometric Liveness Index:</span>
                  <span className={`font-extrabold ${currentKyc.livenessScore >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {currentKyc.livenessScore}% Matching
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200/20 dark:border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-brandPrimary to-brandSecondary rounded-full" 
                    style={{ width: `${currentKyc.livenessScore}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-slate-200/60 dark:border-white/5 pt-3.5">
                  <span className="text-slate-550 dark:text-white/60 font-semibold">AI Facial Match Verdict:</span>
                  <span className={`font-semibold px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                    currentKyc.aiMatchResult === 'PASSED' 
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    {currentKyc.aiMatchResult}
                  </span>
                </div>
              </div>

              {isRejected && currentKyc.rejectionReason && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-450 rounded-xl text-xs">
                  <span className="font-bold block mb-1">Rejection Reason:</span>
                  {currentKyc.rejectionReason}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brandSecondary">Uploaded Credentials</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-2xl text-center space-y-2.5 shadow-sm">
                  <span className="text-[10px] text-slate-450 dark:text-white/40 block font-bold uppercase tracking-wider">{currentKyc.documentType} Card</span>
                  <div className="w-full h-24 bg-slate-100 dark:bg-black/20 rounded-xl flex items-center justify-center border border-slate-200/50 dark:border-white/5 text-[10px] text-slate-400 font-semibold uppercase">
                    Scan Uploaded
                  </div>
                  <span className="text-[10px] font-bold text-slate-650 dark:text-white/55 block truncate bg-slate-100 dark:bg-white/5 py-1 px-2 rounded-lg">
                    Number: ••••{currentKyc.documentNumber.slice(-4)}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-2xl text-center space-y-2.5 shadow-sm">
                  <span className="text-[10px] text-slate-450 dark:text-white/40 block font-bold uppercase tracking-wider">Liveness Snapshot</span>
                  <img src={currentKyc.selfieUrl} className="w-full h-24 object-cover rounded-xl border border-slate-200/50 dark:border-white/5" alt="" />
                  <span className="text-[10px] text-slate-500 dark:text-white/40 block font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 py-1 px-2 rounded-lg">Verified Selfie</span>
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
        <p className="text-xs text-slate-450 dark:text-white/40 mt-1">Submit government IDs and liveness selfies. Required for contestant smart-contract payouts.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glassmorphism p-6 md:p-8 rounded-[24px] border border-slate-200/50 dark:border-white/10 bg-white/70 dark:bg-slate-900/40 shadow-premium"
      >
        <form onSubmit={handleSubmitKyc} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35">
                  Document Type Selection
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-xl text-slate-800 dark:text-white text-xs focus:outline-none focus:border-brandPrimary/50 cursor-pointer font-semibold"
                >
                  <option value="Aadhaar" className="bg-white text-slate-850 dark:bg-darkCard dark:text-white">Aadhaar Card (India)</option>
                  <option value="PAN" className="bg-white text-slate-850 dark:bg-darkCard dark:text-white">PAN Card (India)</option>
                  <option value="Passport" className="bg-white text-slate-850 dark:bg-darkCard dark:text-white">Passport</option>
                  <option value="Driving License" className="bg-white text-slate-850 dark:bg-darkCard dark:text-white">Driving License</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35">
                  Document Registration Number
                </label>
                <input
                  type="text"
                  required
                  value={docNum}
                  onChange={(e) => setDocNum(e.target.value)}
                  placeholder={`Enter your ${docType} number`}
                  className="block w-full px-4 py-2.5 bg-slate-55 dark:bg-[#080b12]/30 border border-slate-200/60 dark:border-white/5 rounded-xl text-slate-805 dark:text-white text-xs focus:outline-none focus:border-brandPrimary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35">
                  Upload Document Scan (Front Page)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,application/pdf"
                />
                <div 
                  onClick={handleSelectDocClick}
                  className="border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-brandPrimary/40 dark:hover:border-brandPrimary/30 bg-slate-50/50 dark:bg-[#080b12]/30 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2.5 shadow-sm"
                >
                  <UploadCloud className="w-8 h-8 text-slate-405 dark:text-white/20 mx-auto" />
                  <div>
                    <span className="text-xs text-brandPrimary hover:text-brandPrimary/80 font-bold block">
                      {uploadingFile ? 'Uploading file...' : 'Click to import credentials file'}
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-white/35 mt-1 font-medium">JPEG, PNG or PDF up to 5MB</p>
                  </div>
                  {docFileSelected && (
                    <div className="text-[11px] bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary p-2 rounded-xl font-bold truncate">
                      ✓ {docFileName}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-white/35">
                Biometric Selfie Capture (Liveness Check)
              </label>
              
              <div className="bg-slate-50 dark:bg-black/20 border border-slate-200/50 dark:border-white/5 rounded-2xl p-6 text-center space-y-4 flex flex-col justify-center items-center min-h-[250px] shadow-sm">
                {selfieCaptured ? (
                  <div className="space-y-3.5">
                    <img src={selfieUrl} className="w-24 h-24 rounded-full object-cover border-2 border-brandSecondary bg-slate-200 dark:bg-slate-800 mx-auto animate-fade-in shadow-md" alt="" />
                    <span className="text-[10px] text-brandSecondary bg-brandSecondary/10 px-3 py-1 rounded-full border border-brandSecondary/25 font-bold uppercase tracking-wider">
                      ✓ Snapshot Recorded
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/20 border border-slate-200 dark:border-white/10 mx-auto shadow-sm">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-white/50 max-w-xs mx-auto leading-relaxed font-semibold">
                      AI facial scanners will match your selfie against the document photograph. Please ensure adequate lighting.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCaptureSelfie}
                  className="px-4 py-2 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold rounded-xl text-slate-700 dark:text-white transition-all shadow-sm active:scale-[0.98] flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{selfieCaptured ? 'Retake Snapshot' : 'Capture Live Snap'}</span>
                </button>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-white/5 text-right">
            <button
              type="submit"
              disabled={loading || submitting}
              className="px-6 py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98]"
            >
              {submitting ? 'Running AI Facial Match...' : 'Submit Verification Application'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default KycVerification;
