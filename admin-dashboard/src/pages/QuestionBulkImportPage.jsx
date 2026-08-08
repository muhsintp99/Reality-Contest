import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet, Upload, Download, CheckCircle2, AlertTriangle, ArrowLeft, Plus, CheckCircle, FileText
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';

export const QuestionBulkImportPage = () => {
  const { showAlert, showSnackbar } = useAlert();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [importCategory, setImportCategory] = useState('');
  const [isImporting, setIsImporting] = useState(false);

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
          const names = catList.map(c => typeof c === 'string' ? c : c.name).filter(Boolean);
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

  const handleDownloadSampleTemplate = () => {
    const defaultCat = categories[0] || 'General Knowledge';
    const csvContent =
      "Category,Question,Option A,Option B,Option C,Option D,Correct Option,Difficulty,Explanation\n" +
      `"${defaultCat}","What is the capital of France?","Paris","London","Berlin","Madrid","Option A","Easy","Paris is the capital of France."\n` +
      `"${defaultCat}","Which element has the symbol O?","Gold","Oxygen","Iron","Silver","Option B","Medium","O stands for Oxygen."\n` +
      `"${categories[1] || defaultCat}","Who painted the Mona Lisa?","Vincent van Gogh","Leonardo da Vinci","Pablo Picasso","Claude Monet","Option B","Medium","Painted in the early 16th century."`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `OMR_Question_Import_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar('CSV Import Template downloaded!', 'success');
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

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 7) {
        const hasCategoryInFile = categories.includes(parts[0]);
        const rowCategory = hasCategoryInFile ? parts[0] : importCategory;
        const colShift = hasCategoryInFile ? 1 : 0;

        rows.push({
          category: rowCategory,
          question: parts[0 + colShift] || '',
          optionA: parts[1 + colShift] || '',
          optionB: parts[2 + colShift] || '',
          optionC: parts[3 + colShift] || '',
          optionD: parts[4 + colShift] || '',
          correctOption: parts[5 + colShift] || 'Option A',
          difficulty: parts[6 + colShift] || 'Medium',
          explanation: parts[7 + colShift] || '',
          approvalStatus: 'Approved'
        });
      }
    }
    setParsedRows(rows);
    showSnackbar(`Parsed ${rows.length} valid question rows from file`, 'info');
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);
    try {
      await axios.post('/api/question-pools/bulk-import', {
        category: importCategory,
        questions: parsedRows
      }, { withCredentials: true });

      showSnackbar(`Successfully imported ${parsedRows.length} questions into Question Pool!`, 'success');
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
              Upload multi-row Excel or CSV spreadsheet files to import questions in bulk into category pools.
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
        <div className="border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-emerald-500 rounded-2xl p-10 text-center bg-slate-50/50 dark:bg-black/20 cursor-pointer transition-all relative">
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
                Supports .csv, .xlsx files with Category, Question, Option A, Option B, Option C, Option D, Correct Option, Difficulty columns.
              </p>
            </div>
          </div>
        </div>

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{parsedRows.length} Questions Ready for Import</span>
              </h4>
              <button
                onClick={handleConfirmImport}
                disabled={isImporting}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isImporting ? 'Importing Questions...' : 'Confirm & Insert Questions'}</span>
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto border border-slate-200 dark:border-white/10 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold sticky top-0">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Question Text</th>
                    <th className="p-3">Correct Option</th>
                    <th className="p-3">Difficulty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {parsedRows.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-brandPrimary">{r.category}</td>
                      <td className="p-3 truncate max-w-xs">{r.question}</td>
                      <td className="p-3 text-emerald-500 font-bold">{r.correctOption}</td>
                      <td className="p-3">{r.difficulty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
