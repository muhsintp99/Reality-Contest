import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ILoginHistory {
  ip: string;
  device: string;
  browser: string;
  timestamp: Date;
  status: 'Success' | 'Failed';
}

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  role: 'Contestant' | 'Judge' | 'Sponsor' | 'Admin' | 'Super Admin';
  avatar: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  kycStatus: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  referralCode: string;
  walletBalance: number;
  status: 'Active' | 'Banned' | 'Locked';
  loginAttempts: number;
  lockUntil?: number;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  dob?: Date;
  gender: 'Male' | 'Female' | 'Other';
  state: string;
  district: string;
  country: string;
  favoriteCategories: string[];
  skills: string[];
  interests: string[];
  loginHistory: ILoginHistory[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const loginHistorySchema = new Schema<ILoginHistory>({
  ip: String,
  device: String,
  browser: String,
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['Success', 'Failed'], default: 'Success' }
});

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['Contestant', 'Judge', 'Sponsor', 'Admin', 'Super Admin'],
      default: 'Contestant'
    },
    avatar: { type: String, default: '' },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    kycStatus: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true
    },
    referralCode: { type: String, default: '' },
    walletBalance: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Active', 'Banned', 'Locked'],
      default: 'Active',
      index: true
    },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Number },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: '' },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    state: { type: String, default: '' },
    district: { type: String, default: '' },
    country: { type: String, default: 'India' },
    favoriteCategories: [{ type: String }],
    skills: [{ type: String }],
    interests: [{ type: String }],
    loginHistory: [loginHistorySchema]
  },
  {
    timestamps: true
  }
);

// Compound Indexes for fast logins and filtering
userSchema.index({ email: 1, status: 1 });
userSchema.index({ username: 1, status: 1 });
userSchema.index({ phone: 1, status: 1 });

// Pre-save password hashing hook
userSchema.pre<IUser>('save', async function (next) {
  const user = this;
  if (!user.isModified('password') || !user.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Compare password helper method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;
