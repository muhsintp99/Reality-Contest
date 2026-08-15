import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ILoginHistory {
  ip: string;
  device: string;
  browser: string;
  timestamp: Date;
  status: 'Success' | 'Failed';
}

export interface IAdmin extends Document {
  name: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  role: 'Admin' | 'Super Admin' | 'Contest Manager' | 'Question Manager' | 'Finance Manager' | 'Support Manager' | 'Support Executive' | 'Marketing Manager' | 'Content Moderator' | 'KYC Officer' | 'Analytics Manager';
  avatar: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isOnline: boolean;
  lastActiveAt?: Date;
  lastLoginAt?: Date;
  kycStatus: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  referralCode: string;
  walletBalance: number;
  status: 'Active' | 'Banned' | 'Locked' | 'Suspended';
  twoFactorEnabled: boolean;
  loginAttempts: number;
  lockUntil?: number;
  state?: string;
  district?: string;
  country?: string;
  loginHistory: ILoginHistory[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const loginHistorySchema = new Schema<ILoginHistory>({
  ip: { type: String, default: '127.0.0.1' },
  device: { type: String, default: 'Desktop' },
  browser: { type: String, default: 'Chrome' },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['Success', 'Failed'], default: 'Success' }
});

const adminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['Admin', 'Super Admin', 'Contest Manager', 'Question Manager', 'Finance Manager', 'Support Manager', 'Support Executive', 'Marketing Manager', 'Content Moderator', 'KYC Officer', 'Analytics Manager'],
      default: 'Admin'
    },
    avatar: { type: String, default: '' },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Male'
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false, index: true },
    lastActiveAt: { type: Date, default: Date.now },
    lastLoginAt: { type: Date },
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
      enum: ['Active', 'Banned', 'Locked', 'Suspended'],
      default: 'Active',
      index: true
    },
    twoFactorEnabled: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Number },
    state: { type: String, default: '' },
    district: { type: String, default: '' },
    country: { type: String, default: 'India' },
    loginHistory: [loginHistorySchema]
  },
  {
    timestamps: true
  }
);

// Compound Indexes
adminSchema.index({ email: 1, status: 1 });
adminSchema.index({ username: 1, status: 1 });
adminSchema.index({ phone: 1, status: 1 });

// Pre-save password hashing
adminSchema.pre<IAdmin>('save', async function (next) {
  const admin = this;
  if (!admin.isModified('password') || !admin.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Compare password
adminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);
export default Admin;
