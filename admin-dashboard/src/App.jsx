import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { loadCurrentUserRequest, logoutRequest } from './store/authSlice';
import { ThemeProvider } from './context/ThemeContext';
import { AlertProvider } from './context/AlertContext';
import { AdminDashboardLayout } from './layouts/AdminDashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PermissionGuard } from './components/PermissionGuard';
import { NotificationProvider } from './context/NotificationContext';
import { PageSkeleton } from './components/PageSkeleton';

// Lazy-loaded page components for route-based code splitting and fast bundle initialization
const DashboardHome = lazy(() => import('./pages/DashboardHome').then(m => ({ default: m.DashboardHome })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ContestManagement = lazy(() => import('./pages/ContestManagement').then(m => ({ default: m.ContestManagement })));
const DailyContestPage = lazy(() => import('./pages/DailyContestPage').then(m => ({ default: m.DailyContestPage })));
const DailyContestWizard = lazy(() => import('./pages/DailyContestWizard').then(m => ({ default: m.DailyContestWizard })));
const DailyContestAnalyticsPage = lazy(() => import('./pages/DailyContestAnalyticsPage').then(m => ({ default: m.DailyContestAnalyticsPage })));
const QuizBuilder = lazy(() => import('./pages/QuizBuilder').then(m => ({ default: m.QuizBuilder })));
const StageManagement = lazy(() => import('./pages/StageManagement').then(m => ({ default: m.StageManagement })));
const UsersDirectory = lazy(() => import('./pages/UsersDirectory').then(m => ({ default: m.UsersDirectory })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const CategoryManagement = lazy(() => import('./pages/CategoryManagement').then(m => ({ default: m.CategoryManagement })));
const ContestDetails = lazy(() => import('./pages/ContestDetails').then(m => ({ default: m.ContestDetails })));
const StageBuilder = lazy(() => import('./pages/StageBuilder').then(m => ({ default: m.StageBuilder })));
const MyTeam = lazy(() => import('./pages/MyTeam').then(m => ({ default: m.MyTeam })));
const ContestWizard = lazy(() => import('./pages/ContestWizard').then(m => ({ default: m.ContestWizard })));
const ContestantWizard = lazy(() => import('./pages/ContestantWizard').then(m => ({ default: m.ContestantWizard })));
const KycDirectory = lazy(() => import('./pages/KycDirectory').then(m => ({ default: m.KycDirectory })));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage').then(m => ({ default: m.UserManagementPage })));
const GrandContestManagement = lazy(() => import('./pages/GrandContestManagement').then(m => ({ default: m.GrandContestManagement })));
const QuestionBankPage = lazy(() => import('./pages/QuestionBankPage').then(m => ({ default: m.QuestionBankPage })));
const QuestionPoolPage = lazy(() => import('./pages/QuestionPoolPage').then(m => ({ default: m.QuestionPoolPage })));
const QuestionBulkImportPage = lazy(() => import('./pages/QuestionBulkImportPage').then(m => ({ default: m.QuestionBulkImportPage })));
const QuestionAnalyticsPage = lazy(() => import('./pages/QuestionAnalyticsPage').then(m => ({ default: m.QuestionAnalyticsPage })));
const SurveyManagement = lazy(() => import('./pages/SurveyManagement').then(m => ({ default: m.SurveyManagement })));
const TaskManagementPage = lazy(() => import('./pages/TaskManagementPage').then(m => ({ default: m.TaskManagementPage })));
const ChallengeManagement = lazy(() => import('./pages/ChallengeManagement').then(m => ({ default: m.ChallengeManagement })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const WalletManagementPage = lazy(() => import('./pages/WalletManagementPage').then(m => ({ default: m.WalletManagementPage })));
const CoinManagementPage = lazy(() => import('./pages/CoinManagementPage').then(m => ({ default: m.CoinManagementPage })));
const WithdrawalManagementPage = lazy(() => import('./pages/WithdrawalManagementPage').then(m => ({ default: m.WithdrawalManagementPage })));
const BannerManagement = lazy(() => import('./pages/BannerManagement').then(m => ({ default: m.BannerManagement })));
const ReferralManagement = lazy(() => import('./pages/ReferralManagement').then(m => ({ default: m.ReferralManagement })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const CMSPage = lazy(() => import('./pages/CMSPage').then(m => ({ default: m.CMSPage })));
const AdvertisementManagement = lazy(() => import('./pages/AdvertisementManagement').then(m => ({ default: m.AdvertisementManagement })));
const CouponManagement = lazy(() => import('./pages/CouponManagement').then(m => ({ default: m.CouponManagement })));
const FraudDetection = lazy(() => import('./pages/FraudDetection').then(m => ({ default: m.FraudDetection })));
const RolesPermissionsPage = lazy(() => import('./pages/RolesPermissionsPage').then(m => ({ default: m.RolesPermissionsPage })));
const AllUsersPage = lazy(() => import('./pages/AllUsersPage').then(m => ({ default: m.AllUsersPage })));
const KycStatusPage = lazy(() => import('./pages/KycStatusPage').then(m => ({ default: m.KycStatusPage })));
const WalletBalancePage = lazy(() => import('./pages/WalletBalancePage').then(m => ({ default: m.WalletBalancePage })));
const ContestHistoryPage = lazy(() => import('./pages/ContestHistoryPage').then(m => ({ default: m.ContestHistoryPage })));
const LoginHistoryPage = lazy(() => import('./pages/LoginHistoryPage').then(m => ({ default: m.LoginHistoryPage })));
const DeviceDetailsPage = lazy(() => import('./pages/DeviceDetailsPage').then(m => ({ default: m.DeviceDetailsPage })));
const ReferralDetailsPage = lazy(() => import('./pages/ReferralDetailsPage').then(m => ({ default: m.ReferralDetailsPage })));
const HomeBannerPage = lazy(() => import('./pages/HomeBannerPage').then(m => ({ default: m.HomeBannerPage })));
const PopupBannerPage = lazy(() => import('./pages/PopupBannerPage').then(m => ({ default: m.PopupBannerPage })));
const FestivalBannerPage = lazy(() => import('./pages/FestivalBannerPage').then(m => ({ default: m.FestivalBannerPage })));
const SponsoredBannerPage = lazy(() => import('./pages/SponsoredBannerPage').then(m => ({ default: m.SponsoredBannerPage })));
const AnnouncementBannerPage = lazy(() => import('./pages/AnnouncementBannerPage').then(m => ({ default: m.AnnouncementBannerPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsConditionsPage = lazy(() => import('./pages/TermsConditionsPage').then(m => ({ default: m.TermsConditionsPage })));
const FaqPage = lazy(() => import('./pages/FaqPage').then(m => ({ default: m.FaqPage })));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage').then(m => ({ default: m.HelpCenterPage })));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage').then(m => ({ default: m.AboutUsPage })));
const BlogsPage = lazy(() => import('./pages/BlogsPage').then(m => ({ default: m.BlogsPage })));
const NewsMediaPage = lazy(() => import('./pages/NewsMediaPage').then(m => ({ default: m.NewsMediaPage })));
const SocialMediaPage = lazy(() => import('./pages/SocialMediaPage').then(m => ({ default: m.SocialMediaPage })));
const CreateAdsPage = lazy(() => import('./pages/CreateAdsPage').then(m => ({ default: m.CreateAdsPage })));
const SponsoredContestPage = lazy(() => import('./pages/SponsoredContestPage').then(m => ({ default: m.SponsoredContestPage })));
const BannerAdsPage = lazy(() => import('./pages/BannerAdsPage').then(m => ({ default: m.BannerAdsPage })));
const VideoAdsPage = lazy(() => import('./pages/VideoAdsPage').then(m => ({ default: m.VideoAdsPage })));
const RewardAdsPage = lazy(() => import('./pages/RewardAdsPage').then(m => ({ default: m.RewardAdsPage })));
const PartnerCampaignsPage = lazy(() => import('./pages/PartnerCampaignsPage').then(m => ({ default: m.PartnerCampaignsPage })));
const PromoCodesPage = lazy(() => import('./pages/PromoCodesPage').then(m => ({ default: m.PromoCodesPage })));
const DiscountEntryFeePage = lazy(() => import('./pages/DiscountEntryFeePage').then(m => ({ default: m.DiscountEntryFeePage })));
const FreeEntryPage = lazy(() => import('./pages/FreeEntryPage').then(m => ({ default: m.FreeEntryPage })));
const RewardCouponPage = lazy(() => import('./pages/RewardCouponPage').then(m => ({ default: m.RewardCouponPage })));
const ReferralRulesPage = lazy(() => import('./pages/ReferralRulesPage').then(m => ({ default: m.ReferralRulesPage })));
const ReferralEarningsPage = lazy(() => import('./pages/ReferralEarningsPage').then(m => ({ default: m.ReferralEarningsPage })));
const ReferralAbusePage = lazy(() => import('./pages/ReferralAbusePage').then(m => ({ default: m.ReferralAbusePage })));

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
    <Suspense fallback={<PageSkeleton />}>
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
              <Suspense fallback={<PageSkeleton />}>
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
                  <Route path="question-bank" element={<Navigate to="question-bank/pool" replace />} />
                  <Route path="question-bank/pool" element={<QuestionPoolPage />} />
                  <Route path="question-bank/import" element={<QuestionBulkImportPage />} />
                  <Route path="question-bank/analytics" element={<QuestionAnalyticsPage />} />
                  <Route path="surveys" element={<SurveyManagement />} />
                  <Route path="tasks" element={<TaskManagementPage />} />
                  <Route path="challenges" element={<ChallengeManagement />} />
                  <Route path="leaderboard" element={<LeaderboardPage />} />
                  <Route path="wallet" element={<WalletManagementPage />} />
                  <Route path="coin-management" element={<CoinManagementPage />} />
                  <Route path="withdrawals" element={<WithdrawalManagementPage />} />
                  <Route path="banners" element={<Navigate to="banners/home" replace />} />
                  <Route path="banners/home" element={<HomeBannerPage />} />
                  <Route path="banners/popup" element={<PopupBannerPage />} />
                  <Route path="banners/festival" element={<FestivalBannerPage />} />
                  <Route path="banners/sponsored" element={<SponsoredBannerPage />} />
                  <Route path="banners/announcement" element={<AnnouncementBannerPage />} />
                  {/* Referral Management Dedicated Sub-Pages */}
                  <Route path="referrals" element={<Navigate to="referrals/rules" replace />} />
                  <Route path="referrals/rules" element={<ReferralRulesPage />} />
                  <Route path="referrals/earnings" element={<ReferralEarningsPage />} />
                  <Route path="referrals/abuse" element={<ReferralAbusePage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  {/* CMS Dedicated Sub-Pages */}
                  <Route path="cms" element={<Navigate to="cms/privacy" replace />} />
                  <Route path="cms/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="cms/terms" element={<TermsConditionsPage />} />
                  <Route path="cms/faq" element={<FaqPage />} />
                  <Route path="cms/help" element={<HelpCenterPage />} />
                  <Route path="cms/about" element={<AboutUsPage />} />
                  <Route path="cms/blogs" element={<BlogsPage />} />
                  <Route path="cms/news" element={<NewsMediaPage />} />
                  <Route path="cms/social" element={<SocialMediaPage />} />

                  {/* Advertisement Management Dedicated Sub-Pages */}
                  <Route path="advertisements" element={<Navigate to="advertisements/sponsored" replace />} />
                  <Route path="advertisements/create" element={<CreateAdsPage />} />
                  <Route path="advertisements/sponsored" element={<SponsoredContestPage />} />
                  <Route path="advertisements/banner" element={<BannerAdsPage />} />
                  <Route path="advertisements/video" element={<VideoAdsPage />} />
                  <Route path="advertisements/reward" element={<RewardAdsPage />} />
                  <Route path="advertisements/partner" element={<PartnerCampaignsPage />} />

                  {/* Coupon Management Dedicated Sub-Pages */}
                  <Route path="coupons" element={<Navigate to="coupons/promo" replace />} />
                  <Route path="coupons/promo" element={<PromoCodesPage />} />
                  <Route path="coupons/discount" element={<DiscountEntryFeePage />} />
                  <Route path="coupons/free" element={<FreeEntryPage />} />
                  <Route path="coupons/reward" element={<RewardCouponPage />} />
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
                  <Route path="contests/:contestId/analytics" element={<DailyContestAnalyticsPage />} />
                  <Route path="daily-contest" element={<DailyContestPage />} />
                  <Route path="daily-contest/create" element={<DailyContestWizard />} />
                  <Route path="daily-contest/:contestId/analytics" element={<DailyContestAnalyticsPage />} />
                  <Route path="daily-contests/:contestId/analytics" element={<DailyContestAnalyticsPage />} />
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
              </Suspense>
            </AdminDashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/admin-dashboard/dashboard" replace />} />
      </Routes>
    </Suspense>
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
