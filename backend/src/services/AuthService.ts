import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { OtpRepository } from '../repositories/OtpRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { AppError, UnauthorizedError, ConflictError, NotFoundError, ForbiddenError } from '../core/errors';
import { queueService } from './QueueService';
import { redisService } from './RedisService';
import { config } from '../config/appConfig';
import { firebaseSmsService } from './FirebaseSmsService';

export class AuthService {
  private userRepo = new UserRepository();
  private otpRepo = new OtpRepository();
  private sessionRepo = new SessionRepository();

  // 1. REGISTER
  async register(data: any): Promise<any> {
    const { email, username, phone, name, password, referralCode } = data;

    const emailExists = await this.userRepo.findByEmail(email);
    if (emailExists) throw new ConflictError('Email address already registered.');

    const usernameExists = await this.userRepo.findByUsername(username);
    if (usernameExists) throw new ConflictError('Username is already taken.');

    const phoneExists = await this.userRepo.findByPhone(phone);
    if (phoneExists) throw new ConflictError('Mobile number already registered.');

    const walletBalance = referralCode ? 100 : 0;

    // Create User (Mongoose pre-save hashes the password)
    const user = await this.userRepo.create({
      ...data,
      walletBalance,
      isEmailVerified: false,
      isPhoneVerified: false,
      kycStatus: 'Pending',
      status: 'Active'
    });

    // Generate Verification OTPs
    const emailOtpValue = Math.floor(100000 + Math.random() * 900000).toString();
    const phoneOtpValue = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.otpRepo.create({ userId: user._id, otp: emailOtpValue, type: 'email_verify', expiresAt });
    await this.otpRepo.create({ userId: user._id, otp: phoneOtpValue, type: 'phone_verify', expiresAt });

    // Queue Notifications using BullMQ instead of doing them in-thread
    await queueService.addJob('email-queue', 'send-verify-email', {
      email: user.email,
      subject: 'Verify your Haka Account',
      body: `Your registration OTP code is: ${emailOtpValue}`
    });

    await queueService.addJob('sms-queue', 'send-verify-sms', {
      phone: user.phone,
      message: `Your Haka OTP code is: ${phoneOtpValue}`
    });

    return {
      userId: user._id,
      mockOtps: { emailOtp: emailOtpValue, phoneOtp: phoneOtpValue }
    };
  }

  // 2. LOGIN
  async login(loginId: string, password?: string, isOtpLogin = false, otp?: string, ip = '127.0.0.1', device = 'Desktop', browser = 'Chrome'): Promise<any> {
    const user = await this.userRepo.findByEmailOrPhone(loginId);
    if (!user) throw new NotFoundError('User account not found.');

    if (user.status === 'Banned') throw new ForbiddenError('Account suspended.');

    // Brute-force protection
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const waitMins = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      throw new ForbiddenError(`Account locked. Retry in ${waitMins} minute(s).`);
    }

