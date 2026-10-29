import mongoose from 'mongoose';
import GrandContest, { IGrandContest } from '../models/GrandContest';
import Task from '../models/Task';
import RoomSubmission from '../models/RoomSubmission';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { BadRequestError, NotFoundError } from '../core/errors';
import { saveBase64File } from '../controllers/UploadController';

const generateUniqueGrandContestId = (): string => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `GNC-${year}-${randomDigits}`;
};

export class GrandContestService {
  async createGrandContest(data: Partial<IGrandContest>): Promise<IGrandContest> {
    if (!data.title) {
      throw new BadRequestError('Title is required for Grand Contest creation.');
    }

    if (!data.contestId) {
      data.contestId = generateUniqueGrandContestId();
    }

    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    const tasksCount = tasks.length > 0 ? tasks.length : Number(data.tasksCount) || 0;
    const cashFee = Number(data.entryFee) || 0;

    const payload: Partial<IGrandContest> = {
      ...data,
      entryFee: cashFee,
      entryFeeType: 'Cash',
      isFree: cashFee === 0,
      entryFeeCoins: 0,
      tasks,
      tasksCount,
      registrationStart: data.registrationStart ? new Date(data.registrationStart) : new Date(),
      registrationEnd: data.registrationEnd ? new Date(data.registrationEnd) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    try {
      const { contestScheduleAutomationService } = require('./ContestScheduleAutomationService');
      payload.status = contestScheduleAutomationService.getTargetContestStatus(payload);
    } catch {
      payload.status = payload.status || 'Registration Open';
    }

    const contest = await GrandContest.create(payload);
    return contest;
  }

  async listGrandContests(query: any = {}) {
    const { page = 1, limit = 10, search, status, category } = query;
    const filter: any = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (category && category !== 'All') {
      filter.categories = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { contestId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const contests = await GrandContest.find(filter)
      .populate('tasks')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Keep schedule statuses fresh
    try {
      const { contestScheduleAutomationService } = require('./ContestScheduleAutomationService');
      await Promise.all(contests.map((c: any) => contestScheduleAutomationService.checkAndUpdateSingleGrandContest(c)));
    } catch {}

    const total = await GrandContest.countDocuments(filter);

    return {
      contests,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  async getGrandContestById(id: string): Promise<IGrandContest> {
    let contest: IGrandContest | null = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      contest = await GrandContest.findById(id).populate('tasks');
    }

    if (!contest) {
      contest = await GrandContest.findOne({ contestId: id }).populate('tasks');
    }

    if (!contest) {
      const allContests = await GrandContest.find().populate('tasks');
      contest = allContests.find((c: any) => {
        const slug = (c.title || '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
        const target = id.toLowerCase().trim();
        return slug === target || (c.title || '').toLowerCase() === decodeURIComponent(target);
      }) || null;
    }

    if (!contest) {
      throw new NotFoundError('Grand Contest not found');
    }

    // Ensure schedule status is current
    try {
      const { contestScheduleAutomationService } = require('./ContestScheduleAutomationService');
      await contestScheduleAutomationService.checkAndUpdateSingleGrandContest(contest);
    } catch {}

    return contest;
  }

  async updateGrandContest(id: string, data: Partial<IGrandContest>): Promise<IGrandContest> {
    let contestIdToUpdate = id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const existing = await GrandContest.findOne({ contestId: id });
      if (!existing) {
        throw new NotFoundError('Grand Contest not found');
      }
      contestIdToUpdate = (existing._id as any).toString();
    }

    if (Array.isArray(data.tasks)) {
      data.tasksCount = data.tasks.length;
    }

    data.entryFeeType = 'Cash';
    data.entryFeeCoins = 0;
    if (data.entryFee !== undefined) {
      data.entryFee = Number(data.entryFee) || 0;
      data.isFree = data.entryFee === 0;
    }

    if (data.status !== 'Cancelled' && data.status !== 'Maintenance') {
      try {
        const { contestScheduleAutomationService } = require('./ContestScheduleAutomationService');
        const calculatedStatus = contestScheduleAutomationService.getTargetContestStatus(data);
        if (calculatedStatus) {
          data.status = calculatedStatus;
        }
      } catch {}
    }

    const updated = await GrandContest.findByIdAndUpdate(contestIdToUpdate, data, { new: true, runValidators: true }).populate('tasks');
    if (!updated) {
      throw new NotFoundError('Grand Contest not found');
    }

    try {
      const { contestScheduleAutomationService } = require('./ContestScheduleAutomationService');
      contestScheduleAutomationService.broadcastStatusChange(updated._id.toString(), updated.status, 'GrandContest');
    } catch {}

    return updated;
  }

  async deleteGrandContest(id: string): Promise<IGrandContest> {
    let contest: IGrandContest | null = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      contest = await GrandContest.findByIdAndDelete(id);
    } else {
      contest = await GrandContest.findOneAndDelete({ contestId: id });
    }

    if (!contest) {
      throw new NotFoundError('Grand Contest not found');
    }

    return contest;
  }

  async duplicateGrandContest(id: string): Promise<IGrandContest> {
    const original = await this.getGrandContestById(id);
    const obj = original.toObject();
    delete obj._id;
    delete (obj as any).createdAt;
    delete (obj as any).updatedAt;

    obj.contestId = generateUniqueGrandContestId();
    obj.title = `${original.title} (Copy)`;
    obj.status = 'Draft';

    const copy = await GrandContest.create(obj);
    return copy;
  }

  async getGrandContestAnalytics(id: string) {
    const contest = await this.getGrandContestById(id);
    return {
      contestId: contest.contestId,
      title: contest.title,
      totalParticipants: contest.maxParticipants || 0,
      tasksCount: contest.tasksCount || (contest.tasks ? contest.tasks.length : 0),
      prizePool: contest.prizePool || 0,
      status: contest.status
    };
  }

  async joinGrandContest(id: string, userId?: string) {
    const contest = await this.getGrandContestById(id);
    const now = new Date();

    // 1. Status Check
    const allowedStatuses = ['Registration Open', 'Active', 'Live', 'Upcoming', 'In Progress'];
    if (!allowedStatuses.includes(contest.status)) {
      throw new BadRequestError('Registration for this Grand Contest is currently closed.');
    }

    // 2. Date Check: Registration Window & Contest End Date
    if (contest.registrationStart && now < new Date(contest.registrationStart)) {
      throw new BadRequestError(`Registration for this Grand Contest opens on ${new Date(contest.registrationStart).toLocaleString()}`);
    }
    if (contest.registrationEnd && now > new Date(contest.registrationEnd)) {
      throw new BadRequestError('Registration window for this Grand Contest has already ended.');
    }
    if (contest.endDate && now > new Date(contest.endDate)) {
      throw new BadRequestError('This Grand Contest has already concluded.');
    }

    // 3. User & Duplicate Join Check
    let userObj: any = null;
    let isAlreadyJoined = false;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      userObj = await User.findById(userId);
      if (userObj) {
        const uIdStr = userObj._id.toString();
        contest.participants = contest.participants || [];
        isAlreadyJoined = contest.participants.some((p: any) => (p._id ? p._id.toString() === uIdStr : p.toString() === uIdStr));

        if (isAlreadyJoined) {
          const message = 'You have already joined this grand contest.';
          const responseData = {
            alreadyJoined: true,
            message,
            joinedAt: new Date(),
            contest,
            user: {
              _id: userObj._id,
              name: userObj.name,
              walletBalance: userObj.walletBalance,
              coins: userObj.coins
            },
            isJoined: true,
            joined: true,
            hasJoined: true
          };

          return {
            success: true,
            message,
            alreadyJoined: true,
            isJoined: true,
            joined: true,
            hasJoined: true,
            contest,
            user: responseData.user,
            data: responseData
          };
        }

        // 4. Entry Fee Payment Processing: Grand Contests STRICTLY require Entry Fee Type 'Cash' (INR ₹)
        const cashFee = Number(contest.entryFee) || 0;

        if (cashFee > 0) {
          const userWallet = Number(userObj.walletBalance) || 0;
          if (userWallet < cashFee) {
            throw new BadRequestError(`Insufficient wallet balance. This Grand Contest requires ₹${cashFee} cash entry fee.`);
          }

          userObj.walletBalance = userWallet - cashFee;
          await userObj.save();

          await Transaction.create({
            userId: userObj._id,
            amount: -cashFee,
            type: 'Entry Fee',
            status: 'Completed',
            description: `Cash entry fee for Grand Contest (${contest.contestId}): ${contest.title} (₹${cashFee})`,
            reference: `GNC-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
          });
        }

        // Add user to contest participants
        contest.participants.push(userObj._id as any);
      }
    }

    // 5. Update Contest Participants Count & Save
    const currentCount = contest.participants ? contest.participants.length : (contest.maxParticipants || 0) + 1;
    contest.maxParticipants = Math.max(contest.maxParticipants || 0, currentCount);
    await contest.save();

    const message = 'Joined Grand Contest successfully!';
    const responseData = {
      alreadyJoined: false,
      message,
      joinedAt: new Date(),
      contest,
      user: userObj ? {
        _id: userObj._id,
        name: userObj.name,
        walletBalance: userObj.walletBalance,
        coins: userObj.coins
      } : null,
      isJoined: true,
      joined: true,
      hasJoined: true
    };

    return {
      success: true,
      message,
      alreadyJoined: false,
      isJoined: true,
      joined: true,
      hasJoined: true,
      contest,
      user: responseData.user,
      data: responseData
    };
  }

  async checkGrandContestStatus(id: string, userId?: string) {
    const contest = await this.getGrandContestById(id);
    const now = new Date();

    const allowedStatuses = ['Registration Open', 'Active', 'Live', 'Upcoming', 'In Progress'];
    const isOpen = allowedStatuses.includes(contest.status);
    const registrationStarted = !contest.registrationStart || now >= new Date(contest.registrationStart);
    const registrationEnded = Boolean(contest.registrationEnd && now > new Date(contest.registrationEnd));
    const contestEnded = Boolean(contest.endDate && now > new Date(contest.endDate));

    const tasks = Array.isArray(contest.tasks) ? contest.tasks : [];
    const totalTasksCount = tasks.length > 0 ? tasks.length : Number(contest.tasksCount || 0);

    const cashFee = Number(contest.entryFee) || 0;
    const isFree = cashFee === 0;

    // If no userId, return clean unauthenticated payload
    if (!userId) {
      const canJoin = isOpen && registrationStarted && !registrationEnded && !contestEnded;
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
        message: 'User not authenticated',
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
          roomId: (contest._id as any).toString(),
          contestId: (contest._id as any).toString(),
          grandContestId: (contest._id as any).toString(),
          customContestId: contest.contestId,
          title: contest.title,
          status: contest.status,
          totalTasks: totalTasksCount,
          completedTasks: 0,
          pendingTasks: totalTasksCount,
          submittedTasks: 0,
          approvedTasks: 0,
          pendingReviewTasks: 0,
          rejectedTasks: 0,
          totalCycles: 1,
          completedCycles: 0,
          pendingCycles: 1,
          totalParticipants: contest.participants ? contest.participants.length : 0,
          maxParticipants: contest.maxParticipants || 0,
          entryFee: cashFee,
          entryFeeCoins: 0,
          entryFeeType: 'Cash',
          isFree,
          canJoin,
          requiresAuth: true
        }
      };
    }

    // Check user & join state
    const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;
    let userObj: any = null;
    if (userObjId) {
      userObj = await User.findById(userObjId);
    }

    let isJoined = false;
    const uIdStr = userId.toString();
    contest.participants = contest.participants || [];
    isJoined = contest.participants.some((p: any) => (p._id ? p._id.toString() === uIdStr : p.toString() === uIdStr));

    // Fetch user submissions for this grand contest
    const submissionsQuery: any = {
      userId: userObjId || userId,
      $or: [
        { contestId: contest._id },
        { grandContestId: contest._id }
      ]
    };
    if (mongoose.Types.ObjectId.isValid(contest.contestId)) {
      submissionsQuery.$or.push({ contestId: new mongoose.Types.ObjectId(contest.contestId) });
    }

    const submissions = await RoomSubmission.find(submissionsQuery).lean();
    if (submissions.length > 0) {
      isJoined = true;
    }

    // Task & submission metrics
    const userSubmittedTaskIdSet = new Set<string>();
    let approvedTasksCount = 0;
    let pendingReviewTasksCount = 0;
    let rejectedTasksCount = 0;

    for (const sub of submissions) {
      if (sub.taskId) {
        userSubmittedTaskIdSet.add(sub.taskId.toString());
      }
      if (sub.status === 'Approved') {
        approvedTasksCount++;
      } else if (sub.status === 'Pending') {
        pendingReviewTasksCount++;
      } else if (sub.status === 'Rejected') {
        rejectedTasksCount++;
      }
    }

    const submittedTasksCount = userSubmittedTaskIdSet.size || submissions.length;
    const completedTasksCount = approvedTasksCount > 0 ? approvedTasksCount : submittedTasksCount;
    const pendingTasks = Math.max(0, totalTasksCount - submittedTasksCount);

    let isCompleted = false;
    if (totalTasksCount > 0) {
      isCompleted = submittedTasksCount >= totalTasksCount || approvedTasksCount >= totalTasksCount;
    } else if (contest.status === 'Completed' && isJoined) {
      isCompleted = true;
    }

    // Determine eligibility to join
    let canJoin = !isJoined && isOpen && registrationStarted && !registrationEnded && !contestEnded;
    let cannotJoinReason: string | null = null;

    if (isJoined) {
      cannotJoinReason = isCompleted 
        ? 'User has completed all tasks in this grand contest' 
        : 'User has already joined this grand contest';
    } else if (!isOpen) {
      cannotJoinReason = `Registration is closed for status: ${contest.status}`;
    } else if (!registrationStarted) {
      cannotJoinReason = `Registration opens on ${new Date(contest.registrationStart).toLocaleString()}`;
    } else if (registrationEnded) {
      cannotJoinReason = 'Registration deadline has passed';
    } else if (contestEnded) {
      cannotJoinReason = 'Grand contest has already ended';
    } else if (contest.maxParticipants && contest.participants && contest.participants.length >= contest.maxParticipants) {
      canJoin = false;
      cannotJoinReason = 'Grand contest participant capacity reached';
    } else if (userObj && cashFee > 0) {
      if ((Number(userObj.walletBalance) || 0) < cashFee) {
        canJoin = false;
        cannotJoinReason = `Insufficient wallet balance. This Grand Contest requires ₹${cashFee} cash entry fee.`;
      }
    }

    let message = 'User not joined';
    if (isCompleted) {
      message = 'User has completed all tasks in this grand contest';
    } else if (isJoined) {
      message = 'User has already joined this grand contest';
    }

    return {
      success: true,
      isJoined,
      joined: isJoined,
      hasJoined: isJoined,
      join: isJoined,
      jin: isJoined,
      completed: isCompleted,
      complete: isCompleted,
      isCompleted,
      hasCompleted: isCompleted,
      isComplete: isCompleted,
      message,
      data: {
        isJoined,
        joined: isJoined,
        hasJoined: isJoined,
        join: isJoined,
        jin: isJoined,
        completed: isCompleted,
        complete: isCompleted,
        isCompleted,
        hasCompleted: isCompleted,
        isComplete: isCompleted,
        roomId: (contest._id as any).toString(),
        contestId: (contest._id as any).toString(),
        grandContestId: (contest._id as any).toString(),
        customContestId: contest.contestId,
        title: contest.title,
        status: contest.status,
        totalTasks: totalTasksCount,
        completedTasks: completedTasksCount,
        pendingTasks,
        submittedTasks: submittedTasksCount,
        approvedTasks: approvedTasksCount,
        pendingReviewTasks: pendingReviewTasksCount,
        rejectedTasks: rejectedTasksCount,
        totalCycles: 1,
        completedCycles: isCompleted ? 1 : 0,
        pendingCycles: isCompleted ? 0 : 1,
        totalParticipants: contest.participants ? contest.participants.length : 0,
        maxParticipants: contest.maxParticipants || 0,
        entryFee: cashFee,
        entryFeeCoins: 0,
        entryFeeType: 'Cash',
        isFree,
        canJoin,
        cannotJoinReason,
        submissionsCount: submissions.length
      }
    };
  }

  // ================= TASK MANAGEMENT FOR GRAND CONTEST =================
  async getTasksForGrandContest(id: string) {
    const contest = await this.getGrandContestById(id);
    const rawTasks = contest.tasks || [];
    if (Array.isArray(rawTasks) && rawTasks.length > 0 && typeof rawTasks[0] === 'object' && (rawTasks[0] as any).title) {
      return rawTasks;
    }
    const taskIds = rawTasks.map((t: any) => (t && typeof t === 'object' && t._id) ? t._id : t).filter(Boolean);
    const tasks = await Task.find({ _id: { $in: taskIds } }).sort({ order: 1, createdAt: -1 });
    return tasks;
  }

  async createTaskForGrandContest(id: string, taskData: any) {
    const contest = await this.getGrandContestById(id);
    const task = await Task.create({
      title: taskData.title,
      description: taskData.description || '',
      instructions: taskData.instructions || '',
      mediaUrl: taskData.mediaUrl || '',
      taskType: taskData.taskType || 'Quiz',
      submissionType: taskData.submissionType || 'Text',
      points: Number(taskData.points) || 100,
      bonusPoints: Number(taskData.bonusPoints) || 0,
      penaltyPoints: Number(taskData.penaltyPoints) || 0,
      reviewType: taskData.reviewType || 'Manual',
      status: taskData.status || 'Published',
      isMandatory: taskData.isMandatory !== undefined ? Boolean(taskData.isMandatory) : true,
      order: Number(taskData.order) || (contest.tasks ? contest.tasks.length + 1 : 1)
    });

    contest.tasks = contest.tasks || [];
    contest.tasks.push(task._id as mongoose.Types.ObjectId);
    contest.tasksCount = contest.tasks.length;
    await contest.save();

    return task;
  }

  async removeTaskFromGrandContest(id: string, taskId: string) {
    const contest = await this.getGrandContestById(id);
    if (!contest.tasks) return contest;

    contest.tasks = contest.tasks.filter((t: any) => t._id ? t._id.toString() !== taskId : t.toString() !== taskId);
    contest.tasksCount = contest.tasks.length;
    await contest.save();

    return contest;
  }

  // ================= SUBMISSIONS FOR GRAND CONTEST =================
  async getGrandContestSubmissions(id: string, query: any = {}) {
    const contest = await this.getGrandContestById(id);
    const { status, taskId, userId, page = 1, limit = 10 } = query;

    const filter: any = {
      $or: [
        { contestId: contest._id },
        { grandContestId: contest._id }
      ]
    };

    if (status && status !== 'All') filter.status = status;
    if (taskId && taskId !== 'All' && mongoose.Types.ObjectId.isValid(taskId)) filter.taskId = taskId;
    if (userId && userId !== 'All' && mongoose.Types.ObjectId.isValid(userId)) filter.userId = userId;

    const skip = (Number(page) - 1) * Number(limit);
    const submissions = await RoomSubmission.find(filter)
      .populate('taskId', 'title points taskType submissionType')
      .populate('userId', 'name email avatar')
      .populate('reviewedBy', 'name email')
      .sort({ createdDate: -1 })
      .skip(skip)
      .limit(Number(limit));

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

  async submitGrandContestTask(id: string, taskId: string, userId: string, submissionData: any) {
    const contest = await this.getGrandContestById(id);
    const now = new Date();

    // 1. Contest Dates & Status Check for Submission
    if (contest.startDate && now < new Date(contest.startDate)) {
      throw new BadRequestError(`Submissions for this Grand Contest open on ${new Date(contest.startDate).toLocaleString()}`);
    }
    if (contest.endDate && now > new Date(contest.endDate)) {
      throw new BadRequestError('Submission deadline for this Grand Contest has passed.');
    }
    if (['Draft', 'Cancelled', 'Completed', 'Maintenance'].includes(contest.status)) {
      throw new BadRequestError(`Submissions disabled: Grand Contest status is currently ${contest.status}.`);
    }

    // 2. User Join Verification
    const uIdStr = userId.toString();
    const isJoined = (contest.participants || []).some((p: any) => (p._id ? p._id.toString() === uIdStr : p.toString() === uIdStr));
    if (!isJoined) {
      throw new BadRequestError('You must join this Grand Contest before submitting tasks. Contest join cheyathe submit cheyan pattilla.');
    }

    let mediaUrl = submissionData.mediaUrl || '';
    if (mediaUrl && mediaUrl.startsWith('data:')) {
      mediaUrl = saveBase64File(mediaUrl, 'submission', 'proof');
    }

    const files = mediaUrl
      ? [
          {
            url: mediaUrl,
            filename: mediaUrl.split('/').pop() || 'submission_file',
            fileType: submissionData.submissionType || 'File',
            fileSizeMB: 0
          }
        ]
      : [];

    const submission = await RoomSubmission.create({
      contestId: contest._id as mongoose.Types.ObjectId,
      grandContestId: contest._id as mongoose.Types.ObjectId,
      taskId: new mongoose.Types.ObjectId(taskId),
      userId: new mongoose.Types.ObjectId(userId),
      submissionType: submissionData.submissionType || 'Link',
      mediaUrl,
      proofNotes: submissionData.proofNotes || submissionData.content || '',
      content: submissionData.proofNotes || submissionData.content || '',
      files,
      status: 'Pending',
      submittedAt: new Date()
    });

    return submission;
  }

  async reviewGrandContestSubmission(submissionId: string, reviewerId: string, reviewData: any) {
    const submission = await RoomSubmission.findById(submissionId).populate('taskId');
    if (!submission) throw new NotFoundError('Submission not found');

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
    return submission;
  }
}

export const grandContestService = new GrandContestService();

