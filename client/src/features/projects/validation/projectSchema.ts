import { z } from 'zod';

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(80, 'Project name must be at most 80 characters'),
  key: z
    .string()
    .transform((val) => val.trim().toUpperCase()) // Normalize: trim and uppercase
    .pipe(
      z
        .string()
        .refine(
          (val) => val === '' || (val.length >= 2 && val.length <= 6),
          'Project key must be 2-6 characters'
        )
        .refine(
          (val) => val === '' || /^[A-Z]+$/.test(val),
          'Project key must contain only uppercase letters'
        )
    )
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .or(z.literal('')),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
