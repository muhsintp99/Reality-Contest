import { BaseRepository } from './BaseRepository';
import { IQuestion, Question } from '../models/Question';
import { QuestionPool } from '../models/QuestionPool';
import mongoose from 'mongoose';

export class QuestionRepository extends BaseRepository<IQuestion> {
  constructor() {
    super(Question);
  }

  async findByPool(poolId?: string): Promise<IQuestion[]> {
    if (!poolId || poolId === 'questions' || poolId === 'all' || poolId === 'all-questions') {
      return this.model.find({}).sort({ _id: -1 }).lean().exec() as any;
    }

    const conditions: any[] = [];

    if (mongoose.Types.ObjectId.isValid(poolId)) {
      conditions.push({ poolId: new mongoose.Types.ObjectId(poolId) });
      conditions.push({ poolId: poolId });
    } else {
      conditions.push({ poolId: poolId });
    }

    // Also look up pool to match by category or name fallback so questions in that pool's category NEVER disappear
    try {
      let pool: any = null;
      if (mongoose.Types.ObjectId.isValid(poolId)) {
        pool = await QuestionPool.findById(poolId).lean().exec();
      }
      if (!pool) {
        pool = await QuestionPool.findOne({
          $or: [
            { name: poolId },
            { category: poolId },
            { name: new RegExp(`^${poolId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            { category: new RegExp(`^${poolId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
          ]
        }).lean().exec();
      }

      if (pool && pool.category) {
        conditions.push({ category: pool.category });
        conditions.push({ category: new RegExp(`^${pool.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
      }
    } catch {
      // Ignore lookup errors
    }

    return this.model.find({ $or: conditions }).sort({ _id: -1 }).lean().exec() as any;
  }
}
export default QuestionRepository;
