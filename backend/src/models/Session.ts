import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  device: string;
  browser: string;
  ip: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, index: true },
    device: { type: String, default: 'Unknown Device' },
    browser: { type: String, default: 'Unknown Browser' },
    ip: { type: String, default: 'Unknown IP' },
    expiresAt: { type: Date, required: true }
  },
  {
    timestamps: true
  }
);

// TTL index to automatically prune expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', sessionSchema);
export default Session;
