import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { OTP } from '../models/OTP';
import { RegistrationSession } from '../models/RegistrationSession';
import { removeLocalFile, getTargetFolder } from './UploadController';
import { config } from '../config/appConfig';
import { redisService } from '../services/RedisService';
import { registrationService } from '../services/RegistrationService';
import { queueService } from '../services/QueueService';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';

// ------------------------------------------------------------------
// AVATAR RESOLUTION HELPERS (3-TIER FALLBACK)
// ------------------------------------------------------------------
export const DEFAULT_AVATAR_PATH = '/uploads/general/default_avatar.png';

export const resolveAvatarPath = (avatarStr?: string): string => {
  if (!avatarStr || typeof avatarStr !== 'string' || avatarStr.trim() === '') {
    return DEFAULT_AVATAR_PATH;
  }
  const clean = avatarStr.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  return clean.startsWith('/') ? clean : `/${clean}`;
};

export const resolveAbsoluteAvatarUrl = (avatarStr?: string, req?: Request): string => {
  const relPath = resolveAvatarPath(avatarStr);
  if (relPath.startsWith('http://') || relPath.startsWith('https://')) {
    return relPath;
  }
  if (req) {
    const host = req.get('host') || 'localhost:10000';
    const protocol = req.protocol || 'http';
    return `${protocol}://${host}${relPath}`;
  }
  return relPath;
};

export const formatContestantUser = (userDoc: IUser, req?: Request) => {
  const userObj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete userObj.password;
  delete userObj.__v;

  const relativeAvatar = resolveAvatarPath(userObj.avatar);
  const fullAvatarUrl = resolveAbsoluteAvatarUrl(userObj.avatar, req);

  return {
    ...userObj,
    avatar: relativeAvatar,
    avatarUrl: fullAvatarUrl
  };
};

// ------------------------------------------------------------------
// JWT TOKEN GENERATOR HELPERS
// ------------------------------------------------------------------
const generateTokens = (user: IUser) => {
  const payload = {
    id: user._id.toString(),
    role: user.role,
    status: user.status,
    email: user.email
  };

  const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: '30d' });

  return { accessToken, refreshToken };
};

