import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Settings, Save, Clock, Users, Shield, Zap, Bell, Award, Check
} from 'lucide-react';
import axios from 'axios';
import { setSettings, setLoading } from '../../store/roomCycleSlice';
import { useAlert } from '../../context/AlertContext';

export const RoomCycleSettingsPage = () => {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { settings, loading } = useSelector((state) => state.roomCycle);

  const [formData, setFormData] = useState({
    cycleDurationDays: 3,
    maxMembersPerRoom: 50,
    pointRules: {
      referralBonus: 100,
      dailyActivityBonus: 50,
      achievementBonus: 200,
      roomLeaderBonus: 150
    },
    reviewRules: {
      autoApproveQuizzes: true,
      manualReviewDeadlineHours: 24,
      allowResubmission: true
    },
    leaderboardRules: {
      autoRefreshIntervalMinutes: 5,
      showTopMedals: true
    },
    automation: {
      autoStartCycle: true,
      autoEndCycle: true,
      autoDistributeRewards: true,
      sendNotifications: true
    }
  });

  const fetchSettings = async () => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get('/api/admin/room-cycle/settings');
      if (res.data?.success && res.data.data) {
        dispatch(setSettings(res.data.data));
        setFormData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/api/admin/room-cycle/settings', formData);
      if (res.data?.success) {
        showAlert('success', 'Room cycle settings saved successfully!');
        dispatch(setSettings(res.data.data));
      }
    } catch (err) {
      showAlert('error', 'Failed to save settings');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" /> Module Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure global cycle parameters, point calculation multipliers, review rules, and automation flags.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Cycle & Capacity Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" /> Cycle & Capacity Configuration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cycle Duration (Days)
              </label>
              <input
                type="number"
                min={1}
                value={formData.cycleDurationDays}
                onChange={(e) => setFormData({ ...formData, cycleDurationDays: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Max Members Per Room
              </label>
              <input
                type="number"
                min={1}
                value={formData.maxMembersPerRoom}
                onChange={(e) => setFormData({ ...formData, maxMembersPerRoom: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Point Rules */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" /> Point System Multipliers
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Referral Bonus</label>
              <input
                type="number"
                min={0}
                value={formData.pointRules?.referralBonus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pointRules: { ...formData.pointRules, referralBonus: Number(e.target.value) }
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Daily Bonus</label>
              <input
                type="number"
                min={0}
                value={formData.pointRules?.dailyActivityBonus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pointRules: { ...formData.pointRules, dailyActivityBonus: Number(e.target.value) }
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Achievement Bonus</label>
              <input
                type="number"
                min={0}
                value={formData.pointRules?.achievementBonus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pointRules: { ...formData.pointRules, achievementBonus: Number(e.target.value) }
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Room Leader Bonus</label>
              <input
                type="number"
                min={0}
                value={formData.pointRules?.roomLeaderBonus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pointRules: { ...formData.pointRules, roomLeaderBonus: Number(e.target.value) }
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Automation Toggles */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" /> Automation Triggers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={formData.automation?.autoStartCycle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    automation: { ...formData.automation, autoStartCycle: e.target.checked }
                  })
                }
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Auto-Start Cycles</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={formData.automation?.autoEndCycle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    automation: { ...formData.automation, autoEndCycle: e.target.checked }
                  })
                }
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Auto-End & Auto-Advance Cycles</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
          >
            <Save className="w-4 h-4" /> Save Module Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomCycleSettingsPage;
