import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import cluster from 'cluster';
import os from 'os';
import path from 'path';

import { config } from './config/appConfig';
import { logger } from './core/logger';
import { redisService } from './services/RedisService';
import { socketService } from './services/SocketService';
import { queueService } from './services/QueueService';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger';
import { seedDatabase } from './config/seed';

// Import Workers (so they start processing in independent threads if Redis is online)
import { initEmailWorker } from './queues/EmailWorker';
import { initSMSWorker } from './queues/SMSWorker';
import { initKycWorker } from './queues/KycWorker';
import { initWalletWorker } from './queues/WalletWorker';

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

// Import Middlewares
import { authenticate, authorize } from './middleware/AuthMiddleware';
import { validateRequest } from './middleware/ValidationMiddleware';
import { errorHandler } from './middleware/ErrorMiddleware';

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

const isProduction = config.NODE_ENV === 'production';

// Support Native Clustering to load balance across CPU threads in production
if (isProduction && !process.env.PM2_USAGE && cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  logger.info(`Primary cluster process ${process.pid} is running. Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.error(`Worker process ${worker.process.pid} died. Forking replacement...`);
    cluster.fork();
  });
} else {
  const startServer = async () => {
    // Wait for Redis connection to resolve or timeout before initializing components
    await redisService.waitForConnection();

    // Initialize Queues
    queueService.initialize();

    // Initialize Background Queue Workers
    initEmailWorker();
    initSMSWorker();
    initKycWorker();
    initWalletWorker();

    const app = express();
    const server = http.createServer(app);

    // Initialize Real-time Socket sync
    socketService.initialize(server);

  // Serve API documentation via Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Parser and Compression Middlewares
  app.use(helmet());
  app.use(cookieParser());
  app.use(compression()); // Compress text response payloads
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

  app.use(
    cors({
      origin: ['http://localhost:10001', 'http://127.0.0.1:10001'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

    // Rate Limiting Store Selection (Redis Cluster vs Memory)
    const redisClient = redisService.getClient();
    const createRedisStore = (prefix: string) => {
      return redisService.getIsConnected() && redisClient
        ? new RedisStore({
          sendCommand: (...args: string[]) => redisClient.call(args[0], ...args.slice(1)) as Promise<any>,
          prefix
        })
        : undefined; // Defaults to memory store inside express-rate-limit
    };

    // Rate Limiters
    const authLimiter = rateLimit({
      store: createRedisStore('rl:auth:'),
      windowMs: 15 * 60 * 1000, // 15 mins
      max: 30, // Limit to 30 requests per window
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many authentication attempts. Please try again later.' }
    });

    const generalApiLimiter = rateLimit({
      store: createRedisStore('rl:gen:'),
      windowMs: 15 * 60 * 1000, // 15 mins
      max: 1000000, // Limit to 1000 requests per window
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests. Please try again later.' }
    });

  // Apply general API rate limiting to all standard APIs
  app.use('/api/', generalApiLimiter);

  // 1. Auth routes
  app.post('/api/auth/register', authLimiter, validateRequest(registerSchema), authController.register);
  app.post('/api/auth/login', authLimiter, validateRequest(loginSchema), authController.login);
  app.post('/api/auth/logout', authController.logout);
  app.post('/api/auth/refresh-token', authController.refreshToken);
  app.post('/api/auth/send-otp', authLimiter, validateRequest(sendOtpSchema), authController.sendOtp);
  app.post('/api/auth/verify-otp', authLimiter, validateRequest(verifyOtpSchema), authController.verifyOtp);
  app.post('/api/auth/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), authController.forgotPassword);
  app.post('/api/auth/reset-password', authLimiter, validateRequest(resetPasswordSchema), authController.resetPassword);
  app.post('/api/auth/oauth', authController.oauthLogin);
  app.get('/api/auth/me', authenticate, authController.me);

  // 2. User profile routes
  app.get('/api/users/profile', authenticate, userController.getProfile);
  app.put('/api/users/profile', authenticate, validateRequest(updateProfileSchema), userController.updateProfile);
  app.put('/api/users/avatar', authenticate, validateRequest(updateAvatarSchema), userController.updateAvatar);
  app.put('/api/users/password', authenticate, validateRequest(updatePasswordSchema), userController.updatePassword);
  app.delete('/api/users/account', authenticate, userController.deleteAccount);

  // Active Device sessions routes
  app.get('/api/users/sessions', authenticate, userController.getActiveSessions);
  app.delete('/api/users/sessions/all', authenticate, userController.logoutAllDevices);
  app.delete('/api/users/sessions/:sessionId', authenticate, userController.revokeSession);

  // 3. KYC routes
  app.post('/api/kyc/upload', authenticate, validateRequest(submitKycSchema), kycController.submitKYC);
  app.get('/api/kyc/status', authenticate, kycController.getKYCStatus);

  // Admin review workflows
  app.get('/api/kyc/pending', authenticate, authorize('Admin', 'Super Admin'), kycController.getPendingKYCs);
  app.put('/api/kyc/review', authenticate, authorize('Admin', 'Super Admin'), validateRequest(reviewKycSchema), kycController.reviewKYC);



  // 6. Reality Contest Platform routes

  // Contest routes
  app.post('/api/contests', authenticate, authorize('Admin', 'Super Admin'), contestController.createContest);
  app.get('/api/contests', authenticate, contestController.listContests);
  app.get('/api/contests/:id', authenticate, contestController.getContestDetail);
  app.post('/api/contests/:id/join', authenticate, contestController.joinContest);

  // Stage & Attempt routes
  app.post('/api/groups/:groupId/stages', authenticate, authorize('Admin', 'Super Admin'), stageController.createStage);
  app.get('/api/groups/:groupId/stages', authenticate, stageController.getStagesByGroup);
  app.get('/api/stages/:id/unlock-status', authenticate, stageController.checkUnlockStatus);
  app.post('/api/stages/:id/accept-rules', authenticate, stageController.acceptRules);
  app.post('/api/stages/:id/start', authenticate, stageController.startAttempt);
  app.post('/api/stages/:id/submit', authenticate, stageController.submitAttempt);
  app.post('/api/upload', authenticate, upload.single('file'), uploadController.uploadFile);

  // Wallet routes
  app.post('/api/wallet/deposit', authenticate, walletController.deposit);
  app.get('/api/wallet/transactions', authenticate, walletController.getTransactions);

  // Question & Quiz Builder routes
  app.post('/api/question-pools', authenticate, authorize('Super Admin'), questionController.createPool);
  app.get('/api/question-pools', authenticate, authorize('Super Admin'), questionController.listPools);
  app.post('/api/question-pools/:poolId/questions', authenticate, authorize('Super Admin'), questionController.addQuestion);
  app.get('/api/question-pools/:poolId/questions', authenticate, questionController.listQuestions);
  app.post('/api/question-pools/:poolId/import', authenticate, authorize('Super Admin'), questionController.importQuestions);

  // Admin Audit & Overrides
  app.get('/api/admin/audit-logs', authenticate, authorize('Super Admin'), adminController.getAuditLogs);
  app.put('/api/admin/results/override', authenticate, authorize('Super Admin'), adminController.manualApproveQualification);
  app.put('/api/admin/users/role', authenticate, authorize('Super Admin'), adminController.promoteUser);
  app.get('/api/admin/users/:role', authenticate, authorize('Admin', 'Super Admin'), adminController.listUsersByRole);
  app.post('/api/admin/users', authenticate, authorize('Admin', 'Super Admin'), adminController.createUser);
  app.put('/api/admin/users/:id', authenticate, authorize('Admin', 'Super Admin'), adminController.updateUser);
  app.delete('/api/admin/users/:id', authenticate, authorize('Admin', 'Super Admin'), adminController.deleteUser);
  app.put('/api/admin/users/:id/status', authenticate, authorize('Admin', 'Super Admin'), adminController.toggleUserStatus);

  // 5. Health Check Endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: redisService.getIsConnected() ? 'connected' : 'disconnected',
      activeQueues: queueService ? 'active' : 'inactive',
      clustering: cluster.isWorker ? `worker_${cluster.worker?.id}` : 'standalone'
    });
  });

  // Centralized Error Middleware (Winston logs, Stack hiding)
  app.use(errorHandler);

  // Database Connection Pooling & Initialization
  mongoose.set('bufferCommands', false);
  const dbOptions = {
    maxPoolSize: 100, // Handle high concurrent connections
    minPoolSize: 10,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000
  };

  mongoose
    .connect(config.MONGODB_URI, dbOptions)
    .then(() => {
      logger.info('Successfully connected to MongoDB Cluster.');
      seedDatabase();
    })
    .catch((err) => {
      logger.warn('\n======================================================');
      logger.warn('WARNING: MongoDB is not running on your local machine.');
      logger.warn(`Attempted URI: ${config.MONGODB_URI}`);
      logger.warn('The server will launch, but database queries will fail.');
      logger.warn('Please start mongod locally or update MONGODB_URI in .env');
      logger.warn('======================================================\n');
    });

    const PORT = config.PORT;
    server.listen(PORT, () => {
      logger.info(`Haka Auth Server running on http://localhost:${PORT} [Worker: ${process.pid}]`);
    });
  };

  startServer().catch((err) => {
    logger.error(`Critical server startup failure: ${err.message}`);
  });
}
