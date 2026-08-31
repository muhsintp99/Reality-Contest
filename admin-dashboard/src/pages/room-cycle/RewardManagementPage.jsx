import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Gift, Plus, Send, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { setRewards, setLoading } from '../../store/roomCycleSlice';
import { useAlert } from '../../context/AlertContext';
import { RightDrawer } from '../../components/RightDrawer';

export const RewardManagementPage = () => {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { rewards, loading } = useSelector((state) => state.roomCycle);

  const [isRewardDrawerOpen, setIsRewardDrawerOpen] = useState(false);
  const [rewardFormData, setRewardFormData] = useState({
    title: '',
    rewardType: 'Wallet Credit',
    amountOrValue: 500,
    couponCode: '',
    badgeName: '',
    certificateTemplate: '',
    targetScope: 'Top_User',
    minRank: 1,
    maxRank: 3
  });

  const fetchRewards = async () => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get('/api/admin/room-cycle/rewards');
      if (res.data?.success) {
        dispatch(setRewards(res.data.data));
      } else {
        dispatch(setRewards([]));
      }
    } catch (err) {
      console.error(err);
      dispatch(setRewards([]));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleCreateReward = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/room-cycle/rewards', rewardFormData);
      if (res.data?.success) {
        showAlert('success', 'Reward rule created!');
        setIsRewardDrawerOpen(false);
        fetchRewards();
      }
    } catch (err) {
      showAlert('error', 'Failed to create reward rule');
    }
  };

  const handleDistributeRewards = async () => {
    if (!window.confirm('Trigger distribution for all pending rewards?')) return;
    try {
      const res = await axios.post('/api/admin/room-cycle/rewards/distribute');
      if (res.data?.success) {
        showAlert('success', 'Rewards distribution completed!');
        fetchRewards();
      }
    } catch (err) {
      showAlert('error', 'Reward distribution failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reward Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure automated reward rules (Cash, Wallet Credit, Coupons, Badges, Certificates) for cycle rankers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDistributeRewards}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all"
          >
            <Send className="w-4 h-4" /> Distribute Pending Rewards
          </button>
          <button
            onClick={() => setIsRewardDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Add Reward Rule
          </button>
        </div>
      </div>

      {/* Rewards List Datatable */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading rewards...
          </div>
        ) : rewards.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Gift className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No reward rules created</p>
            <p className="text-xs mt-1">Click "Add Reward Rule" to define payout rules for winners.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Reward Title</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Value / Amount</th>
                  <th className="p-4">Target Scope</th>
                  <th className="p-4">Rank Tier</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {rewards.map((rw) => (
                  <tr key={rw._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{rw.title}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-full text-xs font-bold">
                        {rw.rewardType}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {rw.amountOrValue ? `₹${rw.amountOrValue}` : rw.couponCode || rw.badgeName || 'Custom'}
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{rw.targetScope}</td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      Rank #{rw.minRank} - #{rw.maxRank}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          rw.status === 'Distributed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {rw.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Reward Drawer */}
      <RightDrawer
        isOpen={isRewardDrawerOpen}
        onClose={() => setIsRewardDrawerOpen(false)}
        title="Create Reward Rule"
      >
        <form onSubmit={handleCreateReward} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rule Title</label>
            <input
              type="text"
              required
              value={rewardFormData.title}
              onChange={(e) => setRewardFormData({ ...rewardFormData, title: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              placeholder="e.g. Top 3 Cash Pool Bonus"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
              <select
                value={rewardFormData.rewardType}
                onChange={(e) => setRewardFormData({ ...rewardFormData, rewardType: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              >
                <option value="Cash">Cash</option>
                <option value="Wallet Credit">Wallet Credit</option>
                <option value="Coupons">Coupons</option>
                <option value="Badges">Badges</option>
                <option value="Certificates">Certificates</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Value / Amount</label>
              <input
                type="number"
                min={0}
                value={rewardFormData.amountOrValue}
                onChange={(e) => setRewardFormData({ ...rewardFormData, amountOrValue: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Min Rank</label>
              <input
                type="number"
                min={1}
                value={rewardFormData.minRank}
                onChange={(e) => setRewardFormData({ ...rewardFormData, minRank: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Rank</label>
              <input
                type="number"
                min={1}
                value={rewardFormData.maxRank}
                onChange={(e) => setRewardFormData({ ...rewardFormData, maxRank: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRewardDrawerOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
            >
              Save Rule
            </button>
          </div>
        </form>
      </RightDrawer>
    </div>
  );
};

export default RewardManagementPage;
