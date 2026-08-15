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
  phone?: string;
  password?: string;
  googleId?: string;
  role: 'Contestant' | 'Judge' | 'Sponsor' | 'Guest';
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
  coins: number;
  status: 'Active' | 'Banned' | 'Locked' | 'Suspended';
  twoFactorEnabled: boolean;
  loginAttempts: number;
  lockUntil?: number;
  dob?: Date;
  address?: string;
  state?: string;
  district?: string;
  city?: string;
  preferredLanguage?: string;
  pincode?: string;
  occupation?: string;
  education?: string;
  employmentStatus?: 'Student' | 'Employed / Salaried' | 'Self Employed' | 'Unemployed';
  favoriteCategories?: string[];
  notificationPermission?: boolean;
  locationPermission?: boolean;
  country: string;
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

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: false, unique: true, sparse: true, trim: true, index: true },
    password: { type: String, required: false },
    googleId: { type: String, unique: true, sparse: true, index: true },
    role: {
      type: String,
      enum: ['Contestant', 'Judge', 'Sponsor', 'Guest'],
      default: 'Contestant'
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
    coins: { type: Number, default: 100 },
    status: {
      type: String,
      enum: ['Active', 'Banned', 'Locked', 'Suspended'],
      default: 'Active',
      index: true
    },
    twoFactorEnabled: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Number },
    dob: { type: Date },
    address: { type: String, default: '' },
    state: { type: String, default: '' },
    district: { type: String, default: '' },
    city: { type: String, default: '' },
    preferredLanguage: { type: String, default: '' },
    pincode: { type: String, default: '' },
    occupation: { type: String, default: '' },
    education: { type: String, default: '' },
    employmentStatus: {
      type: String,
      enum: ['Student', 'Employed / Salaried', 'Self Employed', 'Unemployed'],
      default: 'Unemployed'
    },
    favoriteCategories: [{ type: String }],
    notificationPermission: { type: Boolean, default: false },
    locationPermission: { type: Boolean, default: false },
    country: { type: String, default: 'India' },
    loginHistory: [loginHistorySchema]
  },
  {
    timestamps: true
  }
);

// Compound Indexes for fast logins and filtering
userSchema.index({ email: 1, status: 1 });
userSchema.index({ username: 1, status: 1 });
userSchema.index({ phone: 1, status: 1 }, { sparse: true });

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
