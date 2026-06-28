import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWalletBalance } from '../store/authSlice';
import { Trophy, Milestone, Lock, Unlock, HelpCircle, ShieldCheck, Check, UploadCloud, Clock } from 'lucide-react';
import axios from 'axios';
import { QuizEngine } from './QuizEngine';

export const ParticipantContestPortal = () => {
  const dispatch = useDispatch();
  const { user, isMockMode } = useSelector((state) => state.auth);
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [stages, setStages] = useState([]);
  const [stageUnlockMap, setStageUnlockMap] = useState({});

  // Active Stage session (to load QuizEngine)
  const [activeAttemptStage, setActiveAttemptStage] = useState(null);

  // Acceptance Modal state
  const [rulesStage, setRulesStage] = useState(null);
  const [acceptedCheckbox, setAcceptedCheckbox] = useState(false);

  const fetchContests = async () => {
    if (isMockMode) {
      setContests([
        { _id: 'ct-1', title: 'India Creator Showdown 2026', entryFee: 499, prizePool: '10,00,000', status: 'Registration Open' },
        { _id: 'ct-2', title: 'National Tech & AI Quiz Arena', entryFee: 199, prizePool: '2,50,000', status: 'Registration Open' }
      ]);
      return;
    }
    try {
      const res = await axios.get('/api/contests', { withCredentials: true });
      setContests(res.data.contests || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContests();
  }, [isMockMode]);

  const handleRegister = async (c) => {
    if (user.walletBalance < c.entryFee) {
      alert('Insufficient wallet balance to register.');
      return;
    }

    if (isMockMode) {
      dispatch(updateWalletBalance(-c.entryFee));
      alert('Registered successfully in mock mode!');
      handleSelectContest(c);
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
    if (isMockMode) {
      const mockG = { _id: 'g-1', name: 'Group A (Qualifier)', participants: [user?.id] };
      setSelectedGroup(mockG);
      // Fetch mock stages
      const mockS = [
        { _id: 'st-1', name: 'Stage 1: GK Quiz Arena', type: 'Quiz', timeLimit: 300, passingPercentage: 60, rules: { rules: 'Strict anti-cheat in effect.', instructions: 'Answer all questions.', regulations: 'Fullscreen required.', attemptPolicy: '1 attempt allowed.', disqualificationPolicy: 'Tab switch = fail.' } },
        { _id: 'st-2', name: 'Stage 2: Video Pitch Deck', type: 'VideoUpload', timeLimit: 0, passingPercentage: 0, rules: { rules: 'Original content only.', instructions: 'Upload MP4.', regulations: 'Max size 50MB.', attemptPolicy: '1 attempt allowed.', disqualificationPolicy: 'Plagiarism = fail.' } }
      ];
      setStages(mockS);
      setStageUnlockMap({ 'st-1': true, 'st-2': false });
      return;
    }

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

    if (isMockMode) {
      setActiveAttemptStage(rulesStage);
      setRulesStage(null);
      return;
    }

    try {
      // Accept rules call
      const res = await axios.post(`/api/stages/${rulesStage._id}/accept-rules`, {
        deviceInfo: navigator.userAgent,
        browser: 'Google Chrome' // Direct send
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
          isMockMode={isMockMode}
          onBack={() => {
            setActiveAttemptStage(null);
            handleSelectContest(selectedContest);
          }}
        />
      );
    }
  }

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {!selectedContest ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold font-poppins text-white">Tournaments Portal</h2>
            <p className="text-xs text-white/50">Register for active contests, review stage rules, and monitor progression.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contests.map(c => (
              <div key={c._id} className="p-6 bg-white/5 border border-white/5 hover:border-brandPrimary/30 rounded-2xl flex flex-col justify-between h-48 transition-all">
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">{c.title}</h4>
                  <span className="text-[10px] bg-brandPrimary/15 border border-brandPrimary/25 text-brandPrimary px-2.5 py-0.5 rounded-full font-bold uppercase mb-2 inline-block">
                    Entry Fee: ₹{c.entryFee}
                  </span>
                  <p className="text-[10px] text-white/40 mt-2">Prize Pool: <span className="text-brandSecondary font-bold">₹{c.prizePool}</span></p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleRegister(c)}
                    className="flex-1 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Register Entry
                  </button>
                  <button
                    onClick={() => handleSelectContest(c)}
                    className="py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white"
                  >
                    Check Lobby
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold font-poppins text-white">{selectedContest.title}</h2>
              {selectedGroup ? (
                <p className="text-xs text-emerald-400 font-bold">Cohort: {selectedGroup.name}</p>
              ) : (
                <p className="text-xs text-red-400">Not registered in any cohort. Register entry first.</p>
              )}
            </div>
            <button
              onClick={() => setSelectedContest(null)}
              className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white"
            >
              ← Back to Portal
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-brandPrimary tracking-wider">Contest Stage Progression Path</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stages.map((s, index) => {
                const unlocked = stageUnlockMap[s._id];
                return (
                  <div key={s._id} className={`p-5 rounded-2xl border ${unlocked ? 'bg-white/5 border-emerald-500/20' : 'bg-black/35 border-white/5 opacity-65'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary px-2 py-0.5 rounded font-bold uppercase">
                        {s.type}
                      </span>
                      {unlocked ? (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold flex items-center gap-0.5">
                          <Unlock className="w-2.5 h-2.5" /> Unlocked
                        </span>
                      ) : (
                        <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white">Stage {index + 1}: {s.name}</h4>
                    <p className="text-[10px] text-white/40 mt-1">Passing requirement: {s.passingPercentage > 0 ? `${s.passingPercentage}%` : 'Judge approval'}</p>
                    
                    {unlocked && (
                      <button
                        onClick={() => handleEnterStage(s)}
                        className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                      >
                        Enter Stage
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Rules Acceptance Modal */}
      {rulesStage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glassmorphism max-w-lg w-full rounded-2xl border border-white/10 p-6 space-y-4 animate-scale-in text-white text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brandSecondary animate-pulse" />
                <span>Security Agreement Checklist</span>
              </h3>
              <button onClick={() => setRulesStage(null)} className="text-white/40 hover:text-white text-xs font-bold">X</button>
            </div>
            
            <div className="space-y-3.5 text-xs text-white/70 max-h-[300px] overflow-y-auto pr-2 divide-y divide-white/5">
              <div className="pt-2">
                <span className="font-bold text-brandPrimary block mb-1">Stage Rules & Guidelines:</span>
                <p>{rulesStage.rules?.rules || 'Strict guidelines apply. No external references.'}</p>
              </div>
              <div className="pt-3">
                <span className="font-bold text-brandPrimary block mb-1">Attempt Policy:</span>
                <p>{rulesStage.rules?.attemptPolicy || '1 attempt allowed.'}</p>
              </div>
              <div className="pt-3">
                <span className="font-bold text-brandPrimary block mb-1">Disqualification Warnings:</span>
                <p>{rulesStage.rules?.disqualificationPolicy || 'Tab switching or exiting full-screen mode will terminate user attempt instantly.'}</p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-4">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={acceptedCheckbox}
                  onChange={(e) => setAcceptedCheckbox(e.target.checked)}
                  className="mt-0.5 rounded border-white/10 accent-brandPrimary"
                />
                <span className="text-white/60">I accept all security requirements, screen terms, and consent to tab logs/IP tracking.</span>
              </label>

              <button
                onClick={handleAcceptRulesSubmit}
                disabled={!acceptedCheckbox}
                className="w-full py-2.5 bg-brandPrimary disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-brandPrimary/10"
              >
                Proceed to Stage Entrance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FileUploadStage = ({ stage, isMockMode, onBack }) => {
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

    if (isMockMode) {
      for (let p = 20; p <= 100; p += 20) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        setProgress(p);
      }
      setFileUrl(`https://storage.realitycontest.in/uploads/${Date.now()}_${file.name}`);
      setUploading(false);
      return;
    }

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

    if (isMockMode) {
      setSubmitted(true);
      alert('Submission recorded successfully in Sandbox!');
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
      <div className="glassmorphism p-8 rounded-2xl border border-emerald-500/20 text-center space-y-4 max-w-md mx-auto animate-scale-in text-white text-left">
        <Check className="w-12 h-12 text-emerald-400 mx-auto" />
        <h3 className="text-sm font-bold text-center">Submission Received!</h3>
        <p className="text-[11px] text-white/60 text-center">Your upload has been logged. Judges will review it against evaluation matrices shortly.</p>
        <button
          onClick={onBack}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold transition-all"
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  return (
    <div className="glassmorphism p-6 rounded-2xl border border-white/10 max-w-md mx-auto space-y-5 animate-scale-in text-white text-left">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase text-brandPrimary">{stage.type} Stage</h3>
          <h4 className="text-sm font-bold mt-1 text-white">{stage.name}</h4>
        </div>
        <button onClick={onBack} className="text-white/40 hover:text-white text-xs font-bold">← Back</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/*,image/*,application/pdf" />
        
        <div 
          onClick={handleSelectFile}
          className="border-2 border-dashed border-white/10 hover:border-brandPrimary/50 bg-black/20 rounded-xl p-8 text-center cursor-pointer transition-all space-y-2.5"
        >
          <UploadCloud className="w-10 h-10 text-white/30 mx-auto" />
          <div>
            <span className="text-xs text-brandPrimary font-semibold">Click to upload image or video file</span>
            <p className="text-[10px] text-white/40 mt-1">MP4, PNG, JPG or PDF up to 50MB</p>
          </div>
          {selectedFile && (
            <div className="text-xs bg-white/5 p-2 rounded-lg border border-white/5 font-semibold text-white/80 truncate">
              {selectedFile.name}
            </div>
          )}
        </div>

        {progress > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-white/50 font-mono">
              <span>{uploading ? 'Uploading...' : 'Upload Complete'}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div className="bg-brandPrimary h-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!fileUrl}
          className="w-full py-2.5 bg-brandPrimary disabled:opacity-40 hover:bg-brandPrimary/90 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
        >
          Submit Stage Presentation
        </button>
      </form>
    </div>
  );
};

export default ParticipantContestPortal;
