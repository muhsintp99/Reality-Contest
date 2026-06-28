import { Request, Response, NextFunction } from 'express';
import { contestService } from '../services/ContestService';

export class ContestController {
  async createContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contest = await contestService.createContest(req.body);
      res.status(201).json({ success: true, contest });
    } catch (err) {
      next(err);
    }
  }

  async listContests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contests = await contestService.listContests(req.query);
      res.status(200).json({ success: true, contests });
    } catch (err) {
      next(err);
    }
  }

  async getContestDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contest = await contestService.getContestById(req.params.id);
      res.status(200).json({ success: true, contest });
    } catch (err) {
      next(err);
    }
  }

  async joinContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const contestId = req.params.id;
      const result = await contestService.joinContest(contestId, userId);
      res.status(200).json({ message: 'Joined contest successfully!', ...result });
    } catch (err) {
      next(err);
    }
  }
}
export const contestController = new ContestController();
export default contestController;
