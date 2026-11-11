import { ContestRepository } from '../repositories/ContestRepository';
import { GroupRepository } from '../repositories/GroupRepository';
import { UserRepository } from '../repositories/UserRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { StageRepository } from '../repositories/StageRepository';
import { ResultRepository } from '../repositories/ResultRepository';
import { IContest, ContestStatus, Contest } from '../models/Contest';
import { IGroup } from '../models/Group';
import { Question } from '../models/Question';
import { Attempt } from '../models/Attempt';
import { Result } from '../models/Result';
import { Leaderboard } from '../models/Leaderboard';
import { User } from '../models/User';
import { walletService } from './WalletService';
import { socketService } from './SocketService';
import { BadRequestError, NotFoundError } from '../core/errors';
import { questionSelectionService } from './QuestionSelectionService';
import { logger } from '../core/logger';
import mongoose from 'mongoose';

const generateUniqueContestId = (): string => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `CNT-${year}-${randomDigits}`;
};

export class ContestService {
  private contestRepo = new ContestRepository();
  private groupRepo = new GroupRepository();
  private userRepo = new UserRepository();
  private transRepo = new TransactionRepository();
  private stageRepo = new StageRepository();
  private resultRepo = new ResultRepository();

  async createContest(data: Partial<IContest>): Promise<IContest> {
    if (!data.title) {
      throw new BadRequestError('Title is required for contest creation.');
    }

    // Auto-create unique Contest ID if not explicitly specified
    if (!data.contestId) {
      data.contestId = generateUniqueContestId();
    }

    const payload: Partial<IContest> = {
      ...data,
      registrationStart: data.registrationStart ? new Date(data.registrationStart) : new Date(),
      registrationEnd: data.registrationEnd ? new Date(data.registrationEnd) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    // Auto-calculate schedule status based on dates if not Cancelled or Maintenance
    if (payload.status !== 'Cancelled' && payload.status !== 'Maintenance') {
      try {
        const { getTargetContestStatus } = require('./ContestScheduleAutomationService');
        const evalResult = getTargetContestStatus(payload);
        if (evalResult && evalResult.targetStatus) {
          payload.status = evalResult.targetStatus as any;
        }
      } catch {}
    }

    // Automatic Random Question Selection if questionsCount > 0 and no explicit questions array provided
    const targetCount = Number(payload.questionsCount) || 0;
    if (targetCount > 0 && (!payload.questions || payload.questions.length === 0)) {
      try {
        const selectedQuestionIds = await questionSelectionService.selectRandomQuestionsForContest(
          payload.categories || [],
          targetCount
        );
        payload.questions = selectedQuestionIds;
        payload.questionsCount = selectedQuestionIds.length;
      } catch (err: any) {
        logger.warn(`Auto question selection notice: ${err.message}. Applying fallback questions.`);
        const fallbackQs = await Question.find({}).limit(targetCount).select('_id').lean().exec();
        if (fallbackQs && fallbackQs.length > 0) {
          payload.questions = fallbackQs.map(q => q._id as any);
          payload.questionsCount = payload.questions.length;
        }
      }
    }

    const contest = await this.contestRepo.create(payload);

    // Auto-create a default group for this contest to hold stages
    await this.groupRepo.create({
      contestId: contest._id,
      name: 'Default Group',
      maxParticipants: data.maxParticipants || 0,
      participants: []
    });

    return contest;
  }

  async getContestById(id: string): Promise<IContest> {
    if (!id) {
      throw new BadRequestError('Contest identifier is required.');
    }
    const cleanId = decodeURIComponent(id).trim();
    let contest: any = null;
    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      contest = await Contest.findById(cleanId).populate('questions').exec();
    }
    if (!contest) {
      // Also attempt lookup by custom contestId (e.g. CNT-2026-12345)
      contest = await Contest.findOne({ contestId: cleanId }).sort({ createdAt: -1 }).populate('questions').exec();
    }
    if (!contest) {
      // Lookup by exact or case-insensitive title (prefer newest active contest)
      contest = await Contest.findOne({
        title: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      }).sort({ createdAt: -1 }).populate('questions').exec();
    }
    if (!contest) {
      // Attempt lookup by title slug
      const slugSearch = cleanId.replace(/[-_]+/g, ' ');
      contest = await Contest.findOne({
        title: { $regex: new RegExp(`^${slugSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      }).sort({ createdAt: -1 }).populate('questions').exec();
      if (!contest) {
        const all = await Contest.find().sort({ createdAt: -1 }).populate('questions').limit(150).exec();
        const targetSlug = cleanId.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
        contest = all.find((c: any) => {
          const s = (c.title || '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
          return s === targetSlug || (c.title || '').toLowerCase() === cleanId.toLowerCase();
        }) || null;
      }
    }
    if (!contest) {
      throw new NotFoundError('Contest not found.');
    }

    // Ensure questions from Question Pool populate so questions never fail to appear
    if (!contest.questions || contest.questions.length === 0) {
      const cats = (contest.categories && contest.categories.length > 0) ? contest.categories : ['General Knowledge'];
      const targetCount = contest.questionsCount && contest.questionsCount > 0 ? contest.questionsCount : 20;

      try {
        const poolQuestions = await Question.find({
          $or: [
            { category: { $in: cats } },
            { category: { $regex: new RegExp(cats.map((c: string) => String(c).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i') } }
          ]
        }).limit(targetCount).lean().exec();

        if (poolQuestions && poolQuestions.length > 0) {
          contest.questions = poolQuestions as any;
        } else {
          // Fallback to any active questions so contest questions are never empty
          const fallbackQuestions = await Question.find({}).limit(targetCount).lean().exec();
          if (fallbackQuestions && fallbackQuestions.length > 0) {
            contest.questions = fallbackQuestions as any;
          }
        }
      } catch {
        // Ignore fallback query errors
      }
    }

    // Ensure schedule time status is up-to-date
    try {
      const { contestScheduleAutomationService } = require('./ContestScheduleAutomationService');
      await contestScheduleAutomationService.checkAndUpdateSingleContest(contest);
    } catch {}

    return contest;
  }

  async listContests(filter: any = {}): Promise<IContest[]> {
    try {
      const { contestScheduleAutomationService } = require('./ContestScheduleAutomationService');
      const activeCandidates = await Contest.find({
        status: { $nin: ['Cancelled', 'Maintenance'] }
      }).exec();
      for (const candidate of activeCandidates) {
        await contestScheduleAutomationService.checkAndUpdateSingleContest(candidate);
      }
    } catch {}

    const query: any = {};
    if (filter.status && filter.status !== 'All') {
      query.status = filter.status;
    }
    if (filter.category && filter.category !== 'All') {
      query.categories = filter.category;
    }
    if (filter.search) {
      const searchRegex = new RegExp(filter.search, 'i');
      query.$or = [
        { contestId: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { rules: searchRegex }
      ];
    }
    return this.contestRepo.find(query, null, { sort: { createdAt: -1 } });
  }

  async joinContest(contestId: string, userId: string): Promise<{
    success: boolean;
    message: string;
    alreadyJoined?: boolean;
    joinedGroup: string;
    group: any;
    stages: any[];
    stageUnlockMap: Record<string, boolean>;
    user: {
      _id: any;
      name: string;
      email: string;
      walletBalance: number;
      coins: number;
      kycStatus: string;
      role: string;
    };
  }> {
    const contest = await this.getContestById(contestId);
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    // KYC check bypassed for contest joining (Coin / Price check enforced below)
    const allowedStatuses: ContestStatus[] = ['Registration Open', 'Active', 'Live', 'In Progress'];
    if (!allowedStatuses.includes(contest.status)) {
      throw new BadRequestError('Registration for this contest is currently not open.');
    }

    // Check if user already joined any group in this contest
    const groupsInContest = await this.groupRepo.find({ contestId: contest._id });
    const existingGroup = groupsInContest.find((g) =>
      g.participants.some((pId) => pId.toString() === userId)
    );

    let assignedGroup: IGroup | null = existingGroup || null;
    let isAlreadyJoined = false;

    if (existingGroup) {
      isAlreadyJoined = true;
    } else {
      // Check maximum participants limit
      if (contest.maxParticipants > 0) {
        const currentParticipantsCount = groupsInContest.reduce((sum, g) => sum + g.participants.length, 0);
        if (currentParticipantsCount >= contest.maxParticipants) {
          throw new BadRequestError('Contest has reached its maximum participants limit.');
        }
      }

      // Free Entry vs Coins Fee vs Cash Fee deduction
      const isFreeEntry = contest.entryFee === 0 || contest.entryFeeType === 'Free' || contest.isFree === true;

      if (!isFreeEntry) {
        const isCoinFee = contest.entryFeeType === 'Coins' || (contest.entryFeeCoins && contest.entryFeeCoins > 0);

        if (isCoinFee) {
          const coinFee = contest.entryFeeCoins || contest.entryFee;
          const currentCoins = user.coins || 0;

          if (currentCoins < coinFee && user.walletBalance < coinFee) {
            throw new BadRequestError(`Insufficient balance. This contest requires ${coinFee} Coins 🪙 for entry.`);
          }

          if (currentCoins >= coinFee) {
            user.coins = currentCoins - coinFee;
          } else {
            user.walletBalance -= coinFee;
          }
          await user.save();

          await this.transRepo.create({
            userId: user._id,
            amount: -coinFee,
            type: 'Entry Fee',
            status: 'Completed',
            description: `Coin entry fee for contest ${contest.contestId || ''}: ${contest.title} (${coinFee} Coins 🪙)`,
            reference: `COIN-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
          });
        } else {
          // Cash wallet entry fee
          if (user.walletBalance < contest.entryFee) {
            throw new BadRequestError('Insufficient wallet balance to pay the entry fee.');
          }

          user.walletBalance -= contest.entryFee;
          await user.save();

          await this.transRepo.create({
            userId: user._id,
            amount: -contest.entryFee,
            type: 'Entry Fee',
            status: 'Completed',
            description: `Entry fee for contest ${contest.contestId || ''}: ${contest.title}`,
            reference: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
          });
        }
      }

      // Assign to a group. If no groups exist, auto-create a default group
      assignedGroup = groupsInContest[0];
      if (!assignedGroup) {
        assignedGroup = await this.groupRepo.create({
          contestId: contest._id,
          name: 'Group A',
          participants: [],
          qualificationRules: {},
          maxParticipants: 1000,
          stageSequence: []
        });
      }

      assignedGroup.participants.push(user._id as any);
      await assignedGroup.save();
    }

    if (!assignedGroup) {
      throw new NotFoundError('Failed to assign group for contest.');
    }

    const currentGroup: IGroup = assignedGroup;

    // Fetch stages for the assigned group
    const stages = await this.stageRepo.findByGroup(currentGroup._id.toString());

    // Calculate stage unlock statuses for this user
    const stageUnlockMap: Record<string, boolean> = {};
    if (currentGroup.stageSequence && currentGroup.stageSequence.length > 0) {
      for (let i = 0; i < currentGroup.stageSequence.length; i++) {
        const sId = currentGroup.stageSequence[i].toString();
        if (i === 0) {
          stageUnlockMap[sId] = true;
        } else {
          const prevStageId = currentGroup.stageSequence[i - 1].toString();
          const prevResult = await this.resultRepo.findOne({
            userId,
            stageId: prevStageId,
            passed: true
          });
          stageUnlockMap[sId] = !!prevResult;
        }
      }
    } else {
      // Fallback: if stageSequence is empty, unlock first stage by default
      stages.forEach((stg, index) => {
        stageUnlockMap[stg._id.toString()] = index === 0;
      });
    }

    const updatedUser = await this.userRepo.findById(userId);

    return {
      success: true,
      message: isAlreadyJoined ? 'You have already registered for this contest.' : 'Joined contest successfully!',
      alreadyJoined: isAlreadyJoined,
      joinedGroup: currentGroup.name,
      group: currentGroup,
      stages,
      stageUnlockMap,
      user: {
        _id: updatedUser?._id || user._id,
        name: updatedUser?.name || user.name,
        email: updatedUser?.email || user.email,
        walletBalance: updatedUser?.walletBalance ?? user.walletBalance,
        coins: updatedUser?.coins ?? user.coins,
        kycStatus: updatedUser?.kycStatus || user.kycStatus,
        role: updatedUser?.role || user.role
      }
    };
  }