    if (isOtpLogin) {
      if (!otp) throw new AppError('OTP is required for OTP sign in.', 400);

      const activeOtp = await this.otpRepo.findActiveOtp(user._id.toString(), otp, 'login');
      if (!activeOtp) {
        user.loginHistory.push({ ip, device, browser, timestamp: new Date(), status: 'Failed' });
        await user.save();
        throw new AppError('Invalid or expired OTP.', 400);
      }

      activeOtp.verified = true;
      await activeOtp.save();
    } else {
      if (!password) throw new AppError('Password is required for password sign in.', 400);

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Increment login attempts and lock account if needed
        user.loginAttempts += 1;
        user.loginHistory.push({ ip, device, browser, timestamp: new Date(), status: 'Failed' });

        if (user.loginAttempts >= 5) {
          user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 mins lock
          user.status = 'Locked';
        }
        await user.save();
        throw new UnauthorizedError('Invalid password credentials.');
      }
    }

    // Reset login attempts
    user.loginAttempts = 0;
    user.status = 'Active';
    user.lockUntil = undefined;
    user.loginHistory.push({ ip, device, browser, timestamp: new Date(), status: 'Success' });
    await user.save();

    // Generate JWT tokens
    const accessToken = this.generateAccessToken(user._id.toString(), user.role);
    const refreshToken = this.generateRefreshToken(user._id.toString());
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store Session in DB
    await this.sessionRepo.create({
      userId: user._id,
      token: refreshToken,
      device,
      browser,
      ip,
      expiresAt
    });

    // Cache user profile details in Redis for fast authentication checks
    const cacheKey = `user:profile:${user._id}`;
    await redisService.set(cacheKey, user, 300); // Cache for 5 minutes

    // Store session active list in Redis
    const sessionCacheKey = `user:sessions:${user._id}`;
    await redisService.del(sessionCacheKey); // Invalidate session lists cache

    return { user, accessToken, refreshToken };
  }

  // 3. LOGOUT
  async logout(refreshToken: string): Promise<void> {
    const session = await this.sessionRepo.findByToken(refreshToken);
    if (session) {
      const userId = session.userId.toString();
      await session.deleteOne();
      
      // Invalidate Redis caches
      await redisService.del(`user:profile:${userId}`);
      await redisService.del(`user:sessions:${userId}`);
    }
  }

  // 4. REFRESH TOKEN
  async refreshToken(refreshToken: string, ip = '127.0.0.1', device = 'Desktop', browser = 'Chrome'): Promise<any> {
    if (!refreshToken) throw new UnauthorizedError('Refresh token required.');

    const session = await this.sessionRepo.findByToken(refreshToken);
    if (!session || session.expiresAt < new Date()) {
      if (session) await session.deleteOne();
      throw new UnauthorizedError('Expired or invalid session token.');
    }

    // Verify token cryptographically
    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as any;
      const user = await this.userRepo.findById(decoded.id);
      if (!user || user.status === 'Banned') {
        await session.deleteOne();
        throw new UnauthorizedError('User account suspended or not found.');
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user._id.toString(), user.role);
      const newRefreshToken = this.generateRefreshToken(user._id.toString());
      
      // Update session record in DB
      session.token = newRefreshToken;
      session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      session.ip = ip;
      session.device = device;
      session.browser = browser;
      await session.save();

      // Invalidate cache
      await redisService.del(`user:sessions:${user._id}`);

      return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      await session.deleteOne();
      throw new UnauthorizedError('Invalid verification token.');
    }
  }

  // 5. SEND OTP
  async sendOtp(loginId: string, type: 'login' | 'reset_password' | 'email_verify' | 'phone_verify'): Promise<string> {
    const user = await this.userRepo.findByEmailOrPhone(loginId);
    if (!user) throw new NotFoundError('User account not found.');

    await this.otpRepo.invalidatePreviousOtps(user._id.toString(), type);

    const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await this.otpRepo.create({
      userId: user._id,
      otp: otpValue,
      type,
      expiresAt
    });

    if (type === 'email_verify' || type === 'reset_password' || user.email === loginId) {
      await queueService.addJob('email-queue', 'send-otp-email', {
        email: user.email,
        subject: `Your OTP Code for ${type}`,
        body: `Your verification code is: ${otpValue}`
      });
    } else {
      await queueService.addJob('sms-queue', 'send-otp-sms', {
        phone: user.phone,
        message: `Your verification code is: ${otpValue}`
      });
    }

    return otpValue;
  }

  // 6. VERIFY OTP
  async verifyOtp(userId: string, otp: string, type: 'email_verify' | 'phone_verify' | 'login' | 'reset_password'): Promise<boolean> {
    if (type === 'phone_verify' && otp.length > 20) {
      const phoneNumber = await firebaseSmsService.verifyFirebaseToken(otp);
      if (phoneNumber) {
        const user = await this.userRepo.findById(userId);
        if (user) {
          user.phone = phoneNumber;
          user.isPhoneVerified = true;
          await user.save();
          await redisService.del(`user:profile:${userId}`);
          return true;
        }
      }
      return false;
    }

    const activeOtp = await this.otpRepo.findActiveOtp(userId, otp, type);
    if (!activeOtp) return false;

    activeOtp.verified = true;
    await activeOtp.save();

    const user = await this.userRepo.findById(userId);
    if (user) {
      if (type === 'email_verify') user.isEmailVerified = true;
      if (type === 'phone_verify') user.isPhoneVerified = true;
      await user.save();
      
      // Invalidate Profile Cache
      await redisService.del(`user:profile:${userId}`);
    }

    return true;
  }

  // 7. FORGOT PASSWORD
  async forgotPassword(email: string): Promise<any> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new NotFoundError('No user with this email exists.');

    const otp = await this.sendOtp(email, 'reset_password');
    return { userId: user._id, mockOtp: otp };
  }

  // 8. RESET PASSWORD
  async resetPassword(data: any): Promise<void> {
    const { userId, otp, newPassword } = data;

    const activeOtp = await this.otpRepo.findActiveOtp(userId, otp, 'reset_password');
    if (!activeOtp) throw new AppError('Invalid or expired password reset OTP.', 400);

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    user.password = newPassword;
    user.loginAttempts = 0;
    user.status = 'Active';
    user.lockUntil = undefined;
    await user.save();

    activeOtp.verified = true;
    await activeOtp.save();

    // Revoke all previous active user device sessions
    await this.sessionRepo.deleteAllSessions(userId);
    await redisService.del(`user:profile:${userId}`);
    await redisService.del(`user:sessions:${userId}`);
  }

  // Helpers
  private generateAccessToken(userId: string, role: string): string {
    return jwt.sign(
      { id: userId, role },
      config.JWT_ACCESS_SECRET as any,
      { expiresIn: config.ACCESS_TOKEN_EXPIRY as any }
    );
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      config.JWT_REFRESH_SECRET as any,
      { expiresIn: config.REFRESH_TOKEN_EXPIRY as any }
    );
  }
}
export default AuthService;
