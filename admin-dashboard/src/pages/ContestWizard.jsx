import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Trophy, Coins, Calendar, ShieldAlert, Sparkles, Save, ArrowLeft, Image, Eye, CheckCircle2, FileText, Layers, Tag } from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { MultiSelect } from '../components/MultiSelect';
import { CustomSelect } from '../components/CustomSelect';
import { FileUploadPicker } from '../components/FileUploadPicker';
import { RichTextEditor } from '../components/RichTextEditor';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const getLocalDateString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentDateString = () => getLocalDateString(new Date());

const getCurrentTimeString = () => {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const splitDateTime = (dateVal) => {
  if (!dateVal) return { date: '', time: '' };
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return { date: '', time: '' };
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`
  };
};

const combineDateTime = (dateStr, timeStr) => {
  if (!dateStr) return null;
  const t = timeStr || '00:00';
  return new Date(`${dateStr}T${t}`);
};

export const ContestWizard = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert, showSnackbar } = useAlert();
  const isMockMode = useSelector((state) => state.auth.isMockMode);

  const queryParams = new URLSearchParams(location.search);
  const isDailyType = queryParams.get('type') === 'DailyContest';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: isDailyType ? 'Daily Speed Quiz Rush 2026' : '',
      description: isDailyType ? 'Automated 24-hour daily quiz battle with live reset countdown.' : '',
      rules: '1. Complete all quiz stages within timer countdown.\n2. Negative marking -2 for wrong attempts.\n3. Top scorers qualify for grand prize pool.',
      prize: isDailyType ? '10000' : '100000',
      fee: isDailyType ? '0' : '499',
      maxPart: '500',
      timerLimit: isDailyType ? '3' : '30',
      difficulty: 'Medium',
      questionsCount: '20',
      imageUrl: '',
      videoUrl: '',
      fileAttachmentUrl: '',
      selectedCategories: isDailyType ? ['Daily Contest'] : [],
      status: 'Registration Open',
      regStartDate: getCurrentDateString(),
      regStartTime: getCurrentTimeString(),
      regEndDate: '',
      regEndTime: '',
      tStartDate: '',
      tStartTime: '',
      tEndDate: '',
      tEndTime: ''
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .max(100, 'Title must be 100 characters or less')
        .required('Contest title is required'),
      description: Yup.string()
        .max(500, 'Description must be 500 characters or less')
        .required('Contest description is required'),
      prize: Yup.number()
        .min(0, 'Prize pool must be positive')
        .required('Prize pool is required'),
      fee: Yup.number()
        .min(0, 'Entry fee must be positive')
        .required('Entry fee is required'),
      maxPart: Yup.number()
        .min(1, 'Max participants must be at least 1')
        .required('Max participants is required'),
      timerLimit: Yup.number()
        .min(1, 'Timer must be at least 1 minute')
        .required('Contest timer is required')
    }),
    onSubmit: async (values) => {
      setSubmitting(true);
      const data = {
        title: values.title,
        description: values.description,
        rules: values.rules,
        prizePool: parseFloat(values.prize),
        entryFee: parseFloat(values.fee),
        maxParticipants: parseInt(values.maxPart, 10),
        timerLimit: parseInt(values.timerLimit, 10),
        difficulty: values.difficulty,
        questionsCount: parseInt(values.questionsCount, 10),
        imageUrl: values.imageUrl,
        videoUrl: values.videoUrl,
        fileAttachmentUrl: values.fileAttachmentUrl,
        registrationStart: combineDateTime(values.regStartDate, values.regStartTime),
        registrationEnd: combineDateTime(values.regEndDate, values.regEndTime),
        startDate: combineDateTime(values.tStartDate, values.tStartTime),
        endDate: combineDateTime(values.tEndDate, values.tEndTime),
        categories: isDailyType ? ['Daily Contest', ...values.selectedCategories] : values.selectedCategories,
        status: values.status,
        type: isDailyType ? 'Daily Contest' : 'Standard'
      };

      if (isMockMode) {
        showSnackbar(contestId ? 'Mock contest updated successfully.' : (isDailyType ? 'Mock Daily Contest created successfully.' : 'Mock contest created successfully.'), 'success');
        navigate(isDailyType ? '/admin-dashboard/daily-contest' : '/admin-dashboard/contests');
        return;
      }

      try {
        if (contestId) {
          const res = await axios.put(`/api/contests/${contestId}`, data, { withCredentials: true });
          if (res.data.success) {
            showSnackbar('Contest updated successfully.', 'success');
            navigate(isDailyType ? '/admin-dashboard/daily-contest' : '/admin-dashboard/contests');
          }
        } else if (isDailyType) {
          const res = await axios.post('/api/admin/daily-contests', {
            title: data.title,
            category: data.categories[0] || 'Speed Battle',
            entryFee: data.entryFee,
            prizePool: data.prizePool,
            timerLimit: `${data.timerLimit} mins`,
            questionsCount: data.questionsCount,
            description: data.description,
            status: data.status
          }, { withCredentials: true });
          if (res.data.success) {
            showSnackbar('Daily Contest created successfully!', 'success');
            navigate('/admin-dashboard/daily-contest');
          }
        } else {
          const res = await axios.post('/api/contests', data, { withCredentials: true });
          if (res.data.success) {
            showSnackbar('Contest created successfully.', 'success');
            navigate('/admin-dashboard/contests');
          }
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to save contest settings', 'error');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const fetchCategories = async () => {
    if (isMockMode) {
      setCategories([
        { _id: 'cat-1', title: 'Knowledge' },
        { _id: 'cat-2', title: 'Arts' },
        { _id: 'cat-3', title: 'Gaming' }
      ]);
      return;
    }
    try {
      const res = await axios.get('/api/categories', { withCredentials: true });
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContestDetails = async () => {
    if (!contestId) return;
    setLoading(true);
    try {
      if (isMockMode) {
        const c = { 
          _id: contestId, 
          contestId: 'CNT-2026-1001',
          title: 'India Creator Showdown 2026', 
          description: 'Vlogging, photography, and cinematography creative expression.', 
          rules: 'Submit short film before deadline.',
          entryFee: 499, 
          prizePool: 1000000, 
          status: 'Registration Open', 
          timerLimit: 45,
          difficulty: 'Medium',
          questionsCount: 25,
          imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500',
          startDate: '2026-07-01T12:00:00', 
          endDate: '2026-07-15T18:00:00', 
          registrationStart: '2026-06-01T09:00:00', 
          registrationEnd: '2026-06-30T23:59:00', 
          maxParticipants: 1000, 
          categories: ['cat-2'] 
        };
        const regStartSplit = splitDateTime(c.registrationStart);
        const regEndSplit = splitDateTime(c.registrationEnd);
        const tStartSplit = splitDateTime(c.startDate);
        const tEndSplit = splitDateTime(c.endDate);

        formik.setValues({
          title: c.title,
          description: c.description || '',
          rules: c.rules || '',
          prize: String(c.prizePool),
          fee: String(c.entryFee),
          maxPart: String(c.maxParticipants),
          timerLimit: String(c.timerLimit || 30),
          difficulty: c.difficulty || 'Medium',
          questionsCount: String(c.questionsCount || 20),
          imageUrl: c.imageUrl || '',
          videoUrl: c.videoUrl || '',
          fileAttachmentUrl: c.fileAttachmentUrl || '',
          selectedCategories: c.categories || [],
          status: c.status || 'Registration Open',
          regStartDate: regStartSplit.date,
          regStartTime: regStartSplit.time,
          regEndDate: regEndSplit.date,
          regEndTime: regEndSplit.time,
          tStartDate: tStartSplit.date,
          tStartTime: tStartSplit.time,
          tEndDate: tEndSplit.date,
          tEndTime: tEndSplit.time
        });
        return;
      }
      
      const res = await axios.get(`/api/contests/${contestId}`, { withCredentials: true });
      const c = res.data.contest;
      if (c) {
        const regStartSplit = splitDateTime(c.registrationStart);
        const regEndSplit = splitDateTime(c.registrationEnd);
        const tStartSplit = splitDateTime(c.startDate);
        const tEndSplit = splitDateTime(c.endDate);

        formik.setValues({
          title: c.title,
          description: c.description || '',
          rules: c.rules || '',
          prize: String(c.prizePool),
          fee: String(c.entryFee),
          maxPart: String(c.maxParticipants),
          timerLimit: String(c.timerLimit || 30),
          difficulty: c.difficulty || 'Medium',
          questionsCount: String(c.questionsCount || 20),
          imageUrl: c.imageUrl || '',
          videoUrl: c.videoUrl || '',
          fileAttachmentUrl: c.fileAttachmentUrl || '',
          selectedCategories: c.categories || [],
          status: c.status || 'Registration Open',
          regStartDate: regStartSplit.date,
          regStartTime: regStartSplit.time,
          regEndDate: regEndSplit.date,
          regEndTime: regEndSplit.time,
          tStartDate: tStartSplit.date,
          tStartTime: tStartSplit.time,
          tEndDate: tEndSplit.date,
          tEndTime: tEndSplit.time
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchContestDetails();
  }, [contestId, isMockMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-pulse">
        <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-white/50">
          <div className="w-8 h-8 border-2 border-brandPrimary/30 border-t-brandPrimary rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-widest">Loading Contest Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left animate-fade-in p-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <button
            onClick={() => navigate('/admin-dashboard/contests')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-white/60 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Contest Management
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-poppins flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-brandPrimary" />
            {contestId ? 'Modify Contest Settings' : 'Create New Tournament Contest'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
            Configure all contest parameters, rules, prize pools, timers & files on a single page with live preview.
          </p>
        </div>

        <button
          type="button"
          onClick={formik.handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 bg-gradient-to-r from-brandPrimary to-brandSecondary hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shrink-0"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{contestId ? 'Save Changes' : 'Create Contest'}</span>
        </button>
      </div>

      {/* Main Single Page Grid: Left Form Sections | Right Live Preview */}
      <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: All Form Sections */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: General Information & Rules */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-brandPrimary border-b border-slate-100 dark:border-white/5 pb-3">
              <Trophy className="w-5 h-5 text-brandPrimary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                1. General Information, Rules & Categories
              </h3>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Contest Title</label>
              <input
                type="text"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="National Reality Auditions 2026"
                className={`w-full bg-slate-50 dark:bg-black/40 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all ${
                  formik.touched.title && formik.errors.title ? 'border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-brandPrimary'
                }`}
              />
              {formik.touched.title && formik.errors.title && (
                <span className="text-[10px] text-red-500 mt-1 block">{formik.errors.title}</span>
              )}
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Description</label>
              <textarea
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Describe the category topics, criteria, and participation constraints..."
                rows={3}
                className={`w-full bg-slate-50 dark:bg-black/40 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all resize-none ${
                  formik.touched.description && formik.errors.description ? 'border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-brandPrimary'
                }`}
              />
              {formik.touched.description && formik.errors.description && (
                <span className="text-[10px] text-red-500 mt-1 block">{formik.errors.description}</span>
              )}
            </div>

            <RichTextEditor
              label="Contest Rules & Guidelines"
              value={formik.values.rules}
              onChange={(val) => formik.setFieldValue('rules', val)}
              placeholder="Enter rules, negative marking guidelines, disqualification policies..."
              rows={4}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Difficulty Level</label>
                <CustomSelect
                  value={formik.values.difficulty}
                  onChange={(val) => formik.setFieldValue('difficulty', val)}
                  options={[
                    { value: 'Easy', label: 'Easy' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Hard', label: 'Hard' },
                    { value: 'Expert', label: 'Expert' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Contest Categories</label>
                <MultiSelect
                  options={categories.map(c => ({ value: c._id, label: c.title || c.name || c._id, icon: c.icon }))}
                  selected={formik.values.selectedCategories}
                  onChange={(val) => formik.setFieldValue('selectedCategories', val)}
                  placeholder="Search & Select Categories..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Financials & Logistics */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-brandPrimary border-b border-slate-100 dark:border-white/5 pb-3">
              <Coins className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                2. Financials, Timer & Participant Seats
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Prize Pool (INR)</label>
                <input
                  type="number"
                  name="prize"
                  value={formik.values.prize}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
                {formik.touched.prize && formik.errors.prize && (
                  <span className="text-[10px] text-red-500 mt-1 block">{formik.errors.prize}</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Entry Fee (INR)</label>
                <input
                  type="number"
                  name="fee"
                  value={formik.values.fee}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
                {formik.touched.fee && formik.errors.fee && (
                  <span className="text-[10px] text-red-500 mt-1 block">{formik.errors.fee}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Timer Limit (Minutes)</label>
                <input
                  type="number"
                  name="timerLimit"
                  value={formik.values.timerLimit}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Max Participants (Seats)</label>
                <input
                  type="number"
                  name="maxPart"
                  value={formik.values.maxPart}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Total Questions Count</label>
                <input
                  type="number"
                  name="questionsCount"
                  value={formik.values.questionsCount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Media & Files Uploads */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-brandPrimary border-b border-slate-100 dark:border-white/5 pb-3">
              <Image className="w-5 h-5 text-purple-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                3. Cover Image, Video & Document Attachments
              </h3>
            </div>

            <FileUploadPicker
              label="Contest Cover Image"
              type="image"
              accept="image/*"
              value={formik.values.imageUrl}
              onChange={(val) => formik.setFieldValue('imageUrl', val)}
            />

            <FileUploadPicker
              label="Contest Trailer Video"
              type="video"
              accept="video/*"
              value={formik.values.videoUrl}
              onChange={(val) => formik.setFieldValue('videoUrl', val)}
            />

            <FileUploadPicker
              label="Rules PDF / Document Attachment"
              type="file"
              accept=".pdf,.doc,.docx"
              value={formik.values.fileAttachmentUrl}
              onChange={(val) => formik.setFieldValue('fileAttachmentUrl', val)}
            />
          </div>

          {/* Section 4: Timelines & Status */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-brandPrimary border-b border-slate-100 dark:border-white/5 pb-3">
              <Calendar className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                4. Schedule Timelines & Execution Status
              </h3>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Registration Start Date & Time</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="regStartDate"
                  value={formik.values.regStartDate}
                  onChange={formik.handleChange}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
                <input
                  type="time"
                  name="regStartTime"
                  value={formik.values.regStartTime}
                  onChange={formik.handleChange}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Registration End Date & Time</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="regEndDate"
                  value={formik.values.regEndDate}
                  onChange={formik.handleChange}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
                <input
                  type="time"
                  name="regEndTime"
                  value={formik.values.regEndTime}
                  onChange={formik.handleChange}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Contest Execution Start Date & Time</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="tStartDate"
                  value={formik.values.tStartDate}
                  onChange={formik.handleChange}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
                <input
                  type="time"
                  name="tStartTime"
                  value={formik.values.tStartTime}
                  onChange={formik.handleChange}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Contest Execution End Date & Time</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="tEndDate"
                  value={formik.values.tEndDate}
                  onChange={formik.handleChange}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
                <input
                  type="time"
                  name="tEndTime"
                  value={formik.values.tEndTime}
                  onChange={formik.handleChange}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Contest Execution Status</label>
              <CustomSelect
                value={formik.values.status}
                onChange={(val) => formik.setFieldValue('status', val)}
                options={[
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Upcoming', label: 'Upcoming' },
                  { value: 'Registration Open', label: 'Registration Open' },
                  { value: 'Registration Closed', label: 'Registration Closed' },
                  { value: 'Live', label: 'Live' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Cancelled', label: 'Cancelled' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Live Interactive Summary & Preview Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-6">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-500" /> Live Interactive Preview
              </h3>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-bold">
                Auto Synced
              </span>
            </div>

            {/* Banner Preview */}
            {formik.values.imageUrl ? (
              <img src={formik.values.imageUrl} className="w-full h-36 object-cover rounded-xl border border-slate-200 dark:border-white/10 shadow-sm" alt="Cover Preview" />
            ) : (
              <div className="w-full h-36 bg-slate-100 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-xl flex items-center justify-center text-slate-400 text-xs font-semibold">
                No Cover Image Selected
              </div>
            )}

            {/* Header Details */}
            <div className="space-y-1">
              <span className="px-2 py-0.5 bg-brandPrimary/10 text-brandPrimary font-mono font-bold rounded text-[10px] inline-block">
                Auto ID: {contestId || 'CNT-2026-AUTO'}
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">{formik.values.title || 'Untitled Contest'}</h4>
              <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full uppercase">
                {formik.values.status}
              </span>
            </div>

            {/* Description */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Description</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl">
                {formik.values.description || 'No description provided.'}
              </p>
            </div>

            {/* Formatted Rules */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Contest Rules & Guidelines</span>
              <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                {formik.values.rules || 'Standard contest rules apply.'}
              </div>
            </div>

            {/* Financials Pill Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Prize Pool</span>
                <strong className="text-emerald-500 font-bold">₹{parseFloat(formik.values.prize || 0).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Entry Fee</span>
                <strong className="text-brandPrimary font-bold">₹{formik.values.fee}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Timer Limit</span>
                <strong className="text-slate-800 dark:text-white font-bold">{formik.values.timerLimit} Mins</strong>
              </div>
            </div>

            {/* Category Tags */}
            {formik.values.selectedCategories.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Selected Categories</span>
                <div className="flex flex-wrap gap-1">
                  {formik.values.selectedCategories.map((catId) => {
                    const catObj = categories.find(c => c._id === catId);
                    return (
                      <span key={catId} className="px-2 py-0.5 bg-brandPrimary/10 text-brandPrimary rounded text-[10px] font-bold">
                        {catObj?.title || catObj?.name || catId}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Media Upload Status */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <div className="bg-slate-50 dark:bg-white/5 p-2 rounded-lg text-center">
                <span className="text-slate-400 block">Cover</span>
                <strong className="text-slate-800 dark:text-white">{formik.values.imageUrl ? 'Yes ✓' : 'No'}</strong>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 p-2 rounded-lg text-center">
                <span className="text-slate-400 block">Video</span>
                <strong className="text-slate-800 dark:text-white">{formik.values.videoUrl ? 'Yes ✓' : 'No'}</strong>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 p-2 rounded-lg text-center">
                <span className="text-slate-400 block">Rules PDF</span>
                <strong className="text-slate-800 dark:text-white">{formik.values.fileAttachmentUrl ? 'Yes ✓' : 'No'}</strong>
              </div>
            </div>

            {/* Timelines */}
            <div className="bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl text-[11px] space-y-1">
              <div>
                <span className="text-slate-400 block text-[10px]">Registration</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {formik.values.regStartDate || 'TBD'} to {formik.values.regEndDate || 'TBD'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Execution</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {formik.values.tStartDate || 'TBD'} to {formik.values.tEndDate || 'TBD'}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-brandPrimary to-brandSecondary hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{contestId ? 'Save Changes' : 'Confirm & Create Contest'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContestWizard;
