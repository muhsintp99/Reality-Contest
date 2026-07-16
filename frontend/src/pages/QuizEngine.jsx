import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Clock, Check, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../components/common/Badges';

export const QuizEngine = ({ stage, onBack }) => {
  const containerRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedIndex or [selectedIndices] }
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(stage.timeLimit || 300);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  // Telemetry logs
  const [tabSwitches, setTabSwitches] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [logs, setLogs] = useState([]);

  // Load questions
  const startAttempt = async () => {
    try {
      const res = await axios.post(`/api/stages/${stage._id}/start`, {
        deviceInfo: navigator.userAgent,
        browser: 'Google Chrome'
      }, { withCredentials: true });

      if (res.data.success) {
        setQuestions(res.data.questions || []);
        setTimeLeft(res.data.timeLimit || stage.timeLimit || 300);
        
        // Restore cached answers
        const cached = localStorage.getItem(`quiz_answers_${stage._id}`);
        if (cached) {
          setAnswers(JSON.parse(cached));
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start quiz lobby');
      onBack();
    }
  };

  useEffect(() => {
    startAttempt();
  }, [stage._id]);

  // Overall Timer Countdown
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) {
      if (timeLeft <= 0 && !isSubmitted) {
        handleSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  // Auto-Save locally
  useEffect(() => {
    if (Object.keys(answers).length > 0 && !isSubmitted) {
      localStorage.setItem(`quiz_answers_${stage._id}`, JSON.stringify(answers));
    }
  }, [answers, stage._id, isSubmitted]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active && !isSubmitted) {
        setFullscreenExits(prev => prev + 1);
        triggerLogAlert('Fullscreen mode exited by user.');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isSubmitted]);

  // Tab Switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setTabSwitches(prev => prev + 1);
        triggerLogAlert('Tab switch / background navigation detected.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSubmitted]);

  // Prevent Exit alert
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSubmitted) {
        e.preventDefault();
        e.returnValue = 'Attempt is in progress. Exiting will submit your current answers.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSubmitted]);

  const triggerLogAlert = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleSelectOption = (qId, optionIdx, isMulti) => {
    setAnswers(prev => {
      const current = prev[qId];
      if (isMulti) {
        const arr = Array.isArray(current) ? [...current] : [];
        if (arr.includes(optionIdx)) {
          return { ...prev, [qId]: arr.filter(i => i !== optionIdx) };
        } else {
          return { ...prev, [qId]: [...arr, optionIdx] };
        }
      } else {
        return { ...prev, [qId]: optionIdx };
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    localStorage.removeItem(`quiz_answers_${stage._id}`);

    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    const cheatAlerts = [];
    if (tabSwitches > 0) {
      cheatAlerts.push({ type: 'tab_switch', timestamp: new Date(), details: `${tabSwitches} occurrences` });
    }
    if (fullscreenExits > 0) {
      cheatAlerts.push({ type: 'fullscreen_exit', timestamp: new Date(), details: `${fullscreenExits} occurrences` });
    }

    try {
      const res = await axios.post(`/api/stages/${stage._id}/submit`, {
        answers,
        cheatAlerts,
        deviceInfo: navigator.userAgent,
        browser: 'Google Chrome'
      }, { withCredentials: true });

      if (res.data.success) {
        setResult(res.data.evaluation);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isSubmitted && result) {
    return (
      <div className="py-20 text-center space-y-6 max-w-md mx-auto animate-scale-in text-slate-800 dark:text-white pb-10">
        <div className="inline-flex p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500">
          <Check className="w-10 h-10 animate-bounce" />
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-extrabold font-sans">Lobby Assessment Complete</h3>
          <p className="text-xs text-slate-500 dark:text-white/50">{result.remarks}</p>

          <div className="glassmorphism p-5 rounded-[24px] border border-slate-200/50 dark:border-white/5 grid grid-cols-2 gap-4 text-left bg-white/70 dark:bg-slate-900/40">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-white/35 uppercase block">Obtained Score</span>
              <span className="text-xl font-extrabold font-mono text-brandPrimary dark:text-brandSecondary">{result.score} / {result.maxScore}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-white/35 uppercase block">Verdict Status</span>
              <span className={`text-sm font-extrabold uppercase ${result.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                {result.status}
              </span>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-sm"
            >
              Return to Tournament Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Enforced Fullscreen View
  if (!isFullscreen) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-[#080b12] z-50 flex items-center justify-center p-6 text-slate-800 dark:text-white text-center">
        <div className="max-w-sm space-y-5 glassmorphism bg-white dark:bg-slate-900/50 p-8 rounded-[24px] border border-slate-200/60 dark:border-white/10 shadow-2xl">
          <div className="inline-flex p-4 bg-brandSecondary/10 border border-brandSecondary/20 rounded-full text-brandSecondary animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold font-sans">Fullscreen Mode Enforced</h3>
            <p className="text-xs text-slate-500 dark:text-white/45 mt-2.5 leading-relaxed">
              This stage requires locked full-screen mode to prevent copy-pasting, screen shares, and resource checks.
            </p>
          </div>
          <button
            onClick={toggleFullscreen}
            className="w-full py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Enter Fullscreen Lobbies</span>
          </button>
        </div>
      </div>
    );
  }

  const activeQ = questions[currentIdx];

  return (
    <div
      ref={containerRef}
      onCopy={(e) => e.preventDefault()}
      className="select-none min-h-screen bg-slate-50 dark:bg-[#080b12] text-slate-800 dark:text-white p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 select-none"
      style={{ userSelect: 'none' }}
    >
      {/* Quiz Engine Main Frame */}
      <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
        
        {/* Header Console */}
        <div className="flex justify-between items-center glassmorphism bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl shadow-sm">
          <div>
            <h4 className="text-xs font-bold text-slate-850 dark:text-white">{stage.name}</h4>
            <span className="text-[10px] text-slate-400 dark:text-white/40">Question {currentIdx + 1} of {questions.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brandSecondary/10 border border-brandSecondary/20 text-brandSecondary rounded-xl text-xs font-mono font-extrabold">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Question Board */}
        {activeQ && (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 p-6 rounded-[24px] space-y-6 flex-1 flex flex-col justify-center shadow-sm">
            <h3 className="text-sm font-extrabold leading-relaxed text-slate-800 dark:text-white">{activeQ.text}</h3>
            
            {activeQ.mediaUrl && (
              <img src={activeQ.mediaUrl} alt="Question Graphic" className="max-h-48 rounded-xl object-contain border border-slate-100" />
            )}

            <div className="space-y-3">
              {activeQ.options.map((opt, oIdx) => {
                const isMulti = activeQ.type === 'Multiple Choice';
                const chosen = answers[activeQ._id];
                const selected = isMulti
                  ? Array.isArray(chosen) && chosen.includes(oIdx)
                  : chosen === oIdx;

                return (
                  <div
                    key={oIdx}
                    onClick={() => handleSelectOption(activeQ._id, oIdx, isMulti)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 select-none ${
                      selected 
                        ? 'bg-brandPrimary/10 border-brandPrimary text-brandPrimary font-bold' 
                        : 'bg-white dark:bg-slate-800/10 border-slate-200/50 dark:border-white/5 text-slate-650 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center text-[9px] font-bold ${selected ? 'border-brandPrimary bg-brandPrimary text-white' : 'border-slate-200 dark:border-white/20'}`}>
                      {selected && '✓'}
                    </div>
                    <span className="text-xs">{opt.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Navigator */}
        <div className="flex justify-between items-center border-t border-slate-200/60 dark:border-white/5 pt-4">
          <button
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="px-4 py-2 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-30 border border-slate-200 dark:border-white/10 rounded-xl text-xs flex items-center gap-1.5 font-bold transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>
          
          {currentIdx === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md active:scale-[0.98] transition-all"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
              className="px-4 py-2 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-xs flex items-center gap-1.5 font-bold transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* Telemetry log Side panel */}
      <div className="lg:col-span-4 glassmorphism bg-white dark:bg-slate-900/40 p-5 rounded-[24px] border border-slate-200/50 dark:border-white/5 flex flex-col justify-between h-[calc(100vh-3rem)] shadow-sm">
        <div>
          <h4 className="text-xs font-bold uppercase text-brandSecondary tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-brandSecondary animate-pulse" />
            <span>Security Anti-Cheat Logs</span>
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-white/35 mb-4 font-medium">Integrity checks are logged in real-time. Flagged events persist to evaluations.</p>
          
          <div className="space-y-3.5 mb-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-white/60 font-semibold">Tab Switches:</span>
              <span className={`font-mono font-extrabold ${tabSwitches > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{tabSwitches}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-white/60 font-semibold">Fullscreen Exits:</span>
              <span className={`font-mono font-extrabold ${fullscreenExits > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{fullscreenExits}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-black/40 border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 flex-1 overflow-y-auto max-h-[300px] font-mono text-[9px] text-brandPrimary dark:text-brandSecondary space-y-1.5">
          {logs.length === 0 ? (
            <div className="text-slate-400 dark:text-white/20 text-center py-8 font-semibold">Integrity daemon running...</div>
          ) : (
            logs.map((l, i) => <div key={i}>{l}</div>)
          )}
        </div>

        <button
          onClick={onBack}
          className="mt-4 w-full py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-450 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
        >
          Forfeit Attempt
        </button>
      </div>

    </div>
  );
};

export default QuizEngine;
