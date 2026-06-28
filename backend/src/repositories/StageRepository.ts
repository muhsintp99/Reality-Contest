import { BaseRepository } from './BaseRepository';
import { IStage, Stage } from '../models/Stage';

export class StageRepository extends BaseRepository<IStage> {
  constructor() {
    super(Stage);
  }

  async findByGroup(groupId: string): Promise<IStage[]> {
    return this.find({ groupId }, null, { sort: { startDate: 1 } });
  }
}
export default StageRepository;
