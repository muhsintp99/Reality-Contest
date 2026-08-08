import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
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

  async updatePool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pool = await questionService.updatePool(req.params.id, req.body);
      res.status(200).json({ success: true, pool });
    } catch (err) {
      next(err);
    }
  }

  async deletePool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await questionService.deletePool(req.params.id);
      res.status(200).json({ success: true, message: 'Question pool deleted successfully' });
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

  async createSingleQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const question = await questionService.createSingleQuestion(req.body);
      res.status(201).json({ success: true, question });
    } catch (err) {
      next(err);
    }
  }

  async listQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let poolId: string | undefined = req.params.poolId || (req.query.poolId as string);
      if (poolId === 'questions' || poolId === 'all-questions' || poolId === 'all' || (poolId && !mongoose.Types.ObjectId.isValid(poolId))) {
        poolId = undefined;
      }
      const questions = await questionService.listQuestions(poolId);
      res.status(200).json({ success: true, questions });
    } catch (err) {
      next(err);
    }
  }

  async updateQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const question = await questionService.updateQuestion(req.params.id, req.body);
      res.status(200).json({ success: true, question });
    } catch (err) {
      next(err);
    }
  }

  async deleteQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await questionService.deleteQuestion(req.params.id);
      res.status(200).json({ success: true, message: 'Question deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async clearAllQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await questionService.clearAllQuestions();
      res.status(200).json({ success: true, message: 'All questions and pools successfully cleared.' });
    } catch (err) {
      next(err);
    }
  }

  async importQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const poolId = req.params.poolId;
      const { rows } = req.body;
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

  async bulkImportQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, questions } = req.body;
      const questionList = Array.isArray(questions) ? questions : (Array.isArray(req.body) ? req.body : []);
      if (!Array.isArray(questionList) || questionList.length === 0) {
        res.status(400).json({ success: false, message: 'Invalid payload: questions array is required.' });
        return;
      }
      const result = await questionService.bulkImportQuestions(category || 'General Knowledge', questionList);
      res.status(200).json({ success: true, message: 'Questions imported successfully.', ...result });
    } catch (err) {
      next(err);
    }
  }
}

export const questionController = new QuestionController();
export default questionController;
