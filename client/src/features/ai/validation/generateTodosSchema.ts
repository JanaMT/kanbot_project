import { z } from 'zod';

export const generateTodosSchema = z.object({
  prompt: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  count: z
    .number()
    .int()
    .min(1, 'Must generate at least 1 todo')
    .max(10, 'Cannot generate more than 10 todos'),
});

export type GenerateTodosFormData = z.infer<typeof generateTodosSchema>;