  async updateContest(id: string, data: Partial<IContest>): Promise<IContest> {
    let contest: any = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      contest = await Contest.findById(id).exec();
    }
    if (!contest) {
      contest = await Contest.findOne({ contestId: id }).exec();
    }
    if (!contest) {
      try {
        contest = await this.getContestById(id);
      } catch {}
    }
    if (!contest) {
      throw new NotFoundError('Contest not found.');
    }

    // Convert date strings if passed
    if (data.registrationStart) data.registrationStart = new Date(data.registrationStart);
    if (data.registrationEnd) data.registrationEnd = new Date(data.registrationEnd);
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    // Auto-generate random questions if questionsCount or categories changed and questions array is empty/not passed
    const targetCount = Number(data.questionsCount !== undefined ? data.questionsCount : contest.questionsCount) || 0;
    if (targetCount > 0 && (!data.questions || data.questions.length === 0) && (data.questionsCount || data.categories)) {
      try {
        const selectedCats = data.categories || contest.categories || [];
        const selectedQuestionIds = await questionSelectionService.selectRandomQuestionsForContest(
          selectedCats,
          targetCount
        );
        if (selectedQuestionIds && selectedQuestionIds.length > 0) {
          data.questions = selectedQuestionIds as any;
          data.questionsCount = selectedQuestionIds.length;
        }
      } catch (err: any) {
        logger.warn(`Auto question reselection notice on contest update: ${err.message}`);
      }
    }

