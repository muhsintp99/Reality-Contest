import { BaseRepository } from './BaseRepository';
import { IKYC, KYC } from '../models/KYC';

export class KycRepository extends BaseRepository<IKYC> {
  constructor() {
    super(KYC);
  }

  async findByUserId(userId: string): Promise<IKYC | null> {
    return this.findOne({ userId });
  }

  async getPendingKycs(): Promise<IKYC[]> {
    return this.model.find({ status: 'Under Review' })
      .populate({
        path: 'userId',
        select: 'name email username phone'
      })
      .sort({ createdAt: 1 })
      .exec();
  }
}
export default KycRepository;
