import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  title: string;
  message: string;
  module: 'Contestant' | 'Judge' | 'Sponsor' | 'KYC' | 'Contest' | 'Finance' | 'Support' | 'Marketing' | 'Analytics' | 'System';
  referenceId?: string;
  read: boolean;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    module: {
      type: String,
      enum: ['Contestant', 'Judge', 'Sponsor', 'KYC', 'Contest', 'Finance', 'Support', 'Marketing', 'Analytics', 'System'],
      required: true,
      default: 'System',
      index: true
    },
    referenceId: { type: String, default: '' },
    read: { type: Boolean, default: false, index: true },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
);

// Compound Index for fast queries by recipient, module, and read status
notificationSchema.index({ recipient: 1, module: 1, isRead: 1 });

// Compatibility Sync Hook
notificationSchema.pre<INotification>('save', function (next) {
  if (this.isModified('isRead')) {
    this.read = this.isRead;
    if (this.isRead && !this.readAt) {
      this.readAt = new Date();
    }
  } else if (this.isModified('read')) {
    this.isRead = this.read;
    if (this.read && !this.readAt) {
      this.readAt = new Date();
    }
  }
  
  if (this.userId && !this.recipient) {
    this.recipient = this.userId;
  } else if (this.recipient && !this.userId) {
    this.userId = this.recipient;
  }
  
  next();
});

export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;