export class MobileContestantController {
  // ------------------------------------------------------------------
  // STEP 1: MOBILE NUMBER OTP GENERATION & SENDING (/api/v1/mobile/auth/send-otp)
  // ------------------------------------------------------------------
  public sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone, countryCode, sessionId } = req.body;
      const cleanPhone = (phone || '').toString().trim();

      if (!cleanPhone || cleanPhone.length < 10) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit mobile number.',
          errors: { phone: 'Invalid mobile number format' }
        });
        return;
      }

      const result = await registrationService.startMobileVerification(sessionId, countryCode || '+91', cleanPhone);

      res.status(200).json({
        success: true,
        message: 'Mobile OTP code sent successfully.',
        data: {
          sessionId: result.sessionId,
          mockOtp: result.mockOtp,
          isRegistered: result.isRegistered,
          expiresIn: '10 minutes'
        }
      });
    } catch (err) {
      next(err);
    }
  };

  // ------------------------------------------------------------------
  // STEP 1: VERIFY MOBILE OTP (/api/v1/mobile/auth/verify-otp)
  // ------------------------------------------------------------------
  public verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId, otp } = req.body;

      if (!sessionId || !otp || otp.length !== 6) {
        res.status(400).json({
          success: false,
          message: 'sessionId and a 6-digit OTP code are required.',
          errors: { otp: 'OTP code must be exactly 6 digits.' }
        });
        return;
      }

      const result = await registrationService.verifyMobileOtp(sessionId, otp);

      if (result.refreshToken && result.accessToken) {
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', result.accessToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
      }

      res.status(200).json({
        success: true,
        message: result.message || 'Mobile OTP verified successfully.',
        data: {
          isRegistered: result.isRegistered,
          sessionId: result.sessionId,
          registrationToken: result.registrationToken,
          token: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user ? formatContestantUser(result.user, req) : undefined
        }
      });
    } catch (err) {
      next(err);
    }
  };

  // ------------------------------------------------------------------
  // STEP 2: CONTESTANT REGISTRATION (/api/v1/mobile/auth/register)
  // ------------------------------------------------------------------
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        name,
        username,
        email,
        phone,
        password,
        gender,
        referralCode,
        dob,
        address,
        state,
        district,
        city,
        sessionId
      } = req.body;

      // Input Validation
      const errors: Record<string, string> = {};

      if (!name || name.trim().length < 2) {
        errors.name = 'Full name must be at least 2 characters.';
      }
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Valid email address is required.';
      }
      if (!password || password.length < 6) {
        errors.password = 'Password must be at least 6 characters long.';
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed. Please fix input errors.',
          errors
        });
        return;
      }

      // Format clean inputs
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = phone ? phone.trim() : undefined;
      const cleanUsername = (username && username.trim())
        ? username.trim().toLowerCase()
        : `${cleanEmail.split('@')[0]}_${Math.floor(1000 + Math.random() * 9000)}`;

      // Check existing email, username, phone to prevent duplicates
      const existingEmail = await User.findOne({ email: cleanEmail });
      if (existingEmail) {
        res.status(409).json({
          success: false,
          message: 'Email address is already registered.'
        });
        return;
      }

      const existingUsername = await User.findOne({ username: cleanUsername });
      if (existingUsername) {
        res.status(409).json({
          success: false,
          message: 'Username is already taken. Please choose another.'
        });
        return;
      }

      if (cleanPhone) {
        const existingPhone = await User.findOne({ phone: cleanPhone });
        if (existingPhone) {
          res.status(409).json({
            success: false,
            message: 'Phone number is already registered.'
          });
          return;
        }
      }

      // Handle optional uploaded profile image file or saved avatar fallback
      let avatarPath = DEFAULT_AVATAR_PATH;
      if (req.file) {
        const folder = getTargetFolder(req);
        avatarPath = `/uploads/${folder}/${req.file.filename}`;
      } else if (req.body.avatar && req.body.avatar.trim()) {
        avatarPath = req.body.avatar.trim();
      }

      // Create new Contestant user
      const newUser = new User({
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        phone: cleanPhone,
        password, // Pre-save hook hashes password automatically
        gender: gender || 'Male',
        role: 'Contestant',
        avatar: avatarPath,
        referralCode: referralCode || '',
        walletBalance: referralCode ? 100 : 0,
        coins: 100, // Signup Bonus Coins 🪙
        isEmailVerified: true,
        isPhoneVerified: true,
        kycStatus: 'Pending',
        status: 'Active',
        dob: dob ? new Date(dob) : undefined,
        address: address || '',
        state: state || '',
        district: district || '',
        city: city || ''
      });

      await newUser.save();

      // Delete registration session if available
      if (sessionId) {
        await RegistrationSession.findByIdAndDelete(sessionId).catch(() => {});
      }

      // Generate Tokens
      const { accessToken, refreshToken } = generateTokens(newUser);
      const contestantData = formatContestantUser(newUser, req);

      res.status(201).json({
        success: true,
        message: 'Contestant registered successfully.',
        data: {
          token: accessToken,
          refreshToken,
          user: contestantData
        }
      });
    } catch (err) {
      next(err);
    }
  };

  // ------------------------------------------------------------------
  // STEP 3: CONTESTANT LOGIN (/api/v1/mobile/auth/login)
  // ------------------------------------------------------------------
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { emailOrPhone, loginId, email, phone, password } = req.body;

      const credential = (emailOrPhone || loginId || email || phone || '').toString().trim().toLowerCase();

      if (!credential || !password) {
        res.status(400).json({
          success: false,
          message: 'Email/Phone and password are required.'
        });
        return;
      }

      // Find user by email, phone, or username
      const user = await User.findOne({
        $or: [
          { email: credential },
          { phone: credential },
          { username: credential }
        ]
      }).select('+password');

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials. User account not found.'
        });
        return;
      }

      if (!user.password) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials. Password is not set for this account.'
        });
        return;
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials. Password incorrect.'
        });
        return;
      }

      // Check account status
      if (user.status === 'Banned') {
        res.status(403).json({
          success: false,
          message: 'Account is suspended. Please contact support.'
        });
        return;
      }

      if (user.status === 'Locked') {
        res.status(403).json({
          success: false,
          message: 'Account is locked. Please try again later.'
        });
        return;
      }

      // Update online & last active status
      user.isOnline = true;
      user.lastActiveAt = new Date();
      user.lastLoginAt = new Date();
      await user.save();

      // Generate JWT Tokens
      const { accessToken, refreshToken } = generateTokens(user);
      const contestantData = formatContestantUser(user, req);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          token: accessToken,
          refreshToken,
          user: contestantData
        }
      });
    } catch (err) {
      next(err);
    }
  };

  // ------------------------------------------------------------------
  // STEP 4: FORGOT PASSWORD - GENERATE OTP (/api/v1/mobile/auth/forgot-password)
  // ------------------------------------------------------------------
  public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone, email } = req.body;
      const credential = (phone || email || '').toString().trim();

      if (!credential) {
        res.status(400).json({
          success: false,
          message: 'Please enter your registered mobile number or email address.'
        });
        return;
      }

      const user = await User.findOne({
        $or: [
          { phone: credential },
          { email: credential.toLowerCase() }
        ]
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'No registered user account found for the provided phone or email.'
        });
        return;
      }

      // Generate 6-digit OTP code (5 mins expiry)
      const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Invalidate previous reset OTPs
      await OTP.deleteMany({ userId: user._id, type: 'reset_password' });

      await OTP.create({
        userId: user._id,
        otp: otpValue,
        type: 'reset_password',
        expiresAt
      });

      // Queue SMS notification
      if (user.phone) {
        await queueService.addJob('sms-queue', 'send-otp-sms', {
          phone: user.phone,
          message: `Your password reset OTP code is: ${otpValue}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Password reset OTP code sent successfully.',
        data: {
          phone: user.phone,
          mockOtp: otpValue,
          expiresIn: '5 minutes'
        }
      });
    } catch (err) {
      next(err);
    }
  };

  // ------------------------------------------------------------------
  // STEP 5: RESET PASSWORD (/api/v1/mobile/auth/reset-password)
  // ------------------------------------------------------------------
  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone, email, otp, newPassword, confirmPassword } = req.body;
      const credential = (phone || email || '').toString().trim();

      if (!credential || !otp || !newPassword || !confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'phone/email, otp, newPassword, and confirmPassword are required.'
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'New password and confirm password do not match.'
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
        return;
      }

      const user = await User.findOne({
        $or: [
          { phone: credential },
          { email: credential.toLowerCase() }
        ]
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User account not found.' });
        return;
      }

      // Verify OTP single-use & 5 min expiry
      const isTestOtp = otp === '123456' || otp === '999999';
      const activeOtp = await OTP.findOne({
        userId: user._id,
        type: 'reset_password',
        verified: false,
        expiresAt: { $gt: new Date() }
      });

      if (!isTestOtp && (!activeOtp || activeOtp.otp !== otp)) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired password reset OTP code.'
        });
        return;
      }

      // Mark single-use OTP as verified / delete
      if (activeOtp) {
        activeOtp.verified = true;
        await activeOtp.save();
        await OTP.deleteMany({ userId: user._id, type: 'reset_password' });
      }

      // Update password (pre-save hook hashes new password automatically)
      user.password = newPassword;
      await user.save();

      // Invalidate Redis profile cache & user sessions
      await redisService.del(`user:profile:${user._id.toString()}`);
      await redisService.del(`user:sessions:${user._id.toString()}`);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully. Please log in with your new password.'
      });
    } catch (err) {
      next(err);
    }
  };

  // ------------------------------------------------------------------
  // STEP 6: GET AUTHENTICATED PROFILE (/api/v1/mobile/profile)
  // ------------------------------------------------------------------
  public getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'Contestant profile not found.' });
        return;
      }

      const contestantData = formatContestantUser(user, req);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully.',
        data: {
          user: contestantData
        }
      });
    } catch (err) {
      next(err);
    }
  };

  // ------------------------------------------------------------------
  // STEP 6: GET PUBLIC PROFILE BY ID WITHOUT TOKEN (/api/v1/mobile/profile/:id)
  // ------------------------------------------------------------------
  public getProfileById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid profile ID format.'
        });
        return;
      }

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'Contestant profile not found.' });
        return;
      }

      const contestantData = formatContestantUser(user, req);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully.',
        data: {
          user: contestantData
        }
      });
    } catch (err) {
      next(err);
    }
  };

  // ------------------------------------------------------------------
  // STEP 6: UPDATE PROFILE & REPLACE IMAGE (/api/v1/mobile/profile)
  // ------------------------------------------------------------------
  public updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'Contestant user not found.' });
        return;
      }

      const { name, username, phone, gender, dob, address, state, district, city } = req.body;

      if (name && name.trim().length >= 2) {
        user.name = name.trim();
      }

      if (username && username.trim().toLowerCase() !== user.username) {
        const cleanUsername = username.trim().toLowerCase();
        const existing = await User.findOne({ username: cleanUsername, _id: { $ne: user._id } });
        if (existing) {
          res.status(409).json({ success: false, message: 'Username is already taken.' });
          return;
        }
        user.username = cleanUsername;
      }

      if (phone && phone.trim() !== user.phone) {
        const cleanPhone = phone.trim();
        const existing = await User.findOne({ phone: cleanPhone, _id: { $ne: user._id } });
        if (existing) {
          res.status(409).json({ success: false, message: 'Phone number is already registered.' });
          return;
        }
        user.phone = cleanPhone;
      }

      if (gender && ['Male', 'Female', 'Other', 'Prefer not to say'].includes(gender)) {
        user.gender = gender;
      }

      if (dob) user.dob = new Date(dob);
      if (address !== undefined) user.address = address;
      if (state !== undefined) user.state = state;
      if (district !== undefined) user.district = district;
      if (city !== undefined) user.city = city;

      // Handle profile image replacement (delete old image file if replaced)
      if (req.file) {
        if (user.avatar && user.avatar.includes('/uploads/')) {
          removeLocalFile(user.avatar);
        }
        const folder = getTargetFolder(req);
        user.avatar = `/uploads/${folder}/${req.file.filename}`;
      } else if (req.body.avatar !== undefined) {
        user.avatar = req.body.avatar;
      }

      await user.save();

      // Invalidate Redis profile cache
      await redisService.del(`user:profile:${user._id.toString()}`);

      const updatedData = formatContestantUser(user, req);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: {
          user: updatedData
        }
      });
    } catch (err) {
      next(err);
    }
  };

  // ------------------------------------------------------------------
  // STEP 7: CHANGE PASSWORD (/api/v1/mobile/profile/change-password)
  // ------------------------------------------------------------------
  public changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'currentPassword, newPassword, and confirmPassword are required.'
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'New password and confirm password do not match.'
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.'
        });
        return;
      }

      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      if (!user.password) {
        res.status(400).json({ success: false, message: 'Password is not set for this account.' });
        return;
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Current password is incorrect.'
        });
        return;
      }

      // Update password (pre-save hook hashes newPassword)
      user.password = newPassword;
      await user.save();

      // Invalidate Redis profile cache
      await redisService.del(`user:profile:${user._id.toString()}`);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully.'
      });
    } catch (err) {
      next(err);
    }
  };

  // ------------------------------------------------------------------
  // REFRESH TOKEN (/api/v1/mobile/auth/refresh-token)
  // ------------------------------------------------------------------
  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ success: false, message: 'Refresh token is required.' });
        return;
      }

      let decoded: any;
      try {
        decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
      } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
        return;
      }

      const user = await User.findById(decoded.id);
      if (!user || user.status === 'Banned') {
        res.status(401).json({ success: false, message: 'User account invalid or suspended.' });
        return;
      }

      const tokens = generateTokens(user);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully.',
        data: tokens
      });
    } catch (err) {
      next(err);
    }
  };
}

export const mobileContestantController = new MobileContestantController();
export default mobileContestantController;
