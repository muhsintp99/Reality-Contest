import { UserRepository } from '../repositories/UserRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { NotFoundError, ConflictError, AppError } from '../core/errors';
import { redisService } from './RedisService';

export class UserService {
  private userRepo = new UserRepository();
  private sessionRepo = new SessionRepository();

  // 1. GET PROFILE (Uses Redis cache to speed up authentication profile queries)
  async getProfile(userId: string): Promise<any> {
    const cacheKey = `user:profile:${userId}`;
    const cachedProfile = await redisService.get(cacheKey);

    if (cachedProfile) {
      return cachedProfile;
    }

    const user = await this.userRepo.findById(userId, '-password');
    if (!user) throw new NotFoundError('User not found.');

    // Save back to Redis cache
    await redisService.set(cacheKey, user, 300); // 5 mins cache
    return user;
  }

  // 2. UPDATE PROFILE (Invalidates Redis cache instantly to enforce consistency)
  async updateProfile(userId: string, updateData: { name?: string; phone?: string }): Promise<any> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    if (updateData.name) {
      user.name = updateData.name;
    }

    if (updateData.phone && updateData.phone !== user.phone) {
      const phoneExists = await this.userRepo.findByPhone(updateData.phone);
      if (phoneExists) throw new ConflictError('Mobile number already registered.');

      user.phone = updateData.phone;
      user.isPhoneVerified = false;
    }

    await user.save();

    // Cache Invalidation
    await redisService.del(`user:profile:${userId}`);

    return this.userRepo.findById(userId, '-password');
  }

  // 3. UPDATE AVATAR
  async updateAvatar(userId: string, avatarUrl: string): Promise<any> {
    const user = await this.userRepo.update(userId, { avatar: avatarUrl });
    if (!user) throw new NotFoundError('User not found.');

    await redisService.del(`user:profile:${userId}`);
    return this.userRepo.findById(userId, '-password');
  }

  // 4. UPDATE PASSWORD
  async updatePassword(userId: string, data: any): Promise<void> {
    const { currentPassword, newPassword } = data;
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new AppError('Incorrect current password.', 400);

    user.password = newPassword;
    await user.save();

    // Revoke sessions
    await this.sessionRepo.deleteAllSessions(userId);
    await redisService.del(`user:profile:${userId}`);
    await redisService.del(`user:sessions:${userId}`);
  }

  // 5. DELETE ACCOUNT
  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userRepo.delete(userId);
    if (!user) throw new NotFoundError('User not found.');

    await this.sessionRepo.deleteAllSessions(userId);
    await redisService.del(`user:profile:${userId}`);
    await redisService.del(`user:sessions:${userId}`);
  }

  // 6. GET ACTIVE SESSIONS
  async getActiveSessions(userId: string): Promise<any[]> {
    const cacheKey = `user:sessions:${userId}`;
    const cachedSessions = await redisService.get<any[]>(cacheKey);

    if (cachedSessions) {
      return cachedSessions;
    }

    const sessions = await this.sessionRepo.findByUserId(userId);
    const mappedSessions = sessions.map(s => ({
      _id: s._id,
      device: s.device,
      browser: s.browser,
      ip: s.ip,
      createdAt: s.createdAt
    }));

    await redisService.set(cacheKey, mappedSessions, 120); // Cache for 2 mins
    return mappedSessions;
  }

  // 7. REVOKE DEVICE SESSION
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session || session.userId.toString() !== userId) {
      throw new NotFoundError('Session not found or unauthorized.');
    }

    await session.deleteOne();
    await redisService.del(`user:sessions:${userId}`);
  }

  // 8. LOGOUT ALL OTHER DEVICES
  async logoutAllDevices(userId: string, currentRefreshToken?: string): Promise<void> {
    if (currentRefreshToken) {
      await this.sessionRepo.deleteOtherSessions(userId, currentRefreshToken);
    } else {
      await this.sessionRepo.deleteAllSessions(userId);
    }
    await redisService.del(`user:sessions:${userId}`);
  }
}
export default UserService;
