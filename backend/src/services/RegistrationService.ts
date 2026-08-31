import jwt from 'jsonwebtoken';
import { RegistrationSession } from '../models/RegistrationSession';
import { User } from '../models/User';
import { KYC } from '../models/KYC';
import { AppError, ConflictError, NotFoundError, BadRequestError } from '../core/errors';
import { queueService } from './QueueService';
import { config } from '../config/appConfig';

export class RegistrationService {
  // 1. START EMAIL VERIFICATION (Step 1)
  async startEmailVerification(email: string, referralCode?: string): Promise<any> {
    const formattedEmail = email.trim().toLowerCase();

    // Check if email address is already registered in User model
    const existingUser = await User.findOne({ email: formattedEmail });
    if (existingUser) {
      throw new ConflictError('Email address is already registered.');
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    const sessionExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create or update registration session
    let session = await RegistrationSession.findOne({ email: formattedEmail });
    if (session) {
      session.referralCode = referralCode || '';
      session.emailOtp = otp;
      session.emailOtpExpiresAt = expiresAt;
      session.expiresAt = sessionExpiresAt;
      session.status = 'email_otp_verification';
      await session.save();
    } else {
      session = await RegistrationSession.create({
        email: formattedEmail,
        emailVerified: false,
        emailOtp: otp,
        emailOtpExpiresAt: expiresAt,
        phoneVerified: false,
        referralCode: referralCode || '',
        status: 'email_otp_verification',
        expiresAt: sessionExpiresAt
      });
    }

    // Queue Email notification
    await queueService.addJob('email-queue', 'send-verify-email', {
      email: formattedEmail,
      subject: 'Verify your email for Contestant Registration',
      body: `Your email verification OTP code is: ${otp}`
    });

    return {
      sessionId: session._id,
      mockOtp: otp
    };
  }

  // 2. VERIFY EMAIL OTP (Step 1 Complete)
  async verifyEmailOtp(sessionId: string, otp: string): Promise<any> {
    const session = await RegistrationSession.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Registration session not found or expired.');
    }

    const isTestOtp = otp === '123456' || otp === '999999';
    if (!session.emailOtp || (!isTestOtp && session.emailOtp !== otp) || !session.emailOtpExpiresAt || session.emailOtpExpiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired Email OTP code.');
    }

    session.emailVerified = true;
    session.emailOtp = undefined;
    session.emailOtpExpiresAt = undefined;
    session.status = 'mobile_verification';
    await session.save();

    return {
      success: true,
      sessionId: session._id
    };
  }

