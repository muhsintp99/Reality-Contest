import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomLeaderboard extends Document {
  scope: 'Room' | 'Cycle' | 'Overall';
  cycleId?: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  entityName: string; // Room Name or User Name
  entityImage?: string;
  rank: number;
  previousRank: number;
  totalPoints: number;
  taskPoints: number;
  bonusPoints: number;
  penaltyPoints: number;
  referralBonus: number;
  achievementBonus: number;
  dailyBonus: number;
  tasksCompletedCount: number;
  medals: {
    gold: number;
    silver: number;
    bronze: number;
  };
  badges: string[];
  lastUpdated: Date;
}

const RoomLeaderboardSchema: Schema = new Schema(
  {
    scope: { type: String, enum: ['Room', 'Cycle', 'Overall'], required: true, index: true },
    cycleId: { type: Schema.Types.ObjectId, ref: 'Cycle', index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    entityName: { type: String, required: true },
    entityImage: { type: String, default: '' },
    rank: { type: Number, required: true, index: true },
    previousRank: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0, index: true },
    taskPoints: { type: Number, default: 0 },
    bonusPoints: { type: Number, default: 0 },
    penaltyPoints: { type: Number, default: 0 },
    referralBonus: { type: Number, default: 0 },
    achievementBonus: { type: Number, default: 0 },
    dailyBonus: { type: Number, default: 0 },
    tasksCompletedCount: { type: Number, default: 0 },
    medals: {
      gold: { type: Number, default: 0 },
      silver: { type: Number, default: 0 },
      bronze: { type: Number, default: 0 }
    },
    badges: [{ type: String }],
    lastUpdated: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

RoomLeaderboardSchema.index({ scope: 1, cycleId: 1, roomId: 1, rank: 1 });
RoomLeaderboardSchema.index({ scope: 1, totalPoints: -1 });

export default mongoose.model<IRoomLeaderboard>('RoomLeaderboard', RoomLeaderboardSchema);
