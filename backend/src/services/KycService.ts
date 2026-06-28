import { KycRepository } from '../repositories/KycRepository';
import { UserRepository } from '../repositories/UserRepository';
import { NotFoundError, AppError } from '../core/errors';
import { queueService } from './QueueService';
import { redisService } from './RedisService';
import { socketService } from './SocketService';

export class KycService {
  private kycRepo = new KycRepository();
  private userRepo = new UserRepository();

  // 1. SUBMIT KYC (Queues heavy facial analysis using BullMQ)
  async submitKyc(userId: string, data: any): Promise<any> {
    const { documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl } = data;

    let kycRecord = await this.kycRepo.findByUserId(userId);
    if (kycRecord && kycRecord.status === 'Approved') {
      throw new AppError('Your KYC application has already been verified.', 400);
    }

    // AI matching score logic is offloaded to queues, but we initialize details with a base placeholder liveness score
    const simulatedLiveness = Math.floor(75 + Math.random() * 23);
    const aiVerdict = simulatedLiveness >= 80 ? 'PASSED' : 'REVIEW_REQUIRED';

    if (kycRecord) {
      kycRecord.documentType = documentType;
      kycRecord.documentNumber = documentNumber;
      kycRecord.documentFrontUrl = documentFrontUrl;
      kycRecord.documentBackUrl = documentBackUrl;
      kycRecord.selfieUrl = selfieUrl;
      kycRecord.status = 'Under Review';
      kycRecord.livenessScore = simulatedLiveness;
      kycRecord.aiMatchResult = aiVerdict;
      kycRecord.rejectionReason = '';
      await kycRecord.save();
    } else {
      kycRecord = await this.kycRepo.create({
        userId,
        documentType,
        documentNumber,
        documentFrontUrl,
        documentBackUrl,
        selfieUrl,
        livenessScore: simulatedLiveness,
        aiMatchResult: aiVerdict,
        status: 'Under Review'
      });
    }

    // Update User model status
    await this.userRepo.update(userId, { kycStatus: 'Under Review' });

    // Cache Invalidation
    await redisService.del(`user:profile:${userId}`);

    // Queue Async Verification task on BullMQ to simulate AI face-matching validation
    await queueService.addJob('kyc-queue', 'process-kyc-documents', {
      userId,
      kycId: kycRecord._id.toString()
    });

    return kycRecord;
  }

  // 2. GET KYC STATUS
  async getKycStatus(userId: string): Promise<any> {
    const kyc = await this.kycRepo.findByUserId(userId);
    if (!kyc) {
      return { status: 'Pending', message: 'No KYC documents submitted yet.' };
    }
    return kyc;
  }

  // 3. ADMIN REVIEW KYC (Mark approvals or rejections and notify client dynamically)
  async reviewKyc(adminId: string, data: { kycId: string; status: 'Approved' | 'Rejected'; rejectionReason?: string }): Promise<any> {
    const { kycId, status, rejectionReason } = data;

    const kyc = await this.kycRepo.findById(kycId);
    if (!kyc) throw new NotFoundError('KYC Record not found.');

    kyc.status = status;
    kyc.rejectionReason = status === 'Rejected' ? (rejectionReason || 'Documents unclear') : '';
    kyc.reviewedBy = adminId as any;
    kyc.reviewedAt = new Date();
    await kyc.save();

    // Update User Model status
    await this.userRepo.update(kyc.userId.toString(), { kycStatus: status });

    // Invalidate Redis profile Cache
    const userIdStr = kyc.userId.toString();
    await redisService.del(`user:profile:${userIdStr}`);

    // Send notifications to queues
    await queueService.addJob('email-queue', 'send-kyc-status-email', {
      email: userIdStr,
      subject: `KYC Application Status Update`,
      body: `Your identity verification status has been marked as ${status}.`
    });

    // Send Real-time alert to User using SocketService
    socketService.broadcastNotification(userIdStr, {
      title: 'KYC Status Update',
      message: `Your identity verification application has been ${status}.`,
      type: status === 'Approved' ? 'success' : 'error'
    });

    return kyc;
  }

  // 4. ADMIN GET ALL PENDING
  async getPendingKycs(): Promise<any[]> {
    return this.kycRepo.getPendingKycs();
  }
}
export default KycService;
