import { QuestionPoolRepository } from '../repositories/QuestionPoolRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';
import { IQuestionPool } from '../models/QuestionPool';
import { IQuestion } from '../models/Question';
import { BadRequestError, NotFoundError } from '../core/errors';
import mongoose from 'mongoose';

function parseNegativeMarks(val: any): number {
  if (val === undefined || val === null || val === '') return 0.25;
  const clean = String(val).replace(/-/g, '').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0.25 : num;
}

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

  async createSingleQuestion(qData: any): Promise<IQuestion> {
    const category = qData.category || 'General Knowledge';
    const existingPools = await this.poolRepo.find({});
    let pool = existingPools.find(p => p.category === category || p.name.toLowerCase() === `${category.toLowerCase()} pool`);
    if (!pool) {
      pool = await this.poolRepo.create({
        name: `${category} Pool`,
        category: category,
        description: `Automatically created pool for category: ${category}`
      } as any);
    }

    let optionsList: any[] = [];
    if (qData.options && Array.isArray(qData.options)) {
      optionsList = qData.options;
    } else {
      optionsList = [
        { text: qData.optionA || 'Option A', isCorrect: qData.correctOption === 'Option A' },
        { text: qData.optionB || 'Option B', isCorrect: qData.correctOption === 'Option B' },
        { text: qData.optionC || 'Option C', isCorrect: qData.correctOption === 'Option C' },
        { text: qData.optionD || 'Option D', isCorrect: qData.correctOption === 'Option D' }
      ];
    }

    return this.questionRepo.create({
      poolId: pool._id,
      category: category,
      type: qData.type || 'Single Choice',
      text: qData.question || qData.text,
      options: optionsList,
      marks: parseFloat(qData.marks) || 1,
      negativeMarks: parseNegativeMarks(qData.negativeMarks),
      difficulty: qData.difficulty || 'Medium',
      explanation: qData.explanation || '',
      mediaUrl: qData.imageUrl || qData.mediaUrl || '',
      imageUrl: qData.imageUrl || qData.mediaUrl || '',
      videoUrl: qData.videoUrl || '',
      questionTimer: parseInt(qData.questionTimer, 10) || 0
    });
  }

  async listQuestions(poolId?: string): Promise<IQuestion[]> {
    if (!poolId || poolId === 'all' || poolId === 'questions' || !mongoose.Types.ObjectId.isValid(poolId)) {
      return this.questionRepo.find({});
    }
    return this.questionRepo.findByPool(poolId);
  }

  async getQuestionById(id: string): Promise<IQuestion> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Question not found.');
    }
    const question = await this.questionRepo.findById(id);
    if (!question) {
      throw new NotFoundError('Question not found.');
    }
    return question;
  }

  async updateQuestion(id: string, qData: any): Promise<IQuestion | null> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const updatePayload: any = {};

    if (qData.category !== undefined) updatePayload.category = qData.category;
    if (qData.type !== undefined) updatePayload.type = qData.type;
    if (qData.difficulty !== undefined) updatePayload.difficulty = qData.difficulty;
    if (qData.explanation !== undefined) updatePayload.explanation = qData.explanation;
    if (qData.videoUrl !== undefined) updatePayload.videoUrl = qData.videoUrl;
    if (qData.status !== undefined) updatePayload.status = qData.status;

    if (qData.text !== undefined) {
      updatePayload.text = qData.text;
    } else if (qData.question !== undefined) {
      updatePayload.text = qData.question;
    }

    if (qData.imageUrl !== undefined || qData.mediaUrl !== undefined) {
      const url = qData.imageUrl || qData.mediaUrl || '';
      updatePayload.imageUrl = url;
      updatePayload.mediaUrl = url;
    }

    if (qData.options && Array.isArray(qData.options)) {
      updatePayload.options = qData.options;
    } else if (qData.optionA !== undefined || qData.optionB !== undefined) {
      updatePayload.options = [
        { text: qData.optionA || 'Option A', isCorrect: qData.correctOption === 'Option A' },
        { text: qData.optionB || 'Option B', isCorrect: qData.correctOption === 'Option B' },
        { text: qData.optionC || 'Option C', isCorrect: qData.correctOption === 'Option C' },
        { text: qData.optionD || 'Option D', isCorrect: qData.correctOption === 'Option D' }
      ];
    }

    if (qData.marks !== undefined && qData.marks !== null) {
      const parsedMarks = parseFloat(qData.marks);
      updatePayload.marks = isNaN(parsedMarks) ? 1 : parsedMarks;
    }

    if (qData.negativeMarks !== undefined && qData.negativeMarks !== null) {
      updatePayload.negativeMarks = parseNegativeMarks(qData.negativeMarks);
    }

    if (qData.questionTimer !== undefined) {
      const timer = parseInt(qData.questionTimer, 10);
      updatePayload.questionTimer = isNaN(timer) ? 0 : timer;
    }

    return this.questionRepo.update(id, updatePayload);
  }

  async deleteQuestion(id: string): Promise<boolean> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
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
        negativeMarks: parseNegativeMarks(r.negativeMarks),
        difficulty: r.difficulty || 'Medium',
        explanation: r.explanation || '',
        mediaUrl: r.imageUrl || r.mediaUrl || '',
        imageUrl: r.imageUrl || r.mediaUrl || '',
        videoUrl: r.videoUrl || '',
        questionTimer: parseInt(r.questionTimer, 10) || 0
      });
      count++;
    }

    return { count };
  }

  async bulkImportQuestions(defaultCategory: string, questions: any[]): Promise<{ count: number }> {
    let count = 0;
    const existingPools = await this.poolRepo.find({});

    const questionsByCategory: { [cat: string]: any[] } = {};
    for (const q of questions) {
      const cat = q.category || defaultCategory || 'General Knowledge';
      if (!questionsByCategory[cat]) questionsByCategory[cat] = [];
      questionsByCategory[cat].push(q);
    }

    for (const [catName, catQuestions] of Object.entries(questionsByCategory)) {
      let pool = existingPools.find(p => p.category === catName || p.name.toLowerCase() === `${catName.toLowerCase()} pool`);
      if (!pool) {
        pool = await this.poolRepo.create({
          name: `${catName} Pool`,
          category: catName,
          description: `Automatically created pool for category: ${catName}`
        } as any);
        existingPools.push(pool);
      }

      for (const r of catQuestions) {
        if (!r.text && !r.question) continue;

        let optionsList: any[] = [];
        if (r.options && Array.isArray(r.options)) {
          optionsList = r.options;
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
          category: catName,
          type: r.type || 'Single Choice',
          text: r.text || r.question,
          options: optionsList,
          marks: parseFloat(r.marks) || 1,
          negativeMarks: parseNegativeMarks(r.negativeMarks),
          difficulty: r.difficulty || 'Medium',
          explanation: r.explanation || '',
          mediaUrl: r.imageUrl || r.mediaUrl || '',
          imageUrl: r.imageUrl || r.mediaUrl || '',
          videoUrl: r.videoUrl || '',
          questionTimer: parseInt(r.questionTimer, 10) || 0
        });
        count++;
      }
    }

    return { count };
  }
}

export const questionService = new QuestionService();
export default questionService;
