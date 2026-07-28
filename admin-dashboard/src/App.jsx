import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { loadCurrentUserRequest, logoutRequest } from './store/authSlice';
import { ThemeProvider } from './context/ThemeContext';
import { AlertProvider } from './context/AlertContext';
import { AdminDashboardLayout } from './layouts/AdminDashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PermissionGuard } from './components/PermissionGuard';
import { DashboardHome } from './pages/DashboardHome';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ContestManagement } from './pages/ContestManagement';
import { QuizBuilder } from './pages/QuizBuilder';
import { StageManagement } from './pages/StageManagement';
import { UsersDirectory } from './pages/UsersDirectory';
import { NotificationsPage } from './pages/NotificationsPage';
import { CategoryManagement } from './pages/CategoryManagement';
import { ContestDetails } from './pages/ContestDetails';
import { StageBuilder } from './pages/StageBuilder';
import { MyTeam } from './pages/MyTeam';
import { ContestWizard } from './pages/ContestWizard';
import { ContestantWizard } from './pages/ContestantWizard';
import { KycDirectory } from './pages/KycDirectory';
import { NotificationProvider } from './context/NotificationContext';
import { UserManagementPage } from './pages/UserManagementPage';
import { GrandContestManagement } from './pages/GrandContestManagement';
import { QuestionBankPage } from './pages/QuestionBankPage';
import { SurveyManagement } from './pages/SurveyManagement';
import { TaskManagementPage } from './pages/TaskManagementPage';
import { ChallengeManagement } from './pages/ChallengeManagement';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { WalletManagementPage } from './pages/WalletManagementPage';
import { WithdrawalManagementPage } from './pages/WithdrawalManagementPage';
import { BannerManagement } from './pages/BannerManagement';
import { ReferralManagement } from './pages/ReferralManagement';
import { ReportsPage } from './pages/ReportsPage';
import { CMSPage } from './pages/CMSPage';
import { AdvertisementManagement } from './pages/AdvertisementManagement';
import { CouponManagement } from './pages/CouponManagement';
import { FraudDetection } from './pages/FraudDetection';
import { RolesPermissionsPage } from './pages/RolesPermissionsPage';
import { AllUsersPage } from './pages/AllUsersPage';
import { KycStatusPage } from './pages/KycStatusPage';
import { WalletBalancePage } from './pages/WalletBalancePage';
import { ContestHistoryPage } from './pages/ContestHistoryPage';
import { LoginHistoryPage } from './pages/LoginHistoryPage';
import { DeviceDetailsPage } from './pages/DeviceDetailsPage';
import { ReferralDetailsPage } from './pages/ReferralDetailsPage';
import { HomeBannerPage } from './pages/HomeBannerPage';
import { PopupBannerPage } from './pages/PopupBannerPage';
import { FestivalBannerPage } from './pages/FestivalBannerPage';
import { SponsoredBannerPage } from './pages/SponsoredBannerPage';
import { AnnouncementBannerPage } from './pages/AnnouncementBannerPage';

const AppContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isMockMode, initialized } = useSelector((state) => state.auth);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedRole, setSelectedRole] = useState('Admin');

  useEffect(() => {
    if (!isMockMode) {
      dispatch(loadCurrentUserRequest());
    }
  }, [isMockMode, dispatch]);

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [user]);

  // Sync activeView with the route path
  useEffect(() => {
    const relativePath = location.pathname.replace('/admin-dashboard/', '');
    setActiveView(relativePath);
  }, [location]);

  const handleLogout = () => {
    dispatch(logoutRequest({ callback: () => navigate('/login') }));
  };

  // If user is authenticated and is on /login or /, redirect to /admin-dashboard/dashboard
  useEffect(() => {
    if (initialized && isAuthenticated) {
      const adminRoles = [
        'Super Admin',
        'Admin',
        'Contest Manager',
        'Finance Manager',
        'Support Manager',
        'Marketing Manager',
        'Content Moderator',
        'KYC Officer',
        'Analytics Manager',
        'Sponsor'
      ];
      const isAdmin = adminRoles.includes(user?.role);
      if (isAdmin) {
        if (location.pathname === '/' || location.pathname === '/login') {
          navigate('/admin-dashboard/dashboard', { replace: true });
        }
      }
    }
  }, [initialized, isAuthenticated, user, location, navigate]);

  return (
    <Routes>
      <Route path="/login" element={
        <Login
          onForgotClick={() => navigate('/forgot-password')}
          onLoginSuccess={() => navigate('/admin-dashboard/dashboard')}
        />
      } />
      <Route path="/forgot-password" element={
        <ForgotPassword
          onBackToLogin={() => navigate('/login')}
        />
      } />
      <Route path="/" element={<Navigate to="/admin-dashboard/dashboard" replace />} />
      <Route path="/admin-dashboard" element={<Navigate to="/admin-dashboard/dashboard" replace />} />
      
      <Route path="/admin-dashboard/*" element={
        <ProtectedRoute>
          <AdminDashboardLayout
            activeView={activeView}
            onLogout={handleLogout}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          >
            <Routes>
              <Route path="dashboard" element={<DashboardHome onViewChange={(view) => navigate(`/admin-dashboard/${view}`)} selectedRole={selectedRole} />} />
              <Route path="user-management" element={<Navigate to="user-management/all-users" replace />} />
              <Route path="user-management/all-users" element={<AllUsersPage />} />
              <Route path="user-management/kyc-status" element={<KycStatusPage />} />
              <Route path="user-management/wallet-balance" element={<WalletBalancePage />} />
              <Route path="user-management/contest-history" element={<ContestHistoryPage />} />
              <Route path="user-management/login-history" element={<LoginHistoryPage />} />
              <Route path="user-management/device-details" element={<DeviceDetailsPage />} />
              <Route path="user-management/referral-details" element={<ReferralDetailsPage />} />
              <Route path="grand-contest" element={<GrandContestManagement />} />
              <Route path="question-bank" element={<QuestionBankPage />} />
              <Route path="surveys" element={<SurveyManagement />} />
              <Route path="tasks" element={<TaskManagementPage />} />
              <Route path="challenges" element={<ChallengeManagement />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="wallet" element={<WalletManagementPage />} />
              <Route path="withdrawals" element={<WithdrawalManagementPage />} />
              <Route path="banners" element={<Navigate to="banners/home" replace />} />
              <Route path="banners/home" element={<HomeBannerPage />} />
              <Route path="banners/popup" element={<PopupBannerPage />} />
              <Route path="banners/festival" element={<FestivalBannerPage />} />
              <Route path="banners/sponsored" element={<SponsoredBannerPage />} />
              <Route path="banners/announcement" element={<AnnouncementBannerPage />} />
              <Route path="referrals" element={<ReferralManagement />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="cms" element={<CMSPage />} />
              <Route path="advertisements" element={<AdvertisementManagement />} />
              <Route path="coupons" element={<CouponManagement />} />
              <Route path="fraud-detection" element={<FraudDetection />} />
              <Route path="roles-permissions" element={<RolesPermissionsPage />} />
              <Route path="analytics" element={<Navigate to="analytics/dau-mau" replace />} />
              <Route path="analytics/*" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="users" element={<Navigate to="/admin-dashboard/user-management" replace />} />
              <Route path="contestants" element={<UsersDirectory type="Contestant" />} />
              <Route path="kyc" element={<KycDirectory />} />
              <Route path="contestants/create" element={<ContestantWizard />} />
              <Route path="judges" element={<UsersDirectory type="Judge" />} />
              <Route path="sponsors" element={<UsersDirectory type="Sponsor" />} />
              <Route path="contests" element={<ContestManagement />} />
              <Route path="contests/create" element={<ContestWizard />} />
              <Route path="contests/edit/:contestId" element={<ContestWizard />} />
              <Route path="contests/:contestId" element={<ContestDetails />} />
              <Route path="contests/:contestId/stages/:stageId" element={<StageBuilder />} />
              <Route path="stages" element={<StageManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="quiz-builder" element={<QuizBuilder />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="myteam" element={<MyTeam />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AdminDashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/admin-dashboard/dashboard" replace />} />
    </Routes>
  );
};

export const App = () => (
  <ThemeProvider>
    <AlertProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AlertProvider>
  </ThemeProvider>
);

export default App;
