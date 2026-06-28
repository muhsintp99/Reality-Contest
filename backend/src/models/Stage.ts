import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IStageRules {
  rules: string;
  regulations: string;
  instructions: string;
  attemptPolicy: string;
  disqualificationPolicy: string;
}

export interface IStage extends Document {
  groupId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  rules: IStageRules;
  startDate: Date;
  endDate: Date;
  timeLimit: number; // in seconds
  passingScore: number;
  passingPercentage: number;
  maxAttempts: number;
  winnerCount: number;
  qualificationLogic: 'minimum_score' | 'top_participants' | 'percentage' | 'judge_decision' | 'manual_approval' | 'random_selection' | 'wildcard_entry';
  lockAfterSubmission: boolean;
  leaderboardVisibility: boolean;
  resultVisibility: boolean;
  type: string; // 'Quiz' | 'VideoUpload' | 'Coding' | etc.
  config: Record<string, any>; // Stage-specific configs (like questionPoolId, shuffle options, etc.)
  createdAt: Date;
  updatedAt: Date;
}

const stageRulesSchema = new Schema<IStageRules>({
  rules: { type: String, default: '' },
  regulations: { type: String, default: '' },
  instructions: { type: String, default: '' },
  attemptPolicy: { type: String, default: '' },
  disqualificationPolicy: { type: String, default: '' }
}, { _id: false });

const stageSchema = new Schema<IStage>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    rules: { type: stageRulesSchema, default: () => ({}) },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timeLimit: { type: Number, default: 0 }, // in seconds
    passingScore: { type: Number, default: 0 },
    passingPercentage: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 1 },
    winnerCount: { type: Number, default: 0 },
    qualificationLogic: {
      type: String,
      enum: ['minimum_score', 'top_participants', 'percentage', 'judge_decision', 'manual_approval', 'random_selection', 'wildcard_entry'],
      default: 'minimum_score'
    },
    lockAfterSubmission: { type: Boolean, default: true },
    leaderboardVisibility: { type: Boolean, default: true },
    resultVisibility: { type: Boolean, default: true },
    type: { type: String, required: true, index: true }, // e.g. 'Quiz'
    config: { type: Schema.Types.Mixed, default: {} }
  },
  {
    timestamps: true
  }
);

export const Stage: Model<IStage> = mongoose.models.Stage || mongoose.model<IStage>('Stage', stageSchema);
export default Stage;
