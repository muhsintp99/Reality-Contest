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
      origin: [
        'http://localhost:10001', 'http://127.0.0.1:10001',
        'http://localhost:10002', 'http://127.0.0.1:10002'
      ],
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

  // Apply general API rate limiting and mount standard API routes
  app.use('/api', generalApiLimiter, createApiRouter(authLimiter));

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
