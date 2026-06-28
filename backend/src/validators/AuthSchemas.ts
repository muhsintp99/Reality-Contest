import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  username: z.string().min(3, 'Username must be at least 3 characters long').toLowerCase(),
  email: z.string().email('Invalid email address').toLowerCase(),
  phone: z.string().min(10, 'Invalid phone number format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  referralCode: z.string().optional(),
  dob: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  gender: z.enum(['Male', 'Female', 'Other']).default('Male'),
  state: z.string().default(''),
  district: z.string().default(''),
  country: z.string().default('India'),
  favoriteCategories: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([])
});

export const loginSchema = z.object({
  loginId: z.string().min(3, 'Login ID must be provided'),
  password: z.string().optional(),
  isOtpLogin: z.boolean().default(false),
  otp: z.string().optional()
});

export const sendOtpSchema = z.object({
  loginId: z.string(),
  type: z.enum(['login', 'reset_password', 'email_verify', 'phone_verify'])
});

export const verifyOtpSchema = z.object({
  userId: z.string(),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  type: z.enum(['login', 'reset_password', 'email_verify', 'phone_verify'])
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

export const resetPasswordSchema = z.object({
  userId: z.string(),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
});
