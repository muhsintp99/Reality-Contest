import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Calendar, Filter, Users, Vote, DollarSign, 
  ArrowUpRight, Sparkles, Check, Download, History, CheckSquare,
  HelpCircle, Trophy, Award, Share2, Landmark, Activity, PieChart, Clock,
  Smartphone, Monitor, Tablet, ShieldCheck, Zap, BarChart2
} from 'lucide-react';

const TIMEFRAMES = ['7 Days', '30 Days', '6 Months'];

// 12 Analytical Metrics ledger (clean, real-sounding telemetry)
const ANALYTICS_METRICS = [
  { id: 'dau-mau', label: 'DAU/MAU', icon: Users, stat: '48.2K / 184.2K', change: '+14.2%', desc: 'Daily Active vs Monthly Active User Ratio', unit: 'users', type: 'count' },
  { id: 'participation-rate', label: 'Contest Participation Rate', icon: Vote, stat: '78.5%', change: '+8.4%', desc: 'Registered Users Participating in Live Contests', unit: '%', type: 'percentage' },
  { id: 'avg-session-time', label: 'Average Session Time', icon: Clock, stat: '22m 45s', change: '+5.1%', desc: 'Average Time Spent per Active Contest Session', unit: 'mins', type: 'time' },
  { id: 'completion-rate', label: 'Contest Completion Rate', icon: CheckSquare, stat: '92.4%', change: '+3.8%', desc: 'Percentage of Started Contests Completed', unit: '%', type: 'percentage' },
  { id: 'question-accuracy', label: 'Question Accuracy', icon: HelpCircle, stat: '86.2%', change: '+2.1%', desc: 'Platform-wide Average Quiz Accuracy', unit: '%', type: 'percentage' },
  { id: 'category-popularity', label: 'Category Popularity', icon: Trophy, stat: 'Grand Reality (42%)', change: '+18.0%', desc: 'Most Played Contest Categories', unit: '%', type: 'percentage' },
  { id: 'revenue-by-contest', label: 'Revenue by Contest', icon: DollarSign, stat: '₹14,50,000', change: '+24.5%', desc: 'Gross Entry Fee Revenue by Tournament', unit: '₹', type: 'currency' },
  { id: 'top-earners', label: 'Top Earners', icon: Award, stat: 'Rank #1 Champion (₹1.8L)', change: '+15.2%', desc: 'Highest Contest Prize Winners', unit: '₹', type: 'currency' },
  { id: 'top-referrers', label: 'Top Referrers', icon: Share2, stat: 'Top Affiliate (29 Invites)', change: '+32.0%', desc: 'Top Affiliate Referral Leaderboard', unit: 'invites', type: 'count' },
  { id: 'retention-rate', label: 'Retention Rate', icon: TrendingUp, stat: '68.4% (D30)', change: '+6.2%', desc: '30-Day Cohort User Retention', unit: '%', type: 'percentage' },
  { id: 'conversion-rate', label: 'Conversion Rate', icon: Sparkles, stat: '14.8%', change: '+4.5%', desc: 'Free User to Paid Entry Fee Conversion', unit: '%', type: 'percentage' },
  { id: 'withdrawal-trends', label: 'Withdrawal Trends', icon: Landmark, stat: '₹4,80,000 Payouts', change: '-2.4%', desc: 'Daily Payout Volumes & Trends', unit: '₹', type: 'currency' }
];

