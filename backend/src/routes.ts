import { Router } from 'express';

// Import Controllers
import { authController } from './controllers/AuthController';
import { userController } from './controllers/UserController';
import { kycController } from './controllers/KycController';
import { uploadController, upload } from './controllers/UploadController';
import { contestController } from './controllers/ContestController';
import { stageController } from './controllers/StageController';
import { walletController } from './controllers/WalletController';
import { questionController } from './controllers/QuestionController';
import { adminController } from './controllers/AdminController';
import { categoryController } from './controllers/CategoryController';
import { registrationController } from './controllers/RegistrationController';
import { notificationController } from './controllers/NotificationController';
import { moduleManagementController } from './controllers/ModuleManagementController';
import { cmsController } from './controllers/CmsController';
import { advertisementController } from './controllers/AdvertisementController';
import { couponController } from './controllers/CouponController';
import { referralController } from './controllers/ReferralController';
import { dailyContestsController } from './controllers/DailyContestsController';
import { coinController } from './controllers/CoinController';
import { rolePermissionController } from './controllers/RolePermissionController';
import { mobileContestantController } from './controllers/MobileContestantController';
import { biWeeklyRoomCycleController } from './controllers/BiWeeklyRoomCycleController';

// Import Middlewares
import { authenticate, authorize, requireNotGuest } from './middleware/AuthMiddleware';
import { validateRequest } from './middleware/ValidationMiddleware';

// Import Zod validation schemas
import {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema
} from './validators/AuthSchemas';
import {
  startEmailSchema,
  verifyEmailOtpSchema,
  startMobileSchema,
  verifyMobileOtpSchema,
  resendOtpSchema,
  saveProfileSchema,
  saveTopicsSchema,
  saveKycSchema
} from './validators/RegistrationValidators';
import { updateProfileSchema, updateAvatarSchema, updatePasswordSchema } from './validators/UserSchemas';
import { submitKycSchema, reviewKycSchema } from './validators/KycSchemas';
import { createCategorySchema, updateCategorySchema } from './validators/CategorySchemas';

