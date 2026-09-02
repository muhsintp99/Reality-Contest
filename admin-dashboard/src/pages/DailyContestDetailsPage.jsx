import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  ArrowLeft, Clock, Trophy, Flame, Eye, Edit3, Trash2, RefreshCw, BarChart2,
  HelpCircle, CheckCircle, FileText, Video, Image as ImageIcon, Search, Filter, ShieldCheck, DollarSign
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { CustomSelect } from '../components/CustomSelect';

export const DailyContestDetailsPage = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { showAlert, showConfirm, showSnackbar } = useAlert();
  const isMockMode = useSelector((state) => state.auth?.isMockMode);

  const [contest, setContest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  const fetchContestDetails = async () => {
    setLoading(true);
    try {
      if (isMockMode) {
        setContest({
          _id: contestId,
          dailyContestId: contestId || 'DLC-1001',
          title: 'Daily Speed Quiz Arena ⚡',
          category: 'Speed Battle',
          entryFee: 0,
          prizePool: 10000,
          timerLimit: '3 mins',
          questionsCount: 10,
          difficulty: 'Medium',
          description: 'Automated 24-hour daily quiz battle with instant leaderboard resets.',
          rules: '1. Complete 10 questions in 3 minutes.\n2. +10 points per correct answer.\n3. Top rankers split 10,000 Coins daily.',
          status: 'Registration Open',
          isActive: true,
          imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500',
          participantsCount: 142
        });
        setQuestions([
          {
            _id: 'q1',
            text: 'What is the capital city of France?',
            type: 'Single Choice',
            category: 'Geography',
            difficulty: 'Easy',
            marks: 10,
            options: [
              { text: 'London', isCorrect: false },
              { text: 'Paris', isCorrect: true },
              { text: 'Berlin', isCorrect: false },
              { text: 'Madrid', isCorrect: false }
            ]
          },
          {
            _id: 'q2',
            text: 'Which planet is known as the Red Planet?',
            type: 'Single Choice',
            category: 'Science',
            difficulty: 'Medium',
            marks: 10,
            options: [
              { text: 'Earth', isCorrect: false },
              { text: 'Mars', isCorrect: true },
              { text: 'Jupiter', isCorrect: false },
              { text: 'Venus', isCorrect: false }
            ]
          }
        ]);
        setLoading(false);
        return;
      }

      let res = await axios.get(`/api/admin/daily-contests/${contestId}`, { withCredentials: true }).catch(() => null);
      if (!res || !res.data?.data) {
        res = await axios.get(`/api/daily-contests/${contestId}`, { withCredentials: true }).catch(() => null);
      }

      if (res?.data?.success && res?.data?.data) {
        const data = res.data.data;
        setContest(data);
        setQuestions(Array.isArray(data.questions) ? data.questions : []);
      } else {
        setContest(null);
      }
    } catch (err) {
      console.error(err);
      showAlert('Failed to load daily contest details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContestDetails();
  }, [contestId, isMockMode]);

  const handleReset = () => {
    showConfirm('Reset Standings', `Reset 24h standings for "${contest?.title}"?`, async () => {
      try {
        await axios.post(`/api/admin/daily-contests/${contestId}/reset`, {}, { withCredentials: true });
        showSnackbar('Standings reset successfully!', 'success');
        fetchContestDetails();
      } catch (err) {
        showAlert('Failed to reset standings.', 'error');
      }
    });
  };

  const handleDelete = () => {
    showConfirm('Delete Contest', `Permanently delete "${contest?.title}"?`, async () => {
      try {
        await axios.delete(`/api/admin/daily-contests/${contestId}`, { withCredentials: true });
        showSnackbar('Daily contest deleted.', 'info');
        navigate('/admin-dashboard/daily-contest');
      } catch (err) {
        showAlert('Failed to delete contest.', 'error');
      }
    });
  };

  const filteredQuestions = questions.filter((q) => {
    const textStr = (q.text || q.questionText || '').toLowerCase();
    const catStr = (q.category || '').toLowerCase();
    const matchesSearch = !searchTerm || textStr.includes(searchTerm.toLowerCase()) || catStr.includes(searchTerm.toLowerCase());
    const matchesDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
        <p className="font-bold text-sm">Loading Daily Contest Specifications...</p>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-4">
        <Clock className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Daily Contest Not Found</h2>
        <button
          onClick={() => navigate('/admin-dashboard/daily-contest')}
          className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
        >
          Return to Daily Contests Desk
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-left animate-fade-in">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/admin-dashboard/daily-contest')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-500 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Daily Contests Desk
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{contest.title}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${
              contest.isActive !== false && contest.status !== 'Draft'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}>
              {contest.isActive !== false ? '🟢 Active' : '🔴 Paused'}
            </span>
          </div>
          <p className="text-xs text-slate-500">ID: {contest.dailyContestId || contest._id} • Category: {contest.category}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate(`/admin-dashboard/daily-contests/${contest._id || contestId}/analytics`)}
            className="px-3 py-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <BarChart2 className="w-4 h-4" /> Analytics
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Reset 24h Standings
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Entry Fee</span>
          <div className="text-lg font-extrabold text-emerald-500 mt-0.5">
            {contest.entryFee === 0 || contest.isFree ? 'FREE ENTRY' : `${contest.entryFee} Coins 🪙`}
          </div>
        </div>
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Daily Prize Pool</span>
          <div className="text-lg font-extrabold text-amber-500 mt-0.5">
            {Number(contest.prizePool || 10000).toLocaleString()} Coins 🪙
          </div>
        </div>
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Questions Count</span>
          <div className="text-lg font-extrabold text-indigo-500 mt-0.5">
            {questions.length || contest.questionsCount || 20} Questions
          </div>
        </div>
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Timer Limit</span>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
            {contest.timerLimit || '3 mins'}
          </div>
        </div>
      </div>

      {/* Overview, Rules & Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-2">
          <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Description</h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {contest.description || 'Automated 24-hour daily quiz showdown arena.'}
          </p>
          {contest.durationDays && (
            <div className="pt-2">
              <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] rounded-lg border border-indigo-500/20">
                ⏳ Duration: {contest.durationDays} Days
              </span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-2">
          <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Contest Rules 📜</h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {contest.rules || 'No specific rules configured.'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-2">
          <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Guidelines & Instructions 📋</h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {contest.guidelines || 'No additional guidelines configured.'}
          </p>
        </div>
      </div>

      {/* Uploaded Media & Attachments Gallery */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-500" /> Contest Cover Media & Uploaded Attachments
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Banner Image preview */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Banner / Cover Image</span>
            {contest.imageUrl || contest.bannerUrl ? (
              <img
                src={contest.imageUrl || contest.bannerUrl}
                alt="Contest Banner"
                className="w-full h-40 object-cover rounded-xl border border-slate-200 dark:border-white/10 shadow-sm"
              />
            ) : (
              <div className="w-full h-40 bg-slate-100 dark:bg-white/5 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300 dark:border-white/10">
                <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
                No Banner Image Uploaded
              </div>
            )}
          </div>

          {/* Video preview */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Promo Video / Teaser</span>
            {contest.videoUrl ? (
              <video
                src={contest.videoUrl}
                controls
                className="w-full h-40 object-cover rounded-xl border border-slate-200 dark:border-white/10 shadow-sm"
              />
            ) : (
              <div className="w-full h-40 bg-slate-100 dark:bg-white/5 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300 dark:border-white/10">
                <Video className="w-6 h-6 mb-1 opacity-40" />
                No Video Attachment
              </div>
            )}
          </div>

          {/* File PDF Attachment preview */}
          <div className="space-y-1.5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Rules & Guidelines Document</span>
            {contest.fileAttachmentUrl ? (
              <div className="w-full h-40 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-4 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-indigo-500">
                  <FileText className="w-8 h-8 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-xs truncate block text-slate-800 dark:text-white">Contest Rules Guide.pdf</span>
                    <span className="text-[10px] text-slate-400 block">PDF Attachment Document</span>
                  </div>
                </div>
                <a
                  href={contest.fileAttachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-brandPrimary text-white rounded-xl text-xs font-bold text-center hover:bg-brandPrimary/90 transition-all shadow-sm"
                >
                  Download / View PDF Document 📄
                </a>
              </div>
            ) : (
              <div className="w-full h-40 bg-slate-100 dark:bg-white/5 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300 dark:border-white/10">
                <FileText className="w-6 h-6 mb-1 opacity-40" />
                No PDF Attachment Uploaded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question Details Specs Section */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              Contest Questions Details Table ({filteredQuestions.length})
            </h3>
            <p className="text-xs text-slate-400">Detailed overview of all questions assigned to this daily contest.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search question text or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
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
              className="w-40"
            />
          </div>
        </div>

        {/* Datatable */}
        {filteredQuestions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-white/5">
            No questions match your current search or difficulty filter.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-white/10">
                  <th className="p-3">#</th>
                  <th className="p-3">Question Details</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Difficulty</th>
                  <th className="p-3">Marks</th>
                  <th className="p-3">Options & Correct Answer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                {filteredQuestions.map((q, idx) => (
                  <tr key={q._id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 dark:text-white block max-w-md leading-snug">
                        {q.text || q.questionText || 'Question Text'}
                      </span>
                      {q.imageUrl && (
                        <img src={q.imageUrl} alt="Question Attachment" className="w-20 h-14 object-cover rounded-lg border mt-1" />
                      )}
                      {q.type && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-500/10 text-indigo-500 font-bold text-[9px] rounded">
                          {q.type}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                      {q.category || contest.category || 'General'}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-500 font-extrabold text-[10px] rounded-full">
                        {q.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-emerald-500">
                      +{q.marks || 10} pts
                    </td>
                    <td className="p-3">
                      {Array.isArray(q.options) && q.options.length > 0 ? (
                        <div className="space-y-1">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`text-[11px] px-2 py-1 rounded-lg ${
                                opt.isCorrect
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/30'
                                  : 'text-slate-500 bg-slate-50 dark:bg-white/5'
                              }`}
                            >
                              {opt.text} {opt.isCorrect ? '✓ (Correct)' : ''}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No options loaded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyContestDetailsPage;
