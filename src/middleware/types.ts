import type { Request } from 'express';

// ═══════════════════════════════════════════════════════════
// Typed helpers for accessing validated request data.
//
// Express 5 made req.query and req.params read-only getters.
// validate() middleware stores parsed data in req._validated.
// These helpers read from _validated first, then fall back
// to the original request properties.
// ═══════════════════════════════════════════════════════════

/** Get validated body data (after validate() middleware) */
export function getBody<T>(req: Request): T {
  return (req._validated?.body as T) ?? (req.body as T);
}

/** Get validated query data (after validate() middleware) */
export function getQuery<T>(req: Request): T {
  return (req._validated?.query as T) ?? (req.query as T);
}

/** Get validated params data (after validate() middleware) */
export function getParams<T>(req: Request): T {
  return (req._validated?.params as T) ?? (req.params as T);
}
