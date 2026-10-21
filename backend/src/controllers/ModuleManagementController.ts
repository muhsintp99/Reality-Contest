import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task';

// Data Stores for Admin Management Modules
let grandSeasons: any[] = [];
let questions: any[] = [];
let surveys: any[] = [];
let tasks: any[] = [];
let challenges: any[] = [];
let withdrawals: any[] = [];
let banners: any[] = [];
let cmsArticles: any[] = [];
let ads: any[] = [];
let coupons: any[] = [];
let fraudLogs: any[] = [];
let dailyContests: any[] = [];

export class ModuleManagementController {
  // Generic helper for standard REST endpoints
  private handleList(store: any[], req: Request, res: Response): Response {
    const { search, status } = req.query;
    let result = [...store];
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(item => JSON.stringify(item).toLowerCase().includes(q));
    }
    if (status && status !== 'All') {
      result = result.filter(item => item.status === status);
    }
    return res.json({ success: true, count: result.length, data: result });
  }

  // Grand Seasons CRUD
  listGrandSeasons = (req: Request, res: Response): Response => this.handleList(grandSeasons, req, res);
  createGrandSeason = (req: Request, res: Response): Response => {
    const newItem = { id: `GS-${Date.now()}`, _id: `GS-${Date.now()}`, ...req.body, status: req.body.status || 'Active', createdAt: new Date().toISOString() };
    grandSeasons.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };
  updateGrandSeason = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const index = grandSeasons.findIndex(i => i.id === id || i._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Season not found' });
    }
    grandSeasons[index] = { ...grandSeasons[index], ...req.body };
    return res.json({ success: true, data: grandSeasons[index] });
  };
  deleteGrandSeason = (req: Request, res: Response): Response => {
    const { id } = req.params;
    grandSeasons = grandSeasons.filter(i => i.id !== id && i._id !== id);
    return res.json({ success: true, message: 'Season deleted successfully' });
  };
  toggleGrandSeasonStatus = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const item = grandSeasons.find(i => i.id === id || i._id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Season not found' });
    }
    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
    return res.json({ success: true, data: item });
  };

  // Question Bank CRUD
  listQuestions = (req: Request, res: Response): Response => this.handleList(questions, req, res);
  createQuestion = (req: Request, res: Response): Response => {
    const newItem = { id: `Q-${Date.now()}`, _id: `Q-${Date.now()}`, ...req.body, status: req.body.status || 'Active' };
    questions.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };
  updateQuestion = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const index = questions.findIndex(i => i.id === id || i._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    questions[index] = { ...questions[index], ...req.body };
    return res.json({ success: true, data: questions[index] });
  };
  deleteQuestion = (req: Request, res: Response): Response => {
    const { id } = req.params;
    questions = questions.filter(i => i.id !== id && i._id !== id);
    return res.json({ success: true, message: 'Question deleted' });
  };
  toggleQuestionStatus = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const item = questions.find(i => i.id === id || i._id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
    return res.json({ success: true, data: item });
  };

  // Surveys CRUD
  listSurveys = (req: Request, res: Response): Response => this.handleList(surveys, req, res);
  createSurvey = (req: Request, res: Response): Response => {
    const newItem = { id: `SRV-${Date.now()}`, _id: `SRV-${Date.now()}`, ...req.body, responses: 0, status: req.body.status || 'Active' };
    surveys.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };
  updateSurvey = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const index = surveys.findIndex(i => i.id === id || i._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    surveys[index] = { ...surveys[index], ...req.body };
    return res.json({ success: true, data: surveys[index] });
  };
  deleteSurvey = (req: Request, res: Response): Response => {
    const { id } = req.params;
    surveys = surveys.filter(i => i.id !== id && i._id !== id);
    return res.json({ success: true, message: 'Survey deleted' });
  };
  toggleSurveyStatus = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const item = surveys.find(i => i.id === id || i._id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
    return res.json({ success: true, data: item });
  };

  // Tasks CRUD (Mongoose Model Integration)
  listTasks = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { search, status, page, limit } = req.query;
      const filter: any = {};
      if (status && status !== 'All') filter.status = status;
      if (search) {
        filter.$or = [
          { title: { $regex: String(search), $options: 'i' } },
          { description: { $regex: String(search), $options: 'i' } }
        ];
      }
      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = limit ? Math.max(1, Number(limit)) : 0;

      let query = Task.find(filter).sort({ order: 1, createdAt: -1 });
      if (limitNum > 0) {
        query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
      }
      const tasksList = await query;
      const total = await Task.countDocuments(filter);

      return res.json({
        success: true,
        count: tasksList.length,
        total,
        data: {
          tasks: tasksList,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum || total,
            totalPages: limitNum ? Math.ceil(total / limitNum) : 1
          }
        },
        tasks: tasksList
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  getTaskById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (!id || id === 'undefined' || id === 'null') {
        return res.status(400).json({ success: false, message: 'Invalid task ID parameter' });
      }

      let task = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        task = await Task.findById(id);
      }
      if (!task) {
        task = await Task.findOne({ title: id }).catch(() => null);
      }
      if (!task) {
        return res.status(404).json({ success: false, message: `Task not found with ID: ${id}` });
      }
      return res.json({ success: true, data: task, task });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  createTask = async (req: Request, res: Response): Promise<Response> => {
    try {
      const task = await Task.create({
        title: req.body.title,
        description: req.body.description || req.body.title,
        instructions: req.body.instructions || '',
        mediaUrl: req.body.mediaUrl || '',
        taskType: req.body.taskType || req.body.type || 'Quiz',
        submissionType: req.body.submissionType || 'Text',
        points: Number(req.body.points) || 0,
        bonusPoints: Number(req.body.bonusPoints) || 0,
        penaltyPoints: Number(req.body.penaltyPoints) || 0,
        maxAttempts: Number(req.body.maxAttempts) || 1,
        reviewType: req.body.reviewType === 'AI' || req.body.reviewType === 'AI Review' ? 'AI' : (req.body.reviewType === 'Auto' ? 'Auto' : 'Manual'),
        status: req.body.status || 'Published',
        isMandatory: req.body.isMandatory !== false,
        order: Number(req.body.order) || 1
      });
      return res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
        task
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  updateTask = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (!id || id === 'undefined' || id === 'null') {
        return res.status(400).json({ success: false, message: 'Invalid task ID parameter' });
      }

      let task = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        task = await Task.findById(id);
      }
      if (!task) {
        task = await Task.findOne({ title: id }).catch(() => null);
      }
      if (!task) {
        return res.status(404).json({ success: false, message: `Task not found with ID: ${id}` });
      }

      const updates: any = {};
      const allowedFields = [
        'title',
        'description',
        'instructions',
        'mediaUrl',
        'taskType',
        'submissionType',
        'points',
        'bonusPoints',
        'penaltyPoints',
        'maxAttempts',
        'reviewType',
        'status',
        'isMandatory',
        'order'
      ];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          if (field === 'points' || field === 'bonusPoints' || field === 'penaltyPoints' || field === 'maxAttempts' || field === 'order') {
            updates[field] = Number(req.body[field]) || 0;
          } else if (field === 'reviewType') {
            updates[field] = req.body.reviewType === 'AI' || req.body.reviewType === 'AI Review' ? 'AI' : (req.body.reviewType === 'Auto' ? 'Auto' : 'Manual');
          } else if (field === 'isMandatory') {
            updates[field] = req.body.isMandatory === true || req.body.isMandatory === 'true';
          } else {
            updates[field] = req.body[field];
          }
        }
      }

      Object.assign(task, updates);
      await task.save();

      return res.json({
        success: true,
        message: 'Task updated successfully',
        data: task,
        task
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  deleteTask = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (!id || id === 'undefined' || id === 'null') {
        return res.status(400).json({ success: false, message: 'Invalid task ID parameter' });
      }

      let deleted = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        deleted = await Task.findByIdAndDelete(id);
      }
      if (!deleted) {
        deleted = await Task.findOneAndDelete({ title: id }).catch(() => null);
      }
      if (!deleted) {
        return res.status(404).json({ success: false, message: `Task not found with ID: ${id}` });
      }
      return res.json({
        success: true,
        message: 'Task deleted successfully',
        data: { id: deleted._id || id }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  toggleTaskStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (!id || id === 'undefined' || id === 'null') {
        return res.status(400).json({ success: false, message: 'Invalid task ID parameter' });
      }

      let task = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        task = await Task.findById(id);
      }
      if (!task) {
        task = await Task.findOne({ title: id }).catch(() => null);
      }
      if (!task) {
        return res.status(404).json({ success: false, message: `Task not found with ID: ${id}` });
      }

      const newStatus = req.body?.status || (task.status === 'Published' || task.status === 'Running' ? 'Archived' : 'Published');
      task.status = newStatus;
      await task.save();

      return res.json({
        success: true,
        message: `Task status updated to ${task.status}`,
        data: task,
        task
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  // Challenges CRUD
  listChallenges = (req: Request, res: Response): Response => this.handleList(challenges, req, res);
  createChallenge = (req: Request, res: Response): Response => {
    const newItem = { id: `CHL-${Date.now()}`, _id: `CHL-${Date.now()}`, ...req.body, plays: '0', status: req.body.status || 'Active' };
    challenges.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };
  updateChallenge = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const index = challenges.findIndex(i => i.id === id || i._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    challenges[index] = { ...challenges[index], ...req.body };
    return res.json({ success: true, data: challenges[index] });
  };
  deleteChallenge = (req: Request, res: Response): Response => {
    const { id } = req.params;
    challenges = challenges.filter(i => i.id !== id && i._id !== id);
    return res.json({ success: true, message: 'Challenge deleted' });
  };
  toggleChallengeStatus = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const item = challenges.find(i => i.id === id || i._id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
    return res.json({ success: true, data: item });
  };

  // Withdrawals CRUD
  listWithdrawals = (req: Request, res: Response): Response => this.handleList(withdrawals, req, res);
  updateWithdrawalStatus = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const { status } = req.body;
    const item = withdrawals.find(i => i.id === id || i._id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
    }
    item.status = status;
    return res.json({ success: true, data: item });
  };

  // Banners CRUD
  listBanners = (req: Request, res: Response): Response => this.handleList(banners, req, res);
  createBanner = (req: Request, res: Response): Response => {
    const newItem = { id: `BNR-${Date.now()}`, _id: `BNR-${Date.now()}`, ...req.body, impressions: '0', status: req.body.status || 'Active' };
    banners.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };
  updateBanner = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const index = banners.findIndex(i => i.id === id || i._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    banners[index] = { ...banners[index], ...req.body };
    return res.json({ success: true, data: banners[index] });
  };
  deleteBanner = (req: Request, res: Response): Response => {
    const { id } = req.params;
    banners = banners.filter(i => i.id !== id && i._id !== id);
    return res.json({ success: true, message: 'Banner deleted' });
  };
  toggleBannerStatus = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const item = banners.find(i => i.id === id || i._id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
    return res.json({ success: true, data: item });
  };

  // Advertisements & Coupons CRUD
  listAds = (req: Request, res: Response): Response => this.handleList(ads, req, res);
  createAd = (req: Request, res: Response): Response => {
    const newItem = { id: `AD-${Date.now()}`, _id: `AD-${Date.now()}`, ...req.body, impressions: '0', status: 'Active' };
    ads.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };

  listCoupons = (req: Request, res: Response): Response => this.handleList(coupons, req, res);
  createCoupon = (req: Request, res: Response): Response => {
    const newItem = { ...req.body, used: 0, status: 'Active' };
    coupons.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };
  deleteCoupon = (req: Request, res: Response): Response => {
    const { code } = req.params;
    coupons = coupons.filter(i => i.code !== code);
    return res.json({ success: true, message: 'Coupon deleted' });
  };

  // CMS CRUD
  listCms = (req: Request, res: Response): Response => this.handleList(cmsArticles, req, res);
  updateCms = (req: Request, res: Response): Response => {
    const { type } = req.params;
    let item = cmsArticles.find(i => i.type === type);
    if (!item) {
      item = { id: `CMS-${Date.now()}`, _id: `CMS-${Date.now()}`, type, title: `${type} Article`, content: req.body.content, status: 'Active' };
      cmsArticles.push(item);
    } else {
      item.content = req.body.content || item.content;
    }
    return res.json({ success: true, data: item });
  };

  // Fraud Logs CRUD
  listFraudLogs = (req: Request, res: Response): Response => this.handleList(fraudLogs, req, res);

  // Daily Contests CRUD
  listDailyContests = (req: Request, res: Response): Response => this.handleList(dailyContests, req, res);
  createDailyContest = (req: Request, res: Response): Response => {
    const newItem = {
      id: `DLC-${Date.now()}`,
      _id: `DLC-${Date.now()}`,
      ...req.body,
      participants: 0,
      resetTimer: '24h 00m 00s',
      status: req.body.status || 'Active'
    };
    dailyContests.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };
  updateDailyContest = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const index = dailyContests.findIndex(i => i.id === id || i._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Daily contest not found' });
    }
    dailyContests[index] = { ...dailyContests[index], ...req.body };
    return res.json({ success: true, data: dailyContests[index] });
  };
  deleteDailyContest = (req: Request, res: Response): Response => {
    const { id } = req.params;
    dailyContests = dailyContests.filter(i => i.id !== id && i._id !== id);
    return res.json({ success: true, message: 'Daily contest deleted successfully' });
  };
  resetDailyContest = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const item = dailyContests.find(i => i.id === id || i._id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Daily contest not found' });
    }
    item.resetTimer = '24h 00m 00s';
    item.participants = 0;
    return res.json({ success: true, message: 'Daily contest timer and standings reset successfully', data: item });
  };
}

export const moduleManagementController = new ModuleManagementController();
