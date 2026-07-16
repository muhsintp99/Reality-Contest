import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { CustomSelect } from '../components/CustomSelect';
import { ChevronRight, Plus, Clock, Play, Trash2, Edit, GripVertical } from 'lucide-react';

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
        { _id: 'st-1', name: 'Round 1: Screening', type: 'Question & Answer', timeLimit: 1800, description: 'Basic questions' },
        { _id: 'st-2', name: 'Round 2: Video Pitch', type: 'VideoUpload', timeLimit: 0, description: 'Upload pitch video' }
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
      timeLimit: parseInt(timeLimit, 10) || 0,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    };

    if (isMockMode) {
      setStages(prev => [...prev, { _id: `st-${Date.now()}`, ...data }]);
      setStageName('');
      setStageDesc('');
      setIsDrawerOpen(false);
      showSnackbar('Mock stage created.', 'success');
      return;
    }

    try {
      const res = await axios.post(`/api/contests/${contestId}/stages`, data, { withCredentials: true });
      if (res.data.success) {
        showSnackbar('Stage created successfully', 'success');
        setIsDrawerOpen(false);
        setStageName('');
        setStageDesc('');
        fetchDetails();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to create stage', 'error');
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

  if (loading) return <div className="p-8 text-white/50 text-center animate-pulse">Loading contest structure...</div>;
  if (!contest) return <div className="p-8 text-white/50 text-center">Contest not found.</div>;

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-wider mb-2">
        <span className="hover:text-brandPrimary cursor-pointer transition-colors" onClick={() => navigate('/admin-dashboard/contests')}>Contests</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white truncate max-w-[200px]">{contest.title}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-brandPrimary">Stages</span>
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
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-brandPrimary/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Stage
        </button>
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
        <form onSubmit={handleCreateStage} className="flex flex-col h-full">
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
