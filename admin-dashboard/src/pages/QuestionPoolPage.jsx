import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle, Plus, FileSpreadsheet, Layers, ShieldCheck, BarChart2,
  CheckCircle, Search, Filter, Edit2, Trash2, Eye, ToggleLeft, ToggleRight, X, Image as ImageIcon, Video,
  Download, Upload, Sparkles, CheckCircle2, Clock, AlertTriangle, ChevronRight, FileText, Folder, FolderOpen, FolderPlus, ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { RightDrawer } from '../components/RightDrawer';
import { FileUploadPicker } from '../components/FileUploadPicker';

export const QuestionPoolPage = () => {
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth.isMockMode);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected Category Folder State: null (Show Folders Grid) | string (Inside Folder)
  const [selectedFolderCategory, setSelectedFolderCategory] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState('10');

  // Categories & Questions (Strictly Live MongoDB Data)
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Drawers & Modals
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [viewingQuestion, setViewingQuestion] = useState(null);
  const [showFormatModal, setShowFormatModal] = useState(false);

  // On-the-fly Category Creation State
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const handleSaveNewCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      showSnackbar('Category name cannot be empty', 'error');
      return;
    }
    setIsSavingCategory(true);
    try {
      await axios.post('/api/categories', {
        title: trimmed,
        name: trimmed,
        icon: 'Folder',
        status: 'Active'
      }, { withCredentials: true }).catch(() => null);
      
      setCategories(prev => Array.from(new Set([...prev, trimmed])));
      setQuestionForm(prev => ({ ...prev, category: trimmed }));
      setNewCategoryName('');
      setIsCreatingNewCategory(false);
      showSnackbar(`Category "${trimmed}" created & selected!`, 'success');
    } catch (err) {
      setCategories(prev => Array.from(new Set([...prev, trimmed])));
      setQuestionForm(prev => ({ ...prev, category: trimmed }));
      setNewCategoryName('');
      setIsCreatingNewCategory(false);
      showSnackbar(`Category "${trimmed}" added!`, 'success');
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Form State
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

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
  }, []);

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
            return;
          }
        }
      }
      setCategories([]);
    } catch (err) {
      console.warn('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const fetchQuestions = async () => {
    try {
      let res = await axios.get('/api/questions', { withCredentials: true }).catch(() => null);
      if (!res || !res.data) {
        res = await axios.get('/api/question-pools/all-questions', { withCredentials: true }).catch(() => null);
      }
      if (!res || !res.data) {
        res = await axios.get('/api/question-pools/questions', { withCredentials: true }).catch(() => null);
      }
      if (res && res.data) {
        const qList = Array.isArray(res.data) ? res.data : (res.data.questions || res.data.data || []);
        setQuestions(qList);
      }
    } catch (err) {
      console.warn('Error fetching questions:', err);
    }
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
    setEditingQuestion(null);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.category) {
      showAlert('Warning', 'Category is mandatory. Please select a valid category.', 'warning');
      return;
    }
    if (!questionForm.question.trim() || !questionForm.optionA.trim() || !questionForm.optionB.trim()) {
      showAlert('Validation Error', 'Question text, Option A, and Option B are required.', 'error');
      return;
    }

    try {
      if (editingQuestion) {
        await axios.put(`/api/question-pools/questions/${editingQuestion.id || editingQuestion._id}`, questionForm, { withCredentials: true });
        showSnackbar('Question updated successfully!', 'success');
      } else {
        await axios.post('/api/question-pools/questions', questionForm, { withCredentials: true });
        showSnackbar('Question added to pool successfully!', 'success');
      }
      setShowAddDrawer(false);
      resetQuestionForm();
      fetchQuestions();
    } catch (err) {
      showAlert('Save Failed', err.response?.data?.message || 'Failed to save question.', 'error');
    }
  };

  const handleDeleteQuestion = (qId) => {
    showConfirm(
      'Delete Question',
      'Are you sure you want to delete this question from the pool?',
      async () => {
        try {
          await axios.delete(`/api/question-pools/questions/${qId}`, { withCredentials: true });
          showSnackbar('Question deleted from pool', 'info');
          fetchQuestions();
        } catch (err) {
          showAlert('Delete Failed', 'Failed to delete question.', 'error');
        }
      }
    );
  };

  const handleClearAllQuestions = () => {
    showConfirm(
      'Clear All Questions & Pools',
      'Are you sure you want to delete ALL questions and pools from the live database? This action cannot be undone.',
      async () => {
        try {
          await axios.delete('/api/question-pools/clear-all', { withCredentials: true });
          showSnackbar('All questions and pools cleared from database', 'info');
          fetchQuestions();
        } catch (err) {
          showAlert('Clear Failed', 'Failed to clear questions.', 'error');
        }
      }
    );
  };

  const handleEditClick = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      category: q.category || categories[0],
      question: q.question || '',
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      correctOption: q.correctOption || 'Option A',
      difficulty: q.difficulty || 'Medium',
      explanation: q.explanation || '',
      negativeMarks: q.negativeMarks || '-0.25',
      approvalStatus: q.approvalStatus || 'Approved',
      imageUrl: q.imageUrl || '',
      videoUrl: q.videoUrl || ''
    });
    setShowAddDrawer(true);
  };

  const displayCategories = useMemo(() => {
    const fromApi = categories || [];
    const fromQuestions = questions.map(q => q.category).filter(Boolean);
    return Array.from(new Set([...fromApi, ...fromQuestions]));
  }, [categories, questions]);

  const categoryStats = useMemo(() => {
    const stats = {};
    displayCategories.forEach(c => {
      stats[c] = { total: 0, easy: 0, medium: 0, hard: 0 };
    });
    questions.forEach(q => {
      const cat = q.category;
      if (cat) {
        if (!stats[cat]) {
          stats[cat] = { total: 0, easy: 0, medium: 0, hard: 0 };
        }
        stats[cat].total += 1;
        const diff = (q.difficulty || 'Medium').toLowerCase();
        if (diff === 'easy') stats[cat].easy += 1;
        else if (diff === 'hard') stats[cat].hard += 1;
        else stats[cat].medium += 1;
      }
    });
    return stats;
  }, [questions, displayCategories]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(item => {
      const matchesSearch = item.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const targetCategory = selectedFolderCategory || (categoryFilter === 'All' ? null : categoryFilter);
      const matchesCat = !targetCategory || item.category === targetCategory;
      const matchesDiff = difficultyFilter === 'All' || item.difficulty === difficultyFilter;
      const matchesStatus = statusFilter === 'All' || item.approvalStatus === statusFilter;

      return matchesSearch && matchesCat && matchesDiff && matchesStatus;
    });
  }, [questions, searchTerm, selectedFolderCategory, categoryFilter, difficultyFilter, statusFilter]);

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
            <FolderOpen className="w-6 h-6 text-brandPrimary" />
            Question Pool Repository
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Category-mandatory single question builder and repository directory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFormatModal(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Download Excel Format</span>
          </button>

          <button
            onClick={() => navigate('/admin-dashboard/question-bank/import')}
            className="px-3.5 py-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shrink-0 cursor-pointer"
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
            onClick={() => { setIsCreatingNewCategory(true); setShowAddDrawer(true); }}
            className="px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shrink-0 cursor-pointer"
            title="Create a new Category Pool"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Create Category</span>
          </button>

          <button
            onClick={() => { setIsCreatingNewCategory(false); resetQuestionForm(); setShowAddDrawer(true); }}
            className="px-4 py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Question</span>
          </button>
        </div>
      </div>

      {/* LEVEL 1: CATEGORY FOLDERS GRID VIEW */}
      {selectedFolderCategory === null ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-brandPrimary" />
                <span>Question Pool Category Folders ({displayCategories.length})</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Master All Questions Folder */}
            <div
              onClick={() => setSelectedFolderCategory('__ALL__')}
              className="bg-gradient-to-br from-brandPrimary/10 to-brandPrimary/5 dark:from-brandPrimary/20 dark:to-brandPrimary/10 border-2 border-brandPrimary/30 hover:border-brandPrimary p-5 rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md group space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 bg-brandPrimary text-white rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 bg-brandPrimary text-white text-[10px] font-bold rounded-full">
                  All Questions
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brandPrimary transition-colors">
                  All Question Pools
                </h4>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  {questions.length} Questions Total
                </p>
              </div>
            </div>

            {/* Dynamic Category Folders */}
            {displayCategories
              .filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(cat => {
                const stat = categoryStats[cat] || { total: 0, easy: 0, medium: 0, hard: 0 };
                return (
                  <div
                    key={cat}
                    onClick={() => setSelectedFolderCategory(cat)}
                    className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 hover:border-brandPrimary/50 p-5 rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md group space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl group-hover:bg-brandPrimary group-hover:text-white transition-all">
                        <Folder className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold rounded-full">
                        {stat.total} Qs
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brandPrimary transition-colors truncate">
                        {cat}
                      </h4>
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-semibold text-slate-400">
                        <span className="text-emerald-500">Easy: {stat.easy}</span>
                        <span>•</span>
                        <span className="text-amber-500">Med: {stat.medium}</span>
                        <span>•</span>
                        <span className="text-rose-500">Hard: {stat.hard}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        /* LEVEL 2: INSIDE CATEGORY FOLDER QUESTION LIST */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedFolderCategory(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Folders</span>
              </button>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-brandPrimary" />
                  <span>
                    {selectedFolderCategory === '__ALL__' ? 'All Question Pools' : selectedFolderCategory} ({filteredQuestions.length} Questions)
                  </span>
                </h3>
              </div>
            </div>

            {/* Filters bar inside folder */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>

              <CustomSelect
                value={difficultyFilter}
                onChange={setDifficultyFilter}
                options={[
                  { value: 'All', label: 'All Difficulties' },
                  { value: 'Easy', label: 'Easy' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Hard', label: 'Hard' }
                ]}
                className="w-36"
              />

              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'All', label: 'All Status' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Pending', label: 'Pending' }
                ]}
                className="w-32"
              />
            </div>
          </div>

          {/* Questions Table */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4">#</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Question</th>
                    <th className="p-4">Options (A / B / C / D)</th>
                    <th className="p-4">Correct</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {paginatedQuestions.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        No questions found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedQuestions.map((q, idx) => (
                      <tr key={q.id || q._id || idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-400">{startIndex + idx + 1}</td>
                        <td className="p-4 font-bold text-brandPrimary">
                          <span className="px-2.5 py-1 bg-brandPrimary/10 rounded-lg">
                            {q.category || 'General Knowledge'}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-slate-900 dark:text-white max-w-xs">
                          <div className="line-clamp-2">{q.question}</div>
                          {q.imageUrl && <span className="inline-block mt-1 text-[10px] bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-brandPrimary">🖼️ Has Image</span>}
                        </td>
                        <td className="p-4 text-[11px] space-y-0.5 text-slate-600 dark:text-slate-400">
                          <div><strong className="text-slate-400">A:</strong> {q.optionA}</div>
                          <div><strong className="text-slate-400">B:</strong> {q.optionB}</div>
                          <div><strong className="text-slate-400">C:</strong> {q.optionC || '-'}</div>
                          <div><strong className="text-slate-400">D:</strong> {q.optionD || '-'}</div>
                        </td>
                        <td className="p-4 font-bold text-emerald-500">{q.correctOption}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                            q.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-500' :
                            'bg-amber-500/10 text-amber-500'
                          }`}>
                            {q.difficulty || 'Medium'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            {q.approvalStatus || 'Approved'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setViewingQuestion(q)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                            title="View Question Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(q)}
                            className="p-1.5 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors"
                            title="Edit Question"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id || q._id)}
                            className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Customizable Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-xs">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <span>
                  Showing {totalItems > 0 ? startIndex + 1 : 0} to {endIndex} of {totalItems} questions
                </span>
                <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-white/10 pl-3">
                  <span>Per page:</span>
                  <CustomSelect
                    value={itemsPerPage}
                    onChange={setItemsPerPage}
                    options={[
                      { value: '5', label: '5' },
                      { value: '10', label: '10' },
                      { value: '50', label: '50' },
                      { value: '100', label: '100' },
                      { value: 'All', label: 'All' }
                    ]}
                    direction="up"
                    className="w-20"
                  />
                </div>
              </div>

              {itemsPerPage !== 'All' && totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={safeCurrentPage === 1}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all"
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

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || Math.abs(page - safeCurrentPage) <= 1)
                    .map((page, index, array) => {
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
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
                  >
                    »
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SINGLE QUESTION DRAWER */}
      <RightDrawer
        isOpen={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        title={editingQuestion ? "Edit Question" : "Create Single OMR Question"}
      >
        <div className="space-y-4 text-xs text-left">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-400 font-bold uppercase text-[10px]">
                Category <span className="text-rose-500 font-bold">* (Mandatory)</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingNewCategory(!isCreatingNewCategory)}
                className="text-[11px] font-bold text-brandPrimary hover:underline flex items-center gap-1 cursor-pointer"
              >
                {isCreatingNewCategory ? '← Select Existing Category' : '+ Create New Category'}
              </button>
            </div>

            {isCreatingNewCategory ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSaveNewCategory(); } }}
                  placeholder="Enter new category name (e.g. Science)..."
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-black/40 border border-brandPrimary/50 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveNewCategory}
                  disabled={isSavingCategory}
                  className="px-3.5 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap"
                >
                  Save & Select
                </button>
              </div>
            ) : (
              <CustomSelect
                value={questionForm.category}
                onChange={val => setQuestionForm({ ...questionForm, category: val })}
                options={displayCategories.map(c => ({ value: c, label: c }))}
                searchable={true}
                placeholder={displayCategories.length === 0 ? "No category found. Click + Create New Category" : "Select Category..."}
                className="w-full"
              />
            )}
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Question Text *</label>
            <textarea
              rows="3"
              value={questionForm.question}
              onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })}
              placeholder="Type the full question text here..."
              className="w-full p-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brandPrimary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Option A *</label>
              <input
                type="text"
                value={questionForm.optionA}
                onChange={e => setQuestionForm({ ...questionForm, optionA: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Option B *</label>
              <input
                type="text"
                value={questionForm.optionB}
                onChange={e => setQuestionForm({ ...questionForm, optionB: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Option C</label>
              <input
                type="text"
                value={questionForm.optionC}
                onChange={e => setQuestionForm({ ...questionForm, optionC: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Option D</label>
              <input
                type="text"
                value={questionForm.optionD}
                onChange={e => setQuestionForm({ ...questionForm, optionD: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Correct Option *</label>
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
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Difficulty *</label>
              <CustomSelect
                value={questionForm.difficulty}
                onChange={val => setQuestionForm({ ...questionForm, difficulty: val })}
                options={[
                  { value: 'Easy', label: 'Easy' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Hard', label: 'Hard' }
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
                  { value: '0', label: 'None (0)' },
                  { value: '-0.25', label: '-0.25' },
                  { value: '-0.50', label: '-0.50' }
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
                  { value: 'Pending', label: 'Pending' }
                ]}
                className="w-full"
              />
            </div>
          </div>

          {/* Media Attachments */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-brandPrimary" />
                Question Image Attachment
              </label>
              <FileUploadPicker
                folder="question"
                accept="image/*"
                value={questionForm.imageUrl}
                onChange={(url) => setQuestionForm({ ...questionForm, imageUrl: url })}
                label="Question Image"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-purple-500" />
                Explanation Video Attachment
              </label>
              <FileUploadPicker
                folder="question"
                accept="video/*"
                value={questionForm.videoUrl}
                onChange={(url) => setQuestionForm({ ...questionForm, videoUrl: url })}
                label="Explanation Video"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Explanation / Solution Note</label>
            <textarea
              rows="2"
              value={questionForm.explanation}
              onChange={e => setQuestionForm({ ...questionForm, explanation: e.target.value })}
              placeholder="Add explanation for correct answer..."
              className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setShowAddDrawer(false)}
              className="flex-1 py-2.5 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveQuestion}
              className="flex-1 py-2.5 bg-brandPrimary text-white font-bold rounded-xl shadow-md hover:bg-brandPrimary/90"
            >
              {editingQuestion ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </div>
      </RightDrawer>

      {/* VIEW QUESTION MODAL */}
      {viewingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 animate-scale-up text-left">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
              <span className="text-xs font-bold text-brandPrimary uppercase tracking-wider">
                {viewingQuestion.category || 'General Knowledge'}
              </span>
              <button onClick={() => setViewingQuestion(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{viewingQuestion.question}</h3>

            {viewingQuestion.imageUrl && (
              <img src={viewingQuestion.imageUrl} alt="Question" className="max-h-48 rounded-xl border object-contain" />
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl border ${viewingQuestion.correctOption === 'Option A' ? 'bg-emerald-500/10 border-emerald-500 font-bold text-emerald-500' : 'bg-slate-50 dark:bg-white/5'}`}>
                A: {viewingQuestion.optionA}
              </div>
              <div className={`p-2.5 rounded-xl border ${viewingQuestion.correctOption === 'Option B' ? 'bg-emerald-500/10 border-emerald-500 font-bold text-emerald-500' : 'bg-slate-50 dark:bg-white/5'}`}>
                B: {viewingQuestion.optionB}
              </div>
              <div className={`p-2.5 rounded-xl border ${viewingQuestion.correctOption === 'Option C' ? 'bg-emerald-500/10 border-emerald-500 font-bold text-emerald-500' : 'bg-slate-50 dark:bg-white/5'}`}>
                C: {viewingQuestion.optionC || '-'}
              </div>
              <div className={`p-2.5 rounded-xl border ${viewingQuestion.correctOption === 'Option D' ? 'bg-emerald-500/10 border-emerald-500 font-bold text-emerald-500' : 'bg-slate-50 dark:bg-white/5'}`}>
                D: {viewingQuestion.optionD || '-'}
              </div>
            </div>

            {viewingQuestion.explanation && (
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[10px]">Explanation:</span>
                <p className="text-slate-700 dark:text-slate-300">{viewingQuestion.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
