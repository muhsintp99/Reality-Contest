import React, { useState } from 'react';
import { 
  TrendingUp, Calendar, Filter, Users, Vote, DollarSign, 
  ArrowUpRight, Sparkles, Check, Download
} from 'lucide-react';

const TIMEFRAMES = ['7 Days', '30 Days', '6 Months'];

// Data Ledger
const CHART_DATA = {
  '7 Days': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    revenue: [12000, 15000, 14000, 18000, 22000, 25000, 24000],
    votes: [5400, 6800, 7200, 8100, 9500, 12000, 10500],
    users: [420, 580, 610, 750, 890, 1100, 950]
  },
  '30 Days': {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    revenue: [65000, 78000, 85000, 98000],
    votes: [28000, 34000, 39000, 45000],
    users: [2400, 3100, 3800, 4500]
  },
  '6 Months': {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    revenue: [320000, 410000, 390000, 480000, 550000, 620000],
    votes: [120000, 154000, 142000, 189000, 210000, 248000],
    users: [11200, 14500, 13800, 17900, 19800, 24800]
  }
};

export const AnalyticsPage = () => {
  const [timeframe, setTimeframe] = useState('7 Days');
  const [activeChart, setActiveChart] = useState('revenue'); // revenue, votes, users
  const [hoverIndex, setHoverIndex] = useState(null);

  const currentData = CHART_DATA[timeframe];
  const activeSeries = currentData[activeChart];
  const maxVal = Math.max(...activeSeries) * 1.15;

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + currentData.labels.join(",") + "\n"
      + activeSeries.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RCP_Analytics_${activeChart}_${timeframe.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-poppins text-white dark:text-white light:text-black tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brandPrimary" />
            <span>Platform Analytics</span>
          </h1>
          <p className="text-xs text-white/50 dark:text-white/50 light:text-black/50">
            Real-time query metrics mapping growth trajectories and payment volumes.
          </p>
        </div>

        {/* Timeframe selector & export */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 dark:bg-white/5 light:bg-black/5 border border-white/10 dark:border-white/10 light:border-black/10 p-1 rounded-xl">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => { setTimeframe(tf); setHoverIndex(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${timeframe === tf ? 'bg-brandPrimary text-white shadow-sm' : 'text-white/50 dark:text-white/50 light:text-black/50 hover:text-white'}`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="p-2.5 bg-white/5 dark:bg-white/5 light:bg-black/5 hover:bg-white/10 rounded-xl border border-white/10 dark:border-white/10 light:border-black/10 text-white/60 dark:text-white/60 light:text-black/60 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Export CSV Data"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Grid Quick Metric Switchers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => { setActiveChart('revenue'); setHoverIndex(null); }}
          className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeChart === 'revenue' 
              ? 'bg-brandPrimary/10 border-brandPrimary/45 text-brandPrimary shadow-lg' 
              : 'glassmorphism border-white/10 hover:border-brandPrimary/20 text-white'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/50 dark:text-white/50 light:text-black/50 font-bold uppercase tracking-wider">Revenue Escrow</span>
            <DollarSign className="w-4 h-4 text-brandSecondary" />
          </div>
          <p className="text-2xl font-extrabold text-white dark:text-white light:text-black mt-2 font-poppins">
            {timeframe === '7 Days' ? '₹1,39,000' : timeframe === '30 Days' ? '₹3,26,000' : '₹28,50,000'}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-1">+18.5% Growth</span>
          {activeChart === 'revenue' && <div className="absolute right-0 bottom-0 w-2 h-2 bg-brandPrimary rounded-tl" />}
        </button>

        <button
          onClick={() => { setActiveChart('votes'); setHoverIndex(null); }}
          className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeChart === 'votes' 
              ? 'bg-brandPrimary/10 border-brandPrimary/45 text-brandPrimary shadow-lg' 
              : 'glassmorphism border-white/10 hover:border-brandPrimary/20 text-white'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/50 dark:text-white/50 light:text-black/50 font-bold uppercase tracking-wider">Votes Audited</span>
            <Vote className="w-4 h-4 text-brandSecondary" />
          </div>
          <p className="text-2xl font-extrabold text-white dark:text-white light:text-black mt-2 font-poppins">
            {timeframe === '7 Days' ? '68,500' : timeframe === '30 Days' ? '1,46,000' : '10,73,000'}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-1">+6.4% Traffic</span>
          {activeChart === 'votes' && <div className="absolute right-0 bottom-0 w-2 h-2 bg-brandPrimary rounded-tl" />}
        </button>

        <button
          onClick={() => { setActiveChart('users'); setHoverIndex(null); }}
          className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeChart === 'users' 
              ? 'bg-brandPrimary/10 border-brandPrimary/45 text-brandPrimary shadow-lg' 
              : 'glassmorphism border-white/10 hover:border-brandPrimary/20 text-white'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/50 dark:text-white/50 light:text-black/50 font-bold uppercase tracking-wider">User Enrolls</span>
            <Users className="w-4 h-4 text-brandSecondary" />
          </div>
          <p className="text-2xl font-extrabold text-white dark:text-white light:text-black mt-2 font-poppins">
            {timeframe === '7 Days' ? '5,100' : timeframe === '30 Days' ? '13,800' : '1,12,700'}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-1">+12.2% Enrolls</span>
          {activeChart === 'users' && <div className="absolute right-0 bottom-0 w-2 h-2 bg-brandPrimary rounded-tl" />}
        </button>
      </div>

      {/* Main Chart Card */}
      <div className="glassmorphism p-6 rounded-2xl border border-white/10 dark:border-white/5 light:border-black/10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold text-white dark:text-white light:text-black uppercase tracking-wider">
              {activeChart.toUpperCase()} OVER TIME ({timeframe})
            </h3>
            <p className="text-[10px] text-white/40 mt-0.5">Hover on data points to view specific counts.</p>
          </div>
          {hoverIndex !== null && (
            <div className="bg-brandSecondary/25 border border-brandSecondary/30 px-3 py-1 rounded-xl text-xs font-bold text-brandSecondary animate-fade-in">
              {currentData.labels[hoverIndex]}: {activeChart === 'revenue' ? '₹' : ''}{activeSeries[hoverIndex].toLocaleString()}
            </div>
          )}
        </div>

        {/* Dynamic SVG Area Chart */}
        <div className="relative h-64 w-full bg-[#080b12]/30 border border-white/5 rounded-xl p-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
            {/* Gradients */}
            <defs>
              <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="190" x2="600" y2="190" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

            {/* Path definitions */}
            {(() => {
              const pointsCount = activeSeries.length;
              const points = activeSeries.map((val, idx) => {
                const x = (idx * (600 / (pointsCount - 1))).toFixed(1);
                const y = (190 - (val / maxVal) * 160).toFixed(1);
                return { x, y };
              });

              const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
              const areaD = `${pathD} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`;

              return (
                <>
                  {/* Fill Area */}
                  <path d={areaD} fill="url(#areaGlow)" />
                  
                  {/* Line Stroke */}
                  <path d={pathD} fill="none" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Interactive node circles */}
                  {points.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={hoverIndex === idx ? "7" : "4.5"}
                      fill={hoverIndex === idx ? "#06b6d4" : "#7C3AED"}
                      stroke="#0b1120"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoverIndex(idx)}
                      onMouseLeave={() => setHoverIndex(null)}
                    />
                  ))}
                </>
              );
            })()}
          </svg>
        </div>

        {/* Labels Footer */}
        <div className="flex justify-between px-3 mt-4 text-[10px] text-white/40 dark:text-white/40 light:text-black/40 font-semibold uppercase font-mono">
          {currentData.labels.map((lbl, idx) => (
            <span key={idx} className="w-10 text-center">{lbl}</span>
          ))}
        </div>
      </div>

      {/* Grid: Conversion Rate stats & Sponsor budget tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Conversion rate */}
        <div className="glassmorphism p-5 rounded-2xl border border-white/10">
          <h3 className="text-xs font-bold uppercase text-white dark:text-white light:text-black tracking-wider mb-4">Audition conversion rates</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Quiz Stages Pass Rate</span>
                <span className="font-extrabold text-brandSecondary">64.5%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-brandSecondary rounded-full" style={{ width: '64.5%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>KYC Approval Conversion</span>
                <span className="font-extrabold text-brandPrimary">91.8%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-brandPrimary rounded-full" style={{ width: '91.8%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Judges Card Audits Ratio</span>
                <span className="font-extrabold text-brandAccent font-mono">42.0%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-brandAccent rounded-full" style={{ width: '42%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Sponsor performance */}
        <div className="glassmorphism p-5 rounded-2xl border border-white/10">
          <h3 className="text-xs font-bold uppercase text-white dark:text-white light:text-black tracking-wider mb-4">Active Brand Budgets</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs bg-white/5 p-3.5 rounded-xl border border-white/5">
              <div>
                <p className="font-bold text-white">Pepsi Co</p>
                <p className="text-[10px] text-white/40 mt-0.5">Pepsi Fizz Creator Challenge</p>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-brandSecondary">₹10,00,000</span>
                <span className="block text-[10px] text-emerald-400 mt-0.5">8.4% CTR</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs bg-white/5 p-3.5 rounded-xl border border-white/5">
              <div>
                <p className="font-bold text-white">Zebronics</p>
                <p className="text-[10px] text-white/40 mt-0.5">Zeb-Sound Master Contest</p>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-brandSecondary">₹5,00,000</span>
                <span className="block text-[10px] text-emerald-400 mt-0.5">6.2% CTR</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
export default AnalyticsPage;
