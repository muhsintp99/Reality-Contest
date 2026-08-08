import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  ClipboardList, Plus, Target, Calendar, Gift, BarChart2,
  Users, CheckCircle2, Clock, Search, Filter, Edit, Trash2, Eye,
  ToggleLeft, ToggleRight, X, ListPlus, ChevronRight, Copy, MessageSquare,
  Download, Sparkles, RefreshCw, FileText, Check, HelpCircle
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';
import { RightDrawer } from '../components/RightDrawer';

const TARGET_USER_OPTIONS = [
  { label: 'All Registered Users', value: 'All Registered Users' },
  { label: 'Active Contestants', value: 'Active Contestants' },
  { label: 'KYC Verified Users', value: 'KYC Verified Users' },
  { label: 'New Users (Last 30 Days)', value: 'New Users (Last 30 Days)' },
  { label: 'Top Leaderboard Rankers', value: 'Top Leaderboard Rankers' }
];

const REWARD_TYPE_OPTIONS = [
  { label: '50 Bonus Coins', value: '50 Bonus Coins' },
  { label: '100 Bonus Coins', value: '100 Bonus Coins' },
  { label: 'Free Contest Entry Ticket', value: 'Free Contest Entry Ticket' },
  { label: '₹25 Wallet Cashback', value: '₹25 Wallet Cashback' },
  { label: '₹50 Wallet Cashback', value: '₹50 Wallet Cashback' }
];

const MOCK_DEFAULT_SURVEYS = [
  {
    id: 'SRV-1001',
    _id: 'SRV-1001',
    title: 'Platform Experience & Stage 1 Quiz Feedback',
    description: 'Collecting contestant feedback regarding quiz difficulty, time limit, and UI smooth operation.',
    targetGroup: 'Active Contestants',
    reward: '50 Bonus Coins',
    startDate: '2026-08-01',
    endDate: '2026-08-15',
    schedule: '01 Aug 2026 - 15 Aug 2026',
    status: 'Active',
    responses: 1420,
    questions: [
      {
        questionId: 'q-1',
        title: 'How would you rate the overall smoothness of the quiz interface?',
        type: 'Single Choice',
        options: [
          { optionId: 'opt-1', text: 'Super Smooth & Fast', count: 980 },
          { optionId: 'opt-2', text: 'Good but slight lag', count: 340 },
          { optionId: 'opt-3', text: 'Needs Improvement', count: 100 }
        ]
      },
      {
        questionId: 'q-2',
        title: 'Was the time limit per question appropriate for Stage 1?',
        type: 'Single Choice',
        options: [
          { optionId: 'opt-4', text: 'Perfect timing', count: 1100 },
          { optionId: 'opt-5', text: 'Too short', count: 220 },
          { optionId: 'opt-6', text: 'Too long', count: 100 }
        ]
      }
    ],
    sampleFeedbacks: [
      { id: 'fb-1', userName: 'Rahul Sharma', email: 'rahul.s@rcp.com', date: '2026-08-01 10:30 AM', answer: 'Super Smooth & Fast', comment: 'Loved the instant countdown timer design!' },
      { id: 'fb-2', userName: 'Ananya Verma', email: 'ananya.v@rcp.com', date: '2026-08-01 11:15 AM', answer: 'Good but slight lag', comment: 'Mobile response was fast, but sound effect played twice.' },
      { id: 'fb-3', userName: 'Vikram Das', email: 'vikram.d@rcp.com', date: '2026-08-01 11:45 AM', answer: 'Super Smooth & Fast', comment: 'Very clean dark mode theme!' }
    ]
  },
  {
    id: 'SRV-1002',
    _id: 'SRV-1002',
    title: 'Grand Contest Season 2 Feature Wishlist',
    description: 'Surveying user preferences for reward structures, prize distributions, and category options in Grand Contest S2.',
    targetGroup: 'All Registered Users',
    reward: 'Free Contest Entry Ticket',
    startDate: '2026-08-05',
    endDate: '2026-08-25',
    schedule: '05 Aug 2026 - 25 Aug 2026',
    status: 'Active',
    responses: 890,
    questions: [
      {
        questionId: 'q-1',
        title: 'Which category would you like more grand prizes for?',
        type: 'Single Choice',
        options: [
          { optionId: 'opt-1', text: 'General Knowledge & Current Affairs', count: 520 },
          { optionId: 'opt-2', text: 'Science & Technology', count: 260 },
          { optionId: 'opt-3', text: 'Sports & Entertainment', count: 110 }
        ]
      }
    ],
    sampleFeedbacks: [
      { id: 'fb-4', userName: 'Priya Patel', email: 'priya.p@rcp.com', date: '2026-08-01 09:10 AM', answer: 'General Knowledge', comment: 'Add more regional Kerala current affairs.' }
    ]
  }
];

