import type { Request } from 'express';

// ═══════════════════════════════════════════════════════════
// Typed helpers for accessing validated request data.
//
// After validate() middleware runs, req.body / req.query / req.params
// contain parsed, typed data. These helpers provide type-safe access
// without ugly `as` casts scattered through controllers.
// ═══════════════════════════════════════════════════════════

/** Get validated body data (after validate() middleware) */
export function getBody<T>(req: Request): T {
  return req.body as T;
}

/** Get validated query data (after validate() middleware) */
export function getQuery<T>(req: Request): T {
  return req.query as T;
}

/** Get validated params data (after validate() middleware) */
export function getParams<T>(req: Request): T {
  return req.params as T;
}
