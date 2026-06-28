import { BaseRepository } from './BaseRepository';
import { IContest, Contest } from '../models/Contest';

export class ContestRepository extends BaseRepository<IContest> {
  constructor() {
    super(Contest);
  }

  async findActiveContests(): Promise<IContest[]> {
    return this.find({ status: { $in: ['Upcoming', 'Registration Open', 'Live'] } }, null, { sort: { startDate: 1 } });
  }
}
export default ContestRepository;
