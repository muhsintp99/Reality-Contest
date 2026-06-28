import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICertificate extends Document {
  userId: mongoose.Types.ObjectId;
  contestId: mongoose.Types.ObjectId;
  title: string;
  certificateUrl: string;
  createdAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contestId: { type: Schema.Types.ObjectId, ref: 'Contest', required: true, index: true },
    title: { type: String, required: true },
    certificateUrl: { type: String, required: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const Certificate: Model<ICertificate> = mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', certificateSchema);
export default Certificate;
