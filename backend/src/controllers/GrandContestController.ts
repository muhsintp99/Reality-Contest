import { Request, Response, NextFunction } from 'express';
import { grandContestService } from '../services/GrandContestService';

export class GrandContestController {
  async createGrandContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contest = await grandContestService.createGrandContest(req.body);
      res.status(201).json({ success: true, message: 'Grand Contest created successfully', data: contest });
    } catch (err) {
      next(err);
    }
  }

  async listGrandContests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await grandContestService.listGrandContests(req.query);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getGrandContestDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contest = await grandContestService.getGrandContestById(req.params.id);
      res.status(200).json({ success: true, data: contest });
    } catch (err) {
      next(err);
    }
  }

  async updateGrandContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contest = await grandContestService.updateGrandContest(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Grand Contest updated successfully', data: contest });
    } catch (err) {
      next(err);
    }
  }

  async duplicateGrandContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contest = await grandContestService.duplicateGrandContest(req.params.id);
      res.status(201).json({ success: true, message: 'Grand Contest duplicated successfully', data: contest });
    } catch (err) {
      next(err);
    }
  }

  async deleteGrandContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contest = await grandContestService.deleteGrandContest(req.params.id);
      res.status(200).json({ success: true, message: 'Grand Contest deleted successfully', data: contest });
    } catch (err) {
      next(err);
    }
  }

  async getGrandContestAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await grandContestService.getGrandContestAnalytics(req.params.id);
      res.status(200).json({ success: true, data: analytics });
    } catch (err) {
      next(err);
    }
  }
}

export const grandContestController = new GrandContestController();
