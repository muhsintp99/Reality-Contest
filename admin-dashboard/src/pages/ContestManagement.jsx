import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Trophy, Plus, Settings, Sparkles, ShieldAlert, ArrowRight, Check, X, Save, Layers, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { RightDrawer } from '../components/RightDrawer';
import { MultiSelect } from '../components/MultiSelect';
import { useNavigate } from 'react-router-dom';

export const ContestManagement = () => {
  const { showAlert, showSnackbar, showConfirm } = useAlert();
  const isMockMode = useSelector((state) => state.auth.isMockMode);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // Fetched data
  const [categories, setCategories] = useState([]);

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
  const [selectedCategories, setSelectedCategories] = useState([]);

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
      let data = res.data.contests || [];
      data.sort((a, b) => new Date(b.createdAt || b._id).getTime() - new Date(a.createdAt || a._id).getTime());
      setContests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (isMockMode) {
      setCategories([
        { _id: 'cat-1', title: 'Knowledge' },
        { _id: 'cat-2', title: 'Arts' },
        { _id: 'cat-3', title: 'Gaming' }
      ]);
      return;
    }
    try {
      const res = await axios.get('/api/categories', { withCredentials: true });
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContests();
    fetchCategories();
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
      categories: selectedCategories,
      status: 'Registration Open'
    };

    if (isMockMode) {
      setContests(prev => [...prev, { _id: `ct-${Date.now()}`, ...data }]);
      setTitle('');
      setDesc('');
      setSelectedCategories([]);
      showSnackbar('Mock contest created.', 'success');
      setIsDrawerOpen(false);
      return;
    }

    try {
      const res = await axios.post('/api/contests', data, { withCredentials: true });
      if (res.data.success) {
        setTitle('');
        setDesc('');
        setSelectedCategories([]);
        showSnackbar('Contest created successfully.', 'success');
        setIsDrawerOpen(false);
        fetchContests();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to create contest', 'error');
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

      <div className="flex flex-col gap-6">
        {/* Contests List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase text-brandPrimary tracking-wider">Active Platform Contests</h3>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-4 py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-brandPrimary/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Syndicate Tournament
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <button onClick={() => navigate(`/admin-dashboard/contests/${c._id}`)} title="Manage Stages" className="p-1.5 bg-brandPrimary/10 hover:bg-brandPrimary/20 text-brandPrimary rounded-full transition-all">
                      <Layers className="w-4 h-4" />
                    </button>
                    <button onClick={() => showAlert('Edit settings for ' + c.title, 'info')} title="Edit Contest" className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full transition-all">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button onClick={() => showAlert('Delete ' + c.title, 'error')} title="Delete Contest" className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Contest Form */}
        <RightDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Syndicate New Tournament"
        >
        <form onSubmit={handleCreateContest} className="flex flex-col h-full">
          <div className="flex-1 space-y-6">
            <div>
              <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">General Information</div>
              <div className="space-y-4">
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
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Categories</label>
                  <MultiSelect
                    options={categories.map(c => ({ value: c._id, label: c.title }))}
                    value={selectedCategories}
                    onChange={setSelectedCategories}
                    placeholder="Select Categories..."
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Financials & Logistics</div>
              <div className="space-y-4">
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
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-brandPrimary uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Dates</div>
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
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-white/5">
            <button
              type="submit"
              className="w-full py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Launch Contest
            </button>
          </div>
        </form>
        </RightDrawer>
      </div>
    </div>
  );
};

export default ContestManagement;
