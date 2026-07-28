import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Calendar, Filter, Users, Vote, DollarSign, 
  ArrowUpRight, Sparkles, Check, Download, History, CheckSquare,
  HelpCircle, Trophy, Award, Share2, Landmark, Activity, PieChart, Clock
} from 'lucide-react';

const TIMEFRAMES = ['7 Days', '30 Days', '6 Months'];

// 12 Analytical Metrics ledger
const ANALYTICS_METRICS = [
  { id: 'dau-mau', label: 'DAU/MAU', icon: Users, stat: '48.2K / 184.2K', change: '+14.2%', desc: 'Daily Active vs Monthly Active User Ratio' },
  { id: 'participation-rate', label: 'Contest Participation Rate', icon: Vote, stat: '78.5%', change: '+8.4%', desc: 'Registered Users Participating in Live Contests' },
  { id: 'avg-session-time', label: 'Average Session Time', icon: Clock, stat: '22m 45s', change: '+5.1%', desc: 'Average Time Spent per Active Contest Session' },
  { id: 'completion-rate', label: 'Contest Completion Rate', icon: CheckSquare, stat: '92.4%', change: '+3.8%', desc: 'Percentage of Started Contests Completed' },
  { id: 'question-accuracy', label: 'Question Accuracy', icon: HelpCircle, stat: '86.2%', change: '+2.1%', desc: 'Platform-wide Average Quiz Accuracy' },
  { id: 'category-popularity', label: 'Category Popularity', icon: Trophy, stat: 'Grand Reality (42%)', change: '+18.0%', desc: 'Most Played Contest Categories' },
  { id: 'revenue-by-contest', label: 'Revenue by Contest', icon: DollarSign, stat: '₹14,50,000', change: '+24.5%', desc: 'Gross Entry Fee Revenue by Tournament' },
  { id: 'top-earners', label: 'Top Earners', icon: Award, stat: 'Aarav Sharma (₹1.8L)', change: '+15.2%', desc: 'Highest Contest Prize Winners' },
  { id: 'top-referrers', label: 'Top Referrers', icon: Share2, stat: 'Ananya Verma (29 Invites)', change: '+32.0%', desc: 'Top Affiliate Referral Leaderboard' },
  { id: 'retention-rate', label: 'Retention Rate', icon: TrendingUp, stat: '68.4% (D30)', change: '+6.2%', desc: '30-Day Cohort User Retention' },
  { id: 'conversion-rate', label: 'Conversion Rate', icon: Sparkles, stat: '14.8%', change: '+4.5%', desc: 'Free User to Paid Entry Fee Conversion' },
  { id: 'withdrawal-trends', label: 'Withdrawal Trends', icon: Landmark, stat: '₹4,80,000 Payouts', change: '-2.4%', desc: 'Daily Payout Volumes & Trends' }
];

const CHART_DATA = {
  '7 Days': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [12000, 15000, 14000, 18000, 22000, 25000, 24000]
  },
  '30 Days': {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    series: [65000, 78000, 85000, 98000]
  },
  '6 Months': {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [320000, 410000, 390000, 480000, 550000, 620000]
  }
};

export const AnalyticsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('7 Days');

  // Extract metric id from path e.g. /admin-dashboard/analytics/dau-mau
  const currentSubPath = location.pathname.replace('/admin-dashboard/analytics/', '').replace('/admin-dashboard/analytics', '');
  const activeMetricId = currentSubPath || 'dau-mau';

  const activeMetric = ANALYTICS_METRICS.find(m => m.id === activeMetricId) || ANALYTICS_METRICS[0];
  const currentData = CHART_DATA[timeframe];
  const maxVal = Math.max(...currentData.series) * 1.15;

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + currentData.labels.join(",") + "\n"
      + currentData.series.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RCP_${activeMetric.id}_${timeframe.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in p-2">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-brandPrimary" />
            <span>Platform Analytics & Telemetry</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Granular data metrics mapping user engagement, retention, quiz accuracy & revenue trajectories.
          </p>
        </div>

        {/* Timeframe selector & export */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-xl">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  timeframe === tf ? 'bg-brandPrimary text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary hover:bg-brandPrimary/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 12 Analytics Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {ANALYTICS_METRICS.map(m => {
          const Icon = m.icon;
          const isActive = activeMetric.id === m.id;
          return (
            <button
              key={m.id}
              onClick={() => navigate(`/admin-dashboard/analytics/${m.id}`)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brandPrimary text-white shadow-md shadow-brandPrimary/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Metric Spotlight Banner */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {activeMetric.label} Telemetry
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{activeMetric.stat}</h2>
          <p className="text-xs text-slate-400">{activeMetric.desc}</p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-sm flex items-center gap-1.5 w-fit">
          <ArrowUpRight className="w-4 h-4" /> {activeMetric.change} vs prior timeframe
        </div>
      </div>

      {/* Main Telemetry Chart */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-brandPrimary" /> {activeMetric.label} Trend Graph ({timeframe})
          </h3>
          <span className="text-xs text-slate-400 font-mono">Max Peak: {Math.max(...currentData.series).toLocaleString()}</span>
        </div>

        {/* Dynamic SVG Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-4 pt-6 px-4 border-b border-slate-100 dark:border-white/5">
          {currentData.series.map((val, idx) => {
            const heightPercent = Math.round((val / maxVal) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {val.toLocaleString()}
                </div>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full bg-gradient-to-t from-brandPrimary/40 to-brandPrimary rounded-t-2xl group-hover:from-brandPrimary group-hover:to-emerald-400 transition-all duration-300 shadow-md shadow-brandPrimary/15"
                />
                <span className="text-xs font-bold text-slate-400 mt-2">{currentData.labels[idx]}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;
