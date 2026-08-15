import { z } from 'zod';

export const startEmailSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  referralCode: z.string().optional().nullable()
});

export const verifyEmailOtpSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits')
});

export const startMobileSchema = z.object({
  sessionId: z.string().optional().nullable(),
  countryCode: z.string().min(1, 'Country code is required'),
  phone: z.string().min(10, 'Mobile number must be at least 10 digits')
});

export const verifyMobileOtpSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits')
});

export const resendOtpSchema = z.object({
  sessionId: z.string().optional().nullable()
});

export const saveProfileSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required')
}).passthrough();

export const saveTopicsSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  favoriteCategories: z.array(z.string()).min(1, 'Please select at least one preferred topic')
});

export const saveKycSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  documentType: z.enum(['Aadhaar', 'Passport', 'Driving License']),
  documentNumber: z.string().min(4, 'Document number must be valid'),
  documentFrontUrl: z.string().min(1, 'Government ID Front Scan is required'),
  documentBackUrl: z.string().optional().nullable(),
  selfieUrl: z.string().min(1, 'Selfie snapshot is required'),
  addressProofUrl: z.string().optional().nullable(),
  declarationAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the declaration to submit KYC'
  })
});
