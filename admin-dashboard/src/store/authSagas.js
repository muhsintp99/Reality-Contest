import { call, put, select, takeLatest } from 'redux-saga/effects';
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
  reviewKycRequest, reviewKycSuccess, reviewKycFailure
} from './authSlice';

// Axios Instance
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Selectors
const selectUser = (state) => state.auth.user;

// 1. LOGIN SAGA
function* handleLogin(action) {
  const { loginId, password, isOtpLogin, otp, callback } = action.payload;

  try {
    const response = yield call(api.post, '/auth/login', { loginId, password, isOtpLogin, otp });
    const user = response.data.user;

    if (!['Admin', 'Super Admin'].includes(user.role)) {
      yield put(loginFailure('This account is not authorized to access the Admin Dashboard.'));
      if (callback) callback(false);
      try {
        yield call(api.post, '/auth/logout');
      } catch (e) {}
      return;
    }

    yield put(loginSuccess(user));
    if (callback) callback(true);
  } catch (err) {
    yield put(loginFailure(err.response?.data?.message || 'Authentication failed. Please verify credentials.'));
    if (callback) callback(false);
  }
}

// 2. REGISTER SAGA
function* handleRegister(action) {
  const { data, callback } = action.payload;

  try {
    const response = yield call(api.post, '/auth/register', data);
    yield put(registerSuccess());
    if (callback) callback({ success: true, ...response.data });
  } catch (err) {
    yield put(registerFailure(err.response?.data?.message || 'Registration failed.'));
    if (callback) callback({ success: false, error: err.response?.data?.message || 'Registration failed.' });
  }
}

// 3. LOGOUT SAGA
function* handleLogout(action) {
  try {
    yield call(api.post, '/auth/logout');
  } catch (err) {
    console.error(err);
  }
  yield put(logoutSuccess());
  if (action.payload?.callback) action.payload.callback();
}

// 4. SEND OTP SAGA
function* handleSendOtp(action) {
  const { loginId, type, callback } = action.payload;

  try {
    const res = yield call(api.post, '/auth/send-otp', { loginId, type });
    yield put(sendOtpSuccess());
    if (callback) callback(res.data.mockOtp);
  } catch (err) {
    console.error(err);
    yield put(sendOtpFailure(err.response?.data?.message || 'Failed to send OTP'));
  }
}

// 5. VERIFY OTP SAGA
function* handleVerifyOtp(action) {
  const { userId, otp, type, callback } = action.payload;

  try {
    yield call(api.post, '/auth/verify-otp', { userId, otp, type });
    yield put(verifyOtpSuccess({ userId, type }));
    const user = yield select(selectUser);
    if (user && (user.id === userId || user._id === userId)) {
      yield put(loadCurrentUserRequest());
    }
    if (callback) callback(true);
  } catch (err) {
    yield put(verifyOtpFailure(err.response?.data?.message || 'Verification failed'));
    if (callback) callback(false);
  }
}

// 6. FORGOT PASSWORD SAGA
function* handleForgotPassword(action) {
  const { email, callback } = action.payload;

  try {
    const response = yield call(api.post, '/auth/forgot-password', { email });
    yield put(forgotPasswordSuccess());
    if (callback) callback(response.data);
  } catch (err) {
    yield put(forgotPasswordFailure(err.response?.data?.message || 'Connection failed'));
    if (callback) callback(null);
  }
}

// 7. RESET PASSWORD SAGA
function* handleResetPassword(action) {
  const { data, callback } = action.payload;

  try {
    yield call(api.post, '/auth/reset-password', data);
    yield put(resetPasswordSuccess());
    if (callback) callback(true);
  } catch (err) {
    yield put(resetPasswordFailure(err.response?.data?.message || 'Reset failed'));
    if (callback) callback(false);
  }
}

// 8. UPDATE PROFILE SAGA
function* handleUpdateProfile(action) {
  const { data, callback } = action.payload;

  try {
    const res = yield call(api.put, '/users/profile', data);
    yield put(updateProfileSuccess(res.data.user));
    if (callback) callback(true);
  } catch (err) {
    yield put(updateProfileFailure(err.response?.data?.message || 'Failed updating profile'));
    if (callback) callback(false);
  }
}

// 9. UPDATE AVATAR SAGA
function* handleUpdateAvatar(action) {
  const { avatarUrl, callback } = action.payload;

  try {
    const res = yield call(api.put, '/users/avatar', { avatar: avatarUrl });
    yield put(updateAvatarSuccess(res.data.user.avatar));
    if (callback) callback(true);
  } catch (err) {
    yield put(updateAvatarFailure(err.response?.data?.message || 'Failed updating avatar'));
    if (callback) callback(false);
  }
}

// 10. UPLOAD KYC SAGA
function* handleUploadKyc(action) {
  const { data, callback } = action.payload;

  try {
    yield call(api.post, '/kyc/upload', data);
    yield put(fetchKycStatusRequest());
    yield put(loadCurrentUserRequest());
    if (callback) callback(true);
  } catch (err) {
    yield put(uploadKycFailure(err.response?.data?.message || 'KYC Upload failed'));
    if (callback) callback(false);
  }
}

// 11. FETCH KYC STATUS SAGA
function* handleFetchKycStatus() {
  try {
    const res = yield call(api.get, '/kyc/status');
    yield put(fetchKycStatusSuccess(res.data.kyc || null));
  } catch (err) {
    yield put(fetchKycStatusFailure());
  }
}

// 12. FETCH SESSIONS SAGA
function* handleFetchSessions() {
  try {
    const res = yield call(api.get, '/users/sessions');
    yield put(fetchSessionsSuccess(res.data.sessions));
  } catch (err) {
    yield put(fetchSessionsFailure());
  }
}

// 13. REVOKE SESSION SAGA
function* handleRevokeSession(action) {
  const sessionId = action.payload;

  try {
    yield call(api.delete, `/users/sessions/${sessionId}`);
    yield put(revokeSessionSuccess(sessionId));
  } catch (err) {
    yield put(revokeSessionFailure());
  }
}

// 14. LOGOUT OTHER DEVICES SAGA
function* handleLogoutAllDevices() {
  try {
    yield call(api.delete, '/users/sessions/all');
    yield put(logoutAllDevicesSuccess());
  } catch (err) {
    yield put(logoutAllDevicesFailure());
  }
}

// 15. ADMIN: FETCH PENDING KYCS SAGA
function* handleFetchPendingKycs() {
  try {
    const res = yield call(api.get, '/kyc/pending');
    yield put(fetchPendingKycsSuccess(res.data.kycs));
  } catch (err) {
    yield put(fetchPendingKycsFailure());
  }
}

// 16. ADMIN: REVIEW KYC SAGA
function* handleReviewKyc(action) {
  const { kycId, status, reason, callback } = action.payload;

  try {
    yield call(api.put, '/kyc/review', { kycId, status, rejectionReason: reason });
    yield put(reviewKycSuccess());
    yield put(fetchPendingKycsRequest());
    if (callback) callback(true);
  } catch (err) {
    yield put(reviewKycFailure());
    if (callback) callback(false);
  }
}

// 17. LOAD CURRENT USER SAGA
function* handleLoadCurrentUser() {
  try {
    const res = yield call(api.get, '/auth/me');
    const user = res.data.user;
    if (user && !['Admin', 'Super Admin'].includes(user.role)) {
      yield put(loadCurrentUserFailure());
      try {
        yield call(api.post, '/auth/logout');
      } catch (e) {}
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
      return;
    }
    yield put(loadCurrentUserSuccess(user));
  } catch (err) {
    yield put(loadCurrentUserFailure());
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
