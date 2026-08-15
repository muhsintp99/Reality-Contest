import { ContestRepository } from '../repositories/ContestRepository';
import { GroupRepository } from '../repositories/GroupRepository';
import { UserRepository } from '../repositories/UserRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { IContest, ContestStatus } from '../models/Contest';
import { BadRequestError, NotFoundError } from '../core/errors';
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
    let contest = await this.contestRepo.findById(id);
    if (!contest) {
      // Also attempt lookup by custom contestId (e.g. CNT-2026-12345)
      const found = await this.contestRepo.find({ contestId: id });
      if (found && found.length > 0) {
        contest = found[0];
      }
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

  async joinContest(contestId: string, userId: string): Promise<{ success: boolean; joinedGroup: string }> {
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
    const alreadyJoined = groupsInContest.some((g) =>
      g.participants.some((pId) => pId.toString() === userId)
    );

    if (alreadyJoined) {
      throw new BadRequestError('You have already registered for this contest.');
    }

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
    let assignedGroup = groupsInContest[0];
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

    return {
      success: true,
      joinedGroup: assignedGroup.name
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
}
export const contestService = new ContestService();
export default contestService;
