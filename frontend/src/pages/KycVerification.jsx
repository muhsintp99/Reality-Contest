import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { Shield, UploadCloud, Camera, CheckCircle2, AlertTriangle, RefreshCw, UserCheck } from 'lucide-react';
import axios from 'axios';

export const KycVerification = () => {
  const { user, currentKyc, uploadKyc, fetchKycStatus, loading, isMockMode } = useAuthStore();
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
    fetchKycStatus();
  }, []);

  const handleSelectDocClick = () => {
    if (isMockMode) {
      setDocFileSelected(true);
      setDocFileName(`${docType.toLowerCase()}_identity_scan.jpg`);
    } else {
      fileInputRef.current?.click();
    }
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

  const handleCaptureMockSelfie = () => {
    setSelfieCaptured(true);
    const rand = Math.floor(Math.random() * 100);
    setSelfieUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=Selfie-${rand}`);
  };

  const handleSubmitKyc = async (e) => {
    e.preventDefault();
    if (!docFileSelected || !selfieCaptured) {
      alert('Please upload your document file and capture a liveness selfie.');
      return;
    }
    
    setSubmitting(true);
    const success = await uploadKyc({
      documentType: docType,
      documentNumber: docNum,
      documentFrontUrl: isMockMode ? `https://storage.realitycontest.in/uploads/${docFileName}` : realDocUrl,
      selfieUrl: selfieUrl
    });
    setSubmitting(false);

    if (success) {
      alert('KYC submitted! AI systems have run a baseline face match check.');
    }
  };

  if (currentKyc) {
    const isApproved = currentKyc.status === 'Approved';
    const isRejected = currentKyc.status === 'Rejected';
    const isReview = currentKyc.status === 'Under Review';

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold font-poppins text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span>KYC Verification Dashboard</span>
          </h2>
          <p className="text-xs text-white/50">View your identity verification status and AI matching analytics.</p>
        </div>

        <div className="glassmorphism p-8 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white/5 border border-white/5 rounded-xl mb-8">
            <div>
              <span className="text-xs font-semibold text-white/40 block mb-1">Verification Status</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  isRejected ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {currentKyc.status}
                </span>
                {isApproved && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isRejected && <AlertTriangle className="w-4 h-4 text-red-400" />}
                {isReview && <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />}
              </div>
            </div>
            {isApproved && (
              <span className="text-xs text-emerald-400/80 bg-emerald-500/10 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Full Platform Access Granted
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">AI Verification Ledger</h3>
              
              <div className="p-4 bg-[#080b12]/50 border border-white/5 rounded-xl space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">Biometric Liveness Index:</span>
                  <span className={`font-bold ${currentKyc.livenessScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {currentKyc.livenessScore}% Matching
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" 
                    style={{ width: `${currentKyc.livenessScore}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3.5">
                  <span className="text-white/60">AI Facial Match Verdict:</span>
                  <span className={`font-semibold px-2 py-0.5 rounded text-[11px] font-bold ${
                    currentKyc.aiMatchResult === 'PASSED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {currentKyc.aiMatchResult}
                  </span>
                </div>
              </div>

              {isRejected && currentKyc.rejectionReason && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                  <span className="font-bold block mb-1">Rejection Reason:</span>
                  {currentKyc.rejectionReason}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Uploaded Credentials</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center space-y-2">
                  <span className="text-[10px] text-white/50 block font-semibold uppercase">{currentKyc.documentType} Card</span>
                  <div className="w-full h-24 bg-black/40 rounded-lg flex items-center justify-center border border-white/5 text-xs text-white/40">
                    Scan Uploaded
                  </div>
                  <span className="text-[11px] font-semibold text-white/60 block truncate">
                    Number: ••••{currentKyc.documentNumber.slice(-4)}
                  </span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center space-y-2">
                  <span className="text-[10px] text-white/50 block font-semibold uppercase">Liveness Selfie</span>
                  <img src={currentKyc.selfieUrl} className="w-full h-24 object-cover rounded-lg border border-white/5" alt="" />
                  <span className="text-[11px] text-white/60 block font-medium">Selfie Captured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-poppins text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <span>Identity KYC Center</span>
        </h2>
        <p className="text-xs text-white/50">Submit government IDs and liveness selfies. Required for contestant smart-contract payouts.</p>
      </div>

      <div className="glassmorphism p-8 rounded-2xl border border-white/10">
        <form onSubmit={handleSubmitKyc} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                  Document Type Selection
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="Aadhaar">Aadhaar Card (India)</option>
                  <option value="PAN">PAN Card (India)</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                  Document Registration Number
                </label>
                <input
                  type="text"
                  required
                  value={docNum}
                  onChange={(e) => setDocNum(e.target.value)}
                  placeholder={`Enter your ${docType} number`}
                  className="block w-full px-4 py-2.5 bg-[#080b12]/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
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
                  className="border-2 border-dashed border-white/10 hover:border-purple-500/50 bg-[#080b12]/30 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2.5"
                >
                  <UploadCloud className="w-8 h-8 text-white/40 mx-auto" />
                  <div>
                    <span className="text-xs text-purple-400 font-semibold hover:text-purple-300">
                      {uploadingFile ? 'Uploading file...' : 'Click to import files'}
                    </span>
                    <p className="text-[10px] text-white/40">JPEG, PNG or PDF up to 5MB</p>
                  </div>
                  {docFileSelected && (
                    <div className="text-xs bg-purple-500/10 text-purple-400 p-2 rounded-lg border border-purple-500/20 font-bold truncate">
                      ✓ {docFileName}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                Biometric Selfie Capture (Liveness Check)
              </label>
              
              <div className="bg-black/50 border border-white/5 rounded-2xl p-6 text-center space-y-4 flex flex-col justify-center items-center min-h-[250px]">
                {selfieCaptured ? (
                  <div className="space-y-4">
                    <img src={selfieUrl} className="w-28 h-28 rounded-full object-cover border-2 border-cyan-400 bg-surfaceDark mx-auto animate-fade-in" alt="" />
                    <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                      ✓ Snapshot Recorded
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/30 border border-white/10 mx-auto">
                      <Camera className="w-7 h-7" />
                    </div>
                    <p className="text-xs text-white/50 max-w-xs mx-auto">
                      AI facial scanners will match your selfie against the document photograph. Please ensure adequate lighting.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCaptureMockSelfie}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{selfieCaptured ? 'Retake Selfie' : 'Capture Live Snap'}</span>
                </button>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-white/5 text-right">
            <button
              type="submit"
              disabled={loading || submitting}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-purple-500/10"
            >
              {submitting ? 'Running AI Facial Match...' : 'Submit Verification Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default KycVerification;
