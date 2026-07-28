import { Response, NextFunction } from 'express';
import { notificationService } from '../services/NotificationService';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import { UnauthorizedError } from '../core/errors';

export class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const notifications = await notificationService.getNotifications(req.user.id);
      res.status(200).json({ success: true, notifications });
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      await notificationService.markAllRead(req.user.id);
      res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    } catch (err) {
      next(err);
    }
  }

  async markModuleAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { module } = req.params;
      const unreadCounts = await notificationService.markModuleAsRead(req.user.id, module);
      res.status(200).json({
        success: true,
        unreadCounts
      });
    } catch (err) {
      next(err);
    }
  }

  async toggleRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      const notification = await notificationService.toggleRead(id, req.user.id);
      res.status(200).json({ success: true, notification });
    } catch (err) {
      next(err);
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      await notificationService.deleteNotification(id, req.user.id);
      res.status(200).json({ success: true, message: 'Notification deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }

  async clearAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      await notificationService.clearAll(req.user.id);
      res.status(200).json({ success: true, message: 'All notifications cleared.' });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
export default notificationController;
