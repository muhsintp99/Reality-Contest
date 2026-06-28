import { create } from 'zustand';
import axios from 'axios';

// Configure default Axios parameters
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle token expiration and auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 TOKEN_EXPIRED and we haven't retried yet
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh-token endpoint
        await axios.post('/api/auth/refresh-token', {}, { withCredentials: true });
        
        isRefreshing = false;
        processQueue(null);
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        
        // If refresh fails, log out the user session
        if (typeof useAuthStore !== 'undefined' && useAuthStore.getState) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// In-Memory Fallback Mock Database
const mockDb = {
  users: [
    {
      id: 'mock-user-1',
      name: 'Raj Patel',
      username: 'rajpatel',
      email: 'raj.patel@realitycontest.in',
      phone: '+919876543210',
      role: 'Contestant',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj',
      isEmailVerified: true,
      isPhoneVerified: true,
      kycStatus: 'Pending',
      walletBalance: 25000,
    },
    {
      id: 'mock-user-2',
      name: 'Default Contestant',
      username: 'contestant',
      email: 'contestant@rcp.com',
      phone: '+919876543210',
      role: 'Contestant',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=contestant',
      isEmailVerified: true,
      isPhoneVerified: true,
      kycStatus: 'Approved',
      walletBalance: 10000,
    },
    {
      id: 'mock-user-3',
      name: 'Default Judge',
      username: 'judge',
      email: 'judge@rcp.com',
      phone: '+919876543211',
      role: 'Judge',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=judge',
      isEmailVerified: true,
      isPhoneVerified: true,
      kycStatus: 'Approved',
      walletBalance: 0,
    },
    {
      id: 'mock-user-4',
      name: 'Default Sponsor',
      username: 'sponsor',
      email: 'sponsor@rcp.com',
      phone: '+919876543212',
      role: 'Sponsor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sponsor',
      isEmailVerified: true,
      isPhoneVerified: true,
      kycStatus: 'Approved',
      walletBalance: 0,
    },
    {
      id: 'mock-user-5',
      name: 'Default Admin',
      username: 'admin',
      email: 'admin@rcp.com',
      phone: '+919876543213',
      role: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      isEmailVerified: true,
      isPhoneVerified: true,
      kycStatus: 'Approved',
      walletBalance: 0,
    },
    {
      id: 'mock-user-6',
      name: 'Default Super Admin',
      username: 'superadmin',
      email: 'superadmin@rcp.com',
      phone: '+919876543214',
      role: 'Super Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin',
      isEmailVerified: true,
      isPhoneVerified: true,
      kycStatus: 'Approved',
      walletBalance: 0,
    }
  ],
  sessions: [
    { _id: 'sess-1', device: 'Windows Desktop', browser: 'Google Chrome', ip: '192.168.1.15', createdAt: new Date().toISOString() },
    { _id: 'sess-2', device: 'iOS Mobile', browser: 'Apple Safari', ip: '103.44.52.12', createdAt: new Date(Date.now() - 3600000).toISOString() }
  ],
  kycRecords: [],
  otps: []
};

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  sessions: [],
  pendingKycs: [],
  currentKyc: null,
  loading: false,
  error: null,
  isMockMode: true, // Default to true for sandbox execution

  toggleMockMode: (val) => set({ isMockMode: val }),

  updateWalletBalance: (amount) => {
    const user = get().user;
    if (user) {
      const updatedUser = { ...user, walletBalance: user.walletBalance + amount };
      set({ user: updatedUser });
      if (get().isMockMode) {
        const idx = mockDb.users.findIndex(u => u.id === user.id);
        if (idx !== -1) mockDb.users[idx].walletBalance += amount;
      }
    }
  },

  // 1. LOGIN
  login: async (loginId, password, isOtpLogin = false, otp) => {
    set({ loading: true, error: null });
    
    if (!get().isMockMode) {
      try {
        const response = await api.post('/auth/login', { loginId, password, isOtpLogin, otp });
        set({ user: response.data.user, isAuthenticated: true, loading: false });
        return true;
      } catch (err) {
        set({ error: err.response?.data?.message || 'Login connection failed', loading: false });
        console.warn('Backend offline, running in mock mode');
        set({ isMockMode: true });
      }
    }

    // Mock
    await new Promise(resolve => setTimeout(resolve, 800));
    const normalizedId = loginId.toLowerCase();
    const matchedUser = mockDb.users.find(u => u.email.toLowerCase() === normalizedId || u.phone === loginId);

    if (!matchedUser) {
      set({ error: 'User credentials not found', loading: false });
      return false;
    }

    if (isOtpLogin) {
      const otpVerify = mockDb.otps.find(o => o.userId === matchedUser.id && o.otp === otp && o.type === 'login');
      if (!otpVerify) {
        set({ error: 'Incorrect verification OTP code', loading: false });
        return false;
      }
    } else if (password !== 'password' && password !== matchedUser.phone) {
      set({ error: 'Invalid password credentials (use "password")', loading: false });
      return false;
    }

    const newSession = {
      _id: `sess-${Date.now()}`,
      device: 'Chrome on Windows PC (Mock)',
      browser: 'Google Chrome',
      ip: '127.0.0.1',
      createdAt: new Date().toISOString()
    };
    mockDb.sessions.unshift(newSession);

    set({ user: matchedUser, isAuthenticated: true, sessions: mockDb.sessions, loading: false });
    return true;
  },

  // 2. REGISTER
  register: async (data) => {
    set({ loading: true, error: null });

    if (!get().isMockMode) {
      try {
        const response = await api.post('/auth/register', data);
        set({ loading: false });
        return response.data;
      } catch (err) {
        set({ error: err.response?.data?.message || 'Registration connection failed', loading: false });
        set({ isMockMode: true });
      }
    }

    // Mock
    await new Promise(resolve => setTimeout(resolve, 1000));
    const { name, username, email, phone, referralCode, dob, gender, state, district, country, favoriteCategories, skills, interests } = data;

    const emailExists = mockDb.users.some(u => u.email === email);
    if (emailExists) {
      set({ error: 'Email already exists', loading: false });
      throw new Error('Email exists');
    }

    const newUser = {
      id: `mock-user-${Date.now()}`,
      name,
      username,
      email,
      phone,
      role: 'Contestant',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      isEmailVerified: false,
      isPhoneVerified: false,
      kycStatus: 'Pending',
      walletBalance: referralCode ? 100 : 0,
      dob,
      gender,
      state,
      district,
      country,
      favoriteCategories: favoriteCategories || [],
      skills: skills || [],
      interests: interests || []
    };

    mockDb.users.push(newUser);
    
    const mockEmailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const mockPhoneOtp = Math.floor(100000 + Math.random() * 900000).toString();
    mockDb.otps.push({ userId: newUser.id, otp: mockEmailOtp, type: 'email_verify' });
    mockDb.otps.push({ userId: newUser.id, otp: mockPhoneOtp, type: 'phone_verify' });

    set({ loading: false });
    return {
      success: true,
      userId: newUser.id,
      mockOtps: { emailOtp: mockEmailOtp, phoneOtp: mockPhoneOtp }
    };
  },

  // 3. LOGOUT
  logout: async () => {
    set({ loading: true });
    if (!get().isMockMode) {
      try {
        await api.post('/auth/logout');
      } catch (err) {
        console.error(err);
      }
    }
    set({ user: null, isAuthenticated: false, sessions: [], currentKyc: null, loading: false });
  },

  // 4. SEND OTP
  sendOtp: async (loginId, type) => {
    if (!get().isMockMode) {
      try {
        const res = await api.post('/auth/send-otp', { loginId, type });
        return res.data.mockOtp;
      } catch (err) {
        console.error(err);
      }
    }

    const matched = mockDb.users.find(u => u.email === loginId || u.phone === loginId);
    const userId = matched ? matched.id : 'temp-otp-id';
    const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
    mockDb.otps.push({ userId, otp: otpValue, type });
    return otpValue;
  },

  // 5. VERIFY OTP
  verifyOtp: async (userId, otp, type) => {
    if (!get().isMockMode) {
      try {
        await api.post('/auth/verify-otp', { userId, otp, type });
        if (get().user && get().user?.id === userId) {
          await get().loadCurrentUser();
        }
        return true;
      } catch (err) {
        return false;
      }
    }

    const idx = mockDb.otps.findIndex(o => o.userId === userId && o.otp === otp && o.type === type);
    if (idx === -1) return false;

    mockDb.otps.splice(idx, 1);
    
    const uIdx = mockDb.users.findIndex(u => u.id === userId);
    if (uIdx !== -1) {
      if (type === 'email_verify') mockDb.users[uIdx].isEmailVerified = true;
      if (type === 'phone_verify') mockDb.users[uIdx].isPhoneVerified = true;
      
      const sessionUser = get().user;
      if (sessionUser && sessionUser.id === userId) {
        set({ user: { ...mockDb.users[uIdx] } });
      }
    }
    return true;
  },

  // 6. FORGOT PASSWORD
  forgotPassword: async (email) => {
    if (!get().isMockMode) {
      try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Connection failed');
      }
    }

    const matched = mockDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const val = Math.floor(100000 + Math.random() * 900000).toString();
    if (matched) {
      mockDb.otps.push({ userId: matched.id, otp: val, type: 'reset_password' });
    }
    return { success: true, userId: matched ? matched.id : 'dummy', mockOtp: val };
  },

  // 7. RESET PASSWORD
  resetPassword: async (data) => {
    if (!get().isMockMode) {
      try {
        await api.post('/auth/reset-password', data);
        return true;
      } catch (err) {
        return false;
      }
    }
    return true;
  },

  // 8. UPDATE PROFILE
  updateProfile: async (data) => {
    const userObj = get().user;
    if (!userObj) return false;

    if (!get().isMockMode) {
      try {
        const res = await api.put('/users/profile', data);
        set({ user: res.data.user });
        return true;
      } catch (err) {
        return false;
      }
    }

    const idx = mockDb.users.findIndex(u => u.id === userObj.id);
    if (idx !== -1) {
      mockDb.users[idx] = { ...mockDb.users[idx], ...data };
      set({ user: mockDb.users[idx] });
    }
    return true;
  },

  // 9. UPDATE AVATAR
  updateAvatar: async (avatarUrl) => {
    const userObj = get().user;
    if (!userObj) return false;

    if (!get().isMockMode) {
      try {
        const res = await api.put('/users/avatar', { avatar: avatarUrl });
        set({ user: res.data.user });
        return true;
      } catch (err) {
        return false;
      }
    }

    const idx = mockDb.users.findIndex(u => u.id === userObj.id);
    if (idx !== -1) {
      mockDb.users[idx].avatar = avatarUrl;
      set({ user: { ...mockDb.users[idx] } });
    }
    return true;
  },

  // 10. UPLOAD KYC
  uploadKyc: async (data) => {
    const userObj = get().user;
    if (!userObj) return false;

    if (!get().isMockMode) {
      try {
        await api.post('/kyc/upload', data);
        await get().fetchKycStatus();
        await get().loadCurrentUser();
        return true;
      } catch (err) {
        return false;
      }
    }

    const score = Math.floor(78 + Math.random() * 21);
    const newKyc = {
      userId: userObj.id,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      documentFrontUrl: data.documentFrontUrl,
      selfieUrl: data.selfieUrl,
      livenessScore: score,
      status: 'Under Review',
      aiMatchResult: score >= 85 ? 'PASSED' : 'REVIEW_REQUIRED'
    };

    mockDb.kycRecords = mockDb.kycRecords.filter(k => k.userId !== userObj.id);
    mockDb.kycRecords.push(newKyc);

    const uIdx = mockDb.users.findIndex(u => u.id === userObj.id);
    if (uIdx !== -1) {
      mockDb.users[uIdx].kycStatus = 'Under Review';
      set({ user: { ...mockDb.users[uIdx] } });
    }

    set({ currentKyc: newKyc });
    return true;
  },

  // 11. FETCH KYC STATUS
  fetchKycStatus: async () => {
    const userObj = get().user;
    if (!userObj) return;

    if (!get().isMockMode) {
      try {
        const res = await api.get('/kyc/status');
        set({ currentKyc: res.data.kyc || null });
        return;
      } catch (err) {
        console.error(err);
      }
    }

    const record = mockDb.kycRecords.find(k => k.userId === userObj.id);
    set({ currentKyc: record || null });
  },

  // 12. FETCH SESSIONS
  fetchSessions: async () => {
    if (!get().isMockMode) {
      try {
        const res = await api.get('/users/sessions');
        set({ sessions: res.data.sessions });
        return;
      } catch (err) {
        console.error(err);
      }
    }
    set({ sessions: mockDb.sessions });
  },

  // 13. REVOKE SESSION
  revokeSession: async (sessionId) => {
    if (!get().isMockMode) {
      try {
        await api.delete(`/users/sessions/${sessionId}`);
        await get().fetchSessions();
        return true;
      } catch (err) {
        return false;
      }
    }

    mockDb.sessions = mockDb.sessions.filter(s => s._id !== sessionId);
    set({ sessions: mockDb.sessions });
    return true;
  },

  // 14. LOGOUT OTHER DEVICES
  logoutAllDevices: async () => {
    if (!get().isMockMode) {
      try {
        await api.delete('/users/sessions/all');
        await get().fetchSessions();
        return true;
      } catch (err) {
        return false;
      }
    }

    mockDb.sessions = mockDb.sessions.slice(0, 1);
    set({ sessions: mockDb.sessions });
    return true;
  },

  // 15. ADMIN: FETCH PENDING KYCS
  fetchPendingKycs: async () => {
    if (!get().isMockMode) {
      try {
        const res = await api.get('/kyc/pending');
        set({ pendingKycs: res.data.kycs });
        return;
      } catch (err) {
        console.error(err);
      }
    }

    const list = mockDb.kycRecords
      .filter(k => k.status === 'Under Review')
      .map(k => {
        const matchUser = mockDb.users.find(u => u.id === k.userId);
        return {
          ...k,
          userDetail: matchUser ? { name: matchUser.name, email: matchUser.email, phone: matchUser.phone } : undefined
        };
      });
    set({ pendingKycs: list });
  },

  // 16. ADMIN: REVIEW KYC
  reviewKyc: async (kycId, status, reason) => {
    if (!get().isMockMode) {
      try {
        await api.put('/kyc/review', { kycId, status, rejectionReason: reason });
        await get().fetchPendingKycs();
        return true;
      } catch (err) {
        return false;
      }
    }

    const kycRecord = mockDb.kycRecords.find(k => k.userId === kycId || k._id === kycId);
    if (kycRecord) {
      kycRecord.status = status;
      kycRecord.rejectionReason = reason;
      
      const uIdx = mockDb.users.findIndex(u => u.id === kycRecord.userId);
      if (uIdx !== -1) {
        mockDb.users[uIdx].kycStatus = status;
      }

      if (get().user && get().user.id === kycRecord.userId) {
        set({ user: { ...mockDb.users[uIdx] } });
      }
    }

    await get().fetchPendingKycs();
    return true;
  },

  // 17. LOAD ME
  loadCurrentUser: async () => {
    if (!get().isMockMode) {
      try {
        const res = await api.get('/auth/me');
        set({ user: res.data.user, isAuthenticated: true });
        return;
      } catch (err) {
        set({ isAuthenticated: false, user: null });
      }
    }
  }
}));
export default useAuthStore;