const METRIC_CHART_SERIES = {
  percentage: {
    '7 Days': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], series: [72, 75, 78, 81, 84, 88, 86], format: (v) => `${v}%` },
    '30 Days': { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], series: [70, 74, 80, 86], format: (v) => `${v}%` },
    '6 Months': { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], series: [65, 70, 75, 80, 83, 86], format: (v) => `${v}%` }
  },
  currency: {
    '7 Days': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], series: [120000, 150000, 140000, 190000, 240000, 310000, 300000], format: (v) => `₹${(v / 1000).toFixed(0)}K` },
    '30 Days': { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], series: [650000, 820000, 940000, 1140000], format: (v) => `₹${(v / 100000).toFixed(1)}L` },
    '6 Months': { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], series: [3200000, 4100000, 3900000, 4800000, 5600000, 6800000], format: (v) => `₹${(v / 100000).toFixed(1)}L` }
  },
  time: {
    '7 Days': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], series: [18, 19, 20, 21, 23, 25, 23], format: (v) => `${v}m` },
    '30 Days': { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], series: [17, 19, 21, 23], format: (v) => `${v}m` },
    '6 Months': { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], series: [15, 17, 18, 20, 22, 23], format: (v) => `${v}m` }
  },
  count: {
    '7 Days': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], series: [12000, 15000, 14000, 18000, 22000, 25000, 24000], format: (v) => `${v.toLocaleString()}` },
    '30 Days': { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], series: [65000, 78000, 85000, 98000], format: (v) => `${v.toLocaleString()}` },
    '6 Months': { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], series: [320000, 410000, 390000, 480000, 550000, 620000], format: (v) => `${v.toLocaleString()}` }
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
  
  const metricType = activeMetric.type || 'count';
  const categoryDataset = METRIC_CHART_SERIES[metricType] || METRIC_CHART_SERIES.count;
  const currentData = categoryDataset[timeframe] || categoryDataset['7 Days'];
  const maxVal = Math.max(...currentData.series) * 1.15 || 1;

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
    <div className="space-y-6 text-left animate-fade-in max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 font-sans antialiased">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0B1120] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-brandPrimary" />
            <span>Platform Analytics & Telemetry</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Granular real-time telemetry mapping user engagement, retention, quiz accuracy & revenue trajectories.
          </p>
        </div>

        {/* Timeframe selector & export */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-xl">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeframe === tf ? 'bg-brandPrimary text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="h-9 px-3.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-brandPrimary/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Executive Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Daily Active / Monthly Active Ratio */}
        <div className="bg-white dark:bg-[#0B1120] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">DAU / MAU Ratio</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">48.2K / 184.2K</div>
            <div className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +14.2% engagement ratio
            </div>
          </div>
        </div>

        {/* 2. Live Contest Participation Rate */}
        <div className="bg-white dark:bg-[#0B1120] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Participation Rate</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
              <Vote className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-blue-500">78.5%</div>
            <div className="text-[11px] text-blue-500 font-bold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +8.4% live show attendance
            </div>
          </div>
        </div>

        {/* 3. Platform Quiz Accuracy */}
        <div className="bg-white dark:bg-[#0B1120] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quiz Accuracy</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-500">86.2%</div>
            <div className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +2.1% pass benchmark
            </div>
          </div>
        </div>

        {/* 4. Platform Gross Contest Revenue */}
        <div className="bg-white dark:bg-[#0B1120] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contest Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-500">₹14,50,000</div>
            <div className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +24.5% entry fees collected
            </div>
          </div>
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
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-brandPrimary text-white shadow-md shadow-brandPrimary/20'
                  : 'bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Metric Spotlight Banner */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {activeMetric.label} Telemetry
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{activeMetric.stat}</h2>
          <p className="text-xs text-slate-400">{activeMetric.desc}</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-xs sm:text-sm flex items-center gap-1.5 w-fit">
          <ArrowUpRight className="w-4 h-4" /> {activeMetric.change} vs prior timeframe
        </div>
      </div>

      {/* Main Telemetry Dynamic Chart */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-brandPrimary" /> {activeMetric.label} Velocity ({timeframe})
          </h3>
          <span className="text-xs text-slate-400 font-mono font-bold">Peak Metric: {currentData.format(Math.max(...currentData.series))}</span>
        </div>

        {/* Dynamic SVG Bar Chart */}
        <div className="h-60 w-full relative flex items-end justify-between pt-8 pb-3 px-2 sm:px-4 border-b border-slate-200 dark:border-white/10">
          {currentData.series.map((val, idx) => {
            const heightPercent = Math.max(16, Math.min(100, Math.round((val / maxVal) * 100)));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative h-full">
                {/* Bar Track Container */}
                <div className="relative w-full flex-1 flex items-end justify-center">
                  {/* Floating Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-1.5 bg-slate-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-xl z-20 whitespace-nowrap border border-white/10 pointer-events-none">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    <span>{currentData.labels[idx]}: <span className="text-emerald-300">{currentData.format(val)}</span></span>
                  </div>
                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[42px] bg-gradient-to-t from-brandPrimary/80 to-emerald-400 group-hover:from-brandPrimary group-hover:to-emerald-300 rounded-t-lg transition-all duration-300 shadow-sm"
                  />
                </div>
                {/* Axis Label */}
                <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-400 shrink-0">{currentData.labels[idx]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparative Telemetry Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Device & Client Breakdown */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-indigo-500" /> Device Distribution
          </h4>
          <div className="space-y-2.5 pt-1">
            {[
              { name: 'Mobile App (Android/iOS)', pct: 74, color: 'bg-indigo-500' },
              { name: 'Desktop Web Browser', pct: 21, color: 'bg-emerald-500' },
              { name: 'Tablet & iPad Web', pct: 5, color: 'bg-amber-500' }
            ].map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{d.name}</span>
                  <span className="font-mono">{d.pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cohort Retention Performance */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Cohort Retention
          </h4>
          <div className="space-y-2.5 pt-1">
            {[
              { name: 'Day 1 Return Rate', pct: 88, color: 'bg-emerald-500' },
              { name: 'Day 7 Contest Re-entry', pct: 72, color: 'bg-blue-500' },
              { name: 'Day 30 Active Player Rate', pct: 68, color: 'bg-purple-500' }
            ].map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{d.name}</span>
                  <span className="font-mono">{d.pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Integrity & Accuracy */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Contest Integrity
          </h4>
          <div className="space-y-2.5 pt-1">
            {[
              { name: 'AI Anti-Cheat Verification', pct: 99.4, color: 'bg-emerald-500' },
              { name: 'Live Quiz Sync Latency', pct: 96.8, color: 'bg-teal-500' },
              { name: 'Instant Prize Credit Ratio', pct: 99.9, color: 'bg-indigo-500' }
            ].map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{d.name}</span>
                  <span className="font-mono">{d.pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;
