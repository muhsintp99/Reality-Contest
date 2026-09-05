import mongoose from 'mongoose';
import Room, { IRoom } from '../models/Room';
import Cycle, { ICycle } from '../models/Cycle';
import RoomSubmission, { IRoomSubmission } from '../models/RoomSubmission';
import RoomLeaderboard, { IRoomLeaderboard } from '../models/RoomLeaderboard';
import RoomReward, { IRoomReward } from '../models/RoomReward';
import RoomMember, { IRoomMember } from '../models/RoomMember';
import CycleLog from '../models/CycleLog';
import RoomCycleSettings from '../models/RoomCycleSettings';
import User from '../models/User';
import Wallet from '../models/Transaction';
import { socketService } from './SocketService';
import { logger } from '../core/logger';
import { saveBase64File } from '../controllers/UploadController';

export class BiWeeklyRoomCycleService {
  // ================= ROOM MANAGEMENT =================
  async createRoom(data: Partial<IRoom>) {
    const count = await Room.countDocuments();
    const code = `RM-${String(count + 1).padStart(3, '0')}`;

    const roomImage = data.roomImage ? saveBase64File(data.roomImage, 'room', 'image') : '';
    const cycleIds = Array.isArray(data.cycleIds) ? data.cycleIds : [];

    const room = await Room.create({
      code,
      name: data.name,
      description: data.description || '',
      rules: data.rules || '',
      guidelines: data.guidelines || '',
      durationDays: Number(data.durationDays) || 14,
      maxMembers: data.maxMembers || 50,
      cycleIds,
      roomImage,
      status: data.status || 'Active',
      autoAssignment: data.autoAssignment !== undefined ? data.autoAssignment : true
    });

    if (cycleIds.length > 0) {
      await Cycle.updateMany(
        { _id: { $in: cycleIds } },
        { roomId: room._id }
      ).catch(() => null);
    }

    await CycleLog.create({
      eventType: 'AUTO_ASSIGNMENT',
      roomId: room._id as mongoose.Types.ObjectId,
      message: `Room ${room.name} (${room.code}) created successfully.`
    });

    return room;
  }

