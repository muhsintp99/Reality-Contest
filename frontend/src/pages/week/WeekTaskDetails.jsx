import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, ShieldAlert, Award, FileText, CheckCircle2, 
  Play, Sparkles, AlertCircle, RefreshCw, ChevronRight, HelpCircle
} from 'lucide-react';
import weekRoomApi from '../../services/weekRoomApi';

export const WeekTaskDetails = () => {
  const { roomId, cycleId, taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [contestId, setContestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Join status state machine: 'NOT_JOINED' | 'JOINING' | 'JOINED' | 'COMPLETED' | 'INELIGIBLE'
  const [joinState, setJoinState] = useState('NOT_JOINED');
  const [joinActionLoading, setJoinActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchTaskAndJoinStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Task Details
      const res = await weekRoomApi.getTaskDetails(taskId);
      const taskData = res.data || res.task || res.contest || res;
      setTask(taskData);

      // Resolve associated contestId
      const resolvedContestId = taskData.contestId || taskData.associatedContestId || taskData._id || taskId;
      setContestId(resolvedContestId);

      // 2. Check Join Status
      try {
        const joinRes = await weekRoomApi.checkJoinStatus(roomId, resolvedContestId);
        const isJoined = joinRes.isJoined || joinRes.joined || joinRes.hasJoined || joinRes.data?.isJoined;
        if (isJoined) {
          if (joinRes.data?.submissionStatus === 'Completed' || joinRes.data?.completed) {
            setJoinState('COMPLETED');
          } else {
            setJoinState('JOINED');
          }
        } else {
          setJoinState('NOT_JOINED');
        }
      } catch (jErr) {
        console.warn('Check join status fallback:', jErr);
        setJoinState('NOT_JOINED');
      }
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskAndJoinStatus();
  }, [roomId, cycleId, taskId]);

  const handleJoinContest = async () => {
    setJoinActionLoading(true);
    setStatusMessage('');
    try {
      const res = await weekRoomApi.joinContest(roomId, contestId);
      if (res.success || res.joined || res.isJoined) {
        setJoinState('JOINED');
        setStatusMessage('Successfully joined the contest! You may now start the task attempt.');
      } else {
        setStatusMessage(res.message || 'Join recorded');
        setJoinState('JOINED');
      }
    } catch (err) {
      console.error('Error joining contest:', err);
      setStatusMessage(err.response?.data?.message || err.message || 'Failed to join contest');
    } finally {
      setJoinActionLoading(false);
    }
  };

  const handleStartContest = async () => {
    setJoinActionLoading(true);
    try {
      await weekRoomApi.startContest(roomId, contestId);
      navigate(`/week/rooms/${roomId}/cycles/${cycleId}/tasks/${taskId}/contest/${contestId}`);
    } catch (err) {
      console.warn('Start contest response (proceeding to screen):', err);
      navigate(`/week/rooms/${roomId}/cycles/${cycleId}/tasks/${taskId}/contest/${contestId}`);
    } finally {
      setJoinActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-white/10 w-48 rounded-xl" />
        <div className="h-64 bg-slate-200 dark:bg-white/10 rounded-3xl w-full" />
        <div className="h-32 bg-slate-200 dark:bg-white/10 rounded-2xl w-full" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-4">
        <div className="inline-flex p-4 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Task Details Unavailable</h3>
        <p className="text-xs text-slate-500 dark:text-white/60">{error || 'Could not load task information'}</p>
        <button
          onClick={() => navigate(`/week/rooms/${roomId}/cycles/${cycleId}`)}
          className="px-5 py-2.5 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow-lg"
        >
          Return to Cycle
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/week/rooms/${roomId}/cycles/${cycleId}`)}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200/60 dark:border-white/10 transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Cycle Tasks</span>
      </button>

      {/* Task Header Card */}
      <div className="glassmorphism p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <span className="px-3.5 py-1 bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary text-xs font-extrabold rounded-full uppercase">
              {task.taskType || 'Milestone Task'}
            </span>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-extrabold rounded-full">
              {task.points || task.maxScore || 100} Points
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Duration: {task.duration ? `${task.duration} mins` : '30 mins'}</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-black font-poppins text-slate-900 dark:text-white">
            {task.title || 'Task Milestone Contest'}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
            {task.description || 'Complete the required milestone challenge, upload proof, and submit for evaluation.'}
          </p>
        </div>

        {/* Task Instructions */}
        {task.instructions && (
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brandPrimary" /> Instructions & Requirements:
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
              {task.instructions}
            </p>
          </div>
        )}

        {/* Status Notification Message */}
        {statusMessage && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Dynamic Action Buttons */}
        <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-medium text-slate-400">
            Status: <span className="font-bold text-slate-700 dark:text-white uppercase">{joinState.replace('_', ' ')}</span>
          </div>

          {joinState === 'NOT_JOINED' && (
            <button
              onClick={handleJoinContest}
              disabled={joinActionLoading}
              className="w-full sm:w-auto px-8 py-3.5 bg-brandPrimary text-white font-bold text-xs rounded-2xl shadow-lg hover:bg-brandPrimary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {joinActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Join Contest Task</span>
            </button>
          )}

          {joinState === 'JOINED' && (
            <button
              onClick={handleStartContest}
              disabled={joinActionLoading}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {joinActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Start Contest / Attempt</span>
            </button>
          )}

          {joinState === 'COMPLETED' && (
            <button
              onClick={() => navigate(`/week/rooms/${roomId}/cycles/${cycleId}/tasks/${taskId}/contest/${contestId}/result`)}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-bold text-xs rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>View Submitted Result</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeekTaskDetails;
