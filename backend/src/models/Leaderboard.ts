import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILeaderboardRanking {
  userId: mongoose.Types.ObjectId;
  score: number;
  rank: number;
}

export interface ILeaderboard extends Document {
  contestId: mongoose.Types.ObjectId;
  groupId?: mongoose.Types.ObjectId;
  stageId?: mongoose.Types.ObjectId;
  rankings: ILeaderboardRanking[];
  createdAt: Date;
  updatedAt: Date;
}

const rankingSchema = new Schema<ILeaderboardRanking>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  rank: { type: Number, required: true }
}, { _id: false });

const leaderboardSchema = new Schema<ILeaderboard>(
  {
    contestId: { type: Schema.Types.ObjectId, ref: 'Contest', required: true, index: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', index: true },
    stageId: { type: Schema.Types.ObjectId, ref: 'Stage', index: true },
    rankings: [rankingSchema]
  },
  {
    timestamps: true
  }
);

// Ensure query matching
leaderboardSchema.index({ contestId: 1, groupId: 1, stageId: 1 });

export const Leaderboard: Model<ILeaderboard> = mongoose.models.Leaderboard || mongoose.model<ILeaderboard>('Leaderboard', leaderboardSchema);
export default Leaderboard;
