import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Trophy, Plus, Settings, Sparkles, ShieldAlert, ArrowRight, Check, X } from 'lucide-react';
import axios from 'axios';

export const ContestManagement = () => {
  const { isMockMode } = useAuthStore();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [prize, setPrize] = useState('100000');
  const [regStart, setRegStart] = useState('2026-06-01');
  const [regEnd, setRegEnd] = useState('2026-06-30');
  const [tStart, setTStart] = useState('2026-07-01');
  const [tEnd, setTEnd] = useState('2026-07-15');
  const [fee, setFee] = useState('499');
  const [maxPart, setMaxPart] = useState('500');

  const fetchContests = async () => {
    if (isMockMode) {
      setContests([
        { _id: 'ct-1', title: 'India Creator Showdown 2026', entryFee: 499, prizePool: 1000000, status: 'Registration Open', startDate: '2026-07-01' },
        { _id: 'ct-2', title: 'National Tech & AI Quiz Arena', entryFee: 199, prizePool: 250000, status: 'Registration Open', startDate: '2026-07-05' }
      ]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get('/api/contests', { withCredentials: true });
      setContests(res.data.contests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, [isMockMode]);

  const handleCreateContest = async (e) => {
    e.preventDefault();
    if (!title) return;

    const data = {
      title,
      description: desc,
      prizePool: parseFloat(prize),
      registrationStart: new Date(regStart),
      registrationEnd: new Date(regEnd),
      startDate: new Date(tStart),
      endDate: new Date(tEnd),
      entryFee: parseFloat(fee),
      maxParticipants: parseInt(maxPart, 10),
      status: 'Registration Open'
    };

    if (isMockMode) {
      setContests(prev => [...prev, { _id: `ct-${Date.now()}`, ...data }]);
      setTitle('');
      setDesc('');
      alert('Mock contest created.');
      return;
    }

    try {
      const res = await axios.post('/api/contests', data, { withCredentials: true });
      if (res.data.success) {
        setTitle('');
        setDesc('');
        alert('Contest created successfully.');
        fetchContests();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create contest');
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div>
        <h2 className="text-xl font-bold font-poppins text-white dark:text-white light:text-black">
          Syndicate Contest Architect
        </h2>
        <p className="text-xs text-white/50 font-poppins">Admin tournament syndication, prize pool logistics, and registration periods.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contests List */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-xs font-bold uppercase text-brandPrimary tracking-wider">Active Platform Contests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contests.map(c => (
              <div key={c._id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between h-48 hover:border-brandPrimary/30 transition-all">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] bg-brandPrimary/15 border border-brandPrimary/25 text-brandPrimary px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                      {c.status}
                    </span>
                    <span className="text-[10px] text-white/40">Fee: ₹{c.entryFee}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{c.title}</h4>
                  <p className="text-[10px] text-white/40 mt-1.5">Prize Pool: <span className="text-brandSecondary font-bold">₹{c.prizePool.toLocaleString()}</span></p>
                </div>
                <div className="border-t border-white/5 pt-3.5 flex justify-between items-center text-[10px] text-white/40">
                  <span>Starts: {new Date(c.startDate).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <button onClick={() => alert('Manage settings for ' + c.title)} className="p-1.5 hover:bg-white/5 rounded-lg border border-white/10 text-white/60">
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Contest Form */}
        <form onSubmit={handleCreateContest} className="lg:col-span-4 glassmorphism p-5 rounded-2xl border border-white/10 space-y-4 h-fit">
          <h3 className="text-xs font-bold uppercase text-white tracking-wider">Syndicate New Tournament</h3>
          <div>
            <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Contest Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="National Reality Auditions"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Prize Pool (INR)</label>
            <input
              type="number"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Entry Fee</label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Max Participants</label>
              <input
                type="number"
                value={maxPart}
                onChange={(e) => setMaxPart(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Reg Start</label>
              <input
                type="date"
                value={regStart}
                onChange={(e) => setRegStart(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Reg End</label>
              <input
                type="date"
                value={regEnd}
                onChange={(e) => setRegEnd(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl shadow-lg transition-colors"
          >
            Launch Contest
          </button>
        </form>
      </div>
    </div>
  );
};
export default ContestManagement;
