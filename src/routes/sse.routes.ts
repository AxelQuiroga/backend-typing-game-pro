// ═══════════════════════════════════════════════════════════
// SSE Routes — Code Typist Arcade
// ═══════════════════════════════════════════════════════════

import { Router } from 'express';
import * as SSEController from '../controllers/sse.controller';
import { sseLimiter } from '../middleware/rateLimit';

const router = Router();

// ── SSE stream ──
router.get('/stream', sseLimiter, SSEController.stream);

// ── Health check for SSE ──
router.get('/health', SSEController.health);

export default router;
