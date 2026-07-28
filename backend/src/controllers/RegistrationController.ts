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
  // 1. START MOBILE VERIFICATION
  async startMobile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { countryCode, phone, referralCode } = req.body;
      const result = await registrationService.startMobileVerification(countryCode, phone, referralCode);
      res.status(200).json({
        success: true,
        message: 'OTP generated and sent successfully.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // 2. VERIFY MOBILE OTP
  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, otp } = req.body;
      const result = await registrationService.verifyMobileOtp(sessionId, otp);
      res.status(200).json({
        success: true,
        message: 'OTP verified and registration session initialized.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // 3. RESEND OTP
  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.body;
      const result = await registrationService.resendMobileOtp(sessionId);
      res.status(200).json({
        success: true,
        message: 'New OTP code sent.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // 4. SAVE PROFILE
  async saveProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = getSessionIdFromToken(req);
      const profileData = {
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        dob: req.body.dob,
        gender: req.body.gender,
        state: req.body.state,
        district: req.body.district,
        city: req.body.city,
        preferredLanguage: req.body.preferredLanguage,
        avatar: req.body.avatar,
        pincode: req.body.pincode,
        referralCode: req.body.referralCode,
        occupation: req.body.occupation,
        education: req.body.education,
        employmentStatus: req.body.employmentStatus,
        notificationPermission: req.body.notificationPermission,
        locationPermission: req.body.locationPermission
      };
      const result = await registrationService.saveProfile(sessionId, profileData);
      res.status(200).json({
        success: true,
        message: 'Profile information saved successfully.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // 5. SAVE TOPICS
  async saveTopics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = getSessionIdFromToken(req);
      const { favoriteCategories } = req.body;
      const result = await registrationService.saveTopics(sessionId, favoriteCategories);
      res.status(200).json({
        success: true,
        message: 'Preferred topics saved successfully.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // 6. SAVE KYC & COMPLETE REGISTRATION
  async completeRegistration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = getSessionIdFromToken(req);
      
      // Save KYC step data
      const kycData = {
        documentType: req.body.documentType,
        documentNumber: req.body.documentNumber,
        documentFrontUrl: req.body.documentFrontUrl,
        documentBackUrl: req.body.documentBackUrl,
        selfieUrl: req.body.selfieUrl,
        addressProofUrl: req.body.addressProofUrl,
        declarationAccepted: req.body.declarationAccepted
      };
      
      await registrationService.saveKyc(sessionId, kycData);
      
      // Complete Registration (Create User and KYC documents)
      const user = await registrationService.completeRegistration(sessionId);
      
      res.status(201).json({
        success: true,
        message: 'Registration completed successfully. Contestant account and KYC created.',
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          kycStatus: user.kycStatus
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

export const registrationController = new RegistrationController();
export default registrationController;
