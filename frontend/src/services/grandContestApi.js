import api from '../lib/api';

/**
 * Service layer for Grand Contest Workflow API calls.
 * Production endpoints: /api/grand-contests (or /api/public/grand-contests)
 */
export const grandContestApi = {
  // 1. Fetch available Grand Contests
  getGrandContests: async (params = {}) => {
    try {
      const response = await api.get('/grand-contests', { params });
      return response.data;
    } catch (err) {
      const fallback = await api.get('/public/grand-contests', { params });
      return fallback.data;
    }
  },

  // 1b. Fetch Completed Grand Contests strictly using /grand-contests
  getCompletedGrandContests: async (params = {}) => {
    const response = await api.get('/grand-contests', {
      params: { ...params, status: 'Completed' }
    });
    return response.data;
  },

  // 2. Fetch Single Grand Contest Details (header, tasks, rules, prize pool)
  getGrandContestDetails: async (id) => {
    const response = await api.get(`/grand-contests/${id}`);
    return response.data;
  },

  // 3. Check Contestant Eligibility & Participation Status
  checkJoinStatus: async (id) => {
    try {
      const response = await api.get(`/grand-contests/${id}/check-status`);
      return response.data;
    } catch (err) {
      try {
        const response2 = await api.get(`/grand-contests/${id}/check-statuse`);
        return response2.data;
      } catch (err2) {
        const response3 = await api.get(`/grand-contests/${id}/join`);
        return response3.data;
      }
    }
  },

  // 4. Join Grand Contest (Strictly Cash ₹ from Wallet)
  joinGrandContest: async (id) => {
    const response = await api.post(`/grand-contests/${id}/join`, {});
    return response.data;
  },

  // 4b. Start Grand Contest Attempt
  startGrandContest: async (id, payload = {}) => {
    const response = await api.post(`/grand-contests/${id}/start`, payload);
    return response.data;
  },

  // 5. Fetch Connected Tasks for Grand Contest
  getGrandContestTasks: async (id) => {
    try {
      const response = await api.get(`/grand-contests/${id}/tasks`);
      return response.data;
    } catch (err) {
      const detail = await api.get(`/grand-contests/${id}`);
      return { success: true, data: detail.data?.tasks || [] };
    }
  },

  // 6. Submit Grand Contest Task Proof
  submitTaskProof: async (contestId, taskId, payload = {}) => {
    const isFormData = payload instanceof FormData;
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' };
    const body = isFormData ? payload : { ...payload, taskId: taskId || payload.taskId };

    const response = await api.post(`/grand-contests/${contestId}/submit`, body, { headers });
    return response.data;
  },

  // 7. Fetch Contestant's Submissions for this Grand Contest
  getSubmissions: async (contestId) => {
    const response = await api.get(`/grand-contests/${contestId}/submissions`);
    return response.data;
  },

  // 8. Fetch Grand Contest Analytics / Standings
  getAnalytics: async (contestId) => {
    const response = await api.get(`/grand-contests/${contestId}/analytics`);
    return response.data;
  }
};

export default grandContestApi;
