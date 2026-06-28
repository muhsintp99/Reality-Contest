import { BaseRepository } from './BaseRepository';
import { IEvaluation, Evaluation } from '../models/Evaluation';

export class EvaluationRepository extends BaseRepository<IEvaluation> {
  constructor() {
    super(Evaluation);
  }

  async findByAttempt(attemptId: string): Promise<IEvaluation[]> {
    return this.find({ attemptId });
  }
}
export default EvaluationRepository;