export const SurveyManagement = () => {
  const { showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  // Main View Tab: 'surveys' | 'analytics'
  const [activeTab, setActiveTab] = useState('surveys');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Drawers State
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [viewingSurvey, setViewingSurvey] = useState(null);
  const [viewingFeedbackSurvey, setViewingFeedbackSurvey] = useState(null);
  const [feedbackSearch, setFeedbackSearch] = useState('');

  // Surveys List
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    fetchSurveys();
  }, [isMockMode]);

  const fetchSurveys = async () => {
    if (isMockMode) {
      setSurveys(MOCK_DEFAULT_SURVEYS);
      return;
    }
    try {
      const res = await axios.get('/api/admin/surveys', { withCredentials: true });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setSurveys(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching surveys from backend API:', err);
    }
  };

  // Form State for Create Survey
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetGroup: 'All Registered Users',
    reward: '50 Bonus Coins',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    status: 'Active',
    questions: [
      {
        questionId: 'q-1',
        title: 'How was your overall contest experience?',
        type: 'Single Choice',
        options: [
          { optionId: 'opt-1', text: 'Excellent' },
          { optionId: 'opt-2', text: 'Good' },
          { optionId: 'opt-3', text: 'Needs Improvement' }
        ]
      }
    ]
  });

  const resetCreateForm = () => {
    setFormData({
      title: '',
      description: '',
      targetGroup: 'All Registered Users',
      reward: '50 Bonus Coins',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      status: 'Active',
      questions: [
        {
          questionId: `q-${Date.now()}-1`,
          title: '',
          type: 'Single Choice',
          options: [
            { optionId: `opt-1`, text: 'Option 1' },
            { optionId: `opt-2`, text: 'Option 2' }
          ]
        }
      ]
    });
  };

  // --- QUESTION BUILDER HELPERS FOR CREATE DRAWER ---
  const handleAddQuestionCreate = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionId: `q-${Date.now()}`,
          title: '',
          type: 'Single Choice',
          options: [
            { optionId: `opt-${Date.now()}-1`, text: 'Option 1' },
            { optionId: `opt-${Date.now()}-2`, text: 'Option 2' }
          ]
        }
      ]
    }));
  };

  const handleRemoveQuestionCreate = (qIndex) => {
    if (formData.questions.length <= 1) {
      showSnackbar('Survey must contain at least one question.', 'warning');
      return;
    }
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== qIndex)
    }));
  };

  const handleUpdateQuestionCreate = (qIndex, field, value) => {
    setFormData(prev => {
      const updatedQs = [...prev.questions];
      updatedQs[qIndex] = { ...updatedQs[qIndex], [field]: value };
      return { ...prev, questions: updatedQs };
    });
  };

  const handleAddOptionCreate = (qIndex) => {
    setFormData(prev => {
      const updatedQs = [...prev.questions];
      const targetQ = updatedQs[qIndex];
      const nextOptNum = (targetQ.options?.length || 0) + 1;
      targetQ.options = [
        ...(targetQ.options || []),
        { optionId: `opt-${Date.now()}-${nextOptNum}`, text: `Option ${nextOptNum}` }
      ];
      return { ...prev, questions: updatedQs };
    });
  };

  const handleRemoveOptionCreate = (qIndex, optIndex) => {
    setFormData(prev => {
      const updatedQs = [...prev.questions];
      const targetQ = updatedQs[qIndex];
      if ((targetQ.options?.length || 0) <= 2) {
        showSnackbar('At least 2 options are required per question.', 'warning');
        return prev;
      }
      targetQ.options = targetQ.options.filter((_, idx) => idx !== optIndex);
      return { ...prev, questions: updatedQs };
    });
  };

  const handleUpdateOptionCreate = (qIndex, optIndex, value) => {
    setFormData(prev => {
      const updatedQs = [...prev.questions];
      const targetQ = updatedQs[qIndex];
      targetQ.options[optIndex].text = value;
      return { ...prev, questions: updatedQs };
    });
  };

  // --- QUESTION BUILDER HELPERS FOR EDIT DRAWER ---
  const handleAddQuestionEdit = () => {
    setEditingSurvey(prev => ({
      ...prev,
      questions: [
        ...(prev.questions || []),
        {
          questionId: `q-${Date.now()}`,
          title: '',
          type: 'Single Choice',
          options: [
            { optionId: `opt-${Date.now()}-1`, text: 'Option 1' },
            { optionId: `opt-${Date.now()}-2`, text: 'Option 2' }
          ]
        }
      ]
    }));
  };

  const handleRemoveQuestionEdit = (qIndex) => {
    if ((editingSurvey.questions || []).length <= 1) {
      showSnackbar('Survey must contain at least one question.', 'warning');
      return;
    }
    setEditingSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== qIndex)
    }));
  };

  const handleUpdateQuestionEdit = (qIndex, field, value) => {
    setEditingSurvey(prev => {
      const updatedQs = [...prev.questions];
      updatedQs[qIndex] = { ...updatedQs[qIndex], [field]: value };
      return { ...prev, questions: updatedQs };
    });
  };

  const handleAddOptionEdit = (qIndex) => {
    setEditingSurvey(prev => {
      const updatedQs = [...prev.questions];
      const targetQ = updatedQs[qIndex];
      const nextOptNum = (targetQ.options?.length || 0) + 1;
      targetQ.options = [
        ...(targetQ.options || []),
        { optionId: `opt-${Date.now()}-${nextOptNum}`, text: `Option ${nextOptNum}` }
      ];
      return { ...prev, questions: updatedQs };
    });
  };

  const handleRemoveOptionEdit = (qIndex, optIndex) => {
    setEditingSurvey(prev => {
      const updatedQs = [...prev.questions];
      const targetQ = updatedQs[qIndex];
      if ((targetQ.options?.length || 0) <= 2) {
        showSnackbar('At least 2 options are required per question.', 'warning');
        return prev;
      }
      targetQ.options = targetQ.options.filter((_, idx) => idx !== optIndex);
      return { ...prev, questions: updatedQs };
    });
  };

  const handleUpdateOptionEdit = (qIndex, optIndex, value) => {
    setEditingSurvey(prev => {
      const updatedQs = [...prev.questions];
      const targetQ = updatedQs[qIndex];
      targetQ.options[optIndex].text = value;
      return { ...prev, questions: updatedQs };
    });
  };

  // --- SAVE CREATE SURVEY ---
  const handleSaveAdd = async () => {
    if (!formData.title.trim()) {
      showSnackbar('Please enter a survey title.', 'warning');
      return;
    }
    if (formData.questions.some(q => !q.title.trim())) {
      showSnackbar('All survey question titles are required.', 'warning');
      return;
    }

    const payload = {
      id: `SRV-${Date.now().toString().slice(-4)}`,
      _id: `SRV-${Date.now().toString().slice(-4)}`,
      schedule: `${formData.startDate} to ${formData.endDate}`,
      responses: 0,
      sampleFeedbacks: [],
      ...formData
    };

    if (!isMockMode) {
      try {
        const res = await axios.post('/api/admin/surveys', payload, { withCredentials: true });
        if (res.data && res.data.data) {
          payload._id = res.data.data._id || res.data.data.id || payload.id;
        }
      } catch (err) {
        console.error('Error saving survey via API:', err);
      }
    }

    setSurveys(prev => [payload, ...prev]);
    showSnackbar('New Survey created and published!', 'success');
    setShowAddDrawer(false);
    resetCreateForm();
  };

  // --- SAVE EDIT SURVEY ---
  const handleSaveEdit = async () => {
    if (!editingSurvey.title.trim()) {
      showSnackbar('Survey title cannot be empty.', 'warning');
      return;
    }
    if (editingSurvey.questions.some(q => !q.title.trim())) {
      showSnackbar('All survey question titles are required.', 'warning');
      return;
    }

    const updatedObj = {
      ...editingSurvey,
      schedule: editingSurvey.schedule || `${editingSurvey.startDate} to ${editingSurvey.endDate}`
    };

    if (!isMockMode) {
      try {
        await axios.put(`/api/admin/surveys/${editingSurvey._id || editingSurvey.id}`, updatedObj, { withCredentials: true });
      } catch (err) {
        console.error('Error updating survey via API:', err);
      }
    }

    setSurveys(prev => prev.map(s => (s.id === editingSurvey.id || s._id === editingSurvey._id) ? updatedObj : s));
    if (viewingSurvey && (viewingSurvey.id === editingSurvey.id || viewingSurvey._id === editingSurvey._id)) {
      setViewingSurvey(updatedObj);
    }
    showSnackbar(`Survey "${editingSurvey.title}" updated successfully!`, 'success');
    setEditingSurvey(null);
  };

  // --- DUPLICATE SURVEY ---
  const handleDuplicateSurvey = (srv) => {
    const cloned = {
      ...JSON.parse(JSON.stringify(srv)),
      id: `SRV-${Date.now().toString().slice(-4)}`,
      _id: `SRV-${Date.now().toString().slice(-4)}`,
      title: `${srv.title} (Copy)`,
      responses: 0,
      sampleFeedbacks: []
    };
    setEditingSurvey(cloned);
    showSnackbar(`Cloned survey created as draft. Edit details and save!`, 'info');
  };

  // --- TOGGLE SURVEY STATUS ---
  const handleToggleStatus = async (id) => {
    const target = surveys.find(s => s.id === id || s._id === id);
    if (!target) return;
    const nextStatus = target.status === 'Active' ? 'Inactive' : 'Active';

    if (!isMockMode) {
      try {
        await axios.patch(`/api/admin/surveys/${target._id || id}/status`, {}, { withCredentials: true });
      } catch (err) {
        console.error('Error toggling status via API:', err);
      }
    }

    setSurveys(prev => prev.map(s => (s.id === id || s._id === id) ? { ...s, status: nextStatus } : s));
    if (viewingSurvey && (viewingSurvey.id === id || viewingSurvey._id === id)) {
      setViewingSurvey(prev => ({ ...prev, status: nextStatus }));
    }
    showSnackbar(`Survey status changed to ${nextStatus}`, 'info');
  };

  // --- DELETE SURVEY ---
  const handleDeleteSurvey = (s) => {
    showConfirm('Delete Survey', `Are you sure you want to permanently delete survey "${s.title}"?`, async () => {
      if (!isMockMode) {
        try {
          await axios.delete(`/api/admin/surveys/${s._id || s.id}`, { withCredentials: true });
        } catch (err) {
          console.error('Error deleting survey via API:', err);
        }
      }
      setSurveys(prev => prev.filter(item => (item.id !== s.id && item._id !== s._id)));
      if (viewingSurvey && (viewingSurvey.id === s.id || viewingSurvey._id === s._id)) {
        setViewingSurvey(null);
      }
      if (editingSurvey && (editingSurvey.id === s.id || editingSurvey._id === s._id)) {
        setEditingSurvey(null);
      }
      if (viewingFeedbackSurvey && (viewingFeedbackSurvey.id === s.id || viewingFeedbackSurvey._id === s._id)) {
        setViewingFeedbackSurvey(null);
      }
      showSnackbar(`Survey "${s.title}" deleted.`, 'success');
    });
  };

  // --- FILTERED SURVEYS ---
  const filteredSurveys = useMemo(() => {
    return surveys.filter(s => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || s.title.toLowerCase().includes(q) || (s.id && s.id.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [surveys, searchTerm, statusFilter]);

  // --- ANALYTICS SUMMARY ---
  const analyticsSummary = useMemo(() => {
    const total = surveys.length;
    const active = surveys.filter(s => s.status === 'Active').length;
    const totalResponses = surveys.reduce((acc, s) => acc + (s.responses || 0), 0);
    return { total, active, totalResponses };
  }, [surveys]);

  // Filtered feedbacks in Feedback Drawer
  const filteredFeedbacks = useMemo(() => {
    if (!viewingFeedbackSurvey || !viewingFeedbackSurvey.sampleFeedbacks) return [];
    const q = feedbackSearch.toLowerCase().trim();
    if (!q) return viewingFeedbackSurvey.sampleFeedbacks;
    return viewingFeedbackSurvey.sampleFeedbacks.filter(f =>
      f.userName.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      (f.comment && f.comment.toLowerCase().includes(q))
    );
  }, [viewingFeedbackSurvey, feedbackSearch]);

  return (
    <div className="space-y-6 text-left animate-fade-in relative p-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-indigo-500" />
            Survey & Feedback Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            Build custom contestant surveys, configure target audiences, schedule timelines, and analyze real-time feedback.
          </p>
        </div>

        <button
          onClick={() => { resetCreateForm(); setShowAddDrawer(true); }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Survey</span>
        </button>
      </div>

      {/* Main View Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/10 text-xs font-bold space-x-6">
        <button
          onClick={() => setActiveTab('surveys')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'surveys'
              ? 'border-indigo-500 text-indigo-500'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Surveys Directory ({surveys.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-purple-500 text-purple-500'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Survey Analytics & Metrics</span>
        </button>
      </div>

      {/* TAB 1: SURVEYS DIRECTORY */}
      {activeTab === 'surveys' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search survey title or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="w-full sm:w-auto">
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: 'All Statuses', value: 'All' },
                  { label: 'Active', value: 'Active' },
                  { label: 'Inactive', value: 'Inactive' }
                ]}
                className="w-44"
              />
            </div>
          </div>

          {/* Survey Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSurveys.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 text-xs">
                No surveys match your current search and status filters.
              </div>
            ) : (
              filteredSurveys.map((srv) => (
                <div key={srv.id || srv._id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4 hover:border-indigo-500/30 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold font-mono uppercase text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded inline-block mb-1">
                        {srv.id || srv._id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{srv.title}</h3>
                      {srv.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{srv.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleStatus(srv.id || srv._id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                        srv.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}
                    >
                      {srv.status === 'Active' ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                      <span>{srv.status}</span>
                    </button>
                  </div>

                  {/* Specs Summary Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-white/5 p-3 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">Target Audience</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-xs font-bold block truncate">{srv.targetGroup}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">Responses</span>
                      <strong className="text-indigo-500 text-xs font-bold block">{(srv.responses || 0).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">Completion Reward</span>
                      <strong className="text-emerald-500 text-xs font-bold block truncate">{srv.reward}</strong>
                    </div>
                  </div>

                  {/* Actions & Schedule Bar */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-white/5">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{srv.schedule || `${srv.startDate} - ${srv.endDate}`}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingSurvey(srv)}
                        title="View Specs & Analytics Drawer"
                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewingFeedbackSurvey(srv)}
                        title="View User Feedback Logs"
                        className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingSurvey(JSON.parse(JSON.stringify(srv)))}
                        title="Edit Survey Drawer"
                        className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateSurvey(srv)}
                        title="Duplicate Survey"
                        className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSurvey(srv)}
                        title="Delete Survey"
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SURVEY ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Total Created Surveys</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{analyticsSummary.total}</h3>
              <p className="text-[11px] text-indigo-500 font-semibold">Active & Archived</p>
            </div>

            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Active Campaigns</span>
              <h3 className="text-2xl font-bold text-emerald-500 font-mono">{analyticsSummary.active}</h3>
              <p className="text-[11px] text-slate-400">Collecting Feedback Live</p>
            </div>

            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Total User Responses</span>
              <h3 className="text-2xl font-bold text-purple-500 font-mono">{analyticsSummary.totalResponses.toLocaleString()}</h3>
              <p className="text-[11px] text-slate-400">Submitted by Contestants</p>
            </div>
          </div>

          {/* Question Responses Breakdown per Survey */}
          <div className="space-y-4">
            {surveys.map(srv => (
              <div key={srv.id || srv._id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{srv.title}</h3>
                    <p className="text-xs text-slate-400">Target: {srv.targetGroup} | Responses: {srv.responses}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingSurvey(srv)}
                      className="px-3 py-1 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details Drawer
                    </button>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 font-bold rounded-lg text-xs">
                      {srv.reward}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {(srv.questions || []).map((q, idx) => {
                    const totalVotes = (q.options || []).reduce((sum, o) => sum + (o.count || 0), 0) || 1;
                    return (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl space-y-3">
                        <strong className="text-xs font-bold text-slate-800 dark:text-white block">
                          Q{idx + 1}. {q.title}
                        </strong>

                        <div className="space-y-2">
                          {(q.options || []).map((opt, optIdx) => {
                            const pct = Math.round(((opt.count || 0) / totalVotes) * 100);
                            return (
                              <div key={optIdx} className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  <span>{opt.text}</span>
                                  <span className="text-indigo-500 font-mono font-bold">{opt.count || 0} ({pct}%)</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. CREATE SURVEY DRAWER */}
      <RightDrawer
        isOpen={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        title="Create New User Survey"
      >
        <div className="space-y-4 text-xs text-left">
          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Survey Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Stage 1 Quiz Feedback Survey"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Description / Goal</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain why contestants should complete this survey..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Target Users</label>
              <CustomSelect
                value={formData.targetGroup}
                onChange={val => setFormData({ ...formData, targetGroup: val })}
                options={TARGET_USER_OPTIONS}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Completion Reward</label>
              <CustomSelect
                value={formData.reward}
                onChange={val => setFormData({ ...formData, reward: val })}
                options={REWARD_TYPE_OPTIONS}
                className="w-full"
              />
            </div>
          </div>

          {/* Schedule Timeline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Questions & Options Builder */}
          <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">
                Survey Questions & Answer Options Builder
              </span>
              <button
                type="button"
                onClick={handleAddQuestionCreate}
                className="px-2.5 py-1 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Question
              </button>
            </div>

            {formData.questions.map((q, qIndex) => (
              <div key={q.questionId || qIndex} className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-3">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Question {qIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestionCreate(qIndex)}
                    className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                    title="Remove Question"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Enter survey question title..."
                  value={q.title}
                  onChange={e => handleUpdateQuestionCreate(qIndex, 'title', e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Answer Options</span>
                    <button
                      type="button"
                      onClick={() => handleAddOptionCreate(qIndex)}
                      className="text-[9px] font-bold text-emerald-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" /> Add Option
                    </button>
                  </div>

                  {(q.options || []).map((opt, optIndex) => (
                    <div key={opt.optionId || optIndex} className="flex items-center gap-2">
                      <span className="w-4 text-[10px] text-slate-400 font-bold text-right">{optIndex + 1}.</span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={e => handleUpdateOptionCreate(qIndex, optIndex, e.target.value)}
                        className="flex-1 p-1.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOptionCreate(qIndex, optIndex)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveAdd}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md mt-4 cursor-pointer"
          >
            Publish Survey
          </button>
        </div>
      </RightDrawer>

      {/* 2. EDIT SURVEY DRAWER (WITH COMPLETE QUESTIONS & OPTIONS BUILDER) */}
      <RightDrawer
        isOpen={Boolean(editingSurvey)}
        onClose={() => setEditingSurvey(null)}
        title={editingSurvey ? `Edit Survey: ${editingSurvey.id || editingSurvey._id}` : 'Edit Survey'}
      >
        {editingSurvey && (
          <div className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Survey Title *</label>
              <input
                type="text"
                value={editingSurvey.title || ''}
                onChange={e => setEditingSurvey({ ...editingSurvey, title: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Description / Goal</label>
              <textarea
                rows={2}
                value={editingSurvey.description || ''}
                onChange={e => setEditingSurvey({ ...editingSurvey, description: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Target Users</label>
                <CustomSelect
                  value={editingSurvey.targetGroup || 'All Registered Users'}
                  onChange={val => setEditingSurvey({ ...editingSurvey, targetGroup: val })}
                  options={TARGET_USER_OPTIONS}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Reward</label>
                <CustomSelect
                  value={editingSurvey.reward || '50 Bonus Coins'}
                  onChange={val => setEditingSurvey({ ...editingSurvey, reward: val })}
                  options={REWARD_TYPE_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            {/* Schedule Timeline */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Start Date</label>
                <input
                  type="date"
                  value={editingSurvey.startDate || '2026-08-01'}
                  onChange={e => setEditingSurvey({ ...editingSurvey, startDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">End Date</label>
                <input
                  type="date"
                  value={editingSurvey.endDate || '2026-08-31'}
                  onChange={e => setEditingSurvey({ ...editingSurvey, endDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Full Questions & Options Builder in Edit Drawer */}
            <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">
                  Survey Questions & Options
                </span>
                <button
                  type="button"
                  onClick={handleAddQuestionEdit}
                  className="px-2.5 py-1 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Question
                </button>
              </div>

              {(editingSurvey.questions || []).map((q, qIndex) => (
                <div key={q.questionId || qIndex} className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Question {qIndex + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestionEdit(qIndex)}
                      className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                      title="Remove Question"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Enter survey question title..."
                    value={q.title}
                    onChange={e => handleUpdateQuestionEdit(qIndex, 'title', e.target.value)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                  />

                  {/* Options List */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Answer Options</span>
                      <button
                        type="button"
                        onClick={() => handleAddOptionEdit(qIndex)}
                        className="text-[9px] font-bold text-emerald-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" /> Add Option
                      </button>
                    </div>

                    {(q.options || []).map((opt, optIndex) => (
                      <div key={opt.optionId || optIndex} className="flex items-center gap-2">
                        <span className="w-4 text-[10px] text-slate-400 font-bold text-right">{optIndex + 1}.</span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={e => handleUpdateOptionEdit(qIndex, optIndex, e.target.value)}
                          className="flex-1 p-1.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionEdit(qIndex, optIndex)}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveEdit}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md mt-4 cursor-pointer"
            >
              Save & Apply Changes
            </button>
          </div>
        )}
      </RightDrawer>

      {/* 3. VIEW SURVEY SPECS & ANALYTICS DRAWER */}
      <RightDrawer
        isOpen={Boolean(viewingSurvey)}
        onClose={() => setViewingSurvey(null)}
        title={viewingSurvey ? `Survey Specs & Analytics: ${viewingSurvey.id || viewingSurvey._id}` : 'Survey Specs'}
      >
        {viewingSurvey && (
          <div className="space-y-5 text-xs text-left">
            {/* Header info card */}
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold font-mono text-indigo-500 uppercase bg-indigo-500/10 px-2 py-0.5 rounded">
                  {viewingSurvey.id || viewingSurvey._id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  viewingSurvey.status === 'Active'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                  {viewingSurvey.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewingSurvey.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{viewingSurvey.description || 'No detailed description provided.'}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Target Audience</span>
                <strong className="text-slate-800 dark:text-white font-bold text-xs">{viewingSurvey.targetGroup}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Total Responses</span>
                <strong className="text-indigo-500 font-bold text-xs font-mono">{(viewingSurvey.responses || 0).toLocaleString()} Users</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Completion Reward</span>
                <strong className="text-emerald-500 font-bold text-xs">{viewingSurvey.reward}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Schedule Window</span>
                <strong className="text-slate-800 dark:text-white font-bold text-xs">{viewingSurvey.schedule || `${viewingSurvey.startDate} - ${viewingSurvey.endDate}`}</strong>
              </div>
            </div>

            {/* Questions Breakdown */}
            <div className="space-y-3 border-t border-slate-100 dark:border-white/5 pt-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Questions Breakdown ({(viewingSurvey.questions || []).length})</span>
                <span className="text-[10px] text-indigo-400 font-normal">Real-time Vote Percentages</span>
              </h4>

              {(viewingSurvey.questions || []).map((q, idx) => {
                const totalVotes = (q.options || []).reduce((sum, o) => sum + (o.count || 0), 0) || 1;
                return (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl space-y-2">
                    <strong className="text-xs font-bold text-slate-800 dark:text-white block">
                      Q{idx + 1}. {q.title}
                    </strong>

                    <div className="space-y-2 pt-1">
                      {(q.options || []).map((opt, optIdx) => {
                        const pct = Math.round(((opt.count || 0) / totalVotes) * 100);
                        return (
                          <div key={optIdx} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              <span>{opt.text}</span>
                              <span className="text-indigo-500 font-mono font-bold">{opt.count || 0} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions Footer inside Drawer */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Actions</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const target = viewingSurvey;
                    setViewingSurvey(null);
                    setEditingSurvey(JSON.parse(JSON.stringify(target)));
                  }}
                  className="py-2 px-3 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Survey
                </button>

                <button
                  onClick={() => {
                    setViewingFeedbackSurvey(viewingSurvey);
                  }}
                  className="py-2 px-3 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> User Feedback
                </button>

                <button
                  onClick={() => handleDuplicateSurvey(viewingSurvey)}
                  className="py-2 px-3 bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </button>

                <button
                  onClick={() => handleToggleStatus(viewingSurvey.id || viewingSurvey._id)}
                  className="py-2 px-3 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Toggle Status
                </button>
              </div>

              <button
                onClick={() => handleDeleteSurvey(viewingSurvey)}
                className="w-full py-2 px-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold rounded-xl flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Survey Permanently
              </button>
            </div>
          </div>
        )}
      </RightDrawer>

      {/* 4. USER FEEDBACK LOGS & RESPONSES DRAWER */}
      <RightDrawer
        isOpen={Boolean(viewingFeedbackSurvey)}
        onClose={() => setViewingFeedbackSurvey(null)}
        title={viewingFeedbackSurvey ? `User Responses: ${viewingFeedbackSurvey.title}` : 'User Feedback Logs'}
      >
        {viewingFeedbackSurvey && (
          <div className="space-y-4 text-xs text-left">
            {/* Header info */}
            <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200/60 dark:border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Submitted Responses</span>
                <strong className="text-sm font-bold text-indigo-500 font-mono">
                  {(viewingFeedbackSurvey.responses || 0).toLocaleString()} Contestants
                </strong>
              </div>
              <button
                onClick={() => showSnackbar(`Exporting survey responses for "${viewingFeedbackSurvey.title}" as CSV...`, 'info')}
                className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>

            {/* Search Feedback Logs */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter responses by contestant name or comment..."
                value={feedbackSearch}
                onChange={e => setFeedbackSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white"
              />
            </div>

            {/* Submissions List */}
            <div className="space-y-3">
              {filteredFeedbacks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 bg-slate-50 dark:bg-white/5 rounded-xl">
                  No individual feedback submissions found matching your search.
                </div>
              ) : (
                filteredFeedbacks.map(fb => (
                  <div key={fb.id} className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-500 font-bold flex items-center justify-center text-xs">
                          {fb.userName ? fb.userName[0] : 'U'}
                        </div>
                        <div>
                          <strong className="text-slate-900 dark:text-white font-bold block">{fb.userName}</strong>
                          <span className="text-[10px] text-slate-400">{fb.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{fb.date}</span>
                    </div>

                    <div className="pt-1 text-[11px] space-y-1">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <strong className="font-semibold">Selected Answer:</strong> {fb.answer}
                      </div>
                      {fb.comment && (
                        <p className="text-slate-500 dark:text-slate-400 italic bg-white dark:bg-black/30 p-2 rounded-lg border border-slate-200/50 dark:border-white/5">
                          "{fb.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default SurveyManagement;
