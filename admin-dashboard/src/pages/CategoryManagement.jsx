import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import * as Icons from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { CustomSelect } from '../components/CustomSelect';

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
  { name: 'Mic', label: 'Speech' },
  { name: 'Film', label: 'Cinema' },
  { name: 'PenTool', label: 'Design' },
  { name: 'Code', label: 'Tech' },
  { name: 'Leaf', label: 'Nature' },
  { name: 'Coins', label: 'Finance' },
  { name: 'HeartPulse', label: 'Health' },
  { name: 'Compass', label: 'Adventure' }
];

const MOCK_CATEGORIES = [];

export const getCategoryId = (c, idx = 0) => {
  if (!c) return 'N/A';
  if (c.categoryId) return c.categoryId;
  if (c._id && typeof c._id === 'string') {
    if (c._id.startsWith('CAT-')) return c._id;
    if (c._id.startsWith('cat-')) {
      const num = parseInt(c._id.replace('cat-', ''), 10);
      return `CAT-${1000 + (isNaN(num) ? idx + 1 : num)}`;
    }
    if (c._id.length === 24 && /^[0-9a-fA-F]+$/.test(c._id)) {
      const numPart = parseInt(c._id.slice(-4), 16);
      return `CAT-${1000 + (numPart % 9000)}`;
    }
    return c._id;
  }
  return c.id || 'N/A';
};

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

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [viewingCategory, setViewingCategory] = useState(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [iconType, setIconType] = useState('preset'); // 'preset' or 'upload'

  const formik = useFormik({
    initialValues: {
      title: '',
      icon: 'Brain',
      status: 'Active'
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string()
        .max(50, 'Title must be 50 characters or less')
        .required('Category title is required')
    }),
    onSubmit: async (values) => {
      const data = {
        title: values.title,
        icon: values.icon,
        status: values.status
      };

      if (isMockMode) {
        if (editingId) {
          setCategories(prev => prev.map(c => c._id === editingId ? { ...c, ...data } : c));
          showAlert('Mock category updated.', 'success');
          resetForm();
        } else {
          const titleExists = categories.some(c => c.title.toLowerCase() === values.title.toLowerCase());
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
    }
  });

  const fetchCategories = async () => {
    if (isMockMode) {
      setCategories(prev => prev || []);
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

  const handleEditClick = (c) => {
    setEditingId(c._id);
    formik.setValues({
      title: c.title,
      icon: c.icon || 'Brain',
      status: c.status || 'Active'
    });
    const isCustom = c.icon && (c.icon.startsWith('http') || c.icon.startsWith('/') || c.icon.startsWith('data:'));
    setIconType(isCustom ? 'upload' : 'preset');
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
    formik.resetForm();
    setIconType('preset');
    setIsDrawerOpen(false);
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (res.data.success) {
        formik.setFieldValue('icon', res.data.fileUrl);
        showSnackbar('Icon image uploaded successfully.', 'success');
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to upload icon image.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleViewClick = (c) => {
    setViewingCategory(c);
    setIsViewDrawerOpen(true);
  };

  const filteredCategories = categories.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' ? true : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div>
        <h2 className="text-xl font-bold font-poppins text-white flex items-center gap-2">
          <Icons.Layers className="w-6 h-6 text-brandPrimary" />
          Category Architecture Console
        </h2>
        <p className="text-xs text-white/50 font-poppins">
          Establish, refine, and syndicate challenge categories across the active contestant platform.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-xs font-bold uppercase text-brandPrimary tracking-wider">
                Active Platform Categories ({filteredCategories.length})
              </h3>
              {isMockMode && (
                <span className="text-[10px] bg-brandSecondary/10 text-brandSecondary border border-brandSecondary/20 px-2 py-0.5 rounded-full font-bold">
                  Mock Mode
                </span>
              )}
            </div>
            <button
              onClick={() => { resetForm(); setIsDrawerOpen(true); }}
              className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-brandPrimary/20 flex items-center gap-2 shrink-0"
            >
              <Icons.Plus className="w-4 h-4" />
              Syndicate Category
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Icons.Search className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search categories by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0c1322]/60 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brandPrimary/60"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-full md:w-48">
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'All', label: 'All Statuses' },
                    { value: 'Active', label: 'Active' },
                    { value: 'Archived', label: 'Archived' }
                  ]}
                />
              </div>

              {/* View Mode Toggle Buttons */}
              <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setViewMode('table')}
                  title="Data Table List View"
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-brandPrimary text-white shadow-sm'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  <Icons.List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid Cards View"
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-brandPrimary text-white shadow-sm'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  <Icons.LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48 bg-white/5 border border-white/5 rounded-2xl">
              <span className="text-sm text-white/60 animate-pulse">Loading categories database...</span>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex justify-center items-center h-48 bg-white/5 border border-white/5 rounded-2xl">
              <span className="text-sm text-white/40">No categories found matching criteria.</span>
            </div>
          ) : viewMode === 'table' ? (
            /* Data Table List View */
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0B1120] shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Category Details</th>
                    <th className="p-3.5">Category ID</th>
                    <th className="p-3.5">Slug / Route</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCategories.map((c, idx) => (
                    <tr key={c._id || idx} className="hover:bg-white/5 transition-all group">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brandPrimary/10 border border-brandPrimary/20 rounded-xl text-brandPrimary flex items-center justify-center w-9 h-9 shrink-0 overflow-hidden">
                            {c.icon && (c.icon.startsWith('http') || c.icon.startsWith('/') || c.icon.startsWith('data:')) ? (
                              <img src={c.icon} alt={c.title} className="w-5 h-5 object-contain rounded-md" />
                            ) : (
                              <DynamicIcon name={c.icon} className="w-4.5 h-4.5" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-brandSecondary transition-colors">
                              {c.title}
                            </h4>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400 font-bold">
                        {getCategoryId(c, idx)}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-brandPrimary font-bold">
                        /{c.slug || c.title.toLowerCase().replace(/\s+/g, '-')}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[9px] border px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                            c.status === 'Active'
                              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                              : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewClick(c)}
                            title="View Category Details"
                            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all cursor-pointer"
                          >
                            <Icons.Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(c)}
                            title="Edit Category"
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all cursor-pointer"
                          >
                            <Icons.Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(c._id, c.title)}
                            title="Delete Category"
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all cursor-pointer"
                          >
                            <Icons.Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((c, idx) => (
                <div
                  key={c._id || idx}
                  className={`p-5 bg-white/5 border rounded-2xl flex flex-col justify-between min-h-[160px] transition-all relative overflow-hidden group border-white/5 hover:border-brandPrimary/30 hover:bg-white/[0.07]`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2.5 bg-brandPrimary/10 border border-brandPrimary/20 rounded-xl text-brandPrimary flex items-center justify-center w-10.5 h-10.5 shrink-0 overflow-hidden">
                        {c.icon && (c.icon.startsWith('http') || c.icon.startsWith('/') || c.icon.startsWith('data:')) ? (
                          <img src={c.icon} alt={c.title} className="w-5.5 h-5.5 object-contain rounded-md" />
                        ) : (
                          <DynamicIcon name={c.icon} className="w-5 h-5" />
                        )}
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
                  </div>

                  <div className="border-t border-white/5 pt-3.5 mt-4 flex justify-between items-center text-[10px] text-white/40">
                    <span className="font-mono text-[9px] uppercase tracking-tight text-white/30">
                      /{c.slug || c.title.toLowerCase().replace(/\s+/g, '-')}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewClick(c)}
                        title="View Category Details"
                        className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-455 rounded-full transition-all"
                      >
                        <Icons.Eye className="w-4 h-4" />
                      </button>
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
            onSubmit={formik.handleSubmit}
            className="flex flex-col h-full text-left"
          >
            <div className="flex-1 space-y-6">
              <div>
                <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">General Information</div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Category Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formik.values.title}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="E.g. Dance Audition"
                      className={`w-full bg-black/45 border rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none transition-all ${
                        formik.touched.title && formik.errors.title
                          ? 'border-red-500/60 focus:border-red-500'
                          : 'border-white/10 focus:border-brandPrimary'
                      }`}
                    />
                    {formik.touched.title && formik.errors.title && (
                      <span className="text-[10px] text-red-400 mt-1 block animate-fade-in">{formik.errors.title}</span>
                    )}
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
                        onClick={() => formik.setFieldValue('status', 'Active')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          formik.values.status === 'Active'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => formik.setFieldValue('status', 'Archived')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          formik.values.status === 'Archived'
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
                    
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setIconType('preset')}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                          iconType === 'preset'
                            ? 'bg-brandPrimary/15 border-brandPrimary/30 text-brandPrimary'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        Lucide Preset
                      </button>
                      <button
                        type="button"
                        onClick={() => setIconType('upload')}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                          iconType === 'upload'
                            ? 'bg-brandPrimary/15 border-brandPrimary/30 text-brandPrimary'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        Custom Upload
                      </button>
                    </div>

                    {iconType === 'preset' ? (
                      <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-hide">
                        {ICON_OPTIONS.map((item) => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => formik.setFieldValue('icon', item.name)}
                            title={item.label}
                            className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                              formik.values.icon === item.name
                                ? 'bg-brandPrimary/20 border-brandPrimary text-brandPrimary shadow-lg shadow-brandPrimary/10'
                                : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/20'
                            }`}
                          >
                            <DynamicIcon name={item.name} className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formik.values.icon && (formik.values.icon.startsWith('http') || formik.values.icon.startsWith('/') || formik.values.icon.startsWith('data:')) ? (
                          <div className="relative border border-white/15 rounded-2xl p-4 bg-white/5 flex flex-col items-center justify-center gap-2 group/upload select-none">
                            <img src={formik.values.icon} alt="Custom Category Icon" className="w-14 h-14 object-contain rounded-xl animate-fade-in" />
                            <span className="text-[10px] text-white/30 truncate max-w-full font-mono">{formik.values.icon.split('/').pop()}</span>
                            <button
                              type="button"
                              onClick={() => formik.setFieldValue('icon', 'Brain')}
                              className="absolute top-2 right-2 p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                              title="Remove Custom Image"
                            >
                              <Icons.Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="border border-dashed border-white/20 hover:border-brandPrimary/50 rounded-2xl p-6 bg-white/[0.02] hover:bg-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadFile}
                              className="hidden"
                              disabled={uploading}
                            />
                            {uploading ? (
                              <>
                                <div className="w-5 h-5 border-2 border-brandPrimary/30 border-t-brandPrimary rounded-full animate-spin" />
                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Icons.Upload className="w-5 h-5 text-white/40" />
                                <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Choose Custom Icon File</span>
                                <span className="text-[9px] text-white/25">Supports PNG, JPG, WEBP (Max 5MB)</span>
                              </>
                            )}
                          </label>
                        )}
                      </div>
                    )}
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

        {/* View Details Drawer */}
        <RightDrawer
          isOpen={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          title="Category Details"
        >
          {viewingCategory && (
            <div className="space-y-6 text-left">
              <div className="flex items-center gap-4 border-b border-white/10 pb-5">
                <div className="p-4 bg-brandPrimary/10 border border-brandPrimary/20 rounded-2xl text-brandPrimary flex items-center justify-center w-16 h-16 shrink-0 overflow-hidden">
                  {viewingCategory.icon && (viewingCategory.icon.startsWith('http') || viewingCategory.icon.startsWith('/') || viewingCategory.icon.startsWith('data:')) ? (
                    <img src={viewingCategory.icon} alt={viewingCategory.title} className="w-9 h-9 object-contain rounded-lg" />
                  ) : (
                    <DynamicIcon name={viewingCategory.icon} className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">{viewingCategory.title}</h3>
                  <span className={`inline-block text-[9px] border px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider mt-1.5 ${
                    viewingCategory.status === 'Active'
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                  }`}>
                    {viewingCategory.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-white/40 uppercase font-extrabold tracking-wider">Syndication Path / Slug</label>
                  <p className="font-mono text-xs text-brandSecondary mt-1">
                    /{viewingCategory.slug || viewingCategory.title.toLowerCase().replace(/\s+/g, '-')}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 uppercase font-extrabold tracking-wider">Internal Reference ID</label>
                  <p className="font-mono text-xs font-bold text-brandPrimary mt-1">{getCategoryId(viewingCategory)}</p>
                </div>

                {viewingCategory.createdAt && (
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-extrabold tracking-wider">Syndicated Date</label>
                    <p className="text-xs text-white/60 mt-1">{new Date(viewingCategory.createdAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsViewDrawerOpen(false)}
                className="w-full mt-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close View
              </button>
            </div>
          )}
        </RightDrawer>
      </div>
    </div>
  );
};

export default CategoryManagement;
