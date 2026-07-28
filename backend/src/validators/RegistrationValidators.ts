import { z } from 'zod';

export const startMobileSchema = z.object({
  countryCode: z.string().min(1, 'Country code is required'),
  phone: z.string().min(10, 'Mobile number must be at least 10 digits'),
  referralCode: z.string().optional().nullable()
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
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Confirm Password must be at least 6 characters long'),
  dob: z.string().min(1, 'Date of birth is required').transform((val) => new Date(val)),
  gender: z.enum(['Male', 'Female', 'Other']),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  city: z.string().min(1, 'City/Place is required'),
  preferredLanguage: z.string().min(1, 'Preferred language is required'),
  avatar: z.string().min(1, 'Profile image is required'),
  pincode: z.string().optional().nullable(),
  referralCode: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  employmentStatus: z.enum(['Student', 'Employed / Salaried', 'Self Employed', 'Unemployed']).optional().nullable(),
  notificationPermission: z.boolean().refine((val) => val === true, {
    message: 'Notification permission is required'
  }),
  locationPermission: z.boolean().optional().default(false)
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
