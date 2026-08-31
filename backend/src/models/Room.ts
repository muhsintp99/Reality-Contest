import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  code: string;
  name: string;
  description?: string;
  maxMembers: number;
  membersCount: number;
  currentCycle: number;
  roomImage?: string;
  status: 'Active' | 'Inactive' | 'Archived';
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
    maxMembers: { type: Number, default: 50, min: 1 },
    membersCount: { type: Number, default: 0, min: 0 },
    currentCycle: { type: Number, default: 1, min: 1, max: 10 },
    roomImage: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive', 'Archived'], default: 'Active', index: true },
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

export default mongoose.model<IRoom>('Room', RoomSchema);
