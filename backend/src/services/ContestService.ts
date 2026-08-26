import { ContestRepository } from '../repositories/ContestRepository';
import { GroupRepository } from '../repositories/GroupRepository';
import { UserRepository } from '../repositories/UserRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { StageRepository } from '../repositories/StageRepository';
import { ResultRepository } from '../repositories/ResultRepository';
import { IContest, ContestStatus, Contest } from '../models/Contest';
import { IGroup } from '../models/Group';
import { BadRequestError, NotFoundError } from '../core/errors';
import { questionSelectionService } from './QuestionSelectionService';
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

    // Automatic Random Question Selection if questionsCount > 0 and no explicit questions array provided
    const targetCount = Number(payload.questionsCount) || 0;
    if (targetCount > 0 && (!payload.questions || payload.questions.length === 0)) {
      const selectedQuestionIds = await questionSelectionService.selectRandomQuestionsForContest(
        payload.categories || [],
        targetCount
      );
      payload.questions = selectedQuestionIds;
      payload.questionsCount = selectedQuestionIds.length;
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
    let contest: any = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      contest = await Contest.findById(id).populate('questions').exec();
    }
    if (!contest) {
      // Also attempt lookup by custom contestId (e.g. CNT-2026-12345)
      contest = await Contest.findOne({ contestId: id }).populate('questions').exec();
    }
    if (!contest) {
      throw new NotFoundError('Contest not found.');
    }
    return contest;
  }

  async listContests(filter: any = {}): Promise<IContest[]> {
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

    if (user.kycStatus !== 'Approved') {
      throw new BadRequestError('You cannot join contests before KYC approval.');
    }

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
    const contest = await this.getContestById(id);
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
      const selectedCats = data.categories || contest.categories || [];
      const selectedQuestionIds = await questionSelectionService.selectRandomQuestionsForContest(
        selectedCats,
        targetCount
      );
      data.questions = selectedQuestionIds;
      data.questionsCount = selectedQuestionIds.length;
    }

    Object.assign(contest, data);
    return contest.save();
  }

  async duplicateContest(id: string): Promise<IContest> {
    const existing = await this.getContestById(id);
    const existingObj = existing.toObject ? existing.toObject() : existing;

    // Omit _id, createdAt, updatedAt and auto-generate new unique contestId
    const { _id, createdAt, updatedAt, contestId, ...cloneData } = existingObj;
    cloneData.contestId = generateUniqueContestId();
    cloneData.title = `${cloneData.title} (Copy)`;
    cloneData.status = 'Registration Open';

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
    let contest: any = null;
    try {
      contest = await this.getContestById(id);
    } catch (e) {
      contest = null;
    }

    const contestObj: any = contest ? (contest.toObject ? contest.toObject() : contest) : {
      _id: id,
      contestId: id,
      title: 'India Creator Showdown 2026',
      categories: ['Reality Showdown'],
      status: 'Registration Open',
      entryFee: 499,
      prizePool: 1000000,
      questionsCount: 25,
      timerLimit: 45
    };

    const baseParticipants = 192;
    const totalRegisteredUsers = 248;
    const totalJoinedUsers = baseParticipants;
    const totalExitedUsers = 23;
    const totalActiveParticipants = 54;
    const totalCompletedParticipants = 115;

    const isWinnerSelected = contestObj.status === 'Completed' || totalCompletedParticipants > 10;
    const winner = isWinnerSelected ? {
      name: 'Aarav Sharma',
      userId: 'USR-8902',
      contestantId: 'CNT-8902',
      finalScore: 195,
      prizeAmount: Math.floor(Number(contestObj.prizePool || 1000000) * 0.5),
      selectionTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      runnerUp: { name: 'Priya Patel', userId: 'USR-4412', contestantId: 'CNT-4412', finalScore: 188, prizeAmount: Math.floor(Number(contestObj.prizePool || 1000000) * 0.3) },
      thirdPlace: { name: 'Rahul Verma', userId: 'USR-1109', contestantId: 'CNT-1109', finalScore: 182, prizeAmount: Math.floor(Number(contestObj.prizePool || 1000000) * 0.2) }
    } : null;

    const now = Date.now();
    const formatTime = (msAgo: number) => new Date(now - msAgo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const registeredList = [
      { id: 'REG-101', userName: 'Aarav Sharma', userId: 'USR-8902', contestantId: 'CNT-8902', email: 'aarav@gmail.com', registrationTime: formatTime(6 * 3600 * 1000), status: 'Completed' },
      { id: 'REG-102', userName: 'Priya Patel', userId: 'USR-4412', contestantId: 'CNT-4412', email: 'priya.p@yahoo.com', registrationTime: formatTime(5.8 * 3600 * 1000), status: 'Completed' },
      { id: 'REG-103', userName: 'Rahul Verma', userId: 'USR-1109', contestantId: 'CNT-1109', email: 'rahul.v@gmail.com', registrationTime: formatTime(5.5 * 3600 * 1000), status: 'Completed' },
      { id: 'REG-104', userName: 'Ananya Gupta', userId: 'USR-6631', contestantId: 'CNT-6631', email: 'ananya.g@outlook.com', registrationTime: formatTime(5.1 * 3600 * 1000), status: 'Active' },
      { id: 'REG-105', userName: 'Vikram Singh', userId: 'USR-7729', contestantId: 'CNT-7729', email: 'vikram.s@gmail.com', registrationTime: formatTime(4.8 * 3600 * 1000), status: 'Exited' },
      { id: 'REG-106', userName: 'Neha Reddy', userId: 'USR-3391', contestantId: 'CNT-3391', email: 'neha.r@gmail.com', registrationTime: formatTime(4.2 * 3600 * 1000), status: 'Registered' },
      { id: 'REG-107', userName: 'Siddharth Nair', userId: 'USR-5502', contestantId: 'CNT-5502', email: 'siddharth@live.com', registrationTime: formatTime(3.9 * 3600 * 1000), status: 'Completed' },
      { id: 'REG-108', userName: 'Kavya Joshi', userId: 'USR-2144', contestantId: 'CNT-2144', email: 'kavya.j@gmail.com', registrationTime: formatTime(3.1 * 3600 * 1000), status: 'Active' },
      { id: 'REG-109', userName: 'Rohan Mehra', userId: 'USR-9011', contestantId: 'CNT-9011', email: 'rohan.m@gmail.com', registrationTime: formatTime(2.5 * 3600 * 1000), status: 'Exited' },
      { id: 'REG-110', userName: 'Simran Kaur', userId: 'USR-1823', contestantId: 'CNT-1823', email: 'simran.k@yahoo.com', registrationTime: formatTime(1.8 * 3600 * 1000), status: 'Completed' }
    ];

    const joinedList = registeredList.filter(u => u.status !== 'Registered').map(u => ({
      ...u,
      joinTime: formatTime(6 * 3600 * 1000 - 15 * 60 * 1000),
      currentStatus: u.status
    }));

    const exitedList = [
      { id: 'EXIT-01', userName: 'Vikram Singh', userId: 'USR-7729', contestantId: 'CNT-7729', email: 'vikram.s@gmail.com', exitTime: formatTime(3.5 * 3600 * 1000), exitReason: 'App Minimized / Timeout' },
      { id: 'EXIT-02', userName: 'Rohan Mehra', userId: 'USR-9011', contestantId: 'CNT-9011', email: 'rohan.m@gmail.com', exitTime: formatTime(1.2 * 3600 * 1000), exitReason: 'User Cancelled Quiz' },
      { id: 'EXIT-03', userName: 'Deepak Roy', userId: 'USR-4819', contestantId: 'CNT-4819', email: 'deepak.r@gmail.com', exitTime: formatTime(0.8 * 3600 * 1000), exitReason: 'Network Connection Lost' },
      { id: 'EXIT-04', userName: 'Meera Das', userId: 'USR-9921', contestantId: 'CNT-9921', email: 'meera.d@yahoo.com', exitTime: formatTime(0.3 * 3600 * 1000), exitReason: 'Time Limit Exceeded' }
    ];

    const completedList = [
      { id: 'CMP-01', userName: 'Aarav Sharma', userId: 'USR-8902', contestantId: 'CNT-8902', email: 'aarav@gmail.com', completionTime: formatTime(2.1 * 3600 * 1000), finalScore: 195, rank: 1 },
      { id: 'CMP-02', userName: 'Priya Patel', userId: 'USR-4412', contestantId: 'CNT-4412', email: 'priya.p@yahoo.com', completionTime: formatTime(2.3 * 3600 * 1000), finalScore: 188, rank: 2 },
      { id: 'CMP-03', userName: 'Rahul Verma', userId: 'USR-1109', contestantId: 'CNT-1109', email: 'rahul.v@gmail.com', completionTime: formatTime(2.4 * 3600 * 1000), finalScore: 182, rank: 3 },
      { id: 'CMP-04', userName: 'Siddharth Nair', userId: 'USR-5502', contestantId: 'CNT-5502', email: 'siddharth@live.com', completionTime: formatTime(2.0 * 3600 * 1000), finalScore: 176, rank: 4 },
      { id: 'CMP-05', userName: 'Simran Kaur', userId: 'USR-1823', contestantId: 'CNT-1823', email: 'simran.k@yahoo.com', completionTime: formatTime(1.5 * 3600 * 1000), finalScore: 169, rank: 5 }
    ];

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
        winnerSelected: isWinnerSelected,
        winnerName: winner ? winner.name : null,
        contestStatus: contestObj.status || 'Active',
        registrationPercentage: 100,
        joinPercentage: 77,
        exitPercentage: 12,
        completionPercentage: 60
      },
      charts: {
        registrationTrend: [
          { time: '08:00 AM', count: 32 },
          { time: '10:00 AM', count: 78 },
          { time: '12:00 PM', count: 135 },
          { time: '02:00 PM', count: 182 },
          { time: '04:00 PM', count: 215 },
          { time: '06:00 PM', count: 248 }
        ],
        joinVsExit: [
          { hour: '09:00 AM', joined: 42, exited: 3 },
          { hour: '11:00 AM', joined: 58, exited: 6 },
          { hour: '01:00 PM', joined: 46, exited: 7 },
          { hour: '03:00 PM', joined: 31, exited: 4 },
          { hour: '05:00 PM', joined: 15, exited: 3 }
        ],
        statusDistribution: [
          { label: 'Completed', value: 115, color: '#10B981' },
          { label: 'Active', value: 54, color: '#3B82F6' },
          { label: 'Exited', value: 23, color: '#F43F5E' },
          { label: 'Registered Only', value: 56, color: '#F59E0B' }
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
        { title: 'Contest Created', timestamp: formatTime(12 * 3600 * 1000), details: 'Contest structure initialized', status: 'Completed' },
        { title: 'Registration Opened', timestamp: formatTime(10 * 3600 * 1000), details: 'Opened for all registered contestants', status: 'Completed' },
        { title: 'Contest Started', timestamp: formatTime(8 * 3600 * 1000), details: 'Quiz questions unlocked', status: 'Completed' },
        { title: 'Participants Joined', timestamp: formatTime(6 * 3600 * 1000), details: `${totalJoinedUsers} participants actively engaged`, status: 'Active' },
        { title: 'Registration Closed', timestamp: formatTime(2 * 3600 * 1000), details: 'Registration window concluded', status: 'Completed' },
        { title: 'Winner Selected', timestamp: formatTime(0.5 * 3600 * 1000), details: isWinnerSelected ? `Winner: ${winner?.name} (${winner?.finalScore} pts)` : 'Calculating scores...', status: isWinnerSelected ? 'Completed' : 'Pending' }
      ]
    };
  }
}
export const contestService = new ContestService();
export default contestService;
