import mongoose, { Schema, Document } from 'mongoose';

export interface ICycle extends Document {
  cycleNumber: number;
  title: string;
  description?: string;
  rules?: string;
  guidelines?: string;
  durationDays?: number;
  prizePoolCoins?: number;
  timerMinutes?: number;
  maxSeats?: number;
  coverImage?: string;
  promoVideoUrl?: string;
  rulesPdfUrl?: string;
  roomId?: mongoose.Types.ObjectId;
  taskIds?: mongoose.Types.ObjectId[];
  startDate?: Date;
  endDate?: Date;
  status: 'Draft' | 'Published' | 'Running' | 'Completed' | 'Upcoming' | 'Active' | 'Archived';
  createdAt?: Date;
  updatedAt?: Date;
}

const cycleSchema = new Schema<ICycle>(
  {
    cycleNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    rules: {
      type: String,
      default: ''
    },
    guidelines: {
      type: String,
      default: ''
    },
    durationDays: {
      type: Number,
      default: 14
    },
    prizePoolCoins: {
      type: Number,
      default: 0
    },
    timerMinutes: {
      type: Number,
      default: 60
    },
    maxSeats: {
      type: Number,
      default: 100
    },
    coverImage: {
      type: String,
      default: ''
    },
    promoVideoUrl: {
      type: String,
      default: ''
    },
    rulesPdfUrl: {
      type: String,
      default: ''
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room'
    },
    taskIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task'
      }
    ],
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Running', 'Completed', 'Upcoming', 'Active', 'Archived'],
      default: 'Draft'
    }
  },
  {
    timestamps: true
  }
);

export const Cycle = mongoose.models.Cycle || mongoose.model<ICycle>('Cycle', cycleSchema);
export default Cycle;
