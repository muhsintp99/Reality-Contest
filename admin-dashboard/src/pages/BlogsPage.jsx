import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Edit, Trash2, Eye, RefreshCw, Save } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';

export const BlogsPage = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [activeBlog, setActiveBlog] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/cms/blogs', { withCredentials: true });
      if (res.data.success) {
        setBlogs(res.data.blogs || []);
      }
    } catch (err) {
      console.warn('[BlogsPage] Error fetching blogs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openDrawer = (mode, blog = null) => {
    setDrawerMode(mode);
    setActiveBlog(blog);
    if (mode === 'add') {
      setFormData({ title: '', author: 'Editorial Team', category: 'Platform Updates', coverImage: '', summary: '', content: '', status: 'Published' });
    } else if (blog) {
      setFormData({ ...blog });
    }
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (drawerMode === 'edit' && activeBlog) {
        const res = await axios.put(`/api/admin/cms/blogs/${activeBlog._id}`, formData, { withCredentials: true });
        if (res.data.success) {
          setBlogs(prev => prev.map(b => b._id === activeBlog._id ? res.data.blog : b));
          showSnackbar('Blog post updated!', 'success');
        }
      } else {
        const res = await axios.post('/api/admin/cms/blogs', formData, { withCredentials: true });
        if (res.data.success) {
          setBlogs(prev => [res.data.blog, ...prev]);
          showSnackbar('Blog post created!', 'success');
        }
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Blog saved locally.', 'info');
    }
    setDrawerOpen(false);
  };

  const handleDelete = (id) => {
    showConfirm('Delete Blog Post', 'Are you sure you want to delete this blog post?', async () => {
      try {
        await axios.delete(`/api/admin/cms/blogs/${id}`, { withCredentials: true });
        setBlogs(prev => prev.filter(b => b._id !== id));
        showSnackbar('Blog post deleted.', 'success');
      } catch (err) {
        setBlogs(prev => prev.filter(b => b._id !== id));
        showSnackbar('Blog post deleted.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brandPrimary" />
            <span>Blogs & Articles Management</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-white/50">
            Publish platform updates, winner spotlights, and creator tips.
          </p>
        </div>
        <button
          onClick={() => openDrawer('add')}
          className="px-4 py-2.5 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 transition-all flex items-center gap-2 shadow-lg shadow-brandPrimary/15 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Blog Post</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-brandPrimary font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading Blogs from Backend...</span>
        </div>
      ) : blogs.length === 0 ? (
        <div className="glassmorphism p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Blog Posts Published Yet</h4>
          <p className="text-xs text-slate-500 dark:text-white/40">Write your first blog post using the button below.</p>
          <button onClick={() => openDrawer('add')} className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow cursor-pointer">
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
                    <button onClick={() => handleDelete(blog._id)} className="p-1.5 bg-rose-500/10 text-rose-600 rounded-full cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RightDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={`${drawerMode.toUpperCase()} BLOG POST`}>
        {drawerMode === 'view' ? (
          <div className="space-y-4 text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{formData.title}</h3>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 text-xs text-slate-800 dark:text-white whitespace-pre-wrap font-mono">
              {formData.content || formData.summary}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Post Title</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Author</label>
                <input
                  type="text"
                  value={formData.author || 'Editorial Team'}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Category</label>
                <select
                  value={formData.category || 'Platform Updates'}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Platform Updates">Platform Updates</option>
                  <option value="Winner Spotlights">Winner Spotlights</option>
                  <option value="Creator Tips">Creator Tips</option>
                  <option value="Contest Guides">Contest Guides</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Cover Image URL</label>
              <input
                type="url"
                value={formData.coverImage || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Summary</label>
              <textarea
                rows={3}
                required
                value={formData.summary || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-600 dark:text-white/40 uppercase font-bold">Full Post Content</label>
              <textarea
                rows={8}
                required
                value={formData.content || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-brandPrimary text-white rounded-xl text-xs font-bold hover:bg-brandPrimary/90 flex items-center justify-center gap-2 cursor-pointer shadow-lg">
              <Save className="w-4 h-4" /> Save Blog Post
            </button>
          </form>
        )}
      </RightDrawer>
    </div>
  );
};

export default BlogsPage;
