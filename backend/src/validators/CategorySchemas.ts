import { z } from 'zod';

export const createCategorySchema = z.object({
  title: z.string().optional(),
  name: z.string().optional(),
  icon: z.string().optional().default('Folder'),
  status: z.enum(['Active', 'Inactive']).optional().default('Active')
}).refine(data => Boolean(data.title || data.name), {
  message: 'Title or Name is required',
  path: ['title']
});

export const updateCategorySchema = z.object({
  title: z.string().optional(),
  name: z.string().optional(),
  icon: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional()
});
