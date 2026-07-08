import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  sessions: [],
  pendingKycs: [],
  currentKyc: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateWalletBalance: (state, action) => {
      if (state.user) {
        state.user.walletBalance += action.payload;
      }
    },
    // Login
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    loginFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Register
    registerRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state) => {
      state.loading = false;
    },
    registerFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Logout
    logoutRequest: (state) => {
      state.loading = true;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.sessions = [];
      state.currentKyc = null;
      state.loading = false;
    },
    logoutFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Send OTP (for password reset / register)
    sendOtpRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    sendOtpSuccess: (state) => {
      state.loading = false;
    },
    sendOtpFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Verify OTP
    verifyOtpRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    verifyOtpSuccess: (state, action) => {
      state.loading = false;
      if (state.user && state.user.id === action.payload.userId) {
        if (action.payload.type === 'email_verify') state.user.isEmailVerified = true;
        if (action.payload.type === 'phone_verify') state.user.isPhoneVerified = true;
      }
    },
    verifyOtpFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Forgot Password
    forgotPasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state) => {
      state.loading = false;
    },
    forgotPasswordFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Reset Password
    resetPasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    resetPasswordSuccess: (state) => {
      state.loading = false;
    },
    resetPasswordFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Load Current User
    loadCurrentUserRequest: (state) => {
      state.loading = true;
    },
    loadCurrentUserSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    loadCurrentUserFailure: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    // Update Profile
    updateProfileRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      state.loading = false;
    },
    updateProfileFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Update Avatar
    updateAvatarRequest: (state) => {
      state.loading = true;
    },
    updateAvatarSuccess: (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
      }
      state.loading = false;
    },
    updateAvatarFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // KYC
    uploadKycRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    uploadKycSuccess: (state, action) => {
      state.currentKyc = action.payload;
      if (state.user) {
        state.user.kycStatus = action.payload.status;
      }
      state.loading = false;
    },
    uploadKycFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    fetchKycStatusRequest: (state) => {
      state.loading = true;
    },
    fetchKycStatusSuccess: (state, action) => {
      state.currentKyc = action.payload;
      state.loading = false;
    },
    fetchKycStatusFailure: (state) => {
      state.loading = false;
    },
    // Sessions
    fetchSessionsRequest: (state) => {
      state.loading = true;
    },
    fetchSessionsSuccess: (state, action) => {
      state.sessions = action.payload;
      state.loading = false;
    },
    fetchSessionsFailure: (state) => {
      state.loading = false;
    },
    revokeSessionRequest: (state) => {
      state.loading = true;
    },
    revokeSessionSuccess: (state, action) => {
      state.sessions = state.sessions.filter(s => s._id !== action.payload);
      state.loading = false;
    },
    revokeSessionFailure: (state) => {
      state.loading = false;
    },
    logoutAllDevicesRequest: (state) => {
      state.loading = true;
    },
    logoutAllDevicesSuccess: (state) => {
      state.sessions = state.sessions.slice(0, 1);
      state.loading = false;
    },
    logoutAllDevicesFailure: (state) => {
      state.loading = false;
    },
    // Admin pending KYCs
    fetchPendingKycsRequest: (state) => {
      state.loading = true;
    },
    fetchPendingKycsSuccess: (state, action) => {
      state.pendingKycs = action.payload;
      state.loading = false;
    },
    fetchPendingKycsFailure: (state) => {
      state.loading = false;
    },
    reviewKycRequest: (state) => {
      state.loading = true;
    },
    reviewKycSuccess: (state) => {
      state.loading = false;
    },
    reviewKycFailure: (state) => {
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  updateWalletBalance,
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  logoutRequest,
  logoutSuccess,
  logoutFailure,
  sendOtpRequest,
  sendOtpSuccess,
  sendOtpFailure,
  verifyOtpRequest,
  verifyOtpSuccess,
  verifyOtpFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  loadCurrentUserRequest,
  loadCurrentUserSuccess,
  loadCurrentUserFailure,
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
  updateAvatarRequest,
  updateAvatarSuccess,
  updateAvatarFailure,
  uploadKycRequest,
  uploadKycSuccess,
  uploadKycFailure,
  fetchKycStatusRequest,
  fetchKycStatusSuccess,
  fetchKycStatusFailure,
  fetchSessionsRequest,
  fetchSessionsSuccess,
  fetchSessionsFailure,
  revokeSessionRequest,
  revokeSessionSuccess,
  revokeSessionFailure,
  logoutAllDevicesRequest,
  logoutAllDevicesSuccess,
  logoutAllDevicesFailure,
  fetchPendingKycsRequest,
  fetchPendingKycsSuccess,
  fetchPendingKycsFailure,
  reviewKycRequest,
  reviewKycSuccess,
  reviewKycFailure,
  clearError
} = authSlice.actions;

export default authSlice.reducer;
