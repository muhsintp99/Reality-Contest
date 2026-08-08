import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet, Upload, Download, CheckCircle2, AlertTriangle, ArrowLeft, Plus, CheckCircle, FileText,
  Edit2, Trash2, X, Search, Filter, AlertCircle, Eye, RefreshCw, Image as ImageIcon, Video, HelpCircle
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { RightDrawer } from '../components/RightDrawer';
import { FileUploadPicker } from '../components/FileUploadPicker';

export const QuestionBulkImportPage = () => {
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [importCategory, setImportCategory] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Preview filtering & search
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'valid' | 'errors'
  const [searchQuery, setSearchQuery] = useState('');

  // Row Editing Drawer State
  const [editingRow, setEditingRow] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      let res = await axios.get('/api/categories', { withCredentials: true }).catch(() => null);
      if (!res || !res.data) {
        res = await axios.get('/api/admin/categories', { withCredentials: true }).catch(() => null);
      }
      if (res && res.data) {
        const catList = Array.isArray(res.data) ? res.data : (res.data.categories || res.data.data || []);
        if (catList.length > 0) {
          const names = catList.map(c => typeof c === 'string' ? c : (c.title || c.name)).filter(Boolean);
          if (names.length > 0) {
            setCategories(Array.from(new Set(names)));
            setImportCategory(names[0]);
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

  const handleDownloadSampleTemplate = () => {
    const csvContent = "\uFEFF" +
      `Question,Option A,Option B,Option C,Option D,Correct Option,Difficulty,Explanation,Negative Marks,Image URL,Video URL\n` +
      `"What is the capital city of France?","Berlin","Madrid","Paris","Rome","Option C","Easy","Paris has been the capital city of France since 987 AD.","-0.25","https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500",""\n` +
      `"Which element has the chemical symbol 'O'?","Gold","Oxygen","Osmium","Silver","Option B","Easy","Oxygen is element number 8 on the periodic table.","-0.25","",""`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `question_import_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar('CSV Import Template downloaded successfully!', 'success');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === 'string') {
        parseCSV(text);
      }
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
    if (lines.length <= 1) {
      showAlert('Format Warning', 'File is empty or contains only header.', 'warning');
      return;
    }

    const headerLine = lines[0].toLowerCase();
    const hasCategoryCol = headerLine.includes('category');

    const rawRows = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 3) {
        let cat = importCategory || categories[0] || 'General Knowledge';
        let qIdx = 0;

        if (hasCategoryCol && parts.length >= 7) {
          cat = parts[0] || importCategory;
          qIdx = 1;
        }

        const raw = {
          id: `row-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          category: cat,
          question: parts[qIdx] || '',
          optionA: parts[qIdx + 1] || '',
          optionB: parts[qIdx + 2] || '',
          optionC: parts[qIdx + 3] || '',
          optionD: parts[qIdx + 4] || '',
          correctOption: parts[qIdx + 5] || 'Option A',
          difficulty: parts[qIdx + 6] || 'Medium',
          explanation: parts[qIdx + 7] || '',
          negativeMarks: parts[qIdx + 8] || '-0.25',
          imageUrl: parts[qIdx + 9] || '',
          videoUrl: parts[qIdx + 10] || '',
          approvalStatus: 'Approved'
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

  // Row Edit Handlers
  const handleOpenAddRow = () => {
    const newRow = validateRow({
      id: `row-new-${Date.now()}`,
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
      approvalStatus: 'Approved'
    });
    setEditingRow(newRow);
    setIsDrawerOpen(true);
  };

  const handleOpenEditRow = (row) => {
    setEditingRow({ ...row });
    setIsDrawerOpen(true);
  };

  const handleSaveEditingRow = () => {
    if (!editingRow) return;
    const validated = validateRow(editingRow);
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
    setIsDrawerOpen(false);
    setEditingRow(null);
    showSnackbar('Question row updated & validated successfully!', 'success');
  };

  const handleDeleteRow = (id) => {
    setParsedRows(prev => prev.filter(r => r.id !== id));
    showSnackbar('Row deleted from preview', 'info');
  };

  const handleClearAllRows = () => {
    showConfirm('Clear All Preview Rows', 'Are you sure you want to clear all parsed rows from preview?', () => {
      setParsedRows([]);
      setImportFile(null);
      showSnackbar('Preview list cleared.', 'info');
    });
  };

  // Derived Preview Datasets
  const validRows = useMemo(() => parsedRows.filter(r => r.isValid), [parsedRows]);
  const errorRows = useMemo(() => parsedRows.filter(r => !r.isValid), [parsedRows]);

  const filteredPreviewRows = useMemo(() => {
    return parsedRows.filter(r => {
      const matchesFilter =
        filterTab === 'all' ? true :
        filterTab === 'valid' ? r.isValid :
        !r.isValid;

      const qStr = searchQuery.toLowerCase();
      const matchesSearch = !qStr ||
        r.question.toLowerCase().includes(qStr) ||
        r.category.toLowerCase().includes(qStr) ||
        r.optionA.toLowerCase().includes(qStr) ||
        r.optionB.toLowerCase().includes(qStr);

      return matchesFilter && matchesSearch;
    });
  }, [parsedRows, filterTab, searchQuery]);

  // Bulk Import Submission with Confirmation Modal Box
  const handleConfirmImportClick = () => {
    if (validRows.length === 0) {
      showAlert('Import Failed', 'There are no valid questions to import. Please edit the rows to fix errors first.', 'warning');
      return;
    }
    setShowConfirmModal(true);
  };

  const executeImport = async () => {
    setShowConfirmModal(false);
    setIsImporting(true);
    try {
      await axios.post('/api/question-pools/bulk-import', {
        category: importCategory,
        questions: validRows.map(r => ({ ...r, category: importCategory }))
      }, { withCredentials: true });

      showSnackbar(`Successfully imported ${validRows.length} questions into Category "${importCategory}"!`, 'success');
      setImportFile(null);
      setParsedRows([]);
      navigate('/admin-dashboard/question-bank/pool');
    } catch (err) {
      showAlert('Import Failed', err.response?.data?.message || 'Failed to bulk import questions.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin-dashboard/question-bank/pool')}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Pool</span>
          </button>
          <div>
            <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2.5">
              <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
              Bulk Excel / CSV Question Importer
            </h2>
            <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
              Upload multi-row Excel or CSV files, validate errors, edit rows on-the-fly, and import in bulk.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadSampleTemplate}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      {/* Main Import Card */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Default Target Category Selection</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select category to assign if CSV file does not specify an explicit Category column.
            </p>
          </div>

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
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                {importFile ? importFile.name : 'Click or Drag & Drop Excel / CSV File Here'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Supports .csv, .xlsx files with Category, Question, Option A, Option B, Option C, Option D, Correct Option columns.
              </p>
            </div>
          </div>
        </div>

        {/* Parsed Preview Table & Interactive Controls */}
        {parsedRows.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5 animate-fade-in">
            {/* Error Summary Notice Card */}
            {errorRows.length > 0 && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    <span>Sheet Validation Error Notice ({errorRows.length} {errorRows.length === 1 ? 'Row Has Errors' : 'Rows Have Errors'})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setFilterTab('errors')}
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
                    <CheckCircle2 className="w-3.5 h-3.5" /> {validRows.length} Valid
                  </span>
                  {errorRows.length > 0 && (
                    <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold rounded-lg flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5" /> {errorRows.length} Errors
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={handleOpenAddRow}
                  className="px-3.5 py-2 bg-brandPrimary/10 hover:bg-brandPrimary/20 text-brandPrimary border border-brandPrimary/20 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question Row</span>
                </button>
                <button
                  onClick={handleClearAllRows}
                  className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear List</span>
                </button>
                <button
                  onClick={handleConfirmImportClick}
                  disabled={isImporting || validRows.length === 0}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isImporting ? 'Importing...' : `Confirm & Import (${validRows.length} Valid)`}</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1.5 font-bold rounded-lg transition-all ${filterTab === 'all' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-white/60'}`}
                >
                  All Rows ({parsedRows.length})
                </button>
                <button
                  onClick={() => setFilterTab('valid')}
                  className={`px-3 py-1.5 font-bold rounded-lg transition-all ${filterTab === 'valid' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-white/60'}`}
                >
                  Valid Only ({validRows.length})
                </button>
                <button
                  onClick={() => setFilterTab('errors')}
                  className={`px-3 py-1.5 font-bold rounded-lg transition-all ${filterTab === 'errors' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-white/60'}`}
                >
                  Errors Only ({errorRows.length})
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search in preview rows..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>

            {/* Preview Data Table */}
            <div className="max-h-96 overflow-y-auto border border-slate-200 dark:border-white/10 rounded-2xl shadow-inner scrollbar-hide">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] sticky top-0 backdrop-blur-md z-10">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Question Text & Error Note</th>
                    <th className="p-3">Option A</th>
                    <th className="p-3">Option B</th>
                    <th className="p-3">Correct Option</th>
                    <th className="p-3">Difficulty</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredPreviewRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No rows found matching current filter or search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPreviewRows.map((r, idx) => (
                      <tr
                        key={r.id}
                        className={`transition-colors ${!r.isValid ? 'bg-rose-500/5 hover:bg-rose-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                      >
                        <td className="p-3 font-mono font-bold text-slate-400 align-top">{idx + 1}</td>
                        <td className="p-3 align-top">
                          {r.isValid ? (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold rounded-full flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <div className="group relative w-fit">
                              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold rounded-full flex items-center gap-1 cursor-pointer">
                                <AlertCircle className="w-3 h-3" /> {r.errors.length} {r.errors.length === 1 ? 'Error' : 'Errors'}
                              </span>
                              {/* Error Popover */}
                              <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-20 w-64 bg-rose-950 text-rose-200 border border-rose-800 p-2.5 rounded-xl text-[10px] shadow-xl space-y-1">
                                <div className="font-bold text-white border-b border-rose-800 pb-1">Validation Errors:</div>
                                {r.errors.map((err, eIdx) => (
                                  <div key={eIdx} className="flex items-center gap-1 text-rose-300">
                                    • {err}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-bold text-brandPrimary align-top">{r.category}</td>
                        <td className="p-3 max-w-xs align-top">
                          <div className="font-bold truncate" title={r.question}>
                            {r.question || <span className="text-rose-400 italic font-normal">[Missing Question]</span>}
                          </div>
                          {!r.isValid && (
                            <div className="mt-1.5 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-400 space-y-0.5 animate-fade-in">
                              <span className="font-extrabold uppercase text-[9px] text-rose-400 block border-b border-rose-500/20 pb-0.5 mb-1">
                                ⚠️ Error Note:
                              </span>
                              {r.errors.map((err, eIdx) => (
                                <div key={eIdx} className="flex items-center gap-1 font-medium">
                                  • {err}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-3 truncate max-w-[120px] text-slate-500 dark:text-slate-400">
                          {r.optionA || <span className="text-rose-400 italic">[Empty]</span>}
                        </td>
                        <td className="p-3 truncate max-w-[120px] text-slate-500 dark:text-slate-400">
                          {r.optionB || <span className="text-rose-400 italic">[Empty]</span>}
                        </td>
                        <td className="p-3 font-bold text-emerald-500">
                          {r.correctOption}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded font-semibold text-[10px]">
                            {r.difficulty}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditRow(r)}
                              title="Edit Question Row"
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-all cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRow(r.id)}
                              title="Delete Row"
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        )}
      </div>

      {/* EDIT / ADD QUESTION ROW DRAWER */}
      {editingRow && (
        <RightDrawer
          isOpen={isDrawerOpen}
          onClose={() => { setIsDrawerOpen(false); setEditingRow(null); }}
          title={editingRow.question ? 'Edit Preview Question' : 'Add New Question Row'}
        >
          <div className="space-y-4 text-xs text-left">
            {/* Live Error Alert */}
            {editingRow.errors && editingRow.errors.length > 0 && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1 text-rose-400">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <AlertCircle className="w-4 h-4" /> Please fix validation errors before saving:
                </div>
                {editingRow.errors.map((e, idx) => (
                  <div key={idx} className="text-[11px] pl-5">• {e}</div>
                ))}
              </div>
            )}

            {/* Category selection */}
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                Category <span className="text-rose-500 font-bold">*</span>
              </label>
              <CustomSelect
                value={editingRow.category}
                onChange={val => setEditingRow(validateRow({ ...editingRow, category: val }))}
                options={categories.map(c => ({ value: c, label: c }))}
                searchable={true}
                className="w-full"
              />
            </div>

            {/* Question text */}
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                Question Text <span className="text-rose-500 font-bold">*</span>
              </label>
              <textarea
                rows={3}
                value={editingRow.question}
                onChange={e => setEditingRow(validateRow({ ...editingRow, question: e.target.value }))}
                placeholder="Enter full question text..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none focus:outline-none focus:border-brandPrimary"
              />
            </div>

            {/* Options A, B, C, D Inputs */}
            <div className="space-y-3 border-t border-b border-slate-100 dark:border-white/5 py-3">
              <label className="block text-slate-400 font-bold uppercase text-[10px]">
                OMR Options (A, B, C, D) <span className="text-rose-500 font-bold">*</span>
              </label>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Option A (Mandatory)</label>
                <input
                  type="text"
                  value={editingRow.optionA}
                  onChange={e => setEditingRow(validateRow({ ...editingRow, optionA: e.target.value }))}
                  placeholder="Enter Option A..."
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Option B (Mandatory)</label>
                <input
                  type="text"
                  value={editingRow.optionB}
                  onChange={e => setEditingRow(validateRow({ ...editingRow, optionB: e.target.value }))}
                  placeholder="Enter Option B..."
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Option C (Optional)</label>
                <input
                  type="text"
                  value={editingRow.optionC}
                  onChange={e => setEditingRow(validateRow({ ...editingRow, optionC: e.target.value }))}
                  placeholder="Enter Option C..."
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Option D (Optional)</label>
                <input
                  type="text"
                  value={editingRow.optionD}
                  onChange={e => setEditingRow(validateRow({ ...editingRow, optionD: e.target.value }))}
                  placeholder="Enter Option D..."
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>
            </div>

            {/* Correct Option Selector */}
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1.5">
                Correct Option <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Option A', 'Option B', 'Option C', 'Option D'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setEditingRow(validateRow({ ...editingRow, correctOption: opt }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${editingRow.correctOption === opt ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-slate-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty & Negative Marks */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Difficulty</label>
                <CustomSelect
                  value={editingRow.difficulty}
                  onChange={val => setEditingRow(validateRow({ ...editingRow, difficulty: val }))}
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
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Negative Marks</label>
                <input
                  type="text"
                  value={editingRow.negativeMarks}
                  onChange={e => setEditingRow(validateRow({ ...editingRow, negativeMarks: e.target.value }))}
                  placeholder="-0.25"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> Image Attachment URL
                </label>
                <FileUploadPicker
                  folder="question"
                  accept="image/*"
                  value={editingRow.imageUrl}
                  onChange={(url) => setEditingRow(validateRow({ ...editingRow, imageUrl: url }))}
                  label="Question Image"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-500" /> Video Attachment URL
                </label>
                <FileUploadPicker
                  folder="question"
                  accept="video/*"
                  value={editingRow.videoUrl}
                  onChange={(url) => setEditingRow(validateRow({ ...editingRow, videoUrl: url }))}
                  label="Explanation Video"
                />
              </div>
            </div>

            {/* Explanation Note */}
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Explanation / Solution Note</label>
              <textarea
                rows={2}
                value={editingRow.explanation}
                onChange={e => setEditingRow(validateRow({ ...editingRow, explanation: e.target.value }))}
                placeholder="Explanation for correct answer..."
                className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => { setIsDrawerOpen(false); setEditingRow(null); }}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditingRow}
                className="flex-1 py-2.5 bg-emerald-500 text-white font-bold rounded-xl shadow-md hover:bg-emerald-600 cursor-pointer"
              >
                Save & Validate Row
              </button>
            </div>
          </div>
        </RightDrawer>
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
                <span className="font-bold text-brandPrimary">{importCategory || 'Not Selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Uploaded File:</span>
                <span className="font-bold text-slate-700 dark:text-white truncate max-w-[200px]">{importFile?.name || 'CSV / Excel File'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valid Questions to Import:</span>
                <span className="font-bold text-emerald-500">{validRows.length} Questions</span>
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

export default QuestionBulkImportPage;
