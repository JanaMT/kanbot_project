import { z } from 'zod';

export const planSprintSchema = z.object({
  capacity: z
    .number()
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .max(200, 'Capacity cannot exceed 200'),
  focus: z
    .string()
    .max(300, 'Focus must be at most 300 characters')
    .optional()
    .or(z.literal('')),
});

export type PlanSprintFormData = z.infer<typeof planSprintSchema>;
