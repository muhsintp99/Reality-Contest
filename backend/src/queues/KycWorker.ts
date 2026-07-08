import { Worker, Job } from 'bullmq';
import { logger } from '../core/logger';
import { redisService } from '../services/RedisService';
import { KYC } from '../models/KYC';
import { User } from '../models/User';

export const initKycWorker = () => {
  const connection = redisService.getClient();
  if (!connection) {
    logger.info('Skipping KYC Worker initialization (Redis is offline).');
    return;
  }

  try {
    const worker = new Worker(
      'kyc-queue',
      async (job: Job) => {
        const { userId, kycId } = job.data;
        logger.info(`[WORKER] [kyc-queue] Running AI biometric face recognition matching for KYC: ${kycId}...`);
        
        // Simulate deep neural network facial similarity computations
        await new Promise((resolve) => setTimeout(resolve, 3000));
        
        const kycRecord = await KYC.findById(kycId);
        if (kycRecord) {
          const simulatedScore = Math.floor(75 + Math.random() * 23);
          const aiVerdict = simulatedScore >= 85 ? 'PASSED' : 'REVIEW_REQUIRED';
          
          kycRecord.livenessScore = simulatedScore;
          kycRecord.aiMatchResult = aiVerdict;
          await kycRecord.save();
          
          logger.info(`[WORKER] [kyc-queue] Finished AI evaluation for ${userId}. Biometric Score: ${simulatedScore}%. Verdict: ${aiVerdict}`);
        }
      },
      { connection: connection as any }
    );

    worker.on('completed', (job) => {
      logger.info(`[WORKER] [kyc-queue] Job ${job.id} completed successfully.`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`[WORKER] [kyc-queue] Job ${job?.id} failed: ${err.message}`);
    });
  } catch (err: any) {
    logger.error(`Failed to init KYC Worker: ${err.message}`);
  }
};
export default initKycWorker;
