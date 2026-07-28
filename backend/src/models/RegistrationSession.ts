import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRegistrationSession extends Document {
  phone: string;
  countryCode: string;
  referralCode?: string;
  phoneVerified: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  profileData?: any;
  favoriteCategories?: string[];
  kycData?: any;
  status: 'mobile_verification' | 'otp_verification' | 'profile_creation' | 'preferred_topics' | 'kyc_verification' | 'completed';
  createdAt: Date;
  expiresAt: Date;
}

const registrationSessionSchema = new Schema<IRegistrationSession>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    countryCode: { type: String, required: true },
    referralCode: { type: String, default: '' },
    phoneVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    profileData: { type: Schema.Types.Mixed, default: null },
    favoriteCategories: [{ type: String }],
    kycData: { type: Schema.Types.Mixed, default: null },
    status: {
      type: String,
      enum: ['mobile_verification', 'otp_verification', 'profile_creation', 'preferred_topics', 'kyc_verification', 'completed'],
      default: 'mobile_verification'
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
