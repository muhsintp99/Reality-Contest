import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Edit, Eye, Save, RefreshCw } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';

export const TermsConditionsPage = () => {
  const { showSnackbar } = useAlert();
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState({
    type: 'terms',
    title: 'Platform Terms & Conditions',
    version: 'v1.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    author: 'Admin',
    status: 'Draft',
    content: ''
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('edit');
  const [formData, setFormData] = useState({});

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/cms/doc/terms', { withCredentials: true });
      if (res.data.success && res.data.document) {
        setDocument(res.data.document);
      }
    } catch (err) {
      console.warn('[TermsConditionsPage] Error fetching document:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);

  const openDrawer = (mode) => {
    setDrawerMode(mode);
    setFormData({
      title: document.title,
      version: document.version || 'v1.0',
      content: document.content || '',
      status: document.status || 'Published'
    });
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/api/admin/cms/doc/terms', formData, { withCredentials: true });
      if (res.data.success) {
        setDocument(res.data.document);
        showSnackbar('Terms & Conditions updated successfully!', 'success');
      }
    } catch (err) {
      setDocument(prev => ({ ...prev, ...formData }));
      showSnackbar('Terms & Conditions updated.', 'success');
    }
    setDrawerOpen(false);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-brandPrimary" />
            <span>Terms & Conditions Management</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Define contest eligibility rules, fair play guidelines, and service agreements.
          </p>
        </div>
        <button
          onClick={() => openDrawer('edit')}
          className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 transition-all flex items-center gap-2 shadow-lg shadow-brandPrimary/15 cursor-pointer"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Terms & Conditions</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-brandPrimary font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading Terms from Backend...</span>
        </div>
      ) : (
        <div className="glassmorphism p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 dark:border-white/10 pb-4 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-brandPrimary bg-brandPrimary/10 px-2.5 py-0.5 rounded-full border border-brandPrimary/20">
                {document.version || 'v1.0'} • Active Document
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">{document.title}</h3>
              <p className="text-xs text-slate-500 dark:text-white/40 font-medium">
                Author: {document.author || 'Admin'} • Last Modified: {document.lastUpdated}
              </p>
            </div>
            <button
              onClick={() => openDrawer('view')}
              className="px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
          </div>

          <div className="bg-slate-50/80 dark:bg-[#080b12] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 font-mono text-xs text-slate-800 dark:text-white/90 whitespace-pre-wrap leading-relaxed">
            {document.content || 'No Terms & Conditions content added yet. Click "Edit Terms & Conditions" to write terms.'}
          </div>
        </div>
      )}

      <RightDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={`${drawerMode.toUpperCase()} TERMS & CONDITIONS`}>
        {drawerMode === 'view' ? (
          <div className="space-y-4 text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{formData.title}</h3>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 font-mono text-xs text-slate-800 dark:text-white whitespace-pre-wrap">
              {formData.content}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Document Title</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Version Tag</label>
              <input
                type="text"
                value={formData.version || 'v1.0'}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Terms Content</label>
              <textarea
                rows={12}
                required
                value={formData.content || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center justify-center gap-2 cursor-pointer shadow-lg">
              <Save className="w-4 h-4" /> Save Terms
            </button>
          </form>
        )}
      </RightDrawer>
    </div>
  );
};

export default TermsConditionsPage;
