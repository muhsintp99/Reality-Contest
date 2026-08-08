import { QuestionPoolRepository } from '../repositories/QuestionPoolRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';
import { IQuestionPool } from '../models/QuestionPool';
import { IQuestion } from '../models/Question';
import { BadRequestError, NotFoundError } from '../core/errors';
import mongoose from 'mongoose';

export class QuestionService {
  private poolRepo = new QuestionPoolRepository();
  private questionRepo = new QuestionRepository();

  async createPool(data: Partial<IQuestionPool>): Promise<IQuestionPool> {
    if (!data.name || !data.category) {
      throw new BadRequestError('Name and category are required.');
    }
    return this.poolRepo.create(data);
  }

  async listPools(): Promise<IQuestionPool[]> {
    return this.poolRepo.find({});
  }

  async getPoolById(id: string): Promise<IQuestionPool> {
    const pool = await this.poolRepo.findById(id);
    if (!pool) {
      throw new NotFoundError('Question pool not found.');
    }
    return pool;
  }

  async updatePool(id: string, data: Partial<IQuestionPool>): Promise<IQuestionPool | null> {
    return this.poolRepo.update(id, data);
  }

  async deletePool(id: string): Promise<boolean> {
    const deleted = await this.poolRepo.delete(id);
    return Boolean(deleted);
  }

  async addQuestion(poolId: string, qData: Partial<IQuestion>): Promise<IQuestion> {
    const pool = await this.getPoolById(poolId);
    qData.poolId = pool._id as any;
    return this.questionRepo.create(qData);
  }

  async listQuestions(poolId?: string): Promise<IQuestion[]> {
    if (!poolId || poolId === 'all' || poolId === 'questions' || !mongoose.Types.ObjectId.isValid(poolId)) {
      return this.questionRepo.find({});
    }
    return this.questionRepo.findByPool(poolId);
  }

  async updateQuestion(id: string, qData: Partial<IQuestion>): Promise<IQuestion | null> {
    return this.questionRepo.update(id, qData);
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const deleted = await this.questionRepo.delete(id);
    return Boolean(deleted);
  }

  async clearAllQuestions(): Promise<void> {
    await this.questionRepo.deleteMany({});
    await this.poolRepo.deleteMany({});
  }

  async importQuestions(poolId: string, rows: any[]): Promise<{ count: number }> {
    const pool = await this.getPoolById(poolId);
    let count = 0;

    for (const r of rows) {
      if (!r.text && !r.question) continue;

      let optionsList: any[] = [];
      if (r.options && Array.isArray(r.options)) {
        optionsList = r.options;
      } else if (r.options && typeof r.options === 'string') {
        optionsList = r.options.split(';').map((o: string) => {
          const clean = o.trim();
          const isCorrect = clean.toLowerCase().includes('(correct)');
          const text = clean.replace(/\(correct\)/i, '').trim();
          return { text, isCorrect };
        });
      } else {
        optionsList = [
          { text: r.optionA || 'Option A', isCorrect: r.correctOption === 'Option A' },
          { text: r.optionB || 'Option B', isCorrect: r.correctOption === 'Option B' },
          { text: r.optionC || 'Option C', isCorrect: r.correctOption === 'Option C' },
          { text: r.optionD || 'Option D', isCorrect: r.correctOption === 'Option D' }
        ];
      }

      await this.questionRepo.create({
        poolId: pool._id,
        category: r.category || pool.category,
        type: r.type || 'Single Choice',
        text: r.text || r.question,
        options: optionsList,
        marks: parseFloat(r.marks) || 1,
        negativeMarks: parseFloat(r.negativeMarks) || 0.25,
        difficulty: r.difficulty || 'Medium',
        explanation: r.explanation || '',
        mediaUrl: r.imageUrl || r.mediaUrl || '',
        questionTimer: parseInt(r.questionTimer, 10) || 0
      });
      count++;
    }

    return { count };
  }
}

export const questionService = new QuestionService();
export default questionService;
