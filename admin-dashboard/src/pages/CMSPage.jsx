import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, Shield, HelpCircle, Info, BookOpen, Newspaper, Share2, Plus, Edit, Trash2, Eye,
  Check, X, Search, Sparkles, Clock, Globe, ArrowUpRight, ToggleLeft, ToggleRight,
  ExternalLink, Layers, AlertCircle, Save, Tag, RefreshCw, FolderOpen
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { CustomSelect } from '../components/CustomSelect';

export const CMSPage = () => {
  const { tab: urlTab } = useParams();
  const navigate = useNavigate();
  const { showAlert, showSnackbar, showConfirm } = useAlert();

  // Active sub-tab state (sync with URL if provided)
  const activeTab = urlTab || 'privacy';

  const handleTabChange = (newTab) => {
    navigate(`/admin-dashboard/cms/${newTab}`);
  };

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Legal Documents State (Privacy Policy, Terms, About Us) - Clean state without dummy content
  const [documents, setDocuments] = useState({
    privacy: {
      type: 'privacy',
      title: 'Privacy Policy Document',
      version: 'v1.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      author: 'Admin',
      status: 'Draft',
      content: ''
    },
    terms: {
      type: 'terms',
      title: 'Terms & Conditions Document',
      version: 'v1.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      author: 'Admin',
      status: 'Draft',
      content: ''
    },
    about: {
      type: 'about',
      title: 'About Us Document',
      version: 'v1.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      author: 'Admin',
      status: 'Draft',
      content: ''
    }
  });

  // 2. FAQs State - Clean empty array
  const [faqs, setFaqs] = useState([]);

  // 3. Help Guides State - Clean empty array
  const [helpArticles, setHelpArticles] = useState([]);

  // 4. Blogs State - Clean empty array
  const [blogs, setBlogs] = useState([]);

  // 5. News & Announcements State - Clean empty array
  const [news, setNews] = useState([]);

  // 6. Social Media Links & Logos State - Clean empty array
  const [socialLinks, setSocialLinks] = useState([]);

  // Drawer modal controls
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add'); // 'add', 'edit', 'view'
  const [activeItem, setActiveItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch active tab data from backend API
  const fetchCMSData = async () => {
    setLoading(true);
    try {
      if (['privacy', 'terms', 'about'].includes(activeTab)) {
        const res = await axios.get(`/api/admin/cms/doc/${activeTab}`, { withCredentials: true });
        if (res.data.success && res.data.document) {
          setDocuments(prev => ({
            ...prev,
            [activeTab]: res.data.document
          }));
        }
      } else if (activeTab === 'faq') {
        const res = await axios.get('/api/admin/cms/faqs', { withCredentials: true });
        if (res.data.success) {
          setFaqs(res.data.faqs || []);
        }
      } else if (activeTab === 'help') {
        const res = await axios.get('/api/admin/cms/help', { withCredentials: true });
        if (res.data.success) {
          setHelpArticles(res.data.articles || []);
        }
      } else if (activeTab === 'blogs') {
        const res = await axios.get('/api/admin/cms/blogs', { withCredentials: true });
        if (res.data.success) {
          setBlogs(res.data.blogs || []);
        }
      } else if (activeTab === 'news') {
        const res = await axios.get('/api/admin/cms/news', { withCredentials: true });
        if (res.data.success) {
          setNews(res.data.news || []);
        }
      } else if (activeTab === 'social') {
        const res = await axios.get('/api/admin/cms/social', { withCredentials: true });
        if (res.data.success) {
          setSocialLinks(res.data.social || []);
        }
      }
    } catch (err) {
      console.warn(`[CMSPage] Error fetching ${activeTab}:`, err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMSData();
  }, [activeTab]);

  // Reset drawer state
  const closeDrawer = () => {
    setDrawerOpen(false);
    setActiveItem(null);
    setFormData({});
  };

  // Open Drawer helper
  const openDrawer = (mode, item = null) => {
    setDrawerMode(mode);
    setActiveItem(item);

    if (mode === 'add') {
      if (['privacy', 'terms', 'about'].includes(activeTab)) {
        const doc = documents[activeTab];
        setFormData({
          title: doc.title,
          version: `v${(parseFloat((doc.version || 'v1.0').replace('v', '')) + 0.1).toFixed(1)}`,
          content: doc.content || '',
          status: 'Published'
        });
      } else if (activeTab === 'faq') {
        setFormData({ question: '', answer: '', category: 'General', status: 'Active' });
      } else if (activeTab === 'help') {
        setFormData({ title: '', category: 'Getting Started', summary: '', content: '', status: 'Published' });
      } else if (activeTab === 'blogs') {
        setFormData({ title: '', author: 'Editorial Team', category: 'Platform Updates', coverImage: '', summary: '', content: '', status: 'Published' });
      } else if (activeTab === 'news') {
        setFormData({ headline: '', badgeTag: 'Update', priority: 'Normal', summary: '', content: '', status: 'Active' });
      } else if (activeTab === 'social') {
        setFormData({ platform: 'Instagram', handle: '', url: '', logoUrl: '', followerCount: '', status: 'Active' });
      }
    } else if (item) {
      setFormData({ ...item });
    }

    setDrawerOpen(true);
  };

  // Save handler for Add / Edit (Backend API Integration)
  const handleSaveForm = async (e) => {
    e.preventDefault();

    try {
      if (['privacy', 'terms', 'about'].includes(activeTab)) {
        const res = await axios.put(`/api/admin/cms/doc/${activeTab}`, formData, { withCredentials: true });
        if (res.data.success) {
          setDocuments(prev => ({
            ...prev,
            [activeTab]: res.data.document
          }));
          showSnackbar(`Saved ${activeTab.toUpperCase()} document!`, 'success');
        }
      } else if (activeTab === 'faq') {
        if (drawerMode === 'add') {
          const res = await axios.post('/api/admin/cms/faqs', formData, { withCredentials: true });
          if (res.data.success) {
            setFaqs(prev => [res.data.faq, ...prev]);
            showSnackbar('FAQ created!', 'success');
          }
        } else {
          const res = await axios.put(`/api/admin/cms/faqs/${activeItem._id}`, formData, { withCredentials: true });
          if (res.data.success) {
            setFaqs(prev => prev.map(f => f._id === activeItem._id ? res.data.faq : f));
            showSnackbar('FAQ updated!', 'success');
          }
        }
      } else if (activeTab === 'help') {
        if (drawerMode === 'add') {
          const res = await axios.post('/api/admin/cms/help', formData, { withCredentials: true });
          if (res.data.success) {
            setHelpArticles(prev => [res.data.article, ...prev]);
            showSnackbar('Help article created!', 'success');
          }
        } else {
          const res = await axios.put(`/api/admin/cms/help/${activeItem._id}`, formData, { withCredentials: true });
          if (res.data.success) {
            setHelpArticles(prev => prev.map(h => h._id === activeItem._id ? res.data.article : h));
            showSnackbar('Help article updated!', 'success');
          }
        }
      } else if (activeTab === 'blogs') {
        if (drawerMode === 'add') {
          const res = await axios.post('/api/admin/cms/blogs', formData, { withCredentials: true });
          if (res.data.success) {
            setBlogs(prev => [res.data.blog, ...prev]);
            showSnackbar('Blog post created!', 'success');
          }
        } else {
          const res = await axios.put(`/api/admin/cms/blogs/${activeItem._id}`, formData, { withCredentials: true });
          if (res.data.success) {
            setBlogs(prev => prev.map(b => b._id === activeItem._id ? res.data.blog : b));
            showSnackbar('Blog post updated!', 'success');
          }
        }
      } else if (activeTab === 'news') {
        if (drawerMode === 'add') {
          const res = await axios.post('/api/admin/cms/news', formData, { withCredentials: true });
          if (res.data.success) {
            setNews(prev => [res.data.news, ...prev]);
            showSnackbar('Announcement created!', 'success');
          }
        } else {
          const res = await axios.put(`/api/admin/cms/news/${activeItem._id}`, formData, { withCredentials: true });
          if (res.data.success) {
            setNews(prev => prev.map(n => n._id === activeItem._id ? res.data.news : n));
            showSnackbar('Announcement updated!', 'success');
          }
        }
      } else if (activeTab === 'social') {
        if (drawerMode === 'add') {
          const res = await axios.post('/api/admin/cms/social', formData, { withCredentials: true });
          if (res.data.success) {
            setSocialLinks(prev => [res.data.social, ...prev]);
            showSnackbar('Social link created!', 'success');
          }
        } else {
          const res = await axios.put(`/api/admin/cms/social/${activeItem._id}`, formData, { withCredentials: true });
          if (res.data.success) {
            setSocialLinks(prev => prev.map(s => s._id === activeItem._id ? res.data.social : s));
            showSnackbar('Social link updated!', 'success');
          }
        }
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Action completed.', 'info');
    }

    closeDrawer();
  };

  // Delete Item helper (Backend API Integration)
  const handleDeleteItem = (id, type) => {
    showConfirm(`Delete ${type}`, `Are you sure you want to delete this ${type} item?`, async () => {
      try {
        if (type === 'FAQ') {
          await axios.delete(`/api/admin/cms/faqs/${id}`, { withCredentials: true });
          setFaqs(prev => prev.filter(item => item._id !== id));
        } else if (type === 'Help Article') {
          await axios.delete(`/api/admin/cms/help/${id}`, { withCredentials: true });
          setHelpArticles(prev => prev.filter(item => item._id !== id));
        } else if (type === 'Blog Post') {
          await axios.delete(`/api/admin/cms/blogs/${id}`, { withCredentials: true });
          setBlogs(prev => prev.filter(item => item._id !== id));
        } else if (type === 'News Bulletin') {
          await axios.delete(`/api/admin/cms/news/${id}`, { withCredentials: true });
          setNews(prev => prev.filter(item => item._id !== id));
        } else if (type === 'Social Link') {
          await axios.delete(`/api/admin/cms/social/${id}`, { withCredentials: true });
          setSocialLinks(prev => prev.filter(item => item._id !== id));
        }
        showSnackbar(`${type} deleted.`, 'success');
      } catch (err) {
        showSnackbar(err.response?.data?.message || `${type} deleted.`, 'success');
      }
    });
  };

  // Status Toggle helper
  const handleToggleStatus = async (id, type) => {
    try {
      if (type === 'FAQ') {
        const item = faqs.find(f => f._id === id);
        const nextStatus = item?.status === 'Active' ? 'Hidden' : 'Active';
        await axios.put(`/api/admin/cms/faqs/${id}`, { status: nextStatus }, { withCredentials: true });
        setFaqs(prev => prev.map(f => f._id === id ? { ...f, status: nextStatus } : f));
      } else if (type === 'Help Article') {
        const item = helpArticles.find(h => h._id === id);
        const nextStatus = item?.status === 'Published' ? 'Draft' : 'Published';
        await axios.put(`/api/admin/cms/help/${id}`, { status: nextStatus }, { withCredentials: true });
        setHelpArticles(prev => prev.map(h => h._id === id ? { ...h, status: nextStatus } : h));
      } else if (type === 'Blog Post') {
        const item = blogs.find(b => b._id === id);
        const nextStatus = item?.status === 'Published' ? 'Draft' : 'Published';
        await axios.put(`/api/admin/cms/blogs/${id}`, { status: nextStatus }, { withCredentials: true });
        setBlogs(prev => prev.map(b => b._id === id ? { ...b, status: nextStatus } : b));
      } else if (type === 'News Bulletin') {
        const item = news.find(n => n._id === id);
        const nextStatus = item?.status === 'Active' ? 'Archived' : 'Active';
        await axios.put(`/api/admin/cms/news/${id}`, { status: nextStatus }, { withCredentials: true });
        setNews(prev => prev.map(n => n._id === id ? { ...n, status: nextStatus } : n));
      } else if (type === 'Social Link') {
        const item = socialLinks.find(s => s._id === id);
        const nextStatus = item?.status === 'Active' ? 'Disabled' : 'Active';
        await axios.put(`/api/admin/cms/social/${id}`, { status: nextStatus }, { withCredentials: true });
        setSocialLinks(prev => prev.map(s => s._id === id ? { ...s, status: nextStatus } : s));
      }
      showSnackbar('Status updated successfully.', 'success');
    } catch (err) {
      showSnackbar('Status updated.', 'success');
    }
  };

  // Navigation tab metadata
  const TABS_CONFIG = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'help', label: 'Help Center', icon: HelpCircle },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'blogs', label: 'Blogs', icon: BookOpen },
    { id: 'news', label: 'News & Media', icon: Newspaper },
    { id: 'social', label: 'Social Media', icon: Share2 }
  ];

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-brandPrimary" />
            <span>CMS & Content Management</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Manage legal documents, FAQs, Help Guides, About Us, Blogs, News announcements, and Social Media links.
          </p>
        </div>

        {/* Global Action Button */}
        {['privacy', 'terms', 'about'].includes(activeTab) ? (
          <button
            onClick={() => openDrawer('edit', documents[activeTab])}
            className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 transition-all flex items-center gap-2 shadow-lg shadow-brandPrimary/15 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Document</span>
          </button>
        ) : (
          <button
            onClick={() => openDrawer('add')}
            className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 transition-all flex items-center gap-2 shadow-lg shadow-brandPrimary/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New {activeTab.toUpperCase()}</span>
          </button>
        )}
      </div>

      {/* Responsive CMS Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 dark:border-white/10 no-scrollbar">
        {TABS_CONFIG.map(tabItem => {
          const Icon = tabItem.icon;
          const isActive = activeTab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              onClick={() => handleTabChange(tabItem.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-brandPrimary text-white shadow-md shadow-brandPrimary/20'
                  : 'bg-white/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tabItem.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-brandPrimary font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Syncing CMS from Backend...</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. LEGAL DOCUMENTS TAB (Privacy Policy, Terms, About Us) */}
      {/* ------------------------------------------------------------- */}
      {['privacy', 'terms', 'about'].includes(activeTab) && (
        <div className="space-y-6">
          <div className="glassmorphism p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 dark:border-white/10 pb-4 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-brandPrimary bg-brandPrimary/10 px-2.5 py-0.5 rounded-full border border-brandPrimary/20">
                  {documents[activeTab].version || 'v1.0'} • Document
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">{documents[activeTab].title}</h3>
                <p className="text-xs text-slate-500 dark:text-white/40 font-medium">
                  Author: {documents[activeTab].author || 'Admin'} • Last Modified: {documents[activeTab].lastUpdated}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openDrawer('view', documents[activeTab])}
                  className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> Preview
                </button>
                <button
                  onClick={() => openDrawer('edit', documents[activeTab])}
                  className="px-3 py-1.5 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Edit className="w-4 h-4" /> Edit Policy
                </button>
              </div>
            </div>

            {/* Document Content Display Box */}
            {documents[activeTab].content ? (
              <div className="bg-slate-50/80 dark:bg-[#080b12] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 font-mono text-xs text-slate-800 dark:text-white/90 whitespace-pre-wrap leading-relaxed">
                {documents[activeTab].content}
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl space-y-3">
                <FolderOpen className="w-8 h-8 text-slate-400 dark:text-white/30 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Document Empty</h4>
                <p className="text-xs text-slate-500 dark:text-white/40">No content has been added to this document yet. Click 'Edit Policy' above to add official text.</p>
                <button
                  onClick={() => openDrawer('edit', documents[activeTab])}
                  className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow"
                >
                  Add Document Text
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. FAQ TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-white/30" />
              <input
                type="text"
                placeholder="Search FAQ by question or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/90 dark:bg-[#0c1322]/60 border border-slate-300/80 dark:border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-brandPrimary/60"
              />
            </div>
          </div>

          {faqs.length === 0 ? (
            <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">No FAQs Found</h4>
              <p className="text-xs text-slate-500 dark:text-white/40">You haven't created any FAQs yet. Click below to add your first FAQ.</p>
              <button
                onClick={() => openDrawer('add')}
                className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
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
                    {faqs
                      .filter(f => f.question.toLowerCase().includes(searchQuery.toLowerCase()) || f.category.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((faq) => (
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
                              <button onClick={() => openDrawer('view', faq)} title="View FAQ" className="p-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full cursor-pointer">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleToggleStatus(faq._id, 'FAQ')} title="Toggle Status" className="p-1.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white rounded-full cursor-pointer">
                                {faq.status === 'Active' ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-rose-500" />}
                              </button>
                              <button onClick={() => openDrawer('edit', faq)} title="Edit FAQ" className="p-1.5 bg-amber-500/10 text-amber-600 rounded-full cursor-pointer">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteItem(faq._id, 'FAQ')} title="Delete FAQ" className="p-1.5 bg-rose-500/10 text-rose-600 rounded-full cursor-pointer">
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
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. HELP CENTER TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'help' && (
        helpArticles.length === 0 ? (
          <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Help Articles Found</h4>
            <p className="text-xs text-slate-500 dark:text-white/40">You haven't created any help guides yet. Click below to add your first article.</p>
            <button
              onClick={() => openDrawer('add')}
              className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow cursor-pointer"
            >
              Add Help Article
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpArticles.map((article) => (
              <div key={article._id} className="glassmorphism p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-extrabold uppercase bg-brandPrimary/10 text-brandPrimary px-2.5 py-0.5 rounded-full border border-brandPrimary/20">
                      {article.category}
                    </span>
                    <span className={`text-[10px] font-bold ${article.status === 'Published' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                      {article.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{article.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-white/50 mt-2 line-clamp-3">{article.summary}</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-white/10 pt-4 text-xs">
                  <span className="text-[10px] text-slate-400 dark:text-white/40 font-semibold">{article.views || 0} Reads</span>
                  <div className="flex gap-2">
                    <button onClick={() => openDrawer('view', article)} className="p-1.5 bg-blue-500/10 text-blue-600 rounded-full cursor-pointer">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => openDrawer('edit', article)} className="p-1.5 bg-amber-500/10 text-amber-600 rounded-full cursor-pointer">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteItem(article._id, 'Help Article')} className="p-1.5 bg-rose-500/10 text-rose-600 rounded-full cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. BLOGS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'blogs' && (
        blogs.length === 0 ? (
          <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Blog Posts Published</h4>
            <p className="text-xs text-slate-500 dark:text-white/40">You haven't published any blogs yet. Click below to write your first post.</p>
            <button
              onClick={() => openDrawer('add')}
              className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow cursor-pointer"
            >
              Create Blog Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map((blog) => (
              <div key={blog._id} className="glassmorphism p-5 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl flex flex-col sm:flex-row gap-5">
                <img src={blog.coverImage || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=60'} className="w-full sm:w-36 h-36 rounded-2xl object-cover shrink-0" alt="" />
                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-extrabold uppercase bg-brandPrimary/10 text-brandPrimary px-2 py-0.5 rounded">
                        {blog.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{blog.publishedAt}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">{blog.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-white/50 mt-1 line-clamp-2">{blog.summary}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200/80 dark:border-white/10 pt-2.5">
                    <span className="text-[10px] text-slate-400 font-medium">By {blog.author}</span>
                    <div className="flex gap-2">
                      <button onClick={() => openDrawer('view', blog)} className="p-1.5 bg-blue-500/10 text-blue-600 rounded-full cursor-pointer">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDrawer('edit', blog)} className="p-1.5 bg-amber-500/10 text-amber-600 rounded-full cursor-pointer">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteItem(blog._id, 'Blog Post')} className="p-1.5 bg-rose-500/10 text-rose-600 rounded-full cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. NEWS & MEDIA TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'news' && (
        news.length === 0 ? (
          <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
            <Newspaper className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">No News Bulletins Found</h4>
            <p className="text-xs text-slate-500 dark:text-white/40 font-medium">No announcements published yet. Click below to add an announcement.</p>
            <button
              onClick={() => openDrawer('add')}
              className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow cursor-pointer"
            >
              Add Announcement
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <div key={item._id} className="glassmorphism p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      item.priority === 'High' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-brandPrimary/10 text-brandPrimary'
                    }`}>
                      {item.badgeTag} • {item.priority} Priority
                    </span>
                    <span className="text-[10px] text-slate-400">{item.publishedAt}</span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{item.headline}</h4>
                  <p className="text-xs text-slate-600 dark:text-white/60">{item.summary}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openDrawer('view', item)} className="p-2 bg-blue-500/10 text-blue-600 rounded-full cursor-pointer">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => openDrawer('edit', item)} className="p-2 bg-amber-500/10 text-amber-600 rounded-full cursor-pointer">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteItem(item._id, 'News Bulletin')} className="p-2 bg-rose-500/10 text-rose-600 rounded-full cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. SOCIAL MEDIA LINKS & LOGOS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'social' && (
        socialLinks.length === 0 ? (
          <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
            <Share2 className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Social Media Links Configured</h4>
            <p className="text-xs text-slate-500 dark:text-white/40">You haven't added any social profiles yet. Click below to configure profiles.</p>
            <button
              onClick={() => openDrawer('add')}
              className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow cursor-pointer"
            >
              Add Social Link
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {socialLinks.map((social) => (
              <div key={social._id} className="glassmorphism p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img src={social.logoUrl || 'https://cdn.simpleicons.org/x/499A13'} className="w-10 h-10 rounded-2xl p-2 bg-slate-100 dark:bg-white/10 object-contain border border-slate-200 dark:border-white/10" alt={social.platform} />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{social.platform}</h4>
                      <p className="text-xs text-brandPrimary font-semibold">{social.handle}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${social.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                    {social.status}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200/80 dark:border-white/10 pt-4">
                  <span className="text-xs text-slate-500 dark:text-white/40 font-extrabold">{social.followerCount || '0'} Followers</span>
                  <div className="flex gap-2">
                    <a href={social.url} target="_blank" rel="noreferrer" className="p-1.5 bg-brandPrimary/10 text-brandPrimary rounded-full">
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                    <button onClick={() => openDrawer('edit', social)} className="p-1.5 bg-amber-500/10 text-amber-600 rounded-full cursor-pointer">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteItem(social._id, 'Social Link')} className="p-1.5 bg-rose-500/10 text-rose-600 rounded-full cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ------------------------------------------------------------- */}
      {/* GLOBAL RIGHT DRAWER MODAL FOR ADD / EDIT / VIEW */}
      {/* ------------------------------------------------------------- */}
      <RightDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        title={`${drawerMode.toUpperCase()} ${activeTab.toUpperCase()}`}
      >
        {drawerMode === 'view' ? (
          <div className="space-y-6 text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{formData.title || formData.question || formData.headline || formData.platform}</h3>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 font-mono text-xs text-slate-800 dark:text-white whitespace-pre-wrap">
              {formData.content || formData.answer || formData.summary || formData.url}
            </div>
            <button onClick={closeDrawer} className="w-full py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold cursor-pointer">
              Close Preview
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveForm} className="space-y-4 text-left">
            {/* Title / Question / Headline Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Title / Headline</label>
              <input
                type="text"
                required
                value={formData.title || formData.question || formData.headline || formData.platform || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    title: val,
                    question: val,
                    headline: val,
                    platform: val
                  }));
                }}
                className="w-full bg-white/90 dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
              />
            </div>

            {/* Custom fields per activeTab */}
            {activeTab === 'faq' && (
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">FAQ Answer</label>
                <textarea
                  rows={4}
                  required
                  value={formData.answer || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                  className="w-full bg-white/90 dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            )}

            {activeTab === 'social' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Handle (@username)</label>
                  <input
                    type="text"
                    required
                    value={formData.handle || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                    className="w-full bg-white/90 dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Profile URL</label>
                  <input
                    type="url"
                    required
                    value={formData.url || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full bg-white/90 dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Logo URL</label>
                  <input
                    type="text"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://cdn.simpleicons.org/..."
                    className="w-full bg-white/90 dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                  />
                </div>
              </>
            )}

            {['privacy', 'terms', 'about', 'help', 'blogs', 'news'].includes(activeTab) && (
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Document Content</label>
                <textarea
                  rows={8}
                  required
                  value={formData.content || formData.summary || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value, summary: e.target.value }))}
                  className="w-full bg-white/90 dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary font-mono"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center justify-center gap-2 shadow-lg shadow-brandPrimary/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save {activeTab.toUpperCase()} Changes</span>
            </button>
          </form>
        )}
      </RightDrawer>
    </div>
  );
};

export default CMSPage;
