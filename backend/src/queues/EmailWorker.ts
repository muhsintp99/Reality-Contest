import { Worker, Job } from 'bullmq';
import { logger } from '../core/logger';
import { redisService } from '../services/RedisService';
import { emailService } from '../services/EmailService';

export const initEmailWorker = () => {
  const connection = redisService.getClient();
  if (!connection) {
    logger.info('Skipping Email Worker initialization (Redis is offline).');
    return;
  }

  try {
    const worker = new Worker(
      'email-queue',
      async (job: Job) => {
        const { email, subject, body } = job.data;
        logger.info(`[WORKER] [email-queue] Triggering email sending to ${email} via SMTP.`);
        await emailService.sendMail(email, subject, body);
      },
      { connection: connection as any }
    );

    worker.on('completed', (job) => {
      logger.info(`[WORKER] [email-queue] Job ${job.id} completed successfully.`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`[WORKER] [email-queue] Job ${job?.id} failed: ${err.message}`);
    });
  } catch (err: any) {
    logger.error(`Failed to init Email Worker: ${err.message}`);
  }
};
export default initEmailWorker;
