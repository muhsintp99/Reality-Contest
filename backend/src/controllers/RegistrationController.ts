import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { registrationService } from '../services/RegistrationService';
import { config } from '../config/appConfig';
import { AppError } from '../core/errors';

const getSessionIdFromToken = (req: Request): string => {
  let token = '';
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    throw new AppError('Registration session token is required.', 401);
  }
  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as any;
    return decoded.sessionId;
  } catch (err) {
    throw new AppError('Invalid or expired registration session token.', 401);
  }
};

export class RegistrationController {
  // 1. START EMAIL VERIFICATION
  async startEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, referralCode } = req.body;
      const result = await registrationService.startEmailVerification(email, referralCode);
      res.status(200).json({
        success: true,
        message: 'Email OTP generated and sent successfully.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // 2. VERIFY EMAIL OTP
  async verifyEmailOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, otp } = req.body;
      const result = await registrationService.verifyEmailOtp(sessionId, otp);
      res.status(200).json({
        success: true,
        message: 'Email verified successfully.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // 3. RESEND EMAIL OTP
  async resendEmailOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.body;
      const result = await registrationService.resendEmailOtp(sessionId);
      res.status(200).json({
        success: true,
        message: 'New Email OTP code sent.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // 4. START MOBILE VERIFICATION
  async startMobile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, countryCode, phone } = req.body;
      const result = await registrationService.startMobileVerification(sessionId, countryCode, phone);
      res.status(200).json({
        success: true,
        message: 'Mobile OTP generated and sent successfully.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // 5. VERIFY MOBILE OTP
  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, otp } = req.body;
      const result = await registrationService.verifyMobileOtp(sessionId, otp);
      res.status(200).json({
        success: true,
        message: 'Mobile OTP verified successfully.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // 6. RESEND MOBILE OTP
  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.body;
      const result = await registrationService.resendMobileOtp(sessionId);
      res.status(200).json({
        success: true,
        message: 'New Mobile OTP code sent.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // 7. SAVE PROFILE & COMPLETE CONTESTANT REGISTRATION (NO KYC NEEDED)
  async saveProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = getSessionIdFromToken(req);
      const profileData = {
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        dob: req.body.dob,
        avatar: req.body.avatar,
        gender: req.body.gender,
        state: req.body.state,
        district: req.body.district,
        city: req.body.city,
        preferredLanguage: req.body.preferredLanguage,
        pincode: req.body.pincode,
        referralCode: req.body.referralCode,
        occupation: req.body.occupation,
        education: req.body.education,
        employmentStatus: req.body.employmentStatus,
        favoriteCategories: req.body.favoriteCategories
      };
      const result = await registrationService.saveProfileAndComplete(sessionId, profileData);

      // Set auth refresh token cookie
      if (result.refreshToken) {
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
          domain: isProd ? '.hakalive.in' : undefined,
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
      }

      res.status(201).json({
        success: true,
        message: 'Contestant registration completed successfully.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // 8. SAVE TOPICS (STUB)
  async saveTopics(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(200).json({ success: true, message: 'Topics saved successfully.' });
  }

  // 9. COMPLETE REGISTRATION (STUB)
  async completeRegistration(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(200).json({ success: true, message: 'Registration completed.' });
  }
}

export const registrationController = new RegistrationController();
export default registrationController;
