import jwt from 'jsonwebtoken';
import { RegistrationSession } from '../models/RegistrationSession';
import { User } from '../models/User';
import { KYC } from '../models/KYC';
import { AppError, ConflictError, NotFoundError, BadRequestError } from '../core/errors';
import { queueService } from './QueueService';
import { config } from '../config/appConfig';

export class RegistrationService {
  // 1. START MOBILE VERIFICATION
  async startMobileVerification(countryCode: string, phone: string, referralCode?: string): Promise<any> {
    const formattedPhone = phone.trim();
    
    // Check if phone number is already registered in User model
    const existingUser = await User.findOne({ phone: formattedPhone });
    if (existingUser) {
      throw new ConflictError('Mobile number already registered.');
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    const sessionExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create or update registration session
    let session = await RegistrationSession.findOne({ phone: formattedPhone });
    if (session) {
      session.countryCode = countryCode;
      session.referralCode = referralCode || '';
      session.otp = otp;
      session.otpExpiresAt = expiresAt;
      session.expiresAt = sessionExpiresAt;
      session.status = 'otp_verification';
      await session.save();
    } else {
      session = await RegistrationSession.create({
        phone: formattedPhone,
        countryCode,
        referralCode: referralCode || '',
        phoneVerified: false,
        otp,
        otpExpiresAt: expiresAt,
        status: 'otp_verification',
        expiresAt: sessionExpiresAt
      });
    }

    // Queue SMS notification
    await queueService.addJob('sms-queue', 'send-verify-sms', {
      phone: formattedPhone,
      message: `Your contestant registration OTP code is: ${otp}`
    });

    return {
      sessionId: session._id,
      mockOtp: otp
    };
  }

  // 2. VERIFY MOBILE OTP
  async verifyMobileOtp(sessionId: string, otp: string): Promise<any> {
    const session = await RegistrationSession.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Registration session not found or expired.');
    }

    if (!session.otp || session.otp !== otp || !session.otpExpiresAt || session.otpExpiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired OTP code.');
    }

    session.phoneVerified = true;
    session.otp = undefined;
    session.otpExpiresAt = undefined;
    session.status = 'profile_creation';
    await session.save();

    // Sign a temporary registration token
    const registrationToken = jwt.sign(
      { sessionId: session._id, phone: session.phone },
      config.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );

    return {
      success: true,
      registrationToken,
      sessionId: session._id
    };
  }

  // 3. RESEND MOBILE OTP
  async resendMobileOtp(sessionId: string): Promise<any> {
    const session = await RegistrationSession.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Registration session not found.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    session.otp = otp;
    session.otpExpiresAt = expiresAt;
    await session.save();

    await queueService.addJob('sms-queue', 'send-verify-sms', {
      phone: session.phone,
      message: `Your contestant registration OTP code is: ${otp}`
    });

    return {
      success: true,
      mockOtp: otp
    };
  }

  // 4. SAVE PROFILE
  async saveProfile(sessionId: string, profileData: any): Promise<any> {
    const session = await RegistrationSession.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Registration session not found.');
    }

    if (!session.phoneVerified) {
      throw new BadRequestError('Mobile verification must be completed first.');
    }

    // Check username uniqueness
    const existingUsername = await User.findOne({ username: profileData.username.toLowerCase() });
    if (existingUsername) {
      throw new ConflictError('Username is already taken.');
    }

    // Check email uniqueness
    const existingEmail = await User.findOne({ email: profileData.email.toLowerCase() });
    if (existingEmail) {
      throw new ConflictError('Email address already registered.');
    }

    session.profileData = profileData;
    session.status = 'preferred_topics';
    await session.save();

