import { z } from 'zod';

export const createCategorySchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  icon: z.string().min(1, 'Icon is required'),
  status: z.enum(['Active', 'Inactive']).optional()
});

export const updateCategorySchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').optional(),
  description: z.string().optional(),
  icon: z.string().min(1, 'Icon is required').optional(),
  status: z.enum(['Active', 'Inactive']).optional()
});
