import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import * as Icons from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';

// Curated list of high-quality icons for categories
const ICON_OPTIONS = [
  { name: 'Brain', label: 'Knowledge' },
  { name: 'Palette', label: 'Arts' },
  { name: 'Video', label: 'Media' },
  { name: 'Briefcase', label: 'Business' },
  { name: 'Trophy', label: 'Sports' },
  { name: 'Atom', label: 'Science' },
  { name: 'Heart', label: 'Social' },
  { name: 'Gamepad2', label: 'Gaming' },
  { name: 'Music', label: 'Music' },
  { name: 'BookOpen', label: 'Education' },
  { name: 'Globe', label: 'Global' },
  { name: 'Shield', label: 'Security' },
  { name: 'Zap', label: 'Energy' },
  { name: 'Camera', label: 'Photo' },
  { name: 'Tv', label: 'TV' },
  { name: 'Mic', label: 'Speech' }
];

const MOCK_CATEGORIES = [
  { _id: 'cat-1', title: 'Knowledge', icon: 'Brain', description: 'Quizzes, tech trivia, cognitive tests, and subject expertise challenge arenas.', status: 'Active' },
  { _id: 'cat-2', title: 'Arts', icon: 'Palette', description: 'Creative expression, drawing, painting, craftsmanship, and performance arts.', status: 'Active' },
  { _id: 'cat-3', title: 'Content Creation', icon: 'Video', description: 'Vlogging, cinematography, video editing, storytelling, and digital influence.', status: 'Active' },
  { _id: 'cat-4', title: 'Entrepreneurship', icon: 'Briefcase', description: 'Startup pitches, SaaS models, business strategy, and venture modeling.', status: 'Active' },
  { _id: 'cat-5', title: 'Sports', icon: 'Trophy', description: 'Athletics, e-sports gaming, physical fitness milestones, and sports analysis.', status: 'Active' },
  { _id: 'cat-6', title: 'Science', icon: 'Atom', description: 'Scientific experiments, academic research, innovation prototypes, and tech builds.', status: 'Active' },
  { _id: 'cat-7', title: 'Social Impact', icon: 'Heart', description: 'Eco campaigns, social volunteering, community development, and charity drives.', status: 'Active' }
];

// Helper to render Lucide icon dynamically by string name
const DynamicIcon = ({ name, className }) => {
  const IconComponent = Icons[name] || Icons.Layers;
  return <IconComponent className={className} />;
};

