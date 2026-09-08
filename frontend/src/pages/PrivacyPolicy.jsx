import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Home, Lock, Eye, FileText, CheckCircle, Mail, Globe, Printer } from 'lucide-react';
import axios from 'axios';

export const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [doc, setDoc] = useState({
    title: 'Privacy Policy',
    lastUpdated: 'September 2026',
    version: 'v1.0',
    content: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await axios.get('/api/cms/privacy', { timeout: 4000 });
        if (res.data?.document) {
          const loadedDoc = res.data.document;
          setDoc({
            title: loadedDoc.title || 'Privacy Policy',
            lastUpdated: loadedDoc.lastUpdated || 'September 2026',
            version: loadedDoc.version || 'v1.0',
            content: (loadedDoc.content && loadedDoc.content.trim() !== '') ? loadedDoc.content : ''
          });
        }
      } catch (err) {
        console.log('Privacy Policy CMS load info:', err?.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0D0714] text-slate-200 font-sans selection:bg-[#CEF500] selection:text-[#0D0714]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#1C1335]/90 backdrop-blur-xl border-b border-[#2E1E54]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/haka_favicon.png" alt="HAKA Logo" className="w-10 h-10 object-contain rounded-xl" />
            <span className="text-xl font-extrabold text-white font-poppins tracking-tight">
              Reality Contest <span className="text-[#CEF500]">Platform</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-full bg-[#2E1E54]/60 hover:bg-[#CEF500] hover:text-[#0D0714] text-xs font-bold text-white transition-all flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-full bg-[#2E1E54]/60 hover:bg-white/10 text-white text-xs transition-all"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Banner Hero */}
        <div className="bg-gradient-to-r from-[#1C1335] via-[#2E1E54] to-[#1C1335] border border-[#CEF500]/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-left space-y-4">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-[#CEF500]/10 text-[#CEF500] border border-[#CEF500]/30">
              <ShieldCheck className="w-8 h-8" />
            </span>
            <div>
              <span className="text-[11px] font-black text-[#CEF500] uppercase tracking-wider">Legal Compliance</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-poppins">{doc.title || 'Privacy Policy'}</h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#A69EC6] max-w-2xl leading-relaxed">
            Your privacy, security, and data transparency are paramount at Reality Contest Platform. Learn how we safeguard your personal information, KYC details, and rewards.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-white/70 font-semibold border-t border-white/10">
            <span>Version: <strong className="text-[#CEF500]">{doc.version || 'v1.0'}</strong></span>
            <span>Status: <strong className="text-emerald-400">Official & Verified</strong></span>
          </div>
        </div>

        {/* Policy Body */}
        <div className="bg-[#1C1335]/70 border border-[#2E1E54] rounded-3xl p-8 sm:p-10 text-left space-y-8 shadow-xl">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#CEF500]/30 border-t-[#CEF500] mx-auto" />
              <p className="text-xs font-bold text-white/70">Loading Privacy Policy...</p>
            </div>
          ) : doc.content ? (
            <div
              className="prose prose-invert max-w-none text-[#A69EC6] text-sm leading-relaxed space-y-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:font-poppins [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-[#CEF500] [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:text-white"
              dangerouslySetInnerHTML={{ __html: doc.content }}
            />
          ) : (
            <div className="py-12 px-6 text-center space-y-2 bg-[#0D0714]/60 border border-[#2E1E54] rounded-2xl">
              <p className="text-sm font-bold text-white">No official Privacy Policy document currently published.</p>
              <p className="text-xs text-[#A69EC6]">Document content can be managed and published directly from the admin dashboard.</p>
            </div>
          )}
        </div>

        {/* Page Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-[#2E1E54] text-xs font-semibold text-[#A69EC6]">
          <span>© 2026 Reality Contest Platform. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/terms-of-service')} className="hover:text-[#CEF500] transition-colors">Terms of Service</button>
            <button onClick={() => navigate('/support-contact')} className="hover:text-[#CEF500] transition-colors">Support & Contact</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
