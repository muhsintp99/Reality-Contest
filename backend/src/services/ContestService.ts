import { ContestRepository } from '../repositories/ContestRepository';
import { GroupRepository } from '../repositories/GroupRepository';
import { UserRepository } from '../repositories/UserRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { IContest } from '../models/Contest';
import { BadRequestError, NotFoundError } from '../core/errors';
import mongoose from 'mongoose';

export class ContestService {
  private contestRepo = new ContestRepository();
  private groupRepo = new GroupRepository();
  private userRepo = new UserRepository();
  private transRepo = new TransactionRepository();

  async createContest(data: Partial<IContest>): Promise<IContest> {
    if (!data.title || !data.startDate || !data.endDate) {
      throw new BadRequestError('Title, start date, and end date are required.');
    }
    const contest = await this.contestRepo.create(data);
    
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
    const contest = await this.contestRepo.findById(id);
    if (!contest) {
      throw new NotFoundError('Contest not found.');
    }
    return contest;
  }

  async listContests(filter: any = {}): Promise<IContest[]> {
    return this.contestRepo.find(filter, null, { sort: { createdAt: -1 } });
  }

  async joinContest(contestId: string, userId: string): Promise<{ success: boolean; joinedGroup: string }> {
    const contest = await this.getContestById(contestId);
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    if (contest.status !== 'Registration Open') {
      throw new BadRequestError('Registration for this contest is not open.');
    }

    // Check if user already joined any group in this contest
    const groupsInContest = await this.groupRepo.find({ contestId });
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

    // Check entry fee and balance
    if (contest.entryFee > 0) {
      if (user.walletBalance < contest.entryFee) {
        throw new BadRequestError('Insufficient wallet balance to pay the entry fee.');
      }

      // Deduct entry fee
      user.walletBalance -= contest.entryFee;
      await user.save();

      // Create transaction record
      await this.transRepo.create({
        userId: user._id,
        amount: -contest.entryFee,
        type: 'Entry Fee',
        status: 'Completed',
        description: `Entry fee for contest: ${contest.title}`,
        reference: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
      });
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
}
export const contestService = new ContestService();
export default contestService;
