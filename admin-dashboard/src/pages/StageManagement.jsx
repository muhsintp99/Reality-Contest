import React, { useState, useEffect } from 'react';
import { Milestone, Plus, Info, Clock, CheckCircle, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { CustomSelect } from '../components/CustomSelect';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';

export const StageManagement = () => {
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const [groups, setGroups] = useState([]);
  const [pools, setPools] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [stages, setStages] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form states
  const [stageName, setStageName] = useState('');
  const [stageDesc, setStageDesc] = useState('');
  const [stageType, setStageType] = useState('Quiz'); // Quiz, VideoUpload, CustomStage, etc.
  const [timeLimit, setTimeLimit] = useState('1800'); // 30 minutes in seconds
  const [passScore, setPassScore] = useState('10');
  const [passPercentage, setPassPercentage] = useState('60');
  const [maxAttempts, setMaxAttempts] = useState('1');
  const [qualLogic, setQualLogic] = useState('minimum_score');
  const [poolId, setPoolId] = useState('');

  // Rules form states
  const [rulesText, setRulesText] = useState('Do not switch tabs during this stage.');
  const [instText, setInstText] = useState('Complete all questions before submitting.');

  const fetchGroupsAndPools = async () => {
    try {
      const gRes = await axios.get('/api/contests', { withCredentials: true });
      // Build a flat list of groups in all contests for visual selection
      const list = [];
      for (const c of gRes.data.contests || []) {
        if (c.groups) {
          list.push(...c.groups);
        }
      }
      setGroups(list.length > 0 ? list : [{ _id: 'g-1', name: 'Default Group A' }]);

      const pRes = await axios.get('/api/question-pools', { withCredentials: true });
      setPools(pRes.data.pools || []);
      if (pRes.data.pools && pRes.data.pools.length > 0) {
        setPoolId(pRes.data.pools[0]._id);
      }
    } catch (err) {
      console.error(err);
      setGroups([{ _id: 'g-1', name: 'Default Group A' }]);
    }
  };

  const fetchStages = async (groupId) => {
    try {
      const res = await axios.get(`/api/groups/${groupId}/stages`, { withCredentials: true });
      let data = res.data.stages || [];
      data.sort((a, b) => new Date(b.createdAt || b._id).getTime() - new Date(a.createdAt || a._id).getTime());
      setStages(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroupsAndPools();
  }, []);

  const handleSelectGroup = (g) => {
    setSelectedGroup(g);
    fetchStages(g._id);
  };

  const handleCreateStage = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !stageName) return;

    const data = {
      groupId: selectedGroup._id,
      name: stageName,
      description: stageDesc,
      type: stageType,
      timeLimit: parseInt(timeLimit, 10),
      passingScore: parseFloat(passScore),
      passingPercentage: parseFloat(passPercentage),
      maxAttempts: parseInt(maxAttempts, 10),
      qualificationLogic: qualLogic,
      rules: {
        rules: rulesText,
        instructions: instText,
        regulations: 'Violators will be disqualified immediately.',
        attemptPolicy: `Maximum of ${maxAttempts} attempts.`,
        disqualificationPolicy: 'Tab switches and exiting full-screen mode will trigger disqualification flags.'
      },
      config: {
        questionPoolId: stageType === 'Quiz' ? poolId : undefined
      }
    };

    try {
      const res = await axios.post(`/api/groups/${selectedGroup._id}/stages`, data, { withCredentials: true });
      if (res.data.success) {
        setStageName('');
        setStageDesc('');
        showSnackbar('Stage created successfully.', 'success');
        setIsDrawerOpen(false);
        fetchStages(selectedGroup._id);
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to create stage', 'error');
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-poppins text-white dark:text-white light:text-black">
            Syndicate Stage Blueprint Builder
          </h2>
          <p className="text-xs text-white/50">Build phases visually, bind quiz pools, and configure anti-cheat policies.</p>
        </div>
        {selectedGroup && (
          <button
            onClick={() => setSelectedGroup(null)}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white font-bold"
          >
            ← Change Cohort Group
          </button>
        )}
      </div>

      {!selectedGroup ? (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-brandPrimary tracking-wider">Select Cohort Group to Manage Stages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map(g => (
              <div
                key={g._id}
                onClick={() => handleSelectGroup(g)}
                className="p-5 bg-white/5 border border-white/5 hover:border-brandPrimary/30 rounded-2xl cursor-pointer flex justify-between items-center group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary rounded-xl">
                    <Milestone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-brandPrimary transition-colors">{g.name}</h4>
                    <p className="text-[10px] text-white/45">Build timeline phases</p>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-white/30 group-hover:text-brandPrimary transition-colors" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Stages List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-brandPrimary tracking-wider">
                Cohort: {selectedGroup.name} (Timeline Stages)
              </h3>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-brandPrimary/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Stage
              </button>
            </div>
            <div className="space-y-3.5">
              {stages.length === 0 ? (
                <div className="p-8 bg-white/5 rounded-2xl text-center text-xs text-white/40 border border-white/5">
                  No stages defined for this group cohort yet.
                </div>
              ) : (
                stages.map((s, idx) => (
                  <div key={s._id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <div className="flex gap-2.5 items-center mb-1.5">
                        <span className="text-[9px] bg-brandPrimary/10 border border-brandPrimary/25 text-brandPrimary px-2 py-0.5 rounded font-extrabold uppercase">
                          {s.type}
                        </span>
                        <span className="text-[9px] bg-brandSecondary/10 border border-brandSecondary/25 text-brandSecondary px-2 py-0.5 rounded font-bold flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {s.timeLimit > 0 ? `${s.timeLimit / 60}m` : 'Untimed'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{s.name}</h4>
                      <p className="text-[10px] text-white/45 mt-1">{s.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex sm:flex-col justify-end items-end gap-2 text-[10px] text-brandSecondary font-bold mt-2">
                      <span>Pass Criteria: {s.passingPercentage > 0 ? `${s.passingPercentage}%` : `${s.passingScore} pts`}</span>
                      <div className="flex gap-2">
                        <button title="Edit Stage" className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full transition-all">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button title="Delete Stage" className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Create Stage Form in Drawer */}
          <RightDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            title="Stage Configuration Builder"
          >
            <form onSubmit={handleCreateStage} className="flex flex-col h-full">
            <div className="flex-1 space-y-6">
              <div>
                <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">General Information</div>
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Stage Name</label>
                  <input
                    type="text"
                    required
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="Stage 1: GK Assessment"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
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
                        { value: 'Quiz', label: 'Quiz Engine' },
                        { value: 'VideoUpload', label: 'Video Upload' },
                        { value: 'Coding', label: 'Coding Challenge' },
                        { value: 'Judge Review', label: 'Judge Review' },
                        { value: 'AI Interview', label: 'AI Evaluation' }
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

            {stageType === 'Quiz' && pools.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4 mt-6">Question Pool</div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Select Question Pool</label>
                <CustomSelect
                  value={poolId}
                  onChange={setPoolId}
                  options={pools.map(p => ({ value: p._id, label: p.name }))}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Passing %</label>
                <input
                  type="number"
                  value={passPercentage}
                  onChange={(e) => setPassPercentage(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Max Attempts</label>
                <input
                  type="number"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Anti-Cheat Rules Prompt</label>
              <textarea
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white h-16 resize-none"
              />
            </div>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5">
              <button
                type="submit"
                className="w-full py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Publish Stage
              </button>
            </div>
            </form>
          </RightDrawer>
        </div>
      )}
    </div>
  );
};

export default StageManagement;
