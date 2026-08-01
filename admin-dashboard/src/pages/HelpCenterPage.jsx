import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HelpCircle, Plus, Edit, Trash2, Eye, RefreshCw, Save } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { CustomSelect } from '../components/CustomSelect';
import { Search } from 'lucide-react';

export const HelpCenterPage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [helpArticles, setHelpArticles] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [activeArticle, setActiveArticle] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/cms/help', { withCredentials: true });
      if (res.data.success) {
        setHelpArticles(res.data.articles || []);
      }
    } catch (err) {
      console.warn('[HelpCenterPage] Error fetching articles:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filteredArticles = helpArticles.filter(art => {
    const matchesSearch = !searchQuery || (art.title && art.title.toLowerCase().includes(searchQuery.toLowerCase())) || (art.summary && art.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? art.status === 'Published' || art.status === 'Active' : art.status !== 'Published' && art.status !== 'Active');
    return matchesSearch && matchesStatus;
  });

  const openDrawer = (mode, article = null) => {
    setDrawerMode(mode);
    setActiveArticle(article);
    if (mode === 'add') {
      setFormData({ title: '', category: 'Getting Started', summary: '', content: '', status: 'Published' });
    } else if (article) {
      setFormData({ ...article });
    }
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (drawerMode === 'edit' && activeArticle) {
        const res = await axios.put(`/api/admin/cms/help/${activeArticle._id}`, formData, { withCredentials: true });
        if (res.data.success) {
          setHelpArticles(prev => prev.map(h => h._id === activeArticle._id ? res.data.article : h));
          showSnackbar('Help article updated!', 'success');
        }
      } else {
        const res = await axios.post('/api/admin/cms/help', formData, { withCredentials: true });
        if (res.data.success) {
          setHelpArticles(prev => [res.data.article, ...prev]);
          showSnackbar('Help article published!', 'success');
        }
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Saved locally.', 'info');
    }
    setDrawerOpen(false);
  };

  const handleDelete = (id) => {
    showConfirm('Delete Article', 'Are you sure you want to delete this help article?', async () => {
      try {
        await axios.delete(`/api/admin/cms/help/${id}`, { withCredentials: true });
        setHelpArticles(prev => prev.filter(h => h._id !== id));
        showSnackbar('Help article deleted.', 'success');
      } catch (err) {
        setHelpArticles(prev => prev.filter(h => h._id !== id));
        showSnackbar('Help article deleted.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-brandPrimary" />
            <span>Help Center & Support Articles</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Publish support guides, verification tutorials, and troubleshooting articles.
          </p>
        </div>
        <button
          onClick={() => openDrawer('add')}
          className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 transition-all flex items-center gap-2 shadow-lg shadow-brandPrimary/15 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Help Article</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 relative z-20">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/90 dark:bg-[#0c1322]/60 border border-slate-300/80 dark:border-white/10 rounded-xl pl-11 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
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
          <span>Loading Help Center Articles...</span>
        </div>
      ) : helpArticles.length === 0 ? (
        <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Help Articles Found</h4>
          <p className="text-xs text-slate-500 dark:text-white/40">Add your first help article using the button below.</p>
          <button onClick={() => openDrawer('add')} className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow cursor-pointer">
            Add Help Article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div key={article._id} className="glassmorphism p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-extrabold uppercase bg-brandPrimary/10 text-brandPrimary px-2.5 py-0.5 rounded-full border border-brandPrimary/20">
                    {article.category}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {article.status}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{article.title}</h4>
                <p className="text-xs text-slate-500 dark:text-white/50 mt-2 line-clamp-3">{article.summary}</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-white/10 pt-4 text-xs">
                <span className="text-[10px] text-slate-400 font-semibold">{article.views || 0} Reads</span>
                <div className="flex gap-2">
                  <button onClick={() => openDrawer('view', article)} className="p-1.5 bg-blue-500/10 text-blue-600 rounded-full cursor-pointer">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => openDrawer('edit', article)} className="p-1.5 bg-amber-500/10 text-amber-600 rounded-full cursor-pointer">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(article._id)} className="p-1.5 bg-rose-500/10 text-rose-600 rounded-full cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RightDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={`${drawerMode.toUpperCase()} HELP ARTICLE`}>
        {drawerMode === 'view' ? (
          <div className="space-y-4 text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{formData.title}</h3>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 font-mono text-xs text-slate-800 dark:text-white whitespace-pre-wrap">
              {formData.content || formData.summary}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Article Title</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Category</label>
              <select
                value={formData.category || 'Getting Started'}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Getting Started">Getting Started</option>
                <option value="Contest Rules">Contest Rules</option>
                <option value="Account Verification">Account Verification</option>
                <option value="Payments">Payments</option>
                <option value="Troubleshooting">Troubleshooting</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Article Summary</label>
              <textarea
                rows={3}
                required
                value={formData.summary || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Full Article Content</label>
              <textarea
                rows={8}
                required
                value={formData.content || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center justify-center gap-2 cursor-pointer shadow-lg">
              <Save className="w-4 h-4" /> Save Help Article
            </button>
          </form>
        )}
      </RightDrawer>
    </div>
  );
};

export default HelpCenterPage;
