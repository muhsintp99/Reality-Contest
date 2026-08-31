import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomCycleSettings extends Document {
  cycleDurationDays: number;
  maxMembersPerRoom: number;
  pointRules: {
    referralBonus: number;
    dailyActivityBonus: number;
    achievementBonus: number;
    roomLeaderBonus: number;
  };
  reviewRules: {
    autoApproveQuizzes: boolean;
    manualReviewDeadlineHours: number;
    allowResubmission: boolean;
  };
  leaderboardRules: {
    autoRefreshIntervalMinutes: number;
    showTopMedals: boolean;
  };
  automation: {
    autoStartCycle: boolean;
    autoEndCycle: boolean;
    autoDistributeRewards: boolean;
    sendNotifications: boolean;
  };
  updatedAt: Date;
}

const RoomCycleSettingsSchema: Schema = new Schema(
  {
    cycleDurationDays: { type: Number, default: 3, min: 1 },
    maxMembersPerRoom: { type: Number, default: 50, min: 5 },
    pointRules: {
      referralBonus: { type: Number, default: 100 },
      dailyActivityBonus: { type: Number, default: 50 },
      achievementBonus: { type: Number, default: 200 },
      roomLeaderBonus: { type: Number, default: 150 }
    },
    reviewRules: {
      autoApproveQuizzes: { type: Boolean, default: true },
      manualReviewDeadlineHours: { type: Number, default: 24 },
      allowResubmission: { type: Boolean, default: true }
    },
    leaderboardRules: {
      autoRefreshIntervalMinutes: { type: Number, default: 5 },
      showTopMedals: { type: Boolean, default: true }
    },
    automation: {
      autoStartCycle: { type: Boolean, default: true },
      autoEndCycle: { type: Boolean, default: true },
      autoDistributeRewards: { type: Boolean, default: true },
      sendNotifications: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IRoomCycleSettings>('RoomCycleSettings', RoomCycleSettingsSchema);
