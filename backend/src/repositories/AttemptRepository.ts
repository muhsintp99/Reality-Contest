import { BaseRepository } from './BaseRepository';
import { IAttempt, Attempt } from '../models/Attempt';

export class AttemptRepository extends BaseRepository<IAttempt> {
  constructor() {
    super(Attempt);
  }

  async findUserAttempts(userId: string, stageId: string): Promise<IAttempt[]> {
    return this.find({ userId, stageId });
  }

  async findActiveAttempt(userId: string, stageId: string): Promise<IAttempt | null> {
    return this.findOne({ userId, stageId, status: 'In Progress' });
  }
}
export default AttemptRepository;
