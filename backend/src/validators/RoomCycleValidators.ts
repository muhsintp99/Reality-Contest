import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(2, 'Room name must be at least 2 characters'),
  description: z.string().optional(),
  maxMembers: z.number().min(1).default(50),
  roomImage: z.string().optional(),
  autoAssignment: z.boolean().default(true)
});

export const updateRoomSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  maxMembers: z.number().min(1).optional(),
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
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  autoStart: z.boolean().optional().default(true),
  autoEnd: z.boolean().optional().default(true)
});

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Title required'),
  description: z.string().min(2, 'Description required'),
  instructions: z.string().optional(),
  cycleId: z.string(),
  targetRooms: z.array(z.string()).optional().default([]),
  taskType: z.enum([
    'Quiz',
    'Image Upload',
    'Video Upload',
    'Document Upload',
    'Creative Writing',
    'AI Prompt',
    'Survey',
    'Puzzle',
    'Logic Challenge',
    'Daily Activity'
  ]),
  points: z.number().min(0),
  bonusPoints: z.number().min(0).optional().default(0),
  penalty: z.number().min(0).optional().default(0),
  deadline: z.string().or(z.date()),
  reviewType: z.enum(['Auto', 'Manual']).optional().default('Manual'),
  visibility: z.enum(['Public', 'Room-Only']).optional().default('Public'),
  allowDuplicateSubmission: z.boolean().optional().default(false),
  fileLimits: z
    .object({
      maxSizeMB: z.number().default(10),
      allowedTypes: z.array(z.string()).default(['image/png', 'image/jpeg', 'application/pdf']),
      maxFiles: z.number().default(1)
    })
    .optional()
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
