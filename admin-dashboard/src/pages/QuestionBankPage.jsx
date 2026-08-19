import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
  HelpCircle, Plus, FileSpreadsheet, Layers, ShieldCheck, BarChart2,
  CheckCircle, Search, Filter, Edit2, Trash2, Eye, ToggleLeft, ToggleRight, X, Image as ImageIcon, Video,
  Download, Upload, Sparkles, CheckCircle2, Clock, AlertTriangle, ChevronRight, ChevronDown, FileText, Folder, FolderOpen, ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { RightDrawer } from '../components/RightDrawer';
import { FileUploadPicker } from '../components/FileUploadPicker';

const formatNegMarks = (val) => {
  if (val === undefined || val === null || val === '') return '-0.25';
  const clean = String(val).replace(/-/g, '').trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return '-0.25';
  return `-${num}`;
};

const parseNegNum = (val) => {
  if (val === undefined || val === null || val === '') return 0.25;
  const clean = String(val).replace(/-/g, '').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0.25 : num;
};

export const QuestionBankPage = ({ defaultTab }) => {
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth.isMockMode);

  // Active Main Tab: 'directory' | 'analytics' | 'import'
  const [activeTab, setActiveTab] = useState(defaultTab || 'directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected Category Folder State: null (Show Category Folders Grid) | string (Inside Category Folder)
  const [selectedFolderCategory, setSelectedFolderCategory] = useState(null);
  const [isPoolDropdownOpen, setIsPoolDropdownOpen] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState('10'); // '5', '10', '50', '100', 'All'

  // Categories & Questions (Strictly Live MongoDB Data)
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Drawer Controls
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [viewingQuestion, setViewingQuestion] = useState(null);
  const [showFormatModal, setShowFormatModal] = useState(false);

  // Bulk Import File State
  const [importFile, setImportFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [importCategory, setImportCategory] = useState('');
  const [editingImportRow, setEditingImportRow] = useState(null);
  const [showEditImportDrawer, setShowEditImportDrawer] = useState(false);
  const [importFilterTab, setImportFilterTab] = useState('all');
  const [importSearchQuery, setImportSearchQuery] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleOpenAddImportRow = () => {
    const newRow = validateRow({
      id: `Q-IMP-${Date.now()}`,
      category: importCategory || categories[0] || 'General Knowledge',
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'Option A',
      difficulty: 'Medium',
      explanation: '',
      negativeMarks: '-0.25',
      imageUrl: '',
      videoUrl: '',
      approvalStatus: 'Approved',
      status: 'Active'
    });
    setEditingImportRow(newRow);
    setShowEditImportDrawer(true);
  };

  const handleOpenEditImportRow = (row) => {
    setEditingImportRow({ ...row });
    setShowEditImportDrawer(true);
  };

  const handleSaveEditingImportRow = () => {
    if (!editingImportRow) return;
    const validated = validateRow(editingImportRow);
    setParsedRows(prev => {
      const idx = prev.findIndex(r => r.id === validated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = validated;
        return copy;
      } else {
        return [validated, ...prev];
      }
    });
    setShowEditImportDrawer(false);
    setEditingImportRow(null);
    showSnackbar('Import row updated & validated!', 'success');
  };

  const handleDeleteImportRow = (id) => {
    setParsedRows(prev => prev.filter(r => r.id !== id));
    showSnackbar('Row deleted from preview', 'info');
  };

  // Formik / Single Question State
  const [questionForm, setQuestionForm] = useState({
    category: '',
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

  const location = useLocation();

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (location.pathname.includes('/import')) {
      setActiveTab('import');
    } else if (location.pathname.includes('/analytics')) {
      setActiveTab('analytics');
    } else if (location.pathname.includes('/directory') || location.pathname.includes('/pool')) {
      setActiveTab('directory');
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [location.pathname, defaultTab]);

  const fetchCategories = async () => {
    try {
      let res = await axios.get('/api/categories', { withCredentials: true }).catch(() => null);
      if (!res || !res.data) {
        res = await axios.get('/api/admin/categories', { withCredentials: true }).catch(() => null);
      }
      if (res && res.data) {
        const catList = Array.isArray(res.data) ? res.data : (res.data.categories || res.data.data || []);
        if (Array.isArray(catList) && catList.length > 0) {
          const names = catList.map(c => typeof c === 'string' ? c : (c.name || c.title || c.categoryName)).filter(Boolean);
          if (names.length > 0) {
            const uniqueCategories = Array.from(new Set(names));
            setCategories(uniqueCategories);
            setQuestionForm(prev => ({ ...prev, category: uniqueCategories[0] }));
            setImportCategory(uniqueCategories[0]);
            return;
          }
        }
      }
      setCategories([]);
    } catch (err) {
      console.error('Error fetching categories in QuestionBankPage:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const poolsRes = await axios.get('/api/question-pools', { withCredentials: true });
      const pools = poolsRes.data.pools || [];
      if (pools.length === 0) {
        setQuestions([]);
        return;
      }

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
          negativeMarks: formatNegMarks(q.negativeMarks),
          approvalStatus: 'Approved',
          imageUrl: q.mediaUrl || '',
          videoUrl: '',
          status: 'Active'
        }));
        allQuestions = [...allQuestions, ...formatted];
      }
      setQuestions(allQuestions);
    } catch (err) {
      console.error('Error fetching questions from API:', err);
      setQuestions([]);
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
        negativeMarks: parseNegNum(questionForm.negativeMarks),
        mediaUrl: questionForm.imageUrl || '',
        imageUrl: questionForm.imageUrl || '',
        videoUrl: questionForm.videoUrl || ''
      }, { withCredentials: true });

      if (saveRes.data.question) {
        newQ._id = saveRes.data.question._id;
      }
    } catch (err) {
      console.error('API Error saving question:', err);
    }

    setQuestions(prev => [newQ, ...prev]);
    showSnackbar('Question created and added to Question Bank!', 'success');
    setShowAddDrawer(false);
    resetQuestionForm();
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion.category) {
      showSnackbar('Category is mandatory.', 'error');
      return;
    }

    if (editingQuestion._id) {
      try {
        const optionsArray = [
          { text: editingQuestion.optionA, isCorrect: editingQuestion.correctOption === 'Option A' },
          { text: editingQuestion.optionB, isCorrect: editingQuestion.correctOption === 'Option B' },
          { text: editingQuestion.optionC, isCorrect: editingQuestion.correctOption === 'Option C' },
          { text: editingQuestion.optionD, isCorrect: editingQuestion.correctOption === 'Option D' }
        ];

        await axios.put(`/api/questions/${editingQuestion._id}`, {
          text: editingQuestion.question,
          category: editingQuestion.category,
          options: optionsArray,
          difficulty: editingQuestion.difficulty,
          explanation: editingQuestion.explanation,
          negativeMarks: parseNegNum(editingQuestion.negativeMarks),
          mediaUrl: editingQuestion.imageUrl || '',
          imageUrl: editingQuestion.imageUrl || '',
          videoUrl: editingQuestion.videoUrl || ''
        }, { withCredentials: true });
      } catch (err) {
        console.error('Failed to update question via API:', err);
      }
    }

    setQuestions(prev => prev.map(q => (q.id === editingQuestion.id || q._id === editingQuestion._id) ? editingQuestion : q));
    showSnackbar(`Question ${editingQuestion.id} updated successfully!`, 'success');
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (q) => {
    showConfirm('Delete Question', `Are you sure you want to delete question "${q.id}"?`, async () => {
      if (q._id) {
        try {
          await axios.delete(`/api/questions/${q._id}`, { withCredentials: true });
        } catch (err) {
          console.error('Failed to delete question via API:', err);
        }
      }
      setQuestions(prev => prev.filter(item => item.id !== q.id && item._id !== q._id));
      showSnackbar(`Question ${q.id} deleted from Question Bank.`, 'success');
    });
  };

  const handleClearAllQuestions = () => {
    showConfirm('Clear All Questions', 'Are you sure you want to permanently delete ALL questions and question pools from the database? This action cannot be undone!', async () => {
      try {
        await axios.delete('/api/question-pools/clear-all', { withCredentials: true });
        setQuestions([]);
        showSnackbar('All questions and question pools cleared from database!', 'success');
      } catch (err) {
        console.error('Failed to clear all questions:', err);
        showSnackbar('Failed to clear questions from database.', 'error');
      }
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
    const csvContent = "\uFEFF" +
      `Question,Option A,Option B,Option C,Option D,Correct Option,Difficulty,Explanation,Negative Marks,Image URL,Video URL\n` +
      `"What is the capital city of France?","Berlin","Madrid","Paris","Rome","Option C","Easy","Paris has been the capital city of France since 987 AD.","-0.25","https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500",""\n` +
      `"Which element has the chemical symbol 'O'?","Gold","Oxygen","Osmium","Silver","Option B","Easy","Oxygen is element number 8 on the periodic table.","-0.25","",""`;

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

  // Row Validator Helper
  const validateRow = (r, catList = categories) => {
    const errors = [];
    if (!r.question || !r.question.trim()) {
      errors.push('Question text is required');
    }

    const catName = r.category ? r.category.trim() : '';
    if (!catName) {
      errors.push('Category is required');
    } else if (catList && catList.length > 0) {
      const match = catList.some(c => c.toLowerCase() === catName.toLowerCase());
      if (!match) {
        errors.push(`Category "${catName}" does not exist in platform categories`);
      }
    }

    if (!r.optionA || !r.optionA.trim()) {
      errors.push('Option A is required');
    }
    if (!r.optionB || !r.optionB.trim()) {
      errors.push('Option B is required');
    }

    let normCorrect = r.correctOption ? r.correctOption.trim() : '';

    if (/^[A-D]$/i.test(normCorrect)) {
      normCorrect = `Option ${normCorrect.toUpperCase()}`;
    }

    if (r.optionA && normCorrect.toLowerCase() === r.optionA.trim().toLowerCase()) normCorrect = 'Option A';
    else if (r.optionB && normCorrect.toLowerCase() === r.optionB.trim().toLowerCase()) normCorrect = 'Option B';
    else if (r.optionC && normCorrect.toLowerCase() === r.optionC.trim().toLowerCase()) normCorrect = 'Option C';
    else if (r.optionD && normCorrect.toLowerCase() === r.optionD.trim().toLowerCase()) normCorrect = 'Option D';

    const validOptions = ['Option A', 'Option B', 'Option C', 'Option D'];
    if (!validOptions.includes(normCorrect)) {
      errors.push('Correct Option must be Option A, Option B, Option C, or Option D');
    }

    return {
      ...r,
      correctOption: normCorrect || 'Option A',
      errors,
      isValid: errors.length === 0
    };
  };

  // Bulk File Upload Parsing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r\n|\n/).filter(l => l.trim() !== '');
      if (lines.length <= 1) {
        showSnackbar('The uploaded CSV file contains no data rows.', 'warning');
        return;
      }

      const headerLine = lines[0].toLowerCase();
      const hasCategoryCol = headerLine.includes('category');

      const rawRows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 3) {
          let cat = importCategory || categories[0] || 'General Knowledge';
          let qIdx = 0;

          if (hasCategoryCol && cols.length >= 7) {
            cat = cols[0] || importCategory || categories[0] || 'General Knowledge';
            qIdx = 1;
          }

          const raw = {
            id: `Q-IMP-${Date.now().toString().slice(-4)}-${i}`,
            category: cat,
            question: cols[qIdx] || '',
            optionA: cols[qIdx + 1] || '',
            optionB: cols[qIdx + 2] || '',
            optionC: cols[qIdx + 3] || '',
            optionD: cols[qIdx + 4] || '',
            correctOption: cols[qIdx + 5] || 'Option A',
            difficulty: cols[qIdx + 6] || 'Medium',
            explanation: cols[qIdx + 7] || '',
            negativeMarks: cols[qIdx + 8] || '-0.25',
            imageUrl: cols[qIdx + 9] || '',
            videoUrl: cols[qIdx + 10] || '',
            approvalStatus: 'Approved',
            status: 'Active'
          };
          rawRows.push(validateRow(raw));
        }
      }
      setParsedRows(rawRows);
      const validCount = rawRows.filter(r => r.isValid).length;
      const errCount = rawRows.length - validCount;
      if (errCount > 0) {
        showSnackbar(`Parsed ${rawRows.length} rows (${validCount} valid, ${errCount} with errors)`, 'warning');
      } else {
        showSnackbar(`Parsed ${rawRows.length} valid question rows from file!`, 'success');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImportClick = () => {
    const validQuestions = parsedRows.filter(r => r.isValid !== false);
    if (validQuestions.length === 0) {
      showSnackbar('No valid questions to import. Please edit the rows to fix errors first.', 'warning');
      return;
    }
    setShowConfirmModal(true);
  };

  const executeImport = async () => {
    setShowConfirmModal(false);
    const validQuestions = parsedRows.filter(r => r.isValid !== false);
    if (validQuestions.length === 0) return;

    try {
      const targetCat = importCategory || categories[0] || 'General Knowledge';
      const poolsRes = await axios.get('/api/question-pools', { withCredentials: true });
      const existingPools = poolsRes.data.pools || [];

      let pool = existingPools.find(p => p.category === targetCat || (p.name && p.name.toLowerCase().includes(targetCat.toLowerCase())));
      if (!pool) {
        const createPoolRes = await axios.post('/api/question-pools', {
          name: `${targetCat} Pool`,
          category: targetCat
        }, { withCredentials: true });
        pool = createPoolRes.data.pool;
      }

      const apiRows = validQuestions.map(r => ({
        text: r.question,
        category: targetCat,
        type: 'Single Choice',
        options: [
          { text: r.optionA, isCorrect: r.correctOption === 'Option A' },
          { text: r.optionB, isCorrect: r.correctOption === 'Option B' },
          { text: r.optionC, isCorrect: r.correctOption === 'Option C' },
          { text: r.optionD, isCorrect: r.correctOption === 'Option D' }
        ],
        difficulty: r.difficulty || 'Medium',
        explanation: r.explanation || '',
        negativeMarks: Math.abs(parseFloat(r.negativeMarks) || 0.25),
        imageUrl: r.imageUrl || '',
        videoUrl: r.videoUrl || ''
      }));

      await axios.post(`/api/question-pools/${pool._id}/import`, { rows: apiRows }, { withCredentials: true });
    } catch (err) {
      console.error('API import error:', err);
    }

    await fetchQuestions();
    showSnackbar(`Successfully imported ${validQuestions.length} questions into Category "${importCategory || 'General'}"!`, 'success');
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

      const activeCat = selectedFolderCategory || categoryFilter;
      const matchesCat = activeCat === 'All' || item.category === activeCat;
      const matchesDiff = difficultyFilter === 'All' || item.difficulty === difficultyFilter;
      const matchesStatus = statusFilter === 'All' || item.approvalStatus === statusFilter;

      return matchesSearch && matchesCat && matchesDiff && matchesStatus;
    });
  }, [questions, searchTerm, selectedFolderCategory, categoryFilter, difficultyFilter, statusFilter]);

  // Reset pagination on search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFolderCategory, categoryFilter, difficultyFilter, statusFilter, itemsPerPage]);

  const totalItems = filteredQuestions.length;
  const pageSize = itemsPerPage === 'All' ? totalItems || 1 : Number(itemsPerPage);
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = itemsPerPage === 'All' ? totalItems : Math.min(startIndex + pageSize, totalItems);

  const paginatedQuestions = useMemo(() => {
    if (itemsPerPage === 'All') return filteredQuestions;
    return filteredQuestions.slice(startIndex, endIndex);
  }, [filteredQuestions, startIndex, endIndex, itemsPerPage]);

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

          {questions.length > 0 && (
            <button
              onClick={handleClearAllQuestions}
              className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shrink-0 cursor-pointer"
              title="Clear all question pools and questions from database"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}

          <button
            onClick={() => { resetQuestionForm(); setShowAddDrawer(true); }}
            className="px-4 py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Question</span>
          </button>
        </div>
      </div>

      {/* TAB 1: QUESTIONS DIRECTORY */}
      {activeTab === 'directory' && (
            <div className="space-y-6">
              {/* LEVEL 1: CATEGORY FOLDERS GRID VIEW */}
          {selectedFolderCategory === null ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-brandPrimary" />
                    <span>Question Pool Category Folders ({categories.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                    Click any category folder below to view, add, edit, or manage its question repository.
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search category folder..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                  />
                </div>
              </div>

              {/* Folders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* All Questions Special Folder */}
                <div
                  onClick={() => setSelectedFolderCategory('All')}
                  className="bg-gradient-to-br from-brandPrimary/10 to-purple-500/10 dark:from-brandPrimary/20 dark:to-purple-500/20 border border-brandPrimary/30 hover:border-brandPrimary p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-brandPrimary text-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                      <Layers className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 bg-brandPrimary/20 text-brandPrimary dark:text-white font-mono font-bold text-xs rounded-full">
                      {questions.length} Items
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brandPrimary transition-colors">
                    All Question Pools
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-white/50 mt-1 flex items-center gap-1 font-semibold">
                    <span>View all questions repository</span>
                    <ChevronRight className="w-3.5 h-3.5 text-brandPrimary group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>

                {/* Dynamic Category Folders */}
                {categories
                  .filter(catName => !searchTerm || catName.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((catName) => {
                    const catQuestions = questions.filter(q => q.category === catName);
                    const count = catQuestions.length;
                    const easyCount = catQuestions.filter(q => q.difficulty === 'Easy').length;
                    const medCount = catQuestions.filter(q => q.difficulty === 'Medium').length;
                    const hardCount = catQuestions.filter(q => q.difficulty === 'Hard' || q.difficulty === 'Expert').length;

                    return (
                      <div
                        key={catName}
                        onClick={() => setSelectedFolderCategory(catName)}
                        className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 hover:border-brandPrimary dark:hover:border-brandPrimary p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group relative overflow-hidden space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl group-hover:bg-brandPrimary group-hover:text-white transition-all">
                            <Folder className="w-6 h-6" />
                          </div>
                          <span className={`px-2.5 py-1 font-mono font-bold text-xs rounded-full ${
                            count > 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-100 dark:bg-white/10 text-slate-400'
                          }`}>
                            {count} {count === 1 ? 'Question' : 'Questions'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brandPrimary transition-colors truncate">
                            {catName}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded">
                              Easy: {easyCount}
                            </span>
                            <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 text-[9px] font-bold rounded">
                              Med: {medCount}
                            </span>
                            <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-500 text-[9px] font-bold rounded">
                              Hard: {hardCount}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-brandPrimary font-bold">
                          <span>Enter Folder Pool</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            /* LEVEL 2: INSIDE CATEGORY FOLDER - QUESTIONS LIST TABLE */
            <div className="space-y-4">
              {/* Folder Top Breadcrumb Header Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedFolderCategory(null)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Folders</span>
                  </button>

                  <div className="border-l border-slate-200 dark:border-white/10 pl-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-brandPrimary" />
                      <span>{selectedFolderCategory === 'All' ? 'All Question Pools' : `${selectedFolderCategory} Pool`}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-white/50">
                      Showing {filteredQuestions.length} questions in this pool directory.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    resetQuestionForm();
                    if (selectedFolderCategory !== 'All') {
                      setQuestionForm(prev => ({ ...prev, category: selectedFolderCategory }));
                    }
                    setShowAddDrawer(true);
                  }}
                  className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question to {selectedFolderCategory === 'All' ? 'Pool' : selectedFolderCategory}</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search questions by text or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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
                      {paginatedQuestions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Folder className="w-8 h-8 text-slate-300" />
                              <p className="font-bold text-slate-600 dark:text-slate-300">No questions in this pool yet.</p>
                              <p className="text-xs text-slate-400">Click "Add Question" or import an Excel template to populate this pool.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedQuestions.map((q) => (
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

                {/* Pagination Controls Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
                  {/* Left: Items per Page Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Per Page:</span>
                    <CustomSelect
                      value={itemsPerPage}
                      onChange={(val) => setItemsPerPage(val)}
                      direction="up"
                      options={[
                        { value: '5', label: '5 items' },
                        { value: '10', label: '10 items' },
                        { value: '50', label: '50 items' },
                        { value: '100', label: '100 items' },
                        { value: 'All', label: 'All items' }
                      ]}
                      className="w-28"
                    />
                  </div>

                  {/* Center: Status Info */}
                  <div className="font-semibold text-slate-700 dark:text-slate-200 text-center">
                    {totalItems === 0 ? (
                      'Showing 0 questions'
                    ) : (
                      <>
                        Showing <span className="font-bold text-brandPrimary">{startIndex + 1}</span>–<span className="font-bold text-brandPrimary">{endIndex}</span> of <span className="font-bold">{totalItems}</span> questions
                        {itemsPerPage !== 'All' && ` (Page ${safeCurrentPage} of ${totalPages})`}
                      </>
                    )}
                  </div>

                  {/* Right: Page Navigation Buttons */}
                  {itemsPerPage !== 'All' && totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={safeCurrentPage === 1}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all"
                        title="First Page"
                      >
                        «
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={safeCurrentPage === 1}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all"
                      >
                        Previous
                      </button>

                      {/* Page Numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                        .map((page, idx, arr) => {
                          const prevPage = arr[idx - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  safeCurrentPage === page
                                    ? 'bg-brandPrimary text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={safeCurrentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={safeCurrentPage === totalPages}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all"
                        title="Last Page"
                      >
                        »
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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

            {/* Parsed Preview Table & Interactive Controls */}
            {parsedRows.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5 animate-fade-in">
                {/* Error Summary Notice Card */}
                {parsedRows.filter(r => r.isValid === false).length > 0 && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                        <span>Sheet Validation Error Notice ({parsedRows.filter(r => r.isValid === false).length} {parsedRows.filter(r => r.isValid === false).length === 1 ? 'Row Has Errors' : 'Rows Have Errors'})</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setImportFilterTab('errors')}
                        className="text-[11px] font-bold text-rose-400 hover:text-rose-300 underline flex items-center gap-1 cursor-pointer"
                      >
                        Show Errors Only &rarr;
                      </button>
                    </div>
                    <p className="text-xs text-rose-300 leading-relaxed">
                      Some rows in your file contain errors (e.g. category not found in platform categories, missing question, or option fields). Please review the <strong>Error Note</strong> under each affected row and click <strong>Edit</strong> to fix them.
                    </p>
                  </div>
                )}

                {/* Header Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-500" />
                      <span>Preview Data ({parsedRows.length})</span>
                    </h4>
                    <div className="flex gap-1.5 text-xs">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {parsedRows.filter(r => r.isValid !== false).length} Valid
                      </span>
                      {parsedRows.filter(r => r.isValid === false).length > 0 && (
                        <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold rounded-lg flex items-center gap-1 animate-pulse">
                          <AlertCircle className="w-3.5 h-3.5" /> {parsedRows.filter(r => r.isValid === false).length} Errors
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={handleOpenAddImportRow}
                      className="px-3 py-1.5 bg-brandPrimary/10 hover:bg-brandPrimary/20 text-brandPrimary border border-brandPrimary/20 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Question Row</span>
                    </button>
                    <button
                      onClick={handleConfirmImportClick}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Confirm & Import Questions
                    </button>
                  </div>
                </div>

                {/* Filter Tabs & Search Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
                    <button
                      onClick={() => setImportFilterTab('all')}
                      className={`px-3 py-1 font-bold rounded-lg transition-all ${importFilterTab === 'all' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                    >
                      All ({parsedRows.length})
                    </button>
                    <button
                      onClick={() => setImportFilterTab('valid')}
                      className={`px-3 py-1 font-bold rounded-lg transition-all ${importFilterTab === 'valid' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500'}`}
                    >
                      Valid Only ({parsedRows.filter(r => r.isValid !== false).length})
                    </button>
                    <button
                      onClick={() => setImportFilterTab('errors')}
                      className={`px-3 py-1 font-bold rounded-lg transition-all ${importFilterTab === 'errors' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500'}`}
                    >
                      Errors Only ({parsedRows.filter(r => r.isValid === false).length})
                    </button>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search preview rows..."
                      value={importSearchQuery}
                      onChange={e => setImportSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary"
                    />
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto border border-slate-200 dark:border-white/10 rounded-xl scrollbar-hide">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-white/5 font-bold uppercase text-[10px] sticky top-0 backdrop-blur-md z-10">
                      <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Question Text & Error Note</th>
                        <th className="p-2">Correct Option</th>
                        <th className="p-2">Difficulty</th>
                        <th className="p-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {parsedRows.filter(r => {
                        const matchesTab = importFilterTab === 'all' ? true : importFilterTab === 'valid' ? r.isValid !== false : r.isValid === false;
                        const qStr = importSearchQuery.toLowerCase();
                        const matchesSearch = !qStr || r.question.toLowerCase().includes(qStr) || r.category.toLowerCase().includes(qStr);
                        return matchesTab && matchesSearch;
                      }).map((r, idx) => (
                        <tr key={r.id || idx} className={r.isValid === false ? 'bg-rose-500/5' : 'hover:bg-slate-50 dark:hover:bg-white/5'}>
                          <td className="p-2 font-mono font-bold text-slate-400 align-top">{idx + 1}</td>
                          <td className="p-2 align-top">
                            {r.isValid !== false ? (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold rounded-full">Valid</span>
                            ) : (
                              <div className="group relative w-fit">
                                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold rounded-full cursor-pointer flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> {r.errors?.length || 1} {r.errors?.length === 1 ? 'Error' : 'Errors'}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-2 font-bold text-brandPrimary align-top">{r.category}</td>
                          <td className="p-2 max-w-xs align-top">
                            <div className="font-bold truncate" title={r.question}>
                              {r.question || <span className="text-rose-400 italic font-normal">[Missing Question]</span>}
                            </div>
                            {r.isValid === false && (
                              <div className="mt-1.5 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-400 space-y-0.5 animate-fade-in">
                                <span className="font-extrabold uppercase text-[9px] text-rose-400 block border-b border-rose-500/20 pb-0.5 mb-1">
                                  ⚠️ Error Note:
                                </span>
                                {r.errors?.map((err, eIdx) => (
                                  <div key={eIdx} className="flex items-center gap-1 font-medium">
                                    • {err}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-2 text-emerald-500 font-bold">{r.correctOption}</td>
                          <td className="p-2">{r.difficulty}</td>
                          <td className="p-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditImportRow(r)}
                                title="Edit Question Row"
                                className="p-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded transition-all cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteImportRow(r.id)}
                                title="Delete Row"
                                className="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
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

      {/* EDIT IMPORT ROW DRAWER */}
      {editingImportRow && (
        <RightDrawer
          isOpen={showEditImportDrawer}
          onClose={() => { setShowEditImportDrawer(false); setEditingImportRow(null); }}
          title={editingImportRow.question ? 'Edit Preview Question' : 'Add New Question Row'}
        >
          <div className="space-y-4 text-xs text-left">
            {editingImportRow.errors && editingImportRow.errors.length > 0 && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1 text-rose-400">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <AlertCircle className="w-4 h-4" /> Please fix validation errors before saving:
                </div>
                {editingImportRow.errors.map((e, idx) => (
                  <div key={idx} className="text-[11px] pl-5">• {e}</div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                Category <span className="text-rose-500 font-bold">*</span>
              </label>
              <CustomSelect
                value={editingImportRow.category}
                onChange={val => setEditingImportRow(validateRow({ ...editingImportRow, category: val }))}
                options={categories.map(c => ({ value: c, label: c }))}
                searchable={true}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                Question Text <span className="text-rose-500 font-bold">*</span>
              </label>
              <textarea
                rows={3}
                value={editingImportRow.question}
                onChange={e => setEditingImportRow(validateRow({ ...editingImportRow, question: e.target.value }))}
                placeholder="Enter full question text..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none focus:outline-none focus:border-brandPrimary"
              />
            </div>

            <div className="space-y-3 border-t border-b border-slate-100 dark:border-white/5 py-3">
              <label className="block text-slate-400 font-bold uppercase text-[10px]">
                OMR Options (A, B, C, D) <span className="text-rose-500 font-bold">*</span>
              </label>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Option A (Mandatory)</label>
                <input
                  type="text"
                  value={editingImportRow.optionA}
                  onChange={e => setEditingImportRow(validateRow({ ...editingImportRow, optionA: e.target.value }))}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Option B (Mandatory)</label>
                <input
                  type="text"
                  value={editingImportRow.optionB}
                  onChange={e => setEditingImportRow(validateRow({ ...editingImportRow, optionB: e.target.value }))}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Option C (Optional)</label>
                <input
                  type="text"
                  value={editingImportRow.optionC}
                  onChange={e => setEditingImportRow(validateRow({ ...editingImportRow, optionC: e.target.value }))}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Option D (Optional)</label>
                <input
                  type="text"
                  value={editingImportRow.optionD}
                  onChange={e => setEditingImportRow(validateRow({ ...editingImportRow, optionD: e.target.value }))}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1.5">
                Correct Option <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Option A', 'Option B', 'Option C', 'Option D'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setEditingImportRow(validateRow({ ...editingImportRow, correctOption: opt }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${editingImportRow.correctOption === opt ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-slate-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Difficulty</label>
              <CustomSelect
                value={editingImportRow.difficulty}
                onChange={val => setEditingImportRow(validateRow({ ...editingImportRow, difficulty: val }))}
                options={[
                  { value: 'Easy', label: 'Easy' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Hard', label: 'Hard' },
                  { value: 'Expert', label: 'Expert' }
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Explanation / Solution Note</label>
              <textarea
                rows={2}
                value={editingImportRow.explanation}
                onChange={e => setEditingImportRow(validateRow({ ...editingImportRow, explanation: e.target.value }))}
                placeholder="Explanation for correct answer..."
                className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => { setShowEditImportDrawer(false); setEditingImportRow(null); }}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditingImportRow}
                className="flex-1 py-2.5 bg-emerald-500 text-white font-bold rounded-xl shadow-md hover:bg-emerald-600 cursor-pointer"
              >
                Save & Validate Row
              </button>
            </div>
          </div>
        </RightDrawer>
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
            folder="question"
            type="image"
            accept="image/*"
            value={questionForm.imageUrl}
            onChange={val => setQuestionForm({ ...questionForm, imageUrl: val })}
          />

          <FileUploadPicker
            label="Question Video Explanation"
            folder="question"
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

          <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setShowAddDrawer(false)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { resetQuestionForm(); showSnackbar('Form cleared.', 'info'); }}
              className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 font-bold rounded-xl cursor-pointer"
            >
              Clear Form
            </button>
            <button
              type="button"
              onClick={handleSaveQuestion}
              className="flex-1 py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Create Question
            </button>
          </div>
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
              <span className="text-[10px] font-bold text-brandPrimary uppercase tracking-wider block mb-1">
                OMR Multiple Choice Options (A, B, C, D)
              </span>

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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Negative Marks</label>
                <CustomSelect
                  value={editingQuestion.negativeMarks}
                  onChange={val => setEditingQuestion({ ...editingQuestion, negativeMarks: val })}
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
                  value={editingQuestion.approvalStatus}
                  onChange={val => setEditingQuestion({ ...editingQuestion, approvalStatus: val })}
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
              folder="question"
              type="image"
              accept="image/*"
              value={editingQuestion.imageUrl}
              onChange={val => setEditingQuestion({ ...editingQuestion, imageUrl: val })}
            />

            <FileUploadPicker
              label="Question Video Explanation"
              folder="question"
              type="video"
              accept="video/*"
              value={editingQuestion.videoUrl}
              onChange={val => setEditingQuestion({ ...editingQuestion, videoUrl: val })}
            />

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Explanation / Solution Hint</label>
              <textarea
                rows={2}
                value={editingQuestion.explanation}
                onChange={e => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                placeholder="Why is this answer correct?"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
              />
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

      {/* CONFIRMATION IMPORT MODAL BOX */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 text-left">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Question Import</h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">
                  "please check your select caterory and Question files"
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Selected Target Category:</span>
                <span className="font-bold text-brandPrimary">{importCategory || categories[0] || 'General Knowledge'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Uploaded File:</span>
                <span className="font-bold text-slate-700 dark:text-white truncate max-w-[200px]">{importFile?.name || 'CSV / Excel File'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valid Questions to Import:</span>
                <span className="font-bold text-emerald-500">{parsedRows.filter(r => r.isValid !== false).length} Questions</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeImport}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Import OK</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankPage;
