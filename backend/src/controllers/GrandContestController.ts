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

  async joinGrandContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const result = await grandContestService.joinGrandContest(req.params.id, userId);
      res.status(200).json({ success: true, message: 'Joined Grand Contest successfully', data: result });
    } catch (err) {
      next(err);
    }
  }

  // ================= TASKS & SUBMISSIONS =================
  async getGrandContestTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await grandContestService.getTasksForGrandContest(req.params.id);
      res.status(200).json({ success: true, data: tasks });
    } catch (err) {
      next(err);
    }
  }

  async createGrandContestTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await grandContestService.createTaskForGrandContest(req.params.id, req.body);
      res.status(201).json({ success: true, message: 'Task created and linked to Grand Contest', data: task });
    } catch (err) {
      next(err);
    }
  }

  async removeGrandContestTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contest = await grandContestService.removeTaskFromGrandContest(req.params.id, req.params.taskId);
      res.status(200).json({ success: true, message: 'Task unlinked from Grand Contest', data: contest });
    } catch (err) {
      next(err);
    }
  }

  async getGrandContestSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await grandContestService.getGrandContestSubmissions(req.params.id, req.query);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async submitGrandContestTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const submission = await grandContestService.submitGrandContestTask(req.params.id, req.params.taskId, userId, req.body);
      res.status(201).json({ success: true, message: 'Task proof submitted successfully', data: submission });
    } catch (err) {
      next(err);
    }
  }

  async reviewGrandContestSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviewerId = (req as any).user?.id || (req as any).user?._id;
      const submission = await grandContestService.reviewGrandContestSubmission(req.params.id, reviewerId, req.body);
      res.status(200).json({ success: true, message: 'Submission review recorded', data: submission });
    } catch (err) {
      next(err);
    }
  }
}

export const grandContestController = new GrandContestController();

