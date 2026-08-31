import mongoose, { Schema, Document } from 'mongoose';

export interface ICycleLog extends Document {
  eventType: 'CYCLE_START' | 'CYCLE_END' | 'AUTO_ASSIGNMENT' | 'SUBMISSION_LOCK' | 'SCORE_CALCULATION' | 'REWARD_GENERATION';
  cycleId?: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId;
  message: string;
  details?: any;
  executedBy?: mongoose.Types.ObjectId | string;
  createdDate: Date;
}

const CycleLogSchema: Schema = new Schema(
  {
    eventType: {
      type: String,
      enum: ['CYCLE_START', 'CYCLE_END', 'AUTO_ASSIGNMENT', 'SUBMISSION_LOCK', 'SCORE_CALCULATION', 'REWARD_GENERATION'],
      required: true,
      index: true
    },
    cycleId: { type: Schema.Types.ObjectId, ref: 'Cycle', index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    message: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    executedBy: { type: Schema.Types.Mixed, default: 'System Automation' },
    createdDate: { type: Date, default: Date.now, index: true }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ICycleLog>('CycleLog', CycleLogSchema);
