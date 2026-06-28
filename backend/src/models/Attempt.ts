import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICheatAlert {
  type: string; // 'tab_switch' | 'fullscreen_exit' | 'multiple_login'
  timestamp: Date;
  details: string;
}

export interface IAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  stageId: mongoose.Types.ObjectId;
  contestId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  acceptedRules: boolean;
  rulesAcceptedAt?: Date;
  ipAddress?: string;
  deviceInfo?: string;
  browser?: string;
  startedAt: Date;
  submittedAt?: Date;
  answers: any; // Dynamic storage (Mixed)
  score: number;
  status: 'In Progress' | 'Submitted' | 'Evaluated';
  cheatAlerts: ICheatAlert[];
  createdAt: Date;
  updatedAt: Date;
}

const cheatAlertSchema = new Schema<ICheatAlert>({
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String, default: '' }
}, { _id: false });

const attemptSchema = new Schema<IAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stageId: { type: Schema.Types.ObjectId, ref: 'Stage', required: true, index: true },
    contestId: { type: Schema.Types.ObjectId, ref: 'Contest', required: true, index: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    acceptedRules: { type: Boolean, default: false },
    rulesAcceptedAt: { type: Date },
    ipAddress: { type: String },
    deviceInfo: { type: String },
    browser: { type: String },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    answers: { type: Schema.Types.Mixed, default: {} },
    score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['In Progress', 'Submitted', 'Evaluated'],
      default: 'In Progress',
      index: true
    },
    cheatAlerts: [cheatAlertSchema]
  },
  {
    timestamps: true
  }
);

// Ensure a user can only have active attempts according to rule limits
attemptSchema.index({ userId: 1, stageId: 1, status: 1 });

export const Attempt: Model<IAttempt> = mongoose.models.Attempt || mongoose.model<IAttempt>('Attempt', attemptSchema);
export default Attempt;
