import { BaseRepository } from './BaseRepository';
import { IGroup, Group } from '../models/Group';

export class GroupRepository extends BaseRepository<IGroup> {
  constructor() {
    super(Group);
  }

  async findByContest(contestId: string): Promise<IGroup[]> {
    return this.find({ contestId });
  }

  async findUserGroups(userId: string): Promise<IGroup[]> {
    return this.find({ participants: userId as any });
  }
}
export default GroupRepository;
