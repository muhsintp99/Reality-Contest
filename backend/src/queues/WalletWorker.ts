import { Worker, Job } from 'bullmq';
import { logger } from '../core/logger';
import { redisService } from '../services/RedisService';
import { User } from '../models/User';

export const initWalletWorker = () => {
  const connection = redisService.getClient();
  if (!connection) {
    logger.info('Skipping Wallet Worker initialization (Redis is offline).');
    return;
  }

  try {
    const worker = new Worker(
      'wallet-queue',
      async (job: Job) => {
        const { userId, amount, action } = job.data;
        logger.info(`[WORKER] [wallet-queue] Adjusting wallet balance for user: ${userId}. Amount: ${amount}. Action: ${action}`);
        
        await new Promise((resolve) => setTimeout(resolve, 600));

        const user = await User.findById(userId);
        if (user) {
          const delta = action === 'add' ? amount : -amount;
          user.walletBalance = Math.max(0, user.walletBalance + delta);
          await user.save();
          logger.info(`[WORKER] [wallet-queue] Transaction processed successfully. User ${userId} wallet balance: ${user.walletBalance}`);
        }
      },
      { connection: connection as any }
    );

    worker.on('completed', (job) => {
      logger.info(`[WORKER] [wallet-queue] Job ${job.id} completed successfully.`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`[WORKER] [wallet-queue] Job ${job?.id} failed: ${err.message}`);
    });
  } catch (err: any) {
    logger.error(`Failed to init Wallet Worker: ${err.message}`);
  }
};
export default initWalletWorker;
