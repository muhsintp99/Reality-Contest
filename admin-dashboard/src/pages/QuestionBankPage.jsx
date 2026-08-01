import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  HelpCircle, Plus, FileSpreadsheet, Layers, ShieldCheck, BarChart2,
  CheckCircle, Search, Filter, Edit2, Trash2, Eye, ToggleLeft, ToggleRight, X, Image as ImageIcon, Video,
  Download, Upload, Sparkles, CheckCircle2, Clock, AlertTriangle, ChevronRight, FileText
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { RightDrawer } from '../components/RightDrawer';
import { FileUploadPicker } from '../components/FileUploadPicker';

const PRESET_CATEGORIES = [
  'General Knowledge',
  'Current Affairs',
  'Sports',
  'Science',
  'Technology',
  'Movies',
  'Music',
  'History',
  'Geography',
  'Politics',
  'Business',
  'Gaming',
  'Health'
];

export const QuestionBankPage = () => {
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth.isMockMode);

  // Active Main Tab: 'directory' | 'analytics' | 'import'
  const [activeTab, setActiveTab] = useState('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Categories list from API or presets
  const [categories, setCategories] = useState(PRESET_CATEGORIES);

  // Question List State
  const [questions, setQuestions] = useState([]);

  // Drawer Controls
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [viewingQuestion, setViewingQuestion] = useState(null);
  const [showFormatModal, setShowFormatModal] = useState(false);

  // Bulk Import File State
  const [importFile, setImportFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [importCategory, setImportCategory] = useState(PRESET_CATEGORIES[0]);

  // Formik / Single Question State
  const [questionForm, setQuestionForm] = useState({
    category: PRESET_CATEGORIES[0],
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'Option A',
    difficulty: 'Medium',
    explanation: '',
    negativeMarks: '-0.25',
    approvalStatus: 'Approved',
    imageUrl: '',
    videoUrl: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
  }, [isMockMode]);

  const fetchCategories = async () => {
    if (isMockMode) return;
    try {
      const res = await axios.get('/api/categories', { withCredentials: true });
      if (res.data.categories && res.data.categories.length > 0) {
        const catTitles = res.data.categories.map(c => c.title || c.name);
        setCategories(catTitles);
        setQuestionForm(prev => ({ ...prev, category: catTitles[0] }));
        setImportCategory(catTitles[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    if (isMockMode) return;
    try {
      const poolsRes = await axios.get('/api/question-pools', { withCredentials: true });
      const pools = poolsRes.data.pools || [];
      if (pools.length === 0) return;

      let allQuestions = [];
      for (const p of pools) {
        const qRes = await axios.get(`/api/question-pools/${p._id}/questions`, { withCredentials: true });
        const list = qRes.data.questions || [];
        const formatted = list.map((q, idx) => ({
          id: `Q-${q._id?.slice(-4) || idx + 1000}`,
          _id: q._id,
          poolId: q.poolId,
          category: q.category || p.category || 'General',
          question: q.text || q.question,
          optionA: q.options?.[0]?.text || '',
          optionB: q.options?.[1]?.text || '',
          optionC: q.options?.[2]?.text || '',
          optionD: q.options?.[3]?.text || '',
          correctOption: q.options?.findIndex(o => o.isCorrect) >= 0
            ? `Option ${String.fromCharCode(65 + q.options.findIndex(o => o.isCorrect))}`
            : 'Option A',
          difficulty: q.difficulty || 'Medium',
          explanation: q.explanation || '',
          negativeMarks: `-${q.negativeMarks || 0.25}`,
          approvalStatus: 'Approved',
          imageUrl: q.mediaUrl || '',
          videoUrl: '',
          status: 'Active'
        }));
        allQuestions = [...allQuestions, ...formatted];
      }
      if (allQuestions.length > 0) {
        setQuestions(allQuestions);
      }
    } catch (err) {
      console.error('Error fetching questions from API:', err);
    }
  };

  // Single Question Submit
  const handleSaveQuestion = async () => {
    if (!questionForm.category) {
      showSnackbar('Category is mandatory. Please select a category.', 'error');
      return;
    }
    if (!questionForm.question.trim()) {
      showSnackbar('Question text is mandatory.', 'warning');
      return;
    }
    if (!questionForm.optionA || !questionForm.optionB || !questionForm.optionC || !questionForm.optionD) {
      showSnackbar('All 4 OMR options (Option A, B, C, D) are required.', 'warning');
      return;
    }

    const newQ = {
      id: `Q-${Date.now().toString().slice(-4)}`,
      _id: `q-${Date.now()}`,
      ...questionForm,
      status: 'Active'
    };

    if (!isMockMode) {
      try {
        const poolsRes = await axios.get('/api/question-pools', { withCredentials: true });
        let pool = (poolsRes.data.pools || []).find(p => p.category === questionForm.category);
        if (!pool) {
          const createPoolRes = await axios.post('/api/question-pools', {
            name: `${questionForm.category} Pool`,
            category: questionForm.category
          }, { withCredentials: true });
          pool = createPoolRes.data.pool;
        }

        const optionsArray = [
          { text: questionForm.optionA, isCorrect: questionForm.correctOption === 'Option A' },
          { text: questionForm.optionB, isCorrect: questionForm.correctOption === 'Option B' },
          { text: questionForm.optionC, isCorrect: questionForm.correctOption === 'Option C' },
          { text: questionForm.optionD, isCorrect: questionForm.correctOption === 'Option D' }
        ];

        const saveRes = await axios.post(`/api/question-pools/${pool._id}/questions`, {
          text: questionForm.question,
          category: questionForm.category,
          type: 'Single Choice',
          options: optionsArray,
          difficulty: questionForm.difficulty,
          explanation: questionForm.explanation,
          negativeMarks: Math.abs(parseFloat(questionForm.negativeMarks) || 0.25),
          mediaUrl: questionForm.imageUrl
        }, { withCredentials: true });

        if (saveRes.data.question) {
          newQ._id = saveRes.data.question._id;
        }
      } catch (err) {
        console.error('API Error saving question:', err);
      }
    }

    setQuestions(prev => [newQ, ...prev]);
    showSnackbar('Question created and added to Question Bank!', 'success');
    setShowAddDrawer(false);
    resetQuestionForm();
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion.category) {
      showSnackbar('Category is mandatory.', 'error');
      return;
    }
    setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? editingQuestion : q));
    showSnackbar(`Question ${editingQuestion.id} updated successfully!`, 'success');
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (q) => {
    showConfirm('Delete Question', `Are you sure you want to delete question "${q.id}"?`, () => {
      setQuestions(prev => prev.filter(item => item.id !== q.id));
      showSnackbar(`Question ${q.id} deleted from Question Bank.`, 'success');
    });
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      category: categories[0] || 'General Knowledge',
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'Option A',
      difficulty: 'Medium',
      explanation: '',
      negativeMarks: '-0.25',
      approvalStatus: 'Approved',
      imageUrl: '',
      videoUrl: ''
    });
  };

  // CSV Template Download Action
  const handleDownloadExcelTemplate = () => {
    const csvContent =
      `Category,Question,Option A,Option B,Option C,Option D,Correct Answer,Difficulty,Explanation,Negative Marks,Image URL,Video URL\n` +
      `"General Knowledge","What is the capital city of France?","Berlin","Madrid","Paris","Rome","Option C","Easy","Paris has been the capital city of France since 987 AD.","-0.25","https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500",""\n` +
      `"Science","Which element has the chemical symbol 'O'?","Gold","Oxygen","Osmium","Silver","Option B","Easy","Oxygen is element number 8 on the periodic table.","-0.25","",""\n` +
      `"Technology","Who is credited with co-founding Apple Inc. along with Steve Jobs?","Bill Gates","Steve Wozniak","Mark Zuckerberg","Elon Musk","Option B","Medium","Steve Wozniak co-founded Apple Computers in 1976.","-0.50","",""`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'question_bank_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar('Sample Excel/CSV template downloaded successfully!', 'success');
  };

  // Bulk File Upload Parsing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length <= 1) {
        showSnackbar('The uploaded CSV file contains no data rows.', 'warning');
        return;
      }

      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/^"(.*)"$/, '$1').trim());
        if (cols.length >= 6) {
          rows.push({
            id: `Q-IMP-${Date.now().toString().slice(-4)}-${i}`,
            category: cols[0] || importCategory,
            question: cols[1] || `Sample Question ${i}`,
            optionA: cols[2] || 'Option A',
            optionB: cols[3] || 'Option B',
            optionC: cols[4] || 'Option C',
            optionD: cols[5] || 'Option D',
            correctOption: cols[6] || 'Option A',
            difficulty: cols[7] || 'Medium',
            explanation: cols[8] || '',
            negativeMarks: cols[9] || '-0.25',
            imageUrl: cols[10] || '',
            videoUrl: cols[11] || '',
            approvalStatus: 'Approved',
            status: 'Active'
          });
        }
      }
      setParsedRows(rows);
      showSnackbar(`Parsed ${rows.length} valid question rows from file!`, 'info');
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) {
      showSnackbar('No valid questions to import.', 'warning');
      return;
    }

    if (!isMockMode) {
      try {
        const poolsRes = await axios.get('/api/question-pools', { withCredentials: true });
        let pool = (poolsRes.data.pools || [])[0];
        if (!pool) {
          const createPoolRes = await axios.post('/api/question-pools', {
            name: `${importCategory} Pool`,
            category: importCategory
          }, { withCredentials: true });
          pool = createPoolRes.data.pool;
        }

        const apiRows = parsedRows.map(r => ({
          text: r.question,
          type: 'Single Choice',
          options: `${r.optionA}${r.correctOption === 'Option A' ? ' (Correct)' : ''}; ${r.optionB}${r.correctOption === 'Option B' ? ' (Correct)' : ''}; ${r.optionC}${r.correctOption === 'Option C' ? ' (Correct)' : ''}; ${r.optionD}${r.correctOption === 'Option D' ? ' (Correct)' : ''}`,
          difficulty: r.difficulty,
          explanation: r.explanation,
          negativeMarks: Math.abs(parseFloat(r.negativeMarks) || 0.25)
        }));

        await axios.post(`/api/question-pools/${pool._id}/import`, { rows: apiRows }, { withCredentials: true });
      } catch (err) {
        console.error('API import error:', err);
      }
    }

    setQuestions(prev => [...parsedRows, ...prev]);
    showSnackbar(`Successfully imported ${parsedRows.length} questions into Question Bank!`, 'success');
    setParsedRows([]);
    setImportFile(null);
    setActiveTab('directory');
  };

  // Analytics Computation
  const analytics = useMemo(() => {
    const total = questions.length;
    const approved = questions.filter(q => q.approvalStatus === 'Approved').length;
    const pending = questions.filter(q => q.approvalStatus === 'Pending').length;
    const rejected = questions.filter(q => q.approvalStatus === 'Rejected').length;

    // Difficulty breakdown
    const easy = questions.filter(q => q.difficulty === 'Easy').length;
    const medium = questions.filter(q => q.difficulty === 'Medium').length;
    const hard = questions.filter(q => q.difficulty === 'Hard').length;
    const expert = questions.filter(q => q.difficulty === 'Expert').length;

    // Category breakdown
    const categoryCounts = {};
    questions.forEach(q => {
      const cat = q.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return {
      total,
      approved,
      pending,
      rejected,
      easy,
      medium,
      hard,
      expert,
      categoryCounts
    };
  }, [questions]);

  // Filtered Questions Directory
  const filteredQuestions = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return questions.filter(item => {
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesDiff = difficultyFilter === 'All' || item.difficulty === difficultyFilter;
      const matchesStatus = statusFilter === 'All' || item.approvalStatus === statusFilter;

      return matchesSearch && matchesCat && matchesDiff && matchesStatus;
    });
  }, [questions, searchTerm, categoryFilter, difficultyFilter, statusFilter]);

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-brandPrimary" />
            OMR Question Bank Repository & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Category-mandatory single question builder, bulk Excel importer, and distribution analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFormatModal(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shrink-0"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Download Excel Format</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className="px-3.5 py-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={() => { resetQuestionForm(); setShowAddDrawer(true); }}
            className="px-4 py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Question</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/10 text-xs font-bold space-x-6">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${activeTab === 'directory'
              ? 'border-brandPrimary text-brandPrimary'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>Questions Directory ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${activeTab === 'analytics'
              ? 'border-purple-500 text-purple-500'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Question Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${activeTab === 'import'
              ? 'border-emerald-500 text-emerald-500'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Bulk Excel Import</span>
        </button>
      </div>

      {/* TAB 1: QUESTIONS DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions by text, category or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <CustomSelect
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: 'All', label: 'All Categories' },
                  ...categories.map(c => ({ value: c, label: c }))
                ]}
                searchable={true}
                className="w-48"
              />

              <CustomSelect
                value={difficultyFilter}
                onChange={setDifficultyFilter}
                options={[
                  { value: 'All', label: 'All Difficulties' },
                  { value: 'Easy', label: 'Easy' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Hard', label: 'Hard' },
                  { value: 'Expert', label: 'Expert' }
                ]}
                className="w-36"
              />

              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'All', label: 'All Statuses' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Rejected', label: 'Rejected' }
                ]}
                className="w-36"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/5 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-white/5">
                  <tr>
                    <th className="py-3 px-4">ID & Category</th>
                    <th className="py-3 px-4">Question Text</th>
                    <th className="py-3 px-4">OMR Correct Answer</th>
                    <th className="py-3 px-4">Difficulty / Neg. Marks</th>
                    <th className="py-3 px-4">Approval Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                  {filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No questions match your current search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredQuestions.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-brandPrimary/10 text-brandPrimary font-mono font-bold rounded text-[10px] block mb-1">
                            {q.id}
                          </span>
                          <strong className="text-slate-900 dark:text-white font-bold block">{q.category}</strong>
                        </td>
                        <td className="py-3 px-4 max-w-sm">
                          <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{q.question}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {q.imageUrl && (
                              <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-500 rounded text-[9px] font-bold flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> Image
                              </span>
                            )}
                            {q.videoUrl && (
                              <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-500 rounded text-[9px] font-bold flex items-center gap-1">
                                <Video className="w-3 h-3" /> Video
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 font-bold rounded-lg border border-emerald-500/20 inline-block mb-1">
                            {q.correctOption}: {q[q.correctOption?.replace('Option ', 'option')]}
                          </span>
                          {q.explanation && (
                            <p className="text-[10px] text-slate-400 italic line-clamp-1">{q.explanation}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block mb-1 ${q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                              q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                            {q.difficulty}
                          </span>
                          <span className="text-[10px] text-rose-500 font-bold block">Neg: {q.negativeMarks}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${q.approvalStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                              q.approvalStatus === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            }`}>
                            {q.approvalStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setViewingQuestion(q)} title="View Details" className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingQuestion(q)} title="Edit Question" className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteQuestion(q)} title="Delete Question" className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTION ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Total Questions</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{analytics.total}</h3>
              <p className="text-[11px] text-emerald-500 font-semibold">Active in Bank</p>
            </div>

            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Approved Questions</span>
              <h3 className="text-2xl font-bold text-emerald-500 font-mono">{analytics.approved}</h3>
              <p className="text-[11px] text-slate-400">Ready for Live Quizzes</p>
            </div>

            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Pending Approval</span>
              <h3 className="text-2xl font-bold text-amber-500 font-mono">{analytics.pending}</h3>
              <p className="text-[11px] text-slate-400">Under Moderator Review</p>
            </div>

            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Rejected / Flagged</span>
              <h3 className="text-2xl font-bold text-rose-500 font-mono">{analytics.rejected}</h3>
              <p className="text-[11px] text-slate-400">Requires Correction</p>
            </div>
          </div>

          {/* Category Distribution Grid */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-brandPrimary" /> Mandatory Category Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(analytics.categoryCounts).map(([catName, cnt]) => (
                <div key={catName} className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5 flex justify-between items-center">
                  <div>
                    <strong className="text-xs font-bold text-slate-800 dark:text-white block">{catName}</strong>
                    <span className="text-[10px] text-slate-400">Category Tag</span>
                  </div>
                  <span className="px-2.5 py-1 bg-brandPrimary/10 text-brandPrimary font-mono font-bold rounded-lg text-xs">
                    {cnt} Qs
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Level Breakdown */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-purple-500" /> Difficulty Spread & Complexity Index
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-[10px] text-emerald-500 font-bold uppercase block">Easy</span>
                <strong className="text-xl font-bold text-emerald-500">{analytics.easy}</strong>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <span className="text-[10px] text-amber-500 font-bold uppercase block">Medium</span>
                <strong className="text-xl font-bold text-amber-500">{analytics.medium}</strong>
              </div>
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <span className="text-[10px] text-rose-500 font-bold uppercase block">Hard</span>
                <strong className="text-xl font-bold text-rose-500">{analytics.hard}</strong>
              </div>
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <span className="text-[10px] text-purple-500 font-bold uppercase block">Expert</span>
                <strong className="text-xl font-bold text-purple-500">{analytics.expert}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BULK EXCEL IMPORT */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500" /> Bulk Import Questions via Excel / CSV
                </h3>
                <p className="text-xs text-slate-500 dark:text-white/50">
                  Upload multiple OMR questions simultaneously using the standardized column layout.
                </p>
              </div>

              <button
                onClick={handleDownloadExcelTemplate}
                className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shrink-0"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Download Sample Template (.csv)</span>
              </button>
            </div>

            {/* Default Mandatory Category Picker */}
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                Default Target Category (Mandatory fallback)
              </label>
              <CustomSelect
                value={importCategory}
                onChange={setImportCategory}
                options={categories.map(c => ({ value: c, label: c }))}
                searchable={true}
                className="w-72"
              />
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-black/20 cursor-pointer transition-all relative">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                  {importFile ? importFile.name : 'Click or Drag & Drop Excel / CSV File Here'}
                </h4>
                <p className="text-[10px] text-slate-400">Supports .csv, .xlsx files with OMR option columns</p>
              </div>
            </div>

            {/* Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                    {parsedRows.length} Questions Ready for Import
                  </h4>
                  <button
                    onClick={handleConfirmImport}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirm & Import Questions
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-white/10 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-white/5 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Category</th>
                        <th className="p-2">Question</th>
                        <th className="p-2">Correct Answer</th>
                        <th className="p-2">Difficulty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {parsedRows.map((r, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-bold">{r.category}</td>
                          <td className="p-2 truncate max-w-xs">{r.question}</td>
                          <td className="p-2 text-emerald-500 font-bold">{r.correctOption}</td>
                          <td className="p-2">{r.difficulty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE SINGLE QUESTION DRAWER */}
      <RightDrawer
        isOpen={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        title="Create Single OMR Question"
      >
        <div className="space-y-4 text-xs text-left">
          {/* Mandatory Category selection */}
          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
              Category <span className="text-rose-500 font-bold">* (Mandatory)</span>
            </label>
            <CustomSelect
              value={questionForm.category}
              onChange={val => setQuestionForm({ ...questionForm, category: val })}
              options={categories.map(c => ({ value: c, label: c }))}
              searchable={true}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Question Text</label>
            <textarea
              rows={3}
              value={questionForm.question}
              onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })}
              placeholder="Enter full question text..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
            />
          </div>

          {/* OMR Options A, B, C, D */}
          <div className="space-y-2 border-t border-b border-slate-100 dark:border-white/5 py-3">
            <span className="text-[10px] font-bold text-brandPrimary uppercase tracking-wider block mb-1">
              OMR Multiple Choice Options (A, B, C, D)
            </span>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold">Option A</label>
              <input
                type="text"
                value={questionForm.optionA}
                onChange={e => setQuestionForm({ ...questionForm, optionA: e.target.value })}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold">Option B</label>
              <input
                type="text"
                value={questionForm.optionB}
                onChange={e => setQuestionForm({ ...questionForm, optionB: e.target.value })}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold">Option C</label>
              <input
                type="text"
                value={questionForm.optionC}
                onChange={e => setQuestionForm({ ...questionForm, optionC: e.target.value })}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold">Option D</label>
              <input
                type="text"
                value={questionForm.optionD}
                onChange={e => setQuestionForm({ ...questionForm, optionD: e.target.value })}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Correct OMR Answer</label>
              <CustomSelect
                value={questionForm.correctOption}
                onChange={val => setQuestionForm({ ...questionForm, correctOption: val })}
                options={[
                  { value: 'Option A', label: 'Option A' },
                  { value: 'Option B', label: 'Option B' },
                  { value: 'Option C', label: 'Option C' },
                  { value: 'Option D', label: 'Option D' }
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Difficulty Level</label>
              <CustomSelect
                value={questionForm.difficulty}
                onChange={val => setQuestionForm({ ...questionForm, difficulty: val })}
                options={[
                  { value: 'Easy', label: 'Easy' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Hard', label: 'Hard' },
                  { value: 'Expert', label: 'Expert' }
                ]}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Negative Marks</label>
              <CustomSelect
                value={questionForm.negativeMarks}
                onChange={val => setQuestionForm({ ...questionForm, negativeMarks: val })}
                options={[
                  { value: '0', label: '0 (No Penalty)' },
                  { value: '-0.25', label: '-0.25 Marks' },
                  { value: '-0.50', label: '-0.50 Marks' },
                  { value: '-1.00', label: '-1.00 Marks' },
                  { value: '-2.00', label: '-2.00 Marks' }
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Approval Status</label>
              <CustomSelect
                value={questionForm.approvalStatus}
                onChange={val => setQuestionForm({ ...questionForm, approvalStatus: val })}
                options={[
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Rejected', label: 'Rejected' }
                ]}
                className="w-full"
              />
            </div>
          </div>

          {/* Media Attachments */}
          <FileUploadPicker
            label="Question Illustration Image"
            type="image"
            accept="image/*"
            value={questionForm.imageUrl}
            onChange={val => setQuestionForm({ ...questionForm, imageUrl: val })}
          />

          <FileUploadPicker
            label="Question Video Explanation"
            type="video"
            accept="video/*"
            value={questionForm.videoUrl}
            onChange={val => setQuestionForm({ ...questionForm, videoUrl: val })}
          />

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Explanation / Solution Hint</label>
            <textarea
              rows={2}
              value={questionForm.explanation}
              onChange={e => setQuestionForm({ ...questionForm, explanation: e.target.value })}
              placeholder="Why is this answer correct?"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
            />
          </div>

          <button
            onClick={handleSaveQuestion}
            className="w-full py-3 bg-brandPrimary hover:bg-brandPrimary/90 text-white font-bold rounded-xl transition-all shadow-md mt-4"
          >
            Create Question
          </button>
        </div>
      </RightDrawer>

      {/* EDIT QUESTION DRAWER */}
      <RightDrawer
        isOpen={Boolean(editingQuestion)}
        onClose={() => setEditingQuestion(null)}
        title={editingQuestion ? `Edit Question: ${editingQuestion.id}` : 'Edit Question'}
      >
        {editingQuestion && (
          <div className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Category (Mandatory)</label>
              <CustomSelect
                value={editingQuestion.category}
                onChange={val => setEditingQuestion({ ...editingQuestion, category: val })}
                options={categories.map(c => ({ value: c, label: c }))}
                searchable={true}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Question Text</label>
              <textarea
                rows={3}
                value={editingQuestion.question}
                onChange={e => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
              />
            </div>

            <div className="space-y-2 border-t border-b border-slate-100 dark:border-white/5 py-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold">Option A</label>
                <input
                  type="text"
                  value={editingQuestion.optionA}
                  onChange={e => setEditingQuestion({ ...editingQuestion, optionA: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold">Option B</label>
                <input
                  type="text"
                  value={editingQuestion.optionB}
                  onChange={e => setEditingQuestion({ ...editingQuestion, optionB: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold">Option C</label>
                <input
                  type="text"
                  value={editingQuestion.optionC}
                  onChange={e => setEditingQuestion({ ...editingQuestion, optionC: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold">Option D</label>
                <input
                  type="text"
                  value={editingQuestion.optionD}
                  onChange={e => setEditingQuestion({ ...editingQuestion, optionD: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Correct Answer</label>
                <CustomSelect
                  value={editingQuestion.correctOption}
                  onChange={val => setEditingQuestion({ ...editingQuestion, correctOption: val })}
                  options={[
                    { value: 'Option A', label: 'Option A' },
                    { value: 'Option B', label: 'Option B' },
                    { value: 'Option C', label: 'Option C' },
                    { value: 'Option D', label: 'Option D' }
                  ]}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Difficulty</label>
                <CustomSelect
                  value={editingQuestion.difficulty}
                  onChange={val => setEditingQuestion({ ...editingQuestion, difficulty: val })}
                  options={[
                    { value: 'Easy', label: 'Easy' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Hard', label: 'Hard' },
                    { value: 'Expert', label: 'Expert' }
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateQuestion}
              className="w-full py-3 bg-brandPrimary hover:bg-brandPrimary/90 text-white font-bold rounded-xl transition-all shadow-md mt-4"
            >
              Save Changes
            </button>
          </div>
        )}
      </RightDrawer>

      {/* VIEW QUESTION DRAWER */}
      <RightDrawer
        isOpen={Boolean(viewingQuestion)}
        onClose={() => setViewingQuestion(null)}
        title="Question Details"
      >
        {viewingQuestion && (
          <div className="space-y-4 text-xs text-left">
            <div className="p-4 bg-brandPrimary/10 border border-brandPrimary/20 rounded-2xl space-y-1">
              <span className="font-mono text-[10px] font-bold text-brandPrimary">{viewingQuestion.id} • {viewingQuestion.category}</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">{viewingQuestion.question}</h3>
            </div>

            {/* Media Image / Video Preview */}
            {viewingQuestion.imageUrl && (
              <img src={viewingQuestion.imageUrl} className="w-full h-40 object-cover rounded-xl border border-slate-200 dark:border-white/10" alt="Illustration" />
            )}
            {viewingQuestion.videoUrl && (
              <video src={viewingQuestion.videoUrl} controls className="w-full h-40 rounded-xl bg-black" />
            )}

            {/* OMR Options */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">OMR Options</span>
              <div className={`p-2.5 rounded-xl border ${viewingQuestion.correctOption === 'Option A' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5'}`}>
                A. {viewingQuestion.optionA} {viewingQuestion.correctOption === 'Option A' && '✓ (Correct)'}
              </div>
              <div className={`p-2.5 rounded-xl border ${viewingQuestion.correctOption === 'Option B' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5'}`}>
                B. {viewingQuestion.optionB} {viewingQuestion.correctOption === 'Option B' && '✓ (Correct)'}
              </div>
              <div className={`p-2.5 rounded-xl border ${viewingQuestion.correctOption === 'Option C' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5'}`}>
                C. {viewingQuestion.optionC} {viewingQuestion.correctOption === 'Option C' && '✓ (Correct)'}
              </div>
              <div className={`p-2.5 rounded-xl border ${viewingQuestion.correctOption === 'Option D' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5'}`}>
                D. {viewingQuestion.optionD} {viewingQuestion.correctOption === 'Option D' && '✓ (Correct)'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-white/5 p-3 rounded-xl text-center">
              <div>
                <span className="text-[9px] text-slate-400 block">Difficulty</span>
                <strong className="text-amber-500 font-bold">{viewingQuestion.difficulty}</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">Negative Marks</span>
                <strong className="text-rose-500 font-bold">{viewingQuestion.negativeMarks}</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">Status</span>
                <strong className="text-emerald-500 font-bold">{viewingQuestion.approvalStatus}</strong>
              </div>
            </div>

            {viewingQuestion.explanation && (
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Explanation / Solution</span>
                <p className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-[11px] text-slate-700 dark:text-slate-300 italic">
                  {viewingQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </RightDrawer>

      {/* DOWNLOAD EXCEL FORMAT TEMPLATE MODAL */}
      {showFormatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-3xl shadow-2xl space-y-4 text-xs text-left">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" /> Excel / CSV Bulk Import Template Format
              </h3>
              <button onClick={() => setShowFormatModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Your Excel or CSV file must follow the exact column header structure listed below. Ensure <strong>Category</strong> is provided for every question row.
            </p>

            {/* Template Column Structure Badge List */}
            <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10 font-mono text-[10px] flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 bg-brandPrimary/10 text-brandPrimary font-bold rounded">Category*</span>
              <span className="px-2 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-bold">Question*</span>
              <span className="px-2 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-bold">Option A*</span>
              <span className="px-2 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-bold">Option B*</span>
              <span className="px-2 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-bold">Option C*</span>
              <span className="px-2 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-bold">Option D*</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-bold rounded">Correct Answer*</span>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 font-bold rounded">Difficulty</span>
              <span className="px-2 py-0.5 bg-slate-200 dark:bg-white/10 rounded">Explanation</span>
              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 font-bold rounded">Negative Marks</span>
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded">Image URL</span>
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded">Video URL</span>
            </div>

            {/* Sample Table Preview */}
            <div className="overflow-x-auto border border-slate-200 dark:border-white/10 rounded-xl">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 dark:bg-white/10 font-bold text-slate-700 dark:text-slate-200">
                  <tr>
                    <th className="p-2 border-r border-slate-200 dark:border-white/10">Category</th>
                    <th className="p-2 border-r border-slate-200 dark:border-white/10">Question</th>
                    <th className="p-2 border-r border-slate-200 dark:border-white/10">Option A</th>
                    <th className="p-2 border-r border-slate-200 dark:border-white/10">Option B</th>
                    <th className="p-2 border-r border-slate-200 dark:border-white/10">Option C</th>
                    <th className="p-2 border-r border-slate-200 dark:border-white/10">Option D</th>
                    <th className="p-2 border-r border-slate-200 dark:border-white/10">Correct Answer</th>
                    <th className="p-2">Difficulty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono text-[10px]">
                  <tr>
                    <td className="p-2 font-bold text-brandPrimary">General Knowledge</td>
                    <td className="p-2">What is the capital of France?</td>
                    <td className="p-2">Berlin</td>
                    <td className="p-2">Madrid</td>
                    <td className="p-2 font-bold text-emerald-500">Paris</td>
                    <td className="p-2">Rome</td>
                    <td className="p-2 font-bold text-emerald-500">Option C</td>
                    <td className="p-2">Easy</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-brandPrimary">Science</td>
                    <td className="p-2">Chemical symbol for Oxygen?</td>
                    <td className="p-2">Gold</td>
                    <td className="p-2 font-bold text-emerald-500">Oxygen</td>
                    <td className="p-2">Osmium</td>
                    <td className="p-2">Silver</td>
                    <td className="p-2 font-bold text-emerald-500">Option B</td>
                    <td className="p-2">Easy</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
              <button onClick={() => setShowFormatModal(false)} className="px-4 py-2 font-semibold text-slate-400">Close</button>
              <button
                onClick={() => { setShowFormatModal(false); handleDownloadExcelTemplate(); }}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4" /> Download Sample CSV Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankPage;
