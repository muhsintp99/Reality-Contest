import { call, put, select, takeLatest, delay } from 'redux-saga/effects';
import axios from 'axios';
import {
  loginRequest, loginSuccess, loginFailure,
  registerRequest, registerSuccess, registerFailure,
  logoutRequest, logoutSuccess, logoutFailure,
  sendOtpRequest, sendOtpSuccess, sendOtpFailure,
  verifyOtpRequest, verifyOtpSuccess, verifyOtpFailure,
  forgotPasswordRequest, forgotPasswordSuccess, forgotPasswordFailure,
  resetPasswordRequest, resetPasswordSuccess, resetPasswordFailure,
  loadCurrentUserRequest, loadCurrentUserSuccess, loadCurrentUserFailure,
  updateProfileRequest, updateProfileSuccess, updateProfileFailure,
  updateAvatarRequest, updateAvatarSuccess, updateAvatarFailure,
  uploadKycRequest, uploadKycSuccess, uploadKycFailure,
  fetchKycStatusRequest, fetchKycStatusSuccess, fetchKycStatusFailure,
  fetchSessionsRequest, fetchSessionsSuccess, fetchSessionsFailure,
  revokeSessionRequest, revokeSessionSuccess, revokeSessionFailure,
  logoutAllDevicesRequest, logoutAllDevicesSuccess, logoutAllDevicesFailure,
  fetchPendingKycsRequest, fetchPendingKycsSuccess, fetchPendingKycsFailure,
  reviewKycRequest, reviewKycSuccess, reviewKycFailure,
  toggleMockMode
} from './authSlice';

// Axios Instance
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

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
      dob: '2000-01-01',
      gender: 'Male',
      state: 'Maharashtra',
      district: 'Mumbai',
      country: 'India',
      favoriteCategories: ['Arts', 'Science'],
      skills: ['Coding'],
      interests: ['Indie SaaS']
    }
  ],
  sessions: [
    { _id: 'sess-1', device: 'Windows Desktop', browser: 'Google Chrome', ip: '192.168.1.15', createdAt: new Date().toISOString() },
    { _id: 'sess-2', device: 'iOS Mobile', browser: 'Apple Safari', ip: '103.44.52.12', createdAt: new Date(Date.now() - 3600000).toISOString() }
  ],
  kycRecords: [],
  otps: []
};

// Selectors
const selectIsMockMode = (state) => state.auth.isMockMode;
const selectUser = (state) => state.auth.user;

// 1. LOGIN SAGA
function* handleLogin(action) {
  const { loginId, password, isOtpLogin, otp, callback } = action.payload;
  const isMockMode = yield select(selectIsMockMode);

  if (!isMockMode) {
    try {
      const response = yield call(api.post, '/auth/login', { loginId, password, isOtpLogin, otp });
      yield put(loginSuccess(response.data.user));
      if (callback) callback(true);
      return;
    } catch (err) {
      console.warn('Backend offline, running in mock mode');
      yield put(toggleMockMode(true));
    }
  }

  // Mock
  yield delay(800);
  const normalizedId = loginId.toLowerCase();
  const matchedUser = mockDb.users.find(u => u.email.toLowerCase() === normalizedId || u.phone === loginId);

  if (!matchedUser) {
    yield put(loginFailure('User credentials not found'));
    if (callback) callback(false);
    return;
  }

  if (isOtpLogin) {
    const otpVerify = mockDb.otps.find(o => o.userId === matchedUser.id && o.otp === otp && o.type === 'login');
    if (!otpVerify) {
      yield put(loginFailure('Incorrect verification OTP code'));
      if (callback) callback(false);
      return;
    }
  } else if (password !== 'password' && password !== 'password123' && password !== matchedUser.phone) {
    yield put(loginFailure('Invalid password credentials (use "password123")'));
    if (callback) callback(false);
    return;
  }

  const newSession = {
    _id: `sess-${Date.now()}`,
    device: 'Chrome on Windows PC (Mock)',
    browser: 'Google Chrome',
    ip: '127.0.0.1',
    createdAt: new Date().toISOString()
  };
  mockDb.sessions.unshift(newSession);

  yield put(loginSuccess(matchedUser));
  if (callback) callback(true);
}

