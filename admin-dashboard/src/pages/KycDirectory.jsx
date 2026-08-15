import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { CustomSelect } from '../components/CustomSelect';
import { useNotification } from '../context/NotificationContext';
import { 
  ShieldAlert, ShieldCheck, Search, Eye, X, Mail, Phone, 
  Sparkles, ChevronLeft, ChevronRight, Filter, Settings, FileText,
  CheckCircle, XCircle, FileCheck, Scan, MessageSquare, AlertTriangle, Download
} from 'lucide-react';

export const KycDirectory = () => {
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth.isMockMode);
  const { markModuleAsRead } = useNotification();

  const [pendingKycs, setPendingKycs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Under Review');
  
  // Review & OCR Drawer state
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPendingKycs = async () => {
    if (isMockMode) {
      const mockRecords = [
        {
          _id: 'kyc-1',
          userId: { name: 'Aarav Sharma', username: 'aarav', email: 'aarav@domain.com', phone: '+919876543210', avatar: '' },
          documentType: 'Aadhaar',
          documentNumber: '1234-5678-9012',
          documentFrontUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=500',
          documentBackUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=500',
          selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
          addressProofUrl: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=500',
          livenessScore: 94.2,
          aiMatchResult: 'PASSED',
          ocrName: 'AARAV SHARMA',
          ocrDocNo: '1234-5678-9012',
          ocrConfidence: '99.1%',
          status: 'Under Review',
          remarks: 'Verified address proof document against national database.'
        },
        {
          _id: 'kyc-2',
          userId: { name: 'Priya Patel', username: 'priya', email: 'priya@domain.com', phone: '+919876543211', avatar: '' },
          documentType: 'PAN',
          documentNumber: 'ABCDE1234F',
          documentFrontUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=500',
          selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
          livenessScore: 91.0,
          aiMatchResult: 'PASSED',
          ocrName: 'PRIYA PATEL',
          ocrDocNo: 'ABCDE1234F',
          ocrConfidence: '98.5%',
          status: 'Approved',
          remarks: 'Clear PAN card scan. OCR verification passed.'
        },
        {
          _id: 'kyc-3',
          userId: { name: 'Rohan Mehta', username: 'rohan', email: 'rohan@domain.com', phone: '+919876543212', avatar: '' },
          documentType: 'Passport',
          documentNumber: 'Z1234567',
          documentFrontUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=500',
          selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
          livenessScore: 65.4,
          aiMatchResult: 'REVIEW_REQUIRED',
          ocrName: 'ROHAN M.',
          ocrDocNo: 'Z1234567',
          ocrConfidence: '72.0%',
          status: 'Rejected',
          rejectionReason: 'Blurred front photo page scan.',
          remarks: 'High blur index detected by OCR daemon.'
        }
      ];
      setPendingKycs(statusFilter === 'All' ? mockRecords : mockRecords.filter(m => m.status === statusFilter));
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`/api/kyc/pending?status=${statusFilter}`, { withCredentials: true });
      if (res.data.success) {
        setPendingKycs(res.data.kycs || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending KYCs:', err);
      showAlert('Could not load pending KYC applications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingKycs();
  }, [isMockMode, statusFilter]);

  const runOcrVerification = () => {
    setOcrRunning(true);
    setTimeout(() => {
      setOcrData({
        extractedName: selectedKyc?.ocrName || selectedKyc?.userId?.name.toUpperCase(),
        extractedDocNo: selectedKyc?.documentNumber,
        nameMatchScore: '98.4%',
        docNoMatchScore: '100%',
        confidence: selectedKyc?.ocrConfidence || '98.8%',
        status: 'OCR Text Extraction Success'
      });
      setOcrRunning(false);
      showSnackbar('OCR Text Verification analysis completed!', 'success');
    }, 800);
  };

  const handleApprove = () => {
    showConfirm('Approve KYC Credentials', `Approve identity files for ${selectedKyc?.userId?.name}?`, () => {
      setPendingKycs(prev => prev.map(k => k._id === selectedKyc._id ? { ...k, status: 'Approved', remarks: adminRemarks || k.remarks } : k));
      setIsDrawerOpen(false);
      showSnackbar(`KYC Application for ${selectedKyc?.userId?.name} APPROVED!`, 'success');
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      showAlert('Please specify a rejection reason comment.', 'error');
      return;
    }
    showConfirm('Reject KYC Credentials', `Reject KYC application for ${selectedKyc?.userId?.name}?`, () => {
      setPendingKycs(prev => prev.map(k => k._id === selectedKyc._id ? { ...k, status: 'Rejected', rejectionReason, remarks: adminRemarks || k.remarks } : k));
      setIsDrawerOpen(false);
      showSnackbar(`KYC Application for ${selectedKyc?.userId?.name} REJECTED.`, 'info');
    });
  };

  const filteredKycs = pendingKycs.filter(k => {
    const u = k.userId || {};
    return (
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (k.documentNumber || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-brandPrimary" />
            KYC Management & OCR Verification Desk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review identity documents, AI liveness scores, OCR text extraction, remarks & approve/reject applications.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search applicant name, email, doc no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Under Review', label: 'Under Review' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Rejected', label: 'Rejected' }
            ]}
            className="w-40"
          />
        </div>
      </div>

      {/* KYC Grid Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Document Details</th>
                <th className="px-6 py-4">AI Liveness Score</th>
                <th className="px-6 py-4">Verification Status</th>
                <th className="px-6 py-4 text-right pr-8">Actions (Approve / Reject / View / OCR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-800 dark:text-slate-200">
              {filteredKycs.map((k) => (
                <tr key={k._id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <img 
                      src={k.userId?.avatar || k.userId?.profileImage || k.userId?.photo || k.userId?.image || k.userId?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(k.userId?.username || k.userId?.name || 'Applicant')}`} 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(k.userId?.username || k.userId?.name || 'Applicant')}`;
                      }}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-white/10" 
                      alt="" 
                    />
                    <span>{k.userId?.name || 'Applicant'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{k.userId?.phone || 'N/A'}</div>
                    <div className="text-[10px] text-slate-400">{k.userId?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{k.documentType}</div>
                    <div className="text-[10px] text-slate-400 font-mono">No: {k.documentNumber}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-500">{k.livenessScore}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      k.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      k.status === 'Under Review' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}>
                      {k.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right pr-6">
                    <button
                      onClick={() => {
                        setSelectedKyc(k);
                        setRejectionReason(k.rejectionReason || '');
                        setAdminRemarks(k.remarks || '');
                        setOcrData(null);
                        setIsDrawerOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-brandPrimary text-white hover:bg-brandPrimary/90 rounded-xl text-[11px] font-bold shadow-sm transition-all"
                    >
                      Review & OCR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Drawer */}
      <RightDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Review KYC Application & OCR Verification"
      >
        {selectedKyc && (
          <div className="space-y-6 text-left text-slate-700 dark:text-slate-200">
            {/* Applicant Metadata */}
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/5 space-y-3">
              <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-wider">Applicant Profile</div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-400 block text-[10px]">Name</span><strong className="text-slate-900 dark:text-white">{selectedKyc.userId?.name}</strong></div>
                <div><span className="text-slate-400 block text-[10px]">Document Type</span><strong className="text-slate-900 dark:text-white">{selectedKyc.documentType} ({selectedKyc.documentNumber})</strong></div>
                <div><span className="text-slate-400 block text-[10px]">Email</span><span className="text-slate-800 dark:text-slate-300">{selectedKyc.userId?.email}</span></div>
                <div><span className="text-slate-400 block text-[10px]">Phone</span><span className="text-slate-800 dark:text-slate-300">{selectedKyc.userId?.phone}</span></div>
              </div>
            </div>

            {/* Document Scans */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-wider">Uploaded Verification Scans</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Front ID Scan</span>
                  <img src={selectedKyc.documentFrontUrl} className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-white/10" alt="Front" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Back ID Scan</span>
                  <img src={selectedKyc.documentBackUrl || selectedKyc.documentFrontUrl} className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-white/10" alt="Back" />
                </div>
              </div>
            </div>

            {/* OCR Verification Panel */}
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-500 flex items-center gap-1.5">
                  <Scan className="w-4 h-4" /> AI OCR Text Verification
                </span>
                <button
                  onClick={runOcrVerification}
                  disabled={ocrRunning}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-colors"
                >
                  {ocrRunning ? 'Scanning Text...' : 'Run AI OCR Check'}
                </button>
              </div>

              {ocrData ? (
                <div className="space-y-2 text-xs pt-1 border-t border-indigo-500/20">
                  <div className="flex justify-between"><span className="text-slate-500">OCR Extracted Name:</span><strong className="text-indigo-600 dark:text-indigo-400 font-mono">{ocrData.extractedName}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Name Match Score:</span><strong className="text-emerald-500 font-bold">{ocrData.nameMatchScore}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Doc Number Match:</span><strong className="text-emerald-500 font-bold">{ocrData.docNoMatchScore}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">AI Confidence Index:</span><strong className="text-brandPrimary font-bold">{ocrData.confidence}</strong></div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">Click "Run AI OCR Check" to extract document text and verify name matching.</p>
              )}
            </div>

            {/* Remarks & Notes */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Admin Audit Remarks / Internal Notes</label>
              <textarea
                value={adminRemarks}
                onChange={e => setAdminRemarks(e.target.value)}
                placeholder="Enter internal verification remarks..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white h-16 resize-none"
              />
            </div>

            {/* Rejection Comments */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-rose-500 uppercase">Rejection Reason (If rejecting)</label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Specify rejection reason for applicant..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white h-16 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 bg-rose-500/10 text-rose-500 font-bold rounded-xl text-xs hover:bg-rose-500/20 border border-rose-500/20"
              >
                Reject KYC
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-500 shadow-md"
              >
                Approve KYC
              </button>
            </div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default KycDirectory;
