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

// Import Middlewares
import { authenticate, authorize } from './middleware/AuthMiddleware';
import { validateRequest } from './middleware/ValidationMiddleware';

// Import Zod validation schemas
import {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from './validators/AuthSchemas';
import { updateProfileSchema, updateAvatarSchema, updatePasswordSchema } from './validators/UserSchemas';
import { submitKycSchema, reviewKycSchema } from './validators/KycSchemas';
import { createCategorySchema, updateCategorySchema } from './validators/CategorySchemas';

export function createApiRouter(authLimiter: any): Router {
  const router = Router();

  // 1. Auth routes
  router.post('/auth/register', authLimiter, validateRequest(registerSchema), authController.register);
  router.post('/auth/login', authLimiter, validateRequest(loginSchema), authController.login);
  router.post('/auth/logout', authController.logout);
  router.post('/auth/refresh-token', authController.refreshToken);
  router.post('/auth/send-otp', authLimiter, validateRequest(sendOtpSchema), authController.sendOtp);
  router.post('/auth/verify-otp', authLimiter, validateRequest(verifyOtpSchema), authController.verifyOtp);
  router.post('/auth/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), authController.forgotPassword);
  router.post('/auth/reset-password', authLimiter, validateRequest(resetPasswordSchema), authController.resetPassword);
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
  router.get('/kyc/pending', authenticate, authorize('Admin', 'Super Admin'), kycController.getPendingKYCs);
  router.put('/kyc/review', authenticate, authorize('Admin', 'Super Admin'), validateRequest(reviewKycSchema), kycController.reviewKYC);

  // 6. Reality Contest Platform routes

  // Contest routes
  router.post('/contests', authenticate, authorize('Admin', 'Super Admin'), contestController.createContest);
  router.get('/contests', authenticate, contestController.listContests);
  router.get('/contests/:id', authenticate, contestController.getContestDetail);
  router.post('/contests/:id/join', authenticate, contestController.joinContest);
  router.get('/contests/:contestId/stages', authenticate, stageController.getStagesByContest);
  router.post('/contests/:contestId/stages', authenticate, authorize('Admin', 'Super Admin'), stageController.createStageForContest);

  // Stage & Attempt routes
  router.post('/groups/:groupId/stages', authenticate, authorize('Admin', 'Super Admin'), stageController.createStage);
  router.get('/groups/:groupId/stages', authenticate, stageController.getStagesByGroup);
  router.get('/stages/:id/unlock-status', authenticate, stageController.checkUnlockStatus);
  router.post('/stages/:id/accept-rules', authenticate, stageController.acceptRules);
  router.post('/stages/:id/start', authenticate, stageController.startAttempt);
  router.post('/stages/:id/submit', authenticate, stageController.submitAttempt);
  router.post('/upload', authenticate, upload.single('file'), uploadController.uploadFile);

  // Wallet routes
  router.post('/wallet/deposit', authenticate, walletController.deposit);
  router.get('/wallet/transactions', authenticate, walletController.getTransactions);

  // Question & Quiz Builder routes
  router.post('/question-pools', authenticate, authorize('Super Admin'), questionController.createPool);
  router.get('/question-pools', authenticate, authorize('Super Admin'), questionController.listPools);
  router.post('/question-pools/:poolId/questions', authenticate, authorize('Super Admin'), questionController.addQuestion);
  router.get('/question-pools/:poolId/questions', authenticate, questionController.listQuestions);
  router.post('/question-pools/:poolId/import', authenticate, authorize('Super Admin'), questionController.importQuestions);

  // Category Management routes
  router.get('/categories', authenticate, categoryController.listCategories);
  router.post('/categories', authenticate, authorize('Admin', 'Super Admin'), validateRequest(createCategorySchema), categoryController.createCategory);
  router.put('/categories/:id', authenticate, authorize('Admin', 'Super Admin'), validateRequest(updateCategorySchema), categoryController.updateCategory);
  router.delete('/categories/:id', authenticate, authorize('Admin', 'Super Admin'), categoryController.deleteCategory);

  // Admin Audit & Overrides
  router.get('/admin/audit-logs', authenticate, authorize('Super Admin'), adminController.getAuditLogs);
  router.put('/admin/results/override', authenticate, authorize('Super Admin'), adminController.manualApproveQualification);
  router.put('/admin/users/role', authenticate, authorize('Super Admin'), adminController.promoteUser);
  router.get('/admin/users/:role', authenticate, authorize('Admin', 'Super Admin'), adminController.listUsersByRole);
  router.post('/admin/users', authenticate, authorize('Admin', 'Super Admin'), adminController.createUser);
  router.put('/admin/users/:id', authenticate, authorize('Admin', 'Super Admin'), adminController.updateUser);
  router.delete('/admin/users/:id', authenticate, authorize('Admin', 'Super Admin'), adminController.deleteUser);
  router.put('/admin/users/:id/status', authenticate, authorize('Admin', 'Super Admin'), adminController.toggleUserStatus);

  return router;
}
