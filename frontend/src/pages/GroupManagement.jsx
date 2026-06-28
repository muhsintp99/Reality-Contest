import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Milestone, Plus, Settings, ChevronRight, Layers, Users } from 'lucide-react';
import axios from 'axios';

export const GroupManagement = () => {
  const isMockMode = useSelector((state) => state.auth.isMockMode);
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [groups, setGroups] = useState([]);

  // Form state
  const [groupName, setGroupName] = useState('');
  const [maxPart, setMaxPart] = useState('100');

  const fetchContests = async () => {
    if (isMockMode) {
      setContests([
        { _id: 'ct-1', title: 'India Creator Showdown 2026' },
        { _id: 'ct-2', title: 'National Tech & AI Quiz Arena' }
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

  const fetchGroups = async (contestId) => {
    if (isMockMode) {
      setGroups([
        { _id: 'g-1', name: 'Group A (Mumbai Zone)', participants: [1, 2, 3, 4], maxParticipants: 100, stageSequence: [] },
        { _id: 'g-2', name: 'Group B (Bengaluru Zone)', participants: [1, 2], maxParticipants: 100, stageSequence: [] }
      ]);
      return;
    }
    try {
      // In our design, group is managed directly or via contest collections
      // Fetch groups from API
      // Since Group schema index requires contestId, we fetch by query
      const res = await axios.get(`/api/contests/${contestId}`, { withCredentials: true });
      // We can also have an explicit GET /api/groups or fetch details
      setGroups(res.data.groups || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContests();
  }, [isMockMode]);

  const handleSelectContest = (c) => {
    setSelectedContest(c);
    fetchGroups(c._id);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!selectedContest || !groupName) return;

    if (isMockMode) {
      setGroups(prev => [...prev, { _id: `g-${Date.now()}`, name: groupName, participants: [], maxParticipants: parseInt(maxPart), stageSequence: [] }]);
      setGroupName('');
      alert('Mock Group created.');
      return;
    }

    try {
      // We have route: POST /api/contests/:id/groups
      const res = await axios.post(`/api/contests/${selectedContest._id}/groups`, { name: groupName, maxParticipants: parseInt(maxPart) }, { withCredentials: true });
      if (res.data.success) {
        setGroupName('');
        alert('Group created successfully.');
        fetchGroups(selectedContest._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create group');
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-poppins text-white dark:text-white light:text-black">
            Syndicate Group Manager
          </h2>
          <p className="text-xs text-white/50">Allocate tournament cohorts and arrange stage sequence paths.</p>
        </div>
        {selectedContest && (
          <button
            onClick={() => setSelectedContest(null)}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white font-bold"
          >
            ← Change Contest
          </button>
        )}
      </div>

      {!selectedContest ? (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-brandPrimary tracking-wider">Select Contest to Arrange Groups</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contests.map(c => (
              <div
                key={c._id}
                onClick={() => handleSelectContest(c)}
                className="p-5 bg-white/5 border border-white/5 hover:border-brandPrimary/30 rounded-2xl cursor-pointer flex justify-between items-center group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary rounded-xl">
                    <Milestone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-brandPrimary transition-colors">{c.title}</h4>
                    <p className="text-[10px] text-white/40">Arrange sequence tracks</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-brandPrimary transition-colors" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Group Cohorts List */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-xs font-bold uppercase text-brandPrimary tracking-wider">
              Contest: {selectedContest.title} (Groups)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map(g => (
                <div key={g._id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between h-40">
                  <div>
                    <h4 className="text-xs font-bold text-white">{g.name}</h4>
                    <div className="flex gap-4 text-[10px] text-white/40 mt-2">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3 text-brandSecondary" /> {g.participants?.length || 0} Joined</span>
                      <span>Limit: {g.maxParticipants}</span>
                    </div>
                  </div>
                  <div className="border-t border-white/5 pt-3.5 flex justify-between items-center text-[10px] text-white/40">
                    <span>Stages Linked: {g.stageSequence?.length || 0}</span>
                    <button onClick={() => alert('Manage sequences for ' + g.name)} className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-white text-[10px] font-bold">
                      Set Sequence
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group Creator */}
          <form onSubmit={handleCreateGroup} className="lg:col-span-4 glassmorphism p-5 rounded-2xl border border-white/10 space-y-4 h-fit">
            <h3 className="text-xs font-bold uppercase text-white tracking-wider">New Group Blueprint</h3>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5">Group Cohort Name</label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group C (Online Track)"
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
            <button
              type="submit"
              className="w-full py-2 bg-brandPrimary hover:bg-brandPrimary/90 text-white text-xs font-bold rounded-xl shadow-lg transition-colors"
            >
              Add Group Cohort
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
export default GroupManagement;
