import { BaseRepository } from './BaseRepository';
import { INotification, Notification } from '../models/Notification';

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(Notification);
  }

  async findUnreadByUserId(userId: string): Promise<INotification[]> {
    return this.find({ userId, read: false }, null, { sort: { createdAt: -1 } });
  }

  async findAllByUserId(userId: string): Promise<INotification[]> {
    return this.find({ userId }, null, { sort: { createdAt: -1 } });
  }
}
export default NotificationRepository;
