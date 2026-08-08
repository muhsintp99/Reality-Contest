import mongoose, { Document, Schema, Model } from 'mongoose';

export type DailyContestStatus = 'Draft' | 'Registration Open' | 'Upcoming' | 'Active' | 'In Progress' | 'Completed' | 'Maintenance';

export interface IDailyContest extends Document {
  dailyContestId: string;
  title: string;
  category: string;
  categories?: string[];
  bannerUrl?: string;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  videos?: string[];
  fileAttachmentUrl?: string;
  files?: string[];
  description: string;
  rules?: string;
  prizePool: number; // In Coins 🪙
  entryFee: number;  // In Coins 🪙
  timerLimit?: string | number;
  resetIntervalHours: number;
  lastResetAt: Date;
  nextResetAt: Date;
  autoReset: boolean;
  isActive: boolean;
  dailyStartTime?: string;
  dailyEndTime?: string;
  difficulty?: string;
  questionsCount?: number;
  questions?: mongoose.Types.ObjectId[];
  participantsCount: number;
  participants?: mongoose.Types.ObjectId[];
  status: DailyContestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const dailyContestSchema = new Schema<IDailyContest>(
  {
    dailyContestId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: 'Speed Battle', index: true },
    categories: [{ type: String }],
    bannerUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    images: [{ type: String }],
    videoUrl: { type: String, default: '' },
    videos: [{ type: String }],
    fileAttachmentUrl: { type: String, default: '' },
    files: [{ type: String }],
    description: { type: String, default: '' },
    rules: { type: String, default: '' },
    prizePool: { type: Number, default: 10000 },
    entryFee: { type: Number, default: 0 },
    timerLimit: { type: Schema.Types.Mixed, default: '3 mins' },
    resetIntervalHours: { type: Number, default: 24 },
    lastResetAt: { type: Date, default: Date.now },
    nextResetAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
    autoReset: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    dailyStartTime: { type: String, default: '09:00 AM' },
    dailyEndTime: { type: String, default: '11:59 PM' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Expert'], default: 'Medium' },
    questionsCount: { type: Number, default: 20 },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    participantsCount: { type: Number, default: 0 },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['Draft', 'Registration Open', 'Upcoming', 'Active', 'In Progress', 'Completed', 'Maintenance'],
      default: 'Active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

dailyContestSchema.index({ status: 1, category: 1 });

export const DailyContest: Model<IDailyContest> =
  mongoose.models.DailyContest || mongoose.model<IDailyContest>('DailyContest', dailyContestSchema);

export default DailyContest;
