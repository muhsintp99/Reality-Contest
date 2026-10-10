import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal, RefreshCw, Download, Trash2, Copy, Check,
  Play, Pause, Filter, ShieldAlert, Cpu, HardDrive, Clock, CheckCircle2,
  Calendar, RotateCcw
} from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';

export const TerminalLogsViewer = ({ defaultFilter = 'all', title = 'Backend Terminal Logs' }) => {
  const { showSnackbar, showConfirm } = useAlert();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [levelFilter, setLevelFilter] = useState(defaultFilter);
  const [stats, setStats] = useState({
    uptime: 0,
    heapUsedMB: 0,
    rssMB: 0,
    nodeVersion: 'v20.x',
    serverTime: ''
  });
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef(null);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/admin/system/logs', {
        params: { limit: 250, level: levelFilter }
      }).catch(() => axios.get('/api/system/logs', { params: { limit: 250, level: levelFilter } }));

      if (res.data?.success && res.data.data) {
        setLogs(res.data.data.logs || []);
        if (res.data.data.memoryUsage) {
          setStats({
            uptime: res.data.data.uptime || 0,
            heapUsedMB: res.data.data.memoryUsage.heapUsedMB || 0,
            rssMB: res.data.data.memoryUsage.rssMB || 0,
            nodeVersion: res.data.data.nodeVersion || 'v20.x',
            serverTime: res.data.data.serverTime || new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error('Error loading terminal logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [levelFilter]);

  // Auto-refresh interval (every 3s)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, levelFilter]);

  const handleCopyLogs = () => {
    const text = logs.map((l) => l.raw || `[${l.timestamp}] [${l.level}]: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    showSnackbar('Logs copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const text = logs.map((l) => l.raw || `[${l.timestamp}] [${l.level}]: ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backend_terminal_logs_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSnackbar('Terminal log file downloaded!', 'success');
  };

  const handleClearLogs = () => {
    setLogs([]);
    showSnackbar('Console view cleared', 'info');
  };

  const handlePurgeOldLogs = () => {
    showConfirm('Purge Expired Logs', 'Are you sure you want to delete all log entries older than 24 hours from server disk?', async () => {
      try {
        setIsPurging(true);
        const res = await axios.post('/api/admin/system/logs/purge', { hours: 24 })
          .catch(() => axios.post('/api/system/logs/purge', { hours: 24 }));
        
        if (res.data?.success) {
          const removed = res.data.data?.linesRemoved || 0;
          showSnackbar(`Auto 24h Purge Complete: ${removed} expired log lines removed.`, 'success');
          fetchLogs();
        }
      } catch (err) {
        showSnackbar('Log purge failed', 'error');
      } finally {
        setIsPurging(false);
      }
    });
  };

  const formatUptime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs">
      {/* Top Terminal Bar */}
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>{title}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE
            </span>
          </div>
        </div>

        {/* Server Performance Meta & 24h Retention Badge */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-semibold">
            <Calendar className="w-3 h-3 text-indigo-400" /> 24h Auto-Retention Active
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" /> Uptime: {formatUptime(stats.uptime)}
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> RAM: {stats.heapUsedMB}MB
          </span>
          <span className="hidden md:inline-block text-slate-500">Node: {stats.nodeVersion}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Logs ({logs.length})</option>
            <option value="info">Info Only</option>
            <option value="warn">Warnings ⚠️</option>
            <option value="error">Errors Only 🔴</option>
            <option value="room">Room Cycle Logs 🔄</option>
          </select>

          {/* Purge >24h Logs */}
          <button
            onClick={handlePurgeOldLogs}
            disabled={isPurging}
            title="Clean / Purge logs older than 24 hours"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/80 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">Purge &gt;24h</span>
          </button>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? 'Pause live tailing' : 'Resume live tailing'}
            className={`p-1.5 rounded-lg border transition-all ${
              autoRefresh
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {autoRefresh ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => {
              setLoading(true);
              fetchLogs().finally(() => setLoading(false));
            }}
            title="Refresh logs now"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Copy Logs */}
          <button
            onClick={handleCopyLogs}
            title="Copy all output"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download Logs */}
          <button
            onClick={handleDownloadLogs}
            title="Download log file"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear Console */}
          <button
            onClick={handleClearLogs}
            title="Clear console view"
            className="p-1.5 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg border border-slate-700 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Console */}
      <div className="p-4 max-h-[460px] min-h-[280px] overflow-y-auto space-y-1 bg-[#0a0f1d] selection:bg-indigo-600 selection:text-white">
        {logs.length === 0 ? (
          <div className="py-16 text-center text-slate-600">
            <Terminal className="w-8 h-8 mx-auto mb-2 text-slate-700" />
            <p>No terminal output within the 24-hour window.</p>
          </div>
        ) : (
          logs.map((log, idx) => {
            const isErr = log.level === 'error' || log.raw?.toLowerCase().includes('error');
            const isWarn = log.level === 'warn' || log.raw?.toLowerCase().includes('warn');
            const isSuccess = log.raw?.toLowerCase().includes('success') || log.raw?.toLowerCase().includes('connected');

            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 hover:bg-slate-900/60 px-2 py-1 rounded transition-colors"
              >
                <span className="text-slate-500 select-none text-[10px] w-36 flex-shrink-0">
                  {log.timestamp}
                </span>

                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${
                    isErr
                      ? 'bg-red-950 text-red-400 border border-red-800/60'
                      : isWarn
                      ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                      : isSuccess
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                      : 'bg-slate-800 text-cyan-400 border border-slate-700'
                  }`}
                >
                  {log.level || 'info'}
                </span>

                <span
                  className={`flex-1 break-all leading-relaxed ${
                    isErr
                      ? 'text-red-300 font-semibold'
                      : isWarn
                      ? 'text-amber-300'
                      : isSuccess
                      ? 'text-emerald-300'
                      : 'text-slate-200'
                  }`}
                >
                  {log.message || log.raw}
                </span>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Footer Info */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
          <span>⚡ 24-Hour retention active &bull; Logs older than 24h are auto-purged every hour</span>
        </span>
        <span>Showing {logs.length} entries</span>
      </div>
    </div>
  );
};

export default TerminalLogsViewer;
