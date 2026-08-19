import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import * as Icons from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { CustomSelect } from '../components/CustomSelect';
import { ChevronRight, Plus, Clock, Play, Trash2, Edit, GripVertical, BarChart2 } from 'lucide-react';

const STAGE_ICON_OPTIONS = [
  'Milestone', 'Trophy', 'Brain', 'Code', 'Video', 'Play', 'Users', 'Search', 'Shield', 'FileText', 'Star', 'Camera', 'Mic', 'HeartPulse', 'Globe', 'CheckCircle'
];

const DynamicIcon = ({ name, className }) => {
  const IconComponent = Icons[name] || Icons.Milestone;
  return <IconComponent className={className} />;
};

export const ContestDetails = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth.isMockMode);

  const [contest, setContest] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [stageName, setStageName] = useState('');
  const [stageDesc, setStageDesc] = useState('');
  const [stageType, setStageType] = useState('Question & Answer');
  const [timeLimit, setTimeLimit] = useState('1800');
  const [stageIcon, setStageIcon] = useState('Milestone');
  const [uploading, setUploading] = useState(false);
  const [iconType, setIconType] = useState('preset'); // 'preset' or 'upload'

  const fetchDetails = async () => {
    if (isMockMode) {
      setContest({
        _id: contestId,
        title: 'India Creator Showdown 2026',
        status: 'Registration Open',
        startDate: '2026-07-01',
        categories: ['cat-1', 'cat-2']
      });
      setStages([
        { _id: 'st-1', name: 'Round 1: Screening', type: 'Question & Answer', timeLimit: 1800, description: 'Basic questions', icon: 'Brain' },
        { _id: 'st-2', name: 'Round 2: Video Pitch', type: 'VideoUpload', timeLimit: 0, description: 'Upload pitch video', icon: 'Video' }
      ]);
      setLoading(false);
      return;
    }

    try {
      const [cRes, sRes] = await Promise.all([
        axios.get(`/api/contests/${contestId}`, { withCredentials: true }),
        axios.get(`/api/contests/${contestId}/stages`, { withCredentials: true })
      ]);
      let stageData = sRes.data.stages || [];
      stageData.sort((a, b) => new Date(b.createdAt || b._id).getTime() - new Date(a.createdAt || a._id).getTime());
      setContest(cRes.data.contest);
      setStages(stageData);
    } catch (err) {
      console.error(err);
      showAlert('Failed to load contest details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [contestId, isMockMode]);

  const handleCreateStage = async (e) => {
    e.preventDefault();
    if (!stageName) return;

    const data = {
      name: stageName,
      description: stageDesc,
      type: stageType,
      icon: stageIcon,
      timeLimit: parseInt(timeLimit, 10) || 0,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    };

    if (isMockMode) {
      setStages(prev => [...prev, { _id: `st-${Date.now()}`, ...data }]);
      resetForm();
      showSnackbar('Mock stage created.', 'success');
      return;
    }

    try {
      const res = await axios.post(`/api/contests/${contestId}/stages`, data, { withCredentials: true });
      if (res.data.success) {
        showSnackbar('Stage created successfully', 'success');
        resetForm();
        fetchDetails();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to create stage', 'error');
    }
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
        setStageIcon(res.data.fileUrl);
        showSnackbar('Icon image uploaded successfully.', 'success');
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to upload icon image.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteStage = (id) => {
    showConfirm({
      title: 'Delete Stage',
      message: 'Are you sure you want to delete this stage? This action cannot be undone.',
      onConfirm: () => {
        if (isMockMode) {
          setStages(prev => prev.filter(s => s._id !== id));
          showSnackbar('Stage deleted', 'success');
        } else {
          showAlert('Delete endpoint not implemented in backend yet', 'info');
        }
      }
    });
  };

  const resetForm = () => {
    setStageName('');
    setStageDesc('');
    setStageIcon('Milestone');
    setStageType('Question & Answer');
    setTimeLimit('1800');
    setIconType('preset');
    setIsDrawerOpen(false);
  };

  if (loading) return <div className="p-8 text-white/50 text-center animate-pulse">Loading contest structure...</div>;
  if (!contest) return <div className="p-8 text-white/50 text-center">Contest not found.</div>;

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-white/40 font-bold uppercase tracking-wider mb-2">
        <span className="hover:text-brandPrimary cursor-pointer transition-colors" onClick={() => navigate('/admin-dashboard/contests')}>Contests</span>
        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-white/30 shrink-0" />
        <span className="text-slate-800 dark:text-white truncate max-w-[200px]">{contest.title}</span>
        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-white/30 shrink-0" />
        <span className="text-brandPrimary font-bold">Stages</span>
      </div>

      {/* Header */}
      <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex gap-2 items-center mb-2">
            <span className="text-[10px] bg-brandPrimary/15 border border-brandPrimary/25 text-brandPrimary px-2.5 py-0.5 rounded-full font-extrabold uppercase">
              {contest.status}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">{contest.title}</h2>
          <p className="text-xs text-white/50 mt-1">Manage the sequence of stages for this contest.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin-dashboard/contests/${contestId}/analytics`)}
            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <BarChart2 className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-brandPrimary/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Stage
          </button>
        </div>
      </div>

      {/* Stages List */}
      <div className="space-y-3">
        {stages.length === 0 ? (
          <div className="p-8 bg-white/5 rounded-2xl text-center text-xs text-white/40 border border-white/5">
            No stages defined for this contest yet. Click "Add Stage" to begin.
          </div>
        ) : (
          stages.map((stage, idx) => (
            <div key={stage._id} className="p-4 bg-[#080b12] border border-white/10 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-brandPrimary/30 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="cursor-grab active:cursor-grabbing p-1 mt-0.5 text-white/20 hover:text-white/60">
                  <GripVertical className="w-4 h-4" />
                </div>
                {/* Custom Stage Icon Badge */}
                <div className="p-2 bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary rounded-xl flex items-center justify-center w-10 h-10 shrink-0 overflow-hidden">
                  {stage.icon && (stage.icon.startsWith('http') || stage.icon.startsWith('/') || stage.icon.startsWith('data:')) ? (
                    <img src={stage.icon} alt={stage.name} className="w-5.5 h-5.5 object-contain rounded-md animate-fade-in" />
                  ) : (
                    <DynamicIcon name={stage.icon || 'Milestone'} className="w-4.5 h-4.5" />
                  )}
                </div>
                <div>
                  <div className="flex gap-2 items-center mb-1">
                    <span className="text-[10px] text-brandSecondary font-bold">Stage {idx + 1}</span>
                    <span className="text-[9px] bg-white/10 border border-white/10 text-white/70 px-2 py-0.5 rounded font-extrabold uppercase">
                      {stage.type}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{stage.name}</h4>
                  <p className="text-[10px] text-white/45 mt-0.5">{stage.description || 'No description provided.'}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center justify-end">
                {stage.type === 'Question & Answer' && (
                  <button 
                    onClick={() => navigate(`/admin-dashboard/contests/${contestId}/stages/${stage._id}`)}
                    title="Builder"
                    className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-full transition-all"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
                <button title="Edit Stage" className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full transition-all">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteStage(stage._id)} title="Delete Stage" className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <RightDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create New Stage"
      >
        <form onSubmit={handleCreateStage} className="flex flex-col h-full text-left">
          <div className="flex-1 space-y-6">
            <div>
              <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">General Information</div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Stage Name</label>
                  <input
                    type="text"
                    required
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="Round 1: Screening"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Stage Description</label>
                  <textarea
                    value={stageDesc}
                    onChange={(e) => setStageDesc(e.target.value)}
                    placeholder="Briefly describe what this stage is about."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white resize-none h-20"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Representational Icon</div>
              
              {/* Tab Selector */}
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
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 scrollbar-hide">
                  {STAGE_ICON_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setStageIcon(item)}
                      className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                        stageIcon === item
                          ? 'bg-brandPrimary/20 border-brandPrimary text-brandPrimary shadow-lg shadow-brandPrimary/10'
                          : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <DynamicIcon name={item} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {stageIcon && (stageIcon.startsWith('http') || stageIcon.startsWith('/') || stageIcon.startsWith('data:')) ? (
                    <div className="relative border border-white/15 rounded-2xl p-4 bg-white/5 flex flex-col items-center justify-center gap-2 group/upload select-none">
                      <img src={stageIcon} alt="Custom Stage Icon" className="w-14 h-14 object-contain rounded-xl animate-fade-in" />
                      <span className="text-[10px] text-white/30 truncate max-w-full font-mono">{stageIcon.split('/').pop()}</span>
                      <button
                        type="button"
                        onClick={() => setStageIcon('Milestone')}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                        title="Remove Custom Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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

            <div>
              <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Configuration</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Stage Type</label>
                  <CustomSelect
                    value={stageType}
                    onChange={setStageType}
                    options={[
                      { value: 'Question & Answer', label: 'Question & Answer' },
                      { value: 'VideoUpload', label: 'Video Upload' },
                      { value: 'Custom', label: 'Custom' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Time Limit (Sec)</label>
                  <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-white/5">
            <button
              type="submit"
              className="w-full py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Stage
            </button>
          </div>
        </form>
      </RightDrawer>
    </div>
  );
};

export default ContestDetails;
