import { Request, Response, NextFunction } from 'express';
import { questionService } from '../services/QuestionService';

export class QuestionController {
  async createPool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pool = await questionService.createPool(req.body);
      res.status(201).json({ success: true, pool });
    } catch (err) {
      next(err);
    }
  }

  async listPools(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pools = await questionService.listPools();
      res.status(200).json({ success: true, pools });
    } catch (err) {
      next(err);
    }
  }

  async addQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const question = await questionService.addQuestion(req.params.poolId, req.body);
      res.status(201).json({ success: true, question });
    } catch (err) {
      next(err);
    }
  }

  async listQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const questions = await questionService.listQuestions(req.params.poolId);
      res.status(200).json({ success: true, questions });
    } catch (err) {
      next(err);
    }
  }

  async importQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const poolId = req.params.poolId;
      const { rows } = req.body; // Expect array of row objects
      if (!Array.isArray(rows)) {
        res.status(400).json({ success: false, message: 'Invalid payload: rows must be an array.' });
        return;
      }
      const result = await questionService.importQuestions(poolId, rows);
      res.status(200).json({ success: true, message: 'Questions imported successfully.', ...result });
    } catch (err) {
      next(err);
    }
  }
}
export const questionController = new QuestionController();
export default questionController;
