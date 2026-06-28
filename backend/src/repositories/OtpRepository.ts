import { BaseRepository } from './BaseRepository';
import { IOTP, OTP } from '../models/OTP';

export class OtpRepository extends BaseRepository<IOTP> {
  constructor() {
    super(OTP);
  }

  async findActiveOtp(userId: string, otp: string, type: string): Promise<IOTP | null> {
    return this.findOne({
      userId,
      otp,
      type,
      verified: false,
      expiresAt: { $gt: new Date() }
    });
  }

  async invalidatePreviousOtps(userId: string, type: string): Promise<any> {
    return this.updateMany(
      { userId, type, verified: false },
      { verified: true }
    );
  }
}
export default OtpRepository;
