import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// Score DTOs — Data Transfer Objects
//
// Zod schemas validate at the API boundary.
// Every piece of data entering our system is validated here
// BEFORE it reaches controllers or services.
// ═══════════════════════════════════════════════════════════

/** Schema for POST /api/scores — score submission */
export const CreateScoreSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, 'Nickname must be at least 2 characters')
    .max(30, 'Nickname must be at most 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Nickname can only contain letters, numbers, underscores, and hyphens',
    ),
  score: z
    .number()
    .int('Score must be an integer')
    .nonnegative('Score must be non-negative')
    .max(10_000_000, 'Score is suspiciously high'),
  level: z
    .number()
    .int('Level must be an integer')
    .min(1, 'Level must be at least 1')
    .max(100, 'Level must be at most 100'),
  wordsCompleted: z
    .number()
    .int('Words completed must be an integer')
    .nonnegative('Words completed must be non-negative')
    .max(10_000, 'Words completed is suspiciously high'),
  correctLetters: z
    .number()
    .int('Correct letters must be an integer')
    .nonnegative('Correct letters must be non-negative')
    .max(100_000, 'Correct letters is suspiciously high'),
  totalLetters: z
    .number()
    .int('Total letters must be an integer')
    .nonnegative('Total letters must be non-negative')
    .max(100_000, 'Total letters is suspiciously high'),
  timestamp: z.string().datetime().optional(),
});

export type CreateScoreInput = z.infer<typeof CreateScoreSchema>;

/** Schema for GET /api/scores query params */
export const GetScoresQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .default('10')
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
});

export type GetScoresQuery = z.infer<typeof GetScoresQuerySchema>;
