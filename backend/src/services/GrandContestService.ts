import mongoose from 'mongoose';
import GrandContest, { IGrandContest } from '../models/GrandContest';
import { BadRequestError, NotFoundError } from '../core/errors';

const generateUniqueGrandContestId = (): string => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `GNC-${year}-${randomDigits}`;
};

export class GrandContestService {
  async createGrandContest(data: Partial<IGrandContest>): Promise<IGrandContest> {
    if (!data.title) {
      throw new BadRequestError('Title is required for Grand Contest creation.');
    }

    if (!data.contestId) {
      data.contestId = generateUniqueGrandContestId();
    }

    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    const tasksCount = tasks.length > 0 ? tasks.length : Number(data.tasksCount) || 0;

    const payload: Partial<IGrandContest> = {
      ...data,
      tasks,
      tasksCount,
      registrationStart: data.registrationStart ? new Date(data.registrationStart) : new Date(),
      registrationEnd: data.registrationEnd ? new Date(data.registrationEnd) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    const contest = await GrandContest.create(payload);
    return contest;
  }

  async listGrandContests(query: any = {}) {
    const { page = 1, limit = 10, search, status, category } = query;
    const filter: any = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (category && category !== 'All') {
      filter.categories = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { contestId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const contests = await GrandContest.find(filter)
      .populate('tasks')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await GrandContest.countDocuments(filter);

    return {
      contests,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  async getGrandContestById(id: string): Promise<IGrandContest> {
    let contest: IGrandContest | null = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      contest = await GrandContest.findById(id).populate('tasks');
    }

    if (!contest) {
      contest = await GrandContest.findOne({ contestId: id }).populate('tasks');
    }

    if (!contest) {
      throw new NotFoundError('Grand Contest not found');
    }

    return contest;
  }

  async updateGrandContest(id: string, data: Partial<IGrandContest>): Promise<IGrandContest> {
    let contestIdToUpdate = id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const existing = await GrandContest.findOne({ contestId: id });
      if (!existing) {
        throw new NotFoundError('Grand Contest not found');
      }
      contestIdToUpdate = (existing._id as any).toString();
    }

    if (Array.isArray(data.tasks)) {
      data.tasksCount = data.tasks.length;
    }

    const updated = await GrandContest.findByIdAndUpdate(contestIdToUpdate, data, { new: true, runValidators: true }).populate('tasks');
    if (!updated) {
      throw new NotFoundError('Grand Contest not found');
    }

    return updated;
  }

  async deleteGrandContest(id: string): Promise<IGrandContest> {
    let contest: IGrandContest | null = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      contest = await GrandContest.findByIdAndDelete(id);
    } else {
      contest = await GrandContest.findOneAndDelete({ contestId: id });
    }

    if (!contest) {
      throw new NotFoundError('Grand Contest not found');
    }

    return contest;
  }

  async duplicateGrandContest(id: string): Promise<IGrandContest> {
    const original = await this.getGrandContestById(id);
    const obj = original.toObject();
    delete obj._id;
    delete (obj as any).createdAt;
    delete (obj as any).updatedAt;

    obj.contestId = generateUniqueGrandContestId();
    obj.title = `${original.title} (Copy)`;
    obj.status = 'Draft';

    const copy = await GrandContest.create(obj);
    return copy;
  }

  async getGrandContestAnalytics(id: string) {
    const contest = await this.getGrandContestById(id);
    return {
      contestId: contest.contestId,
      title: contest.title,
      totalParticipants: contest.maxParticipants || 0,
      tasksCount: contest.tasksCount || (contest.tasks ? contest.tasks.length : 0),
      prizePool: contest.prizePool || 0,
      status: contest.status
    };
  }
}

export const grandContestService = new GrandContestService();
