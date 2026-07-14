import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';

// ═══════════════════════════════════════════════════════════
// validate — Zod validation middleware factory
//
// Express 5 made req.query and req.params read-only getters.
// We store validated data in req._validated instead of
// overwriting the original properties.
// ═══════════════════════════════════════════════════════════

type ValidationTarget = 'body' | 'query' | 'params';

// Extend Request to hold validated data
declare global {
  namespace Express {
    interface Request {
      _validated?: Record<string, unknown>;
    }
  }
}

export function validate(
  schema: ZodSchema,
  target: ValidationTarget = 'body',
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);

      // Express 5: req.query and req.params are getter-only.
      // Store validated data in a custom property.
      if (!req._validated) req._validated = {};
      req._validated[target] = parsed;

      // req.body is still writable in Express 5, so keep backward compat
      if (target === 'body') {
        req.body = parsed;
      }

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
