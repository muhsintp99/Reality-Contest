import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Layers, Plus, Upload, Play, Check, Clock, Trash, FileText, ChevronRight, GripVertical, Copy, X, Trash2, Edit } from 'lucide-react';
import axios from 'axios';
import { CustomSelect } from '../components/CustomSelect';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';

export const StageBuilder = () => {
  const { contestId, stageId } = useParams();
  const navigate = useNavigate();
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth.isMockMode);

  const [stage, setStage] = useState(null);
  const [poolId, setPoolId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Question form states
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState('Single Choice');
  const [qDiff, setQDiff] = useState('Medium');
  const [qMarks, setQMarks] = useState('1');
  const [qNeg, setQNeg] = useState('0');
  const [qExpl, setQExpl] = useState('');
  const [qTimer, setQTimer] = useState('0');
  const [options, setOptions] = useState([
    { text: 'Option A', isCorrect: true },
    { text: 'Option B', isCorrect: false }
  ]);

  const loadData = async () => {
    if (isMockMode) {
      setStage({ _id: stageId, name: 'Round 1: Screening', type: 'Question & Answer' });
      setQuestions([
        { _id: 'q-1', text: 'What is the capital of France?', type: 'Single Choice', marks: 2, options: [{ text: 'Paris', isCorrect: true }, { text: 'London', isCorrect: false }] },
        { _id: 'q-2', text: 'Explain the theory of relativity.', type: 'Long Text', marks: 10, options: [] }
      ]);
      setLoading(false);
      return;
    }

    try {
      // Fetch stage details indirectly via contest
      const sRes = await axios.get(`/api/contests/${contestId}/stages`, { withCredentials: true });
      const currentStage = (sRes.data.stages || []).find(s => s._id === stageId);
      if (!currentStage) {
        showAlert('Stage not found', 'error');
        setLoading(false);
        return;
      }
      setStage(currentStage);

      // Fetch or Create Pool for this stage
      const pRes = await axios.get('/api/question-pools', { withCredentials: true });
      const poolName = `StagePool_${stageId}`;
      let activePool = (pRes.data.pools || []).find(p => p.name === poolName);

      if (!activePool) {
        // Create pool
        const cPoolRes = await axios.post('/api/question-pools', { 
          name: poolName, 
          category: 'Stage Content', 
          description: `Auto-generated pool for stage ${stageId}` 
        }, { withCredentials: true });
        activePool = cPoolRes.data.pool;
      }

      setPoolId(activePool._id);
      
      // Fetch questions
      let qData = qRes.data.questions || [];
      qData.sort((a, b) => new Date(b.createdAt || b._id).getTime() - new Date(a.createdAt || a._id).getTime());
      setQuestions(qData);

    } catch (err) {
      console.error(err);
      showAlert('Failed to load builder data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [stageId, isMockMode]);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!qText) return;

    const data = {
      text: qText,
      type: qType,
      difficulty: qDiff,
      marks: parseFloat(qMarks),
      negativeMarks: parseFloat(qNeg),
      explanation: qExpl,
      questionTimer: parseInt(qTimer, 10),
      options: ['Single Choice', 'Multiple Choice'].includes(qType) ? options : []
    };

    if (isMockMode) {
      setQuestions(prev => [...prev, { _id: `q-${Date.now()}`, ...data }]);
      setQText('');
      showSnackbar('Mock question added.', 'success');
      setIsDrawerOpen(false);
      return;
    }

    try {
      const res = await axios.post(`/api/question-pools/${poolId}/questions`, data, { withCredentials: true });
      if (res.data.success) {
        setQText('');
        showSnackbar('Question added successfully.', 'success');
        setIsDrawerOpen(false);
        // reload questions
        const qRes = await axios.get(`/api/question-pools/${poolId}/questions`, { withCredentials: true });
        setQuestions(qRes.data.questions || []);
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to add question', 'error');
    }
  };

  const handleOptionChange = (idx, field, value) => {
    const newOptions = [...options];
    newOptions[idx][field] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: `Option ${String.fromCharCode(65 + options.length)}`, isCorrect: false }]);
  };

  const removeOption = (idx) => {
    const newOptions = [...options];
    newOptions.splice(idx, 1);
    setOptions(newOptions);
  };

  if (loading) return <div className="p-8 text-white/50 text-center animate-pulse">Loading Stage Builder...</div>;

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-wider mb-2">
        <span className="hover:text-brandPrimary cursor-pointer transition-colors" onClick={() => navigate('/admin-dashboard/contests')}>Contests</span>
        <ChevronRight className="w-3 h-3" />
        <span className="hover:text-brandPrimary cursor-pointer transition-colors" onClick={() => navigate(`/admin-dashboard/contests/${contestId}`)}>Stages</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-brandPrimary truncate max-w-[200px]">{stage?.name || stageId} Builder</span>
      </div>

      <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Question & Answer Builder</h2>
          <p className="text-xs text-white/50 mt-1">Design the content and logic for <span className="text-white font-bold">{stage?.name}</span></p>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-brandPrimary/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="p-8 bg-white/5 rounded-2xl text-center text-xs text-white/40 border border-white/5">
            No questions added yet. Click "Add Question" to build this stage.
          </div>
        ) : (
          questions.map((q, idx) => (
            <div key={q._id} className="p-4 bg-[#080b12] border border-white/10 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 hover:border-brandPrimary/30 transition-all group">
              <div className="flex items-start gap-4 flex-1">
                <div className="cursor-grab active:cursor-grabbing p-1 mt-0.5 text-white/20 hover:text-white/60">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex gap-2 items-center mb-1">
                    <span className="text-[10px] text-brandSecondary font-bold">Q{idx + 1}</span>
                    <span className="text-[9px] bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary px-2 py-0.5 rounded font-extrabold uppercase">
                      {q.type}
                    </span>
                    <span className="text-[9px] bg-white/10 border border-white/10 text-white/70 px-2 py-0.5 rounded font-extrabold">
                      {q.marks} Pts
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-white">{q.text}</h4>
                  
                  {['Single Choice', 'Multiple Choice'].includes(q.type) && q.options && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, i) => (
                        <div key={i} className={`text-[10px] px-2 py-1.5 rounded flex items-center gap-2 border ${opt.isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-white/60'}`}>
                          {opt.isCorrect && <Check className="w-3 h-3" />}
                          <span className={opt.isCorrect ? 'font-bold' : ''}>{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex sm:flex-col gap-2 items-center sm:items-end justify-end border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-4">
                <button title="Duplicate" className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-full transition-all">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button title="Edit Question" className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full transition-all">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => showConfirm({ title: 'Delete', message: 'Delete this question?', onConfirm: () => {} })} title="Delete Question" className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <RightDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Question Creator"
      >
        <form onSubmit={handleAddQuestion} className="flex flex-col h-full">
          <div className="flex-1 space-y-6">
            <div>
              <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Question Setup</div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Question Type</label>
                  <CustomSelect
                    value={qType}
                    onChange={setQType}
                    options={[
                      { value: 'Single Choice', label: 'Single Choice (MCQ)' },
                      { value: 'Multiple Choice', label: 'Multiple Choice' },
                      { value: 'True False', label: 'True / False' },
                      { value: 'Short Text', label: 'Short Text input' },
                      { value: 'Long Text', label: 'Long Text (Textarea)' },
                      { value: 'Number', label: 'Number Input' }
                    ]}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Question Text</label>
                  <textarea
                    required
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    placeholder="What is the main objective of this stage?"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white resize-none h-20"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Scoring & Timing</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Marks</label>
                  <input
                    type="number"
                    value={qMarks}
                    onChange={(e) => setQMarks(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">-ve Marks</label>
                  <input
                    type="number"
                    value={qNeg}
                    onChange={(e) => setQNeg(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Timer (s)</label>
                  <input
                    type="number"
                    value={qTimer}
                    onChange={(e) => setQTimer(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {(['Single Choice', 'Multiple Choice', 'True False'].includes(qType)) && (
              <div>
                <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Answers</div>
                {['Single Choice', 'Multiple Choice'].includes(qType) && (
                  <div className="space-y-2">
                    <label className="block text-[10px] text-white/50 font-bold uppercase mb-1 flex justify-between">
                      Answer Options
                      <button type="button" onClick={addOption} className="text-brandPrimary hover:text-white flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </label>
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                        <input 
                          type={qType === 'Single Choice' ? 'radio' : 'checkbox'} 
                          name="correct_option"
                          checked={opt.isCorrect}
                          onChange={(e) => {
                            if (qType === 'Single Choice') {
                              const newOps = options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                              setOptions(newOps);
                            } else {
                              handleOptionChange(idx, 'isCorrect', e.target.checked);
                            }
                          }}
                          className="w-4 h-4 accent-brandPrimary"
                        />
                        <input 
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                          className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none"
                        />
                        {options.length > 2 && (
                          <button type="button" onClick={() => removeOption(idx)} className="text-white/30 hover:text-red-400">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {qType === 'True False' && (
                  <div className="space-y-2">
                    <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Correct Answer</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-white">
                        <input type="radio" name="tf" value="true" className="accent-brandPrimary" /> True
                      </label>
                      <label className="flex items-center gap-2 text-xs text-white">
                        <input type="radio" name="tf" value="false" className="accent-brandPrimary" /> False
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-4 border-t border-white/5">
            <button
              type="submit"
              className="w-full py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Save Question
            </button>
          </div>
        </form>
      </RightDrawer>
    </div>
  );
};

export default StageBuilder;