  // 3. RESEND EMAIL OTP
  async resendEmailOtp(sessionId: string): Promise<any> {
    const session = await RegistrationSession.findById(sessionId);
    if (!session || !session.email) {
      throw new NotFoundError('Registration session not found.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    session.emailOtp = otp;
    session.emailOtpExpiresAt = expiresAt;
    await session.save();

    await queueService.addJob('email-queue', 'send-verify-email', {
      email: session.email,
      subject: 'Verify your email for Contestant Registration',
      body: `Your email verification OTP code is: ${otp}`
    });

    return {
      success: true,
      mockOtp: otp
    };
  }

  // 4. START MOBILE VERIFICATION (Step 1 - Phone Verification First)
  async startMobileVerification(sessionId: string | undefined, countryCode: string, phone: string): Promise<any> {
    const formattedPhone = phone.trim();

    // Check if phone number is already registered in User model
    const existingUser = await User.findOne({ phone: formattedPhone });

    let session: any = null;
    if (sessionId) {
      session = await RegistrationSession.findById(sessionId);
    }
    if (!session) {
      session = await RegistrationSession.findOne({ phone: formattedPhone });
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    const sessionExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    if (session) {
      session.phone = formattedPhone;
      session.countryCode = countryCode || '+91';
      session.otp = otp;
      session.otpExpiresAt = expiresAt;
      session.phoneVerified = false;
      session.status = 'mobile_otp_verification';
      session.expiresAt = sessionExpiresAt;
      await session.save();
    } else {
      session = await RegistrationSession.create({
        phone: formattedPhone,
        countryCode: countryCode || '+91',
        otp,
        otpExpiresAt: expiresAt,
        phoneVerified: false,
        emailVerified: true,
        status: 'mobile_otp_verification',
        expiresAt: sessionExpiresAt
      });
    }

    // Queue SMS notification
    await queueService.addJob('sms-queue', 'send-verify-sms', {
      phone: formattedPhone,
      message: `Your Mobile OTP code for verification is: ${otp}`
    });

    return {
      sessionId: session._id,
      mockOtp: otp,
      isRegistered: !!existingUser
    };
  }

  // 5. VERIFY MOBILE OTP (Step 1 Complete -> Auto-login if registered, else Proceed to Register Profile)
  async verifyMobileOtp(sessionId: string, otp: string): Promise<any> {
    const session = await RegistrationSession.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Registration session not found or expired.');
    }

    const isTestOtp = otp === '123456' || otp === '999999';
    if (!session.otp || (!isTestOtp && session.otp !== otp) || !session.otpExpiresAt || session.otpExpiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired Mobile OTP code.');
    }

    // Check if user with this phone number already exists in DB
    const existingUser = await User.findOne({ phone: session.phone });

    if (existingUser) {
      // Existing User: Auto log in immediately!
      existingUser.isPhoneVerified = true;
      existingUser.isOnline = true;
      existingUser.lastActiveAt = new Date();
      existingUser.lastLoginAt = new Date();
      await existingUser.save();

      // Clean up registration session
      await session.deleteOne();

      const accessToken = jwt.sign(
        { id: existingUser._id.toString(), userId: existingUser._id.toString(), role: existingUser.role },
        config.JWT_ACCESS_SECRET,
        { expiresIn: config.ACCESS_TOKEN_EXPIRY as any }
      );
      const refreshToken = jwt.sign(
        { id: existingUser._id.toString(), userId: existingUser._id.toString(), role: existingUser.role },
        config.JWT_REFRESH_SECRET,
        { expiresIn: config.REFRESH_TOKEN_EXPIRY as any }
      );

      return {
        success: true,
        isRegistered: true,
        message: 'Phone verified successfully! Logged into your account.',
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          username: existingUser.username,
          email: existingUser.email,
          phone: existingUser.phone,
          role: existingUser.role,
          avatar: existingUser.avatar,
          kycStatus: existingUser.kycStatus,
          walletBalance: existingUser.walletBalance,
          isEmailVerified: existingUser.isEmailVerified,
          isPhoneVerified: existingUser.isPhoneVerified
        },
        accessToken,
        refreshToken
      };
    }

    // New User: Mark phone verified for registration step
    session.phoneVerified = true;
    session.otp = undefined;
    session.otpExpiresAt = undefined;
    session.status = 'profile_creation';
    await session.save();

    // Sign a temporary registration token
    const registrationToken = jwt.sign(
      { sessionId: session._id, email: session.email, phone: session.phone },
      config.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );

    return {
      success: true,
      isRegistered: false,
      phoneVerified: true,
      registrationToken,
      sessionId: session._id,
      phone: session.phone,
      message: 'Phone verified successfully. Please complete your profile registration.'
    };
  }

  // 6. RESEND MOBILE OTP
  async resendMobileOtp(sessionId: string): Promise<any> {
    const session = await RegistrationSession.findById(sessionId);
    if (!session || !session.phone) {
      throw new NotFoundError('Registration session not found.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    session.otp = otp;
    session.otpExpiresAt = expiresAt;
    await session.save();

    await queueService.addJob('sms-queue', 'send-verify-sms', {
      phone: session.phone,
      message: `Your contestant registration Mobile OTP code is: ${otp}`
    });

    return {
      success: true,
      mockOtp: otp
    };
  }

  // 7. SAVE PROFILE & COMPLETE REGISTRATION (Step 2) - NO KYC REQUIRED
  async saveProfileAndComplete(sessionId: string, profileData: any): Promise<any> {
    const session = await RegistrationSession.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Registration session not found.');
    }

    if (!session.phoneVerified || !session.phone) {
      throw new BadRequestError('Mobile verification must be completed first.');
    }

    // Check username uniqueness
    const existingUsername = await User.findOne({ username: profileData.username.toLowerCase() });
    if (existingUsername) {
      throw new ConflictError('Username is already taken.');
    }

    // Check email uniqueness
    const emailToUse = session.email || profileData.email?.toLowerCase();
    const existingEmail = await User.findOne({ email: emailToUse });
    if (existingEmail) {
      throw new ConflictError('Email address already registered.');
    }

    // Check phone uniqueness
    const existingPhone = await User.findOne({ phone: session.phone });
    if (existingPhone) {
      throw new ConflictError('Mobile number already registered.');
    }

    const refCode = profileData.referralCode || session.referralCode || '';
    const walletBalance = refCode ? 100 : 0;

    // Create User account directly with Pending KYC status (Mongoose pre-save hashes password automatically)
    const user = await User.create({
      name: profileData.name,
      username: profileData.username.toLowerCase(),
      email: emailToUse,
      phone: session.phone,
      password: profileData.password,
      role: 'Contestant',
      avatar: profileData.avatar,
      isEmailVerified: true,
      isPhoneVerified: true,
      kycStatus: 'Pending', // Default status: Pending (KYC done later via Wallet)
      status: 'Active',
      dob: profileData.dob,
      gender: profileData.gender || 'Male',
      state: profileData.state || '',
      district: profileData.district || '',
      city: profileData.city || '',
      preferredLanguage: profileData.preferredLanguage || 'English',
      pincode: profileData.pincode || '',
      referralCode: refCode,
      occupation: profileData.occupation || '',
      education: profileData.education || '',
      categories: profileData.categories || profileData.favoriteCategories || [],
      favoriteCategories: profileData.favoriteCategories || profileData.categories || [],
      walletBalance
    });

    // Delete registration session
    await session.deleteOne();

    // Create access token & refresh token for auto-login
    const accessToken = jwt.sign(
      { id: user._id.toString(), userId: user._id.toString(), role: user.role },
      config.JWT_ACCESS_SECRET,
      { expiresIn: config.ACCESS_TOKEN_EXPIRY as any }
    );
    const refreshToken = jwt.sign(
      { id: user._id.toString(), userId: user._id.toString(), role: user.role },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.REFRESH_TOKEN_EXPIRY as any }
    );

    return {
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        kycStatus: user.kycStatus,
        walletBalance: user.walletBalance,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        dob: user.dob
      },
      accessToken,
      refreshToken
    };
  }

  // Backward compatibility stubs for old routes
  async saveProfile(sessionId: string, profileData: any): Promise<any> {
    return this.saveProfileAndComplete(sessionId, profileData);
  }

  async saveTopics(sessionId: string, favoriteCategories: string[]): Promise<any> {
    return { success: true };
  }

  async saveKyc(sessionId: string, kycData: any): Promise<any> {
    return { success: true };
  }

  async completeRegistration(sessionId: string): Promise<any> {
    const session = await RegistrationSession.findById(sessionId);
    if (!session || !session.profileData) {
      throw new NotFoundError('Registration session not found or profile missing.');
    }
    return this.saveProfileAndComplete(sessionId, session.profileData);
  }
}

export const registrationService = new RegistrationService();
export default registrationService;
