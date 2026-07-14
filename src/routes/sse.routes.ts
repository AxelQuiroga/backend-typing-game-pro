// ═══════════════════════════════════════════════════════════
// SSE Routes — Code Typist Arcade
// ═══════════════════════════════════════════════════════════

import { Router } from 'express';
import * as SSEController from '../controllers/sse.controller';

const router = Router();

// ── SSE stream ──
router.get('/stream', SSEController.stream);

// ── Health check for SSE ──
router.get('/health', SSEController.health);

export default router;
