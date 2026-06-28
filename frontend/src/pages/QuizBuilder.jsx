import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Layers, Plus, Upload, Play, Check, Clock, Trash, FileText, ChevronRight } from 'lucide-react';
import axios from 'axios';

export const QuizBuilder = () => {
  const { isMockMode } = useAuthStore();
  const [pools, setPools] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pool form states
  const [poolName, setPoolName] = useState('');
  const [poolCategory, setPoolCategory] = useState('General');
  const [poolDesc, setPoolDesc] = useState('');

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

  // Bulk import csv state
  const [csvContent, setCsvContent] = useState('');

  const fetchPools = async () => {
    if (isMockMode) {
      setPools([
        { _id: 'pool-1', name: 'National GK Qualifier Pool', category: 'Knowledge', description: 'Qualifier General Knowledge Pool' },
        { _id: 'pool-2', name: 'Software Development Core', category: 'Coding', description: 'MERN & Fullstack topics' }
      ]);
      return;
    }
    try {
      const res = await axios.get('/api/question-pools', { withCredentials: true });
      setPools(res.data.pools || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async (poolId) => {
    if (isMockMode) {
      setQuestions([
        { _id: 'q-1', text: 'Which framework uses Virtual DOM?', type: 'Single Choice', difficulty: 'Medium', marks: 1, options: [{ text: 'React', isCorrect: true }, { text: 'Angular', isCorrect: false }] },
        { _id: 'q-2', text: 'MongoDB is a SQL Database.', type: 'True False', difficulty: 'Easy', marks: 1, options: [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: true }] }
      ]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`/api/question-pools/${poolId}/questions`, { withCredentials: true });
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, [isMockMode]);

  const handleCreatePool = async (e) => {
    e.preventDefault();
    if (!poolName) return;

    if (isMockMode) {
      const p = { _id: `pool-${Date.now()}`, name: poolName, category: poolCategory, description: poolDesc };
      setPools(prev => [...prev, p]);
      setPoolName('');
      alert('Mock Pool Created.');
      return;
    }

    try {
      const res = await axios.post('/api/question-pools', { name: poolName, category: poolCategory, description: poolDesc }, { withCredentials: true });
      if (res.data.success) {
        setPoolName('');
        setPoolDesc('');
        alert('Question Pool created successfully.');
        fetchPools();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create pool');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedPool || !qText) return;

    const data = {
      text: qText,
      type: qType,
      difficulty: qDiff,
      marks: parseFloat(qMarks),
      negativeMarks: parseFloat(qNeg),
      explanation: qExpl,
      questionTimer: parseInt(qTimer, 10),
      options
    };

    if (isMockMode) {
      const q = { _id: `q-${Date.now()}`, ...data };
      setQuestions(prev => [...prev, q]);
      setQText('');
      alert('Mock Question added.');
      return;
    }

    try {
      const res = await axios.post(`/api/question-pools/${selectedPool._id}/questions`, data, { withCredentials: true });
      if (res.data.success) {
        setQText('');
        setQExpl('');
        alert('Question added successfully.');
        fetchQuestions(selectedPool._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add question');
    }
  };

  const handleCsvImport = async (e) => {
    e.preventDefault();
    if (!selectedPool || !csvContent) return;

    // Parse CSV simple parser
    const lines = csvContent.split('\n');
    const header = lines[0].split(',');
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length < 2) continue;
      rows.push({
        text: parts[0]?.trim(),
        type: parts[1]?.trim(),
        options: parts[2]?.trim(), // optionA (Correct); optionB
        marks: parts[3]?.trim(),
        negativeMarks: parts[4]?.trim(),
        difficulty: parts[5]?.trim(),
        explanation: parts[6]?.trim()
      });
    }

    if (isMockMode) {
      alert(`Simulated: Imported ${rows.length} questions successfully into pool.`);
      setCsvContent('');
      return;
    }

    try {
      const res = await axios.post(`/api/question-pools/${selectedPool._id}/import`, { rows }, { withCredentials: true });
      if (res.data.success) {
        setCsvContent('');
        alert(`Successfully imported ${res.data.count} questions.`);
        fetchQuestions(selectedPool._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Import failed');
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-poppins text-white dark:text-white light:text-black">
            Syndicate Quiz & Question Bank
          </h2>
          <p className="text-xs text-white/50">Configure question category repositories and setup quiz engines.</p>
        </div>
        {selectedPool && (
          <button
            onClick={() => setSelectedPool(null)}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white font-bold"
          >
            ← Back to Pools
          </button>
        )}
      </div>

      {!selectedPool ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pools List */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-xs font-bold uppercase text-brandPrimary tracking-wider">Question Repositories Pools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pools.map(p => (
                <div
                  key={p._id}
                  onClick={() => {
                    setSelectedPool(p);
                    fetchQuestions(p._id);
                  }}
                  className="p-5 bg-white/5 border border-white/5 hover:border-brandPrimary/30 rounded-2xl cursor-pointer flex flex-col justify-between h-40 group transition-all"
                >
                  <div>
                    <span className="text-[10px] bg-brandPrimary/15 border border-brandPrimary/25 text-brandPrimary px-2 py-0.5 rounded-full font-bold uppercase mb-2 inline-block">
                      {p.category}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-brandPrimary mt-1.5 transition-colors">{p.name}</h4>
                    <p className="text-[10px] text-white/45 mt-1 line-clamp-2">{p.description || 'No description provided.'}</p>
                  </div>
                  <div className="flex justify-end items-center text-[10px] text-brandPrimary font-bold gap-1 mt-2">
                    <span>Manage Questions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create Pool Form */}
          <form onSubmit={handleCreatePool} className="lg:col-span-4 glassmorphism p-5 rounded-2xl border border-white/10 space-y-4 h-fit">
            <h3 className="text-xs font-bold uppercase text-white tracking-wider">New Pool Blueprint</h3>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Pool Name</label>
              <input
                type="text"
                required
                value={poolName}
                onChange={(e) => setPoolName(e.target.value)}
                placeholder="National General Knowledge"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Category</label>
              <select
                value={poolCategory}
                onChange={(e) => setPoolCategory(e.target.value)}
                className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Knowledge">Knowledge</option>
                <option value="Science">Science</option>
                <option value="Coding">Coding Challenge</option>
                <option value="Arts">Arts</option>
                <option value="Audition">General Audition</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Description</label>
              <textarea
                value={poolDesc}
                onChange={(e) => setPoolDesc(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white h-20 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl shadow-lg transition-colors"
            >
              Initialize Pool
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Questions inside Pool */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-brandPrimary tracking-wider">
                Pool: {selectedPool.name} ({questions.length} questions)
              </h3>
            </div>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
              {questions.length === 0 ? (
                <div className="p-8 bg-white/5 rounded-2xl text-center text-xs text-white/40 border border-white/5">
                  No questions created in this pool repository yet.
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div key={q._id || idx} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-white flex-1">{q.text}</h4>
                      <div className="flex gap-2">
                        <span className="bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary px-2 py-0.5 rounded text-[8px] font-bold">
                          {q.type}
                        </span>
                        <span className="bg-brandSecondary/10 border border-brandSecondary/20 text-brandSecondary px-2 py-0.5 rounded text-[8px] font-bold">
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                    {q.options && (
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-white/60">
                        {q.options.map((o, oIdx) => (
                          <div key={oIdx} className={`px-2.5 py-1.5 rounded-lg border ${o.isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold' : 'bg-black/30 border-white/5'}`}>
                            {o.text} {o.isCorrect && '✓'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Section: Add or CSV Import tabs */}
          <div className="lg:col-span-5 space-y-6">
            {/* Add Question */}
            <form onSubmit={handleAddQuestion} className="glassmorphism p-5 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-xs font-bold uppercase text-white tracking-wider">Add Single Question</h3>
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Question Prompt</label>
                <input
                  type="text"
                  required
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="What is the output of 1 + 1?"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Type</label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value)}
                    className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Single Choice">Single Choice</option>
                    <option value="Multiple Choice">Multiple Choice</option>
                    <option value="True False">True / False</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Difficulty</label>
                  <select
                    value={qDiff}
                    onChange={(e) => setQDiff(e.target.value)}
                    className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Marks</label>
                  <input
                    type="number"
                    value={qMarks}
                    onChange={(e) => setQMarks(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Negative Marks</label>
                  <input
                    type="number"
                    value={qNeg}
                    onChange={(e) => setQNeg(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl shadow-lg transition-colors"
              >
                Add Question
              </button>
            </form>

            {/* CSV Import */}
            <form onSubmit={handleCsvImport} className="glassmorphism p-5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-brandPrimary" />
                <h3 className="text-xs font-bold uppercase text-white tracking-wider">CSV/Excel Copy-paste importer</h3>
              </div>
              <p className="text-[10px] text-white/40">
                Paste comma-separated rows. Format: <br />
                <code className="text-brandSecondary">text,type,options_with_correct_tag,marks,negative,difficulty,explanation</code>
              </p>
              <textarea
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder="text,type,options,marks,negativeMarks,difficulty,explanation&#10;What is React?,Single Choice,Library (Correct); Framework,2,0.5,Easy,Explanation details"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white h-24 font-mono resize-none"
              />
              <button
                type="submit"
                className="w-full py-2 bg-brandSecondary hover:bg-brandSecondary/90 text-white text-xs font-bold rounded-xl shadow-lg transition-colors"
              >
                Execute Bulk Import
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default QuizBuilder;
