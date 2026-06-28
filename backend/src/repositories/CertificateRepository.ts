import { BaseRepository } from './BaseRepository';
import { ICertificate, Certificate } from '../models/Certificate';

export class CertificateRepository extends BaseRepository<ICertificate> {
  constructor() {
    super(Certificate);
  }

  async findByUserId(userId: string): Promise<ICertificate[]> {
    return this.find({ userId });
  }
}
export default CertificateRepository;
