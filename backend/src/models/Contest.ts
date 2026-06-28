import mongoose, { Document, Schema, Model } from 'mongoose';

export type ContestStatus = 'Draft' | 'Upcoming' | 'Registration Open' | 'Registration Closed' | 'Live' | 'Completed' | 'Cancelled';

export interface IContest extends Document {
  title: string;
  bannerUrl: string;
  description: string;
  prizePool: number;
  registrationStart: Date;
  registrationEnd: Date;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  categories: string[];
  sponsors: string[];
  entryFee: number;
  status: ContestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const contestSchema = new Schema<IContest>(
  {
    title: { type: String, required: true, trim: true },
    bannerUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    prizePool: { type: Number, default: 0 },
    registrationStart: { type: Date, required: true },
    registrationEnd: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxParticipants: { type: Number, default: 0 },
    categories: [{ type: String }],
    sponsors: [{ type: String }],
    entryFee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Draft', 'Upcoming', 'Registration Open', 'Registration Closed', 'Live', 'Completed', 'Cancelled'],
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
