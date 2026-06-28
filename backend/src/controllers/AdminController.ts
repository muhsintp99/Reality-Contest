import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Result } from '../models/Result';
import { AuditLog } from '../models/AuditLog';
import { NotFoundError } from '../core/errors';

export class AdminController {
  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
      res.status(200).json({ success: true, logs });
    } catch (err) {
      next(err);
    }
  }

  async manualApproveQualification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { resultId, status } = req.body;
      const result = await Result.findById(resultId);
      if (!result) {
        throw new NotFoundError('Result record not found.');
      }

      result.status = status;
      if (status === 'Qualified') {
        result.passed = true;
      } else {
        result.passed = false;
      }
      await result.save();

      res.status(200).json({ success: true, message: `Result manual override successful: marked ${status}.`, result });
    } catch (err) {
      next(err);
    }
  }

  async listUsersByRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.params;
      const users = await User.find({ role }).select('-password');
      res.status(200).json({ success: true, users });
    } catch (err) {
      next(err);
    }
  }

  async promoteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, role } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        throw new NotFoundError('User not found.');
      }
      user.role = role;
      await user.save();

      await AuditLog.create({
        userId: (req as any).user.id,
        action: 'Promote User',
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        deviceInfo: req.headers['user-agent'] || 'Unknown Device',
        browser: 'Unknown Browser',
        details: `Promoted user ${email} to role: ${role}`
      });

      res.status(200).json({ success: true, message: `User ${email} promoted to role: ${role} successfully.`, user });
    } catch (err) {
      next(err);
    }
  }
}
export const adminController = new AdminController();
export default adminController;
