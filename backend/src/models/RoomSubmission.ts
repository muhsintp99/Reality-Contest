import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomSubmission extends Document {
  taskId: mongoose.Types.ObjectId;
  cycleId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Resubmit_Requested';
  content?: string;
  files: Array<{
    url: string;
    filename: string;
    fileType: string;
    fileSizeMB: number;
  }>;
  answers?: any; // Quiz answers or survey responses
  score: number;
  bonus: number;
  penalty: number;
  finalPoints: number;
  feedback?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  history: Array<{
    action: string;
    performedBy: mongoose.Types.ObjectId;
    timestamp: Date;
    comments?: string;
    scoreGiven?: number;
  }>;
  createdDate: Date;
  updatedAt: Date;
}

const RoomSubmissionSchema: Schema = new Schema(
  {
    taskId: { type: Schema.Types.ObjectId, ref: 'RoomTask', required: true, index: true },
    cycleId: { type: Schema.Types.ObjectId, ref: 'Cycle', required: true, index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Resubmit_Requested'],
      default: 'Pending',
      index: true
    },
    content: { type: String, default: '' },
    files: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
        fileType: { type: String, default: 'application/octet-stream' },
        fileSizeMB: { type: Number, default: 0 }
      }
    ],
    answers: { type: Schema.Types.Mixed },
    score: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    penalty: { type: Number, default: 0 },
    finalPoints: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    history: [
      {
        action: { type: String, required: true },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        comments: { type: String },
        scoreGiven: { type: Number }
      }
    ],
    createdDate: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

RoomSubmissionSchema.index({ roomId: 1, cycleId: 1, userId: 1, taskId: 1 });
RoomSubmissionSchema.index({ status: 1, cycleId: 1 });

export default mongoose.model<IRoomSubmission>('RoomSubmission', RoomSubmissionSchema);
