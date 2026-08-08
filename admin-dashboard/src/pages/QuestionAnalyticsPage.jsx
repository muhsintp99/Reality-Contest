import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Layers, ArrowLeft, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import axios from 'axios';

export const QuestionAnalyticsPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);

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
        if (catList.length > 0) {
          const names = catList.map(c => typeof c === 'string' ? c : c.name).filter(Boolean);
          if (names.length > 0) {
            setCategories(Array.from(new Set(names)));
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

  const analytics = useMemo(() => {
    const total = questions.length;
    const approved = questions.filter(q => q.approvalStatus === 'Approved').length;
    const easy = questions.filter(q => q.difficulty === 'Easy').length;
    const medium = questions.filter(q => q.difficulty === 'Medium').length;
    const hard = questions.filter(q => q.difficulty === 'Hard').length;
    const pending = total - approved;

    return { total, approved, pending, easy, medium, hard };
  }, [questions]);

  const categoryStats = useMemo(() => {
    const stats = {};
    categories.forEach(c => {
      stats[c] = { total: 0, easy: 0, medium: 0, hard: 0 };
    });
    questions.forEach(q => {
      const cat = q.category || 'General Knowledge';
      if (!stats[cat]) {
        stats[cat] = { total: 0, easy: 0, medium: 0, hard: 0 };
      }
      stats[cat].total += 1;
      const diff = (q.difficulty || 'Medium').toLowerCase();
      if (diff === 'easy') stats[cat].easy += 1;
      else if (diff === 'hard') stats[cat].hard += 1;
      else stats[cat].medium += 1;
    });
    return stats;
  }, [questions, categories]);

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
              <BarChart2 className="w-6 h-6 text-purple-500" />
              Question Repository Analytics & KPIs
            </h2>
            <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
              Metrics distribution across difficulty levels, category pools, and live availability.
            </p>
          </div>
        </div>
      </div>

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
          <span className="text-slate-400 font-bold uppercase text-[10px]">Categories Active</span>
          <h3 className="text-2xl font-bold text-brandPrimary font-mono">{categories.length}</h3>
          <p className="text-[11px] text-slate-400">Question Pool Categories</p>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm space-y-2">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Pending Approval</span>
          <h3 className="text-2xl font-bold text-amber-500 font-mono">{analytics.pending}</h3>
          <p className="text-[11px] text-slate-400">Requires Moderator Review</p>
        </div>
      </div>

      {/* Difficulty & Category Spread */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" />
          <span>Category Distribution & Difficulty Breakdown</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-3">Category Name</th>
                <th className="p-3">Total Questions</th>
                <th className="p-3">Easy</th>
                <th className="p-3">Medium</th>
                <th className="p-3">Hard</th>
                <th className="p-3 text-right">Pool Share %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
              {categories.map((cat) => {
                const stat = categoryStats[cat] || { total: 0, easy: 0, medium: 0, hard: 0 };
                const sharePercent = analytics.total > 0 ? ((stat.total / analytics.total) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={cat} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="p-3 font-bold text-slate-800 dark:text-white">{cat}</td>
                    <td className="p-3 font-mono font-bold">{stat.total}</td>
                    <td className="p-3 text-emerald-500 font-mono">{stat.easy}</td>
                    <td className="p-3 text-amber-500 font-mono">{stat.medium}</td>
                    <td className="p-3 text-rose-500 font-mono">{stat.hard}</td>
                    <td className="p-3 text-right font-mono font-bold text-purple-500">{sharePercent}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
