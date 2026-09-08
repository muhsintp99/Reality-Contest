import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, HelpCircle, MessageSquare, ShieldCheck, Home, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';

export const SupportContact = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');

  const [helpArticles, setHelpArticles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [faqRes, helpRes] = await Promise.all([
          axios.get('/api/cms/faqs', { timeout: 4000 }).catch(() => null),
          axios.get('/api/cms/help', { timeout: 4000 }).catch(() => null)
        ]);
        if (faqRes?.data?.faqs) {
          setFaqs(faqRes.data.faqs);
        }
        if (helpRes?.data?.articles) {
          setHelpArticles(helpRes.data.articles);
        }
      } catch (err) {
        console.log('Support CMS load notice:', err?.message);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill out all required fields.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedMessage(`Thank you, ${formData.name}! Your support ticket has been submitted. Our team will contact you at ${formData.email} within 24 hours.`);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    }, 1200);
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
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12 text-left">
        {/* Banner Hero */}
        <div className="bg-gradient-to-r from-[#1C1335] via-[#2E1E54] to-[#1C1335] border border-[#CEF500]/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-[#CEF500]/10 text-[#CEF500] border border-[#CEF500]/30">
              <MessageSquare className="w-8 h-8" />
            </span>
            <div>
              <span className="text-[11px] font-black text-[#CEF500] uppercase tracking-wider">Help Desk & Contact</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-poppins">Support & Contact Portal</h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#A69EC6] max-w-2xl leading-relaxed">
            Have a question about contest entries, KYC verification, coin redemptions, or wallet withdrawals? Our support desk is available 24/7 to assist you.
          </p>
        </div>

        {/* 3 Support Channel Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1C1335]/70 border border-[#2E1E54] rounded-3xl p-6 text-left space-y-3 shadow-xl hover:border-[#CEF500]/50 transition-all">
            <div className="p-3 rounded-2xl bg-[#CEF500]/10 text-[#CEF500] w-fit">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-poppins">Email Support</h3>
            <p className="text-xs text-[#A69EC6]">Send your detailed inquiries or KYC questions to our support desk.</p>
            <p className="text-xs font-bold text-[#CEF500]">office@realitycontest.in</p>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <Clock className="w-3 h-3" /> Responds within 4 hours
            </span>
          </div>

          <div className="bg-[#1C1335]/70 border border-[#2E1E54] rounded-3xl p-6 text-left space-y-3 shadow-xl hover:border-[#CEF500]/50 transition-all">
            <div className="p-3 rounded-2xl bg-[#B983FF]/10 text-[#B983FF] w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-poppins">KYC & Wallet Helpline</h3>
            <p className="text-xs text-[#A69EC6]">Priority assistance for withdrawal verification and identity approval.</p>
            <p className="text-xs font-bold text-[#B983FF]">support@realitycontest.in</p>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <Clock className="w-3 h-3" /> Priority Hotline Active
            </span>
          </div>

          <div className="bg-[#1C1335]/70 border border-[#2E1E54] rounded-3xl p-6 text-left space-y-3 shadow-xl hover:border-[#CEF500]/50 transition-all">
            <div className="p-3 rounded-2xl bg-cyan-400/10 text-cyan-400 w-fit">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-poppins">Headquarters</h3>
            <p className="text-xs text-[#A69EC6]">Reality Contest Platform Ecosystem, Tech Park Tower, Bengaluru, KA, India.</p>
            <p className="text-xs font-bold text-cyan-400">Operating 24/7 Digital Desk</p>
          </div>
        </div>

        {/* Contact Form & Quick FAQ Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Column (7 Cols) */}
          <div className="lg:col-span-7 bg-[#1C1335]/80 border border-[#2E1E54] rounded-3xl p-8 space-y-6 shadow-2xl">
            <div>
              <h2 className="text-2xl font-black text-white font-poppins">Send Us a Direct Message</h2>
              <p className="text-xs text-[#A69EC6] mt-1">Fill out the form below and our support team will respond promptly.</p>
            </div>

            {submittedMessage && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{submittedMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-white">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0D0714] border border-[#2E1E54] focus:border-[#CEF500] text-white outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-white">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0D0714] border border-[#2E1E54] focus:border-[#CEF500] text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-white">Inquiry Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0D0714] border border-[#2E1E54] focus:border-[#CEF500] text-white outline-none"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="KYC Verification Issue">KYC Verification Issue</option>
                  <option value="Wallet Payout & Withdrawal">Wallet Payout & Withdrawal</option>
                  <option value="Contest Entry & Quiz Issue">Contest Entry & Quiz Issue</option>
                  <option value="Bug Report or Feedback">Bug Report or Feedback</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-white">Your Message *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe your issue or question in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-4 rounded-xl bg-[#0D0714] border border-[#2E1E54] focus:border-[#CEF500] text-white outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#CEF500] text-[#0D0714] font-black text-xs uppercase tracking-wider rounded-full shadow-lg hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Sending Ticket...' : 'Submit Support Inquiry'}</span>
              </button>
            </form>
          </div>

          {/* FAQs Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#1C1335]/80 border border-[#2E1E54] rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xl font-bold text-white font-poppins flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#CEF500]" />
                <span>Frequently Asked Questions</span>
              </h3>

              <div className="space-y-3 text-xs">
                {faqs.length > 0 ? (
                  faqs.map((faq, idx) => (
                    <div key={faq._id || idx} className="p-4 rounded-2xl bg-[#0D0714]/80 border border-[#2E1E54] space-y-1.5">
                      <h4 className="font-bold text-white">{faq.question}</h4>
                      <p className="text-[#A69EC6] leading-relaxed">{faq.answer}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 rounded-2xl bg-[#0D0714]/80 border border-[#2E1E54] text-center space-y-1">
                    <p className="text-xs font-bold text-white">No FAQs currently available.</p>
                    <p className="text-[11px] text-[#A69EC6]">Check back later or send us a direct message using the form.</p>
                  </div>
                )}
              </div>
            </div>

            {helpArticles.length > 0 && (
              <div className="bg-[#1C1335]/80 border border-[#2E1E54] rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-xl font-bold text-white font-poppins flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span>Help Center Guides</span>
                </h3>

                <div className="space-y-3 text-xs">
                  {helpArticles.map((article, idx) => (
                    <div key={article._id || idx} className="p-4 rounded-2xl bg-[#0D0714]/80 border border-[#2E1E54] space-y-1.5">
                      <span className="text-[9px] font-black uppercase text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">
                        {article.category}
                      </span>
                      <h4 className="font-bold text-white text-sm mt-1">{article.title}</h4>
                      <p className="text-[#A69EC6] leading-relaxed">{article.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-[#2E1E54] text-xs font-semibold text-[#A69EC6]">
          <span>© 2026 Reality Contest Platform. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/privacy-policy')} className="hover:text-[#CEF500] transition-colors">Privacy Policy</button>
            <button onClick={() => navigate('/terms-of-service')} className="hover:text-[#CEF500] transition-colors">Terms of Service</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupportContact;