export const CategoryManagement = () => {
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth.isMockMode);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Brain');
  const [status, setStatus] = useState('Active');

  const fetchCategories = async () => {
    if (isMockMode) {
      // Initialize with default mock categories if not loaded yet
      setCategories(prev => prev.length ? prev : MOCK_CATEGORIES);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get('/api/categories', { withCredentials: true });
      let data = res.data.categories || [];
      data.sort((a, b) => new Date(b.createdAt || b._id).getTime() - new Date(a.createdAt || a._id).getTime());
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [isMockMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    const data = { title, description, icon, status };

    if (isMockMode) {
      if (editingId) {
        setCategories(prev => prev.map(c => c._id === editingId ? { ...c, ...data } : c));
        showAlert('Mock category updated.', 'success');
        resetForm();
      } else {
        const titleExists = categories.some(c => c.title.toLowerCase() === title.toLowerCase());
        if (titleExists) {
          showAlert('A category with this title already exists.', 'error');
          return;
        }
        setCategories(prev => [...prev, { _id: `cat-${Date.now()}`, ...data }]);
        showAlert('Mock category created.', 'success');
        resetForm();
      }
      return;
    }

    try {
      if (editingId) {
        const res = await axios.put(`/api/categories/${editingId}`, data, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('Category updated successfully.', 'success');
          resetForm();
          fetchCategories();
        }
      } else {
        const res = await axios.post('/api/categories', data, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('Category created successfully.', 'success');
          resetForm();
          fetchCategories();
        }
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to save category', 'error');
    }
  };

  const handleEditClick = (c) => {
    setEditingId(c._id);
    setTitle(c.title);
    setDescription(c.description || '');
    setIcon(c.icon || 'Brain');
    setStatus(c.status || 'Active');
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = async (id, name) => {
    showConfirm('Delete Category', `Are you sure you want to permanently delete category "${name}"?`, async () => {
      if (isMockMode) {
        setCategories(prev => prev.filter(c => c._id !== id));
        showSnackbar('Mock category deleted.', 'success');
        if (editingId === id) resetForm();
        return;
      }

      try {
        const res = await axios.delete(`/api/categories/${id}`, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('Category deleted successfully.', 'success');
          if (editingId === id) resetForm();
          fetchCategories();
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to delete category', 'error');
      }
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setIcon('Brain');
    setStatus('Active');
    setIsDrawerOpen(false);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div>
        <h2 className="text-xl font-bold font-poppins text-white dark:text-white light:text-black flex items-center gap-2">
          <Icons.Layers className="w-6 h-6 text-brandPrimary" />
          Category Architecture Console
        </h2>
        <p className="text-xs text-white/50 font-poppins">
          Establish, refine, and syndicate challenge categories across the active contestant platform.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Categories List Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-xs font-bold uppercase text-brandPrimary tracking-wider">
                Active Platform Categories ({categories.length})
              </h3>
              {isMockMode && (
                <span className="text-[10px] bg-brandSecondary/10 text-brandSecondary border border-brandSecondary/20 px-2 py-0.5 rounded-full font-bold">
                  Mock Mode
                </span>
              )}
            </div>
            <button
              onClick={() => { resetForm(); setIsDrawerOpen(true); }}
              className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-brandPrimary/20 flex items-center gap-2"
            >
              <Icons.Plus className="w-4 h-4" />
              Syndicate Category
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48 bg-white/5 border border-white/5 rounded-2xl">
              <span className="text-sm text-white/60 animate-pulse">Loading categories database...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex justify-center items-center h-48 bg-white/5 border border-white/5 rounded-2xl">
              <span className="text-sm text-white/40">No categories found. Create one.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => (
                <div
                  key={c._id}
                  className={`p-5 bg-white/5 border rounded-2xl flex flex-col justify-between min-h-[160px] transition-all relative overflow-hidden group border-white/5 hover:border-brandPrimary/30 hover:bg-white/[0.07]`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2.5 bg-brandPrimary/10 border border-brandPrimary/20 rounded-xl text-brandPrimary">
                        <DynamicIcon name={c.icon} className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[9px] border px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                          c.status === 'Active'
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-brandSecondary transition-colors">
                      {c.title}
                    </h4>
                    <p className="text-[11px] text-white/50 mt-1.5 line-clamp-2 leading-relaxed">
                      {c.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-3.5 mt-4 flex justify-between items-center text-[10px] text-white/40">
                    <span className="font-mono text-[9px] uppercase tracking-tight text-white/30">
                      /{c.slug || c.title.toLowerCase().replace(/\s+/g, '-')}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(c)}
                        title="Edit Category"
                        className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full transition-all"
                      >
                        <Icons.Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(c._id, c.title)}
                        title="Delete Category"
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all"
                      >
                        <Icons.Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Form */}
        <RightDrawer
          isOpen={isDrawerOpen}
          onClose={resetForm}
          title={editingId ? 'Modify Category' : 'Syndicate Category'}
        >
          <form
            onSubmit={handleSubmit}
            className="flex flex-col h-full"
          >
            <div className="flex-1 space-y-6">
              <div>
                <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">General Information</div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Category Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="E.g. Dance Audition"
                      className="w-full bg-black/45 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brandPrimary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief summary of contestants or challenge scopes in this category."
                      rows={3}
                      className="w-full bg-black/45 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brandPrimary transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Visuals & Settings</div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setStatus('Active')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          status === 'Active'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('Archived')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          status === 'Archived'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        Archived
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Representational Icon</label>
                    <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-hide">
                      {ICON_OPTIONS.map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setIcon(item.name)}
                          title={item.label}
                          className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                            icon === item.name
                              ? 'bg-brandPrimary/20 border-brandPrimary text-brandPrimary shadow-lg shadow-brandPrimary/10'
                              : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/20'
                          }`}
                        >
                          <DynamicIcon name={item.name} className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brandPrimary to-brandSecondary hover:opacity-90 font-bold text-xs text-white transition-opacity shadow-md shadow-brandPrimary/10 flex items-center justify-center gap-1.5"
              >
                {editingId ? (
                  <>
                    <Icons.Check className="w-4 h-4" />
                    Update Category
                  </>
                ) : (
                  <>
                    <Icons.Plus className="w-4 h-4" />
                    Syndicate Category
                  </>
                )}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs text-white/80 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </RightDrawer>
      </div>
    </div>
  );
};

export default CategoryManagement;
