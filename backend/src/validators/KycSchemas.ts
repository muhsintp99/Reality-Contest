import { z } from 'zod';

export const submitKycSchema = z.object({
  documentType: z.enum(['Aadhaar', 'PAN', 'Passport', 'Driving License']),
  documentNumber: z.string().min(4, 'Document number must be valid'),
  documentFrontUrl: z.string().url('Document front image must be a valid URL'),
  documentBackUrl: z.string().url('Document back image must be a valid URL').optional(),
  selfieUrl: z.string().url('Liveness selfie must be a valid URL')
});

export const reviewKycSchema = z.object({
  kycId: z.string().min(1, 'KYC Record ID is required'),
  status: z.enum(['Approved', 'Rejected']),
  rejectionReason: z.string().optional()
});
