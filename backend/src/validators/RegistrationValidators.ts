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
  sessionId: z.string().min(1, 'Session ID is required'),
  countryCode: z.string().min(1, 'Country code is required'),
  phone: z.string().min(10, 'Mobile number must be at least 10 digits')
});

export const verifyMobileOtpSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits')
});

export const resendOtpSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required')
});

export const saveProfileSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  name: z.string().min(2, 'Full Name must be at least 2 characters long'),
  username: z.string().min(3, 'Username must be at least 3 characters long').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Confirm Password must be at least 6 characters long'),
  dob: z.string().min(1, 'Date of birth is required').transform((val) => new Date(val)),
  avatar: z.string().min(1, 'Profile image or Avatar is required'),
  gender: z.enum(['Male', 'Female', 'Other']).optional().default('Male'),
  state: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  preferredLanguage: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  referralCode: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  employmentStatus: z.enum(['Student', 'Employed / Salaried', 'Self Employed', 'Unemployed']).optional().nullable(),
  favoriteCategories: z.array(z.string()).optional().default([])
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

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