    return { success: true };
  }

  // 5. SAVE TOPICS
  async saveTopics(sessionId: string, favoriteCategories: string[]): Promise<any> {
    const session = await RegistrationSession.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Registration session not found.');
    }

    session.favoriteCategories = favoriteCategories;
    session.status = 'kyc_verification';
    await session.save();

    return { success: true };
  }

  // 6. SAVE KYC
  async saveKyc(sessionId: string, kycData: any): Promise<any> {
    const session = await RegistrationSession.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Registration session not found.');
    }

    session.kycData = kycData;
    session.status = 'completed';
    await session.save();

    return { success: true };
  }

  // 7. COMPLETE REGISTRATION (CREATE ACCOUNT & KYC)
  async completeRegistration(sessionId: string): Promise<any> {
    const session = await RegistrationSession.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Registration session not found.');
    }

    if (session.status !== 'completed' || !session.profileData || !session.kycData) {
      throw new BadRequestError('Registration steps are incomplete.');
    }

    // Double check email and username uniqueness just before creating account
    const existingUsername = await User.findOne({ username: session.profileData.username.toLowerCase() });
    if (existingUsername) {
      throw new ConflictError('Username is already taken.');
    }

    const existingEmail = await User.findOne({ email: session.profileData.email.toLowerCase() });
    if (existingEmail) {
      throw new ConflictError('Email address already registered.');
    }

    const existingPhone = await User.findOne({ phone: session.phone });
    if (existingPhone) {
      throw new ConflictError('Mobile number already registered.');
    }

    const refCode = session.profileData.referralCode || session.referralCode || '';
    const walletBalance = refCode ? 100 : 0;

    // Create User account (Mongoose pre-save hashes password automatically)
    const user = await User.create({
      name: session.profileData.name,
      username: session.profileData.username,
      email: session.profileData.email,
      phone: session.phone,
      password: session.profileData.password,
      role: 'Contestant',
      avatar: session.profileData.avatar,
      isEmailVerified: false,
      isPhoneVerified: true,
      kycStatus: 'Under Review',
      status: 'Active',
      dob: session.profileData.dob,
      gender: session.profileData.gender,
      state: session.profileData.state,
      district: session.profileData.district,
      city: session.profileData.city,
      preferredLanguage: session.profileData.preferredLanguage,
      pincode: session.profileData.pincode,
      referralCode: refCode,
      occupation: session.profileData.occupation,
      education: session.profileData.education,
      employmentStatus: session.profileData.employmentStatus,
      notificationPermission: session.profileData.notificationPermission,
      locationPermission: session.profileData.locationPermission,
      favoriteCategories: session.favoriteCategories,
      walletBalance
    });

    // Create KYC Record
    const simulatedLiveness = Math.floor(75 + Math.random() * 23);
    const aiVerdict = simulatedLiveness >= 80 ? 'PASSED' : 'REVIEW_REQUIRED';

    const kyc = await KYC.create({
      userId: user._id,
      documentType: session.kycData.documentType,
      documentNumber: session.kycData.documentNumber,
      documentFrontUrl: session.kycData.documentFrontUrl,
      documentBackUrl: session.kycData.documentBackUrl || '',
      selfieUrl: session.kycData.selfieUrl,
      addressProofUrl: session.kycData.addressProofUrl || '',
      declarationAccepted: session.kycData.declarationAccepted,
      livenessScore: simulatedLiveness,
      aiMatchResult: aiVerdict,
      status: 'Under Review'
    });

    // Find all administrative/manager staff users and create unread notifications for them
    try {
      const { Admin } = require('../models/Admin');
      const { Notification } = require('../models/Notification');
      const admins = await Admin.find({ role: { $in: ['Super Admin', 'Admin', 'Contest Manager', 'KYC Officer'] } });
      const notificationPromises = admins.map((adm: any) => {
        return Notification.create({
          userId: adm._id,
          title: 'New Contestant Registered',
          message: `Contestant ${user.name} (@${user.username}) has registered. KYC documents are pending review.`,
          read: false
        });
      });
      await Promise.all(notificationPromises);
    } catch (notifErr) {
      console.error('Failed to seed admin notifications for new contestant:', notifErr);
    }

    // Delete session
    await session.deleteOne();

    // Trigger async KYC validation job
    await queueService.addJob('kyc-queue', 'process-kyc-documents', {
      userId: user._id.toString(),
      kycId: kyc._id.toString()
    });

    return user;
  }
}

export const registrationService = new RegistrationService();
export default registrationService;
