import mongoose, { Document, Schema, Model } from 'mongoose';

export type GrandContestStatus = 
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

export interface IGrandContest extends Document {
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
  guidelines?: string;
  durationDays?: number;
  prizePool: number;
  entryFee: number;
  entryFeeType: EntryFeeType;
  isFree: boolean;
  entryFeeCoins: number;
  coinsReward: number;
  timerLimit?: number;
  difficulty?: string;
  tasksCount?: number;
  tasks?: mongoose.Types.ObjectId[];
  registrationStart: Date;
  registrationEnd: Date;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  categories: string[];
  sponsors?: string[];
  status: GrandContestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const grandContestSchema = new Schema<IGrandContest>(
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
    guidelines: { type: String, default: '' },
    durationDays: { type: Number, default: 7 },
    prizePool: { type: Number, default: 0 },
    entryFee: { type: Number, default: 0 },
    entryFeeType: { type: String, enum: ['Free', 'Coins', 'Cash'], default: 'Free' },
    isFree: { type: Boolean, default: true },
    entryFeeCoins: { type: Number, default: 0 },
    coinsReward: { type: Number, default: 0 },
    timerLimit: { type: Number, default: 30 },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Expert'], default: 'Medium' },
    tasksCount: { type: Number, default: 0 },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
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

grandContestSchema.index({ status: 1, startDate: 1 });

export const GrandContest: Model<IGrandContest> = mongoose.models.GrandContest || mongoose.model<IGrandContest>('GrandContest', grandContestSchema);
export default GrandContest;
