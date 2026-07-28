import React, { useState } from 'react';
import {
  HelpCircle, Plus, FileSpreadsheet, Layers, ShieldCheck, BarChart2,
  CheckCircle, Search, Filter, Edit, Trash2, Eye, ToggleLeft, ToggleRight, X, Image, Video
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const QuestionBankPage = () => {
  const { showSnackbar } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [viewingQuestion, setViewingQuestion] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(null);

  const [questions, setQuestions] = useState([
    { id: 'Q-901', category: 'Logic & Reasoning', difficulty: 'Medium', question: 'If 5 workers complete a wall in 12 days, how long will 6 workers take?', answer: '10 Days', explanation: 'Inversely proportional: (5 * 12) / 6 = 10', negativeMarks: '-0.25', media: 'None', status: 'Active' },
    { id: 'Q-902', category: 'General Knowledge', difficulty: 'Hard', question: 'Identify the historical monument depicted in the video snippet.', answer: 'Hampi Ruins', explanation: 'Located in Vijayanagara, Karnataka.', negativeMarks: '-0.50', media: 'Video', status: 'Active' },
    { id: 'Q-903', category: 'Speed Math', difficulty: 'Easy', question: 'What is 15% of 480?', answer: '72', explanation: '10% = 48, 5% = 24 -> 48 + 24 = 72', negativeMarks: '-0.10', media: 'None', status: 'Inactive' }
  ]);

  const [formData, setFormData] = useState({
    category: 'General Knowledge',
    difficulty: 'Medium',
    question: '',
    answer: '',
    explanation: '',
    negativeMarks: '-0.25',
    media: 'None',
    status: 'Active'
  });

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) || q.id.toLowerCase().includes(searchTerm.toLowerCase()) || q.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesDiff && matchesStatus;
  });

  const handleToggleStatus = (id) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        const nextStatus = q.status === 'Active' ? 'Inactive' : 'Active';
        showSnackbar(`Question ${q.id} status changed to ${nextStatus}`, 'info');
        return { ...q, status: nextStatus };
      }
      return q;
    }));
  };

  const handleSaveAdd = () => {
    if (!formData.question || !formData.answer) {
      showSnackbar('Please fill in Question & Correct Answer', 'warning');
      return;
    }
    const newQ = {
      id: `Q-${Date.now().toString().slice(-4)}`,
      ...formData
    };
    setQuestions([newQ, ...questions]);
    showSnackbar('New Question added to Question Bank!', 'success');
    setShowAddModal(false);
    setFormData({ category: 'General Knowledge', difficulty: 'Medium', question: '', answer: '', explanation: '', negativeMarks: '-0.25', media: 'None', status: 'Active' });
  };

  const handleSaveEdit = () => {
    setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? editingQuestion : q));
    showSnackbar(`Question ${editingQuestion.id} updated successfully!`, 'success');
    setEditingQuestion(null);
  };

  const handleDelete = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    showSnackbar(`Question ${id} deleted!`, 'success');
    setDeletingQuestion(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-brandPrimary" /> Question Bank Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Add, Edit, View Details, Delete, Active Status Toggle, Search & Filter Questions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => showSnackbar('Excel Import Wizard Ready', 'info')}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-500 font-semibold text-xs rounded-xl hover:bg-emerald-500/20"
          >
            <FileSpreadsheet className="w-4 h-4" /> Import Excel
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brandPrimary text-white font-semibold text-xs rounded-xl shadow-lg hover:bg-brandPrimary/90"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions, category or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Difficulty:</span>
            <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-white">
              <option value="All">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Status:</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-white">
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-5 py-3.5">ID / Category</th>
                <th className="px-5 py-3.5">Question Text</th>
                <th className="px-5 py-3.5">Answer & Explanation</th>
                <th className="px-5 py-3.5">Difficulty / Neg. Marks</th>
                <th className="px-5 py-3.5">Active Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {filteredQuestions.map(q => (
                <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{q.id}</div>
                    <div className="text-[11px] text-slate-400">{q.category}</div>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{q.question}</div>
                    {q.media !== 'None' && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-brandPrimary bg-brandPrimary/10 px-2 py-0.5 rounded mt-1">
                        {q.media === 'Video' ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                        {q.media} Media
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-emerald-500">Ans: {q.answer}</div>
                    <div className="text-[10px] text-slate-400 italic mt-0.5">{q.explanation}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{q.difficulty}</div>
                    <div className="text-[10px] text-rose-500 font-bold">Neg: {q.negativeMarks}</div>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggleStatus(q.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        q.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}
                    >
                      {q.status === 'Active' ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" /> : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />}
                      {q.status}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewingQuestion(q)} title="View Details" className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditingQuestion(q)} title="Edit Question" className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeletingQuestion(q)} title="Delete Question" className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20">
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Question</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Question Text</label>
                <textarea rows={3} value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} placeholder="Enter full question..." className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Correct Answer</label>
                  <input type="text" value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Difficulty</label>
                  <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Explanation</label>
                <input type="text" value={formData.explanation} onChange={e => setFormData({...formData, explanation: e.target.value})} placeholder="Why is this correct?" className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleSaveAdd} className="px-4 py-2 text-xs font-semibold bg-brandPrimary text-white rounded-xl">Save Question</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit {editingQuestion.id}</h3>
              <button onClick={() => setEditingQuestion(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Question Text</label>
                <textarea rows={3} value={editingQuestion.question} onChange={e => setEditingQuestion({...editingQuestion, question: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Correct Answer</label>
                  <input type="text" value={editingQuestion.answer} onChange={e => setEditingQuestion({...editingQuestion, answer: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Difficulty</label>
                  <select value={editingQuestion.difficulty} onChange={e => setEditingQuestion({...editingQuestion, difficulty: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingQuestion(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 text-xs font-semibold bg-brandPrimary text-white rounded-xl">Update Question</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Question {viewingQuestion.id}</h3>
              <button onClick={() => setViewingQuestion(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p><strong>Category:</strong> {viewingQuestion.category}</p>
            <p><strong>Question:</strong> {viewingQuestion.question}</p>
            <p className="text-emerald-500"><strong>Answer:</strong> {viewingQuestion.answer}</p>
            <p><strong>Explanation:</strong> {viewingQuestion.explanation}</p>
            <p><strong>Difficulty:</strong> {viewingQuestion.difficulty}</p>
            <p className="text-rose-500"><strong>Negative Marks:</strong> {viewingQuestion.negativeMarks}</p>
            <p><strong>Status:</strong> {viewingQuestion.status}</p>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingQuestion(null)} className="px-4 py-2 font-semibold bg-brandPrimary text-white rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-rose-500">Delete Question</h3>
            <p className="text-xs text-slate-400">Are you sure you want to delete question <strong>{deletingQuestion.id}</strong>?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeletingQuestion(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={() => handleDelete(deletingQuestion.id)} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankPage;
