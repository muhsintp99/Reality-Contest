import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRegistrationSession extends Document {
  email?: string;
  emailVerified: boolean;
  emailOtp?: string;
  emailOtpExpiresAt?: Date;
  phone?: string;
  countryCode?: string;
  referralCode?: string;
  phoneVerified: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  profileData?: any;
  favoriteCategories?: string[];
  kycData?: any;
  status: 'email_verification' | 'email_otp_verification' | 'mobile_verification' | 'mobile_otp_verification' | 'profile_creation' | 'completed';
  createdAt: Date;
  expiresAt: Date;
}

const registrationSessionSchema = new Schema<IRegistrationSession>(
  {
    email: { type: String, trim: true, lowercase: true, index: true },
    emailVerified: { type: Boolean, default: false },
    emailOtp: { type: String },
    emailOtpExpiresAt: { type: Date },
    phone: { type: String, trim: true, index: true },
    countryCode: { type: String, default: '+91' },
    referralCode: { type: String, default: '' },
    phoneVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    profileData: { type: Schema.Types.Mixed, default: null },
    favoriteCategories: [{ type: String }],
    kycData: { type: Schema.Types.Mixed, default: null },
    status: {
      type: String,
      enum: ['email_verification', 'email_otp_verification', 'mobile_verification', 'mobile_otp_verification', 'profile_creation', 'completed'],
      default: 'email_verification'
    },
    expiresAt: { type: Date, required: true }
  },
  {
    timestamps: true
  }
);

// TTL index to automatically purge expired sessions
registrationSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RegistrationSession: Model<IRegistrationSession> =
  mongoose.models.RegistrationSession || mongoose.model<IRegistrationSession>('RegistrationSession', registrationSessionSchema);
export default RegistrationSession;
