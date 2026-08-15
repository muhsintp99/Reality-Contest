import { z } from 'zod';

export const submitKycSchema = z.object({
  address: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  documentType: z.enum(['Aadhaar', 'PAN', 'Passport', 'Driving License', 'Voter ID', 'Other']),
  documentNumber: z.string().min(4, 'Document number must be valid'),
  documentFrontUrl: z.string().min(1, 'Document front image is required'),
  documentBackUrl: z.string().optional(),
  selfieUrl: z.string().min(1, 'Liveness selfie is required'),
  addressProofUrl: z.string().optional(),
  otherDocUrl: z.string().optional()
});

export const reviewKycSchema = z.object({
  kycId: z.string().min(1, 'KYC Record ID is required'),
  status: z.enum(['Approved', 'Rejected']),
  rejectionReason: z.string().optional()
});