// 2. REGISTER SAGA
function* handleRegister(action) {
  const { data, callback } = action.payload;
  const isMockMode = yield select(selectIsMockMode);

  if (!isMockMode) {
    try {
      const response = yield call(api.post, '/auth/register', data);
      yield put(registerSuccess());
      if (callback) callback({ success: true, ...response.data });
      return;
    } catch (err) {
      yield put(registerFailure(err.response?.data?.message || 'Registration connection failed'));
      yield put(toggleMockMode(true));
    }
  }

  // Mock
  yield delay(1000);
  const { name, username, email, phone, referralCode, dob, gender, state, district, country, favoriteCategories, skills, interests } = data;

  const emailExists = mockDb.users.some(u => u.email === email);
  if (emailExists) {
    yield put(registerFailure('Email already exists'));
    if (callback) callback({ success: false, error: 'Email already exists' });
    return;
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

  yield put(registerSuccess());
  if (callback) {
    callback({
      success: true,
      userId: newUser.id,
      mockOtps: { emailOtp: mockEmailOtp, phoneOtp: mockPhoneOtp }
    });
  }
}

// 3. LOGOUT SAGA
function* handleLogout(action) {
  const isMockMode = yield select(selectIsMockMode);

  if (!isMockMode) {
    try {
      yield call(api.post, '/auth/logout');
    } catch (err) {
      console.error(err);
    }
  }
  yield put(logoutSuccess());
  if (action.payload?.callback) action.payload.callback();
}

// 4. SEND OTP SAGA
function* handleSendOtp(action) {
  const { loginId, type, callback } = action.payload;
  const isMockMode = yield select(selectIsMockMode);

  if (!isMockMode) {
    try {
      const res = yield call(api.post, '/auth/send-otp', { loginId, type });
      yield put(sendOtpSuccess());
      if (callback) callback(res.data.mockOtp);
      return;
    } catch (err) {
      console.error(err);
    }
  }

  // Mock
  const matched = mockDb.users.find(u => u.email === loginId || u.phone === loginId);
  const userId = matched ? matched.id : 'temp-otp-id';
  const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
  mockDb.otps.push({ userId, otp: otpValue, type });

  yield put(sendOtpSuccess());
  if (callback) callback(otpValue);
}

// 5. VERIFY OTP SAGA
function* handleVerifyOtp(action) {
  const { userId, otp, type, callback } = action.payload;
  const isMockMode = yield select(selectIsMockMode);

  if (!isMockMode) {
    try {
      yield call(api.post, '/auth/verify-otp', { userId, otp, type });
      yield put(verifyOtpSuccess({ userId, type }));
      const user = yield select(selectUser);
      if (user && user.id === userId) {
        yield put(loadCurrentUserRequest());
      }
      if (callback) callback(true);
      return;
    } catch (err) {
      yield put(verifyOtpFailure(err.response?.data?.message || 'Verification failed'));
      if (callback) callback(false);
      return;
    }
  }

  // Mock
  const idx = mockDb.otps.findIndex(o => o.userId === userId && o.otp === otp && o.type === type);
  if (idx === -1) {
    yield put(verifyOtpFailure('Incorrect OTP verification code'));
    if (callback) callback(false);
    return;
  }

  mockDb.otps.splice(idx, 1);
  
  const uIdx = mockDb.users.findIndex(u => u.id === userId);
  if (uIdx !== -1) {
    if (type === 'email_verify') mockDb.users[uIdx].isEmailVerified = true;
    if (type === 'phone_verify') mockDb.users[uIdx].isPhoneVerified = true;
  }

  yield put(verifyOtpSuccess({ userId, type }));
  if (callback) callback(true);
}

// 6. FORGOT PASSWORD SAGA
function* handleForgotPassword(action) {
  const { email, callback } = action.payload;
  const isMockMode = yield select(selectIsMockMode);

  if (!isMockMode) {
    try {
      const response = yield call(api.post, '/auth/forgot-password', { email });
      yield put(forgotPasswordSuccess());
      if (callback) callback(response.data);
      return;
    } catch (err) {
      yield put(forgotPasswordFailure(err.response?.data?.message || 'Connection failed'));
      return;
    }
  }

  // Mock
  const matched = mockDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  const val = Math.floor(100000 + Math.random() * 900000).toString();
  if (matched) {
    mockDb.otps.push({ userId: matched.id, otp: val, type: 'reset_password' });
  }

  yield put(forgotPasswordSuccess());
  if (callback) {
    callback({ success: true, userId: matched ? matched.id : 'dummy', mockOtp: val });
  }
}

// 7. RESET PASSWORD SAGA
function* handleResetPassword(action) {
  const { data, callback } = action.payload;
  const isMockMode = yield select(selectIsMockMode);

  if (!isMockMode) {
    try {
      yield call(api.post, '/auth/reset-password', data);
      yield put(resetPasswordSuccess());
      if (callback) callback(true);
      return;
    } catch (err) {
      yield put(resetPasswordFailure(err.response?.data?.message || 'Reset failed'));
      if (callback) callback(false);
      return;
    }
  }

  yield put(resetPasswordSuccess());
  if (callback) callback(true);
}

// 8. UPDATE PROFILE SAGA
function* handleUpdateProfile(action) {
  const { data, callback } = action.payload;
  const isMockMode = yield select(selectIsMockMode);
  const user = yield select(selectUser);

  if (!user) {
    if (callback) callback(false);
    return;
  }

  if (!isMockMode) {
    try {
      const res = yield call(api.put, '/users/profile', data);
      yield put(updateProfileSuccess(res.data.user));
      if (callback) callback(true);
      return;
    } catch (err) {
      yield put(updateProfileFailure(err.response?.data?.message || 'Failed updating profile'));
      if (callback) callback(false);
      return;
    }
  }

  // Mock
  const idx = mockDb.users.findIndex(u => u.id === user.id);
  if (idx !== -1) {
    mockDb.users[idx] = { ...mockDb.users[idx], ...data };
    yield put(updateProfileSuccess(mockDb.users[idx]));
  }
  if (callback) callback(true);
}

// 9. UPDATE AVATAR SAGA
function* handleUpdateAvatar(action) {
  const { avatarUrl, callback } = action.payload;
  const isMockMode = yield select(selectIsMockMode);
  const user = yield select(selectUser);

  if (!user) {
    if (callback) callback(false);
    return;
  }

  if (!isMockMode) {
    try {
      const res = yield call(api.put, '/users/avatar', { avatar: avatarUrl });
      yield put(updateAvatarSuccess(res.data.user.avatar));
      if (callback) callback(true);
      return;
    } catch (err) {
      yield put(updateAvatarFailure(err.response?.data?.message || 'Failed updating avatar'));
      if (callback) callback(false);
      return;
    }
  }

  // Mock
  const idx = mockDb.users.findIndex(u => u.id === user.id);
  if (idx !== -1) {
    mockDb.users[idx].avatar = avatarUrl;
    yield put(updateAvatarSuccess(avatarUrl));
  }
  if (callback) callback(true);
}

// 10. UPLOAD KYC SAGA
function* handleUploadKyc(action) {
  const { data, callback } = action.payload;
  const isMockMode = yield select(selectIsMockMode);
  const user = yield select(selectUser);

  if (!user) {
    if (callback) callback(false);
    return;
  }

  if (!isMockMode) {
    try {
      yield call(api.post, '/kyc/upload', data);
      yield put(fetchKycStatusRequest());
      yield put(loadCurrentUserRequest());
      if (callback) callback(true);
      return;
    } catch (err) {
      yield put(uploadKycFailure(err.response?.data?.message || 'KYC Upload failed'));
      if (callback) callback(false);
      return;
    }
  }

  // Mock
  const score = Math.floor(78 + Math.random() * 21);
  const newKyc = {
    userId: user.id,
    documentType: data.documentType,
    documentNumber: data.documentNumber,
    documentFrontUrl: data.documentFrontUrl,
    selfieUrl: data.selfieUrl,
    livenessScore: score,
    status: 'Under Review',
    aiMatchResult: score >= 85 ? 'PASSED' : 'REVIEW_REQUIRED'
  };

  mockDb.kycRecords = mockDb.kycRecords.filter(k => k.userId !== user.id);
  mockDb.kycRecords.push(newKyc);

  const uIdx = mockDb.users.findIndex(u => u.id === user.id);
  if (uIdx !== -1) {
    mockDb.users[uIdx].kycStatus = 'Under Review';
  }

  yield put(uploadKycSuccess(newKyc));
  if (callback) callback(true);
}

// 11. FETCH KYC STATUS SAGA
function* handleFetchKycStatus() {
  const isMockMode = yield select(selectIsMockMode);
  const user = yield select(selectUser);

  if (!user) return;

  if (!isMockMode) {
    try {
      const res = yield call(api.get, '/kyc/status');
      yield put(fetchKycStatusSuccess(res.data.kyc || null));
      return;
    } catch (err) {
      yield put(fetchKycStatusFailure());
    }
  }

  // Mock
  const record = mockDb.kycRecords.find(k => k.userId === user.id);
  yield put(fetchKycStatusSuccess(record || null));
}

// 12. FETCH SESSIONS SAGA
function* handleFetchSessions() {
  const isMockMode = yield select(selectIsMockMode);

  if (!isMockMode) {
    try {
      const res = yield call(api.get, '/users/sessions');
      yield put(fetchSessionsSuccess(res.data.sessions));
      return;
    } catch (err) {
      yield put(fetchSessionsFailure());
    }
  }

  yield put(fetchSessionsSuccess(mockDb.sessions));
}

// 13. REVOKE SESSION SAGA
function* handleRevokeSession(action) {
  const sessionId = action.payload;
  const isMockMode = yield select(selectIsMockMode);

  if (!isMockMode) {
    try {
      yield call(api.delete, `/users/sessions/${sessionId}`);
      yield put(revokeSessionSuccess(sessionId));
      return;
    } catch (err) {
      yield put(revokeSessionFailure());
    }
  }

  mockDb.sessions = mockDb.sessions.filter(s => s._id !== sessionId);
  yield put(revokeSessionSuccess(sessionId));
}

// 14. LOGOUT OTHER DEVICES SAGA
function* handleLogoutAllDevices() {
  const isMockMode = yield select(selectIsMockMode);

  if (!isMockMode) {
    try {
      yield call(api.delete, '/users/sessions/all');
      yield put(logoutAllDevicesSuccess());
      return;
    } catch (err) {
      yield put(logoutAllDevicesFailure());
    }
  }

  mockDb.sessions = mockDb.sessions.slice(0, 1);
  yield put(logoutAllDevicesSuccess());
}

// 15. ADMIN: FETCH PENDING KYCS SAGA
function* handleFetchPendingKycs() {
  const isMockMode = yield select(selectIsMockMode);

  if (!isMockMode) {
    try {
      const res = yield call(api.get, '/kyc/pending');
      yield put(fetchPendingKycsSuccess(res.data.kycs));
      return;
    } catch (err) {
      yield put(fetchPendingKycsFailure());
    }
  }

  // Mock
  const list = mockDb.kycRecords
    .filter(k => k.status === 'Under Review')
    .map(k => {
      const matchUser = mockDb.users.find(u => u.id === k.userId);
      return {
        ...k,
        userDetail: matchUser ? { name: matchUser.name, email: matchUser.email, phone: matchUser.phone } : undefined
      };
    });
  yield put(fetchPendingKycsSuccess(list));
}

// 16. ADMIN: REVIEW KYC SAGA
function* handleReviewKyc(action) {
  const { kycId, status, reason, callback } = action.payload;
  const isMockMode = yield select(selectIsMockMode);

  if (!isMockMode) {
    try {
      yield call(api.put, '/kyc/review', { kycId, status, rejectionReason: reason });
      yield put(reviewKycSuccess());
      yield put(fetchPendingKycsRequest());
      if (callback) callback(true);
      return;
    } catch (err) {
      yield put(reviewKycFailure());
      if (callback) callback(false);
      return;
    }
  }

  // Mock
  const kycRecord = mockDb.kycRecords.find(k => k.userId === kycId || k._id === kycId);
  if (kycRecord) {
    kycRecord.status = status;
    kycRecord.rejectionReason = reason;
    
    const uIdx = mockDb.users.findIndex(u => u.id === kycRecord.userId);
    if (uIdx !== -1) {
      mockDb.users[uIdx].kycStatus = status;
    }
  }

  yield put(reviewKycSuccess());
  yield put(fetchPendingKycsRequest());
  if (callback) callback(true);
}

// 17. LOAD CURRENT USER SAGA
function* handleLoadCurrentUser() {
  const isMockMode = yield select(selectIsMockMode);

  if (!isMockMode) {
    try {
      const res = yield call(api.get, '/auth/me');
      yield put(loadCurrentUserSuccess(res.data.user));
    } catch (err) {
      yield put(loadCurrentUserFailure());
    }
  }
}

// Watcher Sagas
export function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(registerRequest.type, handleRegister);
  yield takeLatest(logoutRequest.type, handleLogout);
  yield takeLatest(sendOtpRequest.type, handleSendOtp);
  yield takeLatest(verifyOtpRequest.type, handleVerifyOtp);
  yield takeLatest(forgotPasswordRequest.type, handleForgotPassword);
  yield takeLatest(resetPasswordRequest.type, handleResetPassword);
  yield takeLatest(loadCurrentUserRequest.type, handleLoadCurrentUser);
  yield takeLatest(updateProfileRequest.type, handleUpdateProfile);
  yield takeLatest(updateAvatarRequest.type, handleUpdateAvatar);
  yield takeLatest(uploadKycRequest.type, handleUploadKyc);
  yield takeLatest(fetchKycStatusRequest.type, handleFetchKycStatus);
  yield takeLatest(fetchSessionsRequest.type, handleFetchSessions);
  yield takeLatest(revokeSessionRequest.type, handleRevokeSession);
  yield takeLatest(logoutAllDevicesRequest.type, handleLogoutAllDevices);
  yield takeLatest(fetchPendingKycsRequest.type, handleFetchPendingKycs);
  yield takeLatest(reviewKycRequest.type, handleReviewKyc);
}
