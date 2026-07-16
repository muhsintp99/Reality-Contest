import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWalletBalance } from '../store/authSlice';
import { Trophy, Milestone, Lock, Unlock, HelpCircle, ShieldCheck, Check, UploadCloud, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { QuizEngine } from './QuizEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../components/common/Badges';

export const ParticipantContestPortal = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [stages, setStages] = useState([]);
  const [stageUnlockMap, setStageUnlockMap] = useState({});

  // Active Stage session (to load QuizEngine)
  const [activeAttemptStage, setActiveAttemptStage] = useState(null);

  // Acceptance Modal state
  const [rulesStage, setRulesStage] = useState(null);
  const [acceptedCheckbox, setAcceptedCheckbox] = useState(false);

  const fetchContests = async () => {
    try {
      const res = await axios.get('/api/contests', { withCredentials: true });
      setContests(res.data.contests || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleRegister = async (c) => {
    if (user.walletBalance < c.entryFee) {
      alert('Insufficient wallet balance to register.');
      return;
    }

    try {
      const res = await axios.post(`/api/contests/${c._id}/join`, {}, { withCredentials: true });
      if (res.data.success) {
        alert('Joined contest successfully!');
        dispatch(updateWalletBalance(-c.entryFee));
        handleSelectContest(c);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join contest');
    }
  };

  const handleSelectContest = async (c) => {
    setSelectedContest(c);

    try {
      // Find which group contestant is in
      const res = await axios.get('/api/users/profile', { withCredentials: true });
      const profile = res.data.user;
      
      const contestDetail = await axios.get(`/api/contests/${c._id}`, { withCredentials: true });
      const userGroup = (contestDetail.data.groups || []).find((g) =>
        g.participants.some((pId) => pId.toString() === profile._id)
      );

      if (userGroup) {
        setSelectedGroup(userGroup);
        // Fetch stages
        const stagesRes = await axios.get(`/api/groups/${userGroup._id}/stages`, { withCredentials: true });
        const list = stagesRes.data.stages || [];
        setStages(list);

        // Fetch unlock statuses
        const unlockMap = {};
        for (const s of list) {
          const uRes = await axios.get(`/api/stages/${s._id}/unlock-status`, { withCredentials: true });
          unlockMap[s._id] = uRes.data.unlocked;
        }
        setStageUnlockMap(unlockMap);
      } else {
        setSelectedGroup(null);
        setStages([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnterStage = (stage) => {
    setRulesStage(stage);
    setAcceptedCheckbox(false);
  };

  const handleAcceptRulesSubmit = async () => {
    if (!acceptedCheckbox) return;

    try {
      const res = await axios.post(`/api/stages/${rulesStage._id}/accept-rules`, {
        deviceInfo: navigator.userAgent,
        browser: 'Google Chrome'
      }, { withCredentials: true });

      if (res.data.success) {
        setActiveAttemptStage(rulesStage);
        setRulesStage(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Rules agreement registration failed');
    }
  };

  if (activeAttemptStage) {
    if (activeAttemptStage.type === 'Quiz') {
      return (
        <QuizEngine
          stage={activeAttemptStage}
          onBack={() => {
            setActiveAttemptStage(null);
            handleSelectContest(selectedContest);
          }}
        />
      );
    } else {
      return (
        <FileUploadStage
          stage={activeAttemptStage}
          onBack={() => {
            setActiveAttemptStage(null);
            handleSelectContest(selectedContest);
          }}
        />
      );
    }
  }

  return (
    <div className="space-y-6 text-left pb-10">
      
      <AnimatePresence mode="wait">
        {!selectedContest ? (
          <motion.div 
            key="portal-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">Tournaments Portal</h2>
              <p className="text-xs text-slate-400 dark:text-white/40 mt-1">Register for active contests, review stage rules, and monitor progression.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contests.length > 0 ? (
                contests.map(c => (
                  <motion.div 
                    key={c._id} 
                    whileHover={{ y: -4 }}
                    className="glassmorphism bg-white dark:bg-slate-900/40 p-6 rounded-[24px] border border-slate-200/50 dark:border-white/5 shadow-premium hover-lift flex flex-col justify-between h-52 transition-all relative overflow-hidden group"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-brandPrimary dark:text-brandSecondary font-bold uppercase tracking-wider bg-brandPrimary/10 border border-brandPrimary/15 px-2.5 py-0.5 rounded-full">
                          LOBBY OPEN
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-lg">
                          ₹{c.entryFee} Entry Fee
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug group-hover:text-brandPrimary dark:group-hover:text-brandSecondary transition-colors">
                        {c.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-white/35 font-medium flex items-center gap-1">
                        Prize Pool: <span className="text-brandSecondary font-extrabold">₹{c.prizePool}</span>
                      </p>
                    </div>

                    <div className="flex gap-2.5 mt-5">
                      <button
                        onClick={() => handleRegister(c)}
                        className="flex-grow py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98]"
                      >
                        Register Entry
                      </button>
                      <button
                        onClick={() => handleSelectContest(c)}
                        className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-white transition-colors"
                      >
                        Check Lobby
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center glassmorphism bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-[24px] text-slate-400 dark:text-white/20 font-bold text-xs shadow-premium">
                  No active contests loaded.
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="portal-detail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-[#080b12]/10 p-5 rounded-[24px] border border-slate-200/50 dark:border-white/5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-805 dark:text-white tracking-tight">{selectedContest.title}</h2>
                {selectedGroup ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Registered Cohort: {selectedGroup.name}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <p className="text-xs text-rose-500">Not registered in any cohort. Register entry first.</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedContest(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Portal</span>
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-brandPrimary tracking-wider pl-1">Contest Stage Progression Path</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stages.map((s, index) => {
                  const unlocked = stageUnlockMap[s._id];
                  return (
                    <motion.div 
                      key={s._id} 
                      whileHover={unlocked ? { y: -3 } : {}}
                      className={`p-6 rounded-[24px] border flex flex-col justify-between h-52 shadow-premium transition-all ${
                        unlocked 
                          ? 'glassmorphism bg-white dark:bg-slate-900/40 border-slate-200/50 dark:border-emerald-500/20' 
                          : 'bg-slate-50 dark:bg-slate-950/20 border-slate-200/30 dark:border-white/2 opacity-60'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            {s.type}
                          </span>
                          {unlocked ? (
                            <Badge variant="secondary">
                              <Unlock className="w-2.5 h-2.5" /> Unlocked
                            </Badge>
                          ) : (
                            <Badge variant="neutral">
                              <Lock className="w-2.5 h-2.5" /> Locked
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">Stage {index + 1}: {s.name}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium">
                          Passing requirement: <span className="font-semibold text-slate-600 dark:text-white/60">{s.passingPercentage > 0 ? `${s.passingPercentage}%` : 'Judge approval'}</span>
                        </p>
                      </div>
                      
                      {unlocked ? (
                        <button
                          onClick={() => handleEnterStage(s)}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98]"
                        >
                          Enter Stage
                        </button>
                      ) : (
                        <div className="w-full text-center text-[10px] text-slate-400 font-semibold py-2 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/30 dark:border-white/5 select-none">
                          Locked Stage
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Acceptance Modal */}
      <AnimatePresence>
        {rulesStage && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-[24px] border border-slate-200/60 dark:border-white/10 p-6 space-y-4 shadow-2xl text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-slate-800 dark:text-white">
                  <ShieldCheck className="w-5 h-5 text-brandSecondary animate-pulse" />
                  <span>Security Agreement Checklist</span>
                </h3>
                <button onClick={() => setRulesStage(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold p-1">X</button>
              </div>
              
              <div className="space-y-4 text-xs text-slate-600 dark:text-white/70 max-h-[300px] overflow-y-auto pr-2 divide-y divide-slate-100 dark:divide-white/5">
                <div className="pt-2">
                  <span className="font-extrabold text-brandPrimary block mb-1">Stage Rules & Guidelines:</span>
                  <p className="leading-relaxed">{rulesStage.rules?.rules || 'Strict guidelines apply. No external references.'}</p>
                </div>
                <div className="pt-3">
                  <span className="font-extrabold text-brandPrimary block mb-1">Attempt Policy:</span>
                  <p className="leading-relaxed">{rulesStage.rules?.attemptPolicy || '1 attempt allowed.'}</p>
                </div>
                <div className="pt-3">
                  <span className="font-extrabold text-brandPrimary block mb-1">Disqualification Warnings:</span>
                  <p className="leading-relaxed text-rose-500 font-semibold">{rulesStage.rules?.disqualificationPolicy || 'Tab switching or exiting full-screen mode will terminate user attempt instantly.'}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-white/5 pt-4 space-y-4">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={acceptedCheckbox}
                    onChange={(e) => setAcceptedCheckbox(e.target.checked)}
                    className="mt-0.5 rounded border-slate-200 dark:border-white/10 accent-brandPrimary w-4 h-4 cursor-pointer"
                  />
                  <span className="text-slate-500 dark:text-white/60 font-semibold">I accept all security requirements, screen terms, and consent to tab logs/IP tracking.</span>
                </label>

                <button
                  onClick={handleAcceptRulesSubmit}
                  disabled={!acceptedCheckbox}
                  className="w-full py-2.5 bg-brandPrimary disabled:opacity-40 hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98]"
                >
                  Proceed to Stage Entrance
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FileUploadStage = ({ stage, onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setProgress(10);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (res.data.success) {
        setProgress(100);
        setFileUrl(res.data.fileUrl);
      }
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
      setSelectedFile(null);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileUrl) {
      alert('Please upload a file first.');
      return;
    }

    try {
      const res = await axios.post(`/api/stages/${stage._id}/submit`, {
        answers: { fileUrl }
      }, { withCredentials: true });
      if (res.data.success) {
        setSubmitted(true);
        alert('Submission sent successfully! Waiting for judge review.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  if (submitted) {
    return (
      <div className="glassmorphism p-8 rounded-[24px] border border-emerald-500/20 text-center space-y-4 max-w-md mx-auto animate-scale-in text-slate-800 dark:text-white bg-white/70 dark:bg-slate-900/40 shadow-premium">
        <Check className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="text-sm font-extrabold text-center">Submission Received!</h3>
        <p className="text-[11px] text-slate-500 dark:text-white/60 text-center">Your upload has been logged. Judges will review it against evaluation matrices shortly.</p>
        <button
          onClick={onBack}
          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-sm"
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  return (
    <div className="glassmorphism p-6 rounded-[24px] border border-slate-200/50 dark:border-white/5 max-w-md mx-auto space-y-5 animate-scale-in text-slate-800 dark:text-white bg-white/70 dark:bg-slate-900/40 shadow-premium">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
        <div>
          <h3 className="text-[10px] font-bold uppercase text-brandPrimary tracking-wider">{stage.type} Stage</h3>
          <h4 className="text-sm font-extrabold mt-1 text-slate-800 dark:text-white leading-tight">{stage.name}</h4>
        </div>
        <button onClick={onBack} className="text-slate-450 hover:text-slate-700 dark:hover:text-white text-xs font-bold p-1">← Back</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/*,image/*,application/pdf" />
        
        <div 
          onClick={handleSelectFile}
          className="border-2 border-dashed border-slate-200 hover:border-brandPrimary/50 dark:border-white/10 dark:hover:border-brandPrimary/30 bg-slate-50/50 dark:bg-black/10 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
        >
          <UploadCloud className="w-10 h-10 text-slate-400 dark:text-white/20 mx-auto" />
          <div>
            <span className="text-xs text-brandPrimary font-bold block">Click to upload image or video file</span>
            <p className="text-[10px] text-slate-400 dark:text-white/35 mt-1 font-medium">MP4, PNG, JPG or PDF up to 50MB</p>
          </div>
          {selectedFile && (
            <div className="text-[11px] bg-slate-100 dark:bg-white/5 p-2 rounded-lg border border-slate-200/50 dark:border-white/5 font-semibold text-slate-700 dark:text-white/80 truncate">
              {selectedFile.name}
            </div>
          )}
        </div>

        {progress > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-550 dark:text-white/50 font-mono">
              <span>{uploading ? 'Uploading...' : 'Upload Complete'}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div className="bg-brandPrimary h-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!fileUrl}
          className="w-full py-2.5 bg-brandPrimary disabled:opacity-40 hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98]"
        >
          Submit Stage Presentation
        </button>
      </form>
    </div>
  );
};

export default ParticipantContestPortal;
