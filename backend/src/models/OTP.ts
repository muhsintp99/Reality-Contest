import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IOTP extends Document {
  userId: mongoose.Types.ObjectId;
  otp: string;
  type: 'email_verify' | 'phone_verify' | 'login' | 'reset_password';
  verified: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    otp: { type: String, required: true },
    type: {
      type: String,
      enum: ['email_verify', 'phone_verify', 'login', 'reset_password'],
      required: true
    },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true }
  },
  {
    timestamps: true
  }
);

// Index to find active unverified OTPs fast
otpSchema.index({ userId: 1, type: 1, verified: 1 });

// TTL index to automatically purge expired OTP entries
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP: Model<IOTP> = mongoose.models.OTP || mongoose.model<IOTP>('OTP', otpSchema);
export default OTP;
