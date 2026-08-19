import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Trophy, Coins, Calendar, ShieldAlert, Sparkles, Save, ArrowLeft, Image, Eye,
  CheckCircle2, FileText, Layers, Tag, Clock, Video, File, Check, RefreshCw, UploadCloud
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { MultiSelect } from '../components/MultiSelect';
import { FileUploadPicker, uploadPendingFile } from '../components/FileUploadPicker';
import { RichTextEditor } from '../components/RichTextEditor';
import { TimePicker12h } from '../components/TimePicker12h';
import { useNavigate } from 'react-router-dom';

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

export const DailyContestWizard = () => {
  const navigate = useNavigate();
  const { showAlert, showSnackbar } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      let res = await axios.get('/api/categories', { withCredentials: true }).catch(() => null);
      if (!res || !res.data) {
        res = await axios.get('/api/admin/categories', { withCredentials: true }).catch(() => null);
      }
      const cats = res?.data?.categories || res?.data?.data || res?.data || [];
      if (Array.isArray(cats)) {
        setCategories(cats);
      }
    } catch (err) {
      console.error('Error fetching categories from /api/categories:', err);
    }
  };

  const initialDailyId = useMemo(() => `DLC-${Math.floor(100000 + Math.random() * 900000)}`, []);

  const formik = useFormik({
    initialValues: {
      dailyContestId: initialDailyId,
      title: '',
      category: '',
      selectedCategories: [],
      description: '',
      rules: '',
      prize: '',
      fee: '0',
      entryFeeType: 'Free',
      isFree: true,
      entryFeeCoins: '0',
      coinsReward: '10000',
      maxPart: '500',
      timerLimit: '',
      questionsCount: '20',
      difficulty: 'Medium',
      resetIntervalHours: '24',
      imageUrl: '',
      videoUrl: '',
      fileAttachmentUrl: '',
      status: 'Registration Open',
      isActive: true,
      dailyStartTime: '09:00 AM',
      dailyEndTime: '11:59 PM'
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .max(100, 'Title must be 100 characters or less')
        .required('Daily contest title is required'),
      description: Yup.string()
        .max(500, 'Description must be 500 characters or less')
        .required('Description is required'),
      prize: Yup.number()
        .min(0, 'Prize pool must be positive')
        .required('Prize pool in coins is required'),
      fee: Yup.number()
        .min(0, 'Entry fee must be positive')
        .required('Entry fee is required'),
      timerLimit: Yup.number()
        .min(1, 'Timer must be at least 1 minute')
        .required('Timer is required')
    }),
    onSubmit: async (values) => {
      setSubmitting(true);
      const feeVal = values.isFree ? 0 : (Number(values.fee) || 0);

      // Persist pending media previews to disk ONLY upon form save
      const uploadedImageUrl = await uploadPendingFile(values.imageUrl, 'daily-contest');
      const uploadedVideoUrl = await uploadPendingFile(values.videoUrl, 'daily-contest');
      const uploadedFileAttachmentUrl = await uploadPendingFile(values.fileAttachmentUrl, 'daily-contest');

      const payload = {
        dailyContestId: formik.values.dailyContestId || `DLC-${Date.now()}`,
        title: values.title,
        category: values.selectedCategories[0] || values.category || 'General',
        categories: values.selectedCategories,
        entryFee: feeVal,
        entryFeeType: values.isFree ? 'Free' : (values.entryFeeType || 'Coins'),
        isFree: values.isFree || feeVal === 0,
        entryFeeCoins: values.entryFeeType === 'Coins' ? feeVal : 0,
        coinsReward: Number(values.coinsReward) || Number(values.prize) || 0,
        prizePool: Number(values.prize) || 0,
        timerLimit: `${values.timerLimit} mins`,
        questionsCount: Number(values.questionsCount) || 20,
        difficulty: values.difficulty,
        description: values.description,
        rules: values.rules,
        imageUrl: uploadedImageUrl,
        videoUrl: uploadedVideoUrl,
        fileAttachmentUrl: uploadedFileAttachmentUrl,
        status: values.status,
        isActive: values.isActive && values.status !== 'Draft' && values.status !== 'In Progress',
        dailyStartTime: values.dailyStartTime,
        dailyEndTime: values.dailyEndTime,
        autoReset: true,
        resetIntervalHours: Number(values.resetIntervalHours) || 24
      };

      if (isMockMode) {
        showSnackbar('Mock Daily Contest created successfully!', 'success');
        navigate('/admin-dashboard/daily-contest');
        return;
      }

      try {
        const res = await axios.post('/api/admin/daily-contests', payload, { withCredentials: true });
        if (res.data.success) {
          showSnackbar('Daily Contest published successfully!', 'success');
          navigate('/admin-dashboard/daily-contest');
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to create daily contest', 'error');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleFormSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched({
        title: true,
        description: true,
        timerLimit: true
      });
      const firstError = Object.values(errors)[0];
      showSnackbar(`Please fix: ${firstError}`, 'warning');
      return;
    }
    await formik.submitForm();
  };

  return (
    <form onSubmit={handleFormSubmit} className="max-w-7xl mx-auto space-y-6 text-left animate-fade-in p-2 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <button
            onClick={() => navigate('/admin-dashboard/daily-contest')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-white/60 dark:hover:text-white transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Daily Contest Desk
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-poppins flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-500" />
            Create New Daily Contest ⚡
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
            Configure all contest parameters, rules, prize pools (Coins), timers & files on a single page with live preview.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFormSubmit}
          disabled={submitting}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shrink-0 cursor-pointer"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Create Contest</span>
        </button>
      </div>

      {/* Main Single Page Grid: Left Form Sections | Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: All Form Sections */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: General Information & Rules */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-brandPrimary border-b border-slate-100 dark:border-white/5 pb-3">
              <Trophy className="w-5 h-5 text-brandPrimary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                1. GENERAL INFORMATION, RULES & CATEGORIES
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 flex items-center justify-between">
                  <span>CONTEST ID</span>
                  <button
                    type="button"
                    onClick={() => formik.setFieldValue('dailyContestId', `DLC-${Math.floor(100000 + Math.random() * 900000)}`)}
                    className="text-[9px] text-indigo-500 hover:underline flex items-center gap-0.5 cursor-pointer font-extrabold"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Auto ID
                  </button>
                </label>
                <input
                  type="text"
                  name="dailyContestId"
                  value={formik.values.dailyContestId}
                  onChange={formik.handleChange}
                  placeholder="DLC-XXXXXX"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-indigo-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">CONTEST TITLE</label>
                <input
                  type="text"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter daily contest title..."
                  className={`w-full bg-slate-50 dark:bg-black/40 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all ${
                    formik.touched.title && formik.errors.title ? 'border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-brandPrimary'
                  }`}
                />
                {formik.touched.title && formik.errors.title && (
                  <span className="text-[10px] text-red-500 mt-1 block">{formik.errors.title}</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">DESCRIPTION</label>
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
              label="CONTEST RULES & GUIDELINES"
              value={formik.values.rules}
              onChange={(val) => formik.setFieldValue('rules', val)}
              placeholder="Enter rules, negative marking guidelines, disqualification policies..."
              rows={4}
            />

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">DIFFICULTY LEVEL</label>
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
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">CONTEST CATEGORIES (MULTI-SELECT & SEARCH)</label>
              <MultiSelect
                options={
                  categories.length > 0
                    ? categories.map(c => ({
                        value: c.title || c.name || c._id,
                        label: c.title || c.name || c._id,
                        icon: c.icon
                      }))
                    : [
                        { value: 'Speed Battle', label: 'Speed Battle' },
                        { value: 'Logic & Deduction', label: 'Logic & Deduction' },
                        { value: 'Reaction Reflex', label: 'Reaction Reflex' },
                        { value: 'Trivia Rush', label: 'Trivia Rush' }
                      ]
                }
                selected={formik.values.selectedCategories}
                onChange={(val) => {
                  formik.setFieldValue('selectedCategories', val);
                  if (val.length > 0) {
                    formik.setFieldValue('category', val[0]);
                  }
                }}
                placeholder="Search & Select Multiple Categories..."
              />
            </div>
          </div>

          {/* Section 2: Financials & Logistics (Coins 🪙) */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2 text-brandPrimary">
                <Coins className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  2. PRIZE POOL COINS 🪙, TIMER & SEATS
                </h3>
              </div>
              {formik.values.isFree && (
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                  🎉 Free Entry Active
                </span>
              )}
            </div>

            {/* Entry Fee Mode Selector */}
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-2">ENTRY FEE TYPE</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    formik.setFieldValue('entryFeeType', 'Free');
                    formik.setFieldValue('isFree', true);
                    formik.setFieldValue('fee', '0');
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    formik.values.isFree || formik.values.entryFeeType === 'Free'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🎁 Free Entry</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    formik.setFieldValue('entryFeeType', 'Coins');
                    formik.setFieldValue('isFree', false);
                    if (formik.values.fee === '0') formik.setFieldValue('fee', '50');
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    !formik.values.isFree && formik.values.entryFeeType === 'Coins'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🪙 Coins Entry</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    formik.setFieldValue('entryFeeType', 'Cash');
                    formik.setFieldValue('isFree', false);
                    if (formik.values.fee === '0') formik.setFieldValue('fee', '100');
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    !formik.values.isFree && formik.values.entryFeeType === 'Cash'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>💰 Cash Wallet (₹)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">PRIZE POOL (COINS 🪙)</label>
                <input
                  type="number"
                  name="prize"
                  value={formik.values.prize}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. 10000 Coins"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">
                  {formik.values.isFree ? 'ENTRY FEE (FREE)' : formik.values.entryFeeType === 'Coins' ? 'ENTRY FEE (COINS 🪙)' : 'ENTRY FEE (INR ₹)'}
                </label>
                <input
                  type="number"
                  name="fee"
                  disabled={formik.values.isFree}
                  value={formik.values.isFree ? '0' : formik.values.fee}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder={formik.values.isFree ? '0 (Free Entry)' : 'e.g. 50'}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">BONUS COINS REWARD 🪙</label>
                <input
                  type="number"
                  name="coinsReward"
                  value={formik.values.coinsReward || '0'}
                  onChange={formik.handleChange}
                  placeholder="e.g. 1000 Coins"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">TIME LIMIT (MINUTES)</label>
                <input
                  type="number"
                  name="timerLimit"
                  value={formik.values.timerLimit}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. 3 Mins"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">MAX PARTICIPANTS (SEATS)</label>
                <input
                  type="number"
                  name="maxPart"
                  value={formik.values.maxPart}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="500"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">QUESTIONS COUNT</label>
                <input
                  type="number"
                  name="questionsCount"
                  value={formik.values.questionsCount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="20"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Media Attachments */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-brandPrimary border-b border-slate-100 dark:border-white/5 pb-3">
              <Image className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                3. COVER IMAGE, VIDEO & DOCUMENT ATTACHMENTS
              </h3>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">CONTEST COVER IMAGE</label>
              <FileUploadPicker
                folder="daily-contest"
                type="image"
                value={formik.values.imageUrl}
                onChange={(url) => formik.setFieldValue('imageUrl', url)}
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">CONTEST TRAILER VIDEO</label>
              <FileUploadPicker
                folder="daily-contest"
                type="video"
                accept="video/*"
                value={formik.values.videoUrl}
                onChange={(url) => formik.setFieldValue('videoUrl', url)}
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">RULES PDF / DOCUMENT ATTACHMENT</label>
              <FileUploadPicker
                folder="daily-contest"
                type="file"
                accept=".pdf,.doc,.docx"
                value={formik.values.fileAttachmentUrl}
                onChange={(url) => formik.setFieldValue('fileAttachmentUrl', url)}
              />
            </div>
          </div>

          {/* Section 4: Schedule Timelines */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-brandPrimary border-b border-slate-100 dark:border-white/5 pb-3">
              <Calendar className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                4. SCHEDULE TIMELINES & EXECUTION STATUS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <TimePicker12h
                label="DAILY START TIME (12-HOUR FORMAT)"
                value={formik.values.dailyStartTime}
                onChange={(val) => formik.setFieldValue('dailyStartTime', val)}
              />

              <TimePicker12h
                label="DAILY END TIME (12-HOUR FORMAT)"
                value={formik.values.dailyEndTime}
                onChange={(val) => formik.setFieldValue('dailyEndTime', val)}
              />

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">IS ACTIVE STATUS (LIVE / PAUSED)</label>
                <CustomSelect
                  value={formik.values.isActive ? 'Active Mode (Live)' : 'Inactive Mode (Paused)'}
                  onChange={(val) => formik.setFieldValue('isActive', val.includes('Active'))}
                  options={[
                    { value: 'Active Mode (Live)', label: '🟢 Active Mode (Live on Portal)' },
                    { value: 'Inactive Mode (Paused)', label: '🔴 Inactive Mode (Paused / Hidden)' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">CONTEST EXECUTION STATUS</label>
                <CustomSelect
                  value={formik.values.status}
                  onChange={(val) => formik.setFieldValue('status', val)}
                  options={[
                    { value: 'Registration Open', label: 'Registration Open' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Draft', label: 'Draft' },
                    { value: 'Completed', label: 'Completed' }
                  ]}
                />
              </div>
            </div>

            {/* Dynamic Active Process Warning Notice */}
            {(formik.values.status === 'Draft' || formik.values.status === 'In Progress' || !formik.values.isActive) ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-extrabold uppercase text-[10px] tracking-wider text-amber-500 flex items-center gap-1.5">
                    <span>⚠️ CONTEST INACTIVE WARNING</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[9px]">PAUSED / NON-PUBLIC</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                    Contests set to <strong>"{formik.values.status}"</strong> or <strong>Inactive Mode</strong> are hidden from contestant portals and will not run automated 24-hour leaderboard resets.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-extrabold uppercase text-[10px] tracking-wider text-emerald-500 flex items-center gap-1.5">
                    <span>⚡ LIVE PROCESS ACTIVE NOTICE</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px]">LIVE & RUNNING</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                    Contest is published and active! Automated 24h quiz timers and leaderboard reset triggers will run daily between <strong>{formik.values.dailyStartTime || '09:00 AM'}</strong> and <strong>{formik.values.dailyEndTime || '11:59 PM'}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Live Interactive Preview */}
        <div className="lg:col-span-5 sticky top-6 space-y-6">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-brandPrimary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  LIVE INTERACTIVE PREVIEW
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Auto Synced
              </span>
            </div>

            {/* Preview Banner Box */}
            <div className="w-full h-40 bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden relative flex items-center justify-center">
              {formik.values.imageUrl ? (
                <img src={formik.values.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center space-y-1 text-slate-400">
                  <Image className="w-8 h-8 mx-auto stroke-1" />
                  <p className="text-[11px]">No Cover Image Selected</p>
                </div>
              )}
            </div>

            {/* Video & File Attachment Previews */}
            {formik.values.videoUrl && (
              <div className="text-left space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Video className="w-3 h-3 text-purple-500" /> PROMO VIDEO PREVIEW
                </div>
                <video src={formik.values.videoUrl} controls className="w-full max-h-36 rounded-xl border border-slate-200 dark:border-white/10 object-cover" />
              </div>
            )}

            {formik.values.fileAttachmentUrl && (
              <div className="text-left space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <FileText className="w-3 h-3 text-indigo-500" /> RULES ATTACHMENT
                </div>
                <a
                  href={formik.values.fileAttachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-2 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-xl text-xs font-bold hover:bg-indigo-500/20 transition-all"
                >
                  <File className="w-3.5 h-3.5" /> View Attached Rules Document 📄
                </a>
              </div>
            )}

            {/* Preview Title & Badges */}
            <div className="space-y-2 text-left">
              <span className="text-[9px] font-mono uppercase text-amber-500 font-extrabold">24H DAILY RESET ARENA</span>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {formik.values.title || 'Untitled Contest'}
              </h4>
              <span className="inline-block px-2 py-0.5 text-[9px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded uppercase">
                {formik.values.status}
              </span>
            </div>

            {/* Description Preview */}
            <div className="text-left space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">DESCRIPTION</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                {formik.values.description || 'No description provided.'}
              </p>
            </div>

            {/* Rules Preview */}
            <div className="text-left space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">CONTEST RULES & GUIDELINES</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-black/40 p-3 rounded-xl whitespace-pre-line font-mono text-[11px]">
                {formik.values.rules || 'No rules defined.'}
              </div>
            </div>

            {/* Metric Chips Box (Coins 🪙) */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-black/40 p-3 rounded-xl text-center text-xs">
              <div>
                <div className="text-[9px] text-slate-400 font-bold uppercase">Prize Pool</div>
                <div className="font-extrabold text-amber-500">{Number(formik.values.prize || 0).toLocaleString()} Coins 🪙</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 font-bold uppercase">Entry Fee</div>
                <div className="font-extrabold text-emerald-500">{formik.values.fee ? `${formik.values.fee} Coins 🪙` : 'Free Entry'}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 font-bold uppercase">Timer Limit</div>
                <div className="font-extrabold text-indigo-500">{formik.values.timerLimit || 3} Mins</div>
              </div>
            </div>

            {/* Big Confirm & Create Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Create Contest</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default DailyContestWizard;
