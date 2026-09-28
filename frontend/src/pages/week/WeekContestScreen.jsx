import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, ShieldAlert, Upload, FileText, CheckCircle2, 
  ArrowLeft, RefreshCw, Send, Image, Video, AlertCircle, X, Sparkles
} from 'lucide-react';
import weekRoomApi from '../../services/weekRoomApi';

export const WeekContestScreen = () => {
  const { roomId, cycleId, taskId, contestId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Timer State (30 mins default or task.duration)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(1800);
  
  // Submission Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [answersMap, setAnswersMap] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchTaskDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await weekRoomApi.getTaskDetails(taskId);
      const tData = res.data || res.task || res.contest || res;
      setTask(tData);

      const durationMins = tData.duration || 30;
      setTimeLeftSeconds(durationMins * 60);
    } catch (err) {
      console.error('Error loading contest test details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load task screen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [roomId, cycleId, taskId, contestId]);

  // Timer Countdown Effect
  useEffect(() => {
    if (timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeftSeconds]);

  const formatTimer = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? String(hours).padStart(2, '0') + ':' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreviewUrl(URL.createObjectURL(file));
      } else {
        setFilePreviewUrl('');
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreviewUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let payload;
      if (selectedFile) {
        payload = new FormData();
        payload.append('mediaFile', selectedFile);
        payload.append('roomId', roomId);
        payload.append('cycleId', cycleId);
        payload.append('taskId', taskId);
        payload.append('contestId', contestId);
        payload.append('submissionType', selectedFile.type.startsWith('image/') ? 'Image' : 'File');
        payload.append('proofNotes', proofNotes);
        payload.append('answers', JSON.stringify(answersMap));
      } else {
        payload = {
          roomId,
          cycleId,
          taskId,
          contestId,
          submissionType: 'Text',
          proofNotes,
          answers: answersMap
        };
      }

      const res = await weekRoomApi.submitContestTask(payload);
      if (res.success || res.data) {
        navigate(`/week/rooms/${roomId}/cycles/${cycleId}/tasks/${taskId}/contest/${contestId}/result`);
      } else {
        navigate(`/week/rooms/${roomId}/cycles/${cycleId}/tasks/${taskId}/contest/${contestId}/result`);
      }
    } catch (err) {
      console.error('Error submitting task proof:', err);
      // Fallback navigate to result screen if submission was noted
      navigate(`/week/rooms/${roomId}/cycles/${cycleId}/tasks/${taskId}/contest/${contestId}/result`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-pulse">
        <div className="h-16 bg-slate-200 dark:bg-white/10 rounded-2xl" />
        <div className="h-64 bg-slate-200 dark:bg-white/10 rounded-3xl" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-4">
        <div className="inline-flex p-4 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Unable to Start Test</h3>
        <p className="text-xs text-slate-500 dark:text-white/60">{error}</p>
        <button
          onClick={() => navigate(`/week/rooms/${roomId}/cycles/${cycleId}/tasks/${taskId}`)}
          className="px-5 py-2.5 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow-lg"
        >
          Return to Task Details
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Contest Top Navigation & Timer Bar */}
      <div className="sticky top-4 z-30 glassmorphism p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xl flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/week/rooms/${roomId}/cycles/${cycleId}/tasks/${taskId}`)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brandPrimary"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{task.title}</span>
        </div>

        {/* Live Timer Badge */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-black tracking-wider ${
          timeLeftSeconds < 300 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
        }`}>
          <Clock className="w-4 h-4" />
          <span>TIME REMAINING: {formatTimer(timeLeftSeconds)}</span>
        </div>
      </div>

      {/* Main Task / Test Participation Area */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Details Card */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-md space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-poppins">
            {task.title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {task.instructions || task.description || 'Please complete the milestone questions and upload proof of your work.'}
          </p>
        </div>

        {/* Questions Section (if available) */}
        {task.questions && Array.isArray(task.questions) && task.questions.length > 0 && (
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-md space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-poppins">
              Quiz Questions ({task.questions.length})
            </h3>
            {task.questions.map((q, qIdx) => (
              <div key={qIdx} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-3">
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  Q{qIdx + 1}. {q.question || q.text}
                </p>
                {q.options && Array.isArray(q.options) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => (
                      <label key={optIdx} className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold cursor-pointer hover:border-brandPrimary">
                        <input
                          type="radio"
                          name={`q_${qIdx}`}
                          value={opt}
                          onChange={(e) => setAnswersMap({ ...answersMap, [qIdx]: e.target.value })}
                          className="accent-brandPrimary"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Proof File Upload Drop Area */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-md space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-poppins flex items-center gap-2">
            <Upload className="w-4 h-4 text-brandPrimary" /> Upload Milestone Proof / Work
          </h3>

          {!selectedFile ? (
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-brandPrimary rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-white/5 transition-all text-center space-y-2">
              <Upload className="w-8 h-8 text-brandPrimary" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Click to select or drag & drop proof file
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Supports Image (JPG, PNG), Video (MP4), or Document (PDF)
              </span>
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/*,application/pdf"
              />
            </label>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {filePreviewUrl ? (
                  <img src={filePreviewUrl} alt="Proof Preview" className="w-12 h-12 object-cover rounded-xl shrink-0" />
                ) : (
                  <FileText className="w-8 h-8 text-brandPrimary shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Proof Notes Text Area */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-md space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-white block">
            Submission Notes / Comments
          </label>
          <textarea
            value={proofNotes}
            onChange={(e) => setProofNotes(e.target.value)}
            placeholder="Add any relevant proof description, links, or contestant notes..."
            className="w-full p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brandPrimary h-24"
          />
        </div>

        {/* Submit Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-brandPrimary text-white font-extrabold text-sm rounded-2xl shadow-xl hover:bg-brandPrimary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{submitting ? 'Submitting Task Proof...' : 'Submit Task for Evaluation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default WeekContestScreen;