export function createApiRouter(authLimiter: any): Router {
  const router = Router();

  // Onboarding Contestant multi-step registration routes
  router.post('/auth/register/email', authLimiter, validateRequest(startEmailSchema), registrationController.startEmail);
  router.post('/auth/register/email/otp', authLimiter, validateRequest(verifyEmailOtpSchema), registrationController.verifyEmailOtp);
  router.post('/auth/register/email/resend-otp', authLimiter, validateRequest(resendOtpSchema), registrationController.resendEmailOtp);
  router.post('/auth/register/mobile', authLimiter, validateRequest(startMobileSchema), registrationController.startMobile);
  router.post('/auth/register/verify-mobile-otp', authLimiter, validateRequest(verifyMobileOtpSchema), registrationController.verifyOtp);
  router.post('/auth/register/otp', authLimiter, validateRequest(verifyMobileOtpSchema), registrationController.verifyOtp);
  router.post('/auth/register/resend-otp', authLimiter, validateRequest(resendOtpSchema), registrationController.resendOtp);
  router.post('/auth/register/complete-profile', validateRequest(saveProfileSchema), registrationController.saveProfile);
  router.post('/auth/register/profile', validateRequest(saveProfileSchema), registrationController.saveProfile);
  router.post('/auth/register/topics', validateRequest(saveTopicsSchema), registrationController.saveTopics);
  router.post('/auth/register/kyc', validateRequest(saveKycSchema), registrationController.completeRegistration);
  router.post('/auth/register/upload', upload.single('file'), uploadController.uploadFile);
  router.post('/upload/base64', uploadController.uploadBase64);
  router.post('/upload', upload.single('file'), uploadController.uploadFile);
  router.post('/upload/:folder', upload.single('file'), uploadController.uploadFile);
  router.put('/upload', upload.single('file'), uploadController.updateFile);
  router.put('/upload/:folder', upload.single('file'), uploadController.updateFile);
  router.delete('/upload', uploadController.deleteFile);
  router.delete('/upload/:folder', uploadController.deleteFile);

  router.post('/admin/upload/base64', uploadController.uploadBase64);
  router.post('/admin/upload', upload.single('file'), uploadController.uploadFile);
  router.post('/admin/upload/:folder', upload.single('file'), uploadController.uploadFile);
  router.put('/admin/upload', upload.single('file'), uploadController.updateFile);
  router.put('/admin/upload/:folder', upload.single('file'), uploadController.updateFile);
  router.delete('/admin/upload', uploadController.deleteFile);
  router.delete('/admin/upload/:folder', uploadController.deleteFile);

  // 1. Auth routes
  router.post('/auth/register', authLimiter, validateRequest(registerSchema), authController.register);
  router.post('/auth/login', authLimiter, validateRequest(loginSchema), authController.login);
  router.post('/auth/logout', authController.logout);
  router.post('/auth/refresh-token', authController.refreshToken);
  router.post('/auth/send-otp', authLimiter, validateRequest(sendOtpSchema), authController.sendOtp);
  router.post('/auth/verify-otp', authLimiter, validateRequest(verifyOtpSchema), authController.verifyOtp);
  router.post('/auth/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), authController.forgotPassword);
  router.post('/auth/reset-password', authLimiter, validateRequest(resetPasswordSchema), authController.resetPassword);
  router.post('/auth/google', authLimiter, validateRequest(googleAuthSchema), authController.googleAuth);
  router.post('/auth/guest-login', authLimiter, authController.guestLogin);
  router.post('/auth/oauth', authController.oauthLogin);
  router.get('/auth/me', authenticate, authController.me);

  // 2. User profile routes
  router.get('/users/profile', authenticate, userController.getProfile);
  router.get('/users/profile/:id', mobileContestantController.getProfileById);
  router.put('/users/profile', authenticate, validateRequest(updateProfileSchema), userController.updateProfile);
  router.put('/users/avatar', authenticate, validateRequest(updateAvatarSchema), userController.updateAvatar);
  router.put('/users/password', authenticate, validateRequest(updatePasswordSchema), userController.updatePassword);
  router.delete('/users/account', authenticate, userController.deleteAccount);

  // Active Device sessions routes
  router.get('/users/sessions', authenticate, userController.getActiveSessions);
  router.delete('/users/sessions/all', authenticate, userController.logoutAllDevices);
  router.delete('/users/sessions/:sessionId', authenticate, userController.revokeSession);

  // 3. KYC routes
  router.post('/kyc/upload', authenticate, validateRequest(submitKycSchema), kycController.submitKYC);
  router.get('/kyc/status', authenticate, kycController.getKYCStatus);

  // Admin review workflows
  router.get('/kyc/pending', authenticate, authorize('Admin', 'Super Admin', 'KYC Officer'), kycController.getPendingKYCs);
  router.put('/kyc/review', authenticate, authorize('Admin', 'Super Admin', 'KYC Officer'), validateRequest(reviewKycSchema), kycController.reviewKYC);

  // 6. Reality Contest Platform routes

  // Contest routes
  router.post('/contests', authenticate, authorize('Admin', 'Super Admin', 'Contest Manager'), contestController.createContest);
  router.get('/contests', authenticate, contestController.listContests);
  router.get('/contests/:id/analytics', authenticate, contestController.getContestAnalytics);
  router.get('/admin/contests/:id/analytics', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), contestController.getContestAnalytics);
  router.get('/contests/:id', authenticate, contestController.getContestDetail);
  router.put('/contests/:id', authenticate, authorize('Admin', 'Super Admin', 'Contest Manager'), contestController.updateContest);
  router.delete('/contests/:id', authenticate, authorize('Admin', 'Super Admin', 'Contest Manager'), contestController.deleteContest);
  router.post('/contests/:id/duplicate', authenticate, authorize('Admin', 'Super Admin', 'Contest Manager'), contestController.duplicateContest);
  router.post('/contests/:id/join', authenticate, requireNotGuest, contestController.joinContest);
  router.post('/contest/:id/join', authenticate, requireNotGuest, contestController.joinContest);
  router.get('/contests/:contestId/stages', authenticate, stageController.getStagesByContest);
  router.post('/contests/:contestId/stages', authenticate, authorize('Admin', 'Super Admin', 'Contest Manager'), stageController.createStageForContest);

  // Stage & Attempt routes
  router.post('/groups/:groupId/stages', authenticate, authorize('Admin', 'Super Admin', 'Contest Manager'), stageController.createStage);
  router.get('/groups/:groupId/stages', authenticate, stageController.getStagesByGroup);
  router.get('/stages/:id/unlock-status', authenticate, stageController.checkUnlockStatus);
  router.post('/stages/:id/accept-rules', authenticate, requireNotGuest, stageController.acceptRules);
  router.post('/stages/:id/start', authenticate, requireNotGuest, stageController.startAttempt);
  router.post('/stages/:id/submit', authenticate, requireNotGuest, stageController.submitAttempt);
  router.post('/upload', authenticate, upload.single('file'), uploadController.uploadFile);

  // Wallet routes
  router.post('/wallet/deposit', authenticate, requireNotGuest, walletController.deposit);
  router.get('/wallet/transactions', authenticate, walletController.getTransactions);

  // Question & Quiz Builder routes
  router.delete('/question-pools/clear-all', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.clearAllQuestions);
  router.post('/question-pools', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.createPool);
  router.get('/question-pools', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.listPools);
  router.get('/question-pools/all-questions', authenticate, questionController.listQuestions);
  router.get('/question-pools/questions', authenticate, questionController.listQuestions);
  router.post('/question-pools/questions', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.createSingleQuestion);
  router.put('/question-pools/questions/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.updateQuestion);
  router.delete('/question-pools/questions/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.deleteQuestion);
  router.get('/questions', authenticate, questionController.listQuestions);
  router.get('/questions/:id', authenticate, questionController.getQuestionById);
  router.post('/questions', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.createSingleQuestion);
  router.put('/question-pools/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.updatePool);
  router.delete('/question-pools/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.deletePool);
  router.post('/question-pools/:poolId/questions', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.addQuestion);
  router.get('/question-pools/:poolId/questions', authenticate, questionController.listQuestions);
  router.put('/question-pools/:poolId/questions/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.updateQuestion);
  router.delete('/question-pools/:poolId/questions/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.deleteQuestion);
  router.put('/questions/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.updateQuestion);
  router.delete('/questions/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.deleteQuestion);
  router.post('/question-pools/bulk-import', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.bulkImportQuestions);
  router.post('/question-pools/:poolId/import', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.importQuestions);

  // Category Management routes
  router.get('/categories', categoryController.listCategories);
  router.post('/categories', authenticate, authorize('Admin', 'Super Admin', 'Contest Manager', 'Content Moderator'), validateRequest(createCategorySchema), categoryController.createCategory);
  router.put('/categories/:id', authenticate, authorize('Admin', 'Super Admin', 'Contest Manager', 'Content Moderator'), validateRequest(updateCategorySchema), categoryController.updateCategory);
  router.delete('/categories/:id', authenticate, authorize('Admin', 'Super Admin', 'Contest Manager', 'Content Moderator'), categoryController.deleteCategory);

  // Admin Audit & Overrides
  router.get('/admin/audit-logs', authenticate, authorize('Super Admin', 'Analytics Manager'), adminController.getAuditLogs);
  router.put('/admin/results/override', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), adminController.manualApproveQualification);
  router.put('/admin/users/role', authenticate, authorize('Super Admin'), adminController.promoteUser);
  router.get('/admin/users/:role', authenticate, authorize('Admin', 'Super Admin', 'Support Manager', 'KYC Officer'), adminController.listUsersByRole);
  router.post('/admin/users', authenticate, authorize('Admin', 'Super Admin'), adminController.createUser);
  router.put('/admin/users/:id', authenticate, authorize('Admin', 'Super Admin'), adminController.updateUser);
  router.delete('/admin/users/:id', authenticate, authorize('Admin', 'Super Admin'), adminController.deleteUser);
  router.put('/admin/users/:id/status', authenticate, authorize('Admin', 'Super Admin', 'Support Manager'), adminController.toggleUserStatus);
  router.put('/admin/users/:id/reset-password', authenticate, authorize('Admin', 'Super Admin', 'Support Manager'), adminController.resetUserPassword);
  router.put('/admin/users/:id/kyc', authenticate, authorize('Admin', 'Super Admin', 'KYC Officer'), adminController.updateKycStatus);
  router.put('/admin/users/:id/wallet', authenticate, authorize('Admin', 'Super Admin', 'Finance Manager'), adminController.adjustWalletBalance);

  // Notification routes
  router.get('/notifications', authenticate, notificationController.getNotifications);
  router.put('/notifications/mark-all-read', authenticate, notificationController.markAllRead);
  router.patch('/notifications/read/module/:module', authenticate, notificationController.markModuleAsRead);
  router.put('/notifications/:id/read', authenticate, notificationController.toggleRead);
  router.delete('/notifications/:id', authenticate, notificationController.deleteNotification);
  router.delete('/notifications', authenticate, notificationController.clearAll);

  // Admin Sidebar Counts
  router.get('/admin/sidebar-counts', authenticate, adminController.getSidebarCounts);

  // Grand Seasons REST APIs
  router.get('/admin/grand-seasons', authenticate, moduleManagementController.listGrandSeasons);
  router.post('/admin/grand-seasons', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), moduleManagementController.createGrandSeason);
  router.put('/admin/grand-seasons/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), moduleManagementController.updateGrandSeason);
  router.delete('/admin/grand-seasons/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), moduleManagementController.deleteGrandSeason);
  router.patch('/admin/grand-seasons/:id/status', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), moduleManagementController.toggleGrandSeasonStatus);

  // Question Bank REST APIs
  router.get('/admin/questions', authenticate, moduleManagementController.listQuestions);
  router.get('/admin/questions/:id', authenticate, questionController.getQuestionById);
  router.post('/admin/questions', authenticate, authorize('Super Admin', 'Admin', 'Question Manager'), moduleManagementController.createQuestion);
  router.put('/admin/questions/:id', authenticate, authorize('Super Admin', 'Admin', 'Question Manager'), moduleManagementController.updateQuestion);
  router.delete('/admin/questions/:id', authenticate, authorize('Super Admin', 'Admin', 'Question Manager'), moduleManagementController.deleteQuestion);
  router.patch('/admin/questions/:id/status', authenticate, authorize('Super Admin', 'Admin', 'Question Manager'), moduleManagementController.toggleQuestionStatus);

  // Surveys REST APIs
  router.get('/admin/surveys', authenticate, moduleManagementController.listSurveys);
  router.post('/admin/surveys', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager'), moduleManagementController.createSurvey);
  router.put('/admin/surveys/:id', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager'), moduleManagementController.updateSurvey);
  router.delete('/admin/surveys/:id', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager'), moduleManagementController.deleteSurvey);
  router.patch('/admin/surveys/:id/status', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager'), moduleManagementController.toggleSurveyStatus);

  // Tasks REST APIs
  router.get('/admin/tasks', authenticate, moduleManagementController.listTasks);
  router.post('/admin/tasks', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), moduleManagementController.createTask);
  router.put('/admin/tasks/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), moduleManagementController.updateTask);
  router.delete('/admin/tasks/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), moduleManagementController.deleteTask);
  router.patch('/admin/tasks/:id/status', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), moduleManagementController.toggleTaskStatus);

  // Challenges REST APIs
  router.get('/admin/challenges', authenticate, moduleManagementController.listChallenges);
  router.post('/admin/challenges', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), moduleManagementController.createChallenge);
  router.put('/admin/challenges/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), moduleManagementController.updateChallenge);
  router.delete('/admin/challenges/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), moduleManagementController.deleteChallenge);
  router.patch('/admin/challenges/:id/status', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), moduleManagementController.toggleChallengeStatus);

  // Withdrawals REST APIs
  router.get('/admin/withdrawals', authenticate, moduleManagementController.listWithdrawals);
  router.put('/admin/withdrawals/:id/status', authenticate, authorize('Super Admin', 'Admin', 'Finance Manager'), moduleManagementController.updateWithdrawalStatus);

  // Banners REST APIs
  router.get('/admin/banners', authenticate, moduleManagementController.listBanners);
  router.post('/admin/banners', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager'), moduleManagementController.createBanner);
  router.put('/admin/banners/:id', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager'), moduleManagementController.updateBanner);
  router.delete('/admin/banners/:id', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager'), moduleManagementController.deleteBanner);
  router.patch('/admin/banners/:id/status', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager'), moduleManagementController.toggleBannerStatus);

  // Advertisement REST APIs
  router.get('/ads', advertisementController.listAds);
  router.get('/admin/ads', authenticate, advertisementController.listAds);
  router.get('/admin/ads/:id', authenticate, advertisementController.getAdById);
  router.post('/admin/ads', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager', 'Sponsor'), advertisementController.createAd);
  router.put('/admin/ads/:id', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager', 'Sponsor'), advertisementController.updateAd);
  router.delete('/admin/ads/:id', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager', 'Sponsor'), advertisementController.deleteAd);
  router.patch('/admin/ads/:id/status', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager', 'Sponsor'), advertisementController.toggleAdStatus);

  // Coupon Management REST APIs
  router.post('/coupons/validate', couponController.validateCoupon);
  router.get('/admin/coupons', authenticate, couponController.listCoupons);
  router.get('/admin/coupons/:id', authenticate, couponController.getCouponById);
  router.post('/admin/coupons', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager', 'Finance Manager'), couponController.createCoupon);
  router.put('/admin/coupons/:id', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager', 'Finance Manager'), couponController.updateCoupon);
  router.delete('/admin/coupons/:id', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager', 'Finance Manager'), couponController.deleteCoupon);
  // Referral Management REST APIs
  router.get('/admin/referrals/rules', authenticate, referralController.getRules);
  router.put('/admin/referrals/rules', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager', 'Finance Manager'), referralController.updateRules);
  router.get('/admin/referrals/earnings', authenticate, referralController.listEarnings);
  router.get('/admin/referrals/abuse', authenticate, referralController.listAbuseLogs);
  router.patch('/admin/referrals/abuse/:id/action', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager', 'Support Manager', 'Finance Manager'), referralController.updateAbuseStatus);

  // Coin Management REST APIs
  router.get('/admin/coins/settings', authenticate, coinController.getSettings);
  router.put('/admin/coins/settings', authenticate, authorize('Super Admin', 'Admin', 'Finance Manager'), coinController.updateSettings);
  router.get('/admin/coins/packages', authenticate, coinController.listPackages);
  router.post('/admin/coins/packages', authenticate, authorize('Super Admin', 'Admin', 'Finance Manager'), coinController.createPackage);
  router.put('/admin/coins/packages/:id', authenticate, authorize('Super Admin', 'Admin', 'Finance Manager'), coinController.updatePackage);
  router.delete('/admin/coins/packages/:id', authenticate, authorize('Super Admin', 'Admin', 'Finance Manager'), coinController.deletePackage);
  router.get('/admin/coins/transactions', authenticate, coinController.listTransactions);

  // Role Permissions Management REST APIs
  router.get('/admin/roles-permissions', authenticate, rolePermissionController.getPermissions);
  router.put('/admin/roles-permissions', authenticate, authorize('Super Admin', 'Admin'), rolePermissionController.savePermissions);
  router.post('/admin/roles-permissions/role', authenticate, authorize('Super Admin', 'Admin'), rolePermissionController.createCustomRole);

  // Public CMS REST APIs (Accessible for Member Platform & Visitors)
  router.get('/cms/doc/:type', cmsController.getDocument);
  router.get('/cms/document/:type', cmsController.getDocument);
  router.get('/cms/privacy', (req: any, res, next) => { req.params = { ...req.params, type: 'privacy' }; cmsController.getDocument(req, res, next); });
  router.get('/cms/terms', (req: any, res, next) => { req.params = { ...req.params, type: 'terms' }; cmsController.getDocument(req, res, next); });
  router.get('/cms/about', (req: any, res, next) => { req.params = { ...req.params, type: 'about' }; cmsController.getDocument(req, res, next); });
  router.get('/cms/faqs', cmsController.listFaqs);
  router.get('/cms/help', cmsController.listHelpArticles);
  router.get('/cms/blogs', cmsController.listBlogs);
  router.get('/cms/news', cmsController.listNews);
  router.get('/cms/social', cmsController.listSocial);

  // Admin CMS REST APIs
  // Legal Documents (Privacy Policy, Terms, About Us)
  router.get('/admin/cms/doc/:type', authenticate, cmsController.getDocument);
  router.put('/admin/cms/doc/:type', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.updateDocument);

  // FAQs
  router.get('/admin/cms/faqs', authenticate, cmsController.listFaqs);
  router.post('/admin/cms/faqs', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.createFaq);
  router.put('/admin/cms/faqs/:id', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.updateFaq);
  router.delete('/admin/cms/faqs/:id', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.deleteFaq);

  // Help Articles
  router.get('/admin/cms/help', authenticate, cmsController.listHelpArticles);
  router.post('/admin/cms/help', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.createHelpArticle);
  router.put('/admin/cms/help/:id', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.updateHelpArticle);
  router.delete('/admin/cms/help/:id', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.deleteHelpArticle);

  // Blogs
  router.get('/admin/cms/blogs', authenticate, cmsController.listBlogs);
  router.post('/admin/cms/blogs', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.createBlog);
  router.put('/admin/cms/blogs/:id', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.updateBlog);
  router.delete('/admin/cms/blogs/:id', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.deleteBlog);

  // News Bulletins
  router.get('/admin/cms/news', authenticate, cmsController.listNews);
  router.post('/admin/cms/news', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.createNews);
  router.put('/admin/cms/news/:id', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.updateNews);
  router.delete('/admin/cms/news/:id', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.deleteNews);

  // Social Links & Logos
  router.get('/admin/cms/social', authenticate, cmsController.listSocial);
  router.post('/admin/cms/social', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.createSocial);
  router.put('/admin/cms/social/:id', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.updateSocial);
  router.delete('/admin/cms/social/:id', authenticate, authorize('Super Admin', 'Admin', 'Content Moderator'), cmsController.deleteSocial);

  // Daily Contests Routes
  router.get('/daily-contests', authenticate, dailyContestsController.listDailyContests);
  router.get('/daily-contests/:id/analytics', authenticate, dailyContestsController.getDailyContestAnalytics);
  router.get('/daily-contests/:id', authenticate, dailyContestsController.getDailyContestDetail);
  router.post('/daily-contests/:id/join', authenticate, dailyContestsController.joinDailyContest);
  router.get('/admin/daily-contests', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), dailyContestsController.listDailyContests);
  router.get('/admin/daily-contests/:id/analytics', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), dailyContestsController.getDailyContestAnalytics);
  router.post('/admin/daily-contests', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), dailyContestsController.createDailyContest);
  router.put('/admin/daily-contests/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), dailyContestsController.updateDailyContest);
  router.delete('/admin/daily-contests/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), dailyContestsController.deleteDailyContest);
  router.post('/admin/daily-contests/:id/reset', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), dailyContestsController.resetDailyContest);

  // Fraud Logs
  router.get('/admin/fraud-logs', authenticate, authorize('Super Admin', 'Admin', 'KYC Officer'), moduleManagementController.listFraudLogs);

  // ==================================================================
  // MOBILE APP API ENDPOINTS (VERSION 1 - CONTESTANT MODULE)
  // ==================================================================
  // Step 1: Mobile OTP Generation & Verification
  router.post('/v1/mobile/auth/send-otp', mobileContestantController.sendOtp);
  router.post('/mobile/auth/send-otp', mobileContestantController.sendOtp);

  router.post('/v1/mobile/auth/verify-otp', mobileContestantController.verifyOtp);
  router.post('/mobile/auth/verify-otp', mobileContestantController.verifyOtp);

  // Step 2: Contestant Registration
  router.post('/v1/mobile/auth/register', upload.single('profileImage'), mobileContestantController.register);
  router.post('/mobile/auth/register', upload.single('profileImage'), mobileContestantController.register);

  // Step 3: Contestant Login
  router.post('/v1/mobile/auth/login', mobileContestantController.login);
  router.post('/mobile/auth/login', mobileContestantController.login);

  // Step 4 & 5: Forgot Password & Reset Password
  router.post('/v1/mobile/auth/forgot-password', mobileContestantController.forgotPassword);
  router.post('/mobile/auth/forgot-password', mobileContestantController.forgotPassword);

  router.post('/v1/mobile/auth/reset-password', mobileContestantController.resetPassword);
  router.post('/mobile/auth/reset-password', mobileContestantController.resetPassword);

  // Token Refresh
  router.post('/v1/mobile/auth/refresh-token', mobileContestantController.refreshToken);
  router.post('/mobile/auth/refresh-token', mobileContestantController.refreshToken);

  // Step 6: Get & Update Contestant Profile
  router.get('/v1/mobile/profile', authenticate, mobileContestantController.getProfile);
  router.get('/mobile/profile', authenticate, mobileContestantController.getProfile);

  // Get Profile by ID (Public - Without Token)
  router.get('/v1/mobile/profile/:id', mobileContestantController.getProfileById);
  router.get('/mobile/profile/:id', mobileContestantController.getProfileById);

  router.put('/v1/mobile/profile', authenticate, upload.single('profileImage'), mobileContestantController.updateProfile);
  router.put('/mobile/profile', authenticate, upload.single('profileImage'), mobileContestantController.updateProfile);

  // Step 7: Change Password
  router.post('/v1/mobile/profile/change-password', authenticate, mobileContestantController.changePassword);
  router.post('/mobile/profile/change-password', authenticate, mobileContestantController.changePassword);

  // ==================================================================
  // BI-WEEKLY ROOM CYCLE MODULE API ENDPOINTS
  // ==================================================================
  // Room Management
  router.get('/admin/room-cycle/rooms', authenticate, biWeeklyRoomCycleController.getRooms);
  router.get('/admin/room-cycle/rooms/:id', authenticate, biWeeklyRoomCycleController.getRoomById);
  router.post('/admin/room-cycle/rooms', authenticate, biWeeklyRoomCycleController.createRoom);
  router.put('/admin/room-cycle/rooms/:id', authenticate, biWeeklyRoomCycleController.updateRoom);
  router.delete('/admin/room-cycle/rooms/:id', authenticate, biWeeklyRoomCycleController.deleteRoom);
  router.post('/admin/room-cycle/rooms/bulk-action', authenticate, biWeeklyRoomCycleController.bulkRoomAction);

  // Member Assignment & Transfer
  router.post('/admin/room-cycle/members/assign', authenticate, biWeeklyRoomCycleController.assignMembers);
  router.post('/admin/room-cycle/members/random-assign', authenticate, biWeeklyRoomCycleController.randomAssign);
  router.post('/admin/room-cycle/members/transfer', authenticate, biWeeklyRoomCycleController.transferMember);
  router.delete('/admin/room-cycle/members/:roomId/:userId', authenticate, biWeeklyRoomCycleController.removeMember);

  // Cycle Management
  router.get('/admin/room-cycle/cycles', authenticate, biWeeklyRoomCycleController.getCycles);
  router.put('/admin/room-cycle/cycles/:id/set-active', authenticate, biWeeklyRoomCycleController.setActiveCycle);
  router.put('/admin/room-cycle/cycles/:id', authenticate, biWeeklyRoomCycleController.updateCycle);

  // Task Management
  router.get('/admin/room-cycle/tasks', authenticate, biWeeklyRoomCycleController.getTasks);
  router.post('/admin/room-cycle/tasks', authenticate, biWeeklyRoomCycleController.createTask);
  router.put('/admin/room-cycle/tasks/:id', authenticate, biWeeklyRoomCycleController.updateTask);
  router.delete('/admin/room-cycle/tasks/:id', authenticate, biWeeklyRoomCycleController.deleteTask);

  // Submission Management
  router.get('/admin/room-cycle/submissions', authenticate, biWeeklyRoomCycleController.getSubmissions);
  router.put('/admin/room-cycle/submissions/:id/review', authenticate, biWeeklyRoomCycleController.reviewSubmission);

  // Leaderboard & Recalculation
  router.get('/admin/room-cycle/leaderboard', authenticate, biWeeklyRoomCycleController.getLeaderboard);
  router.post('/admin/room-cycle/leaderboard/recalculate', authenticate, biWeeklyRoomCycleController.recalculateLeaderboard);

  // Rewards Management
  router.get('/admin/room-cycle/rewards', authenticate, biWeeklyRoomCycleController.getRewards);
  router.post('/admin/room-cycle/rewards', authenticate, biWeeklyRoomCycleController.createRewardRule);
  router.post('/admin/room-cycle/rewards/distribute', authenticate, biWeeklyRoomCycleController.distributeRewards);

  // Analytics & Settings
  router.get('/admin/room-cycle/analytics', authenticate, biWeeklyRoomCycleController.getAnalytics);
  router.get('/admin/room-cycle/settings', authenticate, biWeeklyRoomCycleController.getSettings);
  router.put('/admin/room-cycle/settings', authenticate, biWeeklyRoomCycleController.updateSettings);

  return router;
}

