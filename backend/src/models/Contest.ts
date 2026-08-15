import mongoose, { Document, Schema, Model } from 'mongoose';

export type ContestStatus = 
  | 'Draft' 
  | 'Registration Open' 
  | 'Upcoming' 
  | 'Active' 
  | 'In Progress' 
  | 'Registration Closed' 
  | 'Live' 
  | 'Completed' 
  | 'Maintenance' 
  | 'Cancelled';

export type EntryFeeType = 'Free' | 'Coins' | 'Cash';

export interface IContest extends Document {
  contestId: string;
  title: string;
  bannerUrl?: string;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  videos?: string[];
  fileAttachmentUrl?: string;
  files?: string[];
  description: string;
  rules?: string;
  prizePool: number;
  entryFee: number;
  entryFeeType: EntryFeeType;
  isFree: boolean;
  entryFeeCoins: number;
  coinsReward: number;
  timerLimit?: number;
  difficulty?: string;
  questionsCount?: number;
  questions?: mongoose.Types.ObjectId[];
  registrationStart: Date;
  registrationEnd: Date;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  categories: string[];
  sponsors?: string[];
  status: ContestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const contestSchema = new Schema<IContest>(
  {
    contestId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    bannerUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    images: [{ type: String }],
    videoUrl: { type: String, default: '' },
    videos: [{ type: String }],
    fileAttachmentUrl: { type: String, default: '' },
    files: [{ type: String }],
    description: { type: String, default: '' },
    rules: { type: String, default: '' },
    prizePool: { type: Number, default: 0 },
    entryFee: { type: Number, default: 0 },
    entryFeeType: { type: String, enum: ['Free', 'Coins', 'Cash'], default: 'Free' },
    isFree: { type: Boolean, default: true },
    entryFeeCoins: { type: Number, default: 0 },
    coinsReward: { type: Number, default: 0 },
    timerLimit: { type: Number, default: 30 },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Expert'], default: 'Medium' },
    questionsCount: { type: Number, default: 0 },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    registrationStart: { type: Date, default: Date.now },
    registrationEnd: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    maxParticipants: { type: Number, default: 0 },
    categories: [{ type: String }],
    sponsors: [{ type: String }],
    status: {
      type: String,
      enum: [
        'Draft', 
        'Registration Open', 
        'Upcoming', 
        'Active', 
        'In Progress', 
        'Registration Closed', 
        'Live', 
        'Completed', 
        'Maintenance', 
        'Cancelled'
      ],
      default: 'Draft',
      index: true
    }
  },
  {
    timestamps: true
  }
);

contestSchema.index({ status: 1, startDate: 1 });

export const Contest: Model<IContest> = mongoose.models.Contest || mongoose.model<IContest>('Contest', contestSchema);
export default Contest;
