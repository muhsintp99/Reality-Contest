import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, RefreshCw, Layers, Trophy, Coins, Clock, Calendar,
  Users, CheckSquare, ShieldCheck, Sparkles, AlertCircle, FileText, Upload,
  Image as ImageIcon, Link as LinkIcon, X, Check, Eye, CheckCircle2, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../../context/AlertContext';
import { usePageTitle } from '../../context/PageTitleContext';
import { MultiSelect } from '../../components/MultiSelect';
import { uploadPendingFile } from '../../components/FileUploadPicker';

const formatDateForInput = (d) => {
  if (!d) return '';
  try {
    const date = new Date(d);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

const DEFAULT_RULES = '1. Complete all assigned challenges before the room timer expires.\n2. Originality and high-quality submissions are evaluated by judges.\n3. Fair-play and anti-cheating guidelines strictly enforced.';
const DEFAULT_GUIDELINES = '1. Participants must maintain regular participation streaks.\n2. Milestone submissions unlock extra reward coins.\n3. Room rankings update dynamically based on approved points.';
const getSafeImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/')) return url;
  return `/${url}`;
};

export const CreateRoomPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const isEditMode = Boolean(roomId);
  const { showAlert, showSnackbar } = useAlert();
  const { setCustomTitle } = usePageTitle();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' | 'url'
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const [formData, setFormData] = useState({
    code: `RM-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    description: '',
    rules: DEFAULT_RULES,
    guidelines: DEFAULT_GUIDELINES,
    prizePool: 10000,
    entryFee: 50,
    entryFeeType: 'Coins',
    isFree: false,
    entryFeeCoins: 50,
    coinsReward: 500,
    timerLimit: 30,
    maxMembers: 50,
    durationDays: 14,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    registrationStart: new Date().toISOString().split('T')[0],
    registrationEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taskIds: [],
    roomImage: '',
    status: 'Active',
    autoAssignment: true
  });

  // Fetch available tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let list = [];
        const res = await axios.get('/api/admin/tasks?limit=100').catch(() => null);
        if (res?.data?.success) {
          const raw = res.data.data;
          list = Array.isArray(raw?.tasks) ? raw.tasks : Array.isArray(raw) ? raw : (Array.isArray(res.data.tasks) ? res.data.tasks : []);
        }
        setAvailableTasks((prev) => {
          const map = new Map();
          prev.forEach(t => { if (t && (t._id || t.id)) map.set(String(t._id || t.id), t); });
          list.forEach(t => { if (t && (t._id || t.id)) map.set(String(t._id || t.id), t); });
          return Array.from(map.values());
        });
      } catch (err) {
        console.error('Error fetching available tasks:', err);
      }
    };
    fetchTasks();
  }, []);

  // Fetch room data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchRoom = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`/api/week/rooms/${roomId}`).catch(() => null);
          if (res?.data?.success) {
            const r = res.data.data?.room || res.data.data || {};

            // Merge populated tasks from room or response into availableTasks so title & points render
            if (Array.isArray(r.taskIds) && r.taskIds.length > 0 && typeof r.taskIds[0] === 'object') {
              setAvailableTasks((prev) => {
                const map = new Map(prev.map(t => [String(t._id || t.id), t]));
                r.taskIds.forEach(t => {
                  if (t && (t._id || t.id)) map.set(String(t._id || t.id), t);
                });
                return Array.from(map.values());
              });
            } else if (Array.isArray(res.data.data?.tasks) && res.data.data.tasks.length > 0) {
              setAvailableTasks((prev) => {
                const map = new Map(prev.map(t => [String(t._id || t.id), t]));
                res.data.data.tasks.forEach(t => {
                  if (t && (t._id || t.id)) map.set(String(t._id || t.id), t);
                });
                return Array.from(map.values());
              });
            }

            if (r.roomImage && (r.roomImage.startsWith('http://') || r.roomImage.startsWith('https://'))) {
              setImageInputMode('url');
            }

            setFormData({
              code: r.code || '',
              name: r.name || '',
              description: r.description || '',
              rules: r.rules || DEFAULT_RULES,
              guidelines: r.guidelines || DEFAULT_GUIDELINES,
              prizePool: r.prizePool !== undefined && Number(r.prizePool) > 0 ? Number(r.prizePool) : (r.entryFeeType === 'Cash' ? 50000 : 10000),
              entryFee: r.entryFee !== undefined && r.entryFee > 0 ? r.entryFee : (r.entryFeeType === 'Cash' ? 99 : (r.entryFeeCoins || 50)),
              entryFeeType: r.entryFeeType === 'Cash' ? 'Cash' : 'Coins',
              isFree: false,
              entryFeeCoins: r.entryFeeType === 'Cash' ? 0 : (r.entryFeeCoins || r.entryFee || 50),
              coinsReward: r.coinsReward !== undefined && Number(r.coinsReward) > 0 ? Number(r.coinsReward) : (r.entryFeeType === 'Cash' ? 0 : 1000),
              timerLimit: r.timerLimit || 30,
              maxMembers: r.maxMembers || 50,
              durationDays: r.durationDays || 14,
              startDate: formatDateForInput(r.startDate || new Date()),
              endDate: formatDateForInput(r.endDate || new Date(Date.now() + (r.durationDays || 14) * 24 * 60 * 60 * 1000)),
              registrationStart: formatDateForInput(r.registrationStart || new Date()),
              registrationEnd: formatDateForInput(r.registrationEnd || new Date(Date.now() + (r.durationDays || 14) * 24 * 60 * 60 * 1000)),
              taskIds: Array.isArray(r.taskIds)
                ? r.taskIds.map((t) => String(typeof t === 'object' ? (t._id || t.id) : t))
                : [],
              roomImage: r.roomImage || '',
              status: r.status || 'Active',
              autoAssignment: r.autoAssignment !== false
            });
            if (r.name || r.title) {
              setCustomTitle(`Edit ${r.name || r.title}`);
            }
          } else {
            showAlert('Failed to load room details', 'error');
          }
        } catch (err) {
          console.error('Error fetching room for edit:', err);
          showAlert(err.response?.data?.message || 'Failed to load room details', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchRoom();
    } else {
      setCustomTitle('Create Room');
    }
    return () => setCustomTitle(null);
  }, [isEditMode, roomId, setCustomTitle]);

  // Handle image upload from file picker or drag-and-drop with direct server upload
  const handleImageFileUpload = async (fileOrEvent) => {
    let file = null;
    if (fileOrEvent?.target?.files) {
      file = fileOrEvent.target.files[0];
    } else if (fileOrEvent instanceof File) {
      file = fileOrEvent;
    }
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('Please select a valid image file (PNG, JPG, WebP, etc.)', 'warning');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showAlert('Image file size must be less than 10MB', 'warning');
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append('folder', 'room');
      uploadData.append('file', file);

      let uploadedUrl = '';
      try {
        const res = await axios.post('/api/upload/room', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        if (res.data?.success && res.data?.fileUrl) {
          uploadedUrl = res.data.fileUrl;
        }
      } catch (err1) {
        try {
          const res2 = await axios.post('/api/admin/upload/room', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
          });
          if (res2.data?.success && res2.data?.fileUrl) {
            uploadedUrl = res2.data.fileUrl;
          }
        } catch (err2) {
          try {
            const res3 = await axios.post('/api/upload?folder=room', uploadData, {
              headers: { 'Content-Type': 'multipart/form-data' },
              withCredentials: true
            });
            if (res3.data?.success && res3.data?.fileUrl) {
              uploadedUrl = res3.data.fileUrl;
            }
          } catch (err3) {
            console.warn('Direct upload endpoint error, falling back to base64 reader:', err3);
          }
        }
      }

      if (uploadedUrl) {
        setImageLoadError(false);
        setFormData((prev) => ({ ...prev, roomImage: uploadedUrl }));
        showSnackbar('Room cover image uploaded successfully!', 'success');
      } else {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const base64 = uploadEvent.target?.result;
          if (typeof base64 === 'string') {
            setImageLoadError(false);
            setFormData((prev) => ({ ...prev, roomImage: base64 }));
            showSnackbar('Image attached preview ready.', 'info');
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn('Direct upload failed, using local reader fallback:', err);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result;
        if (typeof base64 === 'string') {
          setFormData((prev) => ({ ...prev, roomImage: base64 }));
          showSnackbar('Image attached locally.', 'info');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Helper to sync end date from start date + durationDays
  const handleSyncEndDate = () => {
    if (!formData.startDate) return;
    const days = Math.max(1, Number(formData.durationDays) || 14);
    const start = new Date(formData.startDate);
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    const endStr = formatDateForInput(end);
    setFormData((prev) => ({
      ...prev,
      endDate: endStr,
      registrationEnd: endStr
    }));
    showSnackbar(`End date synced to +${days} days (${endStr})`, 'info');
  };

  // Helper to set registration window starting today
  const handleSetRegistrationOpen = () => {
    const today = new Date();
    const days = Math.max(1, Number(formData.durationDays) || 14);
    const end = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    setFormData((prev) => ({
      ...prev,
      status: 'Registration Open',
      registrationStart: formatDateForInput(today),
      registrationEnd: formatDateForInput(end),
      startDate: formatDateForInput(today),
      endDate: formatDateForInput(end)
    }));
    showSnackbar('Registration dates & status set to Open starting today!', 'success');
  };

  // Submit Handler with full field sanitization
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      showAlert('Please enter a room name', 'warning');
      return;
    }

    if (!formData.code.trim()) {
      showAlert('Please provide or generate a room code', 'warning');
      return;
    }

    if (formData.registrationStart && formData.registrationEnd && new Date(formData.registrationEnd) < new Date(formData.registrationStart)) {
      showAlert('Registration End Date cannot be before Registration Start Date', 'warning');
      return;
    }

    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      showAlert('Execution End Date cannot be before Start Date', 'warning');
      return;
    }

    const isCash = formData.entryFeeType === 'Cash';

    // Persist pending base64 image if any
    let finalRoomImage = formData.roomImage;
    if (finalRoomImage && finalRoomImage.startsWith('data:')) {
      try {
        finalRoomImage = await uploadPendingFile(finalRoomImage, 'room');
      } catch (e) {
        console.warn('Could not persist base64 to uploads:', e);
      }
    }

    const payload = {
      ...formData,
      roomImage: finalRoomImage || '',
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      rules: formData.rules.trim(),
      guidelines: formData.guidelines.trim(),
      prizePool: Number(formData.prizePool) || (isCash ? 50000 : 10000),
      entryFee: Math.max(1, Number(formData.entryFee) || (isCash ? 99 : 50)),
      entryFeeCoins: isCash ? 0 : Math.max(1, Number(formData.entryFee) || 50),
      entryFeeType: isCash ? 'Cash' : 'Coins',
      isFree: false,
      coinsReward: Number(formData.coinsReward) || (isCash ? 0 : (Number(formData.prizePool) || 1000)),
      timerLimit: Math.max(1, Number(formData.timerLimit) || 30),
      maxMembers: Math.max(1, Number(formData.maxMembers) || 50),
      durationDays: Math.max(1, Number(formData.durationDays) || 14),
      startDate: formData.startDate || new Date(),
      endDate: formData.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      registrationStart: formData.registrationStart || new Date(),
      registrationEnd: formData.registrationEnd || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      taskIds: (formData.taskIds || []).map((t) => typeof t === 'object' ? (t._id || t.id) : t)
    };

    setSubmitting(true);
    try {
      if (isEditMode) {
        const res = await axios.put(`/api/week/rooms/${roomId}`, payload);
        if (res.data?.success) {
          showSnackbar('Room updated successfully!', 'success');
          navigate(`/admin-dashboard/bi-weekly-room/rooms/${roomId}`);
        }
      } else {
        const res = await axios.post('/api/week/rooms', payload);
        if (res.data?.success) {
          showSnackbar('Room created successfully!', 'success');
          const newId = res.data.data?._id || res.data.data?.id;
          if (newId) {
            navigate(`/admin-dashboard/bi-weekly-room/rooms/${newId}`);
          } else {
            navigate('/admin-dashboard/bi-weekly-room/rooms');
          }
        }
      }
    } catch (err) {
      console.error('Error submitting room form:', err);
      showAlert(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} room`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Selected tasks objects summary
  const selectedTasksList = useMemo(() => {
    const set = new Set((formData.taskIds || []).map(String));
    return availableTasks.filter((t) => set.has(String(t._id || t.id)));
  }, [availableTasks, formData.taskIds]);

  const totalSelectedPoints = useMemo(() => {
    return selectedTasksList.reduce((sum, t) => sum + (Number(t.points) || 0), 0);
  }, [selectedTasksList]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="lg:col-span-4 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in p-2 sm:p-4 max-w-7xl mx-auto">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin-dashboard/bi-weekly-room/rooms')}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Back to Room List"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-brandPrimary bg-brandPrimary/10 px-2.5 py-0.5 rounded-full border border-brandPrimary/20">
              {isEditMode ? 'Room Editor' : 'Room Wizard'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-brandPrimary" />
            {isEditMode ? `Edit Room: ${formData.name || formData.code}` : 'Create New Challenge Room ⚡'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure Prize Pool, Challenge Timer, Seat Limits, Schedule Timelines, Tasks, and Execution Status.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin-dashboard/bi-weekly-room/rooms')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-indigo-500/25 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEditMode ? 'Save Changes' : 'Create Room'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Responsive Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: Form Cards (8 cols) ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: General Details & Visuals */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2 text-brandPrimary">
                <Layers className="w-5 h-5 text-brandPrimary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  1. Room Information & Visual Identity
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Basic room identifiers & cover</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 flex items-center justify-between">
                  <span>Room Code <span className="text-red-500">*</span></span>
                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, code: `RM-${Math.floor(100 + Math.random() * 900)}` }))}
                      className="text-[9px] text-indigo-500 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Auto-Gen
                    </button>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={formData.code ?? ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="RM-001"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-indigo-500 focus:outline-none focus:border-brandPrimary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">
                  Room Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name ?? ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Master Reality Arena: Alpha Division"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Room Description</label>
              <textarea
                rows={3}
                value={formData.description ?? ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe room objectives, category challenges, and rules..."
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary resize-none"
              />
            </div>

            {/* Room Image Upload / URL Mode */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Room Cover Image / Banner</label>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ${imageInputMode === 'upload' ? 'bg-white dark:bg-slate-900 text-brandPrimary shadow-sm font-bold' : 'text-slate-500'
                      }`}
                  >
                    <Upload className="w-3 h-3" /> File Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ${imageInputMode === 'url' ? 'bg-white dark:bg-slate-900 text-brandPrimary shadow-sm font-bold' : 'text-slate-500'
                      }`}
                  >
                    <LinkIcon className="w-3 h-3" /> Image URL
                  </button>
                </div>
              </div>

              {imageInputMode === 'upload' ? (
                <div className="space-y-3">
                  {!formData.roomImage || imageLoadError ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingImage(true);
                      }}
                      onDragLeave={() => setIsDraggingImage(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingImage(false);
                        const file = e.dataTransfer?.files?.[0];
                        if (file) handleImageFileUpload(file);
                      }}
                      className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group ${isDraggingImage
                          ? 'border-brandPrimary bg-brandPrimary/10 ring-4 ring-brandPrimary/10'
                          : 'border-slate-300 dark:border-white/10 hover:border-brandPrimary dark:hover:border-brandPrimary bg-slate-50/50 dark:bg-black/20 hover:bg-brandPrimary/5'
                        }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        disabled={isUploadingImage}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed"
                      />
                      <div className="flex flex-col items-center gap-2.5">
                        <div className="p-3 bg-brandPrimary/10 text-brandPrimary rounded-2xl group-hover:scale-110 transition-transform">
                          {isUploadingImage ? (
                            <RefreshCw className="w-6 h-6 animate-spin text-brandPrimary" />
                          ) : (
                            <Upload className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          {imageLoadError && (
                            <span className="text-[10px] text-amber-500 font-bold block mb-1">
                              ⚠️ Previous banner was unreachable on server. Upload a replacement below:
                            </span>
                          )}
                          <p className="text-xs font-bold text-slate-800 dark:text-white">
                            {isUploadingImage ? (
                              'Uploading image directly to /uploads/room/...'
                            ) : (
                              <>
                                Drag & drop room banner here or <span className="text-brandPrimary underline">Browse File</span>
                              </>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Supports PNG, JPG, WebP, GIF up to 10MB • Saved to server disk
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Uploaded Image Preview & Management Card */
                    <div className="p-3 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 h-44 bg-slate-900 group">
                        <img
                          src={getSafeImageUrl(formData.roomImage)}
                          alt="Room Banner Preview"
                          className="w-full h-full object-cover"
                          onError={() => setImageLoadError(true)}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <label className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 transition-colors">
                            <Upload className="w-3.5 h-3.5" /> Replace File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileUpload}
                              disabled={isUploadingImage}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, roomImage: '' }))}
                            className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 hover:bg-rose-700 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                        {isUploadingImage && (
                          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-brandPrimary" /> Updating image...
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 px-1">
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                            Banner Uploaded
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-xs font-mono">
                            {formData.roomImage}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <label className="text-[11px] text-brandPrimary hover:underline font-bold cursor-pointer">
                            Change
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileUpload}
                              disabled={isUploadingImage}
                              className="hidden"
                            />
                          </label>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, roomImage: '' }))}
                            className="text-[11px] text-rose-500 hover:underline font-bold cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.roomImage ?? ''}
                      onChange={(e) => setFormData({ ...formData, roomImage: e.target.value })}
                      placeholder="https://images.unsplash.com/... or paste image URL"
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary pr-10"
                    />
                    {formData.roomImage && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, roomImage: '' }))}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                        title="Clear URL"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {formData.roomImage && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 h-36 bg-slate-900">
                      <img
                        src={getSafeImageUrl(formData.roomImage)}
                        alt="URL Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Auto Assignment switch */}
            <div className="pt-2 flex items-center justify-between p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Automated Member Onboarding</span>
                <span className="text-[11px] text-slate-400 block">Allow system to auto-assign incoming contestants when seats are open</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoAssignment}
                  onChange={(e) => setFormData({ ...formData, autoAssignment: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brandPrimary"></div>
              </label>
            </div>
          </div>

          {/* Card 2: Prize Pool & Financials */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2 text-brandPrimary">
                <Coins className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  2. Prize Pool & Financial Structure
                </h3>
              </div>
            </div>

            {/* Entry Fee Mode Buttons */}
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-2">Entry Fee Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const nextFee = formData.entryFeeType === 'Cash' ? 50 : (Number(formData.entryFee) || 50);
                    setFormData({
                      ...formData,
                      entryFeeType: 'Coins',
                      isFree: false,
                      entryFee: nextFee,
                      entryFeeCoins: nextFee
                    });
                  }}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${formData.entryFeeType === 'Coins'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/30 shadow-md scale-[1.02]'
                      : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                >
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>🪙 Coins Mode (In-App)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextFee = formData.entryFeeType === 'Coins' ? 99 : (Number(formData.entryFee) || 99);
                    setFormData({
                      ...formData,
                      entryFeeType: 'Cash',
                      isFree: false,
                      entryFee: nextFee,
                      entryFeeCoins: 0
                    });
                  }}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${formData.entryFeeType === 'Cash'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/30 shadow-md scale-[1.02]'
                      : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                >
                  <span className="text-base leading-none">💵</span>
                  <span>💵 Cash Mode (INR ₹)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Prize Pool Field */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 flex items-center justify-between">
                  <span>Prize Pool {formData.entryFeeType === 'Coins' ? '(Coins 🪙)' : '(INR ₹)'}</span>
                  <span className={`text-[10px] font-black ${formData.entryFeeType === 'Coins' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {formData.entryFeeType === 'Coins' ? '🪙 Coins' : '₹ INR'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={formData.prizePool === '' ? '' : formData.prizePool}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, prizePool: val === '' ? '' : Math.max(0, Number(val)) });
                    }}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-black text-amber-500 focus:outline-none focus:border-amber-500"
                    placeholder={formData.entryFeeType === 'Coins' ? 'e.g. 10000 🪙' : 'e.g. 10000 ₹'}
                  />
                  <div className="absolute right-3 top-2.5 text-[11px] font-extrabold text-slate-400 pointer-events-none">
                    {formData.entryFeeType === 'Coins' ? '🪙 Coins' : '₹'}
                  </div>
                </div>
                {/* Prize Pool Presets */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(formData.entryFeeType === 'Coins'
                    ? [1000, 5000, 10000, 25000, 50000]
                    : [5000, 10000, 25000, 50000, 100000]).map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setFormData({ ...formData, prizePool: amt })}
                        className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-500/10 hover:text-amber-500 transition-colors cursor-pointer"
                      >
                        {formData.entryFeeType === 'Coins'
                          ? `${amt >= 1000 ? `${amt / 1000}k` : amt} 🪙`
                          : amt >= 100000 ? `₹${amt / 100000}L` : `₹${amt / 1000}k`}
                      </button>
                    ))}
                </div>
              </div>

              {/* Entry Fee Field */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 flex items-center justify-between">
                  <span>Entry Fee {formData.entryFeeType === 'Coins' ? '(Coins 🪙)' : '(INR ₹)'}</span>
                  <span className={`text-[10px] font-black ${formData.entryFeeType === 'Coins' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {formData.entryFeeType === 'Coins' ? '🪙 Coins' : '₹ INR'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={formData.entryFee === '' ? '' : formData.entryFee}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = val === '' ? '' : Number(val);
                      setFormData({
                        ...formData,
                        entryFee: num,
                        entryFeeCoins: formData.entryFeeType === 'Coins' ? (Number(num) || 0) : 0
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                    placeholder={formData.entryFeeType === 'Coins' ? 'e.g. 50 🪙' : 'e.g. 99 ₹'}
                  />
                  <div className="absolute right-3 top-2.5 text-[11px] font-extrabold text-slate-400 pointer-events-none">
                    {formData.entryFeeType === 'Coins' ? '🪙 Coins' : '₹'}
                  </div>
                </div>
                {/* Entry Fee Presets */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(formData.entryFeeType === 'Coins' ? [10, 25, 50, 100, 250] : [49, 99, 199, 499, 999]).map((fee) => (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        entryFee: fee,
                        entryFeeCoins: formData.entryFeeType === 'Coins' ? fee : 0
                      })}
                      className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brandPrimary/10 hover:text-brandPrimary transition-colors cursor-pointer"
                    >
                      {formData.entryFeeType === 'Coins' ? `${fee} 🪙` : `₹${fee}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bonus Milestone Coins Reward */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">
                  Bonus Milestone Reward 🪙
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.coinsReward === '' ? '' : formData.coinsReward}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, coinsReward: val === '' ? '' : Math.max(0, Number(val)) });
                  }}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                  placeholder="e.g. 500"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[100, 250, 500, 1000, 2500].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, coinsReward: r })}
                      className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-400/10 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      +{r}🪙
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Timer & Participant Seats */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-brandPrimary border-b border-slate-100 dark:border-white/5 pb-3">
              <Clock className="w-5 h-5 text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                3. Challenge Timer & Participant Seats
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Timer Limit */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">
                  Timer Limit (Minutes) ⏱️
                </label>
                <input
                  type="number"
                  min={1}
                  max={1440}
                  value={formData.timerLimit === '' ? '' : formData.timerLimit}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, timerLimit: val === '' ? '' : Math.max(1, Number(val)) });
                  }}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-black text-indigo-500 focus:outline-none focus:border-indigo-500"
                  placeholder="30"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[10, 15, 30, 45, 60, 120].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({ ...formData, timerLimit: m })}
                      className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors cursor-pointer"
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Capacity Seats */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">
                  Max Seats (Capacity) 👥
                </label>
                <input
                  type="number"
                  min={1}
                  max={50000}
                  value={formData.maxMembers === '' ? '' : formData.maxMembers}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, maxMembers: val === '' ? '' : Math.max(1, Number(val)) });
                  }}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                  placeholder="50"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[25, 50, 100, 250, 500].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, maxMembers: s })}
                      className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brandPrimary/10 hover:text-brandPrimary transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Days */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">
                  Duration (Days) ⏳
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={formData.durationDays === '' ? '' : formData.durationDays}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, durationDays: val === '' ? '' : Math.max(1, Number(val)) });
                  }}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-indigo-500 focus:outline-none focus:border-indigo-500"
                  placeholder="14"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[7, 14, 21, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFormData({ ...formData, durationDays: d })}
                      className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors cursor-pointer"
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Schedule Timelines & Execution Status */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2 text-brandPrimary">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  4. Schedule Timelines & Execution Status
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSetRegistrationOpen}
                  className="px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer border border-emerald-500/20"
                >
                  ⚡ Open Registration Today
                </button>
                <button
                  type="button"
                  onClick={handleSyncEndDate}
                  className="px-2 py-1 text-[10px] font-bold rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors cursor-pointer border border-indigo-500/20"
                >
                  ⏳ Sync +{formData.durationDays || 14}d End Date
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 space-y-2.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Registration Timeline Window</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Start Date</span>
                    <input
                      type="date"
                      value={formData.registrationStart ?? ''}
                      onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">End Date</span>
                    <input
                      type="date"
                      min={formData.registrationStart || undefined}
                      value={formData.registrationEnd ?? ''}
                      onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 space-y-2.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Contest Execution Run Window</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Start Date</span>
                    <input
                      type="date"
                      value={formData.startDate ?? ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">End Date</span>
                    <input
                      type="date"
                      min={formData.startDate || undefined}
                      value={formData.endDate ?? ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Execution Status</label>
              <select
                value={formData.status ?? 'Active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
              >
                <option value="Draft">Draft (Setup in progress)</option>
                <option value="Registration Open">Registration Open (Contestants can register)</option>
                <option value="Upcoming">Upcoming (Starting soon)</option>
                <option value="Active">Active (Live challenges active)</option>
                <option value="In Progress">In Progress (Judges/Evaluation running)</option>
                <option value="Completed">Completed (Winners decided)</option>
                <option value="Archived">Archived (Stored in history)</option>
                <option value="Inactive">Inactive (Disabled)</option>
              </select>
            </div>
          </div>

          {/* Card 5: Connect Tasks */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2 text-brandPrimary">
                <CheckSquare className="w-5 h-5 text-brandPrimary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  5. Connect Challenge Tasks
                </h3>
              </div>
              <span className="text-xs font-black text-brandPrimary">
                {(formData.taskIds || []).length} Tasks Connected • {totalSelectedPoints} Total Pts
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search and select tasks to include directly in this Room. Contestants must complete these tasks within the challenge timer.
            </p>

            <MultiSelect
              options={availableTasks.map((t) => ({
                value: String(t._id || t.id),
                label: `${t.title || t.name || 'Task'} (${t.taskType || t.submissionType || 'Task'} • ${t.points || 0} pts)`
              }))}
              selected={(formData.taskIds || []).map((t) => String(typeof t === 'object' ? (t._id || t.id) : t))}
              onChange={(val) => setFormData({ ...formData, taskIds: val })}
              placeholder="Search & Select Room Tasks..."
            />

            {/* Selected Tasks Mini Cards */}
            {selectedTasksList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {selectedTasksList.map((t) => (
                  <div
                    key={t._id || t.id}
                    className="p-2.5 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                        {t.title || t.name || 'Task'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {t.taskType || t.submissionType || 'Task'} • {t.points || 0} Points
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const idStr = String(t._id || t.id);
                        setFormData({
                          ...formData,
                          taskIds: formData.taskIds.filter((tid) => String(typeof tid === 'object' ? (tid._id || tid.id) : tid) !== idStr)
                        });
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remove task"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 6: Rules & Guidelines */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2 text-brandPrimary">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  6. Contest Rules & Scoring Policies
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, rules: DEFAULT_RULES, guidelines: DEFAULT_GUIDELINES }))}
                className="text-[10px] text-indigo-500 hover:underline font-bold cursor-pointer"
              >
                Reset to Standard Defaults
              </button>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Official Room Contest Rules 📜</label>
              <textarea
                rows={3}
                value={formData.rules ?? ''}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Participation Guidelines & Terms 📋</label>
              <textarea
                rows={3}
                value={formData.guidelines ?? ''}
                onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary resize-none"
              />
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Sticky Live Preview & Summary (4 cols) ================= */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* Live Preview Card */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg space-y-4">
            <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-brandPrimary" /> Live Room Card Preview
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                Interactive
              </span>
            </div>

            {/* Room Card Representation */}
            <div className="px-5 pb-5 space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 h-36 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
                {formData.roomImage && !imageLoadError ? (
                  <img
                    src={getSafeImageUrl(formData.roomImage)}
                    alt="Room cover"
                    className="w-full h-full object-cover"
                    onError={() => setImageLoadError(true)}
                  />
                ) : (
                  <div className="text-center p-4">
                    <Layers className="w-10 h-10 text-indigo-400/60 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-400">No cover image uploaded</span>
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-black/60 backdrop-blur-md text-emerald-400 border border-white/20 uppercase tracking-wider">
                    {formData.status}
                  </span>
                </div>
                {/* Room Code */}
                <div className="absolute bottom-2.5 left-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md text-white border border-white/20">
                    {formData.code || 'RM-XXX'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">
                  {formData.name || 'Untitled Room'}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                  {formData.description || 'Provide room description, prize pool and challenge objectives.'}
                </p>
              </div>

              {/* Prize Pool & Fee Pill */}
              <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block">Total Prize Pool</span>
                  <span className="text-lg font-black text-amber-500">
                    {formData.entryFeeType === 'Cash'
                      ? `₹${Number(formData.prizePool || 0).toLocaleString()}`
                      : `${Number(formData.prizePool || 0).toLocaleString()} 🪙 Coins`}
                    {formData.coinsReward ? <span className="text-xs text-amber-300 font-bold ml-1">+{formData.coinsReward}🪙</span> : null}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Entry Fee</span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    {formData.entryFeeType === 'Cash' ? `₹${formData.entryFee || 99}` : `${formData.entryFee || 50} 🪙 Coins`}
                  </span>
                </div>
              </div>

              {/* Timer Limit & Seat Meter */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" /> Timer Limit
                  </span>
                  <span className="font-black text-indigo-500">{formData.timerLimit || 30} Mins</span>
                  <span className="text-[9px] text-slate-400 block">{formData.durationDays || 14} Days Duration</span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
                    <Users className="w-3 h-3 text-brandPrimary" /> Capacity
                  </span>
                  <span className="font-black text-slate-900 dark:text-white">0 / {formData.maxMembers || 50}</span>
                  <span className="text-[9px] text-emerald-500 font-bold block">{formData.maxMembers || 50} Available Seats</span>
                </div>
              </div>

              {/* Connected Tasks Summary */}
              <div className="p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-brandPrimary" /> Connected Tasks
                </span>
                <span className="font-mono font-black text-brandPrimary">
                  {(formData.taskIds || []).length} Tasks ({totalSelectedPoints} Pts)
                </span>
              </div>
            </div>
          </div>

          {/* Configuration Checklist */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-2">
              Setup Validation Checklist
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                {formData.name.trim() ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span className={formData.name.trim() ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400'}>
                  Room Name & Code Configured
                </span>
              </div>

              <div className="flex items-center gap-2">
                {formData.prizePool >= 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Prize Pool & Financials Defined
                </span>
              </div>

              <div className="flex items-center gap-2">
                {formData.timerLimit > 0 && formData.maxMembers > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Timer Limit & Seat Capacity Set
                </span>
              </div>

              <div className="flex items-center gap-2">
                {formData.startDate && formData.endDate ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Contest Run Timelines Configured
                </span>
              </div>

              <div className="flex items-center gap-2">
                {(formData.taskIds || []).length > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className={(formData.taskIds || []).length > 0 ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400'}>
                  {(formData.taskIds || []).length > 0 ? `${(formData.taskIds || []).length} Tasks Connected` : 'No tasks connected yet (optional)'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isEditMode ? 'Update Room Now' : 'Publish & Create Room'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateRoomPage;
