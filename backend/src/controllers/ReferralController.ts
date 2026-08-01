import { Request, Response, NextFunction } from 'express';
import { ReferralRule, ReferralTransaction, ReferralAbuseLog } from '../models/Referral';
import { NotFoundError, BadRequestError } from '../core/errors';

export class ReferralController {
  // GET /api/admin/referrals/rules
  async getRules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let rule = await ReferralRule.findOne();
      if (!rule) {
        rule = await ReferralRule.create({});
      }
      res.status(200).json({ success: true, rule });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/admin/referrals/rules
  async updateRules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let rule = await ReferralRule.findOne();
      if (!rule) {
        rule = await ReferralRule.create(req.body);
      } else {
        rule = await ReferralRule.findByIdAndUpdate(rule._id, req.body, { new: true });
      }
      res.status(200).json({ success: true, message: 'Referral rules updated successfully.', rule });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/referrals/earnings
  async listEarnings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, search } = req.query;
      const query: any = {};

      if (status && status !== 'All') {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { referrerCode: { $regex: search as string, $options: 'i' } },
          { referrerUser: { $regex: search as string, $options: 'i' } },
          { referredUser: { $regex: search as string, $options: 'i' } }
        ];
      }

      const earnings = await ReferralTransaction.find(query).sort({ createdAt: -1 });
      res.status(200).json({ success: true, count: earnings.length, earnings });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/referrals/abuse
  async listAbuseLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, search } = req.query;
      const query: any = {};

      if (status && status !== 'All') {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { userName: { $regex: search as string, $options: 'i' } },
          { ipAddress: { $regex: search as string, $options: 'i' } },
          { fraudReason: { $regex: search as string, $options: 'i' } }
        ];
      }

      const abuseLogs = await ReferralAbuseLog.find(query).sort({ riskScore: -1 });
      res.status(200).json({ success: true, count: abuseLogs.length, abuseLogs });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/admin/referrals/abuse/:id/action
  async updateAbuseStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'Banned', 'Dismissed', 'Flagged'

      if (!action) {
        throw new BadRequestError('Abuse action status is required.');
      }

      const log = await ReferralAbuseLog.findByIdAndUpdate(id, { status: action }, { new: true });
      if (!log) throw new NotFoundError('Referral abuse log entry not found.');

      res.status(200).json({ success: true, message: `Referral abuse entry marked as ${action}.`, log });
    } catch (err) {
      next(err);
    }
  }
}

export const referralController = new ReferralController();
export default referralController;
