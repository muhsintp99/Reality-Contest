import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, ArrowLeft, Clock, Calendar, CheckCircle2, ShieldCheck, 
  Award, Layers, FileText, Upload, Send, AlertCircle, RefreshCw, 
  Sparkles, Check, X, Eye, ExternalLink, HelpCircle
} from 'lucide-react';
import grandContestApi from '../../services/grandContestApi';

export const GrandContestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'rules' | 'submissions'

  // Join State
  const [isJoined, setIsJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');

  // Submit Task Modal State
  const [submittingTask, setSubmittingTask] = useState(null);
  const [submissionType, setSubmissionType] = useState('Text'); // 'Text' | 'Image' | 'Video' | 'Link'
  const [proofFile, setProofFile] = useState(null);
  const [proofText, setProofText] = useState('');
  const [proofLink, setProofLink] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchContestData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch details
      const res = await grandContestApi.getGrandContestDetails(id);
      const c = res.data?.contest || res.contest || res.data || res;
      setContest(c);

      // Extract tasks
      const taskList = c.tasks || c.taskIds || [];
      if (Array.isArray(taskList) && taskList.length > 0 && typeof taskList[0] === 'object') {
        setTasks(taskList);
      } else {
        // Fetch tasks separately
        try {
          const tRes = await grandContestApi.getGrandContestTasks(id);
          const tList = tRes.data?.tasks || tRes.tasks || tRes.data || [];
          setTasks(Array.isArray(tList) ? tList : []);
        } catch (tErr) {
          setTasks([]);
        }
      }

      // 2. Check Join Status
      try {
        const jRes = await grandContestApi.checkJoinStatus(id);
        const joined = jRes.isJoined || jRes.joined || jRes.hasJoined || jRes.data?.isJoined || false;
        setIsJoined(Boolean(joined));
      } catch (jErr) {
        setIsJoined(false);
      }

      // 3. Fetch Submissions
      try {
        const sRes = await grandContestApi.getSubmissions(id);
        const subList = sRes.data?.submissions || sRes.submissions || sRes.data || [];
        setSubmissions(Array.isArray(subList) ? subList : []);
      } catch (sErr) {
        setSubmissions([]);
      }
    } catch (err) {
      console.error('Error fetching grand contest details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContestData();
  }, [id]);

  const handleJoinContest = async () => {
    setJoining(true);
    setJoinMessage('');
    try {
      const res = await grandContestApi.joinGrandContest(id);
      if (res.success || res.joined || res.isJoined) {
        setIsJoined(true);
        setJoinMessage('🎉 Congratulations! You have successfully joined this Grand Tournament.');
      } else {
        setJoinMessage(res.message || 'Registration recorded');
        setIsJoined(true);
      }
      fetchContestData();
    } catch (err) {
      console.error('Join error:', err);
      setJoinMessage(err.response?.data?.message || err.message || 'Failed to join tournament. Please verify your cash wallet balance.');
    } finally {
      setJoining(false);
    }
  };

  const handleOpenSubmitModal = (task) => {
    setSubmittingTask(task);
    setProofText('');
    setProofFile(null);
    setProofLink('');
    setSubmitSuccess(false);
    setSubmissionType(task.submissionType || 'Text');
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!submittingTask) return;
    setSubmittingProof(true);

    try {
      let payload;
      if (proofFile) {
        payload = new FormData();
        payload.append('taskId', submittingTask._id || submittingTask.id);
        payload.append('submissionType', submissionType);
        payload.append('proofNotes', proofText);
        payload.append('mediaFile', proofFile);
      } else {
        payload = {
          taskId: submittingTask._id || submittingTask.id,
          submissionType,
          proofNotes: proofText,
          link: proofLink
        };
      }

      await grandContestApi.submitTaskProof(id, submittingTask._id || submittingTask.id, payload);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmittingTask(null);
        fetchContestData();
      }, 1500);
    } catch (err) {
      console.error('Submission error:', err);
      alert(err.response?.data?.message || err.message || 'Failed to submit proof.');
    } finally {
      setSubmittingProof(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-pulse">
        <div className="h-64 bg-slate-200 dark:bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-slate-200 dark:bg-white/5 rounded-2xl" />
          <div className="h-40 bg-slate-200 dark:bg-white/5 rounded-2xl" />
          <div className="h-40 bg-slate-200 dark:bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <div className="inline-flex p-4 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Tournament Unavailable</h3>
        <p className="text-xs text-slate-500">{error || 'Could not load tournament details'}</p>
        <button
          onClick={() => navigate('/grand-contests')}
          className="px-5 py-2.5 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow-lg"
        >
          Return to Tournaments
        </button>
      </div>
    );
  }

  const prize = Number(contest.prizePool || 0);
  const fee = Number(contest.entryFee || 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate('/grand-contests')}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200/60 dark:border-white/10 transition-all shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Grand Tournaments</span>
      </button>

      {/* Hero Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brandPrimary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold rounded-full tracking-wider uppercase">
                {contest.contestId || 'GNC-ELITE'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                contest.status === 'Active' || contest.status === 'Registration Open'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}>
                ● {contest.status || 'Active'}
              </span>
              {isJoined && (
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled Contestant
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black font-poppins tracking-tight text-white">
              {contest.title}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
              {contest.description || 'Welcome to this premier grand competitive challenge. Complete assigned milestones to climb the official leaderboard.'}
            </p>
          </div>

          {/* Registration / Join Action Box */}
          <div className="flex flex-col items-stretch lg:items-end gap-3 shrink-0 w-full lg:w-auto">
            {!isJoined ? (
              <div className="p-5 bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl space-y-3 text-center lg:text-right">
                <div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Entry Fee Required</span>
                  <span className="text-2xl font-black text-white">{fee === 0 ? 'FREE ENTRY' : `₹${fee} Cash INR`}</span>
                </div>
                <button
                  onClick={handleJoinContest}
                  disabled={joining}
                  className="w-full px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {joining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Join Tournament ({fee === 0 ? 'Free' : `Pay ₹${fee}`})</span>
                </button>
                <p className="text-[10px] text-slate-300">Deducted from Cash Wallet balance</p>
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center lg:text-right space-y-1">
                <span className="text-xs font-bold text-emerald-400 flex items-center justify-center lg:justify-end gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Active Registration
                </span>
                <p className="text-[11px] text-slate-300">You are eligible to attempt and submit tasks.</p>
              </div>
            )}
          </div>
        </div>

        {joinMessage && (
          <div className="mt-4 p-3 bg-white/10 border border-white/20 rounded-2xl text-xs text-white">
            {joinMessage}
          </div>
        )}
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glassmorphism p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Cash Prize Pool
          </span>
          <p className="text-xl font-black text-amber-500">₹{prize.toLocaleString()}</p>
        </div>

        <div className="glassmorphism p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-brandPrimary" /> Milestones & Tasks
          </span>
          <p className="text-xl font-black text-slate-800 dark:text-white">{tasks.length}</p>
        </div>

        <div className="glassmorphism p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" /> Duration
          </span>
          <p className="text-xl font-black text-slate-800 dark:text-white">{contest.durationDays || 30} Days</p>
        </div>

        <div className="glassmorphism p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-emerald-500" /> My Submissions
          </span>
          <p className="text-xl font-black text-emerald-500">{submissions.length}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/10 gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'tasks', label: `Tasks & Challenges (${tasks.length})`, icon: Layers },
          { id: 'rules', label: 'Tournament Rules & Guide', icon: ShieldCheck },
          { id: 'submissions', label: `My Submissions (${submissions.length})`, icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-brandPrimary text-brandPrimary dark:text-brandSecondary bg-brandPrimary/5 rounded-t-2xl'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {tasks.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200/80 dark:border-white/10 space-y-2">
              <Layers className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-white">No Connected Tasks Available</h4>
              <p className="text-xs text-slate-400">Tournament challenges will unlock once registration period commences.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task, idx) => {
                const taskId = task._id || task.id || idx;
                const submission = submissions.find((s) => (s.taskId?._id || s.taskId) === taskId);

                return (
                  <div
                    key={taskId}
                    className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 font-extrabold text-[11px] rounded-full uppercase">
                          Milestone #{task.order !== undefined ? task.order + 1 : idx + 1}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          submission?.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : submission?.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {submission ? `● ${submission.status}` : 'Pending Submission'}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-white font-poppins">
                        {task.title || `Grand Challenge ${idx + 1}`}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 font-medium leading-relaxed">
                        {task.description || task.instructions || 'Complete this task challenge according to tournament instructions.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                        <span>Submission Type</span>
                        <span className="text-slate-800 dark:text-white font-bold">{task.submissionType || 'Media / Proof'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                        <span>Points Award</span>
                        <span className="text-emerald-500 font-black">+{task.points || 100} Pts</span>
                      </div>

                      {isJoined ? (
                        <button
                          onClick={() => handleOpenSubmitModal(task)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brandPrimary text-white text-xs font-bold rounded-2xl shadow-md hover:bg-brandPrimary/90 transition-all cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>{submission ? 'Update Submission' : 'Submit Task Proof'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleJoinContest}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl transition-all cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Join Tournament to Unlock</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RULES */}
      {activeTab === 'rules' && (
        <div className="glassmorphism p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">
              Tournament Rules & Guidelines
            </h3>
            <p className="text-xs text-slate-400">Fair-play policy and grading criteria for Grand Contests.</p>
          </div>

          <div className="prose dark:prose-invert max-w-none text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {contest.rules || `1. Contestants must join using verified cash wallet balance.
2. Every task submission is evaluated by platform administrators and assigned scores accordingly.
3. Plagiarism or duplicate uploads will result in disqualification.
4. Top scorers on the final tournament standings claim the cash prize pool.`}
          </div>

          {contest.guidelines && (
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
              <h4 className="text-xs font-extrabold uppercase text-slate-400">Submission Guidelines:</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed font-medium">
                {contest.guidelines}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUBMISSIONS */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200/80 dark:border-white/10 space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-white">No Submissions Recorded</h4>
              <p className="text-xs text-slate-400">Select any connected task to submit your proof of completion.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submissions.map((sub, sIdx) => (
                <div
                  key={sub._id || sIdx}
                  className="p-5 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                      Task ID: {sub.taskId?._id || sub.taskId || 'Task'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      sub.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : sub.status === 'Rejected'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {sub.status || 'Pending'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {sub.proofNotes || 'Proof submitted for review.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <span>Score Awarded:</span>
                    <span className="font-bold text-emerald-500">{sub.score !== undefined && sub.score !== null ? `${sub.score} Pts` : 'Pending evaluation'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submission Modal */}
      {submittingTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Submit Task Proof
              </h3>
              <button
                onClick={() => setSubmittingTask(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{submittingTask.title}</h4>
              <p className="text-xs text-slate-400">{submittingTask.description || submittingTask.instructions}</p>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Upload Media / Proof File (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brandPrimary file:text-white hover:file:bg-brandPrimary/90 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Proof Link (Google Drive / GitHub / YouTube)
                </label>
                <input
                  type="url"
                  value={proofLink}
                  onChange={(e) => setProofLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Submission Notes / Explanations
                </label>
                <textarea
                  rows={3}
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Provide any details, notes or instructions for the reviewers..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary resize-none"
                />
              </div>

              {submitSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submission uploaded successfully!</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingTask(null)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProof || submitSuccess}
                  className="flex-1 py-2.5 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow-md hover:bg-brandPrimary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingProof ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Submit Proof</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrandContestDetails;
