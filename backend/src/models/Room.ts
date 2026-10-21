import mongoose, { Schema, Document } from 'mongoose';

export type RoomStatus =
  | 'Draft'
  | 'Registration Open'
  | 'Upcoming'
  | 'Active'
  | 'In Progress'
  | 'Completed'
  | 'Archived'
  | 'Inactive';

export type EntryFeeType = 'Free' | 'Coins' | 'Cash';

export interface IRoom extends Document {
  code: string;
  name: string;
  description?: string;
  rules?: string;
  guidelines?: string;
  durationDays?: number;
  prizePool: number;
  entryFee: number;
  entryFeeType: EntryFeeType;
  isFree: boolean;
  entryFeeCoins: number;
  coinsReward: number;
  timerLimit: number; // in minutes
  maxMembers: number; // Total seats
  membersCount: number; // Occupied seats
  startDate?: Date;
  endDate?: Date;
  registrationStart?: Date;
  registrationEnd?: Date;
  currentCycle?: number;
  cycleIds?: mongoose.Types.ObjectId[];
  taskIds?: mongoose.Types.ObjectId[];
  roomImage?: string;
  status: RoomStatus;
  autoAssignment: boolean;
  totalPoints: number;
  rank: number;
  createdDate: Date;
  updatedAt: Date;
}

const RoomSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    rules: { type: String, default: '' },
    guidelines: { type: String, default: '' },
    durationDays: { type: Number, default: 14 },
    prizePool: { type: Number, default: 10000, min: 0 },
    entryFee: { type: Number, default: 50, min: 0 },
    entryFeeType: { type: String, enum: ['Coins', 'Cash', 'Free'], default: 'Coins' },
    isFree: { type: Boolean, default: false },
    entryFeeCoins: { type: Number, default: 50, min: 0 },
    coinsReward: { type: Number, default: 1000, min: 0 },
    timerLimit: { type: Number, default: 30, min: 1 },
    maxMembers: { type: Number, default: 50, min: 1 },
    membersCount: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    registrationStart: { type: Date, default: Date.now },
    registrationEnd: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    currentCycle: { type: Number, default: 1, min: 1, max: 10 },
    cycleIds: [{ type: Schema.Types.ObjectId, ref: 'Cycle' }],
    taskIds: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    roomImage: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Draft', 'Registration Open', 'Upcoming', 'Active', 'In Progress', 'Completed', 'Archived', 'Inactive'],
      default: 'Active',
      index: true
    },
    autoAssignment: { type: Boolean, default: true },
    totalPoints: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    createdDate: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

RoomSchema.index({ status: 1, membersCount: 1 });

export const Room = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
export default Room;
