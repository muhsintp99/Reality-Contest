import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(2, 'Room name must be at least 2 characters'),
  description: z.string().optional(),
  rules: z.string().optional(),
  guidelines: z.string().optional(),
  durationDays: z.number().min(1).optional(),
  maxMembers: z.number().min(1).default(50),
  cycleIds: z.array(z.string()).optional(),
  roomImage: z.string().optional(),
  autoAssignment: z.boolean().default(true)
});

export const updateRoomSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  rules: z.string().optional(),
  guidelines: z.string().optional(),
  durationDays: z.number().min(1).optional(),
  maxMembers: z.number().min(1).optional(),
  cycleIds: z.array(z.string()).optional(),
  roomImage: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Archived']).optional(),
  autoAssignment: z.boolean().optional()
});

export const assignMembersSchema = z.object({
  roomId: z.string(),
  userIds: z.array(z.string()).min(1, 'At least one user ID required'),
  role: z.enum(['Leader', 'Member']).optional().default('Member')
});

export const transferMemberSchema = z.object({
  userId: z.string(),
  fromRoomId: z.string(),
  toRoomId: z.string()
});

export const createCycleSchema = z.object({
  cycleNumber: z.number().min(1).max(10),
  title: z.string().min(2),
  description: z.string().optional(),
  rules: z.string().optional(),
  guidelines: z.string().optional(),
  durationDays: z.number().min(1).optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  autoStart: z.boolean().optional().default(true),
  autoEnd: z.boolean().optional().default(true)
});

export const reviewSubmissionSchema = z.object({
  status: z.enum(['Approved', 'Rejected', 'Resubmit_Requested']),
  score: z.number().min(0).optional(),
  bonus: z.number().min(0).optional().default(0),
  penalty: z.number().min(0).optional().default(0),
  feedback: z.string().optional().default('')
});

export const rewardRuleSchema = z.object({
  title: z.string().min(2),
  rewardType: z.enum(['Cash', 'Wallet Credit', 'Coupons', 'Badges', 'Certificates']),
  amountOrValue: z.number().default(0),
  couponCode: z.string().optional(),
  badgeName: z.string().optional(),
  certificateTemplate: z.string().optional(),
  targetScope: z.enum(['Top_User', 'Top_Room', 'Cycle_Winner', 'Overall_Winner']),
  minRank: z.number().min(1).default(1),
  maxRank: z.number().min(1).default(3)
});
