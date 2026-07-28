import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Trophy, Coins, Calendar, ShieldAlert, Sparkles, ChevronLeft, ChevronRight, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { MultiSelect } from '../components/MultiSelect';
import { CustomSelect } from '../components/CustomSelect';
import { useNavigate, useParams } from 'react-router-dom';

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
  const { showAlert, showSnackbar } = useAlert();
  const isMockMode = useSelector((state) => state.auth.isMockMode);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    { id: 1, title: 'Identity', desc: 'Basic description', icon: Trophy },
    { id: 2, title: 'Financials', desc: 'Fees & prize pools', icon: Coins },
    { id: 3, title: 'Registration', desc: 'Enrollment timelines', icon: Calendar },
    { id: 4, title: 'Execution', desc: 'Contest duration & status', icon: ShieldAlert },
  ];

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      prize: '100000',
      fee: '499',
      maxPart: '500',
      selectedCategories: [],
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
      regStartDate: Yup.string().required('Registration start date is required'),
      regStartTime: Yup.string().required('Registration start time is required'),
      regEndDate: Yup.string().required('Registration end date is required'),
      regEndTime: Yup.string().required('Registration end time is required'),
      tStartDate: Yup.string().required('Contest start date is required'),
      tStartTime: Yup.string().required('Contest start time is required'),
      tEndDate: Yup.string().required('Contest end date is required'),
      tEndTime: Yup.string().required('Contest end time is required')
    }),
    onSubmit: async (values) => {
      setSubmitting(true);
      const data = {
        title: values.title,
        description: values.description,
        prizePool: parseFloat(values.prize),
        registrationStart: combineDateTime(values.regStartDate, values.regStartTime),
        registrationEnd: combineDateTime(values.regEndDate, values.regEndTime),
        startDate: combineDateTime(values.tStartDate, values.tStartTime),
        endDate: combineDateTime(values.tEndDate, values.tEndTime),
        entryFee: parseFloat(values.fee),
        maxParticipants: parseInt(values.maxPart, 10),
        categories: values.selectedCategories,
        status: values.status
      };

      if (isMockMode) {
        showSnackbar(contestId ? 'Mock contest updated successfully.' : 'Mock contest created successfully.', 'success');
        navigate('/admin-dashboard/contests');
        return;
      }

      try {
        if (contestId) {
          const res = await axios.put(`/api/contests/${contestId}`, data, { withCredentials: true });
          if (res.data.success) {
            showSnackbar('Contest updated successfully.', 'success');
            navigate('/admin-dashboard/contests');
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
        const c = { _id: contestId, title: 'India Creator Showdown 2026', description: 'Vlogging, photography, and cinematography creative expression.', entryFee: 499, prizePool: 1000000, status: 'Registration Open', startDate: '2026-07-01T12:00:00', endDate: '2026-07-15T18:00:00', registrationStart: '2026-06-01T09:00:00', registrationEnd: '2026-06-30T23:59:00', maxParticipants: 1000, categories: ['cat-2'] };
        const regStartSplit = splitDateTime(c.registrationStart);
        const regEndSplit = splitDateTime(c.registrationEnd);
        const tStartSplit = splitDateTime(c.startDate);
        const tEndSplit = splitDateTime(c.endDate);

        formik.setValues({
          title: c.title,
          description: c.description || '',
          prize: String(c.prizePool),
          fee: String(c.entryFee),
          maxPart: String(c.maxParticipants),
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
      
      const res = await axios.get(`/api/contests`, { withCredentials: true });
      const c = res.data.contests?.find(x => x._id === contestId);
      if (c) {
        const regStartSplit = splitDateTime(c.registrationStart);
        const regEndSplit = splitDateTime(c.registrationEnd);
        const tStartSplit = splitDateTime(c.startDate);
        const tEndSplit = splitDateTime(c.endDate);

        formik.setValues({
          title: c.title,
          description: c.description || '',
          prize: String(c.prizePool),
          fee: String(c.entryFee),
          maxPart: String(c.maxParticipants),
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

  const validateStep = (step) => {
    if (step === 1) {
      formik.setFieldTouched('title', true);
      formik.setFieldTouched('description', true);
      if (!formik.values.title || formik.errors.title || !formik.values.description || formik.errors.description) {
        return false;
      }
    } else if (step === 2) {
      formik.setFieldTouched('prize', true);
      formik.setFieldTouched('fee', true);
      formik.setFieldTouched('maxPart', true);
      if (
        formik.errors.prize ||
        formik.errors.fee ||
        formik.errors.maxPart
      ) {
        return false;
      }
    } else if (step === 3) {
      formik.setFieldTouched('regStartDate', true);
      formik.setFieldTouched('regStartTime', true);
      formik.setFieldTouched('regEndDate', true);
      formik.setFieldTouched('regEndTime', true);
      if (
        formik.errors.regStartDate ||
        formik.errors.regStartTime ||
        formik.errors.regEndDate ||
        formik.errors.regEndTime
      ) {
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      showSnackbar('Please resolve all validation errors before proceeding.', 'error');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 text-brandPrimary border-b border-white/5 pb-2 mb-4">
              <Trophy className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Step 1: General Details</span>
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Contest Title</label>
              <input
                type="text"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="National Reality Auditions"
                className={`w-full bg-black/40 border rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-all ${
                  formik.touched.title && formik.errors.title ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-brandPrimary'
                }`}
              />
              {formik.touched.title && formik.errors.title && (
                <span className="text-[10px] text-red-400 mt-1 block animate-fade-in">{formik.errors.title}</span>
              )}
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Description</label>
              <textarea
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Describe the category topics, criteria, and participation constraints..."
                rows={5}
                className={`w-full bg-black/40 border rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-all resize-none ${
                  formik.touched.description && formik.errors.description ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-brandPrimary'
                }`}
              />
              {formik.touched.description && formik.errors.description && (
                <span className="text-[10px] text-red-400 mt-1 block animate-fade-in">{formik.errors.description}</span>
              )}
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Preferred Categories</label>
              <MultiSelect
                options={categories.map(c => ({ value: c._id, label: c.title }))}
                value={formik.values.selectedCategories}
                onChange={(val) => formik.setFieldValue('selectedCategories', val)}
                placeholder="Select Categories..."
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 text-brandPrimary border-b border-white/5 pb-2 mb-4">
              <Coins className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Step 2: Financials & Logistics</span>
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Prize Pool Pool (INR)</label>
              <input
                type="number"
                name="prize"
                value={formik.values.prize}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full bg-black/40 border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all ${
                  formik.touched.prize && formik.errors.prize ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-brandPrimary'
                }`}
              />
              {formik.touched.prize && formik.errors.prize && (
                <span className="text-[10px] text-red-400 mt-1 block animate-fade-in">{formik.errors.prize}</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Entry Fee (INR)</label>
                <input
                  type="number"
                  name="fee"
                  value={formik.values.fee}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full bg-black/40 border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all ${
                    formik.touched.fee && formik.errors.fee ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-brandPrimary'
                  }`}
                />
                {formik.touched.fee && formik.errors.fee && (
                  <span className="text-[10px] text-red-400 mt-1 block animate-fade-in">{formik.errors.fee}</span>
                )}
              </div>
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Max Participants</label>
                <input
                  type="number"
                  name="maxPart"
                  value={formik.values.maxPart}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full bg-black/40 border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all ${
                    formik.touched.maxPart && formik.errors.maxPart ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-brandPrimary'
                  }`}
                />
                {formik.touched.maxPart && formik.errors.maxPart && (
                  <span className="text-[10px] text-red-400 mt-1 block animate-fade-in">{formik.errors.maxPart}</span>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 text-brandPrimary border-b border-white/5 pb-2 mb-4">
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Step 3: Registration Timelines</span>
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Registration Start Date & Time</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="regStartDate"
                  value={formik.values.regStartDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brandPrimary"
                />
                <input
                  type="time"
                  name="regStartTime"
                  value={formik.values.regStartTime}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Registration End Date & Time</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="regEndDate"
                  value={formik.values.regEndDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brandPrimary"
                />
                <input
                  type="time"
                  name="regEndTime"
                  value={formik.values.regEndTime}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 text-brandPrimary border-b border-white/5 pb-2 mb-4">
              <ShieldAlert className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Step 4: Execution Period & Status</span>
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Contest Execution Start Date & Time</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="tStartDate"
                  value={formik.values.tStartDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brandPrimary"
                />
                <input
                  type="time"
                  name="tStartTime"
                  value={formik.values.tStartTime}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Contest Execution End Date & Time</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="tEndDate"
                  value={formik.values.tEndDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brandPrimary"
                />
                <input
                  type="time"
                  name="tEndTime"
                  value={formik.values.tEndTime}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Contest Stage Status</label>
              <CustomSelect
                value={formik.values.status}
                onChange={(val) => formik.setFieldValue('status', val)}
                options={[
                  { value: 'Registration Open', label: 'Registration Open' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Completed', label: 'Completed' }
                ]}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-pulse">
        <div className="flex flex-col items-center gap-3 text-white/50">
          <div className="w-8 h-8 border-2 border-brandPrimary/30 border-t-brandPrimary rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-widest">Loading Contest Configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left animate-fade-in">
      <button
        onClick={() => navigate('/admin-dashboard/contests')}
        className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Syndicate Architect
      </button>

      <div>
        <h2 className="text-xl font-bold text-white font-poppins flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-brandPrimary" />
          {contestId ? 'Modify Contest Settings' : 'Syndicate New Contest'}
        </h2>
        <p className="text-xs text-white/50 mt-1">
          {contestId
            ? 'Adjust prize pools, update timelines, or modify categories for this tournament.'
            : 'Register a new contest event in the syndicate, configure entrance fees, and allocate rewards.'}
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2 border-b border-white/5 pb-4">
        {steps.map((s) => {
          const StepIcon = s.icon;
          const isActive = s.id === currentStep;
          const isCompleted = s.id < currentStep;

          return (
            <div 
              key={s.id} 
              className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all ${
                isActive 
                  ? 'bg-brandPrimary/10 border-brandPrimary text-white' 
                  : isCompleted 
                  ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-400' 
                  : 'bg-white/5 border-white/5 text-white/40'
              }`}
            >
              <StepIcon className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold mt-1 tracking-wider uppercase hidden sm:inline">{s.title}</span>
            </div>
          );
        })}
      </div>

      {/* Main Form container */}
      <form onSubmit={formik.handleSubmit} className="glassmorphism border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        {renderStepContent()}

        {/* Action Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-white/5">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-brandPrimary/10"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-gradient-to-r from-brandPrimary to-brandSecondary hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{contestId ? 'Save Changes' : 'Syndicate Contest'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ContestWizard;
