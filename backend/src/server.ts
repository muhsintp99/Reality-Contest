import express, { Request, Response, NextFunction } from 'express';
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
import fs from 'fs';

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

// Import Middlewares
import { errorHandler } from './middleware/ErrorMiddleware';

// Import Router
import { createApiRouter } from './routes';

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
    const app = express();
    const server = http.createServer(app);

    // Wait for Redis connection attempt (resolves instantly if online or after timeout if offline)
    await redisService.waitForConnection();

    // Initialize Real-time Socket sync
    socketService.initialize(server);

    // Initialize Queues & Workers
    queueService.initialize();
    initEmailWorker();
    initSMSWorker();
    initKycWorker();
    initWalletWorker();

    // Parser and Compression Middlewares
    app.use(
      helmet({
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false
      })
    );

    app.use(cookieParser());
    app.use(compression()); // Compress text response payloads
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Static upload file serving (mount at /uploads, subfolders, and root fallback)
    const uploadsPath = path.resolve(process.cwd(), 'public/uploads');
    app.use('/uploads', express.static(uploadsPath));
    app.use('/uploads/general', express.static(path.join(uploadsPath, 'general')));
    app.use('/uploads/question', express.static(path.join(uploadsPath, 'question')));
    app.use('/uploads/daily-contest', express.static(path.join(uploadsPath, 'daily-contest')));
    app.use('/uploads/contest', express.static(path.join(uploadsPath, 'contest')));
    app.use('/uploads/category', express.static(path.join(uploadsPath, 'category')));

    // Fallback static image/media resolver for uploaded files
    app.use((req: any, res: any, next: any) => {
      const reqPath = req.path || req.url || '';
      if (req.method === 'GET' && /\.(png|jpe?g|gif|webp|svg|ico|pdf|mp4|webm)$/i.test(reqPath)) {
        const filename = path.basename(reqPath);
        const searchDirs = [
          uploadsPath,
          path.join(uploadsPath, 'general'),
          path.join(uploadsPath, 'question'),
          path.join(uploadsPath, 'daily-contest'),
          path.join(uploadsPath, 'contest'),
          path.join(uploadsPath, 'category'),
          path.join(uploadsPath, 'kyc'),
          path.join(uploadsPath, 'avatars')
        ];

        for (const dir of searchDirs) {
          const filePath = path.join(dir, filename);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            return res.sendFile(filePath);
          }
        }
      }
      next();
    });

    const allowedOrigins = Array.from(
      new Set([
        'http://localhost:10000', 'https://localhost:10000',
        'http://localhost:10001', 'http://127.0.0.1:10001',
        'http://localhost:10002', 'http://127.0.0.1:10002',
        'http://82.29.165.57:10000', 'https://82.29.165.57:10000',
        'http://82.29.165.57:10001', 'https://82.29.165.57:10001',
        'http://82.29.165.57:10002', 'https://82.29.165.57:10002',
        'http://82.29.165.57', 'https://82.29.165.57',
        'http://hakalive.in', 'https://hakalive.in',
        'http://www.hakalive.in', 'https://www.hakalive.in',
        'http://dashboard.hakalive.in', 'https://dashboard.hakalive.in',
        'http://api.hakalive.in', 'https://api.hakalive.in',
        ...(process.env.CORS_ALLOWED_ORIGINS
          ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((s) => s.trim())
          : [])
      ])
    );

    app.use(
      cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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

    // Serve API documentation via Swagger UI
    app.get('/api-docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.json(swaggerDocument);
    });

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'Haka Platform API & Admin Docs',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true
      }
    }));

    // Apply general API rate limiting and mount standard API routes
    app.use('/api', generalApiLimiter, createApiRouter(authLimiter));

    // Health Check Endpoint
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

    // Start listening immediately on 0.0.0.0 so Vite dev server proxy connections are accepted without delay
    const PORT = config.PORT;
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Haka Auth Server running on http://localhost:${PORT} [Worker: ${process.pid}]`);
    });



    // Database Connection Pooling & Initialization
    mongoose.set('bufferCommands', true);
    const dbOptions = {
      maxPoolSize: 100, // Handle high concurrent connections
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000
    };

    try {
      logger.info('Connecting to MongoDB Cluster...');
      await mongoose.connect(config.MONGODB_URI, dbOptions);
      logger.info('Successfully connected to MongoDB Cluster.');
      await seedDatabase();
    } catch (err) {
      logger.error('Database connection failed:', err);
      logger.warn('\n======================================================');
      logger.warn('WARNING: MongoDB is not running on your local machine.');
      logger.warn(`Attempted URI: ${config.MONGODB_URI}`);
      logger.warn('The server will launch, but database queries will fail.');
      logger.warn('Please start mongod locally or update MONGODB_URI in .env');
      logger.warn('======================================================\n');
    }
  };

  startServer().catch((err) => {
    logger.error(`Critical server startup failure: ${err.message}`);
  });
}
// Server startup trigger

