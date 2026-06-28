import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IKYC extends Document {
  userId: mongoose.Types.ObjectId;
  documentType: 'Aadhaar' | 'PAN' | 'Passport' | 'Driving License';
  documentNumber: string;
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl: string;
  livenessScore: number;
  aiMatchResult: 'PASSED' | 'REVIEW_REQUIRED' | 'FAILED';
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const kycSchema = new Schema<IKYC>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    documentType: {
      type: String,
      enum: ['Aadhaar', 'PAN', 'Passport', 'Driving License'],
      required: true
    },
    documentNumber: { type: String, required: true },
    documentFrontUrl: { type: String, required: true },
    documentBackUrl: { type: String },
    selfieUrl: { type: String, required: true },
    livenessScore: { type: Number, default: 0 },
    aiMatchResult: {
      type: String,
      enum: ['PASSED', 'REVIEW_REQUIRED', 'FAILED'],
      default: 'REVIEW_REQUIRED'
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true
    },
    rejectionReason: { type: String, default: '' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

// Compound Index for fast queries
kycSchema.index({ status: 1, createdAt: -1 });

export const KYC: Model<IKYC> = mongoose.models.KYC || mongoose.model<IKYC>('KYC', kycSchema);
export default KYC;
