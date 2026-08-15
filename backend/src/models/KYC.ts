import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IKYC extends Document {
  userId: mongoose.Types.ObjectId;
  address?: string;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  education?: string;
  occupation?: string;
  documentType: 'Aadhaar' | 'PAN' | 'Passport' | 'Driving License' | 'Voter ID' | 'Other';
  documentNumber: string;
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl: string;
  addressProofUrl?: string;
  otherDocUrl?: string;
  declarationAccepted: boolean;
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
    address: { type: String, default: '' },
    state: { type: String, default: '' },
    district: { type: String, default: '' },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },
    education: { type: String, default: '' },
    occupation: { type: String, default: '' },
    documentType: {
      type: String,
      enum: ['Aadhaar', 'PAN', 'Passport', 'Driving License', 'Voter ID', 'Other'],
      required: true
    },
    documentNumber: { type: String, required: true },
    documentFrontUrl: { type: String, required: true },
    documentBackUrl: { type: String, default: '' },
    selfieUrl: { type: String, required: true },
    addressProofUrl: { type: String, default: '' },
    otherDocUrl: { type: String, default: '' },
    declarationAccepted: { type: Boolean, required: true, default: false },
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
