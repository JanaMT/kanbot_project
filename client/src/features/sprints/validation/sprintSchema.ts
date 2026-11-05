import { z } from 'zod';

export const sprintSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
    goal: z.string().max(300, 'Goal must be 300 characters or less').optional().or(z.literal('')),
    startDate: z.string().optional().or(z.literal('')),
    endDate: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

export const startSprintSchema = z
  .object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .refine(
    (data) => {
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

export type SprintFormData = z.infer<typeof sprintSchema>;
export type StartSprintFormData = z.infer<typeof startSprintSchema>;
