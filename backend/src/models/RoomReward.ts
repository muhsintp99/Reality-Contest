import mongoose, { Schema, Document } from 'mongoose';

export type RewardType = 'Cash' | 'Wallet Credit' | 'Coupons' | 'Badges' | 'Certificates';

export interface IRoomReward extends Document {
  title: string;
  rewardType: RewardType;
  amountOrValue: number;
  couponCode?: string;
  badgeName?: string;
  certificateTemplate?: string;
  targetScope: 'Top_User' | 'Top_Room' | 'Cycle_Winner' | 'Overall_Winner';
  minRank: number;
  maxRank: number;
  cycleId?: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  status: 'Pending' | 'Distributed' | 'Failed';
  distributedAt?: Date;
  createdDate: Date;
  updatedAt: Date;
}

const RoomRewardSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    rewardType: {
      type: String,
      enum: ['Cash', 'Wallet Credit', 'Coupons', 'Badges', 'Certificates'],
      required: true,
      index: true
    },
    amountOrValue: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    badgeName: { type: String, default: '' },
    certificateTemplate: { type: String, default: '' },
    targetScope: {
      type: String,
      enum: ['Top_User', 'Top_Room', 'Cycle_Winner', 'Overall_Winner'],
      default: 'Top_User',
      index: true
    },
    minRank: { type: Number, default: 1 },
    maxRank: { type: Number, default: 3 },
    cycleId: { type: Schema.Types.ObjectId, ref: 'Cycle' },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Distributed', 'Failed'], default: 'Pending', index: true },
    distributedAt: { type: Date },
    createdDate: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

RoomRewardSchema.index({ status: 1, rewardType: 1 });

export default mongoose.model<IRoomReward>('RoomReward', RoomRewardSchema);
