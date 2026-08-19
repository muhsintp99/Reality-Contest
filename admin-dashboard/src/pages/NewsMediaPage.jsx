import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Newspaper, Plus, Edit, Trash2, Eye, RefreshCw, Save, Image as ImageIcon, ExternalLink, Globe } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { FileUploadPicker, uploadPendingFile } from '../components/FileUploadPicker';
import { RichTextEditor } from '../components/RichTextEditor';

export const NewsMediaPage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [news, setNews] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [activeNews, setActiveNews] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/cms/news', { withCredentials: true });
      if (res.data.success) {
        setNews(res.data.news || []);
      }
    } catch (err) {
      console.warn('[NewsMediaPage] Error fetching news:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const openDrawer = (mode, item = null) => {
    setDrawerMode(mode);
    setActiveNews(item);
    if (mode === 'add') {
      setFormData({
        headline: '',
        badgeTag: 'Update',
        priority: 'Normal',
        publisher: 'Platform Press',
        externalUrl: '',
        imageUrl: '',
        videoUrl: '',
        summary: '',
        content: '',
        status: 'Active'
      });
    } else if (item) {
      setFormData({ ...item, imageUrl: item.imageUrl || item.coverImage || '' });
    }
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Upload pending Base64 image file to disk (/uploads/news/...)
      const uploadedImgUrl = await uploadPendingFile(formData.imageUrl, 'news');
      const finalImageUrl = uploadedImgUrl || formData.imageUrl || '';

      const payload = {
        ...formData,
        imageUrl: finalImageUrl,
        coverImage: finalImageUrl,
        content: formData.content || formData.summary || ''
      };

      if (drawerMode === 'edit' && activeNews) {
        const res = await axios.put(`/api/admin/cms/news/${activeNews._id}`, payload, { withCredentials: true });
        if (res.data.success) {
          setNews(prev => prev.map(n => n._id === activeNews._id ? res.data.news : n));
          showSnackbar('News announcement updated successfully!', 'success');
        }
      } else {
        const res = await axios.post('/api/admin/cms/news', payload, { withCredentials: true });
        if (res.data.success) {
          setNews(prev => [res.data.news, ...prev]);
          showSnackbar('News announcement created successfully!', 'success');
        }
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to save announcement.', 'error');
    } finally {
      setSaving(false);
      setDrawerOpen(false);
    }
  };

  const handleDelete = (id) => {
    showConfirm('Delete Announcement', 'Are you sure you want to delete this announcement?', async () => {
      try {
        await axios.delete(`/api/admin/cms/news/${id}`, { withCredentials: true });
        setNews(prev => prev.filter(n => n._id !== id));
        showSnackbar('Announcement deleted.', 'success');
      } catch (err) {
        setNews(prev => prev.filter(n => n._id !== id));
        showSnackbar('Announcement deleted.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-brandPrimary" />
            <span>News & Media Announcements</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Publish press releases, system updates, media coverage links, and cover images.
          </p>
        </div>
        <button
          onClick={() => openDrawer('add')}
          className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 transition-all flex items-center gap-2 shadow-lg shadow-brandPrimary/15 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add News / Media</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-brandPrimary font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading News Bulletins...</span>
        </div>
      ) : news.length === 0 ? (
        <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
          <Newspaper className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">No News Announcements Found</h4>
          <p className="text-xs text-slate-500 dark:text-white/40">Publish your first news release or media coverage using the button below.</p>
          <button onClick={() => openDrawer('add')} className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow cursor-pointer">
            Add News / Media
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <div key={item._id} className="glassmorphism p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {(item.imageUrl || item.coverImage) && (
                <img
                  src={item.imageUrl || item.coverImage}
                  alt={item.headline}
                  className="w-full md:w-36 h-28 object-cover rounded-2xl border border-slate-200 dark:border-white/10 shrink-0"
                />
              )}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                    item.priority === 'High' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-brandPrimary/10 text-brandPrimary'
                  }`}>
                    {item.badgeTag || 'Update'} • {item.priority || 'Normal'} Priority
                  </span>
                  {item.publisher && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/80 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-brandPrimary" />
                      {item.publisher}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">{item.publishedAt}</span>
                </div>

                <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{item.headline}</h4>
                <p className="text-xs text-slate-600 dark:text-white/60 line-clamp-2">{item.summary}</p>

                {item.externalUrl && (
                  <div className="pt-1">
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brandPrimary font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Read Media Article</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-2 shrink-0 self-end md:self-center">
                <button onClick={() => openDrawer('view', item)} className="p-2 bg-blue-500/10 text-blue-600 rounded-full cursor-pointer">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => openDrawer('edit', item)} className="p-2 bg-amber-500/10 text-amber-600 rounded-full cursor-pointer">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item._id)} className="p-2 bg-rose-500/10 text-rose-600 rounded-full cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RightDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={`${drawerMode.toUpperCase()} ANNOUNCEMENT`}>
        {drawerMode === 'view' ? (
          <div className="space-y-4 text-left">
            {(formData.imageUrl || formData.coverImage) && (
              <img
                src={formData.imageUrl || formData.coverImage}
                alt={formData.headline}
                className="w-full h-44 object-cover rounded-2xl border border-slate-200 dark:border-white/10"
              />
            )}
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{formData.headline}</h3>
            {formData.publisher && (
              <p className="text-xs text-brandPrimary font-semibold">Publisher: {formData.publisher}</p>
            )}
            <div
              className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 text-xs text-slate-800 dark:text-white whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formData.content || formData.summary || '' }}
            />
            {formData.externalUrl && (
              <a href={formData.externalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-brandPrimary font-bold underline">
                <span>View Full External Article</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-left">
            {/* 1. Headline */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Headline / Title</label>
              <input
                type="text"
                required
                placeholder="Enter headline..."
                value={formData.headline || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* 2. Cover / Media Image Upload */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-brandPrimary" />
                <span>Cover / Banner Image Upload</span>
              </label>
              <FileUploadPicker
                label="Upload News Cover Image"
                type="image"
                folder="news"
                value={formData.imageUrl || ''}
                onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url, coverImage: url }))}
              />
              <input
                type="text"
                placeholder="Or paste Cover Image URL"
                value={formData.imageUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value, coverImage: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-[11px] text-slate-900 dark:text-white focus:outline-none mt-1"
              />
            </div>

            {/* 3. Publisher & External Link */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Media Publisher</label>
                <input
                  type="text"
                  placeholder="e.g. Platform Press, TechCrunch"
                  value={formData.publisher || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">External Article URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.externalUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* 4. Badge Tag & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Badge Tag</label>
                <select
                  value={formData.badgeTag || 'Update'}
                  onChange={(e) => setFormData(prev => ({ ...prev, badgeTag: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Update">Update</option>
                  <option value="Press Release">Press Release</option>
                  <option value="Event">Event</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Priority</label>
                <select
                  value={formData.priority || 'Normal'}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* 5. Summary */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Short Summary</label>
              <textarea
                rows={3}
                required
                placeholder="Brief summary of the announcement..."
                value={formData.summary || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* 6. Full Content */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Full Article Content</label>
              <RichTextEditor
                value={formData.content || ''}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Write full article body text..."
              />
            </div>

            {/* 7. Status */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Status</label>
              <select
                value={formData.status || 'Active'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Announcement'}</span>
            </button>
          </form>
        )}
      </RightDrawer>
    </div>
  );
};

export default NewsMediaPage;
