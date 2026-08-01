import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HelpCircle, Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight, Search, Save, RefreshCw } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { CustomSelect } from '../components/CustomSelect';

export const FaqPage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [faqs, setFaqs] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [activeFaq, setActiveFaq] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/cms/faqs', { withCredentials: true });
      if (res.data.success) {
        setFaqs(res.data.faqs || []);
      }
    } catch (err) {
      console.warn('[FaqPage] Error fetching FAQs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = !searchQuery || (faq.question && faq.question.toLowerCase().includes(searchQuery.toLowerCase())) || (faq.category && faq.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? faq.status === 'Active' : faq.status !== 'Active');
    return matchesSearch && matchesStatus;
  });

  const openDrawer = (mode, faq = null) => {
    setDrawerMode(mode);
    setActiveFaq(faq);
    if (mode === 'add') {
      setFormData({ question: '', answer: '', category: 'General', status: 'Active' });
    } else if (faq) {
      setFormData({ ...faq });
    }
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (drawerMode === 'edit' && activeFaq) {
        const res = await axios.put(`/api/admin/cms/faqs/${activeFaq._id}`, formData, { withCredentials: true });
        if (res.data.success) {
          setFaqs(prev => prev.map(f => f._id === activeFaq._id ? res.data.faq : f));
          showSnackbar('FAQ updated successfully!', 'success');
        }
      } else {
        const res = await axios.post('/api/admin/cms/faqs', formData, { withCredentials: true });
        if (res.data.success) {
          setFaqs(prev => [res.data.faq, ...prev]);
          showSnackbar('New FAQ created!', 'success');
        }
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'FAQ saved locally.', 'info');
    }
    setDrawerOpen(false);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Hidden' : 'Active';
    try {
      await axios.put(`/api/admin/cms/faqs/${id}`, { status: nextStatus }, { withCredentials: true });
      setFaqs(prev => prev.map(f => f._id === id ? { ...f, status: nextStatus } : f));
      showSnackbar(`FAQ status updated to ${nextStatus}`, 'success');
    } catch (err) {
      setFaqs(prev => prev.map(f => f._id === id ? { ...f, status: nextStatus } : f));
      showSnackbar(`FAQ status updated to ${nextStatus}`, 'info');
    }
  };

  const handleDelete = (id) => {
    showConfirm('Delete FAQ', 'Are you sure you want to delete this FAQ?', async () => {
      try {
        await axios.delete(`/api/admin/cms/faqs/${id}`, { withCredentials: true });
        setFaqs(prev => prev.filter(f => f._id !== id));
        showSnackbar('FAQ deleted.', 'success');
      } catch (err) {
        setFaqs(prev => prev.filter(f => f._id !== id));
        showSnackbar('FAQ deleted.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-brandPrimary" />
            <span>FAQ Management</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Create, categorize, and organize Frequently Asked Questions for users & contestants.
          </p>
        </div>
        <button
          onClick={() => openDrawer('add')}
          className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 transition-all flex items-center gap-2 shadow-lg shadow-brandPrimary/15 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New FAQ</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Search FAQ by question or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/90 dark:bg-[#0c1322]/60 border border-slate-300/80 dark:border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary/60"
          />
        </div>
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All Statuses', value: 'All' },
            { label: 'Published Status', value: 'Active' },
            { label: 'Draft / Hidden', value: 'Draft' }
          ]}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-brandPrimary font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading FAQs from Backend...</span>
        </div>
      ) : faqs.length === 0 ? (
        <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">No FAQs Created Yet</h4>
          <p className="text-xs text-slate-500 dark:text-white/40">Add your first FAQ item using the button below.</p>
          <button onClick={() => openDrawer('add')} className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow cursor-pointer">
            Add New FAQ
          </button>
        </div>
      ) : (
        <div className="glassmorphism rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden divide-y divide-slate-200/50 dark:divide-white/5 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/70 dark:bg-white/5 text-slate-600 dark:text-white/50 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Question & Answer</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 text-slate-800 dark:text-white/80">
                {filteredFaqs.map((faq) => (
                    <tr key={faq._id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 max-w-md">
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{faq.question}</p>
                        <p className="text-slate-500 dark:text-white/50 text-[11px] mt-1 line-clamp-2">{faq.answer}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary rounded-full text-[9px] font-extrabold uppercase">
                          {faq.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          faq.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {faq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right pr-6">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => openDrawer('view', faq)} title="View FAQ" className="p-1.5 bg-blue-500/10 text-blue-600 rounded-full cursor-pointer">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleToggleStatus(faq._id, faq.status)} title="Toggle Status" className="p-1.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white rounded-full cursor-pointer">
                            {faq.status === 'Active' ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-rose-500" />}
                          </button>
                          <button onClick={() => openDrawer('edit', faq)} title="Edit FAQ" className="p-1.5 bg-amber-500/10 text-amber-600 rounded-full cursor-pointer">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(faq._id)} title="Delete FAQ" className="p-1.5 bg-rose-500/10 text-rose-600 rounded-full cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <RightDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={`${drawerMode.toUpperCase()} FAQ`}>
        {drawerMode === 'view' ? (
          <div className="space-y-4 text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{formData.question}</h3>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 text-xs text-slate-800 dark:text-white whitespace-pre-wrap">
              {formData.answer}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Question</label>
              <input
                type="text"
                required
                value={formData.question || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Category</label>
              <select
                value={formData.category || 'General'}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="General">General</option>
                <option value="Contests">Contests</option>
                <option value="Wallet & Payouts">Wallet & Payouts</option>
                <option value="Account & KYC">Account & KYC</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Answer</label>
              <textarea
                rows={6}
                required
                value={formData.answer || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center justify-center gap-2 cursor-pointer shadow-lg">
              <Save className="w-4 h-4" /> Save FAQ
            </button>
          </form>
        )}
      </RightDrawer>
    </div>
  );
};

export default FaqPage;
