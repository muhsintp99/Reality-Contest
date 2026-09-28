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

    const payload: Partial<IGrandContest> = {
      ...data,
      tasks,
      tasksCount,
      registrationStart: data.registrationStart ? new Date(data.registrationStart) : new Date(),
      registrationEnd: data.registrationEnd ? new Date(data.registrationEnd) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

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
      throw new NotFoundError('Grand Contest not found');
    }

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

    const updated = await GrandContest.findByIdAndUpdate(contestIdToUpdate, data, { new: true, runValidators: true }).populate('tasks');
    if (!updated) {
      throw new NotFoundError('Grand Contest not found');
    }

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
          return {
            success: true,
            alreadyJoined: true,
            message: 'You have already registered for this Grand Contest.',
            joinedAt: new Date(),
            contest
          };
        }

        // 4. Entry Fee / Price & Coin Payment Processing
        const isFreeEntry = contest.isFree || contest.entryFeeType === 'Free' || (contest.entryFee === 0 && contest.entryFeeCoins === 0);

        if (!isFreeEntry) {
          const isCoinFee = contest.entryFeeType === 'Coins' || (contest.entryFeeCoins && contest.entryFeeCoins > 0);

          if (isCoinFee) {
            const coinFee = contest.entryFeeCoins || contest.entryFee || 0;
            const userCoins = userObj.coins || 0;

            if (userCoins < coinFee && userObj.walletBalance < coinFee) {
              throw new BadRequestError(`Insufficient balance. This Grand Contest requires ${coinFee} Coins 🪙 for entry fee.`);
            }

            if (userCoins >= coinFee) {
              userObj.coins = userCoins - coinFee;
            } else {
              userObj.walletBalance -= coinFee;
            }
            await userObj.save();

            await Transaction.create({
              userId: userObj._id,
              amount: -coinFee,
              type: 'Entry Fee',
              status: 'Completed',
              description: `Coin entry fee for Grand Contest (${contest.contestId}): ${contest.title} (${coinFee} Coins 🪙)`,
              reference: `GNC-COIN-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
            });
          } else {
            // Cash Fee
            const cashFee = contest.entryFee || 0;
            if (userObj.walletBalance < cashFee) {
              throw new BadRequestError(`Insufficient wallet balance. This Grand Contest requires ₹${cashFee} entry fee.`);
            }

            userObj.walletBalance -= cashFee;
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
        }

        // Add user to contest participants
        contest.participants.push(userObj._id as any);
      }
    }

    // 5. Update Contest Participants Count & Save
    const currentCount = contest.participants ? contest.participants.length : (contest.maxParticipants || 0) + 1;
    contest.maxParticipants = Math.max(contest.maxParticipants || 0, currentCount);
    await contest.save();

    return {
      success: true,
      alreadyJoined: false,
      message: 'Joined Grand Contest successfully!',
      joinedAt: new Date(),
      contest
    };
  }

  // ================= TASK MANAGEMENT FOR GRAND CONTEST =================
  async getTasksForGrandContest(id: string) {
    const contest = await this.getGrandContestById(id);
    const taskIds = contest.tasks || [];
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
    const { status, taskId, page = 1, limit = 10 } = query;

    const filter: any = {
      $or: [
        { contestId: contest._id },
        { grandContestId: contest._id }
      ]
    };

    if (status && status !== 'All') filter.status = status;
    if (taskId && taskId !== 'All' && mongoose.Types.ObjectId.isValid(taskId)) filter.taskId = taskId;

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

