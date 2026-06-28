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

  async addQuestion(poolId: string, qData: Partial<IQuestion>): Promise<IQuestion> {
    const pool = await this.getPoolById(poolId);
    qData.poolId = pool._id as any;
    return this.questionRepo.create(qData);
  }

  async listQuestions(poolId: string): Promise<IQuestion[]> {
    return this.questionRepo.findByPool(poolId);
  }

  async importQuestions(poolId: string, rows: any[]): Promise<{ count: number }> {
    const pool = await this.getPoolById(poolId);
    let count = 0;

    for (const r of rows) {
      // Expect columns: text, type, options (semicolon-separated options with correctness, e.g. "Yes (Correct); No"), difficulty, marks, negativeMarks
      if (!r.text || !r.type) continue;

      let optionsList: any[] = [];
      if (r.options) {
        optionsList = r.options.split(';').map((o: string) => {
          const clean = o.trim();
          const isCorrect = clean.toLowerCase().includes('(correct)');
          const text = clean.replace(/\(correct\)/i, '').trim();
          return { text, isCorrect };
        });
      }

      await this.questionRepo.create({
        poolId: pool._id,
        category: pool.category,
        type: r.type || 'Single Choice',
        text: r.text,
        options: optionsList,
        marks: parseFloat(r.marks) || 1,
        negativeMarks: parseFloat(r.negativeMarks) || 0,
        difficulty: r.difficulty || 'Medium',
        explanation: r.explanation || '',
        questionTimer: parseInt(r.questionTimer, 10) || 0
      });
      count++;
    }

    return { count };
  }
}
export const questionService = new QuestionService();
export default questionService;
