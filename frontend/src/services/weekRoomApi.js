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

  // 2. Fetch Single Room Details (includes header, members, tasks, analytics)
  getWeekRoomDetails: async (roomId) => {
    const response = await api.get(`/week/rooms/${roomId}`);
    return response.data;
  },

  // 3. Fetch Tasks directly for a room
  getRoomTasks: async (roomId) => {
    try {
      const response = await api.get(`/week/rooms/${roomId}/tasks`);
      return response.data;
    } catch (err) {
      const roomRes = await api.get(`/week/rooms/${roomId}`);
      return { success: true, data: roomRes.data?.data?.tasks || roomRes.data?.tasks || [] };
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

  // 6. Check Contestant Join Status / Join Action
  checkJoinStatus: async (roomId, contestId) => {
    const targetRoom = roomId || 'default';
    const targetContest = contestId || roomId;
    const response = await api.post(`/week/rooms/${targetRoom}/contests/${targetContest}/join`);
    return response.data;
  },

  // 7. Join Room / Contest (Canonical: /api/week/rooms/:roomId/contests/:contestId/join)
  joinContest: async (roomId, contestId) => {
    const targetRoom = roomId;
    const targetContest = contestId || roomId;
    const response = await api.post(`/week/rooms/${targetRoom}/contests/${targetContest}/join`);
    return response.data;
  },

  // 8. Start Contest / Task Attempt
  startContest: async (roomId, contestId) => {
    const response = await api.post(`/week/rooms/${roomId}/start/${contestId}`);
    return response.data;
  },

  // 9. Submit Task / Contest Proof & Answers (Canonical: /api/week/rooms/:roomId/submit/:contestId)
  submitContestTask: async (payload) => {
    const isFormData = payload instanceof FormData;
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' };
    const roomId = isFormData ? payload.get('roomId') : payload.roomId;
    const contestId = isFormData ? payload.get('contestId') : payload.contestId;
    const response = await api.post(`/week/rooms/${roomId}/submit/${contestId}`, payload, { headers });
    return response.data;
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

  // 13b. Fetch Current User's Submissions for this Room
  getMySubmissions: async (roomId) => {
    try {
      const targetRoom = roomId || 'default';
      const response = await api.get(`/week/rooms/${targetRoom}/submissions/my`);
      return response.data;
    } catch (err) {
      try {
        const fallback = await api.get('/week/rooms/submissions/my');
        return fallback.data;
      } catch (err2) {
        return { success: false, data: [] };
      }
    }
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
