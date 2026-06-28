import { BaseRepository } from './BaseRepository';
import { IQuestionPool, QuestionPool } from '../models/QuestionPool';

export class QuestionPoolRepository extends BaseRepository<IQuestionPool> {
  constructor() {
    super(QuestionPool);
  }
}
export default QuestionPoolRepository;
