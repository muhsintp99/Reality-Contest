import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IGroup extends Document {
  contestId: mongoose.Types.ObjectId;
  name: string;
  participants: mongoose.Types.ObjectId[];
  qualificationRules: Record<string, any>;
  maxParticipants: number;
  stageSequence: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    contestId: { type: Schema.Types.ObjectId, ref: 'Contest', required: true, index: true },
    name: { type: String, required: true, trim: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    qualificationRules: { type: Schema.Types.Mixed, default: {} },
    maxParticipants: { type: Number, default: 0 },
    stageSequence: [{ type: Schema.Types.ObjectId, ref: 'Stage' }]
  },
  {
    timestamps: true
  }
);

groupSchema.index({ contestId: 1, name: 1 }, { unique: true });

export const Group: Model<IGroup> = mongoose.models.Group || mongoose.model<IGroup>('Group', groupSchema);
export default Group;
