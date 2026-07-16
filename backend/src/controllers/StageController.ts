import { Request, Response, NextFunction } from 'express';
import { stageService } from '../services/StageService';

export class StageController {
  async createStage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stage = await stageService.createStage(req.body);
      res.status(201).json({ success: true, stage });
    } catch (err) {
      next(err);
    }
  }

  async acceptRules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const stageId = req.params.id;

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const deviceInfo = req.body.deviceInfo || req.headers['user-agent'] || 'Unknown Device';
      const browser = req.body.browser || 'Unknown Browser';

      const attempt = await stageService.acceptStageRules(userId, stageId, {
        ipAddress,
        deviceInfo,
        browser
      });

      res.status(200).json({ success: true, attempt });
    } catch (err) {
      next(err);
    }
  }

  async startAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const stageId = req.params.id;

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const deviceInfo = req.body.deviceInfo || req.headers['user-agent'] || 'Unknown Device';
      const browser = req.body.browser || 'Unknown Browser';

      const result = await stageService.startStageAttempt(userId, stageId, {
        ipAddress,
        deviceInfo,
        browser
      });

      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async submitAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const stageId = req.params.id;

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const deviceInfo = req.body.deviceInfo || req.headers['user-agent'] || 'Unknown Device';
      const browser = req.body.browser || 'Unknown Browser';

      const { answers, cheatAlerts } = req.body;

      const result = await stageService.submitStageAttempt(userId, stageId, {
        answers,
        cheatAlerts,
        ipAddress,
        deviceInfo,
        browser
      });

      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async checkUnlockStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const stageId = req.params.id;
      const status = await stageService.checkStageUnlockStatus(userId, stageId);
      res.status(200).json({ success: true, ...status });
    } catch (err) {
      next(err);
    }
  }

  async getStagesByGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stages = await stageService.getStagesByGroup(req.params.groupId);
      res.status(200).json({ success: true, stages });
    } catch (err) {
      next(err);
    }
  }
  async getStagesByContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stages = await stageService.getStagesByContest(req.params.contestId);
      res.status(200).json({ success: true, stages });
    } catch (err) {
      next(err);
    }
  }

  async createStageForContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stage = await stageService.createStageForContest(req.params.contestId, req.body);
      res.status(201).json({ success: true, stage });
    } catch (err) {
      next(err);
    }
  }
}
export const stageController = new StageController();
export default stageController;
