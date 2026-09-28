import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Layers, CheckCircle2, Clock, ShieldAlert, Award, 
  ChevronRight, Play, FileText, Check, Lock, Sparkles
} from 'lucide-react';
import weekRoomApi from '../../services/weekRoomApi';

export const WeekCycleDetails = () => {
  const { roomId, cycleId } = useParams();
  const navigate = useNavigate();

  const [cycle, setCycle] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCycleData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Cycle
      const cycleRes = await weekRoomApi.getCycleDetails(cycleId);
      const cycleObj = cycleRes.data || cycleRes.cycle || cycleRes;
      setCycle(cycleObj);

      // 2. Fetch Tasks inside the cycle
      const taskIds = cycleObj?.taskIds || cycleObj?.tasks || [];
      const loadedTasks = [];

      if (Array.isArray(taskIds) && taskIds.length > 0) {
        for (const tid of taskIds) {
          const tIdStr = typeof tid === 'object' ? (tid._id || tid.id) : tid;
          try {
            const taskRes = await weekRoomApi.getTaskDetails(tIdStr);
            if (taskRes && (taskRes.data || taskRes.task || taskRes.contest)) {
              loadedTasks.push(taskRes.data || taskRes.task || taskRes.contest);
            }
          } catch (tErr) {
            console.warn(`Failed loading task ${tIdStr}:`, tErr);
          }
        }
      }

      // If no task IDs found in cycle doc, fetch room cycles to locate task details
      if (loadedTasks.length === 0) {
        const roomCyclesRes = await weekRoomApi.getRoomCycles(roomId);
        const cycleList = roomCyclesRes.cycles || roomCyclesRes.data || [];
        const found = cycleList.find((c) => (c._id || c.id) === cycleId);
        if (found) {
          setCycle(found);
          if (found.taskIds && Array.isArray(found.taskIds)) {
            for (const tid of found.taskIds) {
              const tIdStr = typeof tid === 'object' ? (tid._id || tid.id) : tid;
              try {
                const taskRes = await weekRoomApi.getTaskDetails(tIdStr);
                if (taskRes && (taskRes.data || taskRes.task)) {
                  loadedTasks.push(taskRes.data || taskRes.task);
                }
              } catch (e) {}
            }
          }
        }
      }

      // Fallback placeholder tasks if cycle has no explicitly linked tasks yet
      if (loadedTasks.length === 0) {
        loadedTasks.push(
          { _id: 'task_001', title: 'Milestone 1: Proof of Skill Upload', taskType: 'File', points: 100, duration: 30, status: 'Active' },
          { _id: 'task_002', title: 'Milestone 2: Bi-Weekly Contest Quiz', taskType: 'Quiz', points: 150, duration: 20, status: 'Active' },
          { _id: 'task_003', title: 'Milestone 3: Creator Video Submission', taskType: 'Video', points: 200, duration: 45, status: 'Active' }
        );
      }

      setTasks(loadedTasks);
    } catch (err) {
      console.error('Error fetching cycle details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load cycle details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycleData();
  }, [roomId, cycleId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-white/10 w-48 rounded-xl" />
        <div className="h-48 bg-slate-200 dark:bg-white/10 rounded-3xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-200 dark:bg-white/10 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !cycle) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-4">
        <div className="inline-flex p-4 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Cycle Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-white/60">{error || 'Cycle information unavailable'}</p>
        <button
          onClick={() => navigate(`/week/rooms/${roomId}`)}
          className="px-5 py-2.5 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow-lg"
        >
          Return to Room
        </button>
      </div>
    );
  }

  const cycleNum = cycle.cycleNumber || 1;
  const status = cycle.status || 'Active';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/week/rooms/${roomId}`)}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200/60 dark:border-white/10 transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Room Overview</span>
      </button>

      {/* Cycle Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3.5 py-1 bg-brandPrimary/20 border border-brandPrimary/30 text-brandPrimary font-extrabold text-xs rounded-full uppercase tracking-wider">
              Cycle #{cycleNum}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
              status === 'Active' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              ● {status}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black font-poppins tracking-tight text-white">
            {cycle.title || `Bi-Weekly Milestone Cycle ${cycleNum}`}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
            {cycle.description || 'Complete all milestone tasks inside this cycle to accumulate leaderboard points and qualify for room tier rewards.'}
          </p>

          {cycle.rules && (
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 max-w-2xl space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Cycle Rules:</span>
              <p className="text-xs text-slate-200 font-medium">{cycle.rules}</p>
            </div>
          )}
        </div>
      </div>

      {/* Cycle Tasks Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-poppins">
              Cycle Tasks & Milestones ({tasks.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select a task below to view instructions, join the contest, and submit proof.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task, idx) => {
            const taskId = task._id || task.id || `task_${idx}`;
            const contestId = task.contestId || task.associatedContestId || taskId;

            return (
              <div
                key={taskId}
                className="group relative bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 hover:border-brandPrimary/50 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                      Task #{idx + 1} • {task.taskType || 'Standard'}
                    </span>
                    <span className="text-xs font-black text-brandPrimary dark:text-brandSecondary">
                      {task.points || task.maxScore || 100} pts
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 dark:text-white font-poppins group-hover:text-brandPrimary transition-colors">
                    {task.title || `Task Milestone ${idx + 1}`}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                    {task.description || task.instructions || 'Review requirements and submit proof of completion to qualify for points.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 pt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{task.duration ? `${task.duration} mins` : '30 mins'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Proof: {task.submissionType || 'Media Upload'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => navigate(`/week/rooms/${roomId}/cycles/${cycleId}/tasks/${taskId}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brandPrimary text-white text-xs font-bold rounded-2xl shadow-md hover:bg-brandPrimary/90 transition-all"
                  >
                    <span>Select Task / Contest</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekCycleDetails;
