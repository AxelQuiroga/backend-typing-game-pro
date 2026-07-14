import rateLimit from 'express-rate-limit';

// ═══════════════════════════════════════════════════════════
// Rate Limiting — Code Typist Arcade
//
// Three tiers of protection:
//   1. Global     — baseline protection for all endpoints
//   2. Score write — stricter limit on score submissions
//   3. SSE        — limit concurrent streaming connections
//
// express-rate-limit uses an in-memory store by default.
// For multi-instance deployments (e.g. Railway scaling),
// swap to a Redis store — but for a single-instance backend
// this is perfectly fine.
// ═══════════════════════════════════════════════════════════

/** Global — generous baseline for reads */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 120, // 120 requests per minute per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});

/** Score submission — prevent leaderboard spam */
export const scoreSubmitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10, // 10 score submissions per minute per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many score submissions. Wait a moment before trying again.',
  },
});

/** Achievement check — prevent abuse of achievement evaluation */
export const achievementCheckLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 15, // 15 checks per minute per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many achievement checks. Please wait.',
  },
});

/** SSE — limit streaming connections per IP */
export const sseLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 5, // 5 SSE connections per minute per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many streaming connections.',
  },
});
