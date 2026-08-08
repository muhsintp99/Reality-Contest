import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { DailyContest } from '../models/DailyContests';

const getQueryForId = (id: string) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { dailyContestId: id }] };
  }
  return { dailyContestId: id };
};

export class DailyContestsController {
  async listDailyContests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, status, search } = req.query;
      let query: any = {};

      if (category && category !== 'All') query.category = category;
      if (status && status !== 'All') query.status = status;
      if (search) {
        query.title = { $regex: String(search), $options: 'i' };
      }

      const dailyContests = await DailyContest.find(query).sort({ createdAt: -1 }).exec();

      res.status(200).json({
        success: true,
        count: dailyContests ? dailyContests.length : 0,
        data: dailyContests || []
      });
    } catch (err) {
      res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
  }

  async getDailyContestDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const contest = await DailyContest.findOne(getQueryForId(id)).exec();
      res.status(200).json({ success: true, data: contest || null });
    } catch (err) {
      next(err);
    }
  }

  async createDailyContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        title, category, categories, entryFee, prizePool, timerLimit,
        questionsCount, difficulty, description, rules, imageUrl, videoUrl,
        fileAttachmentUrl, status, isActive, dailyStartTime, dailyEndTime, resetIntervalHours
      } = req.body;
      
      const dailyContestId = `DLC-${Date.now()}`;

      const newContest = new DailyContest({
        dailyContestId,
        title: title || 'Daily Battle 2026',
        category: category || (categories && categories[0]) || 'Speed Battle',
        categories: categories || (category ? [category] : ['Speed Battle']),
        entryFee: Number(entryFee) || 0,
        prizePool: Number(prizePool) || 10000,
        timerLimit: timerLimit || '3 mins',
        questionsCount: Number(questionsCount) || 20,
        difficulty: difficulty || 'Medium',
        description: description || '',
        rules: rules || '',
        imageUrl: imageUrl || '',
        videoUrl: videoUrl || '',
        fileAttachmentUrl: fileAttachmentUrl || '',
        status: status || 'Registration Open',
        isActive: isActive !== false,
        dailyStartTime: dailyStartTime || '09:00 AM',
        dailyEndTime: dailyEndTime || '11:59 PM',
        resetIntervalHours: Number(resetIntervalHours) || 24,
        lastResetAt: new Date(),
        nextResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      await newContest.save();
      res.status(201).json({ success: true, data: newContest });
    } catch (err) {
      next(err);
    }
  }

  async updateDailyContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await DailyContest.findOneAndUpdate(getQueryForId(id), req.body, { new: true }).exec();
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async deleteDailyContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await DailyContest.findOneAndDelete(getQueryForId(id)).exec();
      res.status(200).json({ success: true, message: 'Daily contest deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async resetDailyContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const contest = await DailyContest.findOne(getQueryForId(id)).exec();
      if (contest) {
        contest.lastResetAt = new Date();
        contest.nextResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        contest.participantsCount = 0;
        contest.participants = [];
        await contest.save();
      }
      res.status(200).json({ success: true, message: 'Daily contest reset completed successfully' });
    } catch (err) {
      next(err);
    }
  }

  async joinDailyContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const contest = await DailyContest.findOne(getQueryForId(id)).exec();
      if (contest) {
        contest.participantsCount = (contest.participantsCount || 0) + 1;
        await contest.save();
      }
      res.status(200).json({ success: true, message: 'Joined daily contest successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const dailyContestsController = new DailyContestsController();
export default dailyContestsController;
