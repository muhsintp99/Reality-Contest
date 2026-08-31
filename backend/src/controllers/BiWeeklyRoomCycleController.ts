import { Request, Response, NextFunction } from 'express';
import { biWeeklyRoomCycleService } from '../services/BiWeeklyRoomCycleService';
import { logger } from '../core/logger';

export class BiWeeklyRoomCycleController {
  // ================= ROOMS =================
  async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const room = await biWeeklyRoomCycleService.createRoom(req.body);
      return res.status(201).json({ success: true, message: 'Room created successfully', data: room });
    } catch (err: any) {
      return next(err);
    }
  }

  async getRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await biWeeklyRoomCycleService.getRooms(req.query);
      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return next(err);
    }
  }

  async getRoomById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await biWeeklyRoomCycleService.getRoomById(req.params.id);
      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return next(err);
    }
  }

  async updateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const room = await biWeeklyRoomCycleService.updateRoom(req.params.id, req.body);
      return res.status(200).json({ success: true, message: 'Room updated successfully', data: room });
    } catch (err: any) {
      return next(err);
    }
  }

  async deleteRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const room = await biWeeklyRoomCycleService.deleteRoom(req.params.id);
      return res.status(200).json({ success: true, message: 'Room deleted successfully', data: room });
    } catch (err: any) {
      return next(err);
    }
  }

  async bulkRoomAction(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomIds, action } = req.body;
      const result = await biWeeklyRoomCycleService.bulkRoomAction(roomIds, action);
      return res.status(200).json({ success: true, message: `Bulk action ${action} executed`, data: result });
    } catch (err: any) {
      return next(err);
    }
  }

  // ================= MEMBERS =================
  async assignMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId, userIds, role } = req.body;
      const result = await biWeeklyRoomCycleService.assignMembersToRoom(roomId, userIds, role);
      return res.status(200).json({ success: true, message: 'Members assigned successfully', data: result });
    } catch (err: any) {
      return next(err);
    }
  }

  async randomAssign(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;
      const result = await biWeeklyRoomCycleService.randomAssignUsers(userIds);
      return res.status(200).json({ success: true, message: 'Random assignment completed', data: result });
    } catch (err: any) {
      return next(err);
    }
  }

  async transferMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, fromRoomId, toRoomId } = req.body;
      const result = await biWeeklyRoomCycleService.transferMember(userId, fromRoomId, toRoomId);
      return res.status(200).json({ success: true, message: 'Member transferred successfully', data: result });
    } catch (err: any) {
      return next(err);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId, userId } = req.params;
      const result = await biWeeklyRoomCycleService.removeMember(roomId, userId);
      return res.status(200).json({ success: true, message: 'Member removed from room', data: result });
    } catch (err: any) {
      return next(err);
    }
  }

  // ================= CYCLES =================
  async getCycles(req: Request, res: Response, next: NextFunction) {
    try {
      const cycles = await biWeeklyRoomCycleService.getCycles();
      return res.status(200).json({ success: true, data: cycles });
    } catch (err: any) {
      return next(err);
    }
  }

  async setActiveCycle(req: Request, res: Response, next: NextFunction) {
    try {
      const cycle = await biWeeklyRoomCycleService.setActiveCycle(req.params.id);
      return res.status(200).json({ success: true, message: 'Active cycle updated', data: cycle });
    } catch (err: any) {
      return next(err);
    }
  }

  async updateCycle(req: Request, res: Response, next: NextFunction) {
    try {
      const cycle = await biWeeklyRoomCycleService.updateCycle(req.params.id, req.body);
      return res.status(200).json({ success: true, message: 'Cycle updated', data: cycle });
    } catch (err: any) {
      return next(err);
    }
  }

  // ================= TASKS =================
  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await biWeeklyRoomCycleService.createTask(req.body);
      return res.status(201).json({ success: true, message: 'Task created successfully', data: task });
    } catch (err: any) {
      return next(err);
    }
  }

  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await biWeeklyRoomCycleService.getTasks(req.query);
      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return next(err);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await biWeeklyRoomCycleService.updateTask(req.params.id, req.body);
      return res.status(200).json({ success: true, message: 'Task updated successfully', data: task });
    } catch (err: any) {
      return next(err);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await biWeeklyRoomCycleService.deleteTask(req.params.id);
      return res.status(200).json({ success: true, message: 'Task deleted successfully', data: task });
    } catch (err: any) {
      return next(err);
    }
  }

  // ================= SUBMISSIONS =================
  async getSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await biWeeklyRoomCycleService.getSubmissions(req.query);
      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return next(err);
    }
  }

  async reviewSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const reviewerId = (req as any).user ? (req as any).user.id : (req as any).user._id;
      const submission = await biWeeklyRoomCycleService.reviewSubmission(req.params.id, reviewerId, req.body);
      return res.status(200).json({ success: true, message: 'Submission review recorded', data: submission });
    } catch (err: any) {
      return next(err);
    }
  }

  // ================= LEADERBOARD =================
  async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { scope = 'Room', cycleId, roomId } = req.query;
      const data = await biWeeklyRoomCycleService.getLeaderboard(scope as any, cycleId as string, roomId as string);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return next(err);
    }
  }

  async recalculateLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { cycleId } = req.body;
      await biWeeklyRoomCycleService.recalculateLeaderboard(cycleId);
      return res.status(200).json({ success: true, message: 'Leaderboard recalculation completed' });
    } catch (err: any) {
      return next(err);
    }
  }

  // ================= REWARDS =================
  async createRewardRule(req: Request, res: Response, next: NextFunction) {
    try {
      const reward = await biWeeklyRoomCycleService.createRewardRule(req.body);
      return res.status(201).json({ success: true, message: 'Reward rule created', data: reward });
    } catch (err: any) {
      return next(err);
    }
  }

  async getRewards(req: Request, res: Response, next: NextFunction) {
    try {
      const rewards = await biWeeklyRoomCycleService.getRewards();
      return res.status(200).json({ success: true, data: rewards });
    } catch (err: any) {
      return next(err);
    }
  }

  async distributeRewards(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await biWeeklyRoomCycleService.distributeRewards();
      return res.status(200).json({ success: true, message: 'Rewards distribution executed', data: result });
    } catch (err: any) {
      return next(err);
    }
  }

  // ================= SETTINGS & DASHBOARD =================
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await biWeeklyRoomCycleService.getSettings();
      return res.status(200).json({ success: true, data: settings });
    } catch (err: any) {
      return next(err);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await biWeeklyRoomCycleService.updateSettings(req.body);
      return res.status(200).json({ success: true, message: 'Settings updated successfully', data: settings });
    } catch (err: any) {
      return next(err);
    }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await biWeeklyRoomCycleService.getAnalyticsDashboard();
      return res.status(200).json({ success: true, data: analytics });
    } catch (err: any) {
      return next(err);
    }
  }
}

export const biWeeklyRoomCycleController = new BiWeeklyRoomCycleController();
