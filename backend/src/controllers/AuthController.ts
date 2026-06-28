import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { config } from '../config/appConfig';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';

const authService = new AuthService();

// Helper to extract device and browser details
const parseUserAgent = (userAgentStr = '') => {
  let browser = 'Unknown Browser';
  let device = 'Desktop PC';
  const ua = userAgentStr.toLowerCase();

  if (ua.includes('firefox')) browser = 'Mozilla Firefox';
  else if (ua.includes('chrome')) browser = 'Google Chrome';
  else if (ua.includes('safari')) browser = 'Apple Safari';
  else if (ua.includes('edge')) browser = 'Microsoft Edge';

  if (ua.includes('iphone') || ua.includes('ipad')) device = 'iOS Mobile/Tablet';
  else if (ua.includes('android')) device = 'Android Mobile';
  else if (ua.includes('macintosh')) device = 'macOS Desktop';
  else if (ua.includes('windows')) device = 'Windows Desktop';

  return { browser, device };
};

const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProd = config.NODE_ENV === 'production';
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000 // 15 mins
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export class AuthController {
  // 1. REGISTER
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Registration successful. Verification OTPs sent.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // 2. LOGIN
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { loginId, password, isOtpLogin, otp } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
      const { browser, device } = parseUserAgent(req.headers['user-agent']);

      const { user, accessToken, refreshToken } = await authService.login(
        loginId,
        password,
        isOtpLogin,
        otp,
        ip,
        device,
        browser
      );

      setTokenCookies(res, accessToken, refreshToken);

      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          walletBalance: user.walletBalance,
          kycStatus: user.kycStatus
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // 3. LOGOUT
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.status(200).json({ success: true, message: 'Logged out successfully.' });
    } catch (err) {
      next(err);
    }
  }

  // 4. REFRESH TOKEN
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;
      const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
      const { browser, device } = parseUserAgent(req.headers['user-agent']);

      const { user, accessToken, refreshToken } = await authService.refreshToken(token, ip, device, browser);
      setTokenCookies(res, accessToken, refreshToken);

      res.status(200).json({
        success: true,
        accessToken,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // 5. SEND OTP
  async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { loginId, type } = req.body;
      const mockOtp = await authService.sendOtp(loginId, type);
      res.status(200).json({
        success: true,
        message: `Verification OTP code sent successfully.`,
        mockOtp // returned for automated e2e tests setup
      });
    } catch (err) {
      next(err);
    }
  }

  // 6. VERIFY OTP
  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, otp, type } = req.body;
      const isVerified = await authService.verifyOtp(userId, otp, type);
      if (!isVerified) {
        res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
        return;
      }
      res.status(200).json({ success: true, message: 'OTP verified successfully.' });
    } catch (err) {
      next(err);
    }
  }

  // 7. FORGOT PASSWORD
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.status(200).json({
        success: true,
        message: 'Password reset OTP code sent to registered email.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // 8. RESET PASSWORD
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.resetPassword(req.body);
      res.status(200).json({ success: true, message: 'Password updated successfully. Device sessions invalidated.' });
    } catch (err) {
      next(err);
    }
  }

  // 9. MOCK OAUTH
  async oauthLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'OAuth login simulated success.',
      user: {
        name: 'OAuth User',
        email: 'oauth_user@realitycontest.com',
        role: 'Contestant'
      }
    });
  }

  // 10. GET ME
  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthenticated.' });
        return;
      }
      // Return user profile loaded from AuthMiddleware fast cache
      const UserService = require('../services/UserService').UserService;
      const userService = new UserService();
      const user = await userService.getProfile(req.user.id);
      res.status(200).json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
export default authController;
