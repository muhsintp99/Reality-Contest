import React, { useState, useEffect, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Trophy, Calendar, Save, ArrowLeft, Layers, FileText, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { MultiSelect } from '../components/MultiSelect';
import { CustomSelect } from '../components/CustomSelect';
import { RichTextEditor } from '../components/RichTextEditor';
import { FileUploadPicker, uploadPendingFile } from '../components/FileUploadPicker';
import { useNavigate, useLocation } from 'react-router-dom';

const getLocalDateString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const GrandContestWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useAlert();

  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('edit');

  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initialCustomId = useMemo(() => `GNC-${Math.floor(100000 + Math.random() * 900000)}`, []);

  // Fetch Available Tasks for MultiSelect Connection
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let res = await axios.get('/api/admin/tasks', { withCredentials: true }).catch(() => null);
        if (!res?.data?.success) {
          res = await axios.get('/api/admin/room-cycle/tasks', { withCredentials: true }).catch(() => null);
        }
        if (res?.data?.success) {
          const raw = res.data.data;
          const list = Array.isArray(raw?.tasks) ? raw.tasks : Array.isArray(raw) ? raw : [];
          setAvailableTasks(list.map((t) => ({ value: t._id || t.id, label: `${t.title || t.name || 'Task'} (${t.taskType || 'Task'})` })));
        }
      } catch (err) {
        console.error('Error loading tasks:', err);
      }
    };
    fetchTasks();
  }, []);

  const formik = useFormik({
    initialValues: {
      customContestId: initialCustomId,
      title: '',
      description: '',
      rules: '1. Complete all assigned task challenges before deadline.\n2. Verify task proof file upload before submitting.\n3. Top scorers qualify for grand prize distribution.',
      guidelines: '1. Ensure accurate file format and size.\n2. Plagiarism or duplicate submission results in disqualification.',
      durationDays: '14',
      prizePool: '100000',
      entryFee: '499',
      entryFeeType: 'Cash',
      isFree: false,
      selectedTasks: [],
      bannerUrl: '',
      status: 'Registration Open',
      startDate: getLocalDateString(new Date()),
      endDate: getLocalDateString(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      prizePool: Yup.number().required('Prize pool is required').min(0)
    }),
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const finalBannerUrl = await uploadPendingFile(values.bannerUrl, 'grand-contests');

        const payload = {
          contestId: values.customContestId,
          title: values.title,
          description: values.description || values.title,
          rules: values.rules,
          guidelines: values.guidelines,
          durationDays: Number(values.durationDays) || 14,
          prizePool: Number(values.prizePool) || 0,
          entryFee: values.entryFeeType === 'Free' ? 0 : (Number(values.entryFee) || 0),
          entryFeeType: values.entryFeeType,
          isFree: values.entryFeeType === 'Free' || values.isFree,
          tasks: values.selectedTasks,
          bannerUrl: finalBannerUrl,
          imageUrl: finalBannerUrl,
          status: values.status,
          startDate: new Date(values.startDate),
          endDate: new Date(values.endDate)
        };

        if (editId) {
          let res = await axios.put(`/api/admin/grand-contests/${editId}`, payload, { withCredentials: true }).catch(() => null);
          if (!res?.data?.success) {
            await axios.put(`/api/grand-contests/${editId}`, payload, { withCredentials: true });
          }
          showSnackbar('Grand Contest updated successfully!', 'success');
        } else {
          let res = await axios.post('/api/admin/grand-contests', payload, { withCredentials: true }).catch(() => null);
          if (!res?.data?.success) {
            await axios.post('/api/grand-contests', payload, { withCredentials: true });
          }
          showSnackbar('Grand Contest created successfully!', 'success');
        }
        navigate('/admin-dashboard/grand-contests');
      } catch (err) {
        showSnackbar(err.response?.data?.message || 'Failed to save Grand Contest', 'error');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Fetch Existing Contest Details on Edit Mode
  useEffect(() => {
    if (!editId) return;
    const fetchContestForEdit = async () => {
      setLoading(true);
      try {
        let res = await axios.get(`/api/admin/grand-contests/${editId}`, { withCredentials: true }).catch(() => null);
        if (!res?.data?.success) {
          res = await axios.get(`/api/grand-contests/${editId}`, { withCredentials: true }).catch(() => null);
        }
        if (res?.data?.success) {
          const c = res.data.data || res.data.contest;
          formik.setValues({
            customContestId: c.contestId || initialCustomId,
            title: c.title || '',
            description: c.description || '',
            rules: c.rules || '',
            guidelines: c.guidelines || '',
            durationDays: String(c.durationDays || 14),
            prizePool: String(c.prizePool || 0),
            entryFee: String(c.entryFee || 0),
            entryFeeType: c.entryFeeType || (c.isFree ? 'Free' : 'Cash'),
            isFree: Boolean(c.isFree),
            selectedTasks: Array.isArray(c.tasks) ? c.tasks.map((t) => (typeof t === 'object' ? t._id || t.id : t)) : [],
            bannerUrl: c.bannerUrl || c.imageUrl || '',
            status: c.status || 'Registration Open',
            startDate: getLocalDateString(c.startDate || new Date()),
            endDate: getLocalDateString(c.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
          });
        }
      } catch (err) {
        console.error('Error fetching contest for edit:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContestForEdit();
  }, [editId]);

  // Auto update End Date when Duration Days or Start Date changes
  const handleDurationChange = (e) => {
    const days = Number(e.target.value) || 1;
    formik.setFieldValue('durationDays', e.target.value);
    if (formik.values.startDate) {
      const start = new Date(formik.values.startDate);
      const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
      formik.setFieldValue('endDate', getLocalDateString(end));
    }
  };

  const handleStartDateChange = (e) => {
    const val = e.target.value;
    formik.setFieldValue('startDate', val);
    const days = Number(formik.values.durationDays) || 14;
    if (val) {
      const start = new Date(val);
      const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
      formik.setFieldValue('endDate', getLocalDateString(end));
    }
  };

  const handleEntryFeeTypeChange = (val) => {
    formik.setFieldValue('entryFeeType', val);
    if (val === 'Free') {
      formik.setFieldValue('isFree', true);
      formik.setFieldValue('entryFee', '0');
    } else {
      formik.setFieldValue('isFree', false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin-dashboard/grand-contests')}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white">{editId ? 'Edit Grand Contest' : 'Create New Grand Contest'}</h1>
            <p className="text-xs text-slate-400">Configure contest rules, guidelines, connected tasks & prize pool</p>
          </div>
        </div>
        <button
          onClick={formik.handleSubmit}
          disabled={submitting || loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {submitting ? 'Saving...' : editId ? 'Update Contest' : 'Publish Grand Contest'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading Grand Contest details...</p>
        </div>
      ) : (
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-5">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Basic Details & Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Custom Contest ID</label>
                <input
                  type="text"
                  name="customContestId"
                  value={formik.values.customContestId}
                  onChange={formik.handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Contest Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  placeholder="e.g., Grand Championship Season 1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
                {formik.errors.title && <span className="text-xs text-rose-400 mt-1">{formik.errors.title}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</label>
                <CustomSelect
                  options={[
                    { value: 'Draft', label: 'Draft' },
                    { value: 'Registration Open', label: 'Registration Open' },
                    { value: 'Upcoming', label: 'Upcoming' },
                    { value: 'Active', label: 'Active' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Completed', label: 'Completed' }
                  ]}
                  value={formik.values.status}
                  onChange={(val) => formik.setFieldValue('status', val)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Entry Fee Type</label>
                <CustomSelect
                  options={[
                    { value: 'Free', label: 'Free Entry' },
                    { value: 'Coins', label: 'Coins' },
                    { value: 'Cash', label: 'Cash (₹)' }
                  ]}
                  value={formik.values.entryFeeType}
                  onChange={handleEntryFeeTypeChange}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                placeholder="Describe the grand contest goals and requirements..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Task Connection Section */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" /> Connect Tasks & Challenges
            </h2>
            <p className="text-xs text-slate-400">Search and select tasks to connect directly with this Grand Contest</p>

            <MultiSelect
              options={availableTasks}
              selected={formik.values.selectedTasks}
              onChange={(val) => formik.setFieldValue('selectedTasks', val)}
              placeholder="Search & select tasks to connect..."
            />
          </div>

          {/* Rules & Guidelines Editors */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-5">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" /> Contest Rules & Guidelines
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Contest Rules</label>
                <RichTextEditor
                  value={formik.values.rules}
                  onChange={(val) => formik.setFieldValue('rules', val)}
                  placeholder="Enter detailed contest rules..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Participation Guidelines</label>
                <RichTextEditor
                  value={formik.values.guidelines}
                  onChange={(val) => formik.setFieldValue('guidelines', val)}
                  placeholder="Enter step-by-step participation guidelines..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Duration (in Days)</label>
                <input
                  type="number"
                  name="durationDays"
                  value={formik.values.durationDays}
                  onChange={handleDurationChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Prize Pool (₹)</label>
                <input
                  type="number"
                  name="prizePool"
                  value={formik.values.prizePool}
                  onChange={formik.handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Entry Fee ({formik.values.entryFeeType === 'Coins' ? 'Coins' : '₹'})</label>
                <input
                  type="number"
                  name="entryFee"
                  disabled={formik.values.entryFeeType === 'Free'}
                  value={formik.values.entryFee}
                  onChange={formik.handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Schedule & Banner File Picker */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Schedule & Banner Attachment
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formik.values.startDate}
                  onChange={handleStartDateChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">End Date (Auto-calculated)</label>
                <input
                  type="date"
                  name="endDate"
                  value={formik.values.endDate}
                  onChange={formik.handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <FileUploadPicker
                label="Banner Image Upload"
                type="image"
                folder="grand-contests"
                value={formik.values.bannerUrl}
                onChange={(val) => formik.setFieldValue('bannerUrl', val)}
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default GrandContestWizard;
