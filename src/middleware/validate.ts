import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';

// ═══════════════════════════════════════════════════════════
// validate — Zod validation middleware factory
//
// Extracts ALL validation boilerplate from controllers.
// Usage: router.post('/', validate(CreateScoreSchema), handler)
//
// Attaches validated+parsed data to req.body or req.query
// so controllers never touch raw, unvalidated input.
// ═══════════════════════════════════════════════════════════

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(
  schema: ZodSchema,
  target: ValidationTarget = 'body',
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      // Replace raw input with validated+parsed data
      req[target] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}
