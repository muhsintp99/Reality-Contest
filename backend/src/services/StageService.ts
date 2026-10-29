import { StageRepository } from '../repositories/StageRepository';
import { GroupRepository } from '../repositories/GroupRepository';
import { AttemptRepository } from '../repositories/AttemptRepository';
import { ResultRepository } from '../repositories/ResultRepository';
import { UserRepository } from '../repositories/UserRepository';
import { stageProcessorFactory } from '../core/stage-processors/StageProcessorFactory';
import { socketService } from './SocketService';
import { BadRequestError, NotFoundError } from '../core/errors';
import mongoose from 'mongoose';
import { IStage } from '../models/Stage';
import { IAttempt } from '../models/Attempt';

export class StageService {
  private stageRepo = new StageRepository();
  private groupRepo = new GroupRepository();
  private attemptRepo = new AttemptRepository();
  private resultRepo = new ResultRepository();
  private userRepo = new UserRepository();

  async createStage(data: Partial<IStage>): Promise<IStage> {
    if (!data.groupId || !data.name || !data.type) {
      throw new BadRequestError('Group ID, name, and stage type are required.');
    }
    const stage = await this.stageRepo.create(data);

    // Append to group's stageSequence if not already present
    const group = await this.groupRepo.findById(data.groupId.toString());
    if (group) {
      if (!group.stageSequence.some((sId) => sId.toString() === stage._id.toString())) {
        group.stageSequence.push(stage._id as any);
        await group.save();
      }
    }

    return stage;
  }

  async checkStageUnlockStatus(userId: string, stageId: string): Promise<{ unlocked: boolean; reason?: string }> {
    const stage = await this.stageRepo.findById(stageId);
    if (!stage) {
      throw new NotFoundError('Stage not found.');
    }

    const group = await this.groupRepo.findById(stage.groupId.toString());
    if (!group) {
      throw new NotFoundError('Group not found for this stage.');
    }

    // Verify user is in the group
    const isParticipant = group.participants.some((pId) => pId.toString() === userId);
    if (!isParticipant) {
      return { unlocked: false, reason: 'User is not a participant in this group.' };
    }

    const sequenceIndex = group.stageSequence.findIndex((sId) => sId.toString() === stageId);
    if (sequenceIndex === -1) {
      return { unlocked: false, reason: 'Stage is not in the group sequence.' };
    }

    // First stage is unlocked by default
    if (sequenceIndex === 0) {
      return { unlocked: true };
    }

    // Subsequent stages: verify user has a PASS result for the immediate previous stage
    const previousStageId = group.stageSequence[sequenceIndex - 1].toString();
    const prevResult = await this.resultRepo.findOne({
      userId,
      stageId: previousStageId,
      passed: true
    });

    if (!prevResult) {
      return {
        unlocked: false,
        reason: 'Previous stage in sequence has not been passed.'
      };
    }

    return { unlocked: true };
  }

  async acceptStageRules(
    userId: string,
    stageId: string,
    payload: { ipAddress: string; deviceInfo: string; browser: string }
  ): Promise<IAttempt> {
    // 1. Verify unlock status
    const unlock = await this.checkStageUnlockStatus(userId, stageId);
    if (!unlock.unlocked) {
      throw new BadRequestError(unlock.reason || 'Stage is locked.');
    }

    const stage = await this.stageRepo.findById(stageId);
    if (!stage) throw new NotFoundError('Stage not found.');

    const processor = stageProcessorFactory.getProcessor(stage.type);
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    // Validate if user has remaining attempts
    await processor.validateStart(stage, user);

    // Check if there is already an active in-progress attempt
    let attempt = await this.attemptRepo.findActiveAttempt(userId, stageId);
    if (!attempt) {
      attempt = await this.attemptRepo.create({
        userId: new mongoose.Types.ObjectId(userId),
        stageId: stage._id,
        contestId: stage.groupId, // Temporary reference, will fetch contest if needed
        groupId: stage.groupId,
        acceptedRules: true,
        rulesAcceptedAt: new Date(),
        ipAddress: payload.ipAddress,
        deviceInfo: payload.deviceInfo,
        browser: payload.browser,
        startedAt: new Date(),
        status: 'In Progress',
        answers: {},
        score: 0,
        cheatAlerts: []
      });
    } else {
      attempt.acceptedRules = true;
      attempt.rulesAcceptedAt = new Date();
      attempt.ipAddress = payload.ipAddress;
      attempt.deviceInfo = payload.deviceInfo;
      attempt.browser = payload.browser;
      await attempt.save();
    }

    return attempt;
  }