    // Clean questions array to only IDs before saving to prevent casting issues
    if (data.questions && Array.isArray(data.questions)) {
      data.questions = data.questions.map((q: any) => (q && q._id ? q._id : q));
    }

    // Preserve existing contestId if empty or not provided
    if (!data.contestId) {
      delete (data as any).contestId;
    }

    Object.assign(contest, data);

    // Calculate target status from schedule dates if not explicitly set to Cancelled or Maintenance
    if (contest.status !== 'Cancelled' && contest.status !== 'Maintenance') {
      try {
        const { contestScheduleAutomationService } = require('./ContestScheduleAutomationService');
        const calculatedStatus = contestScheduleAutomationService.getTargetContestStatus(contest);
        if (calculatedStatus) {
          contest.status = calculatedStatus;
        }
      } catch {}
    }

    const savedContest = await contest.save();

    // Broadcast update to real-time clients
    try {
      const { contestScheduleAutomationService } = require('./ContestScheduleAutomationService');
      contestScheduleAutomationService.broadcastStatusChange(savedContest._id.toString(), savedContest.status, 'Contest');
    } catch {}

    return savedContest;
  }

  async duplicateContest(id: string): Promise<IContest> {
    const existing = await this.getContestById(id);
    const existingObj = existing.toObject ? existing.toObject() : existing;

    // Omit _id, createdAt, updatedAt and auto-generate new unique contestId
    const { _id, createdAt, updatedAt, contestId, ...cloneData } = existingObj;
    cloneData.contestId = generateUniqueContestId();
    cloneData.title = `${cloneData.title} (Copy)`;

    try {
      const { contestScheduleAutomationService } = require('./ContestScheduleAutomationService');
      cloneData.status = contestScheduleAutomationService.getTargetContestStatus(cloneData);
    } catch {
      cloneData.status = 'Registration Open';
    }

    const newContest = await this.contestRepo.create(cloneData);

    // Auto-create default group
    await this.groupRepo.create({
      contestId: newContest._id,
      name: 'Default Group',
      maxParticipants: newContest.maxParticipants || 0,
      participants: []
    });

    return newContest;
  }

  async deleteContest(id: string): Promise<IContest> {
    const contest = await this.getContestById(id);
    if (!contest) {
      throw new NotFoundError('Contest not found.');
    }
    await this.contestRepo.delete(contest._id.toString());
    await this.groupRepo.deleteMany({ contestId: contest._id });
    return contest;
  }

  async getContestAnalytics(id: string): Promise<any> {
    const rawParam = decodeURIComponent(id || '').trim();
    let contest: any = null;
    try {
      contest = await this.getContestById(rawParam);
    } catch (e) {
      contest = null;
    }

    const cleanTitle = contest
      ? contest.title
      : (rawParam && rawParam !== ':title')
        ? rawParam.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : 'Contest';

    const cleanId = contest
      ? (contest.contestId || contest._id.toString())
      : (rawParam && rawParam !== ':title')
        ? rawParam
        : 'CNT-2026-101';

    const contestObj: any = contest ? (contest.toObject ? contest.toObject() : contest) : {
      _id: cleanId,
      contestId: cleanId,
      title: cleanTitle,
      categories: ['Reality Contest'],
      status: 'Upcoming',
      entryFee: 0,
      prizePool: 0,
      questionsCount: 0,
      timerLimit: 30
    };

    const now = Date.now();
    const formatTime = (dateOrMs: Date | number) => {
      const d = typeof dateOrMs === 'number' ? new Date(now - dateOrMs) : new Date(dateOrMs);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // 1. Fetch real groups & participants (safely check ObjectId validity)
    const isValidId = Boolean(contest && contest._id) || mongoose.Types.ObjectId.isValid(contestObj._id);
    let rawResults: any[] = [];
    let rawAttempts: any[] = [];
    const participantIdSet = new Set<string>();

    if (isValidId) {
      try {
        const contestObjectId = (contest && contest._id)
          ? contest._id
          : (mongoose.Types.ObjectId.isValid(contestObj._id) ? new mongoose.Types.ObjectId(contestObj._id) : null);
        const orConditions: any[] = [];
        if (contestObjectId) {
          orConditions.push({ contestId: contestObjectId });
        }
        if (contestObj.contestId && mongoose.Types.ObjectId.isValid(contestObj.contestId)) {
          orConditions.push({ contestId: new mongoose.Types.ObjectId(contestObj.contestId) });
        }

        const queryFilter = orConditions.length === 1
          ? orConditions[0]
          : (orConditions.length > 1 ? { $or: orConditions } : null);

        const groupsInContest = queryFilter ? await this.groupRepo.find(queryFilter) : [];
        groupsInContest.forEach((g) => {
          if (Array.isArray(g.participants)) {
            g.participants.forEach((p: any) => {
              const pid = (p?._id || p)?.toString();
              if (pid) participantIdSet.add(pid);
            });
          }
        });

        if (Array.isArray(contestObj.participants)) {
          contestObj.participants.forEach((p: any) => {
            const pid = (p?._id || p)?.toString();
            if (pid) participantIdSet.add(pid);
          });
        }

        rawResults = queryFilter ? await Result.find(queryFilter)
          .populate('userId', 'name username email avatar')
          .populate('attemptId', 'submittedAt startedAt score status answers cheatAlerts')
          .sort({ score: -1, createdAt: 1 })
          .lean() : [];

        rawAttempts = queryFilter ? await Attempt.find(queryFilter)
          .populate('userId', 'name username email avatar')
          .lean() : [];
      } catch (err) {
        logger.warn(`Failed to query contest records for analytics: ${err}`);
      }
    }

    // Collect all user IDs who joined or submitted
    rawAttempts.forEach((att: any) => {
      const uid = (att.userId?._id || att.userId)?.toString();
      if (uid) participantIdSet.add(uid);
    });
    rawResults.forEach((res: any) => {
      const uid = (res.userId?._id || res.userId)?.toString();
      if (uid) participantIdSet.add(uid);
    });

    const participantIds = Array.from(participantIdSet).filter(uid => mongoose.Types.ObjectId.isValid(uid));
    const users = participantIds.length > 0
      ? await User.find({ _id: { $in: participantIds } }).select('name username email avatar createdAt').lean()
      : [];

    const userMap = new Map<string, any>();
    users.forEach((u: any) => userMap.set(u._id.toString(), u));

    let completedList: any[] = [];
    let registeredList: any[] = [];
    let joinedList: any[] = [];
    let exitedList: any[] = [];

    if (rawResults.length > 0 || rawAttempts.length > 0 || users.length > 0) {
      // Build completed list from real results
      completedList = rawResults.map((r: any, idx: number) => {
        const u = r.userId || userMap.get((r.userId?._id || r.userId)?.toString()) || {};
        const uIdStr = (u._id || r.userId?._id || r.userId || '').toString();
        return {
          id: `CMP-${idx + 1}`,
          userName: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || `Contestant ${idx + 1}`,
          userId: uIdStr,
          contestantId: `CNT-${uIdStr ? uIdStr.slice(-4).toUpperCase() : (idx + 101)}`,
          email: u.email || '',
          completionTime: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : formatTime(2 * 3600 * 1000),
          finalScore: r.score ?? 0,
          rank: idx + 1,
          passed: r.passed ?? false,
          status: r.status || (r.passed ? 'Qualified' : 'Completed')
        };
      });

      // Build registered list from users in groups or attempts
      registeredList = users.map((u: any, idx: number) => {
        const uIdStr = u._id.toString();
        const hasCompleted = rawResults.some((r: any) => (r.userId?._id || r.userId)?.toString() === uIdStr);
        const hasAttempt = rawAttempts.some((a: any) => (a.userId?._id || a.userId)?.toString() === uIdStr);
        let userStatus = 'Registered';
        if (hasCompleted) userStatus = 'Completed';
        else if (hasAttempt) userStatus = 'Active';

        return {
          id: `REG-${idx + 101}`,
          userName: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || `User ${idx + 1}`,
          userId: uIdStr,
          contestantId: `CNT-${uIdStr.slice(-4).toUpperCase()}`,
          email: u.email || '',
          registrationTime: u.createdAt ? new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : formatTime((6 - idx * 0.2) * 3600 * 1000),
          status: userStatus
        };
      });

      // If registeredList is empty but rawResults has entries (e.g. userId populated directly)
      if (registeredList.length === 0 && rawResults.length > 0) {
        registeredList = rawResults.map((r: any, idx: number) => {
          const u = r.userId || {};
          const uIdStr = (u._id || r.userId || '').toString();
          return {
            id: `REG-${idx + 101}`,
            userName: u.name || u.username || `User ${idx + 1}`,
            userId: uIdStr,
            contestantId: `CNT-${uIdStr ? uIdStr.slice(-4).toUpperCase() : idx + 1}`,
            email: u.email || '',
            registrationTime: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier',
            status: 'Completed'
          };
        });
      }

      // Joined list (those who actively joined / attempted / completed)
      joinedList = registeredList.filter(u => u.status !== 'Registered').map(u => ({
        ...u,
        joinTime: formatTime(3 * 3600 * 1000),
        currentStatus: u.status
      }));

      // Exited / flagged attempts
      exitedList = rawAttempts
        .filter((a: any) => (a.cheatAlerts && a.cheatAlerts.length > 0) || a.status === 'In Progress')
        .map((a: any, idx: number) => {
          const u = a.userId || userMap.get((a.userId?._id || a.userId)?.toString()) || {};
          const uIdStr = (u._id || a.userId?._id || a.userId || '').toString();
          const reason = (a.cheatAlerts && a.cheatAlerts[0]?.details) || (a.status === 'In Progress' ? 'Timed Out / Left Quiz' : 'Exited Contest');
          return {
            id: `EXIT-${idx + 1}`,
            userName: u.name || u.username || `Contestant ${idx + 1}`,
            userId: uIdStr,
            contestantId: `CNT-${uIdStr ? uIdStr.slice(-4).toUpperCase() : idx + 1}`,
            email: u.email || '',
            exitTime: a.updatedAt ? new Date(a.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : formatTime(1 * 3600 * 1000),
            exitReason: reason
          };
        });
    }

    const totalRegisteredUsers = registeredList.length;
    const totalJoinedUsers = joinedList.length;
    const totalCompletedParticipants = completedList.length;
    const totalExitedUsers = exitedList.length;
    const totalActiveParticipants = Math.max(0, totalJoinedUsers - totalCompletedParticipants - totalExitedUsers);

    // Compute dynamic winner from top completed participant
    const pool = Number(contestObj.prizePool || 0);
    let winner: any = null;
    if (completedList.length > 0) {
      const top1 = completedList[0];
      const top2 = completedList[1] || null;
      const top3 = completedList[2] || null;

      winner = {
        name: top1.userName,
        userId: top1.userId,
        contestantId: top1.contestantId,
        finalScore: top1.finalScore,
        prizeAmount: pool > 0 ? Math.floor(pool * 0.5) : (Number(contestObj.coinsReward) || 10),
        selectionTime: new Date().toISOString(),
        runnerUp: top2 ? {
          name: top2.userName,
          userId: top2.userId,
          contestantId: top2.contestantId,
          finalScore: top2.finalScore,
          prizeAmount: pool > 0 ? Math.floor(pool * 0.3) : 5
        } : null,
        thirdPlace: top3 ? {
          name: top3.userName,
          userId: top3.userId,
          contestantId: top3.contestantId,
          finalScore: top3.finalScore,
          prizeAmount: pool > 0 ? Math.floor(pool * 0.2) : 2
        } : null
      };
    }

    const registrationPercentage = totalRegisteredUsers > 0 ? 100 : 0;
    const joinPercentage = totalRegisteredUsers > 0 ? Math.round((totalJoinedUsers / totalRegisteredUsers) * 100) : 0;
    const completionPercentage = totalJoinedUsers > 0 ? Math.round((totalCompletedParticipants / totalJoinedUsers) * 100) : 0;
    const exitPercentage = totalJoinedUsers > 0 ? Math.round((totalExitedUsers / totalJoinedUsers) * 100) : 0;

    return {
      contest: {
        _id: contestObj._id,
        contestId: contestObj.contestId || id,
        title: contestObj.title,
        category: (contestObj.categories && contestObj.categories[0]) || contestObj.category || 'General',
        status: contestObj.status || 'Active',
        entryFee: contestObj.entryFee || 0,
        prizePool: contestObj.prizePool || 0,
        questionsCount: contestObj.questionsCount || 20,
        timerLimit: contestObj.timerLimit || 30
      },
      overview: {
        totalRegisteredUsers,
        totalJoinedUsers,
        totalExitedUsers,
        totalActiveParticipants,
        totalCompletedParticipants,
        winnerSelected: Boolean(winner),
        winnerName: winner ? winner.name : null,
        contestStatus: contestObj.status || 'Active',
        registrationPercentage,
        joinPercentage,
        exitPercentage,
        completionPercentage
      },
      charts: {
        registrationTrend: totalRegisteredUsers > 0 ? [
          { time: '08:00 AM', count: Math.max(1, Math.round(totalRegisteredUsers * 0.2)) },
          { time: '12:00 PM', count: Math.max(1, Math.round(totalRegisteredUsers * 0.5)) },
          { time: '04:00 PM', count: Math.max(1, Math.round(totalRegisteredUsers * 0.8)) },
          { time: '06:00 PM', count: totalRegisteredUsers }
        ] : [],
        joinVsExit: totalJoinedUsers > 0 ? [
          { hour: '10:00 AM', joined: Math.ceil(totalJoinedUsers * 0.4), exited: Math.ceil(totalExitedUsers * 0.3) },
          { hour: '02:00 PM', joined: Math.ceil(totalJoinedUsers * 0.4), exited: Math.ceil(totalExitedUsers * 0.4) },
          { hour: '06:00 PM', joined: Math.max(1, totalJoinedUsers - Math.ceil(totalJoinedUsers * 0.8)), exited: Math.max(0, totalExitedUsers - Math.ceil(totalExitedUsers * 0.7)) }
        ] : [],
        statusDistribution: [
          { label: 'Completed', value: totalCompletedParticipants, color: '#10B981' },
          { label: 'Active', value: totalActiveParticipants, color: '#3B82F6' },
          { label: 'Exited', value: totalExitedUsers, color: '#F43F5E' },
          { label: 'Registered', value: Math.max(0, totalRegisteredUsers - totalJoinedUsers), color: '#F59E0B' }
        ]
      },
      participants: {
        registered: registeredList,
        joined: joinedList,
        exited: exitedList,
        completed: completedList
      },
      winners: winner,
      timeline: [
        {
          title: 'Contest Created',
          timestamp: contestObj.createdAt ? new Date(contestObj.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Created',
          details: `Contest "${contestObj.title}" initialized with prize pool ${contestObj.prizePool || 0}`,
          status: 'Completed'
        },
        {
          title: 'Registration Window',
          timestamp: contestObj.startDate ? new Date(contestObj.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Open',
          details: `${totalRegisteredUsers} contestant(s) enrolled`,
          status: totalRegisteredUsers > 0 ? 'Completed' : 'Active'
        },
        {
          title: 'Live Contest Quiz',
          timestamp: contestObj.startDate ? new Date(contestObj.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
          details: `${totalJoinedUsers} participant(s) joined live quiz session`,
          status: totalJoinedUsers > 0 ? 'Completed' : 'Pending'
        },
        {
          title: 'Evaluations & Grading',
          timestamp: completedList.length > 0 ? 'Graded' : 'Pending',
          details: `${totalCompletedParticipants} participant(s) completed and scored`,
          status: totalCompletedParticipants > 0 ? 'Completed' : 'Pending'
        },
        {
          title: 'Winners Declared',
          timestamp: winner ? 'Declared' : 'Pending',
          details: winner ? `1st Place: ${winner.name} (Score: ${winner.finalScore})` : 'Awaiting contest conclusion and scoring',
          status: winner ? 'Completed' : 'Pending'
        }
      ]
    };
  }

  async submitContestAnswers(
    contestId: string,
    userId: string,
    payload: { answers: Record<string, any>; cheatAlerts?: any[] }
  ): Promise<{
    success: boolean;
    contestId: string;
    contestTitle: string;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracyPercentage: number;
    rewardTier: string;
    rewardType: 'None' | 'Bonus' | 'Prize Pool';
    rewardAmount: number;
    currency: 'INR' | 'Coins';
    message: string;
    user: {
      _id: any;
      name: string;
      email: string;
      walletBalance: number;
      coins: number;
    };
    answerDetails: any[];
  }> {
    const contest = await this.getContestById(contestId);
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    // KYC check bypassed for contest answer submission
    // Check if user has joined this contest; if not, auto-enroll user into default group
    const groupsInContest = await this.groupRepo.find({ contestId: contest._id });
    let userGroup = groupsInContest.find((g) =>
      g.participants.some((pId) => pId.toString() === userId)
    );

    if (!userGroup && groupsInContest.length > 0) {
      userGroup = groupsInContest[0];
      userGroup.participants.push(user._id as any);
      await userGroup.save();
    }

    // Load questions for this contest
    let questions: any[] = [];
    if (contest.questions && contest.questions.length > 0) {
      if (typeof contest.questions[0] === 'object' && (contest.questions[0] as any).text) {
        questions = contest.questions as any[];
      } else {
        questions = await Question.find({ _id: { $in: contest.questions } }).lean();
      }
    }

    if (questions.length === 0) {
      const stages = await this.stageRepo.findByGroup((userGroup?._id || contest._id).toString());
      for (const stage of stages) {
        if (stage.config?.questionPoolId) {
          const poolQuestions = await Question.find({ poolId: stage.config.questionPoolId }).lean();
          if (poolQuestions.length > 0) {
            questions = poolQuestions;
            break;
          }
        }
      }

      if (questions.length === 0) {
        const cats = contest.categories || [];
        if (cats.length > 0) {
          questions = await Question.find({ category: { $in: cats } }).limit(contest.questionsCount || 20).lean().exec();
        }
        if (questions.length === 0) {
          questions = await Question.find({}).limit(contest.questionsCount || 20).lean().exec();
        }
      }
    }

    const userAnswers = payload.answers || {};
    let correctCount = 0;
    let totalQuestions = questions.length;
    const answerDetails: any[] = [];

    if (totalQuestions > 0) {
      for (const q of questions) {
        const qIdStr = q._id.toString();
        // Match by question ID or title/text
        const submitted = userAnswers[qIdStr] ?? userAnswers[q.text] ?? userAnswers[qIdStr.slice(-4)];

        const correctOptions = (q.options || [])
          .map((opt: any, idx: number) => ({ idx, text: opt.text, isCorrect: opt.isCorrect }))
          .filter((opt: any) => opt.isCorrect);

        const correctIndices = correctOptions.map((o: any) => o.idx);
        const correctTexts = correctOptions.map((o: any) => (o.text || '').trim().toLowerCase());

        let isCorrect = false;

        if (submitted !== undefined && submitted !== null) {
          if (typeof submitted === 'number') {
            isCorrect = correctIndices.includes(submitted);
          } else if (typeof submitted === 'string') {
            const subClean = submitted.trim().toLowerCase();
            isCorrect =
              correctTexts.includes(subClean) ||
              (Number.isInteger(Number(subClean)) && correctIndices.includes(Number(subClean)));
          } else if (Array.isArray(submitted)) {
            const subNumbers = submitted.map(Number);
            isCorrect =
              correctIndices.length === subNumbers.length &&
              correctIndices.every((val: number) => subNumbers.includes(val));
          }
        }

        if (isCorrect) {
          correctCount++;
        }

        answerDetails.push({
          questionId: q._id,
          questionText: q.text,
          submittedAnswer: submitted,
          isCorrect,
          correctOptions: correctOptions.map((o: any) => o.text)
        });
      }
    } else {
      // Evaluate direct answers payload
      const submittedKeys = Object.keys(userAnswers);
      totalQuestions = submittedKeys.length > 0 ? submittedKeys.length : (contest.questionsCount || 10);
      for (const key of submittedKeys) {
        const val = userAnswers[key];
        const isCorrect = val === true || val === 'correct' || (typeof val === 'object' && val.isCorrect === true);
        if (isCorrect) correctCount++;
        answerDetails.push({ questionId: key, submittedAnswer: val, isCorrect });
      }
    }

    // Accuracy Percentage calculation
    const rawAccuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const accuracy = Math.round(rawAccuracy * 10) / 10;

    // Currency selection based on contest configuration
    const isCoinContest = contest.entryFeeType === 'Coins' || (contest.coinsReward && contest.coinsReward > 0 && (!contest.prizePool || contest.prizePool === 0));
    const currency: 'INR' | 'Coins' = isCoinContest ? 'Coins' : 'INR';

    let rewardTier = 'Tier 1 (0% to 74.9%)';
    let rewardType: 'None' | 'Bonus' | 'Prize Pool' = 'None';
    let rewardAmount = 0;
    let rewardMessage = '';

    // =========================================================================
    // REWARD TIER RULES:
    // 0% to < 75%: Get nothing
    // 75% to 98%:  Get random reward in number of bonus
    // 99% to 100%: Get prize pool
    // =========================================================================
    if (accuracy < 75) {
      rewardTier = 'Tier 1 (0% to 74.9%)';
      rewardType = 'None';
      rewardAmount = 0;
      rewardMessage = `No reward earned. Your accuracy was ${accuracy}%, which is below the 75% threshold.`;
    } else if (accuracy <= 98) {
      rewardTier = 'Tier 2 (75% to 98%)';
      rewardType = 'Bonus';

      // Random reward in number of bonus (between 50 and 350, or scaled by coinsReward)
      const baseMin = 50;
      const baseMax = Number(contest.coinsReward) > 0 ? Math.max(100, Number(contest.coinsReward)) : 350;
      const randomBonus = Math.floor(Math.random() * (baseMax - baseMin + 1)) + baseMin;

      rewardAmount = randomBonus;
      rewardMessage = `Congratulations! You scored ${accuracy}% accuracy and won a random bonus of ${rewardAmount} ${currency}!`;

      // Credit bonus to wallet
      await walletService.addReward(
        userId,
        rewardAmount,
        `${contest.title} - Random Bonus (${accuracy}% Accuracy)`,
        currency
      );
    } else {
      // 99% to 100%
      rewardTier = 'Tier 3 (99% to 100%)';
      rewardType = 'Prize Pool';

      // Award the contest prize pool
      const prizePoolAmount = Number(contest.prizePool) > 0
        ? Number(contest.prizePool)
        : (Number(contest.coinsReward) > 0 ? Number(contest.coinsReward) : 10000);

      rewardAmount = prizePoolAmount;
      rewardMessage = `JACKPOT! Spectacular accuracy of ${accuracy}%! You have won the Contest Prize Pool of ${rewardAmount} ${currency}!`;

      // Credit prize pool to wallet
      await walletService.addReward(
        userId,
        rewardAmount,
        `${contest.title} - Grand Prize Pool Winner (${accuracy}% Accuracy)`,
        currency
      );
    }

    // Save Attempt & Result record
    const attemptRecord = await Attempt.create({
      userId: user._id,
      stageId: userGroup?._id || contest._id,
      contestId: contest._id,
      groupId: userGroup?._id || contest._id,
      acceptedRules: true,
      rulesAcceptedAt: new Date(),
      startedAt: new Date(Date.now() - 60000),
      submittedAt: new Date(),
      status: 'Evaluated',
      answers: userAnswers,
      score: correctCount,
      cheatAlerts: payload.cheatAlerts || []
    }).catch(() => null);

    await Result.create({
      userId: user._id,
      stageId: userGroup?._id || contest._id,
      groupId: userGroup?._id || contest._id,
      contestId: contest._id,
      attemptId: attemptRecord?._id || new mongoose.Types.ObjectId(),
      score: correctCount,
      passed: accuracy >= 75,
      status: accuracy >= 75 ? 'Qualified' : 'Failed',
      remarks: `${rewardTier} - ${rewardMessage}`
    }).catch(() => null);

    // Fetch fresh user state with updated wallet balance and coins
    const updatedUser = await this.userRepo.findById(userId);

    // Emit live real-time notification
    socketService.emitToUser(userId, 'contest_reward_won', {
      contestId: contest._id,
      contestTitle: contest.title,
      accuracy,
      rewardTier,
      rewardType,
      rewardAmount,
      currency
    });

    // Update or trigger live Leaderboard sync
    try {
      this.recalculateContestLeaderboard(contest._id.toString()).catch(() => null);
    } catch (e) {}

    return {
      success: true,
      contestId: contest._id.toString(),
      contestTitle: contest.title,
      totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: totalQuestions - correctCount,
      accuracyPercentage: accuracy,
      rewardTier,
      rewardType,
      rewardAmount,
      currency,
      message: rewardMessage,
      user: {
        _id: updatedUser?._id || user._id,
        name: updatedUser?.name || user.name,
        email: updatedUser?.email || user.email,
        walletBalance: updatedUser?.walletBalance ?? user.walletBalance,
        coins: updatedUser?.coins ?? user.coins
      },
      answerDetails
    };
  }

  async getContestLeaderboard(
    contestId?: string,
    currentUserId?: string,
    query: { limit?: string | number; page?: string | number; groupId?: string; stageId?: string } = {}
  ): Promise<any> {
    let targetParam = contestId;
    if (!targetParam) {
      try {
        const latestContest = await Contest.findOne().sort({ createdAt: -1 }).lean();
        if (latestContest) {
          targetParam = latestContest.contestId || latestContest._id.toString();
        }
      } catch {}
      if (!targetParam) {
        targetParam = 'test';
      }
    }

    const rawParam = decodeURIComponent(targetParam || '').trim();
    let contest: any = null;
    try {
      contest = await this.getContestById(rawParam);
    } catch {
      contest = null;
    }

    const cleanTitle = contest
      ? contest.title
      : (rawParam && rawParam !== ':title')
        ? rawParam.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : 'Contest';

    const cleanId = contest
      ? (contest.contestId || contest._id.toString())
      : (rawParam && rawParam !== ':title')
        ? rawParam
        : 'CNT-2026-101';

    const contestObj = contest ? (contest.toObject ? contest.toObject() : contest) : {
      _id: cleanId,
      contestId: cleanId,
      title: cleanTitle
    };

    const filter: any = { contestId: contestObj._id };
    if (query.groupId) filter.groupId = query.groupId;
    if (query.stageId) filter.stageId = query.stageId;

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const isValidId = Boolean(contest && contest._id) || mongoose.Types.ObjectId.isValid(contestObj._id);

    // 1. Fetch real result records from database if valid ObjectId
    let rawResults: any[] = [];
    if (isValidId) {
      try {
        rawResults = await Result.find(filter)
          .populate('userId', 'name username email avatar walletBalance score')
          .populate('attemptId', 'submittedAt startedAt answers cheatAlerts')
          .sort({ score: -1, createdAt: 1 })
          .lean();
      } catch (err) {}
    }

    let leaderboardItems: any[] = [];
    let totalParticipants = rawResults.length;

    if (rawResults.length > 0) {
      leaderboardItems = rawResults.map((r: any, idx: number) => {
        const u = r.userId || {};
        const att = r.attemptId || {};
        const uIdStr = (u._id || r.userId || '').toString();
        return {
          rank: idx + 1,
          userId: uIdStr,
          name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || `Contestant ${idx + 1}`,
          username: u.username || '',
          email: u.email || '',
          avatar: u.avatar || '',
          score: r.score ?? 0,
          passed: r.passed ?? false,
          status: r.status || (r.passed ? 'Qualified' : 'Evaluated'),
          remarks: r.remarks || '',
          submittedAt: att.submittedAt || r.createdAt || r.updatedAt
        };
      });
    } else {
      // 2. Check if Leaderboard collection has cached rankings
      let cachedLeaderboard: any = null;
      if (isValidId) {
        try {
          cachedLeaderboard = await Leaderboard.findOne({ contestId: contestObj._id })
            .populate('rankings.userId', 'name username email avatar')
            .lean();
        } catch (err) {}
      }

      if (cachedLeaderboard && cachedLeaderboard.rankings && cachedLeaderboard.rankings.length > 0) {
        totalParticipants = cachedLeaderboard.rankings.length;
        leaderboardItems = cachedLeaderboard.rankings.map((rk: any, idx: number) => {
          const u = rk.userId || {};
          const uIdStr = (u._id || rk.userId || '').toString();
          return {
            rank: rk.rank || idx + 1,
            userId: uIdStr,
            name: u.name || u.username || `Contestant ${idx + 1}`,
            username: u.username || '',
            email: u.email || '',
            avatar: u.avatar || '',
            score: rk.score ?? 0,
            passed: true,
            status: 'Qualified',
            submittedAt: cachedLeaderboard.updatedAt || new Date()
          };
        });
      } else {
        // 3. Fallback: Check participants enrolled in contest groups
        let groupsInContest: any[] = [];
        if (isValidId) {
          try {
            groupsInContest = await this.groupRepo.find({ contestId: contestObj._id });
          } catch (err) {}
        }
        const participantIds: any[] = [];
        for (const g of groupsInContest) {
          if (Array.isArray(g.participants)) {
            participantIds.push(...g.participants);
          }
        }

        if (participantIds.length > 0) {
          let users: any[] = [];
          try {
            users = await User.find({ _id: { $in: participantIds } })
              .select('name username email avatar score')
              .lean();
          } catch (err) {}
          totalParticipants = users.length;
          leaderboardItems = users
            .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
            .map((u: any, idx: number) => ({
              rank: idx + 1,
              userId: u._id.toString(),
              name: u.name || u.username || `Contestant ${idx + 1}`,
              username: u.username || '',
              email: u.email || '',
              avatar: u.avatar || '',
              score: u.score ?? 0,
              passed: true,
              status: 'Joined',
              submittedAt: new Date()
            }));
        } else {
          totalParticipants = 0;
          leaderboardItems = [];
        }
      }
    }

    // Find current user's standing
    let currentUserRank: any = null;
    if (currentUserId) {
      const uRankIdx = leaderboardItems.findIndex((item) =>
        item.userId?.toString() === currentUserId.toString()
      );
      if (uRankIdx !== -1) {
        currentUserRank = {
          ...leaderboardItems[uRankIdx],
          rank: uRankIdx + 1
        };
      }
    }

    // Apply pagination
    const paginatedLeaderboard = leaderboardItems.slice(skip, skip + limit);

    return {
      success: true,
      contestId: contestObj._id.toString(),
      contestTitle: contestObj.title,
      totalParticipants,
      page,
      limit,
      totalPages: Math.ceil(totalParticipants / limit) || 1,
      currentUserRank,
      leaderboard: paginatedLeaderboard
    };
  }

  async recalculateContestLeaderboard(contestId: string): Promise<any> {
    const rawParam = decodeURIComponent(contestId || '').trim();
    let contest: any = null;
    try {
      contest = await this.getContestById(rawParam);
    } catch {
      contest = null;
    }

    const cleanTitle = contest
      ? contest.title
      : (rawParam && rawParam !== ':title')
        ? rawParam.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : 'Contest';

    const cleanId = contest
      ? (contest.contestId || contest._id.toString())
      : (rawParam && rawParam !== ':title')
        ? rawParam
        : 'CNT-2026-101';

    const contestObj = contest ? (contest.toObject ? contest.toObject() : contest) : {
      _id: cleanId,
      contestId: cleanId,
      title: cleanTitle
    };

    const isValidId = Boolean(contest && contest._id) || mongoose.Types.ObjectId.isValid(contestObj._id);
    let rankings: any[] = [];

    if (isValidId) {
      try {
        const rawResults = await Result.find({ contestId: contestObj._id })
          .populate('userId', 'name username email')
          .sort({ score: -1, createdAt: 1 })
          .lean();

        rankings = rawResults.map((r: any, idx: number) => ({
          userId: r.userId?._id || r.userId,
          score: r.score || 0,
          rank: idx + 1
        }));

        if (rankings.length > 0) {
          await Leaderboard.findOneAndUpdate(
            { contestId: contestObj._id },
            { contestId: contestObj._id, rankings, updatedAt: new Date() },
            { upsert: true, new: true }
          );
        }
      } catch (err) {}
    }

    if (rankings.length === 0) {
      rankings = [];
    }

    // Broadcast live update to real-time socket connections
    try {
      socketService.broadcastLeaderboard({
        contestId: contestObj._id,
        contestTitle: contestObj.title,
        updatedAt: new Date(),
        rankings
      });
    } catch (e) {}

    return {
      success: true,
      message: `Leaderboard recalculated for contest "${contestObj.title}".`,
      totalRanked: rankings.length,
      topRankings: rankings.slice(0, 10)
    };
  }
}
export const contestService = new ContestService();
export default contestService;
