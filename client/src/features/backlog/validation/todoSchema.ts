import { z } from 'zod';
import { TODO_TYPES, TODO_STATUSES, TODO_PRIORITIES } from '../../../shared/types/api';

export const todoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters')
    .optional()
    .or(z.literal('')),
  type: z.enum(TODO_TYPES),
  status: z.enum(TODO_STATUSES),
  priority: z.enum(TODO_PRIORITIES),
  storyPoints: z.number().nullable().optional(),
  labels: z.array(z.string().max(30)).max(10, 'Maximum 10 labels allowed').optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .nullable()
    .optional()
    .or(z.literal('')),
  sprintId: z.string().nullable().optional(),
});

export type TodoFormData = z.infer<typeof todoSchema>;
