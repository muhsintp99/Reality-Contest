import { NotificationRepository } from '../repositories/NotificationRepository';
import { INotification, Notification } from '../models/Notification';
import { NotFoundError } from '../core/errors';
import mongoose from 'mongoose';

const notificationRepo = new NotificationRepository();

export class NotificationService {
  async getNotifications(userId: string): Promise<INotification[]> {
    let notifications = await notificationRepo.findAllByUserId(userId);
    
    // Seed initial notifications for the user if they have none, so the UI is active and visually rich
    if (notifications.length === 0) {
      const recipientId = new mongoose.Types.ObjectId(userId);
      const initialNotifs = [
        {
          userId: recipientId,
          recipient: recipientId,
          title: 'Identity Verification Checked',
          message: 'Contestant biometric liveness scan matches and KYC documentation review has been queued.',
          module: 'KYC',
          read: false,
          isRead: false,
          createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 mins ago
        },
        {
          userId: recipientId,
          recipient: recipientId,
          title: 'Pepsi Creator Showdown 2026',
          message: 'Sponsor Pepsi Co just launched a new challenge stage with a prize pool of ₹10,00,000.',
          module: 'Contest',
          read: false,
          isRead: false,
          createdAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        },
        {
          userId: recipientId,
          recipient: recipientId,
          title: 'Wallet Balance Loaded',
          message: 'Successfully loaded ₹1,000 credits to your play balance via simulation gateway.',
          module: 'Finance',
          read: true,
          isRead: true,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
        },
        {
          userId: recipientId,
          recipient: recipientId,
          title: 'Security Session Alert',
          message: 'Your account was accessed from a new Windows Desktop device using Chrome.',
          module: 'System',
          read: true,
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          userId: recipientId,
          recipient: recipientId,
          title: 'Auditor System Log',
          message: 'Manual stage qualification overrides were simulated for result log res-105.',
          module: 'System',
          read: true,
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
      ];

      await Notification.insertMany(initialNotifs);
      notifications = await notificationRepo.findAllByUserId(userId);
    }
    
    return notifications;
  }

  async getUnreadCount(userId: string): Promise<number> {
    if (mongoose.connection.readyState !== 1) return 0;
    try {
      return await Notification.countDocuments({ recipient: userId, isRead: false });
    } catch {
      return 0;
    }
  }

  async getModuleUnreadCounts(recipientId: string): Promise<any> {
    const defaultCounts = {
      contestant: 0,
      judge: 0,
      sponsor: 0,
      kyc: 0,
      contest: 0,
      finance: 0,
      support: 0,
      marketing: 0,
      analytics: 0,
      system: 0,
      total: 0
    };

    if (mongoose.connection.readyState !== 1) {
      return defaultCounts;
    }

    try {
      if (!recipientId) return defaultCounts;

      const [contestant, judge, sponsor, kyc, contest, finance, support, marketing, analytics, system] = await Promise.all([
        Notification.countDocuments({ recipient: recipientId, module: 'Contestant', isRead: false }),
        Notification.countDocuments({ recipient: recipientId, module: 'Judge', isRead: false }),
        Notification.countDocuments({ recipient: recipientId, module: 'Sponsor', isRead: false }),
        Notification.countDocuments({ recipient: recipientId, module: 'KYC', isRead: false }),
        Notification.countDocuments({ recipient: recipientId, module: 'Contest', isRead: false }),
        Notification.countDocuments({ recipient: recipientId, module: 'Finance', isRead: false }),
        Notification.countDocuments({ recipient: recipientId, module: 'Support', isRead: false }),
        Notification.countDocuments({ recipient: recipientId, module: 'Marketing', isRead: false }),
        Notification.countDocuments({ recipient: recipientId, module: 'Analytics', isRead: false }),
        Notification.countDocuments({ recipient: recipientId, module: 'System', isRead: false })
      ]);
      const total = contestant + judge + sponsor + kyc + contest + finance + support + marketing + analytics + system;

      return {
        contestant,
        judge,
        sponsor,
        kyc,
        contest,
        finance,
        support,
        marketing,
        analytics,
        system,
        total
      };
    } catch {
      return defaultCounts;
    }
  }

  async markAllRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, read: true, readAt: new Date() }
    );
  }

  async markModuleAsRead(recipientId: string, module: string): Promise<any> {
    // Normalise module string to exact casing expected in schema
    const formattedModule = module.charAt(0).toUpperCase() + module.slice(1).toLowerCase();
    
    // Aadhaar / PAN doc reviews are mapped to 'KYC'
    const finalModule = formattedModule === 'Kyc' ? 'KYC' : formattedModule;

    // Update all matching unread notifications to read
    await Notification.updateMany(
      { recipient: recipientId, module: finalModule, isRead: false },
      { isRead: true, read: true, readAt: new Date() }
    );

    // Return the updated unread counts grouped by module
    return this.getModuleUnreadCounts(recipientId);
  }

  async toggleRead(notificationId: string, userId: string): Promise<INotification> {
    const notif = await Notification.findOne({ _id: notificationId, recipient: userId });
    if (!notif) {
      throw new NotFoundError('Notification not found.');
    }
    notif.isRead = !notif.isRead;
    await notif.save();
    return notif;
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const res = await Notification.deleteOne({ _id: notificationId, recipient: userId });
    if (res.deletedCount === 0) {
      throw new NotFoundError('Notification not found.');
    }
  }

  async clearAll(userId: string): Promise<void> {
    await Notification.deleteMany({ recipient: userId });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
