import { Worker, Job } from 'bullmq';
import { logger } from '../core/logger';
import { redisService } from '../services/RedisService';
import { firebaseSmsService } from '../services/FirebaseSmsService';

export const initSMSWorker = () => {
  const connection = redisService.getClient();
  if (!connection) {
    logger.info('Skipping SMS Worker initialization (Redis is offline).');
    return;
  }

  try {
    const worker = new Worker(
      'sms-queue',
      async (job: Job) => {
        const { phone, message } = job.data;
        logger.info(`[WORKER] [sms-queue] Triggering SMS sending to ${phone} via Firebase API.`);
        await firebaseSmsService.sendSMS(phone, message);
      },
      { connection: connection as any }
    );

    worker.on('completed', (job) => {
      logger.info(`[WORKER] [sms-queue] Job ${job.id} completed successfully.`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`[WORKER] [sms-queue] Job ${job?.id} failed: ${err.message}`);
    });
  } catch (err: any) {
    logger.error(`Failed to init SMS Worker: ${err.message}`);
  }
};
export default initSMSWorker;
