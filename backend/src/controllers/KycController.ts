import { Response, NextFunction } from 'express';
import { KycService } from '../services/KycService';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import { UnauthorizedError } from '../core/errors';

const kycService = new KycService();

export class KycController {
  // 1. SUBMIT KYC
  async submitKYC(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const kyc = await kycService.submitKyc(req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: 'KYC application submitted successfully. AI facial verification processing.',
        kyc
      });
    } catch (err) {
      next(err);
    }
  }

  // 2. GET KYC STATUS
  async getKYCStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const kyc = await kycService.getKycStatus(req.user.id);
      res.status(200).json({ success: true, kyc });
    } catch (err) {
      next(err);
    }
  }

  // 3. ADMIN REVIEW KYC
  async reviewKYC(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { kycId, status, rejectionReason } = req.body;
      const kyc = await kycService.reviewKyc(req.user.id, { kycId, status, rejectionReason });
      res.status(200).json({
        success: true,
        message: `KYC status marked: ${status} successfully.`,
        kyc
      });
    } catch (err) {
      next(err);
    }
  }

  // 4. ADMIN GET ALL PENDING
  async getPendingKYCs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const kycs = await kycService.getPendingKycs();
      res.status(200).json({ success: true, kycs });
    } catch (err) {
      next(err);
    }
  }
}

export const kycController = new KycController();
export default kycController;