  async startStageAttempt(
    userId: string,
    stageId: string,
    payload: { ipAddress: string; deviceInfo: string; browser: string }
  ): Promise<any> {
    const attempt = await this.attemptRepo.findActiveAttempt(userId, stageId);
    if (!attempt || !attempt.acceptedRules) {
      throw new BadRequestError('You must accept the stage rules before starting the attempt.');
    }

    const stage = await this.stageRepo.findById(stageId);
    if (!stage) throw new NotFoundError('Stage not found.');

    const processor = stageProcessorFactory.getProcessor(stage.type);
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    // Retrieve stage questions or content stripped of correctness
    const startPayload = await processor.startAttempt(stage, user, payload);

    return {
      attemptId: attempt._id,
      ...startPayload
    };
  }

  async submitStageAttempt(
    userId: string,
    stageId: string,
    payload: { answers: any; cheatAlerts?: any[]; ipAddress: string; deviceInfo: string; browser: string }
  ): Promise<any> {
    const attempt = await this.attemptRepo.findActiveAttempt(userId, stageId);
    if (!attempt) {
      throw new BadRequestError('No active attempt found for this stage.');
    }

    const stage = await this.stageRepo.findById(stageId);
    if (!stage) throw new NotFoundError('Stage not found.');

    const processor = stageProcessorFactory.getProcessor(stage.type);
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    // Save cheat notifications
    if (payload.cheatAlerts && payload.cheatAlerts.length > 0) {
      attempt.cheatAlerts.push(...payload.cheatAlerts);
    }

    // Evaluate
    const evaluation = await processor.evaluate(stage, attempt, payload);

    // Save attempt details
    attempt.answers = payload.answers;
    attempt.score = evaluation.score;
    attempt.status = evaluation.status === 'Pending Review' ? 'Submitted' : 'Evaluated';
    attempt.submittedAt = new Date();
    await attempt.save();

    // Create or update result
    let result = await this.resultRepo.findOne({ userId, stageId });
    if (!result) {
      result = await this.resultRepo.create({
        userId: new mongoose.Types.ObjectId(userId),
        stageId: stage._id,
        groupId: stage.groupId,
        contestId: stage.groupId, // Fallback
        attemptId: attempt._id,
        score: evaluation.score,
        passed: evaluation.passed,
        status: evaluation.status,
        remarks: evaluation.remarks
      });
    } else {
      result.score = evaluation.score;
      result.passed = evaluation.passed;
      result.status = evaluation.status;
      result.remarks = evaluation.remarks;
      result.attemptId = attempt._id as any;
      await result.save();
    }

    // Emit live completion event to the client
    socketService.emitToUser(userId, 'stage_submitted', {
      stageId,
      status: result.status,
      passed: result.passed,
      score: result.score
    });

    return {
      attemptId: attempt._id,
      evaluation
    };
  }

  async getStagesByGroup(groupId: string): Promise<IStage[]> {
    return this.stageRepo.find({ groupId });
  }

  // New Contest Workflow helpers
  async getStagesByContest(contestId: string): Promise<IStage[]> {
    const groups = await this.groupRepo.find({ contestId });
    const defaultGroup = groups.find(g => g.name === 'Default Group') || groups[0];
    if (!defaultGroup) return [];
    return this.stageRepo.find({ groupId: defaultGroup._id });
  }

  async createStageForContest(contestId: string, data: Partial<IStage>): Promise<IStage> {
    const groups = await this.groupRepo.find({ contestId });
    const defaultGroup = groups.find(g => g.name === 'Default Group') || groups[0];
    if (!defaultGroup) {
      throw new NotFoundError('No default group found for this contest.');
    }
    data.groupId = defaultGroup._id;
    return this.createStage(data);
  }
}
export const stageService = new StageService();
export default stageService;
