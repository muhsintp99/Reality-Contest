import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomMember extends Document {
  roomId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'Leader' | 'Member';
  status: 'Active' | 'Transferred' | 'Removed';
  transferredToRoomId?: mongoose.Types.ObjectId;
  joinedAt: Date;
  accumulatedPoints: number;
  completedTasksCount: number;
  createdDate: Date;
  updatedAt: Date;
}

const RoomMemberSchema: Schema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['Leader', 'Member'], default: 'Member' },
    status: { type: String, enum: ['Active', 'Transferred', 'Removed'], default: 'Active', index: true },
    transferredToRoomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    joinedAt: { type: Date, default: Date.now },
    accumulatedPoints: { type: Number, default: 0 },
    completedTasksCount: { type: Number, default: 0 },
    createdDate: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

RoomMemberSchema.index({ roomId: 1, userId: 1 }, { unique: true });
RoomMemberSchema.index({ roomId: 1, status: 1 });

export default mongoose.model<IRoomMember>('RoomMember', RoomMemberSchema);
