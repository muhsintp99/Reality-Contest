import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true }
  },
  {
    timestamps: true
  }
);

export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;
