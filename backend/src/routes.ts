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
  router.post('/auth/register/otp', authLimiter, validateRequest(verifyMobileOtpSchema), registrationController.verifyOtp);
  router.post('/auth/register/resend-otp', authLimiter, validateRequest(resendOtpSchema), registrationController.resendOtp);
  router.post('/auth/register/profile', validateRequest(saveProfileSchema), registrationController.saveProfile);
  router.post('/auth/register/topics', validateRequest(saveTopicsSchema), registrationController.saveTopics);
  router.post('/auth/register/kyc', validateRequest(saveKycSchema), registrationController.completeRegistration);
  router.post('/auth/register/upload', upload.single('file'), uploadController.uploadFile);
  router.post('/upload', upload.single('file'), uploadController.uploadFile);
  router.post('/upload/:folder', upload.single('file'), uploadController.uploadFile);
  router.put('/upload', upload.single('file'), uploadController.updateFile);
  router.put('/upload/:folder', upload.single('file'), uploadController.updateFile);
  router.delete('/upload', uploadController.deleteFile);
  router.delete('/upload/:folder', uploadController.deleteFile);

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
  router.get('/contests/:id', authenticate, contestController.getContestDetail);
  router.put('/contests/:id', authenticate, authorize('Admin', 'Super Admin', 'Contest Manager'), contestController.updateContest);
  router.delete('/contests/:id', authenticate, authorize('Admin', 'Super Admin', 'Contest Manager'), contestController.deleteContest);
  router.post('/contests/:id/duplicate', authenticate, authorize('Admin', 'Super Admin', 'Contest Manager'), contestController.duplicateContest);
  router.post('/contests/:id/join', authenticate, requireNotGuest, contestController.joinContest);
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
  router.get('/questions', authenticate, questionController.listQuestions);
  router.put('/question-pools/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.updatePool);
  router.delete('/question-pools/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.deletePool);
  router.post('/question-pools/:poolId/questions', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.addQuestion);
  router.get('/question-pools/:poolId/questions', authenticate, questionController.listQuestions);
  router.put('/question-pools/:poolId/questions/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.updateQuestion);
  router.delete('/question-pools/:poolId/questions/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.deleteQuestion);
  router.put('/questions/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.updateQuestion);
  router.delete('/questions/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.deleteQuestion);
  router.post('/question-pools/:poolId/import', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), questionController.importQuestions);

  // Category Management routes
  router.get('/categories', authenticate, categoryController.listCategories);
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
  router.post('/admin/ads', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager'), advertisementController.createAd);
  router.put('/admin/ads/:id', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager'), advertisementController.updateAd);
  router.delete('/admin/ads/:id', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager'), advertisementController.deleteAd);
  router.patch('/admin/ads/:id/status', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager'), advertisementController.toggleAdStatus);

  // Coupon Management REST APIs
  router.post('/coupons/validate', couponController.validateCoupon);
  router.get('/admin/coupons', authenticate, couponController.listCoupons);
  router.get('/admin/coupons/:id', authenticate, couponController.getCouponById);
  router.post('/admin/coupons', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager', 'Finance Manager'), couponController.createCoupon);
  router.put('/admin/coupons/:id', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager', 'Finance Manager'), couponController.updateCoupon);
  router.delete('/admin/coupons/:id', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager', 'Finance Manager'), couponController.deleteCoupon);
  // Referral Management REST APIs
  router.get('/admin/referrals/rules', authenticate, referralController.getRules);
  router.put('/admin/referrals/rules', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager'), referralController.updateRules);
  router.get('/admin/referrals/earnings', authenticate, referralController.listEarnings);
  router.get('/admin/referrals/abuse', authenticate, referralController.listAbuseLogs);
  router.patch('/admin/referrals/abuse/:id/action', authenticate, authorize('Super Admin', 'Admin', 'Marketing Manager', 'Support Manager'), referralController.updateAbuseStatus);

  // Public CMS REST APIs (Accessible for Member Platform & Visitors)
  router.get('/cms/doc/:type', cmsController.getDocument);
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
  router.get('/daily-contests/:id', authenticate, dailyContestsController.getDailyContestDetail);
  router.post('/daily-contests/:id/join', authenticate, dailyContestsController.joinDailyContest);
  router.get('/admin/daily-contests', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), dailyContestsController.listDailyContests);
  router.post('/admin/daily-contests', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), dailyContestsController.createDailyContest);
  router.put('/admin/daily-contests/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), dailyContestsController.updateDailyContest);
  router.delete('/admin/daily-contests/:id', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), dailyContestsController.deleteDailyContest);
  router.post('/admin/daily-contests/:id/reset', authenticate, authorize('Super Admin', 'Admin', 'Contest Manager'), dailyContestsController.resetDailyContest);

  // Fraud Logs
  router.get('/admin/fraud-logs', authenticate, authorize('Super Admin', 'Admin', 'KYC Officer'), moduleManagementController.listFraudLogs);

  return router;
}
