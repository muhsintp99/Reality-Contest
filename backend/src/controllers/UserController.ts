import { Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import { UnauthorizedError } from '../core/errors';

const userService = new UserService();

export class UserController {
  // 1. GET PROFILE
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const user = await userService.getProfile(req.user.id);
      res.status(200).json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }

  // 2. UPDATE PROFILE
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const updatedUser = await userService.updateProfile(req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile details updated successfully.',
        user: updatedUser
      });
    } catch (err) {
      next(err);
    }
  }

  // 3. UPDATE AVATAR
  async updateAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { avatar } = req.body;
      const updatedUser = await userService.updateAvatar(req.user.id, avatar);
      res.status(200).json({
        success: true,
        message: 'Avatar image updated successfully.',
        user: updatedUser
      });
    } catch (err) {
      next(err);
    }
  }

  // 4. UPDATE PASSWORD
  async updatePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      await userService.updatePassword(req.user.id, req.body);
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.status(200).json({
        success: true,
        message: 'Password updated successfully. Active sessions revoked. Please log in again.'
      });
    } catch (err) {
      next(err);
    }
  }

  // 5. DELETE ACCOUNT
  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      await userService.deleteAccount(req.user.id);
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.status(200).json({
        success: true,
        message: 'Account deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  // 6. GET ACTIVE SESSIONS
  async getActiveSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const sessions = await userService.getActiveSessions(req.user.id);
      res.status(200).json({ success: true, sessions });
    } catch (err) {
      next(err);
    }
  }

  // 7. REVOKE DEVICE SESSION
  async revokeSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { sessionId } = req.params;
      await userService.revokeSession(req.user.id, sessionId);
      res.status(200).json({ success: true, message: 'Session revoked successfully.' });
    } catch (err) {
      next(err);
    }
  }

  // 8. LOGOUT ALL DEVICES
  async logoutAllDevices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const currentRefreshToken = req.cookies.refreshToken;
      await userService.logoutAllDevices(req.user.id, currentRefreshToken);
      res.status(200).json({
        success: true,
        message: 'Logged out of all other devices successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
export default userController;
