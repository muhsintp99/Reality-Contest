import { BaseRepository } from './BaseRepository';
import { IResult, Result } from '../models/Result';

export class ResultRepository extends BaseRepository<IResult> {
  constructor() {
    super(Result);
  }

  async findByStage(userId: string, stageId: string): Promise<IResult | null> {
    return this.findOne({ userId, stageId });
  }

  async findUserResults(userId: string): Promise<IResult[]> {
    return this.find({ userId });
  }
}
export default ResultRepository;
