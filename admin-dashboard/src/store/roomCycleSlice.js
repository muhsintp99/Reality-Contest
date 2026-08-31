import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rooms: [],
  activeRoom: null,
  roomMembers: [],
  cycles: [],
  activeCycle: null,
  tasks: [],
  submissions: [],
  leaderboard: [],
  leaderboardScope: 'Room',
  rewards: [],
  analytics: null,
  settings: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    status: 'All',
    cycleId: 'All',
    taskType: 'All',
    roomId: 'All',
    page: 1,
    limit: 10
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  }
};

export const roomCycleSlice = createSlice({
  name: 'roomCycle',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setRooms: (state, action) => {
      state.rooms = action.payload.rooms || action.payload;
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
      state.loading = false;
    },
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload.room;
      state.roomMembers = action.payload.members || [];
      state.loading = false;
    },
    setCycles: (state, action) => {
      state.cycles = action.payload;
      state.activeCycle = action.payload.find((c) => c.status === 'Active') || action.payload[0] || null;
      state.loading = false;
    },
    setTasks: (state, action) => {
      state.tasks = action.payload.tasks || action.payload;
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
      state.loading = false;
    },
    setSubmissions: (state, action) => {
      state.submissions = action.payload.submissions || action.payload;
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
      state.loading = false;
    },
    setLeaderboard: (state, action) => {
      state.leaderboard = action.payload;
      state.loading = false;
    },
    setLeaderboardScope: (state, action) => {
      state.leaderboardScope = action.payload;
    },
    setRewards: (state, action) => {
      state.rewards = action.payload;
      state.loading = false;
    },
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
      state.loading = false;
    },
    setSettings: (state, action) => {
      state.settings = action.payload;
      state.loading = false;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    }
  }
});

export const {
  setLoading,
  setError,
  setRooms,
  setActiveRoom,
  setCycles,
  setTasks,
  setSubmissions,
  setLeaderboard,
  setLeaderboardScope,
  setRewards,
  setAnalytics,
  setSettings,
  setFilters,
  resetFilters
} = roomCycleSlice.actions;

export default roomCycleSlice.reducer;
