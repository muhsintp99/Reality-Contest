import mongoose from 'mongoose';
import Room, { IRoom } from '../models/Room';
import Cycle, { ICycle } from '../models/Cycle';
import RoomSubmission, { IRoomSubmission } from '../models/RoomSubmission';
import RoomLeaderboard, { IRoomLeaderboard } from '../models/RoomLeaderboard';
import RoomReward, { IRoomReward } from '../models/RoomReward';
import RoomMember, { IRoomMember } from '../models/RoomMember';
import Task from '../models/Task';
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
    const code = data.code && data.code.trim() ? data.code.trim().toUpperCase() : `RM-${String(count + 1).padStart(3, '0')}`;

    const roomImage = data.roomImage ? saveBase64File(data.roomImage, 'room', 'image') : '';
    const cycleIds = Array.isArray(data.cycleIds) ? data.cycleIds : [];
    const taskIds = Array.isArray(data.taskIds) ? data.taskIds : [];

    const room = await Room.create({
      code,
      name: data.name,
      description: data.description || '',
      rules: data.rules || '',
      guidelines: data.guidelines || '',
      durationDays: Number(data.durationDays) || 14,
      maxMembers: Number(data.maxMembers) || 50,
      prizePool: Number(data.prizePool) || (data.entryFeeType === 'Cash' ? 50000 : (Number(data.coinsReward) || 10000)),
      entryFee: Math.max(1, Number(data.entryFee !== undefined && data.entryFee !== null ? data.entryFee : data.entryFeeCoins) || (data.entryFeeType === 'Cash' ? 99 : 50)),
      entryFeeType: data.entryFeeType === 'Cash' ? 'Cash' : 'Coins',
      isFree: false,
      entryFeeCoins: data.entryFeeType === 'Cash' ? 0 : Math.max(1, Number(data.entryFeeCoins !== undefined && data.entryFeeCoins !== null ? data.entryFeeCoins : data.entryFee) || 50),
      coinsReward: Number(data.coinsReward) || (data.entryFeeType === 'Cash' ? 0 : (Number(data.prizePool) || 1000)),
      timerLimit: Number(data.timerLimit) || 30,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + (Number(data.durationDays) || 14) * 24 * 60 * 60 * 1000),
      registrationStart: data.registrationStart ? new Date(data.registrationStart) : new Date(),
      registrationEnd: data.registrationEnd ? new Date(data.registrationEnd) : new Date(Date.now() + (Number(data.durationDays) || 14) * 24 * 60 * 60 * 1000),
      cycleIds,
      taskIds,
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

    if (taskIds.length > 0) {
      await Task.updateMany(
        { _id: { $in: taskIds } },
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

  async getRooms(query: any, userId?: string) {
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

    let userJoinedRoomIds: string[] = [];
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const userMemberships = await RoomMember.find({
        userId: new mongoose.Types.ObjectId(userId),
        status: 'Active'
      }).select('roomId');
      userJoinedRoomIds = userMemberships.map(m => m.roomId.toString());
    }

    const skip = (Number(page) - 1) * Number(limit);
    const rooms = await Room.find(filter)
      .populate('cycleIds', 'cycleNumber title status startDate endDate')
      .populate('taskIds', 'title taskType submissionType points status order')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    const roomList: any[] = [];
    let idx = 0;
    for (const rm of rooms) {
      if (rm.roomImage && rm.roomImage.startsWith('data:')) {
        const savedUrl = saveBase64File(rm.roomImage, 'room', 'image');
        rm.roomImage = savedUrl;
        await Room.findByIdAndUpdate(rm._id, { roomImage: savedUrl }).catch(() => null);
      }

      // Respect configured fee and fee type. Never allow Free.
      let needsHeal = false;
      if (rm.entryFeeType === 'Cash') {
        const cashFee = Math.max(1, Number(rm.entryFee) || 99);
        rm.isFree = false;
        rm.entryFeeType = 'Cash';
        rm.entryFee = cashFee;
        rm.entryFeeCoins = 0;
        if (!rm.prizePool || rm.prizePool === 0) {
          rm.prizePool = 50000;
          needsHeal = true;
        }
      } else {
        const coinsFee = Math.max(1, Number(rm.entryFee !== undefined && rm.entryFee !== null ? rm.entryFee : rm.entryFeeCoins) || 50);
        rm.isFree = false;
        rm.entryFeeType = 'Coins';
        rm.entryFee = coinsFee;
        rm.entryFeeCoins = coinsFee;
        if (!rm.prizePool || rm.prizePool === 0) {
          rm.prizePool = Number(rm.coinsReward) || 10000;
          needsHeal = true;
        }
        if (!rm.coinsReward || rm.coinsReward === 0) {
          rm.coinsReward = Number(rm.prizePool) || 1000;
          needsHeal = true;
        }
      }

      if (needsHeal) {
        await Room.findByIdAndUpdate(rm._id, {
          prizePool: rm.prizePool,
          coinsReward: rm.coinsReward,
          entryFee: rm.entryFee,
          entryFeeCoins: rm.entryFeeCoins,
          entryFeeType: rm.entryFeeType,
          isFree: false
        }).catch(() => null);
      }

      // Real active members count
      const activeMembersCount = await RoomMember.countDocuments({ roomId: rm._id, status: 'Active' });
      const membersCount = activeMembersCount > 0 ? activeMembersCount : (rm.membersCount || 0);

      // Total points from all active members in this room
      const pointsAgg = await RoomMember.aggregate([
        { $match: { roomId: rm._id, status: 'Active' } },
        { $group: { _id: null, totalPoints: { $sum: '$accumulatedPoints' } } }
      ]);
      const totalPoints = (pointsAgg[0] && pointsAgg[0].totalPoints) ? pointsAgg[0].totalPoints : (rm.totalPoints || 0);

      // Top Scorer / Leaderboard highlight
      const topMemberObj = await RoomMember.findOne({ roomId: rm._id, status: 'Active' })
        .populate('userId', 'name avatar email')
        .sort({ accumulatedPoints: -1 });

      let topMember: any = null;
      if (topMemberObj) {
        const u = topMemberObj.userId as any;
        const uName = typeof u === 'object' && u ? (u.name || u.email || 'Member') : 'Member';
        const uAvatar = typeof u === 'object' && u ? (u.avatar || '') : '';
        topMember = {
          name: uName,
          avatar: uAvatar,
          points: topMemberObj.accumulatedPoints || 0
        };
      }

      // Submissions Analytics
      const totalSubmissions = await RoomSubmission.countDocuments({ roomId: rm._id });
      const approvedSubmissions = await RoomSubmission.countDocuments({ roomId: rm._id, status: 'Approved' });
      const rejectedSubmissions = await RoomSubmission.countDocuments({ roomId: rm._id, status: 'Rejected' });
      const pendingSubmissions = await RoomSubmission.countDocuments({ roomId: rm._id, status: 'Pending' });
      const completionRate = totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0;

      const activeTasksCount = Array.isArray(rm.taskIds) && rm.taskIds.length > 0
        ? rm.taskIds.length
        : await Task.countDocuments({ $or: [{ roomId: rm._id }, { status: { $in: ['Published', 'Running'] } }] }).catch(() => 0);

      const isJoined = userJoinedRoomIds.includes(rm._id.toString());
      const rmObj = rm.toObject();
      (rmObj as any).membersCount = membersCount;
      (rmObj as any).totalPoints = totalPoints;
      (rmObj as any).rank = (rm.rank && rm.rank > 0) ? rm.rank : (skip + idx + 1);
      (rmObj as any).topMember = topMember;
      (rmObj as any).isJoined = isJoined;
      (rmObj as any).joined = isJoined;
      (rmObj as any).hasJoined = isJoined;
      (rmObj as any).analytics = {
        totalSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        pendingSubmissions,
        completionRate,
        activeTasksCount
      };

      roomList.push(rmObj);
      idx++;
    }

    // Rank rooms dynamically by total points if multiple rooms share duplicate ranks
    const allRanks = roomList.map((r: any) => r.rank);
    const hasDuplicateRanks = new Set(allRanks).size !== allRanks.length;
    if (hasDuplicateRanks) {
      const sortedByPoints = [...roomList].sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0));
      sortedByPoints.forEach((r: any, i: number) => {
        const found = roomList.find((x: any) => x._id.toString() === r._id.toString());
        if (found) found.rank = skip + i + 1;
      });
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

  async getRoomCycles(roomId: string) {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return [];
    }
    const room = await Room.findById(roomId);
    const roomCycleIds = room?.cycleIds || [];

    const cycles = await Cycle.find({
      $or: [
        { roomId: new mongoose.Types.ObjectId(roomId) },
        { _id: { $in: roomCycleIds } }
      ]
    }).sort({ cycleNumber: 1 });

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

  async getRoomById(roomId: string) {
    let room: any = null;
    if (mongoose.Types.ObjectId.isValid(roomId)) {
      room = await Room.findById(roomId)
        .populate('cycleIds', 'cycleNumber title status startDate endDate')
        .populate('taskIds', 'title taskType submissionType points status order description instructions mediaUrl deadline reviewType');
    }

    if (!room) {
      const allRooms = await Room.find()
        .populate('cycleIds', 'cycleNumber title status startDate endDate')
        .populate('taskIds', 'title taskType submissionType points status order description instructions mediaUrl deadline reviewType');
      room = allRooms.find((r: any) => {
        const slug = (r.title || '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
        const code = (r.roomCode || '').toLowerCase();
        const target = roomId.toLowerCase().trim();
        return slug === target || code === target || (r.title || '').toLowerCase() === decodeURIComponent(target);
      }) || null;
    }

    if (!room) throw new Error('Room not found');

    const realRoomId = room._id.toString();

    let needsHeal = false;
    if (room.entryFeeType === 'Cash') {
      if (!room.prizePool || room.prizePool === 0) {
        room.prizePool = 50000;
        needsHeal = true;
      }
      room.entryFee = Math.max(1, Number(room.entryFee) || 99);
      room.entryFeeCoins = 0;
      room.isFree = false;
    } else {
      room.entryFeeType = 'Coins';
      const coinsFee = Math.max(1, Number(room.entryFee !== undefined && room.entryFee !== null ? room.entryFee : room.entryFeeCoins) || 50);
      room.entryFee = coinsFee;
      room.entryFeeCoins = coinsFee;
      room.isFree = false;
      if (!room.prizePool || room.prizePool === 0) {
        room.prizePool = Number(room.coinsReward) || 10000;
        needsHeal = true;
      }
      if (!room.coinsReward || room.coinsReward === 0) {
        room.coinsReward = Number(room.prizePool) || 1000;
        needsHeal = true;
      }
    }

    if (needsHeal) {
      await Room.findByIdAndUpdate(realRoomId, {
        prizePool: room.prizePool,
        coinsReward: room.coinsReward,
        entryFee: room.entryFee,
        entryFeeCoins: room.entryFeeCoins,
        entryFeeType: room.entryFeeType,
        isFree: false
      }).catch(() => null);
    }

    const cycles = await this.getRoomCycles(realRoomId);
    const tasks = (room.taskIds && room.taskIds.length > 0)
      ? room.taskIds
      : await Task.find({ roomId: room._id }).sort({ order: 1 });

    const members = await RoomMember.find({ roomId: realRoomId, status: 'Active' })
      .populate('userId', 'name email avatar phone')
      .sort({ accumulatedPoints: -1 });

    const totalSubmissions = await RoomSubmission.countDocuments({ roomId: realRoomId });
    const approvedSubmissions = await RoomSubmission.countDocuments({ roomId: realRoomId, status: 'Approved' });
    const rejectedSubmissions = await RoomSubmission.countDocuments({ roomId: realRoomId, status: 'Rejected' });
    const pendingSubmissions = await RoomSubmission.countDocuments({ roomId: realRoomId, status: 'Pending' });
    const completionRate = totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0;

    const activeTasksCount = tasks.length > 0
      ? tasks.length
      : await Task.countDocuments({ status: { $in: ['Published', 'Running'] } }).catch(() => 0);

    const recentSubmissions = await RoomSubmission.find({ roomId: realRoomId })
      .populate('userId', 'name email avatar')
      .populate('taskId', 'title taskType points')
      .sort({ createdAt: -1 })
      .limit(6)
      .catch(() => []);

    const analytics = {
      totalSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      pendingSubmissions,
      completionRate,
      activeTasksCount,
      recentSubmissions
    };

    return { room, members, cycles, tasks, analytics };
  }

  async getRoomTasks(roomId: string) {
    let targetId = roomId;
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      const roomData = await this.getRoomById(roomId).catch(() => null);
      if (roomData?.room?._id) targetId = roomData.room._id.toString();
      else return [];
    }
    const room = await Room.findById(targetId).populate('taskIds');
    if (room && room.taskIds && room.taskIds.length > 0) {
      return room.taskIds;
    }
    return await Task.find({ roomId: new mongoose.Types.ObjectId(targetId) }).sort({ order: 1 });
  }

  async updateRoom(roomId: string, data: Partial<IRoom>) {
    let realRoomId = roomId;
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      const roomData = await this.getRoomById(roomId).catch(() => null);
      if (roomData?.room?._id) realRoomId = roomData.room._id.toString();
    }
    const updateData: any = { ...data };
    if (updateData.roomImage) {
      updateData.roomImage = saveBase64File(updateData.roomImage, 'room', 'image');
    }
    updateData.isFree = false;
    if (updateData.entryFeeType === 'Cash') {
      updateData.entryFeeType = 'Cash';
      updateData.entryFee = Math.max(1, Number(updateData.entryFee) || 99);
      updateData.entryFeeCoins = 0;
      if (updateData.prizePool !== undefined) {
        updateData.prizePool = Math.max(0, Number(updateData.prizePool) || 0);
      }
      if (updateData.coinsReward !== undefined) {
        updateData.coinsReward = Math.max(0, Number(updateData.coinsReward) || 0);
      }
    } else {
      updateData.entryFeeType = 'Coins';
      const coins = Math.max(1, Number(updateData.entryFee !== undefined && updateData.entryFee !== null ? updateData.entryFee : updateData.entryFeeCoins) || 50);
      updateData.entryFee = coins;
      updateData.entryFeeCoins = coins;

      const pPool = updateData.prizePool !== undefined ? Math.max(0, Number(updateData.prizePool) || 0) : undefined;
      const cReward = updateData.coinsReward !== undefined ? Math.max(0, Number(updateData.coinsReward) || 0) : undefined;

      if (pPool !== undefined && pPool > 0) {
        updateData.prizePool = pPool;
        updateData.coinsReward = (cReward !== undefined && cReward > 0) ? cReward : pPool;
      } else if (cReward !== undefined && cReward > 0) {
        updateData.coinsReward = cReward;
        updateData.prizePool = cReward;
      } else if (pPool === 0 && (cReward === 0 || cReward === undefined)) {
        updateData.prizePool = 10000;
        updateData.coinsReward = 1000;
      }
    }
    if (updateData.timerLimit !== undefined) updateData.timerLimit = Math.max(1, Number(updateData.timerLimit) || 30);
    if (updateData.maxMembers !== undefined) updateData.maxMembers = Math.max(1, Number(updateData.maxMembers) || 50);
    if (updateData.durationDays !== undefined) updateData.durationDays = Math.max(1, Number(updateData.durationDays) || 14);
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.registrationStart) updateData.registrationStart = new Date(updateData.registrationStart);
    if (updateData.registrationEnd) updateData.registrationEnd = new Date(updateData.registrationEnd);

    const room = await Room.findByIdAndUpdate(realRoomId, updateData, { new: true })
      .populate('cycleIds', 'cycleNumber title status startDate endDate')
      .populate('taskIds', 'title taskType submissionType points status order description instructions mediaUrl deadline reviewType');
    if (!room) throw new Error('Room not found');

    if (data.cycleIds && Array.isArray(data.cycleIds)) {
      const newCycleIds = data.cycleIds.map((id: any) => id.toString());
      await Cycle.updateMany(
        { _id: { $in: newCycleIds } },
        { roomId: realRoomId }
      ).catch(() => null);
      await Cycle.updateMany(
        { roomId: realRoomId, _id: { $nin: newCycleIds } },
        { $unset: { roomId: 1 } }
      ).catch(() => null);
    }

    if (data.taskIds && Array.isArray(data.taskIds)) {
      const newTaskIds = data.taskIds.map((id: any) => id.toString());
      await Task.updateMany(
        { _id: { $in: newTaskIds } },
        { roomId: roomId }
      ).catch(() => null);
      await Task.updateMany(
        { roomId: roomId, _id: { $nin: newTaskIds } },
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
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new Error(`Invalid roomId format: ${roomId}`);
    }
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
    const cycles: any[] = await Cycle.find()
      .populate('roomId', 'name category status code')
      .populate('taskIds', 'title taskType submissionType points status order')
      .sort({ cycleNumber: 1 });
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
    const cycle: any = await Cycle.findById(cycleId)
      .populate('roomId', 'name category status code')
      .populate('taskIds', 'title taskType submissionType points status order');
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
    const coverImage = data.coverImage && data.coverImage.startsWith('data:') ? saveBase64File(data.coverImage, 'cycle', 'cover') : (data.coverImage || '');
    const promoVideoUrl = data.promoVideoUrl && data.promoVideoUrl.startsWith('data:') ? saveBase64File(data.promoVideoUrl, 'cycle', 'video') : (data.promoVideoUrl || '');
    const rulesPdfUrl = data.rulesPdfUrl && data.rulesPdfUrl.startsWith('data:') ? saveBase64File(data.rulesPdfUrl, 'cycle', 'pdf') : (data.rulesPdfUrl || '');

    const roomId = data.roomId && data.roomId !== 'All' && mongoose.Types.ObjectId.isValid(data.roomId) ? data.roomId : undefined;

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
      roomId,
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
    if (updateData.coverImage && updateData.coverImage.startsWith('data:')) {
      updateData.coverImage = saveBase64File(updateData.coverImage, 'cycle', 'cover');
    }
    if (updateData.promoVideoUrl && updateData.promoVideoUrl.startsWith('data:')) {
      updateData.promoVideoUrl = saveBase64File(updateData.promoVideoUrl, 'cycle', 'video');
    }
    if (updateData.rulesPdfUrl && updateData.rulesPdfUrl.startsWith('data:')) {
      updateData.rulesPdfUrl = saveBase64File(updateData.rulesPdfUrl, 'cycle', 'pdf');
    }
    if (updateData.roomId === 'All' || updateData.roomId === '' || !updateData.roomId) {
      updateData.roomId = null;
    } else if (!mongoose.Types.ObjectId.isValid(updateData.roomId)) {
      delete updateData.roomId;
    }
    if (updateData.prizePoolCoins !== undefined) updateData.prizePoolCoins = Number(updateData.prizePoolCoins) || 0;
    if (updateData.timerMinutes !== undefined) updateData.timerMinutes = Number(updateData.timerMinutes) || 0;
    if (updateData.maxSeats !== undefined) updateData.maxSeats = Number(updateData.maxSeats) || 0;
    if (updateData.durationDays !== undefined) updateData.durationDays = Number(updateData.durationDays) || 14;
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const cycle = await Cycle.findByIdAndUpdate(cycleId, updateData, { new: true })
      .populate('roomId', 'name category status code')
      .populate('taskIds', 'title taskType submissionType points status order');
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
  async createSubmission(data: {
    cycleId?: string;
    contestId?: string;
    roomId: string;
    userId: string;
    taskId: string;
    submissionType?: 'Link' | 'File' | 'Text' | 'Image' | 'Video';
    mediaUrl?: string;
    proofNotes?: string;
  }) {
    let mediaUrl = data.mediaUrl || '';
    if (mediaUrl && mediaUrl.startsWith('data:')) {
      mediaUrl = saveBase64File(mediaUrl, 'submission', 'proof');
    }

    const files = mediaUrl
      ? [
          {
            url: mediaUrl,
            filename: mediaUrl.split('/').pop() || 'submission_file',
            fileType: data.submissionType || 'File',
            fileSizeMB: 0
          }
        ]
      : [];

    const submission = await RoomSubmission.create({
      cycleId: data.cycleId && mongoose.Types.ObjectId.isValid(data.cycleId) ? data.cycleId : undefined,
      contestId: data.contestId && mongoose.Types.ObjectId.isValid(data.contestId) ? data.contestId : undefined,
      roomId: data.roomId && mongoose.Types.ObjectId.isValid(data.roomId) ? data.roomId : undefined,
      userId: data.userId && mongoose.Types.ObjectId.isValid(data.userId) ? data.userId : undefined,
      taskId: data.taskId && mongoose.Types.ObjectId.isValid(data.taskId) ? data.taskId : undefined,
      submissionType: data.submissionType || 'Link',
      mediaUrl,
      proofNotes: data.proofNotes || '',
      content: data.proofNotes || '',
      files,
      status: 'Pending',
      submittedAt: new Date()
    });

    return submission;
  }

  async getSubmissions(query: any) {
    const { cycleId, contestId, roomId, taskId, status, search, page = 1, limit = 10 } = query;
    const filter: any = {};

    if (cycleId && cycleId !== 'All' && mongoose.Types.ObjectId.isValid(cycleId)) filter.cycleId = cycleId;
    if (contestId && contestId !== 'All' && mongoose.Types.ObjectId.isValid(contestId)) filter.contestId = contestId;
    if (roomId && roomId !== 'All' && mongoose.Types.ObjectId.isValid(roomId)) filter.roomId = roomId;
    if (taskId && taskId !== 'All' && mongoose.Types.ObjectId.isValid(taskId)) filter.taskId = taskId;
    if (status && status !== 'All') filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    let submissions = await RoomSubmission.find(filter)
      .populate('cycleId', 'cycleNumber title')
      .populate('contestId', 'contestId title')
      .populate('roomId', 'name code')
      .populate('taskId', 'title points taskType submissionType')
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

      await this.recalculateLeaderboard(submission.cycleId ? submission.cycleId.toString() : undefined);
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

  async checkJoinStatus(roomId?: string, contestId?: string, userId?: string) {
    if (!userId) {
      return {
        success: true,
        isJoined: false,
        joined: false,
        hasJoined: false,
        completed: false,
        isCompleted: false,
        hasCompleted: false,
        message: 'User not authenticated',
        data: {
          isJoined: false,
          joined: false,
          hasJoined: false,
          completed: false,
          isCompleted: false,
          hasCompleted: false,
          roomId: roomId || '',
          contestId: contestId || '',
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0
        }
      };
    }

    const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;
    const validIds = [roomId, contestId]
      .filter((id): id is string => Boolean(id && id !== 'undefined' && mongoose.Types.ObjectId.isValid(id)))
      .map(id => new mongoose.Types.ObjectId(id));

    let isJoined = false;
    let isCompleted = false;
    let totalTasksCount = 0;
    let completedTasksCount = 0;
    let targetRoom: any = null;
    let targetCycle: any = null;
    let foundRoomMember: any = null;

    if (validIds.length > 0 && userObjId) {
      // 1. Check RoomMember
      foundRoomMember = await RoomMember.findOne({
        userId: userObjId,
        roomId: { $in: validIds },
        status: 'Active'
      });

      if (foundRoomMember) {
        isJoined = true;
      }

      // 2. Check RoomSubmission
      const submission = await RoomSubmission.findOne({
        userId: userObjId,
        $or: [
          { roomId: { $in: validIds } },
          { contestId: { $in: validIds } },
          { cycleId: { $in: validIds } }
        ]
      });

      if (submission) {
        isJoined = true;
      }

      // 3. Check Contest & GrandContest models
      const Contest = require('../models/Contest').default || require('../models/Contest').Contest;
      const GrandContest = require('../models/GrandContest').default || require('../models/GrandContest').GrandContest;

      const [cMatch, gMatch] = await Promise.all([
        Contest.findOne({
          _id: { $in: validIds },
          $or: [
            { participants: userObjId },
            { 'participants.userId': userObjId }
          ]
        }).catch(() => null),
        GrandContest.findOne({
          _id: { $in: validIds },
          $or: [
            { participants: userObjId },
            { 'participants.userId': userObjId }
          ]
        }).catch(() => null)
      ]);

      if (cMatch || gMatch) {
        isJoined = true;
      }
    }

    // 4. Fallback: check any active room membership for this user if not found yet
    if (!isJoined && userObjId) {
      const anyMember = await RoomMember.findOne({
        userId: userObjId,
        status: 'Active'
      });

      if (anyMember) {
        isJoined = true;
        foundRoomMember = anyMember;
      }
    }

    // ================= CALCULATE COMPLETION STATUS =================
    let totalCyclesCount = 0;
    let completedCyclesCount = 0;

    if (isJoined && userObjId) {
      // Find the target Room
      if (validIds.length > 0) {
        targetRoom = await Room.findOne({
          $or: [
            { _id: { $in: validIds } },
            { cycleIds: { $in: validIds } }
          ]
        });

        if (!targetRoom) {
          const matchedCycle: any = await Cycle.findOne({ _id: { $in: validIds } }).lean();
          if (matchedCycle && matchedCycle.roomId) {
            targetRoom = await Room.findById(matchedCycle.roomId);
          }
        }
      }

      if (!targetRoom && foundRoomMember) {
        targetRoom = await Room.findById(foundRoomMember.roomId);
      }

      if (targetRoom) {
        // 1. Fetch all cycles belonging to this room
        const roomCycles: any[] = await Cycle.find({
          $or: [
            { roomId: targetRoom._id },
            { _id: { $in: targetRoom.cycleIds || [] } }
          ]
        }).lean();

        totalCyclesCount = roomCycles.length;
        const cycleIds = roomCycles.map((c: any) => c._id);
        const directRoomTaskIds = Array.isArray(targetRoom.taskIds) ? targetRoom.taskIds : [];

        // 2. Fetch all tasks belonging to this room and its cycles
        const taskQueryOr: any[] = [
          { roomId: targetRoom._id },
          ...(directRoomTaskIds.length > 0 ? [{ _id: { $in: directRoomTaskIds } }] : []),
          ...(cycleIds.length > 0 ? [{ cycleId: { $in: cycleIds } }] : [])
        ];

        const allTasks: any[] = await Task.find({
          $or: taskQueryOr
        }).select('_id cycleId roomId status').lean();

        const allRoomTaskIdSet = new Set<string>();
        const taskMapByCycle = new Map<string, Set<string>>();

        for (const tId of directRoomTaskIds) {
          if (tId) allRoomTaskIdSet.add(tId.toString());
        }

        for (const cycle of roomCycles) {
          const cId = (cycle._id || '').toString();
          taskMapByCycle.set(cId, new Set<string>());
          if (Array.isArray(cycle.taskIds)) {
            for (const tId of cycle.taskIds) {
              if (tId) {
                const str = tId.toString();
                allRoomTaskIdSet.add(str);
                taskMapByCycle.get(cId)!.add(str);
              }
            }
          }
        }

        for (const task of allTasks) {
          const strId = (task._id || '').toString();
          allRoomTaskIdSet.add(strId);
          if (task.cycleId) {
            const cStr = task.cycleId.toString();
            if (!taskMapByCycle.has(cStr)) taskMapByCycle.set(cStr, new Set<string>());
            taskMapByCycle.get(cStr)!.add(strId);
          }
        }

        totalTasksCount = allRoomTaskIdSet.size;

        // 3. Fetch user's submissions across all room cycles
        const queryConditions: any[] = [{ roomId: targetRoom._id }];
        if (cycleIds.length > 0) queryConditions.push({ cycleId: { $in: cycleIds } });
        if (validIds.length > 0) queryConditions.push({ contestId: { $in: validIds } });

        const submissions: any[] = await RoomSubmission.find({
          userId: userObjId,
          $or: queryConditions,
          status: { $in: ['Approved', 'Pending', 'Resubmit_Requested'] }
        }).lean();

        // Unique submitted tasks by the user
        const userSubmittedTaskIdSet = new Set<string>();
        submissions.forEach((s: any) => {
          if (s.taskId) {
            userSubmittedTaskIdSet.add(s.taskId.toString());
          }
        });

        completedTasksCount = userSubmittedTaskIdSet.size || submissions.length;

        // 4. Verify completion across ALL cycles in the room
        let allCyclesCompleted = totalCyclesCount > 0;
        completedCyclesCount = 0;

        if (totalCyclesCount > 0) {
          for (const cycle of roomCycles) {
            const cId = (cycle._id || '').toString();
            const cycleTaskSet = taskMapByCycle.get(cId) || new Set<string>();

            if (cycleTaskSet.size > 0) {
              let cycleTasksDone = true;
              for (const taskId of cycleTaskSet) {
                if (!userSubmittedTaskIdSet.has(taskId)) {
                  cycleTasksDone = false;
                  break;
                }
              }
              if (cycleTasksDone) {
                completedCyclesCount++;
              } else {
                allCyclesCompleted = false;
              }
            } else {
              if (cycle.status === 'Completed') {
                completedCyclesCount++;
              } else {
                allCyclesCompleted = false;
              }
            }
          }
        } else {
          allCyclesCompleted = false;
        }

        // ================= CYCLE-LEVEL & ROOM COMPLETION =================
        let targetCycleDoc: any = null;
        if (validIds.length > 0) {
          targetCycleDoc = roomCycles.find((c: any) => validIds.some(v => v.equals(c._id)));
        }
        if (!targetCycleDoc && targetRoom) {
          const currentCycleNum = Number(targetRoom.currentCycle) || 1;
          targetCycleDoc = roomCycles.find((c: any) => c.cycleNumber === currentCycleNum);
        }
        if (!targetCycleDoc && roomCycles.length > 0) {
          targetCycleDoc = roomCycles[0];
        }

        let cycleTasksCount = 0;
        let cycleCompletedTasksCount = 0;
        let cycleIsCompleted = false;

        if (targetCycleDoc) {
          const cId = (targetCycleDoc._id || '').toString();
          const targetCycleTaskSet = taskMapByCycle.get(cId) || new Set<string>();
          cycleTasksCount = targetCycleTaskSet.size;

          if (cycleTasksCount > 0) {
            let allCycleTasksDone = true;
            for (const tId of targetCycleTaskSet) {
              if (userSubmittedTaskIdSet.has(tId)) {
                cycleCompletedTasksCount++;
              } else {
                allCycleTasksDone = false;
              }
            }
            cycleIsCompleted = allCycleTasksDone && cycleCompletedTasksCount >= cycleTasksCount;
          } else if (targetCycleDoc.status === 'Completed') {
            cycleIsCompleted = true;
          }
        }

        // ================= FINAL COMPLETED DECISION =================
        // If a specific cycle was targeted, check if all tasks in that cycle are completed
        if (cycleTasksCount > 0) {
          isCompleted = cycleIsCompleted;
          totalTasksCount = cycleTasksCount;
          completedTasksCount = cycleCompletedTasksCount;
        } else if (totalTasksCount > 0) {
          isCompleted = (totalCyclesCount > 0 ? allCyclesCompleted : true) && completedTasksCount >= totalTasksCount;
        } else if (totalCyclesCount > 0) {
          isCompleted = allCyclesCompleted && completedCyclesCount === totalCyclesCount;
        } else if (targetRoom.status === 'Completed') {
          isCompleted = true;
        } else if (foundRoomMember && foundRoomMember.completedTasksCount > 0 && foundRoomMember.completedTasksCount >= totalTasksCount && totalTasksCount > 0) {
          isCompleted = true;
        } else {
          isCompleted = false;
        }
      } else {
        // Check GrandContest or Standard Contest
        const GrandContest = require('../models/GrandContest').default || require('../models/GrandContest').GrandContest;
        const grandContest = await GrandContest.findOne({ _id: { $in: validIds } });
        if (grandContest) {
          totalTasksCount = Number(grandContest.tasksCount || (grandContest.tasks ? grandContest.tasks.length : 0));
          const gcSubmissions = await RoomSubmission.find({
            userId: userObjId,
            $or: [{ contestId: grandContest._id }, { grandContestId: grandContest._id }]
          });
          completedTasksCount = gcSubmissions.length;
          if (totalTasksCount > 0 && completedTasksCount >= totalTasksCount) {
            isCompleted = true;
          } else if (grandContest.status === 'Completed') {
            isCompleted = true;
          }
        } else {
          // Standard / Daily Contest Quiz check in Result
          const Result = require('../models/Result').default || require('../models/Result').Result;
          const result = await Result.findOne({
            userId: userObjId,
            contestId: { $in: validIds }
          });
          if (result && (result.status === 'Completed' || result.status === 'Qualified' || result.status === 'Disqualified' || result.passed !== undefined)) {
            isCompleted = true;
            totalTasksCount = 1;
            completedTasksCount = 1;
          }
        }
      }
    }

    const pendingTasks = Math.max(0, totalTasksCount - completedTasksCount);
    const pendingCycles = Math.max(0, totalCyclesCount - completedCyclesCount);

    if (isJoined) {
      return {
        success: true,
        isJoined: true,
        joined: true,
        hasJoined: true,
        join: true,
        jin: true,
        completed: isCompleted,
        complete: isCompleted,
        isCompleted: isCompleted,
        hasCompleted: isCompleted,
        isComplete: isCompleted,
        message: isCompleted
          ? 'User has completed all tasks in this cycle contest'
          : 'User has already joined this room contest',
        data: {
          isJoined: true,
          joined: true,
          hasJoined: true,
          join: true,
          jin: true,
          completed: isCompleted,
          complete: isCompleted,
          isCompleted: isCompleted,
          hasCompleted: isCompleted,
          isComplete: isCompleted,
          roomId: targetRoom ? targetRoom._id.toString() : (roomId || ''),
          contestId: contestId || (targetRoom ? targetRoom._id.toString() : ''),
          totalTasks: totalTasksCount,
          completedTasks: completedTasksCount,
          pendingTasks: pendingTasks,
          totalCycles: totalCyclesCount,
          completedCycles: completedCyclesCount,
          pendingCycles: pendingCycles
        }
      };
    }

    return {
      success: true,
      isJoined: false,
      joined: false,
      hasJoined: false,
      join: false,
      jin: false,
      completed: false,
      complete: false,
      isCompleted: false,
      hasCompleted: false,
      isComplete: false,
      message: 'User not joined',
      data: {
        isJoined: false,
        joined: false,
        hasJoined: false,
        join: false,
        jin: false,
        completed: false,
        complete: false,
        isCompleted: false,
        hasCompleted: false,
        isComplete: false,
        roomId: roomId || '',
        contestId: contestId || '',
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        totalCycles: 0,
        completedCycles: 0,
        pendingCycles: 0
      }
    };
  }

  async joinRoomCycle(roomId?: string, contestId?: string, userId?: string) {
    if (!userId) {
      throw new Error('User authentication required to join room cycle.');
    }

    let targetRoomId = roomId;
    if (!targetRoomId || targetRoomId === 'undefined' || !mongoose.Types.ObjectId.isValid(targetRoomId)) {
      targetRoomId = contestId || '';
    }

    if (!targetRoomId || !mongoose.Types.ObjectId.isValid(targetRoomId)) {
      const activeRoom = await Room.findOne({ status: 'Active' });
      if (activeRoom) {
        targetRoomId = activeRoom._id.toString();
      }
    }

    if (targetRoomId && mongoose.Types.ObjectId.isValid(targetRoomId)) {
      await RoomMember.findOneAndUpdate(
        { roomId: new mongoose.Types.ObjectId(targetRoomId), userId: new mongoose.Types.ObjectId(userId) },
        {
          role: 'Member',
          status: 'Active',
          joinedAt: new Date()
        },
        { upsert: true, new: true }
      );

      await Room.findByIdAndUpdate(targetRoomId, { $inc: { membersCount: 1 } }).catch(() => null);
    }

    return {
      success: true,
      isJoined: true,
      joined: true,
      hasJoined: true,
      join: true,
      jin: true,
      completed: false,
      complete: false,
      isCompleted: false,
      hasCompleted: false,
      isComplete: false,
      message: 'User has successfully joined this room contest',
      data: {
        isJoined: true,
        joined: true,
        hasJoined: true,
        join: true,
        jin: true,
        completed: false,
        complete: false,
        isCompleted: false,
        hasCompleted: false,
        isComplete: false,
        roomId: targetRoomId,
        contestId
      }
    };
  }
}

export const biWeeklyRoomCycleService = new BiWeeklyRoomCycleService();
