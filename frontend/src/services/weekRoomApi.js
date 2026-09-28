import api from '../lib/api';

/**
 * Service layer for Week Room Contest Workflow API calls.
 * Targets production API endpoints at https://api.hakalive.in with fallback handling.
 */
export const weekRoomApi = {
  // 1. Fetch available Week Rooms
  getWeekRooms: async (params = {}) => {
    const response = await api.get('/week/rooms', { params });
    return response.data;
  },

  // 2. Fetch Single Room Details (includes header, members, cycles, analytics)
  getWeekRoomDetails: async (roomId) => {
    const response = await api.get(`/week/rooms/${roomId}`);
    return response.data;
  },

  // 3. Fetch Room Cycles for a specific room
  getRoomCycles: async (roomId) => {
    const response = await api.get(`/week/rooms/${roomId}/cycles`);
    return response.data;
  },

  // 4. Fetch Cycle Details by ID
  getCycleDetails: async (cycleId) => {
    try {
      const response = await api.get(`/admin/room-cycle/cycles/${cycleId}`);
      return response.data;
    } catch (err) {
      const response = await api.get('/admin/room-cycle/cycles');
      const cycles = response.data?.data || response.data?.cycles || [];
      const found = cycles.find((c) => (c._id || c.id) === cycleId);
      return { success: true, data: found };
    }
  },

  // 5. Fetch Task Details by ID
  getTaskDetails: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data;
    } catch (err) {
      try {
        const response = await api.get(`/contests/${taskId}`);
        return response.data;
      } catch (err2) {
        const response = await api.get(`/stages/${taskId}`);
        return response.data;
      }
    }
  },

  // 6. Check Contestant Join Status
  checkJoinStatus: async (roomId, contestId) => {
    const targetRoom = roomId || 'default';
    const targetContest = contestId || roomId;
    try {
      const response = await api.get(`/v1/mobile/room-cycle/${targetRoom}/join/${targetContest}`);
      return response.data;
    } catch (err) {
      try {
        const response = await api.get(`/v1/mobile/room-cycle/join-status/${targetRoom}/${targetContest}`);
        return response.data;
      } catch (err2) {
        const response = await api.get(`/week/rooms/${targetRoom}/join/${targetContest}`);
        return response.data;
      }
    }
  },

  // 7. Join Room / Contest
  joinContest: async (roomId, contestId) => {
    const targetRoom = roomId;
    const targetContest = contestId || roomId;
    try {
      const response = await api.post(`/v1/mobile/room-cycle/${targetRoom}/join/${targetContest}`);
      return response.data;
    } catch (err) {
      try {
        const response = await api.post(`/week/rooms/${targetRoom}/join/${targetContest}`);
        return response.data;
      } catch (err2) {
        const response = await api.post('/v1/mobile/room-cycle/join', { roomId: targetRoom, contestId: targetContest });
        return response.data;
      }
    }
  },

  // 8. Start Contest / Task Attempt
  startContest: async (roomId, contestId) => {
    try {
      const response = await api.post(`/week/rooms/${roomId}/start/${contestId}`);
      return response.data;
    } catch (err) {
      try {
        const response = await api.post(`/stages/${contestId}/start`);
        return response.data;
      } catch (err2) {
        const response = await api.post(`/contests/${contestId}/join`);
        return response.data;
      }
    }
  },

  // 9. Submit Task / Contest Proof & Answers
  submitContestTask: async (payload) => {
    // Check if payload is FormData (for file uploads)
    const isFormData = payload instanceof FormData;
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' };

    try {
      const response = await api.post('/v1/mobile/room-cycle/submissions', payload, { headers });
      return response.data;
    } catch (err) {
      const roomId = isFormData ? payload.get('roomId') : payload.roomId;
      const contestId = isFormData ? payload.get('contestId') : payload.contestId;
      try {
        const response = await api.post(`/week/rooms/${roomId}/submit/${contestId}`, payload, { headers });
        return response.data;
      } catch (err2) {
        const taskId = isFormData ? payload.get('taskId') : payload.taskId;
        const response = await api.post(`/stages/${taskId}/submit`, payload, { headers });
        return response.data;
      }
    }
  },

  // 10. Fetch Room Leaderboard
  getLeaderboard: async (roomId, cycleId, scope = 'Room') => {
    const params = { scope };
    if (roomId) params.roomId = roomId;
    if (cycleId) params.cycleId = cycleId;

    const response = await api.get('/admin/room-cycle/leaderboard', { params });
    return response.data;
  },

  // 11. Recalculate Leaderboard (Admin action)
  recalculateLeaderboard: async (cycleId) => {
    const response = await api.post('/admin/room-cycle/leaderboard/recalculate', { cycleId });
    return response.data;
  },

  // 12. Fetch Room Rewards
  getRewards: async () => {
    const response = await api.get('/admin/room-cycle/rewards');
    return response.data;
  },

  // 13. Fetch Room Analytics
  getAnalytics: async () => {
    const response = await api.get('/admin/room-cycle/analytics');
    return response.data;
  },

  // 14. Fetch Admin Submissions (for review)
  getSubmissions: async (params = {}) => {
    const response = await api.get('/admin/room-cycle/submissions', { params });
    return response.data;
  },

  // 15. Admin Review Submission
  reviewSubmission: async (submissionId, reviewData) => {
    const response = await api.put(`/admin/room-cycle/submissions/${submissionId}/review`, reviewData);
    return response.data;
  }
};

export default weekRoomApi;
