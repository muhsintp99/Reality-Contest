import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
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
    let user = await this.userRepo.findByEmailOrPhone(loginId);
    if (!user) {
      const { Admin } = require('../models/Admin');
      user = await Admin.findOne({
        $or: [
          { email: loginId.trim().toLowerCase() },
          { username: loginId.trim().toLowerCase() },
          { phone: loginId.trim() }
        ]
      });
    }
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

      const isMatch = typeof user.comparePassword === 'function'
        ? await user.comparePassword(password)
        : await bcrypt.compare(password, user.password || '');
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
      await this.sessionRepo.delete((session as any)._id);
      
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
      let user = await this.userRepo.findById(decoded.id);
      if (!user) {
        const { Admin } = require('../models/Admin');
        user = await Admin.findById(decoded.id);
      }
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
    let user = await this.userRepo.findByEmailOrPhone(loginId);
    if (!user) {
      const { Admin } = require('../models/Admin');
      user = await Admin.findOne({
        $or: [
          { email: loginId.trim().toLowerCase() },
          { phone: loginId.trim() }
        ]
      });
    }
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
        let user = await this.userRepo.findById(userId);
        if (!user) {
          const { Admin } = require('../models/Admin');
          user = await Admin.findById(userId);
        }
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

    let user = await this.userRepo.findById(userId);
    if (!user) {
      const { Admin } = require('../models/Admin');
      user = await Admin.findById(userId);
    }
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
    let user = await this.userRepo.findByEmail(email);
    if (!user) {
      const { Admin } = require('../models/Admin');
      user = await Admin.findOne({ email: email.toLowerCase() });
    }
    if (!user) throw new NotFoundError('No user with this email exists.');

    const otp = await this.sendOtp(email, 'reset_password');
    return { userId: user._id, mockOtp: otp };
  }

  // 8. RESET PASSWORD
  async resetPassword(data: any): Promise<void> {
    const { userId, otp, newPassword } = data;

    const activeOtp = await this.otpRepo.findActiveOtp(userId, otp, 'reset_password');
    if (!activeOtp) throw new AppError('Invalid or expired password reset OTP.', 400);

    let user = await this.userRepo.findById(userId);
    if (!user) {
      const { Admin } = require('../models/Admin');
      user = await Admin.findById(userId);
    }
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

  // 9. GOOGLE REGISTER & LOGIN
  async googleAuth(
    params: {
      idToken?: string;
      googleId?: string;
      email: string;
      name?: string;
      avatar?: string;
      referralCode?: string;
    },
    ip = '127.0.0.1',
    device = 'Desktop',
    browser = 'Chrome'
  ): Promise<any> {
    let { idToken, googleId, email, name, avatar, referralCode } = params;

    if (!email && !idToken) {
      throw new AppError('Email address or Google ID Token is required.', 400);
    }

    // Verify Google ID Token if passed
    if (idToken) {
      try {
        const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
        const response = await fetch(verifyUrl);
        if (response.ok) {
          const payload: any = await response.json();
          if (payload.email) {
            email = payload.email;
            name = name || payload.name || payload.given_name || email.split('@')[0];
            avatar = avatar || payload.picture || '';
            googleId = googleId || payload.sub;
          }
        }
      } catch (err) {
        console.warn('Google idToken verification warning:', err);
      }
    }

    if (!email) {
      throw new AppError('Invalid Google credential token or missing email.', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Look up user by googleId or email
    let user = null;
    if (googleId) {
      user = await this.userRepo.findOne({ googleId });
    }
    if (!user) {
      user = await this.userRepo.findByEmail(normalizedEmail);
    }

    if (user) {
      if (user.status === 'Banned') throw new ForbiddenError('Account suspended.');
      if (user.lockUntil && user.lockUntil > Date.now()) {
        const waitMins = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
        throw new ForbiddenError(`Account locked. Retry in ${waitMins} minute(s).`);
      }

      if (googleId && !user.googleId) user.googleId = googleId;
      if (avatar && !user.avatar) user.avatar = avatar;
      if (!user.isEmailVerified) user.isEmailVerified = true;

      user.loginAttempts = 0;
      user.status = 'Active';
      user.lockUntil = undefined;
      user.loginHistory.push({ ip, device, browser, timestamp: new Date(), status: 'Success' });
      await user.save();
    } else {
      // New user register via Google
      let baseUsername = (name || normalizedEmail.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      if (baseUsername.length < 3) baseUsername = 'user' + baseUsername;

      let username = baseUsername;
      let counter = 1;
      while (await this.userRepo.findByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      const walletBalance = referralCode ? 100 : 0;

      user = await this.userRepo.create({
        name: name || normalizedEmail.split('@')[0],
        username,
        email: normalizedEmail,
        googleId: googleId || `google_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        isEmailVerified: true,
        isPhoneVerified: false,
        kycStatus: 'Pending',
        walletBalance,
        referralCode: referralCode || '',
        status: 'Active',
        role: 'Contestant',
        country: 'India',
        loginHistory: [{ ip, device, browser, timestamp: new Date(), status: 'Success' }]
      });
    }

    // Generate JWT tokens
    const accessToken = this.generateAccessToken(user._id.toString(), user.role);
    const refreshToken = this.generateRefreshToken(user._id.toString());
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Store Session in DB
    await this.sessionRepo.create({
      userId: user._id,
      token: refreshToken,
      device,
      browser,
      ip,
      expiresAt
    });

    // Cache user profile details in Redis
    const cacheKey = `user:profile:${user._id}`;
    await redisService.set(cacheKey, user, 300);

    const sessionCacheKey = `user:sessions:${user._id}`;
    await redisService.del(sessionCacheKey);

    return { user, accessToken, refreshToken };
  }

  // 10. GUEST LOGIN
  async guestLogin(ip = '127.0.0.1', device = 'Desktop', browser = 'Chrome'): Promise<any> {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const guestUsername = `guest_${timestamp.toString().slice(-5)}${randomSuffix}`;
    const guestEmail = `${guestUsername}@realitycontest.in`;

    const user = await this.userRepo.create({
      name: `Guest_${randomSuffix}`,
      username: guestUsername,
      email: guestEmail,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${guestUsername}`,
      isEmailVerified: true,
      isPhoneVerified: false,
      kycStatus: 'Pending',
      walletBalance: 50,
      status: 'Active',
      role: 'Guest',
      country: 'India',
      loginHistory: [{ ip, device, browser, timestamp: new Date(), status: 'Success' }]
    });

    const accessToken = this.generateAccessToken(user._id.toString(), user.role);
    const refreshToken = this.generateRefreshToken(user._id.toString());
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.sessionRepo.create({
      userId: user._id,
      token: refreshToken,
      device,
      browser,
      ip,
      expiresAt
    });

    const cacheKey = `user:profile:${user._id}`;
    await redisService.set(cacheKey, user, 300);

    return { user, accessToken, refreshToken };
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
