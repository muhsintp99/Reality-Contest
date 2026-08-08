import { BaseRepository } from './BaseRepository';
import { IQuestion, Question } from '../models/Question';
import mongoose from 'mongoose';

export class QuestionRepository extends BaseRepository<IQuestion> {
  constructor() {
    super(Question);
  }

  async findByPool(poolId: string): Promise<IQuestion[]> {
    if (!poolId || poolId === 'questions' || poolId === 'all' || !mongoose.Types.ObjectId.isValid(poolId)) {
      return this.find({});
    }
    return this.find({ poolId });
  }
}
export default QuestionRepository;
