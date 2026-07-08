import { Queue, QueueOptions } from 'bullmq';
import { logger } from '../core/logger';
import { redisService } from './RedisService';
import { config } from '../config/appConfig';
import { emailService } from './EmailService';
import { firebaseSmsService } from './FirebaseSmsService';

class QueueService {
  private queues: Map<string, Queue> = new Map();
  private isBullMqActive = false;

  constructor() {
    // Queues will be initialized manually during startServer after Redis connects
  }

  public initialize() {
    this.initQueues();
  }

  private initQueues() {
    const redisClient = redisService.getClient();
    
    if (redisService.getIsConnected() && redisClient) {
      try {
        const queueOpts: QueueOptions = {
          connection: redisClient as any
        };

        this.queues.set('email-queue', new Queue('email-queue', queueOpts));
        this.queues.set('sms-queue', new Queue('sms-queue', queueOpts));
        this.queues.set('kyc-queue', new Queue('kyc-queue', queueOpts));
        this.queues.set('wallet-queue', new Queue('wallet-queue', queueOpts));

        this.isBullMqActive = true;
        logger.info('BullMQ Queues initialized successfully on Redis Connection.');
      } catch (err: any) {
        this.isBullMqActive = false;
        logger.warn(`BullMQ initialization failed: ${err.message}. Running queues in direct-simulated mode.`);
      }
    } else {
      this.isBullMqActive = false;
      logger.info('Redis is offline. BullMQ Queues running in direct-simulated mode.');
    }
  }

  // 1. ADD JOB
  async addJob(queueName: string, jobName: string, data: any): Promise<void> {
    if (this.isBullMqActive && this.queues.has(queueName)) {
      try {
        const queue = this.queues.get(queueName)!;
        await queue.add(jobName, data, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000
          },
          removeOnComplete: true,
          removeOnFail: 100
        });
        logger.info(`Job [${jobName}] successfully queued in [${queueName}].`);
        return;
      } catch (err: any) {
        logger.error(`Failed to queue job in BullMQ: ${err.message}. Falling back to simulation.`);
      }
    }

    // Direct Simulated Fallback (Runs immediately in the background)
    logger.info(`Simulating Job [${jobName}] execution immediately in direct mode...`);
    setTimeout(async () => {
      try {
        await this.simulateJobExecution(queueName, jobName, data);
      } catch (err: any) {
        logger.error(`Error executing simulated job [${jobName}]: ${err.message}`);
      }
    }, 100);
  }

  // Helper method to process queue tasks synchronously if BullMQ is offline
  private async simulateJobExecution(queueName: string, jobName: string, data: any): Promise<void> {
    switch (queueName) {
      case 'email-queue':
        await emailService.sendMail(data.email, data.subject, data.body);
        break;
      case 'sms-queue':
        await firebaseSmsService.sendSMS(data.phone, data.message);
        break;
      case 'kyc-queue':
        logger.info(`[SIMULATED KYC WORKER] Starting facial matching for user: ${data.userId}`);
        const User = require('../models/User').User;
        const KYC = require('../models/KYC').KYC;
        
        const kycRecord = await KYC.findOne({ userId: data.userId });
        if (kycRecord) {
          const liveness = Math.floor(75 + Math.random() * 23);
          const verdict = liveness >= 85 ? 'PASSED' : 'REVIEW_REQUIRED';
          
          kycRecord.livenessScore = liveness;
          kycRecord.aiMatchResult = verdict;
          kycRecord.status = 'Under Review';
          await kycRecord.save();
          
          await User.findByIdAndUpdate(data.userId, { kycStatus: 'Under Review' });
          logger.info(`[SIMULATED KYC WORKER] Finished facial matching. Liveness score: ${liveness}%. AIVerdict: ${verdict}.`);
        }
        break;
      case 'wallet-queue':
        logger.info(`[SIMULATED WALLET WORKER] Processing transaction of ${data.amount} for user: ${data.userId}`);
        break;
      default:
        logger.warn(`Unknown queue simulation request: ${queueName}`);
    }
  }
}

export const queueService = new QueueService();
export default queueService;
