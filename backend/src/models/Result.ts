import mongoose, { Document, Schema, Model } from 'mongoose';

export type ResultStatus = 'Qualified' | 'Failed' | 'Disqualified' | 'Pending Review';

export interface IResult extends Document {
  userId: mongoose.Types.ObjectId;
  stageId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  contestId: mongoose.Types.ObjectId;
  attemptId: mongoose.Types.ObjectId;
  score: number;
  passed: boolean;
  rank?: number;
  status: ResultStatus;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const resultSchema = new Schema<IResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stageId: { type: Schema.Types.ObjectId, ref: 'Stage', required: true, index: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    contestId: { type: Schema.Types.ObjectId, ref: 'Contest', required: true, index: true },
    attemptId: { type: Schema.Types.ObjectId, ref: 'Attempt', required: true, index: true },
    score: { type: Number, default: 0 },
    passed: { type: Boolean, default: false, index: true },
    rank: { type: Number },
    status: {
      type: String,
      enum: ['Qualified', 'Failed', 'Disqualified', 'Pending Review'],
      default: 'Pending Review',
      index: true
    },
    remarks: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

// Prevent multiple results per user per stage
resultSchema.index({ userId: 1, stageId: 1 }, { unique: true });

export const Result: Model<IResult> = mongoose.models.Result || mongoose.model<IResult>('Result', resultSchema);
export default Result;
