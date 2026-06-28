import { BaseRepository } from './BaseRepository';
import { IQuestion, Question } from '../models/Question';

export class QuestionRepository extends BaseRepository<IQuestion> {
  constructor() {
    super(Question);
  }

  async findByPool(poolId: string): Promise<IQuestion[]> {
    return this.find({ poolId });
  }
}
export default QuestionRepository;
