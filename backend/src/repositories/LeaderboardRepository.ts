import { BaseRepository } from './BaseRepository';
import { ILeaderboard, Leaderboard } from '../models/Leaderboard';

export class LeaderboardRepository extends BaseRepository<ILeaderboard> {
  constructor() {
    super(Leaderboard);
  }

  async findLeaderboard(contestId: string, groupId?: string, stageId?: string): Promise<ILeaderboard | null> {
    const filter: any = { contestId };
    if (groupId) filter.groupId = groupId;
    if (stageId) filter.stageId = stageId;
    return this.findOne(filter);
  }
}
export default LeaderboardRepository;