  async getRooms(query: any) {
    const { search, status, page = 1, limit = 10, sortBy = 'createdDate', sortOrder = 'desc' } = query;
    const filter: any = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const rooms = await Room.find(filter)
      .populate('cycleIds', 'cycleNumber title status startDate endDate')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    const roomList = [];
    for (const rm of rooms) {
      if (rm.roomImage && rm.roomImage.startsWith('data:')) {
        const savedUrl = saveBase64File(rm.roomImage, 'room', 'image');
        rm.roomImage = savedUrl;
        await Room.findByIdAndUpdate(rm._id, { roomImage: savedUrl }).catch(() => null);
      }

      // Top Scorer / Leaderboard highlight
      const topMemberObj = await RoomMember.findOne({ roomId: rm._id, status: 'Active' })
        .populate('userId', 'name avatar email')
        .sort({ accumulatedPoints: -1 });

      const topMember = topMemberObj && (topMemberObj.userId as any) ? {
        name: (topMemberObj.userId as any).name || 'User',
        avatar: (topMemberObj.userId as any).avatar || '',
        points: topMemberObj.accumulatedPoints || 0
      } : null;

      // Submissions Analytics
      const totalSubmissions = await RoomSubmission.countDocuments({ roomId: rm._id });
      const approvedSubmissions = await RoomSubmission.countDocuments({ roomId: rm._id, status: 'Approved' });
      const rejectedSubmissions = await RoomSubmission.countDocuments({ roomId: rm._id, status: 'Rejected' });
      const completionRate = totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0;

      const activeTasksCount = 0;

      const rmObj = rm.toObject();
      (rmObj as any).topMember = topMember;
      (rmObj as any).analytics = {
        totalSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        completionRate,
        activeTasksCount
      };

      roomList.push(rmObj);
    }

    const total = await Room.countDocuments(filter);

    return {
      rooms: roomList,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  async getRoomById(roomId: string) {
    const room = await Room.findById(roomId).populate('cycleIds', 'cycleNumber title status startDate endDate');
    if (!room) throw new Error('Room not found');

    const members = await RoomMember.find({ roomId, status: 'Active' })
      .populate('userId', 'name email avatar phone')
      .sort({ accumulatedPoints: -1 });

    const totalSubmissions = await RoomSubmission.countDocuments({ roomId });
    const approvedSubmissions = await RoomSubmission.countDocuments({ roomId, status: 'Approved' });
    const rejectedSubmissions = await RoomSubmission.countDocuments({ roomId, status: 'Rejected' });
    const pendingSubmissions = await RoomSubmission.countDocuments({ roomId, status: 'Pending' });
    const completionRate = totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0;

    const activeTasksCount = 0;

    const analytics = {
      totalSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      pendingSubmissions,
      completionRate,
      activeTasksCount
    };

    return { room, members, analytics };
  }

  async updateRoom(roomId: string, data: Partial<IRoom>) {
    const updateData = { ...data };
    if (updateData.roomImage) {
      updateData.roomImage = saveBase64File(updateData.roomImage, 'room', 'image');
    }

    const room = await Room.findByIdAndUpdate(roomId, updateData, { new: true }).populate(
      'cycleIds',
      'cycleNumber title status startDate endDate'
    );
    if (!room) throw new Error('Room not found');

    if (data.cycleIds && Array.isArray(data.cycleIds)) {
      const newCycleIds = data.cycleIds.map((id: any) => id.toString());
      await Cycle.updateMany(
        { _id: { $in: newCycleIds } },
        { roomId: roomId }
      ).catch(() => null);
      await Cycle.updateMany(
        { roomId: roomId, _id: { $nin: newCycleIds } },
        { $unset: { roomId: 1 } }
      ).catch(() => null);
    }

    return room;
  }

  async deleteRoom(roomId: string) {
    const room = await Room.findByIdAndDelete(roomId);
    if (!room) throw new Error('Room not found');
    await RoomMember.deleteMany({ roomId });
    return room;
  }

  async bulkRoomAction(roomIds: string[], action: 'Archive' | 'Activate' | 'Deactivate' | 'Delete') {
    if (action === 'Delete') {
      await Room.deleteMany({ _id: { $in: roomIds } });
      await RoomMember.deleteMany({ roomId: { $in: roomIds } });
    } else {
      const statusMap: Record<string, string> = {
        Archive: 'Archived',
        Activate: 'Active',
        Deactivate: 'Inactive'
      };
      await Room.updateMany({ _id: { $in: roomIds } }, { status: statusMap[action] });
    }
    return { success: true, count: roomIds.length };
  }

  // ================= MEMBER ASSIGNMENT =================
  async assignMembersToRoom(roomId: string, userIds: string[], role: 'Leader' | 'Member' = 'Member') {
    const room = await Room.findById(roomId);
    if (!room) throw new Error('Room not found');

    const currentCount = await RoomMember.countDocuments({ roomId, status: 'Active' });
    if (currentCount + userIds.length > room.maxMembers) {
      throw new Error(`Capacity limit exceeded! Max allowed: ${room.maxMembers}, Current: ${currentCount}`);
    }

    const operations = userIds.map((userId) => ({
      updateOne: {
        filter: { roomId, userId },
        update: { roomId, userId, role, status: 'Active' },
        upsert: true
      }
    }));

    await RoomMember.bulkWrite(operations);
    const updatedMembersCount = await RoomMember.countDocuments({ roomId, status: 'Active' });
    await Room.findByIdAndUpdate(roomId, { membersCount: updatedMembersCount });

    return { success: true, assignedCount: userIds.length, totalMembers: updatedMembersCount };
  }

  async randomAssignUsers(userIds: string[]) {
    const activeRooms = await Room.find({ status: 'Active' });
    if (!activeRooms.length) throw new Error('No active rooms available for assignment.');

    let roomIdx = 0;
    let assigned = 0;

    for (const userId of userIds) {
      const targetRoom = activeRooms[roomIdx % activeRooms.length];
      const count = await RoomMember.countDocuments({ roomId: targetRoom._id, status: 'Active' });

      if (count < targetRoom.maxMembers) {
        await RoomMember.findOneAndUpdate(
          { roomId: targetRoom._id, userId },
          { roomId: targetRoom._id, userId, role: 'Member', status: 'Active' },
          { upsert: true }
        );
        await Room.findByIdAndUpdate(targetRoom._id, { $inc: { membersCount: 1 } });
        assigned++;
      }
      roomIdx++;
    }

    return { success: true, assigned };
  }

  async transferMember(userId: string, fromRoomId: string, toRoomId: string) {
    const toRoom = await Room.findById(toRoomId);
    if (!toRoom) throw new Error('Destination room not found');

    const count = await RoomMember.countDocuments({ roomId: toRoomId, status: 'Active' });
    if (count >= toRoom.maxMembers) {
      throw new Error('Destination room is already at full capacity');
    }

    await RoomMember.findOneAndUpdate(
      { roomId: fromRoomId, userId },
      { status: 'Transferred', transferredToRoomId: toRoomId }
    );

    await RoomMember.create({
      roomId: toRoomId,
      userId,
      role: 'Member',
      status: 'Active'
    });

    await Room.findByIdAndUpdate(fromRoomId, { $inc: { membersCount: -1 } });
    await Room.findByIdAndUpdate(toRoomId, { $inc: { membersCount: 1 } });

    return { success: true };
  }

  async removeMember(roomId: string, userId: string) {
    await RoomMember.findOneAndUpdate({ roomId, userId }, { status: 'Removed' });
    await Room.findByIdAndUpdate(roomId, { $inc: { membersCount: -1 } });
    return { success: true };
  }

  // ================= CYCLE MANAGEMENT =================
  async getCycles(): Promise<any[]> {
    const cycles: any[] = await Cycle.find().sort({ cycleNumber: 1 });
    for (const cycle of cycles) {
      let updated = false;
      if (cycle.coverImage && cycle.coverImage.startsWith('data:')) {
        cycle.coverImage = saveBase64File(cycle.coverImage, 'cycle', 'cover');
        updated = true;
      }
      if (cycle.promoVideoUrl && cycle.promoVideoUrl.startsWith('data:')) {
        cycle.promoVideoUrl = saveBase64File(cycle.promoVideoUrl, 'cycle', 'video');
        updated = true;
      }
      if (cycle.rulesPdfUrl && cycle.rulesPdfUrl.startsWith('data:')) {
        cycle.rulesPdfUrl = saveBase64File(cycle.rulesPdfUrl, 'cycle', 'pdf');
        updated = true;
      }
      if (updated) {
        await Cycle.findByIdAndUpdate(cycle._id, {
          coverImage: cycle.coverImage,
          promoVideoUrl: cycle.promoVideoUrl,
          rulesPdfUrl: cycle.rulesPdfUrl
        }).catch(() => null);
      }
    }
    return cycles;
  }

  async getCycleById(cycleId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(cycleId)) {
      throw new Error('Cycle not found');
    }
    const cycle: any = await Cycle.findById(cycleId).populate('roomId', 'name category status');
    if (!cycle) throw new Error('Cycle not found');

    let updated = false;
    if (cycle.coverImage && cycle.coverImage.startsWith('data:')) {
      cycle.coverImage = saveBase64File(cycle.coverImage, 'cycle', 'cover');
      updated = true;
    }
    if (cycle.promoVideoUrl && cycle.promoVideoUrl.startsWith('data:')) {
      cycle.promoVideoUrl = saveBase64File(cycle.promoVideoUrl, 'cycle', 'video');
      updated = true;
    }
    if (cycle.rulesPdfUrl && cycle.rulesPdfUrl.startsWith('data:')) {
      cycle.rulesPdfUrl = saveBase64File(cycle.rulesPdfUrl, 'cycle', 'pdf');
      updated = true;
    }
    if (updated) {
      await Cycle.findByIdAndUpdate(cycle._id, {
        coverImage: cycle.coverImage,
        promoVideoUrl: cycle.promoVideoUrl,
        rulesPdfUrl: cycle.rulesPdfUrl
      }).catch(() => null);
    }
    return cycle;
  }


  async setActiveCycle(cycleId: string) {
    await Cycle.updateMany({ status: 'Active' }, { status: 'Completed' });
    const cycle = await Cycle.findByIdAndUpdate(cycleId, { status: 'Active' }, { new: true });
    if (!cycle) throw new Error('Cycle not found');

    await CycleLog.create({
      eventType: 'CYCLE_START',
      cycleId: cycle._id as mongoose.Types.ObjectId,
      message: `Cycle ${cycle.cycleNumber} manually set to Active.`
    });

    socketService.emitToRoom('room_cycle_updates', 'CYCLE_CHANGED', { cycle });

    return cycle;
  }

  async createCycle(data: any) {
    const count = await Cycle.countDocuments();
    const cycleNumber = Number(data.cycleNumber) || count + 1;
    const coverImage = data.coverImage ? saveBase64File(data.coverImage, 'cycle', 'cover') : '';
    const promoVideoUrl = data.promoVideoUrl ? saveBase64File(data.promoVideoUrl, 'cycle', 'video') : '';
    const rulesPdfUrl = data.rulesPdfUrl ? saveBase64File(data.rulesPdfUrl, 'cycle', 'pdf') : '';

    const cycle = await Cycle.create({
      cycleNumber,
      title: data.title,
      description: data.description || '',
      rules: data.rules || '',
      guidelines: data.guidelines || '',
      durationDays: Number(data.durationDays) || 14,
      prizePoolCoins: Number(data.prizePoolCoins) || 0,
      timerMinutes: Number(data.timerMinutes) || 60,
      maxSeats: Number(data.maxSeats) || 100,
      coverImage,
      promoVideoUrl,
      rulesPdfUrl,
      roomId: data.roomId && mongoose.Types.ObjectId.isValid(data.roomId) ? data.roomId : undefined,
      taskIds: Array.isArray(data.taskIds) ? data.taskIds : [],
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      status: data.status || 'Draft'
    });
    return cycle;
  }

  async updateCycle(cycleId: string, data: Partial<ICycle> | any) {
    if (!mongoose.Types.ObjectId.isValid(cycleId)) {
      return { _id: cycleId, ...data };
    }
    const updateData = { ...data };
    if (updateData.coverImage) {
      updateData.coverImage = saveBase64File(updateData.coverImage, 'cycle', 'cover');
    }
    if (updateData.promoVideoUrl) {
      updateData.promoVideoUrl = saveBase64File(updateData.promoVideoUrl, 'cycle', 'video');
    }
    if (updateData.rulesPdfUrl) {
      updateData.rulesPdfUrl = saveBase64File(updateData.rulesPdfUrl, 'cycle', 'pdf');
    }
    const cycle = await Cycle.findByIdAndUpdate(cycleId, updateData, { new: true });
    if (!cycle) throw new Error('Cycle not found');
    return cycle;
  }

  async deleteCycle(cycleId: string) {
    if (!mongoose.Types.ObjectId.isValid(cycleId)) {
      return { success: true, id: cycleId };
    }
    const cycle = await Cycle.findByIdAndDelete(cycleId);
    if (!cycle) throw new Error('Cycle not found');
    return cycle;
  }

  // ================= TASK MANAGEMENT (REMOVED) =================
  async createTask(data: any) {
    return { success: true, message: 'Task management removed.' };
  }

  async getTasks(query: any) {
    return { tasks: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  }

  async updateTask(taskId: string, data: any) {
    return { _id: taskId, ...data };
  }

  async deleteTask(taskId: string) {
    return { success: true, id: taskId };
  }

  // ================= SUBMISSION MANAGEMENT =================
  async getSubmissions(query: any) {
    const { cycleId, roomId, taskId, status, search, page = 1, limit = 10 } = query;
    const filter: any = {};

    if (cycleId && cycleId !== 'All' && mongoose.Types.ObjectId.isValid(cycleId)) filter.cycleId = cycleId;
    if (roomId && roomId !== 'All' && mongoose.Types.ObjectId.isValid(roomId)) filter.roomId = roomId;
    if (taskId && taskId !== 'All' && mongoose.Types.ObjectId.isValid(taskId)) filter.taskId = taskId;
    if (status && status !== 'All') filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    let submissions = await RoomSubmission.find(filter)
      .populate('cycleId', 'cycleNumber title')
      .populate('roomId', 'name code')
      .populate('userId', 'name email avatar')
      .populate('reviewedBy', 'name email')
      .sort({ createdDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    if (search) {
      const s = search.toLowerCase();
      submissions = submissions.filter(
        (sub: any) =>
          sub.userId?.name?.toLowerCase().includes(s) ||
          sub.userId?.email?.toLowerCase().includes(s) ||
          sub.taskId?.title?.toLowerCase().includes(s)
      );
    }

    const total = await RoomSubmission.countDocuments(filter);

    return {
      submissions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  async reviewSubmission(
    submissionId: string,
    reviewerId: string,
    reviewData: {
      status: 'Approved' | 'Rejected' | 'Resubmit_Requested';
      score?: number;
      bonus?: number;
      penalty?: number;
      feedback?: string;
    }
  ) {
    const submission = await RoomSubmission.findById(submissionId).populate('taskId');
    if (!submission) throw new Error('Submission not found');

    const task: any = submission.taskId;
    const baseScore = reviewData.score !== undefined ? reviewData.score : task ? task.points : 0;
    const bonus = reviewData.bonus || 0;
    const penalty = reviewData.penalty || 0;
    const finalPoints = reviewData.status === 'Approved' ? Math.max(0, baseScore + bonus - penalty) : 0;

    submission.status = reviewData.status;
    submission.score = baseScore;
    submission.bonus = bonus;
    submission.penalty = penalty;
    submission.finalPoints = finalPoints;
    submission.feedback = reviewData.feedback || '';
    submission.reviewedBy = reviewerId as any;
    submission.reviewedAt = new Date();

    submission.history.push({
      action: `REVIEWED_${reviewData.status}`,
      performedBy: reviewerId as any,
      timestamp: new Date(),
      comments: reviewData.feedback || `Status changed to ${reviewData.status}`,
      scoreGiven: finalPoints
    });

    await submission.save();

    if (reviewData.status === 'Approved') {
      await RoomMember.findOneAndUpdate(
        { roomId: submission.roomId, userId: submission.userId },
        { $inc: { accumulatedPoints: finalPoints, completedTasksCount: 1 } }
      );

      await Room.findByIdAndUpdate(submission.roomId, { $inc: { totalPoints: finalPoints } });

      await this.recalculateLeaderboard(submission.cycleId.toString());
    }

    return submission;
  }

  // ================= LEADERBOARD MANAGEMENT =================
  async recalculateLeaderboard(cycleId?: string) {
    // 1. Room Leaderboard (Aggregated totals per room)
    const roomAgg = await Room.find({ status: 'Active' }).sort({ totalPoints: -1 });
    let rank = 1;
    for (const rm of roomAgg) {
      await RoomLeaderboard.findOneAndUpdate(
        { scope: 'Room', roomId: rm._id },
        {
          scope: 'Room',
          roomId: rm._id,
          entityName: rm.name,
          entityImage: rm.roomImage || '',
          rank,
          totalPoints: rm.totalPoints,
          lastUpdated: new Date()
        },
        { upsert: true }
      );
      await Room.findByIdAndUpdate(rm._id, { rank });
      rank++;
    }

    // 2. Cycle Leaderboard per User
    const activeCycle = cycleId ? await Cycle.findById(cycleId) : await Cycle.findOne({ status: 'Active' });
    if (activeCycle) {
      const userScores = await RoomSubmission.aggregate([
        { $match: { cycleId: activeCycle._id, status: 'Approved' } },
        {
          $group: {
            _id: '$userId',
            totalTaskPoints: { $sum: '$score' },
            totalBonus: { $sum: '$bonus' },
            totalPenalty: { $sum: '$penalty' },
            totalFinal: { $sum: '$finalPoints' },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalFinal: -1 } }
      ]);

      let userRank = 1;
      for (const u of userScores) {
        const userObj = await User.findById(u._id).select('name email avatar');
        if (userObj) {
          await RoomLeaderboard.findOneAndUpdate(
            { scope: 'Cycle', cycleId: activeCycle._id, userId: u._id },
            {
              scope: 'Cycle',
              cycleId: activeCycle._id,
              userId: u._id,
              entityName: userObj.name,
              entityImage: (userObj as any).avatar || '',
              rank: userRank,
              totalPoints: u.totalFinal,
              taskPoints: u.totalTaskPoints,
              bonusPoints: u.totalBonus,
              penaltyPoints: u.totalPenalty,
              tasksCompletedCount: u.count,
              medals: {
                gold: userRank === 1 ? 1 : 0,
                silver: userRank === 2 ? 1 : 0,
                bronze: userRank === 3 ? 1 : 0
              },
              lastUpdated: new Date()
            },
            { upsert: true }
          );
          userRank++;
        }
      }
    }

    socketService.broadcast('LEADERBOARD_UPDATED', { timestamp: new Date() });
    return true;
  }

  async getLeaderboard(scope: 'Room' | 'Cycle' | 'Overall', cycleId?: string, roomId?: string) {
    const filter: any = { scope };
    if (cycleId && cycleId !== 'All') filter.cycleId = cycleId;
    if (roomId && roomId !== 'All') filter.roomId = roomId;

    const leaderboard = await RoomLeaderboard.find(filter)
      .populate('roomId', 'name code')
      .populate('userId', 'name email avatar')
      .sort({ rank: 1 });

    return leaderboard;
  }

  // ================= REWARDS MANAGEMENT =================
  async createRewardRule(data: any) {
    const reward = await RoomReward.create(data);
    return reward;
  }

  async getRewards() {
    const rewards = await RoomReward.find()
      .populate('cycleId', 'cycleNumber title')
      .populate('roomId', 'name code')
      .populate('userId', 'name email')
      .sort({ createdDate: -1 });

    return rewards;
  }

  async distributeRewards() {
    const pendingRewards = await RoomReward.find({ status: 'Pending' });
    let count = 0;

    for (const reward of pendingRewards) {
      if (reward.targetScope === 'Top_User' || reward.targetScope === 'Overall_Winner') {
        const winners = await RoomLeaderboard.find({ scope: 'Cycle', rank: { $lte: reward.maxRank } });
        for (const winner of winners) {
          if (winner.userId) {
            await User.findByIdAndUpdate(winner.userId, {
              $inc: { walletBalance: reward.amountOrValue }
            });
          }
        }
      }
      reward.status = 'Distributed';
      reward.distributedAt = new Date();
      await reward.save();
      count++;
    }

    return { success: true, distributedCount: count };
  }

  // ================= SETTINGS & DASHBOARD ANALYTICS =================
  async getSettings() {
    let settings = await RoomCycleSettings.findOne();
    if (!settings) {
      settings = await RoomCycleSettings.create({});
    }
    return settings;
  }

  async updateSettings(data: any) {
    let settings = await RoomCycleSettings.findOne();
    if (!settings) {
      settings = await RoomCycleSettings.create(data);
    } else {
      settings = await RoomCycleSettings.findByIdAndUpdate(settings._id, data, { new: true });
    }
    return settings;
  }

  async getAnalyticsDashboard() {
    const totalRooms = await Room.countDocuments();
    const activeRooms = await Room.countDocuments({ status: 'Active' });
    const completedCycles = await Cycle.countDocuments({ status: 'Completed' });
    const activeCycle = await Cycle.findOne({ status: 'Active' });
    const pendingTasks = await RoomSubmission.countDocuments({ status: 'Pending' });

    const totalSubmissions = await RoomSubmission.countDocuments();
    const approvedSubmissions = await RoomSubmission.countDocuments({ status: 'Approved' });
    const completionRate = totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0;

    const avgScoreAgg = await RoomSubmission.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, avgScore: { $avg: '$finalPoints' } } }
    ]);
    const averageScore = avgScoreAgg.length > 0 ? Math.round(avgScoreAgg[0].avgScore) : 0;

    const topRooms = await Room.find({ status: 'Active' }).sort({ totalPoints: -1 }).limit(5);
    const topUsers = await RoomLeaderboard.find({ scope: 'Cycle' }).sort({ rank: 1 }).limit(5);

    return {
      totalRooms,
      activeRooms,
      completedCycles,
      activeCycleNumber: activeCycle ? activeCycle.cycleNumber : 1,
      pendingTasks,
      averageScore,
      completionRate,
      topRooms,
      topUsers
    };
  }
}

export const biWeeklyRoomCycleService = new BiWeeklyRoomCycleService();
